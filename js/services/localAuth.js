const LS_USER = 'mdr-local-user-v1';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u || typeof u !== 'object') return null;
    return u;
  } catch (_) {
    return null;
  }
}

/**
 * @param {{ name: string, email: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export function registerLocalUser({ name, email, password }, opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const msg = {
    incomplete:
      lang === 'en'
        ? 'Please enter name, email and password.'
        : 'Complete nombre, email y contrase\u00f1a.',
    email: lang === 'en' ? 'Invalid email address.' : 'Email inv\u00e1lido.',
    pw:
      lang === 'en'
        ? 'Password must be at least 6 characters.'
        : 'La contrase\u00f1a debe tener al menos 6 caracteres.',
  };

  const nm = String(name || '').trim();
  const em = String(email || '').trim().toLowerCase();
  const pw = String(password || '');
  if (!nm || !em || !pw) throw new Error(msg.incomplete);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) throw new Error(msg.email);
  if (pw.length < 6) throw new Error(msg.pw);
  const user = {
    id: `u_${Date.now()}`,
    name: nm,
    email: em,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  } catch (_) {
    /* ignore */
  }
  return user;
}

export function clearLocalUser() {
  try {
    localStorage.removeItem(LS_USER);
  } catch (_) {
    /* ignore */
  }
}
