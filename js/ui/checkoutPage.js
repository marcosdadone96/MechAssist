/**
 * Pagina de pago Pro (demo local + gancho Stripe).
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from '../services/localAuth.js';
import { grantProLicensePersistent, isPremiumEffective } from '../services/accessTier.js';
import { claimAndVerifyProAfterCheckout } from '../services/proEntitlement.js';
import { buildRegisterUrlWithNextCheckout, getHomeLang } from '../services/proCheckoutFlow.js';

function getLang() {
  return getHomeLang();
}

const TX = {
  es: {
    docTitle: 'Pago Pro \u2014 MechAssist',
    navHome: 'Inicio',
    navRegister: 'Registro',
    eyebrow: 'MechAssist',
    title: 'Plan Pro',
    lead:
      'Elija facturacion mensual o anual. El pago lo procesa Lemon Squeezy; tras completarlo recibira confirmacion y podra gestionar la suscripcion desde su correo o panel del proveedor.',
    signedAs: (name, email) => `Sesion: ${name} (${email})`,
    stripeBtn: 'Pagar con tarjeta (Stripe)',
    monthlyPlan: 'Plan mensual \u2014 9 \u20ac/mes',
    annualPlan: 'Plan anual \u2014 79 \u20ac/a\u00f1o',
    checkoutPayNote:
      'El cobro lo gestiona Lemon Squeezy (checkout seguro). Use uno de los planes anteriores; si tambien ve la opcion Stripe, sera alternativa segun configuracion.',
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
    footTerms: 'T\u00e9rminos',
    footCookies: 'Cookies',
    footCookiePrefs: 'Preferencias cookies',
    manageTitle: 'Gestionar o cancelar la suscripci\u00f3n Pro',
    manageLeadPortal:
      'Si ya paga MechAssist Pro, puede abrir el portal de facturaci\u00f3n para renovaci\u00f3n autom\u00e1tica, facturas, m\u00e9todo de pago o baja del plan.',
    manageLeadNoPortal:
      'Para cancelar la renovaci\u00f3n o cambiar datos de cobro, use el enlace que env\u00eda su pasarela por correo o escr\u00edbanos.',
    manageBtn: 'Abrir gesti\u00f3n de suscripci\u00f3n',
    manageMailPrefix: 'Contacto facturaci\u00f3n:',
    manageTermsRef:
      'Detalle jur\u00eddico: secci\u00f3n <strong>Renovaci\u00f3n y cancelaci\u00f3n</strong> en los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos de uso</a>.',
    proWelcomeTitle: '\u00a1Gracias! Acceso Pro activado en este navegador.',
    proWelcomeBody:
      'Ya puede usar las calculadoras y modulos Pro. Si no ve el plan actualizado, abra el inicio o recargue la pesta\u00f1a.',
    proWelcomePending:
      'Pago registrado en la URL. Si no tiene Pro a\u00fan (pol\u00edtica del sitio o modo producci\u00f3n), espere la confirmaci\u00f3n por correo o contacte soporte.',
  },
  en: {
    docTitle: 'Pro checkout \u2014 MechAssist',
    navHome: 'Home',
    navRegister: 'Register',
    eyebrow: 'MechAssist',
    title: 'Pro plan',
    lead:
      'Choose monthly or yearly billing. Payment is processed by Lemon Squeezy; after checkout you will receive confirmation and can manage the subscription via email or the provider dashboard.',
    signedAs: (name, email) => `Signed in: ${name} (${email})`,
    stripeBtn: 'Pay with card (Stripe)',
    monthlyPlan: 'Monthly plan \u2014 \u20ac9/month',
    annualPlan: 'Annual plan \u2014 \u20ac79/year',
    checkoutPayNote:
      'Checkout is handled by Lemon Squeezy (secure). Use one of the plan buttons above; if a Stripe option appears, it is an alternative depending on configuration.',
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
    footTerms: 'Terms',
    footCookies: 'Cookies',
    footCookiePrefs: 'Cookie settings',
    manageTitle: 'Manage or cancel Pro subscription',
    manageLeadPortal:
      'If you already pay for MechAssist Pro, open your billing portal to manage auto-renewal, invoices, payment method or cancel renewal.',
    manageLeadNoPortal:
      'To cancel renewal or change billing details, use the link from your payment provider emails or contact us.',
    manageBtn: 'Open subscription management',
    manageMailPrefix: 'Billing contact:',
    manageTermsRef:
      'Legal detail: <strong>Renewal and cancellation</strong> in the <a href="terms.html" target="_blank" rel="noopener">Terms of use</a>.',
    proWelcomeTitle: 'Thank you! Pro access is enabled in this browser.',
    proWelcomeBody: 'You can use Pro calculators and modules. If your plan does not update, open home or reload this tab.',
    proWelcomePending:
      'Payment flag received. If Pro is not active yet (site policy or production mode), wait for your confirmation email or contact support.',
  },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {typeof TX.es} t
 * @param {boolean} premiumEffective
 */
function showProWelcomeMessage(t, premiumEffective) {
  const el = document.getElementById('coProWelcome');
  if (!el) return;
  el.hidden = false;
  if (premiumEffective) {
    el.innerHTML = `<strong>${escapeHtml(t.proWelcomeTitle)}</strong><span class="checkout-pro-welcome__sub">${escapeHtml(
      t.proWelcomeBody,
    )}</span>`;
  } else {
    el.textContent = t.proWelcomePending;
  }
}

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
  set('coDemoNote', t.checkoutPayNote);
  const m = document.getElementById('coLemonMonthly');
  const ann = document.getElementById('coLemonAnnual');
  if (m) m.textContent = t.monthlyPlan;
  if (ann) ann.textContent = t.annualPlan;
  const bh = document.getElementById('coBackHome');
  if (bh) bh.textContent = t.backHome;
  const legal = document.getElementById('coLegalLinks');
  if (legal && t.legalLinks) legal.innerHTML = t.legalLinks;
  const f1 = document.getElementById('coFootPrivacy');
  const f2 = document.getElementById('coFootTerms');
  const f3 = document.getElementById('coFootCookies');
  if (f1) f1.textContent = t.footPrivacy;
  if (f2) f2.textContent = t.footTerms;
  if (f3) f3.textContent = t.footCookies;
  const f4 = document.getElementById('coFootCookiePrefs');
  if (f4) f4.textContent = t.footCookiePrefs;
  const stripeBtn = document.getElementById('coPayStripe');
  if (stripeBtn) stripeBtn.textContent = t.stripeBtn;
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
  const lang = getLang();
  const t = TX[lang];

  if (!getCurrentUser()) {
    window.location.replace(buildRegisterUrlWithNextCheckout());
    return;
  }

  let paidReturnWelcome = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paid') === '1') {
      const user = getCurrentUser();
      if (FEATURES.proClientPolicy === 'production') {
        await claimAndVerifyProAfterCheckout(user?.email);
      } else {
        grantProLicensePersistent();
      }
      const path = window.location.pathname || '/checkout.html';
      history.replaceState({}, '', path);
      paidReturnWelcome = true;
    }
  } catch (_) {
    /* ignore */
  }

  applyTx(t);
  applyManageSubscriptionBlock(t);

  const user = getCurrentUser();
  const line = document.getElementById('coUserLine');
  if (line && user) line.textContent = t.signedAs(user.name, user.email);

  const stripeBtn = document.getElementById('coPayStripe');
  const blockedEl = document.getElementById('coCheckoutBlocked');
  const useStripe =
    FEATURES.stripePayments === true &&
    typeof FEATURES.stripeCheckoutSessionUrl === 'string' &&
    FEATURES.stripeCheckoutSessionUrl.length > 0;

  const hasLemonSqueezy = Boolean(document.getElementById('coLemonMonthly'));

  if (!useStripe && !hasLemonSqueezy && blockedEl) {
    blockedEl.hidden = false;
    blockedEl.textContent = t.paymentNotConfigured;
  } else if (blockedEl) {
    blockedEl.hidden = true;
  }

  document.getElementById('coWithdrawalWaive')?.addEventListener('change', () => {
    const err = document.getElementById('coWithdrawalError');
    if (err) err.hidden = true;
  });

  if (stripeBtn) {
    stripeBtn.hidden = !useStripe;
    if (useStripe) {
      stripeBtn.addEventListener('click', () => {
        if (!assertWithdrawalOrShowError(t)) return;
        window.location.href = FEATURES.stripeCheckoutSessionUrl;
      });
    }
  }

  ['coLemonMonthly', 'coLemonAnnual'].forEach((id) => {
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

  if (paidReturnWelcome) {
    showProWelcomeMessage(t, isPremiumEffective());
  }
}
