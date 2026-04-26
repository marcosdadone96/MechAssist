/**
 * Pagina de registro local (demo): formulario accesible, ES/EN.
 */

import { getCurrentUser, registerLocalUser, clearLocalUser } from '../services/localAuth.js';
import { getRegisterNextPath } from '../services/proCheckoutFlow.js';

function getLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

const TX = {
  es: {
    docTitle: 'Registro \u2014 MechAssist',
    ariaLang: 'Selector de idioma',
    navAria: 'Navegaci\u00f3n principal',
    navHome: 'Inicio',
    navLab: 'Laboratorio',
    chips: {
      nameChip: {
        title: 'Se mostrar\u00e1 como saludo en el panel de cuenta.',
        aria: 'Ayuda: nombre.',
      },
      emailChip: {
        title: 'Solo para la demo local; no se env\u00eda a ning\u00fan servidor.',
        aria: 'Ayuda: email.',
      },
      pwChip: {
        title: 'M\u00ednimo 6 caracteres. No se almacena en el dispositivo.',
        aria: 'Ayuda: contrase\u00f1a.',
      },
      pw2Chip: {
        title: 'Debe coincidir con el campo anterior.',
        aria: 'Ayuda: confirmar contrase\u00f1a.',
      },
    },
    heading: 'Crear cuenta',
    lead:
      'Registro de demostraci\u00f3n en este navegador. No se env\u00edan datos a ning\u00fan servidor; la contrase\u00f1a no se guarda, solo se comprueba su longitud.',
    nameLabel: 'Nombre completo',
    namePh: 'Ej. Ana Garc\u00eda',
    emailLabel: 'Correo electr\u00f3nico',
    emailPh: 'correo@ejemplo.com',
    pwLabel: 'Contrase\u00f1a',
    pwPh: 'M\u00ednimo 6 caracteres',
    pw2Label: 'Confirmar contrase\u00f1a',
    pw2Ph: 'Repita la contrase\u00f1a',
    submit: 'Crear cuenta',
    terms:
      'Esta cuenta es solo local (demo) y puede perderse al limpiar el almacenamiento del navegador o usar otro dispositivo.',
    acceptLegalHtml:
      'He le\u00eddo y acepto los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a> y la <a href="privacy.html" target="_blank" rel="noopener">Pol\u00edtica de privacidad</a>.',
    footerPrivacy: 'Privacidad',
    footerTerms: 'T\u00e9rminos',
    footerCookies: 'Cookies',
    footerCookiePrefs: 'Preferencias cookies',
    linkHome: 'Volver al inicio',
    errMatch: 'Las contrase\u00f1as no coinciden.',
    errLegal: 'Debe aceptar los t\u00e9rminos y la pol\u00edtica de privacidad.',
    successTitle: 'Cuenta creada',
    successLead:
      'Ya puede usar las funciones que requieran identificaci\u00f3n en este navegador.',
    successBtn: 'Ir al inicio',
    signedInTitle: 'Ya tiene una sesi\u00f3n activa',
    signedInLead: (name) =>
      `Conectado como ${name}. Puede cerrar sesi\u00f3n para registrar otra cuenta en este dispositivo.`,
    logout: 'Cerrar sesi\u00f3n',
    goRegister: 'Usar otra cuenta',
    continueCheckout: 'Continuar al pago',
  },
  en: {
    docTitle: 'Register \u2014 MechAssist',
    ariaLang: 'Language selector',
    navAria: 'Main navigation',
    navHome: 'Home',
    navLab: 'Lab',
    chips: {
      nameChip: {
        title: 'Shown in the account greeting on the hub.',
        aria: 'Help: name.',
      },
      emailChip: {
        title: 'For local demo only; nothing is sent to any server.',
        aria: 'Help: email.',
      },
      pwChip: {
        title: 'At least 6 characters. It is not stored on the device.',
        aria: 'Help: password.',
      },
      pw2Chip: {
        title: 'Must match the password field above.',
        aria: 'Help: confirm password.',
      },
    },
    heading: 'Create account',
    lead:
      'Local demo sign-up in this browser only. Nothing is sent to a server; your password is not stored\u2014only its length is checked.',
    nameLabel: 'Full name',
    namePh: 'e.g. Jane Smith',
    emailLabel: 'Email',
    emailPh: 'you@example.com',
    pwLabel: 'Password',
    pwPh: 'At least 6 characters',
    pw2Label: 'Confirm password',
    pw2Ph: 'Re-enter password',
    submit: 'Create account',
    terms:
      'This account is local (demo) only and may be lost if you clear browser storage or use another device.',
    acceptLegalHtml:
      'I have read and accept the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a>.',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
    footerCookies: 'Cookies',
    linkHome: 'Back to home',
    errMatch: 'Passwords do not match.',
    errLegal: 'You must accept the terms and privacy policy.',
    successTitle: 'Account created',
    successLead: 'You can now use features that require a local identity in this browser.',
    successBtn: 'Go to home',
    signedInTitle: 'You are already signed in',
    signedInLead: (name) =>
      `Signed in as ${name}. You can log out to register another account on this device.`,
    logout: 'Log out',
    goRegister: 'Use another account',
    continueCheckout: 'Continue to payment',
  },
};

function applyTx() {
  const lang = getLang();
  const t = TX[lang];
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';
  document.title = t.docTitle;

  const setTx = (key, val) => {
    document.querySelectorAll(`[data-reg-tx="${key}"]`).forEach((el) => {
      el.textContent = val;
    });
  };

  setTx('navHome', t.navHome);
  setTx('navLab', t.navLab);
  setTx('heading', t.heading);
  setTx('lead', t.lead);
  setTx('terms', t.terms);
  setTx('linkHome', t.linkHome);
  setTx('submit', t.submit);
  setTx('successTitle', t.successTitle);
  setTx('successLead', t.successLead);
  setTx('successBtn', t.successBtn);
  setTx('signedInTitle', t.signedInTitle);
  setTx('logout', t.logout);
  setTx('goRegister', t.goRegister);
  setTx('continueCheckout', t.continueCheckout);

  document.querySelectorAll('[data-reg-part]').forEach((el) => {
    const key = el.getAttribute('data-reg-part');
    if (key === 'acceptLegal' && t.acceptLegalHtml) {
      el.innerHTML = t.acceptLegalHtml;
      return;
    }
    if (key && t[key] != null) el.textContent = t[key];
  });

  const fp = document.querySelector('[data-reg-foot="privacy"]');
  const ft = document.querySelector('[data-reg-foot="terms"]');
  const fc = document.querySelector('[data-reg-foot="cookies"]');
  if (fp) fp.textContent = t.footerPrivacy;
  if (ft) ft.textContent = t.footerTerms;
  if (fc) fc.textContent = t.footerCookies;
  const fcp = document.querySelector('[data-reg-foot="cookiePrefs"]');
  if (fcp) fcp.textContent = t.footerCookiePrefs;

  document.querySelectorAll('[data-reg-tip]').forEach((el) => {
    const id = el.getAttribute('data-reg-tip');
    const chip = id && t.chips && t.chips[id];
    if (chip) {
      el.title = chip.title;
      el.setAttribute('aria-label', chip.aria);
    }
  });

  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regPassword2 = document.getElementById('regPassword2');
  if (regName) regName.placeholder = t.namePh;
  if (regEmail) regEmail.placeholder = t.emailPh;
  if (regPassword) regPassword.placeholder = t.pwPh;
  if (regPassword2) regPassword2.placeholder = t.pw2Ph;

  const nav = document.querySelector('.app-header nav');
  if (nav) nav.setAttribute('aria-label', t.navAria);
  const langGroup = document.getElementById('registerLang');
  if (langGroup) langGroup.setAttribute('aria-label', t.ariaLang);

  document.querySelectorAll('[data-register-lang]').forEach((btn) => {
    const l = btn.getAttribute('data-register-lang');
    btn.classList.toggle('hub-lang__btn--active', l === lang);
  });

  const user = getCurrentUser();
  const signedLead = document.querySelector('[data-reg-tx="signedInLead"]');
  if (signedLead && user) signedLead.textContent = t.signedInLead(user.name);
}

function showError(msg) {
  const el = document.getElementById('registerError');
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}

export function mountRegisterPage() {
  applyTx();

  document.querySelectorAll('[data-register-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const l = btn.getAttribute('data-register-lang');
      try {
        localStorage.setItem('mdr-home-lang', l === 'en' ? 'en' : 'es');
      } catch (_) {
        /* ignore */
      }
      window.location.reload();
    });
  });

  const form = document.getElementById('registerForm');
  const signedIn = document.getElementById('registerSignedIn');
  const success = document.getElementById('registerSuccess');
  const user = getCurrentUser();
  const lang = getLang();
  const t = TX[lang];

  if (user) {
    if (form) form.hidden = true;
    if (success) success.hidden = true;
    if (signedIn) signedIn.hidden = false;
    document.getElementById('btnLogoutSignedIn')?.addEventListener('click', () => {
      clearLocalUser();
      window.location.reload();
    });
    return;
  }

  if (signedIn) signedIn.hidden = true;
  if (success) success.hidden = true;

  form?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    showError('');
    const name = document.getElementById('regName')?.value ?? '';
    const email = document.getElementById('regEmail')?.value ?? '';
    const password = document.getElementById('regPassword')?.value ?? '';
    const password2 = document.getElementById('regPassword2')?.value ?? '';

    if (password !== password2) {
      showError(t.errMatch);
      return;
    }

    const accept = document.getElementById('regAcceptLegal');
    if (!accept || !accept.checked) {
      showError(t.errLegal);
      return;
    }

    try {
      registerLocalUser({ name, email, password }, { lang });
      const nextPath = getRegisterNextPath();
      if (nextPath === 'checkout.html') {
        window.location.href = nextPath;
        return;
      }
      if (form) form.hidden = true;
      if (success) success.hidden = false;
      try {
        window.history.replaceState({}, '', `${window.location.pathname}?registered=1`);
      } catch (_) {
        /* ignore */
      }
    } catch (e) {
      showError(String(e?.message || e));
    }
  });
}
