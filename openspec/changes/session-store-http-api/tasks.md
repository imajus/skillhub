## 1. Session Store

- [ ] 1.1 Create `src/store/sessions.js` with `createSession`, `markReady`, `markFailed`, `getSession`
- [ ] 1.2 Use `crypto.randomUUID()` for session IDs

## 2. Skills Routes

- [ ] 2.1 Create `src/routes/skills.js` with `POST /skills/generate`, `GET /skills/status/:sid`, `GET /skills/:id`
- [ ] 2.2 `POST /skills/generate`: validate body, create session, fire-and-forget `runPipeline()`, return 202 `{ sessionId, statusUrl }`
- [ ] 2.3 `GET /skills/status/:sid`: look up session, return state (404 if unknown)
- [ ] 2.4 `GET /skills/:id`: check in-memory cache, fetch from Pinata gateway if miss, return `text/markdown`
- [ ] 2.5 Mount `skills` router on the Express app in `src/index.js`
