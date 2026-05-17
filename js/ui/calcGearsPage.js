import { mountTierStatusBar } from './paywallMount.js';
import { computeSpurGearPair } from '../lab/gears.js';
import { computeAgmaSimplifiedCheck } from '../lab/agmaSpurSimplified.js';
import { renderGearPairDiagram } from '../lab/diagramGears.js';
import {
  bindLabUnitSelectors,
  formatLength,
  formatLinearSpeed,
  formatRotation,
  getLabUnitPrefs,
} from '../lab/labUnitPrefs.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { injectLabUnitConverterIfNeeded, mountLabUnitConverter } from '../lab/labUnitConvert.js';
import { setLabPurchaseFromShoppingLines } from './labPurchaseSuggestions.js';
import {
  bindInputValidation,
  createLabUrlSync,
  debounce,
  executiveSummaryAlert,
  labAlert,
  metricHtml,
  mountLabPresetsBar,
  renderMotorPowerRuler,
  renderResultHero,
  runCalcWithIndustrialFeedback,
  updateLabShareVisibility,
  uxCopy,
  wireLabCopyLink,
  wireLabCopyResultsButton,
} from './labCalcUx.js';
import { emitEngineeringSnapshot } from '../services/engineeringSnapshot.js';
import { metricsFromGears } from '../services/iaAdvisor.js';
import { bootSmartDashboardIfEnabled } from './smartDashboardBoot.js';
import { LAB_LANG_EVENT, getLabLang } from '../lab/i18n/labLang.js';
import { gearsRuntimeStrings } from '../lab/i18n/runtime/gearsRuntime.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { GEARS_PAGE_EN } from '../lab/i18n/pages/gearsPageEn.js';
import { mountLabCloudSaveBar } from './labCloudSave.js';

mountTierStatusBar();
bootSmartDashboardIfEnabled(gearsRuntimeStrings(getLabLang()).dashboardBoot);
injectLabUnitConverterIfNeeded();
mountLabUnitConverter();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'gM', min: 0.2, max: 50, label: 'Módulo m' },
  { id: 'gZ1', min: 6, max: 500, label: 'Dientes Z₁' },
  { id: 'gZ2', min: 6, max: 500, label: 'Dientes Z₂' },
  { id: 'gFace', min: 1, max: 500, label: 'Ancho de cara b' },
  { id: 'gAlpha', min: 0, max: 45, label: 'Presión α' },
  { id: 'gBeta', min: 0, max: 45, label: 'Hélice β' },
  { id: 'gN1', min: 0, max: 30000, label: 'RPM motrices n₁' },
  { id: 'gPower', min: 0, max: 1e7, label: 'Potencia' },
  { id: 'gTorque', min: 0, max: 1e9, label: 'Par' },
]);

function read(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readOptional(id) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return null;
  const s = el.value.trim();
  if (s === '') return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
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

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function elementCardHtml(title, rows) {
  const body = rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('');
  return `<article class="lab-element-card"><h4 class="lab-element-card__title">${esc(title)}</h4><dl class="lab-element-card__kv">${body}</dl></article>`;
}

const GEAR_PRESETS = [
  {
    label: 'Reducción 3:1 paso 1',
    labelKey: 'gear.preset1',
    values: {
      gCalcMode: 'diagnostic',
      gZ1: 20,
      gZ2: 60,
      gM: 1,
      gFace: 32,
      gAlpha: 20,
      gBeta: 0,
      gN1: 1455,
      gPower: 5.5,
      gTorque: '',
      gLube: 'oil',
    },
  },
  {
    label: 'Par elevado paso 2.5',
    labelKey: 'gear.preset2',
    values: {
      gCalcMode: 'diagnostic',
      gZ1: 18,
      gZ2: 45,
      gM: 2.5,
      gFace: 55,
      gAlpha: 20,
      gBeta: 0,
      gN1: 720,
      gTorque: 2200,
      gPower: '',
      gLube: 'oil',
    },
  },
  {
    label: 'Alta velocidad módulo 1',
    labelKey: 'gear.preset3',
    values: {
      gCalcMode: 'diagnostic',
      gZ1: 24,
      gZ2: 36,
      gM: 1,
      gFace: 20,
      gAlpha: 20,
      gBeta: 0,
      gN1: 6000,
      gPower: 8,
      gTorque: '',
      gLube: 'oil',
    },
  },
  {
    label: 'Helicoidal 15° · mₙ 2',
    labelKey: 'gear.presetHelix',
    values: {
      gCalcMode: 'diagnostic',
      gZ1: 22,
      gZ2: 44,
      gM: 2,
      gFace: 40,
      gAlpha: 20,
      gBeta: 15,
      gN1: 1200,
      gPower: 12,
      gTorque: '',
      gLube: 'oil',
    },
  },
];

function powerKwFromInputs(n1_rpm, Topt, Popt) {
  if (Topt != null && Topt > 0 && n1_rpm > 0) {
    const omega = (2 * Math.PI * n1_rpm) / 60;
    return (Topt * omega) / 1000;
  }
  if (Popt != null && Popt > 0) return Popt;
  return null;
}

function syncGearCalcModeUi() {
  const design = document.getElementById('gCalcMode')?.value === 'design';
  const help = document.getElementById('gCalcModeHelp');
  if (!(help instanceof HTMLElement)) return;
  const t = gearsRuntimeStrings(getLabLang());
  help.innerHTML = design ? t.calcModeHelpDesignHtml : t.calcModeHelpDiagnosticHtml;
}

function applyGearsHelpI18n() {
  const t = gearsRuntimeStrings(getLabLang());
  const sum = document.getElementById('gearsHelpSummary');
  const body = document.getElementById('gearsHelpBody');
  if (sum) sum.textContent = t.helpSummary;
  if (body) body.innerHTML = t.helpBody;
}

function refreshCore() {
  const t = gearsRuntimeStrings(getLabLang());
  const u = getLabUnitPrefs();
  const lubeEl = document.getElementById('gLube');
  const lube = lubeEl instanceof HTMLSelectElement && lubeEl.value === 'grease' ? 'grease' : 'oil';
  const validationMsgs = [];

  const z1Raw = parseNumberInput('gZ1').value;
  const z2Raw = parseNumberInput('gZ2').value;
  const mRaw = parseNumberInput('gM').value;
  const faceRaw = parseNumberInput('gFace').value;
  const alphaRaw = parseNumberInput('gAlpha').value;
  const betaParsed = parseNumberInput('gBeta');
  const betaRaw = betaParsed.empty ? 0 : betaParsed.value;
  const n1Raw = parseNumberInput('gN1').value;

  const z1Invalid = !(z1Raw >= 6);
  const z2Invalid = !(z2Raw >= 6);
  const mInvalid = !(mRaw > 0);
  const faceInvalid = !(faceRaw > 0);
  const alphaInvalid = !(alphaRaw > 0 && alphaRaw <= 45);
  const betaInvalid =
    !betaParsed.empty && (betaRaw == null || !(betaRaw >= 0 && betaRaw <= 45));
  const n1Invalid = !(n1Raw != null && n1Raw >= 0);
  markFieldInvalid('gZ1', z1Invalid, 'Use z1 >= 6 teeth');
  markFieldInvalid('gZ2', z2Invalid, 'Use z2 >= 6 teeth');
  markFieldInvalid('gM', mInvalid, 'Module must be > 0');
  markFieldInvalid('gFace', faceInvalid, 'Face width must be > 0');
  markFieldInvalid('gAlpha', alphaInvalid, 'Pressure angle must be between 0 and 45 deg');
  markFieldInvalid('gBeta', betaInvalid, 'Helix angle beta: use 0 to 45 deg (0 = spur)');
  markFieldInvalid('gN1', n1Invalid, 'Input speed cannot be negative');
  if (z1Invalid) validationMsgs.push('Revise z1: use at least 6 teeth.');
  if (z2Invalid) validationMsgs.push('Revise z2: use at least 6 teeth.');
  if (mInvalid) validationMsgs.push('Revise module m: it must be greater than 0.');
  if (faceInvalid) validationMsgs.push('Revise face width b: it must be greater than 0.');
  if (alphaInvalid) validationMsgs.push('Revise pressure angle alpha: set a value between 0 and 45 deg.');
  if (betaInvalid) validationMsgs.push('Revise helix angle beta: use a value between 0 and 45 deg (0 = spur).');
  if (n1Invalid) validationMsgs.push('Revise input speed n1: it cannot be negative.');

  const n1In = read('gN1', 1455);
  const helixDeg = betaParsed.empty ? read('gBeta', 0) : betaRaw != null ? betaRaw : 0;
  const p = {
    z1: read('gZ1', 20),
    z2: read('gZ2', 45),
    module_mm: read('gM', 2.5),
    pressureAngle_deg: read('gAlpha', 20),
    helixAngle_deg: helixDeg,
    n1: n1In,
    faceWidth_mm: read('gFace', 28),
  };
  const r = computeSpurGearPair(p);

  const Topt = readOptional('gTorque');
  const Popt = readOptional('gPower');
  const P_kw = powerKwFromInputs(n1In, Topt, Popt);

  const agma = computeAgmaSimplifiedCheck({
    z1: r.z1,
    z2: r.z2,
    module_mm: r.module_mm,
    module_transverse_mm: r.module_transverse_mm,
    helixAngle_deg: r.helixAngle_deg,
    d1_mm: r.d1,
    faceWidth_mm: r.faceWidth_mm ?? read('gFace', 28),
    n1_rpm: r.n1 ?? 0,
    torquePinion_Nm: Topt ?? undefined,
    powerPinion_kW: Topt != null ? undefined : Popt ?? undefined,
    lubrication: lube,
  });

  const hasValidationG = validationMsgs.length > 0;
  const sfCriticalG = agma.hasLoad && agma.bendingSafety_SF < 1.05;
  const shCriticalG = agma.hasLoad && agma.contactSafety_SH < 1.05;
  const gearsHasCritical = hasValidationG || sfCriticalG || shCriticalG;
  const gearsHasWarn =
    !gearsHasCritical &&
    (agma.velocityAlerts.some((a) => a.level !== 'danger') ||
      (agma.hasLoad && (agma.bendingSafety_SF < 1.4 || agma.contactSafety_SH < 1.2)));

  const heroEl = document.getElementById('gHero');
  if (heroEl) {
    const heroItems = [];
    heroItems.push({
      label: t.heroOmega,
      display: r.n2 != null ? formatRotation(r.n2, u.rotation) : '—',
      hint: r.n2 != null ? t.heroOmegaHintOk : t.heroOmegaHintNeed,
    });
    if (P_kw != null) {
      heroItems.push({
        label: t.heroP,
        display: `${P_kw.toFixed(2)} kW`,
        hint: Topt != null ? t.heroPHintT : t.heroPHintIn,
      });
    } else {
      heroItems.push({
        label: t.heroP,
        display: t.heroPEmpty,
        hint: t.heroPHintOpt,
      });
    }
    const gv = gearsHasCritical ? 'error' : gearsHasWarn ? 'warn' : 'ok';
    heroEl.innerHTML = renderResultHero(heroItems, { verdict: gv });
  }

  const motorEl = document.getElementById('gMotorCompare');
  if (motorEl) {
    motorEl.innerHTML = P_kw != null && P_kw > 0 ? renderMotorPowerRuler(P_kw) : '';
  }

  const i = r.ratio_transmission;
  const elementBox = document.getElementById('gElementResults');
  if (elementBox) {
    elementBox.innerHTML = [
      elementCardHtml(t.card1, [
        [t.kvZ, String(r.z1)],
        [t.kvDp, formatLength(r.d1, u.length)],
        [t.kvDa, formatLength(r.da1, u.length)],
        [t.kvDf, formatLength(r.db1, u.length)],
        [t.kvN, formatRotation(r.n1, u.rotation)],
      ]),
      elementCardHtml(t.card2, [
        [t.kvZ, String(r.z2)],
        [t.kvDp, formatLength(r.d2, u.length)],
        [t.kvDa, formatLength(r.da2, u.length)],
        [t.kvDf, formatLength(r.db2, u.length)],
        [t.kvN, formatRotation(r.n2, u.rotation)],
      ]),
    ].join('');
  }

  const box = document.getElementById('gResults');
  if (box) {
    box.innerHTML = [
      metricHtml(t.mRatioExact, i.toFixed(4), t.mRatioExactHint),
      metricHtml(t.mRatio, i.toFixed(2), t.mRatioHint(1 / i)),
      metricHtml(t.mVp1, formatLinearSpeed(r.v_pitch_m_s, u.linear), t.mVp1Hint),
      metricHtml(t.mCenter, formatLength(r.centerDistance_mm, u.length), t.mCenterHint),
      metricHtml(t.mD1, formatLength(r.d1, u.length), t.mD1Hint),
      metricHtml(t.mD2, formatLength(r.d2, u.length), t.mD2Hint),
      ...(r.helixAngle_deg > 1e-6
        ? [
            metricHtml(t.mMt, `${r.module_transverse_mm.toFixed(3)} mm`, t.mMtHint),
            metricHtml(t.mBeta, `${r.helixAngle_deg.toFixed(1)}\u00b0`, t.mBetaHint),
            metricHtml(
              t.mAlphat,
              `${r.pressureAngle_transverse_deg.toFixed(2)}\u00b0`,
              t.mAlphatHint,
            ),
          ]
        : []),
      metricHtml(t.mFace, formatLength(r.faceWidth_mm ?? 0, u.length), t.mFaceHint),
      metricHtml(t.mDa1, formatLength(r.da1, u.length), t.mDa1Hint),
      metricHtml(t.mDa2, formatLength(r.da2, u.length), t.mDa2Hint),
      metricHtml(t.mDb1, formatLength(r.db1, u.length), t.mDb1Hint),
      metricHtml(t.mDb2, formatLength(r.db2, u.length), t.mDb2Hint),
      metricHtml(t.mW1, formatRotation(r.n1, u.rotation), t.mW1Hint),
      metricHtml(t.mW2, formatRotation(r.n2, u.rotation), t.mW2Hint),
    ].join('');

    if (agma.hasLoad) {
      box.innerHTML += [
        metricHtml(t.mFt, `${agma.tangentialLoad_N.toFixed(2)} N`, t.mFtHint(agma.lewisY)),
        metricHtml(t.mSigF, `${agma.bendingStress_MPa.toFixed(2)} MPa`, t.mSigFHint),
        metricHtml(t.mSigH, `${agma.contactStress_MPa.toFixed(2)} MPa`, t.mSigHHint),
        metricHtml(t.mSF, agma.bendingSafety_SF.toFixed(2), t.mSFHint(agma.allowableBending_MPa)),
        metricHtml(t.mSH, agma.contactSafety_SH.toFixed(2), t.mSHHint(agma.allowableContact_MPa)),
      ].join('');
    }
  }

  const alerts = document.getElementById('gAlerts');
  if (alerts) {
    const parts = [];
    parts.push(
      executiveSummaryAlert({
        level: gearsHasCritical ? 'danger' : gearsHasWarn ? 'warn' : 'ok',
        titleEs: gearsHasCritical
          ? 'Resumen ejecutivo: revisar el diseño antes de liberar.'
          : gearsHasWarn
            ? 'Resumen ejecutivo: diseño usable con revisiones recomendadas.'
            : 'Resumen ejecutivo: diseño base consistente para iterar.',
        titleEn: gearsHasCritical
          ? 'Executive summary: review design before release.'
          : gearsHasWarn
            ? 'Executive summary: workable design with recommended checks.'
            : 'Executive summary: baseline design is consistent for iteration.',
        actionsEs: gearsHasCritical
          ? ['Corregir los campos en rojo.', 'Aumentar módulo o ancho de cara para subir márgenes AGMA.']
          : ['Confirmar lubricación y régimen real.', 'Validar con catálogo/fabricante antes de compra.'],
        actionsEn: gearsHasCritical
          ? ['Fix the fields marked in red.', 'Increase module or face width to raise AGMA margins.']
          : ['Confirm lubrication and real duty point.', 'Validate with supplier catalogue before purchase.'],
      }),
    );
    validationMsgs.forEach((msg) => parts.push(labAlert('danger', esc(msg))));
    agma.velocityAlerts.forEach((a) => {
      parts.push(labAlert(a.level === 'danger' ? 'danger' : 'warn', esc(a.text)));
    });
    if (agma.hasLoad) {
      if (agma.bendingSafety_SF < 1.05) {
        parts.push(labAlert('danger', t.alertSfLow));
      } else if (agma.bendingSafety_SF < 1.4) {
        parts.push(labAlert('warn', t.alertSfMod));
      }
      if (agma.contactSafety_SH < 1.05) {
        parts.push(labAlert('danger', t.alertShLow));
      } else if (agma.contactSafety_SH < 1.2) {
        parts.push(labAlert('warn', t.alertShMod));
      }
      if (agma.bendingSafety_SF >= 1.4 && agma.contactSafety_SH >= 1.2) {
        parts.push(labAlert('ok', t.alertOk));
      }
    } else {
      parts.push(labAlert('info', t.alertNeedLoad(esc(agma.disclaimer))));
      parts.push(
        labAlert(
          'info',
          uxCopy(
            'Para un veredicto completo, indique potencia o par de entrada.',
            'For a complete verdict, add input power or torque.',
          ),
        ),
      );
    }
    parts.push(
      labAlert(
        'info',
        uxCopy(
          'Hipótesis del modelo: engranajes cilíndricos rectos sin helicoidales, cónicos ni correcciones de perfil (x ≠ 0).',
          'Model assumptions: spur gears only; no helical or bevel gears, and no profile-shift corrections (x ≠ 0).',
        ),
      ),
    );
    alerts.innerHTML = parts.join('');
  }

  const sub = document.getElementById('gSubstitution');
  if (sub && r.n1 != null) {
    const n2 = (r.n1 * r.z1) / r.z2;
    const vps = formatLinearSpeed(r.v_pitch_m_s, u.linear);
    const d1s = formatLength(r.d1, u.length);
    sub.innerHTML = `
      <details class="calc-substitution">
        <summary class="calc-substitution__summary">
          <span class="calc-substitution__title">${esc(t.subTitle)}</span>
        </summary>
        <div class="calc-substitution__inner">
          <p class="calc-substitution__step">${t.sub1}</p>
          <p class="calc-substitution__step">${t.sub2(r.n1, r.z1, r.z2, n2)}</p>
          <p class="calc-substitution__step">${t.sub3(formatRotation(n2, u.rotation))}</p>
          <p class="calc-substitution__step">${t.sub4(vps, d1s)}</p>
        </div>
      </details>`;
  } else if (sub) {
    sub.innerHTML = '';
  }

  renderGearPairDiagram(document.getElementById('gDiagram'), {
    ...p,
    unitPrefs: u,
  });

  const shoppingLines = [
    {
      commerceId: 'gear-pair-quote',
      qty: 1,
      note:
        r.helixAngle_deg > 1e-6
          ? `m\u2099 = ${r.module_mm} mm · \u03b2 = ${r.helixAngle_deg.toFixed(1)}\u00b0 · z\u2081/z\u2082 = ${r.z1}/${r.z2}`
          : `m = ${r.module_mm} mm · z\u2081/z\u2082 = ${r.z1}/${r.z2}`,
    },
  ];
  emitEngineeringSnapshot({
    page: 'calc-gears',
    moduleLabel: t.moduleLabel,
    advisorContext: {
      safetyMargins: agma.hasLoad
        ? [
            { label: t.snapSf, value: agma.bendingSafety_SF },
            { label: t.snapSh, value: agma.contactSafety_SH },
          ]
        : [],
    },
    shoppingLines,
    metrics: metricsFromGears(agma),
  });
  setLabPurchaseFromShoppingLines(document.getElementById('labPurchaseSuggestions'), shoppingLines, [
    {
      label: t.shopLabel,
      searchQuery: t.shopQ(r.module_mm),
    },
  ]);

  updateLabShareVisibility('gShareLinkWrap', 'gResults');
  gearUrl.serializeToUrl();
}

/** Short query keys; `module` maps to #gM, `face` / `faceWidth` hydrate to #gFace. */
const GEAR_URL_PARAM_TO_ID = {
  calcMode: 'gCalcMode',
  z1: 'gZ1',
  z2: 'gZ2',
  module: 'gM',
  face: 'gFace',
  alpha: 'gAlpha',
  beta: 'gBeta',
  n1: 'gN1',
  lube: 'gLube',
  power: 'gPower',
  torque: 'gTorque',
};

const gearUrl = createLabUrlSync(GEAR_URL_PARAM_TO_ID, {
  hydrateOrder: ['calcMode', 'z1', 'z2', 'module', 'face', 'alpha', 'beta', 'n1', 'lube', 'power', 'torque'],
  hydrateKeyAliases: { face: ['faceWidth'] },
  afterHydrate: () => {
    syncGearCalcModeUi();
  },
});

const resultsWrap = document.getElementById('gResultsWrap');
const debounced = debounce(() => runCalcWithIndustrialFeedback(resultsWrap, refreshCore), 55);

const gearPresets = mountLabPresetsBar('gPresetsBar', GEAR_PRESETS, debounced);

function scheduleGearRecalc() {
  if (!gearPresets.applying && !gearUrl.hydrating) {
    gearPresets.clearActive();
  }
  debounced();
}

gearUrl.hydrateFromUrl();
syncGearCalcModeUi();

bindLabUnitSelectors(scheduleGearRecalc);

['gZ1', 'gZ2', 'gM', 'gFace', 'gAlpha', 'gBeta', 'gN1', 'gPower', 'gTorque', 'gLube'].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', scheduleGearRecalc);
  document.getElementById(id)?.addEventListener('change', scheduleGearRecalc);
});

document.getElementById('gCalcMode')?.addEventListener('change', () => {
  syncGearCalcModeUi();
  scheduleGearRecalc();
});
applyGearsHelpI18n();

watchLangAndApply(GEARS_PAGE_EN, {
  onEnApplied: () => {
    applyGearsHelpI18n();
    syncGearCalcModeUi();
    scheduleGearRecalc();
  },
});

wireLabCopyLink('gCopyLinkBtn', 'gCopyToast');
wireLabCopyResultsButton('gCopyResults', {
  moduleTitle: gearsRuntimeStrings(getLabLang()).moduleLabel,
});
window.addEventListener(LAB_LANG_EVENT, () => {
  bootSmartDashboardIfEnabled(gearsRuntimeStrings(getLabLang()).dashboardBoot);
  applyGearsHelpI18n();
  syncGearCalcModeUi();
  scheduleGearRecalc();
});
runCalcWithIndustrialFeedback(resultsWrap, refreshCore);
mountLabCloudSaveBar(gearsRuntimeStrings(getLabLang()).moduleLabel);
