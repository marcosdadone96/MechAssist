/**
 * Bloquea edicion cuando el saldo del hub no alcanza para una sesion de calculo.
 */
import { isCreditsSystemEnabled } from '../config/credits.js';
import { shouldLockCalcInputsForCredits } from '../services/creditSession.js';
import { getCurrentUser } from '../services/localAuth.js';
import { showNoCreditsModal } from './creditsUi.js';
import { findCalcInputsRoot, lockCalcInputs, unlockCalcInputs } from './calcInputLock.js';

const CREDITS_CHANGED = 'mdr-credits-changed';
let focusWired = false;

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

/**
 * @param {HTMLElement} root
 */
function mountNoCreditsBanner(root) {
  if (document.getElementById('no-credits-lock-banner')) return;
  const en = langEn();
  const checkout = 'checkout.html';
  const bar = document.createElement('div');
  bar.id = 'no-credits-lock-banner';
  bar.className = 'no-credits-lock-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = en
    ? `<p><strong>No credits left</strong> in this area. Inputs are read-only until you add credits or unlock this calculator. <a href="${checkout}">View plans</a></p>`
    : `<p><strong>Sin cr\u00e9ditos</strong> en esta zona. Los campos est\u00e1n bloqueados hasta que recargues cr\u00e9ditos o desbloquees esta calculadora. <a href="${checkout}">Ver planes</a></p>`;
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
      if (!t.classList.contains('calc-input-locked')) return;
      showNoCreditsModal();
      t.blur();
    },
    true,
  );
}

/** Aplica o quita bloqueo segun saldo cacheado del hub actual. */
export function syncNoCreditsInputLock() {
  if (!isCreditsSystemEnabled()) return;
  if (!getCurrentUser()?.email) return;

  const inputsRoot = findCalcInputsRoot();
  const root =
    inputsRoot instanceof HTMLElement
      ? inputsRoot.closest('main') || inputsRoot
      : document.querySelector('main.app-main, main.lab-main, main');
  if (!(root instanceof HTMLElement)) return;

  if (shouldLockCalcInputsForCredits()) {
    document.documentElement.setAttribute('data-no-credits-lock', '1');
    lockCalcInputs(root, { allowPresets: false });
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
}
