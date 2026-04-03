---
name: ows-sign
description: Sign and broadcast EVM transactions using the ows CLI and a local encode-tx.mjs script. Use when interacting with smart contracts on EVM chains via ows wallet.
metadata:
  requires:
    bins: [ows, node]
  scripts:
    encode_tx: scripts/encode-tx.mjs
---

# OWS EVM Transaction Signing

Sign and broadcast EVM smart contract calls using `ows` CLI + a local `encode-tx.mjs` helper.

## When to use

- Calling any smart contract function on an EVM chain
- User has an `ows` wallet and wants to sign/broadcast without exposing private keys

## Workflow

### 1. Encode the transaction

```bash
node {baseDir}/scripts/encode-tx.mjs <to> <eip155:chainId> "<funcName(types...)>" [arg1 arg2 ...]
```

**Arguments:**
- `to` — contract address
- `eip155:chainId` — CAIP-2 chain ID (e.g. `eip155:8453` for Base)
- `funcName(types...)` — full function signature (e.g. `"transfer(address,uint256)"`)
- `args` — space-separated values; auto-coerced by type:
  - `uint*/int*` → BigInt
  - `bool` → boolean
  - `bytes32` → passed as-is (use `0x000...000` for zero hash)
  - everything else → string

Optionally pass `--address <0x...>` to auto-fetch the current nonce from the chain using viem's default RPC.

### 2. Sign and broadcast

```bash
ows sign send-tx \
  --wallet <wallet-name> \
  --chain eip155:<chainId> \
  --tx $(node {baseDir}/scripts/encode-tx.mjs <to> eip155:<chainId> "<sig>" [args...] \
    --address <sender-address>)
```

Use `OWS_API_KEY=<key>` env var if authenticating via API key instead of passphrase.

## Get wallet EVM address

```bash
ows wallet list | grep -A5 "Name:.*<wallet-name>" | grep "eip155" | awk '{print $NF}'
```

## Example — ERC-20 transfer (Base)

```bash
OWS_API_KEY="ows_key_..." ows sign send-tx \
  --wallet my-wallet \
  --chain eip155:8453 \
  --tx $(node {baseDir}/scripts/encode-tx.mjs \
    0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
    eip155:8453 \
    "transfer(address,uint256)" \
    0xRecipientAddress 1000000 \
    --address 0xYourAddress)
```

> `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` is USDC on Base. `1000000` = 1 USDC (6 decimals).

## Notes

- `encode-tx.mjs` requires `viem` — install with `npm install viem` in the project directory
- Default gas: 300,000 — adjust in `encode-tx.mjs` if needed
- Without `--address`, nonce defaults to `0` or `TX_NONCE` env var
- `{baseDir}` resolves to the skill directory at runtime
