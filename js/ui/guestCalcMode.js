/**
 * Visitantes sin cuenta: solo lectura en calculadoras (lab, máquinas, hidráulica).
 */
import { isPromoEmbed } from '../util/promoMode.js';
import { getCurrentUser } from '../services/localAuth.js';
import { showCreditsModal } from './creditsUi.js';
import { findCalcInputsRoot, lockCalcInputs } from './calcInputLock.js';
import { getCurrentLang } from '../config/locales.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';

const GUEST_ES = {
  bannerHtml:
    '<p><strong>Solo lectura.</strong> Puede ver campos y resultados. <a href="{registerUrl}">Inicie sesión o regístrese</a> para editar, guardar y exportar PDF.</p>',
  modalTitle: 'Inicie sesión para editar',
  modalBody:
    'Esta calculadora es solo lectura para visitantes. Cree una cuenta gratuita o inicie sesión para cambiar valores y guardar.',
  modalPrimary: 'Entrar / Registrarse',
  modalSecondary: 'Seguir viendo',
};

function hubCopy() {
  const en = getCurrentLang() === 'en';
  return {
    bannerHtml: (en ? MACHINE_HUB_UX_EN['machineHub.guestBannerHtml'] : GUEST_ES.bannerHtml).replace(
      '{registerUrl}',
      registerUrl(),
    ),
    modalTitle: en ? MACHINE_HUB_UX_EN['machineHub.guestModalTitle'] : GUEST_ES.modalTitle,
    modalBody: en ? MACHINE_HUB_UX_EN['machineHub.guestModalBody'] : GUEST_ES.modalBody,
    modalPrimary: en ? MACHINE_HUB_UX_EN['machineHub.guestModalPrimary'] : GUEST_ES.modalPrimary,
    modalSecondary: en ? MACHINE_HUB_UX_EN['machineHub.guestModalSecondary'] : GUEST_ES.modalSecondary,
  };
}

function registerUrl() {
  const file = location.pathname.split('/').pop() || '';
  const next = file ? `?next=${encodeURIComponent(file)}` : '';
  return `register.html${next}`;
}

export function isGuestCalcModeActive() {
  return document.documentElement.hasAttribute('data-guest-calc');
}

function refreshGuestBanner() {
  const bar = document.getElementById('guest-calc-banner');
  if (!bar) return;
  bar.innerHTML = hubCopy().bannerHtml;
}

/**
 * @param {HTMLElement} root
 */
function mountGuestBanner(root) {
  if (document.getElementById('guest-calc-banner')) {
    refreshGuestBanner();
    return;
  }
  const bar = document.createElement('div');
  bar.id = 'guest-calc-banner';
  bar.className = 'guest-calc-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = hubCopy().bannerHtml;
  const head = root.querySelector('.lab-calc-page-head, .flat-sidebar__head, section.panel h2');
  if (head?.parentElement) {
    head.parentElement.insertBefore(bar, head.nextSibling);
  } else {
    root.prepend(bar);
  }
}

function showGuestRegisterModal() {
  const c = hubCopy();
  showCreditsModal({
    title: c.modalTitle,
    body: c.modalBody,
    primaryLabel: c.modalPrimary,
    primaryHref: registerUrl(),
    secondaryLabel: c.modalSecondary,
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
 * Inicializa modo visitante en calculadoras y máquinas.
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

  if (!document.documentElement.dataset.guestLangWired) {
    document.documentElement.dataset.guestLangWired = '1';
    const onLang = () => refreshGuestBanner();
    window.addEventListener('lab-language-changed', onLang);
    window.addEventListener('home-language-changed', onLang);
  }
}

export function syncGuestInputLock() {
  applyGuestInputLock();
}
