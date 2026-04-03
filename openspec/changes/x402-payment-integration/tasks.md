## 1. Configuration

- [ ] 1.1 Add `WALLET_PRIVATE_KEY` and `FACILITATOR_URL` to `.env.example`
- [ ] 1.2 Define `GENERATE_PRICE` ($0.1 USDC) and `FETCH_PRICE` ($0.01 USDC) as constants

## 2. Middleware Wiring

- [ ] 2.1 Instantiate `HTTPFacilitatorClient` with `FACILITATOR_URL`
- [ ] 2.2 Create `paymentMiddleware` using `@x402/express` with `ExactEvmScheme` and the facilitator client
- [ ] 2.3 Apply middleware to `POST /skills/generate` with `GENERATE_PRICE`
- [ ] 2.4 Apply middleware to `GET /skills/:id` with `FETCH_PRICE`

## 3. Bazaar Discovery

- [ ] 3.1 Call `declareDiscoveryExtension` at server startup for both paywalled routes
