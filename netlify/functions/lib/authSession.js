/**
 * Sesión única por cuenta: sessionVersion en blob + claim sv en JWT mdr-auth.
 */
const { verifyJwt } = require('./proJwt.js');
const { verifiedUserKey } = require('./authBlobKeys.js');
const { normalizeEmail } = require('./proEntitlementLogic.js');

/**
 * @param {unknown} user
 */
function readSessionVersion(user) {
  if (!user || typeof user !== 'object') return 0;
  const n = Number(/** @type {{ sessionVersion?: number }} */ (user).sessionVersion);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/**
 * @param {unknown} payload
 * @param {unknown} user
 */
function sessionVersionMatches(payload, user) {
  const serverSv = readSessionVersion(user);
  const tokenSv =
    payload && typeof payload === 'object' && typeof payload.sv === 'number' ? payload.sv : null;
  if (tokenSv === null) {
    return serverSv === 0;
  }
  return tokenSv === serverSv;
}

/**
 * Incrementa sessionVersion y persiste el usuario verificado.
 * @param {import('./blobStore.js').ProStore} store
 * @param {string} email
 * @returns {Promise<number>}
 */
async function bumpSessionVersion(store, email) {
  const key = verifiedUserKey(email);
  let user;
  try {
    user = await store.get(key, { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (!user || typeof user !== 'object') return 0;
  const next = readSessionVersion(user) + 1;
  user.sessionVersion = next;
  await store.setJSON(key, user);
  return next;
}

/**
 * @param {string} token
 * @param {string} secret
 * @param {import('./blobStore.js').ProStore} store
 * @returns {Promise<{ ok: true, payload: object, email: string } | { ok: false, error: string }>}
 */
async function verifyAuthSession(token, secret, store) {
  const payload = verifyJwt(token, secret);
  if (!payload || payload.typ !== 'mdr-auth' || typeof payload.sub !== 'string') {
    return { ok: false, error: 'unauthorized' };
  }

  const email = normalizeEmail(payload.sub);
  if (!email) {
    return { ok: false, error: 'unauthorized' };
  }

  let user;
  try {
    user = await store.get(verifiedUserKey(email), { type: 'json' });
  } catch (_) {
    user = null;
  }
  if (!user) {
    return { ok: false, error: 'unauthorized' };
  }

  if (!sessionVersionMatches(payload, user)) {
    return { ok: false, error: 'session_revoked' };
  }

  return { ok: true, payload, email };
}

module.exports = {
  bumpSessionVersion,
  verifyAuthSession,
  readSessionVersion,
  sessionVersionMatches,
};
