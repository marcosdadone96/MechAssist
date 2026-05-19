/**
 * Cuenta: registro con verificaci?n e inicio de sesi?n en servidor (Netlify),
 * o registro local previo si `useServerAuth` es false.
 */
import { FEATURES } from '../config/features.js';
import {
  registerLocalUser,
  loginLocalUser,
  persistServerSession,
  getCurrentUser,
} from './localAuth.js';
import { syncSupabaseSessionFromNetlifyJwt } from './supabaseSessionSync.js';

function fnBase() {
  return `${window.location.origin}/.netlify/functions`;
}

/**
 * @param {string} code
 * @param {'es'|'en'} lang
 */
function mapRegisterError(code, lang) {
  const es = {
    incomplete: 'Complete nombre, email y contrase\u00f1a.',
    email: 'Email inv\u00e1lido.',
    password_short: 'La contrase\u00f1a debe tener al menos 8 caracteres.',
    already_registered: 'Este correo ya est\u00e1 registrado.',
    misconfigured_secret: 'Cuenta: falta configuraci\u00f3n en el servidor (AUTH_JWT_SECRET).',
    misconfigured_resend: 'Cuenta: falta correo en el servidor (RESEND_API_KEY).',
    misconfigured_from: 'Cuenta: falta remitente en el servidor (AUTH_MAIL_FROM).',
    mail_failed: 'No se pudo enviar el correo de verificaci\u00f3n.',
    json: 'Error en la petici\u00f3n.',
    default: 'No se pudo completar el registro.',
  };
  const en = {
    incomplete: 'Please enter name, email and password.',
    email: 'Invalid email.',
    password_short: 'Password must be at least 8 characters.',
    already_registered: 'This email is already registered.',
    misconfigured_secret: 'Server misconfiguration (AUTH_JWT_SECRET).',
    misconfigured_resend: 'Server misconfiguration (RESEND_API_KEY).',
    misconfigured_from: 'Server misconfiguration (AUTH_MAIL_FROM).',
    mail_failed: 'Could not send the verification email.',
    json: 'Invalid request.',
    default: 'Registration could not be completed.',
  };
  const t = lang === 'en' ? en : es;
  return t[code] || t.default;
}

/**
 * @param {string} code
 * @param {'es'|'en'} lang
 */
function mapLoginError(code, lang) {
  const es = {
    incomplete: 'Introduzca correo y contrase\u00f1a.',
    rate_limited: 'Demasiados intentos. Espere 30 minutos e int?ntelo de nuevo.',
    bad_credentials: 'Correo o contrase\u00f1a incorrectos.',
    not_verified: 'Primero debe confirmar el enlace del correo.',
    json: 'Petici\u00f3n inv\u00e1lida.',
    default: 'No se pudo iniciar sesi\u00f3n.',
  };
  const en = {
    incomplete: 'Enter email and password.',
    rate_limited: 'Too many attempts. Please wait 30 minutes and try again.',
    bad_credentials: 'Incorrect email or password.',
    not_verified: 'Please confirm your email link first.',
    json: 'Invalid request.',
    default: 'Could not sign in.',
  };
  const t = lang === 'en' ? en : es;
  return t[code] || t.default;
}

/**
 * @param {{ name: string, email: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 * @returns {Promise<object>}
 */
export async function registerAccount(fields, opts = {}) {
  if (!FEATURES.useServerAuth) {
    return await registerLocalUser(fields, opts);
  }
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const res = await fetch(`${fnBase()}/auth-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: fields.name,
      email: fields.email,
      password: fields.password,
      lang,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(mapRegisterError(data.error || 'default', lang));
  }
  return { pendingVerification: true, ...data };
}

/**
 * @param {{ email: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export async function loginAccount(fields, opts = {}) {
  if (!FEATURES.useServerAuth) {
    return await loginLocalUser(fields, opts);
  }
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const res = await fetch(`${fnBase()}/auth-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: fields.email,
      password: fields.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(mapLoginError(data.error || 'default', lang));
  }
  const user = persistServerSession({
    name: data.user?.name,
    email: data.user?.email,
    authToken: data.token,
  });
  if (!user?.email || !user?.authToken) {
    throw new Error(
      lang === 'en'
        ? 'Could not save your session. Try again or use register.html.'
        : 'No se pudo guardar la sesi\u00f3n. Int\u00e9ntelo de nuevo o use register.html.',
    );
  }
  if (FEATURES.useSupabaseRLS) {
    await syncSupabaseSessionFromNetlifyJwt();
  }
  return user;
}

/**
 * @param {string} code
 * @param {'es'|'en'} lang
 */
function mapPasswordResetError(code, lang) {
  const es = {
    email: 'Email inv\u00e1lido.',
    incomplete: 'Introduzca el correo.',
    rate_limited: 'Demasiados intentos. Espere unos minutos e int\u00e9ntelo de nuevo.',
    mail_failed: 'No se pudo enviar el correo de restablecimiento.',
    misconfigured_resend: 'Cuenta: falta configuraci\u00f3n en el servidor (RESEND_API_KEY).',
    misconfigured_from: 'Cuenta: falta remitente en el servidor (AUTH_MAIL_FROM).',
    json: 'Error en la petici\u00f3n.',
    default: 'No se pudo enviar el correo.',
  };
  const en = {
    email: 'Invalid email.',
    incomplete: 'Please enter your email',
    rate_limited: 'Too many attempts. Please wait a few minutes and try again.',
    mail_failed: 'Could not send the reset email.',
    misconfigured_resend: 'Server misconfiguration (RESEND_API_KEY).',
    misconfigured_from: 'Server misconfiguration (AUTH_MAIL_FROM).',
    json: 'Invalid request.',
    default: 'Could not send the reset email.',
  };
  const t = lang === 'en' ? en : es;
  return t[code] || t.default;
}

/**
 * @param {string} code
 * @param {'es'|'en'} lang
 */
function mapPasswordCompleteError(code, lang) {
  const es = {
    incomplete: 'Introduzca la nueva contrase\u00f1a.',
    password_short: 'La contrase\u00f1a debe tener al menos 8 caracteres.',
    invalid_token: 'El enlace no es v\u00e1lido o ya se us\u00f3.',
    expired_token: 'El enlace ha caducado. Solicite uno nuevo.',
    rate_limited: 'Demasiados intentos. Espere unos minutos.',
    json: 'Petici\u00f3n inv\u00e1lida.',
    default: 'No se pudo actualizar la contrase\u00f1a.',
  };
  const en = {
    incomplete: 'Enter your new password.',
    password_short: 'Password must be at least 8 characters.',
    invalid_token: 'This link is invalid or was already used.',
    expired_token: 'This link has expired. Please request a new one.',
    rate_limited: 'Too many attempts. Please wait a few minutes.',
    json: 'Invalid request.',
    default: 'Could not update your password.',
  };
  const t = lang === 'en' ? en : es;
  return t[code] || t.default;
}

/**
 * @param {{ email: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export async function requestPasswordReset(fields, opts = {}) {
  if (!FEATURES.useServerAuth) {
    const lang = opts.lang === 'en' ? 'en' : 'es';
    throw new Error(
      lang === 'en'
        ? 'Password reset is not available in local demo mode.'
        : 'El restablecimiento no est\u00e1 disponible en el modo demo local.',
    );
  }
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const email = String(fields.email || '').trim();
  if (!email) {
    throw new Error(mapPasswordResetError('incomplete', lang));
  }
  const res = await fetch(`${fnBase()}/auth-password-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(mapPasswordResetError(data.error || 'default', lang));
  }
  return { ok: true, ...data };
}

/**
 * @param {{ token: string, password: string }} fields
 * @param {{ lang?: 'es'|'en' }} [opts]
 */
export async function completePasswordReset(fields, opts = {}) {
  if (!FEATURES.useServerAuth) {
    const lang = opts.lang === 'en' ? 'en' : 'es';
    throw new Error(
      lang === 'en'
        ? 'Password reset is not available in local demo mode.'
        : 'El restablecimiento no est\u00e1 disponible en el modo demo local.',
    );
  }
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const res = await fetch(`${fnBase()}/auth-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: fields.token,
      password: fields.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(mapPasswordCompleteError(data.error || 'default', lang));
  }
  return { ok: true, ...data };
}

export { getCurrentUser, clearLocalUser } from './localAuth.js';
