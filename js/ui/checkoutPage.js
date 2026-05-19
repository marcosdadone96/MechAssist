/**
 * Pagina de pago Pro (demo local + gancho Stripe).
 */

import { FEATURES } from '../config/features.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCreditsPricingExplainerHtml, getCreditsPricingHint } from './creditsPricingCopy.js';
import { applySubscriptionRenewalNotes } from './subscriptionPreContractNote.js';
import { getCurrentUser } from '../services/localAuth.js';
import { grantProLicensePersistent } from '../services/accessTier.js';
import { claimAndVerifyProAfterCheckout } from '../services/proEntitlement.js';
import { buildRegisterUrlWithNextCheckout, getHomeLang } from '../services/proCheckoutFlow.js';
import { buildCalcUnlockCheckoutUrl } from '../services/calcUnlockCheckout.js';
import { CALC_UNLOCK_CATALOG, getCalcUnlockCatalogEntry } from '../config/calcUnlockCatalog.js';
import {
  rememberPendingCalcUnlockSlug,
  readPendingCalcUnlockSlug,
  clearPendingCalcUnlockSlug,
  waitForCreditsAfterCheckout,
} from '../services/creditsApi.js';

function getLang() {
  return getHomeLang();
}

const TX = {
  es: {
    docTitle: 'Pago Pro \u2014 TheMechAssist',
    navHome: 'Inicio',
    navRegister: 'Registro',
    eyebrow: 'TheMechAssist',
    title: 'Planes y cr\u00e9ditos',
    lead: 'Elija una opci\u00f3n y pulse el bot\u00f3n para abrir el pago seguro en Lemon Squeezy.',
    choicesAria: 'Opciones disponibles',
    choices: [
      { label: 'Starter', detail: '9 \u20ac/mes \u00b7 cr\u00e9ditos y hasta 30 PDF/mes' },
      { label: 'Ilimitado', detail: '25 \u20ac/mes \u00b7 cat\u00e1logo sin gastar cr\u00e9ditos' },
      { label: 'Una calculadora', detail: '1 \u20ac/30 d\u00edas \u00b7 sin suscripci\u00f3n' },
    ],
    subsHeading: 'Suscripciones',
    subsLead: 'Mismo bot\u00f3n principal en cada tarjeta. El plan anual de Starter es un enlace aparte.',
    starterHeading: 'Starter',
    starterPrice: '9 \u20ac/mes',
    starterHint:
      '1000 cr\u00e9ditos de bienvenida al verificar la cuenta. No es uso ilimitado: consulte el desglose debajo.',
    starterCreditsSummary: '\u00bfC\u00f3mo funcionan los cr\u00e9ditos?',
    starterBullets: [
      'Hasta 30 PDF/mes en el contador del plan Starter',
      'Sesiones de c\u00e1lculo (12 min) en lab, m\u00e1quinas e hidr\u00e1ulica: 10 cr\u00e9ditos cada una',
      'Plan anual con descuento (79 \u20ac/a\u00f1o)',
      'Gestione la suscripci\u00f3n en el portal Lemon',
    ],
    unlimitedHeading: 'Ilimitado',
    unlimitedPrice: '25 \u20ac/mes',
    unlimitedHint: 'Todo el cat\u00e1logo sin gastar cr\u00e9ditos ni l\u00edmite de PDF por cr\u00e9ditos.',
    unlimitedBullets: [
      'Acceso completo sin consumir cr\u00e9ditos',
      'PDF y sesiones de c\u00e1lculo sin cargo por saldo',
      'Ideal para oficinas t\u00e9cnicas con uso diario',
      'Precio final e IVA en checkout seg\u00fan pa\u00eds',
    ],
    unlimitedPending:
      'Enlace de pago en configuraci\u00f3n. A\u00f1ada la URL Lemon del plan 25 \u20ac en features.js (unlimitedMonthly).',
    unlockHeading: 'Compra puntual',
    unlockHint: 'Sin suscripci\u00f3n. Elija la herramienta y pague una sola vez.',
    unlockPrice: '1 \u20ac / 30 d\u00edas',
    unlockBullets: [
      'Uso ilimitado en esa calculadora durante 30 d\u00edas',
      'C\u00e1lculos y PDF en esa p\u00e1gina sin gastar cr\u00e9ditos',
      'Puede comprar varias herramientas por separado',
    ],
    unlockPick: 'Elija la calculadora',
    unlockLoading: 'Cargando\u2026',
    unlockLoadError: 'No se pudieron cargar las calculadoras',
    unlockBtn: 'Desbloquear por 1 \u20ac',
    unlockFor: (name) => `Desbloquear: ${name}`,
    starterMonthly: 'Starter \u2014 9 \u20ac/mes',
    starterAnnual: 'Starter anual \u2014 79 \u20ac/a\u00f1o',
    starterAnnualNote: '(\u2248 6,58 \u20ac/mes de media)',
    unlimitedMonthly: 'Ilimitado \u2014 25 \u20ac/mes',
    unlimitedAnnual: 'Ilimitado anual \u2014 199 \u20ac/a\u00f1o',
    unlimitedAnnualNote: '(\u2248 16,58 \u20ac/mes \u00b7 2 meses gratis)',
    creditsNote: '',
    signedAs: (name, email) => `Sesion: ${name} (${email})`,
    stripeBtn: 'Pagar con tarjeta (Stripe)',
    monthlyPlan: 'Starter \u2014 9 \u20ac/mes',
    annualPlan: 'Starter anual \u2014 79 \u20ac/a\u00f1o',
    checkoutPayNote: 'Pago seguro con Lemon Squeezy. IVA seg\u00fan pa\u00eds en la pasarela.',
    withdrawalLabelHtml:
      'Solicito el <strong>suministro inmediato</strong> del contenido digital (acceso Pro en este navegador) y, cuando act\u00fae como consumidor en la UE, <strong>renuncio expresamente</strong> al derecho de desistimiento respecto de ese suministro inmediato, en los t\u00e9rminos previstos por la normativa aplicable. He le\u00eddo los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a>.',
    withdrawalHelp:
      'Si no marca esta casilla no puede completar la compra con entrega digital inmediata. Para otro modo de contrataci\u00f3n, contacte antes de pagar.',
    withdrawalRequired: 'Debe aceptar la renuncia al desistimiento para continuar.',
    paymentNotConfigured:
      'No hay enlaces de pago en esta pagina. Configure Stripe o Lemon Squeezy en la aplicacion.',
    backHome: 'Volver al inicio',
    legalLinks:
      'Al pagar acepta los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a> y la <a href="privacy.html" target="_blank" rel="noopener">Pol\u00edtica de privacidad</a>.',
    footPrivacy: 'Privacidad',
    footTrust: 'Confianza',
    footTerms: 'T\u00e9rminos',
    footCookies: 'Cookies',
    footCookiePrefs: 'Preferencias cookies',
    manageTitle: 'Gestionar o cancelar la suscripci\u00f3n Pro',
    manageLeadPortal:
      'Si ya paga TheMechAssist Pro, puede abrir el portal de facturaci\u00f3n para renovaci\u00f3n autom\u00e1tica, facturas, m\u00e9todo de pago o baja del plan.',
    manageLeadNoPortal:
      'Para cancelar la renovaci\u00f3n o cambiar datos de cobro, use el enlace que env\u00eda su pasarela por correo o escr\u00edbanos.',
    manageBtn: 'Abrir gesti\u00f3n de suscripci\u00f3n',
    manageMailPrefix: 'Contacto facturaci\u00f3n:',
    manageTermsRef:
      'Detalle jur\u00eddico: secci\u00f3n <strong>Renovaci\u00f3n y cancelaci\u00f3n</strong> en los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos de uso</a>.',
    paidWelcomeLine:
      '\u00a1Ya eres Pro! Todas las funciones est\u00e1n desbloqueadas en este navegador.',
    paidUnlockWelcome: (name) =>
      `Pago recibido. La calculadora <strong>${name}</strong> queda desbloqueada 30 d\u00edas (c\u00e1lculos y PDF sin gastar cr\u00e9ditos en esa p\u00e1gina).`,
    paidUnlockPending:
      'Pago recibido. Estamos activando el desbloqueo en su cuenta; en unos segundos recargue esta p\u00e1gina o abra el men\u00fa de su perfil.',
    paidStarterWelcome: 'Pago recibido. Plan <strong>Starter</strong> activo en su cuenta.',
    paidUnlimitedWelcome: 'Pago recibido. Plan <strong>Ilimitado</strong> activo en su cuenta.',
    manageTitlePaidReturn: 'Tu plan est\u00e1 activo',
  },
  en: {
    docTitle: 'Pro checkout \u2014 TheMechAssist',
    navHome: 'Home',
    navRegister: 'Register',
    eyebrow: 'TheMechAssist',
    title: 'Plans & credits',
    lead: 'Pick an option and use the button to open secure checkout on Lemon Squeezy.',
    choicesAria: 'Available options',
    choices: [
      { label: 'Starter', detail: '\u20ac9/mo \u00b7 credits and up to 30 PDFs/month' },
      { label: 'Unlimited', detail: '\u20ac25/mo \u00b7 full catalog without credits' },
      { label: 'Single calculator', detail: '\u20ac1/30 days \u00b7 no subscription' },
    ],
    subsHeading: 'Subscriptions',
    subsLead: 'Each card has one main button. Starter annual billing is a separate link.',
    starterHeading: 'Starter',
    starterPrice: '\u20ac9/month',
    starterHint:
      '1000 welcome credits when you verify your account. Not unlimited — see the breakdown below.',
    starterCreditsSummary: 'How do credits work?',
    starterBullets: [
      'Up to 30 PDFs/month on your Starter plan counter',
      'Calc sessions (12 min) in lab, machines and hydraulics: 10 credits each',
      'Annual plan with discount (\u20ac79/year)',
      'Manage billing in the Lemon portal',
    ],
    unlimitedHeading: 'Unlimited',
    unlimitedPrice: '\u20ac25/month',
    unlimitedHint: 'Full catalog without spending credits or PDF credit limits.',
    unlimitedBullets: [
      'Full access without credit spend',
      'PDF and calc sessions not limited by balance',
      'Best for daily technical office use',
      'Final price and VAT at checkout by country',
    ],
    unlimitedPending:
      'Checkout link not configured yet. Add the Lemon URL for \u20ac25/mo in features.js (unlimitedMonthly).',
    unlockHeading: 'Single calculator only',
    unlockHint:
      '\u20ac1/month per calculator. Unlimited calc and PDF on that page for 30 days. Stack multiple unlocks without Starter.',
    unlockPick: 'Pick a calculator',
    unlockLoading: 'Loading\u2026',
    unlockLoadError: 'Could not load the calculator list',
    unlockBtn: 'Unlock for \u20ac1/month',
    unlockFor: (name) => `Unlock: ${name}`,
    starterMonthly: 'Starter \u2014 \u20ac9/month',
    starterAnnual: 'Starter annual \u2014 \u20ac79/year',
    starterAnnualNote: '(avg. \u2248 \u20ac6.58/month)',
    unlimitedMonthly: 'Unlimited \u2014 \u20ac25/month',
    unlimitedAnnual: 'Unlimited annual \u2014 \u20ac199/year',
    unlimitedAnnualNote: '(avg. \u2248 \u20ac16.58/mo \u00b7 2 months free)',
    creditsNote: '',
    signedAs: (name, email) => `Signed in: ${name} (${email})`,
    stripeBtn: 'Pay with card (Stripe)',
    monthlyPlan: 'Starter \u2014 \u20ac9/month',
    annualPlan: 'Starter annual \u2014 \u20ac79/year',
    checkoutPayNote: 'Secure checkout via Lemon Squeezy. VAT by country at payment.',
    withdrawalLabelHtml:
      'I request <strong>immediate supply</strong> of the digital content (Pro access in this browser) and, where I qualify as an EU consumer, I <strong>expressly waive</strong> the 14-day right of withdrawal once access is activated, as permitted for digital content (see your Terms). I have read the <a href="terms.html" target="_blank" rel="noopener">Terms</a>.',
    withdrawalHelp:
      'If you do not tick this box you cannot complete immediate digital delivery. Contact us before paying for other arrangements.',
    withdrawalRequired: 'You must accept the withdrawal waiver to continue.',
    paymentNotConfigured:
      'No payment links on this page. Configure Stripe or Lemon Squeezy in the app.',
    backHome: 'Back to home',
    legalLinks:
      'By paying you accept the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a>.',
    footPrivacy: 'Privacy',
    footTrust: 'Trust',
    footTerms: 'Terms',
    footCookies: 'Cookies',
    footCookiePrefs: 'Cookie settings',
    manageTitle: 'Manage or cancel Pro subscription',
    manageLeadPortal:
      'If you already pay for TheMechAssist Pro, open your billing portal to manage auto-renewal, invoices, payment method or cancel renewal.',
    manageLeadNoPortal:
      'To cancel renewal or change billing details, use the link from your payment provider emails or contact us.',
    manageBtn: 'Open subscription management',
    manageMailPrefix: 'Billing contact:',
    manageTermsRef:
      'Legal detail: <strong>Renewal and cancellation</strong> in the <a href="terms.html" target="_blank" rel="noopener">Terms of use</a>.',
    paidWelcomeLine: "You're Pro now! All features are unlocked in this browser.",
    paidUnlockWelcome: (name) =>
      `Payment received. <strong>${name}</strong> is unlocked for 30 days (unlimited calc and PDF on that page).`,
    paidUnlockPending:
      'Payment received. We are activating your unlock; reload this page in a few seconds or open your profile menu.',
    paidStarterWelcome: 'Payment received. <strong>Starter</strong> plan is active on your account.',
    paidUnlimitedWelcome: 'Payment received. <strong>Unlimited</strong> plan is active on your account.',
    manageTitlePaidReturn: 'Your plan is active',
  },
};

function applyManageSubscriptionBlock(t) {
  const url =
    typeof FEATURES.subscriptionManageUrl === 'string' && FEATURES.subscriptionManageUrl.trim().length > 0
      ? FEATURES.subscriptionManageUrl.trim()
      : '';
  const em =
    typeof FEATURES.legalContactEmail === 'string' && FEATURES.legalContactEmail.trim().length > 0
      ? FEATURES.legalContactEmail.trim()
      : '';

  const wrap = document.getElementById('coManageSub');
  if (!wrap) return;
  wrap.hidden = false;

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set('coManageTitle', t.manageTitle);
  const lead = document.getElementById('coManageLead');
  if (lead) lead.textContent = url ? t.manageLeadPortal : t.manageLeadNoPortal;

  const link = document.getElementById('coManageLink');
  if (link) {
    if (url) {
      link.href = url;
      link.textContent = t.manageBtn;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute('href');
    }
  }

  const mailP = document.getElementById('coManageMail');
  if (mailP) {
    mailP.hidden = true;
    mailP.replaceChildren();
    if (em) {
      mailP.hidden = false;
      mailP.append(document.createTextNode(`${t.manageMailPrefix} `));
      const a = document.createElement('a');
      a.href = `mailto:${em}`;
      a.textContent = em;
      mailP.appendChild(a);
    }
  }

  const tr = document.getElementById('coManageTermsRef');
  if (tr && t.manageTermsRef) tr.innerHTML = t.manageTermsRef;
}

function applyCreditsPricingToCheckout(t) {
  const lang = getLang() === 'en' ? 'en' : 'es';
  const enabled = isCreditsSystemEnabled();
  const hint = document.getElementById('coStarterCreditsHint');
  const details = document.getElementById('coStarterCreditsDetails');
  const summary = document.getElementById('coStarterCreditsSummary');
  const explainer = document.getElementById('coStarterCreditsExplainer');
  if (hint instanceof HTMLElement) {
    hint.hidden = !enabled;
    if (enabled) hint.textContent = getCreditsPricingHint(lang);
  }
  if (details instanceof HTMLElement) details.hidden = !enabled;
  if (summary) summary.textContent = t.starterCreditsSummary || '';
  if (explainer instanceof HTMLElement && enabled) {
    explainer.innerHTML = getCreditsPricingExplainerHtml(lang);
  }
}

function applyTx(t) {
  document.documentElement.lang = getLang() === 'en' ? 'en' : 'es';
  document.title = t.docTitle;
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const wrapW = document.getElementById('coWithdrawalWrap');
  if (wrapW) wrapW.hidden = !FEATURES.requireCheckoutWithdrawalWaiver;
  const wLab = document.getElementById('coWithdrawalLabel');
  if (wLab && t.withdrawalLabelHtml) wLab.innerHTML = t.withdrawalLabelHtml;
  set('coWithdrawalHelp', t.withdrawalHelp);
  const wErr = document.getElementById('coWithdrawalError');
  if (wErr) {
    wErr.hidden = true;
    wErr.textContent = '';
  }
  set('coNavHome', t.navHome);
  set('coNavRegister', t.navRegister);
  set('coEyebrow', t.eyebrow);
  set('coTitle', t.title);
  set('coLead', t.lead);
  set('coSubsHeading', t.subsHeading);
  set('coSubsLead', t.subsLead);
  set('coDemoNote', t.checkoutPayNote);
  set('coStarterAnnualNote', t.starterAnnualNote || '');
  set('coUnlimitedAnnualNote', t.unlimitedAnnualNote || '');
  set('coUnlockPrice', t.unlockPrice || '');
  const choicesEl = document.getElementById('coChoices');
  if (choicesEl instanceof HTMLUListElement && Array.isArray(t.choices)) {
    if (t.choicesAria) choicesEl.setAttribute('aria-label', t.choicesAria);
    choicesEl.replaceChildren();
    for (const item of t.choices) {
      const li = document.createElement('li');
      li.className = 'checkout-choices__item';
      const strong = document.createElement('strong');
      strong.textContent = item.label;
      li.append(strong, document.createTextNode(` \u2014 ${item.detail}`));
      choicesEl.appendChild(li);
    }
  }
  const m = document.getElementById('coLemonMonthly');
  const ann = document.getElementById('coLemonAnnual');
  const unl = document.getElementById('coLemonUnlimited');
  const unlAnn = document.getElementById('coLemonUnlimitedAnnual');
  if (m) m.textContent = t.starterMonthly || t.monthlyPlan;
  if (ann) ann.textContent = t.starterAnnual || t.annualPlan;
  if (unl) unl.textContent = t.unlimitedMonthly || 'Ilimitado';
  if (unlAnn) unlAnn.textContent = t.unlimitedAnnual || '';
  set('coStarterHeading', t.starterHeading);
  set('coStarterPrice', t.starterPrice);
  set('coStarterHint', t.starterHint);
  applyCreditsPricingToCheckout(t);
  set('coUnlimitedHeading', t.unlimitedHeading);
  set('coUnlimitedPrice', t.unlimitedPrice);
  set('coUnlimitedHint', t.unlimitedHint);
  const fillBullets = (id, items) => {
    const ul = document.getElementById(id);
    if (!(ul instanceof HTMLUListElement) || !Array.isArray(items)) return;
    ul.replaceChildren();
    for (const text of items) {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    }
  };
  fillBullets('coStarterBullets', t.starterBullets);
  fillBullets('coUnlimitedBullets', t.unlimitedBullets);
  fillBullets('coUnlockBullets', t.unlockBullets);
  const pending = document.getElementById('coUnlimitedPending');
  if (pending) pending.textContent = t.unlimitedPending || '';
  set('coUnlockHeading', t.unlockHeading);
  set('coUnlockHint', t.unlockHint);
  const pickLbl = document.querySelector('label[for="coUnlockCalc"]');
  if (pickLbl) pickLbl.textContent = t.unlockPick;
  const unlockBtn = document.getElementById('coUnlockCalcBtn');
  if (unlockBtn) unlockBtn.textContent = t.unlockBtn;
  const note = document.getElementById('coCreditsNote');
  if (note) note.hidden = true;
  const bh = document.getElementById('coBackHome');
  if (bh) bh.textContent = t.backHome;
  const legal = document.getElementById('coLegalLinks');
  if (legal && t.legalLinks) legal.innerHTML = t.legalLinks;
  const f1 = document.getElementById('coFootPrivacy');
  const f1b = document.getElementById('coFootTrust');
  const f2 = document.getElementById('coFootTerms');
  const f3 = document.getElementById('coFootCookies');
  if (f1) f1.textContent = t.footPrivacy;
  if (f1b) f1b.textContent = t.footTrust;
  if (f2) f2.textContent = t.footTerms;
  if (f3) f3.textContent = t.footCookies;
  const f4 = document.getElementById('coFootCookiePrefs');
  if (f4) f4.textContent = t.footCookiePrefs;
  const stripeBtn = document.getElementById('coPayStripe');
  if (stripeBtn) stripeBtn.textContent = t.stripeBtn;
}

/** Resalta tarjeta o sección según hash (#starter, #unlimited, #unlock). */
function highlightCheckoutFocus() {
  document
    .querySelectorAll('.checkout-plan-card--highlight, .checkout-section--highlight')
    .forEach((el) => {
      el.classList.remove('checkout-plan-card--highlight', 'checkout-section--highlight');
    });
  const hash = (window.location.hash || '').toLowerCase();
  if (hash === '#unlimited') {
    document.getElementById('coUnlimitedBlock')?.classList.add('checkout-plan-card--highlight');
  } else if (hash === '#unlock') {
    document.getElementById('coUnlockBlock')?.classList.add('checkout-section--highlight');
  } else if (hash === '#starter') {
    document.getElementById('coStarterBlock')?.classList.add('checkout-plan-card--highlight');
  }
}

function assertWithdrawalOrShowError(t) {
  if (!FEATURES.requireCheckoutWithdrawalWaiver) return true;
  const cb = document.getElementById('coWithdrawalWaive');
  if (cb && cb.checked) {
    const err = document.getElementById('coWithdrawalError');
    if (err) err.hidden = true;
    return true;
  }
  const err = document.getElementById('coWithdrawalError');
  if (err) {
    err.hidden = false;
    err.textContent = t.withdrawalRequired;
  }
  document.getElementById('coWithdrawalWaive')?.focus();
  return false;
}

export async function mountCheckoutPage() {
  if (FEATURES.publicFreeRelease) {
    window.location.replace('index.html');
    return;
  }
  const lang = getLang();
  const t = TX[lang];

  if (!getCurrentUser()) {
    window.location.replace(buildRegisterUrlWithNextCheckout());
    return;
  }

  let paidCheckoutComplete = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paid') === '1') {
      if (!isCreditsSystemEnabled()) {
        grantProLicensePersistent();
        const user = getCurrentUser();
        if (FEATURES.proClientPolicy === 'production') {
          await claimAndVerifyProAfterCheckout(user?.email);
        }
      }
      const path = window.location.pathname || '/checkout.html';
      history.replaceState({}, '', path);
      paidCheckoutComplete = true;
    }
  } catch (_) {
    /* ignore */
  }

  applyTx(t);
  highlightCheckoutFocus();
  window.addEventListener('hashchange', highlightCheckoutFocus);
  applyManageSubscriptionBlock(t);

  const lemon = FEATURES.lemonCheckout || {};
  const lemonM = document.getElementById('coLemonMonthly');
  const lemonA = document.getElementById('coLemonAnnual');
  const lemonU = document.getElementById('coLemonUnlimited');
  const lemonUAnn = document.getElementById('coLemonUnlimitedAnnual');
  if (lemonM instanceof HTMLAnchorElement && lemon.starterMonthly) lemonM.href = lemon.starterMonthly;
  if (lemonA instanceof HTMLAnchorElement && lemon.starterAnnual) lemonA.href = lemon.starterAnnual;
  const unlimitedBlock = document.getElementById('coUnlimitedBlock');
  const unlimitedPending = document.getElementById('coUnlimitedPending');
  if (lemonU instanceof HTMLAnchorElement) {
    const u = String(lemon.unlimitedMonthly || '').trim();
    if (u) {
      lemonU.href = u;
      lemonU.hidden = false;
      if (unlimitedPending instanceof HTMLElement) unlimitedPending.hidden = true;
    } else {
      lemonU.hidden = true;
      if (unlimitedPending instanceof HTMLElement) unlimitedPending.hidden = false;
    }
  }
  if (lemonUAnn instanceof HTMLAnchorElement) {
    const ua = String(lemon.unlimitedAnnual || '').trim();
    if (ua) {
      lemonUAnn.href = ua;
      lemonUAnn.hidden = false;
    } else {
      lemonUAnn.hidden = true;
    }
  }
  if (unlimitedBlock instanceof HTMLElement && window.location.hash.toLowerCase() === '#unlimited') {
    unlimitedBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (isCreditsSystemEnabled()) {
    const { refreshCreditsAfterAuth, fetchCreditsBalance } = await import('../services/creditsApi.js');
    const unlockSlug = new URLSearchParams(window.location.search).get('unlock') || '';
    await fetchCreditsBalance(unlockSlug).catch(() => {});
    await refreshCreditsAfterAuth().catch(() => {});
    mountCalcUnlockCheckoutBlock(t, unlockSlug);
    if (window.location.hash.toLowerCase() === '#unlock') {
      document.getElementById('coUnlockBlock')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (paidCheckoutComplete) {
    const welcomeEl = document.getElementById('coProWelcome');
    if (welcomeEl) {
      welcomeEl.hidden = false;
      if (isCreditsSystemEnabled()) {
        welcomeEl.innerHTML = t.paidUnlockPending;
        const pendingSlug =
          readPendingCalcUnlockSlug() ||
          new URLSearchParams(window.location.search).get('unlock') ||
          '';
        void (async () => {
          const result = await waitForCreditsAfterCheckout(pendingSlug);
          if (result.status === 'unlimited') {
            welcomeEl.innerHTML = t.paidUnlimitedWelcome;
          } else if (result.status === 'starter') {
            welcomeEl.innerHTML = t.paidStarterWelcome;
          } else if (result.status === 'unlock') {
            const slug = result.slugs?.[0] || pendingSlug;
            const entry = slug ? getCalcUnlockCatalogEntry(slug) : null;
            const label = entry ? (getLang() === 'en' ? entry.en : entry.es) : slug;
            welcomeEl.innerHTML =
              typeof t.paidUnlockWelcome === 'function' ? t.paidUnlockWelcome(label) : t.paidUnlockPending;
            clearPendingCalcUnlockSlug();
          }
          const { refreshCreditsAfterAuth } = await import('../services/creditsApi.js');
          await refreshCreditsAfterAuth().catch(() => {});
          const { mountProfileMenu } = await import('./hubProfileMenu.js');
          const slot = document.getElementById('hub-header-auth-slot');
          if (slot) mountProfileMenu(slot);
        })();
      } else {
        welcomeEl.textContent = t.paidWelcomeLine;
      }
    }
    const lemonM = document.getElementById('coLemonMonthly');
    const lemonA = document.getElementById('coLemonAnnual');
    const lemonU = document.getElementById('coLemonUnlimited');
    const lemonUAnn = document.getElementById('coLemonUnlimitedAnnual');
    if (lemonM instanceof HTMLElement) lemonM.hidden = true;
    if (lemonA instanceof HTMLElement) lemonA.hidden = true;
    if (lemonU instanceof HTMLElement) lemonU.hidden = true;
    if (lemonUAnn instanceof HTMLElement) lemonUAnn.hidden = true;
    const manageWrap = document.getElementById('coManageSub');
    if (manageWrap instanceof HTMLElement) manageWrap.hidden = false;
    const manageTitleEl = document.getElementById('coManageTitle');
    if (manageTitleEl) manageTitleEl.textContent = t.manageTitlePaidReturn;
  } else {
    applySubscriptionRenewalNotes(getLang());
  }

  const user = getCurrentUser();
  const line = document.getElementById('coUserLine');
  if (line && user) line.textContent = t.signedAs(user.name, user.email);

  const stripeBtn = document.getElementById('coPayStripe');
  const blockedEl = document.getElementById('coCheckoutBlocked');
  const useStripe =
    FEATURES.stripePayments === true &&
    typeof FEATURES.stripeCheckoutSessionUrl === 'string' &&
    FEATURES.stripeCheckoutSessionUrl.length > 0;

  const lemonMonthlyEl = document.getElementById('coLemonMonthly');
  const hasLemonSqueezy =
    lemonMonthlyEl instanceof HTMLElement && !lemonMonthlyEl.hidden;

  if (!useStripe && !hasLemonSqueezy && blockedEl && !paidCheckoutComplete) {
    blockedEl.hidden = false;
    blockedEl.textContent = t.paymentNotConfigured;
  } else if (blockedEl) {
    blockedEl.hidden = true;
  }

  document.getElementById('coWithdrawalWaive')?.addEventListener('change', () => {
    const err = document.getElementById('coWithdrawalError');
    if (err) err.hidden = true;
  });

  if (stripeBtn instanceof HTMLElement) {
    if (useStripe) {
      stripeBtn.hidden = false;
      stripeBtn.addEventListener('click', () => {
        if (!assertWithdrawalOrShowError(t)) return;
        window.location.href = FEATURES.stripeCheckoutSessionUrl;
      });
    } else {
      stripeBtn.remove();
    }
  }

  document.getElementById('coUnlockCalcBtn')?.addEventListener('click', () => {
    if (!assertWithdrawalOrShowError(t)) return;
    const sel = document.getElementById('coUnlockCalc');
    const slug = sel instanceof HTMLSelectElement ? sel.value : '';
    if (!slug) return;
    rememberPendingCalcUnlockSlug(slug);
    window.location.href = buildCalcUnlockCheckoutUrl(slug);
  });

  ['coLemonMonthly', 'coLemonAnnual', 'coLemonUnlimited', 'coLemonUnlimitedAnnual'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (ev) => {
      if (!assertWithdrawalOrShowError(t)) ev.preventDefault();
    });
  });

  document.querySelectorAll('[data-co-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const l = btn.getAttribute('data-co-lang');
      try {
        localStorage.setItem('mdr-home-lang', l === 'en' ? 'en' : 'es');
      } catch (_) {
        /* ignore */
      }
      window.location.reload();
    });
    btn.classList.toggle('hub-lang__btn--active', btn.getAttribute('data-co-lang') === lang);
  });
}

/** Todas las calculadoras del sitio (config/calc-unlock-catalog.json). */
function sortedUnlockCalcOptions(lang) {
  const en = lang === 'en';
  return [...CALC_UNLOCK_CATALOG].sort((a, b) => {
    const la = en ? a.en : a.es;
    const lb = en ? b.en : b.es;
    return la.localeCompare(lb, en ? 'en' : 'es', { sensitivity: 'base' });
  });
}

/**
 * @param {typeof TX.es} t
 */
function syncUnlockCalcControls(t) {
  const sel = document.getElementById('coUnlockCalc');
  const btn = document.getElementById('coUnlockCalcBtn');
  if (!(sel instanceof HTMLSelectElement) || !(btn instanceof HTMLButtonElement)) return;

  const slug = sel.value.trim();
  const hasRealOptions = [...sel.options].some((o) => o.value);
  const lemonOk = Boolean(String(FEATURES.lemonCheckout?.calcUnlock || '').trim());
  btn.disabled = !slug || !hasRealOptions || !lemonOk;

  if (slug && hasRealOptions) {
    const label = sel.selectedOptions[0]?.textContent || slug;
    btn.textContent = typeof t.unlockFor === 'function' ? t.unlockFor(label) : t.unlockBtn;
  } else {
    btn.textContent = t.unlockBtn;
  }
}

/**
 * @param {typeof TX.es} t
 * @param {string} preselect
 */
function mountCalcUnlockCheckoutBlock(t, preselect = '') {
  const block = document.getElementById('coUnlockBlock');
  const sel = document.getElementById('coUnlockCalc');
  const btn = document.getElementById('coUnlockCalcBtn');
  if (!(block instanceof HTMLElement) || !(sel instanceof HTMLSelectElement)) return;

  block.hidden = false;
  if (btn instanceof HTMLButtonElement) btn.disabled = true;
  sel.disabled = true;
  sel.setAttribute('aria-busy', 'true');

  try {
    const options = sortedUnlockCalcOptions(getLang());
    if (!options.length) throw new Error('unlock_options_empty');

    const en = getLang() === 'en';
    sel.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = t.unlockPick;
    sel.appendChild(placeholder);

    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt.slug;
      o.textContent = en ? opt.en : opt.es;
      sel.appendChild(o);
    }

    const fromUrl = String(preselect || '').trim();
    if (fromUrl && [...sel.options].some((o) => o.value === fromUrl)) {
      sel.value = fromUrl;
    }

    sel.disabled = false;
    sel.removeAttribute('aria-busy');
    sel.onchange = () => syncUnlockCalcControls(t);
    syncUnlockCalcControls(t);
  } catch (_) {
    sel.innerHTML = '';
    const err = document.createElement('option');
    err.value = '';
    err.textContent = t.unlockLoadError || t.unlockLoading;
    sel.appendChild(err);
    sel.disabled = true;
    sel.removeAttribute('aria-busy');
    if (btn instanceof HTMLButtonElement) btn.disabled = true;
  }
}
