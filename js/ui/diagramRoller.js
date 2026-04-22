/**
 * Transportador de rodillos motorizado - esquema visual.
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
  const x0 = 120;
  const y0 = 138;
  const lenPx = Math.min(680, L * 44);
  const depth = 78;
  const skew = 86;
  const x1 = x0 + lenPx;
  const rollers = Math.max(11, Math.min(28, Math.round(L * 2.8)));
  const pitch = lenPx / rollers;

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#eef2f7"/>
      </linearGradient>
      <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="blueBeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#2563eb"/>
      </linearGradient>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0f766e"/>
      </marker>
    </defs>

    <rect width="${vbW}" height="${vbH}" fill="url(#bg)"/>
    <rect x="20" y="16" width="${vbW - 40}" height="48" rx="12" fill="#0f766e" fill-opacity="0.08" stroke="#0d9488"/>
    <text x="34" y="39" font-size="16" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Transportador de rodillos motorizado</text>
    <text x="34" y="55" font-size="11" fill="#475569" font-family="Inter, system-ui, sans-serif">Vista 3/4 simplificada para lectura rapida</text>

    <polygon points="${x0},${y0} ${x1},${y0} ${x1 + skew},${y0 + depth} ${x0 + skew},${y0 + depth}" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <polygon points="${x0},${y0 + 16} ${x1},${y0 + 16} ${x1 + skew},${y0 + depth + 16} ${x0 + skew},${y0 + depth + 16}" fill="url(#blueBeam)"/>

    ${Array.from({ length: rollers + 1 }, (_, i) => {
      const x = x0 + i * pitch;
      const y = y0 + 8 + (i / rollers) * (depth - 8);
      return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="14" ry="7.3" fill="url(#steel)" stroke="#64748b" stroke-width="1.1"/>`;
    }).join('')}

    <polygon points="${x0 - 30},${y0 + 10} ${x0 - 10},${y0 + 24} ${x0 - 10},${y0 + depth + 26} ${x0 - 30},${y0 + depth + 12}" fill="#334155"/>
    <polygon points="${x1 + 8},${y0 + 10} ${x1 + 28},${y0 + 24} ${x1 + 28},${y0 + depth + 26} ${x1 + 8},${y0 + depth + 12}" fill="#334155"/>

    <polygon points="${x0 + 70},${y0 + depth + 14} ${x0 + 96},${y0 + depth + 30} ${x0 + 78},${y0 + depth + 118} ${x0 + 52},${y0 + depth + 100}" fill="#94a3b8"/>
    <polygon points="${x1 - 116},${y0 + depth + 14} ${x1 - 90},${y0 + depth + 30} ${x1 - 108},${y0 + depth + 118} ${x1 - 134},${y0 + depth + 100}" fill="#94a3b8"/>
    <polygon points="${x0 + skew + 100},${y0 + depth + 10} ${x0 + skew + 126},${y0 + depth + 27} ${x0 + skew + 107},${y0 + depth + 112} ${x0 + skew + 81},${y0 + depth + 94}" fill="#94a3b8"/>
    <polygon points="${x1 + skew - 68},${y0 + depth + 10} ${x1 + skew - 42},${y0 + depth + 27} ${x1 + skew - 61},${y0 + depth + 112} ${x1 + skew - 87},${y0 + depth + 94}" fill="#94a3b8"/>

    <rect x="${x0 + 54}" y="${y0 + depth + 58}" width="84" height="28" rx="5" fill="url(#blueBeam)"/>
    <rect x="${x0 + 40}" y="${y0 + depth + 122}" width="${lenPx + skew - 12}" height="7" rx="3" fill="#94a3b8"/>

    <line x1="${x0 + 18}" y1="${y0 - 24}" x2="${x1 + skew - 18}" y2="${y0 + depth - 24}" stroke="#0f766e" stroke-width="2.5" marker-end="url(#arrow)"/>
    <text x="${x0 + 20}" y="${y0 - 32}" font-size="10.5" font-weight="700" fill="#0f766e" font-family="Inter, system-ui, sans-serif">Sentido de avance</text>

    <rect x="620" y="86" width="250" height="132" rx="12" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="635" y="110" font-size="10" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Datos clave</text>
    <text x="635" y="128" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Carga nominal: ${m.toFixed(0)} kg</text>
    <text x="635" y="145" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Diam. rodillo: ${D.toFixed(0)} mm</text>
    <text x="635" y="162" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Velocidad lineal: ${v.toFixed(2)} m/s</text>
    <text x="635" y="179" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Velocidad de giro: ${Number.isFinite(n) ? n.toFixed(1) : '--'} min^-1</text>
    <text x="635" y="196" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Rodillos: ${rollers + 1}</text>
  `;
}

