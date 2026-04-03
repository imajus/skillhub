import { model } from './model.js';

const SYSTEM_PROMPT = `You are an expert at generating Agent Skills (SKILL.md files) for Ethereum smart contracts.

A SKILL.md must start with YAML frontmatter followed by Markdown body:

---
name: <lowercase-hyphenated-name>   # max 64 chars, a-z 0-9 hyphens, no leading/trailing hyphens
description: <what it does and when to use it>  # max 1024 chars
metadata:
  contractAddress: <address>
  chainId: <chainId>
---

Body requirements:
- Overview of the contract and its purpose
- Key functions: name, parameters, return values, and usage notes
- Code examples using viem (TypeScript)
- Common patterns, gotchas, and safety warnings
- Only reference functions that exist in the provided ABI
- Keep under 500 lines / 5000 tokens`;


export async function generate(context, previousFailureReason = null) {
  const { abi, source, ercPatterns, contractAddress, chainId } = context;

  const abiSummary = abi
    .filter(e => e.type === 'function')
    .map(e => `${e.name}(${(e.inputs ?? []).map(i => `${i.type} ${i.name}`).join(', ')})`)
    .join('\n');

  let userContent = `Generate a SKILL.md for the smart contract at ${contractAddress} (chainId: ${chainId}).

Detected ERC standards: ${ercPatterns.length ? ercPatterns.join(', ') : 'none'}

ABI functions:
${abiSummary}
${source ? `\nVerified source code (truncated):\n${source}` : ''}`;

  if (previousFailureReason) {
    userContent += `\n\nPrevious attempt failed validation: ${previousFailureReason}\nFix the issues and regenerate.`;
  }

  const response = await model.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ]);

  return response.content;
}
