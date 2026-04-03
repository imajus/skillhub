## 1. Research Tools

- [x] 1.1 Create `src/tools/fetchABI.js` — Uniblock `GET /uni/v1/scan/contract-abi` with `X-API-KEY` header
- [x] 1.2 Create `src/tools/fetchSourceCode.js` — Uniblock source endpoint, truncate to token budget, return `null` if unverified
- [x] 1.3 Create `src/tools/detectERCPatterns.js` — signature-based ERC-20/721/1155 detection

## 2. Research Stage

- [x] 2.1 Create `src/pipeline/research.js` — LangGraph ReAct agent wired with the three tools
- [x] 2.2 Return structured context `{ abi, source, ercPatterns }` from agent output

## 3. Generate Stage

- [x] 3.1 Create `src/pipeline/generate.js` — GPT-4o call with Agent Skills spec system prompt and research context
- [x] 3.2 Return raw SKILL.md string

## 4. Validate Stage

- [x] 4.1 Create `src/pipeline/validate.js` — spec structure check + ABI function name cross-check
- [x] 4.2 Return `{ valid: true }` or `{ valid: false, reason }` 

## 5. Pipeline Orchestration

- [x] 5.1 Create `src/pipeline/index.js` — orchestrate Research → Generate → Validate with up to 2 retries
- [x] 5.2 On success call `uploadSkill(content)` (from ipfs-storage change) and return `{ success: true, cid }`
- [x] 5.3 On exhausted retries return `{ success: false, reason }`
