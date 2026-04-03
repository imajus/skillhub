## Why

Spectopus has no runnable project yet. We need a Node.js ES module foundation with Express wired up before any feature work can begin.

## What Changes

- Initialize `package.json` with ES module type and all required dependencies
- Create `src/index.js` as the Express app entry point with health check route
- Add `.env` loading via `dotenv` with a documented `.env.example`

## Capabilities

### New Capabilities
- `express-server`: HTTP server bootstrapped with Express, dotenv config, and graceful startup/shutdown

### Modified Capabilities

## Impact

- New project root files: `package.json`, `src/index.js`, `.env.example`, `.gitignore`
- Dependencies: `express`, `dotenv`, `@x402/express`, `@x402/evm`, `@x402/core`, `@payai/facilitator`, `@pinata/sdk`, `@langchain/core`, `@langchain/openai`, `@langchain/langgraph`
