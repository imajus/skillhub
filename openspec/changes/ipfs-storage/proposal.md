## Why

Completed skills must survive server restarts. IPFS via Pinata provides content-addressed, permanent public storage — the CID is both the address and the integrity check.

## What Changes

- Pinata SDK wrapper with `uploadSkill(content) → CID` for pinning SKILL.md content
- `fetchSkill(cid) → content` for retrieving content via the Pinata public gateway

## Capabilities

### New Capabilities
- `ipfs-storage`: Pinata-backed upload and fetch functions for SKILL.md content

### Modified Capabilities

## Impact

- New file: `src/storage/ipfs.js`
- Env vars: `PINATA_JWT`
- Used by `generation-pipeline` (upload on success) and `session-store-http-api` (fetch on `GET /skills/:id`)
