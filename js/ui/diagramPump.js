/**
 * Bomba centrífuga — esquema de instalación (succión, bomba, impulsión y H manométrica).
 */

import { clamp } from '../utils/calculations.js';

const VB_W = 860;
const VB_H = 536;

const NAVY = '#1e3a5f';
const INK = '#334155';
const MUTED = '#64748b';
const ACCENT = '#0ea5e9';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 * @param {string} p.flowLabel — ej. "48 m³/h"
 * @param {number} p.head_m
 * @param {number} p.pumpSpeed_rpm
 * @param {number} p.hydraulicPower_kW
 * @param {number} p.shaftPower_kW
 * @param {number} p.etaPump_pct
 * @param {'direct'|'gearmotor'} [p.couplingType]
 * @param {string} [p.fluidShort] — ej. "Agua · 1000 kg/m³"
 * @param {'es'|'en'} [p.lang]
 */
export function renderCentrifugalPumpDiagram(svg, p) {
  if (!svg) return;

  const en = (p.lang ?? 'es') === 'en';
  const C = en
    ? {
        title: 'Centrifugal pump',
        subtitle: 'Tank \u00b7 suction \u00b7 pump \u00b7 discharge \u00b7 total head',
        floorRef: 'Reference / floor (schematic)',
        tankLabel: 'Tank / sump',
        npshNote: 'NPSH available: validate separately',
        motorGear: 'Motor + gearbox',
        motorOnly: 'Motor',
        pumpLabel: 'Pump',
        workPoint: 'Operating point (model)',
        phPs: (Ph, Ps) =>
          `P_h \u2248 ${Number.isFinite(Ph) ? Ph.toFixed(3) : '\u2014'} kW \u00b7 P_shaft \u2248 ${Number.isFinite(Ps) ? Ps.toFixed(3) : '\u2014'} kW`,
        etaLine: (eta) => `Declared efficiency \u2248 ${eta.toFixed(0)} %`,
        aria: (flow, h) =>
          `Centrifugal pump schematic: flow ${flow}, total head ${h} metres`,
      }
    : {
        title: 'Bomba centr\u00edfuga',
        subtitle: 'Dep\u00f3sito \u00b7 succi\u00f3n \u00b7 bomba \u00b7 impulsi\u00f3n \u00b7 altura manom\u00e9trica total',
        floorRef: 'Referencia / suelo (esquema)',
        tankLabel: 'Dep\u00f3sito / pozo',
        npshNote: 'NPSH disponible: validar por separado',
        motorGear: 'Motor + reductor',
        motorOnly: 'Motor',
        pumpLabel: 'Bomba',
        workPoint: 'Punto de trabajo (modelo)',
        phPs: (Ph, Ps) =>
          `P_h \u2248 ${Number.isFinite(Ph) ? Ph.toFixed(3) : '\u2014'} kW \u00b7 P eje \u2248 ${Number.isFinite(Ps) ? Ps.toFixed(3) : '\u2014'} kW`,
        etaLine: (eta) => `Eficiencia declarada \u2248 ${eta.toFixed(0)} %`,
        aria: (flow, h) =>
          `Esquema bomba centr\u00edfuga: caudal ${flow}, altura manom\u00e9trica ${h} metros`,
      };

  const H = clamp(Number(p.head_m) || 10, 0.5, 250);
  const n = clamp(Number(p.pumpSpeed_rpm) || 1450, 100, 6000);
  const Ph = Number(p.hydraulicPower_kW);
  const Ps = Number(p.shaftPower_kW);
  const eta = clamp(Number(p.etaPump_pct) || 75, 1, 99);
  const coupling = p.couplingType === 'direct' ? 'direct' : 'gearmotor';
  const flowLabel = esc(p.flowLabel || '—');
  const fluidShort = esc(p.fluidShort || '');

  /** Altura visual de la columna de impulsión (px), correlacionada suavemente con H */
  const rise = clamp(72 + Math.sqrt(H) * 10, 80, 220);
  const qArrow = clamp(56 + (flowLabel.length > 12 ? 8 : 0), 52, 120);

  const yGround = 402;
  const footTop = 424;
  const yLiquid = yGround - 30;
  const xTankL = 72;
  const xTankR = 228;
  const cxPump = 420;
  const cyPump = yGround - 38;
  const rVolute = 52;
  const xDisStart = cxPump + rVolute + 8;
  const yDisBottom = cyPump - 12;
  const xDisCorner = xDisStart + 140;
  const yDisTop = yDisBottom - rise;
  const xDisEnd = xDisCorner + 160;

  const motorW = coupling === 'gearmotor' ? 118 : 86;
  const motorH = 44;
  const xMotor = cxPump - rVolute - motorW - 36;
  const yMotor = cyPump - motorH / 2 - 4;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', C.aria(p.flowLabel || '', H));

  svg.innerHTML = `
    <defs>
      <marker id="mkQ" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#0d9488" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkH" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${INK}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <style><![CDATA[ .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; } ]]></style>
    </defs>

    <rect width="${VB_W}" height="${VB_H}" fill="#f4f7fb" />
    <line x1="14" y1="66" x2="${VB_W - 14}" y2="66" stroke="#e2e8f0" stroke-width="1" />
    <text x="28" y="38" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, Segoe UI, sans-serif">${esc(C.title)}</text>
    <text x="28" y="56" font-size="11.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(C.subtitle)}</text>

    <!-- Suelo (solo trazo; ref. texto en pie) -->
    <line x1="40" y1="${yGround}" x2="${VB_W - 40}" y2="${yGround}" stroke="${INK}" stroke-width="1" />

    <!-- Depósito succión -->
    <rect x="${xTankL}" y="${yLiquid - 110}" width="${xTankR - xTankL}" height="122" rx="6" fill="#eef2f7" stroke="${NAVY}" stroke-width="1" />
    <rect x="${xTankL + 4}" y="${yLiquid - 20}" width="${xTankR - xTankL - 8}" height="28" fill="${ACCENT}" fill-opacity="0.35" />
    <path d="M ${xTankL + 6} ${yLiquid - 22} Q ${(xTankL + xTankR) / 2} ${yLiquid - 34} ${xTankR - 6} ${yLiquid - 22}" fill="none" stroke="#0ea5e9" stroke-width="2" opacity="0.7" />
    <text x="${(xTankL + xTankR) / 2 - 42}" y="${yLiquid - 88}" font-size="11" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">${esc(C.tankLabel)}</text>
    <text x="${(xTankL + xTankR) / 2 - 38}" y="${yLiquid + 8}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(C.npshNote)}</text>

    <!-- Tubería succión (trazo único, sin efecto tubo) -->
    <path d="M ${xTankR - 4} ${yLiquid - 6} L ${cxPump - rVolute - 6} ${yLiquid - 6} L ${cxPump - rVolute - 6} ${cyPump + 8}" fill="none" stroke="${NAVY}" stroke-width="5.5" stroke-linejoin="round" />

    <!-- Flecha caudal Q (succión); valor Q en pie del dibujo -->
    <line x1="${xTankR + 30}" y1="${yLiquid - 6}" x2="${xTankR + 30 + qArrow}" y2="${yLiquid - 6}" stroke="#0d9488" stroke-width="2" marker-end="url(#mkQ)" />

    <!-- Motor / reductor -->
    <g>
      <rect x="${xMotor}" y="${yMotor}" width="${motorW}" height="${motorH}" rx="6" fill="${NAVY}" stroke="none" />
      <text x="${xMotor + motorW / 2}" y="${yMotor + motorH / 2 + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="#f8fafc" font-family="Inter, system-ui, sans-serif">${
        coupling === 'gearmotor' ? esc(C.motorGear) : esc(C.motorOnly)
      }</text>
    </g>
    <line x1="${xMotor + motorW}" y1="${cyPump}" x2="${cxPump - rVolute}" y2="${cyPump}" stroke="${NAVY}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${cxPump - rVolute - 10}" cy="${cyPump}" r="5" fill="#64748b" stroke="#334155" />

    <!-- Voluta / bomba -->
    <g>
      <ellipse cx="${cxPump}" cy="${cyPump}" rx="${rVolute + 18}" ry="${rVolute}" fill="#64748b" stroke="${NAVY}" stroke-width="1.25" />
      <path d="M ${cxPump - 8} ${cyPump - rVolute * 0.2} A ${rVolute * 0.55} ${rVolute * 0.55} 0 1 1 ${cxPump + 10} ${cyPump + rVolute * 0.35}" fill="none" stroke="${NAVY}" stroke-width="1.25" opacity="0.45" />
      <circle cx="${cxPump - 4}" cy="${cyPump}" r="${rVolute * 0.38}" fill="${ACCENT}" fill-opacity="0.35" stroke="${NAVY}" stroke-width="1" />
      <text x="${cxPump - 6}" y="${cyPump + rVolute + 22}" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${esc(C.pumpLabel)}</text>
      <text x="${cxPump - 6}" y="${cyPump + rVolute + 38}" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="Inter, system-ui, sans-serif">n = ${n.toFixed(0)} rpm</text>
    </g>

    <!-- Impulsión -->
    <path d="M ${xDisStart} ${yDisBottom} L ${xDisCorner} ${yDisBottom} L ${xDisCorner} ${yDisTop} L ${xDisEnd} ${yDisTop}" fill="none" stroke="${NAVY}" stroke-width="5.5" stroke-linejoin="round" />

    <!-- Flecha Q impulsión -->
    <line x1="${xDisCorner + 20}" y1="${yDisTop}" x2="${xDisCorner + 20 + qArrow * 0.85}" y2="${yDisTop}" stroke="#0d9488" stroke-width="2.5" marker-end="url(#mkQ)" />

    <!-- Doble flecha H (cota fina; valor en pie de dibujo) -->
    <line x1="${xDisEnd + 48}" y1="${yDisBottom}" x2="${xDisEnd + 48}" y2="${yDisTop}" stroke="${INK}" stroke-width="1" marker-start="url(#mkH)" marker-end="url(#mkH)" />

    <!-- Pie: datos y referencias (sin caja con borde) -->
    <line x1="32" y1="${footTop}" x2="${VB_W - 32}" y2="${footTop}" stroke="#cbd5e1" stroke-width="1" />
    <text x="40" y="${footTop + 16}" font-size="9.5" font-weight="700" fill="${INK}" font-family="Inter, system-ui, sans-serif">${esc(C.workPoint)}</text>
    <text x="40" y="${footTop + 32}" font-size="9.5" fill="${MUTED}" font-family="Inter, system-ui, sans-serif">${esc(C.phPs(Ph, Ps))}</text>
    <text x="40" y="${footTop + 48}" font-size="9.5" fill="${MUTED}" font-family="Inter, system-ui, sans-serif">${esc(C.etaLine(eta))}</text>
    ${
      fluidShort
        ? `<text x="40" y="${footTop + 64}" font-size="9.5" fill="${MUTED}" font-family="Inter, system-ui, sans-serif">${fluidShort}</text>`
        : ''
    }
    <text x="40" y="${footTop + (fluidShort ? 82 : 66)}" font-size="9" fill="${MUTED}" font-family="Inter, system-ui, sans-serif">
      ${esc(C.floorRef)} · H = <tspan class="diagram-svg-num">${H.toFixed(1)}</tspan> m · Q = ${flowLabel}
    </text>
  `;
}
