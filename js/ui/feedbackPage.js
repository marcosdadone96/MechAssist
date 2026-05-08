/**
 * Sugerencias: intento vía función Netlify `email-feedback` (Resend) si está configurada;
 * si no, Netlify Forms (POST a la página del formulario).
 */

import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';

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
 * @param {HTMLFormElement} form
 */
async function submitViaNetlifyForms(form) {
  const fd = new FormData(form);
  const body = new URLSearchParams(fd);
  const postUrl = resolveFormsPostUrl(form);
  return fetch(postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
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

      try {
        const fnRes = await submitViaEmailFunction(form);
        if (fnRes.ok) {
          sent = true;
        }
      } catch (_) {
        /* red o función no desplegada: seguir con Forms */
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
