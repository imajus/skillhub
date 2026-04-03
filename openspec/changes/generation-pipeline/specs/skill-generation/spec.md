## ADDED Requirements

### Requirement: ReAct agent researches contract
The research stage SHALL run a LangGraph ReAct agent with `fetchABI`, `fetchSourceCode`, and `detectERCPatterns` as tools, and return a structured research context object containing ABI, source (if available), and detected ERC patterns.

#### Scenario: Agent completes research
- **WHEN** the agent is invoked with a contract address and chainId
- **THEN** it returns a context object with `abi`, `source`, and `ercPatterns` fields

### Requirement: Generate stage produces SKILL.md content
The generate stage SHALL call GPT-5 with the research context and a system prompt derived from the [Agent Skills specification](https://agentskills.io/specification.md), and return the generated SKILL.md as a string.

#### Scenario: Successful generation
- **WHEN** the generate stage receives a valid research context
- **THEN** it returns a non-empty SKILL.md string conforming to the Agent Skills spec format
