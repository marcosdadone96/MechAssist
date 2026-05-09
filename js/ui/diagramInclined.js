/**
 * Cinta inclinada — esquema detallado; flechas sobre la pendiente en posiciones separadas.
 */

import { clamp, radToDeg } from '../utils/calculations.js';
import { getCurrentLang } from '../config/locales.js';

const VB_W = 860;
const VB_H = 704;

const NAVY = '#1e3a5f';
const INK = '#334155';
const BELT = '#2563eb';

/**
 * @param {SVGSVGElement} svg
 * @param {object} p
 */
export function renderInclinedConveyorDiagram(svg, p) {
  if (!svg) return;

  const lang = p.lang ?? getCurrentLang();
  const en = lang === 'en';

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
  /** Origen de flechas hacia la banda; etiqueta de masa más alejada del bloque (sin tocar bordes ni flechas). */
  const loadInner = { x: loadCx - nx * 28, y: loadCy - ny * 28 };
  const loadMassX = loadCx + nx * 52;
  const loadMassY = loadCy + ny * 52;

  const Fref = 12000;
  const arrV = clamp(40 + v * 32, 36, 92);
  const legFg = clamp(34 + (Fg / Fref) * 50, 30, 78);
  const legFmu = clamp(30 + (Fmu / Fref) * 46, 26, 72);
  const legFt = clamp(38 + (Ft / Fref) * 52, 34, 96);

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

  const pv0 = { x: loadInner.x + nx * 5 + tx * -12, y: loadInner.y + ny * 5 + ty * -12 };
  const pv1 = { x: pv0.x + dUpX * arrV, y: pv0.y + dUpY * arrV };
  const fg0 = { x: loadInner.x - nx * 8 - tx * 6, y: loadInner.y - ny * 8 - ty * 6 };
  const fg1 = { x: fg0.x + dResX * legFg, y: fg0.y + dResY * legFg };
  const mu0 = { x: loadInner.x - nx * 14 - tx * 2, y: loadInner.y - ny * 14 - ty * 2 };
  const mu1 = { x: mu0.x + dResX * legFmu, y: mu0.y + dResY * legFmu };
  const ft0 = { x: loadInner.x + nx * 12 + tx * 10, y: loadInner.y + ny * 12 + ty * 10 };
  const ft1 = { x: ft0.x + dResX * legFt, y: ft0.y + dResY * legFt };

  const labelColX = Math.max(54, loadCx - 220);
  const labelTopY = Math.max(130, loadCy - 88);
  const vLabelX = labelColX + 112;
  const vLabelY = labelTopY - 16;
  const fgLabelX = labelColX;
  const fgLabelY = labelTopY + 20;
  const muLabelX = labelColX;
  const muLabelY = labelTopY - 18;
  const ftLabelX = labelColX;
  const ftLabelY = labelTopY + 58;

  const tTitle = en ? 'Inclined belt - uphill' : 'Cinta inclinada · subida';
  const tSub = en
    ? 'Forces on separate lanes to avoid overlap and improve readability'
    : 'Flechas en carriles separados para evitar cruces y mejorar lectura';
  const tRefH = en ? 'Horizontal reference' : 'Referencia horizontal';
  const tFound = en ? 'Foundation / lower support' : 'Cimentaci\u00f3n / soporte bajo';
  const tBelt = en ? 'Belt' : 'Banda';
  const tTail = en ? 'Tail' : 'Cola';
  const tDrive = en ? 'Drive' : 'Motriz';
  const tDriveDrum = en ? 'Drive drum' : 'Tambor motriz';
  const tMotor = 'Motor';
  const tGb = en ? 'GB.' : 'Red.';
  const tAngle = en ? 'Angle theta' : '\u00c1ngulo \u03b8';
  const tDisch = en ? 'Discharge' : 'Descarga';
  const tipV = en ? `Uphill ${v.toFixed(2)} m/s` : `Sube ${v.toFixed(2)} m/s`;
  const tipVTitle = en
    ? `Belt advance: uphill ${v.toFixed(2)} m/s`
    : `Avance de banda: sube ${v.toFixed(2)} m/s`;
  const tSlopeW = en ? 'Slope weight' : 'Peso en pendiente';
  const tSlopeWSub = en ? 'Component resisting uphill motion' : 'Componente que frena la subida';
  const tipFgTitle = en
    ? `Slope weight: ${Fg.toFixed(0)} N (component resisting lift)`
    : `Peso en pendiente: ${Fg.toFixed(0)} N (componente que frena la subida)`;
  const tFric = en ? 'Friction' : 'Rozamiento';
  const tFricSub = en ? `Coef. mu ~ ${mu.toFixed(2)}` : `Coef. \u03bc \u2248 ${mu.toFixed(2)}`;
  const tipFmuTitle = en ? `Friction: ${Fmu.toFixed(0)} N (mu ~ ${mu.toFixed(2)})` : `Rozamiento: ${Fmu.toFixed(0)} N (\u03bc \u2248 ${mu.toFixed(2)})`;
  const tTotal = en ? 'Total resistance' : 'Resistencia total';
  const tTotalSub = en ? 'Sum of effects - reference at drum' : 'Suma efectos · referencia en tambor';
  const tipFtTitle = en ? `Total resistance: ${Ft.toFixed(0)} N` : `Resistencia total: ${Ft.toFixed(0)} N`;
  const legTitle = en ? 'Arrow legend' : 'Leyenda de flechas';
  const legV = en ? 'Belt motion' : 'Avance banda';
  const legG = en ? 'Weight component' : 'Componente peso';
  const legM = tFric;
  const legT = en ? 'Total' : 'Total';
  const sumTitle = en ? 'Summary at drum' : 'Resumen en el tambor';
  const sumDetail1 = en
    ? `Steady ${(p.detail.F_steady_N ?? 0).toFixed(0)} N · Startup ${(p.detail.F_total_start_N ?? 0).toFixed(0)} N`
    : `R\u00e9gimen ${(p.detail.F_steady_N ?? 0).toFixed(0)} N \u00b7 Arranque ${(p.detail.F_total_start_N ?? 0).toFixed(0)} N`;
  const sumPow = en ? 'Power' : 'Potencia';
  const sumTorque = en ? 'Torque' : 'Par';
  const sumStartup = en
    ? `Startup time ${(p.detail.accelTime_s ?? 0).toFixed(2)} s · Inertia factor ${(p.detail.inertiaStartingFactor ?? 1).toFixed(2)}`
    : `Tiempo arranque ${(p.detail.accelTime_s ?? 0).toFixed(2)} s \u00b7 Factor inercia ${(p.detail.inertiaStartingFactor ?? 1).toFixed(2)}`;

  /** Pie: resumen arriba, leyenda al fondo (sin solaparse con la geometría). */
  const footerLegendH = 54;
  const footerSummaryH = 92;
  const footerGap = 14;
  const sumBlockY = VB_H - footerLegendH - footerGap - footerSummaryH;
  const legBlockY = VB_H - footerLegendH;

  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <marker id="mkVi" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#0d9488" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkGi" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#475569" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkMi" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#475569" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="mkTi" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#334155" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <style><![CDATA[ .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; } ]]></style>
    </defs>
    <style>
      .inc-force-tip { opacity: 0; pointer-events: none; transition: opacity 0.15s ease; }
      .inc-force-arrow:hover .inc-force-tip { opacity: 1; }
    </style>

    <rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="#f4f7fb" />
    <text x="28" y="36" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">${tTitle}</text>
    <text x="28" y="54" font-size="11.5" fill="#475569" font-family="Inter, Segoe UI, sans-serif">${tSub}</text>

    <line x1="72" y1="${y0 + 14}" x2="${VB_W - 72}" y2="${y0 + 14}" stroke="#cbd5e1" stroke-width="1" />

    <polygon points="${x0 - 18},${y0 + 8} ${x0 + 52},${y0 + 8} ${x0 + 8},${y0 + 38}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2" opacity="0.9" />
    <text x="${x0 - 8}" y="${y0 + 58}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">${tFound}</text>

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
      fill="${BELT}" stroke="${NAVY}" stroke-width="1" stroke-linejoin="round" />
    <text transform="translate(${(top0x + top1x) / 2 - 38}, ${(top0y + top1y) / 2 - 18}) rotate(${-θdeg})" font-size="12" font-weight="700" fill="#f8fafc" font-family="Inter, Segoe UI, sans-serif">${tBelt}</text>

    <circle cx="${drum0x}" cy="${drum0y}" r="${r}" fill="#f1f5f9" stroke="#475569" stroke-width="1.6" />
    <text x="${drum0x - r - 14}" y="${drum0y + 5}" text-anchor="end" font-size="10" font-weight="800" fill="#334155" font-family="Inter, Segoe UI, sans-serif">${tTail}</text>

    <circle cx="${drum1x}" cy="${drum1y}" r="${r}" fill="rgba(13, 148, 136, 0.1)" stroke="#0d9488" stroke-width="1.6" />
    <text x="${drum1x}" y="${drum1y - r - 14}" text-anchor="middle" font-size="10" font-weight="800" fill="#0d9488" font-family="Inter, Segoe UI, sans-serif">${tDrive}</text>
    <text x="${drum1x + r + 14}" y="${drum1y - 36}" font-size="10" font-weight="700" fill="${INK}" font-family="Inter, Segoe UI, sans-serif">${tDriveDrum}</text>
    <g transform="translate(${Math.min(drum1x + r + 6, VB_W - 118)}, ${drum1y - r - 72})">
      <text x="0" y="14" font-size="10" font-weight="700" fill="${INK}" font-family="Inter, Segoe UI, sans-serif">${tMotor}</text>
      <text x="52" y="14" font-size="9" font-weight="700" fill="#0d9488" font-family="Inter, Segoe UI, sans-serif">${tGb}</text>
    </g>

    <path d="M ${x0 + 50} ${y0} A 50 50 0 0 0 ${x0 + 50 * Math.cos(ang)} ${y0 - 50 * Math.sin(ang)}" fill="none" stroke="${INK}" stroke-width="1" />
    <line x1="${x1 + 28}" y1="${y1 - 8}" x2="${x1 + 28}" y2="${y1 - 38}" stroke="${INK}" stroke-width="1" />
    <text x="${x1 + 34}" y="${y1 - 22}" font-size="9" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">${tDisch}</text>

    <g transform="rotate(${-θdeg} ${loadCx} ${loadCy})">
      <rect x="${loadCx - loadW / 2}" y="${loadCy - loadH / 2}" width="${loadW}" height="${loadH}" rx="5" fill="rgba(13, 148, 136, 0.12)" stroke="#0d9488" stroke-width="1" />
    </g>
    <text x="${loadMassX}" y="${loadMassY}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#134e4a" font-family="Inter, Segoe UI, sans-serif" class="diagram-svg-label--on-drawing">m = ${m.toFixed(0)} kg</text>

    <!-- Flechas rectas saliendo desde la carga -->
    <g class="inc-force-arrow">
      <line x1="${pv0.x}" y1="${pv0.y}" x2="${pv1.x}" y2="${pv1.y}" fill="none" stroke="#0d9488" stroke-width="1.35" marker-end="url(#mkVi)" />
      <title>${tipVTitle}</title>
      <g class="inc-force-tip">
        <rect x="${vLabelX - 64}" y="${vLabelY - 16}" width="128" height="18" rx="3" fill="#f1f5f9" fill-opacity="0.98" stroke="none" />
        <text x="${vLabelX}" y="${vLabelY - 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#047857" font-family="Inter, Segoe UI, sans-serif">${tipV}</text>
      </g>
    </g>

    <g class="inc-force-arrow">
      <line x1="${fg0.x}" y1="${fg0.y}" x2="${fg1.x}" y2="${fg1.y}" fill="none" stroke="#64748b" stroke-width="1.35" stroke-dasharray="7 5" marker-end="url(#mkGi)" />
      <title>${tipFgTitle}</title>
      <g class="inc-force-tip">
        <rect x="${fgLabelX - 2}" y="${fgLabelY - 20}" width="152" height="30" rx="3" fill="#f1f5f9" fill-opacity="0.98" stroke="none" />
        <line x1="${fg1.x}" y1="${fg1.y}" x2="${fgLabelX + 2}" y2="${fgLabelY - 5}" stroke="#94a3b8" stroke-width="0.75" />
        <text x="${fgLabelX + 4}" y="${fgLabelY - 6}" font-size="9" font-weight="800" fill="#9a3412" font-family="Inter, Segoe UI, sans-serif">${tSlopeW} ${Fg.toFixed(0)} N</text>
        <text x="${fgLabelX + 4}" y="${fgLabelY + 6}" font-size="8" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">${tSlopeWSub}</text>
      </g>
    </g>

    <g class="inc-force-arrow">
      <line x1="${mu0.x}" y1="${mu0.y}" x2="${mu1.x}" y2="${mu1.y}" fill="none" stroke="#64748b" stroke-width="1.3" stroke-dasharray="7 5" marker-end="url(#mkMi)" />
      <title>${tipFmuTitle}</title>
      <g class="inc-force-tip">
        <rect x="${muLabelX - 2}" y="${muLabelY - 20}" width="152" height="30" rx="3" fill="#f1f5f9" fill-opacity="0.98" stroke="none" />
        <line x1="${mu1.x}" y1="${mu1.y}" x2="${muLabelX + 2}" y2="${muLabelY - 5}" stroke="#94a3b8" stroke-width="0.75" />
        <text x="${muLabelX + 4}" y="${muLabelY - 6}" font-size="9" font-weight="800" fill="#5b21b6" font-family="Inter, Segoe UI, sans-serif">Rozamiento ${Fmu.toFixed(0)} N</text>
        <text x="${muLabelX + 4}" y="${muLabelY + 6}" font-size="8" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">Coef. μ ≈ ${mu.toFixed(2)}</text>
      </g>
    </g>

    <g class="inc-force-arrow">
      <line x1="${ft0.x}" y1="${ft0.y}" x2="${ft1.x}" y2="${ft1.y}" fill="none" stroke="#334155" stroke-width="1.45" marker-end="url(#mkTi)" />
      <title>${tipFtTitle}</title>
      <g class="inc-force-tip">
        <rect x="${ftLabelX - 2}" y="${ftLabelY - 20}" width="176" height="34" rx="3" fill="#f1f5f9" fill-opacity="0.98" stroke="none" />
        <line x1="${ft1.x}" y1="${ft1.y}" x2="${ftLabelX + 2}" y2="${ftLabelY - 5}" stroke="#94a3b8" stroke-width="0.75" />
        <text x="${ftLabelX + 4}" y="${ftLabelY - 4}" font-size="10" font-weight="800" fill="#0f172a" font-family="Inter, Segoe UI, sans-serif">${tTotal} ${Ft.toFixed(0)} N</text>
        <text x="${ftLabelX + 4}" y="${ftLabelY + 10}" font-size="8.5" fill="#64748b" font-family="Inter, Segoe UI, sans-serif">${tTotalSub}</text>
      </g>
    </g>

    <!-- Cotas en dibujo (solo trazos; valores en pie) -->
    <line x1="${x1 + 14}" y1="${y1}" x2="${x1 + 14}" y2="${y0}" stroke="${INK}" stroke-width="1" stroke-dasharray="4 3" />

    <!-- Resumen y leyenda (leyenda al fondo del SVG) -->
    <g transform="translate(28, ${sumBlockY})">
      <line x1="0" y1="0" x2="${VB_W - 56}" y2="0" stroke="#e2e8f0" stroke-width="1" />
      <text x="0" y="20" font-size="11" font-weight="700" fill="${INK}">${sumTitle}</text>
      ${
        p.detail
          ? `<text x="0" y="38" font-size="9.5" fill="#475569">${sumDetail1}</text>
      <text x="0" y="54" font-size="10" font-weight="600" fill="${INK}">${sumPow} ${Pd.toFixed(0)} W \u00b7 ${sumTorque} ${Td.toFixed(1)} N\u00b7m</text>
      <text x="0" y="72" font-size="9" fill="#94a3b8">${sumStartup}</text>`
          : `<text x="0" y="42" font-size="10" font-weight="600" fill="${INK}">${sumPow} ${Pd.toFixed(0)} W \u00b7 ${sumTorque} ${Td.toFixed(1)} N\u00b7m</text>`
      }
    </g>

    <g transform="translate(28, ${legBlockY})" font-family="Inter, Segoe UI, sans-serif">
      <line x1="0" y1="0" x2="${VB_W - 56}" y2="0" stroke="#e2e8f0" stroke-width="1" />
      <text x="0" y="16" font-size="8.5" font-weight="700" fill="${INK}">${legTitle}</text>
      <line x1="0" y1="26" x2="18" y2="26" stroke="#0d9488" stroke-width="1" marker-end="url(#mkVi)" />
      <text x="22" y="29" font-size="8.5" fill="#64748b">${legV}</text>
      <line x1="108" y1="26" x2="126" y2="26" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3" marker-end="url(#mkGi)" />
      <text x="130" y="29" font-size="8.5" fill="#64748b">${legG}</text>
      <line x1="208" y1="26" x2="226" y2="26" stroke="#64748b" stroke-width="1" stroke-dasharray="4 3" marker-end="url(#mkMi)" />
      <text x="230" y="29" font-size="8.5" fill="#64748b">${legM}</text>
      <line x1="300" y1="26" x2="318" y2="26" stroke="${INK}" stroke-width="1" marker-end="url(#mkTi)" />
      <text x="322" y="29" font-size="8.5" fill="#64748b">${legT}</text>
      <text x="0" y="48" font-size="9.5" fill="#64748b">${tRefH} · L = <tspan class="diagram-svg-num">${L.toFixed(1)}</tspan> m · H = <tspan class="diagram-svg-num">${H.toFixed(2)}</tspan> m · ${tAngle} = <tspan class="diagram-svg-num">${θdeg.toFixed(1)}</tspan>°</text>
    </g>
  `;
}
