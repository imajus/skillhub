import { Router } from 'express';
import { createSession, markReady, markFailed, getSession } from '../store/sessions.js';
import { runPipeline } from '../pipeline/index.js';
import { uploadSkill, fetchSkill } from '../storage/ipfs.js';

const router = Router();
const cidCache = new Map();

router.post('/generate', async (req, res) => {
  const { contractAddress, chainId } = req.body ?? {};
  if (!contractAddress || !chainId) {
    return res.status(400).json({ error: 'contractAddress and chainId are required' });
  }

  const sessionId = createSession();
  runPipeline(contractAddress, chainId).then(async ({ success, skillMd, reason }) => {
    if (!success) return markFailed(sessionId, reason);
    try {
      const cid = await uploadSkill(skillMd);
      markReady(sessionId, cid);
    } catch (err) {
      markFailed(sessionId, `IPFS upload failed: ${err.message}`);
    }
  });

  res.status(202).json({ sessionId, statusUrl: `/skills/status/${sessionId}` });
});

router.get('/status/:sid', (req, res) => {
  const session = getSession(req.params.sid);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (cidCache.has(id)) {
    return res.type('text/markdown').send(cidCache.get(id));
  }

  const content = await fetchSkill(id);
  if (content === null) return res.status(404).json({ error: 'Skill not found' });

  cidCache.set(id, content);
  res.type('text/markdown').send(content);
});

export default router;
