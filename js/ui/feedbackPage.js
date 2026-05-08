/**
 * Sugerencias: 1) función Netlify email-feedback (Resend), 2) Web3Forms si hay clave en features,
 * 3) Netlify Forms (POST a /feedback.html y, si falla, a /).
 */

import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';
import { FEATURES } from '../config/features.js';

function syncDocTitle() {
  const t = window.__t;
  if (typeof t === 'function') {
    const title = t('feedback.docTitle');
    if (title && title !== 'feedback.docTitle') document.title = title;
  }
}

/**
 * @param {HTMLFormElement} form
 */
function resolveFormsPostUrl(form) {
  const raw = (form.getAttribute('action') || '/feedback.html').trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  try {
    return new URL(raw, window.location.origin).href;
  } catch {
    return raw;
  }
}

/**
 * @param {HTMLFormElement} form
 */
async function submitViaEmailFunction(form) {
  const fd = new FormData(form);
  const payload = {
    message: fd.get('message'),
    name: fd.get('name'),
    email: fd.get('email'),
    context: fd.get('context'),
    botField: fd.get('bot-field'),
  };
  const url = `${window.location.origin}/.netlify/functions/email-feedback`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

/**
 * Envío independiente del hosting (requiere clave en features.js).
 * @param {HTMLFormElement} form
 * @param {string} accessKey
 */
async function submitViaWeb3Forms(form, accessKey) {
  const fd = new FormData(form);
  const message = String(fd.get('message') || '').trim();
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const context = String(fd.get('context') || '').trim();
  const lines = [message];
  if (context) lines.push('', `Contexto / referrer: ${context}`);
  const payload = {
    access_key: accessKey,
    subject: '[TheMechAssist] Sugerencia',
    message: lines.join('\n'),
    from_name: name || 'Anónimo',
  };
  if (email) payload.email = email;

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return res.ok && data.success === true;
}

/**
 * Netlify Forms: mismo cuerpo en la acción del form y, si falla, en la raíz del sitio.
 * @param {HTMLFormElement} form
 */
async function submitViaNetlifyForms(form) {
  const fd = new FormData(form);
  const body = new URLSearchParams(fd).toString();
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const primary = resolveFormsPostUrl(form);
  const fallbackRoot = new URL('/', window.location.origin).href;

  let res = await fetch(primary, { method: 'POST', headers, body });
  if (res.ok) return res;

  if (primary !== fallbackRoot) {
    res = await fetch(fallbackRoot, { method: 'POST', headers, body });
  }
  return res;
}

function mountFeedbackPage() {
  syncDocTitle();
  window.addEventListener(HOME_LANG_CHANGED_EVENT, syncDocTitle);

  const form = document.getElementById('feedback-form');
  const thanks = document.getElementById('feedback-thanks');
  const errBox = document.getElementById('feedback-error');
  const ctx = form?.querySelector('[name="context"]');

  if (ctx && !ctx.value) {
    try {
      ctx.value = document.referrer || '(directo)';
    } catch (_) {
      ctx.value = '';
    }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (thanks instanceof HTMLElement) thanks.hidden = true;
    if (errBox instanceof HTMLElement) errBox.hidden = true;

    const btn = form.querySelector('[type="submit"]');
    if (btn instanceof HTMLButtonElement) btn.disabled = true;

    const showFileProtocolError = () => {
      const t = typeof window.__t === 'function' ? window.__t : () => '';
      const msg = t('feedback.errorFile');
      if (errBox instanceof HTMLElement) {
        errBox.textContent =
          msg && msg !== 'feedback.errorFile'
            ? msg
            : 'Abre esta página desde la web publicada (no desde un archivo local).';
        errBox.hidden = false;
      }
    };

    if (window.location.protocol === 'file:') {
      showFileProtocolError();
      if (btn instanceof HTMLButtonElement) btn.disabled = false;
      return;
    }

    try {
      let sent = false;

      const w3key =
        typeof FEATURES.feedbackWeb3FormsAccessKey === 'string'
          ? FEATURES.feedbackWeb3FormsAccessKey.trim()
          : '';

      /** Si hay clave Web3Forms, enviar primero (evita esperar a Netlify/Resend). */
      if (w3key) {
        sent = await submitViaWeb3Forms(form, w3key);
      }

      if (!sent) {
        try {
          const fnRes = await submitViaEmailFunction(form);
          if (fnRes.ok) sent = true;
        } catch (_) {
          /* función no desplegada o red */
        }
      }

      if (!sent) {
        const res = await submitViaNetlifyForms(form);
        if (!res.ok) throw new Error('bad status');
      }

      if (thanks instanceof HTMLElement) thanks.hidden = false;
      form.reset();
      if (ctx) {
        try {
          ctx.value = document.referrer || '(directo)';
        } catch (_) {
          ctx.value = '';
        }
      }
    } catch {
      if (errBox instanceof HTMLElement) errBox.hidden = false;
    } finally {
      if (btn instanceof HTMLButtonElement) btn.disabled = false;
    }
  });
}

mountFeedbackPage();
