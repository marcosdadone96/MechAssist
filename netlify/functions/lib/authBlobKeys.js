/**
 * Claves Blobs para cuentas (prefijo auth:).
 */

const { emailBlobKey, normalizeEmail } = require('./proEntitlementLogic.js');

function pendingTokenKey(token) {
  return `auth:tok:${String(token || '').trim()}`;
}

function pendingIndexKey(email) {
  const n = normalizeEmail(email);
  return `auth:idx:pend:${emailBlobKey(n)}`;
}

function verifiedUserKey(email) {
  const n = normalizeEmail(email);
  return `auth:u:${emailBlobKey(n)}`;
}

function resetTokenKey(token) {
  return `auth:rst:${String(token || '').trim()}`;
}

function resetIndexKey(email) {
  const n = normalizeEmail(email);
  return `auth:idx:rst:${emailBlobKey(n)}`;
}

module.exports = {
  pendingTokenKey,
  pendingIndexKey,
  verifiedUserKey,
  resetTokenKey,
  resetIndexKey,
};
