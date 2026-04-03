## 1. Research Tools

- [ ] 1.1 Create `src/tools/fetchABI.js` — Uniblock `GET /scan/contract-abi` with `X-API-KEY` header
- [ ] 1.2 Create `src/tools/fetchSourceCode.js` — Uniblock source endpoint, truncate to token budget, return `null` if unverified
- [ ] 1.3 Create `src/tools/detectERCPatterns.js` — signature-based ERC-20/721/1155 detection

## 2. Research Stage

- [ ] 2.1 Create `src/pipeline/research.js` — LangGraph ReAct agent wired with the three tools
- [ ] 2.2 Return structured context `{ abi, source, ercPatterns }` from agent output

## 3. Generate Stage

- [ ] 3.1 Create `src/pipeline/generate.js` — GPT-5 call with Agent Skills spec system prompt and research context
- [ ] 3.2 Return raw SKILL.md string

## 4. Validate Stage

- [ ] 4.1 Create `src/pipeline/validate.js` — spec structure check + ABI function name cross-check
- [ ] 4.2 Return `{ valid: true }` or `{ valid: false, reason }` 

## 5. Pipeline Orchestration

- [ ] 5.1 Create `src/pipeline/index.js` — orchestrate Research → Generate → Validate with up to 2 retries
- [ ] 5.2 On success call `uploadSkill(content)` (from ipfs-storage change) and return `{ success: true, cid }`
- [ ] 5.3 On exhausted retries return `{ success: false, reason }`
