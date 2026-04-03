## ADDED Requirements

### Requirement: Server starts and serves health check
The server SHALL start on the port defined by the `PORT` environment variable (default 3000) and expose a `GET /health` route that returns HTTP 200.

#### Scenario: Health check returns 200
- **WHEN** a client sends `GET /health`
- **THEN** the server responds with HTTP 200 and a JSON body `{ "status": "ok" }`

### Requirement: Environment variables loaded at startup
The server SHALL load environment variables from a `.env` file at startup using dotenv.

#### Scenario: Missing required env var
- **WHEN** a required environment variable is absent at startup
- **THEN** the process exits with a non-zero code and logs the missing variable name

### Requirement: Graceful shutdown
The server SHALL handle `SIGTERM` and `SIGINT` by closing the HTTP server before exiting.

#### Scenario: SIGTERM received
- **WHEN** the process receives `SIGTERM`
- **THEN** the server stops accepting new connections and exits cleanly
