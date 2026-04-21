/**
 * Ascensor de tracción — formulario, diagrama, motorreductores.
 */

import { readMountingPreferences } from '../modules/mountingPreferences.js';
import { computeTractionElevator } from '../modules/tractionElevator.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { injectMountingConfigSection, MOUNTING_INPUT_IDS } from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { renderTractionElevatorDiagram } from './diagramTractionElevator.js';

const recoCopyTraction = {
  torqueLabel: 'par en polea tractora',
  rpmLabel: 'rpm de la polea',
  contextHtml: `Recomendaciones según la <strong>potencia de motor</strong> (lado reductor), <strong>par en la polea</strong> y <strong>rpm de la polea</strong>
    del modelo de tracción. Cada tarjeta enlaza a documentación del fabricante — valide siempre con su proveedor.`,
};

const ETA_TRANS_DEFAULT = 0.96;

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

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function buildParams() {
  const useOptimal = !document.getElementById('teCwManual')?.checked;
  const manualCw = readNum('teMcpManual', 0);
  return {
    usefulLoad_kg: readNum('teQ', 2000),
    emptyCar_kg: readNum('teMc', 1200),
    counterweight_kg: useOptimal ? null : manualCw,
    counterweightFraction: readNum('teKcw', 0.45),
    travelHeight_m: readNum('teH', 12),
    speed_m_s: readNum('teV', 1),
    reeving: /** @type {'1_1'|'2_1'} */ (readSelect('teReeving', '1_1')),
    sheaveDiameter_m: readNum('teD', 0.55),
    wrapAngle_deg: readNum('teAlpha', 180),
    friction_mu: readNum('teMu', 0.1),
    duty: /** @type {'freight'|'persons'} */ (readSelect('teDuty', 'freight')),
    maxStrands: readNum('teMaxN', 8),
  };
}

/** Requisitos de accionamiento en la polea (potencia motor orientativa incl. η transmisión). */
function getDriveRequirements() {
  const p = buildParams();
  let r;
  try {
    r = computeTractionElevator(p);
  } catch {
    return {
      power_kW: 0,
      torque_Nm: 0,
      drum_rpm: 0.01,
      ...readMountingPreferences(),
    };
  }
  const P_sheave = Math.max(0.001, r.drive.power_kW_orientative);
  const n = Math.max(0.02, r.drive.sheave_rpm);
  const torque_Nm = (9550 * P_sheave) / n;
  const power_kW = P_sheave / ETA_TRANS_DEFAULT;
  return {
    power_kW,
    torque_Nm,
    drum_rpm: n,
    ...readMountingPreferences(),
  };
}

function drawDiagram(H, reeving) {
  const svg = document.getElementById('teDiagram');
  renderTractionElevatorDiagram(svg instanceof SVGSVGElement ? svg : null, {
    travelHeight_m: H,
    reeving,
  });
}

function computeAndRender() {
  const p = buildParams();
  let r;
  try {
    r = computeTractionElevator(p);
  } catch (e) {
    console.error(e);
    return;
  }

  drawDiagram(p.travelHeight_m, p.reeving);

  const res = document.getElementById('teResults');
  if (res) {
    const eu = r.euler;
    const rope = r.rope;
    res.innerHTML = `
      <div class="metric"><div class="label">Contrapeso (modelo)</div><div class="value">${r.inputs.Mcp.toFixed(0)} kg</div></div>
      <div class="metric"><div class="label">Contrapeso ópt. (cabina + ${(r.inputs.counterweightFraction * 100).toFixed(0)}% Q)</div><div class="value">${r.inputs.Mcp_optimal.toFixed(0)} kg</div></div>
      <div class="metric"><div class="label"><em>T</em>₁/<em>T</em>₂ peor · límite e<sup>μα</sup></div><div class="value">${eu.tensionRatioWorst.toFixed(2)} · ${eu.limit.toFixed(2)}</div></div>
      <div class="metric"><div class="label">Adherencia</div><div class="value">${eu.adhesionOk ? 'OK' : 'revisar'} · margen ×${eu.adhesionMargin.toFixed(2)}</div></div>
      <div class="metric"><div class="label">Cables (SF ${r.inputs.SF})</div><div class="value">${rope.n} × Ø${rope.d_mm} mm</div></div>
      <div class="metric"><div class="label">Uso resist. nominal (demo)</div><div class="value">${(rope.utilFactor * 100).toFixed(1)} %</div></div>
      <div class="metric"><div class="label">Par freno emerg. (orient.)</div><div class="value">${r.brake.torque_Nm.toFixed(0)} N·m</div></div>
      <div class="metric"><div class="label">Potencia tracción (desequilibrio)</div><div class="value">${r.drive.power_kW_orientative.toFixed(3)} kW</div></div>
      <div class="metric"><div class="label">RPM polea</div><div class="value">${r.drive.sheave_rpm.toFixed(1)}</div></div>
      <div class="metric"><div class="label">Ahorro energía vs sin CP (demo)</div><div class="value">${r.energy.savingVsNoCounterweight_pct.toFixed(0)} %</div></div>
    `;
  }

  const ver = document.getElementById('teVerdicts');
  if (ver) {
    ver.innerHTML = r.verdicts
      .map(
        (v) =>
          `<p class="design-alert design-alert--${v.level === 'err' ? 'error' : v.level === 'warn' ? 'warn' : 'info'}">${esc(v.text)}</p>`,
      )
      .join('');
  }

  const disc = document.getElementById('teDisclaimer');
  if (disc) disc.textContent = r.disclaimer;

  const mb = document.getElementById('teMotorBlock');
  if (mb) {
    try {
      mb.innerHTML = renderBrandRecommendationCards(getDriveRequirements(), recoCopyTraction);
    } catch (err) {
      console.error(err);
      mb.innerHTML = `<div class="motor-error"><strong>Motorreductores:</strong> ${String(/** @type {Error} */ (err).message || err)}. Use servidor HTTP si abre en <code>file://</code>.</div>`;
    }
  }
}

function syncCwManualUi() {
  const cb = document.getElementById('teCwManual');
  const row = document.getElementById('teMcpManualRow');
  const on = cb instanceof HTMLInputElement && cb.checked;
  if (row instanceof HTMLElement) row.hidden = !on;
}

injectMountingConfigSection();

document.getElementById('teOpenMotors')?.addEventListener('click', () => {
  openMotorsRecommendationsAndScroll('section-te-motores');
});

document.getElementById('teCwManual')?.addEventListener('change', () => {
  syncCwManualUi();
  computeAndRender();
});

[
  'teQ',
  'teMc',
  'teH',
  'teV',
  'teReeving',
  'teDuty',
  'teD',
  'teAlpha',
  'teMu',
  'teKcw',
  'teMcpManual',
  'teMaxN',
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', computeAndRender);
  document.getElementById(id)?.addEventListener('change', computeAndRender);
});

MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', computeAndRender);
  document.getElementById(id)?.addEventListener('change', computeAndRender);
});

try {
  initMotorVerification(document.getElementById('teVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

syncCwManualUi();
computeAndRender();
