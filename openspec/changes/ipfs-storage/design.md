## Context

Pinata is the chosen IPFS pinning service. The SDK (`@pinata/sdk`) handles authentication via JWT. The public gateway URL is `https://gateway.pinata.cloud/ipfs/<CID>`. No registry or index is needed — the CID is self-describing.

## Goals / Non-Goals

**Goals:**
- `uploadSkill(content)` — pin content to IPFS via Pinata, return CID string
- `fetchSkill(cid)` — retrieve content from Pinata public gateway, return string

**Non-Goals:**
- Unpinning or deletion
- Private gateway support
- Listing uploaded skills

## Decisions

- **Pinata SDK for upload, plain fetch for retrieval** — SDK handles auth and pinning; public gateway fetch needs no auth
- **Content uploaded as a file buffer** — Pinata's `pinFileToIPFS` accepts a readable stream; wrap string content in a buffer stream

## Risks / Trade-offs

- Pinata gateway latency → mitigated by in-memory cache in the HTTP API layer
- Pinata service outage → upload fails, pipeline returns failure; fetch fails, API returns 502
