/**
 * Transportador de tornillo — esquema lateral (canal, hélice, longitud e inclinación).
 */

import { clamp } from '../utils/calculations.js';

const VB_W = 860;
const VB_H = 480;

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

  const Lm = clamp(Number(p.length_m) || 10, 1, 120);
  const Dmm = clamp(Number(p.diameter_mm) || 250, 80, 1500);
  const pitchMm = clamp(Number(p.pitch_mm) || 200, 50, 800);
  const deg = clamp(Number(p.angle_deg) || 0, 0, 90);
  const n = Number(p.screwRpm);
  const capLabel = esc(p.capLabel || '—');
  const λLabel = esc(p.troughLabel || '30 %');

  const scaleX = Math.min(620 / Lm, 48);
  const Lpx = Lm * scaleX;
  const y0 = 380;
  const x0 = 80;
  const troughH = clamp(Dmm * 0.35, 36, 72);
  const screwR = clamp(Dmm * 0.16, 14, 52);
  const θ = (deg * Math.PI) / 180;
  const dx = Math.cos(θ) * Lpx;
  const dy = Math.sin(θ) * Lpx;
  const x1 = x0 + dx;
  const y1 = y0 - dy;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <linearGradient id="bgScrew" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f0fdfa" />
        <stop offset="100%" stop-color="#e0f2fe" />
      </linearGradient>
      <linearGradient id="troughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#94a3b8" />
      </linearGradient>
    </defs>
    <rect width="${VB_W}" height="${VB_H}" fill="url(#bgScrew)" />
    <rect x="12" y="12" width="${VB_W - 24}" height="50" rx="12" fill="#0f766e" fill-opacity="0.1" stroke="#0d9488" stroke-width="1.5" />
    <text x="26" y="36" font-size="16" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Transportador de tornillo helicoidal</text>
    <text x="26" y="52" font-size="11" fill="#475569" font-family="Inter, system-ui, sans-serif">Vista lateral esquemática · no a escala</text>

    <line x1="40" y1="${y0 + troughH + 28}" x2="${VB_W - 40}" y2="${y0 + troughH + 28}" stroke="#64748b" stroke-width="2.5" />

    <!-- Canal (trough) -->
    <path d="M ${x0} ${y0} L ${x1} ${y1} L ${x1} ${y1 + troughH} L ${x0} ${y0 + troughH} Z" fill="url(#troughGrad)" stroke="#475569" stroke-width="2" opacity="0.92" />
    <path d="M ${x0} ${y0} L ${x1} ${y1}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />

    <!-- Hélice aproximada -->
    <g stroke="#0d9488" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.9">
      ${Array.from({ length: Math.min(40, Math.ceil(Lm * 2)) }, (_, i) => {
        const t = i / Math.max(1, Math.ceil(Lm * 2) - 1);
        const xs = x0 + t * dx;
        const ys = y0 + t * dy - screwR * Math.sin(t * Math.PI * (Lm * 1.2));
        const xs2 = x0 + t * dx;
        const ys2 = y0 + t * dy + troughH * 0.35;
        return `<path d="M ${xs - 4} ${ys} Q ${xs2} ${(ys + ys2) / 2} ${xs + 4} ${ys2}" />`;
      }).join('')}
    </g>
    <circle cx="${x0}" cy="${y0 + troughH * 0.45}" r="${screwR}" fill="#134e4a" fill-opacity="0.25" stroke="#0f766e" stroke-width="2" />
    <circle cx="${x1}" cy="${y1 + troughH * 0.45}" r="${screwR}" fill="#134e4a" fill-opacity="0.25" stroke="#0f766e" stroke-width="2" />

    <!-- Cotas -->
    <text x="${(x0 + x1) / 2 - 40}" y="${Math.min(y0, y1) - 18}" font-size="11" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">L ≈ ${Lm.toFixed(1)} m</text>
    <text x="${x1 + 14}" y="${(y1 + y0) / 2}" font-size="11" font-weight="700" fill="#9a3412" font-family="Inter, system-ui, sans-serif">θ = ${deg.toFixed(0)}°</text>

    <rect x="520" y="88" width="300" height="118" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="536" y="114" font-size="10" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Geometría (entrada)</text>
    <text x="536" y="134" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Ø ≈ ${Dmm.toFixed(0)} mm · paso ≈ ${pitchMm.toFixed(0)} mm</text>
    <text x="536" y="152" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Carga canal: ${λLabel}</text>
    <text x="536" y="170" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">Capacidad: ${capLabel}</text>
    <text x="536" y="188" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${
      Number.isFinite(n) ? `n ≈ ${n.toFixed(1)} min⁻¹` : 'n —'
    }</text>
  `;
}
