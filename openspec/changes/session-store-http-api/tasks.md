## 1. Session Store

- [x] 1.1 Create `src/store/sessions.js` with `createSession`, `markReady`, `markFailed`, `getSession`
- [x] 1.2 Use `crypto.randomUUID()` for session IDs

## 2. Skills Routes

- [x] 2.1 Create `src/routes/skills.js` with `POST /skills/generate`, `GET /skills/status/:sid`, `GET /skills/:id`
- [x] 2.2 `POST /skills/generate`: validate body, create session, fire-and-forget `runPipeline()`, return 202 `{ sessionId, statusUrl }`
- [x] 2.3 `GET /skills/status/:sid`: look up session, return state (404 if unknown)
- [x] 2.4 `GET /skills/:id`: check in-memory cache, fetch from Pinata gateway if miss, return `text/markdown`
- [x] 2.5 Mount `skills` router on the Express app in `src/index.js`
