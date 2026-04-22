/**
 * Transportador de rodillos motorizado — esquema visual.
 */

import { clamp } from '../utils/calculations.js';

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 */
export function renderRollerConveyorDiagram(svg, p) {
  if (!svg) return;
  const L = clamp(Number(p.length_m) || 4, 1, 25);
  const D = clamp(Number(p.rollerDiameter_mm) || 89, 40, 180);
  const n = Number(p.drumRpm);
  const v = Number(p.speed_m_s) || 0;
  const m = Number(p.loadMass_kg) || 0;

  const vbW = 980;
  const vbH = 420;
  const x0 = 115;
  const yTop = 150;
  const lenPx = Math.min(690, L * 45);
  const deckH = 96;
  const skew = 88;
  const x1 = x0 + lenPx;
  const rollers = Math.max(10, Math.min(32, Math.round(L * 3)));
  const pitch = lenPx / rollers;
  const rr = clamp(D * 0.1, 6, 12);

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="rollerBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#eef2f7"/>
      </linearGradient>
      <linearGradient id="frameBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9"/>
        <stop offset="45%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="legMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <marker id="flowArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0f766e" />
      </marker>
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#64748b" flood-opacity="0.28"/>
      </filter>
    </defs>
    <rect width="${vbW}" height="${vbH}" fill="url(#rollerBg)" />
    <rect x="20" y="16" width="${vbW - 40}" height="48" rx="12" fill="#0f766e" fill-opacity="0.08" stroke="#0d9488" />
    <text x="34" y="38" font-size="16" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Transportador de rodillos motorizado</text>
    <text x="34" y="54" font-size="11" fill="#475569" font-family="Inter, system-ui, sans-serif">Esquema 3/4 inspirado en el bastidor de referencia</text>

    <polygon
      points="${x0},${yTop} ${x1},${yTop} ${x1 + skew},${yTop + deckH} ${x0 + skew},${yTop + deckH}"
      fill="#e2e8f0"
      stroke="#64748b"
      stroke-width="2"
      filter="url(#softShadow)"
    />

    <polygon
      points="${x0 - 8},${yTop + 14} ${x1 + 8},${yTop + 14} ${x1 + skew + 8},${yTop + deckH + 14} ${x0 + skew - 8},${yTop + deckH + 14}"
      fill="url(#frameBlue)"
      opacity="0.95"
    />

    ${Array.from({ length: rollers + 1 }, (_, i) => {
      const x = x0 + i * pitch;
      const y = yTop + 8 + (i / rollers) * (deckH - 10);
      return `
        <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(rr * 1.55).toFixed(1)}" ry="${rr.toFixed(1)}" fill="url(#metal)" stroke="#64748b" stroke-width="1.2"/>
        <ellipse cx="${(x + 5).toFixed(1)}" cy="${(y - 1).toFixed(1)}" rx="${(rr * 0.85).toFixed(1)}" ry="${(rr * 0.48).toFixed(1)}" fill="#f8fafc" opacity="0.58"/>
      `;
    }).join('')}

    <polygon points="${x0 - 28},${yTop + 8} ${x0 - 6},${yTop + 24} ${x0 - 6},${yTop + deckH + 28} ${x0 - 28},${yTop + deckH + 12}" fill="#334155"/>
    <polygon points="${x1 + 4},${yTop + 8} ${x1 + 26},${yTop + 24} ${x1 + 26},${yTop + deckH + 28} ${x1 + 4},${yTop + deckH + 12}" fill="#334155"/>

    <polygon points="${x0 + 72},${yTop + deckH + 15} ${x0 + 96},${yTop + deckH + 32} ${x0 + 80},${yTop + deckH + 120} ${x0 + 56},${yTop + deckH + 102}" fill="url(#legMetal)"/>
    <polygon points="${x1 - 96},${yTop + deckH + 15} ${x1 - 72},${yTop + deckH + 32} ${x1 - 88},${yTop + deckH + 120} ${x1 - 112},${yTop + deckH + 102}" fill="url(#legMetal)"/>
    <polygon points="${x0 + skew + 124},${yTop + deckH + 12} ${x0 + skew + 149},${yTop + deckH + 28} ${x0 + skew + 129},${yTop + deckH + 113} ${x0 + skew + 104},${yTop + deckH + 95}" fill="url(#legMetal)"/>
    <polygon points="${x1 + skew - 72},${yTop + deckH + 12} ${x1 + skew - 47},${yTop + deckH + 28} ${x1 + skew - 67},${yTop + deckH + 113} ${x1 + skew - 92},${yTop + deckH + 95}" fill="url(#legMetal)"/>

    <rect x="${x0 + 10}" y="${yTop + deckH + 122}" width="${lenPx + skew - 22}" height="8" rx="3" fill="#64748b" opacity="0.55"/>
    <rect x="${x0 + 52}" y="${yTop + deckH + 56}" width="82" height="28" rx="5" fill="url(#frameBlue)"/>

    <line x1="${x0 + 18}" y1="${yTop - 26}" x2="${x1 + skew - 26}" y2="${yTop + deckH - 26}" stroke="#0f766e" stroke-width="2.6" marker-end="url(#flowArrow)" />
    <text x="${x0 + 22}" y="${yTop - 34}" font-size="10.5" font-weight="700" fill="#0f766e" font-family="Inter, system-ui, sans-serif">Sentido de avance</text>
    <text x="${x0 + 210}" y="${yTop + deckH + 8}" font-size="11" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">L ~= ${L.toFixed(1)} m</text>

    <rect x="606" y="86" width="280" height="134" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="622" y="110" font-size="10" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Datos clave</text>
    <text x="622" y="129" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Carga nominal: ${m.toFixed(0)} kg</text>
    <text x="622" y="146" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Ø rodillo motriz: ${D.toFixed(0)} mm</text>
    <text x="622" y="163" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Velocidad lineal: ${v.toFixed(2)} m/s</text>
    <text x="622" y="180" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Velocidad de giro: ${Number.isFinite(n) ? n.toFixed(1) : '—'} min^-1</text>
    <text x="622" y="197" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Rodillos instalados: ${rollers + 1}</text>
  `;
}

