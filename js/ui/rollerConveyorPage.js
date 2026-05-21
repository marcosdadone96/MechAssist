/**
 * Pagina transportador de rodillos.
 */

import { FEATURES } from '../config/features.js';
import { isFreeMachineFullAccess } from '../config/freemium.js';
import { isPremiumEffective, isPdfReportUiUnlocked } from '../services/accessTier.js';
import { computeRollerConveyor } from '../modules/rollerConveyor.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { renderRollerConveyorDiagram } from './diagramRoller.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { mountPremiumPdfExportBar, buildRollerPdfPayload } from '../services/reportPdfExport.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import { injectMountingConfigSection, MOUNTING_INPUT_IDS } from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { mountMachineConfigBar } from './machineConfigMount.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { getCurrentLang } from '../config/locales.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { bootMachineCalcView, wrapCalcRefresh } from './creditsPageBoot.js';
import { bindInputValidation, syncInputValidationResultsGate } from './labCalcUx.js';
import { ROLLER_CONVEYOR_VALIDATION } from './machineCalcInputValidation.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { incrementCalcCounter } from '../services/calcCounter.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';
import { ROLLER_CONVEYOR_EN } from '../lab/i18n/pages/rollerConveyorEn.js';
import { ROLLER_PRESET_BY_ID } from '../modules/machineHubPresets.js';

const ROLLER_PAGE_EN = { ...MACHINE_HUB_UX_EN, ...ROLLER_CONVEYOR_EN };
const ROLLER_DOC_TITLE_ES = 'Transportador de rodillos \u2014 TheMechAssist';

function applyRollerDocumentChrome() {
  const en = getCurrentLang() === 'en';
  document.documentElement.lang = en ? 'en' : 'es';
  document.title = en ? ROLLER_PAGE_EN['rollerConv.docTitle'] : ROLLER_DOC_TITLE_ES;
}

const inputIds = [
  'length',
  'loadMass',
  'speed',
  'rollerD',
  'rollerPitch',
  'palletCustomL',
  'palletCustomW',
  'uniformRollersOverride',
  'rollingResistance',
  'efficiency',
  'additionalResistance',
  'accelTime',
  'inertiaFactor',
  'serviceFactor',
];
const selectIds = ['designStandard', 'loadDuty', 'loadSupportMode', 'palletPreset', 'palletOrientation'];

function readNum(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLInputElement)) return fallback;
  const n = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function readSelect(id, fallback) {
  const el = document.getElementById(id);
  if (!el || !(el instanceof HTMLSelectElement)) return fallback;
  return el.value || fallback;
}

function readInputs() {
  const duty = /** @type {'uniform'|'moderate'|'heavy'|'custom'} */ (readSelect('loadDuty', 'moderate'));
  const uniformOv = document.getElementById('uniformRollersOverride');
  const uniformRollersOverride =
    uniformOv instanceof HTMLInputElement ? uniformOv.value.trim() : '';
  return {
    lang: getCurrentLang(),
    designStandard: readSelect('designStandard', 'ISO5048'),
    loadDuty: duty,
    length_m: readNum('length', 5),
    loadMass_kg: readNum('loadMass', 350),
    speed_m_s: readNum('speed', 0.35),
    rollerDiameter_mm: readNum('rollerD', 89),
    rollerPitch_mm: readNum('rollerPitch', 125),
    loadSupportMode: readSelect('loadSupportMode', 'uniform'),
    palletPreset: readSelect('palletPreset', 'eur1'),
    palletOrientation: readSelect('palletOrientation', 'long_along_transport'),
    palletCustomL_mm: readNum('palletCustomL', 1200),
    palletCustomW_mm: readNum('palletCustomW', 800),
    uniformRollersOverride,
    rollingResistanceCoeff: readNum('rollingResistance', 0.03),
    efficiency_pct: readNum('efficiency', 90),
    additionalResistance_N: readNum('additionalResistance', 0),
    accelTime_s: readNum('accelTime', 2.5),
    inertiaStartingFactor: readNum('inertiaFactor', 1.1),
    serviceFactor: readNum('serviceFactor', 1.25),
  };
}

function formatNum(v, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : '—';
}

function formatMounting(pref) {
  const en = getCurrentLang() === 'en';
  const typeMap = en
    ? { B3: 'B3 foot', B5: 'B5 flange', B14: 'B14 flange', hollowShaft: 'Hollow shaft' }
    : { B3: 'B3 patas', B5: 'B5 brida', B14: 'B14 brida', hollowShaft: 'Eje hueco' };
  return `${typeMap[pref.mountingType] || pref.mountingType} · ${pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}`;
}

/**
 * @param {ReturnType<typeof readInputs>} raw
 * @param {ReturnType<typeof computeRollerConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 * @param {'es'|'en'} lang
 */
function buildRollerRfqPlainText(raw, r, mount, lang) {
  const en = lang === 'en';
  const d = r.detail || {};
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist — Motorized roller conveyor (indicative duty point)'
    : 'TheMechAssist — Transportador de rodillos motorizado (punto orientativo)';
  const hIn = en ? '== Inputs ==' : '== Entradas ==';
  const hOut = en ? '== Results (indicative) ==' : '== Resultados (orientativos) ==';
  const hMount = en ? '== Mounting preference (for RFQ) ==' : '== Preferencia de montaje (RFQ) ==';
  const disc = en
    ? 'Disclaimer: horizontal rolling-resistance model; does not replace OEM roller data or safety validation.'
    : 'Aviso: modelo horizontal con rodadura equivalente; no sustituye datos OEM de rodillos ni validación de seguridad.';

  const parts = [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
  ];
  if (url) parts.push(`${en ? 'Source' : 'Origen'}: ${url}`);
  parts.push(
    '',
    hIn,
    `${en ? 'Useful length L' : 'Longitud útil L'} (m): ${formatNum(raw.length_m, 3)}`,
    `${en ? 'Total load mass m' : 'Masa total m'} (kg): ${formatNum(raw.loadMass_kg, 1)}`,
    `${en ? 'Line speed v' : 'Velocidad v'} (m/s): ${formatNum(raw.speed_m_s, 3)}`,
    `${en ? 'Drive roller D' : 'Rodillo motriz D'} (mm): ${formatNum(raw.rollerDiameter_mm, 1)}`,
    `${en ? 'Roller pitch' : 'Paso rodillos'} (mm): ${formatNum(raw.rollerPitch_mm, 0)}`,
    `${en ? 'Load support mode' : 'Modo apoyo carga'}: ${raw.loadSupportMode}`,
    `${en ? 'Pallet preset' : 'Paleta'}: ${raw.palletPreset}`,
    `${en ? 'Pallet orientation' : 'Orientación paleta'}: ${raw.palletOrientation}`,
    `${en ? 'Uniform rollers override' : 'Rodillos bajo carga (manual)'}: ${raw.uniformRollersOverride || '—'}`,
    `${en ? 'Rolling resistance Crr' : 'Rodadura Crr'}: ${formatNum(raw.rollingResistanceCoeff, 4)}`,
    `${en ? 'Efficiency motor to shaft eta' : 'Rendimiento η motor–eje'} (%): ${formatNum(raw.efficiency_pct, 1)}`,
    `${en ? 'Service factor' : 'Factor de servicio'}: ${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 3)}`,
    `${en ? 'Load duty' : 'Tipo de carga'}: ${raw.loadDuty}`,
    `${en ? 'Design standard' : 'Marco normativo'}: ${raw.designStandard}`,
    `${en ? 'Additional resistance' : 'Resistencia adicional'} (N): ${formatNum(raw.additionalResistance_N, 1)}`,
    `${en ? 'Accel time' : 'Tiempo aceleración'} (s): ${formatNum(raw.accelTime_s, 2)}`,
    `${en ? 'Inertia factor' : 'Factor inercia'}: ${formatNum(raw.inertiaStartingFactor, 3)}`,
    '',
    hOut,
    `${en ? 'Steady traction F' : 'Fuerza régimen F'} (N): ${formatNum(d.F_steady_N ?? r.totalForce_N, 2)}`,
    `${en ? 'Design torque (incl. SF)' : 'Par diseño (incl. SF)'} (N·m): ${formatNum(r.torqueWithService_Nm, 2)}`,
    `${en ? 'Motor shaft power (sizing)' : 'Potencia eje motor'} (kW): ${formatNum(r.requiredMotorPower_kW, 3)}`,
    `${en ? 'Drum rpm' : 'rpm tambor'}: ${formatNum(r.drumRpm, 2)}`,
    `${en ? 'Mass flow (model)' : 'Caudal másico (modelo)'} (kg/s): ${formatNum(r.massFlow_kg_s, 3)}`,
    '',
    hMount,
    formatMounting(mount) +
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
 * @param {ReturnType<typeof computeRollerConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 */
function buildRollerRfqCsv(raw, r, mount) {
  const d = r.detail || {};
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'L_m',
    'load_mass_kg',
    'v_m_s',
    'D_roller_mm',
    'roller_pitch_mm',
    'load_support_mode',
    'pallet_preset',
    'pallet_orientation',
    'uniform_rollers_override',
    'Crr',
    'efficiency_pct',
    'service_factor',
    'load_duty',
    'design_standard',
    'additional_resistance_N',
    'accel_time_s',
    'inertia_factor',
    'mounting',
    'orientation',
    'machine_shaft_d_mm',
    'F_steady_N',
    'T_design_Nm',
    'P_motor_kW',
    'n_drum_rpm',
    'mass_flow_kg_s',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const when = new Date().toISOString();
  const values = [
    'TheMechAssist_roller_conveyor',
    when,
    url,
    raw.length_m,
    raw.loadMass_kg,
    raw.speed_m_s,
    raw.rollerDiameter_mm,
    raw.rollerPitch_mm,
    raw.loadSupportMode,
    raw.palletPreset,
    raw.palletOrientation,
    raw.uniformRollersOverride || '',
    raw.rollingResistanceCoeff,
    raw.efficiency_pct,
    r.serviceFactorUsed ?? raw.serviceFactor,
    raw.loadDuty,
    raw.designStandard,
    raw.additionalResistance_N,
    raw.accelTime_s,
    raw.inertiaStartingFactor,
    mount.mountingType,
    mount.orientation,
    mount.machineShaftDiameter_mm ?? '',
    d.F_steady_N ?? r.totalForce_N,
    r.torqueWithService_Nm,
    r.requiredMotorPower_kW,
    r.drumRpm,
    r.massFlow_kg_s,
  ];
  return `${headers.map(escapeCsvCell).join(',')}\n${values.map(escapeCsvCell).join(',')}`;
}

function clampNum(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

/** Resalta L, D, F, v, Crr en el SVG al pasar el ratón (una sola suscripción por elemento). */
function initRollerDiagramMetricHover(svg) {
  if (!(svg instanceof SVGSVGElement)) return;
  if (svg.dataset.rollerDiagramMetricHoverInit === '1') return;
  svg.dataset.rollerDiagramMetricHoverInit = '1';
  let active = /** @type {string | null} */ (null);
  const setMetric = (m) => {
    if (m === active) return;
    svg.querySelectorAll('.diagram-metric--hover').forEach((el) => el.classList.remove('diagram-metric--hover'));
    active = m;
    if (m) svg.querySelectorAll(`[data-diagram-metric="${m}"]`).forEach((el) => el.classList.add('diagram-metric--hover'));
  };
  svg.addEventListener('mousemove', (e) => {
    const hit = e.target && /** @type {Element} */ (e.target).closest?.('[data-diagram-metric]');
    const m = hit?.getAttribute('data-diagram-metric') ?? null;
    setMetric(m);
  });
  svg.addEventListener('mouseleave', () => setMetric(null));
}

function bindRollerRangeSlider(rangeId, numId, lo, hi, step = null) {
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

function syncLoadDutyUi() {
  const dutyEl = document.getElementById('loadDuty');
  const sfIn = document.getElementById('serviceFactor');
  const hint = document.getElementById('loadDutyHint');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;
  const lang = getCurrentLang();
  const en = lang === 'en';
  const row = LOAD_DUTY_OPTIONS.find((o) => o.id === dutyEl.value);
  if (hint && row) hint.textContent = en ? LOAD_DUTY_OPTIONS_EN[row.id].hint : row.hint;
  if (dutyEl.value === 'custom') {
    sfIn.readOnly = false;
    sfIn.classList.remove('input-synced');
  } else {
    sfIn.readOnly = true;
    sfIn.classList.add('input-synced');
    if (row && row.sf != null) sfIn.value = String(row.sf);
  }
}

function syncLoadSupportUi() {
  const modeEl = document.getElementById('loadSupportMode');
  const presetEl = document.getElementById('palletPreset');
  const uBlock = document.getElementById('supportUniformBlock');
  const pBlock = document.getElementById('supportPalletBlock');
  const customDims = document.getElementById('palletCustomDims');
  const mode = modeEl instanceof HTMLSelectElement ? modeEl.value : 'uniform';
  const preset = presetEl instanceof HTMLSelectElement ? presetEl.value : 'eur1';
  if (uBlock) uBlock.hidden = mode !== 'uniform';
  if (pBlock) pBlock.hidden = mode !== 'pallet';
  if (customDims) customDims.hidden = preset !== 'custom';
}

function writeRollerFormValue(id, val) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.value = val === '' || val == null ? '' : String(val);
}

function syncRollerRangeSlidersFromNumberInputs() {
  const pairs = [
    ['lengthR', 'length', 0.5, 80, 0.1],
    ['loadMassR', 'loadMass', 1, 8000, 1],
    ['speedR', 'speed', 0.05, 3, 0.01],
    ['rollerDR', 'rollerD', 40, 400, 1],
    ['rollingResistanceR', 'rollingResistance', 0.01, 0.12, 0.001],
    ['efficiencyR', 'efficiency', 70, 99, 0.5],
    ['rollerPitchR', 'rollerPitch', 50, 250, 1],
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

function applyRollerPresetFromId(presetId) {
  const def = ROLLER_PRESET_BY_ID[presetId];
  if (!def) return;
  for (const [k, v] of Object.entries(def.values)) {
    writeRollerFormValue(k, v);
  }
  syncRollerRangeSlidersFromNumberInputs();
  syncLoadDutyUi();
  syncLoadSupportUi();
  refresh();
}

function getPalletAlongTransportMm() {
  const mode = readSelect('loadSupportMode', 'uniform');
  if (mode !== 'pallet') return null;
  const preset = readSelect('palletPreset', 'eur1');
  const orient = readSelect('palletOrientation', 'long_along_transport');
  const presets = {
    eur1: { l: 1200, w: 800 },
    eur2: { l: 1200, w: 1000 },
    eur6: { l: 800, w: 600 },
    ind1000: { l: 1200, w: 1000 },
    us48x40: { l: 1219, w: 1016 },
  };
  let L = 1200;
  let W = 800;
  if (preset === 'custom') {
    L = readNum('palletCustomL', 1200);
    W = readNum('palletCustomW', 800);
  } else if (presets[preset]) {
    L = presets[preset].l;
    W = presets[preset].w;
  }
  return orient === 'short_along_transport' ? W : L;
}

function syncRollersSuggestion() {
  const input = document.getElementById('uniformRollersOverride');
  const hint = document.getElementById('uniformRollersSuggestion');
  if (!(input instanceof HTMLInputElement) || !hint) return;
  const pitch = readNum('rollerPitch', 125);
  const palletAlong = getPalletAlongTransportMm();
  if (!(Number.isFinite(pitch) && pitch > 0 && Number.isFinite(palletAlong) && palletAlong > 0)) {
    hint.textContent = '';
    return;
  }
  const suggested = Math.max(1, Math.floor(palletAlong / pitch) + 1);
  const en = getCurrentLang() === 'en';
  hint.textContent = en
    ? `Suggested from pallet length/pitch: ${suggested} rollers.`
    : `Sugerido por longitud de paleta/paso: ${suggested} rodillos.`;
  if (input.value.trim() === '' || input.dataset.autoSuggestion === '1') {
    input.value = String(suggested);
    input.dataset.autoSuggestion = '1';
  }
}

function escAlertText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');
}

/** @param {string[]} warnings @param {boolean} en */
function localizeRollerSupportWarnings(warnings, en) {
  if (!en) return warnings;
  return warnings.map((w) => {
    if (w.includes('huella en direcci')) {
      return 'Footprint along transport exceeds useful length L: review inputs or increase L.';
    }
    if (w.includes('Menos de 2 rodillos')) {
      return 'Fewer than 2 rollers under the footprint at this pitch: unstable support risk; review pitch or pallet orientation.';
    }
    return w;
  });
}

function getEls() {
  return {
    diagram: /** @type {SVGSVGElement | null} */ (document.getElementById('diagramRoller')),
    designAlerts: document.getElementById('designAlerts'),
    results: document.getElementById('resultsGrid'),
    engineeringReport: document.getElementById('engineeringReport'),
    motorBlock: document.getElementById('motorBlock'),
    assumptions: document.getElementById('assumptionsList'),
    premiumOpt: document.getElementById('premiumOptBlock'),
    premiumPdfMount: document.getElementById('premiumPdfExportMount'),
  };
}

function getDriveRequirements() {
  const r = computeRollerConveyor(readInputs());
  return {
    power_kW: r.requiredMotorPower_kW,
    torque_Nm: r.torqueWithService_Nm,
    drum_rpm: r.drumRpm,
    ...readMountingPreferences(),
  };
}

function refreshCore() {
  const conveyorExtrasUnlocked = isPremiumEffective() || isFreeMachineFullAccess();
  const pdfReportUnlocked = isPdfReportUiUnlocked();
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const en = lang === 'en';
  const TX = en
    ? {
        rollerEyebrowSuffix: 'roller',
        withSf: 'With service factor applied',
        motorPower: 'Motor power',
        powerHint: '(T×ω)/η · sizing',
        speed: 'Speed',
        rollerRpm: 'roller rpm',
        serviceFactor: 'Service factor',
        mountingType: 'Mounting type',
        speedLine: 'Speed',
        mechanicalDetails: 'Mechanical details',
        standardConfig: 'Standard configuration',
        rollerPitch: 'Roller pitch',
        rollersUnderPallet: 'Rollers under footprint (est.)',
        rollersAlongL: 'Rollers along L / under load (est.)',
        footprint: 'Footprint (along × across transport)',
        supportDoc: 'Support documentation',
        pallet: 'Pallet',
        uniform: 'Uniform',
        normativeMargin: 'Normative margin',
        fullResult: 'Full result',
        fullResultHint: 'Forces, partial powers and extended metrics',
        fSteady: 'Steady-state force',
        fStart: 'Startup force',
        fAccel: 'Acceleration force',
        torqueRunStart: 'Torque steady / startup',
        motorPowerRunPeak: 'Motor power steady / peak',
        premiumOptTitle: 'Optimization (Premium)',
        premiumOptDesc: 'Reserved for advanced validation workflows.',
        proPreparedTitle: 'Pro features (ready to enable)',
        proPreparedLead: 'Billing matrix ready for roller tools.',
        proScenario: 'Scenario compare (pitch, Crr, pallet)',
        proCompare: 'Advanced multi-model comparator',
        proPresets: 'Pallet / pitch / material presets',
        machineDiagram: 'Machine diagram',
      }
    : {
        rollerEyebrowSuffix: 'rodillo',
        withSf: 'Con factor de servicio aplicado',
        motorPower: 'Potencia motor',
        powerHint: '(T×ω)/η · dimensionamiento',
        speed: 'Velocidad',
        rollerRpm: 'rpm rodillo',
        serviceFactor: 'Factor de servicio',
        mountingType: 'Tipo de montaje',
        speedLine: 'Velocidad',
        mechanicalDetails: 'Detalles mecánicos',
        standardConfig: 'Configuración estándar',
        rollerPitch: 'Paso rodillos',
        rollersUnderPallet: 'Rodillos bajo huella (estim.)',
        rollersAlongL: 'Rodillos en L / bajo carga (estim.)',
        footprint: 'Huella (dir. transp. × transv.)',
        supportDoc: 'Documentación apoyo',
        pallet: 'Paleta',
        uniform: 'Uniforme',
        normativeMargin: 'Margen normativo',
        fullResult: 'Resultado completo',
        fullResultHint: 'Fuerzas, potencias parciales y métricas extendidas',
        fSteady: 'Fuerza régimen',
        fStart: 'Fuerza arranque',
        fAccel: 'Fuerza aceleración',
        torqueRunStart: 'Par régimen / arranque',
        motorPowerRunPeak: 'Potencia motor régimen / pico',
        premiumOptTitle: 'Optimización (premium)',
        premiumOptDesc: 'Espacio reservado para validaciones avanzadas.',
        proPreparedTitle: 'Funciones Pro preparadas',
        proPreparedLead: 'Matriz de cobro lista para activar en rodillos.',
        proScenario: 'Comparación de escenarios (paso, Crr, paleta)',
        proCompare: 'Comparador avanzado multi-modelo',
        proPresets: 'Presets de palets/pasos/materiales',
        machineDiagram: 'Diagrama de la máquina',
      };
  const els = getEls();
  if (syncInputValidationResultsGate(els.results)) return;
  const raw = readInputs();
  const r = computeRollerConveyor(raw);
  if (Number.isFinite(r.requiredMotorPower_kW)) incrementCalcCounter();
  const d = r.detail || {};

  if (els.diagram) {
    renderRollerConveyorDiagram(els.diagram, {
      lang,
      ...raw,
      drumRpm: r.drumRpm,
      F_steady_N: d.F_steady_N,
      crr: raw.rollingResistanceCoeff,
      designStandard: raw.designStandard,
      serviceFactor: r.serviceFactorUsed,
      massFlow_kg_s: r.massFlow_kg_s,
    });
    initRollerDiagramMetricHover(els.diagram);
  }

  const mount = readMountingPreferences();
  const mechanicalSummary = [
    en
      ? `Roller Ø ${formatNum(raw.rollerDiameter_mm, 2)} mm`
      : `Rodillo Ø ${formatNum(raw.rollerDiameter_mm, 2)} mm`,
    mount.machineShaftDiameter_mm != null
      ? `${en ? 'shaft' : 'eje'} ${formatNum(mount.machineShaftDiameter_mm, 2)} mm`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const vLine = `${formatNum(raw.speed_m_s, 2)} m/s · ${formatNum(r.drumRpm, 2)} rpm`;

  if (els.designAlerts) {
    const warnings = localizeRollerSupportWarnings(r.supportInfo?.warnings || [], en);
    els.designAlerts.innerHTML = warnings
      .map((text) => `<p class="design-alert design-alert--warn">${escAlertText(text)}</p>`)
      .join('');
  }

  if (els.results) {
    const sup = r.supportInfo;
    const huellaTxt =
      sup?.mode === 'pallet' && sup.footprintAlong_mm != null && sup.footprintAcross_mm != null
        ? `${formatNum(sup.footprintAlong_mm, 0)}×${formatNum(sup.footprintAcross_mm, 0)} mm`
        : '—';
    const rollersLabel = sup?.mode === 'pallet' ? TX.rollersUnderPallet : TX.rollersAlongL;
    const supportBlock = `
      <div class="result-focus-grid flat-kpi-secondary" style="margin-top:0.5rem">
        <div class="metric"><div class="label">${TX.rollerPitch}</div><div class="value">${formatNum(sup?.rollerPitch_mm ?? 125, 0)} mm</div></div>
        <div class="metric"><div class="label">${rollersLabel}</div><div class="value">${sup?.rollersAlongFootprint != null ? formatNum(sup.rollersAlongFootprint, 0) : '—'}</div></div>
        <div class="metric metric--text"><div class="label">${TX.footprint}</div><div class="value">${huellaTxt}</div></div>
        <div class="metric metric--text"><div class="label">${TX.supportDoc}</div><div class="value">${sup?.mode === 'pallet' ? TX.pallet : TX.uniform}</div></div>
      </div>`;
    const normRow =
      r.steadyStandardMultiplier > 1
        ? `<div class="metric"><div class="label">${TX.normativeMargin}</div><div class="value">x${formatNum(r.steadyStandardMultiplier, 2)} (${r.designStandard})</div></div>`
        : '';
    els.results.innerHTML = `
      <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
        <article class="flat-kpi flat-kpi--torque">
          <span class="flat-kpi__eyebrow">${LBL.designTorque} · ${TX.rollerEyebrowSuffix}</span>
          <p class="flat-kpi__value">${formatNum(r.torqueWithService_Nm, 2)}<span class="flat-kpi__unit">N·m</span></p>
          <p class="flat-kpi__hint">${TX.withSf}</p>
        </article>
        <article class="flat-kpi flat-kpi--power">
          <span class="flat-kpi__eyebrow">${TX.motorPower}</span>
          <p class="flat-kpi__value">${formatNum(r.requiredMotorPower_kW, 2)}<span class="flat-kpi__unit">kW</span></p>
          <p class="flat-kpi__hint">${TX.powerHint}</p>
        </article>
        <article class="flat-kpi flat-kpi--speed">
          <span class="flat-kpi__eyebrow">${TX.speed}</span>
          <p class="flat-kpi__value">${formatNum(raw.speed_m_s, 2)}<span class="flat-kpi__unit">m/s</span></p>
          <p class="flat-kpi__hint">${formatNum(r.drumRpm, 2)} ${TX.rollerRpm}</p>
        </article>
      </div>
      <div class="result-focus-grid flat-kpi-secondary">
        <div class="metric"><div class="label">${TX.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed, 2)}</div></div>
        <div class="metric metric--text"><div class="label">${TX.mountingType}</div><div class="value">${formatMounting(mount)}</div></div>
        <div class="metric metric--text"><div class="label">${TX.speedLine}</div><div class="value">${vLine}</div></div>
        <div class="metric metric--text"><div class="label">${TX.mechanicalDetails}</div><div class="value">${mechanicalSummary || TX.standardConfig}</div></div>
      </div>
      ${supportBlock}
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
            ${normRow}
            <div class="metric"><div class="label">${TX.fSteady}</div><div class="value">${formatNum(d.F_steady_N, 2)} N</div></div>
            <div class="metric"><div class="label">${TX.fStart}</div><div class="value">${formatNum(d.F_total_start_N, 2)} N</div></div>
            <div class="metric"><div class="label">${TX.fAccel}</div><div class="value">${formatNum(d.F_accel_N, 2)} N</div></div>
            <div class="metric"><div class="label">${TX.torqueRunStart}</div><div class="value">${formatNum(r.torqueAtDrum_Nm, 2)} / ${formatNum(r.torqueStart_Nm, 2)} N·m</div></div>
            <div class="metric"><div class="label">${TX.motorPowerRunPeak}</div><div class="value">${formatNum((d.powerMotorRun_W ?? 0) / 1000, 2)} / ${formatNum((d.powerMotorStart_W ?? 0) / 1000, 2)} kW</div></div>
            <div class="metric"><div class="label">${LBL.massFlow}</div><div class="value">${formatNum(r.massFlow_kg_s, 2)} kg/s</div></div>
          </div>
        </div>
      </details>
    `;
  }

  if (els.engineeringReport) {
    els.engineeringReport.innerHTML = renderFullEngineeringAside(r, {
      lang,
      shaftLabel: en ? 'drive roller' : 'rodillo motriz',
      shaftOutLabel: en ? 'Gearbox output / roller' : 'Salida reductor / rodillo',
      motorSubtitle: en
        ? 'Indicative industrial induction motor reference for roller lines.'
        : 'Referencia con motor asíncrono industrial para línea de rodillos.',
    });
  }

  if (els.motorBlock) {
    els.motorBlock.innerHTML = renderBrandRecommendationCards(getDriveRequirements());
  }

  if (els.assumptions) {
    const extra = en
      ? ['This model does not verify individual roller load capacity or roller shaft deflection.']
      : ['Este modelo no verifica la capacidad de carga individual de cada rodillo ni la flecha del eje.'];
    els.assumptions.innerHTML = [...(r.assumptions || []), ...extra].map((a) => `<li>${a}</li>`).join('');
  }

  if (els.premiumOpt) {
    const m = FEATURES.monetization?.roller;
    const hasPreparedGate =
      !!m && (m.scenarioCompare || m.advancedMotorCompare || m.premiumPresets);
    if (conveyorExtrasUnlocked && FEATURES.safetyOptimization) {
      els.premiumOpt.innerHTML = `<section class="panel"><h2><span class="panel-icon">★</span> ${TX.premiumOptTitle}</h2><p class="muted" style="margin:0">${TX.premiumOptDesc}</p></section>`;
    } else if (!conveyorExtrasUnlocked && hasPreparedGate) {
      const items = [
        m.scenarioCompare ? TX.proScenario : '',
        m.advancedMotorCompare ? TX.proCompare : '',
        m.premiumPresets ? TX.proPresets : '',
      ]
        .filter(Boolean)
        .map((x) => `<li>${x}</li>`)
        .join('');
      els.premiumOpt.innerHTML = `<section class="panel"><h2><span class="panel-icon">★</span> ${TX.proPreparedTitle}</h2><p class="muted" style="margin:0 0 .5rem">${TX.proPreparedLead}</p><ul class="assumptions" style="margin:0">${items}</ul></section>`;
    } else {
      els.premiumOpt.innerHTML = '';
    }
  }

  if (els.premiumPdfMount) {
    mountPremiumPdfExportBar(els.premiumPdfMount, {
      isPremium: pdfReportUnlocked,
      getPayload: () => buildRollerPdfPayload(raw, r),
      getDiagramElement: () => els.diagram,
      diagramTitle: TX.machineDiagram,
    });
  }
  applyMachinePremiumGates();
  foldAllMachineDetailsOncePerPageLoad();
}

const refresh = wrapCalcRefresh(refreshCore);

inputIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});
selectIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('change', () => {
    syncLoadDutyUi();
    syncLoadSupportUi();
    syncRollersSuggestion();
    refresh();
  });
});

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

try {
  initMotorVerification(document.getElementById('verifyPanel'), getDriveRequirements);
} catch (err) {
  console.error(err);
}

document.getElementById('btnCalcular')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-motores');
});

document.getElementById('uniformRollersOverride')?.addEventListener('input', (e) => {
  const el = e.currentTarget;
  if (el instanceof HTMLInputElement) {
    el.dataset.autoSuggestion = el.value.trim() === '' ? '1' : '0';
  }
});

document.querySelectorAll('[data-friction-preset-for]').forEach((wrap) => {
  const id = wrap.getAttribute('data-friction-preset-for');
  if (!id) return;
  wrap.querySelectorAll('button[data-mu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(id);
      const mu = btn.getAttribute('data-mu');
      if (el instanceof HTMLInputElement && mu) {
        el.value = mu;
        const rId = `${id}R`;
        const rEl = document.getElementById(rId);
        if (rEl instanceof HTMLInputElement) rEl.value = mu;
        refresh();
      }
    });
  });
});

syncLoadDutyUi();
syncLoadSupportUi();
syncRollersSuggestion();
initInfoChipPopovers(document.body);

bindRollerRangeSlider('lengthR', 'length', 0.5, 80, 0.1);
bindRollerRangeSlider('loadMassR', 'loadMass', 1, 8000, 1);
bindRollerRangeSlider('speedR', 'speed', 0.05, 3, 0.01);
bindRollerRangeSlider('rollerDR', 'rollerD', 40, 400, 1);
bindRollerRangeSlider('rollingResistanceR', 'rollingResistance', 0.01, 0.12, 0.001);
bindRollerRangeSlider('efficiencyR', 'efficiency', 70, 99, 0.5);
bindRollerRangeSlider('rollerPitchR', 'rollerPitch', 50, 250, 1);

applyRollerDocumentChrome();
bindInputValidation(ROLLER_CONVEYOR_VALIDATION);
bootMachineCalcView(refresh);

wireMachineRfqExport({
  getPayload: () => {
    const raw = readInputs();
    return { raw, result: computeRollerConveyor(raw), mount: readMountingPreferences() };
  },
  buildPlainText: buildRollerRfqPlainText,
  buildCsv: buildRollerRfqCsv,
  toastCopiedEn: MACHINE_HUB_UX_EN['machineHub.toastRfqCopied'],
  toastErrEn: MACHINE_HUB_UX_EN['machineHub.toastRfqErr'],
});

watchLangAndApply(ROLLER_PAGE_EN, {
  reloadOnEs: false,
  onEnApplied: () => {
    applyRollerDocumentChrome();
    syncLoadDutyUi();
    syncLoadSupportUi();
    syncRollersSuggestion();
    initInfoChipPopovers(document.body);
    refresh();
  },
  onEsRestored: () => {
    applyRollerDocumentChrome();
    syncLoadDutyUi();
    syncLoadSupportUi();
    syncRollersSuggestion();
    initInfoChipPopovers(document.body);
    refresh();
  },
});

document.querySelector('.flat-sidebar')?.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target.closest('[data-roller-preset]') : null;
  if (!(t instanceof HTMLButtonElement)) return;
  const id = t.getAttribute('data-roller-preset');
  if (id) applyRollerPresetFromId(id);
});

mountMachineConfigBar();

