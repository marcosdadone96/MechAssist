/**
 * Bomba centrífuga — potencia hidráulica, potencia en el eje de la bomba y dimensionado de accionamiento.
 *
 * Modelo: P_h = ρ g Q H; P_eje = P_h / η_bomba; par en el eje T = P_eje / ω.
 * Correcciones orientativas por tipo de fluido / viscosidad (no sustituye curva del fabricante ni API 610).
 */

import { G, clamp, parsePositive, parseNonNegative } from '../utils/calculations.js';
import { resolveServiceFactor, LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from './serviceFactorByDuty.js';

/**
 * @typedef {import('./serviceFactorByDuty.js').LoadDutyClass} LoadDutyClass
 */

/**
 * @typedef {Object} CalcStep
 * @property {string} id
 * @property {string} title
 * @property {string} formula
 * @property {string} substitution
 * @property {number} value
 * @property {string} unit
 * @property {string} meaning
 */

/**
 * @typedef {'water'|'oil'|'brine'|'slurry'} FluidType
 */

/**
 * @typedef {Object} CentrifugalPumpInputs
 * @property {number} flowValue — caudal en la unidad indicada por flowUnit
 * @property {'m3h'|'lmin'} flowUnit
 * @property {number} head_m — H manométrica total (m columna fluido)
 * @property {number} etaPump_pct — rendimiento bomba 1–99
 * @property {FluidType} fluidType
 * @property {number} rho_kg_m3
 * @property {number} viscosity_mm2_s — viscosidad cinemática (cSt ≈ mm²/s)
 * @property {number} temp_C
 * @property {number} pumpSpeed_rpm — régimen nominal del rodete / eje bomba
 * @property {LoadDutyClass} loadDuty
 * @property {number} [serviceFactor] — si loadDuty === custom
 * @property {'direct'|'gearmotor'} couplingType
 * @property {number} voltage_V
 * @property {number} frequency_Hz
 * @property {boolean} installationProActive — si el usuario Pro rellenó el bloque instalación
 * @property {number} [suctionPressure_kPa_gauge] — manométrica en succión (kPa); negativo = depresión
 * @property {number} [pipeDiameter_mm] — diámetro interior tubería impulsión (orientativo)
 * @property {number} [dailyRunHours] — horas/día (para endurecer SF con safetyOptimization)
 */

/** Presets solo como ayuda al rellenar densidad; el usuario puede sobreescribir. */
export const FLUID_TYPE_PRESETS = Object.freeze({
  water: { label: 'Agua', rho: 1000, nu_default: 1.0 },
  oil: { label: 'Aceite', rho: 880, nu_default: 46 },
  brine: { label: 'Salmuera', rho: 1150, nu_default: 1.2 },
  slurry: { label: 'Lodos / pulpa', rho: 1100, nu_default: 200 },
});

/**
 * Caudal volumétrico en m³/s.
 * @param {number} flowValue
 * @param {'m3h'|'lmin'} flowUnit
 */
export function flowToM3s(flowValue, flowUnit) {
  const q = parsePositive(flowValue, 1);
  if (flowUnit === 'lmin') return (q / 1000) / 60;
  return q / 3600;
}

/**
 * Factor orientativo: fluidos más viscosos o lodos exigen más potencia que el modelo ideal η-Q-H.
 * @param {FluidType} fluidType
 * @param {number} nu_mm2_s
 */
export function viscosityPowerFactor(fluidType, nu_mm2_s) {
  const ν = parsePositive(nu_mm2_s, 1);
  let f = 1;
  if (fluidType === 'oil') f *= 1.04;
  if (fluidType === 'brine') f *= 1.02;
  if (fluidType === 'slurry') f *= 1.12;
  if (ν > 10) {
    const excess = Math.log10(ν / 10);
    f *= 1 + clamp(excess, 0, 0.35) * 0.25;
  }
  return f;
}

/**
 * Endurece factor de servicio si la bomba trabaja muchas horas al día (solo con datos Pro + feature).
 * @param {number} baseSf
 * @param {number} dailyHours
 */
export function bumpServiceFactorForRunHours(baseSf, dailyHours) {
  const h = parseNonNegative(dailyHours, 8);
  let m = 1;
  if (h >= 24) m = 1.1;
  else if (h >= 20) m = 1.07;
  else if (h >= 16) m = 1.04;
  return clamp(baseSf * m, 1, 2.2);
}

/**
 * @param {CentrifugalPumpInputs} raw
 * @param {'es'|'en'} [lang]
 */
export function computeCentrifugalPump(raw, lang = 'es') {
  const en = lang === 'en';
  const Q_m3s = flowToM3s(raw.flowValue, raw.flowUnit);
  const H_m = parsePositive(raw.head_m, 10);
  const η_raw = parsePositive(raw.etaPump_pct, 75);
  const η = clamp(η_raw, 1, 99) / 100;
  const rho = parsePositive(raw.rho_kg_m3, 1000);
  const nu = parsePositive(raw.viscosity_mm2_s, 1);
  const n_rpm = parsePositive(raw.pumpSpeed_rpm, 1450);
  const ω = (2 * Math.PI * n_rpm) / 60;

  const loadDuty =
    raw.loadDuty === 'uniform' ||
    raw.loadDuty === 'moderate' ||
    raw.loadDuty === 'heavy' ||
    raw.loadDuty === 'custom'
      ? raw.loadDuty
      : 'moderate';
  let serviceFactor = Math.max(1, resolveServiceFactor(loadDuty, raw.serviceFactor ?? 1.25));
  if (raw.installationProActive && Number.isFinite(raw.dailyRunHours)) {
    serviceFactor = bumpServiceFactorForRunHours(serviceFactor, raw.dailyRunHours);
  }

  const P_hyd_W = rho * G * Q_m3s * H_m;
  const P_hyd_kW = P_hyd_W / 1000;

  const nuFactor = viscosityPowerFactor(raw.fluidType || 'water', nu);
  const P_shaft_W = (P_hyd_W * nuFactor) / η;
  const P_shaft_kW = P_shaft_W / 1000;

  const T_brake_Nm = P_shaft_W / ω;
  const torqueWithService_Nm = T_brake_Nm * serviceFactor;
  const requiredMotorPower_kW = P_shaft_kW * serviceFactor;

  /** Compatibilidad con módulos que esperan `drumRpm` (cinta). */
  const drumRpm = n_rpm;

  const flowDisplay =
    raw.flowUnit === 'lmin'
      ? `${parsePositive(raw.flowValue, 1).toFixed(2)} L/min`
      : `${parsePositive(raw.flowValue, 1).toFixed(3)} m³/h`;

  const dutyLabelText = en
    ? LOAD_DUTY_OPTIONS_EN[loadDuty]?.label || loadDuty
    : LOAD_DUTY_OPTIONS.find((o) => o.id === loadDuty)?.label || loadDuty;

  /** @type {CalcStep[]} */
  const steps = en
    ? [
        {
          id: 'q_si',
          title: 'Flow in SI units',
          formula: 'Q (m³/s) from input unit',
          substitution: `${flowDisplay} \u2192 Q = ${Q_m3s.toExponential(4)} m\u00b3/s`,
          value: Q_m3s,
          unit: 'm\u00b3/s',
          meaning: 'Basis for hydraulic power.',
        },
        {
          id: 'p_hyd',
          title: 'Hydraulic power',
          formula: 'P_h = \u03c1 g Q H',
          substitution: `\u03c1 = ${rho} kg/m\u00b3, H = ${H_m} m`,
          value: P_hyd_kW,
          unit: 'kW',
          meaning: 'Useful power delivered to the fluid (ideal, no mechanical losses inside the pump).',
        },
        {
          id: 'p_shaft',
          title: 'Pump shaft power',
          formula: 'P_shaft = P_h \u00b7 f_\u03bd / \u03b7_pump',
          substitution: `f_\u03bd \u2248 ${nuFactor.toFixed(3)}, \u03b7 = ${(η * 100).toFixed(1)} %`,
          value: P_shaft_kW,
          unit: 'kW',
          meaning: 'Mechanical power the motor (or gearbox output) must deliver to the pump shaft.',
        },
        {
          id: 'torque',
          title: 'Torque at pump shaft',
          formula: 'T = P_shaft / \u03c9',
          substitution: `\u03c9 = 2\u03c0\u00b7(${n_rpm} min\u207b\u00b9)/60`,
          value: T_brake_Nm,
          unit: 'N\u00b7m',
          meaning: 'Steady torque at the pump coupling; reference for gearbox or direct drive.',
        },
        {
          id: 'sf',
          title: 'Design torque and power (service factor)',
          formula: 'T_des = T \u00b7 SF; P_des = P_shaft \u00b7 SF',
          substitution: `SF = ${serviceFactor.toFixed(3)} (${dutyLabelText})`,
          value: serviceFactor,
          unit: '\u2014',
          meaning: 'Margin for load swings, wear and duty cycles; does not replace NPSH analysis or the full pump curve.',
        },
      ]
    : [
        {
          id: 'q_si',
          title: 'Caudal en unidades SI',
          formula: 'Q (m³/s) según unidad de entrada',
          substitution: `${flowDisplay} → Q = ${Q_m3s.toExponential(4)} m³/s`,
          value: Q_m3s,
          unit: 'm³/s',
          meaning: 'Base para la potencia hidráulica.',
        },
        {
          id: 'p_hyd',
          title: 'Potencia hidráulica',
          formula: 'P_h = ρ g Q H',
          substitution: `ρ = ${rho} kg/m³, H = ${H_m} m`,
          value: P_hyd_kW,
          unit: 'kW',
          meaning: 'Potencia útil comunicada al fluido (ideal, sin pérdidas mecánicas en la bomba).',
        },
        {
          id: 'p_shaft',
          title: 'Potencia en el eje de la bomba',
          formula: 'P_eje = P_h · f_ν / η_bomba',
          substitution: `f_ν ≈ ${nuFactor.toFixed(3)}, η = ${(η * 100).toFixed(1)} %`,
          value: P_shaft_kW,
          unit: 'kW',
          meaning: 'Potencia mecánica que debe entregar el motor (o el reductor de salida) al eje de la bomba.',
        },
        {
          id: 'torque',
          title: 'Par en el eje de la bomba',
          formula: 'T = P_eje / ω',
          substitution: `ω = 2π·(${n_rpm} min⁻¹)/60`,
          value: T_brake_Nm,
          unit: 'N·m',
          meaning: 'Par de régimen en el acople bomba; referencia para reductor o motor directo.',
        },
        {
          id: 'sf',
          title: 'Par y potencia de diseño (factor de servicio)',
          formula: 'T_dis = T · SF; P_dis = P_eje · SF',
          substitution: `SF = ${serviceFactor.toFixed(3)} (${dutyLabelText})`,
          value: serviceFactor,
          unit: '—',
          meaning: 'Margen para variaciones de carga, desgaste y ciclos; no sustituye análisis NPSH ni curva completa.',
        },
      ];

  const explanations = en
    ? [
        `Hydraulic power ${P_hyd_kW.toFixed(3)} kW at ${flowDisplay} and H = ${H_m} m; density ${rho} kg/m\u00b3.`,
        nuFactor > 1.01
          ? `Applied indicative factor f_\u03bd = ${nuFactor.toFixed(3)} from fluid type and viscosity (${nu} mm\u00b2/s). Validate with manufacturer curves if the fluid is non-Newtonian or highly viscous.`
          : `Viscosity ${nu} mm\u00b2/s: minimal power correction; use the pump catalog for final selection.`,
        raw.couplingType === 'direct'
          ? 'Direct coupling: motor (or VFD) speed must match the nominal pump shaft speed entered.'
          : 'Geared motor: the demo catalog assumes a gearbox between motor and pump; verify n\u2082 and T\u2082 cover the duty with margin.',
      ]
    : [
        `Potencia hidráulica ${P_hyd_kW.toFixed(3)} kW con ${flowDisplay} y H = ${H_m} m; densidad ${rho} kg/m³.`,
        nuFactor > 1.01
          ? `Se aplicó un factor orientativo f_ν = ${nuFactor.toFixed(3)} por tipo de fluido y viscosidad (${nu} mm²/s). Valide con curvas del fabricante si el fluido es no newtoniano o muy viscoso.`
          : `Viscosidad ${nu} mm²/s: corrección sobre potencia mínima; para selección definitiva use el catálogo de la bomba.`,
        raw.couplingType === 'direct'
          ? 'Acoplamiento directo: el régimen del motor (o variador) debe coincidir con el régimen nominal del eje bomba indicado.'
          : 'Motorreductor: el catálogo orientativo asume reductor entre motor y bomba; verifique que n₂ y T₂ cubren el punto con margen.',
      ];

  const assumptions = en
    ? [
        'Ideal pump at a single (Q, H) point: no full polynomial curves or affinity laws.',
        'Total head H already includes static lift and line losses per your definition.',
        'Available NPSH / cavitation: not computed here; use net suction head and manufacturer NPSHr.',
        'Efficiency \u03b7 is the declared operating point; field performance may differ with wear and fouling.',
      ]
    : [
        'Modelo de bomba ideal en el punto (Q, H): no se han interpolado curvas polinomiales ni leyes de afinidad completas.',
        'La altura manométrica H ya incluye geodésica y pérdidas de carga en tuberías según el criterio del usuario.',
        'NPSH disponible / cavitación: no calculado en esta versión; use succión neta y NPSHr del fabricante.',
        'Rendimiento η es el del punto de operación declarado; en campo puede variar con desgaste y rugosidad.',
      ];

  return {
    designStandard: 'Hydraulic',
    loadDuty,
    serviceFactorUsed: serviceFactor,
    efficiency_pct_effective: η * 100,
    efficiency_pct_raw: η_raw,
    hydraulicPower_kW: P_hyd_kW,
    shaftPower_kW: P_shaft_kW,
    viscosityFactor: nuFactor,
    torqueAtDrum_Nm: T_brake_Nm,
    torqueWithService_Nm,
    requiredMotorPower_kW,
    drumRpm,
    pumpShaftRpm: n_rpm,
    massFlow_kg_s: Q_m3s * rho,
    steps,
    explanations,
    assumptions,
    detail: {
      Q_m3s,
      H_m,
      rho,
      nu_mm2_s: nu,
      P_hyd_W,
      P_shaft_W,
      omega_rad_s: ω,
    },
  };
}

/**
 * Alertas de instalación (velocidad en tubería, succión).
 * @param {object} p
 * @param {number} p.Q_m3s
 * @param {number} [p.pipeDiameter_mm]
 * @param {number} [p.suctionPressure_kPa_gauge]
 * @param {number} [p.temp_C]
 * @param {'es'|'en'} [lang]
 */
export function buildPumpInstallationAlerts(p, lang = 'es') {
  const en = lang === 'en';
  /** @type {{ level: 'info'|'warn'|'error'; text: string }[]} */
  const out = [];
  const D_mm = p.pipeDiameter_mm;
  if (D_mm != null && Number.isFinite(D_mm) && D_mm > 0) {
    const D_m = D_mm / 1000;
    const A = Math.PI * (D_m / 2) ** 2;
    const v = p.Q_m3s / A;
    if (v < 0.4) {
      out.push({
        level: 'warn',
        text: en
          ? `Line velocity \u2248 ${v.toFixed(2)} m/s (D = ${D_mm} mm): may be low; sedimentation or oversized pipe.`
          : `Velocidad en tubería ≈ ${v.toFixed(2)} m/s (D = ${D_mm} mm): puede ser baja; riesgo de sedimentación o tubería sobredimensionada.`,
      });
    } else if (v > 3.5) {
      out.push({
        level: 'warn',
        text: en
          ? `Line velocity \u2248 ${v.toFixed(2)} m/s: high head loss and noise; review diameter or routing.`
          : `Velocidad en tubería ≈ ${v.toFixed(2)} m/s: pérdidas de carga altas y ruido; revise diámetro o trazado.`,
      });
    } else {
      out.push({
        level: 'info',
        text: en
          ? `Estimated discharge velocity \u2248 ${v.toFixed(2)} m/s (D = ${D_mm} mm).`
          : `Velocidad estimada en impulsión ≈ ${v.toFixed(2)} m/s (D = ${D_mm} mm).`,
      });
    }
  }
  if (p.suctionPressure_kPa_gauge != null && Number.isFinite(p.suctionPressure_kPa_gauge)) {
    if (p.suctionPressure_kPa_gauge < -20) {
      out.push({
        level: 'warn',
        text: en
          ? `Suction gauge pressure ${p.suctionPressure_kPa_gauge.toFixed(1)} kPa: strong suction lift; check available NPSH vs pump NPSHr and temperature (${p.temp_C ?? '\u2014'} \u00b0C).`
          : `Presión manométrica en succión ${p.suctionPressure_kPa_gauge.toFixed(1)} kPa: aspiración marcada; verifique NPSH disponible frente al NPSHr de la bomba y la temperatura (${p.temp_C ?? '—'} °C).`,
      });
    } else if (p.suctionPressure_kPa_gauge < 0) {
      out.push({
        level: 'info',
        text: en
          ? 'Slight suction vacuum: confirm priming, suction-line losses and NPSH.'
          : 'Succión en ligera depresión: confirme cebado, pérdidas en línea de succión y NPSH.',
      });
    } else {
      out.push({
        level: 'info',
        text: en
          ? `Suction gauge pressure \u2265 0 (${p.suctionPressure_kPa_gauge.toFixed(1)} kPa): usually helps minimum cavitation risk if the liquid is deaerated.`
          : `Succión con presión manométrica ≥ 0 (${p.suctionPressure_kPa_gauge.toFixed(1)} kPa): suele favorecer la cavitación mínima si el líquido está desaireado.`,
      });
    }
  }
  return out;
}
