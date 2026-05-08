/**
 * GET con ?token=  activa la cuenta y redirige a register.html
 */

const { getProStore } = require('./lib/blobStore.js');
const { normalizeEmail } = require('./lib/proEntitlementLogic.js');
const { pendingTokenKey, pendingIndexKey, verifiedUserKey } = require('./lib/authBlobKeys.js');

const HOURS_VALID = 48;

function redirect(pathAndQuery) {
  return {
    statusCode: 302,
    headers: { Location: pathAndQuery },
    body: '',
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token =
    event.queryStringParameters?.token ||
    new URLSearchParams(event.rawQuery || '').get('token') ||
    '';

  if (!token) {
    return redirect('/register.html?verify=missing');
  }

  const store = getProStore(event);
  const tk = pendingTokenKey(token);
  let pending;
  try {
    pending = await store.get(tk, { type: 'json' });
  } catch (_) {
    pending = null;
  }

  if (!pending) {
    return redirect('/register.html?verify=invalid');
  }

  const email = normalizeEmail(pending.email);
  const created = new Date(pending.createdAt || 0).getTime();
  if (!email || !pending.passwordHash || Number.isNaN(created)) {
    return redirect('/register.html?verify=invalid');
  }

  const ageMs = Date.now() - created;
  if (ageMs > HOURS_VALID * 3600000) {
    await store.delete(tk).catch(() => {});
    await store.delete(pendingIndexKey(email)).catch(() => {});
    return redirect('/register.html?verify=expired');
  }

  await store.setJSON(verifiedUserKey(email), {
    name: String(pending.name || '').trim().slice(0, 120),
    email,
    passwordHash: pending.passwordHash,
    verifiedAt: new Date().toISOString(),
  });
  await store.delete(tk).catch(() => {});
  await store.delete(pendingIndexKey(email)).catch(() => {});

  return redirect('/register.html?verified=1');
};
