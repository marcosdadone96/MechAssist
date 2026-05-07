/**
 * Freemium UI: auth modal, tab switching, Escape, local register/login.
 */

import { registerLocalUser, loginLocalUser } from '../services/localAuth.js';

const AUTH_TAB_LOGIN = 'login';
const AUTH_TAB_REGISTER = 'register';

/** @type {HTMLElement | null} */
let openModalEl = null;
/** @type {HTMLElement | null} */
let lastFocus = null;

/** Relative URL or path to open after successful auth (from opener `data-auth-next`). */
let pendingAuthNext = '';

function getModal(id) {
  return document.getElementById(`ma-modal-${id}`);
}

function modalLang() {
  return window.__homeLang === 'en' ? 'en' : 'es';
}

function getAuthErrorEl() {
  return document.getElementById('ma-auth-error');
}

function clearAuthFormError() {
  const errEl = getAuthErrorEl();
  if (errEl instanceof HTMLElement) {
    errEl.hidden = true;
    errEl.textContent = '';
  }
}

function showAuthFormError(message) {
  const errEl = getAuthErrorEl();
  if (!(errEl instanceof HTMLElement)) {
    window.alert(message);
    return;
  }
  errEl.textContent = message;
  errEl.hidden = false;
}

function finishAuthSuccess() {
  const next = pendingAuthNext.trim();
  pendingAuthNext = '';
  clearAuthFormError();
  closeModal();
  if (next) {
    try {
      const url = new URL(next, window.location.href);
      window.location.assign(url.href);
    } catch (_) {
      window.location.assign(next);
    }
  } else {
    window.location.reload();
  }
}

function setAuthTab(tab) {
  clearAuthFormError();
  const modal = getModal('auth');
  if (!modal) return;
  const t = tab === AUTH_TAB_REGISTER ? AUTH_TAB_REGISTER : AUTH_TAB_LOGIN;
  modal.querySelectorAll('.ma-auth__tab').forEach((btn) => {
    const on = btn.getAttribute('data-tab') === t;
    btn.classList.toggle('ma-auth__tab--active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  modal.querySelectorAll('.ma-auth__panel').forEach((panel) => {
    const panelTab = panel.getAttribute('data-panel');
    panel.hidden = panelTab !== t;
  });
}

function isFocusable(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hasAttribute('disabled')) return false;
  if (el.tabIndex < 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function focusFirstInModal(modal) {
  const focusables = [
    ...modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(isFocusable);
  const first = focusables[0];
  if (first instanceof HTMLElement) first.focus();
}

function openModal(id, opts = {}) {
  const modal = getModal(id);
  if (!(modal instanceof HTMLElement)) return;
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.hidden = false;
  openModalEl = modal;
  document.body.style.overflow = 'hidden';

  if (id === 'auth') {
    clearAuthFormError();
    const tab = opts.authTab === AUTH_TAB_REGISTER ? AUTH_TAB_REGISTER : AUTH_TAB_LOGIN;
    setAuthTab(tab);
    focusFirstInModal(modal);
  }
}

function closeModal() {
  if (!(openModalEl instanceof HTMLElement)) return;
  openModalEl.hidden = true;
  openModalEl = null;
  document.body.style.overflow = '';
  if (lastFocus instanceof HTMLElement) {
    lastFocus.focus();
    lastFocus = null;
  }
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof Element)) return;

  const tabBtn = t.closest('.ma-auth__tab');
  if (tabBtn && openModalEl?.id === 'ma-modal-auth') {
    const tab = tabBtn.getAttribute('data-tab');
    if (tab) setAuthTab(tab);
    return;
  }

  const opener = t.closest('[data-ma-modal-open]');
  if (opener) {
    const id = opener.getAttribute('data-ma-modal-open');
    if (!id) return;
    e.preventDefault();
    const authTab = opener.getAttribute('data-auth-tab');
    const next = opener.getAttribute('data-auth-next');
    pendingAuthNext = next != null && next !== '' ? next.trim() : '';
    openModal(id, { authTab });
    return;
  }

  const authSubmit =
    openModalEl?.id === 'ma-modal-auth' ? t.closest('#ma-modal-auth .ma-auth__submit') : null;
  if (authSubmit instanceof HTMLElement) {
    e.preventDefault();
    const panel = authSubmit.closest('.ma-auth__panel');
    const panelKind = panel instanceof HTMLElement ? panel.getAttribute('data-panel') : null;
    const lang = modalLang();
    try {
      if (panelKind === AUTH_TAB_REGISTER) {
        const nameEl = document.getElementById('ma-auth-reg-name');
        const emailEl = document.getElementById('ma-auth-reg-email');
        const passEl = document.getElementById('ma-auth-reg-pass');
        registerLocalUser(
          {
            name: nameEl instanceof HTMLInputElement ? nameEl.value : '',
            email: emailEl instanceof HTMLInputElement ? emailEl.value : '',
            password: passEl instanceof HTMLInputElement ? passEl.value : '',
          },
          { lang },
        );
      } else {
        const emailEl = document.getElementById('ma-auth-login-email');
        const passEl = document.getElementById('ma-auth-login-pass');
        loginLocalUser(
          {
            email: emailEl instanceof HTMLInputElement ? emailEl.value : '',
            password: passEl instanceof HTMLInputElement ? passEl.value : '',
          },
          { lang },
        );
      }
      finishAuthSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showAuthFormError(msg);
    }
    return;
  }

  if (t.closest('[data-ma-modal-close]') && openModalEl) {
    e.preventDefault();
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openModalEl) {
    e.preventDefault();
    closeModal();
  }
});

window.addEventListener('home-language-changed', () => {
  if (typeof window.__t !== 'function') return;
  document.querySelectorAll('#ma-modal-auth [data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const txt = window.__t(key);
    if (!txt || txt === key) return;
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) el.setAttribute(attr, txt);
    else el.textContent = txt;
  });
});
