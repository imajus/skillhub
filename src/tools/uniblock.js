import Bottleneck from 'bottleneck';

const BASE = 'https://api.uniblock.dev/uni/v1';
const CHAR_BUDGET = 30000;
const EIP1967_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const IMPL_SELECTOR = '0x5c60da1b';

const ERC_SIGNATURES = {
  'ERC-20':   ['transfer', 'approve', 'transferFrom', 'balanceOf', 'allowance'],
  'ERC-721':  ['ownerOf', 'safeTransferFrom', 'getApproved', 'setApprovalForAll', 'isApprovedForAll', 'balanceOf'],
  'ERC-1155': ['safeTransferFrom', 'safeBatchTransferFrom', 'balanceOfBatch', 'setApprovalForAll', 'isApprovedForAll'],
};

const headers = () => ({ 'X-API-KEY': process.env.UNIBLOCK_API_KEY });

const limiter = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });
limiter.on('failed', (error, info) => {
  if (error?.status === 429 && info.retryCount < 4) return (info.retryCount + 1) * 2000;
});

async function rateLimitedFetch(url, options) {
  const res = await fetch(url, options);
  if (res.status === 429) {
    const err = new Error(`Rate limited (429): ${url}`);
    err.status = 429;
    throw err;
  }
  return res;
}

const limitedFetch = limiter.wrap(rateLimitedFetch);

async function rpc(chainId, method, params) {
  const res = await limitedFetch(`${BASE}/json-rpc?chainId=${chainId}`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  });
  return (await res.json()).result;
}

function extractAddress(hex) {
  const addr = '0x' + hex.slice(-40);
  return addr === '0x0000000000000000000000000000000000000000' ? null : addr;
}

async function resolveProxy(contractAddress, chainId) {
  const slot = await rpc(chainId, 'eth_getStorageAt', [contractAddress, EIP1967_SLOT, 'latest']);
  const fromSlot = extractAddress(slot);
  if (fromSlot) return fromSlot;
  const call = await rpc(chainId, 'eth_call', [{ to: contractAddress, data: IMPL_SELECTOR }, 'latest']);
  return call ? extractAddress(call) : null;
}

async function getABI(address, chainId) {
  const res = await limitedFetch(`${BASE}/scan/contract-abi?chainId=${chainId}&address=${address}`, { headers: headers() });
  if (!res.ok) throw new Error(`Uniblock ABI ${res.status}: ${await res.text()}`);
  return JSON.parse((await res.json()).abi);
}

export async function fetchABI(contractAddress, chainId) {
  const abi = await getABI(contractAddress, chainId);
  const names = new Set(abi.filter(e => e.type === 'function').map(e => e.name));
  const events = new Set(abi.filter(e => e.type === 'event').map(e => e.name));
  const isProxy = (names.has('implementation') && names.has('upgradeTo')) || events.has('Upgraded');
  if (isProxy || abi.length === 0) {
    const impl = await resolveProxy(contractAddress, chainId);
    if (impl) return getABI(impl, chainId);
  }
  return abi;
}

export async function fetchSourceCode(contractAddress, chainId) {
  const res = await limitedFetch(`${BASE}/scan/contract-source-code?chainId=${chainId}&contractAddress=${contractAddress}`, { headers: headers() });
  if (!res.ok) return null;
  const source = (await res.json())?.result?.[0]?.SourceCode;
  if (!source) return null;
  return source.length > CHAR_BUDGET ? source.slice(0, CHAR_BUDGET) : source;
}

export function detectERCPatterns(abi) {
  const names = new Set(abi.filter(e => e.type === 'function').map(e => e.name));
  const patterns = Object.entries(ERC_SIGNATURES)
    .filter(([, sigs]) => sigs.every(s => names.has(s)))
    .map(([standard]) => standard);
  if (['implementation', 'upgradeTo'].every(fn => names.has(fn))) patterns.push('EIP-1967-Proxy');
  return patterns;
}
