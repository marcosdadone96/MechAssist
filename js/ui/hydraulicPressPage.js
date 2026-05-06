import { mountCompactLabFieldHelp } from './labHelpCompact.js';
import { readLabNumber } from '../utils/labInputParse.js';
import { mountLabFluidPdfExportBar } from '../services/fluidLabPdfExport.js';
import { formatDateTimeLocale, getCurrentLang } from '../config/locales.js';

const G = 9.81;
const PI = Math.PI;
const ISO_PISTON_MM = [40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400];
const ETA_DIAG = 0.92;
/** Plato móvil a fracción de carrera (0 = junto al cilindro, 1 = cerca de mesa) — posición intermedia representativa */
const PLATEN_STROKE_RATIO = 0.44;

/** @type {object | null} */
let pressPdfSnapshot = null;

function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : '--';
}

function metric(label, value, unit = '') {
  return `
    <article class="lab-metric">
      <div class="k">${label}</div>
      <div class="v">${value}</div>
      ${unit ? `<div class="lab-metric__si">${unit}</div>` : ''}
    </article>
  `;
}

function nearestIsoAtOrAbove(mm) {
  for (let i = 0; i < ISO_PISTON_MM.length; i += 1) {
    if (ISO_PISTON_MM[i] >= mm) return ISO_PISTON_MM[i];
  }
  return ISO_PISTON_MM[ISO_PISTON_MM.length - 1];
}

/**
 * @param {SVGElement | null} svg
 * @param {number} pistonMm
 * @param {number} forceTon
 * @param {2|4} nCols
 */
function renderPressDiagram(svg, pistonMm, forceTon, nCols) {
  if (!(svg instanceof SVGElement)) return;
  const cylW = Math.max(34, Math.min(70, pistonMm * 0.16));
  const cx = 380;
  const yBeam = 38;
  const beamH = 20;
  const yColTop = 58;
  const yTable = 226;
  const colH = yTable - yColTop;
  const colW = 12;
  const yCyl = 58;
  const cylH = 52;
  const yCylBottom = yCyl + cylH;
  const platenH = 20;
  const yTableInner = yTable - 6;
  const yPlaten = yCylBottom + PLATEN_STROKE_RATIO * Math.max(8, yTableInner - platenH - yCylBottom - 4);
  const rodW = 24;
  const rodTop = yCyl + cylH - 4;
  const rodH = Math.max(12, yPlaten - rodTop);

  const colXs = nCols === 2 ? [cx - 205, cx + 205 - colW] : [164, 236, 512, 584];
  const colRects = colXs.map((x) => `<rect x="${x}" y="${yColTop}" width="${colW}" height="${colH}" fill="#d1d5db" stroke="#64748b" stroke-width="1.2"/>`).join('');

  const titleDiag = nCols === 2
    ? 'Prensa hidráulica de 2 columnas — vista funcional'
    : 'Prensa hidráulica de 4 columnas — vista funcional';
  const lblCols = nCols === 2 ? 'Columnas (laterales)' : 'Columnas';

  svg.setAttribute('viewBox', '0 0 760 280');
  svg.innerHTML = `
    <defs>
      <marker id="hppArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#0ea5e9"/>
      </marker>
      <linearGradient id="hppSteel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e5e7eb"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <rect width="760" height="280" fill="#f8fafc"/>
    <text x="20" y="24" font-size="12.5" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">${titleDiag}</text>
    <rect x="125" y="${yBeam}" width="510" height="${beamH}" rx="5" fill="url(#hppSteel)" stroke="#64748b" stroke-width="1.4"/>
    <rect x="102" y="${yTable}" width="556" height="24" rx="5" fill="url(#hppSteel)" stroke="#64748b" stroke-width="1.4"/>
    ${colRects}
    <rect x="${cx - cylW / 2}" y="${yCyl}" width="${cylW}" height="${cylH}" rx="8" fill="#a7f3d0" stroke="#0f766e" stroke-width="1.4"/>
    <rect x="${cx - rodW / 2}" y="${rodTop}" width="${rodW}" height="${rodH}" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    <rect x="244" y="${yPlaten}" width="272" height="${platenH}" rx="4" fill="#dbeafe" stroke="#0284c7" stroke-width="1.4"/>
    <rect x="292" y="${yPlaten + platenH + 8}" width="176" height="18" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="5 4"/>
    <text x="306" y="${yPlaten + platenH + 20}" font-size="9.5" fill="#334155" font-family="Inter,system-ui,sans-serif">Zona de prensado</text>
    <path d="M${cx} ${yCyl + 22} L${cx} ${yPlaten - 2}" stroke="#0ea5e9" stroke-width="2.8" marker-end="url(#hppArrow)"/>
    <text x="398" y="${yCyl + 18}" font-size="10" fill="#0369a1" font-weight="700" font-family="Inter,system-ui,sans-serif">Presión aplicada</text>
    <text x="398" y="${yCyl + 34}" font-size="9.8" fill="#334155" font-family="Inter,system-ui,sans-serif">F = ${fmt(forceTon, 1)} t</text>
    <text x="${cx - cylW / 2 - 4}" y="${yCyl - 4}" font-size="9.5" fill="#334155" font-family="Inter,system-ui,sans-serif">Cilindro</text>
    <text x="322" y="${yPlaten - 4}" font-size="9.5" fill="#334155" font-family="Inter,system-ui,sans-serif">Plato móvil</text>
    <text x="332" y="258" font-size="9.5" fill="#334155" font-family="Inter,system-ui,sans-serif">Mesa fija</text>
    <text x="146" y="${yColTop + 14}" font-size="9.3" fill="#334155" font-family="Inter,system-ui,sans-serif">${lblCols}</text>
  `;
}

function syncLabTierUi() {
  const tier = document.getElementById('hppLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hppLabTier').value
    : 'basic';
  const panel = document.getElementById('hppProjectPanel');
  if (panel instanceof HTMLElement) panel.hidden = tier !== 'project';
}

function productivityBadgeHtml(cycleS) {
  const cph = 3600 / Math.max(0.01, cycleS);
  let cls = 'hpp-prod-badge--low';
  let label = 'Baja productividad';
  if (cph > 30) {
    cls = 'hpp-prod-badge--high';
    label = 'Alta productividad';
  } else if (cph >= 10) {
    cls = 'hpp-prod-badge--mid';
    label = 'Media productividad';
  }
  return `
    <div class="hpp-prod-row">
      <span class="hpp-prod-badge ${cls}">${label}</span>
      <span class="hpp-prod-text">≈ ${fmt(cph, 1)} ciclos/h (según tiempo de ciclo ${fmt(cycleS, 1)} s)</span>
    </div>
  `;
}

function updateApproachNote(strokeMm, cycleS, approachFactor) {
  const el = document.getElementById('hppApproachDynamicNote');
  if (!(el instanceof HTMLElement)) return;
  const tWork = cycleS * 0.55;
  const vWork = (strokeMm / 1000) / Math.max(0.1, tWork);
  const denom = vWork * approachFactor;
  const tEst = denom > 0 ? (strokeMm / 1000) / denom : NaN;
  el.textContent = Number.isFinite(tEst)
    ? `Con factor ${fmt(approachFactor, 2)}, el plato baja ${fmt(approachFactor, 2)} veces más rápido en vacío que bajo carga. Tiempo estimado de aproximación: ${fmt(tEst, 2)} s (carrera / (v trabajo × ${fmt(approachFactor, 2)})).`
    : '';
}

function computeAndRender() {
  const mode = document.getElementById('hppMode') instanceof HTMLSelectElement
    ? document.getElementById('hppMode').value
    : 'design';
  const labTier = document.getElementById('hppLabTier') instanceof HTMLSelectElement
    ? document.getElementById('hppLabTier').value
    : 'basic';

  const results = document.getElementById('hppResults');
  const advisor = document.getElementById('hppAdvisor');
  const verdict = document.getElementById('hppVerdict');
  const formulaBody = document.getElementById('hppFormulaBody');
  if (!(results instanceof HTMLElement) || !(advisor instanceof HTMLElement) || !(verdict instanceof HTMLElement)) return;

  pressPdfSnapshot = { valid: false };

  const errors = [];
  const need = (r) => {
    if (!r.ok) errors.push(r.error);
    return r.ok ? r.value : NaN;
  };

  const forceTon = need(readLabNumber('hppForceTon', 1, undefined, 'Fuerza de prensado (t)'));
  const pBar = need(readLabNumber('hppPressureBar', 50, undefined, 'Presión máxima (bar)'));
  const strokeMm = need(readLabNumber('hppStrokeMm', 20, undefined, 'Carrera (mm)'));
  const cycleS = need(readLabNumber('hppCycleS', 1, undefined, 'Tiempo de ciclo (s)'));
  const approachFactor = need(readLabNumber('hppApproachFactor', 1, 6, 'Factor velocidad aproximación'));
  const pumpFlowLmin = need(readLabNumber('hppPumpFlowLmin', 1, undefined, 'Caudal de bomba (L/min)'));
  const sigmaAllowMpa = need(readLabNumber('hppSteelMpa', 80, undefined, 'Tensión admisible columna (MPa)'));

  const colsEl = document.getElementById('hppColumns');
  const nColsRaw = colsEl instanceof HTMLSelectElement ? Number(colsEl.value) : NaN;
  let nCols = 4;
  if (nColsRaw === 2 || nColsRaw === 4) nCols = nColsRaw;
  else errors.push('Número de columnas: valor no válido.');

  const userColEl = document.getElementById('hppUserColumnMm');
  let userColMm = NaN;
  if (userColEl instanceof HTMLInputElement && String(userColEl.value).trim() !== '') {
    const ru = readLabNumber('hppUserColumnMm', 20, 2000, 'Diámetro de columna disponible (mm)');
    if (!ru.ok) errors.push(ru.error);
    else userColMm = ru.value;
  }

  let diagPistonMm = 250;
  let diagColMm = 110;
  if (mode === 'diagnostic') {
    const dp = readLabNumber('hppDiagPistonMm', 20, undefined, 'Diámetro pistón existente (mm)');
    const dc = readLabNumber('hppDiagColumnMm', 20, undefined, 'Diámetro real de columnas (mm)');
    if (!dp.ok) errors.push(dp.error);
    else diagPistonMm = dp.value;
    if (!dc.ok) errors.push(dc.error);
    else diagColMm = dc.value;
  }

  let colLengthMm = 2200;
  let colK = 0.7;
  let eGpa = 210;
  if (labTier === 'project') {
    const rL = readLabNumber('hppColLengthMm', 200, 20000, 'Longitud libre columna (mm)');
    const rE = readLabNumber('hppEGpa', 70, 220, 'Módulo E (GPa)');
    if (!rL.ok) errors.push(rL.error);
    else colLengthMm = rL.value;
    if (!rE.ok) errors.push(rE.error);
    else eGpa = rE.value;
    const kEl = document.getElementById('hppColK');
    colK = kEl instanceof HTMLSelectElement ? Number(kEl.value) : 0.7;
    if (!Number.isFinite(colK) || colK <= 0) errors.push('Coeficiente K: valor no válido.');
  }

  if (!errors.length && Number.isFinite(strokeMm) && Number.isFinite(cycleS) && Number.isFinite(approachFactor)) {
    updateApproachNote(strokeMm, cycleS, approachFactor);
  }

  if (errors.length) {
    results.innerHTML = '';
    const note = document.getElementById('hppApproachDynamicNote');
    if (note instanceof HTMLElement) note.textContent = '';
    if (formulaBody instanceof HTMLElement) formulaBody.innerHTML = '';
    advisor.innerHTML = `<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>Entrada no válida:</strong><ul style="margin:0.4em 0 1.1em;padding:0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul></div></div>`;
    verdict.className = 'lab-verdict lab-verdict--err';
    verdict.textContent = 'Revise los valores del formulario.';
    const titleEl = document.getElementById('hppDiagramTitle');
    if (titleEl) titleEl.textContent = nCols === 2 ? 'Prensa hidráulica de 2 columnas (esquema funcional)' : 'Prensa hidráulica de 4 columnas (esquema funcional)';
    return;
  }

  const diagTitle = document.getElementById('hppDiagramTitle');
  if (diagTitle) {
    diagTitle.textContent = nCols === 2 ? 'Prensa hidráulica de 2 columnas (esquema funcional)' : 'Prensa hidráulica de 4 columnas (esquema funcional)';
  }

  const forceNDesign = forceTon * 1000 * G;
  const pPa = pBar * 1e5;

  const areaReqM2 = forceNDesign / pPa;
  const pistonReqM = Math.sqrt((4 * areaReqM2) / PI);
  const pistonReqMm = pistonReqM * 1000;
  const pistonIsoMm = nearestIsoAtOrAbove(pistonReqMm);
  const pistonUseMm = mode === 'diagnostic' ? diagPistonMm : pistonIsoMm;
  const areaUseM2 = (PI * Math.pow(pistonUseMm / 1000, 2)) / 4;
  const forceN = mode === 'diagnostic' ? pPa * areaUseM2 * ETA_DIAG : pPa * areaUseM2;
  const tonReal = forceN / (1000 * G);

  const tApproach = cycleS * 0.45;
  const tWork = cycleS * 0.55;
  const vWork = (strokeMm / 1000) / Math.max(0.1, tWork);
  const vApproach = vWork * approachFactor;
  const qWorkLmin = areaUseM2 * vWork * 60000;
  const qApproachLmin = areaUseM2 * vApproach * 60000;
  const qReqLmin = Math.max(qWorkLmin, qApproachLmin);

  const motorKw = (pBar * qReqLmin) / (600 * 0.85);
  const motorKwFromPump = (pBar * pumpFlowLmin) / (600 * 0.85);
  const motorStd = [5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400];
  const motorRec = motorStd.find((k) => k >= motorKw) || motorStd[motorStd.length - 1];
  const cycleScale = Math.max(1, qReqLmin / Math.max(0.1, pumpFlowLmin));
  const cycleRealS = cycleS * cycleScale;

  const forcePerColN = forceN / nCols;
  const sigmaAllowPa = sigmaAllowMpa * 1e6;
  const areaColM2 = forcePerColN / sigmaAllowPa;
  const colDiaMm = Math.sqrt((4 * areaColM2) / PI) * 1000;
  const colDiaSafeMm = colDiaMm * 1.2;
  const diagColAreaM2 = (PI * Math.pow(diagColMm / 1000, 2)) / 4;
  const maxTonByCols = (diagColAreaM2 * sigmaAllowPa * nCols) / (1000 * G);

  const dColEulerMm = mode === 'diagnostic' ? diagColMm : colDiaSafeMm;
  const Lcol = colLengthMm / 1000;
  const Epa = eGpa * 1e9;
  const dM = dColEulerMm / 1000;
  const Icol = (PI * Math.pow(dM, 4)) / 64;
  const pCrColN = labTier === 'project'
    ? (PI * PI * Epa * Icol) / Math.pow(Math.max(0.01, colK * Lcol), 2)
    : NaN;
  const fsEulerCol = labTier === 'project' && Number.isFinite(pCrColN) ? pCrColN / Math.max(1, forcePerColN) : NaN;

  renderPressDiagram(document.getElementById('hpPressDiagram'), pistonUseMm, tonReal, nCols);

  const mainCards = [
    metric('Tonelaje real', `${fmt(tonReal, 1)} t`, mode === 'diagnostic' ? `estimado por D = ${fmt(diagPistonMm, 1)} mm` : `objetivo ${fmt(forceTon, 1)} t`),
    metric('Diámetro pistón sugerido (ISO)', `${fmt(pistonIsoMm, 0)} mm`, `req. teórico ${fmt(pistonReqMm, 1)} mm`),
    metric('Caudal bomba necesario', `${fmt(qReqLmin, 1)} L/min`, `aprox. ${fmt(qApproachLmin, 1)} / trabajo ${fmt(qWorkLmin, 1)}`),
    metric('Potencia motor eléctrico', `${fmt(motorKw, 2)} kW`, `normalizado ${fmt(motorRec, 1)} kW`),
  ].join('');

  const secondaryCards = [
    metric('Caudal de aproximación', `${fmt(qApproachLmin, 1)} L/min`, `factor aprox. ${fmt(approachFactor, 2)}×`),
    metric('Caudal de trabajo', `${fmt(qWorkLmin, 1)} L/min`, `fase de prensado`),
    metric('Potencia disponible (bomba actual)', `${fmt(motorKwFromPump, 2)} kW`, `Q actual ${fmt(pumpFlowLmin, 1)} L/min`),
    metric('Tiempo de ciclo estimado con bomba actual', `${fmt(cycleRealS, 2)} s`, `objetivo ${fmt(cycleS, 2)} s`),
  ];
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    secondaryCards.push(
      metric('Carga crít. Euler columna', `${fmt(pCrColN / 1000, 1)} kN`, `FS ${fmt(fsEulerCol, 2)} (D = ${fmt(dColEulerMm, 0)} mm)`),
    );
  }

  results.innerHTML = `
    ${mainCards}
    ${productivityBadgeHtml(cycleS)}
    <details class="hpp-more-details">
      <summary>Datos técnicos secundarios</summary>
      <div class="hpp-more-details__body">
        <div class="lab-results">${secondaryCards.join('')}</div>
      </div>
    </details>
  `;

  const formulaLines = [
    'Fuerza objetivo (diseño): F = m_t × 1000 × g con m_t en toneladas métricas (equiv. ~kN/g).',
    'Área pistón requerida: A_req = F / p con p en Pa (bar × 1e5).',
    'Diámetro teórico: d = √(4×A_req/π). Se normaliza a carrera ISO de pistón.',
    `Caudal trabajo: Q = A × v × 60000 L/min con v = carrera_m / t_trabajo (t_trabajo = 0,55 × t_ciclo).`,
    'Caudal aproximación: Q_aprox = A × v_aprox × 60000 con v_aprox = factor × v_trabajo.',
    'Potencia hidráulica aprox.: P_kW = (p_bar × Q_Lmin) / (600 × η) con η = 0,85.',
    'Columnas (tensión axial): A_col = (F/n) / σ_adm; d_min = √(4×A_col/π); sugerido ×1,2.',
  ];
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    formulaLines.push('Pandeo Euler: I = π×d⁴/64, P_cr = π²×E×I/(K×L)² con L en m, E en Pa, K coef. longitud efectiva.');
    formulaLines.push(`D usado en I: ${mode === 'diagnostic' ? 'diámetro real columnas' : 'diámetro mínimo ×1,2 (diseño)'}.`);
  } else if (labTier === 'basic') {
    formulaLines.push('Modo aula: no se evalúa pandeo de columnas; el chequeo axial es orientativo.');
  }

  const assumptions = [
    'g = 9,81 m/s². Presión uniforme en pistón sin caída dinámica modelada.',
    'Rendimiento mecánico/hidráulico agregado 0,85 en potencia de motor.',
    mode === 'diagnostic' ? `Modo diagnóstico: fuerza efectiva ~ η_diag = ${ETA_DIAG} sobre p×A.` : 'Modo diseño: fuerza nominal p×A sin η de diagnóstico.',
    labTier === 'project'
      ? `Pandeo: columna circular maciza, E = ${fmt(eGpa, 0)} GPa, L = ${fmt(colLengthMm, 0)} mm, K = ${fmt(colK, 2)}.`
      : 'Sin verificación de pandeo de columnas en modo aula.',
    'El modelo no calcula la rigidez del bastidor (deflexión del travesaño superior) ni la distribución de carga entre columnas ante excentricidad de la pieza.',
    'No sustituye análisis FEM, fatiga ni guiado de plato.',
  ];

  if (formulaBody instanceof HTMLElement) {
    formulaBody.innerHTML = `
      <p class="lab-fluid-formulas__lead">${labTier === 'project' ? 'Modo proyecto: incluye pandeo Euler en columnas.' : 'Modo aula: fórmulas básicas y tensión axial en columnas.'}</p>
      <ol class="lab-fluid-formulas__list">
        ${formulaLines.map((x) => `<li>${x}</li>`).join('')}
      </ol>
      <p class="lab-fluid-formulas__sub"><strong>Supuestos</strong></p>
      <ul class="lab-fluid-formulas__list">
        ${assumptions.map((x) => `<li>${x}</li>`).join('')}
      </ul>
    `;
  }

  const alerts = [];
  if (pBar > 350) {
    alerts.push('<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>Presión extrema:</strong> Requiere componentes de alta gama y sellos especiales. Considere aumentar el diámetro del pistón para trabajar a presiones estándar (210–250 bar).</div></div>');
  }
  if (mode === 'diagnostic' && pBar > 250) {
    alerts.push('<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>Peligro:</strong> está superando la presión de diseño. Riesgo de fatiga en columnas o rotura de sellos.</div></div>');
  }
  if (labTier === 'project' && Number.isFinite(fsEulerCol) && fsEulerCol < 2) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>Pandeo columnas:</strong> FS Euler ${fmt(fsEulerCol, 2)} &lt; 2. Aumente diámetro, arriostre o reduzca L/K.</div></div>`);
  }
  if (Number.isFinite(userColMm)) {
    if (userColMm + 0.01 >= colDiaSafeMm) {
      alerts.push(`<div class="lab-alert lab-alert--info"><div class="lab-alert__body"><strong>Columna disponible:</strong> Ø ${fmt(userColMm, 1)} mm ≥ mínimo orientativo ${fmt(colDiaSafeMm, 1)} mm (tensión axial ×1,2).</div></div>`);
    } else {
      alerts.push(`<div class="lab-alert lab-alert--warn"><div class="lab-alert__body"><strong>Columna disponible:</strong> Ø ${fmt(userColMm, 1)} mm es inferior al mínimo orientativo ${fmt(colDiaSafeMm, 1)} mm para la carga repartida en ${nCols} columnas.</div></div>`);
    }
  }
  if (pumpFlowLmin < qReqLmin) {
    alerts.push(`<div class="lab-alert lab-alert--warn"><div class="lab-alert__body"><strong>Optimización:</strong> Para bajar el plato en ${fmt(tApproach, 1)} s, su bomba actual es insuficiente. Necesita un caudal de ${fmt(qReqLmin, 1)} L/min.</div></div>`);
  }
  if (motorKwFromPump < motorKw) {
    alerts.push(`<div class="lab-alert lab-alert--danger"><div class="lab-alert__body"><strong>Advertencia de potencia:</strong> Para cumplir su objetivo de tiempo de ciclo necesita ${fmt(motorKw, 2)} kW. Con una potencia disponible de ${fmt(motorKwFromPump, 2)} kW (equivalente al caudal actual), el tiempo de ciclo aumentará a ${fmt(cycleRealS, 2)} s.</div></div>`);
  }
  alerts.push(`<div class="lab-alert lab-alert--info"><div class="lab-alert__body"><strong>Seguridad:</strong> Con ${fmt(tonReal, 1)} toneladas, las columnas deben tener un diámetro mínimo de ${fmt(colDiaSafeMm, 1)} mm para evitar deformación elástica (tensión axial).</div></div>`);
  if (mode === 'diagnostic') {
    alerts.push(`<div class="lab-alert lab-alert--info"><div class="lab-alert__body"><strong>Veredicto estructural:</strong> sus columnas de ${fmt(diagColMm, 1)} mm soportan un máximo de ${fmt(maxTonByCols, 1)} toneladas antes de deformarse (axial).</div></div>`);
  }
  advisor.innerHTML = alerts.join('');

  const balanced = pBar <= 300 && pumpFlowLmin >= qReqLmin * 0.95 && motorRec <= motorKw * 1.3 && (mode !== 'diagnostic' || maxTonByCols >= tonReal)
    && !(labTier === 'project' && Number.isFinite(fsEulerCol) && fsEulerCol < 2)
    && !(Number.isFinite(userColMm) && userColMm + 0.01 < colDiaSafeMm);
  verdict.className = balanced ? 'lab-verdict lab-verdict--ok' : 'lab-verdict lab-verdict--muted';
  verdict.textContent = balanced
    ? 'CONFIGURACIÓN EQUILIBRADA — Productividad y coste de potencia en rango razonable.'
    : 'CONFIGURACIÓN AJUSTABLE — Revise caudal de bomba, presión de trabajo y potencia instalada para equilibrar productividad frente a coste.';

  const lang = getCurrentLang();
  const ts = formatDateTimeLocale(new Date(), lang);
  pressPdfSnapshot = {
    valid: true,
    title: lang === 'en' ? 'Report — Industrial hydraulic press' : 'Informe — Prensa hidráulica industrial',
    fileBase: `${lang === 'en' ? 'report-hydraulic-press' : 'informe-prensa-hidraulica'}-${new Date().toISOString().slice(0, 10)}`,
    timestamp: ts,
    tierLabel: labTier === 'project' ? (lang === 'en' ? 'Mode: Project (detailed)' : 'Modo: Proyecto (detallado)') : (lang === 'en' ? 'Mode: Classroom (basic)' : 'Modo: Aula (básico)'),
    kpis: [
      { title: lang === 'en' ? 'Real tonnage' : 'Tonelaje real', value: `${fmt(tonReal, 1)} t`, subtitle: 'F/g' },
      { title: lang === 'en' ? 'ISO piston' : 'Pistón ISO', value: `${fmt(pistonIsoMm, 0)} mm`, subtitle: lang === 'en' ? 'Suggested' : 'Sugerido' },
      { title: 'Q', value: `${fmt(qReqLmin, 1)} L/min`, subtitle: lang === 'en' ? 'Pump flow' : 'Caudal bomba' },
      { title: 'P motor', value: `${fmt(motorKw, 2)} kW`, subtitle: `${fmt(motorRec, 1)} kW nom.` },
    ],
    inputRows: [
      { label: lang === 'en' ? 'Mode' : 'Modo cálculo', value: mode },
      { label: lang === 'en' ? 'Detail tier' : 'Nivel memoria', value: labTier },
      { label: lang === 'en' ? 'Force' : 'Fuerza', value: `${fmt(forceTon, 1)} t` },
      { label: 'p', value: `${fmt(pBar, 1)} bar` },
      { label: 'Stroke', value: `${fmt(strokeMm, 0)} mm` },
      { label: lang === 'en' ? 'Cycle' : 'Ciclo', value: `${fmt(cycleS, 1)} s` },
      { label: 'n cols', value: String(nCols) },
      { label: 'sigma', value: `${fmt(sigmaAllowMpa, 0)} MPa` },
    ],
    resultRows: [
      { label: 'F', value: `${fmt(forceN / 1000, 1)} kN` },
      { label: 'A pistón', value: `${fmt(areaUseM2 * 1e6, 0)} mm²` },
      { label: 'Q req', value: `${fmt(qReqLmin, 1)} L/min` },
      { label: lang === 'en' ? 'Column d min' : 'D col mín.', value: `${fmt(colDiaSafeMm, 1)} mm` },
    ],
    formulaLines,
    assumptions,
    verdict: verdict.textContent,
    disclaimer: lang === 'en'
      ? 'Educational pre-design. Verify columns for buckling and buckling-restrained lengths with qualified engineering.'
      : 'Predimensionado educativo. Verificar pandeo de columnas y arriostramientos con ingeniería cualificada.',
  };
  if (labTier === 'project' && Number.isFinite(pCrColN)) {
    pressPdfSnapshot.resultRows.push({ label: 'Pcr col', value: `${fmt(pCrColN / 1000, 1)} kN` });
    pressPdfSnapshot.resultRows.push({ label: 'FS Euler', value: fmt(fsEulerCol, 2) });
  }
}

function syncModeUi() {
  const mode = document.getElementById('hppMode') instanceof HTMLSelectElement
    ? document.getElementById('hppMode').value
    : 'design';
  const forceField = document.getElementById('hppForceTon')?.closest('.lab-field');
  const diagPistonField = document.getElementById('hppDiagPistonField');
  const diagColField = document.getElementById('hppDiagColField');
  if (diagPistonField instanceof HTMLElement) diagPistonField.hidden = mode !== 'diagnostic';
  if (diagColField instanceof HTMLElement) diagColField.hidden = mode !== 'diagnostic';
  if (forceField instanceof HTMLElement) forceField.classList.toggle('lab-field--auto', mode === 'diagnostic');
}

[
  'hppForceTon',
  'hppPressureBar',
  'hppStrokeMm',
  'hppCycleS',
  'hppApproachFactor',
  'hppPumpFlowLmin',
  'hppColumns',
  'hppSteelMpa',
  'hppUserColumnMm',
  'hppDiagPistonMm',
  'hppDiagColumnMm',
  'hppMode',
  'hppLabTier',
  'hppColLengthMm',
  'hppColK',
  'hppEGpa',
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', computeAndRender);
  el.addEventListener('change', computeAndRender);
});

document.getElementById('hppMode')?.addEventListener('change', () => {
  syncModeUi();
  computeAndRender();
});

document.getElementById('hppLabTier')?.addEventListener('change', () => {
  syncLabTierUi();
  computeAndRender();
});

syncLabTierUi();
syncModeUi();
mountCompactLabFieldHelp();
computeAndRender();

mountLabFluidPdfExportBar(document.getElementById('labFluidPdfMount'), {
  getPayload: () => pressPdfSnapshot,
  getDiagramElements: () => {
    const svg = document.getElementById('hpPressDiagram');
    return svg instanceof SVGSVGElement ? [svg] : [];
  },
});
