/**
 * Textos de pricing/checkout alineados con FEATURES.credits.
 */
import { FEATURES } from '../config/features.js';

export function creditsPricingNumbers() {
  const c = FEATURES.credits || {};
  const welcome = Number(c.welcomeTotal) > 0 ? Number(c.welcomeTotal) : 1000;
  const perSession = Number(c.costCalcSession) > 0 ? Number(c.costCalcSession) : 10;
  const perPdf = Number(c.costPdf) > 0 ? Number(c.costPdf) : 10;
  const sessionMinutes = Math.round((Number(c.calcSessionMs) || 12 * 60 * 1000) / 60000);
  const approxSessions = Math.floor(welcome / perSession);
  const pdfLimit = Number(c.starterPdfLimitPerMonth) > 0 ? Number(c.starterPdfLimitPerMonth) : 30;
  return { welcome, perSession, perPdf, sessionMinutes, approxSessions, pdfLimit };
}

/**
 * @param {string} lang
 */
export function getCreditsPricingHint(lang) {
  const n = creditsPricingNumbers();
  if (lang === 'en') {
    return `${n.welcome} credits \u00b7 ${n.perSession} per calc session (${n.sessionMinutes} min) \u00b7 PDF ${n.perPdf} each`;
  }
  return `${n.welcome} cr\u00e9ditos \u00b7 ${n.perSession} por sesi\u00f3n (${n.sessionMinutes} min) \u00b7 PDF ${n.perPdf} c/u`;
}

/**
 * @param {string} lang
 * @returns {string}
 */
export function getCreditsPricingExplainerHtml(lang) {
  const n = creditsPricingNumbers();
  const row = (dt, dd) => `<${'div'}><dt>${dt}</dt><dd>${dd}</dd></${'div'}>`;
  if (lang === 'en') {
    return `<dl class="hub-pricing-credits-dl">${row(
      'Credit balance',
      `<strong>${n.welcome}</strong> welcome credits when you verify your account (shared across the catalog). Not unlimited.`
    )}${row(
      'Calc session',
      `<strong>${n.sessionMinutes} min</strong> active window on one calculator = <strong>${n.perSession} credits</strong>. Auto-recalcs inside the window do not open a new session.`
    )}${row(
      'Typical capacity',
      `About <strong>${n.approxSessions} sessions</strong> if you spend the balance only on calculations (${n.welcome}\u00f7${n.perSession}).`
    )}${row(
      'PDF export',
      `<strong>${n.perPdf} credits</strong> per report. Starter: up to <strong>${n.pdfLimit}/month</strong> on your plan counter.`
    )}${row(
      'Unlimited plan',
      '<strong>\u20ac25/month</strong> \u2014 no credit spend on calculations or PDF.'
    )}</dl>`;
  }
  return `<dl class="hub-pricing-credits-dl">${row(
    'Saldo',
    `<strong>${n.welcome} cr\u00e9ditos</strong> de bienvenida al verificar la cuenta (compartidos en todo el cat\u00e1logo). No es uso ilimitado.`
  )}${row(
    'Sesi\u00f3n de c\u00e1lculo',
    `Ventana de <strong>${n.sessionMinutes} min</strong> en una calculadora = <strong>${n.perSession} cr\u00e9ditos</strong>. Los rec\u00e1lculos dentro de la ventana no abren otra sesi\u00f3n.`
  )}${row(
    'Capacidad orientativa',
    `Unas <strong>${n.approxSessions} sesiones</strong> si dedicas el saldo solo a c\u00e1lculos (${n.welcome}\u00f7${n.perSession}).`
  )}${row(
    'PDF',
    `<strong>${n.perPdf} cr\u00e9ditos</strong> por informe. Starter: hasta <strong>${n.pdfLimit}/mes</strong> en el contador del plan.`
  )}${row(
    'Plan Ilimitado',
    '<strong>25 \u20ac/mes</strong> \u2014 sin gastar cr\u00e9ditos en c\u00e1lculos ni PDF.'
  )}</dl>`;
}

