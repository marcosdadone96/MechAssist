/**
 * Transportador de tornillo — esquema lateral (canal, hélice, longitud e inclinación).
 */

import { clamp } from '../utils/calculations.js';
import { getCurrentLang } from '../config/locales.js';

const VB_W = 860;
/** Alto suficiente para panel de geometría en varias filas sin solapar con cotas del dibujo. */
const VB_H = 604;

const NAVY = '#1e3a5f';
const TROUGH = '#cbd5e1';

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
 */
export function renderScrewConveyorDiagram(svg, p) {
  if (!svg) return;

  const lang = p.lang ?? getCurrentLang();
  const en = lang === 'en';
  const T = {
    title: en ? 'Screw conveyor' : 'Transportador de tornillo helicoidal',
    sub: en
      ? 'Side view · bulk flow and screw rotation'
      : 'Vista lateral clara · flujo de material y giro del conjunto',
    materialFlow: en ? 'Bulk flow' : 'Flujo material',
    inlet: en ? 'Inlet' : 'Entrada',
    outlet: en ? 'Discharge' : 'Descarga',
    geomPanel: en ? 'Geometry (inputs)' : 'Geometría (entrada)',
    screwDia: en ? 'Screw OD ~' : 'Ø tornillo ≈',
    pitch: en ? 'Helix pitch ~' : 'Paso helicoidal ≈',
    troughLoad: en ? 'Trough fill:' : 'Carga canal:',
    cap: en ? 'Capacity:' : 'Capacidad:',
    lengthLab: en ? 'Length ~' : 'L ≈',
  };

  const Lm = clamp(Number(p.length_m) || 10, 1, 120);
  const Dmm = clamp(Number(p.diameter_mm) || 250, 80, 1500);
  const pitchMm = clamp(Number(p.pitch_mm) || 200, 50, 800);
  const deg = clamp(Number(p.angle_deg) || 0, 0, 90);
  const n = Number(p.screwRpm);
  const capLabel = esc(p.capLabel || '—');
  const λLabel = esc(p.troughLabel || '30 %');

  const scaleX = Math.min(600 / Lm, 48);
  const Lpx = Lm * scaleX;
  const y0 = 350;
  const x0 = 92;
  const troughH = clamp(Dmm * 0.32, 32, 66);
  const screwR = clamp(Dmm * 0.12, 12, 42);
  const θ = (deg * Math.PI) / 180;
  const dx = Math.cos(θ) * Lpx;
  const dy = Math.sin(θ) * Lpx;
  const x1 = x0 + dx;
  const y1 = y0 - dy;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const outletCx = x1;
  const outletCy = y1 + troughH * 0.5;
  const helixTurns = Math.max(6, Math.min(18, Math.round(Lm * 0.8)));
  const sideOffset = troughH * 0.45;

  /** Pie en dos columnas; ~22 px entre líneas base para evitar solapes (texto ~9.5px). */
  const footerSepY = VB_H - 152;
  const footerTitleY = VB_H - 128;
  const footerRow = (i) => VB_H - 108 + i * 22;
  const footerCol2 = 460;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <marker id="arrArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#0d9488" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <style><![CDATA[ .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; } ]]></style>
    </defs>
    <rect width="${VB_W}" height="${VB_H}" fill="#f4f7fb" />
    <text x="26" y="34" font-size="16" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${esc(T.title)}</text>
    <text x="26" y="52" font-size="11" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.sub)}</text>

    <line x1="38" y1="${y0 + troughH + 34}" x2="${VB_W - 40}" y2="${y0 + troughH + 34}" stroke="${NAVY}" stroke-width="1" />

    <!-- Canal -->
    <path d="M ${x0} ${y0} L ${x1} ${y1} L ${x1} ${y1 + troughH} L ${x0} ${y0 + troughH} Z" fill="${TROUGH}" fill-opacity="0.85" stroke="${NAVY}" stroke-width="1.25" />
    <path d="M ${x0} ${y0} L ${x1} ${y1}" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" />
    <path d="M ${x0} ${y0 + troughH} L ${x1} ${y1 + troughH}" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" />

    <!-- Eje + palas simplificadas -->
    <line x1="${x0}" y1="${y0 + troughH * 0.5}" x2="${x1}" y2="${y1 + troughH * 0.5}" stroke="#0f766e" stroke-width="5" stroke-linecap="round" />
    <g stroke="#0d9488" stroke-width="2.4" fill="none" opacity="0.95">
      ${Array.from({ length: helixTurns }, (_, i) => {
        const t = (i + 0.5) / helixTurns;
        const cx = x0 + t * dx;
        const cy = y0 + t * (y1 - y0) + troughH * 0.5;
        const rx = clamp(pitchMm * 0.04, 8, 22);
        const ry = clamp(troughH * 0.33, 10, 24);
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${-deg} ${cx} ${cy})" />`;
      }).join('')}
    </g>
    <circle cx="${x0}" cy="${y0 + troughH * 0.5}" r="${screwR}" fill="#134e4a" fill-opacity="0.25" stroke="#0f766e" stroke-width="2" />
    <circle cx="${x1}" cy="${y1 + troughH * 0.5}" r="${screwR}" fill="#134e4a" fill-opacity="0.25" stroke="#0f766e" stroke-width="2" />

    <!-- Flujo -->
    <line x1="${x0 + 10}" y1="${y0 + troughH * 0.17}" x2="${x1 - 16}" y2="${y1 + troughH * 0.17}" stroke="#0d9488" stroke-width="1.45" marker-end="url(#arrArrow)" />
    <text x="${midX - 24}" y="${midY - sideOffset}" class="diagram-svg-label--on-drawing" font-size="10.5" font-weight="700" fill="#0f766e" font-family="Inter, system-ui, sans-serif">${esc(T.materialFlow)}</text>

    <!-- Etiquetas de proceso (L y datos → solo panel inferior; θ fuera del círculo de descarga) -->
    <text x="${x0 - 4}" y="${y0 - 14}" font-size="10.5" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">${esc(T.inlet)}</text>
    <text x="${x1 - 10}" y="${y1 - 14}" font-size="10.5" font-weight="700" fill="#334155" text-anchor="end" font-family="Inter, system-ui, sans-serif">${esc(T.outlet)}</text>
    <text x="${outletCx}" y="${outletCy - screwR - 14}" text-anchor="middle" class="diagram-svg-label--on-drawing" font-size="10.5" font-weight="600" fill="${NAVY}" font-family="Inter, system-ui, sans-serif">θ = <tspan class="diagram-svg-num">${deg.toFixed(0)}</tspan>°</text>

    <line x1="32" y1="${footerSepY}" x2="${VB_W - 32}" y2="${footerSepY}" stroke="#e2e8f0" stroke-width="1" />
    <text x="40" y="${footerTitleY}" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${esc(T.geomPanel)}</text>
    <text x="40" y="${footerRow(0)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.screwDia)} <tspan class="diagram-svg-num">${Dmm.toFixed(0)}</tspan> mm</text>
    <text x="40" y="${footerRow(1)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.pitch)} <tspan class="diagram-svg-num">${pitchMm.toFixed(0)}</tspan> mm</text>
    <text x="40" y="${footerRow(2)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${
      Number.isFinite(n) ? `n ≈ <tspan class="diagram-svg-num">${n.toFixed(1)}</tspan> rpm` : 'n —'
    }</text>
    <text x="40" y="${footerRow(3)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.lengthLab)} <tspan class="diagram-svg-num">${Lm.toFixed(1)}</tspan> m</text>
    <text x="${footerCol2}" y="${footerRow(0)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.troughLoad)} ${λLabel}</text>
    <text x="${footerCol2}" y="${footerRow(1)}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${esc(T.cap)} ${capLabel}</text>
  `;
}
