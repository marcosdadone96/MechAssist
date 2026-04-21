/**
 * SVG: transmisión por correa abierta — vista esquemática legible (taller).
 * Convención: izquierda = polea 1 motriz (d₁), derecha = polea 2 conducida (d₂).
 */

import { svgOpenBeltLoopPath, svgOpenBeltTangents } from './diagramGeometry.js';

function uid() {
  return `b${Math.random().toString(36).slice(2, 10)}`;
}

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {number} x @param {string[]} lines */
function tspansBlock(x, lines) {
  return lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? '0' : '1.2em'}">${escXml(line)}</tspan>`)
    .join('');
}

/** @param {import('./beltDrives.js').BeltDriveType | string} t */
function beltTypeTitle(t) {
  switch (t) {
    case 'synchronous':
      return 'Correa síncrona (dentada)';
    case 'flat':
      return 'Correa plana';
    case 'poly_v':
      return 'Correa estriada (Poly-V)';
    default:
      return 'Correa trapezoidal (en V)';
  }
}

/** @param {import('./beltDrives.js').BeltDriveType | string} t */
function beltStrokeStyle(t) {
  switch (t) {
    case 'synchronous':
      return { w: 11, dash: '5 4', accent: '#0369a1', rim: '#7dd3fc' };
    case 'flat':
      return { w: 10, dash: 'none', accent: '#57534e', rim: '#d6d3d1' };
    case 'poly_v':
      return { w: 10, dash: '3 3', accent: '#a16207', rim: '#fcd34d' };
    default:
      return { w: 12, dash: '8 6', accent: '#92400e', rim: '#fdba74' };
  }
}

/**
 * @param {SVGSVGElement | null} el
 * @param {object} r — salida de computeBeltDriveTransmission
 */
export function renderBeltDriveDiagram(el, r) {
  if (!el || !r || r.d1 == null || r.d2 == null) return;
  const id = uid();
  const vbW = 760;
  const headerY = 92;
  const y = 268;
  let sx = 0.36;
  let xL = 108;
  /** Motriz (1) izquierda: radio primitivo d₁/2; conducida (2) derecha: d₂/2 */
  let rMot = (r.d1 / 2) * sx;
  let rDrv = (r.d2 / 2) * sx;
  let Cpx = r.center_mm * sx;
  let xR = xL + Cpx;
  let guard = 0;
  while (xR + rDrv > vbW - 48 && guard++ < 40) {
    sx *= 0.91;
    rMot = (r.d1 / 2) * sx;
    rDrv = (r.d2 / 2) * sx;
    Cpx = r.center_mm * sx;
    xL = Math.max(72, 96);
    xR = xL + Cpx;
  }

  const beltPath = svgOpenBeltLoopPath(xL, y, rMot, xR, rDrv);
  const tang = svgOpenBeltTangents(xL, y, rMot, xR, rDrv);
  const midTopX = (tang.UL.x + tang.UR.x) / 2;
  const midTopY = (tang.UL.y + tang.UR.y) / 2 - 8;

  const Lm = r.beltLength_mm / 1000;
  const dimY = y + Math.max(rMot, rDrv) + 52;
  const tagY = dimY + 36;
  const vbH = tagY + 56;

  const bt = r.beltType || 'v_trapezoidal';
  const title = beltTypeTitle(bt);
  const bst = beltStrokeStyle(bt);

  const linesDrv =
    bt === 'synchronous' && r.Z2 != null
      ? ['Polea 2 · conducida', `Z₂ = ${r.Z2} · d₂ = ${r.d2.toFixed(0)} mm`]
      : ['Polea 2 · conducida', `d₂ = ${r.d2.toFixed(0)} mm`];
  const linesMot =
    bt === 'synchronous' && r.Z1 != null
      ? ['Polea 1 · motriz (n₁)', `Z₁ = ${r.Z1} · d₁ = ${r.d1.toFixed(0)} mm`]
      : ['Polea 1 · motriz (n₁)', `d₁ = ${r.d1.toFixed(0)} mm`];

  const foot =
    `Tramo abierto · L ≈ ${Lm.toFixed(2)} m · C = ${(r.center_mm / 1000).toFixed(2)} m · ` +
    `β menor = ${r.wrapAngle_deg_small.toFixed(1)}° · β mayor = ${r.wrapAngle_deg_large.toFixed(1)}°`;

  const syncTeeth = (cx, cy, radius, nTeeth) => {
    if (bt !== 'synchronous' || nTeeth < 10) return '';
    const step = (2 * Math.PI) / nTeeth;
    const tick = Math.min(0.07 * radius, 4.5);
    let d = '';
    for (let i = 0; i < nTeeth; i++) {
      const a = i * step - Math.PI / 2;
      const x0 = cx + (radius - tick) * Math.cos(a);
      const y0 = cy + (radius - tick) * Math.sin(a);
      const x1 = cx + (radius + tick * 0.35) * Math.cos(a);
      const y1 = cy + (radius + tick * 0.35) * Math.sin(a);
      d += `M ${x0.toFixed(2)} ${y0.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)} `;
    }
    return `<path d="${d}" fill="none" stroke="#0c4a6e" stroke-width="1" opacity="0.9" />`;
  };

  const teethMot = syncTeeth(xL, y, rMot, Number(r.Z1) || 20);
  const teethDrv = syncTeeth(xR, y, rDrv, Number(r.Z2) || 40);

  const n1CueY = y - rMot - 26;
  const n1Arrow = `<g aria-label="Sentido de giro motor">
      <path d="M ${(xL - 18).toFixed(1)} ${(n1CueY + 10).toFixed(1)} Q ${xL.toFixed(1)} ${(n1CueY - 6).toFixed(1)} ${(xL + 18).toFixed(1)} ${(n1CueY + 10).toFixed(1)}" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linecap="round" marker-end="url(#${id}Arr)"/>
      <text x="${xL}" y="${n1CueY - 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#0f766e" font-family="Inter, system-ui, sans-serif">n₁</text>
    </g>`;
  const shaftH = 64;

  el.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${id}Bg" x1="0" y1="0" x2="${vbW}" y2="${vbH}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
      <linearGradient id="${id}FaceMot" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ecfdf5" />
        <stop offset="100%" stop-color="#5eead4" />
      </linearGradient>
      <linearGradient id="${id}FaceDrv" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#94a3b8" />
      </linearGradient>
      <filter id="${id}Sh" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.2" />
      </filter>
      <filter id="${id}BeltSh" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25" />
      </filter>
      <marker id="${id}Ae" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#334155"/></marker>
      <marker id="${id}As" markerWidth="9" markerHeight="9" refX="0" refY="4.5" orient="auto"><path d="M9,0 L0,4.5 L9,9 Z" fill="#334155"/></marker>
      <marker id="${id}Arr" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#0f766e"/></marker>
    </defs>

    <rect width="${vbW}" height="${vbH}" fill="url(#${id}Bg)" />

    <!-- Cabecera -->
    <rect x="20" y="16" width="${vbW - 40}" height="${headerY - 24}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text x="36" y="42" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${title}</text>
    <text x="36" y="64" font-size="11" fill="#475569" font-family="Inter, system-ui, sans-serif">Vista esquemática · tramo abierto · primitivos y distancia entre ejes C</text>

    <!-- Leyenda -->
    <g transform="translate(36, 72)">
      <rect x="0" y="0" width="320" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
      <circle cx="18" cy="18" r="8" fill="url(#${id}FaceMot)" stroke="#0f766e" stroke-width="1.5" />
      <text x="32" y="15" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Izquierda = motriz (1)</text>
      <text x="32" y="28" font-size="8.5" fill="#64748b" font-family="Inter, system-ui, sans-serif">Entrada n₁ · diámetro d₁</text>
      <circle cx="188" cy="18" r="10" fill="url(#${id}FaceDrv)" stroke="#475569" stroke-width="1.5" />
      <text x="206" y="15" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Derecha = conducida (2)</text>
      <text x="206" y="28" font-size="8.5" fill="#64748b" font-family="Inter, system-ui, sans-serif">Salida n₂ · diámetro d₂</text>
    </g>

    <!-- Línea de centros -->
    <line x1="${xL - rMot - 20}" y1="${y}" x2="${xR + rDrv + 20}" y2="${y}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6 5" opacity="0.9" />
    <text x="${xL + Cpx / 2}" y="${y - Math.max(rMot, rDrv) - 18}" text-anchor="middle" font-size="9" font-weight="700" fill="#64748b" font-family="Inter, system-ui, sans-serif">Línea de centros (ejes paralelos)</text>

    <!-- Ejes -->
    <line x1="${xL}" y1="${y - shaftH}" x2="${xL}" y2="${y + shaftH}" stroke="#475569" stroke-width="3" stroke-linecap="round" />
    <line x1="${xR}" y1="${y - shaftH}" x2="${xR}" y2="${y + shaftH}" stroke="#475569" stroke-width="3" stroke-linecap="round" />
    <text x="${xL}" y="${y + shaftH + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">Eje 1</text>
    <text x="${xR}" y="${y + shaftH + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">Eje 2</text>

    <!-- Círculos primitivos (cotas teóricas de la correa) -->
    <circle cx="${xL}" cy="${y}" r="${rMot}" fill="none" stroke="#0d9488" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.95" />
    <circle cx="${xR}" cy="${y}" r="${rDrv}" fill="none" stroke="#0d9488" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.95" />
    <text x="${vbW - 36}" y="${y - Math.max(rMot, rDrv) - 6}" text-anchor="end" font-size="8.5" font-weight="700" fill="#0f766e" font-family="Inter, system-ui, sans-serif">— primitivo</text>

    <!-- Poleas (cuerpo) -->
    <circle cx="${xL}" cy="${y}" r="${rMot + 3}" fill="#e2e8f0" opacity="0.5" />
    <circle cx="${xR}" cy="${y}" r="${rDrv + 3}" fill="#e2e8f0" opacity="0.5" />
    <circle cx="${xL}" cy="${y}" r="${rMot}" fill="url(#${id}FaceMot)" stroke="#0f766e" stroke-width="2.5" filter="url(#${id}Sh)" />
    <circle cx="${xL}" cy="${y}" r="${rMot * 0.32}" fill="#134e4a" stroke="#0f172a" stroke-width="1.3" />
    ${teethMot}
    <circle cx="${xR}" cy="${y}" r="${rDrv}" fill="url(#${id}FaceDrv)" stroke="#334155" stroke-width="2.5" filter="url(#${id}Sh)" />
    <circle cx="${xR}" cy="${y}" r="${rDrv * 0.32}" fill="#1e293b" stroke="#0f172a" stroke-width="1.3" />
    ${teethDrv}

    <!-- Correa -->
    <path d="${beltPath}" fill="none" stroke="${bst.accent}" stroke-width="${bst.w + 4}" stroke-linejoin="round" opacity="0.2" />
    <path d="${beltPath}" fill="none" stroke="${bst.rim}" stroke-width="${Math.max(4, bst.w - 5)}" stroke-linejoin="round" opacity="0.55" stroke-dasharray="${bst.dash}" />
    <path d="${beltPath}" fill="none" stroke="${bst.accent}" stroke-width="${bst.w}" stroke-linejoin="round" filter="url(#${id}BeltSh)" stroke-linecap="round" />

    <!-- Sentido n₁ -->
    ${n1Arrow}

    <!-- Velocidad en tramo tendido superior -->
    <text x="${midTopX}" y="${midTopY}" text-anchor="middle" font-size="10" font-weight="800" fill="#b45309" font-family="Inter, system-ui, sans-serif">v (correa)</text>
    <path d="M ${(midTopX - 28).toFixed(1)} ${(midTopY + 10).toFixed(1)} L ${(midTopX + 28).toFixed(1)} ${(midTopY + 10).toFixed(1)}" stroke="#b45309" stroke-width="1.8" marker-end="url(#${id}Ae)" opacity="0.85" />

    <!-- Cotas C -->
    <line x1="${xL}" y1="${dimY - 28}" x2="${xL}" y2="${dimY}" stroke="#64748b" stroke-width="1" />
    <line x1="${xR}" y1="${dimY - 28}" x2="${xR}" y2="${dimY}" stroke="#64748b" stroke-width="1" />
    <line x1="${xL}" y1="${dimY}" x2="${xR}" y2="${dimY}" stroke="#1e293b" stroke-width="1.4" marker-start="url(#${id}As)" marker-end="url(#${id}Ae)" />
    <text x="${(xL + xR) / 2}" y="${dimY - 8}" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">C = ${r.center_mm.toFixed(0)} mm</text>
    <text x="${(xL + xR) / 2}" y="${dimY + 14}" text-anchor="middle" font-size="9" fill="#64748b" font-family="Inter, system-ui, sans-serif">distancia entre ejes</text>

    <!-- Etiquetas poleas (multilínea) -->
    <text x="${xL}" y="${tagY}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${tspansBlock(xL, linesMot)}</text>
    <text x="${xR}" y="${tagY}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${tspansBlock(xR, linesDrv)}</text>

    <text x="24" y="${vbH - 20}" font-size="9.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${foot}</text>
  `;
}
