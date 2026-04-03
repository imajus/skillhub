## ADDED Requirements

### Requirement: Session created with generating state
`createSession()` SHALL generate a unique session ID, store a session with state `generating`, and return the session ID.

#### Scenario: New session created
- **WHEN** `createSession()` is called
- **THEN** a new entry exists in the store with `{ state: "generating" }` and a unique ID is returned

### Requirement: Session marked ready with CID
`markReady(sessionId, cid)` SHALL update the session state to `ready` and store the CID as `skillId`.

#### Scenario: Mark ready
- **WHEN** `markReady(sessionId, cid)` is called for an existing session
- **THEN** `getSession(sessionId)` returns `{ state: "ready", skillId: cid }`

### Requirement: Session marked failed with reason
`markFailed(sessionId, reason)` SHALL update the session state to `failed` and store the reason.

#### Scenario: Mark failed
- **WHEN** `markFailed(sessionId, reason)` is called
- **THEN** `getSession(sessionId)` returns `{ state: "failed", reason }`

### Requirement: Unknown session returns null
`getSession(sessionId)` SHALL return `null` for an unknown session ID.

#### Scenario: Unknown session
- **WHEN** `getSession` is called with an ID not in the store
- **THEN** it returns `null`
