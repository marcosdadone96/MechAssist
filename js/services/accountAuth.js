/**
 * Cuenta: registro con verificaciùn e inicio de sesiùn en servidor (Netlify),
 * o registro local previo si `useServerAuth` es false.
 */
import { FEATURES } from '../config/features.js';
import {
  registerLocalUser,
  loginLocalUser,
  persistServerSession,
  getCurrentUser,
} from './localAuth.js';

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
    bad_credentials: 'Correo o contrase\u00f1a incorrectos.',
    not_verified: 'Primero debe confirmar el enlace del correo.',
    json: 'Petici\u00f3n inv\u00e1lida.',
    default: 'No se pudo iniciar sesi\u00f3n.',
  };
  const en = {
    incomplete: 'Enter email and password.',
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
    return registerLocalUser(fields, opts);
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
    return loginLocalUser(fields, opts);
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
  persistServerSession({
    name: data.user?.name,
    email: data.user?.email,
    authToken: data.token,
  });
  return getCurrentUser();
}

export { getCurrentUser, clearLocalUser } from './localAuth.js';
