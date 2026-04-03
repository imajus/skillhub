## Context

x402 is a payment protocol where the server returns HTTP 402 with payment requirements; the client pays and retries. `@x402/express` handles this as middleware. PayAI's `HTTPFacilitatorClient` settles payments and, via `declareDiscoveryExtension`, registers the resource in the Bazaar for agent discovery.

## Goals / Non-Goals

**Goals:**
- Gate `POST /skills/generate` at $0.1 USDC and `GET /skills/:id` at $0.01 USDC
- Use `ExactEvmScheme` with USDC on Base Mainnet
- Auto-register both routes in x402 Bazaar via `declareDiscoveryExtension`
- `GET /skills/status/:sid` and `GET /health` remain free

**Non-Goals:**
- Custom payment schemes or chains
- Manual Bazaar registration API calls
- Refund logic

## Decisions

- **`@payai/facilitator`** — exports a pre-configured `facilitator` object; pass to `new HTTPFacilitatorClient(facilitator)`; no URL config needed; auto-detects `PAYAI_API_KEY_ID`/`PAYAI_API_KEY_SECRET` for production tier
- **`EVM_ADDRESS` only** — no private key required server-side; the wallet address is the payment destination; signing happens client-side

## Risks / Trade-offs

- PayAI facilitator downtime → payment settlement fails; clients receive 402 but cannot pay → pipeline never starts; acceptable for hackathon
- Base Mainnet only → no testnet fallback; use a funded wallet for demo
