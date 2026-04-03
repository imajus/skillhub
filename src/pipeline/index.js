import { research } from './research.js';
import { generate } from './generate.js';
import { validate } from './validate.js';

const MAX_RETRIES = 2;

const log = (msg) => console.log(`[pipeline] ${new Date().toISOString()} ${msg}`);

// Returns { success: true, skillMd } or { success: false, reason }
export async function runPipeline(contractAddress, chainId) {
  log(`start contract=${contractAddress} chainId=${chainId}`);

  log('research: start');
  const context = await research(contractAddress, chainId);
  context.contractAddress = contractAddress;
  context.chainId = chainId;
  log(`research: done abi=${context.abi.length} functions, ercs=${context.ercPatterns.join(',') || 'none'}`);

  let failureReason = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    log(`generate: attempt ${attempt + 1}`);
    const skillMd = await generate(context, failureReason);
    log(`generate: done (${skillMd.length} chars)`);

    log('validate: start');
    const result = await validate(skillMd, context.abi);
    if (result.valid) {
      log('validate: passed');
      return { success: true, skillMd };
    }
    log(`validate: failed — ${result.reason}`);
    failureReason = result.reason;
  }

  log(`pipeline: failed after ${MAX_RETRIES + 1} attempts`);
  return { success: false, reason: failureReason };
}
