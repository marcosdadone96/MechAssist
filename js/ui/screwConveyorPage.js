/**
 * Página transportador de tornillo helicoidal.
 */

import { isPremiumEffective } from '../services/accessTier.js';
import {
  cemaMaxRpmForDiameter_mm,
  computeScrewConveyor,
  diameterToMeters,
  pitchToMeters,
} from '../modules/screwConveyor.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import {
  renderBrandRecommendationCards,
  initMotorVerification,
  refreshMotorVerificationManual,
} from './driveSelection.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { renderScrewConveyorDiagram } from './diagramScrew.js';
import { mountPremiumPdfExportBar, buildScrewPdfPayload } from '../services/reportPdfExport.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import {
  injectMountingConfigSection,
  refreshMountingConfigSection,
  MOUNTING_INPUT_IDS,
} from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { getCurrentLang } from '../config/locales.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { bootMachineCalcView, wrapCalcRefresh } from './creditsPageBoot.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';
import { SCREW_CONVEYOR_EN } from '../lab/i18n/pages/screwConveyorEn.js';

const SC_PAGE_EN = { ...MACHINE_HUB_UX_EN, ...SCREW_CONVEYOR_EN };
const SC_DOC_TITLE_ES = 'Tornillo sin fin \u2014 TheMechAssist';
import { incrementCalcCounter } from '../services/calcCounter.js';
import { SCREW_PRESET_BY_ID } from '../modules/machineHubPresets.js';

function applyScrewDocumentChrome() {
  const en = getCurrentLang() === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? SC_PAGE_EN['scConv.docTitle'] : SC_DOC_TITLE_ES;
}

function onScrewLangChanged() {
  applyScrewDocumentChrome();
  refreshMountingConfigSection();
  syncLoadDutyUi();
  syncScrewInlineUnits();
  initInfoChipPopovers(document.body);
  refreshMotorVerificationManual(document.getElementById('screwVerifyPanel'), getDriveRequirements);
  document.getElementById('screwVerifyBrand')?.dispatchEvent(new Event('change'));
  refresh();
}

function syncScrewInlineUnits() {
  const capU = document.getElementById('screwCapUnit');
  const capSpan = document.getElementById('screwCapInlineUnit');
  if (capSpan && capU instanceof HTMLSelectElement) {
    capSpan.textContent = capU.value === 'th' ? 't/h' : 'm³/h';
  }
  const dU = document.getElementById('screwDiamUnit');
  const dSpan = document.getElementById('screwDiamInlineUnit');
  if (dSpan && dU instanceof HTMLSelectElement) {
    dSpan.textContent = dU.value === 'in' ? 'in' : 'mm';
  }
  const pU = document.getElementById('screwPitchUnit');
  const pSpan = document.getElementById('screwPitchInlineUnit');
  if (pSpan && pU instanceof HTMLSelectElement) {
    pSpan.textContent = pU.value === 'in' ? 'in' : 'mm';
  }
}

const inputIds = [
  'screwCap',
  'screwDiam',
  'screwPitch',
  'screwLength',
  'screwAngle',
  'screwRho',
  'screwMu',
  'screwBearingEta',
  'screwServiceFactor',
];

const selectIds = [
  'screwCapUnit',
  'screwDiamUnit',
  'screwPitchUnit',
  'screwTroughLoad',
  'screwAbrasive',
  'screwCorrosive',
  'screwLoadDuty',
];

function syncCapacityUnitUi() {
  const unitEl = document.getElementById('screwCapUnit');
  const rhoInput = document.getElementById('screwRho');
  if (!(unitEl instanceof HTMLSelectElement) || !(rhoInput instanceof HTMLInputElement)) return;
  const rhoField = rhoInput.closest('.field');
  const requiresRho = unitEl.value === 'th';
  if (rhoField) rhoField.hidden = !requiresRho;
  if (rhoField) rhoField.classList.toggle('field--required-highlight', requiresRho);
  rhoInput.required = requiresRho;
  rhoInput.classList.toggle('field-input--danger', requiresRho && !Number.isFinite(parseFloat(rhoInput.value)));
}

function readNum(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return fallback;
  const v = el.value;
  return v || fallback;
}

function readInputs() {
  const duty = /** @type {'uniform'|'moderate'|'heavy'|'custom'} */ (
    readSelect('screwLoadDuty', 'moderate')
  );
  return {
    lang: getCurrentLang(),
    capValue: readNum('screwCap', 45),
    capUnit: /** @type {'m3h'|'th'} */ (readSelect('screwCapUnit', 'm3h')),
    diamValue: readNum('screwDiam', 315),
    diamUnit: /** @type {'mm'|'in'} */ (readSelect('screwDiamUnit', 'mm')),
    pitchValue: readNum('screwPitch', 280),
    pitchUnit: /** @type {'mm'|'in'} */ (readSelect('screwPitchUnit', 'mm')),
    length_m: readNum('screwLength', 12),
    angle_deg: readNum('screwAngle', 0),
    rho_kg_m3: readNum('screwRho', 750),
    troughLoadPct: /** @type {'15'|'30'|'45'} */ (readSelect('screwTroughLoad', '30')),
    abrasive: /** @type {'low'|'medium'|'high'} */ (readSelect('screwAbrasive', 'low')),
    corrosive: /** @type {'low'|'medium'|'high'} */ (readSelect('screwCorrosive', 'low')),
    frictionCoeff: readNum('screwMu', 0.38),
    bearingMechanicalEff_pct: readNum('screwBearingEta', 92),
    loadDuty: duty,
    serviceFactor: readNum('screwServiceFactor', 1.35),
  };
}

/** Load-duty option labels (SF shorthand); duty hints come from LOAD_DUTY_OPTIONS*. */
const SCREW_LOAD_DUTY_OPTION_COPY = Object.freeze({
  uniform: { es: 'Carga uniforme \u2014 SF \u2248 1,15', en: 'Uniform load \u2014 SF \u2248 1.15' },
  moderate: { es: 'Choque moderado \u2014 SF \u2248 1,35', en: 'Moderate shock \u2014 SF \u2248 1.35' },
  heavy: { es: 'Choque pesado \u2014 SF \u2248 1,75', en: 'Heavy shock \u2014 SF \u2248 1.75' },
  custom: { es: 'Personalizado', en: 'Custom' },
});

function syncLoadDutyUi() {
  const dutyEl = document.getElementById('screwLoadDuty');
  const sfIn = document.getElementById('screwServiceFactor');
  const hint = document.getElementById('screwLoadDutyHint');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;
  const lang = getCurrentLang();
  const en = lang === 'en';
  const t = en ? 'en' : 'es';
  LOAD_DUTY_OPTIONS.forEach((optRow) => {
    const opt = dutyEl.querySelector(`option[value="${optRow.id}"]`);
    const copy = SCREW_LOAD_DUTY_OPTION_COPY[optRow.id];
    if (opt) opt.textContent = copy ? copy[t] : en ? LOAD_DUTY_OPTIONS_EN[optRow.id].label : optRow.label;
  });
  const duty = dutyEl.value;
  const row = LOAD_DUTY_OPTIONS.find((o) => o.id === duty);
  if (hint && row) hint.textContent = en ? LOAD_DUTY_OPTIONS_EN[row.id].hint : row.hint;
  if (duty === 'custom') {
    sfIn.readOnly = false;
    sfIn.classList.remove('input-synced');
  } else {
    sfIn.readOnly = true;
    sfIn.classList.add('input-synced');
    if (row && row.sf != null) sfIn.value = String(row.sf);
  }
}

function clampNum(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function writeFormValue(id, val) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.value = val === '' || val == null ? '' : String(val);
}

function syncScrewRangeSlidersFromNumberInputs() {
  const pairs = [
    ['screwCapR', 'screwCap', 5, 250, 0.5],
    ['screwDiamR', 'screwDiam', 80, 900, 1],
    ['screwPitchR', 'screwPitch', 50, 800, 1],
    ['screwLengthR', 'screwLength', 0.5, 50, 0.1],
    ['screwAngleR', 'screwAngle', 0, 45, 0.5],
    ['screwRhoR', 'screwRho', 200, 2200, 10],
    ['screwMuR', 'screwMu', 0.1, 0.75, 0.01],
  ];
  for (const [rangeId, numId, lo, hi, step] of pairs) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    if (!(range instanceof HTMLInputElement) || !(num instanceof HTMLInputElement)) continue;
    let v = parseFloat(String(num.value).replace(',', '.'));
    if (!Number.isFinite(v)) v = lo;
    v = clampNum(v, lo, hi);
    if (step != null && step > 0) v = Math.round(v / step) * step;
    num.value = String(v);
    range.value = String(v);
  }
}

function applyScrewPresetFromId(presetId) {
  const def = SCREW_PRESET_BY_ID[presetId];
  if (!def) return;
  for (const [k, v] of Object.entries(def.values)) {
    writeFormValue(k, v);
  }
  syncCapacityUnitUi();
  syncLoadDutyUi();
  syncScrewRangeSlidersFromNumberInputs();
  refresh();
}

function bindScrewRangeSlider(rangeId, numId, lo, hi, step = null) {
  const range = document.getElementById(rangeId);
  const num = document.getElementById(numId);
  if (!(range instanceof HTMLInputElement) || !(num instanceof HTMLInputElement)) return;

  const snap = (v) => {
    let x = clampNum(v, lo, hi);
    if (step != null && step > 0) x = Math.round(x / step) * step;
    return x;
  };

  const syncRangeFromNum = () => {
    const v = snap(parseFloat(String(num.value).replace(',', '.')) || lo);
    num.value = String(v);
    range.value = String(v);
  };

  const pushFromRange = () => {
    num.value = range.value;
    refresh();
  };

  range.addEventListener('input', pushFromRange);
  num.addEventListener('input', () => {
    syncRangeFromNum();
  });
  num.addEventListener('change', () => {
    syncRangeFromNum();
    refresh();
  });
  syncRangeFromNum();
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEls() {
  return {
    diagram: /** @type {SVGSVGElement | null} */ (document.getElementById('diagramScrew')),
    results: document.getElementById('screwResultsGrid'),
    rpmIndicator: document.getElementById('screwRpmIndicator'),
    engineeringReport: document.getElementById('screwEngineeringReport'),
    motorBlock: document.getElementById('screwMotorBlock'),
    premiumPdfMount: document.getElementById('premiumPdfExportMount'),
    assumptions: document.getElementById('screwAssumptionsList'),
    runtimeError: document.getElementById('runtimeError'),
    designAlerts: document.getElementById('screwDesignAlerts'),
  };
}

function getDriveRequirements() {
  const r = computeScrewConveyor(readInputs());
  return {
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
    ...readMountingPreferences(),
  };
}

function formatNum(x, d = 2) {
  if (!Number.isFinite(x)) return '—';
  return x.toFixed(d);
}

function formatMounting(pref, lang = getCurrentLang()) {
  const en = lang === 'en';
  const typeMap = en
    ? { B3: 'B3 foot mount', B5: 'B5 flange', B14: 'B14 flange', hollowShaft: 'Hollow shaft' }
    : { B3: 'B3 patas', B5: 'B5 brida', B14: 'B14 brida', hollowShaft: 'Eje hueco' };
  const ori = pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal';
  return `${typeMap[pref.mountingType] || pref.mountingType} \u00b7 ${ori}`;
}

/**
 * @param {ReturnType<typeof readInputs>} raw
 * @param {ReturnType<typeof computeScrewConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 * @param {'es'|'en'} lang
 */
function buildScrewRfqPlainText(raw, r, mount, lang) {
  const en = lang === 'en';
  const d = r.detail || {};
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist — Screw conveyor (indicative duty)'
    : 'TheMechAssist — Transportador de tornillo (punto orientativo)';
  const hIn = en ? '== Inputs ==' : '== Entradas ==';
  const hOut = en ? '== Results (indicative) ==' : '== Resultados (orientativos) ==';
  const hMount = en ? '== Mounting preference (for RFQ) ==' : '== Preferencia de montaje (RFQ) ==';
  const disc = en
    ? 'Disclaimer: semi-empirical screw model; does not replace CEMA 350 or OEM sizing.'
    : 'Aviso: modelo semiempírico de tornillo; no sustituye CEMA 350 ni el dimensionamiento del fabricante.';

  const parts = [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
  ];
  if (url) parts.push(`${en ? 'Source' : 'Origen'}: ${url}`);
  parts.push(
    '',
    hIn,
    `${en ? 'Capacity value' : 'Capacidad'}: ${formatNum(raw.capValue, 3)} (${raw.capUnit})`,
    `${en ? 'Screw diameter' : 'Diámetro tornillo'}: ${formatNum(raw.diamValue, 2)} (${raw.diamUnit})`,
    `${en ? 'Pitch' : 'Paso'}: ${formatNum(raw.pitchValue, 2)} (${raw.pitchUnit})`,
    `${en ? 'Conveyor length L' : 'Longitud L'} (m): ${formatNum(raw.length_m, 3)}`,
    `${en ? 'Incline angle' : 'Ángulo θ'} (deg): ${formatNum(raw.angle_deg, 2)}`,
    `${en ? 'Bulk density rho' : 'Densidad ρ'} (kg/m³): ${formatNum(raw.rho_kg_m3, 1)}`,
    `${en ? 'Trough load %' : 'Llenado canal'}: ${raw.troughLoadPct}`,
    `${en ? 'Abrasive / corrosive' : 'Abrasivo / corrosivo'}: ${raw.abrasive} / ${raw.corrosive}`,
    `${en ? 'Friction mu' : 'Coeficiente μ'}: ${formatNum(raw.frictionCoeff, 3)}`,
    `${en ? 'Bearing mech. eff.' : 'Rend. rodamientos'} (%): ${formatNum(raw.bearingMechanicalEff_pct, 1)}`,
    `${en ? 'Load duty' : 'Tipo de carga'}: ${raw.loadDuty}`,
    `${en ? 'Service factor' : 'Factor de servicio'}: ${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 3)}`,
    '',
    hOut,
    `${en ? 'Screw rpm' : 'RPM tornillo'}: ${formatNum(r.screwRpm, 2)}`,
    `${en ? 'Design torque (shaft, incl. SF)' : 'Par diseño eje (incl. SF)'} (N·m): ${formatNum(r.torqueWithService_Nm, 2)}`,
    `${en ? 'Motor power (sizing)' : 'Potencia motor (dim.)'} (kW): ${formatNum(r.requiredMotorPower_kW, 3)}`,
    `${en ? 'Gear output rpm (model)' : 'rpm salida (modelo)'}: ${formatNum(r.drumRpm, 2)}`,
    `${en ? 'Mass flow' : 'Caudal másico'} (kg/s): ${formatNum(r.massFlow_kg_s, 3)}`,
    `${en ? 'Capacity' : 'Capacidad'} (m³/h): ${formatNum(r.cap_m3h, 3)}`,
    `${en ? 'Helix D / pitch / L (model)' : 'D / paso / L (modelo)'} (m): ${formatNum(d.D_m, 4)} / ${formatNum(d.pitch_m, 4)} / ${formatNum(d.L_m, 3)}`,
    '',
    hMount,
    formatMounting(mount, lang) +
      (mount.machineShaftDiameter_mm != null
        ? ` · ${en ? 'Machine shaft Ø' : 'Ø eje máquina'} ${formatNum(mount.machineShaftDiameter_mm, 1)} mm`
        : ''),
    '',
    disc,
  );
  return parts.join('\n');
}

/**
 * @param {ReturnType<typeof readInputs>} raw
 * @param {ReturnType<typeof computeScrewConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 */
function buildScrewRfqCsv(raw, r, mount) {
  const d = r.detail || {};
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'cap_value',
    'cap_unit',
    'diam_value',
    'diam_unit',
    'pitch_value',
    'pitch_unit',
    'L_m',
    'angle_deg',
    'rho_kg_m3',
    'trough_load_pct',
    'abrasive',
    'corrosive',
    'friction_mu',
    'bearing_eff_pct',
    'load_duty',
    'service_factor',
    'mounting',
    'orientation',
    'machine_shaft_d_mm',
    'screw_rpm',
    'T_design_Nm',
    'P_motor_kW',
    'n_out_rpm',
    'mass_flow_kg_s',
    'cap_m3h',
    'D_m',
    'pitch_m',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const when = new Date().toISOString();
  const values = [
    'TheMechAssist_screw_conveyor',
    when,
    url,
    raw.capValue,
    raw.capUnit,
    raw.diamValue,
    raw.diamUnit,
    raw.pitchValue,
    raw.pitchUnit,
    raw.length_m,
    raw.angle_deg,
    raw.rho_kg_m3,
    raw.troughLoadPct,
    raw.abrasive,
    raw.corrosive,
    raw.frictionCoeff,
    raw.bearingMechanicalEff_pct,
    raw.loadDuty,
    r.serviceFactorUsed ?? raw.serviceFactor,
    mount.mountingType,
    mount.orientation,
    mount.machineShaftDiameter_mm ?? '',
    r.screwRpm,
    r.torqueWithService_Nm,
    r.requiredMotorPower_kW,
    r.drumRpm,
    r.massFlow_kg_s,
    r.cap_m3h,
    d.D_m,
    d.pitch_m,
  ];
  return `${headers.map(escapeCsvCell).join(',')}\n${values.map(escapeCsvCell).join(',')}`;
}

function showRuntimeError(msg) {
  const box = document.getElementById('runtimeError');
  if (!box) return;
  box.hidden = false;
  box.textContent = msg;
}

function clearRuntimeError() {
  const box = document.getElementById('runtimeError');
  if (!box) return;
  box.hidden = true;
  box.textContent = '';
}

function recoCopyForLang(en) {
  return en
    ? {
        torqueLabel: 'screw shaft torque',
        rpmLabel: 'screw rpm',
        rpmShortLabel: 'screw n',
        contextHtml: `Indicative selection from <strong>shaft power</strong>, <strong>design torque</strong> and <strong>screw speed</strong>.
        Confirm with the conveyor OEM (pitch, liner, max RPM).`,
      }
    : {
        torqueLabel: 'par en eje tornillo',
        rpmLabel: 'rpm del tornillo',
        rpmShortLabel: 'n tornillo',
        contextHtml: `Selección orientativa según <strong>potencia de eje</strong>, <strong>par de diseño</strong> y <strong>velocidad del tornillo</strong>.
        Confirme con el fabricante del transportador (pasos, revestimiento, RPM máx.).`,
      };
}

function renderRpmIndicator(el, r, lang) {
  if (!el) return;
  const risk = r.rpmRisk;
  const en = (lang ?? getCurrentLang()) === 'en';
  if (!risk) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  const mod = risk.level === 'high' ? 'high' : risk.level === 'caution' ? 'caution' : 'ok';
  const title =
    risk.level === 'high'
      ? en
        ? 'High RPM for this material'
        : 'RPM elevadas para el material'
      : risk.level === 'caution'
        ? en
          ? 'RPM in the high band'
          : 'RPM en zona alta'
        : en
          ? 'RPM regime — OK (indicative)'
          : 'Régimen RPM — OK (orientativo)';
  el.innerHTML = `
    <div class="screw-rpm-indicator__card screw-rpm-indicator__card--${mod}" role="status">
      <div class="screw-rpm-indicator__icon" aria-hidden="true">${risk.level === 'high' ? '⚠' : risk.level === 'caution' ? '◆' : '✓'}</div>
      <div>
        <strong class="screw-rpm-indicator__title">${escHtml(title)}</strong>
        <p class="screw-rpm-indicator__text">${escHtml(risk.label)}</p>
        <p class="screw-rpm-indicator__nums">n ≈ <strong>${formatNum(r.screwRpm, 2)}</strong> rpm · ${
          en ? 'indicative limit' : 'tope orientativo'
        } ≈ <strong>${formatNum(r.screwRpmMaxSuggested, 2)}</strong> rpm (ratio ≈ ${formatNum(
          risk.ratio,
          2,
        )})</p>
      </div>
    </div>`;
}

function refreshCore() {
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const en = lang === 'en';
  const TX = en
    ? {
        torqueEyebrowSuffix: 'screw shaft',
        torqueHint: 'With service factor and material margins',
        motorPower: 'Motor power',
        motorPowerHint: 'Sized at the motor shaft',
        screwRegime: 'Helix speed n',
        screwRegimeHint: '(min\u207b\u00b9) · validate with OEM',
        screwRpmUnit: 'min\u207b\u00b9',
        serviceFactor: 'Service factor',
        mountingType: 'Mounting type',
        speed: 'Speed',
        mechanicalDetails: 'Mechanical details',
        pitchWord: 'pitch',
        shaftWord: 'shaft',
        screwRpmLine: 'min\u207b\u00b9 · screw',
        fullResult: 'Full result',
        fullResultHint: 'Forces, partial powers and extended metrics',
        hpDesign: 'Power (HP, design)',
        shaftPowerNoSf: `${LBL.shaftPower} (no SF margin)`,
        torqueSteady: 'Screw shaft torque (steady)',
        axialBulk: 'Bulk axial speed',
        capM3h: 'Capacity (m³/h)',
        reportError: 'Report error:',
        gearmotors: 'Gearmotors:',
        calcError: 'Calculation error:',
        machineDiagram: 'Machine diagram',
        steepAngle:
          'Steep inclinations: the simplified model may under- or over-predict; consult the screw OEM.',
        cemaRpmWarn: (rpm, maxRpm, dMm) =>
          `⚠ Calculated speed (${formatNum(rpm, 1)} rpm) exceeds indicative CEMA maximum for Ø ${formatNum(dMm, 0)} mm (≈ ${formatNum(maxRpm, 0)} rpm). Reduce capacity or increase diameter.`,
        coldStartNote:
          'Note: cold-start power with a full screw may be 2–3× steady-state power for cohesive or wet materials. Check available breakaway torque with the gearmotor supplier.',
      }
    : {
        torqueEyebrowSuffix: 'eje tornillo',
        torqueHint: 'Con factor de servicio y márgenes material',
        motorPower: 'Potencia motor',
        motorPowerHint: 'Dimensionamiento al eje del motor',
        screwRegime: 'RPM del helicoide n',
        screwRegimeHint: '(min\u207b\u00b9) · valide con fabricante',
        screwRpmUnit: 'min\u207b\u00b9',
        serviceFactor: 'Factor de servicio',
        mountingType: 'Tipo de montaje',
        speed: 'Velocidad',
        mechanicalDetails: 'Detalles mecánicos',
        pitchWord: 'paso',
        shaftWord: 'eje',
        screwRpmLine: 'min\u207b\u00b9 · tornillo',
        fullResult: 'Resultado completo',
        fullResultHint: 'Fuerzas, potencias parciales y métricas extendidas',
        hpDesign: 'Potencia (HP, diseño)',
        shaftPowerNoSf: `${LBL.shaftPower} (sin margen SF)`,
        torqueSteady: 'Par en eje tornillo (régimen)',
        axialBulk: 'Velocidad axial bulk',
        capM3h: 'Capacidad (m³/h)',
        reportError: 'Error informe:',
        gearmotors: 'Motorreductores:',
        calcError: 'Error al calcular:',
        machineDiagram: 'Diagrama de la máquina',
        steepAngle:
          'Inclinaciones altas: el modelo simplificado puede subestimar o sobreestimar; consulte al fabricante del tornillo.',
        cemaRpmWarn: (rpm, maxRpm, dMm) =>
          `⚠ Velocidad calculada (${formatNum(rpm, 1)} rpm) supera el máximo orientativo CEMA para Ø ${formatNum(dMm, 0)} mm (≈ ${formatNum(maxRpm, 0)} rpm). Reduzca la capacidad o aumente el diámetro.`,
        coldStartNote:
          'Nota: la potencia de arranque con tornillo lleno puede ser 2–3× la potencia de régimen en materiales cohesivos o húmedos. Consulte con el fabricante del motorreductor el par de arranque disponible.',
      };
  const els = getEls();
  try {
    clearRuntimeError();
    const raw = readInputs();
    const r = computeScrewConveyor(raw);
    if (Number.isFinite(r.requiredMotorPower_kW)) incrementCalcCounter();
    syncCapacityUnitUi();
    const d = r.detail || {};
    const Dmm = (d.D_m ?? diameterToMeters(raw.diamValue, raw.diamUnit)) * 1000;
    const pitchMm = (d.pitch_m ?? pitchToMeters(raw.pitchValue, raw.pitchUnit)) * 1000;

    if (els.diagram) {
      const capU = raw.capUnit === 'th' ? 't/h' : 'm³/h';
      renderScrewConveyorDiagram(els.diagram, {
        lang,
        length_m: raw.length_m,
        diameter_mm: Dmm,
        pitch_mm: pitchMm,
        angle_deg: raw.angle_deg,
        screwRpm: r.screwRpm,
        capLabel: `${raw.capValue} ${capU}`,
        troughLabel: `${raw.troughLoadPct} %`,
      });
    }

    renderRpmIndicator(els.rpmIndicator, r, lang);

    if (els.designAlerts) {
      const alerts = [];
      if (raw.angle_deg > 45) {
        alerts.push({
          level: /** @type {const} */ ('warn'),
          text: TX.steepAngle,
        });
      }
      if (r.rpmRisk?.level === 'high') {
        alerts.push({ level: /** @type {const} */ ('error'), text: r.rpmRisk.label });
      } else if (r.rpmRisk?.level === 'caution') {
        alerts.push({ level: /** @type {const} */ ('warn'), text: r.rpmRisk.label });
      }
      const Dmm = (r.detail?.D_m ?? diameterToMeters(raw.diamValue, raw.diamUnit)) * 1000;
      const cemaMaxRpm = cemaMaxRpmForDiameter_mm(Dmm);
      if (r.screwRpm > cemaMaxRpm) {
        alerts.push({
          level: /** @type {const} */ ('warn'),
          text: TX.cemaRpmWarn(r.screwRpm, cemaMaxRpm, Dmm),
        });
      }
      els.designAlerts.innerHTML = alerts
        .map((a) => `<p class="design-alert design-alert--${a.level}">${escHtml(a.text)}</p>`)
        .join('');
    }

    const hp = r.requiredMotorPower_kW * 1.34102;
    if (els.results) {
      const mount = readMountingPreferences();
      const mechanicalSummary = [
        `Ø ${formatNum(Dmm, 2)} mm`,
        `${TX.pitchWord} ${formatNum(pitchMm, 2)} mm`,
        mount.machineShaftDiameter_mm != null
          ? `${TX.shaftWord} ${formatNum(mount.machineShaftDiameter_mm, 2)} mm`
          : null,
      ]
        .filter(Boolean)
        .join(' · ');
      const vLine = `${formatNum(r.screwRpm, 2)} ${TX.screwRpmLine}`;
      els.results.innerHTML = `
    <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
      <article class="flat-kpi flat-kpi--torque">
        <span class="flat-kpi__eyebrow">${LBL.designTorque} · ${TX.torqueEyebrowSuffix}</span>
        <p class="flat-kpi__value">${formatNum(r.torqueWithService_Nm, 2)}<span class="flat-kpi__unit">N·m</span></p>
        <p class="flat-kpi__hint">${TX.torqueHint}</p>
      </article>
      <article class="flat-kpi flat-kpi--power">
        <span class="flat-kpi__eyebrow">${TX.motorPower}</span>
        <p class="flat-kpi__value">${formatNum(r.requiredMotorPower_kW, 2)}<span class="flat-kpi__unit">kW</span></p>
        <p class="flat-kpi__hint">${TX.motorPowerHint}</p>
      </article>
      <article class="flat-kpi flat-kpi--speed">
        <span class="flat-kpi__eyebrow">${TX.screwRegime}</span>
        <p class="flat-kpi__value">${formatNum(r.screwRpm, 2)}<span class="flat-kpi__unit">${TX.screwRpmUnit}</span></p>
        <p class="flat-kpi__hint">${TX.screwRegimeHint}</p>
      </article>
    </div>
    <div class="result-focus-grid flat-kpi-secondary">
      <div class="metric"><div class="label">${TX.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed ?? 1, 2)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mountingType}</div><div class="value">${formatMounting(mount, lang)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.speed}</div><div class="value">${vLine}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mechanicalDetails}</div><div class="value">${mechanicalSummary}</div></div>
    </div>
    <details class="motors-details result-focus-extra">
      <summary class="motors-details__summary">
        <span class="motors-details__summary-main">
          <span class="panel-icon">≡</span>
          <span class="motors-details__text">
            <span class="motors-details__title">${TX.fullResult}</span>
            <span class="motors-details__hint">${TX.fullResultHint}</span>
          </span>
        </span>
      </summary>
      <div class="motors-details__body">
        <div class="results-grid">
          <div class="metric"><div class="label">${TX.hpDesign}</div><div class="value">${formatNum(hp, 2)} HP</div></div>
          <div class="metric"><div class="label">${TX.shaftPowerNoSf}</div><div class="value">${formatNum(r.shaftPower_kW, 2)} kW</div></div>
          <div class="metric"><div class="label">${TX.torqueSteady}</div><div class="value">${formatNum(r.torqueAtDrum_Nm, 2)} N·m</div></div>
          <div class="metric"><div class="label">${TX.axialBulk}</div><div class="value">${formatNum((r.axialSpeed_m_s ?? 0) * 1000, 2)} mm/s</div></div>
          <div class="metric"><div class="label">${LBL.massFlow}</div><div class="value">${formatNum(r.massFlow_kg_s, 2)} kg/s</div></div>
          <div class="metric"><div class="label">${TX.capM3h}</div><div class="value">${formatNum(r.cap_m3h, 2)} m³/h</div></div>
        </div>
      </div>
    </details>
  `;
    }

    if (els.engineeringReport) {
      try {
        els.engineeringReport.innerHTML = renderFullEngineeringAside(r, {
          lang,
          shaftLabel: en ? 'screw shaft' : 'eje tornillo',
          shaftOutLabel: en ? 'Gearbox output / screw shaft' : 'Salida reductor / eje tornillo',
          motorSubtitle: en
            ? '~4-pole 50 Hz reference for gearbox ratio; screw speed comes from capacity and geometry.'
            : 'Referencia ~4 polos 50 Hz para relación de reductor; el régimen del tornillo es el calculado por capacidad y geometría.',
        });
      } catch (err) {
        console.error(err);
        els.engineeringReport.innerHTML = `<div class="motor-error">${TX.reportError} ${String(err.message || err)}</div>`;
      }
    }

    if (els.motorBlock) {
      try {
        els.motorBlock.innerHTML = renderBrandRecommendationCards(
          getDriveRequirements(),
          recoCopyForLang(en),
        );
      } catch (err) {
        console.error(err);
        els.motorBlock.innerHTML = `<div class="motor-error"><strong>${TX.gearmotors}</strong> ${String(err.message || err)}</div>`;
      }
    }

    if (els.premiumPdfMount) {
      mountPremiumPdfExportBar(els.premiumPdfMount, {
        getPayload: () => buildScrewPdfPayload(raw, r),
        getDiagramElement: () => els.diagram,
        diagramTitle: TX.machineDiagram,
      });
    }

    if (els.assumptions) {
      const extra = en
        ? ['Indicative model: it does not replace CEMA 350 or full OEM screw sizing.']
        : ['Modelo orientativo: no sustituye la norma CEMA 350 ni el dimensionamiento completo del fabricante del tornillo.'];
      els.assumptions.innerHTML = [...(r.assumptions || []), ...extra].map((a) => `<li>${escHtml(a)}</li>`).join('');
    }
    applyMachinePremiumGates();
    foldAllMachineDetailsOncePerPageLoad();
  } catch (err) {
    console.error(err);
    showRuntimeError(`${TX.calcError} ${String(err.message || err)}`);
  }
}

const refresh = wrapCalcRefresh(refreshCore);

inputIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement) {
    el.addEventListener('input', refresh);
    el.addEventListener('change', refresh);
  }
});

selectIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el instanceof HTMLSelectElement) {
    el.addEventListener('change', () => {
      if (id === 'screwLoadDuty') syncLoadDutyUi();
      if (id === 'screwCapUnit' || id === 'screwDiamUnit' || id === 'screwPitchUnit') syncScrewInlineUnits();
      refresh();
    });
  }
});

try {
  initMotorVerification(document.getElementById('screwVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

document.getElementById('btnScrewCalc')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-screw-motores');
});

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

initInfoChipPopovers(document.body);

bindScrewRangeSlider('screwCapR', 'screwCap', 5, 250, 0.5);
bindScrewRangeSlider('screwDiamR', 'screwDiam', 80, 900, 1);
bindScrewRangeSlider('screwPitchR', 'screwPitch', 50, 800, 1);
bindScrewRangeSlider('screwLengthR', 'screwLength', 0.5, 50, 0.1);
bindScrewRangeSlider('screwAngleR', 'screwAngle', 0, 45, 0.5);
bindScrewRangeSlider('screwRhoR', 'screwRho', 200, 2200, 10);
bindScrewRangeSlider('screwMuR', 'screwMu', 0.1, 0.75, 0.01);

syncScrewInlineUnits();

wireMachineRfqExport({
  getPayload: () => {
    const raw = readInputs();
    return { raw, result: computeScrewConveyor(raw), mount: readMountingPreferences() };
  },
  buildPlainText: buildScrewRfqPlainText,
  buildCsv: buildScrewRfqCsv,
  toastCopiedEn: MACHINE_HUB_UX_EN['machineHub.toastRfqCopied'],
  toastErrEn: MACHINE_HUB_UX_EN['machineHub.toastRfqErr'],
});

applyScrewDocumentChrome();
watchLangAndApply(SC_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: onScrewLangChanged,
  onEsRestored: onScrewLangChanged,
});

document.querySelector('.flat-sidebar')?.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target.closest('[data-screw-preset]') : null;
  if (!(t instanceof HTMLButtonElement)) return;
  const id = t.getAttribute('data-screw-preset');
  if (id) applyScrewPresetFromId(id);
});

syncLoadDutyUi();
bootMachineCalcView(refresh);

