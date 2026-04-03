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

- **Per-route middleware** — apply `paymentMiddleware` only to the two paywalled routes; keeps free routes unaffected
- **`declareDiscoveryExtension` at startup** — called once when the server starts; Bazaar indexing happens automatically on first payment settlement
- **Amounts hardcoded in config** — `GENERATE_PRICE` and `FETCH_PRICE` as constants; easy to change without touching route logic

## Risks / Trade-offs

- PayAI facilitator downtime → payment settlement fails; clients receive 402 but cannot pay → pipeline never starts; acceptable for hackathon
- Base Mainnet only → no testnet fallback; use a funded wallet for demo
