/**
 * Página cinta plana — motor de cálculo detallado + informe de ingeniería.
 */

import { FEATURES } from '../config/features.js';
import { isFreeMachineFullAccess } from '../config/freemium.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { computeFlatConveyor } from '../modules/flatConveyor.js';
import { FLAT_PRESET_BY_ID } from '../modules/flatConveyorUxConfig.js';
import {
  collectEmptyCoreFieldIds,
  evaluateFlatConveyorFieldUx,
  buildFlatConveyorVerdict,
  missingFieldsHumanList,
} from '../modules/flatConveyorUxEngine.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { buildInputPhaseAlerts, buildResultPhaseAlerts } from '../modules/conveyorDesignAlerts.js';
import { renderFlatConveyorDiagram } from './diagramFlat.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { mountPremiumPdfExportBar, buildFlatPdfPayload } from '../services/reportPdfExport.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import {
  injectMountingConfigSection,
  refreshMountingConfigSection,
  MOUNTING_INPUT_IDS,
} from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { getCurrentLang } from '../config/locales.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { FLAT_CONVEYOR_EN } from '../lab/i18n/pages/flatConvEn.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { incrementCalcCounter } from '../services/calcCounter.js';

const inputIds = [
  'beltLength',
  'loadMass',
  'beltWidth',
  'beltMass',
  'loadDistribution',
  'beltCarryFraction',
  'beltSpeed',
  'friction',
  'efficiency',
  'rollerD',
  'additionalResistance',
  'accelTime',
  'inertiaFactor',
  'serviceFactor',
];

const selectIds = ['designStandard', 'loadDuty', 'carrySurface', 'flatAppProfile'];
const LS_ADVANCED_OPEN = 'mdr-flat-advanced-open';

/** Lectura segura: si falta un input en el HTML no rompe todo el cálculo. */
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
    readSelect('loadDuty', 'moderate')
  );
  return {
    lang: getCurrentLang(),
    designStandard: readSelect('designStandard', 'ISO5048'),
    loadDuty: duty,
    carrySurface: readSelect('carrySurface', 'rollers'),
    beltLength_m: readNum('beltLength', 30),
    beltWidth_m: readNum('beltWidth', 0.8),
    loadMass_kg: readNum('loadMass', 800),
    beltMass_kg: readNum('beltMass', 0),
    loadDistribution: readNum('loadDistribution', 1),
    beltCarryFraction: readNum('beltCarryFraction', 0.5),
    beltSpeed_m_s: readNum('beltSpeed', 1.25),
    frictionCoeff: readNum('friction', 0.35),
    efficiency_pct: readNum('efficiency', 88),
    rollerDiameter_mm: readNum('rollerD', 500),
    additionalResistance_N: readNum('additionalResistance', 0),
    accelTime_s: readNum('accelTime', 3),
    inertiaStartingFactor: readNum('inertiaFactor', 1.15),
    serviceFactor: readNum('serviceFactor', 1.35),
  };
}

function syncLoadDutyUi() {
  const dutyEl = document.getElementById('loadDuty');
  const sfIn = document.getElementById('serviceFactor');
  const hint = document.getElementById('loadDutyHint');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;

  const lang = getCurrentLang();
  const en = lang === 'en';

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

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEls() {
  return {
    diagram: /** @type {SVGSVGElement | null} */ (document.getElementById('diagramFlat')),
    results: document.getElementById('resultsGrid'),
    engineeringReport: document.getElementById('engineeringReport'),
    motorBlock: document.getElementById('motorBlock'),
    premiumPdfMount: document.getElementById('premiumPdfExportMount'),
    premiumOpt: document.getElementById('premiumOptBlock'),
    assumptions: document.getElementById('assumptionsList'),
    runtimeError: document.getElementById('runtimeError'),
    designAlerts: document.getElementById('designAlerts'),
  };
}

function getDriveRequirements() {
  const r = computeFlatConveyor(readInputs());
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

function formatMounting(pref) {
  const en = getCurrentLang() === 'en';
  const typeMap = en
    ? { B3: 'B3 foot', B5: 'B5 flange', B14: 'B14 flange', hollowShaft: 'Hollow shaft' }
    : { B3: 'B3 patas', B5: 'B5 brida', B14: 'B14 brida', hollowShaft: 'Eje hueco' };
  const ori = pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal';
  return `${typeMap[pref.mountingType] || pref.mountingType} \u00b7 ${ori}`;
}

/**
 * @param {ReturnType<typeof readInputs>} raw
 * @param {ReturnType<typeof computeFlatConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 * @param {'es'|'en'} lang
 */
function buildFlatRfqPlainText(raw, r, mount, lang) {
  const en = lang === 'en';
  const d = r.detail || {};
  const carry =
    raw.carrySurface === 'slide_plate'
      ? en
        ? 'Slide plate'
        : 'Plancha deslizante'
      : en
        ? 'Rollers'
        : 'Rodillos';
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist — Flat belt conveyor (indicative duty point)'
    : 'TheMechAssist — Cinta transportadora plana (punto de trabajo orientativo)';
  const hIn = en ? '== Inputs ==' : '== Entradas ==';
  const hOut = en ? '== Results (indicative) ==' : '== Resultados (orientativos) ==';
  const hMount = en ? '== Mounting preference (for RFQ) ==' : '== Preferencia de montaje (RFQ) ==';
  const disc = en
    ? 'Disclaimer: simplified horizontal model; does not replace manufacturer selection, belt tensile design, or full DIN/CEMA memos. Validate μ, layout, and thermal duty with your supplier.'
    : 'Aviso: modelo horizontal simplificado; no sustituye la selección del fabricante, el cálculo de tensión de banda ni memorias DIN/CEMA completas. Valide μ, layout y régimen térmico con su proveedor.';

  const parts = [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
  ];
  if (url) parts.push(`${en ? 'Source' : 'Origen'}: ${url}`);
  parts.push(
    '',
    hIn,
    `${en ? 'Carrying strand' : 'Rama portante'}: ${carry}`,
    `${en ? 'Loaded run L' : 'Tramo de carga L'} (m): ${formatNum(raw.beltLength_m, 3)}`,
    `${en ? 'Belt width B' : 'Ancho banda B'} (m): ${formatNum(raw.beltWidth_m, 3)}`,
    `${en ? 'Nominal load mass m' : 'Masa de carga m'} (kg): ${formatNum(raw.loadMass_kg, 1)}`,
    `${en ? 'Belt mass m_b' : 'Masa banda m_b'} (kg): ${formatNum(raw.beltMass_kg, 2)}`,
    `${en ? 'Active load fraction' : 'Fracción carga activa'}: ${formatNum(raw.loadDistribution, 3)}`,
    `${en ? 'Belt mass on carry strand' : 'Fracción banda en portante'}: ${formatNum(raw.beltCarryFraction, 3)}`,
    `${en ? 'Belt speed v' : 'Velocidad v'} (m/s): ${formatNum(raw.beltSpeed_m_s, 3)}`,
    `${en ? 'Drive drum diameter D' : 'Diámetro tambor motriz D'} (mm): ${formatNum(raw.rollerDiameter_mm, 1)}`,
    `${en ? 'Friction coefficient μ' : 'Coeficiente μ'}: ${formatNum(raw.frictionCoeff, 3)}`,
    `${en ? 'Efficiency motor to drum η' : 'Rendimiento η motor–tambor'} (%): ${formatNum(raw.efficiency_pct, 1)}`,
    `${en ? 'Service factor (applied)' : 'Factor de servicio (aplicado)'}: ${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 3)}`,
    `${en ? 'Load duty' : 'Tipo de carga'}: ${raw.loadDuty}`,
    `${en ? 'Design framework' : 'Marco normativo'}: ${raw.designStandard}`,
    `${en ? 'Additional resistance F_ad' : 'Resistencia adicional F_ad'} (N): ${formatNum(raw.additionalResistance_N, 1)}`,
    `${en ? 'Accel. time' : 'Tiempo aceleración'} (s): ${formatNum(raw.accelTime_s, 2)}`,
    `${en ? 'Inertia factor' : 'Factor inercia'}: ${formatNum(raw.inertiaStartingFactor, 3)}`,
    '',
    hOut,
    `${en ? 'Steady traction F (drum)' : 'Fuerza régimen F (tambor)'} (N): ${formatNum(d.F_steady_N ?? r.frictionForce_N, 2)}`,
    `${en ? 'Design torque at drum (incl. SF)' : 'Par diseño en tambor (incl. SF)'} (N·m): ${formatNum(r.torqueWithService_Nm, 2)}`,
    `${en ? 'Motor shaft power (sizing)' : 'Potencia eje motor (dimensionamiento)'} (kW): ${formatNum(r.requiredMotorPower_kW, 3)}`,
    `${en ? 'Drum speed' : 'Velocidad tambor'} (rpm): ${formatNum(r.drumRpm, 2)}`,
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
 * @param {ReturnType<typeof computeFlatConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 */
function buildFlatRfqCsv(raw, r, mount) {
  const d = r.detail || {};
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'carry_surface',
    'L_m',
    'belt_width_m',
    'load_mass_kg',
    'belt_mass_kg',
    'load_distribution',
    'belt_carry_fraction',
    'v_m_s',
    'D_drum_mm',
    'friction_mu',
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
    'T_drum_design_Nm',
    'P_motor_kW',
    'n_drum_rpm',
    'mass_flow_kg_s',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const when = new Date().toISOString();
  const values = [
    'TheMechAssist_flat_belt',
    when,
    url,
    raw.carrySurface,
    raw.beltLength_m,
    raw.beltWidth_m,
    raw.loadMass_kg,
    raw.beltMass_kg,
    raw.loadDistribution,
    raw.beltCarryFraction,
    raw.beltSpeed_m_s,
    raw.rollerDiameter_mm,
    raw.frictionCoeff,
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
    d.F_steady_N ?? r.frictionForce_N,
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

/** Resalta L, D, F, v, μ en el SVG al pasar el ratón (delegación: el objetivo suele ser texto/línea hijo). */
function initFlatDiagramMetricHover(svg) {
  if (!(svg instanceof SVGSVGElement)) return;
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

function bindFlatRangeSlider(rangeId, numId, lo, hi, step = null) {
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

function syncFlatRangeSlidersFromNumberInputs() {
  const pairs = [
    ['beltLengthR', 'beltLength'],
    ['loadMassR', 'loadMass'],
    ['beltSpeedR', 'beltSpeed'],
    ['rollerDR', 'rollerD'],
    ['frictionR', 'friction'],
  ];
  for (const [rangeId, numId] of pairs) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    if (!(range instanceof HTMLInputElement) || !(num instanceof HTMLInputElement)) continue;
    let v = parseFloat(String(num.value).replace(',', '.'));
    const lo = parseFloat(range.min);
    const hi = parseFloat(range.max);
    if (!Number.isFinite(v)) v = lo;
    v = clampNum(v, lo, hi);
    num.value = String(v);
    range.value = String(v);
  }
}

function writeFlatInput(id, val) {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement) el.value = String(val);
}

function writeFlatSelect(id, val) {
  const el = document.getElementById(id);
  if (el instanceof HTMLSelectElement) el.value = val;
}

function applyFlatPresetFromId(presetId) {
  const def = FLAT_PRESET_BY_ID[presetId];
  if (!def) return;
  writeFlatSelect('flatAppProfile', def.profileId);
  const v = def.values;
  writeFlatSelect('carrySurface', v.carrySurface);
  writeFlatSelect('designStandard', v.designStandard);
  writeFlatSelect('loadDuty', v.loadDuty);
  writeFlatInput('beltLength', v.beltLength);
  writeFlatInput('rollerD', v.rollerD);
  writeFlatInput('beltSpeed', v.beltSpeed);
  writeFlatInput('loadMass', v.loadMass);
  writeFlatInput('friction', v.friction);
  writeFlatInput('efficiency', v.efficiency);
  writeFlatInput('beltWidth', v.beltWidth);
  writeFlatInput('beltMass', v.beltMass);
  writeFlatInput('loadDistribution', v.loadDistribution);
  writeFlatInput('beltCarryFraction', v.beltCarryFraction);
  writeFlatInput('additionalResistance', v.additionalResistance);
  writeFlatInput('accelTime', v.accelTime);
  writeFlatInput('inertiaFactor', v.inertiaFactor);
  syncFlatRangeSlidersFromNumberInputs();
  syncLoadDutyUi();
  const firstAcc = document.querySelector('.flat-sidebar details.flat-accordion');
  if (firstAcc instanceof HTMLDetailsElement) firstAcc.open = true;
  refresh();
}

function applyFieldInputUxClasses(states, missingIds) {
  for (const id of inputIds) {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) continue;
    el.classList.remove('field-input--field-ok', 'field-input--field-warn', 'field-input--field-bad');
  }
  for (const id of missingIds) {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement) el.classList.add('field-input--field-bad');
  }
  for (const [id, st] of Object.entries(states)) {
    if (missingIds.includes(id)) continue;
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) continue;
    if (st === 'ok') el.classList.add('field-input--field-ok');
    else if (st === 'warn') el.classList.add('field-input--field-warn');
    else if (st === 'bad') el.classList.add('field-input--field-bad');
  }
}

function updateFlatInputFeedbackBanner(missingIds, lang, TX) {
  const el = document.getElementById('flatInputFeedback');
  if (!el) return;
  if (!missingIds.length) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  const list = missingFieldsHumanList(missingIds, lang);
  el.textContent = `${TX.missingFieldsPrefix} ${list}`;
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

function initAdvancedDetailsPersistence() {
  const adv = document.querySelector('.adv-details');
  if (!(adv instanceof HTMLDetailsElement)) return;
  try {
    const saved = localStorage.getItem(LS_ADVANCED_OPEN);
    if (saved === '1') adv.open = true;
    if (saved === '0') adv.open = false;
  } catch (_) {
    /* ignore storage errors */
  }
  adv.addEventListener('toggle', () => {
    try {
      localStorage.setItem(LS_ADVANCED_OPEN, adv.open ? '1' : '0');
    } catch (_) {
      /* ignore storage errors */
    }
  });
}

function refresh() {
  const conveyorExtrasUnlocked = isPremiumEffective() || isFreeMachineFullAccess();
  const pdfReportUnlocked = isPremiumEffective();
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const TX = lang === 'en'
    ? {
        cannotCalcPower:
          'Cannot calculate motor power: check eta (1-99%) and ensure speed and drum diameter are valid.',
        carryingRollers: 'Carrying Rollers',
        carryingSlidePlate: 'Carrying Slide Plate',
        drum: 'Drum',
        shaftLabel: 'shaft',
        normativeMargin: 'Normative Margin (steady)',
        motorPower: 'Motor Power',
        withServiceFactorApplied: 'With service factor applied',
        sizingHint: '(T x omega) / eta · sizing',
        serviceFactor: 'Service Factor',
        mountingType: 'Mounting Type',
        beltAndDrumSpeed: 'Belt / Drum Speed',
        mechanicalDetails: 'Mechanical Details',
        standardConfig: 'Standard configuration',
        fullResult: 'Full Result',
        fullResultHint: 'Forces, partial powers, and extended metrics',
        steadyForceDrum: 'Steady Force (drum)',
        peakStartupForce: 'Peak Startup Force',
        loadVsBeltFriction: 'Load Friction / Belt Friction',
        accelerationForce: 'Additional force for belt acceleration',
        torqueSteadyStartup: 'Steady / Startup Torque',
        motorPowerDesignSf: 'Motor Power (design, with SF)',
        motorPowerRunStartNoSf: 'Motor Power steady / startup (without SF)',
        engineeringReportError: 'Error generating detailed engineering report.',
        gearmotorPrefix: 'Gearmotors:',
        fileProtoHint: 'If using file://, run the site with an HTTP server.',
        machineDiagram: 'Machine Diagram',
        speed: 'Speed',
        drumRpmHintSuffix: 'drum rpm',
        premiumOptimization: 'Optimization (Premium)',
        premiumPlaceholder: 'Reserved space for thermal ranking / ERP.',
        scenarioCompare: 'Scenario comparison A/B/C',
        advancedMultiModel: 'Advanced multi-model comparator',
        presetLibrary: 'Technical preset library',
        proPreparedFeatures: 'Prepared Pro Features',
        proPreparedDesc: 'Billing-ready matrix for flat conveyor.',
        calcErrorPrefix: 'Calculation error:',
        calcErrorSuffix:
          'Check console (F12). If opened by double click, use a local server: npx --yes serve .',
        missingFieldsPrefix: 'Enter values for:',
      }
    : {
        cannotCalcPower:
          'No se puede calcular la potencia de motor: compruebe η (1–99 %) y que velocidad y tambor sean válidos.',
        carryingRollers: 'Rodillos portantes',
        carryingSlidePlate: 'Plancha portante',
        drum: 'Tambor',
        shaftLabel: 'eje',
        normativeMargin: 'Margen normativo (régimen)',
        motorPower: 'Potencia motor',
        withServiceFactorApplied: 'Con factor de servicio aplicado',
        sizingHint: '(T×ω)/η · dimensionamiento',
        serviceFactor: 'Factor de servicio',
        mountingType: 'Tipo de montaje',
        beltAndDrumSpeed: 'Velocidad cinta / tambor',
        mechanicalDetails: 'Detalles mecánicos',
        standardConfig: 'Configuración estándar',
        fullResult: 'Resultado completo',
        fullResultHint: 'Fuerzas, potencias parciales y métricas extendidas',
        steadyForceDrum: 'Fuerza régimen (tambor)',
        peakStartupForce: 'Fuerza arranque (pico)',
        loadVsBeltFriction: 'Roz. carga / roz. banda',
        accelerationForce: 'Fuerza por aceleración',
        torqueSteadyStartup: 'Par régimen / arranque',
        motorPowerDesignSf: 'Potencia motor (diseño, con SF)',
        motorPowerRunStartNoSf: 'Potencia motor régimen / arranque (sin SF)',
        engineeringReportError: 'Error al generar el informe detallado.',
        gearmotorPrefix: 'Motorreductores:',
        fileProtoHint: 'Si usa <code>file://</code>, abra el sitio con un servidor HTTP.',
        machineDiagram: 'Diagrama de la máquina',
        speed: 'Velocidad',
        drumRpmHintSuffix: 'rpm tambor',
        premiumOptimization: 'Optimización (premium)',
        premiumPlaceholder: 'Espacio reservado para ranking térmico / ERP.',
        scenarioCompare: 'Comparación de escenarios A/B/C',
        advancedMultiModel: 'Comparador avanzado multi-modelo',
        presetLibrary: 'Biblioteca de presets técnicos',
        proPreparedFeatures: 'Funciones Pro preparadas',
        proPreparedDesc: 'Matriz de cobro lista para activar en cinta plana.',
        calcErrorPrefix: 'Error al calcular:',
        calcErrorSuffix:
          'Compruebe la consola (F12). Si abrió el archivo con doble clic, use un servidor local: npx --yes serve .',
        missingFieldsPrefix: 'Falta indicar:',
      };
  const els = getEls();
  try {
    clearRuntimeError();
    const missing = collectEmptyCoreFieldIds();
    const raw = readInputs();
    const appProfile = readSelect('flatAppProfile', 'medium');
    const fieldUx = evaluateFlatConveyorFieldUx(raw, appProfile, lang);
    missing.forEach((id) => {
      fieldUx.states[id] = 'bad';
    });
    applyFieldInputUxClasses(fieldUx.states, missing);
    updateFlatInputFeedbackBanner(missing, lang, TX);

    const r = computeFlatConveyor(raw);
    const d = r.detail || {};

    const effIn = document.getElementById('efficiency');
    if (effIn instanceof HTMLInputElement) {
      effIn.classList.toggle('field-input--danger', (r.efficiency_pct_raw ?? 0) > 100);
    }

    const duty = raw.loadDuty;
    const sfUsed = r.serviceFactorUsed ?? readNum('serviceFactor', 1);
    const inputAlerts = buildInputPhaseAlerts({
      efficiency_pct_raw: r.efficiency_pct_raw ?? raw.efficiency_pct,
      efficiency_pct_used: r.efficiency_pct_effective ?? 88,
      serviceFactor: sfUsed,
      loadDuty: duty,
      serviceFactorFieldRaw: duty === 'custom' ? raw.serviceFactor : undefined,
      rollerDiameter_mm: raw.rollerDiameter_mm,
    });
    const resultAlerts = buildResultPhaseAlerts({
      rollerDiameter_mm: raw.rollerDiameter_mm,
      powerMotor_kW: r.requiredMotorPower_kW,
      torqueDesign_Nm: r.torqueWithService_Nm,
      beltWidth_m: raw.beltWidth_m,
    });
    const nanAlert = !Number.isFinite(r.requiredMotorPower_kW)
      ? [
          {
            level: /** @type {const} */ ('error'),
            text: TX.cannotCalcPower,
          },
        ]
      : [];
    const fieldUxAlertLines = fieldUx.warnings.map((w) => ({
      level: /** @type {const} */ ('warn'),
      text: w.text,
    }));
    const all = [...inputAlerts, ...nanAlert, ...resultAlerts, ...fieldUxAlertLines];

    const calcOk = Number.isFinite(r.requiredMotorPower_kW);
    if (calcOk) incrementCalcCounter();
    const verdict = buildFlatConveyorVerdict({
      missingIds: missing,
      calcOk,
      designAlerts: all,
      fieldWarnings: fieldUx.warnings,
      raw,
      result: r,
      lang,
    });

    if (els.designAlerts) {
      els.designAlerts.innerHTML = all
        .map((a) => `<p class="design-alert design-alert--${a.level}">${escHtml(a.text)}</p>`)
        .join('');
    }

    if (els.diagram) {
      try {
        renderFlatConveyorDiagram(els.diagram, {
          lang,
          carrySurface: raw.carrySurface,
          beltLength_m: raw.beltLength_m,
          rollerDiameter_mm: raw.rollerDiameter_mm,
          beltSpeed_m_s: raw.beltSpeed_m_s,
          loadMass_kg: raw.loadMass_kg,
          frictionCoeff: raw.frictionCoeff,
          frictionForce_N: r.frictionForce_N,
          normalForce_N: r.normalForce_N,
          massFlow_kg_s: r.massFlow_kg_s,
          powerAtDrum_W: r.powerAtDrum_W,
          torqueAtDrum_Nm: r.torqueAtDrum_Nm,
          torqueRun_Nm: r.torqueAtDrum_Nm,
          torqueStart_Nm: r.torqueStart_Nm,
          torqueDesign_Nm: r.torqueWithService_Nm,
          powerDrumRun_W: r.powerAtDrum_W,
          powerDrumStart_W: d.powerDrumStart_W,
          powerMotorDesign_W: d.powerMotorDesign_W,
          serviceFactor: r.serviceFactorUsed ?? raw.serviceFactor,
          efficiency_pct: r.efficiency_pct_effective,
          omega_rad_s: d.omega_rad_s,
          detail: Object.keys(d).length ? d : undefined,
        });
        initFlatDiagramMetricHover(els.diagram);
      } catch (diagramErr) {
        console.error(diagramErr);
        const svg = els.diagram;
        svg.setAttribute('viewBox', '0 0 560 120');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.innerHTML = `<text x="24" y="48" fill="#b91c1c" font-size="14" font-family="system-ui,sans-serif">${
          lang === 'en' ? 'Could not draw schematic.' : 'No se pudo dibujar el esquema.'
        }</text><text x="24" y="78" fill="#64748b" font-size="11" font-family="system-ui,sans-serif">${escHtml(
          String(diagramErr?.message || diagramErr),
        )}</text>`;
      }
    }

    if (els.results) {
      try {
        const mount = readMountingPreferences();
        const carryLabel =
          raw.carrySurface === 'slide_plate' ? TX.carryingSlidePlate : TX.carryingRollers;
        const mechanicalSummary = [
          carryLabel,
          `${TX.drum} ${formatNum(raw.rollerDiameter_mm, 2)} mm`,
          mount.machineShaftDiameter_mm != null ? `${TX.shaftLabel} ${formatNum(mount.machineShaftDiameter_mm, 2)} mm` : null,
        ]
          .filter(Boolean)
          .join(' · ');
        const normaRow =
          r.steadyStandardMultiplier > 1
            ? `<div class="metric"><div class="label">${TX.normativeMargin}</div><div class="value">×${formatNum(r.steadyStandardMultiplier, 2)} (${r.designStandard})</div></div>`
            : '';
        const vLine = `${formatNum(raw.beltSpeed_m_s, 2)} m/s · ${formatNum(r.drumRpm, 2)} rpm`;
        const verdictIcon =
          verdict.kind === 'ok' ? '\u2705' : verdict.kind === 'out' ? '\u274C' : '\u26A0\uFE0F';
        const verdictHtml = `
    <div class="flat-verdict flat-verdict--${verdict.kind}" role="status">
      <div class="flat-verdict__icon" aria-hidden="true">${verdictIcon}</div>
      <div class="flat-verdict__body">
        <p class="flat-verdict__title">${escHtml(verdict.title)}</p>
        <p class="flat-verdict__text muted">${escHtml(verdict.body)}</p>
      </div>
    </div>`;
        els.results.innerHTML = `${verdictHtml}
    <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
      <article class="flat-kpi flat-kpi--torque">
        <span class="flat-kpi__eyebrow">${LBL.designTorque} · ${TX.drum.toLowerCase()}</span>
        <p class="flat-kpi__value">${formatNum(r.torqueWithService_Nm, 2)}<span class="flat-kpi__unit">N·m</span></p>
        <p class="flat-kpi__hint">${TX.withServiceFactorApplied}</p>
      </article>
      <article class="flat-kpi flat-kpi--power">
        <span class="flat-kpi__eyebrow">${TX.motorPower}</span>
        <p class="flat-kpi__value">${formatNum(r.requiredMotorPower_kW, 2)}<span class="flat-kpi__unit">kW</span></p>
        <p class="flat-kpi__hint">${TX.sizingHint}</p>
      </article>
      <article class="flat-kpi flat-kpi--speed">
        <span class="flat-kpi__eyebrow">${TX.speed}</span>
        <p class="flat-kpi__value">${formatNum(raw.beltSpeed_m_s, 2)}<span class="flat-kpi__unit">m/s</span></p>
        <p class="flat-kpi__hint">${formatNum(r.drumRpm, 2)} ${TX.drumRpmHintSuffix}</p>
      </article>
    </div>
    <div class="result-focus-grid flat-kpi-secondary">
      <div class="metric"><div class="label">${TX.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mountingType}</div><div class="value">${formatMounting(mount)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.beltAndDrumSpeed}</div><div class="value">${vLine}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mechanicalDetails}</div><div class="value">${mechanicalSummary || TX.standardConfig}</div></div>
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
          ${normaRow}
          <div class="metric"><div class="label">${TX.steadyForceDrum}</div><div class="value">${formatNum(d.F_steady_N, 2)} N</div></div>
          <div class="metric"><div class="label">${TX.peakStartupForce}</div><div class="value">${formatNum(d.F_total_start_N, 2)} N</div></div>
          <div class="metric"><div class="label">${TX.loadVsBeltFriction}</div><div class="value">${formatNum(d.F_friction_load_N, 2)} / ${formatNum(d.F_friction_belt_total_N, 2)} N</div></div>
          <div class="metric"><div class="label">${TX.accelerationForce}</div><div class="value">${formatNum(d.F_accel_N, 2)} N</div></div>
          <div class="metric"><div class="label">${LBL.massFlow}</div><div class="value">${formatNum(r.massFlow_kg_s, 2)} kg/s</div></div>
          <div class="metric"><div class="label">${TX.torqueSteadyStartup}</div><div class="value">${formatNum(r.torqueAtDrum_Nm, 2)} / ${formatNum(r.torqueStart_Nm, 2)} N·m</div></div>
          <div class="metric"><div class="label">${TX.motorPowerDesignSf}</div><div class="value">${formatNum((d.powerMotorDesign_W ?? 0) / 1000, 2)} kW</div></div>
          <div class="metric"><div class="label">${TX.motorPowerRunStartNoSf}</div><div class="value">${formatNum((d.powerMotorRun_W ?? 0) / 1000, 2)} / ${formatNum((d.powerMotorStart_W ?? 0) / 1000, 2)} kW</div></div>
        </div>
      </div>
    </details>
  `;
      } catch (renderErr) {
        console.error(renderErr);
        els.results.innerHTML = `<p class="motor-error" role="alert">${escHtml(String(renderErr?.message || renderErr))}</p>`;
      }
    }

    if (els.engineeringReport) {
      try {
        els.engineeringReport.innerHTML = renderFullEngineeringAside(r, { lang });
      } catch (err) {
        console.error(err);
        els.engineeringReport.innerHTML = `<div class="motor-error">${TX.engineeringReportError} ${String(err.message || err)}</div>`;
      }
    }

    if (els.motorBlock) {
      try {
        els.motorBlock.innerHTML = renderBrandRecommendationCards(getDriveRequirements());
      } catch (err) {
        console.error(err);
        els.motorBlock.innerHTML = `<div class="motor-error"><strong>${TX.gearmotorPrefix}</strong> ${String(err.message || err)}. ${TX.fileProtoHint}</div>`;
      }
    }

    if (els.premiumPdfMount) {
      try {
        mountPremiumPdfExportBar(els.premiumPdfMount, {
          isPremium: pdfReportUnlocked,
          getPayload: () => buildFlatPdfPayload(raw, r),
          getDiagramElement: () => els.diagram,
          diagramTitle: TX.machineDiagram,
        });
      } catch (pdfMountErr) {
        console.error(pdfMountErr);
        if (els.premiumPdfMount) {
          els.premiumPdfMount.hidden = false;
          els.premiumPdfMount.innerHTML = `<div class="premium-export premium-export--teaser" role="alert"><p class="premium-export__teaser-text">${
            lang === 'en'
              ? 'Could not mount the PDF block. See console (F12).'
              : 'No se pudo mostrar el bloque PDF. Vea la consola (F12).'
          } ${escHtml(String(pdfMountErr?.message || pdfMountErr))}</p></div>`;
        }
      }
    }

    if (els.assumptions) {
      const extra = lang === 'en'
        ? ['This model does not calculate belt tensile stress or drum structural verification.']
        : ['Este modelo no calcula tensiones de banda ni la verificación estructural de tambores.'];
      els.assumptions.innerHTML = [...(r.assumptions || []), ...extra].map((a) => `<li>${a}</li>`).join('');
    }

    if (els.premiumOpt) {
      const m = FEATURES.monetization?.flat;
      const hasPreparedGate =
        !!m && (m.scenarioCompare || m.advancedMotorCompare || m.premiumPresets);
      if (conveyorExtrasUnlocked && FEATURES.safetyOptimization) {
        els.premiumOpt.innerHTML = `
      <section class="panel">
        <h2><span class="panel-icon">★</span> ${TX.premiumOptimization}</h2>
        <p class="muted" style="margin:0">${TX.premiumPlaceholder}</p>
      </section>
    `;
      } else if (!conveyorExtrasUnlocked && hasPreparedGate) {
        const items = [
          m.scenarioCompare ? TX.scenarioCompare : '',
          m.advancedMotorCompare ? TX.advancedMultiModel : '',
          m.premiumPresets ? TX.presetLibrary : '',
        ]
          .filter(Boolean)
          .map((x) => `<li>${x}</li>`)
          .join('');
        els.premiumOpt.innerHTML = `
      <section class="panel">
        <h2><span class="panel-icon">★</span> ${TX.proPreparedFeatures}</h2>
        <p class="muted" style="margin:0 0 .5rem">${TX.proPreparedDesc}</p>
        <ul class="assumptions" style="margin:0">${items}</ul>
      </section>
    `;
      } else {
        els.premiumOpt.innerHTML = '';
      }
    }

    applyMachinePremiumGates();
    foldAllMachineDetailsOncePerPageLoad();
  } catch (err) {
    console.error(err);
    showRuntimeError(
      `${TX.calcErrorPrefix} ${String(err.message || err)}. ${TX.calcErrorSuffix}`,
    );
  }
}

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
      syncLoadDutyUi();
      refresh();
    });
  }
});

try {
  initMotorVerification(document.getElementById('verifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

wireMachineRfqExport({
  getPayload: () => {
    const raw = readInputs();
    return { raw, result: computeFlatConveyor(raw), mount: readMountingPreferences() };
  },
  buildPlainText: buildFlatRfqPlainText,
  buildCsv: buildFlatRfqCsv,
  toastCopiedEn: FLAT_CONVEYOR_EN['flatConv.toastRfqCopied'],
  toastErrEn: FLAT_CONVEYOR_EN['flatConv.toastRfqErr'],
});

document.getElementById('btnCalcular')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-motores');
  document.getElementById('section-motores')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        const r = document.getElementById('frictionR');
        if (r instanceof HTMLInputElement) r.value = mu;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        refresh();
      }
    });
  });
});

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

syncLoadDutyUi();
initAdvancedDetailsPersistence();
initInfoChipPopovers(document.body);

document.querySelectorAll('[data-flat-preset]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-flat-preset');
    if (id) applyFlatPresetFromId(id);
  });
});

bindFlatRangeSlider('beltLengthR', 'beltLength', 2, 80, 0.1);
bindFlatRangeSlider('loadMassR', 'loadMass', 10, 8000, 1);
bindFlatRangeSlider('beltSpeedR', 'beltSpeed', 0.05, 5, 0.01);
bindFlatRangeSlider('rollerDR', 'rollerD', 50, 1200, 1);
bindFlatRangeSlider('frictionR', 'friction', 0.15, 0.65, 0.01);

watchLangAndApply(FLAT_CONVEYOR_EN, {
  onEnApplied: () => {
    document.documentElement.lang = 'en';
    refreshMountingConfigSection();
    syncLoadDutyUi();
    initInfoChipPopovers(document.body);
    refresh();
  },
});

if (getCurrentLang() !== 'en') {
  refresh();
}


if (location.hash === '#flat-conveyor-assumptions') {
  const assumptionsSection = document.getElementById('flat-conveyor-assumptions');
  const details = assumptionsSection?.querySelector('details');
  if (details) details.open = true;
}
window.addEventListener('hashchange', () => {
  if (location.hash !== '#flat-conveyor-assumptions') return;
  const assumptionsSection = document.getElementById('flat-conveyor-assumptions');
  const details = assumptionsSection?.querySelector('details');
  if (details) details.open = true;
});
