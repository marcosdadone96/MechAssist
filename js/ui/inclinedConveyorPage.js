/**
 * Página cinta inclinada — motor de cálculo detallado.
 */

import { FEATURES } from '../config/features.js';
import { isFreeMachineFullAccess } from '../config/freemium.js';
import { isPremiumEffective, isPdfReportUiUnlocked } from '../services/accessTier.js';
import { computeInclinedConveyor } from '../modules/inclinedConveyor.js';
import { LOAD_DUTY_OPTIONS, LOAD_DUTY_OPTIONS_EN } from '../modules/serviceFactorByDuty.js';
import { buildInputPhaseAlerts, buildResultPhaseAlerts } from '../modules/conveyorDesignAlerts.js';
import { renderInclinedConveyorDiagram } from './diagramInclined.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { renderFullEngineeringAside } from './engineeringReport.js';
import { mountPremiumPdfExportBar, buildInclinedPdfPayload } from '../services/reportPdfExport.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import { injectMountingConfigSection, MOUNTING_INPUT_IDS } from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { applyMachinePremiumGates } from './machinePremiumGates.js';
import { foldAllMachineDetailsOncePerPageLoad } from './machineDetailsFold.js';
import { initInfoChipPopovers } from './infoChipPopover.js';
import { getI18nLabels } from '../config/i18nLabels.js';
import { getCurrentLang, HOME_LANG_CHANGED_EVENT } from '../config/locales.js';
import { escapeCsvCell, wireMachineRfqExport } from './machineRfqExport.js';
import { bootMachineCalcView, wrapCalcRefresh } from './creditsPageBoot.js';
import { incrementCalcCounter } from '../services/calcCounter.js';
import { watchLangAndApply } from '../lab/i18n/applyModuleI18n.js';
import { MACHINE_HUB_UX_EN } from '../lab/i18n/pages/machineHubUxEn.js';
import { INCLINED_CONVEYOR_EN } from '../lab/i18n/pages/inclinedConveyorEn.js';
import {
  applyInclinedConveyorPageLanguage,
  applyInclinedConveyorStaticI18n,
} from './inclinedConveyorStaticI18n.js';

import { INCLINED_PRESET_BY_ID } from '../modules/machineHubPresets.js';

const INC_PAGE_EN = { ...MACHINE_HUB_UX_EN, ...INCLINED_CONVEYOR_EN };

/** Ángulos máximos típicos por material (orientativo, no normativa). */
const MAX_ANGLE_BY_MATERIAL = {
  grain: { max: 15, labelEs: 'Grano / cereal', labelEn: 'Grain / cereal' },
  sand_dry: { max: 18, labelEs: 'Arena seca', labelEn: 'Dry sand' },
  sand_wet: { max: 12, labelEs: 'Arena húmeda', labelEn: 'Wet sand' },
  coal: { max: 18, labelEs: 'Carbón / coque', labelEn: 'Coal / coke' },
  gravel: { max: 20, labelEs: 'Grava / árido', labelEn: 'Gravel / aggregate' },
  default: { max: 18, labelEs: 'Material general', labelEn: 'General bulk' },
};

/**
 * @param {number} angleDeg
 * @param {string} materialKey
 * @param {'es'|'en'} lang
 * @returns {{ level: 'warn', text: string } | null}
 */
function buildMaterialAngleAlert(angleDeg, materialKey, lang) {
  if (!Number.isFinite(angleDeg)) return null;
  const row = MAX_ANGLE_BY_MATERIAL[materialKey] || MAX_ANGLE_BY_MATERIAL.default;
  if (angleDeg <= row.max) return null;
  const en = lang === 'en';
  const matLabel = en ? row.labelEn : row.labelEs;
  return {
    level: /** @type {const} */ ('warn'),
    text: en
      ? `⚠ Angle (${formatNum(angleDeg, 1)}°) exceeds the typical limit for ${matLabel} (~${row.max}°). Verify with the belt supplier and material datasheet.`
      : `⚠ Ángulo (${formatNum(angleDeg, 1)}°) supera el límite típico para ${matLabel} (~${row.max}°). Verifique con el fabricante de la banda y el datasheet del material.`,
  };
}

const inputIds = [
  'incLength',
  'incHeight',
  'incAngle',
  'incLoadMass',
  'incBeltWidth',
  'incBeltMass',
  'incLoadDistribution',
  'incBeltSlopePart',
  'incSpeed',
  'incBulkMaterial',
  'incFriction',
  'incEfficiency',
  'incRollerD',
  'incAdditionalResistance',
  'incAccelTime',
  'incInertiaFactor',
  'incServiceFactor',
];

const selectIds = ['incDesignStandard', 'incLoadDuty'];
const PHYSICAL_LIMITS = Object.freeze({
  incLength: { min: 0.5, max: 300 },
  incHeight: { min: 0, max: 300 },
  incAngle: { min: 0, max: 89 },
  incLoadMass: { min: 0.1, max: 500000 },
  incBeltWidth: { min: 0.08, max: 5 },
  incBeltMass: { min: 0, max: 200000 },
  incLoadDistribution: { min: 0.05, max: 1 },
  incBeltSlopePart: { min: 0.3, max: 1 },
  incSpeed: { min: 0, max: 12 },
  incFriction: { min: 0.05, max: 1.2 },
  incEfficiency: { min: 1, max: 99 },
  incRollerD: { min: 50, max: 3000 },
  incAdditionalResistance: { min: 0, max: 2000000 },
  incAccelTime: { min: 0.05, max: 120 },
  incInertiaFactor: { min: 1, max: 3 },
  incServiceFactor: { min: 1, max: 4 },
});

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
  const angEl = document.getElementById('incAngle');
  const angStr = angEl instanceof HTMLInputElement ? angEl.value.trim() : '';
  const ang = angStr === '' ? null : parseFloat(angStr.replace(',', '.'));
  const duty = /** @type {'uniform'|'moderate'|'heavy'|'custom'} */ (
    readSelect('incLoadDuty', 'moderate')
  );
  return {
    lang: getCurrentLang(),
    designStandard: readSelect('incDesignStandard', 'ISO5048'),
    loadDuty: duty,
    length_m: readNum('incLength', 24),
    height_m: readNum('incHeight', 4.5),
    angle_deg: Number.isFinite(/** @type {number} */ (ang)) ? ang : null,
    loadMass_kg: readNum('incLoadMass', 900),
    beltWidth_m: readNum('incBeltWidth', 0.8),
    beltMass_kg: readNum('incBeltMass', 0),
    loadDistribution: readNum('incLoadDistribution', 1),
    beltSlopeParticipation: readNum('incBeltSlopePart', 0.9),
    beltSpeed_m_s: readNum('incSpeed', 1),
    bulkMaterial: readSelect('incBulkMaterial', 'default'),
    frictionCoeff: readNum('incFriction', 0.4),
    efficiency_pct: readNum('incEfficiency', 86),
    rollerDiameter_mm: readNum('incRollerD', 500),
    additionalResistance_N: readNum('incAdditionalResistance', 0),
    accelTime_s: readNum('incAccelTime', 3),
    inertiaStartingFactor: readNum('incInertiaFactor', 1.2),
    serviceFactor: readNum('incServiceFactor', 1.35),
  };
}

function syncIncLoadDutyUi() {
  const dutyEl = document.getElementById('incLoadDuty');
  const sfIn = document.getElementById('incServiceFactor');
  const hint = document.getElementById('incLoadDutyHint');
  if (!(dutyEl instanceof HTMLSelectElement) || !(sfIn instanceof HTMLInputElement)) return;

  const lang = getCurrentLang();
  const en = lang === 'en';
  LOAD_DUTY_OPTIONS.forEach((optRow) => {
    const opt = dutyEl.querySelector(`option[value="${optRow.id}"]`);
    if (opt) opt.textContent = en ? LOAD_DUTY_OPTIONS_EN[optRow.id].label : optRow.label;
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

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getEls() {
  return {
    diagram: /** @type {SVGSVGElement | null} */ (document.getElementById('diagramInclined')),
    results: document.getElementById('incResultsGrid'),
    engineeringReport: document.getElementById('incEngineeringReport'),
    motorBlock: document.getElementById('incMotorBlock'),
    premiumPdfMount: document.getElementById('premiumPdfExportMount'),
    premiumOpt: document.getElementById('incPremiumOptBlock'),
    assumptions: document.getElementById('incAssumptionsList'),
    designAlerts: document.getElementById('incDesignAlerts'),
    qualityChecklist: document.getElementById('incQualityChecklist'),
  };
}

function buildQualityChecklist(raw, r, lang) {
  const en = lang === 'en';
  const checks = [];
  const d = r.detail || {};
  const gravityN = (d.F_g_load_N ?? 0) + (d.F_g_belt_N ?? 0);
  const frictionN = (d.F_mu_load_N ?? 0) + (d.F_mu_belt_N ?? 0);
  const startRatio = r.torqueAtDrum_Nm > 0 ? r.torqueStart_Nm / r.torqueAtDrum_Nm : 1;
  const specificPower = raw.loadMass_kg > 0 ? (r.requiredMotorPower_kW * 1000) / raw.loadMass_kg : 0;

  checks.push(
    r.efficiency_pct_raw > 100
      ? {
          level: 'error',
          text: en
            ? `Efficiency eta=${formatNum(r.efficiency_pct_raw, 1)}% invalid (>100). Calculation uses safe cap ${formatNum(r.efficiency_pct_effective, 1)}%.`
            : `Rendimiento η=${formatNum(r.efficiency_pct_raw, 1)} % inválido (>100). El cálculo usa límite seguro de ${formatNum(
                r.efficiency_pct_effective,
                1,
              )} %.`,
        }
      : r.efficiency_pct_effective < 70
        ? {
            level: 'warn',
            text: en
              ? `Efficiency eta=${formatNum(r.efficiency_pct_effective, 1)}% is low for motor+transmission; review mechanical losses.`
              : `Rendimiento η=${formatNum(
                  r.efficiency_pct_effective,
                  1,
                )} % bajo para conjunto motor+transmisión; revise pérdidas mecánicas.`,
          }
        : {
            level: 'info',
            text: en
              ? `Efficiency eta=${formatNum(r.efficiency_pct_effective, 1)}% in a reasonable range for pre-sizing.`
              : `Rendimiento η=${formatNum(r.efficiency_pct_effective, 1)} % dentro de rango razonable para predimensionado.`,
          },
  );

  checks.push(
    raw.frictionCoeff < 0.2 || raw.frictionCoeff > 0.65
      ? {
          level: 'warn',
          text: en
            ? `mu=${formatNum(raw.frictionCoeff, 2)} outside typical range (0.20-0.65). Verify belt/roller conditions.`
            : `μ=${formatNum(raw.frictionCoeff, 2)} fuera del rango típico (0.20–0.65). Verifique condición real de banda/rodillos.`,
        }
      : {
          level: 'info',
          text: en
            ? `mu=${formatNum(raw.frictionCoeff, 2)} in indicative range.`
            : `μ=${formatNum(raw.frictionCoeff, 2)} en rango orientativo.`,
        },
  );

  checks.push(
    startRatio > 1.45
      ? {
          level: 'warn',
          text: en
            ? `High startup peak (T_start/T_steady ~ ${formatNum(startRatio, 2)}). Consider longer ramp, VFD, or inertia tuning.`
            : `Pico de arranque alto (Tarranque/Trégimen ≈ ${formatNum(
                startRatio,
                2,
              )}). Considere rampa mayor, variador o ajuste de inercia.`,
        }
      : {
          level: 'info',
          text: en
            ? `Controlled startup ratio (T_start/T_steady ~ ${formatNum(startRatio, 2)}).`
            : `Relación de arranque controlada (Tarranque/Trégimen ≈ ${formatNum(startRatio, 2)}).`,
        },
  );

  checks.push(
    raw.loadDuty === 'custom' && raw.serviceFactor < 1.15
      ? {
          level: 'warn',
          text: en
            ? `Manual service factor low (SF=${formatNum(raw.serviceFactor, 2)}). Industrial conveyors often use >= 1.15.`
            : `Factor de servicio manual bajo (SF=${formatNum(raw.serviceFactor, 2)}). Para transporte industrial suele usarse >= 1.15.`,
        }
      : {
          level: 'info',
          text: en
            ? `Service factor applied: SF=${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)}.`
            : `Factor de servicio aplicado: SF=${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)}.`,
        },
  );

  checks.push(
    specificPower > 18
      ? {
          level: 'warn',
          text: en
            ? `High specific power (${formatNum(specificPower, 1)} W/kg load). Review geometry, mu, and safety margin.`
            : `Potencia específica elevada (${formatNum(
                specificPower,
                1,
              )} W/kg de carga). Revise geometría, μ y sobredimensionado de seguridad.`,
        }
      : {
          level: 'info',
          text: en
            ? `Specific power in a typical belt range (${formatNum(specificPower, 1)} W/kg load).`
            : `Potencia específica en banda normal (${formatNum(specificPower, 1)} W/kg de carga).`,
        },
  );

  checks.push(
    gravityN > frictionN
      ? {
          level: 'info',
          text: en
            ? `Gravity dominates resistance (${formatNum(gravityN, 0)} N > ${formatNum(frictionN, 0)} N).`
            : `Predomina gravedad en la resistencia (${formatNum(gravityN, 0)} N > ${formatNum(
                frictionN,
                0,
              )} N).`,
        }
      : {
          level: 'info',
          text: en
            ? `Friction dominates resistance (${formatNum(frictionN, 0)} N >= ${formatNum(gravityN, 0)} N).`
            : `Predomina rozamiento en la resistencia (${formatNum(frictionN, 0)} N >= ${formatNum(
                gravityN,
                0,
              )} N).`,
        },
  );

  return checks;
}

function getDriveRequirements() {
  const r = computeInclinedConveyor(readInputs());
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
  return `${typeMap[pref.mountingType] || pref.mountingType} · ${pref.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}`;
}

/**
 * @param {ReturnType<typeof readInputs>} raw
 * @param {ReturnType<typeof computeInclinedConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 * @param {'es'|'en'} lang
 */
function buildIncRfqPlainText(raw, r, mount, lang) {
  const en = lang === 'en';
  const d = r.detail || {};
  const when = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const head = en
    ? 'TheMechAssist — Inclined belt conveyor (indicative duty point)'
    : 'TheMechAssist — Cinta transportadora inclinada (punto de trabajo orientativo)';
  const hIn = en ? '== Inputs ==' : '== Entradas ==';
  const hOut = en ? '== Results (indicative) ==' : '== Resultados (orientativos) ==';
  const hMount = en ? '== Mounting preference (for RFQ) ==' : '== Preferencia de montaje (RFQ) ==';
  const angNote =
    raw.angle_deg != null && Number.isFinite(raw.angle_deg)
      ? formatNum(raw.angle_deg, 2)
      : en
        ? '(from H, L)'
        : '(por H, L)';
  const disc = en
    ? 'Disclaimer: simplified inclined model; does not replace manufacturer selection, full DIN/CEMA belt memos, or backstop/brake strategy validation.'
    : 'Aviso: modelo en pendiente simplificado; no sustituye la selección del fabricante, memorias DIN/CEMA completas ni la validación de freno/autoretorno.';

  const parts = [
    head,
    `${en ? 'Timestamp (UTC)' : 'Fecha (UTC)'}: ${when}`,
  ];
  if (url) parts.push(`${en ? 'Source' : 'Origen'}: ${url}`);
  parts.push(
    '',
    hIn,
    `${en ? 'Length L (along slope)' : 'Longitud L (siguiendo pendiente)'} (m): ${formatNum(raw.length_m, 3)}`,
    `${en ? 'Lift H' : 'Desnivel H'} (m): ${formatNum(raw.height_m, 3)}`,
    `${en ? 'Angle theta' : 'Ángulo θ'} (deg): ${angNote}`,
    `${en ? 'Nominal load mass' : 'Masa de carga'} (kg): ${formatNum(raw.loadMass_kg, 1)}`,
    `${en ? 'Belt width B' : 'Ancho banda B'} (m): ${formatNum(raw.beltWidth_m, 3)}`,
    `${en ? 'Belt mass m_b' : 'Masa banda m_b'} (kg): ${formatNum(raw.beltMass_kg, 2)}`,
    `${en ? 'Load distribution' : 'Fracción carga'}: ${formatNum(raw.loadDistribution, 3)}`,
    `${en ? 'Belt on slope fraction' : 'Fracción banda en pendiente'}: ${formatNum(raw.beltSlopeParticipation, 3)}`,
    `${en ? 'Belt speed v' : 'Velocidad v'} (m/s): ${formatNum(raw.beltSpeed_m_s, 3)}`,
    `${en ? 'Drive drum D' : 'Diámetro tambor D'} (mm): ${formatNum(raw.rollerDiameter_mm, 1)}`,
    `${en ? 'Friction mu' : 'Coeficiente μ'}: ${formatNum(raw.frictionCoeff, 3)}`,
    `${en ? 'Efficiency eta' : 'Rendimiento η'} (%): ${formatNum(raw.efficiency_pct, 1)}`,
    `${en ? 'Service factor' : 'Factor de servicio'}: ${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 3)}`,
    `${en ? 'Load duty' : 'Tipo de carga'}: ${raw.loadDuty}`,
    `${en ? 'Design standard' : 'Marco normativo'}: ${raw.designStandard}`,
    `${en ? 'Additional resistance' : 'Resistencia adicional'} (N): ${formatNum(raw.additionalResistance_N, 1)}`,
    `${en ? 'Accel time' : 'Tiempo aceleración'} (s): ${formatNum(raw.accelTime_s, 2)}`,
    `${en ? 'Inertia factor' : 'Factor inercia'}: ${formatNum(raw.inertiaStartingFactor, 3)}`,
    '',
    hOut,
    `${en ? 'Steady traction F' : 'Fuerza régimen F'} (N): ${formatNum(d.F_steady_N ?? r.totalForce_N, 2)}`,
    `${en ? 'Design torque at drum (incl. SF)' : 'Par diseño en tambor (incl. SF)'} (N·m): ${formatNum(r.torqueWithService_Nm, 2)}`,
    `${en ? 'Motor shaft power (sizing)' : 'Potencia eje motor (dimensionamiento)'} (kW): ${formatNum(r.requiredMotorPower_kW, 3)}`,
    `${en ? 'Drum rpm' : 'Velocidad tambor'} (rpm): ${formatNum(r.drumRpm, 2)}`,
    `${en ? 'Mass flow (model)' : 'Caudal másico (modelo)'} (kg/s): ${formatNum(r.massFlow_kg_s, 3)}`,
    `${en ? 'Angle used' : 'Ángulo usado'} (deg): ${formatNum(r.angle_deg, 2)}`,
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
 * @param {ReturnType<typeof computeInclinedConveyor>} r
 * @param {ReturnType<typeof readMountingPreferences>} mount
 */
function buildIncRfqCsv(raw, r, mount) {
  const d = r.detail || {};
  const headers = [
    'product',
    'generated_utc',
    'page_url',
    'L_m',
    'H_m',
    'angle_deg_input',
    'load_mass_kg',
    'belt_width_m',
    'belt_mass_kg',
    'load_distribution',
    'belt_slope_fraction',
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
    'angle_deg_effective',
  ];
  const url = typeof location !== 'undefined' ? String(location.href || '').split('#')[0] : '';
  const when = new Date().toISOString();
  const angleIn =
    raw.angle_deg != null && Number.isFinite(raw.angle_deg) ? String(raw.angle_deg) : '';
  const values = [
    'TheMechAssist_inclined_belt',
    when,
    url,
    raw.length_m,
    raw.height_m,
    angleIn,
    raw.loadMass_kg,
    raw.beltWidth_m,
    raw.beltMass_kg,
    raw.loadDistribution,
    raw.beltSlopeParticipation,
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
    d.F_steady_N ?? r.totalForce_N,
    r.torqueWithService_Nm,
    r.requiredMotorPower_kW,
    r.drumRpm,
    r.massFlow_kg_s,
    r.angle_deg,
  ];
  return `${headers.map(escapeCsvCell).join(',')}\n${values.map(escapeCsvCell).join(',')}`;
}

function clampNum(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function applyPhysicalLimitsToInputs() {
  Object.entries(PHYSICAL_LIMITS).forEach(([id, lim]) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) return;
    el.min = String(lim.min);
    el.max = String(lim.max);
  });
}

function normalizePhysicalInputs() {
  let changed = false;
  Object.entries(PHYSICAL_LIMITS).forEach(([id, lim]) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLInputElement)) return;
    const raw = parseFloat(String(el.value).replace(',', '.'));
    if (!Number.isFinite(raw)) return;
    const v = clampNum(raw, lim.min, lim.max);
    if (v !== raw) {
      el.value = String(v);
      changed = true;
      const rEl = document.getElementById(`${id}R`);
      if (rEl instanceof HTMLInputElement) rEl.value = String(v);
    }
  });

  const lenEl = document.getElementById('incLength');
  const hEl = document.getElementById('incHeight');
  if (lenEl instanceof HTMLInputElement && hEl instanceof HTMLInputElement) {
    const L = parseFloat(String(lenEl.value).replace(',', '.'));
    const H = parseFloat(String(hEl.value).replace(',', '.'));
    if (Number.isFinite(L) && Number.isFinite(H) && H > L) {
      hEl.value = String(L);
      const hr = document.getElementById('incHeightR');
      if (hr instanceof HTMLInputElement) hr.value = String(L);
      changed = true;
    }
  }
  return changed;
}

function bindIncRangeSlider(rangeId, numId, lo, hi, step = null) {
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

function writeIncFormValue(id, val) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement)) return;
  el.value = val === '' || val == null ? '' : String(val);
}

function syncIncRangeSlidersFromNumberInputs() {
  const pairs = [
    ['incLengthR', 'incLength', 2, 120, 0.1],
    ['incHeightR', 'incHeight', 0, 40, 0.05],
    ['incLoadMassR', 'incLoadMass', 10, 8000, 1],
    ['incSpeedR', 'incSpeed', 0.05, 5, 0.01],
    ['incRollerDR', 'incRollerD', 50, 1200, 1],
    ['incFrictionR', 'incFriction', 0.15, 0.65, 0.01],
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

function applyIncPresetFromId(presetId) {
  const def = INCLINED_PRESET_BY_ID[presetId];
  if (!def) return;
  for (const [k, v] of Object.entries(def.values)) {
    writeIncFormValue(k, v);
  }
  syncIncRangeSlidersFromNumberInputs();
  syncIncLoadDutyUi();
  syncAnglePriorityUi();
  normalizePhysicalInputs();
  syncIncRangeSlidersFromNumberInputs();
  refresh();
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

function syncAnglePriorityUi() {
  const angleEl = document.getElementById('incAngle');
  const hEl = document.getElementById('incHeight');
  const hRange = document.getElementById('incHeightR');
  if (!(angleEl instanceof HTMLInputElement) || !(hEl instanceof HTMLInputElement) || !(hRange instanceof HTMLInputElement)) return;
  const hasAngle = angleEl.value.trim() !== '';
  hEl.disabled = hasAngle;
  hRange.disabled = hasAngle;
  hEl.classList.toggle('input-disabled-priority', hasAngle);
  hRange.classList.toggle('input-disabled-priority', hasAngle);
}

function syncAngleLimitWarning(angleDeg, materialKey = 'default') {
  const warn = document.getElementById('incAngleWarn');
  if (!warn) return;
  const en = getCurrentLang() === 'en';
  const row = MAX_ANGLE_BY_MATERIAL[materialKey] || MAX_ANGLE_BY_MATERIAL.default;
  const limit = row.max;
  const matLabel = en ? row.labelEn : row.labelEs;
  warn.textContent = en
    ? `⚠ θ > ${limit}° (${matLabel}): use cleats / anti-slip profiles.`
    : `⚠ θ > ${limit}° (${matLabel}): usar banda con perfiles/nervios antideslizantes.`;
  warn.hidden = !(Number.isFinite(angleDeg) && angleDeg > limit);
}

function initInclinedReferenceFallback() {
  const img = document.getElementById('incReferenceImage');
  const ph = document.getElementById('incReferencePlaceholder');
  if (!(img instanceof HTMLImageElement) || !(ph instanceof HTMLElement)) return;
  img.addEventListener('error', () => {
    img.hidden = true;
    ph.hidden = false;
  });
  img.addEventListener('load', () => {
    img.hidden = false;
    ph.hidden = true;
  });
}

function localizeInclinedStaticContent() {
  const lang = getCurrentLang();
  if (lang !== 'en') return;
  document.documentElement.lang = 'en';
  document.title = 'Inclined Conveyor - TheMechAssist';
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  const setHtml = (selector, html) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  };
  setText('.flat-sidebar__title', 'Inclined conveyor');
  setText('details.flat-sidebar-intro .flat-sidebar-intro__summary', 'Calculator description and scope');
  setText(
    'details.flat-sidebar-intro .flat-sidebar__lead',
    'Slope, friction and lift. Values recalculate instantly; the right panel shows the dashboard, schematic and gearmotors.',
  );
  setText('.help-details.flat-help > summary', 'Quick guide');
  setHtml(
    '.help-details.flat-help .help-details__body',
    `<p class="help-details__lead muted">
      Almost every label has a <span class="info-chip info-chip--static" aria-hidden="true">?</span>: on desktop hover; on touch <strong>tap</strong> for help.
    </p>
    <ul>
      <li><strong>L</strong>: length along slope; <strong>H</strong>: lift. If theta is empty, theta = arcsin(H/L).</li>
      <li>If you enter <strong>theta</strong>, it overrides H in the angle calculation.</li>
      <li>Typical maximum angles by material: dry grains ~20°, wet sand ~15°, fine materials ~12°.</li>
      <li>Resistance combines slope weight and friction; P and T at the drum follow.</li>
      <li><strong>Standard</strong>: ISO/DIN or CEMA (+6% on steady traction only, not the acceleration term).</li>
      <li><strong>Service factor</strong>: set by load duty; use Custom for a manual SF.</li>
    </ul>`,
  );
  applyInclinedConveyorStaticI18n('en');
  setText('#btnCalcularInc', 'View suggested gearmotors');
  setText('.flat-dashboard__title', 'Sizing dashboard');
  setHtml(
    '.flat-dashboard__lead',
    'Design torque = max(steady, startup) x SF. Power <strong>(T<sub>design</sub> x omega) / eta</strong>. <a href="#inclined-conveyor-assumptions">Assumptions</a>.',
  );
  setText('.diagram-schematic-note', 'Schematic: forces along slope; qualitative drawing.');
  setHtml(
    '#incVerifyPanel h2',
    '<span class="panel-icon">\u2713</span> Check a gearmotor I already have',
  );
  setText('#incVerifyPanel .panel-lead', 'Use the sample catalog or manual entry; validation uses the same duty point as final results.');
  setText('[for="incVerifyBrand"]', 'Brand');
  setText('[for="incVerifySearch"]', 'Filter model');
  setText('[for="incVerifyModel"]', 'Catalog model');
  setText('[data-verify-run]', 'Check for this machine');
  setText('#section-motores .motors-details__title', 'Gearmotors (sample catalog)');
  setText('#section-motores .motors-details__hint', 'Recommendations, export, verification');
  const pdfSection = document.querySelector('#premiumPdfExportMount')?.closest('section.panel');
  const pdfH2 = pdfSection?.querySelector('h2');
  if (pdfH2) {
    const proFlag = isPremiumEffective() ? '<span class="premium-flag">Pro</span> ' : '';
    pdfH2.innerHTML = `${proFlag}<span class="panel-icon">PDF</span> Export report`;
  }
  if (location.protocol === 'file:') {
    const fpw = document.getElementById('fileProtoWarn');
    if (fpw) {
      fpw.textContent =
        'Recommendation: use a local HTTP server (npx --yes serve .). With file:// the browser may block JS modules and hide diagrams and results.';
    }
  }
  const eng = document.querySelector('#incEngineeringReport')?.closest('.panel');
  if (eng) {
    const t = eng.querySelector('.motors-details__title');
    const h = eng.querySelector('.motors-details__hint');
    const lead = eng.querySelector('.panel-lead');
    if (t) t.textContent = 'Engineering breakdown';
    if (h) h.textContent = 'Expand for intermediate calculations and rationale';
    if (lead) lead.textContent = 'Gearbox, motor strategies, and step-by-step detail.';
  }
  setHtml(
    '.flat-visual__photo-block figcaption',
    `Inclined conveyor on site.
    <a href="https://commons.wikimedia.org/wiki/File:Conveyor_belt_(2).jpg" target="_blank" rel="noopener">Wikimedia Commons</a>.`,
  );
}

function refreshCore() {
  const conveyorExtrasUnlocked = isPremiumEffective() || isFreeMachineFullAccess();
  const pdfReportUnlocked = isPdfReportUiUnlocked();
  const LBL = getI18nLabels();
  const lang = getCurrentLang();
  const en = lang === 'en';
  const TX = en
    ? {
        cannotCalcPower: 'Cannot calculate motor power: check eta (1-99%) in the calculation.',
        normativeMargin: 'Normative margin (steady)',
        withSf: 'With service factor applied',
        motorPower: 'Motor power',
        sizingHint: '(T x omega) / eta - sizing',
        slopeSpeed: 'Slope / speed',
        drumRpmHint: 'drum',
        serviceFactor: 'Service factor',
        mountingType: 'Mounting type',
        beltDrumSpeed: 'Belt / drum speed',
        mechanicalDetails: 'Mechanical details',
        fullResult: 'Full result',
        fullResultHint: 'Forces, partial powers and extended metrics',
        slopeAngle: 'Slope angle',
        steadyForceDrum: 'Steady force (drum)',
        peakStartup: 'Peak startup force',
        weightOnSlope: 'Weight on slope (load+belt)',
        frictionLoadBelt: 'Friction (load+belt)',
        torqueSteadyStart: 'Steady / startup torque',
        motorPowerSteadyPeak: 'Motor power steady / peak',
        engineeringError: 'Report error:',
        gearmotorPrefix: 'Gearmotors:',
        fileProto: 'Use an HTTP server if opening via file://.',
        machineDiagram: 'Machine diagram',
        premiumOptTitle: 'Optimization (Premium)',
        premiumOptDesc: 'Brake / backstop: reserved.',
        proPreparedTitle: 'Pro features (ready to enable)',
        proPreparedLead: 'Billing matrix ready for inclined conveyor.',
        proScenario: 'Scenario compare (angle, load, wrap)',
        proCompare: 'Advanced multi-model comparator',
        proPresets: 'Technical preset library',
        checklistLead: (ok, w, b) =>
          `<strong>Quick technical checklist</strong> - ${ok} OK - ${w} warnings - ${b} critical`,
        calcError: 'Calculation error:',
        calcErrorSuffix: 'Use HTTP server if file://. See F12 console.',
      }
    : {
        cannotCalcPower: 'No se puede calcular la potencia de motor: revise η (1–99 % en el cálculo).',
        normativeMargin: 'Margen normativo (régimen)',
        withSf: 'Con factor de servicio aplicado',
        motorPower: 'Potencia motor',
        sizingHint: '(T×ω)/η · dimensionamiento',
        slopeSpeed: 'Pendiente / velocidad',
        drumRpmHint: 'tambor',
        serviceFactor: 'Factor de servicio',
        mountingType: 'Tipo de montaje',
        beltDrumSpeed: 'Velocidad cinta / tambor',
        mechanicalDetails: 'Detalles mecánicos',
        fullResult: 'Resultado completo',
        fullResultHint: 'Fuerzas, potencias parciales y métricas extendidas',
        slopeAngle: 'Ángulo de pendiente',
        steadyForceDrum: 'Fuerza régimen (tambor)',
        peakStartup: 'Fuerza arranque (pico)',
        weightOnSlope: 'Peso en pendiente (carga+banda)',
        frictionLoadBelt: 'Rozamiento (carga+banda)',
        torqueSteadyStart: 'Par régimen / arranque',
        motorPowerSteadyPeak: 'Potencia motor régimen / pico',
        engineeringError: 'Error informe:',
        gearmotorPrefix: 'Motorreductores:',
        fileProto: 'Use servidor HTTP si abre con file://.',
        machineDiagram: 'Diagrama de la máquina',
        premiumOptTitle: 'Optimización (premium)',
        premiumOptDesc: 'Freno / anti-retorno: reservado.',
        proPreparedTitle: 'Funciones Pro preparadas',
        proPreparedLead: 'Matriz de cobro lista para activar en cinta inclinada.',
        proScenario: 'Comparación de escenarios (ángulo, carga, envol.)',
        proCompare: 'Comparador avanzado multi-modelo',
        proPresets: 'Biblioteca de presets técnicos',
        checklistLead: (ok, w, b) =>
          `<strong>Checklist técnica rápida</strong> · ${ok} OK · ${w} avisos · ${b} críticos`,
        calcError: 'Error al calcular:',
        calcErrorSuffix: 'Use servidor HTTP si abre con file://. Consola F12 para más detalle.',
      };
  const els = getEls();
  try {
    clearRuntimeError();
    normalizePhysicalInputs();
    const raw = readInputs();
    const r = computeInclinedConveyor(raw);
    if (Number.isFinite(r.requiredMotorPower_kW)) incrementCalcCounter();
    syncAnglePriorityUi();
    syncAngleLimitWarning(r.angle_deg, raw.bulkMaterial);
    const d = r.detail || {};
    const liftForDiagram_m = raw.length_m * Math.sin(r.angle_rad);

    const effIn = document.getElementById('incEfficiency');
    if (effIn instanceof HTMLInputElement) {
      effIn.classList.toggle('field-input--danger', (r.efficiency_pct_raw ?? 0) > 100);
    }

    if (els.designAlerts) {
      const sfUsed = r.serviceFactorUsed ?? readNum('incServiceFactor', 1);
      const inputAlerts = buildInputPhaseAlerts({
        efficiency_pct_raw: r.efficiency_pct_raw ?? raw.efficiency_pct,
        efficiency_pct_used: r.efficiency_pct_effective ?? 86,
        serviceFactor: sfUsed,
        loadDuty: raw.loadDuty,
        serviceFactorFieldRaw: raw.loadDuty === 'custom' ? raw.serviceFactor : undefined,
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
      const materialAlert = buildMaterialAngleAlert(r.angle_deg, raw.bulkMaterial, lang);
      const all = [
        ...inputAlerts,
        ...nanAlert,
        ...resultAlerts,
        ...(materialAlert ? [materialAlert] : []),
      ];
      els.designAlerts.innerHTML = all
        .map((a) => `<p class="design-alert design-alert--${a.level}">${escHtml(a.text)}</p>`)
        .join('');
    }

    if (els.diagram) {
      renderInclinedConveyorDiagram(els.diagram, {
        lang,
        length_m: raw.length_m,
        height_m: liftForDiagram_m,
        angle_rad: r.angle_rad,
        beltSpeed_m_s: raw.beltSpeed_m_s,
        loadMass_kg: raw.loadMass_kg,
        frictionCoeff: raw.frictionCoeff,
        totalForce_N: r.totalForce_N,
        gravityForce_N: r.gravityForce_N,
        frictionForce_N: r.frictionForce_N,
        powerAtDrum_W: r.powerAtDrum_W,
        torqueAtDrum_Nm: r.torqueAtDrum_Nm,
        detail: Object.keys(d).length ? d : undefined,
      });
    }

    if (els.results) {
      const mount = readMountingPreferences();
      const mechanicalSummary = [
        en ? `Slope ${formatNum(r.angle_deg, 2)} deg` : `Pendiente ${formatNum(r.angle_deg, 2)}°`,
        en ? `Drum ${formatNum(raw.rollerDiameter_mm, 2)} mm` : `Tambor ${formatNum(raw.rollerDiameter_mm, 2)} mm`,
        mount.machineShaftDiameter_mm != null
          ? `${en ? 'shaft' : 'eje'} ${formatNum(mount.machineShaftDiameter_mm, 2)} mm`
          : null,
      ]
        .filter(Boolean)
        .join(' · ');
      const normaRow =
        r.steadyStandardMultiplier > 1
          ? `<div class="metric"><div class="label">${TX.normativeMargin}</div><div class="value">×${formatNum(r.steadyStandardMultiplier, 2)} (${r.designStandard})</div></div>`
          : '';
      const vLine = `${formatNum(raw.beltSpeed_m_s, 2)} m/s · ${formatNum(r.drumRpm, 2)} rpm`;
      els.results.innerHTML = `
    <div class="flat-kpi-row" role="group" aria-label="${LBL.resultsMain}">
      <article class="flat-kpi flat-kpi--torque">
        <span class="flat-kpi__eyebrow">${LBL.designTorque} · ${en ? 'drum' : 'tambor'}</span>
        <p class="flat-kpi__value">${formatNum(r.torqueWithService_Nm, 2)}<span class="flat-kpi__unit">N·m</span></p>
        <p class="flat-kpi__hint">${TX.withSf}</p>
      </article>
      <article class="flat-kpi flat-kpi--power">
        <span class="flat-kpi__eyebrow">${TX.motorPower}</span>
        <p class="flat-kpi__value">${formatNum(r.requiredMotorPower_kW, 2)}<span class="flat-kpi__unit">kW</span></p>
        <p class="flat-kpi__hint">${TX.sizingHint}</p>
      </article>
      <article class="flat-kpi flat-kpi--speed">
        <span class="flat-kpi__eyebrow">${TX.slopeSpeed}</span>
        <p class="flat-kpi__value">${formatNum(r.angle_deg, 2)}<span class="flat-kpi__unit">°</span></p>
        <p class="flat-kpi__hint">${vLine} · ${TX.drumRpmHint}</p>
      </article>
    </div>
    <div class="result-focus-grid flat-kpi-secondary">
      <div class="metric"><div class="label">${TX.serviceFactor}</div><div class="value">${formatNum(r.serviceFactorUsed ?? raw.serviceFactor, 2)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mountingType}</div><div class="value">${formatMounting(mount)}</div></div>
      <div class="metric metric--text"><div class="label">${TX.beltDrumSpeed}</div><div class="value">${vLine}</div></div>
      <div class="metric metric--text"><div class="label">${TX.mechanicalDetails}</div><div class="value">${mechanicalSummary || '—'}</div></div>
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
          <div class="metric"><div class="label">${TX.slopeAngle}</div><div class="value">${formatNum(r.angle_deg, 2)}°</div></div>
          <div class="metric"><div class="label">${TX.steadyForceDrum}</div><div class="value">${formatNum(d.F_steady_N, 0)} N</div></div>
          <div class="metric"><div class="label">${TX.peakStartup}</div><div class="value">${formatNum(d.F_total_start_N, 0)} N</div></div>
          <div class="metric"><div class="label">${TX.weightOnSlope}</div><div class="value">${formatNum((d.F_g_load_N ?? 0) + (d.F_g_belt_N ?? 0), 0)} N</div></div>
          <div class="metric"><div class="label">${TX.frictionLoadBelt}</div><div class="value">${formatNum((d.F_mu_load_N ?? 0) + (d.F_mu_belt_N ?? 0), 0)} N</div></div>
          <div class="metric"><div class="label">${TX.torqueSteadyStart}</div><div class="value">${formatNum(r.torqueAtDrum_Nm, 1)} / ${formatNum(r.torqueStart_Nm, 1)} N·m</div></div>
          <div class="metric"><div class="label">${LBL.massFlow}</div><div class="value">${formatNum(r.massFlow_kg_s, 3)} kg/s</div></div>
          <div class="metric"><div class="label">${TX.motorPowerSteadyPeak}</div><div class="value">${formatNum((d.powerMotorRun_W ?? 0) / 1000, 3)} / ${formatNum((d.powerMotorStart_W ?? 0) / 1000, 3)} kW</div></div>
        </div>
      </div>
    </details>
  `;
    }

    if (els.qualityChecklist) {
      const checks = buildQualityChecklist(raw, r, lang);
      const bad = checks.filter((c) => c.level === 'error').length;
      const warn = checks.filter((c) => c.level === 'warn').length;
      const ok = checks.length - bad - warn;
      els.qualityChecklist.innerHTML = `
        <p class="muted" style="margin:0 0 0.5rem;font-size:0.83rem">${TX.checklistLead(ok, warn, bad)}</p>
        ${checks.map((c) => `<p class="design-alert design-alert--${c.level}">${escHtml(c.text)}</p>`).join('')}
      `;
    }

    if (els.engineeringReport) {
      try {
        els.engineeringReport.innerHTML = renderFullEngineeringAside(r, { lang });
      } catch (err) {
        console.error(err);
        els.engineeringReport.innerHTML = `<div class="motor-error">${TX.engineeringError} ${String(err.message || err)}</div>`;
      }
    }

    if (els.motorBlock) {
      try {
        els.motorBlock.innerHTML = renderBrandRecommendationCards(getDriveRequirements());
      } catch (err) {
        console.error(err);
        els.motorBlock.innerHTML = `<div class="motor-error">${TX.gearmotorPrefix} ${String(err.message || err)}. ${TX.fileProto}</div>`;
      }
    }

    if (els.premiumPdfMount) {
      mountPremiumPdfExportBar(els.premiumPdfMount, {
        isPremium: pdfReportUnlocked,
        getPayload: () => buildInclinedPdfPayload(raw, r),
        getDiagramElement: () => els.diagram,
        diagramTitle: TX.machineDiagram,
      });
    }

    if (els.assumptions) {
      const extra = en
        ? ['This model does not calculate load backsliding risk during stop (requires brake or backstop drum strategy).']
        : ['Este modelo no calcula el riesgo de retroceso de carga al parar (requiere freno o estrategia con tambor/autobloqueo).'];
      els.assumptions.innerHTML = [...(r.assumptions || []), ...extra].map((a) => `<li>${a}</li>`).join('');
    }

    if (els.premiumOpt) {
      const m = FEATURES.monetization?.inclined;
      const hasPreparedGate =
        !!m && (m.scenarioCompare || m.advancedMotorCompare || m.premiumPresets);
      if (conveyorExtrasUnlocked && FEATURES.safetyOptimization) {
        els.premiumOpt.innerHTML = `
      <section class="panel">
        <h2><span class="panel-icon">★</span> ${TX.premiumOptTitle}</h2>
        <p class="muted" style="margin:0">${TX.premiumOptDesc}</p>
      </section>
    `;
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

    applyMachinePremiumGates();
    foldAllMachineDetailsOncePerPageLoad();
  } catch (err) {
    console.error(err);
    showRuntimeError(`${TX.calcError} ${String(err.message || err)}. ${TX.calcErrorSuffix}`);
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
      syncIncLoadDutyUi();
      refresh();
    });
  }
});

try {
  initMotorVerification(document.getElementById('incVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

document.getElementById('btnCalcularInc')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-motores');
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

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

applyPhysicalLimitsToInputs();
syncIncLoadDutyUi();
localizeInclinedStaticContent();
initInfoChipPopovers(document.body);
initInclinedReferenceFallback();

bindIncRangeSlider('incLengthR', 'incLength', 2, 120, 0.1);
bindIncRangeSlider('incHeightR', 'incHeight', 0, 40, 0.05);
bindIncRangeSlider('incLoadMassR', 'incLoadMass', 10, 8000, 1);
bindIncRangeSlider('incSpeedR', 'incSpeed', 0.05, 5, 0.01);
bindIncRangeSlider('incRollerDR', 'incRollerD', 50, 1200, 1);
bindIncRangeSlider('incFrictionR', 'incFriction', 0.15, 0.65, 0.01);

bootMachineCalcView(refresh);

wireMachineRfqExport({
  getPayload: () => {
    const raw = readInputs();
    return { raw, result: computeInclinedConveyor(raw), mount: readMountingPreferences() };
  },
  buildPlainText: buildIncRfqPlainText,
  buildCsv: buildIncRfqCsv,
  toastCopiedEn: MACHINE_HUB_UX_EN['machineHub.toastRfqCopied'],
  toastErrEn: MACHINE_HUB_UX_EN['machineHub.toastRfqErr'],
});

watchLangAndApply(INC_PAGE_EN, {
  onEnApplied: () => {
    applyInclinedConveyorPageLanguage();
    localizeInclinedStaticContent();
    syncIncLoadDutyUi();
    initInfoChipPopovers(document.body);
    refresh();
  },
});

document.querySelector('.flat-sidebar')?.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target.closest('[data-inc-preset]') : null;
  if (!(t instanceof HTMLButtonElement)) return;
  const id = t.getAttribute('data-inc-preset');
  if (id) applyIncPresetFromId(id);
});

window.addEventListener(HOME_LANG_CHANGED_EVENT, () => {
  location.reload();
});

