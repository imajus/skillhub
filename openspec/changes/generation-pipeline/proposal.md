## Why

Spectopus's core value is automated SKILL.md generation from a contract address. The generation pipeline — research, generate, validate — is the engine that produces that output.

## What Changes

- Implement three Uniblock research tools: `fetchABI`, `fetchSourceCode`, `detectERCPatterns`
- Build a LangGraph ReAct agent that uses those tools to research a contract
- Implement the Generate stage: LLM (GPT-5) produces a SKILL.md from research context
- Implement the Validate stage: spec conformance + ABI cross-check + safety check, with up to 2 Generate retries on failure
- On successful validation, upload the SKILL.md to IPFS via Pinata and return the CID

## Capabilities

### New Capabilities
- `research-tools`: Uniblock-backed tools for fetching ABI, source code, and detecting ERC patterns
- `skill-generation`: LangGraph ReAct research agent + GPT-5 generate stage producing SKILL.md
- `skill-validation`: Post-generation validation with retry loop (max 2) and IPFS upload on success

### Modified Capabilities

## Impact

- New files: `src/tools/`, `src/pipeline/research.js`, `src/pipeline/generate.js`, `src/pipeline/validate.js`, `src/pipeline/index.js`
- Dependencies: `@langchain/core`, `@langchain/openai`, `@langchain/langgraph`, `@pinata/sdk`
- Env vars: `OPENAI_API_KEY`, `UNIBLOCK_API_KEY`, `PINATA_JWT`
