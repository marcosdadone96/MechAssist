import { mountTierStatusBar } from './paywallMount.js';
import { renderShaftTorsionDiagram } from '../lab/diagramShaft.js';
import { bindLabUnitSelectors, formatLength, getLabUnitPrefs } from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import {
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import { metricsFromShaft } from '../services/iaAdvisor.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';
import { LAB_LANG_EVENT, getLabLang } from '../lab/i18n/labLang.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { SHAFT_PAGE_EN } from '../lab/i18n/pages/shaftPageEn.js';
import { shaftRuntimeStrings } from '../lab/i18n/runtime/shaftRuntime.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled(shaftRuntimeStrings(getLabLang()).dashboardBoot);
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'shT', min: 0, max: 1e9, label: 'Par T' },
  { id: 'shTau', min: 1, max: 2000, label: 'τ adm' },
  { id: 'shM', min: 0, max: 1e9, label: 'Momento M' },
  { id: 'shKt', min: 1, max: 20, label: 'Kt' },
  { id: 'shAvailableD', min: 0.1, max: 5000, label: 'Diámetro' },
]);

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function markFieldInvalid(id, invalid, msg = '') {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) return;
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

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLSelectElement)) return fallback;
  return el.value || fallback;
}

function syncAdvancedUi() {
  const use = document.getElementById('shUseBending');
  const enabled = use instanceof HTMLInputElement && use.checked;
  ['shMRow', 'shCriterionRow', 'shKtRow'].forEach((id) => {
    const row = document.getElementById(id);
    if (!row) return;
    row.classList.toggle('sh-advanced-row--hidden', !enabled);
  });
}

function syncShCalcModeUi() {
  const t = shaftRuntimeStrings(getLabLang());
  const diag = readSelect('shCalcMode', 'design') === 'diagnostic';
  const lbl = document.getElementById('shAvailableDLabel');
  const dh = document.getElementById('shAvailableDHelp');
  const th = document.getElementById('shTHelp');
  const modeHelp = document.getElementById('shCalcModeHelp');
  if (lbl) lbl.textContent = diag ? t.labelDDiag : t.labelDDesign;
  if (dh) dh.textContent = diag ? t.helpDDiag : t.helpDDesign;
  if (th) th.textContent = diag ? t.helpTDiag : t.helpTDesign;
  if (modeHelp) modeHelp.innerHTML = t.modeHelpDesign;
}

const SHAFT_PRESETS = [
  {
    label: 'Torsión · diseño',
    labelKey: 'shaft.preset1',
    values: {
      shCalcMode: 'design',
      shT: 480,
      shTau: 40,
      shUseBending: false,
      shM: 0,
      shCriterion: 'von_mises',
      shKt: 1.5,
      shAvailableD: 45,
    },
  },
  {
    label: 'T + M · Von Mises',
    labelKey: 'shaft.preset2',
    values: {
      shCalcMode: 'design',
      shT: 1200,
      shTau: 55,
      shUseBending: true,
      shM: 800,
      shCriterion: 'von_mises',
      shKt: 1.4,
      shAvailableD: 70,
    },
  },
  {
    label: 'Diagnóstico Ø40',
    labelKey: 'shaft.preset3',
    values: {
      shCalcMode: 'diagnostic',
      shT: 650,
      shTau: 42,
      shUseBending: false,
      shM: 0,
      shCriterion: 'tresca',
      shKt: 1,
      shAvailableD: 40,
    },
  },
];

const SHAFT_URL_PARAM_TO_ID = {
  mode: 'shCalcMode',
  T: 'shT',
  tau: 'shTau',
  bend: 'shUseBending',
  M: 'shM',
  crit: 'shCriterion',
  kt: 'shKt',
  d: 'shAvailableD',
};

const shaftUrl = createLabUrlSync(SHAFT_URL_PARAM_TO_ID, {
  hydrateOrder: ['mode', 'bend', 'T', 'tau', 'M', 'crit', 'kt', 'd'],
  afterHydrate: () => {
    syncAdvancedUi();
    syncShCalcModeUi();
  },
});

function refreshCore() {
  const t = shaftRuntimeStrings(getLabLang());
  const critLabel = (c) => (c === 'tresca' ? t.tresca : t.vonMises);
  const u = getLabUnitPrefs();
  const validationMsgs = [];
  const mode = readSelect('shCalcMode', 'design');
  const tRaw = parseNumberInput('shT').value;
  const tauRaw = parseNumberInput('shTau').value;
  const mRaw = parseNumberInput('shM').value;
  const ktRaw = parseNumberInput('shKt').value;
  const dAvailRaw = parseNumberInput('shAvailableD').value;
  const useBendingEl = document.getElementById('shUseBending');
  const useBending = useBendingEl instanceof HTMLInputElement && useBendingEl.checked;
  const criterion = readSelect('shCriterion', 'von_mises');
  const torqueInvalid = !(tRaw != null && tRaw >= 0);
  const tauInvalid = !(tauRaw != null && tauRaw > 0);
  const mInvalid = useBending ? !(mRaw != null && mRaw >= 0) : false;
  const ktInvalid = useBending ? !(ktRaw != null && ktRaw >= 1) : false;
  const dAvailInvalid = !(dAvailRaw != null && dAvailRaw > 0);
  markFieldInvalid('shT', torqueInvalid, 'Torque must be >= 0');
  markFieldInvalid('shTau', tauInvalid, 'Allowable stress must be > 0');
  markFieldInvalid('shM', mInvalid, 'Bending moment must be >= 0');
  markFieldInvalid('shKt', ktInvalid, 'Kt must be >= 1');
  markFieldInvalid('shAvailableD', dAvailInvalid, 'Available diameter must be > 0');
  if (torqueInvalid) validationMsgs.push(t.valT);
  if (tauInvalid) validationMsgs.push(t.valTau);
  if (mInvalid) validationMsgs.push(t.valM);
  if (ktInvalid) validationMsgs.push(t.valKt);
  if (dAvailInvalid) validationMsgs.push(t.valD);

  const T = read('shT', 480);
  const tauAllow_MPa = read('shTau', 40);
  const M = useBending ? read('shM', 0) : 0;
  const Kt = useBending ? read('shKt', 1.0) : 1.0;
  const dAvail_mm = read('shAvailableD', 40);
  const tauAllow_Pa = tauAllow_MPa * 1e6;
  const sigmaAllow_MPa = Math.sqrt(3) * tauAllow_MPa;

  let diameter_min_mm;
  let tauTor_MPa;
  let sigmaBend_MPa;
  let sigmaEq_MPa;
  let fitOk;
  let diagUtil = null;

  if (mode === 'diagnostic') {
    const d_m = dAvail_mm / 1000;
    tauTor_MPa = d_m > 0 ? (Kt * 16 * T) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaBend_MPa = d_m > 0 ? (Kt * 32 * M) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaEq_MPa =
      criterion === 'tresca'
        ? 2 * Math.sqrt((sigmaBend_MPa / 2) ** 2 + tauTor_MPa ** 2)
        : Math.sqrt(sigmaBend_MPa ** 2 + 3 * tauTor_MPa ** 2);
    diagUtil = useBending ? sigmaEq_MPa / sigmaAllow_MPa : tauTor_MPa / tauAllow_MPa;
    fitOk = diagUtil <= 1;
    diameter_min_mm = dAvail_mm;
  } else {
    const baseVm = Math.sqrt((32 * M) ** 2 + 3 * (16 * T) ** 2);
    const baseTresca = 16 * Math.sqrt(M ** 2 + T ** 2);
    const d_m =
      criterion === 'tresca'
        ? Math.pow((Kt * baseTresca) / (Math.PI * tauAllow_Pa), 1 / 3)
        : Math.pow((Kt * baseVm) / (Math.PI * Math.sqrt(3) * tauAllow_Pa), 1 / 3);
    diameter_min_mm = d_m * 1000;
    tauTor_MPa = d_m > 0 ? (Kt * 16 * T) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaBend_MPa = d_m > 0 ? (Kt * 32 * M) / (Math.PI * d_m ** 3) / 1e6 : 0;
    sigmaEq_MPa =
      criterion === 'tresca'
        ? 2 * Math.sqrt((sigmaBend_MPa / 2) ** 2 + tauTor_MPa ** 2)
        : Math.sqrt(sigmaBend_MPa ** 2 + 3 * tauTor_MPa ** 2);
    fitOk = dAvail_mm >= diameter_min_mm;
  }

  const r = {
    torque_Nm: T,
    tauAllow_MPa,
    diameter_min_mm,
    tauAtMinDiameter_MPa: tauTor_MPa,
  };

  const heroEl = document.getElementById('shHero');
  if (heroEl) {
    const heroItems =
      mode === 'diagnostic'
        ? [
            {
              label: useBending ? t.heroUtilBend : t.heroUtilTor,
              display:
                diagUtil != null && Number.isFinite(diagUtil)
                  ? `${(diagUtil * 100).toFixed(1)} %`
                  : '—',
              hint:
                diagUtil != null && Number.isFinite(diagUtil)
                  ? t.heroFs(1 / diagUtil)
                  : '—',
            },
            {
              label: useBending ? t.heroSigEq : t.heroTau,
              display: useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${tauTor_MPa.toFixed(2)} MPa`,
              hint: t.heroDHint(dAvail_mm, critLabel(criterion)),
            },
          ]
        : [
            {
              label: t.heroDMin,
              display: formatLength(r.diameter_min_mm, u.length),
              hint: useBending ? t.heroDMinHintBend : t.heroDMinHintTor,
            },
            {
              label: useBending ? t.heroSigAtMin : t.heroTauAtMin,
              display: useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${r.tauAtMinDiameter_MPa.toFixed(2)} MPa`,
              hint: useBending
                ? t.heroKtHint(critLabel(criterion), Kt)
                : t.heroTauCompare(r.tauAllow_MPa),
            },
          ];
    const shaftVerdict =
      validationMsgs.length ? 'error' : mode === 'design' ? (!fitOk ? 'error' : 'ok') : !fitOk ? 'warn' : 'ok';
    heroEl.innerHTML = renderResultHero(heroItems, { verdict: shaftVerdict });
  }

  const box = document.getElementById('shResults');
  if (box) {
    const rows =
      mode === 'diagnostic'
        ? [
            metricHtml(t.mAnalyzedD, formatLength(dAvail_mm, u.length), t.mAnalyzedDHint),
            metricHtml(
              useBending ? t.mSigEq : t.mTau,
              useBending ? `${sigmaEq_MPa.toFixed(2)} MPa` : `${tauTor_MPa.toFixed(2)} MPa`,
              useBending ? t.mSigLimit(sigmaAllow_MPa) : t.mTauLimit(tauAllow_MPa),
            ),
            metricHtml(
              t.mUtil,
              diagUtil != null && Number.isFinite(diagUtil) ? `${(diagUtil * 100).toFixed(1)} %` : '—',
              t.mUtilHint,
            ),
            metricHtml(
              t.mMode,
              useBending ? t.mModeAdv(critLabel(criterion), Kt) : t.mModeBasic,
              t.mModeDiag,
            ),
            metricHtml(t.mM, `${M.toFixed(2)} N\u00b7m`, t.mMHint),
            metricHtml(t.mSigBend, `${sigmaBend_MPa.toFixed(2)} MPa`, t.mSigBendHint),
            metricHtml(t.mTauIn, `${r.tauAllow_MPa.toFixed(2)} MPa`, t.mTauInHint),
          ]
        : [
            metricHtml(t.mDMin, formatLength(r.diameter_min_mm, u.length), t.mDMinHint),
            metricHtml(t.mTauCalc, `${r.tauAtMinDiameter_MPa.toFixed(2)} MPa`, t.mTauCalcHint),
            metricHtml(
              t.mMode,
              useBending ? t.mModeAdv(critLabel(criterion), Kt) : t.mModeBasic,
              t.mModeAdvDesign,
            ),
            metricHtml(t.mM, `${M.toFixed(2)} N\u00b7m`, t.mMHint),
            metricHtml(t.mSigBend, `${sigmaBend_MPa.toFixed(2)} MPa`, t.mSigBendHint),
            metricHtml(
              t.mSigEqMin,
              `${sigmaEq_MPa.toFixed(2)} MPa`,
              useBending ? t.mSigEqMinHint : t.mSigEqBasic,
            ),
            metricHtml(t.mAllowIn, `${r.tauAllow_MPa.toFixed(2)} MPa`, t.mTauInHint),
          ];
    box.innerHTML = rows.join('');
  }
  const alerts = document.getElementById('shAlerts');
  if (alerts) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: validationMsgs.length
          ? 'danger'
          : mode === 'design' && !fitOk
            ? 'danger'
            : !fitOk
              ? 'warn'
              : 'ok',
        titleEs: validationMsgs.length
          ? 'Resumen ejecutivo: revisar entradas antes de validar diámetro.'
          : mode === 'diagnostic' && !fitOk
            ? 'Resumen ejecutivo: el eje instalado supera el criterio admisible con la carga indicada.'
            : mode === 'diagnostic' && fitOk
              ? 'Resumen ejecutivo: tensiones coherentes con el diámetro instalado (modelo estático).'
              : !fitOk
                ? 'Resumen ejecutivo: el diámetro disponible no alcanza el mínimo calculado.'
                : 'Resumen ejecutivo: diámetro mínimo calculado y verificado contra disponible.',
        titleEn: validationMsgs.length
          ? 'Executive summary: review inputs before validating diameter.'
          : mode === 'diagnostic' && !fitOk
            ? 'Executive summary: installed shaft exceeds allowable criterion at stated load.'
            : mode === 'diagnostic' && fitOk
              ? 'Executive summary: stresses are consistent with installed diameter (static model).'
              : !fitOk
                ? 'Executive summary: available diameter is below required minimum.'
                : 'Executive summary: minimum diameter calculated and checked against available size.',
        actionsEs: validationMsgs.length
          ? ['Corregir campos en rojo.', 'Recalcular para emitir recomendación de compra.']
          : mode === 'diagnostic' && !fitOk
            ? ['Aumentar diámetro, reducir T o M, o revisar material (τadm).', 'Comprobar concentradores con Kt.']
            : !fitOk
              ? ['Aumentar diámetro disponible o reducir cargas.', 'Revisar Kt y criterio para cierre de diseño.']
              : ['Añadir margen comercial de diámetro.', 'Comprobar chavetero, fatiga y concentradores.'],
        actionsEn: validationMsgs.length
          ? ['Fix fields marked in red.', 'Recalculate before issuing purchase guidance.']
          : mode === 'diagnostic' && !fitOk
            ? ['Increase diameter, reduce T or M, or review material (tau adm).', 'Review stress concentrations with Kt.']
            : !fitOk
              ? ['Increase available diameter or reduce loads.', 'Review Kt and criterion before release.']
              : ['Add commercial diameter margin.', 'Check keyway, fatigue, and stress raisers.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', msg)));
    if (validationMsgs.length === 0) {
      parts.push(
        labAlert(
          'info',
          useBending ? t.alertAdv : t.alertBasic,
        ),
      );
      if (mode === 'design' && diameter_min_mm < 15) {
        parts.push(labAlert('warn', t.alertSmallD));
      }
      parts.push(labAlert('info', t.alertModel));
    }
    alerts.innerHTML = parts.join('');
  }
  renderShaftTorsionDiagram(document.getElementById('shDiagram'), {
    diameter_mm: mode === 'diagnostic' ? dAvail_mm : r.diameter_min_mm,
    showBending: useBending,
    moment_Nm: M,
  });

  const shopD = mode === 'diagnostic' ? dAvail_mm : r.diameter_min_mm;
  const shoppingLines = [
    {
      commerceId: 'shaft-turned-quote',
      qty: 1,
      note:
        mode === 'diagnostic'
          ? t.shopDiag(shopD, diagUtil != null ? `${(diagUtil * 100).toFixed(0)} %` : '—')
          : t.shopDesign(r.diameter_min_mm, r.tauAtMinDiameter_MPa),
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-shaft',
    moduleLabel: t.moduleLabel,
    advisorContext: {},
    shoppingLines,
    metrics: metricsFromShaft({
      tauAllow_MPa: r.tauAllow_MPa,
      tauAtMinDiameter_MPa: r.tauAtMinDiameter_MPa,
    }),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    {
      label: t.shopLabel,
      searchQuery: t.shopQ(Math.ceil(shopD)),
    },
  ]);

  updateLabShareVisibility('shShareLinkWrap', 'shResults');
  shaftUrl.serializeToUrl();
}

const wrap = document.getElementById('shResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(wrap, refreshCore), 55);

const shaftPresets = mountLabPresetsBar('shPresetsBar', SHAFT_PRESETS, debounced);

function scheduleShaftRecalc() {
  if (!shaftPresets.applying && !shaftUrl.hydrating) {
    shaftPresets.clearActive();
  }
  debounced();
}

shaftUrl.hydrateFromUrl();
syncAdvancedUi();
syncShCalcModeUi();

bindLabUnitSelectors(scheduleShaftRecalc);
['shCalcMode', 'shT', 'shTau', 'shM', 'shKt', 'shCriterion', 'shUseBending', 'shAvailableD'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleShaftRecalc);
  document.getElementById(id)?.addEventListener('change', () => {
    if (id === 'shCalcMode') syncShCalcModeUi();
    scheduleShaftRecalc();
  });
});
document.getElementById('shUseBending')?.addEventListener('change', () => {
  syncAdvancedUi();
  scheduleShaftRecalc();
});
document.querySelectorAll('#shTauChips [data-tau]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tau = Number(btn.getAttribute('data-tau'));
    const tauEl = document.getElementById('shTau');
    if (tauEl instanceof HTMLInputElement && Number.isFinite(tau)) {
      tauEl.value = String(tau);
      scheduleShaftRecalc();
    }
  });
});
wireLabCopyLink('shCopyLinkBtn', 'shCopyToast');
wireLabCopyResultsButton('shCopyResults', {
  moduleTitle: shaftRuntimeStrings(getLabLang()).moduleLabel,
});
runCalcWithIndustrialFeedback(wrap, refreshCore);
mountLabCloudSaveBar(shaftRuntimeStrings(getLabLang()).moduleLabel);

watchLangAndApply(SHAFT_PAGE_EN, {
  onEnApplied: () => {
    syncShCalcModeUi();
    syncAdvancedUi();
    scheduleShaftRecalc();
  },
});
window.addEventListener(LAB_LANG_EVENT, () => {
  bootSmartDashboardIfEnabled(shaftRuntimeStrings(getLabLang()).dashboardBoot);
  syncShCalcModeUi();
  scheduleShaftRecalc();
});
