/**
 * Diagrama: columna en seccion con husillo vertical, tuerca de bronce (carga) y tuerca de seguridad,
 * y motor electrico (arriba o abajo).
 * Estilo alineado con el resto de maquinas: tonos claros, trazos finos, etiquetas fuera de la geometria.
 */

import { getCurrentLang } from '../config/i18nLabels.js';

/** Contornos y texto (como diagramScrew / roller) */
const INK = '#334155';
const LINE = '#475569';
const MUTED = '#64748b';
const ACC = '#0d9488';
const COL_FILL = '#e8eef5';
const COL_STROKE = '#94a3b8';
const ARM_FILL = '#cbd5e1';
const DECK_FILL = '#f1f5f9';
const DECK_STROKE = ACC;
const FLOOR_FILL = '#cbd5e1';

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
 * @param {number} p.liftHeight_m
 * @param {number} p.pitch_mm
 * @param {number} p.screwDiameter_mm
 * @param {'top'|'base'} p.motorPosition
 */
export function renderCarLiftScrewDiagram(svg, p) {
  if (!svg) return;
  const en = (p.lang ?? getCurrentLang()) === 'en';
  const T = {
    title: en ? 'Two-post lift - front view' : 'Elevador 2 columnas - vista frontal',
    sub: en
      ? (d, pitchLabel, H) => `H ${H.toFixed(2)} m - Screw OD ${d.toFixed(0)} mm - lead ${pitchLabel}`
      : (d, pitchLabel, H) => `H ${H.toFixed(2)} m · Husillo Ø${d.toFixed(0)} mm · paso ${pitchLabel}`,
    sync: en ? 'Cross-column sync' : 'Sincronismo entre columnas',
    loadNut: en ? 'Load nut' : 'Tuerca de carga',
    safety: en ? 'Safety' : 'Seguridad',
    liftMotion: en ? 'Lift motion' : 'Movimiento elevacion',
    usefulH: en ? 'Useful height H' : 'Altura util H',
    motor: en ? 'Motor' : 'Motor',
    colNote: en
      ? 'Left column: screw with main + safety nuts'
      : 'Columna izquierda: husillo con tuerca principal + seguridad',
  };

  const H = Math.max(1.2, Number(p.liftHeight_m) || 1.8);
  const pitch = Math.max(1, Number(p.pitch_mm) || 8);
  const d = Math.max(12, Number(p.screwDiameter_mm) || 45);
  const motorPos = p.motorPosition === 'base' ? 'base' : 'top';

  const vbW = 500;
  const vbH = 400;
  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);

  const floorY = 308;
  const postLeftX = 108;
  const postRightX = 312;
  const postW = 26;
  /** Bajar el conjunto respecto al titulo para que Motor (arriba) no coincida con subtitulo ni eje de sincronismo */
  const postTop = 76;
  const postH = 232;
  const screwX = postLeftX + postW / 2;
  const screwTop = postTop + 16;
  const screwBot = postTop + postH - 18;
  const nutY = postTop + 118;
  const nutH = 20;
  const safeNutY = nutY + nutH + 14;
  /** Tuercas a la derecha de la plataforma para no tapar texto ni cruzar el bloque central */
  const nutBlockX = 292;
  const nutBlockW = 42;
  const armY = nutY + 2;
  const deckY = 188;

  /** Cota H: linea totalmente a la izquierda del titulo (titulo ~x 96+) para no cruzar "columnas" */
  const dimVX = 26;
  const titleX = 96;

  const screwR = Math.max(5, Math.min(12, d * 0.12));
  const pitchLabel = pitch >= 10 ? `${pitch.toFixed(0)} mm` : `${pitch.toFixed(1)} mm`;

  svg.innerHTML = `
    <defs>
      <marker id="liftArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="${ACC}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <style><![CDATA[
        .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; }
        .lift-callout { font-family: Inter, system-ui, sans-serif; }
      ]]></style>
    </defs>
    <rect width="${vbW}" height="${vbH}" fill="#f4f7fb"/>

    <!-- Titulo en franja libre (sin cotas encima) -->
    <text x="${titleX}" y="26" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">${esc(T.title)}</text>
    <text x="${titleX}" y="44" font-size="8.5" fill="${MUTED}" font-family="Inter,system-ui,sans-serif">${esc(T.sub(d, pitchLabel, H))}</text>

    <!-- Suelo -->
    <rect x="36" y="${floorY}" width="${vbW - 72}" height="12" rx="2" fill="${FLOOR_FILL}" stroke="${LINE}" stroke-width="1" />

    <!-- Columnas (relleno claro + borde) -->
    <rect x="${postLeftX}" y="${postTop}" width="${postW}" height="${postH}" rx="4" fill="${COL_FILL}" stroke="${COL_STROKE}" stroke-width="1.15"/>
    <rect x="${postRightX}" y="${postTop}" width="${postW}" height="${postH}" rx="4" fill="${COL_FILL}" stroke="${COL_STROKE}" stroke-width="1.15"/>

    <!-- Brazos -->
    <rect x="${postLeftX + postW}" y="${armY}" width="104" height="7" rx="2" fill="${ARM_FILL}" stroke="${LINE}" stroke-width="0.9"/>
    <rect x="${postRightX - 104}" y="${armY}" width="104" height="7" rx="2" fill="${ARM_FILL}" stroke="${LINE}" stroke-width="0.9"/>
    <line x1="${postLeftX + postW + 100}" y1="${armY + 3.5}" x2="${postRightX - 100}" y2="${armY + 3.5}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>

    <!-- Plataforma (tono claro) -->
    <rect x="142" y="${deckY}" width="124" height="42" rx="6" fill="${DECK_FILL}" stroke="${DECK_STROKE}" stroke-width="1.1"/>
    <rect x="150" y="${deckY + 6}" width="108" height="14" rx="3" fill="#e2e8f0" stroke="${COL_STROKE}" stroke-width="0.8"/>
    <circle cx="162" cy="${deckY + 38}" r="5" fill="${LINE}"/>
    <circle cx="246" cy="${deckY + 38}" r="5" fill="${LINE}"/>
    <rect x="148" y="${deckY + 40}" width="112" height="3" rx="1" fill="#fbbf24" opacity="0.75"/>

    <!-- Eje de sincronismo (mas ligero) -->
    <line x1="${postLeftX + postW / 2}" y1="${postTop - 10}" x2="${postRightX + postW / 2}" y2="${postTop - 10}" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="${postLeftX + postW / 2}" cy="${postTop - 10}" r="3.5" fill="${LINE}"/>
    <circle cx="${postRightX + postW / 2}" cy="${postTop - 10}" r="3.5" fill="${LINE}"/>

    <!-- Tuercas: solo marcos; etiquetas a la derecha con hueco -->
    <rect x="${nutBlockX}" y="${nutY}" width="${nutBlockW}" height="${nutH}" rx="3" fill="#fffbeb" stroke="#d97706" stroke-width="1.35"/>
    <rect x="${nutBlockX}" y="${safeNutY}" width="${nutBlockW - 2}" height="16" rx="3" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.35"/>
    <text x="${nutBlockX + nutBlockW + 10}" y="${nutY + 14}" class="lift-callout diagram-svg-label--on-drawing" font-size="8" font-weight="700" fill="#9a3412">${esc(T.loadNut)}</text>
    <text x="${nutBlockX + nutBlockW + 10}" y="${safeNutY + 12}" class="lift-callout diagram-svg-label--on-drawing" font-size="7.8" font-weight="700" fill="#0369a1">${esc(T.safety)}</text>

    <!-- Flecha elevacion (alejada del borde del poste) -->
    <line x1="${postRightX + postW + 26}" y1="${nutY + 36}" x2="${postRightX + postW + 26}" y2="${postTop + 70}" stroke="${ACC}" stroke-width="1.25" marker-end="url(#liftArrow)"/>
    <text x="${postRightX + postW + 34}" y="${postTop + 62}" class="lift-callout" font-size="7.8" fill="#0f766e">${esc(T.liftMotion)}</text>

    <!-- Cota H (no cruza titulo: x fijo bajo) -->
    <line x1="${dimVX}" y1="${postTop + postH}" x2="${dimVX}" y2="${postTop}" stroke="${LINE}" stroke-width="1"/>
    <line x1="${dimVX - 4}" y1="${postTop + postH}" x2="${dimVX + 4}" y2="${postTop + postH}" stroke="${LINE}" stroke-width="1"/>
    <line x1="${dimVX - 4}" y1="${postTop}" x2="${dimVX + 4}" y2="${postTop}" stroke="${LINE}" stroke-width="1"/>
    <text x="${dimVX - 10}" y="${postTop + postH / 2}" font-size="7.5" fill="${MUTED}" transform="rotate(-90 ${dimVX - 10} ${postTop + postH / 2})" font-family="Inter,system-ui,sans-serif">${esc(T.usefulH)}</text>

    <!-- Motor (arriba: entre subtitulo ~y44 y eje sync ~y66) -->
    ${
      motorPos === 'top'
        ? `<text x="${screwX}" y="${postTop - 20}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${INK}"
            font-family="Inter,system-ui,sans-serif">${esc(T.motor)}</text>
           <line x1="${screwX}" y1="${postTop - 10}" x2="${screwX}" y2="${screwTop}" stroke="${LINE}" stroke-width="1.25"/>`
        : `<text x="${screwX}" y="${postTop + postH + 32}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${INK}"
            font-family="Inter,system-ui,sans-serif">${esc(T.motor)}</text>
           <line x1="${screwX}" y1="${screwBot}" x2="${screwX}" y2="${postTop + postH + 18}" stroke="${LINE}" stroke-width="1.25"/>`
    }

    <line x1="20" y1="${vbH - 48}" x2="${vbW - 20}" y2="${vbH - 48}" stroke="#e2e8f0" stroke-width="1"/>
    <text x="24" y="${vbH - 34}" font-size="7.8" fill="${MUTED}" font-family="Inter,system-ui,sans-serif">${esc(T.sync)}</text>
    <text x="24" y="${vbH - 18}" font-size="7.8" fill="${MUTED}" font-family="Inter,system-ui,sans-serif">${esc(T.colNote)}</text>

    <!-- Husillo encima del fondo de columna -->
    <line x1="${screwX}" y1="${screwTop}" x2="${screwX}" y2="${screwBot}" stroke="#e2e8f7" stroke-width="${screwR * 2 + 4}" stroke-linecap="round" opacity="0.9"/>
    <line x1="${screwX}" y1="${screwTop}" x2="${screwX}" y2="${screwBot}" stroke="${INK}" stroke-width="${screwR * 2 + 1}" stroke-linecap="round" opacity="0.35"/>
    <line x1="${screwX}" y1="${screwTop}" x2="${screwX}" y2="${screwBot}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round"/>
  `;
}
