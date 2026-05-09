/**
 * Transportador de rodillos motorizado - esquema sin solapar etiquetas sobre el dibujo.
 * Texto del SVG en ASCII + escapes \u para evitar problemas de codificacion en Windows.
 */

import { clamp } from '../utils/calculations.js';
import { getCurrentLang } from '../config/locales.js';

function fmt(n, d = 2) {
  if (!Number.isFinite(n)) return '--';
  return n.toFixed(d);
}

function mono(s) {
  return `<tspan class="diagram-svg-num">${s}</tspan>`;
}

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 */
export function renderRollerConveyorDiagram(svg, p) {
  if (!svg) return;

  const lang = p.lang ?? getCurrentLang();
  const en = lang === 'en';

  const L = clamp(Number(p.length_m) || 5, 0.5, 80);
  const D = clamp(Number(p.rollerDiameter_mm) || 89, 40, 400);
  const v = Math.max(0, Number(p.speed_m_s) || 0);
  const m = Math.max(0, Number(p.loadMass_kg) || 0);
  const rpm = Number(p.drumRpm);
  const crr = Math.max(0, Number(p.crr ?? p.rollingResistanceCoeff) || 0.03);
  const Fsteady = Math.max(0, Number(p.F_steady_N) || 0);
  const mdot = Number(p.massFlow_kg_s);
  const sf = Number.isFinite(Number(p.serviceFactor)) ? Number(p.serviceFactor) : 1;
  const stdLabel = p.designStandard === 'CEMA' ? (en ? 'CEMA +6% steady' : 'CEMA +6% reg.') : 'ISO 5048';

  const ACC = '#0d9488';
  const INK = '#334155';
  const LINE = '#475569';
  const MUTED = '#64748b';

  const vbW = 1000;
  const footerH = 102;
  /** Alto útil leyenda (título + líneas + nota hasta ~y44 local + margen). */
  const legendBandH = 54;

  const leftPad = 158;
  const rightPad = 24;
  const drawZoneW = vbW - leftPad - rightPad;
  const profileY = 62;
  /** Hueco amplio bajo el perfil (patines ~186) antes de la planta */
  const profileGroundY = profileY + 124;
  const topViewY = profileGroundY + 36;
  const topViewRectH = 86;
  const lDimLineY = topViewY + topViewRectH + 10;
  const lLabelY = lDimLineY + 22;
  const caseRowY = lLabelY + 18;
  const legendRowY = caseRowY + footerH + 14;
  const vbH = legendRowY + legendBandH + 16;

  const lenPx = clamp(200 + (L / 80) * 560, 200, Math.min(780, drawZoneW - 16));
  const x0 = leftPad + (drawZoneW - lenPx) / 2;
  const x1 = x0 + lenPx;

  const rollerR = clamp(5 + ((D - 40) / (400 - 40)) * 10, 5, 15);
  const pitchMmAssumed = 1.25 * D;
  const nLogical = Math.max(2, Math.floor((L * 1000) / pitchMmAssumed) + 1);

  /** Hueco minimo entre circunferencias (centros al menos 2R + gap). */
  const gapPx = Math.max(4.5, rollerR * 0.6);
  const minPitchPx = 2 * rollerR + gapPx;
  const nVisMax = Math.max(2, Math.floor((lenPx - 2 * rollerR) / minPitchPx) + 1);
  let nVis = Math.min(nLogical, nVisMax, 26);
  if (nVis < 2) nVis = 2;

  const pitchPx =
    nVis > 1 ? (lenPx - 2 * rollerR) / (nVis - 1) : Math.max(minPitchPx, lenPx - 2 * rollerR);
  const trainSpan = (nVis - 1) * pitchPx + 2 * rollerR;
  const rollerStartX = x0 + rollerR + (lenPx - trainSpan) / 2;

  const navy = '#1e3a5f';
  const frameStroke = '#334155';

  const chipW = 136;
  const chipH = 28;
  const chipX = 12;
  let chipY = 68;
  const chipGap = 6;
  const chip = () => {
    const y = chipY;
    chipY += chipH + chipGap;
    return y;
  };

  const yV = chip();
  const yL = chip();
  const yD = chip();
  const yCrr = chip();
  chipY += 4;
  const yF = chip();

  const simplifiedNote =
    nLogical > nVis
      ? en
        ? ` (view ${nVis}/${nLogical} rollers)`
        : ` (vista ${nVis}/${nLogical} rod.)`
      : '';

  const subLine = en
    ? `Side + plan view | illustr. pitch ~ ${fmt(pitchMmAssumed, 0)} mm | ${stdLabel}`
    : `Perfil + planta | paso ilustr. ~ ${fmt(pitchMmAssumed, 0)} mm | ${stdLabel}`;

  const titleMain = en ? 'Motorized roller conveyor' : 'Transportador de rodillos motorizado';
  const lblProfile = en ? 'Side profile' : 'Perfil lateral';
  const lblMotorGb = en ? 'Motor / GB.' : 'Motor / red.';
  const lblLoadDir = en ? 'Load, direction' : 'Carga, sentido';
  const lblTop = en ? 'Top view (plan)' : 'Vista superior (planta)';
  const fChipSub = en ? 'steady, no SF' : 'regimen, sin SF';
  const legTitle = en ? 'Legend' : 'Leyenda';
  const legV = en ? 'Run (v)' : 'Marcha (v)';
  const legF = en ? 'F steady (traction)' : 'F regimen (traccion)';
  const legNote1 = en ? 'Green roller: drive. Rails: guards.' : 'Rodillo verde: motriz. Rieles: guardas.';
  const legNote2 = en ? 'Mouse over left labels or arrows.' : 'Rat\u00f3n sobre valores izq. o flechas.';
  const caseTitle = en ? 'Case data' : 'Datos del caso';
  const caseL1 = en ? 'Load:' : 'Carga:';
  const caseL2 = en ? 'Illustr. shaft pitch:' : 'Paso ejes ilustr.:';
  const caseL3 = en ? 'Drawing to scale with L and D; pitch = 1.25 * D (visual convention).' : 'Dibujo a escala con L y D; paso = 1,25 * D (convencion visual).';

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <marker id="rlArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="rlMkV" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${ACC}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="rlMkF" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <linearGradient id="sumRlL" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <linearGradient id="sumRlR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <style><![CDATA[
        .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
        .diagram-svg-lbl { font-family: Inter, system-ui, sans-serif; }
      ]]></style>
    </defs>

    <rect width="${vbW}" height="${vbH}" fill="#fafbfc"/>
    <line x1="12" y1="58" x2="${vbW - 12}" y2="58" stroke="#e2e8f0" stroke-width="1" />
    <text x="28" y="32" font-size="15" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">${titleMain}</text>
    <text x="28" y="48" font-size="10.5" fill="#475569" font-family="Inter, system-ui, sans-serif">${subLine}</text>

    <text x="${x0}" y="${profileY - 8}" font-size="10.5" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">${lblProfile}</text>
    <line x1="${x0 - 18}" y1="${profileY + 48}" x2="${x1 + 18}" y2="${profileY + 48}" stroke="#1f2937" stroke-width="2"/>
    <line x1="${x0 - 18}" y1="${profileY + 70}" x2="${x1 + 18}" y2="${profileY + 70}" stroke="#1f2937" stroke-width="2"/>

    ${Array.from({ length: nVis }, (_, i) => {
      const x = rollerStartX + i * pitchPx;
      const isDrive = i === nVis - 1;
      const fill = isDrive ? 'rgba(13, 148, 136, 0.22)' : '#f8fafc';
      const stroke = isDrive ? ACC : LINE;
      return `
        <circle cx="${x.toFixed(1)}" cy="${(profileY + 59).toFixed(1)}" r="${rollerR.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${isDrive ? 1.35 : 1.05}"/>
      `;
    }).join('')}

    <rect x="${x0 - 28}" y="${profileY + 40}" width="12" height="36" fill="#111827"/>
    <rect x="${x1 + 16}" y="${profileY + 40}" width="12" height="36" fill="#111827"/>

    <g opacity="0.88">
      <line x1="${x0 + 56}" y1="${profileY + 72}" x2="${x0 + 38}" y2="${profileY + 124}" stroke="#374151" stroke-width="2.6"/>
      <line x1="${x1 - 56}" y1="${profileY + 72}" x2="${x1 - 38}" y2="${profileY + 124}" stroke="#374151" stroke-width="2.6"/>
      <line x1="${x0 + 32}" y1="${profileY + 124}" x2="${x1 - 32}" y2="${profileY + 124}" stroke="#6b7280" stroke-width="2.8"/>
    </g>
    <text x="${x1 + 12}" y="${profileY + 62}" text-anchor="start" font-size="9.5" font-weight="600" fill="${INK}" font-family="Inter, system-ui, sans-serif">${lblMotorGb}</text>

    <line x1="${x0 + 22}" y1="${profileY + 22}" x2="${x1 - 22}" y2="${profileY + 22}" stroke="${LINE}" stroke-width="1.15" marker-end="url(#rlArrow)"/>
    <text x="${x0 + 26}" y="${profileY + 14}" font-size="10" font-weight="700" fill="#111827" font-family="Inter, system-ui, sans-serif">${lblLoadDir}</text>

    <g class="diagram-metric diagram-metric--v" data-diagram-metric="v" pointer-events="bounding-box">
      <line x1="${x0 + 34}" y1="${profileY + 22}" x2="${x0 + 108}" y2="${profileY + 22}" stroke="${ACC}" stroke-width="1.35" marker-end="url(#rlMkV)" />
    </g>

    <g class="diagram-metric diagram-metric--F" data-diagram-metric="F" pointer-events="bounding-box">
      <line x1="${x0 + 118}" y1="${profileY + 34}" x2="${x0 + 200}" y2="${profileY + 34}" stroke="${INK}" stroke-width="1.35" marker-end="url(#rlMkF)" />
    </g>

    <g class="diagram-metric" data-diagram-metric="D" pointer-events="bounding-box">
      <line x1="${rollerStartX + (nVis - 1) * pitchPx}" y1="${profileY + 32}" x2="${rollerStartX + (nVis - 1) * pitchPx}" y2="${profileY + 82}" stroke="#64748b" stroke-width="1.1" stroke-dasharray="4 3"/>
    </g>

    <text x="${x0}" y="${topViewY - 14}" font-size="10.5" font-weight="700" fill="#334155" font-family="Inter, system-ui, sans-serif">${lblTop}</text>
    <rect x="${x0 - 18}" y="${topViewY + 2}" width="${lenPx + 36}" height="${topViewRectH}" fill="#f1f5f9" stroke="${frameStroke}" stroke-width="1.1"/>
    <rect x="${x0 - 18}" y="${topViewY + 2}" width="9" height="${topViewRectH}" fill="${navy}" opacity="0.92"/>
    <rect x="${x1 + 9}" y="${topViewY + 2}" width="9" height="${topViewRectH}" fill="${navy}" opacity="0.92"/>
    <line x1="${x0 - 18}" y1="${topViewY + 14}" x2="${x1 + 18}" y2="${topViewY + 14}" stroke="#111827" stroke-width="0.85"/>
    <line x1="${x0 - 18}" y1="${topViewY + 76}" x2="${x1 + 18}" y2="${topViewY + 76}" stroke="#111827" stroke-width="0.85"/>

    ${Array.from({ length: nVis }, (_, i) => {
      const x = rollerStartX + i * pitchPx;
      const isDrive = i === nVis - 1;
      const fill = isDrive ? '#dcfce7' : '#f3f4f6';
      const stroke = isDrive ? ACC : LINE;
      return `
        <rect x="${(x - rollerR).toFixed(1)}" y="${(topViewY + 20).toFixed(1)}" width="${(rollerR * 2).toFixed(1)}" height="44" fill="${fill}" stroke="${stroke}" stroke-width="0.9"/>
        <line x1="${x.toFixed(1)}" y1="${(topViewY + 20).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(topViewY + 64).toFixed(1)}" stroke="#9ca3af" stroke-width="0.65"/>
        ${isDrive ? `<line x1="${(x - rollerR).toFixed(1)}" y1="${(topViewY + 42).toFixed(1)}" x2="${(x + rollerR).toFixed(1)}" y2="${(topViewY + 42).toFixed(1)}" stroke="${ACC}" stroke-width="1.4"/>` : ''}
      `;
    }).join('')}

    <line x1="${x0 - 18}" y1="${lDimLineY}" x2="${x1 + 18}" y2="${lDimLineY}" stroke="#9ca3af" stroke-width="0.9"/>
    <text x="${x0 + lenPx / 2}" y="${lLabelY}" text-anchor="middle" font-size="9.5" fill="#4b5563" font-family="Inter, system-ui, sans-serif" class="diagram-svg-lbl">L = ${mono(fmt(L, 1))} m</text>

    <g class="diagram-metric" data-diagram-metric="L" pointer-events="bounding-box">
      <line x1="${x0}" y1="${lDimLineY - 4}" x2="${x1}" y2="${lDimLineY - 4}" stroke="${ACC}" stroke-width="1.15" stroke-dasharray="5 4"/>
    </g>

    <!-- Columna izquierda: valores (texto plano, sin cajas) -->
    <g class="diagram-metric diagram-metric--v" data-diagram-metric="v" pointer-events="bounding-box">
      <text x="${chipX}" y="${yV + 19}" font-size="9.5" font-weight="600" fill="${INK}" class="diagram-svg-lbl">
        <tspan class="diagram-svg-lbl">v </tspan>${mono(fmt(v, 2))}<tspan class="diagram-svg-lbl"> m/s</tspan>
      </text>
    </g>
    <g class="diagram-metric" data-diagram-metric="L" pointer-events="bounding-box">
      <text x="${chipX}" y="${yL + 19}" font-size="9.5" font-weight="600" fill="${INK}" class="diagram-svg-lbl">
        <tspan class="diagram-svg-lbl">L </tspan>${mono(fmt(L, 1))}<tspan class="diagram-svg-lbl"> m</tspan>
      </text>
    </g>
    <g class="diagram-metric" data-diagram-metric="D" pointer-events="bounding-box">
      <text x="${chipX}" y="${yD + 19}" font-size="9.5" font-weight="600" fill="${INK}" class="diagram-svg-lbl">
        <tspan class="diagram-svg-lbl">D </tspan>${mono(fmt(D, 0))}<tspan class="diagram-svg-lbl"> mm</tspan>
      </text>
    </g>
    <g class="diagram-metric" data-diagram-metric="crr" pointer-events="bounding-box">
      <text x="${chipX}" y="${yCrr + 19}" font-size="9.5" font-weight="600" fill="${INK}" class="diagram-svg-lbl">
        <tspan class="diagram-svg-lbl">Crr </tspan>${mono(fmt(crr, 3))}
      </text>
    </g>
    <g class="diagram-metric diagram-metric--F" data-diagram-metric="F" pointer-events="bounding-box">
      <text x="${chipX}" y="${yF + 16}" font-size="9" font-weight="600" fill="${INK}" class="diagram-svg-lbl">
        <tspan class="diagram-svg-lbl">F </tspan>${mono(fmt(Fsteady, 1))}<tspan class="diagram-svg-lbl"> N</tspan>
      </text>
      <text x="${chipX}" y="${yF + 30}" font-size="7.5" fill="${MUTED}" class="diagram-svg-lbl">${fChipSub}</text>
    </g>

    <g transform="translate(12, ${caseRowY})">
      <rect x="0" y="0" width="288" height="${footerH}" rx="10" fill="url(#sumRlL)" stroke="none" />
      <text x="14" y="24" font-size="11" font-weight="800" fill="${INK}">${caseTitle}</text>
      <text x="14" y="44" font-size="10" fill="${LINE}">${caseL1} ${mono(fmt(m, 0))} kg | ${en ? 'mdot ~' : 'Qm ~'} ${mono(fmt(mdot, 2))} kg/s</text>
      <text x="14" y="62" font-size="10" fill="${LINE}">${caseL2} ~ ${mono(fmt(pitchMmAssumed, 0))} mm | ${en ? 'rollers ~' : 'rodillos ~'} ${nLogical}${simplifiedNote}</text>
      <text x="14" y="80" font-size="10" fill="${LINE}">RPM: ${mono(Number.isFinite(rpm) ? fmt(rpm, 2) : '--')} | SF ${mono(fmt(sf, 2))}</text>
      <text x="14" y="98" font-size="9" fill="${MUTED}">${caseL3}</text>
    </g>

    <g transform="translate(312, ${caseRowY})">
      <rect x="0" y="0" width="${vbW - 324}" height="${footerH}" rx="10" fill="url(#sumRlR)" stroke="none" />
      <text x="14" y="24" font-size="11" font-weight="800" fill="${INK}">${en ? 'Standard' : 'Norma'}</text>
      <text x="14" y="48" font-size="10" fill="${LINE}">${stdLabel}</text>
      <text x="14" y="72" font-size="9.5" fill="${MUTED}">${en ? 'Qualitative side + plan view.' : 'Vistas cualitativas perfil + planta.'}</text>
    </g>

    <!-- Leyenda al pie (debajo de datos / norma, orden z superior) -->
    <g transform="translate(0, ${legendRowY})" font-family="Inter, system-ui, sans-serif" aria-hidden="true">
      <line x1="20" y1="0" x2="${vbW - 20}" y2="0" stroke="#e2e8f0" stroke-width="1" />
      <text x="24" y="14" font-size="8" font-weight="800" fill="${MUTED}" letter-spacing="0.1em">${legTitle}</text>
      <line x1="24" y1="26" x2="46" y2="26" stroke="${ACC}" stroke-width="1.1" marker-end="url(#rlMkV)" />
      <text x="52" y="29" font-size="9.5" fill="${MUTED}">${legV}</text>
      <line x1="${vbW / 2 - 40}" y1="26" x2="${vbW / 2 - 18}" y2="26" stroke="${INK}" stroke-width="1.1" marker-end="url(#rlMkF)" />
      <text x="${vbW / 2 - 12}" y="29" font-size="9.5" fill="${MUTED}">${legF}</text>
      <text x="24" y="44" font-size="8.5" fill="${MUTED}">${legNote1} · ${legNote2}</text>
    </g>
  `;
}
