## Context

The pipeline runs asynchronously after `POST /skills/generate`. It must be self-contained — session state updates are handled by the session store (separate change). The pipeline's only output is a CID (on success) or an error (on failure).

## Goals / Non-Goals

**Goals:**
- Fetch contract ABI and source code via Uniblock
- Detect ERC standards from ABI signatures
- Run a LangGraph ReAct agent to gather research context
- Generate SKILL.md via GPT-5 using the [Agent Skills specification](https://agentskills.io/specification.md)
- Validate output against spec + ABI; retry Generate up to 2 times on failure
- Upload validated SKILL.md to IPFS via Pinata; return CID

**Non-Goals:**
- Session state management (handled by session-store-http-api change)
- HTTP routing
- Payment handling

## Decisions

- **LangGraph ReAct agent for research** — tools are stateless; ReAct loop lets the agent decide which tools to call and when to stop
- **Separate pipeline stages as modules** — `research.js`, `generate.js`, `validate.js` each export a single async function; `index.js` orchestrates them
- **Max 2 retries on validation failure** — balances quality vs. cost; failure after 2 retries marks session as `failed`
- **IPFS upload only on success** — no partial uploads; CID is the canonical skill ID

## Risks / Trade-offs

- Uniblock API unavailability → pipeline fails fast with descriptive error; no retry (caller can re-submit)
- GPT-5 hallucinating ABI details → Validate cross-checks generated content against fetched ABI; mismatch triggers retry
- Large source files → truncate to a reasonable token budget before passing to LLM
