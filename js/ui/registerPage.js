/**
 * Registro: cuenta local (demo) o servidor Netlify según FEATURES.useServerAuth.
 */

import { FEATURES } from '../config/features.js';
import {
  registerAccount,
  loginAccount,
  requestPasswordReset,
  completePasswordReset,
  getCurrentUser,
  clearLocalUser,
} from '../services/accountAuth.js';
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
    navLab: 'Laboratorio de transmisi\u00f3n',
    chips: {
      nameChip: {
        title: 'Tu nombre completo; se mostrar\u00e1 en el panel de cuenta.',
        aria: 'Ayuda: nombre',
      },
      emailChip: {
        title: 'Solo para la demo local; no se env\u00eda a ning\u00fan servidor.',
        aria: 'Ayuda: correo electr\u00f3nico',
      },
      emailChipServer: {
        title: 'Recibir\u00e1s un enlace de verificaci\u00f3n en este correo.',
        aria: 'Ayuda: correo electr\u00f3nico',
      },
      pwChip: {
        title: 'M\u00ednimo 8 caracteres.',
        aria: 'Ayuda: contrase\u00f1a',
      },
      pw2Chip: {
        title: 'Debe coincidir con la contrase\u00f1a anterior.',
        aria: 'Ayuda: confirmar contrase\u00f1a',
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
    pwLabel: 'Contrase\u00f1a nueva',
    pwPh: 'M\u00ednimo 8 caracteres',
    pwRequirements:
      'M\u00ednimo 8 caracteres. Recomendamos mezclar letras, n\u00fameros y s\u00edmbolos.',
    toggleShowPw: 'Mostrar contrase\u00f1a',
    toggleHidePw: 'Ocultar contrase\u00f1a',
    pwStrengthVeryWeak: 'Muy d\u00e9bil',
    pwStrengthWeak: 'D\u00e9bil',
    pwStrengthFair: 'Aceptable',
    pwStrengthStrong: 'Fuerte',
    pwStrengthMeterAria: 'Fortaleza de la contrase\u00f1a',
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
    loginPwLabel: 'Contrase\u00f1a',
    forgotLink: '\u00bfOlvidaste tu contrase\u00f1a?',
    forgotHeading: 'Recuperar contrase\u00f1a',
    forgotLead:
      'Introduce tu correo y te enviaremos un enlace para elegir una contrase\u00f1a nueva.',
    forgotSubmit: 'Enviar enlace',
    forgotBack: 'Volver al inicio de sesi\u00f3n',
    forgotSent:
      'Si existe una cuenta con ese correo, recibir\u00e1s un enlace en los pr\u00f3ximos minutos. Revisa tambi\u00e9n la carpeta de spam.',
    resetHeading: 'Nueva contrase\u00f1a',
    resetLead: 'Elige una contrase\u00f1a nueva para tu cuenta (m\u00ednimo 8 caracteres).',
    resetPwLabel: 'Contrase\u00f1a nueva',
    resetPw2Label: 'Confirmar contrase\u00f1a',
    resetSubmit: 'Guardar contrase\u00f1a',
    resetBackLogin: 'Ir a iniciar sesi\u00f3n',
    resetDone:
      'Contrase\u00f1a actualizada. Ya puedes iniciar sesi\u00f3n con tu correo y la nueva clave.',
    sessionRevoked:
      'Tu sesi\u00f3n se cerr\u00f3 porque iniciaste sesi\u00f3n en otro dispositivo. Vuelve a iniciar sesi\u00f3n.',
    sessionExpired: 'Tu sesi\u00f3n ha expirado. Por favor, inicia sesi\u00f3n de nuevo.',
  },
  en: {
    docTitle: 'Register \u2014 TheMechAssist',
    ariaLang: 'Language selector',
    navAria: 'Main navigation',
    navHome: 'Home',
    navLab: 'Transmission lab',
    chips: {
      nameChip: {
        title: 'Your full name; shown in the account panel.',
        aria: 'Help: name',
      },
      emailChip: {
        title: 'For local demo only; nothing is sent to any server.',
        aria: 'Help: email address',
      },
      emailChipServer: {
        title: 'You will receive a verification link at this address.',
        aria: 'Help: email address',
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
    pwRequirements:
      'At least 8 characters. We recommend mixing letters, numbers and symbols.',
    toggleShowPw: 'Show password',
    toggleHidePw: 'Hide password',
    pwStrengthVeryWeak: 'Very weak',
    pwStrengthWeak: 'Weak',
    pwStrengthFair: 'Fair',
    pwStrengthStrong: 'Strong',
    pwStrengthMeterAria: 'Password strength',
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
    loginPwLabel: 'Password',
    forgotLink: 'Forgot your password?',
    forgotHeading: 'Reset password',
    forgotLead: 'Enter your email and we\u2019ll send you a link to choose a new password.',
    forgotSubmit: 'Send reset link',
    forgotBack: 'Back to sign in',
    forgotSent:
      'If an account exists for that email, you\u2019ll receive a link within a few minutes. Check your spam folder too.',
    resetHeading: 'New password',
    resetLead: 'Choose a new password for your account (at least 8 characters).',
    resetPwLabel: 'New password',
    resetPw2Label: 'Confirm password',
    resetSubmit: 'Save password',
    resetBackLogin: 'Go to sign in',
    resetDone: 'Password updated. You can now sign in with your email and new password.',
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
  setTx('pwRequirements', t.pwRequirements);
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

  updatePasswordToggleLabels();

  const meter = document.getElementById('regPwStrength');
  if (meter instanceof HTMLElement) {
    meter.setAttribute('aria-label', t.pwStrengthMeterAria);
  }

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
 * @param {'register'|'login'|'forgot'|'reset'} view
 */
function setAuthView(view) {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('registerLoginForm');
  const forgotForm = document.getElementById('registerForgotForm');
  const resetForm = document.getElementById('registerResetForm');
  const tabs = document.querySelector('.register-auth-tabs');

  if (registerForm instanceof HTMLElement) registerForm.hidden = view !== 'register';
  if (loginForm instanceof HTMLElement) loginForm.hidden = view !== 'login';
  if (forgotForm instanceof HTMLElement) forgotForm.hidden = view !== 'forgot';
  if (resetForm instanceof HTMLElement) resetForm.hidden = view !== 'reset';
  if (tabs instanceof HTMLElement) {
    tabs.hidden = view === 'forgot' || view === 'reset';
  }

  document.querySelectorAll('[data-reg-auth-tab]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const tab = btn.getAttribute('data-reg-auth-tab');
    const on = tab === view;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

/**
 * @param {'register'|'login'} mode
 */
function setAuthMode(mode) {
  setAuthView(mode === 'login' ? 'login' : 'register');
}

function wirePasswordRecovery(lang) {
  const t = TX[lang];
  const forgotBtn = document.getElementById('regForgotPasswordBtn');
  const forgotBack = document.getElementById('regForgotBackBtn');
  const forgotForm = document.getElementById('registerForgotForm');
  const resetForm = document.getElementById('registerResetForm');

  forgotBtn?.addEventListener('click', () => {
    const loginEmail = document.getElementById('regLoginEmail');
    const forgotEmail = document.getElementById('regForgotEmail');
    if (loginEmail instanceof HTMLInputElement && forgotEmail instanceof HTMLInputElement) {
      forgotEmail.value = loginEmail.value;
    }
    showError('', 'registerForgotError');
    showNotice('');
    setAuthView('forgot');
    forgotEmail?.focus();
  });

  forgotBack?.addEventListener('click', () => {
    showError('', 'registerForgotError');
    setAuthView('login');
  });

  forgotForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showError('', 'registerForgotError');
    const email = document.getElementById('regForgotEmail')?.value ?? '';
    try {
      await requestPasswordReset({ email }, { lang });
      setAuthView('login');
      showNotice(t.forgotSent);
    } catch (e) {
      showError(String(e?.message || e), 'registerForgotError');
    }
  });

  resetForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showError('', 'registerResetError');
    const token = resetForm instanceof HTMLFormElement ? resetForm.dataset.resetToken || '' : '';
    const password = document.getElementById('regResetPassword')?.value ?? '';
    const password2 = document.getElementById('regResetPassword2')?.value ?? '';
    if (password !== password2) {
      showError(t.errMatch, 'registerResetError');
      return;
    }
    if (!token) {
      showError(t.verifyInvalid, 'registerResetError');
      return;
    }
    try {
      await completePasswordReset({ token, password }, { lang });
      try {
        window.history.replaceState({}, '', 'register.html?auth=login&reset=done');
      } catch (_) {
        /* ignore */
      }
      setAuthView('login');
      if (resetForm instanceof HTMLFormElement) resetForm.hidden = true;
      showNotice(t.resetDone);
    } catch (e) {
      showError(String(e?.message || e), 'registerResetError');
    }
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

/**
 * @param {string} pw
 * @returns {0|1|2|3|4}
 */
function scorePasswordStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  if (hasSpecial) return 4;
  if (hasUpper || hasDigit) return 3;
  return 2;
}

function strengthLabelForLevel(level, t) {
  if (level === 1) return t.pwStrengthVeryWeak;
  if (level === 2) return t.pwStrengthWeak;
  if (level === 3) return t.pwStrengthFair;
  if (level === 4) return t.pwStrengthStrong;
  return '';
}

function updatePasswordStrengthUI() {
  const lang = getLang();
  const t = TX[lang];
  const input = document.getElementById('regPassword');
  const meter = document.getElementById('regPwStrength');
  const bar = meter?.querySelector('.register-pw-strength__bar');
  const label = document.getElementById('regPwStrengthLabel');
  if (!(input instanceof HTMLInputElement) || !(meter instanceof HTMLElement)) return;

  const level = scorePasswordStrength(input.value);
  const text = strengthLabelForLevel(level, t);

  for (let i = 0; i <= 4; i++) {
    meter.classList.toggle(`strength-${i}`, level === i);
  }

  if (bar instanceof HTMLElement) {
    bar.style.width = level > 0 ? `${(level / 4) * 100}%` : '0%';
  }
  if (label) label.textContent = text;
  meter.setAttribute('aria-valuenow', String(level));
  meter.setAttribute('aria-label', t.pwStrengthMeterAria);
}

function updatePasswordToggleLabels() {
  const t = TX[getLang()];
  document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const inp = btn.previousElementSibling;
    const showing = inp instanceof HTMLInputElement && inp.type === 'text';
    btn.setAttribute('aria-label', showing ? t.toggleHidePw : t.toggleShowPw);
  });
}

function wirePasswordToggle() {
  document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const inp = btn.previousElementSibling;
    if (!(inp instanceof HTMLInputElement)) return;

    btn.addEventListener('click', () => {
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.classList.toggle('is-showing', show);
      const eyeOff = btn.querySelector('.register-input__eye-off');
      const eyeOn = btn.querySelector('.register-input__eye-on');
      if (eyeOff instanceof SVGElement) eyeOff.hidden = show;
      if (eyeOn instanceof SVGElement) eyeOn.hidden = !show;
      updatePasswordToggleLabels();
    });
  });
  updatePasswordToggleLabels();
}

function wirePasswordStrength() {
  const input = document.getElementById('regPassword');
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener('input', updatePasswordStrengthUI);
  updatePasswordStrengthUI();
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

  window.addEventListener('home-language-changed', () => {
    applyTx();
    updatePasswordStrengthUI();
  });

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
  const resetToken = String(params.get('reset') || '').trim();
  const preferLogin =
    authParam === 'login' ||
    params.get('session') === 'replaced' ||
    params.get('session') === 'expired' ||
    params.get('reset') === 'done';

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
  wirePasswordToggle();
  wirePasswordStrength();
  wirePasswordRecovery(lang);

  if (resetToken && resetToken !== 'done') {
    const resetForm = document.getElementById('registerResetForm');
    if (resetForm instanceof HTMLFormElement) {
      resetForm.dataset.resetToken = resetToken;
    }
    setAuthView('reset');
    try {
      const clean = new URL(window.location.href);
      clean.searchParams.delete('reset');
      window.history.replaceState({}, '', clean.pathname + clean.search + clean.hash);
    } catch (_) {
      /* ignore */
    }
  } else {
    setAuthMode(preferLogin ? 'login' : 'register');
    if (params.get('reset') === 'done') {
      showNotice(t.resetDone);
    }
  }

  const loginForm = document.getElementById('registerLoginForm');
  loginForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    showError('', 'registerLoginError');
    const email = document.getElementById('regLoginEmail')?.value ?? '';
    const password = document.getElementById('regLoginPassword')?.value ?? '';
    try {
      await loginAccount({ email, password }, { lang });
      const u = getCurrentUser();
      if (!u?.email || !u?.serverAuth) {
        showError(
          lang === 'en'
            ? 'Sign-in did not complete. Try again.'
            : 'No se complet\u00f3 el inicio de sesi\u00f3n. Int\u00e9ntelo de nuevo.',
          'registerLoginError',
        );
        return;
      }
      try {
        sessionStorage.removeItem('mdr-session-ended');
      } catch (_) {
        /* ignore */
      }
      await refreshCreditsAfterAuth();
      const nextPath = getRegisterNextPath();
      const dest =
        nextPath && nextPath !== 'register.html' ? nextPath : 'index.html';
      window.location.replace(dest);
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
