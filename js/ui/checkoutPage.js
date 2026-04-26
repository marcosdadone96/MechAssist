/**
 * Pagina de pago Pro (demo local + gancho Stripe).
 */

import { FEATURES } from '../config/features.js';
import { getCurrentUser } from '../services/localAuth.js';
import { grantProLicensePersistent } from '../services/accessTier.js';
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
      'Acceso completo a modulos Pro en este navegador. En produccion aqui se cargaria Stripe Checkout u otro proveedor; el webhook confirmaria el pago y activaria la licencia.',
    signedAs: (name, email) => `Sesion: ${name} (${email})`,
    stripeBtn: 'Pagar con tarjeta (Stripe)',
    demoBtn: 'Simular pago completado (demo)',
    demoNote:
      'En desarrollo use el boton de simulacion para otorgar Pro sin pasarela. No introduzca datos reales de pago en esta demo.',
    withdrawalLabelHtml:
      'Solicito el <strong>suministro inmediato</strong> del contenido digital (acceso Pro en este navegador) y, cuando act\u00fae como consumidor en la UE, <strong>renuncio expresamente</strong> al derecho de desistimiento respecto de ese suministro inmediato, en los t\u00e9rminos previstos por la normativa aplicable. He le\u00eddo los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a>.',
    withdrawalHelp:
      'Si no marca esta casilla no puede completar la compra con entrega digital inmediata. Para otro modo de contrataci\u00f3n, contacte antes de pagar.',
    withdrawalRequired: 'Debe aceptar la renuncia al desistimiento para continuar.',
    paymentNotConfigured:
      'El pago en l\u00ednea no est\u00e1 configurado y la simulaci\u00f3n est\u00e1 desactivada. Configure Stripe en la aplicaci\u00f3n o active temporalmente el bot\u00f3n de simulaci\u00f3n en desarrollo.',
    backHome: 'Volver al inicio',
    legalLinks:
      'Al pagar acepta los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a> y la <a href="privacy.html" target="_blank" rel="noopener">Pol\u00edtica de privacidad</a>.',
    footPrivacy: 'Privacidad',
    footTerms: 'T\u00e9rminos',
    footCookies: 'Cookies',
    footCookiePrefs: 'Preferencias cookies',
  },
  en: {
    docTitle: 'Pro checkout \u2014 MechAssist',
    navHome: 'Home',
    navRegister: 'Register',
    eyebrow: 'MechAssist',
    title: 'Pro plan',
    lead:
      'Full Pro access in this browser. In production, Stripe Checkout (or your provider) would load here; your webhook would confirm payment and enable the license.',
    signedAs: (name, email) => `Signed in: ${name} (${email})`,
    stripeBtn: 'Pay with card (Stripe)',
    demoBtn: 'Simulate successful payment (demo)',
    demoNote:
      'In development, use the demo button to grant Pro without a gateway. Do not enter real card data in this demo.',
    withdrawalLabelHtml:
      'I request <strong>immediate supply</strong> of the digital content (Pro access in this browser) and, where I qualify as an EU consumer, I <strong>expressly waive</strong> the 14-day right of withdrawal once access is activated, as permitted for digital content (see your Terms). I have read the <a href="terms.html" target="_blank" rel="noopener">Terms</a>.',
    withdrawalHelp:
      'If you do not tick this box you cannot complete immediate digital delivery. Contact us before paying for other arrangements.',
    withdrawalRequired: 'You must accept the withdrawal waiver to continue.',
    paymentNotConfigured:
      'Online payment is not configured and the demo completion button is off. Enable Stripe in settings or turn the demo button on for internal testing.',
    backHome: 'Back to home',
    legalLinks:
      'By paying you accept the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a>.',
    footPrivacy: 'Privacy',
    footTerms: 'Terms',
    footCookies: 'Cookies',
    footCookiePrefs: 'Cookie settings',
  },
};

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
  set('coDemoNote', t.demoNote);
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
  const demoBtn = document.getElementById('coDemoComplete');
  if (demoBtn) demoBtn.textContent = t.demoBtn;
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

export function mountCheckoutPage() {
  const lang = getLang();
  const t = TX[lang];

  if (!getCurrentUser()) {
    window.location.replace(buildRegisterUrlWithNextCheckout());
    return;
  }

  applyTx(t);
  const user = getCurrentUser();
  const line = document.getElementById('coUserLine');
  if (line && user) line.textContent = t.signedAs(user.name, user.email);

  const stripeBtn = document.getElementById('coPayStripe');
  const demoBtn = document.getElementById('coDemoComplete');
  const blockedEl = document.getElementById('coCheckoutBlocked');
  const useStripe =
    FEATURES.stripePayments === true &&
    typeof FEATURES.stripeCheckoutSessionUrl === 'string' &&
    FEATURES.stripeCheckoutSessionUrl.length > 0;

  const showDemo = FEATURES.showDemoCheckoutCompleteButton === true;
  if (demoBtn) demoBtn.hidden = !showDemo;

  if (!useStripe && !showDemo && blockedEl) {
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

  demoBtn?.addEventListener('click', () => {
    if (!assertWithdrawalOrShowError(t)) return;
    grantProLicensePersistent();
    window.location.href = 'index.html';
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
