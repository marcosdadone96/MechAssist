import { CHAINS_EN } from '../lab/i18n/pages/chainsEn.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { LAB_LANG_EVENT, getLabLang } from '../lab/i18n/labLang.js';
import { chainsRuntimeStrings, localizeChainLubrication } from '../lab/i18n/runtime/chainsRuntime.js';
import { mountTierStatusBar } from './paywallMount.js';
import { computeRollerChain } from '../lab/chains.js';
import { CHAIN_CATALOG } from '../lab/chainCatalog.js';
import { renderChainDriveDiagram } from '../lab/diagramChains.js';
import {
  bindLabUnitSelectors,
  formatLength,
  formatLinearSpeed,
  formatRotation,
  getLabUnitPrefs,
} from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  labHelpTooltipMarkup,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { commerceIdForChainRef } from '../data/commerceCatalog.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { bindCommerceFilteredSelect } from './commerceSelectBind.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled(chainsRuntimeStrings(getLabLang()).dashboardBoot);
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();

function readInput(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markFieldInvalid(id, invalid, msg = '') {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  el.classList.toggle('field-input--danger', Boolean(invalid));
  el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  if (invalid && msg) el.title = msg;
  else el.removeAttribute('title');
}

function parseNumberInput(id) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return { value: null, empty: true };
  const raw = el.value.trim();
  if (!raw) return { value: null, empty: true };
  const n = parseFloat(raw.replace(',', '.'));
  return { value: Number.isFinite(n) ? n : null, empty: false };
}

function elementCardHtml(title, rows) {
  const body = rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('');
  return `<article class="lab-element-card"><h4 class="lab-element-card__title">${esc(title)}</h4><dl class="lab-element-card__kv">${body}</dl></article>`;
}

const CHAIN_PRESETS = [
  {
    label: 'ISO 12B · centrado',
    labelKey: 'chains.preset1',
    values: {
      cManualPitch: false,
      cChainRef: 'iso-12b-1',
      cPitch: 19.05,
      cZ1: 17,
      cZ2: 25,
      cCenter: 450,
      cN1: 1455,
    },
  },
  {
    label: 'ISO 08B · lento',
    labelKey: 'chains.preset2',
    values: {
      cManualPitch: false,
      cChainRef: 'iso-08b-1',
      cPitch: 12.7,
      cZ1: 15,
      cZ2: 38,
      cCenter: 380,
      cN1: 900,
    },
  },
  {
    label: 'Paso manual 15 mm',
    labelKey: 'chains.preset3',
    values: {
      cManualPitch: true,
      cPitch: 15,
      cZ1: 19,
      cZ2: 57,
      cCenter: 520,
      cN1: 720,
    },
  },
];

const CHAIN_URL_PARAM_TO_ID = {
  mp: 'cManualPitch',
  chain: 'cChainRef',
  p: 'cPitch',
  z1: 'cZ1',
  z2: 'cZ2',
  a: 'cCenter',
  n1: 'cN1',
};

const chainUrl = createLabUrlSync(CHAIN_URL_PARAM_TO_ID, {
  hydrateOrder: ['mp', 'chain', 'p', 'z1', 'z2', 'a', 'n1'],
  afterHydrate: () => {
    syncPitchDisabled();
  },
});

bindCommerceFilteredSelect(
  'cChainRef',
  CHAIN_CATALOG,
  'id',
  (row) => `${row.label} · ${row.norm} · p = ${row.pitch_mm} mm`,
  (row) => `chain-${row.id}`,
);
const sel = document.getElementById('cChainRef');
if (sel instanceof HTMLSelectElement) sel.value = 'iso-12b-1';

mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'cPitch', min: 4, max: 200, label: 'Paso p' },
  { id: 'cZ1', min: 6, max: 200, label: 'z₁' },
  { id: 'cZ2', min: 6, max: 200, label: 'z₂' },
  { id: 'cCenter', min: 50, max: 50000, label: 'Distancia entre centros' },
  { id: 'cN1', min: 0, max: 30000, label: 'RPM n₁' },
]);

const manualEl = document.getElementById('cManualPitch');
const pitchEl = document.getElementById('cPitch');
const chainRefEl = document.getElementById('cChainRef');
function syncPitchDisabled() {
  const manual = manualEl instanceof HTMLInputElement && manualEl.checked;
  if (pitchEl instanceof HTMLInputElement) pitchEl.disabled = !manual;
  if (chainRefEl instanceof HTMLSelectElement) chainRefEl.disabled = manual;
  if (chainRefEl instanceof HTMLSelectElement) {
    chainRefEl.closest('.lab-field')?.classList.toggle('chain-ref--disabled', manual);
  }
  if (pitchEl instanceof HTMLInputElement) {
    pitchEl.closest('.lab-field')?.classList.toggle('chain-pitch--active', manual);
  }
}
manualEl?.addEventListener('change', syncPitchDisabled);
syncPitchDisabled();

function refreshCore() {
  const lang = getLabLang();
  const t = chainsRuntimeStrings(lang);
  const u = getLabUnitPrefs();
  const useManual = manualEl instanceof HTMLInputElement && manualEl.checked;
  const validationMsgs = [];
  const z1Raw = parseNumberInput('cZ1').value;
  const z2Raw = parseNumberInput('cZ2').value;
  const cRaw = parseNumberInput('cCenter').value;
  const n1Raw = parseNumberInput('cN1').value;
  const pRaw = parseNumberInput('cPitch').value;

  const z1Invalid = !(z1Raw >= 6);
  const z2Invalid = !(z2Raw >= 6);
  const centerInvalid = !(cRaw > 0);
  const n1Invalid = !(n1Raw != null && n1Raw >= 0);
  const pitchInvalid = useManual ? !(pRaw > 0) : false;
  markFieldInvalid('cZ1', z1Invalid, 'Use z1 >= 6 teeth');
  markFieldInvalid('cZ2', z2Invalid, 'Use z2 >= 6 teeth');
  markFieldInvalid('cCenter', centerInvalid, 'Center distance must be > 0');
  markFieldInvalid('cN1', n1Invalid, 'Input speed cannot be negative');
  markFieldInvalid('cPitch', pitchInvalid, 'Manual pitch must be > 0');
  if (z1Invalid) validationMsgs.push(t.valZ1);
  if (z2Invalid) validationMsgs.push(t.valZ2);
  if (centerInvalid) validationMsgs.push(t.valCenter);
  if (n1Invalid) validationMsgs.push(t.valN1);
  if (pitchInvalid) validationMsgs.push(t.valPitch);

  const chainRefId = sel instanceof HTMLSelectElement ? sel.value : '';
  const n1 = readInput('cN1', 0);
  const p = {
    chainRefId: useManual ? '' : chainRefId,
    useManualPitch: useManual,
    pitch_mm: readInput('cPitch', 19.05),
    z1: readInput('cZ1', 17),
    z2: readInput('cZ2', 25),
    center_mm: readInput('cCenter', 450),
    n1_rpm: n1 > 0 ? n1 : undefined,
  };
  const r = computeRollerChain(p);
  const lub = localizeChainLubrication(r.chainLubrication, lang);
  const normsNote = lang === 'en' ? t.normsNote : r.normsNote;

  const hasPolyWarn = Boolean(r.polygonalEffect?.active);
  const articDanger = r.articulationFrequency_Hz != null && r.articulationFrequency_Hz > 50;
  const chainVerdict =
    validationMsgs.length || articDanger ? 'error' : hasPolyWarn ? 'warn' : 'ok';

  const heroEl = document.getElementById('cHero');
  if (heroEl) {
    heroEl.innerHTML = renderResultHero(
      [
        {
          label: t.heroOmega2,
          display: r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—',
          hint: t.heroOmega2Hint,
        },
        {
          label: t.heroChainSpeed,
          display: formatLinearSpeed(r.linearSpeed_m_s, u.linear),
          hint: t.heroChainSpeedHint,
        },
      ],
      { verdict: chainVerdict },
    );
  }

  const box = document.getElementById('cResults');
  const elementBox = document.getElementById('cElementResults');
  if (elementBox) {
    elementBox.innerHTML = [
      elementCardHtml(t.card1, [
        [t.kvZ1, String(r.z1)],
        [t.kvD1, formatLength(r.pitchDiameter1_mm, u.length)],
        [t.kvN1, formatRotation(r.n1_rpm, u.rotation)],
      ]),
      elementCardHtml(t.card2, [
        [t.kvZ2, String(r.z2)],
        [t.kvD2, formatLength(r.pitchDiameter2_mm, u.length)],
        [t.kvN2, r.n2_rpm != null ? formatRotation(r.n2_rpm, u.rotation) : '—'],
      ]),
      elementCardHtml(t.card3, [
        [t.kvPitch, formatLength(r.pitch_mm, u.length)],
        [t.kvLength, `${r.chainLength_pitches.toFixed(2)} ${t.lengthUnit}`],
        [t.kvLinearV, formatLinearSpeed(r.linearSpeed_m_s, u.linear)],
      ]),
    ].join('');
  }

  if (box) {
    const refLine = r.chainRefLabel ? `${r.chainRefLabel}` : t.refManual;
    const cells = [
      metricHtml(
        t.mChainRef,
        refLine,
        t.mChainRefHint(r.chainNorm || normsNote || ''),
      ),
      metricHtml(
        t.mTeethRatio,
        r.ratio_teeth.toFixed(2),
        t.mTeethRatioHint(r.ratio_primitive),
      ),
      metricHtml(
        t.mLength,
        `${r.chainLength_pitches.toFixed(2)} ${t.lengthUnit}`,
        t.mLengthHint(r.chainLength_pitches_roundUp),
      ),
      metricHtml(
        t.mCenter,
        formatLength(r.center_mm, u.length),
        t.mCenterHint(r.center_pitches),
      ),
      metricHtml(
        t.mD1,
        formatLength(r.pitchDiameter1_mm, u.length),
        t.mD1Hint,
      ),
      metricHtml(
        t.mD2,
        formatLength(r.pitchDiameter2_mm, u.length),
        t.mD2Hint,
      ),
      metricHtml(
        t.mW1,
        formatRotation(r.n1_rpm, u.rotation),
        t.mW1Hint,
      ),
      metricHtml(
        t.mW2,
        formatRotation(r.n2_rpm, u.rotation),
        t.mW2Hint,
      ),
      metricHtml(
        t.mLinear,
        formatLinearSpeed(r.linearSpeed_m_s, u.linear),
        t.mLinearHint,
      ),
      metricHtml(
        t.mArtic,
        r.articulationFrequency_Hz != null ? `${r.articulationFrequency_Hz.toFixed(2)} Hz` : '—',
        t.mArticHint,
      ),
      metricHtml(
        t.mLub,
        `${lub.class} — ${lub.label}`,
        t.mLubHint(lub.detail),
      ),
    ];
    box.innerHTML = cells.join('');
  }

  const alerts = document.getElementById('cAlerts');
  if (alerts) {
    const parts = [];
    const hasValidation = validationMsgs.length > 0;
    parts.push(
      executiveSummaryAlert({
        level: hasValidation ? 'danger' : hasPolyWarn ? 'warn' : 'ok',
        titleEs: hasValidation
          ? 'Resumen ejecutivo: complete y corrija entradas para cerrar el cálculo.'
          : hasPolyWarn
            ? 'Resumen ejecutivo: cinemática válida con advertencias por efecto poligonal.'
            : 'Resumen ejecutivo: resultado válido como base de selección.',
        titleEn: hasValidation
          ? 'Executive summary: complete/fix inputs to close the calculation.'
          : hasPolyWarn
            ? 'Executive summary: valid kinematics with polygonal-effect warnings.'
            : 'Executive summary: valid baseline result for component selection.',
        actionsEs: hasValidation
          ? ['Corregir campos en rojo.', 'Recalcular antes de seleccionar componentes.']
          : ['Confirmar lubricación y paso con catálogo real.', 'Validar cierre de longitud y montaje.'],
        actionsEn: hasValidation
          ? ['Fix fields marked in red.', 'Recalculate before selecting components.']
          : ['Confirm lubrication and pitch with real catalogue.', 'Validate chain length closure and assembly.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', esc(msg))));
    if (r.polygonalEffect?.active) {
      parts.push(labAlert('warn', esc(lang === 'en' ? t.polyEffect : r.polygonalEffect.text)));
    }
    if (r.z1 < 17) {
      parts.push(labAlert('warn', esc(t.alertZ1Low)));
    }
    if (r.articulationFrequency_Hz != null && r.articulationFrequency_Hz > 50) {
      parts.push(labAlert('danger', esc(t.alertArticHigh(r.articulationFrequency_Hz))));
    }
    if (parts.length === 0) {
      parts.push(labAlert('info', esc(`${normsNote}${t.alertNormsSuffix}`)));
    } else {
      parts.push(labAlert('info', esc(normsNote)));
    }
    parts.push(labAlert('info', esc(t.alertModel)));
    alerts.innerHTML = parts.join('');
  }

  const sub = document.getElementById('cSubstitution');
  if (sub && r.n1_rpm != null && r.omega2_rad_s != null) {
    const D1 = r.pitchDiameter1_mm;
    const D2 = r.pitchDiameter2_mm;
    const vDisp = formatLinearSpeed(r.linearSpeed_m_s, u.linear);
    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">${esc(t.subTitle)}</span>
        </summary>
        <div class="calc-substitution__inner">
          <p class="calc-substitution__step">
            ${esc(t.subD)} <code>D = p / sin(\u03c0/z)</code> \u2192
            <code>D\u2081 = ${D1.toFixed(2)} mm</code>, <code>D\u2082 = ${D2.toFixed(2)} mm</code>
          </p>
          <p class="calc-substitution__step">
            ${esc(t.subN2)} <code>n\u2082 = n\u2081 \u00b7 D\u2081/D\u2082 = ${r.n1_rpm.toFixed(2)} \u00d7 ${D1.toFixed(2)} / ${D2.toFixed(2)} = ${r.n2_rpm != null ? r.n2_rpm.toFixed(2) : '\u2014'} RPM</code>
          </p>
          <p class="calc-substitution__step">
            ${esc(t.subUnits)} <strong>${formatRotation(r.n2_rpm, u.rotation)}</strong>
          </p>
          <p class="calc-substitution__step">
            ${esc(t.subV)} <strong>${vDisp}</strong>
          </p>
          <p class="calc-substitution__step">
            ${esc(t.subArtic)} <strong>${r.articulationFrequency_Hz != null ? `${r.articulationFrequency_Hz.toFixed(2)} Hz` : '\u2014'}</strong>
          </p>
        </div>
      </details>`;
  } else if (sub) {
    sub.innerHTML = '';
  }

  const assem = document.getElementById('cAssembly');
  if (assem && r.assembly) {
    const a = r.assembly;
    assem.innerHTML = `
      <div class="lab-metric lab-metric--wide">
        <div class="lab-metric__head">
          <span class="k">${esc(t.asmTitle)}</span>
          ${labHelpTooltipMarkup(a.notes, t.asmNotes)}
        </div>
        <div class="v lab-metric__text">
          ${t.asmBody(a)}
        </div>
      </div>
    `;
  }

  renderChainDriveDiagram(document.getElementById('cDiagram'), p);

  const cref = !useManual && chainRefId ? chainRefId : 'iso-12b-1';
  const shoppingLines = [
    {
      commerceId: commerceIdForChainRef(cref),
      qty: 1,
      note: useManual ? t.shopNoteManual : r.chainRefLabel || cref,
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-chains',
    moduleLabel: t.moduleLabel,
    advisorContext: {},
    shoppingLines,
    metrics: { energyEfficiencyPct: 97, materialUtilizationPct: null },
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    { label: t.shopPinion, searchQuery: t.shopQ },
  ]);

  updateLabShareVisibility('cShareLinkWrap', 'cResults');
  chainUrl.serializeToUrl();
}

const wrap = document.getElementById('cResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const chainPresets = mountLabPresetsBar('cPresetsBar', CHAIN_PRESETS, debounced);

function scheduleChainRecalc() {
  if (!chainPresets.applying && !chainUrl.hydrating) {
    chainPresets.clearActive();
  }
  debounced();
}

chainUrl.hydrateFromUrl();
syncPitchDisabled();

bindLabUnitSelectors(scheduleChainRecalc);
['cPitch', 'cZ1', 'cZ2', 'cCenter', 'cN1', 'cChainRef', 'cManualPitch'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleChainRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleChainRecalc);
});
manualEl?.addEventListener('change', scheduleChainRecalc);
wireLabCopyLink('cCopyLinkBtn', 'cCopyToast');
wireLabCopyResultsButton('cCopyResults', {
  moduleTitle: chainsRuntimeStrings(getLabLang()).moduleLabel,
});
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar(chainsRuntimeStrings(getLabLang()).moduleLabel);
watchLangAndApply(CHAINS_EN, {
  reloadOnEs: false,
  onEnApplied: () => scheduleChainRecalc(),
  onEsRestored: () => scheduleChainRecalc(),
});
window.addEventListener(LAB_LANG_EVENT, () => {
  bootSmartDashboardIfEnabled(chainsRuntimeStrings(getLabLang()).dashboardBoot);
  scheduleChainRecalc();
});
