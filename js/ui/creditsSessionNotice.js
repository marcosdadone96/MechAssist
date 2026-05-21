/**
 * Aviso informativo (una vez por pestaña) antes del primer cobro de sesión de cálculo.
 */
import { FEATURES } from '../config/features.js';
import { creditsAmountFromBalance, getCreditCosts } from '../config/credits.js';
import { getLabLang } from '../lab/i18n/labLang.js';

const NOTICE_FLAG = 'credits_notice_shown';

function ensureToastHost() {
  let host = document.getElementById('mdr-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'mdr-toast-host';
    host.className = 'mdr-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  return host;
}

/**
 * @param {import('../services/creditsApi.js').CreditsBalance | null | undefined} balance
 */
function noticeCopy(balance) {
  const en = getLabLang() === 'en';
  const bal = creditsAmountFromBalance(balance);
  const cost =
    Number(balance?.costs?.calcSession) > 0
      ? Number(balance.costs.calcSession)
      : getCreditCosts().calcSession;
  const mins = Math.round((Number(FEATURES.credits?.calcSessionMs) || 12 * 60 * 1000) / 60000);
  const checkout = FEATURES.proCheckoutPagePath || 'checkout.html';

  if (en) {
    return {
      text: `This calculator uses ${cost} credits per ${mins}-min session. Your balance: ${bal} credits.`,
      plansLabel: 'View plans',
      dismissLabel: 'Got it',
      checkout,
    };
  }
  return {
    text: `Esta calculadora consume ${cost} cr\u00e9ditos por sesi\u00f3n de ${mins} min. Tu saldo: ${bal} cr\u00e9ditos.`,
    plansLabel: 'Ver planes',
    dismissLabel: 'Entendido',
    checkout,
  };
}

/**
 * @param {import('../services/creditsApi.js').CreditsBalance | null | undefined} balance
 */
export function showCreditsSessionNoticeToast(balance) {
  if (typeof document === 'undefined') return;

  const copy = noticeCopy(balance);
  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = 'mdr-toast mdr-toast--info mdr-toast--credits-notice mdr-toast--visible credits-notice-toast';
  el.setAttribute('role', 'status');

  const text = document.createElement('p');
  text.className = 'credits-notice-toast__text';
  text.textContent = copy.text;

  const actions = document.createElement('div');
  actions.className = 'credits-notice-toast__actions';

  const plans = document.createElement('a');
  plans.className = 'credits-notice-toast__link';
  plans.href = copy.checkout;
  plans.textContent = copy.plansLabel;

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'credits-notice-toast__dismiss';
  dismiss.textContent = copy.dismissLabel;

  const close = () => {
    el.classList.remove('mdr-toast--visible');
    window.setTimeout(() => el.remove(), 280);
  };

  dismiss.addEventListener('click', close);
  actions.append(plans, dismiss);
  el.append(text, actions);
  host.appendChild(el);

  window.setTimeout(close, 14000);
}

/**
 * Muestra el aviso como máximo una vez por sesión del navegador, si hay saldo para al menos una sesión.
 * @param {{ balance?: import('../services/creditsApi.js').CreditsBalance | null, unlimited?: boolean } | null} cached
 */
export function maybeShowCreditsSessionNotice(cached) {
  if (cached?.unlimited) return;
  try {
    if (sessionStorage.getItem(NOTICE_FLAG) === '1') return;
  } catch (_) {
    return;
  }

  const balance = cached?.balance;
  if (!balance) return;

  const bal = creditsAmountFromBalance(balance);
  const cost =
    Number(balance.costs?.calcSession) > 0
      ? Number(balance.costs.calcSession)
      : getCreditCosts().calcSession;
  if (bal < cost) return;

  try {
    sessionStorage.setItem(NOTICE_FLAG, '1');
  } catch (_) {
    return;
  }

  showCreditsSessionNoticeToast(balance);
}
