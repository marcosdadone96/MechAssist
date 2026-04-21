/**
 * Cinta inclinada — esquema detallado; flechas sobre la pendiente en posiciones separadas.
 */

import { clamp, radToDeg } from '../utils/calculations.js';

const VB_W = 860;
const VB_H = 628;

/**
 * @param {SVGSVGElement} svg
 * @param {object} p
 */
export function renderInclinedConveyorDiagram(svg, p) {
  if (!svg) return;

  const L = clamp(p.length_m || 12, 2, 100);
  const H = Math.max(0, p.height_m || 0);
  const ang = p.angle_rad ?? Math.asin(clamp(H / L, 0, 1));
  const θdeg = radToDeg(ang);
  const v = Math.max(0, p.beltSpeed_m_s || 0);
  const Ft = Math.max(0, p.totalForce_N || 0);
  const Fg = Math.max(0, p.gravityForce_N || 0);
  const Fmu = Math.max(0, p.frictionForce_N || 0);
  const m = Math.max(0, p.loadMass_kg || 0);
  const mu = Math.max(0, p.frictionCoeff ?? 0);
  const Pd = Math.max(0, p.powerAtDrum_W || 0);
  const Td = Math.max(0, p.torqueAtDrum_Nm || 0);

  const run = 420;
  const x0 = 118;
  const y0 = 318;
  const x1 = x0 + run * Math.cos(ang);
  const y1 = y0 - run * Math.sin(ang);

  const r = 28;
  const beltH = 12;

  const tx = Math.cos(ang);
  const ty = -Math.sin(ang);
  const nx = -Math.sin(ang);
  const ny = -Math.cos(ang);

  const drum0x = x0 + nx * 12;
  const drum0y = y0 + ny * 12;
  const drum1x = x1 + nx * 12;
  const drum1y = y1 + ny * 12;

  const u0x = drum0x - tx * r;
  const u0y = drum0y - ty * r;
  const u1x = drum1x - tx * r;
  const u1y = drum1y - ty * r;

  const off = beltH / 2;
  const top0x = u0x + nx * off;
  const top0y = u0y + ny * off;
  const top1x = u1x + nx * off;
  const top1y = u1y + ny * off;

  const bot0x = u0x - nx * off;
  const bot0y = u0y - ny * off;
  const bot1x = u1x - nx * off;
  const bot1y = u1y - ny * off;

  const loadT = 0.46;
  const loadCx = x0 + (x1 - x0) * loadT + nx * (30 + beltH);
  const loadCy = y0 + (y1 - y0) * loadT + ny * (30 + beltH);
  const loadW = 54;
  const loadH = 32;

  const Fref = 12000;
  const arrV = clamp(46 + v * 36, 42, 105);
  const legFg = clamp(40 + (Fg / Fref) * 55, 36, 92);
  const legFmu = clamp(36 + (Fmu / Fref) * 50, 32, 85);
  const legFt = clamp(44 + (Ft / Fref) * 58, 40, 108);

  /** Misma referencia que rodillos: línea de transporte + normal (positivo = encima de la rama portante en pantalla). */
  const beltRef = 20 + beltH * 0.35;
  const onBelt = (t, nExtra) => {
    const bx = x0 + (x1 - x0) * t;
    const by = y0 + (y1 - y0) * t;
    const d = beltRef + nExtra;
    return { x: bx + nx * d, y: by + ny * d };
  };

  const rollerPts = [0.18, 0.33, 0.5, 0.68, 0.84].map((t) => ({
    x: x0 + (x1 - x0) * t + nx * (20 + beltH * 0.35),
    y: y0 + (y1 - y0) * t + ny * (20 + beltH * 0.35),
  }));

  const dUpX = tx;
  const dUpY = ty;
  const dResX = -tx;
  const dResY = -ty;

  const pv0 = onBelt(0.12, 32);
  const pv1 = { x: pv0.x + dUpX * arrV, y: pv0.y + dUpY * arrV };
  const pvMx = (pv0.x + pv1.x) / 2 + nx * 14;
  const pvMy = (pv0.y + pv1.y) / 2 + ny * 14;

  const fg0 = onBelt(0.58, -38);
  const fg1 = { x: fg0.x + dResX * legFg, y: fg0.y + dResY * legFg };
  const fgMx = (fg0.x + fg1.x) / 2 - nx * 20;
  const fgMy = (fg0.y + fg1.y) / 2 - ny * 20;

  const mu0 = onBelt(0.34, 48);
  const mu1 = { x: mu0.x + dResX * legFmu, y: mu0.y + dResY * legFmu };
  const muMx = (mu0.x + mu1.x) / 2 + nx * 24;
  const muMy = (mu0.y + mu1.y) / 2 + ny * 24;

  const ft0 = onBelt(0.72, 20);
  const ft1 = { x: ft0.x + dResX * legFt, y: ft0.y + dResY * legFt };
  const ftMx = (ft0.x + ft1.x) / 2 - nx * 12;
  const ftMy = (ft0.y + ft1.y) / 2 - ny * 12;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <linearGradient id="bgInc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff7ed" />
        <stop offset="50%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#ecfeff" />
      </linearGradient>
      <marker id="mkVi" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#059669" />
      </marker>
      <marker id="mkGi" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#c2410c" />
      </marker>
      <marker id="mkMi" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#7c3aed" />
      </marker>
      <marker id="mkTi" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#0f172a" />
      </marker>
      <filter id="shInc" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.11" />
      </filter>
      <linearGradient id="beltIncG" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="url(#bgInc)" />
    <rect x="12" y="12" width="${VB_W - 24}" height="54" rx="12" fill="#ea580c" fill-opacity="0.1" stroke="#ea580c" stroke-width="1.5" />
    <text x="28" y="38" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Cinta inclinada · subida</text>
    <text x="28" y="56" font-size="11.5" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Cada flecha va en carril distinto (paralelas a la banda) para que no se crucen</text>

    <line x1="72" y1="${y0 + 14}" x2="${VB_W - 72}" y2="${y0 + 14}" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="78" y="${y0 + 28}" font-size="10" fill="#94a3b8" font-family="Inter, Segoe UI, sans-serif">Referencia horizontal</text>

    <polygon points="${x0 - 18},${y0 + 8} ${x0 + 52},${y0 + 8} ${x0 + 8},${y0 + 38}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2" opacity="0.9" />
    <text x="${x0 - 8}" y="${y0 + 52}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Cimentación / soporte bajo</text>

    <line x1="${bot0x}" y1="${bot0y}" x2="${bot1x}" y2="${bot1y}" stroke="#94a3b8" stroke-width="10" stroke-linecap="round" />
    <line x1="${bot0x}" y1="${bot0y}" x2="${bot1x}" y2="${bot1y}" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="11 8" stroke-linecap="round" />

    ${rollerPts
      .map(
        (pt) => `
    <line x1="${pt.x - nx * 9}" y1="${pt.y - ny * 9}" x2="${pt.x + nx * 16}" y2="${pt.y + ny * 16}" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="${pt.x + nx * 14}" cy="${pt.y + ny * 14}" r="5.5" fill="#e2e8f0" stroke="#64748b" stroke-width="1.4" />`,
      )
      .join('')}

    <polygon points="${top0x},${top0y} ${top1x},${top1y} ${top1x - nx * beltH},${top1y - ny * beltH} ${top0x - nx * beltH},${top0y - ny * beltH}"
      fill="url(#beltIncG)" stroke="#0f172a" stroke-width="1.3" stroke-linejoin="round" filter="url(#shInc)" />
    <text transform="translate(${(top0x + top1x) / 2 - 38}, ${(top0y + top1y) / 2 - 18}) rotate(${-θdeg})" font-size="12" font-weight="800" fill="#f8fafc" font-family="Inter, Segoe UI, sans-serif" stroke="#0f172a" stroke-width="0.35" paint-order="stroke">Banda</text>

    <circle cx="${drum0x}" cy="${drum0y}" r="${r}" fill="#e2e8f0" stroke="#334155" stroke-width="3" filter="url(#shInc)" />
    <text x="${drum0x - 18}" y="${drum0y + 5}" font-size="10" font-weight="800" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Cola</text>

    <circle cx="${drum1x}" cy="${drum1y}" r="${r}" fill="#a7f3d0" stroke="#047857" stroke-width="3.2" filter="url(#shInc)" />
    <text x="${drum1x - 26}" y="${drum1y + 5}" font-size="10" font-weight="800" fill="#065f46" font-family="Inter, Segoe UI, sans-serif">Motriz</text>
    <text x="${drum1x + r + 8}" y="${drum1y - 10}" font-size="11" font-weight="800" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Tambor motriz</text>

    <g transform="translate(${drum1x + r + 10}, ${drum1y - r - 50})">
      <rect x="0" y="0" width="50" height="32" rx="5" fill="#bae6fd" stroke="#0369a1" stroke-width="1.2" />
      <text x="6" y="21" font-size="10" font-weight="700" fill="#0369a1" font-family="Inter, Segoe UI, sans-serif">Motor</text>
      <rect x="58" y="6" width="34" height="22" rx="4" fill="#d1fae5" stroke="#047857" stroke-width="1.2" />
      <text x="63" y="21" font-size="9" font-weight="700" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Red.</text>
    </g>

    <path d="M ${x0 + 50} ${y0} A 50 50 0 0 0 ${x0 + 50 * Math.cos(ang)} ${y0 - 50 * Math.sin(ang)}" fill="none" stroke="#475569" stroke-width="1.5" />
    <text x="${x0 + 64}" y="${y0 - 22}" font-size="13" font-weight="800" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Ángulo θ = ${θdeg.toFixed(1)}°</text>
    <line x1="${x1 + 28}" y1="${y1 - 8}" x2="${x1 + 28}" y2="${y1 - 38}" stroke="#94a3b8" stroke-width="1.2" />
    <text x="${x1 + 34}" y="${y1 - 20}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Descarga (esquema)</text>

    <g transform="rotate(${-θdeg} ${loadCx} ${loadCy})" filter="url(#shInc)">
      <rect x="${loadCx - loadW / 2}" y="${loadCy - loadH / 2}" width="${loadW}" height="${loadH}" rx="5" fill="#5eead4" stroke="#0f766e" stroke-width="2" />
    </g>
    <text x="${loadCx - 36}" y="${loadCy + 5}" font-size="11" font-weight="800" fill="#134e4a" font-family="Inter, Segoe UI, sans-serif">m = ${m.toFixed(0)} kg</text>

    <!-- Flechas: carriles separados (distinto t y distinto offset normal) -->
    <path d="M ${pv0.x} ${pv0.y} Q ${pvMx} ${pvMy} ${pv1.x} ${pv1.y}" fill="none" stroke="#059669" stroke-width="3" marker-end="url(#mkVi)" />
    <text transform="translate(${pvMx + 12}, ${pvMy - 8}) rotate(${-θdeg})" font-size="10" font-weight="800" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Sube ${v.toFixed(2)} m/s</text>

    <path d="M ${fg0.x} ${fg0.y} Q ${fgMx} ${fgMy} ${fg1.x} ${fg1.y}" fill="none" stroke="#c2410c" stroke-width="2.6" stroke-dasharray="7 5" marker-end="url(#mkGi)" />
    <rect x="${fgMx - 76}" y="${fgMy - 36}" width="138" height="30" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="#fdba74" />
    <text x="${fgMx - 70}" y="${fgMy - 22}" font-size="9" font-weight="800" fill="#9a3412" font-family="Inter, Segoe UI, sans-serif">Peso en pendiente ${Fg.toFixed(0)} N</text>
    <text x="${fgMx - 70}" y="${fgMy - 10}" font-size="8" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Componente que frena la subida</text>

    <path d="M ${mu0.x} ${mu0.y} Q ${muMx} ${muMy} ${mu1.x} ${mu1.y}" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#mkMi)" />
    <rect x="${muMx - 74}" y="${muMy - 38}" width="148" height="32" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="#c4b5fd" />
    <text x="${muMx - 68}" y="${muMy - 24}" font-size="9" font-weight="800" fill="#5b21b6" font-family="Inter, Segoe UI, sans-serif">Rozamiento ${Fmu.toFixed(0)} N</text>
    <text x="${muMx - 68}" y="${muMy - 12}" font-size="8" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Coef. μ ≈ ${mu.toFixed(2)}</text>

    <path d="M ${ft0.x} ${ft0.y} Q ${ftMx} ${ftMy} ${ft1.x} ${ft1.y}" fill="none" stroke="#0f172a" stroke-width="3.2" marker-end="url(#mkTi)" />
    <rect x="${ftMx - 82}" y="${ftMy - 42}" width="168" height="34" rx="5" fill="#ffffff" fill-opacity="0.96" stroke="#64748b" />
    <text x="${ftMx - 76}" y="${ftMy - 26}" font-size="10" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Resistencia total ${Ft.toFixed(0)} N</text>
    <text x="${ftMx - 76}" y="${ftMy - 12}" font-size="8.5" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Suma efectos · referencia en tambor</text>

    <g transform="translate(${VB_W - 248}, 86)">
      <rect x="0" y="0" width="220" height="52" rx="6" fill="#ffffff" fill-opacity="0.94" stroke="#e2e8f0" />
      <text x="8" y="16" font-size="8.5" font-weight="800" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Leyenda de flechas</text>
      <line x1="8" y1="28" x2="28" y2="28" stroke="#059669" stroke-width="2.2" marker-end="url(#mkVi)" />
      <text x="34" y="31" font-size="8" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Avance banda</text>
      <line x1="8" y1="40" x2="28" y2="40" stroke="#c2410c" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#mkGi)" />
      <text x="34" y="43" font-size="8" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Peso</text>
      <line x1="118" y1="28" x2="138" y2="28" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#mkMi)" />
      <text x="144" y="31" font-size="8" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Rozam.</text>
      <line x1="118" y1="40" x2="138" y2="40" stroke="#0f172a" stroke-width="2.2" marker-end="url(#mkTi)" />
      <text x="144" y="43" font-size="8" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Total</text>
    </g>

    <text x="${(x0 + x1) / 2 - 18}" y="${(y0 + y1) / 2 + 48}" font-size="11" font-weight="600" fill="#475569" font-family="Inter, Segoe UI, sans-serif">L = ${L.toFixed(1)} m</text>
    <line x1="${x1 + 14}" y1="${y1}" x2="${x1 + 14}" y2="${y0}" stroke="#94a3b8" stroke-dasharray="3 3" />
    <text x="${x1 + 22}" y="${(y0 + y1) / 2}" font-size="11" font-weight="600" fill="#475569" font-family="Inter, Segoe UI, sans-serif">H = ${H.toFixed(2)} m</text>

    <g transform="translate(24, ${VB_H - 112})">
      <rect x="0" y="0" width="${VB_W - 48}" height="${p.detail ? 94 : 72}" rx="10" fill="#ffffff" stroke="#ea580c" stroke-width="1.5" fill-opacity="0.97" />
      <text x="14" y="22" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Resumen en el tambor</text>
      ${
        p.detail
          ? `<text x="14" y="42" font-size="9.5" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Régimen ${(p.detail.F_steady_N ?? 0).toFixed(0)} N · Arranque ${(p.detail.F_total_start_N ?? 0).toFixed(0)} N</text>
      <text x="14" y="58" font-size="10" font-weight="700" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Potencia ${Pd.toFixed(0)} W · Par ${Td.toFixed(1)} N·m</text>
      <text x="14" y="76" font-size="9" fill="#94a3b8" font-family="Inter, Segoe UI, sans-serif">Tiempo arranque ${(p.detail.accelTime_s ?? 0).toFixed(2)} s · Factor inercia ${(p.detail.inertiaStartingFactor ?? 1).toFixed(2)}</text>`
          : `<text x="14" y="50" font-size="10" font-weight="700" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Potencia ${Pd.toFixed(0)} W · Par ${Td.toFixed(1)} N·m</text>`
      }
    </g>
  `;
}
