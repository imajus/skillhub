# Skillhub

> AI-powered agent skill generator for smart contracts.

Skillhub is an HTTP API that generates [Agent Skills](https://agentskills.io/specification.md) (`SKILL.md` files) from Ethereum smart contract addresses. Skills are gated behind x402 micropayments (USDC on Base Mainnet) and stored permanently on IPFS.

## Why

AI agents interacting with smart contracts either waste context tokens parsing raw ABIs, hallucinate function signatures, or ask the human — defeating the purpose of autonomy. Skillhub provides a cheaper, faster, higher-quality alternative: pay $0.10, get a concise, validated, context-efficient skill file ready to use in any agent.

## API

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| `POST` | `/skills/generate` | $0.10 USDC | Kick off async skill generation |
| `GET`  | `/skills/status/:sid` | free | Poll session state |
| `GET`  | `/skills/:id` | $0.01 USDC | Fetch completed skill by IPFS CID |
| `GET`  | `/health` | free | Health check |

### Generate a skill

```http
POST /skills/generate
Content-Type: application/json

{ "contractAddress": "0x...", "chainId": 8453 }
```

Response:
```json
{ "sessionId": "...", "statusUrl": "/skills/status/..." }
```

### Poll for completion

```http
GET /skills/status/:sid
```

Response when ready:
```json
{ "status": "ready", "skillId": "<ipfs-cid>" }
```

### Fetch the skill

```http
GET /skills/<ipfs-cid>
```

Returns the raw `SKILL.md` content. Endpoint is x402-gated ($0.01 USDC).

All paywalled endpoints are auto-indexed in [x402 Bazaar](https://bazaar.x402.org) for discovery by other agents.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **AI:** LangChain + LangGraph (ReAct agent), OpenAI LLM
- **Payments:** `@x402/express` + `@x402/evm` — USDC on Base Mainnet via PayAI facilitator
- **Discovery:** x402 Bazaar (auto-indexed on payment settlement)
- **Storage:** IPFS via Pinata SDK (content-addressed, pinned; retrieved via dedicated gateway)
- **Block explorer:** Uniblock API (ABI, verified source, proxy resolution)
- **EVM client:** viem (used in generated code examples)

## Setup

```bash
cp .env.example .env
# fill in required values
npm install
npm start
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | yes | OpenAI API key |
| `UNIBLOCK_API_KEY` | yes | Uniblock API key for ABI + source fetching |
| `PINATA_JWT` | yes | Pinata JWT for IPFS pinning |
| `EVM_ADDRESS` | yes | Wallet address to receive x402 payments (Base Mainnet) |
| `PORT` | no | HTTP port (default: `3000`) |
| `OPENAI_MODEL` | no | LLM model (default: `gpt-4o`) |
| `PINATA_GATEWAY` | no | Pinata dedicated gateway domain |
| `PAYAI_API_KEY_ID` | no | PayAI API key (free tier works without) |
| `PAYAI_API_KEY_SECRET` | no | PayAI API secret |

## Pipeline

Skill generation runs three async stages with up to 3 total attempts (retry with failure feedback):

1. **Research** — LangGraph ReAct agent calls Uniblock to fetch the contract ABI, verified source code, and detected ERC patterns. Automatically resolves EIP-1967 proxy contracts to their implementation.
2. **Generate** — LLM model produces a `SKILL.md` from the research context, targeting <500 lines / <5000 tokens.
3. **Validate** — Three checks: required frontmatter fields, ABI cross-check (code examples match function signatures), safety check (warnings present for payable functions and approval patterns).

On validation failure the reason is passed back to the next generate attempt for self-correction.

## Output format

Generated skills follow the open [Agent Skills specification](https://agentskills.io/specification.md) — no vendor lock-in. Code examples use [viem](https://viem.sh).
