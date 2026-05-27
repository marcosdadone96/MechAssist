import { computeBoltShear, nfToLevel, stressToLevel } from '../lab/boltShear.js';
import { renderBoltShearDiagram } from '../lab/diagramBoltShear.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import {
  bindInputValidation,
  debounce,
  executiveSummaryAlert,
  labAlert,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  runLabCalcBoot,
  syncInputValidationResultsGate,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { getLabLang, LAB_LANG_EVENT } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { BOLT_SHEAR_PAGE_EN } from '../lab/i18n/pages/boltShearPageEn.js';

const BSHEAR_PRESETS = [
  {
    label: 'Brida 4\u00d7M12 clase 8.8',
    labelKey: 'bshear.preset1',
    values: {
      bsDiam: 12,
      bsClass: '8.8',
      bsN: 4,
      bsShearPlanes: 'double',
      bsForce: 20000,
      bsThickness: 10,
      bsMu: 0,
      bsMaterial: 's355',
      bsEcc: 0,
    },
  },
  {
    label: 'Uni\u00f3n simple M16 10.9',
    labelKey: 'bshear.preset2',
    values: {
      bsDiam: 16,
      bsClass: '10.9',
      bsN: 2,
      bsShearPlanes: 'single',
      bsForce: 35000,
      bsThickness: 12,
      bsMu: 0,
      bsMaterial: 's355',
      bsEcc: 0,
    },
  },
  {
    label: 'Patr\u00f3n cortante con pretensado',
    labelKey: 'bshear.preset3',
    values: {
      bsDiam: 12,
      bsClass: '8.8',
      bsN: 4,
      bsShearPlanes: 'double',
      bsForce: 18000,
      bsThickness: 8,
      bsMu: 0.14,
      bsMaterial: 's355',
      bsEcc: 28,
    },
  },
];

const BSHEAR_ES = {
  'bshear.moduleLabel': 'Cortante en torniller\u00eda',
  'bshear.tableTitle': 'Resumen de comprobaciones',
  'bshear.thCheck': 'Comprobaci\u00f3n',
  'bshear.thUsed': 'Real',
  'bshear.thAdm': 'L\u00edmite',
  'bshear.thNf': 'n_f',
  'bshear.thStatus': 'Estado',
  'bshear.rowShear': 'Cortante tornillo \u03c4',
  'bshear.rowBearing': 'Aplastamiento \u03c3_b',
  'bshear.rowSlip': 'Deslizamiento (rozamiento)',
  'bshear.rowCritical': 'Tornillo m\u00e1s cargado',
  'bshear.statusSafe': 'OK',
  'bshear.statusTight': 'Ajustado',
  'bshear.statusUnsafe': 'Fallo',
  'bshear.mNfShear': 'n_f cortante (tornillo cr\u00edtico)',
  'bshear.mNfBearing': 'n_f aplastamiento',
  'bshear.mNfSlip': 'n_f deslizamiento',
  'bshear.mCriticalBolt': 'Tornillo cr\u00edtico',
  'bshear.alertUnsafe': 'Alguna comprobaci\u00f3n por debajo del objetivo \u2014 aumente tornillos, di\u00e1metro o clase.',
  'bshear.alertTight': 'Margen ajustado \u2014 revise tornillo cr\u00edtico y excentricidad.',
  'bshear.alertSafe': 'Comprobaciones orientativas superadas; confirme interacci\u00f3n con tracci\u00f3n si aplica.',
  'bshear.execUnsafeTitle': 'Margen de cortante, aplastamiento o deslizamiento insuficiente.',
  'bshear.execTightTitle': 'Aceptable con verificaci\u00f3n adicional.',
  'bshear.execSafeTitle': 'Comprobaciones orientativas de cortante superadas.',
  'bshear.na': '\u2014',
};

function bsT(key) {
  const full = key.startsWith('bshear.') ? key : `bshear.${key}`;
  const en = getLabLang() === 'en';
  if (en && BOLT_SHEAR_PAGE_EN[full]) return BOLT_SHEAR_PAGE_EN[full];
  if (BSHEAR_ES[full]) return BSHEAR_ES[full];
  if (BOLT_SHEAR_PAGE_EN[full]) return BOLT_SHEAR_PAGE_EN[full];
  return full;
}

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readStr(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return fallback;
  return String(el.value || fallback);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function forceToDisplay(N) {
  const sel = document.getElementById('labUnitForce');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'N';
  if (u === 'kN') return `${(N / 1000).toFixed(2)} kN`;
  return `${N.toFixed(0)} N`;
}

function readForceN() {
  const v = read('bsForce', 20000);
  const sel = document.getElementById('labUnitForce');
  if (sel instanceof HTMLSelectElement && sel.value === 'kN') return v * 1000;
  return v;
}

function stressToDisplay(MPa) {
  const sel = document.getElementById('labUnitPressure');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'MPa';
  if (u === 'ksi') return `${(MPa / 6.894757).toFixed(1)} ksi`;
  return `${MPa.toFixed(1)} MPa`;
}

function formatNf(nf) {
  if (!Number.isFinite(nf)) return '\u221e';
  if (nf > 99) return '>99';
  return nf.toFixed(2);
}

function statusCell(level) {
  const cls =
    level === 'safe' ? 'lab-check-table__status--ok' : level === 'tight' ? 'lab-check-table__status--warn' : 'lab-check-table__status--fail';
  const label =
    level === 'safe' ? bsT('statusSafe') : level === 'tight' ? bsT('statusTight') : bsT('statusUnsafe');
  return `<span class="lab-check-table__status ${cls}">${esc(label)}</span>`;
}

function buildCheckTable(r) {
  const tauLevel = stressToLevel(r.tau_max_MPa, r.tau_adm_MPa);
  const bearLevel = stressToLevel(r.sigma_bearing_MPa, r.sigma_bearing_adm_MPa);
  const slipLevel = r.nf_slip != null ? nfToLevel(r.nf_slip) : null;

  const rows = [
    `<tr>
      <td>${esc(bsT('rowShear'))}</td>
      <td>${esc(stressToDisplay(r.tau_max_MPa))}</td>
      <td>${esc(stressToDisplay(r.tau_adm_MPa))}</td>
      <td>${formatNf(r.nf_shear_max)}</td>
      <td>${statusCell(tauLevel)}</td>
    </tr>`,
    `<tr>
      <td>${esc(bsT('rowBearing'))}</td>
      <td>${esc(stressToDisplay(r.sigma_bearing_MPa))}</td>
      <td>${esc(stressToDisplay(r.sigma_bearing_adm_MPa))}</td>
      <td>${formatNf(r.nf_bearing)}</td>
      <td>${statusCell(bearLevel)}</td>
    </tr>`,
  ];

  if (r.mu > 0 && r.nf_slip != null) {
    rows.push(`<tr>
      <td>${esc(bsT('rowSlip'))}</td>
      <td>${esc(forceToDisplay(r.F_N))}</td>
      <td>${esc(forceToDisplay(r.Fv_slip_total_N))}</td>
      <td>${formatNf(r.nf_slip)}</td>
      <td>${statusCell(slipLevel)}</td>
    </tr>`);
  }

  rows.push(`<tr>
    <td>${esc(bsT('rowCritical'))}</td>
    <td colspan="2">#${r.criticalBolt.index} \u2014 ${esc(forceToDisplay(r.criticalBolt.V_N))}</td>
    <td>${formatNf(r.nf_shear_max)}</td>
    <td>${statusCell(tauLevel)}</td>
  </tr>`);

  return `<div class="lab-table-wrap"><table class="lab-table lab-check-table">
    <thead><tr>
      <th>${esc(bsT('thCheck'))}</th>
      <th>${esc(bsT('thUsed'))}</th>
      <th>${esc(bsT('thAdm'))}</th>
      <th>${esc(bsT('thNf'))}</th>
      <th>${esc(bsT('thStatus'))}</th>
    </tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
}

function refreshCore() {
  const r = computeBoltShear({
    d_mm: read('bsDiam', 12),
    boltClass: readStr('bsClass', '8.8'),
    n: read('bsN', 4),
    shearPlanes: readStr('bsShearPlanes', 'double'),
    F_N: readForceN(),
    t_mm: read('bsThickness', 10),
    mu: read('bsMu', 0),
    plateMaterial: readStr('bsMaterial', 's355'),
    ecc_mm: read('bsEcc', 0),
  });

  renderBoltShearDiagram(document.getElementById('bsDiagram'), r);

  if (syncInputValidationResultsGate(document.getElementById('bsResults'))) return;

  const worst = [nfToLevel(r.nf_shear_max), nfToLevel(r.nf_bearing), r.nf_slip != null ? nfToLevel(r.nf_slip) : 'safe'].reduce(
    (a, b) => (b === 'unsafe' || (a !== 'unsafe' && b === 'tight') ? b : a),
    'safe',
  );
  const gv = worst === 'unsafe' ? 'error' : worst === 'tight' ? 'warn' : 'ok';

  const heroEl = document.getElementById('bsHero');
  if (heroEl) {
    heroEl.innerHTML = renderResultHero(
      [
        { label: bsT('mNfShear'), value: formatNf(r.nf_shear_max) },
        { label: bsT('mNfBearing'), value: formatNf(r.nf_bearing) },
        {
          label: bsT('mNfSlip'),
          value: r.nf_slip != null ? formatNf(r.nf_slip) : bsT('na'),
        },
      ],
      { verdict: gv },
    );
  }

  const tableEl = document.getElementById('bsCheckTable');
  if (tableEl) tableEl.innerHTML = buildCheckTable(r);

  const alerts = document.getElementById('bsAlerts');
  if (alerts) {
    const execKey = worst === 'unsafe' ? 'execUnsafeTitle' : worst === 'tight' ? 'execTightTitle' : 'execSafeTitle';
    const parts = [
      executiveSummaryAlert({
        level: worst === 'unsafe' ? 'danger' : worst === 'tight' ? 'warn' : 'ok',
        titleEs: bsT(execKey),
        titleEn: BOLT_SHEAR_PAGE_EN[`bshear.${execKey}`],
        actionsEs: ['Compare con calc-bolts-iso898 si hay tracci\u00f3n.', 'Revise tornillo cr\u00edtico en patr\u00f3n exc\u00e9ntrico.'],
        actionsEn: ['Compare with ISO 898 tension calc if axial load exists.', 'Review critical bolt on eccentric pattern.'],
      }),
    ];
    if (worst === 'unsafe') parts.push(labAlert('warn', esc(bsT('alertUnsafe'))));
    else if (worst === 'tight') parts.push(labAlert('warn', esc(bsT('alertTight'))));
    else parts.push(labAlert('ok', esc(bsT('alertSafe'))));
    alerts.innerHTML = parts.join('');
  }

  updateLabShareVisibility('bsShareLinkWrap', 'bsResults');
}

const resultsWrap = document.getElementById('bsResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);

const bsPresets = mountLabPresetsBar('bsPresetsBar', BSHEAR_PRESETS, debounced);

function scheduleRecalc() {
  if (!bsPresets.applying) bsPresets.clearActive();
  debounced();
}

function bindUnitSelectors() {
  ['labUnitForce', 'labUnitPressure'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', scheduleRecalc);
  });
}

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();
bindInputValidation([
  { id: 'bsDiam', min: 4, max: 48, label: 'd' },
  { id: 'bsN', min: 1, max: 24, label: 'n' },
  { id: 'bsForce', min: 0, max: 1e7, label: 'F' },
  { id: 'bsThickness', min: 0.5, max: 80, label: 't' },
  { id: 'bsMu', min: 0, max: 0.5, label: 'mu' },
  { id: 'bsEcc', min: 0, max: 500, label: 'e' },
]);

bindUnitSelectors();

[
  'bsDiam',
  'bsClass',
  'bsN',
  'bsShearPlanes',
  'bsForce',
  'bsThickness',
  'bsMu',
  'bsMaterial',
  'bsEcc',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleRecalc);
});

watchLangAndApply(BOLT_SHEAR_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    scheduleRecalc();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    scheduleRecalc();
  },
});

wireLabCopyLink('bsCopyLinkBtn', 'bsCopyToast');
wireLabCopyResultsButton('bsCopyResults', {
  moduleTitle: bsT('moduleLabel'),
});

window.addEventListener(LAB_LANG_EVENT, scheduleRecalc);

revalidateAllBoundInputs();
runLabCalcBoot(resultsWrap, refreshCore);
