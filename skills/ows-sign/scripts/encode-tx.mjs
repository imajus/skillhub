#!/usr/bin/env node
// Usage: node encode-tx.mjs <to> <eip155:chainId> <"funcName(type1,type2,...)"> [arg1 arg2 ...] [--address <0x...>]

import { encodeFunctionData, serializeTransaction, parseGwei, parseAbiItem, createPublicClient, http } from 'viem';
import * as chains from 'viem/chains';

// Extract optional --address flag
const argv = process.argv.slice(2);
const addrIdx = argv.indexOf('--address');
let address = null;
if (addrIdx !== -1) { address = argv.splice(addrIdx, 2)[1]; }

const [to, chainArg, sig, ...rawArgs] = argv;

if (!to || !chainArg || !sig) {
  console.error('Usage: node encode-tx.mjs <to> <eip155:chainId> <"funcName(types...)"> [args...] [--address <0x...>]');
  process.exit(1);
}

const chainId = Number(chainArg.startsWith('eip155:') ? chainArg.slice(7) : chainArg);
const chain = Object.values(chains).find(c => c.id === chainId);

const abiItem = parseAbiItem(`function ${sig}`);

const args = abiItem.inputs.map((input, i) => {
  const raw = rawArgs[i] ?? '';
  if (input.type === 'bytes32') return raw;
  if (input.type.startsWith('uint') || input.type.startsWith('int')) return BigInt(raw);
  if (input.type === 'bool') return raw === 'true';
  return raw;
});

const data = encodeFunctionData({ abi: [abiItem], functionName: abiItem.name, args });

let nonce = Number(process.env.TX_NONCE ?? 0);
if (address) {
  const client = createPublicClient({ chain, transport: http() });
  nonce = await client.getTransactionCount({ address });
}

const serialized = serializeTransaction({
  chainId,
  to,
  data,
  value: 0n,
  gas: 300000n,
  maxFeePerGas: parseGwei('0.1'),
  maxPriorityFeePerGas: parseGwei('0.001'),
  nonce,
});

process.stdout.write(serialized.slice(2) + '\n');
