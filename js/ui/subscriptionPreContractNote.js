/**
 * Aviso precontractual (renovaciùn, cancelaciùn, reembolso) para suscripciones.
 */
import { FEATURES } from '../config/features.js';

/** @typedef {'starter'|'unlimited'} SubPlanKey */
/** @typedef {'monthly'|'annual'|'any'} SubBilling */

const PLAN_PRICES = {
  starter: {
    es: { monthly: '9 \u20ac/mes', annual: '79 \u20ac/a\u00f1o' },
    en: { monthly: '\u20ac9/month', annual: '\u20ac79/year' },
  },
  unlimited: {
    es: { monthly: '25 \u20ac/mes', annual: '199 \u20ac/a\u00f1o' },
    en: { monthly: '\u20ac25/month', annual: '\u20ac199/year' },
  },
};

function billingPortalLink(lang) {
  const url = String(FEATURES.subscriptionManageUrl || '').trim();
  const label = lang === 'en' ? 'your customer billing portal' : 'su portal de cliente';
  if (!url) return label;
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function termsLink(lang) {
  const label = lang === 'en' ? 'Terms' : 'T\u00e9rminos';
  return `<a href="terms.html" target="_blank" rel="noopener">${label}</a>`;
}

/**
 * @param {string} lang
 * @param {SubPlanKey} planKey
 * @param {SubBilling} billing
 * @returns {string}
 */
export function subscriptionRenewalNoteHtml(lang, planKey, billing = 'monthly') {
  if (FEATURES.publicFreeRelease) return '';
  const plan = PLAN_PRICES[planKey];
  if (!plan) return '';
  const l = lang === 'en' ? 'en' : 'es';
  const portal = billingPortalLink(l);
  const terms = termsLink(l);
  const prices = plan[l];

  let pricePhrase = '';
  if (billing === 'annual') {
    pricePhrase = prices.annual;
  } else if (billing === 'any') {
    pricePhrase = l === 'en' ? `${prices.monthly} or ${prices.annual}` : `${prices.monthly} u ${prices.annual}`;
  } else {
    pricePhrase = prices.monthly;
  }

  if (l === 'en') {
    return `Applicable price: <strong>${pricePhrase}</strong> until you cancel in ${portal}. Refunds and EU withdrawal: see ${terms} (checkbox at checkout).`;
  }
  return `Tarifa aplicable: <strong>${pricePhrase}</strong> hasta cancelar en ${portal}. Reembolsos y desistimiento UE: ver ${terms} (casilla en el pago).`;
}

/**
 * @param {string} lang
 */
export function applySubscriptionRenewalNotes(lang) {
  const l = lang === 'en' ? 'en' : 'es';
  document.querySelectorAll('[data-sub-renewal]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const plan = el.getAttribute('data-sub-renewal');
    const billing = /** @type {SubBilling} */ (el.getAttribute('data-sub-billing') || 'monthly');
    if (!plan || plan === 'unlock') {
      el.hidden = true;
      return;
    }
    const html = subscriptionRenewalNoteHtml(l, /** @type {SubPlanKey} */ (plan), billing);
    if (html) {
      el.innerHTML = html;
      el.hidden = false;
    } else {
      el.innerHTML = '';
      el.hidden = true;
    }
  });
}
