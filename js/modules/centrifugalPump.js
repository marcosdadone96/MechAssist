/**
 * Bomba centrífuga — potencia hidráulica, potencia en el eje de la bomba y dimensionado de accionamiento.
 *
 * Modelo: P_h = ρ g Q H; P_eje = P_h / η_bomba; par en el eje T = P_eje / ω.
 * Correcciones orientativas por tipo de fluido / viscosidad (no sustituye curva del fabricante ni API 610).
 */

import { G, clamp, parsePositive, parseNonNegative } from '../utils/calculations.js';
import { resolveServiceFactor, LOAD_DUTY_OPTIONS } from './serviceFactorByDuty.js';

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
 */
export function computeCentrifugalPump(raw) {
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

  /** @type {CalcStep[]} */
  const steps = [
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
      substitution: `SF = ${serviceFactor.toFixed(3)} (${LOAD_DUTY_OPTIONS.find((o) => o.id === loadDuty)?.label || loadDuty})`,
      value: serviceFactor,
      unit: '—',
      meaning: 'Margen para variaciones de carga, desgaste y ciclos; no sustituye análisis NPSH ni curva completa.',
    },
  ];

  const explanations = [
    `Potencia hidráulica ${P_hyd_kW.toFixed(3)} kW con ${flowDisplay} y H = ${H_m} m; densidad ${rho} kg/m³.`,
    nuFactor > 1.01
      ? `Se aplicó un factor orientativo f_ν = ${nuFactor.toFixed(3)} por tipo de fluido y viscosidad (${nu} mm²/s). Valide con curvas del fabricante si el fluido es no newtoniano o muy viscoso.`
      : `Viscosidad ${nu} mm²/s: corrección sobre potencia mínima; para selección definitiva use el catálogo de la bomba.`,
    raw.couplingType === 'direct'
      ? 'Acoplamiento directo: el régimen del motor (o variador) debe coincidir con el régimen nominal del eje bomba indicado.'
      : 'Motorreductor: el catálogo orientativo asume reductor entre motor y bomba; verifique que n₂ y T₂ cubren el punto con margen.',
  ];

  const assumptions = [
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
 */
export function buildPumpInstallationAlerts(p) {
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
        text: `Velocidad en tubería ≈ ${v.toFixed(2)} m/s (D = ${D_mm} mm): puede ser baja; riesgo de sedimentación o tubería sobredimensionada.`,
      });
    } else if (v > 3.5) {
      out.push({
        level: 'warn',
        text: `Velocidad en tubería ≈ ${v.toFixed(2)} m/s: pérdidas de carga altas y ruido; revise diámetro o trazado.`,
      });
    } else {
      out.push({
        level: 'info',
        text: `Velocidad estimada en impulsión ≈ ${v.toFixed(2)} m/s (D = ${D_mm} mm).`,
      });
    }
  }
  if (p.suctionPressure_kPa_gauge != null && Number.isFinite(p.suctionPressure_kPa_gauge)) {
    if (p.suctionPressure_kPa_gauge < -20) {
      out.push({
        level: 'warn',
        text: `Presión manométrica en succión ${p.suctionPressure_kPa_gauge.toFixed(1)} kPa: aspiración marcada; verifique NPSH disponible frente al NPSHr de la bomba y la temperatura (${p.temp_C ?? '—'} °C).`,
      });
    } else if (p.suctionPressure_kPa_gauge < 0) {
      out.push({
        level: 'info',
        text: 'Succión en ligera depresión: confirme cebado, pérdidas en línea de succión y NPSH.',
      });
    } else {
      out.push({
        level: 'info',
        text: `Succión con presión manométrica ≥ 0 (${p.suctionPressure_kPa_gauge.toFixed(1)} kPa): suele favorecer la cavitación mínima si el líquido está desaireado.`,
      });
    }
  }
  return out;
}
