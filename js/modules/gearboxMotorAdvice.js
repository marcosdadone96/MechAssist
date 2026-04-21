/**
 * Relación de reducción, tipo de reductor orientativo y tres estrategias de motorreductor.
 * Orientación de ingeniería — siempre validar con catálogo del fabricante.
 */

import { shaftSizingFromDrive } from './shaftSizing.js';

/** RPM síncronos de referencia (4 polos, red 50 Hz ≈ 1500 min⁻¹ síncrono; asíncrono ~1450–1480). */
export const TYPICAL_MOTOR_SYNC_RPM = 1500;
export const TYPICAL_MOTOR_NOMINAL_RPM = 1455;

/**
 * @param {number} drumRpm
 * @param {number} [motorRpmNominal]
 */
export function requiredGearRatio(drumRpm, motorRpmNominal = TYPICAL_MOTOR_NOMINAL_RPM) {
  if (!Number.isFinite(drumRpm) || drumRpm <= 0) return NaN;
  return motorRpmNominal / drumRpm;
}

/**
 * @param {number} ratio
 * @returns {{ type: string; note: string }}
 */
export function suggestGearboxFamily(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return { type: '—', note: 'Velocidad de giro del tambor no válida.' };
  }
  if (ratio > 70) {
    return {
      type: 'Sinfín-corona o multicuerpo alto índice',
      note: 'Ratios muy altos: rendimiento η menor, autoblocante útil en inclinación; disipa más calor.',
    };
  }
  if (ratio > 35) {
    return {
      type: 'Helicoidal 2–3 etapas o bevel-helicoidal',
      note: 'Equilibrio habitual en transporte: buena η y vida útil.',
    };
  }
  if (ratio > 12) {
    return {
      type: 'Helicoidal 2 etapas o planetario',
      note: 'Planetario si se busca masa/tamaño reducido y alto par.',
    };
  }
  return {
    type: 'Helicoidal 1–2 etapas o coaxial',
    note: 'Ratio moderado: posible motor de 4 polos directo con reductor compacto.',
  };
}

/**
 * Tres propuestas conceptuales (no sustituyen selección de catálogo).
 * @param {object} p
 * @param {number} p.powerMotor_kW
 * @param {number} p.torqueDrumDesign_Nm — par en tambor con márgenes
 * @param {number} p.drumRpm
 * @param {number} p.ratio
 * @param {string} p.gearboxHint
 */
export function buildThreeMotorStrategies(p) {
  const P = Math.max(0, p.powerMotor_kW || 0);
  const T = Math.max(0, p.torqueDrumDesign_Nm || 0);
  const n = Math.max(0.01, p.drumRpm || 0.01);
  const i = Number.isFinite(p.ratio) ? p.ratio : 0;
  const gb = p.gearboxHint || '';

  return [
    {
      id: 'balanced',
      title: '1. Solución equilibrada (referencia)',
      motor_kW: Math.max(0.25, P * 1.0),
      philosophy:
        'Motor IE3 4 polos + reductor helicoidal/bevel-helicoidal (p. ej. SEW R/K, Nord SK, Bonfiglioli A, Motovario H). Buen compromiso η, coste y stock.',
      gearbox: i > 40 ? 'K / SK bevel-helicoidal 2 etapas' : 'R / H helicoidal',
      brands: 'SEW-Eurodrive (R/K), Nord (SK), Bonfiglioli (A), Motovario (H)',
      torque_Nm: T,
      drum_rpm: n,
      ratio: i,
      risks:
        'Si el ciclo es S4/S5 o arranques muy frecuentes, subir un escalón de marco o revisar térmica del reductor.',
    },
    {
      id: 'efficiency',
      title: '2. Máxima eficiencia operativa',
      motor_kW: Math.max(0.25, P * 1.05),
      philosophy:
        'IE4/IE5 + reductor de alta η (helicoidal de 2 etapas o planetario de gama alta). Menor consumo a largo plazo; inversión inicial mayor.',
      gearbox: i > 30 ? 'Planetario premium o helicoidal 2 etapas clase I²t' : 'Helicoidal coaxial (SIMOGEAR D, Lenze)',
      brands: 'Siemens Simogear, SEW-Eurodrive (IE4), Nord, Bonfiglioli (A)',
      torque_Nm: T,
      drum_rpm: n,
      ratio: i,
      risks:
        'Comprobar que el punto de trabajo no quede con factor de utilización tan bajo que penalice el cos φ o la η del motor.',
    },
    {
      id: 'cost',
      title: '3. Enfoque económico (coste inicial)',
      motor_kW: Math.max(0.25, P * 1.08),
      philosophy:
        'Motor IE3 estándar + sinfín-corona o helicoidal-worm si el ratio es alto; menor precio, mayor pérdida en reductor y posible necesidad de mayor refrigeración.',
      gearbox: i > 50 ? 'Sinfín (Motovario NMRV, Bonfiglioli VF, etc.)' : 'Helicoidal entrada de gama estándar',
      brands: 'Motovario (NMRV), Bonfiglioli (VF), Motovario (H)',
      torque_Nm: T,
      drum_rpm: n,
      ratio: i,
      risks:
        'Riesgo de sobrecalentamiento del sinfín en servicio continuo alto; par de salida y tiempo S1 a revisar en catálogo.',
    },
  ];
}

/**
 * HTML block for strategies (Spanish).
 * @param {ReturnType<typeof buildThreeMotorStrategies>} strategies
 */
export function renderMotorStrategiesHtml(strategies) {
  return `
    <div class="strategy-stack">
      ${strategies
        .map(
          (s) => {
            const sh =
              Number.isFinite(s.torque_Nm) &&
              s.torque_Nm > 0 &&
              Number.isFinite(s.ratio) &&
              s.ratio > 0
                ? shaftSizingFromDrive({ torqueDrum_Nm: s.torque_Nm, ratio: s.ratio })
                : null;
            const shaftRows =
              sh && Number.isFinite(sh.dMotor_suggest_mm)
                ? `<div class="strategy-card__shaft">
              <div class="strategy-card__shaft-title">Ejes (SI, orientativo)</div>
              <ul class="strategy-card__shaft-list">
                <li><span>Eje motor</span> <strong>≥ ${sh.dMotor_suggest_mm.toFixed(0)}\u00A0mm</strong> <em>(mín. ${sh.dMotor_min_mm.toFixed(1)}\u00A0mm)</em></li>
                <li><span>Salida reductor / tambor</span> <strong>≥ ${sh.dGearboxOut_suggest_mm.toFixed(0)}\u00A0mm</strong> <em>(mín. ${sh.dGearboxOut_min_mm.toFixed(1)}\u00A0mm)</em></li>
              </ul>
            </div>`
                : '';
            return `
        <article class="strategy-card">
          <h4 class="strategy-card__title">${escapeHtml(s.title)}</h4>
          <dl class="strategy-card__dl">
            <div><dt>Potencia de eje motor (orientativa)</dt><dd>${s.motor_kW.toFixed(2)}\u00A0kW</dd></div>
            <div><dt>Par de diseño en tambor</dt><dd>${s.torque_Nm.toFixed(1)}\u00A0N·m</dd></div>
            <div><dt>Velocidad tambor / relación <var>i</var></dt><dd>${s.drum_rpm.toFixed(2)}\u00A0min⁻¹ · <var>i</var> ≈ ${s.ratio.toFixed(1)}\u00A0: 1 · motor ref. ~${TYPICAL_MOTOR_NOMINAL_RPM}\u00A0min⁻¹</dd></div>
            <div><dt>Reductor sugerido</dt><dd>${escapeHtml(s.gearbox)}</dd></div>
            <div><dt>Marcas de referencia</dt><dd>${escapeHtml(s.brands)}</dd></div>
          </dl>
          ${shaftRows}
          <p class="strategy-card__why"><strong>Criterio:</strong> ${escapeHtml(s.philosophy)}</p>
          <p class="strategy-card__risk"><strong>Riesgos / revisiones:</strong> ${escapeHtml(s.risks)}</p>
        </article>`;
          },
        )
        .join('')}
    </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
