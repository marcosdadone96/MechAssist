/**
 * Diagrama: columna en sección con husillo vertical, tuerca de bronce (carga) y tuerca de seguridad,
 * y motor eléctrico (arriba o abajo).
 */

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
  const H = Math.max(1.2, Number(p.liftHeight_m) || 1.8);
  const pitch = Math.max(1, Number(p.pitch_mm) || 8);
  const d = Math.max(12, Number(p.screwDiameter_mm) || 45);
  const motorPos = p.motorPosition === 'base' ? 'base' : 'top';

  const vbW = 340;
  const vbH = 360;
  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);

  const colX = 70;
  const colW = 200;
  const colTop = 55;
  const colH = 260;
  const screwX = colX + colW / 2;
  const screwTop = colTop + 18;
  const screwBot = colTop + colH - 22;
  const nutY = colTop + 150;
  const nutH = 26;
  const safeNutY = nutY + 40;
  const screwR = Math.max(6, Math.min(14, d * 0.14));

  const pitchLabel = pitch >= 10 ? `${pitch.toFixed(0)} mm` : `${pitch.toFixed(1)} mm`;

  svg.innerHTML = `
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="14" y="22" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">
      Columna · sección (esquema)
    </text>
    <text x="14" y="35" font-size="8" fill="#64748b" font-family="Inter,system-ui,sans-serif">
      H ≈ ${H.toFixed(2)} m · Husillo Ø${d.toFixed(0)} · paso ${pitchLabel}
    </text>

    <!-- Columna / guía -->
    <rect x="${colX}" y="${colTop}" width="${colW}" height="${colH}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="${colX + 10}" y="${colTop + 10}" width="${colW - 20}" height="${colH - 20}" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>

    <!-- Husillo -->
    <line x1="${screwX}" y1="${screwTop}" x2="${screwX}" y2="${screwBot}" stroke="#0f172a" stroke-width="${screwR * 2}" stroke-linecap="round"/>
    <line x1="${screwX}" y1="${screwTop}" x2="${screwX}" y2="${screwBot}" stroke="#94a3b8" stroke-width="${Math.max(2, screwR * 0.55)}" stroke-dasharray="4 4" stroke-linecap="round"/>

    <!-- Tuerca de bronce (carga) -->
    <rect x="${screwX - 55}" y="${nutY}" width="110" height="${nutH}" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
    <text x="${screwX}" y="${nutY + 17}" text-anchor="middle" font-size="8" font-weight="800" fill="#78350f"
      font-family="Inter,system-ui,sans-serif">Tuerca bronce (carga)</text>

    <!-- Tuerca de seguridad -->
    <rect x="${screwX - 50}" y="${safeNutY}" width="100" height="22" rx="6" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>
    <text x="${screwX}" y="${safeNutY + 15}" text-anchor="middle" font-size="8" font-weight="800" fill="#0c4a6e"
      font-family="Inter,system-ui,sans-serif">Tuerca seguridad</text>

    <!-- Carro / patín -->
    <rect x="${colX + 26}" y="${nutY - 18}" width="${colW - 52}" height="16" rx="4" fill="#ccfbf1" stroke="#0f766e" stroke-width="2"/>
    <text x="${colX + colW - 10}" y="${nutY - 6}" text-anchor="end" font-size="7" fill="#134e4a"
      font-family="Inter,system-ui,sans-serif">Carro</text>

    <!-- Motor -->
    ${
      motorPos === 'top'
        ? `<rect x="${screwX - 40}" y="${colTop - 24}" width="80" height="18" rx="6" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
           <text x="${screwX}" y="${colTop - 11}" text-anchor="middle" font-size="8" font-weight="800" fill="#334155"
            font-family="Inter,system-ui,sans-serif">Motor</text>
           <line x1="${screwX}" y1="${colTop - 6}" x2="${screwX}" y2="${screwTop}" stroke="#475569" stroke-width="2"/>`
        : `<rect x="${screwX - 40}" y="${colTop + colH + 6}" width="80" height="18" rx="6" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
           <text x="${screwX}" y="${colTop + colH + 19}" text-anchor="middle" font-size="8" font-weight="800" fill="#334155"
            font-family="Inter,system-ui,sans-serif">Motor</text>
           <line x1="${screwX}" y1="${screwBot}" x2="${screwX}" y2="${colTop + colH + 6}" stroke="#475569" stroke-width="2"/>`
    }

    <!-- Etiquetas -->
    <text x="${colX + 12}" y="${colTop + colH - 12}" font-size="7" fill="#64748b" font-family="Inter,system-ui,sans-serif">
      Husillo vertical + tuerca de trabajo + seguridad (esquema)
    </text>
  `;
}

