---
name: skillhub
description: >
  Generate and install AI-powered Agent Skills for smart contracts.
  Skillhub analyzes a contract address, produces a SKILL.md following the
  Agent Skills specification, and stores it on IPFS for download via x402
  paywall. Use it to turn any EVM smart contract into a discoverable,
  agent-ready skill in seconds.
metadata:
  author: skillhub
  version: 1.0.0
  chain: eip155:8453
---

# Skillhub

Skillhub generates Agent Skills (SKILL.md files) from smart contract addresses
on EVM chains. Provide a contract address and chain ID; Skillhub researches the
contract, generates a conformant skill file, and pins it to IPFS for download.

All paid endpoints require x402 payment (HTTP 402) in USDC on Base Mainnet.

---

## Setup

Install [OWS CLI](https://openwallet.sh):

```bash
curl -fsSL https://docs.openwallet.sh/install.sh | bash
```

Verify your OWS wallet is configured and note your Base Mainnet address:

```bash
ows wallet list
```

Look for an `eip155:8453` address — this is the wallet that will pay for x402 requests.

Optionally, install the `ows-sign` [skill](https://github.com/imajus/skillhub/blob/master/skills/ows-sign/SKILL.md) if you need to call smart contract functions directly via OWS CLI.

---

## Endpoints

| Method | Path                        | Cost       | Description                   |
| ------ | --------------------------- | ---------- | ----------------------------- |
| `POST` | `/skills/generate`          | $0.10 USDC | Start async skill generation  |
| `GET`  | `/skills/status/:sessionId` | Free       | Poll generation state         |
| `GET`  | `/skills/:skillId`          | $0.01 USDC | Download SKILL.md by IPFS CID |
| `GET`  | `/skill.md`                 | Free       | Skillhub's own SKILL.md       |

---

## Generate

**Endpoint:** `POST /skills/generate`
**Cost:** $0.10 USDC

**Request body**

| Field             | Type     | Required | Description                                     |
| ----------------- | -------- | -------- | ----------------------------------------------- |
| `contractAddress` | `string` | Yes      | EVM contract address (`0x…`)                    |
| `chainId`         | `string` | Yes      | CAIP-2 chain ID (e.g. `"eip155:8453"` for Base) |

**Response** (202 Accepted)

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "statusUrl": "/skills/status/550e8400-e29b-41d4-a716-446655440000"
}
```

**x402 payment flow**

Paid endpoints return HTTP 402 on the first call. Use `ows pay request` — it
automatically detects the 402, signs an EIP-3009 `TransferWithAuthorization`
for USDC, and retries with the payment header:

```bash
ows pay request "http://skillhub.majus.app/skills/generate" \
  --wallet <wallet-name> \
  --method POST \
  --body '{"contractAddress":"0x...","chainId":"eip155:8453"}'
```

Save the returned `sessionId`. Generation takes **1–2 minutes** — poll status
until `state` is `"ready"`.

---

## Check Status (free)

**Endpoint:** `GET /skills/status/:sessionId`
**Cost:** Free

Poll every **30 seconds**. The `state` field transitions:

- `"generating"` — pipeline is running
- `"ready"` — `skillId` (IPFS CID) is present; proceed to download
- `"failed"` — `reason` field explains the failure

```bash
curl https://skillhub.majus.app/skills/status/<sessionId>
```

**Response when ready**

```json
{ "state": "ready", "skillId": "bafybeig…" }
```

Polling loop:

```js
async function waitForSkill(sessionId, maxAttempts = 20, intervalMs = 30000) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://skillhub.majus.app/skills/status/${sessionId}`,
    );
    const data = await res.json();
    if (data.state === "ready") return data.skillId;
    if (data.state === "failed")
      throw new Error(`Generation failed: ${data.reason}`);
    console.log(`Still generating… (attempt ${i + 1}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Timed out waiting for skill generation");
}
```

---

## Download

**Endpoint:** `GET /skills/:skillId`
**Cost:** $0.01 USDC

The response body is the raw SKILL.md content (`text/markdown`). Use `ows pay request`:

```bash
ows pay request "http://skillhub.majus.app/skills/<skillId>" --wallet <wallet-name>
```

---

## Using the installed skill (on-chain transactions)

Generated skills describe how to call smart contract functions. Install the
`ows-sign` skill (see Setup) to encode, sign, and broadcast those calls via
OWS CLI without exposing private keys. See the `ows-sign` skill for the full
encoding and signing workflow.

---

## Gotchas

- **Do not call the paid download endpoint before generation is complete.** Always wait for `state === 'ready'`.
- `chainId` must be a CAIP-2 string (e.g. `"eip155:8453"`), not a plain number.
- Sessions are in-memory and lost on server restart; if a `sessionId` returns 404, re-run generation.
- The download endpoint returns raw Markdown, not JSON.
