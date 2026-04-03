import { model } from './model.js';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function checkFrontmatter(skillMd) {
  const errors = [];
  const fm = parseFrontmatter(skillMd);
  if (!fm) return ['Missing YAML frontmatter'];
  if (!/^name:/m.test(fm)) errors.push('Missing required field: name');
  if (!/^description:/m.test(fm)) errors.push('Missing required field: description');
  if (!/contractAddress:/m.test(fm)) errors.push('Missing required metadata field: contractAddress');
  if (!/chainId:/m.test(fm)) errors.push('Missing required metadata field: chainId');
  return errors;
}

async function llmCheck(systemPrompt, userContent) {
  const res = await model.invoke([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]);
  const match = res.content.match(/\{[\s\S]*\}/);
  if (!match) return ['LLM response was unparseable'];
  try {
    const { errors } = JSON.parse(match[0]);
    return Array.isArray(errors) ? errors : [];
  } catch {
    return ['LLM response was invalid JSON'];
  }
}

async function checkABI(skillMd, abi) {
  if (!abi?.length) return [];
  return llmCheck(
    'You are a smart contract code reviewer. Analyze whether code examples in a SKILL.md correctly match the contract ABI. Respond with valid JSON only.',
    `ABI:\n${JSON.stringify(abi)}\n\nSKILL.md:\n${skillMd}\n\nVerify all function names, parameter types, and return types in code examples match the ABI.\nRespond with JSON: { "valid": boolean, "errors": string[] }`
  );
}

async function checkSafety(skillMd, abi) {
  const payable = abi?.filter(e => e.type === 'function' && e.stateMutability === 'payable').map(e => e.name) ?? [];
  const hasApproval = abi?.some(e => e.type === 'function' && ['approve', 'setApprovalForAll'].includes(e.name)) ?? false;
  if (!payable.length && !hasApproval) return [];
  return llmCheck(
    'You are a smart contract safety reviewer. Check whether a SKILL.md includes appropriate warnings. Respond with valid JSON only.',
    `${payable.length ? `Payable functions requiring ETH value warnings: ${payable.join(', ')}\n` : ''}${hasApproval ? 'Contract has approval functions requiring approval-before-transfer warnings.\n' : ''}\nSKILL.md:\n${skillMd}\n\nRespond with JSON: { "valid": boolean, "errors": string[] }`
  );
}

export async function validate(skillMd, abi) {
  const frontmatterErrors = checkFrontmatter(skillMd);
  if (frontmatterErrors.length) return { valid: false, reason: frontmatterErrors.join('; ') };

  const [abiErrors, safetyErrors] = await Promise.all([
    checkABI(skillMd, abi),
    checkSafety(skillMd, abi),
  ]);

  const errors = [...abiErrors, ...safetyErrors];
  return errors.length ? { valid: false, reason: errors.join('; ') } : { valid: true };
}
