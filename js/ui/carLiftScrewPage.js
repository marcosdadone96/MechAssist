/**
 * Página: elevador de coches por husillo (2 columnas) + recomendaciones de motorreductor.
 */

import { computeCarLiftScrew } from '../modules/carLiftScrew.js';
import { readMountingPreferences } from '../modules/mountingPreferences.js';
import { renderBrandRecommendationCards, initMotorVerification } from './driveSelection.js';
import { injectMountingConfigSection, MOUNTING_INPUT_IDS } from './mountingConfigSection.js';
import { openMotorsRecommendationsAndScroll } from './motorsCollapsible.js';
import { renderCarLiftScrewDiagram } from './diagramCarLiftScrew.js';

const recoCopyCarLift = {
  torqueLabel: 'par en husillo (total)',
  rpmLabel: 'rpm del husillo',
  contextHtml:
    'Recomendaciones según la <strong>potencia de motor</strong>, <strong>par</strong> y <strong>rpm</strong> del husillo. Valide siempre con su proveedor y normativa del elevador.',
};

const inputIds = ['clCapacity', 'clH', 'clT', 'clPitch', 'clD', 'clNutL', 'clMu', 'clPallow', 'clSF'];
const selectIds = ['clMotorPos'];

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
    .replace(/\"/g, '&quot;');
}

function buildParams() {
  return {
    capacity_kg: readNum('clCapacity', 3500),
    liftHeight_m: readNum('clH', 1.8),
    liftTime_s: readNum('clT', 45),
    pitch_mm: readNum('clPitch', 8),
    screwDiameter_mm: readNum('clD', 45),
    nutLength_mm: readNum('clNutL', 90),
    mu_thread: readNum('clMu', 0.12),
    columns: 2,
    serviceFactor: readNum('clSF', 1.35),
    pAllow_MPa: readNum('clPallow', 10),
  };
}

function getDriveRequirements() {
  const p = buildParams();
  let r;
  try {
    r = computeCarLiftScrew(p);
  } catch {
    return {
      power_kW: 0,
      torque_Nm: 0,
      drum_rpm: 0.01,
      ...readMountingPreferences(),
    };
  }
  return {
    power_kW: Math.max(0, r.drive.powerDesign_kW),
    torque_Nm: Math.max(0, r.drive.torqueDesign_Nm),
    drum_rpm: Math.max(0.01, r.drive.screw_rpm),
    ...readMountingPreferences(),
  };
}

function refresh() {
  const p = buildParams();
  let r;
  try {
    r = computeCarLiftScrew(p);
  } catch (e) {
    console.error(e);
    return;
  }

  const svg = document.getElementById('clDiagram');
  renderCarLiftScrewDiagram(
    svg instanceof SVGSVGElement ? svg : null,
    {
      liftHeight_m: p.liftHeight_m,
      pitch_mm: p.pitch_mm,
      screwDiameter_mm: p.screwDiameter_mm,
      motorPosition: /** @type {'top'|'base'} */ (readSelect('clMotorPos', 'top')),
    },
  );

  const res = document.getElementById('clResults');
  if (res) {
    res.innerHTML = `
      <div class="metric"><div class="label">RPM husillo</div><div class="value">${r.drive.screw_rpm.toFixed(1)} min⁻¹</div></div>
      <div class="metric"><div class="label">Par elevación (total)</div><div class="value">${r.drive.torqueTotal_Nm.toFixed(0)} N·m</div></div>
      <div class="metric"><div class="label">Potencia (total)</div><div class="value">${r.drive.power_kW.toFixed(2)} kW</div></div>
      <div class="metric"><div class="label">Par diseño (SF)</div><div class="value">${r.drive.torqueDesign_Nm.toFixed(0)} N·m</div></div>
      <div class="metric"><div class="label">Potencia diseño (SF)</div><div class="value">${r.drive.powerDesign_kW.toFixed(2)} kW</div></div>
      <div class="metric"><div class="label">Ángulos λ / φ</div><div class="value">${r.geometry.helixAngle_deg.toFixed(1)}° / ${r.geometry.frictionAngle_deg.toFixed(1)}°</div></div>
      <div class="metric"><div class="label">Autofrenado</div><div class="value">${r.selfLocking ? 'OK' : 'NO'}</div></div>
      <div class="metric"><div class="label">Presión contacto tuerca (por columna)</div><div class="value">${r.nut.contactPressure_MPa.toFixed(1)} MPa</div></div>
    `;
  }

  const ver = document.getElementById('clVerdicts');
  if (ver) {
    ver.innerHTML = r.verdicts
      .map(
        (v) =>
          `<p class="design-alert design-alert--${v.level === 'err' ? 'error' : v.level === 'warn' ? 'warn' : 'info'}">${esc(v.text)}</p>`,
      )
      .join('');
  }

  const disc = document.getElementById('clDisclaimer');
  if (disc) disc.textContent = r.disclaimer;

  const mb = document.getElementById('carLiftMotorBlock');
  if (mb) {
    try {
      mb.innerHTML = renderBrandRecommendationCards(getDriveRequirements(), recoCopyCarLift);
    } catch (err) {
      console.error(err);
      mb.innerHTML = `<div class="motor-error"><strong>Motorreductores:</strong> ${String(/** @type {Error} */ (err).message || err)}</div>`;
    }
  }
}

inputIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

selectIds.forEach((id) => {
  document.getElementById(id)?.addEventListener('change', refresh);
});

try {
  initMotorVerification(document.getElementById('carLiftVerifyPanel'), getDriveRequirements);
} catch (e) {
  console.error(e);
}

document.getElementById('btnCarLiftCalc')?.addEventListener('click', () => {
  refresh();
  openMotorsRecommendationsAndScroll('section-car-motores');
});

injectMountingConfigSection();
MOUNTING_INPUT_IDS.forEach((id) => {
  document.getElementById(id)?.addEventListener('input', refresh);
  document.getElementById(id)?.addEventListener('change', refresh);
});

refresh();

