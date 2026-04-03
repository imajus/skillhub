# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm start         # run server (node src/index.js)
```

No test or lint infrastructure exists yet.

## Architecture

**Skillhub** is an HTTP API that generates AI-powered Agent Skills (`SKILL.md` files) from Ethereum smart contract addresses. Skills are gated behind x402 micropayments (USDC on Base Mainnet) and stored on IPFS via Pinata.

### Request Flow

1. `POST /skills/generate` ($0.10) — returns `sessionId` immediately, runs pipeline async
2. `GET /skills/status/:sid` (free) — poll session state (`generating` → `ready`/`failed`)
3. `GET /skills/:id` ($0.01) — fetch completed skill by IPFS CID

### Pipeline (`src/pipeline/`)

Three stages with retry logic (max 3 attempts, passing failure reason to next attempt):

- **Research** (`research.js`): LangGraph ReAct agent with three Uniblock tools: `fetchABI`, `fetchSourceCode`, `detectERCPatterns`. Automatically resolves EIP-1967 proxies to implementation contracts.
- **Generate** (`generate.js`): GPT-4o/GPT-5 produces SKILL.md from research context, targeting <500 lines / <5000 tokens.
- **Validate** (`validate.js`): Three checks — frontmatter fields (`name`, `description`, `contractAddress`, `chainId`), ABI cross-check (LLM verifies code examples match function signatures), safety check (LLM flags missing warnings on payable functions and approval patterns).

### Storage

- **Sessions** (`src/store/sessions.js`): In-memory `Map`; ephemeral (lost on restart).
- **IPFS** (`src/storage/ipfs.js`): Pinata SDK; CID is the permanent skill ID; in-memory fetch cache.

### Payment Layer

`@x402/express` middleware gates routes. `declareDiscoveryExtension` auto-registers routes with x402 Bazaar on payment settlement.

## Required Environment Variables

```
OPENAI_API_KEY
UNIBLOCK_API_KEY
PINATA_JWT
EVM_ADDRESS        # wallet receiving x402 payments (Base Mainnet)
```

Optional: `PORT` (default 3000), `OPENAI_MODEL` (default gpt-4o), `PINATA_GATEWAY`, `PAYAI_API_KEY_ID`, `PAYAI_API_KEY_SECRET`.

Copy `.env.example` to `.env` before running.

## Agent Skills (`skills/`)

Two skills ship with the repository:

- **`skills/skillhub/SKILL.md`** — Skillhub's own agent skill. Describes how to call the API, handle x402 payments via OWS CLI, and poll for generation completion. Served at `GET /skill.md`.
- **`skills/ows-sign/SKILL.md`** — EVM transaction signing helper. Uses `ows` CLI + `scripts/encode-tx.mjs` to encode, sign, and broadcast smart contract calls without exposing private keys. Accepts chain IDs in CAIP-2 format (`eip155:8453`); uses viem's built-in chain RPC defaults.
