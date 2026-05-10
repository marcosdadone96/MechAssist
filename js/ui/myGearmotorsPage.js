/**
 * Pagina dedicada: biblioteca de motorreductores en Supabase (TheMechAssist Cloud).
 */

import { getCurrentLang, setCurrentLang } from '../config/locales.js';
import {
  listUserGearmotors,
  addUserGearmotor,
  removeUserGearmotor,
  updateUserGearmotor,
  USER_GEARMOTOR_CHANGED_EVENT,
  MAX_USER_GEARMOTORS,
  ensureGearmotorsCacheLoaded,
  subscribeUserGearmotorsRealtime,
} from '../services/userGearmotorLibrary.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { isPremiumViaQueryProUiAllowed, isPublicFreeRelease } from '../config/features.js';
import { getCurrentUser } from '../services/localAuth.js';
import { startProCheckoutFlow, buildRegisterUrlWithNextCheckout } from '../services/proCheckoutFlow.js';

const LEMON_CHECKOUT_MONTHLY_URL =
  'https://mechassist.lemonsqueezy.com/checkout/buy/acd30d30-72e7-4434-827e-e51487e492ca';
const LEMON_CHECKOUT_ANNUAL_URL =
  'https://mechassist.lemonsqueezy.com/checkout/buy/bfd83e87-ac81-46ad-a5cf-2c2c94b1d70d';

/** Textos del paywall (solo visitantes sin Pro). */
const PAYWALL = {
  es: {
    docTitle: 'Mis motorreductores (Pro) \u2014 TheMechAssist',
    eyebrow: 'Plan Pro',
    h1: 'Biblioteca de motorreductores',
    lead:
      'Guarde placas y datos de ficha en TheMechAssist Cloud y reutilice sus equipos en todas las calculadoras. Funci\u00f3n incluida en TheMechAssist Pro.',
    unlockHint: 'Elija una suscripci\u00f3n mensual o anual para desbloquear esta biblioteca.',
    monthlyPlan: 'Plan mensual \u2014 9 \u20ac/mes',
    annualPlan: 'Plan anual \u2014 79 \u20ac/a\u00f1o',
    secureNote: 'Pago seguro procesado por Lemon Squeezy.',
    cta: 'Checkout TheMechAssist',
    plans: 'Ver precios en inicio',
    footnote: 'O bien registro y pago en el flujo de la web:',
    back: 'Volver al inicio',
  },
  en: {
    docTitle: 'My gearmotors (Pro) \u2014 TheMechAssist',
    eyebrow: 'Pro plan',
    h1: 'Gearmotor library',
    lead:
      'Save nameplate data to TheMechAssist Cloud and reuse units on every calculator. Included with TheMechAssist Pro.',
    unlockHint: 'Choose monthly or yearly billing to unlock this library.',
    monthlyPlan: 'Monthly plan \u2014 \u20ac9/month',
    annualPlan: 'Annual plan \u2014 \u20ac79/year',
    secureNote: 'Secure checkout powered by Lemon Squeezy.',
    cta: 'TheMechAssist checkout',
    plans: 'Pricing on home',
    footnote: 'Or register and pay through the site flow:',
    back: 'Back to home',
  },
};

/** @type {Record<'es'|'en', Record<string, string>>} */
const TX = {
  es: {
    title: 'Mis motorreductores',
    lead:
      'Cree aqu\u00ed su lista desde datos de placa o ficha. Los registros se guardan en <strong>TheMechAssist Cloud</strong> y puede usarlos en cada calculadora con <strong>Marca \u2192 Mis motorreductores guardados</strong>.',
    cloudStrip:
      'Sincronizado en tiempo real con TheMechAssist Cloud (Supabase): los cambios se reflejan entre pesta\u00f1as cuando hay conexi\u00f3n.',
    formH: 'A\u00f1adir o editar',
    label: 'Referencia / ubicaci\u00f3n',
    labelHint: 'Nombre para reconocerlo en la lista.',
    lblNotes: 'Notas (opcional)',
    notesHint: 'Hasta 500 caracteres; no afectan a la comprobaci\u00f3n.',
    t2peakHint: 'Opcional.',
    nmotorHint: 'Opcional.',
    etaHint: 'Opcional. Vac\u00edo: se usa 0,92 en verificaci\u00f3n. Puede escribir 0\u20131 o porcentaje (p. ej. 92).',
    submitAdd: 'Guardar en la nube',
    submitEdit: 'Actualizar en la nube',
    cancelEdit: 'Cancelar edici\u00f3n',
    listH: 'Lista en la nube',
    countLine: 'Entradas: {n} / {max}',
    loadCloudErr: 'No se pudo cargar desde la nube. Revise la conexi\u00f3n y la configuraci\u00f3n de Supabase.',
    saveCloudErr: 'No se pudo guardar en la nube (red o permisos).',
    thRef: 'Referencia',
    thPkW: '<em>P</em> (kW)',
    thN2: '<em>n</em><sub>2</sub> (min<sup>&minus;1</sup>)',
    thT2: '<em>T</em><sub>2</sub> (N&middot;m)',
    thAct: 'Acciones',
    lblMotorP: '<em>P</em> motor (kW)',
    lblN2: '<em>n</em><sub>2</sub> salida (min<sup>&minus;1</sup>)',
    lblT2: '<em>T</em><sub>2</sub> nominal (N&middot;m)',
    lblT2peak: '<em>T</em><sub>2</sub> pico (N&middot;m)',
    lblNmotor: '<em>n</em> motor (min<sup>&minus;1</sup>)',
    lblEta: '&eta; reductor (0&ndash;1 o %)',
    phLabel: 'ej. Nord SK42 \u00B7 l\u00EDnea 3',
    navMachines: 'M\u00e1quinas',
    edit: 'Editar',
    delete: 'Eliminar',
    empty: 'No hay motorreductores guardados todav\u00eda.',
    savedAdd: 'Guardado en TheMechAssist Cloud.',
    savedEdit: 'Actualizado en TheMechAssist Cloud.',
    deleted: 'Eliminado.',
    confirmDelete: '\u00bfEliminar este motorreductor de la lista?',
    docTitle: 'Mis motorreductores \u2014 TheMechAssist',
    ariaLang: 'Selector de idioma',
    errMotorKw: 'Indique una potencia de motor v\u00e1lida (kW &gt; 0).',
    errN2: 'Indique una velocidad de salida v\u00e1lida (min\u207b\u00b9 &gt; 0).',
    errT2: 'Indique un par nominal T\u2082 v\u00e1lido (N\u00b7m &gt; 0).',
    errT2peak: 'Si rellena T\u2082 pico, debe ser mayor que 0.',
    errNmotor: 'Si rellena n motor, debe ser al menos 1 min\u207b\u00b9.',
    errEta: 'Si rellena \u03b7, use un valor entre 0 y 1 (o porcentaje 1\u2013100).',
    maxListReached: 'La lista est\u00e1 llena ({max} entradas). Elimine una antes de a\u00f1adir m\u00e1s.',
    signInToSave: 'Inicie sesi\u00f3n para guardar motorreductores en TheMechAssist Cloud.',
  },
  en: {
    title: 'My gearmotors',
    lead:
      'Build your list from nameplate or datasheet data. Records are stored in <strong>TheMechAssist Cloud</strong> and available on every calculator via <strong>Brand \u2192 My saved gearmotors</strong>.',
    cloudStrip:
      'Real-time sync with TheMechAssist Cloud (Supabase): changes propagate across tabs when online.',
    formH: 'Add or edit',
    label: 'Reference / location',
    labelHint: 'Label used in dropdown lists.',
    lblNotes: 'Notes (optional)',
    notesHint: 'Up to 500 characters; not used in verification math.',
    t2peakHint: 'Optional.',
    nmotorHint: 'Optional.',
    etaHint: 'Optional. Empty defaults to 0.92 in verification. Enter 0\u20131 or percent (e.g. 92).',
    submitAdd: 'Save to cloud',
    submitEdit: 'Update in cloud',
    cancelEdit: 'Cancel edit',
    listH: 'Cloud list',
    countLine: 'Entries: {n} / {max}',
    loadCloudErr: 'Could not load from cloud. Check your connection and Supabase configuration.',
    saveCloudErr: 'Could not save to cloud (network or permissions).',
    thRef: 'Reference',
    thPkW: '<em>P</em> (kW)',
    thN2: '<em>n</em><sub>2</sub> (min<sup>&minus;1</sup>)',
    thT2: '<em>T</em><sub>2</sub> (N&middot;m)',
    thAct: 'Actions',
    lblMotorP: 'Motor <em>P</em> (kW)',
    lblN2: 'Output <em>n</em><sub>2</sub> (min<sup>&minus;1</sup>)',
    lblT2: '<em>T</em><sub>2</sub> rated (N&middot;m)',
    lblT2peak: '<em>T</em><sub>2</sub> peak (N&middot;m)',
    lblNmotor: 'Motor <em>n</em> (min<sup>&minus;1</sup>)',
    lblEta: '&eta; gearbox (0\u20131 or %)',
    phLabel: 'e.g. Nord SK42 &middot; line 3',
    navMachines: 'Machines',
    edit: 'Edit',
    delete: 'Remove',
    empty: 'No saved gearmotors yet.',
    savedAdd: 'Saved to TheMechAssist Cloud.',
    savedEdit: 'Updated in TheMechAssist Cloud.',
    deleted: 'Removed.',
    confirmDelete: 'Remove this gearmotor from the list?',
    docTitle: 'My gearmotors \u2014 TheMechAssist',
    ariaLang: 'Language selector',
    errMotorKw: 'Enter a valid motor power (kW &gt; 0).',
    errN2: 'Enter a valid output speed (rpm &gt; 0).',
    errT2: 'Enter a valid rated torque T\u2082 (N\u00b7m &gt; 0).',
    errT2peak: 'If T\u2082 peak is filled, it must be greater than 0.',
    errNmotor: 'If motor speed is filled, use at least 1 min\u207b\u00b9.',
    errEta: 'If efficiency is filled, use 0\u20131 or a percent between 1 and 100.',
    maxListReached: 'The list is full ({max} entries). Remove one before adding more.',
    signInToSave: 'Sign in to save gearmotors to TheMechAssist Cloud.',
  },
};

function lang() {
  return getCurrentLang() === 'en' ? 'en' : 'es';
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
function t(key, vars) {
  let s = TX[lang()][key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

function applyStaticCopy() {
  document.documentElement.lang = lang();
  document.title = t('docTitle');
  const titleEl = document.getElementById('gmPageTitle');
  const leadEl = document.getElementById('gmPageLead');
  if (titleEl) titleEl.textContent = t('title');
  if (leadEl) leadEl.innerHTML = t('lead');

  const cloudStrip = document.getElementById('gmCloudStrip');
  if (cloudStrip) cloudStrip.innerHTML = t('cloudStrip');
  const formH = document.getElementById('gmFormHeading');
  const listH = document.getElementById('gmListHeading');
  if (formH) formH.textContent = t('formH');
  if (listH) listH.textContent = t('listH');

  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  const lblRef = document.getElementById('gmLabelLbl');
  if (lblRef) lblRef.textContent = t('label');
  document.getElementById('gmLabelHint')?.replaceChildren(document.createTextNode(t('labelHint')));
  const labelIn = document.getElementById('gmLabel');
  if (labelIn instanceof HTMLInputElement) labelIn.placeholder = t('phLabel');

  document.getElementById('gmNotesLbl')?.replaceChildren(document.createTextNode(t('lblNotes')));
  document.getElementById('gmNotesHint')?.replaceChildren(document.createTextNode(t('notesHint')));

  setHtml('gmMotorKwLbl', t('lblMotorP'));
  setHtml('gmN2Lbl', t('lblN2'));
  setHtml('gmT2Lbl', t('lblT2'));
  setHtml('gmT2peakLbl', t('lblT2peak'));
  setHtml('gmNmotorLbl', t('lblNmotor'));
  setHtml('gmEtaLbl', t('lblEta'));

  document.getElementById('gmT2peakHint')?.replaceChildren(document.createTextNode(t('t2peakHint')));
  document.getElementById('gmNmotorHint')?.replaceChildren(document.createTextNode(t('nmotorHint')));
  document.getElementById('gmEtaHint')?.replaceChildren(document.createTextNode(t('etaHint')));

  document.getElementById('gmThRef')?.replaceChildren(document.createTextNode(t('thRef')));
  setHtml('gmThPkW', t('thPkW'));
  setHtml('gmThN2', t('thN2'));
  setHtml('gmThT2', t('thT2'));
  document.getElementById('gmThAct')?.replaceChildren(document.createTextNode(t('thAct')));
  document.getElementById('gmEmpty')?.replaceChildren(document.createTextNode(t('empty')));

  const navSelf = document.querySelector('.mygm-nav-txt[data-gm-nav-title]');
  if (navSelf) navSelf.textContent = t('title');

  document.getElementById('gmCancelBtn')?.replaceChildren(document.createTextNode(t('cancelEdit')));
  syncSubmitLabel();

  const host = document.getElementById('gmLangHost');
  if (host) host.setAttribute('aria-label', t('ariaLang'));
  document.querySelector('#gmLangHost .hub-lang')?.setAttribute('aria-label', t('ariaLang'));

  updateCountLine();
}

function syncSubmitLabel() {
  const btn = document.getElementById('gmSubmitBtn');
  const editId = document.getElementById('gmEditId');
  if (!btn || !editId) return;
  btn.textContent = editId.value ? t('submitEdit') : t('submitAdd');
}

function updateCountLine() {
  const el = document.getElementById('gmCount');
  if (!el) return;
  el.textContent = t('countLine', { n: listUserGearmotors().length, max: MAX_USER_GEARMOTORS });
}

/**
 * @returns {{ ok: true; payload: ReturnType<typeof readFormRaw> } | { ok: false; key: string }}
 */
function validateForm() {
  const p = readFormRaw();
  if (!Number.isFinite(p.motor_kW) || p.motor_kW <= 0) return { ok: false, key: 'errMotorKw' };
  if (!Number.isFinite(p.n2_rpm) || p.n2_rpm <= 0) return { ok: false, key: 'errN2' };
  if (!Number.isFinite(p.T2_nom_Nm) || p.T2_nom_Nm <= 0) return { ok: false, key: 'errT2' };
  if (p.T2_peak_Nm != null && (!Number.isFinite(p.T2_peak_Nm) || p.T2_peak_Nm <= 0))
    return { ok: false, key: 'errT2peak' };
  if (p.motor_rpm_nom != null && (!Number.isFinite(p.motor_rpm_nom) || p.motor_rpm_nom < 1))
    return { ok: false, key: 'errNmotor' };
  if (p.eta_g != null) {
    let e = p.eta_g;
    if (e > 1 && e <= 100) e /= 100;
    if (!Number.isFinite(e) || e <= 0 || e > 1) return { ok: false, key: 'errEta' };
  }
  return { ok: true, payload: p };
}

function readFormRaw() {
  const label = String(document.getElementById('gmLabel')?.value || '').trim();
  const motor_kW = parseFloat(String(document.getElementById('gmMotorKw')?.value || '').replace(',', '.'));
  const n2_rpm = parseFloat(String(document.getElementById('gmN2')?.value || '').replace(',', '.'));
  const T2_nom_Nm = parseFloat(String(document.getElementById('gmT2')?.value || '').replace(',', '.'));
  const t2pStr = String(document.getElementById('gmT2peak')?.value || '').trim();
  const T2_peak_Nm = t2pStr ? parseFloat(t2pStr.replace(',', '.')) : NaN;
  const nmStr = String(document.getElementById('gmNmotor')?.value || '').trim();
  const motor_rpm_nom = nmStr ? parseFloat(nmStr.replace(',', '.')) : NaN;
  const etaStr = String(document.getElementById('gmEta')?.value || '').trim();
  const etaRaw = etaStr ? parseFloat(etaStr.replace(',', '.')) : NaN;
  const notes = String(document.getElementById('gmNotes')?.value || '').trim();
  /** @type {{ label?: string; motor_kW: number; n2_rpm: number; T2_nom_Nm: number; T2_peak_Nm?: number; motor_rpm_nom?: number; eta_g?: number; notes?: string }} */
  const o = { label: label || undefined, motor_kW, n2_rpm, T2_nom_Nm };
  if (Number.isFinite(T2_peak_Nm) && T2_peak_Nm > 0) o.T2_peak_Nm = T2_peak_Nm;
  if (Number.isFinite(motor_rpm_nom) && motor_rpm_nom > 0) o.motor_rpm_nom = motor_rpm_nom;
  if (Number.isFinite(etaRaw) && etaRaw > 0) o.eta_g = etaRaw;
  if (notes) o.notes = notes.slice(0, 500);
  return o;
}
function clearForm() {
  const edit = document.getElementById('gmEditId');
  if (edit instanceof HTMLInputElement) edit.value = '';
  const ids = ['gmLabel', 'gmMotorKw', 'gmN2', 'gmT2', 'gmT2peak', 'gmNmotor', 'gmEta', 'gmNotes'];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = '';
  }
  const cancel = document.getElementById('gmCancelBtn');
  if (cancel instanceof HTMLElement) cancel.hidden = true;
  syncSubmitLabel();
}

/**
 * @param {import('../services/userGearmotorLibrary.js').UserGearmotorRecord} rec
 */
function fillForm(rec) {
  const edit = document.getElementById('gmEditId');
  if (edit instanceof HTMLInputElement) edit.value = rec.id;
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = v;
  };
  setVal('gmLabel', rec.label || '');
  setVal('gmMotorKw', String(rec.motor_kW));
  setVal('gmN2', String(rec.n2_rpm));
  setVal('gmT2', String(rec.T2_nom_Nm));
  setVal(
    'gmT2peak',
    rec.T2_peak_Nm != null && Number.isFinite(rec.T2_peak_Nm) ? String(rec.T2_peak_Nm) : '',
  );
  setVal(
    'gmNmotor',
    rec.motor_rpm_nom != null && Number.isFinite(rec.motor_rpm_nom) ? String(rec.motor_rpm_nom) : '',
  );
  setVal('gmEta', rec.eta_g != null && Number.isFinite(rec.eta_g) ? String(rec.eta_g) : '');
  setVal('gmNotes', rec.notes ? String(rec.notes) : '');
  const cancel = document.getElementById('gmCancelBtn');
  if (cancel instanceof HTMLElement) cancel.hidden = false;
  syncSubmitLabel();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function truncateNotes(s, max) {
  const t0 = String(s).trim();
  if (t0.length <= max) return t0;
  return `${t0.slice(0, max - 1)}\u2026`;
}

function renderTable() {
  const tbody = document.getElementById('gmTableBody');
  const empty = document.getElementById('gmEmpty');
  const table = document.getElementById('gmTable');
  if (!tbody || !empty || !table) return;
  const rows = listUserGearmotors().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  tbody.innerHTML = '';
  if (!rows.length) {
    empty.hidden = false;
    table.hidden = true;
    updateCountLine();
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  for (const r of rows) {
    const peakHtml =
      r.T2_peak_Nm != null && Number.isFinite(r.T2_peak_Nm)
        ? ` <span class="muted">&middot;</span> <em>T</em><sub>2p</sub> ${escapeHtml(Number(r.T2_peak_Nm).toFixed(1))}`
        : '';
    const noteRaw = r.notes ? String(r.notes) : '';
    const noteShort = noteRaw ? truncateNotes(noteRaw, 72) : '';
    const notesBlock = noteShort
      ? `<div class="muted" style="font-size:0.82em;margin-top:0.25rem" title="${escapeAttr(noteRaw)}">${escapeHtml(noteShort)}</div>`
      : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.label)}${notesBlock}</td>
      <td>${escapeHtml(String(r.motor_kW))}</td>
      <td>${escapeHtml(Number(r.n2_rpm).toFixed(1))}</td>
      <td>${escapeHtml(String(r.T2_nom_Nm))}${peakHtml}</td>
      <td class="gearmotor-db__actions">
        <button type="button" class="button button--ghost gearmotor-db__btn-icon" data-gm-edit="${escapeAttr(r.id)}">${escapeHtml(t('edit'))}</button>
        <button type="button" class="button button--ghost gearmotor-db__btn-icon" data-gm-del="${escapeAttr(r.id)}">${escapeHtml(t('delete'))}</button>
      </td>`;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-gm-edit]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-gm-edit');
      const rec = listUserGearmotors().find((x) => x.id === id);
      if (rec) fillForm(rec);
    });
  });
  tbody.querySelectorAll('[data-gm-del]').forEach((b) => {
    b.addEventListener('click', () => {
      void (async () => {
        const id = b.getAttribute('data-gm-del');
        if (!id || !window.confirm(t('confirmDelete'))) return;
        const removed = await removeUserGearmotor(id);
        if (removed) {
          flashStatus(t('deleted'), 'info');
          renderTable();
          const editing = document.getElementById('gmEditId')?.value;
          if (editing === id) clearForm();
        } else {
          flashStatus(t('saveCloudErr'), 'warn');
        }
      })();
    });
  });
  updateCountLine();
}

/**
 * @param {string} msg
 * @param {'info'|'warn'} [kind]
 */
function flashStatus(msg, kind = 'info') {
  const host = document.getElementById('gmStatusHost');
  if (!host) return;
  host.innerHTML = '';
  const el = document.createElement('p');
  el.id = 'gmStatus';
  el.setAttribute('role', 'status');
  el.className =
    kind === 'warn' ? 'design-alert design-alert--warn' : 'design-alert design-alert--info';
  el.style.marginTop = '0';
  el.textContent = msg;
  host.appendChild(el);
  window.clearTimeout(/** @type {any} */ (flashStatus)._t);
  /** @type {any} */ (flashStatus)._t = window.setTimeout(() => {
    host.innerHTML = '';
  }, 4200);
}

function initLangChrome() {
  const host = document.getElementById('gmLangHost');
  if (!host) return;
  host.innerHTML = `
    <div class="hub-lang site-nav__lang" role="group">
      <button type="button" class="hub-lang__btn site-nav__lang-btn" data-gm-lang="es" aria-pressed="false">ES</button>
      <span class="site-nav__lang-sep" aria-hidden="true">\u00b7</span>
      <button type="button" class="hub-lang__btn site-nav__lang-btn" data-gm-lang="en" aria-pressed="false">EN</button>
    </div>`;
  host.querySelector('.hub-lang')?.setAttribute('aria-label', t('ariaLang'));
  host.querySelectorAll('[data-gm-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const l = btn.getAttribute('data-gm-lang');
      if (l !== 'es' && l !== 'en') return;
      setCurrentLang(l);
      syncLangButtons();
      applyStaticCopy();
      renderTable();
    });
  });
  syncLangButtons();
}

function syncLangButtons() {
  const l = getCurrentLang();
  document.querySelectorAll('[data-gm-lang]').forEach((btn) => {
    const v = btn.getAttribute('data-gm-lang');
    const on = v === l;
    btn.classList.toggle('hub-lang__btn--active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function payLang() {
  return getCurrentLang() === 'en' ? 'en' : 'es';
}

function pw(key) {
  return PAYWALL[payLang()][key] || '';
}

/**
 * Sustituye el contenido principal si el usuario no tiene Pro efectivo.
 */
function mountGearmotorsPaywall() {
  const main = document.querySelector('main.app-main');
  const panel = main?.querySelector('.gearmotor-db');
  if (!(panel instanceof HTMLElement)) return;
  const proHref = isPremiumViaQueryProUiAllowed() ? '?pro=1' : buildRegisterUrlWithNextCheckout();
  document.documentElement.lang = payLang() === 'en' ? 'en' : 'es';
  document.title = pw('docTitle');
  const regLabel = payLang() === 'en' ? 'Register & checkout' : 'Registro y pago';

  const navSelf = document.querySelector('.mygm-nav-txt[data-gm-nav-title]');
  if (navSelf) navSelf.textContent = payLang() === 'en' ? 'My gearmotors' : 'Mis motorreductores';

  panel.innerHTML = `
    <header class="gearmotor-db__head gm-paywall-head">
      <p class="flat-sidebar__eyebrow gm-paywall-head__eyebrow">${escapeHtml(pw('eyebrow'))}</p>
      <h1 class="flat-sidebar__title" id="gmPageTitle">${escapeHtml(pw('h1'))}</h1>
      <p class="flat-sidebar__lead muted" id="gmPageLead">${escapeHtml(pw('lead'))}</p>
    </header>
    <div class="gm-paywall-card">
      <p class="gm-paywall-card__hint">${escapeHtml(pw('unlockHint'))}</p>
      <div class="gm-paywall-card__buttons">
        <a href="${escapeAttr(LEMON_CHECKOUT_MONTHLY_URL)}" class="button button--accent gm-paywall-card__plan" data-lemon-squeezy>${escapeHtml(
          pw('monthlyPlan'),
        )}</a>
        <a href="${escapeAttr(LEMON_CHECKOUT_ANNUAL_URL)}" class="button button--accent gm-paywall-card__plan" data-lemon-squeezy>${escapeHtml(
          pw('annualPlan'),
        )}</a>
      </div>
      <p class="gm-paywall-card__secure">${escapeHtml(pw('secureNote'))}</p>
      <div class="gm-paywall-card__secondary">
        <button type="button" class="button button--primary" data-gm-pro-upgrade>${escapeHtml(pw('cta'))}</button>
        <a class="button button--ghost" href="index.html#hub-pricing">${escapeHtml(pw('plans'))}</a>
      </div>
      <p class="gm-paywall-card__footnote">
        <span class="gm-paywall-card__footnote-label">${escapeHtml(pw('footnote'))}</span>
        <a class="gm-paywall-card__inline-link" href="${escapeAttr(proHref)}">${escapeHtml(regLabel)}</a>
      </p>
      <p class="gm-paywall-back"><a href="index.html">${escapeHtml(pw('back'))}</a></p>
    </div>`;
  panel.querySelector('[data-gm-pro-upgrade]')?.addEventListener('click', () => startProCheckoutFlow());
}

function wireGearmotorPageHandlers() {
  document.getElementById('gmForm')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void (async () => {
      if (!String(getCurrentUser()?.email || '').trim()) {
        flashStatus(t('signInToSave'), 'warn');
        return;
      }
      const v = validateForm();
      if (!v.ok) {
        flashStatus(t(v.key), 'warn');
        return;
      }
      const p = v.payload;
      const editId = document.getElementById('gmEditId')?.value?.trim();
      let ok = null;
      if (editId) {
        ok = await updateUserGearmotor(editId, p);
        if (ok) flashStatus(t('savedEdit'), 'info');
        else flashStatus(t('saveCloudErr'), 'warn');
      } else {
        if (listUserGearmotors().length >= MAX_USER_GEARMOTORS) {
          flashStatus(t('maxListReached', { max: MAX_USER_GEARMOTORS }), 'warn');
          return;
        }
        ok = await addUserGearmotor(p);
        if (ok) flashStatus(t('savedAdd'), 'info');
        else flashStatus(t('saveCloudErr'), 'warn');
      }
      if (ok) {
        clearForm();
        renderTable();
      }
    })();
  });

  document.getElementById('gmCancelBtn')?.addEventListener('click', () => clearForm());

  window.addEventListener(USER_GEARMOTOR_CHANGED_EVENT, () => {
    renderTable();
    const editing = document.getElementById('gmEditId')?.value;
    if (editing && !listUserGearmotors().some((r) => r.id === editing)) clearForm();
  });
}

/** @type {(() => void) | null} */
let unsubRealtime = null;

async function boot() {
  if (!isPremiumEffective() && !isPublicFreeRelease()) {
    mountGearmotorsPaywall();
    return;
  }
  initLangChrome();
  applyStaticCopy();
  wireGearmotorPageHandlers();
  try {
    await ensureGearmotorsCacheLoaded();
  } catch (_) {
    flashStatus(t('loadCloudErr'), 'warn');
  }
  renderTable();
  unsubRealtime = subscribeUserGearmotorsRealtime();
  window.addEventListener(
    'beforeunload',
    () => {
      try {
        unsubRealtime?.();
      } catch (_) {
        /* ignore */
      }
    },
    { once: true },
  );
}

boot();
