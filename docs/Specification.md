# Spectopus — Technical Specification

> Core architectural decisions for the Spectopus skill generation service.
> Implementation details live in [OpenSpec changes](../openspec/changes/).
> Derived from [Requirements](./Requirements.md).

## Architecture

```
┌──────────────────────────────────────────────────┐
│                Spectopus Server                  │
│              (Express + x402 middleware)          │
│                                                  │
│  POST /skills/generate ── $0.1 USDC via x402   │
│    → kicks off async pipeline                    │
│    → returns { sessionId, statusUrl }            │
│                                                  │
│  GET /skills/status/:sid ── free                 │
│    → poll session state; returns skillId         │
│      (IPFS CID) when ready                       │
│                                                  │
│  GET /skills/:id ───────── $0.01 USDC via x402   │
│    → fetch SKILL.md from IPFS by CID             │
│    → survives server restarts                    │
│                                                  │
│  Paywalled endpoints registered in x402 Bazaar   │
│  for discovery by any agent.                     │
└──────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
   IPFS via Pinata            x402 Bazaar
   (pinned, permanent)     (discovery layer)
```

## Technology Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **Payments:** `@x402/express` v2 + PayAI facilitator (`HTTPFacilitatorClient`) + `ExactEvmScheme` — USDC on Base Mainnet
- **Discovery:** x402 Bazaar (auto-indexed by PayAI facilitator during payment settlement, via `declareDiscoveryExtension`)
- **Storage:** IPFS via Pinata SDK (`@pinata/sdk`) — content-addressed, pinned, permanent public URLs
- **AI:** LangChain (`@langchain/core`, `@langchain/openai`) + LangGraph (`@langchain/langgraph`) for ReAct agent
- **LLM:** OpenAI GPT-5
- **Block explorer:** Uniblock API (`GET /scan/contract-abi`, `X-API-KEY` header auth)
- **Output format:** [Agent Skills specification](https://agentskills.io/specification.md), code examples use viem

## Generation Pipeline

Three async stages: **Research** (LangGraph ReAct agent with tools) → **Generate** (LLM produces SKILL.md) → **Validate** (spec + ABI cross-check + safety check). Validation failure retries Generate (max 2 loops). Progress tracked in-memory (`generating` → `ready` | `failed`); final artifacts uploaded to Filecoin on completion.

### Research Tools
- `fetchABI(contractAddress, chainId)` — fetches parsed ABI JSON from Uniblock API (`GET /scan/contract-abi?chainId=&address=`)
- `fetchSourceCode(contractAddress)` — fetches verified source code from Uniblock
- `detectERCPatterns(abi)` — identifies ERC-20, ERC-721, ERC-1155, and other standards from ABI signatures

### Storage Format
Pipeline state is tracked in ephemeral in-memory **sessions** (`Map<sessionId, Session>`). On `markReady`, skill content is uploaded to IPFS via Pinata and the returned CID becomes the permanent **skill ID**. `GET /skills/:id` (`:id` = CID) fetches content via the Pinata public gateway, with an in-memory cache for subsequent requests. This means completed skills survive server restarts — IPFS is the durable store.

## Key Decisions

- **Sessions + IPFS split** — ephemeral sessions track mutable pipeline state; final skill content uploaded to IPFS via Pinata with CID as the durable skill ID; completed skills survive restarts, in-progress sessions do not
- **CID as skill ID** — `GET /skills/:id` resolves any valid CID directly from the Pinata public gateway; no registry or index required after upload
- **Fire-and-forget pipeline** — `POST /skills/generate` returns `{ sessionId, statusUrl }` immediately; caller polls `GET /skills/status/:sid` for progress then fetches the skill via its CID
- **x402 per-route** — only skill endpoints require payment; health check is free
- **Bazaar auto-indexed** — no POST registration API; PayAI facilitator indexes resources during payment settlement
