import { research } from './research.js';
import { generate } from './generate.js';
import { validate } from './validate.js';
import { uploadSkill } from '../storage/ipfs.js';

const MAX_RETRIES = 2;

export async function runPipeline(contractAddress, chainId) {
  const context = await research(contractAddress, chainId);
  context.contractAddress = contractAddress;
  context.chainId = chainId;

  let skillMd;
  let failureReason = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    skillMd = await generate(context, failureReason);
    const result = await validate(skillMd, context.abi);
    if (result.valid) {
      try {
        const cid = await uploadSkill(skillMd);
        return { success: true, cid };
      } catch (err) {
        return { success: false, reason: `IPFS upload failed: ${err.message}` };
      }
    }
    failureReason = result.reason;
  }

  return { success: false, reason: failureReason };
}
