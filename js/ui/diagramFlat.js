/**
 * Cinta plana — esquema tipo plano de ingeniería: líneas finas, acentos limitados,
 * etiquetas sin sombras; leyenda compacta bajo el trazado principal.
 */

import { clamp } from '../utils/calculations.js';
import { getCurrentLang } from '../config/locales.js';

function fmt(n, d = 2) {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(d);
}

/** @param {string} s @returns {string} */
function mono(s) {
  return `<tspan class="diagram-svg-num">${s}</tspan>`;
}

/**
 * @param {SVGSVGElement} svg
 * @param {object} p
 */
export function renderFlatConveyorDiagram(svg, p) {
  if (!svg) return;

  const lang = p.lang ?? getCurrentLang();
  const en = lang === 'en';

  const L = clamp(p.beltLength_m || 10, 2, 80);
  const Dmm = clamp(p.rollerDiameter_mm || 400, 50, 2000);
  const v = Math.max(0, p.beltSpeed_m_s || 0);
  const F = Math.max(0, p.frictionForce_N || 0);
  const m = Math.max(0, p.loadMass_kg || 0);
  const mu = Math.max(0, p.frictionCoeff ?? 0);
  const Nf = Math.max(0, p.normalForce_N || 0);
  const Pd = Math.max(0, p.powerAtDrum_W || 0);
  const Td = Math.max(0, p.torqueAtDrum_Nm || 0);

  const INK = '#334155';
  const NAVY = '#1e3a5f';
  const LINE = '#475569';
  const MUTED = '#64748b';
  const ACC = '#0d9488';

  const d = p.detail || {};
  const Fsteady = Number.isFinite(d.F_steady_N) ? d.F_steady_N : F;
  const Fstart = Number.isFinite(d.F_total_start_N) ? d.F_total_start_N : Fsteady;
  const Trun = Number.isFinite(p.torqueRun_Nm) ? p.torqueRun_Nm : Td;
  const Tstart = Number.isFinite(p.torqueStart_Nm) ? p.torqueStart_Nm : Trun;
  const Tdesign = Number.isFinite(p.torqueDesign_Nm) ? p.torqueDesign_Nm : Trun * (p.serviceFactor ?? 1);
  const PdrumRun = Number.isFinite(p.powerDrumRun_W) ? p.powerDrumRun_W : Pd;
  const PdrumStart = Number.isFinite(p.powerDrumStart_W) ? p.powerDrumStart_W : Fstart * v;
  const PmotorW = Number.isFinite(p.powerMotorDesign_W) ? p.powerMotorDesign_W : NaN;
  const PmotorkW = Number.isFinite(PmotorW) ? PmotorW / 1000 : NaN;

  const sf = Number.isFinite(p.serviceFactor) ? p.serviceFactor : 1;
  const etaPct = Number.isFinite(p.efficiency_pct) ? p.efficiency_pct : 88;
  const omega = Number.isFinite(p.omega_rad_s)
    ? p.omega_rad_s
    : Number.isFinite(d.omega_rad_s)
      ? d.omega_rad_s
      : Dmm > 0 && v >= 0
        ? v / (Dmm / 2000)
        : 0;

  const HEADER_H = 40;
  const HEADER_BOTTOM = HEADER_H + 6;

  const cxL = 142;
  const cxR = 642;
  const cy = 342;
  const r = clamp(28 + (Dmm / 1000) * 42, 26, 48);
  const yTop = cy - r;
  const yBot = cy + r + 22;
  const xRunL = cxL + r;
  const xRunR = cxR - r;

  const loadW = clamp(52 + m * 0.05, 50, 92);
  const loadH = 40;
  const loadCx = (xRunL + xRunR) / 2;
  const loadCy = yTop - loadH / 2 - 4;
  const loadLeft = loadCx - loadW / 2;
  const loadRight = loadCx + loadW / 2;
  const loadBottom = loadCy + loadH / 2;

  const dimBandD_Y = Math.max(HEADER_BOTTOM + 40, yTop - 128);
  const dimBandL_Y = dimBandD_Y + 42;

  const vStrandY = yTop - 42;
  const fStrandY = yTop + 2;
  const vx0 = xRunL + 28;
  const vGapLoad = 58;
  const vx1 = Math.max(vx0 + 68, loadLeft - vGapLoad);
  const vMidStrand = (vx0 + vx1) / 2;
  const lDimMidX = (xRunL + xRunR) / 2;

  const rollers = [];
  for (let x = xRunL + 24; x < xRunR - 16; x += 48) rollers.push(x);

  const carrySlide = p.carrySurface === 'slide_plate';
  const ramaPortanteLabel = carrySlide
    ? en
      ? 'Carrying strand · slide plate'
      : 'Rama portante · plancha'
    : en
      ? 'Carrying strand · rollers'
      : 'Rama portante · rodillos';
  const normalContactHint = carrySlide
    ? en
      ? 'normal on slide plate'
      : 'normal sobre plancha'
    : en
      ? 'normal on rollers'
      : 'normal sobre rodillos';
  const headerSubRight = carrySlide
    ? en
      ? 'v & F → drive drum · P = F·v · μ belt–slide'
      : 'v y F → tambor motriz · P = F·v · μ banda–placha'
    : en
      ? 'v & F → drive drum · P = F·v'
      : 'v y F → tambor motriz · P = F·v';
  const carryBedSvg = carrySlide
    ? `
    <rect x="${xRunL - 8}" y="${yTop + 2}" width="${xRunR - xRunL + 16}" height="32" rx="3" fill="#f1f5f9" stroke="${LINE}" stroke-width="0.9" />
    <line x1="${xRunL - 2}" y1="${yTop + 13}" x2="${xRunR + 2}" y2="${yTop + 13}" stroke="#cbd5e1" stroke-width="0.85" />
    <line x1="${xRunL - 2}" y1="${yTop + 23}" x2="${xRunR + 2}" y2="${yTop + 23}" stroke="#cbd5e1" stroke-width="0.85" />
    `
    : rollers
        .map(
          (rx) => `
    <line x1="${rx}" y1="${yTop + 8}" x2="${rx}" y2="${yTop + 26}" stroke="${LINE}" stroke-width="1.25" stroke-linecap="round" />
    <circle cx="${rx}" cy="${yTop + 30}" r="5.5" fill="#f8fafc" stroke="${LINE}" stroke-width="1" />`,
        )
        .join('');

  const Fref = 5000;
  const arrF = clamp(40 + (F / Fref) * 70, 36, 110);

  const wLoadX = loadCx;
  const weightArrowStartGap = 5;
  const weightArrowLen = 48;
  const wLoadY0 = loadBottom + weightArrowStartGap;
  const wLoadY1 = wLoadY0 + weightArrowLen;

  const motrizEdgeX = cxR - r;

  let fX0 = Math.max(loadRight + 16, vx1 + 32);
  let fX1 = Math.min(motrizEdgeX - 52, xRunR - 14);
  if (fX1 < fX0 + 44) {
    fX0 = Math.max(xRunL + 68, fX1 - 92);
  }
  const fSpan = Math.max(24, fX1 - fX0);
  const fDrawLen = Math.min(arrF, fSpan);
  const fLineX0 = fX1 - fDrawLen;
  const fLineX1 = fX1;
  const fAnchorX = (fLineX0 + fLineX1) / 2;

  const vChipW = 118;
  const vChipH = 22;
  let vChipX = vMidStrand - vChipW / 2;
  vChipX = clamp(vChipX, 12, xRunR - vChipW - 16);
  const vChipY = vStrandY - vChipH - 5;

  const lChipW = 92;
  const lChipH = 20;
  const lChipX = lDimMidX - lChipW / 2;
  const lChipY = dimBandL_Y - lChipH - 5;

  const dChipW = 96;
  const dChipH = 20;
  let dChipX = cxR - dChipW / 2;
  const motorIconsLeft = cxR + r + 22;
  const dChipMaxX = motorIconsLeft - dChipW - 8;
  dChipX = clamp(dChipX, 14, dChipMaxX);
  const dChipY = dimBandD_Y - dChipH - 3;

  const fChipW = 122;
  const fChipH = 26;
  let fChipX = fAnchorX - fChipW / 2;
  fChipX = clamp(fChipX, 14, xRunR - fChipW - 8);
  const fChipY = yTop + 14;

  const nChipW = 108;
  const nChipH = 32;
  let nChipX = loadRight + 8;
  if (nChipX + nChipW > fChipX - 4) nChipX = Math.max(loadRight + 6, fChipX - nChipW - 10);
  nChipX = Math.min(nChipX, xRunR - nChipW - 6);
  nChipX = Math.max(12, nChipX);
  const nChipY = loadCy - nChipH / 2;

  const muChipW = 112;
  const muChipH = 20;
  const muChipX = 18;
  const muChipY = HEADER_BOTTOM + 2;

  const motorBlockRight = cxR + r + 22 + 108;
  const VB_W = Math.max(
    780,
    motorBlockRight + 24,
    nChipX + nChipW + 20,
    fChipX + fChipW + 20,
    vChipX + vChipW + 16,
  );

  const hasDetail = Boolean(p.detail && Object.keys(p.detail).length);

  const legendStripH = 38;
  const legendGap = 14;
  const legendStripY = Math.max(yBot + 48, dimBandL_Y + 52, loadBottom + 68, fChipY + fChipH + 18, nChipY + nChipH + 8);

  const summaryH = hasDetail ? 134 : 126;
  const summaryY = legendStripY + legendStripH + legendGap;
  const compactStack = typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches;
  const colGap = 14;
  const colW = compactStack ? VB_W - 40 : (VB_W - 40 - colGap) / 2;
  const rightColY = compactStack ? summaryY + summaryH + 12 : summaryY;
  const VB_H = rightColY + summaryH + 20;

  const svgTitle = en
    ? 'Flat belt schematic — carrying strand, dimensions'
    : 'Esquema cinta plana — rama portante y cotas';
  const headMain = en ? 'Horizontal flat belt' : 'Cinta horizontal';
  const floorLbl = en ? 'Floor / foundation' : 'Suelo / cimentación';
  const retLbl = en ? 'Belt · return' : 'Banda · retorno';
  const lblTensor = en ? 'Take-up' : 'Tensor';
  const lblCola = en ? 'Tail' : 'Cola';
  const lblMotriz = en ? 'Drive' : 'Motriz';
  const lblHopper = en ? 'Hopper (schematic)' : 'Tolva (esquema)';
  const fChipSub = en ? 'steady' : 'régimen';
  const legV = en ? 'Run v — belt' : 'Marcha v — banda';
  const legF = en ? 'F steady — strand' : 'F régimen — rama';
  const sumLeftTitle = en ? 'Steady state (no SF)' : 'Régimen (sin SF)';
  const pDrumLine = en
    ? `P drum ${PdrumRun.toFixed(2)} W · peak ${PdrumStart.toFixed(2)} W`
    : `P tambor ${PdrumRun.toFixed(2)} W · pico ${PdrumStart.toFixed(2)} W`;
  const accelLine = en
    ? `t accel. ${fmt(d.accelTime_s)} s · k ${fmt(d.inertiaStartingFactor)}`
    : `t acel. ${fmt(d.accelTime_s)} s · k ${fmt(d.inertiaStartingFactor)}`;
  const sumRightTitle = en ? 'Motor design' : 'Diseño motor';
  const alignHint = en ? 'Aligned with app results' : 'Alineado con resultados de la app';

  const legMidX = VB_W / 2;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <title>${svgTitle}</title>
    <defs>
      <marker id="mkArrAcc" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${ACC}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkArrInk" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkArrLine" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${LINE}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <linearGradient id="sumGradL" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <linearGradient id="sumGradR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <style><![CDATA[
        .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .diagram-svg-lbl { font-family: Inter, 'Segoe UI', system-ui, sans-serif; }
      ]]></style>
    </defs>

    <rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="#fafbfc" />

    <line x1="0" y1="${HEADER_H}" x2="${VB_W}" y2="${HEADER_H}" stroke="#e2e8f0" stroke-width="1" />
    <text x="20" y="27" class="diagram-svg-lbl" font-size="15" font-weight="700" fill="${INK}">${headMain}</text>
    <text x="${VB_W - 20}" y="27" text-anchor="end" font-size="10.5" fill="${MUTED}" class="diagram-svg-lbl">${headerSubRight}</text>

    <g class="diagram-metric" data-diagram-metric="mu" pointer-events="bounding-box">
      <rect x="${muChipX}" y="${muChipY}" width="${muChipW}" height="${muChipH}" rx="4" fill="#ffffff" fill-opacity="0.97" stroke="none" />
      <text x="${muChipX + 6}" y="${muChipY + 14}" font-size="9.5" font-weight="700" fill="${INK}" class="diagram-svg-lbl">μ Coulomb</text>
    </g>

    <g class="diagram-metric" data-diagram-metric="D" pointer-events="bounding-box">
      <line x1="${cxR}" y1="${yTop - 4}" x2="${cxR}" y2="${dimBandD_Y + 8}" stroke="${LINE}" stroke-width="0.9" stroke-dasharray="4 4" />
      <line x1="${cxR - r}" y1="${dimBandD_Y}" x2="${cxR + r}" y2="${dimBandD_Y}" stroke="${LINE}" stroke-width="1" />
      <line x1="${cxR - r}" y1="${dimBandD_Y - 4}" x2="${cxR - r}" y2="${dimBandD_Y + 4}" stroke="${LINE}" stroke-width="1" />
      <line x1="${cxR + r}" y1="${dimBandD_Y - 4}" x2="${cxR + r}" y2="${dimBandD_Y + 4}" stroke="${LINE}" stroke-width="1" />
    </g>

    <g class="diagram-metric" data-diagram-metric="L" pointer-events="bounding-box">
      <line x1="${xRunL}" y1="${dimBandL_Y - 4}" x2="${xRunL}" y2="${dimBandL_Y + 8}" stroke="${ACC}" stroke-width="1" />
      <line x1="${xRunR}" y1="${dimBandL_Y - 4}" x2="${xRunR}" y2="${dimBandL_Y + 8}" stroke="${ACC}" stroke-width="1" />
      <line x1="${xRunL}" y1="${dimBandL_Y}" x2="${xRunR}" y2="${dimBandL_Y}" stroke="${ACC}" stroke-width="1.15" />
    </g>

    <g class="diagram-metric diagram-metric--v" data-diagram-metric="v" pointer-events="bounding-box">
      <line x1="${vx0}" y1="${vStrandY}" x2="${vx1}" y2="${vStrandY}" stroke="${ACC}" stroke-width="1.35" marker-end="url(#mkArrAcc)" />
    </g>

    <line x1="64" y1="${yBot + 44}" x2="${VB_W - 64}" y2="${yBot + 44}" stroke="${LINE}" stroke-width="1.2" />
    <text x="${(xRunL + xRunR) / 2}" y="${yBot + 58}" text-anchor="middle" font-size="10" fill="${MUTED}" class="diagram-svg-lbl">${floorLbl}</text>

    <path d="M ${xRunL - 6} ${yBot} Q ${cxL - r * 1.2} ${(yTop + yBot) / 2} ${xRunL} ${yTop + 6}" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <path d="M ${xRunR} ${yTop + 6} Q ${cxR + r * 1.15} ${(yTop + yBot) / 2} ${xRunR + 6} ${yBot}" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <line x1="${xRunL}" y1="${yBot}" x2="${xRunR}" y2="${yBot}" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" opacity="0.55" />
    <line x1="${xRunL}" y1="${yBot - 4}" x2="${xRunR}" y2="${yBot - 4}" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="8 7" stroke-linecap="round" />
    <line x1="${xRunL}" y1="${yBot + 4}" x2="${xRunR}" y2="${yBot + 4}" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="8 7" stroke-linecap="round" opacity="0.9" />
    <text x="${(xRunL + xRunR) / 2 - 58}" y="${yBot + 19}" font-size="10" font-weight="600" fill="${MUTED}" class="diagram-svg-lbl">${retLbl}</text>

    <rect x="${xRunL - 18}" y="${yTop + 28}" width="10" height="${yBot - yTop - 8}" rx="2" fill="#e2e8f0" stroke="${LINE}" stroke-width="0.8" />
    <rect x="${(xRunL + xRunR) / 2 - 5}" y="${yTop + 28}" width="10" height="${yBot - yTop - 26}" rx="2" fill="#e2e8f0" stroke="${LINE}" stroke-width="0.8" opacity="0.95" />
    <rect x="${xRunR + 8}" y="${yTop + 28}" width="10" height="${yBot - yTop - 8}" rx="2" fill="#e2e8f0" stroke="${LINE}" stroke-width="0.8" />
    <rect x="${xRunL - 24}" y="${yTop + 22}" width="${xRunR - xRunL + 48}" height="5" rx="2" fill="#cbd5e1" />

    ${carryBedSvg}

    <rect x="${xRunL}" y="${yTop - 6}" width="${xRunR - xRunL}" height="14" rx="2" fill="#2563eb" stroke="${NAVY}" stroke-width="1" />
    <text x="${xRunR - 10}" y="${yTop - 78}" text-anchor="end" font-size="9.5" font-weight="700" fill="${INK}" class="diagram-svg-lbl">${ramaPortanteLabel}</text>

    <circle cx="${cxL}" cy="${cy}" r="${r}" fill="#f1f5f9" stroke="${LINE}" stroke-width="1.5" />
    <circle cx="${cxL - r - 14}" cy="${yTop + 4}" r="8" fill="#ffffff" stroke="${LINE}" stroke-width="1" />
    <text x="${cxL - r - 36}" y="${yTop + 7}" font-size="9.5" font-weight="600" fill="${MUTED}" class="diagram-svg-lbl">${lblTensor}</text>
    <text x="${cxL - 24}" y="${cy + 5}" font-size="12" font-weight="700" fill="${INK}" class="diagram-svg-lbl">${lblCola}</text>

    <circle cx="${cxR}" cy="${cy}" r="${r}" fill="rgba(13, 148, 136, 0.08)" stroke="${ACC}" stroke-width="1.5" />
    <text x="${cxR - 34}" y="${cy + 5}" font-size="12" font-weight="700" fill="${ACC}" class="diagram-svg-lbl">${lblMotriz}</text>

    <g transform="translate(${cxR + r + 22}, ${cy - 4})">
      <text x="6" y="-22" font-size="10.5" font-weight="600" fill="${INK}" class="diagram-svg-lbl">Motor</text>
      <text x="62" y="-22" font-size="9.5" font-weight="600" fill="${ACC}" class="diagram-svg-lbl">Red.</text>
      <line x1="28" y1="-10" x2="28" y2="8" stroke="${LINE}" stroke-width="1" />
      <line x1="68" y1="-10" x2="68" y2="8" stroke="${ACC}" stroke-width="1" />
    </g>

    <line x1="${loadCx}" y1="${loadCy - loadH / 2 - 24}" x2="${loadCx}" y2="${loadCy - loadH / 2 - 6}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
    <text x="${loadCx - 54}" y="${loadCy - loadH / 2 - 26}" font-size="9.5" fill="${MUTED}" class="diagram-svg-lbl">${lblHopper}</text>

    <rect x="${loadCx - loadW / 2}" y="${loadCy - loadH / 2}" width="${loadW}" height="${loadH}" rx="6" fill="rgba(13, 148, 136, 0.12)" stroke="${ACC}" stroke-width="1" />
    <text x="${loadCx - 18}" y="${loadCy + 6}" font-size="13" font-weight="800" fill="${INK}" class="diagram-svg-lbl">m</text>

    <line x1="${wLoadX}" y1="${wLoadY0}" x2="${wLoadX}" y2="${wLoadY1}" stroke="${LINE}" stroke-width="1.5" marker-end="url(#mkArrLine)" />

    <g class="diagram-metric diagram-metric--F" data-diagram-metric="F" pointer-events="bounding-box">
      <line x1="${fLineX0}" y1="${fStrandY}" x2="${fLineX1}" y2="${fStrandY}" stroke="${INK}" stroke-width="1.35" marker-end="url(#mkArrInk)" />
    </g>

    <g class="diagram-metric diagram-metric--v" data-diagram-metric="v" pointer-events="bounding-box">
      <rect x="${vChipX}" y="${vChipY}" width="${vChipW}" height="${vChipH}" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="none" />
      <text x="${vChipX + 6}" y="${vChipY + 15}" font-size="10" font-weight="600" fill="${INK}">
        <tspan class="diagram-svg-lbl">v </tspan>${mono(v.toFixed(2))}<tspan class="diagram-svg-lbl"> m/s</tspan>
      </text>
    </g>
    <g class="diagram-metric" data-diagram-metric="L" pointer-events="bounding-box">
      <rect x="${lChipX}" y="${lChipY}" width="${lChipW}" height="${lChipH}" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="none" />
      <text x="${lChipX + 6}" y="${lChipY + 14}" font-size="10" font-weight="600" fill="${INK}">
        <tspan class="diagram-svg-lbl">L </tspan>${mono(fmt(L))}<tspan class="diagram-svg-lbl"> m</tspan>
      </text>
    </g>
    <g class="diagram-metric" data-diagram-metric="D" pointer-events="bounding-box">
      <rect x="${dChipX}" y="${dChipY}" width="${dChipW}" height="${dChipH}" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="none" />
      <text x="${dChipX + 5}" y="${dChipY + 14}" font-size="9.5" font-weight="600" fill="${INK}">
        <tspan class="diagram-svg-lbl">D </tspan>${mono(fmt(Dmm))}<tspan class="diagram-svg-lbl"> mm</tspan>
      </text>
    </g>
    <rect x="${nChipX}" y="${nChipY}" width="${nChipW}" height="${nChipH}" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="none" />
    <text x="${nChipX + 5}" y="${nChipY + 13}" font-size="9" font-weight="600" fill="${INK}">
      <tspan class="diagram-svg-lbl">N≈ </tspan>${mono(Nf.toFixed(2))}<tspan class="diagram-svg-lbl"> N</tspan>
    </text>
    <text x="${nChipX + 5}" y="${nChipY + 26}" font-size="7.5" fill="${MUTED}" class="diagram-svg-lbl">${normalContactHint}</text>
    <g class="diagram-metric diagram-metric--F" data-diagram-metric="F" pointer-events="bounding-box">
      <rect x="${fChipX}" y="${fChipY}" width="${fChipW}" height="${fChipH}" rx="4" fill="#ffffff" fill-opacity="0.96" stroke="none" />
      <text x="${fChipX + 5}" y="${fChipY + 12}" font-size="9" font-weight="600" fill="${INK}">
        <tspan class="diagram-svg-lbl">F </tspan>${mono(Fsteady.toFixed(2))}<tspan class="diagram-svg-lbl"> N</tspan>
      </text>
      <text x="${fChipX + 5}" y="${fChipY + 23}" font-size="7.5" fill="${MUTED}" class="diagram-svg-lbl">${fChipSub}</text>
    </g>

    <!-- Leyenda horizontal bajo el trazado (sin caja) -->
    <g transform="translate(0, ${legendStripY})" aria-hidden="true">
      <line x1="24" y1="12" x2="46" y2="12" stroke="${ACC}" stroke-width="1.1" marker-end="url(#mkArrAcc)" />
      <text x="52" y="15" font-size="9.5" fill="${MUTED}" class="diagram-svg-lbl">${legV}</text>
      <line x1="${legMidX}" y1="12" x2="${legMidX + 22}" y2="12" stroke="${INK}" stroke-width="1.1" marker-end="url(#mkArrInk)" />
      <text x="${legMidX + 28}" y="15" font-size="9.5" fill="${MUTED}" class="diagram-svg-lbl">${legF}</text>
    </g>

    <g transform="translate(20, ${summaryY})">
      <rect x="0" y="0" width="${colW}" height="${summaryH}" rx="10" fill="url(#sumGradL)" stroke="none" />
      <text x="14" y="22" font-size="11" font-weight="800" fill="${INK}" class="diagram-svg-lbl" letter-spacing="0.04em">${sumLeftTitle}</text>
      <text x="14" y="40" font-size="10" fill="${LINE}">
        <tspan class="diagram-svg-lbl">F </tspan>${mono(Fsteady.toFixed(2))}<tspan class="diagram-svg-lbl"> / </tspan>${mono(Fstart.toFixed(2))}<tspan class="diagram-svg-lbl"> N · T </tspan>${mono(Trun.toFixed(2))}<tspan class="diagram-svg-lbl"> / </tspan>${mono(Tstart.toFixed(2))}<tspan class="diagram-svg-lbl"> N·m</tspan>
      </text>
      <text x="14" y="56" font-size="10" fill="${LINE}" class="diagram-svg-lbl">${pDrumLine}</text>
      <text x="14" y="74" font-size="10" font-weight="600" fill="${ACC}">
        <tspan class="diagram-svg-lbl">μ </tspan>${mono(mu.toFixed(2))}<tspan class="diagram-svg-lbl"> · ṁ ≈ </tspan>${mono(fmt(p.massFlow_kg_s || 0))}<tspan class="diagram-svg-lbl"> kg/s</tspan>
      </text>
      ${hasDetail ? `<text x="14" y="94" font-size="9" fill="${MUTED}" class="diagram-svg-lbl">${accelLine}</text>` : ''}
    </g>

    <g transform="translate(${compactStack ? 20 : 20 + colW + colGap}, ${rightColY})">
      <rect x="0" y="0" width="${colW}" height="${summaryH}" rx="10" fill="url(#sumGradR)" stroke="none" />
      <text x="14" y="22" font-size="11" font-weight="800" fill="${INK}" class="diagram-svg-lbl" letter-spacing="0.04em">${sumRightTitle}</text>
      <text x="14" y="40" font-size="10" fill="${LINE}">
        <tspan class="diagram-svg-lbl">SF </tspan>${mono(fmt(sf))}<tspan class="diagram-svg-lbl"> · η </tspan>${mono(fmt(etaPct))}<tspan class="diagram-svg-lbl"> % · T </tspan>${mono(Tdesign.toFixed(2))}<tspan class="diagram-svg-lbl"> N·m</tspan>
      </text>
      <text x="14" y="56" font-size="10" fill="${LINE}">
        <tspan class="diagram-svg-lbl">ω ≈ </tspan>${mono(fmt(omega))}<tspan class="diagram-svg-lbl"> rad/s</tspan>
      </text>
      <text x="14" y="76" font-size="11" font-weight="800" fill="${ACC}">
        <tspan class="diagram-svg-lbl">P motor ≈ </tspan>${mono(fmt(PmotorkW))}<tspan class="diagram-svg-lbl"> kW</tspan>
      </text>
      <text x="14" y="96" font-size="9" fill="${MUTED}" class="diagram-svg-lbl">${alignHint}</text>
    </g>
  `;
}
