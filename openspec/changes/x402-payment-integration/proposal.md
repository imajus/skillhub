## Why

Spectopus monetizes skill generation and retrieval via micropayments. The x402 protocol enables any agent or client to pay per-request in USDC without accounts or API keys. Bazaar auto-indexing makes the endpoints discoverable by any agent.

## What Changes

- Apply `@x402/express` middleware to `POST /skills/generate` ($0.1 USDC) and `GET /skills/:id` ($0.01 USDC)
- Configure `HTTPFacilitatorClient` (PayAI) and `ExactEvmScheme` for USDC on Base Mainnet
- Register `declareDiscoveryExtension` so PayAI facilitator auto-indexes both routes in the x402 Bazaar on payment settlement

## Capabilities

### New Capabilities
- `x402-payments`: Per-route x402 payment middleware with PayAI facilitator and Bazaar discovery registration

### Modified Capabilities

## Impact

- Modifies `src/routes/skills.js` (or `src/index.js`) to apply x402 middleware
- New env vars: `EVM_ADDRESS` (wallet address to receive payments)
- Optional production env vars: `PAYAI_API_KEY_ID`, `PAYAI_API_KEY_SECRET`
- Dependencies: `@x402/express`, `@x402/evm`, `@x402/core`, `@payai/facilitator`
