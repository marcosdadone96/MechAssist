/**
 * Módulo avanzado oleohidráulico:
 * - Bomba hidráulica (potencia absorbida)
 * - Dimensionamiento de tuberías (Reynolds + Darcy)
 * - Veredicto integral
 */
import { bindInputValidation, mountLabPresetsBar } from './labCalcUx.js';
import { wrapCalcRefresh } from './creditsPageBoot.js';
import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { mountLabFluidPdfExportBar } from '../services/fluidLabPdfExport.js';
import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';
import { HYDRAULIC_PUMP_EN } from '../lab/i18n/pages/hydraulicPumpEn.js';
import { FLUIDS_HUB_UX_EN } from '../lab/i18n/pages/fluidsHubUxEn.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';

const HP_PRESETS = [
  {
    label: 'Engranajes · 32 cm³/rev',
    labelKey: 'hpump.preset1',
    values: {
      hpMode: 'design',
      hpLabTier: 'basic',
      hpType: 'gear',
      hpPressure: 180,
      hpRpm: 1450,
      hpDispCm3Rev: 32,
      pipeLineType: 'pressure',
      pipeFlowLmin: 42,
      pipeViscCst: 46,
      pipeLengthM: 12,
      pipeDiaIn: '0.75',
      pipeElbows: 4,
      pipeValves: 2,
    },
  },
  {
    label: 'Alto caudal · 55 cm³/rev',
    labelKey: 'hpump.preset2',
    values: {
      hpMode: 'design',
      hpLabTier: 'basic',
      hpType: 'piston',
      hpPressure: 210,
      hpRpm: 1500,
      hpDispCm3Rev: 55,
      pipeLineType: 'pressure',
      pipeFlowLmin: 95,
      pipeViscCst: 32,
      pipeLengthM: 18,
      pipeDiaIn: '1',
      pipeElbows: 6,
      pipeValves: 3,
    },
  },
  {
    label: 'Proyecto · NPSH',
    labelKey: 'hpump.preset3',
    values: {
      hpMode: 'design',
      hpLabTier: 'project',
      hpType: 'gear',
      hpPressure: 160,
      hpRpm: 1450,
      hpDispCm3Rev: 28,
      hpTankZ_m: 1.2,
      hpNPSHr_m: 0.4,
      hpOilTempC: 55,
      pipeLineType: 'suction',
      pipeFlowLmin: 38,
      pipeViscCst: 68,
      pipeLengthM: 4,
      pipeDiaIn: '1.25',
      pipeElbows: 2,
      pipeValves: 1,
    },
  },
];

function getLang() {
  return getCurrentLang();
}

/** @type {object | null} */
let pumpPdfSnapshot = null;
const TXT = {
  es: {
    title: 'Bomba Hidráulica — potencia y conducciones',
    lead: 'Módulo avanzado para análisis de bomba y líneas oleohidráulicas, con reglas y alertas de cavitación, pérdida de carga y veredicto orientativo de seguridad y eficiencia.',
    verdictOk: 'SISTEMA APTO',
    mType: 'Tipo de bomba',
    mPressure: 'Presión de operación',
    mQTheo: 'Caudal teórico',
    mQReal: 'Caudal real',
    mPower: 'Potencia absorbida',
    mTorque: 'Torque eje',
    mDiaS: 'Diámetro succión',
    mDiaL: 'Diámetro línea actual',
    mVIn: 'Velocidad en conexion bomba',
    mVLine: 'Velocidad en tuberia',
    mRe: 'Numero de Reynolds',
    mF: 'Factor friccion',
    mDp: 'Pérdida de carga',
    mRange: 'Rango recomendado velocidad',
    mNpsh: 'Carga neta entrada (indicador)',
    mNpshFoot: 'Patm + ρ g z − ΔP línea; NPSHa indicativa',
    mSug: 'Diametro sugerido',
    mMotor: 'Potencia motor recomendada',
  },
  en: {
    title: 'Power Input - Hydraulic Pump and Piping',
    lead: 'Advanced module for pump and hydraulic line analysis, with rule-based alerts for cavitation, head loss and an indicative safety/efficiency verdict.',
    verdictOk: 'SYSTEM SUITABLE',
    mType: 'Pump type',
    mPressure: 'Operating pressure',
    mQTheo: 'Theoretical flow',
    mQReal: 'Real flow',
    mPower: 'Absorbed power',
    mTorque: 'Shaft torque',
    mDiaS: 'Suction diameter',
    mDiaL: 'Current line diameter',
    mVIn: 'Pump inlet velocity',
    mVLine: 'Line velocity',
    mRe: 'Reynolds number',
    mF: 'Friction factor',
    mDp: 'Pressure drop',
    mRange: 'Recommended speed range',
    mNpsh: 'Net inlet head (indicator)',
    mNpshFoot: 'Patm + rho g z - line dP; indicative NPSHa',
    mSug: 'Suggested diameter',
    mMotor: 'Recommended motor power',
  },
};
function tr(k, vars = {}) {
  const lg = getLang();
  const s = (TXT[lg] && TXT[lg][k]) || TXT.es[k] || k;
  return s.replace(/\{(\w+)\}/g, (_, kk) => (vars[kk] ?? `{${kk}}`));
}

function applyStaticI18n() {
  document.documentElement.setAttribute('lang', getLang());
  if (getLang() !== 'en') return;
  document.title = 'Hydraulic Pump — TheMechAssist';
  const map = {
    Inicio: 'Home',
    Laboratorio: 'Laboratory',
    'Lienzo Pro': 'Pro canvas',
    'Bomba Hidráulica · Potencia y conducciones oleohidráulicas': 'Hydraulic pump · Power and oleohydraulic piping',
    'Desplazamiento, caudal, potencia y pérdidas en tuberías (Darcy simplificado); modos diseño/diagnóstico y alertas orientativas (cavitación, NPSH en modo proyecto).':
      'Displacement, flow, power and pipe losses (simplified Darcy); design/diagnostic modes and guidance alerts (cavitation, NPSH in project mode).',
    'Cómo obtener datos clave:': 'How to obtain key data:',
    '1) Bomba hidráulica — corte esquemático': '1) Hydraulic pump — schematic cross-section',
    '2) Conducciones — mapa de pérdida de carga': '2) Piping — head loss map',
    'Nivel de detalle memoria': 'Memory detail level',
    'Aula (básico)': 'Classroom (basic)',
    'Proyecto (NPSH + cota depósito)': 'Project (NPSH + tank elevation)',
    'Pro · Avanzado': 'Pro · Advanced',
    'Memoria y PDF ampliados en modo Proyecto': 'Expanded memory and PDF in Project mode',
    'Proyecto incluye cota del depósito sobre la bomba, NPSHr de placa y trazabilidad de NPSHa indicativa.':
      'Project mode includes tank elevation above the pump, nameplate NPSHr and indicative NPSHa traceability.',
    '¿Qué quiere calcular?': 'What do you want to calculate?',
    'Diseñar nueva máquina': 'Design new machine',
    'Diagnosticar máquina existente': 'Diagnose existing machine',
    'Modo objetivo del cálculo': 'Calculation objective mode',
    'Diseño: objetivo de rendimiento y verificación integral. Diagnóstico: se calcula caudal real desde desplazamiento y RPM.':
      'Design: performance target and full verification. Diagnostic: real flow from displacement and RPM.',
    '① Bomba hidráulica': '① Hydraulic pump',
    'Presión de trabajo, RPM, desplazamiento, tipo de bomba y diámetro de succión a la bomba.':
      'Working pressure, RPM, displacement, pump type and suction diameter at the pump.',
    'Tipo de bomba': 'Pump type',
    'Engranajes': 'Gear',
    Paletas: 'Vane',
    Pistones: 'Piston',
    'Define rendimiento y límite de presión': 'Sets efficiency and pressure limit',
    'Cada tecnología tiene eficiencia volumétrica y mecánica y rango de presión distintos para la evaluación de seguridad.':
      'Each technology has distinct volumetric and mechanical efficiency and pressure range for safety evaluation.',
    'Unidad de presión': 'Pressure unit',
    'Presión de trabajo': 'Working pressure',
    'Presión efectiva de operación': 'Effective operating pressure',
    'Indicador respecto al rango típico del tipo de bomba seleccionado (orientativo).':
      'Indicator vs typical range for the selected pump type (guidance only).',
    'Se usa para potencia hidráulica, potencia absorbida y validación contra límites típicos de la tecnología seleccionada.':
      'Used for hydraulic power, absorbed power and checks against typical limits of the selected technology.',
    'RPM motor': 'Motor RPM',
    'Velocidad del eje primario': 'Primary shaft speed',
    'Con el desplazamiento define el caudal teórico de bomba y el par requerido en el eje.':
      'Together with displacement, defines theoretical pump flow and required shaft torque.',
    'Desplazamiento (cm³/rev)': 'Displacement (cm³/rev)',
    'Volumen por vuelta': 'Volume per revolution',
    'Determina el caudal teórico Qteo = D×n; el caudal real incorpora eficiencia volumétrica.':
      'Defines theoretical flow Qₜₑₒ = D×n; real flow includes volumetric efficiency.',
    'Diámetro de succión a bomba': 'Suction diameter at pump',
    pulgadas: 'inches',
    'Crítico para cavitación en succión': 'Critical for suction cavitation',
    'El mismo selector de unidad aplica al diámetro de tubería en el bloque de conducciones.':
      'The same unit selector applies to line diameter in the piping block.',
    'Actualizar bomba y resultados': 'Update pump and results',
    '② Conducciones — mapa de pérdida de carga': '② Piping — head loss map',
    'Tipo de línea, caudal en conducción, viscosidad, longitud, diámetro interior, codos y válvulas.':
      'Line type, line flow, viscosity, length, inner diameter, elbows and valves.',
    'Tipo de línea': 'Line type',
    Succión: 'Suction',
    Presión: 'Pressure',
    Retorno: 'Return',
    'Cambia rango recomendado de velocidad': 'Changes recommended speed range',
    'Seleccione el tramo que dimensiona. Umbrales de alerta: succión ≤ 1 m/s (cavitación), presión ≤ 4 m/s (ISO 4413), retorno 2–4 m/s.':
      'Select the line being sized. Alert thresholds: suction ≤ 1 m/s (cavitation), pressure ≤ 4 m/s (ISO 4413), return 2–4 m/s.',
    'Diámetro interior del tramo indicado en «Tipo de línea». Orientación ISO 4413: presión ≤ 4 m/s; succión ≤ 1 m/s (cavitación); retorno 2–4 m/s. Las alertas aplican el umbral del tipo elegido.':
      'Inner bore for the selected line type. ISO 4413 guidance: pressure ≤ 4 m/s; suction ≤ 1 m/s to limit cavitation; return typically 2–4 m/s.',
    'Cambia rango recomendado de velocidad y umbrales de alerta':
      'Updates recommended velocity band and alert thresholds',
    'Caudal (L/min)': 'Flow (L/min)',
    'Caudal en conducción': 'Flow in line',
    'Con diámetro interior permite obtener velocidad de fluido y número de Reynolds para la clasificación del flujo.':
      'With inner diameter, yields fluid velocity and Reynolds number for flow classification.',
    'Viscosidad cinemática (cSt)': 'Kinematic viscosity (cSt)',
    'Afecta Reynolds y fricción': 'Affects Reynolds and friction',
    'Se convierte a m²/s para calcular Reynolds y el factor de fricción en Darcy-Weisbach.':
      'Converted to m²/s to compute Reynolds and the Darcy–Weisbach friction factor.',
    'Aceite ISO VG': 'ISO VG oil',
    'ν a 40 °C (cSt)': 'ν at 40 °C (cSt)',
    'Uso típico': 'Typical use',
    'Sistemas de alta velocidad': 'High-speed systems',
    'Uso general industrial': 'General industrial use',
    'Sistemas de alta presión': 'High-pressure systems',
    'Temperatura elevada / exterior': 'High temperature / outdoor',
    'Longitud de línea (m)': 'Line length (m)',
    'Pérdida lineal principal': 'Main linear head loss',
    'Incrementa la pérdida de carga proporcionalmente en el término f·(L/D) de Darcy-Weisbach.':
      'Increases head loss proportionally in the Darcy–Weisbach f·(L/D) term.',
    'Diámetro interior actual': 'Current inner diameter',
    'Variable clave de optimización': 'Key optimization variable',
    'Use nomenclatura hidráulica en pulgadas nominales; con el conmutador mm se muestran equivalentes comunes.':
      'Use nominal hydraulic inches; the mm switch shows common metric equivalents.',
    'Número de codos': 'Number of elbows',
    'Pérdidas menores por cambios de dirección': 'Minor losses from direction changes',
    'Cada codo añade pérdidas singulares al balance de energía, aumentando la caída de presión total.':
      'Each elbow adds singular losses to the energy balance, increasing total pressure drop.',
    'Número de válvulas': 'Number of valves',
    'Pérdidas menores localizadas': 'Localized minor losses',
    'Se suman como coeficientes K para calcular pérdida localizada adicional en la línea.':
      'Summed as K coefficients for additional localized line loss.',
    'Actualizar conducciones y resultados': 'Update piping and results',
    'Memoria de cálculo, fórmulas y supuestos': 'Calculation memory, formulas and assumptions',
    'SISTEMA APTO': 'SYSTEM SUITABLE',
    'Cota líquido sobre entrada bomba z (m)': 'Liquid level above pump inlet z (m)',
    'Positivo si el nivel está por encima': 'Positive if level is above',
    'NPSHr bomba (m) — placa': 'Pump NPSHr (m) — nameplate',
    '0 si no se conoce': '0 if unknown',
    'Temperatura aceite (°C)': 'Oil temperature (°C)',
    'Modo proyecto: rho y Pv(T) aproximados para NPSHa; no sustituyen ficha ISO VG del aceite.':
      'Project mode: approximate rho and Pv(T) for NPSHa; they do not replace the oil ISO VG datasheet.',
  };
  document.querySelectorAll(
    'label, span.hint, p.lab-field-help, p.lab-diagram-wrap__title, h2, p.lab-lead, h3, p.hp-block__sub, nav a, option, #hpVerdict, .hp-vg-table th, .hp-vg-table td, summary, button.hp-dia-unit__btn',
  ).forEach((el) => {
    const raw = (el.textContent || '').trim();
    if (map[raw]) el.textContent = map[raw];
  });
  const infoBody = document.querySelector('.lab-alert--info .lab-alert__body');
  if (infoBody) {
    infoBody.innerHTML =
      '<strong>How to obtain key data:</strong> <strong>Kinematic viscosity (cSt)</strong> comes from the oil datasheet (typically at 40 °C and 100 °C, ISO VG), and '
      + '<strong>displacement (cm³/rev)</strong> is on the pump nameplate or datasheet. If missing, estimate with <strong>D = (Q×1000)/n</strong>.';
  }
  const hpDiag = document.getElementById('hpDiagram');
  if (hpDiag) hpDiag.setAttribute('aria-label', 'Hydraulic pump schematic cross-section by pump type');
  const pipeDiag = document.getElementById('hpPipeDiagram');
  if (pipeDiag) pipeDiag.setAttribute('aria-label', 'Piping diagram with head-loss gradient');
  const hpMeth = document.getElementById('hpMethodologyLead');
  if (hpMeth) {
    hpMeth.innerHTML =
      'Advanced module for pump and hydraulic line analysis, with <strong>rule-based alerts</strong> for cavitation, head loss and an indicative safety and efficiency verdict. '
      + 'Standard fluid: mineral hydraulic oil ISO VG 32–68; kinematic viscosity ν is entered manually (VG table). In <strong>project mode</strong>, ρ and Pv use an indicative trend vs. temperature for that oil only. For other fluids, choose Other and enter ρ and ν. NPSHa is <strong>indicative</strong> — confirm with pump and fluid datasheets.';
  }
}

const RHO_OIL = 860; // kg/m3
const G = 9.81; // m/s2
const PIPE_EPS = 0.000045; // m (acero comercial)
const DIA_STD_MM = [12, 16, 20, 25, 32, 40, 50, 65, 80, 100];
const P_ATM_BAR = 1.013;
/** Valor fijo modo aula (bar abs.); en modo proyecto se usa tendencia Pv(T) orientativa. */
const P_VAP_BAR = 0.01;

/** Densidad indicativa aceite mineral vs T (kg/m³); solo orientación, no ficha de fluido. */
function hydraulicOilDensityKgM3(tempC) {
  const t = Math.max(-10, Math.min(150, tempC));
  return Math.max(820, Math.min(900, 875 - 0.62 * (t - 40)));
}

/** Presión de vapor indicativa (bar abs.) para debate NPSH; no sustituye datos del fabricante del aceite. */
function hydraulicOilVaporPressureBar(tempC) {
  const t = Math.max(-10, Math.min(150, tempC));
  const pv = 9e-6 * Math.exp(0.034 * (t - 25));
  return Math.min(0.055, Math.max(5e-6, pv));
}

/**
 * Rangos orientativos: presión típica / máxima (bar) por tecnología.
 * @param {'gear'|'vane'|'piston'} type
 */
function getPumpPreset(type) {
  if (type === 'piston') {
    return { etaV: 0.95, etaM: 0.91, typicalPressureBar: 350, maxPressureBar: 420, label: 'Pistones', key: 'piston' };
  }
  if (type === 'vane') {
    return { etaV: 0.92, etaM: 0.88, typicalPressureBar: 160, maxPressureBar: 200, label: 'Paletas', key: 'vane' };
  }
  return { etaV: 0.9, etaM: 0.85, typicalPressureBar: 200, maxPressureBar: 250, label: 'Engranajes', key: 'gear' };
}

/** mm nominales frecuentes para etiquetado del desplegable (cálculo sigue en pulgadas × 25,4 salvo mapa). */
const NOMINAL_INCH_TO_MM = new Map([
  [0.5, 12.7],
  [0.75, 19.1],
  [1, 25.4],
  [1.25, 31.8],
  [1.5, 38.1],
  [2, 50.8],
  [2.5, 63.5],
  [3, 76.2],
]);

function displayMmForInchNominal(inch) {
  if (NOMINAL_INCH_TO_MM.has(inch)) return NOMINAL_INCH_TO_MM.get(inch);
  return inch * 25.4;
}

let diaUnitHp = 'in';

function ensureHpDiaOptionInchLabelsCached() {
  document.querySelectorAll('select.hp-dia-select').forEach((sel) => {
    if (!(sel instanceof HTMLSelectElement)) return;
    Array.from(sel.options).forEach((opt) => {
      if (!opt.dataset.inLabel) opt.dataset.inLabel = opt.textContent.trim();
    });
  });
}

function rebuildHpDiaSelectLabels(unit) {
  ensureHpDiaOptionInchLabelsCached();
  diaUnitHp = unit === 'mm' ? 'mm' : 'in';
  document.querySelectorAll('select.hp-dia-select').forEach((sel) => {
    if (!(sel instanceof HTMLSelectElement)) return;
    Array.from(sel.options).forEach((opt) => {
      const inch = parseFloat(opt.value);
      const mm = displayMmForInchNominal(inch);
      opt.textContent = unit === 'mm' ? `${fmt(mm, 1)} mm` : (opt.dataset.inLabel || '');
    });
  });
  const bIn = document.getElementById('hpDiaUnitIn');
  const bMm = document.getElementById('hpDiaUnitMm');
  if (bIn) bIn.classList.toggle('hp-dia-unit__btn--active', unit === 'in');
  if (bMm) bMm.classList.toggle('hp-dia-unit__btn--active', unit === 'mm');
}

function mountHpDiaUnitToggle() {
  const bIn = document.getElementById('hpDiaUnitIn');
  const bMm = document.getElementById('hpDiaUnitMm');
  if (!(bIn instanceof HTMLButtonElement) || !(bMm instanceof HTMLButtonElement)) return;
  const onUnit = (u) => {
    rebuildHpDiaSelectLabels(u);
  };
  bIn.addEventListener('click', () => onUnit('in'));
  bMm.addEventListener('click', () => onUnit('mm'));
  rebuildHpDiaSelectLabels('in');
}

function updateHpPressureZoneEl(pBar, preset) {
  const el = document.getElementById('hpPressureZone');
  if (!(el instanceof HTMLElement)) return;
  const typ = preset.typicalPressureBar;
  const max = preset.maxPressureBar;
  const lab = preset.label;
  if (pBar > max) {
    el.className = 'hp-pressure-zone hp-pressure-zone--red';
    el.textContent = getLang() === 'en'
      ? `Pressure above typical maximum for ${lab} (~${max} bar). Risk of overload / life reduction.`
      : `Presión por encima del máximo orientativo para ${lab} (~${max} bar). Riesgo de sobrecarga / reducción de vida útil.`;
  } else if (pBar > typ) {
    el.className = 'hp-pressure-zone hp-pressure-zone--yellow';
    el.textContent = getLang() === 'en'
      ? `Near limit: above typical ${typ} bar for ${lab}, still within ~${max} bar indicative band.`
      : `Próximo al límite: por encima de lo típico (${typ} bar) para ${lab}, aún dentro de la banda orientativa (~${max} bar máx.).`;
  } else {
    el.className = 'hp-pressure-zone hp-pressure-zone--green';
    el.textContent = getLang() === 'en'
      ? `Within typical range for ${lab} (up to ~${typ} bar working pressure).`
      : `Dentro del rango típico para ${lab} (hasta ~${typ} bar de trabajo orientativo).`;
  }
}

function val(id, fallback = '') {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLSelectElement)) return fallback;
  return el.value || fallback;
}

function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '--';
}

function psiToBar(psi) {
  return psi * 0.0689476;
}

function barToPsi(bar) {
  return bar * 14.5038;
}

function inToMm(inch) {
  return inch * 25.4;
}

function mmToIn(mm) {
  return mm / 25.4;
}

function kwToHp(kw) {
  return kw / 0.7457;
}

/** @param {'suction'|'pressure'|'return'|string} lineType */
function targetSpeedForLine(lineType) {
  if (lineType === 'suction') return { min: 0.5, max: 1.0, target: 0.8 };
  if (lineType === 'return') return { min: 2.0, max: 4.0, target: 3.0 };
  return { min: 2.0, max: 4.0, target: 3.0 };
}

const HPUMP_ALERT_ES = {
  alertPressureVelocity:
    'Velocidad en línea de presión superior a 4 m/s. Riesgo de erosión y ruido. Verificar diámetro de tubería (ISO 4413: ≤ 4 m/s).',
  alertSuctionVelocity:
    'Velocidad en aspiración superior a 1 m/s. Alto riesgo de cavitación. Aumentar diámetro de tubería de succión.',
};

function hpumpAlert(key) {
  if (getLang() === 'en') return HYDRAULIC_PUMP_EN[`hpump.${key}`] || '';
  return HPUMP_ALERT_ES[key] || '';
}

function flowRegime(re) {
  if (re < 2300) return 'Laminar';
  if (re <= 4000) return 'Transicional';
  return 'Turbulento';
}

function frictionFactor(re, dM) {
  if (re <= 0 || dM <= 0) return NaN;
  if (re < 2300) return 64 / re;
  const fTurb = 0.25 / Math.pow(Math.log10(PIPE_EPS / (3.7 * dM) + 5.74 / Math.pow(re, 0.9)), 2);
  if (re > 4000) return fTurb;
  const fLam = 64 / 2300;
  const w = (re - 2300) / (4000 - 2300);
  return fLam * (1 - w) + fTurb * w;
}

function scheduleSuggestion(dMm, pBarWork, lineType) {
  const dM = dMm / 1000;
  const sigmaAllow = 120e6; // Pa
  const pPa = (pBarWork * 4) * 1e5;
  const tM = (pPa * dM) / (2 * sigmaAllow);
  const tMm = Math.max(1.5, tM * 1000);

  if (lineType !== 'pressure') {
    if (tMm <= 3.6) return { tMm, sch: 'Sch 40' };
    return { tMm, sch: 'Sch 80' };
  }
  if (pBarWork > 250) return { tMm, sch: 'XXS' };
  if (pBarWork > 150) return { tMm, sch: 'Sch 160' };
  if (tMm <= 2.8) return { tMm, sch: 'Sch 40' };
  if (tMm <= 3.8) return { tMm, sch: 'Sch 80' };
  return { tMm, sch: 'Sch 160' };
}

function commercialDiameterForTargetSpeed(qLmin, targetV) {
  const qM3s = qLmin / 60000;
  let best = DIA_STD_MM[0];
  let bestErr = Infinity;
  DIA_STD_MM.forEach((d) => {
    const a = (Math.PI * Math.pow(d / 1000, 2)) / 4;
    const v = qM3s / a;
    const err = Math.abs(v - targetV);
    if (err < bestErr) {
      bestErr = err;
      best = d;
    }
  });
  return best;
}

function nearestMotorSizeKw(requiredKw) {
  const std = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110];
  for (let i = 0; i < std.length; i += 1) {
    if (std[i] >= requiredKw) return std[i];
  }
  return std[std.length - 1];
}

/**
 * @param {SVGElement | null} svg
 * @param {'gear'|'vane'|'piston'} pumpType
 */
function renderPumpDiagram(svg, pumpType) {
  if (!(svg instanceof SVGElement)) return;
  const t = pumpType === 'vane' || pumpType === 'piston' ? pumpType : 'gear';
  const titleGear = getLang() === 'en' ? 'External gear pump — functional section' : 'Bomba de engranajes externos — corte funcional';
  const titleVane = getLang() === 'en' ? 'Vane pump — rotor and sliding vanes (schematic)' : 'Bomba de paletas — rotor y paletas deslizantes (esquemático)';
  const titlePiston = getLang() === 'en' ? 'Radial piston pump — cylinders (schematic)' : 'Bomba de pistones radiales — cilindros (esquemático)';
  const title = t === 'vane' ? titleVane : t === 'piston' ? titlePiston : titleGear;
  const lblIn = getLang() === 'en' ? 'Suction' : 'Succión';
  const lblOut = getLang() === 'en' ? 'Discharge' : 'Descarga';

  const bodyGear = `
    <rect x="90" y="110" width="600" height="120" rx="60" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <circle cx="300" cy="170" r="52" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
    <circle cx="430" cy="170" r="52" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
    <circle cx="300" cy="170" r="12" fill="#334155"/>
    <circle cx="430" cy="170" r="12" fill="#334155"/>
    <path d="M248 118 L248 222 M352 118 L352 222 M378 118 L378 222 M482 118 L482 222" stroke="#94a3b8" stroke-width="2"/>
    <path d="M110 170 L200 170" stroke="#0d9488" stroke-width="3" marker-end="url(#hpArrow)"/>
    <path d="M215 118 Q300 82 385 118" stroke="#0d9488" stroke-width="3" fill="none" marker-end="url(#hpArrow)"/>
    <path d="M515 222 Q610 248 675 170" stroke="#0d9488" stroke-width="3" fill="none" marker-end="url(#hpArrow)"/>`;

  const bodyVane = `
    <ellipse cx="390" cy="170" rx="220" ry="95" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5"/>
    <circle cx="390" cy="170" r="38" fill="#bae6fd" stroke="#0c4a6e" stroke-width="2"/>
    <circle cx="390" cy="170" r="10" fill="#0f172a"/>
    <g stroke="#0ea5e9" stroke-width="3" stroke-linecap="round">
      <line x1="390" y1="170" x2="520" y2="125"/>
      <line x1="390" y1="170" x2="505" y2="195"/>
      <line x1="390" y1="170" x2="450" y2="235"/>
      <line x1="390" y1="170" x2="330" y2="235"/>
      <line x1="390" y1="170" x2="275" y2="195"/>
      <line x1="390" y1="170" x2="260" y2="125"/>
    </g>
    <path d="M95 170 H230" stroke="#0d9488" stroke-width="3" marker-end="url(#hpArrow)"/>
    <path d="M555 170 H685" stroke="#0d9488" stroke-width="3" marker-end="url(#hpArrow)"/>`;

  const bodyPiston = `
    <circle cx="390" cy="170" r="105" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
    <circle cx="390" cy="170" r="28" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
    <circle cx="390" cy="170" r="8" fill="#0f172a"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 390 + Math.cos(rad) * 72;
        const cy = 170 + Math.sin(rad) * 72;
        return `<rect x="${cx - 10}" y="${cy - 22}" width="20" height="44" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="1.5" transform="rotate(${deg + 90} ${cx} ${cy})"/>`;
      })
      .join('')}
    <path d="M95 170 H250" stroke="#0d9488" stroke-width="3" marker-end="url(#hpArrow)"/>
    <path d="M530 170 H685" stroke="#0d9488" stroke-width="3" marker-end="url(#hpArrow)"/>`;

  const body = t === 'vane' ? bodyVane : t === 'piston' ? bodyPiston : bodyGear;

  svg.setAttribute('viewBox', '0 0 780 320');
  svg.innerHTML = `
    <defs>
      <marker id="hpArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0d9488"/>
      </marker>
    </defs>
    <rect width="780" height="320" fill="#f4f7fb"/>
    <rect x="30" y="40" width="720" height="230" rx="14" fill="#fafbfc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="50" y="66" font-size="13" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">${title}</text>
    ${body}
    <text x="95" y="98" class="fluid-svg-lbl" font-size="10" fill="#475569" font-family="Inter,system-ui,sans-serif">${lblIn}</text>
    <text x="685" y="98" class="fluid-svg-lbl" font-size="10" fill="#475569" font-family="Inter,system-ui,sans-serif" text-anchor="end">${lblOut}</text>
  `;
}

function colorFromDrop(dpBar) {
  const t = Math.max(0, Math.min(1, dpBar / 6));
  const r = Math.round(30 + 210 * t);
  const g = Math.round(220 - 150 * t);
  return `rgb(${r},${g},70)`;
}

function renderPipeDiagram(svg, dpBar) {
  if (!(svg instanceof SVGElement)) return;
  const c = colorFromDrop(dpBar);
  svg.setAttribute('viewBox', '0 0 780 220');
  svg.innerHTML = `
    <defs>
      <marker id="pipeArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="${c}"/>
      </marker>
    </defs>
    <rect width="780" height="220" fill="#f4f7fb"/>
    <rect x="40" y="32" width="700" height="156" rx="12" fill="#fafbfc" stroke="#e2e8f0" stroke-width="1"/>
    <path d="M90 110 H260 V70 H520 V145 H690" fill="none" stroke="${c}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M90 110 H260 V70 H520 V145 H690" fill="none" stroke="#334155" stroke-width="2.5" stroke-dasharray="12 8"/>
    <text x="52" y="54" class="fluid-svg-lbl" font-size="10" fill="#475569" font-family="Inter,system-ui,sans-serif">${getLang() === 'en' ? 'Flow line' : 'Línea de flujo'}</text>
    <text x="728" y="178" class="fluid-svg-lbl" font-size="11" font-weight="800" fill="${c}" font-family="Inter,system-ui,sans-serif" text-anchor="end">Δp = ${fmt(dpBar, 2)} bar</text>
  `;
}

function metric(label, value, unit = '', valueClass = '', valueTitle = '') {
  return `
    <article class="lab-metric">
      <div class="k">${label}</div>
      <div class="v ${valueClass}" ${valueTitle ? `title="${valueTitle}"` : ''}>${value}</div>
      ${unit ? `<div class="lab-metric__si">${unit}</div>` : ''}
    </article>
  `;
}

function reynoldsVisual(re) {
  if (re < 2000) return { cls: 'hp-re-laminar', title: 'Flujo laminar: ideal para minimizar espuma y calentamiento del aceite.' };
  if (re <= 4000) return { cls: 'hp-re-transitional', title: 'Flujo transicional: zona intermedia; revisar pérdidas y estabilidad.' };
  return { cls: 'hp-re-turbulent', title: 'Flujo turbulento: mayor cizalla, pérdidas y calentamiento del aceite.' };
}

function syncDiametersSuggestion() {
  const suctionEl = document.getElementById('hpSuctionIn');
  const pipeEl = document.getElementById('pipeDiaIn');
  if (!(suctionEl instanceof HTMLSelectElement) || !(pipeEl instanceof HTMLSelectElement)) return;
  const s = Number(suctionEl.value);
  const p = Number(pipeEl.value);
  if (!Number.isFinite(s) || !Number.isFinite(p)) return;
  if (p < s) pipeEl.value = suctionEl.value;
}

/** @param {{ cavitationOk: boolean, pressureOk: boolean, velocityOk: boolean, motorRec: number, motorStd: number }} opts */
function renderHpVerdictSummary(opts) {
  const el = document.getElementById('hpVerdictSummary');
  if (!(el instanceof HTMLElement)) return;
  const en = getLang() === 'en';
  const row = (ok, label, sub) =>
    `<div class="hc-vs-item ${ok ? 'hc-vs-item--ok' : 'hc-vs-item--bad'}">
      <span class="hc-vs-ico" aria-hidden="true">${ok ? '\u2713' : '\u2717'}</span>
      <div><div class="hc-vs-label">${label}</div><div class="hc-vs-sub">${sub}</div></div>
    </div>`;
  const title = en ? HYDRAULIC_PUMP_EN['hpump.vsTitle'] : 'Resumen de comprobaciones';
  const cavL = en ? HYDRAULIC_PUMP_EN['hpump.vsCavitation'] : 'Cavitaci\u00f3n / entrada';
  const cavOk = en ? HYDRAULIC_PUMP_EN['hpump.vsCavitationOk'] : 'Margen de entrada aceptable para este modelo.';
  const cavBad = en ? HYDRAULIC_PUMP_EN['hpump.vsCavitationBad'] : 'Riesgo alto de cavitaci\u00f3n \u2014 revise succi\u00f3n y NPSH.';
  const presL = en ? HYDRAULIC_PUMP_EN['hpump.vsPressure'] : 'Presi\u00f3n de trabajo';
  const presOk = en ? HYDRAULIC_PUMP_EN['hpump.vsPressureOk'] : 'Dentro del l\u00edmite orientativo del tipo de bomba.';
  const presBad = en ? HYDRAULIC_PUMP_EN['hpump.vsPressureBad'] : 'Presi\u00f3n supera el l\u00edmite orientativo de la tecnolog\u00eda.';
  const velL = en ? HYDRAULIC_PUMP_EN['hpump.vsVelocity'] : 'Velocidad de l\u00ednea';
  const velOk = en ? HYDRAULIC_PUMP_EN['hpump.vsVelocityOk'] : 'Velocidad dentro de la banda recomendada.';
  const velBad = en ? HYDRAULIC_PUMP_EN['hpump.vsVelocityBad'] : 'Velocidad fuera de rango \u2014 redimensione el di\u00e1metro.';
  const motL = en ? HYDRAULIC_PUMP_EN['hpump.vsMotor'] : 'Potencia de motor';
  const motSubTpl = en ? HYDRAULIC_PUMP_EN['hpump.vsMotorSub'] : 'Recomendada {rec} kW (normalizada {std} kW).';
  const motSub = motSubTpl
    .replace('{rec}', fmt(opts.motorRec, 2))
    .replace('{std}', fmt(opts.motorStd, 1));
  el.innerHTML = `
    <div class="hc-verdict-summary__title">${title}</div>
    ${row(opts.cavitationOk, cavL, opts.cavitationOk ? cavOk : cavBad)}
    ${row(opts.pressureOk, presL, opts.pressureOk ? presOk : presBad)}
    ${row(opts.velocityOk, velL, opts.velocityOk ? velOk : velBad)}
    ${row(true, motL, motSub)}
  `;
}

function computeAndRenderCore() {
  const mode = val('hpMode', 'design');
  const type = val('hpType', 'gear');
  const pUnit = val('hpPressureUnit', 'bar');
  const pMaxGauge = pUnit === 'psi' ? 20000 : 600;

  const results = document.getElementById('hpResults');
  const advisor = document.getElementById('hpAdvisor');
  const verdict = document.getElementById('hpVerdict');
  const formulaBody = document.getElementById('hpFormulaBody');
  if (!(results instanceof HTMLElement) || !(advisor instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  pumpPdfSnapshot = { valid: false };

  const errLabel = (es, en) => (getLang() === 'en' ? en : es);
  const errors = [];
  const need = (r) => {
    if (!r.ok) errors.push(r.error);
    return r.ok ? r.value : NaN;
  };

  const pressureInput = need(readLabNumber('hpPressure', 1, pMaxGauge, errLabel('Presión de trabajo', 'Working pressure')));
  const rpm = need(readLabNumber('hpRpm', 100, 12000, errLabel('RPM motor', 'Motor RPM')));
  const disp = need(readLabNumber('hpDispCm3Rev', 0.1, 5000, errLabel('Desplazamiento (cm³/rev)', 'Displacement (cm³/rev)')));
  const suctionIn = need(readLabNumber('hpSuctionIn', 0.125, 24, errLabel('Diámetro de succión (in)', 'Suction diameter (in)')));
  const fluidType = val('hpFluidType', 'mineral_vg');
  const pipeLineType = val('pipeLineType', 'suction');
  let pipeFlowLminIn = 42;
  if (mode === 'design') {
    pipeFlowLminIn = need(readLabNumber('pipeFlowLmin', 0.1, 1e6, errLabel('Caudal línea (L/min)', 'Line flow (L/min)')));
  } else {
    const pf = readLabNumber('pipeFlowLmin', 0.1, 1e6, errLabel('Caudal línea (L/min)', 'Line flow (L/min)'));
    if (pf.ok) pipeFlowLminIn = pf.value;
  }
  let fluidRhoKgM3 = RHO_OIL;
  if (fluidType === 'custom') {
    fluidRhoKgM3 = need(
      readLabNumber('hpFluidRho', 500, 1400, errLabel('Densidad ρ (kg/m³)', 'Density ρ (kg/m³)')),
    );
  }
  const viscCst = need(readLabNumber('pipeViscCst', 0.5, 5000, errLabel('Viscosidad cinemática (cSt)', 'Kinematic viscosity (cSt)')));
  const lineLength = need(readLabNumber('pipeLengthM', 0.1, 5000, errLabel('Longitud de línea (m)', 'Line length (m)')));
  const pipeDiaIn = need(readLabNumber('pipeDiaIn', 0.125, 48, errLabel('Diámetro interior tubería (in)', 'Pipe inner diameter (in)')));
  const elbows = need(readLabNumber('pipeElbows', 0, 500, errLabel('Número de codos', 'Number of elbows')));
  const valves = need(readLabNumber('pipeValves', 0, 500, errLabel('Número de válvulas', 'Number of valves')));

  const labTierHp = document.getElementById('hpLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hpLabTier').value
    : 'basic';
  let tankZM = 0;
  let npshrM = 0;
  let oilTempCHp = 46;
  if (labTierHp === 'project') {
    const zt = readLabNumber('hpTankZ_m', -50, 100, errLabel('Cota depósito z (m)', 'Tank head z (m)'));
    if (!zt.ok) errors.push(zt.error);
    else tankZM = zt.value;
    const nr = readLabNumber('hpNPSHr_m', 0, 80, errLabel('NPSHr bomba (m)', 'Pump NPSHr (m)'));
    if (!nr.ok) errors.push(nr.error);
    else npshrM = nr.value;
    const ot = readLabNumber('hpOilTempC', -20, 150, errLabel('Temperatura aceite (C)', 'Oil temperature (C)'));
    if (!ot.ok) errors.push(ot.error);
    else oilTempCHp = ot.value;
  }

  if (errors.length) {
    results.innerHTML = '';
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    const vsErr = document.getElementById('hpVerdictSummary');
    if (vsErr instanceof HTMLElement) vsErr.innerHTML = '';
    const pz = document.getElementById('hpPressureZone');
    if (pz instanceof HTMLElement) {
      pz.textContent = '';
      pz.className = 'hp-pressure-zone';
    }
    const title = getLang() === 'en' ? 'Invalid input' : 'Entrada no válida';
    const vtext = getLang() === 'en' ? 'Please correct the form values.' : 'Revise los valores del formulario.';
    advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${title}:</strong><ul style="margin:0.4em 0 0 1.1em;padding:0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul></div></div>`;
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = vtext;
    return;
  }

  const suctionMm = inToMm(suctionIn);
  const pipeDiaMm = inToMm(pipeDiaIn);
  const preset = getPumpPreset(type);

  const rhoOil =
    fluidType === 'custom'
      ? fluidRhoKgM3
      : labTierHp === 'project'
        ? hydraulicOilDensityKgM3(oilTempCHp)
        : RHO_OIL;
  const pvBar = labTierHp === 'project' ? hydraulicOilVaporPressureBar(oilTempCHp) : P_VAP_BAR;
  const pvPa = pvBar * 1e5;

  const pBar = pUnit === 'psi' ? psiToBar(pressureInput) : pressureInput;
  const pPsi = barToPsi(pBar);

  const qTheoLmin = (disp * rpm) / 1000;
  const qRealLmin = qTheoLmin * preset.etaV;
  const pHydKw = (pBar * qRealLmin) / 600;
  const pAbsKw = pHydKw / (preset.etaV * preset.etaM);
  const pAbsHp = pAbsKw * 1.34102;
  const torqueNm = (9550 * pAbsKw) / rpm;

  const qSuctionM3s = qRealLmin / 60000;
  const areaSuction = (Math.PI * Math.pow(suctionMm / 1000, 2)) / 4;
  const vSuction = qSuctionM3s / areaSuction;
  const pressureRisk = pBar > preset.maxPressureBar;
  updateHpPressureZoneEl(pBar, preset);

  const qPipeLmin = mode === 'diagnostic' ? qRealLmin : pipeFlowLminIn;
  const flowInput = document.getElementById('pipeFlowLmin');
  if (mode === 'diagnostic' && flowInput instanceof HTMLInputElement) {
    flowInput.value = fmt(qRealLmin, 2);
  }
  const qPipeM3s = qPipeLmin / 60000;
  const dPipeM = pipeDiaMm / 1000;
  const areaPipe = (Math.PI * Math.pow(dPipeM, 2)) / 4;
  const vPipe = qPipeM3s / areaPipe;
  const nu = viscCst * 1e-6;
  const re = (vPipe * dPipeM) / nu;
  const regime = flowRegime(re);
  const f = frictionFactor(re, dPipeM);
  const kMinor = elbows * 0.9 + valves * 6;
  const dpPa = (f * (lineLength / dPipeM) + kMinor) * ((rhoOil * vPipe * vPipe) / 2);
  const dpBar = dpPa / 1e5;
  const heatLossKw = (dpPa * qPipeM3s) / 1000;

  const speedTarget = targetSpeedForLine(pipeLineType);
  const speedOutOfRange = vPipe < speedTarget.min || vPipe > speedTarget.max;
  const dOptMm = commercialDiameterForTargetSpeed(qPipeLmin, speedTarget.target);
  const schedule = scheduleSuggestion(dOptMm, pBar, pipeLineType);
  const qOptM3s = qPipeM3s;
  const aOpt = (Math.PI * Math.pow(dOptMm / 1000, 2)) / 4;
  const vOpt = qOptM3s / aOpt;
  const reOpt = (vOpt * (dOptMm / 1000)) / nu;
  const fOpt = frictionFactor(reOpt, dOptMm / 1000);
  const dpOptPa = (fOpt * (lineLength / (dOptMm / 1000)) + kMinor) * ((rhoOil * vOpt * vOpt) / 2);
  const dpOptBar = dpOptPa / 1e5;
  const pStaticPa = P_ATM_BAR * 1e5 + rhoOil * G * tankZM;
  const pInletAbsPa = pStaticPa - dpPa;
  const pInletAbsBar = pInletAbsPa / 1e5;
  const npshaM = Math.max(0, (pInletAbsPa - pvPa) / (rhoOil * G) - (vSuction * vSuction) / (2 * G));
  const npshMarginM = npshrM > 0 ? npshaM - npshrM : NaN;
  const suctionVelElevated = vSuction > 1.0;
  const highCavitationRisk = pInletAbsBar <= pvBar || vSuction > 1.5
    || (labTierHp === 'project' && npshrM > 0 && npshaM < npshrM);
  const restrictionRisk = pipeDiaIn < suctionIn;
  const reVisual = reynoldsVisual(re);
  const pMotorRecKw = (pAbsKw / 0.9) * 1.1;
  const pMotorStdKw = nearestMotorSizeKw(pMotorRecKw);

  renderPumpDiagram(document.getElementById('hpDiagram'), type === 'vane' || type === 'piston' ? type : 'gear');
  renderPipeDiagram(document.getElementById('hpPipeDiagram'), dpBar);

  const mainCards = [
    metric(tr('mQReal'), `${fmt(qRealLmin, 2)} L/min`, `eta_v ${fmt(preset.etaV * 100, 1)} %`),
    metric(tr('mPressure'), `${fmt(pBar, 1)} bar`, `${fmt(pPsi, 0)} PSI`),
    metric(tr('mMotor'), `${fmt(pMotorRecKw, 2)} kW`, `${fmt(kwToHp(pMotorRecKw), 2)} HP`),
    metric(tr('mTorque'), `${fmt(torqueNm, 2)} N*m`),
  ].join('');

  const secondaryCards = [
    metric(tr('mType'), preset.label),
    metric(tr('mQTheo'), `${fmt(qTheoLmin, 2)} L/min`),
    metric(tr('mPower'), `${fmt(pAbsKw, 3)} kW`, `${fmt(pAbsHp, 2)} HP`),
    metric(tr('mDiaS'), `${fmt(suctionIn, 3)} in`, `(${fmt(suctionMm, 1)} mm)`),
    metric(tr('mDiaL'), `${fmt(pipeDiaIn, 3)} in`, `(${fmt(pipeDiaMm, 1)} mm)`),
    metric(tr('mVIn'), `${fmt(vSuction, 2)} m/s`),
    metric(tr('mVLine'), `${fmt(vPipe, 2)} m/s`, pipeLineType),
    metric(tr('mRe'), `${fmt(re, 0)}`, regime, reVisual.cls, reVisual.title),
    metric(tr('mF'), `${fmt(f, 4)}`),
    metric(tr('mDp'), `${fmt(dpBar, 3)} bar`, `${fmt(dpPa / 1000, 1)} kPa`),
    metric(tr('mRange'), `${fmt(speedTarget.min, 1)} - ${fmt(speedTarget.max, 1)} m/s`, pipeLineType),
    metric(
      tr('mNpsh'),
      `${fmt(npshaM, 2)} m`,
      `${tr('mNpshFoot')} | Pinlet=${fmt(pInletAbsBar, 3)} bar abs`,
      '',
      getLang() === 'en'
        ? 'Guide only: assumes atmospheric supply minus modeled line loss. Full NPSHa needs tank elevation, suction line detail, fluid temperature, and comparison with pump NPSHr.'
        : 'Solo guía: supone alimentación a Patm menos la pérdida modelada. NPSHa real requiere cota del depósito, trazado de succión, temperatura del aceite y comparación con NPSHr de la bomba.',
    ),
    metric(tr('mSug'), `${fmt(mmToIn(dOptMm), 3)} in`, `(${dOptMm} mm) - ${schedule.sch} / t~${fmt(schedule.tMm, 2)} mm`),
  ];
  if (labTierHp === 'project' && npshrM > 0) {
    secondaryCards.push(
      metric(
        getLang() === 'en' ? 'NPSH margin' : 'Margen NPSH',
        `${fmt(npshMarginM, 2)} m`,
        `NPSHa ${fmt(npshaM, 2)} - NPSHr ${fmt(npshrM, 2)}`,
      ),
    );
  }
  const secondaryCardsHtml = secondaryCards.join('');

  const formulaLinesHp = getLang() === 'en'
    ? [
        'Q_theo = displacement * rpm / 1000 L/min; Q_real = Q_theo * eta_v.',
        'P_hyd_kW = p_bar * Q_real / 600; P_shaft = P_hyd / (eta_v * eta_m).',
        'Re = v * D / nu; Darcy-Weisbach for dP with blended laminar/turbulent f.',
        `NPSHa (indicative): p_in_abs = p_atm + rho*g*z - dP_line; NPSHa = (p_in - Pv)/(rho*g) - v_s^2/(2g). z=${fmt(tankZM, 2)} m; rho=${fmt(rhoOil, 0)} kg/m3, Pv=${fmt(pvBar, 5)} bar abs (${labTierHp === 'project' ? 'approx. vs oil T' : 'classroom fixed'}).`,
        'NPSHa here is indicative only; it does not replace the manufacturer pump cavitation / NPSHr curves.',
        'Schedule suggestion uses simplified hoop stress with pressure factor; for traceability only.',
      ]
    : [
        'Q_teo = desplazamiento * rpm / 1000 L/min; Q_real = Q_teo * eta_v.',
        'P_hid_kW = p_bar * Q_real / 600; P_eje = P_hid / (eta_v * eta_m).',
        'Re = v * D / nu; Darcy-Weisbach para dP con f laminar/turbulento interpolado.',
        `NPSHa (indicativa): p_ent_abs = p_atm + rho*g*z - dP_linea; NPSHa = (p_ent - Pv)/(rho*g) - v_s^2/(2g). z=${fmt(tankZM, 2)} m; rho=${fmt(rhoOil, 0)} kg/m3, Pv=${fmt(pvBar, 5)} bar abs (${labTierHp === 'project' ? 'aprox. vs T aceite' : 'fijos en aula'}).`,
        'La NPSHa calculada es indicativa y no sustituye la curva de cavitación ni los datos NPSHr del fabricante de la bomba.',
        'Sugerencia schedule: esfuerzo aro simplificado; solo trazabilidad.',
      ];

  if (formulaBody instanceof HTMLElement) {
    formulaBody.innerHTML = `
      <p class="lab-fluid-formulas__lead">${labTierHp === 'project' ? (getLang() === 'en' ? 'Project: tank head z and NPSHr comparison enabled.' : 'Proyecto: cota z y comparación NPSHr activas.') : (getLang() === 'en' ? 'Classroom: z=0 unless project mode.' : 'Aula: z=0 salvo modo proyecto.')}</p>
      <p class="lab-fluid-formulas__sub">${getLang() === 'en' ? 'Oil temperature' : 'Temperatura aceite'}: ${fmt(oilTempCHp, 0)} °C. ${
        labTierHp === 'project'
          ? (getLang() === 'en'
            ? `Project mode: rho and Pv in NPSHa scale roughly with T (${fmt(rhoOil, 0)} kg/m³, ${fmt(pvBar, 5)} bar abs) — not a fluid datasheet.`
            : `Modo proyecto: rho y Pv en NPSHa siguen tendencia aproximada con T (${fmt(rhoOil, 0)} kg/m³, ${fmt(pvBar, 5)} bar abs) — no sustituyen ficha del aceite.`)
          : (getLang() === 'en'
            ? 'Classroom mode: rho = 860 kg/m³ and Pv = 0.01 bar abs remain fixed in NPSHa.'
            : 'Modo aula: rho = 860 kg/m³ y Pv = 0,01 bar abs fijos en NPSHa.')
      }</p>
      <ol class="lab-fluid-formulas__list">${formulaLinesHp.map((x) => `<li>${x}</li>`).join('')}</ol>
    `;
  }

  results.innerHTML = `
    ${mainCards}
    <details class="lab-results-details hp-more-details">
      <summary>${getLang() === 'en' ? 'Secondary technical data' : 'Datos tecnicos secundarios'}</summary>
      <div class="hp-more-details__body">
        <div class="lab-results">${secondaryCardsHtml}</div>
      </div>
    </details>
  `;

  const alerts = [];
  if (restrictionRisk) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Restriction detected' : 'Restricción detectada'}:</strong> ${getLang() === 'en' ? 'Reducing line diameter below pump suction dramatically increases cavitation risk.' : 'Reducir el diámetro de tubería por debajo de la succión de la bomba aumenta drásticamente el riesgo de cavitación.'}</div></div>`);
  }
  if (pipeLineType === 'pressure' && vPipe > 4) {
    alerts.push(
      `<div class="lab-alert lab-alert--warn"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Pressure line' : 'Línea de presión'}:</strong> ${hpumpAlert('alertPressureVelocity')}</div></div>`,
    );
  } else if (pipeLineType === 'suction' && vPipe > 1) {
    alerts.push(
      `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Suction line' : 'Línea de succión'}:</strong> ${hpumpAlert('alertSuctionVelocity')}</div></div>`,
    );
  }
  if (suctionVelElevated) {
    alerts.push(
      `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Pump inlet' : 'Entrada bomba'}:</strong> ${hpumpAlert('alertSuctionVelocity')}</div></div>`,
    );
  }
  if (highCavitationRisk) {
    let cavBody = getLang() === 'en'
      ? 'Pressure loss or inlet conditions reduce margin below safe limits for this model.'
      : 'La pérdida de carga o las condiciones de entrada reducen el margen por debajo de límites seguros para este modelo.';
    if (pInletAbsBar <= pvBar) {
      cavBody = getLang() === 'en'
        ? 'Absolute inlet pressure approaches vapour pressure — severe cavitation risk.'
        : 'La presión absoluta de entrada roza la presión de vapor — riesgo grave de cavitación.';
    } else if (labTierHp === 'project' && npshrM > 0 && npshaM < npshrM) {
      cavBody = getLang() === 'en'
        ? `NPSHa ${fmt(npshaM, 2)} m is below pump NPSHr ${fmt(npshrM, 2)} m.`
        : `NPSHa ${fmt(npshaM, 2)} m por debajo del NPSHr de placa ${fmt(npshrM, 2)} m.`;
    } else if (vSuction > 1.5) {
      cavBody = getLang() === 'en'
        ? `Inlet velocity ${fmt(vSuction, 2)} m/s exceeds 1.5 m/s — increase suction diameter urgently.`
        : `Velocidad de entrada ${fmt(vSuction, 2)} m/s supera 1,5 m/s — aumentar con urgencia el diámetro de succión.`;
    }
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'HIGH CAVITATION RISK' : 'RIESGO ALTO DE CAVITACIÓN'}:</strong> ${cavBody}</div></div>`);
  }
  if (pressureRisk) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Safety' : 'Seguridad'}:</strong> ${getLang() === 'en' ? `${fmt(pBar, 1)} bar exceeds typical ${preset.label.toLowerCase()} limit (${preset.maxPressureBar} bar).` : `${fmt(pBar, 1)} bar supera el límite orientativo de ${preset.label.toLowerCase()} (${preset.maxPressureBar} bar).`}</div></div>`);
  }
  const lineSpeedHigh =
    (pipeLineType === 'pressure' && vPipe > 4) || (pipeLineType === 'suction' && vPipe > 1);
  renderHpVerdictSummary({
    cavitationOk: !highCavitationRisk,
    pressureOk: !pressureRisk,
    velocityOk: !lineSpeedHigh && !suctionVelElevated && !speedOutOfRange,
    motorRec: pMotorRecKw,
    motorStd: pMotorStdKw,
  });
  if (speedOutOfRange && !lineSpeedHigh) {
    alerts.push(`<div class="lab-alert lab-alert--warn"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Line speed' : 'Velocidad de línea'}:</strong> ${getLang() === 'en' ? `${fmt(vPipe, 2)} m/s is outside recommended range for ${pipeLineType} (${fmt(speedTarget.min, 1)}–${fmt(speedTarget.max, 1)} m/s).` : `${fmt(vPipe, 2)} m/s fuera del rango recomendado para ${pipeLineType} (${fmt(speedTarget.min, 1)}–${fmt(speedTarget.max, 1)} m/s).`}</div></div>`);
  }
  if (Math.abs(pMotorStdKw - pMotorRecKw) <= 1.8 || (pMotorStdKw - pMotorRecKw) / pMotorStdKw < 0.1) {
    alerts.push(`<div class="lab-alert lab-alert--info"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Motor efficiency' : 'Eficiencia del motor'}:</strong> ${getLang() === 'en' ? `Required power ${fmt(pMotorRecKw, 2)} kW. Suggested standard commercial size: ${fmt(pMotorStdKw, 1)} kW.` : `Potencia requerida ${fmt(pMotorRecKw, 2)} kW. Tamaño comercial normalizado sugerido: ${fmt(pMotorStdKw, 1)} kW.`}</div></div>`);
  }
  alerts.push(`<div class="lab-alert lab-alert--info"><div class="lab-alert__body"><strong>Smart insight:</strong> ${getLang() === 'en' ? `Current pipe causes ${fmt(dpBar, 3)} bar loss vs ${fmt(dpOptBar, 3)} bar with ${fmt(mmToIn(dOptMm), 3)} in (${dOptMm} mm). This implies ${fmt(heatLossKw, 3)} kW avoidable hydraulic heating.` : `La tubería actual genera una pérdida de ${fmt(dpBar, 3)} bar frente a ${fmt(dpOptBar, 3)} bar con ${fmt(mmToIn(dOptMm), 3)} in (${dOptMm} mm). Esto implica ${fmt(heatLossKw, 3)} kW de calentamiento hidráulico evitable.`}</div></div>`);
  if (mode === 'diagnostic' && (rpm > 1800 || vSuction > 1.5)) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>${getLang() === 'en' ? 'Diagnostic warning' : 'Advertencia de diagnóstico'}:</strong> ${getLang() === 'en' ? 'RPM is high for this displacement. Cavitation risk increases due to excessive suction velocity.' : 'Las RPM son altas para este desplazamiento. Aumenta el riesgo de cavitación por velocidad de succión excesiva.'}</div></div>`);
  }
  if (labTierHp === 'project' && npshrM > 0 && npshaM < npshrM) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>NPSH:</strong> NPSHa ${fmt(npshaM, 2)} m &lt; NPSHr ${fmt(npshrM, 2)} m.</div></div>`);
  }
  advisor.innerHTML = alerts.join('');

  let verdictText = getLang() === 'en' ? 'SYSTEM SUITABLE' : 'SISTEMA APTO';
  let verdictClass = 'lab-verdict lab-verdict--ok';
  if (pressureRisk || highCavitationRisk || restrictionRisk || dpBar > 8) {
    verdictText = highCavitationRisk
      ? (getLang() === 'en' ? 'SYSTEM NOT SUITABLE - Critical cavitation failure risk' : 'SISTEMA NO APTO — Riesgo de fallo crítico por cavitación')
      : (getLang() === 'en' ? 'FAILURE RISK' : 'RIESGO DE FALLO');
    verdictClass = 'lab-verdict lab-verdict--err';
  } else if (speedOutOfRange || dpBar > 3 || heatLossKw > 0.8) {
    verdictText = getLang() === 'en' ? 'LOW EFFICIENCY' : 'EFICIENCIA BAJA';
    verdictClass = 'lab-verdict lab-verdict--muted';
  }

  verdict.className = verdictClass;
  verdict.textContent = getLang() === 'en'
    ? `${verdictText} - Recommended motor power: ${fmt(pMotorRecKw, 2)} kW (standardized ${fmt(pMotorStdKw, 1)} kW).`
    : `${verdictText} - Potencia de motor recomendada: ${fmt(pMotorRecKw, 2)} kW (normalizado ${fmt(pMotorStdKw, 1)} kW).`;

  const langPdf = getCurrentLang();
  const ts = formatDateTimeLocale(new Date(), langPdf);
  pumpPdfSnapshot = {
    valid: true,
    title: langPdf === 'en' ? 'Report — Hydraulic pump and piping' : 'Informe — Bomba hidráulica y tuberías',
    fileBase: `${langPdf === 'en' ? 'report-hydraulic-pump' : 'informe-bomba-hidraulica'}-${new Date().toISOString().slice(0, 10)}`,
    timestamp: ts,
    tierLabel: labTierHp === 'project' ? (langPdf === 'en' ? 'Mode: Project' : 'Modo: Proyecto') : (langPdf === 'en' ? 'Mode: Classroom' : 'Modo: Aula'),
    kpis: [
      { title: 'Q', value: `${fmt(qRealLmin, 1)} L/min`, subtitle: 'real' },
      { title: 'p', value: `${fmt(pBar, 1)} bar`, subtitle: 'work' },
      { title: 'P motor', value: `${fmt(pMotorRecKw, 2)} kW`, subtitle: 'rec.' },
      { title: 'NPSHa', value: `${fmt(npshaM, 2)} m`, subtitle: langPdf === 'en' ? 'indicative' : 'indicativa' },
    ],
    inputRows: [
      { label: 'tier', value: labTierHp },
      { label: 'z tank', value: `${fmt(tankZM, 2)} m` },
      { label: 'NPSHr', value: `${fmt(npshrM, 2)} m` },
      { label: 'p', value: `${fmt(pBar, 1)} bar` },
      { label: 'rpm', value: String(rpm) },
      { label: 'D suction', value: `${fmt(suctionIn, 3)} in` },
    ],
    resultRows: [
      { label: 'dP', value: `${fmt(dpBar, 3)} bar` },
      { label: 'Re', value: fmt(re, 0) },
      { label: 'Pin abs', value: `${fmt(pInletAbsBar, 3)} bar` },
    ],
    formulaLines: formulaLinesHp,
    assumptions: [
      `rho=${fmt(rhoOil, 0)} kg/m3, Patm=${P_ATM_BAR} bar, Pv=${fmt(pvBar, 5)} bar (${labTierHp === 'project' ? 'approx vs T' : 'fixed classroom'}).`,
      langPdf === 'en' ? 'Line dP model is 1-D Darcy + K losses.' : 'Modelo ΔP: Darcy 1D + pérdidas K.',
      langPdf === 'en'
        ? 'NPSHa in this report is indicative and does not replace manufacturer cavitation / NPSHr curves.'
        : 'La NPSHa de este informe es indicativa y no sustituye las curvas de cavitación / NPSHr del fabricante.',
    ],
    verdict: verdict.textContent,
    disclaimer: langPdf === 'en'
      ? 'NPSHa is indicative; use manufacturer NPSHr curves and site layout for final acceptance.'
      : 'NPSHa es indicativa; usar curvas NPSHr del fabricante y trazado real para aceptación final.',
  };
}

function syncHpLabTierUi() {
  const tier = document.getElementById('hpLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hpLabTier').value
    : 'basic';
  const panel = document.getElementById('hpProjectPanel');
  if (panel instanceof HTMLElement) panel.hidden = tier !== 'project';
  const badge = document.getElementById('hpProjectBadge');
  if (badge instanceof HTMLElement) {
    badge.classList.toggle('hp-tier-badge--active', tier === 'project');
  }
}

function syncHpFluidFieldsUi() {
  const sel = document.getElementById('hpFluidType');
  const rhoRow = document.getElementById('hpFluidRhoRow');
  if (!(sel instanceof HTMLSelectElement) || !(rhoRow instanceof HTMLElement)) return;
  rhoRow.hidden = sel.value !== 'custom';
}

function syncPumpModeUi() {
  const mode = val('hpMode', 'design');
  const flowField = document.getElementById('pipeFlowField');
  const flowInput = document.getElementById('pipeFlowLmin');
  if (flowField instanceof HTMLElement) flowField.classList.toggle('lab-field--auto', mode === 'diagnostic');
  if (flowInput instanceof HTMLInputElement) {
    flowInput.readOnly = mode === 'diagnostic';
    flowInput.setAttribute('aria-readonly', mode === 'diagnostic' ? 'true' : 'false');
  }
}

const computeAndRender = wrapCalcRefresh(computeAndRenderCore);

[
  'hpType',
  'hpMode',
  'hpLabTier',
  'hpTankZ_m',
  'hpNPSHr_m',
  'hpOilTempC',
  'hpPressureUnit',
  'hpPressure',
  'hpRpm',
  'hpDispCm3Rev',
  'hpSuctionIn',
  'hpFluidType',
  'hpFluidRho',
  'pipeLineType',
  'pipeFlowLmin',
  'pipeViscCst',
  'pipeLengthM',
  'pipeDiaIn',
  'pipeElbows',
  'pipeValves',
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      if (id === 'hpMode') syncPumpModeUi();
      if (id === 'hpLabTier') syncHpLabTierUi();
      if (id === 'hpFluidType') syncHpFluidFieldsUi();
      if (id === 'hpSuctionIn') syncDiametersSuggestion();
      computeAndRender();
    });
    el.addEventListener('change', () => {
      if (id === 'hpMode') syncPumpModeUi();
      if (id === 'hpLabTier') syncHpLabTierUi();
      if (id === 'hpFluidType') syncHpFluidFieldsUi();
      if (id === 'hpSuctionIn') syncDiametersSuggestion();
      computeAndRender();
    });
  }
});

syncDiametersSuggestion();
syncHpLabTierUi();
syncHpFluidFieldsUi();
syncPumpModeUi();
mountHpDiaUnitToggle();
applyStaticI18n();
mountCompactLabFieldHelp();

bindInputValidation([
  { id: 'hpTankZ_m', min: -500, max: 500, label: 'z tanque' },
  { id: 'hpNPSHr_m', min: 0, max: 500, label: 'NPSHr' },
  { id: 'hpOilTempC', min: -40, max: 200, label: 'T aceite' },
  { id: 'hpPressure', min: 1, max: 600, label: 'Presión' },
  { id: 'hpRpm', min: 1, max: 10000, label: 'RPM' },
  { id: 'hpDispCm3Rev', min: 0.01, max: 100000, label: 'Cilindrada' },
  { id: 'pipeFlowLmin', min: 0.01, max: 500000, label: 'Caudal tubería' },
  { id: 'hpFluidRho', min: 500, max: 1400, label: 'Densidad fluido' },
  { id: 'pipeViscCst', min: 1, max: 100000, label: 'Viscosidad' },
  { id: 'pipeLengthM', min: 0.05, max: 10000, label: 'Longitud tubería' },
  { id: 'pipeElbows', min: 0, max: 200, label: 'Codos' },
  { id: 'pipeValves', min: 0, max: 200, label: 'Válvulas' },
]);

mountLabPresetsBar('hpPresetsBar', HP_PRESETS, computeAndRender);

computeAndRender();

['hpBtnCalcPump', 'hpBtnCalcPipes'].forEach((btnId) => {
  const b = document.getElementById(btnId);
  if (b) b.addEventListener('click', () => computeAndRender());
});

mountLabFluidPdfExportBar(document.getElementById('labFluidPdfMountHp'), {
  getPayload: () => pumpPdfSnapshot,
  getDiagramElements: () => {
    const a = document.getElementById('hpDiagram');
    const b = document.getElementById('hpPipeDiagram');
    return [a, b].filter((el) => el instanceof SVGSVGElement);
  },
});

watchLangAndApply({ ...HYDRAULIC_PUMP_EN, ...FLUIDS_HUB_UX_EN }, {
  reloadOnEs: false,
  onEnApplied: () => {
    applyStaticI18n();
    computeAndRender();
  },
});
