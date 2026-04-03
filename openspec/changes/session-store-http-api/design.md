## Context

Sessions are ephemeral — they track mutable pipeline state only while the server is running. Completed skills are durable via IPFS (CID). The API is fire-and-forget: `POST` returns immediately, caller polls status.

## Goals / Non-Goals

**Goals:**
- Minimal session store with `createSession`, `markReady(cid)`, `markFailed(reason)`, `getSession`
- Three Express routes matching the spec architecture
- In-memory CID cache on `GET /skills/:id` to avoid redundant Pinata gateway calls

**Non-Goals:**
- Persistent session storage (sessions are intentionally ephemeral)
- Authentication beyond x402 payments (handled in separate change)
- Pagination or listing of sessions/skills

## Decisions

- **`crypto.randomUUID()` for session IDs** — built-in, no extra dependency
- **Fire-and-forget pipeline** — `POST /skills/generate` kicks off `runPipeline()` without awaiting; updates session via `markReady`/`markFailed` callbacks
- **`statusUrl` in response** — convenience field pointing to `GET /skills/status/:sid`; reduces client-side URL construction
- **Separate cache Map for CIDs** — avoids re-fetching from Pinata gateway on repeated `GET /skills/:id` calls

## Risks / Trade-offs

- In-memory sessions lost on restart → by design; in-progress jobs must be re-submitted
- Unbounded session map growth → acceptable for hackathon scope; add TTL cleanup if needed later
