'use strict';
/**
 * Rate limiting simple con Netlify Blobs.
 * Máx. MAX_ATTEMPTS intentos en WINDOW_MS; bloqueo LOCKOUT_MS tras exceder.
 */
const { connectLambda, getStore } = require('@netlify/blobs');

const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000; // 15 min ventana
const LOCKOUT_MS   = 30 * 60 * 1000; // 30 min bloqueo

const STORE = 'mechassist-ratelimit';

/**
 * @param {import('@netlify/functions').HandlerEvent} event
 * @param {string} key  — clave única: ej. "login:user@email.com"
 * @returns {Promise<{ allowed: boolean, retryAfterSecs?: number }>}
 */
async function checkRateLimit(event, key) {
  try {
    connectLambda(event);
    const store = getStore(STORE);
    const blobKey = `rl:${key}`;
    let rec;
    try { rec = await store.get(blobKey, { type: 'json' }); } catch (_) { rec = null; }

    const now = Date.now();
    if (!rec) rec = { attempts: 0, windowStart: now, lockedUntil: 0 };

    // Bloqueo activo
    if (rec.lockedUntil > now) {
      const secs = Math.ceil((rec.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSecs: secs };
    }

    // Resetear ventana si expiró
    if (now - rec.windowStart > WINDOW_MS) {
      rec = { attempts: 0, windowStart: now, lockedUntil: 0 };
    }

    rec.attempts += 1;
    if (rec.attempts >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
    }
    await store.setJSON(blobKey, rec).catch(() => {});

    if (rec.lockedUntil > now) {
      const secs = Math.ceil(LOCKOUT_MS / 1000);
      return { allowed: false, retryAfterSecs: secs };
    }
    return { allowed: true };
  } catch (_) {
    // Si Blobs falla, dejar pasar (no bloquear al usuario por error de infraestructura)
    return { allowed: true };
  }
}

/**
 * Resetea el contador para una clave (llamar tras login exitoso).
 * @param {import('@netlify/functions').HandlerEvent} event
 * @param {string} key
 */
async function resetRateLimit(event, key) {
  try {
    connectLambda(event);
    const store = getStore(STORE);
    await store.delete(`rl:${key}`).catch(() => {});
  } catch (_) { /* ignorar */ }
}

module.exports = { checkRateLimit, resetRateLimit };
