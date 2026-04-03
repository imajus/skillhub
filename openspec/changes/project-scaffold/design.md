## Context

No source code exists yet. All subsequent changes (pipeline, API, payments, storage) depend on this scaffold being in place first.

## Goals / Non-Goals

**Goals:**
- Runnable Express server with health check
- All production dependencies installed
- Environment variable loading from `.env`

**Non-Goals:**
- Any business logic (routes, pipeline, payments)
- Testing setup
- Docker / deployment config

## Decisions

- **ES modules** — spec mandates Node.js ES modules; `"type": "module"` in `package.json`
- **dotenv** — load `.env` at startup; fail fast if required vars are missing
- **Single entry point** — `src/index.js` creates and starts the app; keeps it testable later

## Risks / Trade-offs

- ES module interop with CommonJS deps (e.g., older SDKs) → check each dep supports ESM or use dynamic `import()`
