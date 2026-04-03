# Skillhub — Project Requirements

> AI-powered agent skill generator for smart contracts.

## Problem

AI agents need to interact with smart contracts but lack reliable, structured knowledge about how to do so. Currently they either:

- Waste context tokens parsing raw ABIs and docs with unreliable results
- Hallucinate function signatures, causing failed transactions and wasted gas
- Ask the human for help, defeating the purpose of autonomy
- Give up entirely

Agents could generate skills themselves, but it takes time, domain knowledge, and specialized tools. Skillhub provides a cheaper, faster, higher-quality alternative — and builds a growing library of reusable skills that other agents can purchase.

## Target Persona

**Primary: Autonomous AI agents** acting on behalf of developers or end-users.

- Mid-task, encounters a contract it doesn't know how to use
- Needs a working skill immediately, without human intervention
- Pays programmatically via x402 (no accounts, no API keys)
- Context window is precious — needs concise, reliable instructions

**Secondary: Developers** building agent-powered applications.

- Needs skills for multiple contracts, writing each manually takes hours
- Wants predictable quality and cost savings ($0.10/skill generation vs hours of work, $0.01/skill use)

### Pain Points

- No reliable way to go from "contract address" to "working agent skill"
- Raw ABIs are structured but lack usage context, gotchas, and patterns
- Every failed contract call costs real gas
- No standardized discovery mechanism for agent skills

### Potential Blockers

- A bad skill causes the agent to drain the user's wallet
- Paying for a skill that doesn't actually work
- Platform lock-in (skills should be portable, open-format files)

### What Wins Them Over

- Output is open standard (Agent Skills spec) — no lock-in
- Skills are concise and context-efficient (< 500 lines, < 5000 tokens)
- Generated skills include gotchas, safety warnings, and tested code examples
- Pay-per-use via x402 — no subscriptions, no accounts

## Solution

An HTTP API server that:

1. **Generates** Agent Skills (SKILL.md) from smart contract addresses via a multi-stage AI pipeline
2. **Stores** generated skills on IPFS via Pinata (content-addressed, permanent URLs)
3. **Serves** skills behind x402 paywalls
4. **Registers** each generated skill on x402 Bazaar for discovery by other agents

See [Specification](./Specification.md) for architecture, API details, pipeline stages, and deployment.

## Out of Scope (for PoC)

- Support for HTTP APIs, local tools, or other protocol types
- Custom skill catalog / search endpoint (Bazaar handles discovery)
- On-chain skill registry or attestations
- ERC-8004 integration
- Skill versioning or updates
- GUI / dashboard
- Subscription or tiered pricing
- Extra skill artifacts (resources, etc)
