# AGENTS.md

## Project Overview

Spectopus is an HTTP API server that generates [Agent Skills](https://agentskills.io/specification.md) (SKILL.md files) from smart contract addresses. It uses a multi-stage AI pipeline (research → generate → validate), stores results on IPFS via Pinata, and gates endpoints behind x402 micropayments (USDC on Base Mainnet).

## Repository Layout

```
src/
  index.js              # Express app entry point
  routes/skills.js      # POST /skills/generate, GET /skills/status/:sid, GET /skills/:id
  store/sessions.js     # In-memory session store
  pipeline/
    index.js            # Orchestrates research → generate → validate
    research.js         # LangGraph ReAct agent with Uniblock tools
    generate.js         # GPT-5 SKILL.md generation
    validate.js         # Spec conformance + ABI cross-check
  tools/
    fetchABI.js         # Uniblock GET /scan/contract-abi
    fetchSourceCode.js  # Uniblock verified source
    detectERCPatterns.js# ERC-20/721/1155 detection from ABI
  storage/ipfs.js       # Pinata upload + private gateway fetch
docs/
  Requirements.md
  Specification.md
openspec/changes/       # Spec-driven change proposals (proposal, design, specs, tasks)
```

## API

| Method | Path | Cost | Description |
|--------|------|------|-------------|
| `POST` | `/skills/generate` | $0.10 USDC | Start skill generation for a contract |
| `GET` | `/skills/status/:sid` | free | Poll session state |
| `GET` | `/skills/:id` | $0.01 USDC | Fetch SKILL.md by IPFS CID |
| `GET` | `/health` | free | Health check |

### POST /skills/generate

Request body:
```json
{ "contractAddress": "0x...", "chainId": 8453 }
```

Response (HTTP 202):
```json
{ "sessionId": "<uuid>", "statusUrl": "/skills/status/<uuid>" }
```

### GET /skills/status/:sid

Response:
```json
{ "state": "generating" }
{ "state": "ready", "skillId": "<CID>" }
{ "state": "failed", "reason": "..." }
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default: 3000) |
| `OPENAI_API_KEY` | OpenAI API key (GPT-5) |
| `UNIBLOCK_API_KEY` | Uniblock API key for ABI + source fetching |
| `PINATA_JWT` | Pinata JWT for IPFS pinning |
| `PINATA_GATEWAY` | Pinata dedicated gateway domain (e.g. `example-gateway.mypinata.cloud`) |
| `EVM_ADDRESS` | EVM wallet address to receive x402 payments (Base Mainnet) |
| `PAYAI_API_KEY_ID` | PayAI API key ID (optional — free tier works without it) |
| `PAYAI_API_KEY_SECRET` | PayAI API key secret (optional — free tier works without it) |

## Generation Pipeline

1. **Research** — LangGraph ReAct agent calls `fetchABI`, `fetchSourceCode`, `detectERCPatterns` via Uniblock
2. **Generate** — GPT-5 produces SKILL.md from research context using the Agent Skills spec as a system prompt
3. **Validate** — checks spec structure conformance and cross-references function names against the ABI; retries Generate up to 2× on failure
4. On success: uploads SKILL.md to IPFS via Pinata; CID becomes the permanent skill ID

## Payments

Both paywalled routes use `@x402/express` with `ExactEvmScheme` (USDC on Base Mainnet) and `@payai/facilitator` (`HTTPFacilitatorClient`). Routes are auto-indexed in the x402 Bazaar via `declareDiscoveryExtension` on payment settlement — no manual registration needed.

## Key Design Decisions

- **Sessions are ephemeral** — in-memory only; completed skills live on IPFS and survive restarts
- **CID is the skill ID** — `GET /skills/:id` resolves any valid CID via the configured Pinata private gateway
- **Fire-and-forget pipeline** — `POST /skills/generate` returns immediately; caller polls status
- **ES modules** — `"type": "module"` throughout

## Development

```bash
cp .env.example .env   # fill in required vars
npm install
node src/index.js
```
