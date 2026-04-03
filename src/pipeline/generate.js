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
- Keep under 500 lines / 5000 tokens
- For every payable function, include a prominent warning that it accepts ETH and users must only send value if required
- Use exact parameter and return value names from the ABI — do not rename or reorder them`;


export async function generate(context, previousFailureReason = null) {
  const { abi, source, ercPatterns, contractAddress, chainId } = context;

  const abiSummary = abi
    .filter(e => e.type === 'function')
    .map(e => {
      const inputs = (e.inputs ?? []).map(i => `${i.type} ${i.name}`).join(', ');
      const outputs = (e.outputs ?? []).map(o => `${o.type}${o.name ? ' ' + o.name : ''}`).join(', ');
      const ret = outputs ? ` returns (${outputs})` : '';
      return `${e.name}(${inputs})${ret}`;
    })
    .join('\n');

  const payableFunctions = abi
    .filter(e => e.type === 'function' && e.stateMutability === 'payable')
    .map(e => e.name);

  let userContent = `Generate a SKILL.md for the smart contract at ${contractAddress} (chainId: ${chainId}).

Detected ERC standards: ${ercPatterns.length ? ercPatterns.join(', ') : 'none'}
${payableFunctions.length ? `\nPayable functions (MUST include ETH value warnings): ${payableFunctions.join(', ')}\n` : ''}
ABI functions (use exact parameter and return value names as shown):
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
