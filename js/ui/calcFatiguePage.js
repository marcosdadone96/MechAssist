import { computeFatigue, FATIGUE_MATERIALS } from '../lab/fatigue.js';
import { renderFatigueDiagram } from '../lab/diagramFatigue.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { mountCompactLabFieldHelp, refreshCompactLabFieldHelp } from './labHelpCompact.js';
import {
  bindInputValidation,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  revalidateAllBoundInputs,
  renderResultHero,
  renderLabAdvisorInsights,
  runCalcWithIndustrialFeedback,
  runLabCalcBoot,
  syncInputValidationResultsGate,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { getLabLang, LAB_LANG_EVENT } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { FATIGUE_PAGE_EN } from '../lab/i18n/pages/fatiguePageEn.js';
import { collectLabInputRows, collectLabResultRows } from '../services/labPdfPayload.js';
import { buildFatigueAdvisorInsights } from '../services/iaAdvisor.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';

function bx(es, en) {
  return getLabLang() === 'en' ? en : es;
}

const FATIGUE_PRESETS = [
  {
    label: 'Eje en flexi\u00f3n rotativa acero medio',
    labelKey: 'fatigue.preset1',
    values: {
      ftCalcMode: 'diagnostic',
      ftLoadType: 'bending',
      ftSigmaM: 80,
      ftSigmaA: 120,
      ftMaterial: 's355',
      ftSu: 510,
      ftSy: 355,
      ftKa: 0.8,
      ftKb: 0.9,
      ftKc: 0.814,
      ftKf: 1.5,
    },
  },
  {
    label: 'V\u00e1stago axial S355',
    labelKey: 'fatigue.preset2',
    values: {
      ftCalcMode: 'diagnostic',
      ftLoadType: 'axial',
      ftSigmaM: 60,
      ftSigmaA: 90,
      ftMaterial: 's355',
      ftSu: 510,
      ftSy: 355,
      ftKa: 0.85,
      ftKb: 0.92,
      ftKc: 0.814,
      ftKf: 1.2,
    },
  },
  {
    label: 'Punto cr\u00edtico con entalla Kf=2',
    labelKey: 'fatigue.preset3',
    values: {
      ftCalcMode: 'diagnostic',
      ftLoadType: 'combined',
      ftSigmaM: 100,
      ftSigmaA: 150,
      ftMaterial: 'cr42',
      ftSu: 900,
      ftSy: 650,
      ftKa: 0.75,
      ftKb: 0.88,
      ftKc: 0.814,
      ftKf: 2,
    },
  },
];

const FATIGUE_ES = {
  'fatigue.moduleLabel': 'Fatiga \u00b7 diagrama de Goodman',
  'fatigue.mSe': 'L\u00edmite corregido S_e',
  'fatigue.mNfGoodman': 'n_f Goodman',
  'fatigue.mNfGerber': 'n_f Gerber',
  'fatigue.mNfSoderberg': 'n_f Soderberg',
  'fatigue.mNy': 'n_y fluencia (von Mises)',
  'fatigue.mCritical': 'Criterio cr\u00edtico',
  'fatigue.mStatus': 'Estado',
  'fatigue.mSigmaAMax': '\u03c3_a admisible (dise\u00f1o)',
  'fatigue.mSPrime': 'S\u2032 (sin corregir)',
  'fatigue.badgeSafe': 'SEGURO n_f > 2',
  'fatigue.badgeTight': 'AJUSTADO 1,5 < n_f < 2',
  'fatigue.badgeUnsafe': 'INSEGURO n_f < 1,5',
  'fatigue.critGoodman': 'Goodman',
  'fatigue.critGerber': 'Gerber',
  'fatigue.critSoderberg': 'Soderberg',
  'fatigue.critYield': 'Fluencia',
  'fatigue.alertUnsafe': 'Factor de seguridad por debajo de 1,5 \u2014 aumente secci\u00f3n, reduzca carga o mejore acabado.',
  'fatigue.alertTight': 'Margen de fatiga ajustado \u2014 revise entalla, acabado y espectro de carga.',
  'fatigue.alertSafe': 'Margen de fatiga aceptable en este modelo orientativo; confirme con normativa.',
  'fatigue.execUnsafeTitle': 'Margen de fatiga o fluencia insuficiente.',
  'fatigue.execTightTitle': 'Aceptable con comprobaciones adicionales.',
  'fatigue.execSafeTitle': 'Comprobaci\u00f3n de fatiga orientativa superada.',
};

function ftT(key) {
  const full = key.startsWith('fatigue.') ? key : `fatigue.${key}`;
  const en = getLabLang() === 'en';
  if (en && FATIGUE_PAGE_EN[full]) return FATIGUE_PAGE_EN[full];
  if (FATIGUE_ES[full]) return FATIGUE_ES[full];
  if (FATIGUE_PAGE_EN[full]) return FATIGUE_PAGE_EN[full];
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

function mpaToDisplay(MPa) {
  const sel = document.getElementById('labUnitPressure');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'MPa';
  if (u === 'ksi') return `${(MPa / 6.894757).toFixed(1)} ksi`;
  return `${MPa.toFixed(1)} MPa`;
}

function displayToMpa(val) {
  const sel = document.getElementById('labUnitPressure');
  const u = sel instanceof HTMLSelectElement ? sel.value : 'MPa';
  if (u === 'ksi') return val * 6.894757;
  return val;
}

function formatNf(nf) {
  if (!Number.isFinite(nf)) return '\u221e';
  if (nf > 99) return '>99';
  return nf.toFixed(2);
}

function statusBadge(status) {
  if (status === 'safe') return `<span class="lab-badge lab-badge--free">${esc(ftT('badgeSafe'))}</span>`;
  if (status === 'tight') return `<span class="lab-badge lab-badge--beta">${esc(ftT('badgeTight'))}</span>`;
  return `<span class="lab-badge lab-badge--pro">${esc(ftT('badgeUnsafe'))}</span>`;
}

function criticalLabel(key) {
  const map = {
    goodman: 'critGoodman',
    gerber: 'critGerber',
    soderberg: 'critSoderberg',
    yield: 'critYield',
  };
  return ftT(map[key] || 'critGoodman');
}

function syncMaterialFields() {
  const mat = readStr('ftMaterial', 's355');
  const suEl = document.getElementById('ftSu');
  const syEl = document.getElementById('ftSy');
  const preset = FATIGUE_MATERIALS[mat];
  const custom = mat === 'custom';
  if (suEl instanceof HTMLInputElement) {
    suEl.disabled = !custom;
    if (preset) suEl.value = String(preset.Su_MPa);
  }
  if (syEl instanceof HTMLInputElement) {
    syEl.disabled = !custom;
    if (preset) syEl.value = String(preset.Sy_MPa);
  }
}

function syncFatigueCalcModeUi() {
  const design = document.getElementById('ftCalcMode')?.value === 'design';
  const help = document.getElementById('ftCalcModeHelp');
  const sigmaAField = document.getElementById('ftSigmaAField');
  if (sigmaAField instanceof HTMLElement) {
    sigmaAField.classList.toggle('lab-field--optional-design', design);
  }
  if (help instanceof HTMLElement) {
    help.querySelectorAll('[data-fatigue-mode]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.classList.toggle(
        'fatigue-calc-mode-help__line--active',
        el.getAttribute('data-fatigue-mode') === (design ? 'design' : 'diagnostic'),
      );
    });
  }
}

function refreshCore() {
  syncMaterialFields();
  const mode = readStr('ftCalcMode', 'diagnostic');
  const sigmaM = displayToMpa(read('ftSigmaM', 80));
  const sigmaA = displayToMpa(read('ftSigmaA', 120));

  const r = computeFatigue({
    mode,
    loadType: readStr('ftLoadType', 'bending'),
    sigmaM_MPa: sigmaM,
    sigmaA_MPa: sigmaA,
    Su_MPa: read('ftSu', 510),
    Sy_MPa: read('ftSy', 355),
    Ka: read('ftKa', 0.8),
    Kb: read('ftKb', 0.9),
    Kc: read('ftKc', 0.814),
    Kf: read('ftKf', 1.5),
    Kd: read('ftKd', 1.0),
  });

  renderFatigueDiagram(document.getElementById('ftDiagram'), r);

  if (syncInputValidationResultsGate(document.getElementById('ftResults'))) {
    renderLabAdvisorInsights('ftAdvisorPanel', []);
    return;
  }

  const gv = r.status === 'unsafe' ? 'error' : r.status === 'tight' ? 'warn' : 'ok';

  const heroEl = document.getElementById('ftHero');
  if (heroEl) {
    const unit = document.getElementById('labUnitPressure')?.value === 'ksi' ? 'ksi' : 'MPa';
    const seVal = mpaToDisplay(r.Se_MPa).replace(/ MPa| ksi/, '');
    heroEl.innerHTML = renderResultHero(
      [
        {
          label: ftT('mNfGoodman'),
          value: formatNf(r.nf_goodman),
        },
        {
          label: ftT('mSe'),
          value: seVal,
          unit,
        },
        {
          label: ftT('mCritical'),
          value: formatNf(r.nf_governing),
          hint: criticalLabel(r.criticalKey),
        },
      ],
      { verdict: gv },
    );
  }

  const box = document.getElementById('ftResults');
  if (box) {
    const rows = [
      metricHtml(ftT('mSe'), mpaToDisplay(r.Se_MPa), `S\u2032 ${mpaToDisplay(r.S_prime_MPa)}`),
      metricHtml(ftT('mNfGoodman'), formatNf(r.nf_goodman), ''),
      metricHtml(ftT('mNfGerber'), formatNf(r.nf_gerber), ''),
      metricHtml(ftT('mNfSoderberg'), formatNf(r.nf_soderberg), ''),
      metricHtml(ftT('mNy'), formatNf(r.ny), '\u221a(\u03c3_m\u00b2 + (K_f\u00b7\u03c3_a)\u00b2)'),
      metricHtml(ftT('mCritical'), criticalLabel(r.criticalKey), `n_f min ${formatNf(r.nf_min)}`),
      metricHtml(ftT('mStatus'), statusBadge(r.status), ''),
    ];
    if (mode === 'design') {
      rows.push(
        metricHtml(ftT('mSigmaAMax'), mpaToDisplay(r.sigmaA_max), 'min(Goodman, Gerber, Soderberg)'),
      );
    }
    box.innerHTML = rows.join('');
  }

  const alerts = document.getElementById('ftAlerts');
  if (alerts) {
    const execKey =
      r.status === 'unsafe' ? 'execUnsafeTitle' : r.status === 'tight' ? 'execTightTitle' : 'execSafeTitle';
    const parts = [
      executiveSummaryAlert({
        level: r.status === 'unsafe' ? 'danger' : r.status === 'tight' ? 'warn' : 'ok',
        titleEs: ftT(execKey),
        titleEn: FATIGUE_PAGE_EN[`fatigue.${execKey}`],
        actionsEs: ['Revise entalla y acabado.', 'Compare con ensayo o cat\u00e1logo del material.'],
        actionsEn: ['Review notch and surface finish.', 'Compare with test or catalogue data.'],
      }),
    ];
    if (r.status === 'unsafe') parts.push(labAlert('warn', esc(ftT('alertUnsafe'))));
    else if (r.status === 'tight') parts.push(labAlert('warn', esc(ftT('alertTight'))));
    else parts.push(labAlert('ok', esc(ftT('alertSafe'))));
    alerts.innerHTML = parts.join('');
  }

  const advLang = getLabLang() === 'en' ? 'en' : 'es';
  renderLabAdvisorInsights(
    'ftAdvisorPanel',
    buildFatigueAdvisorInsights(
      {
        sf: r.nf_governing,
        sigma_a: sigmaA,
        sigma_m: sigmaM,
        Se: r.Se_MPa,
        Sut: read('ftSu', 510),
        criterion: criticalLabel(r.criticalKey),
        lang: advLang,
      },
      { lang: advLang },
    ),
  );

  updateLabShareVisibility('ftShareLinkWrap', 'ftResults');
}

function buildFatigueInputsArray() {
  const scope = document.querySelector('main.lab-main');
  return scope ? collectLabInputRows(scope) : [];
}

function buildFatigueResultsArray() {
  const scope = document.querySelector('main.lab-main');
  if (!scope) return [];
  /** @type {Array<{ label: string; value: string }>} */
  const rows = [];
  scope.querySelectorAll('.lab-result-hero__cell').forEach((cell) => {
    const label = cell.querySelector('.lab-result-hero__label');
    const value = cell.querySelector('.lab-result-hero__value');
    if (label && value) {
      rows.push({ label: label.textContent.trim(), value: value.textContent.trim() });
    }
  });
  rows.push(...collectLabResultRows(scope));
  return rows;
}

const resultsWrap = document.getElementById('ftResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);

const ftPresets = mountLabPresetsBar('ftPresetsBar', FATIGUE_PRESETS, debounced);

function scheduleRecalc() {
  if (!ftPresets.applying) ftPresets.clearActive();
  debounced();
}

function bindUnitPressure() {
  const sel = document.getElementById('labUnitPressure');
  if (!(sel instanceof HTMLSelectElement)) return;
  sel.addEventListener('change', scheduleRecalc);
}

injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();
bindInputValidation([
  { id: 'ftSigmaM', min: 0, max: 5000, label: 'sigmaM' },
  { id: 'ftSigmaA', min: 0, max: 5000, optional: true, label: 'sigmaA' },
  { id: 'ftSu', min: 50, max: 3000, label: 'Su' },
  { id: 'ftSy', min: 30, max: 2500, label: 'Sy' },
  { id: 'ftKa', min: 0.1, max: 2, label: 'Ka' },
  { id: 'ftKb', min: 0.1, max: 2, label: 'Kb' },
  { id: 'ftKc', min: 0.1, max: 2, label: 'Kc' },
  { id: 'ftKf', min: 1, max: 6, label: 'Kf' },
  { id: 'ftKd', min: 0.1, max: 2, label: 'K_d' },
]);

syncFatigueCalcModeUi();
bindUnitPressure();

[
  'ftCalcMode',
  'ftLoadType',
  'ftSigmaM',
  'ftSigmaA',
  'ftMaterial',
  'ftSu',
  'ftSy',
  'ftKa',
  'ftKb',
  'ftKc',
  'ftKf',
  'ftKd',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleRecalc);
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'ftMaterial') syncMaterialFields();
    if (id === 'ftCalcMode') syncFatigueCalcModeUi();
    scheduleRecalc();
  });
});

watchLangAndApply(FATIGUE_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    refreshCompactLabFieldHelp();
    syncFatigueCalcModeUi();
    scheduleRecalc();
  },
  onEsRestored: () => {
    refreshCompactLabFieldHelp();
    syncFatigueCalcModeUi();
    scheduleRecalc();
  },
});

wireLabCopyLink('ftCopyLinkBtn', 'ftCopyToast');
wireLabCopyResultsButton('ftCopyResults', {
  moduleTitle: ftT('moduleLabel'),
});

mountLabCloudSaveBar(bx('Fatiga \u00b7 Goodman', 'Fatigue \u00b7 Goodman'), {
  norm: 'Shigley / Goodman modificado \u00b7 fatiga a flexi\u00f3n',
  svgSelector: '#ftDiagram',
  getData: () => ({
    inputs: buildFatigueInputsArray(),
    results: buildFatigueResultsArray(),
  }),
});

window.addEventListener(LAB_LANG_EVENT, () => {
  syncFatigueCalcModeUi();
  scheduleRecalc();
});

revalidateAllBoundInputs();
syncMaterialFields();
runLabCalcBoot(resultsWrap, refreshCore);
