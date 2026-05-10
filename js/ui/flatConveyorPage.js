/**
 * Página cinta plana — motor de cálculo detallado + informe de ingeniería.
 */

import { FEATURES } from '../config/features.js';
import { isFreeMachineFullAccess } from '../config/freemium.js';
import { isPremiumEffective } from '../services/accessTier.js';
import { computeFlatConveyor } from '../modules/flatConveyor.js';
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
import { mountLabCloudSaveBar } from './labCloudSave.js';

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

const selectIds = ['designStandard', 'loadDuty', 'carrySurface'];
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
      };
  const els = getEls();
  try {
    clearRuntimeError();
    const raw = readInputs();
    const r = computeFlatConveyor(raw);
    const d = r.detail || {};

    const effIn = document.getElementById('efficiency');
    if (effIn instanceof HTMLInputElement) {
      effIn.classList.toggle('field-input--danger', (r.efficiency_pct_raw ?? 0) > 100);
    }

    if (els.designAlerts) {
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
      const all = [...inputAlerts, ...nanAlert, ...resultAlerts];
      els.designAlerts.innerHTML = all
        .map((a) => `<p class="design-alert design-alert--${a.level}">${escHtml(a.text)}</p>`)
        .join('');
    }

    if (els.diagram) {
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
    }

    if (els.results) {
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
      els.results.innerHTML = `
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
      mountPremiumPdfExportBar(els.premiumPdfMount, {
        isPremium: pdfReportUnlocked,
        getPayload: () => buildFlatPdfPayload(raw, r),
        getDiagramElement: () => els.diagram,
        diagramTitle: TX.machineDiagram,
      });
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

mountLabCloudSaveBar('Cinta transportadora plana', { scopeSelector: 'main.app-main' });

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
