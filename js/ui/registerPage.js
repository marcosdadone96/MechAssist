/**
 * Registro: cuenta local (demo) o servidor Netlify según FEATURES.useServerAuth.
 */

import { FEATURES } from '../config/features.js';
import { registerAccount, loginAccount, getCurrentUser, clearLocalUser } from '../services/accountAuth.js';
import { consumeSessionEndedReason } from '../services/authSessionClient.js';
import { refreshCreditsAfterAuth, clearCreditsCache } from '../services/creditsApi.js';
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
    docTitle: 'Registro \u2014 TheMechAssist',
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
      emailChipServer: {
        title: 'Recibir\u00e1s un enlace de verificaci\u00f3n en este correo.',
        aria: 'Ayuda: email.',
      },
      pwChip: {
        title: 'M\u00ednimo 8 caracteres.',
        aria: 'Ayuda: contrase\u00f1a.',
      },
      pw2Chip: {
        title: 'Debe coincidir con el campo anterior.',
        aria: 'Ayuda: confirmar contrase\u00f1a.',
      },
    },
    heading: 'Crear cuenta',
    lead:
      'Registro de demostraci\u00f3n en este navegador. No se env\u00edan datos a ning\u00fan servidor; la contrase\u00f1a no se guarda en claro, solo se usa para comprobar la sesi\u00f3n local.',
    leadServer:
      'Te enviaremos un correo con un enlace para confirmar tu direcci\u00f3n. Despu\u00e9s podr\u00e1s iniciar sesi\u00f3n desde cualquier p\u00e1gina.',
    nameLabel: 'Nombre completo',
    namePh: 'Ej. Ana Garc\u00eda',
    emailLabel: 'Correo electr\u00f3nico',
    emailPh: 'correo@ejemplo.com',
    pwLabel: 'Contrase\u00f1a',
    pwPh: 'M\u00ednimo 8 caracteres',
    pw2Label: 'Confirmar contrase\u00f1a',
    pw2Ph: 'Repita la contrase\u00f1a',
    submit: 'Crear cuenta',
    terms:
      'Esta cuenta es solo local (demo) y puede perderse al limpiar el almacenamiento del navegador o usar otro dispositivo.',
    termsServer:
      'La contrase\u00f1a se guarda de forma segura en el servidor (hash). Al iniciar sesi\u00f3n se emite una sesi\u00f3n en este navegador.',
    acceptLegalHtml:
      'He le\u00eddo y acepto los <a href="terms.html" target="_blank" rel="noopener">T\u00e9rminos</a> y la <a href="privacy.html" target="_blank" rel="noopener">Pol\u00edtica de privacidad</a>.',
    footerPrivacy: 'Privacidad',
    footerTrust: 'Confianza',
    footerTerms: 'T\u00e9rminos',
    footerCookies: 'Cookies',
    footerCookiePrefs: 'Preferencias cookies',
    linkHome: 'Volver al inicio',
    errMatch: 'Las contrase\u00f1as no coinciden.',
    errLegal: 'Debe aceptar los t\u00e9rminos y la pol\u00edtica de privacidad.',
    successTitle: 'Cuenta creada',
    successLead:
      'Ya puede usar las funciones que requieran identificaci\u00f3n en este navegador.',
    verifiedTitle: 'Correo verificado',
    verifiedLead:
      'Ya puede iniciar sesi\u00f3n con su correo y contrase\u00f1a desde el men\u00fa de la web.',
    pendingTitle: 'Revisa tu correo',
    pendingLead:
      'Te hemos enviado un enlace para confirmar tu cuenta. Caduca en 48 horas.',
    successBtn: 'Ir al inicio',
    signedInTitle: 'Ya tiene una sesi\u00f3n activa',
    signedInLead: (name) =>
      `Conectado como ${name}. Puede cerrar sesi\u00f3n para registrar otra cuenta en este dispositivo.`,
    logout: 'Cerrar sesi\u00f3n',
    goRegister: 'Usar otra cuenta',
    continueCheckout: 'Continuar al pago',
    verifyInvalid: 'El enlace de verificaci\u00f3n no es v\u00e1lido o ya se us\u00f3.',
    verifyExpired: 'El enlace ha caducado. Vuelva a registrarse.',
    verifyMissing: 'Falta el token de verificaci\u00f3n.',
    tabRegister: 'Crear cuenta',
    tabLogin: 'Iniciar sesi\u00f3n',
    loginHeading: 'Iniciar sesi\u00f3n',
    loginLead: 'Accede con el correo y la contrase\u00f1a de tu cuenta verificada.',
    loginSubmit: 'Entrar',
    sessionRevoked:
      'Tu sesi\u00f3n se cerr\u00f3 porque iniciaste sesi\u00f3n en otro dispositivo. Vuelve a iniciar sesi\u00f3n.',
    sessionExpired: 'Tu sesi\u00f3n ha expirado. Por favor, inicia sesi\u00f3n de nuevo.',
  },
  en: {
    docTitle: 'Register \u2014 TheMechAssist',
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
      emailChipServer: {
        title: 'You will receive a verification link at this address.',
        aria: 'Help: email.',
      },
      pwChip: {
        title: 'At least 8 characters.',
        aria: 'Help: password.',
      },
      pw2Chip: {
        title: 'Must match the password field above.',
        aria: 'Help: confirm password.',
      },
    },
    heading: 'Create account',
    lead:
      'Local demo sign-up in this browser only. Nothing is sent to a server; your password is not stored in plain text locally.',
    leadServer:
      'We will email you a link to confirm your address. You can then sign in from any page.',
    nameLabel: 'Full name',
    namePh: 'e.g. Jane Smith',
    emailLabel: 'Email',
    emailPh: 'you@example.com',
    pwLabel: 'Password',
    pwPh: 'At least 8 characters',
    pw2Label: 'Confirm password',
    pw2Ph: 'Re-enter password',
    submit: 'Create account',
    terms:
      'This account is local (demo) only and may be lost if you clear browser storage or use another device.',
    termsServer:
      'Your password is stored securely on the server (hash). Signing in keeps a session in this browser.',
    acceptLegalHtml:
      'I have read and accept the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a>.',
    footerPrivacy: 'Privacy',
    footerTrust: 'Trust',
    footerTerms: 'Terms',
    footerCookies: 'Cookies',
    footerCookiePrefs: 'Cookie settings',
    linkHome: 'Back to home',
    errMatch: 'Passwords do not match.',
    errLegal: 'You must accept the terms and privacy policy.',
    successTitle: 'Account created',
    successLead: 'You can now use features that require a local identity in this browser.',
    verifiedTitle: 'Email verified',
    verifiedLead: 'You can now sign in with your email and password from the site menu.',
    pendingTitle: 'Check your inbox',
    pendingLead: 'We sent you a link to confirm your account. It expires in 48 hours.',
    successBtn: 'Go to home',
    signedInTitle: 'You are already signed in',
    signedInLead: (name) =>
      `Signed in as ${name}. You can log out to register another account on this device.`,
    logout: 'Log out',
    goRegister: 'Use another account',
    continueCheckout: 'Continue to payment',
    verifyInvalid: 'This verification link is invalid or was already used.',
    verifyExpired: 'This link has expired. Please register again.',
    verifyMissing: 'Verification token is missing.',
    tabRegister: 'Create account',
    tabLogin: 'Sign in',
    loginHeading: 'Sign in',
    loginLead: 'Use your verified email and password.',
    loginSubmit: 'Sign in',
    sessionRevoked:
      'Your session ended because you signed in on another device. Please sign in again.',
    sessionExpired: 'Your session has expired. Please sign in again.',
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

  const server = FEATURES.useServerAuth === true;

  setTx('heading', t.heading);
  setTx('lead', server ? t.leadServer : t.lead);
  setTx('terms', server ? t.termsServer : t.terms);
  setTx('linkHome', t.linkHome);
  setTx('submit', t.submit);
  setTx('successTitle', t.successTitle);
  setTx('successLead', t.successLead);
  setTx('successBtn', t.successBtn);
  setTx('signedInTitle', t.signedInTitle);
  setTx('logout', t.logout);
  setTx('goRegister', t.goRegister);
  setTx('continueCheckout', t.continueCheckout);
  setTx('pendingTitle', t.pendingTitle);
  setTx('pendingLead', t.pendingLead);
  setTx('tabRegister', t.tabRegister);
  setTx('tabLogin', t.tabLogin);
  setTx('loginHeading', t.loginHeading);
  setTx('loginLead', t.loginLead);
  setTx('loginSubmit', t.loginSubmit);

  document.querySelectorAll('[data-reg-part]').forEach((el) => {
    const key = el.getAttribute('data-reg-part');
    if (key === 'acceptLegal' && t.acceptLegalHtml) {
      el.innerHTML = t.acceptLegalHtml;
      return;
    }
    if (key && t[key] != null) el.textContent = t[key];
  });

  const fp = document.querySelector('[data-reg-foot="privacy"]');
  const ftr = document.querySelector('[data-reg-foot="trust"]');
  const ft = document.querySelector('[data-reg-foot="terms"]');
  const fc = document.querySelector('[data-reg-foot="cookies"]');
  if (fp) fp.textContent = t.footerPrivacy;
  if (ftr) ftr.textContent = t.footerTrust;
  if (ft) ft.textContent = t.footerTerms;
  if (fc) fc.textContent = t.footerCookies;
  const fcp = document.querySelector('[data-reg-foot="cookiePrefs"]');
  if (fcp) fcp.textContent = t.footerCookiePrefs;

  document.querySelectorAll('[data-reg-tip]').forEach((el) => {
    const id = el.getAttribute('data-reg-tip');
    let chip =
      id === 'emailChip' && server ? t.chips?.emailChipServer : id && t.chips && t.chips[id];
    if (id === 'emailChip' && !server) chip = t.chips?.emailChip;
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

  const nav = document.querySelector('.site-nav__center');
  if (nav) nav.setAttribute('aria-label', t.navAria);
  const langGroup = document.querySelector('.site-nav__lang.hub-lang');
  if (langGroup) langGroup.setAttribute('aria-label', t.ariaLang);

  document.querySelectorAll('.hub-lang__btn[data-lang]').forEach((btn) => {
    const l = btn.getAttribute('data-lang');
    btn.classList.toggle('hub-lang__btn--active', l === lang);
  });

  const user = getCurrentUser();
  const signedLead = document.querySelector('[data-reg-tx="signedInLead"]');
  if (signedLead && user) signedLead.textContent = t.signedInLead(user.name);
}

function showError(msg, targetId = 'registerError') {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}

function showNotice(msg) {
  const el = document.getElementById('registerNotice');
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}

/**
 * @param {'register'|'login'} mode
 */
function setAuthMode(mode) {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('registerLoginForm');
  const isLogin = mode === 'login';
  if (registerForm instanceof HTMLElement) registerForm.hidden = isLogin;
  if (loginForm instanceof HTMLElement) loginForm.hidden = !isLogin;
  document.querySelectorAll('[data-reg-auth-tab]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const on = btn.getAttribute('data-reg-auth-tab') === mode;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

function wireAuthTabs() {
  document.querySelectorAll('[data-reg-auth-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-reg-auth-tab');
      if (mode === 'login' || mode === 'register') setAuthMode(mode);
    });
  });
}

function showAuthPanels() {
  const wrap = document.getElementById('registerAuthPanels');
  if (wrap instanceof HTMLElement) wrap.hidden = false;
}

export function mountRegisterPage() {
  try {
    document.documentElement.removeAttribute('data-guest-calc');
    import('./calcInputLock.js').then((m) => {
      m.unlockCalcInputs(document);
    });
  } catch (_) {
    /* ignore */
  }

  applyTx();

  window.addEventListener('home-language-changed', () => applyTx());

  const form = document.getElementById('registerForm');
  const signedIn = document.getElementById('registerSignedIn');
  const success = document.getElementById('registerSuccess');
  const pending = document.getElementById('registerPending');
  const lang = getLang();
  const t = TX[lang];
  const params = new URLSearchParams(window.location.search);

  const verifyParam = params.get('verify');
  if (verifyParam === 'invalid') showError(t.verifyInvalid);
  else if (verifyParam === 'expired') showError(t.verifyExpired);
  else if (verifyParam === 'missing') showError(t.verifyMissing);

  const sessionEnded = consumeSessionEndedReason();
  if (sessionEnded) {
    showNotice(sessionEnded === 'revoked' ? t.sessionRevoked : t.sessionExpired);
  }

  const authParam = params.get('auth');
  const preferLogin =
    authParam === 'login' || params.get('session') === 'replaced' || params.get('session') === 'expired';

  const user = getCurrentUser();

  if (user) {
    document.getElementById('registerAuthPanels')?.setAttribute('hidden', '');
    if (form) form.hidden = true;
    if (success) success.hidden = true;
    if (pending) pending.hidden = true;
    if (signedIn) signedIn.hidden = false;
    document.getElementById('btnLogoutSignedIn')?.addEventListener('click', async () => {
      await clearLocalUser();
      window.location.reload();
    });
    return;
  }

  if (params.get('verified') === '1') {
    document.getElementById('registerAuthPanels')?.setAttribute('hidden', '');
    if (form) form.hidden = true;
    if (pending) pending.hidden = true;
    if (signedIn) signedIn.hidden = true;
    if (success) {
      success.hidden = false;
      const st = success.querySelector('[data-reg-tx="successTitle"]');
      const sl = success.querySelector('[data-reg-tx="successLead"]');
      if (st) st.textContent = t.verifiedTitle;
      if (sl) sl.textContent = t.verifiedLead;
    }
    return;
  }

  if (signedIn) signedIn.hidden = true;
  if (success) success.hidden = true;
  if (pending) pending.hidden = true;

  showAuthPanels();
  wireAuthTabs();
  setAuthMode(preferLogin ? 'login' : 'register');

  const loginForm = document.getElementById('registerLoginForm');
  loginForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showError('', 'registerLoginError');
    const email = document.getElementById('regLoginEmail')?.value ?? '';
    const password = document.getElementById('regLoginPassword')?.value ?? '';
    try {
      await loginAccount({ email, password }, { lang });
      await refreshCreditsAfterAuth();
      const nextPath = getRegisterNextPath();
      if (nextPath && nextPath !== 'register.html') {
        window.location.href = nextPath;
        return;
      }
      window.location.href = 'index.html';
    } catch (e) {
      showError(String(e?.message || e), 'registerLoginError');
    }
  });

  form?.addEventListener('submit', async (ev) => {
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
      const result = await registerAccount({ name, email, password }, { lang });

      if (result && result.pendingVerification) {
        document.getElementById('registerAuthPanels')?.setAttribute('hidden', '');
        if (form) form.hidden = true;
        if (success) success.hidden = true;
        if (pending) pending.hidden = false;
        return;
      }

      await refreshCreditsAfterAuth();

      const nextPath = getRegisterNextPath();
      if (nextPath === 'checkout.html') {
        window.location.href = FEATURES.publicFreeRelease ? 'transmission-lab.html' : nextPath;
        return;
      }
      document.getElementById('registerAuthPanels')?.setAttribute('hidden', '');
      if (form) form.hidden = true;
      if (pending) pending.hidden = true;
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
