/**
 * Formulario de sugerencias (Netlify Forms). Envo por fetch para mostrar gracias sin salir de la pgina.
 */

import { HOME_LANG_CHANGED_EVENT } from '../config/locales.js';

function syncDocTitle() {
  const t = window.__t;
  if (typeof t === 'function') {
    const title = t('feedback.docTitle');
    if (title && title !== 'feedback.docTitle') document.title = title;
  }
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

    try {
      const fd = new FormData(form);
      const body = new URLSearchParams(fd);
      const action = form.getAttribute('action') || '/';
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error('bad status');

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
