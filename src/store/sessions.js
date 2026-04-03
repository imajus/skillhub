const sessions = new Map();

export function createSession() {
  const id = crypto.randomUUID();
  sessions.set(id, { state: 'generating' });
  return id;
}

export function markReady(sessionId, cid) {
  sessions.set(sessionId, { state: 'ready', skillId: cid });
}

export function markFailed(sessionId, reason) {
  sessions.set(sessionId, { state: 'failed', reason });
}

export function getSession(sessionId) {
  return sessions.get(sessionId) ?? null;
}
