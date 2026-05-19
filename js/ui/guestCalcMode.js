/**
 * Visitantes sin cuenta: solo lectura en calculadoras (lab, m\u00e1quinas, hidr\u00e1ulica).
 */
import { isPromoEmbed } from '../util/promoMode.js';
import { getCurrentUser } from '../services/localAuth.js';
import { showCreditsModal } from './creditsUi.js';
import { findCalcInputsRoot, lockCalcInputs } from './calcInputLock.js';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

function registerUrl() {
  const file = location.pathname.split('/').pop() || '';
  const next = file ? `?next=${encodeURIComponent(file)}` : '';
  return `register.html${next}`;
}

export function isGuestCalcModeActive() {
  return document.documentElement.hasAttribute('data-guest-calc');
}

/**
 * @param {HTMLElement} root
 */
function mountGuestBanner(root) {
  if (document.getElementById('guest-calc-banner')) return;
  const en = langEn();
  const bar = document.createElement('div');
  bar.id = 'guest-calc-banner';
  bar.className = 'guest-calc-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = en
    ? `<p><strong>View only.</strong> You can see fields and results. <a href="${registerUrl()}">Sign in or register</a> to edit values, save and export PDF.</p>`
    : `<p><strong>Solo lectura.</strong> Puede ver campos y resultados. <a href="${registerUrl()}">Inicie sesi\u00f3n o reg\u00edstrese</a> para editar, guardar y exportar PDF.</p>`;
  const head = root.querySelector('.lab-calc-page-head, .flat-sidebar__head, section.panel h2');
  if (head?.parentElement) {
    head.parentElement.insertBefore(bar, head.nextSibling);
  } else {
    root.prepend(bar);
  }
}

function showGuestRegisterModal() {
  const en = langEn();
  showCreditsModal({
    title: en ? 'Sign in to edit' : 'Inicie sesi\u00f3n para editar',
    body: en
      ? 'This calculator is view-only for guests. Create a free account or sign in to change values and save your work.'
      : 'Esta calculadora es solo lectura para visitantes. Cree una cuenta gratuita o inicie sesi\u00f3n para cambiar valores y guardar.',
    primaryLabel: en ? 'Sign in / Register' : 'Entrar / Registrarse',
    primaryHref: registerUrl(),
    secondaryLabel: en ? 'Continue viewing' : 'Seguir viendo',
    onSecondary: () => {},
  });
}

function isAuthAccountPage() {
  const file = (location.pathname.split('/').pop() || '').toLowerCase();
  if (file === 'register.html' || file === 'checkout.html') return true;
  return Boolean(
    document.querySelector('main.register-page, main.checkout-page, #registerForm, #registerLoginForm'),
  );
}

function isHubBrowsePage() {
  return Boolean(document.querySelector('main.lab-main #lab-hub-root'));
}

/** @type {MutationObserver | null} */
let guestLockObserver = null;

function applyGuestInputLock() {
  if (!isGuestCalcModeActive()) return;
  const root =
    document.querySelector('main.lab-main') ||
    document.querySelector('main.app-main') ||
    document.querySelector('main');
  if (!(root instanceof HTMLElement)) return;
  const inputsRoot = findCalcInputsRoot() || root;
  lockCalcInputs(inputsRoot, { allowPresets: false, useDisabled: true });
}

/**
 * Inicializa modo visitante en calculadoras y m\u00e1quinas.
 */
export function initGuestCalcMode() {
  if (isPromoEmbed()) return;
  if (getCurrentUser()?.email) return;
  if (isAuthAccountPage()) return;
  if (isHubBrowsePage()) return;

  const root =
    document.querySelector('main.lab-main') ||
    document.querySelector('main.app-main') ||
    document.querySelector('main');
  if (!(root instanceof HTMLElement)) return;

  document.documentElement.setAttribute('data-guest-calc', '1');
  mountGuestBanner(root);
  applyGuestInputLock();

  const inputsRoot = findCalcInputsRoot() || root;
  if (!inputsRoot.dataset.guestFocusWired) {
    inputsRoot.dataset.guestFocusWired = '1';
    inputsRoot.addEventListener(
      'focusin',
      (ev) => {
        const t = ev.target;
        if (!(t instanceof HTMLElement)) return;
        if (!t.matches('input, select, textarea, button')) return;
        if (t.closest('[data-guest-allow]')) return;
        if (t.classList.contains('calc-input-locked') || t.disabled) {
          showGuestRegisterModal();
          t.blur();
        }
      },
      true,
    );
  }

  if (!guestLockObserver) {
    guestLockObserver = new MutationObserver(() => {
      applyGuestInputLock();
    });
    guestLockObserver.observe(root, { childList: true, subtree: true });
  }
}

export function syncGuestInputLock() {
  applyGuestInputLock();
}
