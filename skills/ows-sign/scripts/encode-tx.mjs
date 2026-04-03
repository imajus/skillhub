#!/usr/bin/env node
// Usage: node encode-tx.mjs <to> <chainId> <"funcName(type1,type2,...)"> [arg1 arg2 ...] [--address <0x...> --rpc-url <url>]

import { encodeFunctionData, serializeTransaction, parseGwei, parseAbiItem, createPublicClient, http } from 'viem';

// Extract optional --address and --rpc-url flags (splice higher index first to avoid shifting)
const argv = process.argv.slice(2);
const indices = ['--address', '--rpc-url'].map(f => [f, argv.indexOf(f)]).sort((a, b) => b[1] - a[1]);
const extracted = {};
for (const [flag, idx] of indices) extracted[flag] = idx !== -1 ? argv.splice(idx, 2)[1] : null;
const address = extracted['--address'];
const rpcUrl = extracted['--rpc-url'];

const [to, chainId, sig, ...rawArgs] = argv;

if (!to || !chainId || !sig) {
  console.error('Usage: node encode-tx.mjs <to> <chainId> <"funcName(types...)"> [args...] [--wallet <name> --rpc-url <url>]');
  process.exit(1);
}

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
if (address && rpcUrl) {
  const client = createPublicClient({ transport: http(rpcUrl) });
  nonce = await client.getTransactionCount({ address });
}

const serialized = serializeTransaction({
  chainId: Number(chainId),
  to,
  data,
  value: 0n,
  gas: 300000n,
  maxFeePerGas: parseGwei('0.1'),
  maxPriorityFeePerGas: parseGwei('0.001'),
  nonce,
});

process.stdout.write(serialized.slice(2) + '\n');
