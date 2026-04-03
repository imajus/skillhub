import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export async function uploadSkill(content) {
  const file = new File([content], 'skill.md', { type: 'text/markdown' });
  const { cid } = await pinata.upload.private.file(file);
  return cid;
}

export async function fetchSkill(cid) {
  try {
    const { data } = await pinata.gateways.private.get(cid);
    return String(data);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}
