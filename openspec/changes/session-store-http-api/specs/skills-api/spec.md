## ADDED Requirements

### Requirement: POST /skills/generate starts pipeline and returns session info
`POST /skills/generate` SHALL accept `{ contractAddress, chainId }` in the request body, create a session, start the pipeline asynchronously, and return HTTP 202 with `{ sessionId, statusUrl }`.

#### Scenario: Valid request
- **WHEN** a client posts a valid contract address and chainId
- **THEN** the server responds HTTP 202 with `{ sessionId, statusUrl }` immediately

#### Scenario: Missing required fields
- **WHEN** `contractAddress` or `chainId` is absent from the body
- **THEN** the server responds HTTP 400 with an error message

### Requirement: GET /skills/status/:sid returns session state
`GET /skills/status/:sid` SHALL return the current session state. When state is `ready`, the response SHALL include `skillId` (the CID).

#### Scenario: Session generating
- **WHEN** the session is still in `generating` state
- **THEN** the server responds HTTP 200 with `{ state: "generating" }`

#### Scenario: Session ready
- **WHEN** the session state is `ready`
- **THEN** the server responds HTTP 200 with `{ state: "ready", skillId: <CID> }`

#### Scenario: Session failed
- **WHEN** the session state is `failed`
- **THEN** the server responds HTTP 200 with `{ state: "failed", reason }`

#### Scenario: Unknown session ID
- **WHEN** the session ID does not exist
- **THEN** the server responds HTTP 404

### Requirement: GET /skills/:id fetches SKILL.md by CID
`GET /skills/:id` SHALL fetch the SKILL.md content from the Pinata public gateway using the CID as `:id`, cache the result in memory, and return it as `text/markdown`.

#### Scenario: First fetch
- **WHEN** a client requests a CID not yet cached
- **THEN** the server fetches from Pinata gateway and returns the content with `Content-Type: text/markdown`

#### Scenario: Cached fetch
- **WHEN** the same CID is requested again
- **THEN** the server returns the cached content without calling Pinata

#### Scenario: CID not found on gateway
- **WHEN** Pinata gateway returns 404
- **THEN** the server responds HTTP 404
