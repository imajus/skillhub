## 1. IPFS Storage Module

- [x] 1.1 Create `src/storage/ipfs.js` with `uploadSkill(content)` using Pinata SDK `pinFileToIPFS` (stream from buffer)
- [x] 1.2 Implement `fetchSkill(cid)` using `fetch` against `https://gateway.pinata.cloud/ipfs/<cid>`; return `null` on 404, throw on other errors
- [x] 1.3 Add `PINATA_JWT` to `.env.example`
