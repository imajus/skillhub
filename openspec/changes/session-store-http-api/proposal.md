## Why

The HTTP API is the public interface of Spectopus. Clients need to trigger generation, poll for progress, and retrieve completed skills. The session store is the glue that tracks in-flight pipeline state between those calls.

## What Changes

- In-memory session store with states `generating → ready | failed`
- `POST /skills/generate` — starts the pipeline, returns `{ sessionId, statusUrl }`
- `GET /skills/status/:sid` — returns current session state; includes `skillId` (CID) when ready
- `GET /skills/:id` — fetches SKILL.md from Pinata gateway by CID with in-memory cache

## Capabilities

### New Capabilities
- `session-store`: In-memory `Map<sessionId, Session>` with lifecycle helpers
- `skills-api`: Three Express routes covering generation trigger, status polling, and skill retrieval

### Modified Capabilities

## Impact

- New files: `src/store/sessions.js`, `src/routes/skills.js`
- Mounts routes onto the Express app from `project-scaffold`
- Calls `runPipeline()` from `generation-pipeline` change
- Calls `fetchSkill(cid)` from `ipfs-storage` change
- x402 middleware applied to two routes (wired in `x402-payment-integration` change)
