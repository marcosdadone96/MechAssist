/**
 * Modo visitante (opcion B): presets demo; valores propios -> registro.
 */
import { isCreditsSystemEnabled } from '../config/credits.js';
import { getCurrentUser } from '../services/localAuth.js';
import { showCreditsModal } from './creditsUi.js';
import { findCalcInputsRoot, lockCalcInputs } from './calcInputLock.js';

function langEn() {
  return document.documentElement.lang?.toLowerCase().startsWith('en');
}

function registerUrl() {
  const file = location.pathname.split('/').pop() || '';
  const next = file ? `?next=${encodeURIComponent(file)}` : '';
  return `register.html${next}`;
}

/**
 * @param {HTMLElement} root
 */
function mountGuestBanner(root) {
  if (document.getElementById('guest-calc-banner')) return;
  const en = langEn();
  const bar = document.createElement('di' + 'v');
  bar.id = 'guest-calc-banner';
  bar.className = 'guest-calc-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = en
    ? `<p><strong>Demo mode.</strong> Try the example presets below. To use your own values and save results, <a href="${registerUrl()}">create a free account</a>.</p>`
    : `<p><strong>Modo demostraci\u00f3n.</strong> Prueba los ejemplos t\u00edpicos. Para usar tus valores y guardar resultados, <a href="${registerUrl()}">crea una cuenta gratuita</a>.</p>`;
  const head = root.querySelector('.lab-calc-page-head, .flat-sidebar__head, section.panel h2');
  if (head?.parentElement) {
    head.parentElement.insertBefore(bar, head.nextSibling);
  } else {
    root.prepend(bar);
  }
}

function showGuestRegisterModal() {
  const en = langEn();
  showCreditsModal({
    title: en ? 'Sign in to customize' : 'Reg\u00edstrate para personalizar',
    body: en
      ? 'You are viewing a demonstration. Create a free account to enter your own data, run full calculations and export PDFs.'
      : 'Est\u00e1s en modo demostraci\u00f3n. Crea una cuenta gratuita para introducir tus datos, calcular con tus valores y exportar PDF.',
    primaryLabel: en ? 'Create account' : 'Crear cuenta',
    primaryHref: registerUrl(),
    secondaryLabel: en ? 'Continue demo' : 'Seguir en demo',
    onSecondary: () => {},
  });
}

/**
 * Inicializa modo visitante en calculadoras y maquinas.
 */
export function initGuestCalcMode() {
  if (!isCreditsSystemEnabled()) return;
  if (getCurrentUser()?.email) return;

  const root =
    document.querySelector('main.lab-main') ||
    document.querySelector('main.app-main') ||
    document.querySelector('main');
  if (!(root instanceof HTMLElement)) return;

  document.documentElement.setAttribute('data-guest-calc', '1');
  mountGuestBanner(root);

  const inputsRoot = findCalcInputsRoot() || root;
  lockCalcInputs(inputsRoot, { allowPresets: true });

  inputsRoot.addEventListener(
    'focusin',
    (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches('input, select, textarea')) return;
      if (t.closest('.lab-presets-bar, [data-guest-allow]')) return;
      if (t.classList.contains('calc-input-locked')) {
        showGuestRegisterModal();
        t.blur();
      }
    },
    true,
  );
}
