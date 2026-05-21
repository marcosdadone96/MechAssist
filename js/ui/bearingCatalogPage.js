/**
 * Selector catálogo SKF/FAG simulado + L10h ISO 281 simplificada (bolas p=3).
 */

import {
  bindInputValidation,
  syncInputValidationResultsGate,
  createLabUrlSync,
  mountLabPresetsBar,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { withCalcCredits } from '../services/creditSession.js';
import { isCreditsSystemEnabled } from '../config/credits.js';
import { DEEP_GROOVE_SERIES } from '../data/skfFagDeepGroove.js';
import { renderCatalogDeepGrooveSection } from '../lab/diagramCatalogModules.js';
import { getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BEARING_CATALOG_EN } from '../lab/i18n/pages/bearingCatalogEn.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

function numLocale(n) {
  return n.toLocaleString(getLabLang() === 'en' ? 'en-US' : 'es-ES');
}

function l10_revolutions(C, P) {
  if (P <= 0) return Infinity;
  return Math.pow(C / P, 3) * 1e6;
}

function l10_hours(L10_rev, n_rpm) {
  if (n_rpm <= 0) return Infinity;
  return L10_rev / (60 * n_rpm);
}

function fillSeriesSelect() {
  const sel = document.getElementById('bcSeries');
  if (!sel) return;
  sel.innerHTML = DEEP_GROOVE_SERIES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
}

function fillBearingSelect(seriesId) {
  const sel = document.getElementById('bcBearing');
  const ser = DEEP_GROOVE_SERIES.find((s) => s.id === seriesId);
  if (!sel || !ser) return;
  sel.innerHTML = ser.bearings
    .map((b) => `<option value="${b.designation}">${b.designation} · d=${b.d} / D=${b.D} / B=${b.B} · C=${b.C_N} N</option>`)
    .join('');
}

const BC_PRESETS = [
  {
    label: '6205 · uso general',
    labelKey: 'bcat.preset1',
    values: {
      bcSeries: '6200',
      bcBearing: '6205-2Z',
      bcP: 2000,
      bcN: 1450,
      bcLreq: 15000,
      bcHpd: 16,
    },
  },
  {
    label: '6305 · carga media',
    labelKey: 'bcat.preset2',
    values: {
      bcSeries: '6300',
      bcBearing: '6305-2Z',
      bcP: 4500,
      bcN: 960,
      bcLreq: 20000,
      bcHpd: 16,
    },
  },
  {
    label: 'NJ 208 · radial alta',
    labelKey: 'bcat.preset3',
    values: {
      bcSeries: 'NJ2',
      bcBearing: 'NJ 208 EC',
      bcP: 8000,
      bcN: 750,
      bcLreq: 25000,
      bcHpd: 16,
    },
  },
];

const BC_URL_PARAM_TO_ID = {
  ser: 'bcSeries',
  P: 'bcP',
  n: 'bcN',
  L: 'bcLreq',
  hpd: 'bcHpd',
};

const bcUrl = createLabUrlSync(BC_URL_PARAM_TO_ID, {
  hydrateOrder: ['ser', 'P', 'n', 'L', 'hpd'],
  afterHydrate: () => {
    const sid = document.getElementById('bcSeries') instanceof HTMLSelectElement ? document.getElementById('bcSeries').value : '';
    if (sid) fillBearingSelect(sid);
    const q = new URLSearchParams(location.search);
    const des = q.get('br');
    const bel = document.getElementById('bcBearing');
    if (des && bel instanceof HTMLSelectElement) bel.value = des;
  },
});

function serializeBcFullUrl() {
  if (bcUrl.hydrating) return;
  const params = new URLSearchParams();
  const ser = document.getElementById('bcSeries');
  const br = document.getElementById('bcBearing');
  const p = document.getElementById('bcP');
  const n = document.getElementById('bcN');
  const L = document.getElementById('bcLreq');
  const hpd = document.getElementById('bcHpd');
  if (ser instanceof HTMLSelectElement) params.set('ser', ser.value);
  if (br instanceof HTMLSelectElement && br.value) params.set('br', br.value);
  if (p instanceof HTMLInputElement) params.set('P', p.value);
  if (n instanceof HTMLInputElement) params.set('n', n.value);
  if (L instanceof HTMLInputElement) params.set('L', L.value);
  if (hpd instanceof HTMLInputElement) params.set('hpd', hpd.value);
  const qs = params.toString();
  const path = `${location.pathname}${location.hash || ''}`;
  history.replaceState(null, '', qs ? `${path}?${qs}` : path);
}

function render() {
  const seriesId = document.getElementById('bcSeries')?.value;
  const des = document.getElementById('bcBearing')?.value;
  const P = parseFloat(document.getElementById('bcP')?.value || '0');
  const n = parseFloat(document.getElementById('bcN')?.value || '0');
  const Lreq = parseFloat(document.getElementById('bcLreq')?.value || '20000');
  const hpd = parseFloat(document.getElementById('bcHpd')?.value || '16');
  const out = document.getElementById('bcOut');
  const tbl = document.getElementById('bcTable');
  const autoGeom = document.getElementById('bcAutoGeom');
  if (!out || !tbl) return;

  const ser = DEEP_GROOVE_SERIES.find((s) => s.id === seriesId);
  const b = ser?.bearings.find((x) => x.designation === des);
  if (b) {
    renderCatalogDeepGrooveSection(document.getElementById('bcDiagram'), {
      d: b.d,
      D: b.D,
      B: b.B,
      designation: b.designation,
    });
  }

  if (syncInputValidationResultsGate(document.getElementById('bcResults'))) return;

  if (!b) {
    out.innerHTML = '';
    tbl.innerHTML = '';
    if (autoGeom) autoGeom.textContent = bx('Geometría y C del rodamiento seleccionado.', 'Geometry and C of selected bearing.');
    updateLabShareVisibility('bcShareLinkWrap', 'bcOut');
    if (!bcUrl.hydrating) serializeBcFullUrl();
    return;
  }
  if (autoGeom) {
    autoGeom.textContent = `${b.designation}: d=${b.d} mm · D=${b.D} mm · B=${b.B} mm · C=${numLocale(b.C_N)} N`;
  }

  const C = b.C_N;
  const Puse = Math.max(1, P);
  const Lrev = l10_revolutions(C, Puse);
  const nUse = Number.isFinite(n) && n > 0 ? n : null;
  const hpdUse = Number.isFinite(hpd) && hpd > 0 ? Math.min(24, hpd) : null;
  const Lh = nUse != null ? l10_hours(Lrev, nUse) : NaN;
  if (nUse == null || hpdUse == null) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err">${bx(
      'Entrada no válida: use n > 0 min⁻¹ y horas/día > 0.',
      'Invalid input: use n > 0 min⁻¹ and hours/day > 0.',
    )}</p>`;
    tbl.innerHTML = '';
    updateLabShareVisibility('bcShareLinkWrap', 'bcOut');
    if (!bcUrl.hydrating) serializeBcFullUrl();
    return;
  }
  const Lyears = Lh / (hpdUse * 365);
  const reqYears = Lreq / (hpdUse * 365);
  const margin = Lreq > 0 ? (Lh - Lreq) / Lreq : 0;
  const ok = Lh >= Lreq;

  const yearsWord = bx('años', 'years');
  if (ok && margin >= 0.5) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--ok"><strong>${bx('APTO con margen', 'OK with margin')}</strong>: ${b.designation} ${bx('supera las', 'exceeds')} ${numLocale(Lreq)} h ${bx('con margen ≥ 50%', 'with margin ≥ 50%')} (L<sub>10h</sub> ≈ ${Lh.toFixed(0)} h; ${Lyears.toFixed(2)} ${yearsWord}).</p>`;
  } else if (ok) {
    out.innerHTML = `<p class="lab-verdict lab-verdict--warn"><strong>${bx('APTO ajustado', 'OK (tight)')}</strong>: ${b.designation} ${bx('supera el objetivo, pero con margen < 50%', 'meets target but margin < 50%')} (L<sub>10h</sub> ≈ ${Lh.toFixed(
      0,
    )} h; ${Lyears.toFixed(2)} ${yearsWord}).</p>`;
  } else {
    out.innerHTML = `<p class="lab-verdict lab-verdict--err"><strong>${bx('INSUFICIENTE', 'INSUFFICIENT')}</strong>: ${b.designation} ${bx('no alcanza', 'does not reach')} ${numLocale(Lreq)} h (L<sub>10h</sub> ≈ ${Lh.toFixed(0)} h; ${Lyears.toFixed(2)} ${yearsWord}). ${bx('Elija mayor C o menor P.', 'Choose higher C or lower P.')}</p>`;
  }

  tbl.innerHTML = `
    <table class="lab-catalog-table">
      <thead><tr><th>${bx('Catálogo', 'Catalogue')}</th><th>${bx('Aplicación', 'Application')}</th></tr></thead>
      <tbody>
        <tr><td>${bx('Designación', 'Designation')}</td><td>${b.designation}</td></tr>
        <tr><td>d × D × B</td><td>${b.d} × ${b.D} × ${b.B} mm</td></tr>
        <tr><td>C (${bx('dinámica', 'dynamic')})</td><td>${numLocale(C)} N</td></tr>
        <tr><td>C₀</td><td>${numLocale(b.Co_N)} N</td></tr>
        <tr><td>P ${bx('equivalente', 'equivalent')}</td><td>${numLocale(Puse)} N</td></tr>
        <tr><td>n ${bx('trabajo', 'operating')}</td><td>${nUse.toFixed(0)} min⁻¹</td></tr>
        <tr><td>${bx('Horas servicio por día', 'Service hours per day')}</td><td>${hpdUse.toFixed(0)} h/${bx('día', 'day')}</td></tr>
        <tr><td>L<sub>10</sub> (${bx('mill. rev', 'mill. rev')})</td><td>${(Lrev / 1e6).toFixed(3)}</td></tr>
        <tr><td>L<sub>10h</sub></td><td><strong>${Lh.toFixed(0)} h</strong></td></tr>
        <tr><td>${bx('Vida en años', 'Life in years')}</td><td><strong>${Lyears.toFixed(2)} ${yearsWord}</strong></td></tr>
        <tr><td>${bx('Horas requeridas', 'Required hours')}</td><td>${numLocale(Lreq)} h (${reqYears.toFixed(2)} ${yearsWord})</td></tr>
      </tbody>
    </table>
    <p class="lab-small-print">${bx(
      'C y C₀ son valores demostrativos (±10%). Vida según L = (C/P)³ y horas = L/(60n).',
      'C and C₀ are demonstration values (±10%). Life per L = (C/P)³ and hours = L/(60n).',
    )}</p>`;

  updateLabShareVisibility('bcShareLinkWrap', 'bcOut');
  if (!bcUrl.hydrating) serializeBcFullUrl();
}

fillSeriesSelect();
fillBearingSelect(DEEP_GROOVE_SERIES[0].id);

bindInputValidation([
  { id: 'bcP', min: 0.01, max: 1e12, label: 'P' },
  { id: 'bcN', min: 1, max: 1e7, label: 'RPM' },
  { id: 'bcLreq', min: 100, max: 1e9, label: 'L req' },
  { id: 'bcHpd', min: 1, max: 24, label: 'h/día' },
]);

bcUrl.hydrateFromUrl();

mountLabPresetsBar('bcPresetsBar', BC_PRESETS, scheduleBcRender);

function scheduleBcRender() {
  if (!bcUrl.hydrating) {
    document.querySelectorAll('#bcPresetsBar .lab-preset-btn').forEach((b) => b.classList.remove('is-active'));
  }
  if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
  else render();
}

document.getElementById('bcSeries')?.addEventListener('change', (e) => {
  fillBearingSelect(e.target.value);
  scheduleBcRender();
});
document.getElementById('bcBearing')?.addEventListener('change', scheduleBcRender);
['bcP', 'bcN', 'bcLreq', 'bcHpd'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleBcRender);
  document.getElementById(id)?.addEventListener('change', scheduleBcRender);
});

wireLabCopyLink('bcCopyLinkBtn', 'bcCopyToast');
wireLabCopyResultsButton('bcCopyResults', {
  moduleTitle: bx('Cat\u00e1logo rodamientos', 'Bearing catalogue'),
});

if (isCreditsSystemEnabled()) void withCalcCredits(() => render());
else render();
mountLabCloudSaveBar(bx('Cat\u00e1logo rodamientos', 'Bearing catalogue'), {
  norm: 'ISO 15 · rodamientos de bolas de surco profundo (catálogo)',
  svgSelector: '#bcDiagram',
});
watchLangAndApply(BEARING_CATALOG_EN, {
  reloadOnEs: false,
  onEnApplied: () => scheduleBcRender(),
  onEsRestored: () => scheduleBcRender(),
});
