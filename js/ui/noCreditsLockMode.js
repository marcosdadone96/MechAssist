/**
 * Bloquea edicion cuando el saldo del hub no alcanza para una sesion de calculo.
 */
import { isCreditsSystemEnabled } from '../config/credits.js';
import { shouldLockCalcInputsForCredits } from '../services/creditSession.js';
import { getCurrentUser } from '../services/localAuth.js';
import { showNoCreditsModal } from './creditsUi.js';
import { findCalcInputsRoot, lockCalcInputs, unlockCalcInputs } from './calcInputLock.js';
import { getCurrentLang } from '../config/locales.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';

const CREDITS_CHANGED = 'mdr-credits-changed';
let focusWired = false;

const NO_CREDITS_ES = {
  bannerHtml:
    '<p><strong>Sin créditos.</strong> Puede ver todos los campos y resultados; los datos están en solo lectura. Recargue créditos para volver a editar. <a href="{checkoutUrl}">Ver planes</a></p>',
};

function noCreditsBannerHtml() {
  const en = getCurrentLang() === 'en';
  const tpl = en ? MACHINE_HUB_UX_EN['machineHub.noCreditsBannerHtml'] : NO_CREDITS_ES.bannerHtml;
  return tpl.replace('{checkoutUrl}', 'checkout.html');
}

function refreshNoCreditsBanner() {
  const bar = document.getElementById('no-credits-lock-banner');
  if (bar) bar.innerHTML = noCreditsBannerHtml();
}

/**
 * @param {HTMLElement} root
 */
function mountNoCreditsBanner(root) {
  if (document.getElementById('no-credits-lock-banner')) {
    refreshNoCreditsBanner();
    return;
  }
  const bar = document.createElement('div');
  bar.id = 'no-credits-lock-banner';
  bar.className = 'no-credits-lock-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = noCreditsBannerHtml();
  const head = root.querySelector('.lab-calc-page-head, .flat-sidebar__head, section.panel h2, .lab-calc-layout__inputs');
  if (head instanceof HTMLElement && head.parentElement) {
    head.parentElement.insertBefore(bar, head.nextSibling);
  } else {
    root.prepend(bar);
  }
}

function removeNoCreditsBanner() {
  document.getElementById('no-credits-lock-banner')?.remove();
}

function isBillingOrAuthPage() {
  const file = (location.pathname.split('/').pop() || '').toLowerCase();
  if (file === 'checkout.html' || file === 'register.html') return true;
  return Boolean(document.querySelector('main.checkout-page, main.register-page'));
}

function isHubBrowsePage() {
  const file = (location.pathname.split('/').pop() || '').toLowerCase();
  return (
    file === '' ||
    file === 'index.html' ||
    file === 'machines-hub.html' ||
    file === 'transmission-lab.html' ||
    file === 'fluids-hub.html'
  );
}

function clearNoCreditsLockFromDocument() {
  document.documentElement.removeAttribute('data-no-credits-lock');
  document.querySelectorAll('main').forEach((main) => {
    if (main instanceof HTMLElement) unlockCalcInputs(main);
  });
  removeNoCreditsBanner();
}

function wireNoCreditsFocusBlock(root) {
  if (focusWired) return;
  focusWired = true;
  root.addEventListener(
    'focusin',
    (ev) => {
      if (!document.documentElement.hasAttribute('data-no-credits-lock')) return;
      const t = ev.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches('input, select, textarea, button')) return;
      if (t.classList.contains('calc-input-locked') || t.disabled) {
        showNoCreditsModal();
        t.blur();
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    true,
  );
}

/** Aplica o quita bloqueo segun saldo cacheado del hub actual. */
export function syncNoCreditsInputLock() {
  if (!isCreditsSystemEnabled()) return;
  if (!getCurrentUser()?.email) return;

  if (isBillingOrAuthPage() || isHubBrowsePage()) {
    clearNoCreditsLockFromDocument();
    return;
  }

  const inputsRoot = findCalcInputsRoot();
  if (!(inputsRoot instanceof HTMLElement)) {
    clearNoCreditsLockFromDocument();
    return;
  }

  const root = inputsRoot.closest('main') || inputsRoot;
  if (!(root instanceof HTMLElement)) return;

  if (shouldLockCalcInputsForCredits()) {
    document.documentElement.setAttribute('data-no-credits-lock', '1');
    lockCalcInputs(root, { allowPresets: false, useDisabled: true });
    mountNoCreditsBanner(root);
    wireNoCreditsFocusBlock(root);
    return;
  }

  document.documentElement.removeAttribute('data-no-credits-lock');
  unlockCalcInputs(root);
  removeNoCreditsBanner();
}

/** Escucha cambios de saldo (consume, recarga tras pago). */
export function initNoCreditsLockWatch() {
  if (!isCreditsSystemEnabled()) return;
  if (window.__mdrNoCreditsLockWatch) return;
  window.__mdrNoCreditsLockWatch = true;
  window.addEventListener(CREDITS_CHANGED, () => syncNoCreditsInputLock());
  if (!document.documentElement.dataset.noCreditsLangWired) {
    document.documentElement.dataset.noCreditsLangWired = '1';
    const onLang = () => refreshNoCreditsBanner();
    window.addEventListener('lab-language-changed', onLang);
    window.addEventListener('home-language-changed', onLang);
  }
}
