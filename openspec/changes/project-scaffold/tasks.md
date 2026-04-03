## 1. Project Initialization

- [ ] 1.1 Create `package.json` with `"type": "module"`, name, version, and all dependencies
- [ ] 1.2 Create `.env.example` documenting all required environment variables
- [ ] 1.3 Verify `.env` is in `.gitignore`

## 2. Express Server

- [ ] 2.1 Create `src/index.js` with Express app, dotenv loading, and `GET /health` route
- [ ] 2.2 Add startup env var validation that exits with non-zero code on missing required vars
- [ ] 2.3 Register `SIGTERM` and `SIGINT` handlers for graceful shutdown
- [ ] 2.4 Start server on `PORT` env var (default 3000) and log the listening address
