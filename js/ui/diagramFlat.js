/**
 * Cinta plana — esquema detallado con flechas en la figura (separadas: velocidad, peso, resistencia).
 */

import { clamp } from '../utils/calculations.js';

const VB_W = 860;
const VB_H = 598;

/**
 * @param {SVGSVGElement} svg
 * @param {object} p
 */
export function renderFlatConveyorDiagram(svg, p) {
  if (!svg) return;

  const L = clamp(p.beltLength_m || 10, 2, 80);
  const Dmm = clamp(p.rollerDiameter_mm || 400, 80, 2000);
  const v = Math.max(0, p.beltSpeed_m_s || 0);
  const F = Math.max(0, p.frictionForce_N || 0);
  const m = Math.max(0, p.loadMass_kg || 0);
  const mu = Math.max(0, p.frictionCoeff ?? 0);
  const Nf = Math.max(0, p.normalForce_N || 0);
  const Pd = Math.max(0, p.powerAtDrum_W || 0);
  const Td = Math.max(0, p.torqueAtDrum_Nm || 0);

  const cxL = 128;
  const cxR = 628;
  const cy = 248;
  const r = clamp(28 + (Dmm / 1000) * 42, 26, 48);
  const yTop = cy - r;
  const yBot = cy + r + 22;
  const xRunL = cxL + r;
  const xRunR = cxR - r;

  const rollers = [];
  for (let x = xRunL + 24; x < xRunR - 16; x += 48) rollers.push(x);

  const loadW = clamp(52 + m * 0.05, 50, 92);
  const loadH = 38;
  const loadCx = (xRunL + xRunR) / 2;
  const loadCy = yTop - loadH / 2 - 16;
  const loadLeft = loadCx - loadW / 2;
  const loadRight = loadCx + loadW / 2;

  const Fref = 5000;
  const arrF = clamp(42 + (F / Fref) * 78, 38, 118);
  const arrW = clamp(38 + (Nf / Fref) * 32, 34, 72);
  const arrV = clamp(48 + v * 42, 44, 110);

  const wx0 = loadLeft - 26;
  const wy0 = loadCy + loadH * 0.12;
  const wx1 = wx0 - 14;
  const wy1 = wy0 + arrW;
  const wCx = wx0 - 22;
  const wCy = (wy0 + wy1) / 2;

  const fStartX = loadRight + 6;
  const fStartY = loadCy + 4;
  const fEndX = fStartX - arrF;
  const fEndY = fStartY - 10;
  const fQcx = fStartX - arrF * 0.28;
  const fQcy = fStartY - 52;

  const vx0 = xRunL + 22;
  const vy0 = yTop - 30;
  const vx1 = Math.max(vx0 + 32, Math.min(vx0 + arrV, loadLeft - 48));
  const vy1 = vy0;
  const vQcx = (vx0 + vx1) / 2;
  const vQcy = vy0 - 22;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <linearGradient id="bgFlat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ecfeff" />
        <stop offset="55%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#e0f2fe" />
      </linearGradient>
      <marker id="mkV" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#059669" />
      </marker>
      <marker id="mkW" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#475569" />
      </marker>
      <marker id="mkF" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="#1e293b" />
      </marker>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12" />
      </filter>
      <linearGradient id="beltRubber" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="url(#bgFlat)" />
    <rect x="12" y="12" width="${VB_W - 24}" height="54" rx="12" fill="#0f766e" fill-opacity="0.12" stroke="#0d9488" stroke-width="1.5" />
    <text x="28" y="38" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Cinta transportadora horizontal</text>
    <text x="28" y="56" font-size="11.5" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Vista lateral · flechas con trayos curvos separados · leyenda abajo</text>

    <!-- Pórtico / estructura -->
    <rect x="${xRunL - 18}" y="${yTop + 28}" width="10" height="${yBot - yTop - 8}" rx="2" fill="#cbd5e1" stroke="#94a3b8" />
    <rect x="${(xRunL + xRunR) / 2 - 5}" y="${yTop + 28}" width="10" height="${yBot - yTop - 26}" rx="2" fill="#cbd5e1" stroke="#94a3b8" opacity="0.92" />
    <rect x="${xRunR + 8}" y="${yTop + 28}" width="10" height="${yBot - yTop - 8}" rx="2" fill="#cbd5e1" stroke="#94a3b8" />
    <rect x="${xRunL - 24}" y="${yTop + 22}" width="${xRunR - xRunL + 48}" height="6" rx="2" fill="#94a3b8" />
    <text x="${xRunL - 6}" y="${yBot + 12}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Pórtico / soportes</text>

    <line x1="78" y1="${yBot + 48}" x2="${VB_W - 78}" y2="${yBot + 48}" stroke="#64748b" stroke-width="2.5" />
    <text x="${VB_W - 200}" y="${yBot + 64}" font-size="10" fill="#94a3b8" font-family="Inter, Segoe UI, sans-serif">Suelo / cimentación (esquema)</text>

    <!-- Retorno -->
    <path d="M ${xRunL - 6} ${yBot} Q ${cxL - r * 1.2} ${(yTop + yBot) / 2} ${xRunL} ${yTop + 6}" fill="none" stroke="#94a3b8" stroke-width="9" stroke-linecap="round" opacity="0.5" />
    <path d="M ${xRunR} ${yTop + 6} Q ${cxR + r * 1.15} ${(yTop + yBot) / 2} ${xRunR + 6} ${yBot}" fill="none" stroke="#94a3b8" stroke-width="9" stroke-linecap="round" opacity="0.5" />
    <line x1="${xRunL}" y1="${yBot}" x2="${xRunR}" y2="${yBot}" stroke="#94a3b8" stroke-width="9" stroke-linecap="round" />
    <line x1="${xRunL}" y1="${yBot}" x2="${xRunR}" y2="${yBot}" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="12 9" stroke-linecap="round" />
    <text x="${(xRunL + xRunR) / 2 - 52}" y="${yBot + 22}" font-size="10" font-weight="700" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Banda · rama inferior</text>

    ${rollers
      .map(
        (rx) => `
    <line x1="${rx}" y1="${yTop + 8}" x2="${rx}" y2="${yTop + 26}" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="${rx}" cy="${yTop + 30}" r="6" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5" />`,
      )
      .join('')}
    <text x="${xRunL + 4}" y="${yTop + 58}" font-size="10" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Rodillos de apoyo</text>

    <!-- Portante -->
    <rect x="${xRunL}" y="${yTop - 6}" width="${xRunR - xRunL}" height="14" rx="4" fill="url(#beltRubber)" stroke="#0f172a" stroke-width="1.3" filter="url(#softShadow)" />
    <text x="${(xRunL + xRunR) / 2 - 70}" y="${yTop - 16}" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Banda · rama de carga</text>

    <!-- Tambores -->
    <circle cx="${cxL}" cy="${cy}" r="${r}" fill="#e2e8f0" stroke="#334155" stroke-width="3" filter="url(#softShadow)" />
    <circle cx="${cxL - r - 14}" cy="${yTop + 4}" r="9" fill="#f1f5f9" stroke="#64748b" stroke-width="1.8" />
    <text x="${cxL - r - 38}" y="${yTop + 8}" font-size="8.5" font-weight="700" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Tensor</text>
    <text x="${cxL - 24}" y="${cy + 5}" font-size="11" font-weight="800" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Cola</text>

    <circle cx="${cxR}" cy="${cy}" r="${r}" fill="#a7f3d0" stroke="#047857" stroke-width="3.2" filter="url(#softShadow)" />
    <text x="${cxR - 30}" y="${cy + 5}" font-size="11" font-weight="800" fill="#065f46" font-family="Inter, Segoe UI, sans-serif">Motriz</text>
    <text x="${cxR + r + 8}" y="${cy - 12}" font-size="11" font-weight="800" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Tambor motriz</text>

    <g transform="translate(${cxR + r + 12}, ${cy - r - 48})">
      <rect x="0" y="0" width="52" height="34" rx="5" fill="#bae6fd" stroke="#0369a1" stroke-width="1.3" />
      <text x="7" y="22" font-size="10" font-weight="700" fill="#0369a1" font-family="Inter, Segoe UI, sans-serif">Motor</text>
      <rect x="60" y="6" width="38" height="22" rx="4" fill="#d1fae5" stroke="#047857" stroke-width="1.2" />
      <text x="65" y="21" font-size="9" font-weight="700" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Red.</text>
    </g>

    <line x1="${loadCx}" y1="${loadCy - loadH / 2 - 28}" x2="${loadCx}" y2="${loadCy - loadH / 2 - 6}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
    <text x="${loadCx - 58}" y="${loadCy - loadH / 2 - 30}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Tolva / alimentación (esquema)</text>

    <!-- Carga -->
    <g filter="url(#softShadow)">
      <rect x="${loadCx - loadW / 2}" y="${loadCy - loadH / 2}" width="${loadW}" height="${loadH}" rx="6" fill="#5eead4" stroke="#0f766e" stroke-width="2" />
      <line x1="${loadCx - loadW / 2 + 10}" y1="${loadCy - 6}" x2="${loadCx + loadW / 2 - 10}" y2="${loadCy - 6}" stroke="#0f766e" stroke-width="1.2" opacity="0.55" />
      <line x1="${loadCx - loadW / 2 + 10}" y1="${loadCy + 2}" x2="${loadCx + loadW / 2 - 10}" y2="${loadCy + 2}" stroke="#0f766e" stroke-width="1.2" opacity="0.55" />
      <line x1="${loadCx - loadW / 2 + 10}" y1="${loadCy + 10}" x2="${loadCx + loadW / 2 - 10}" y2="${loadCy + 10}" stroke="#0f766e" stroke-width="1.2" opacity="0.55" />
      <text x="${loadCx - 22}" y="${loadCy + 6}" font-size="12" font-weight="800" fill="#134e4a" font-family="Inter, Segoe UI, sans-serif">Carga</text>
    </g>

    <!-- Flecha velocidad: arco por encima, no invade la carga -->
    <path d="M ${vx0} ${vy0} Q ${vQcx} ${vQcy} ${vx1} ${vy1}" fill="none" stroke="#059669" stroke-width="3" marker-end="url(#mkV)" />
    <rect x="${vQcx - 58}" y="${vQcy - 28}" width="132" height="18" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="#6ee7b7" />
    <text x="${vQcx - 52}" y="${vQcy - 14}" font-size="10" font-weight="800" fill="#047857" font-family="Inter, Segoe UI, sans-serif">Velocidad ${v.toFixed(2)} m/s</text>

    <!-- Flecha peso: trazo ligeramente curvo, etiqueta a la izquierda -->
    <path d="M ${wx0} ${wy0} Q ${wCx} ${wCy} ${wx1} ${wy1}" fill="none" stroke="#475569" stroke-width="2.8" marker-end="url(#mkW)" />
    <rect x="${wx0 - 150}" y="${wCy - 10}" width="142" height="30" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="#cbd5e1" />
    <text x="${wx0 - 144}" y="${wCy + 4}" font-size="9.5" font-weight="800" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Peso → reacción ≈ ${Nf.toFixed(0)} N</text>
    <text x="${wx0 - 144}" y="${wCy + 16}" font-size="8.5" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Normal sobre rodillos</text>

    <!-- Flecha resistencia: curva hacia arriba para separar de la caja -->
    <path d="M ${fStartX} ${fStartY} Q ${fQcx} ${fQcy} ${fEndX} ${fEndY}" fill="none" stroke="#1e293b" stroke-width="3" marker-end="url(#mkF)" />
    <rect x="${fQcx - 72}" y="${fQcy - 36}" width="168" height="32" rx="4" fill="#ffffff" fill-opacity="0.95" stroke="#94a3b8" />
    <text x="${fQcx - 66}" y="${fQcy - 22}" font-size="9.5" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Resistencia ≈ ${F.toFixed(0)} N</text>
    <text x="${fQcx - 66}" y="${fQcy - 10}" font-size="8.5" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Roz. carga · μ ≈ ${mu.toFixed(2)}</text>

    <g transform="translate(36, ${yTop + 72})">
      <rect x="0" y="0" width="200" height="44" rx="6" fill="#ffffff" fill-opacity="0.92" stroke="#e2e8f0" />
      <line x1="10" y1="14" x2="34" y2="14" stroke="#059669" stroke-width="2.5" marker-end="url(#mkV)" />
      <text x="40" y="17" font-size="8.5" font-weight="700" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Sentido marcha</text>
      <line x1="10" y1="30" x2="34" y2="30" stroke="#1e293b" stroke-width="2.5" marker-end="url(#mkF)" />
      <text x="40" y="33" font-size="8.5" font-weight="700" fill="#334155" font-family="Inter, Segoe UI, sans-serif">Fuerza a vencer en tambor</text>
    </g>

    <!-- Cotas -->
    <line x1="${xRunL}" y1="${yBot + 30}" x2="${xRunR}" y2="${yBot + 30}" stroke="#64748b" stroke-width="1.3" />
    <line x1="${xRunL}" y1="${yBot + 24}" x2="${xRunL}" y2="${yBot + 36}" stroke="#64748b" stroke-width="1.3" />
    <line x1="${xRunR}" y1="${yBot + 24}" x2="${xRunR}" y2="${yBot + 36}" stroke="#64748b" stroke-width="1.3" />
    <text x="${(xRunL + xRunR) / 2 - 26}" y="${yBot + 46}" font-size="11" font-weight="600" fill="#475569" font-family="Inter, Segoe UI, sans-serif">L ≈ ${L.toFixed(1)} m</text>

    <line x1="${cxR - r}" y1="${yTop - 56}" x2="${cxR + r}" y2="${yTop - 56}" stroke="#64748b" stroke-width="1.3" />
    <text x="${cxR - 26}" y="${yTop - 60}" font-size="10" font-weight="600" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Ø tambor ${Dmm.toFixed(0)} mm</text>

    <g transform="translate(24, ${VB_H - 108})">
      <rect x="0" y="0" width="${VB_W - 48}" height="${p.detail ? 92 : 72}" rx="10" fill="#ffffff" stroke="#0d9488" stroke-width="1.5" fill-opacity="0.97" />
      <text x="14" y="22" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Resumen en el tambor (sus datos)</text>
      <text x="14" y="40" font-size="10" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Caudal másico ≈ ${(p.massFlow_kg_s || 0).toFixed(3)} kg/s</text>
      ${
        p.detail
          ? `<text x="14" y="56" font-size="9.5" fill="#475569" font-family="Inter, Segoe UI, sans-serif">Régimen ${(p.detail.F_steady_N ?? 0).toFixed(0)} N · Arranque ${(p.detail.F_total_start_N ?? 0).toFixed(0)} N</text>
      <text x="14" y="72" font-size="10" font-weight="700" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Potencia ${Pd.toFixed(0)} W · Par ${Td.toFixed(1)} N·m</text>
      <text x="14" y="86" font-size="9" fill="#94a3b8" font-family="Inter, Segoe UI, sans-serif">Tiempo arranque ${(p.detail.accelTime_s ?? 0).toFixed(2)} s · Factor inercia ${(p.detail.inertiaStartingFactor ?? 1).toFixed(2)}</text>`
          : `<text x="14" y="58" font-size="10" font-weight="700" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">Potencia ${Pd.toFixed(0)} W · Par ${Td.toFixed(1)} N·m</text>`
      }
    </g>
  `;
}
