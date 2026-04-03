## ADDED Requirements

### Requirement: Paywalled routes require x402 payment
`POST /skills/generate` and `GET /skills/:id` SHALL be protected by `@x402/express` middleware. Requests without a valid payment header SHALL receive HTTP 402 with payment requirements.

#### Scenario: Request without payment
- **WHEN** a client calls `POST /skills/generate` without a payment header
- **THEN** the server responds HTTP 402 with x402 payment requirements

#### Scenario: Request with valid payment
- **WHEN** a client calls `POST /skills/generate` with a valid x402 payment header
- **THEN** the middleware settles the payment and the request proceeds to the route handler

### Requirement: Generate endpoint costs $0.1 USDC
The x402 middleware on `POST /skills/generate` SHALL require exactly $0.1 USDC on Base Mainnet via `ExactEvmScheme`.

#### Scenario: Correct payment amount
- **WHEN** a client pays exactly $0.1 USDC
- **THEN** the payment is accepted and the request proceeds

### Requirement: Fetch endpoint costs $0.01 USDC
The x402 middleware on `GET /skills/:id` SHALL require exactly $0.01 USDC on Base Mainnet via `ExactEvmScheme`.

#### Scenario: Correct payment amount
- **WHEN** a client pays exactly $0.01 USDC
- **THEN** the payment is accepted and the request proceeds

### Requirement: Routes auto-indexed in x402 Bazaar
Both paywalled routes SHALL be registered with `declareDiscoveryExtension` so the PayAI facilitator indexes them in the x402 Bazaar upon payment settlement.

#### Scenario: Bazaar discovery
- **WHEN** a payment is settled for either paywalled route
- **THEN** the route appears in the x402 Bazaar discoverable by agents

### Requirement: Free routes unaffected
`GET /skills/status/:sid` and `GET /health` SHALL NOT require payment.

#### Scenario: Status poll without payment
- **WHEN** a client calls `GET /skills/status/:sid` without any payment header
- **THEN** the server responds normally (not 402)
