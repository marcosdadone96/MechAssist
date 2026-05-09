/**
 * Vista lateral esquemática del hueco: polea tractora, cabina, contrapeso, guías, arrollamiento.
 */

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 * @param {number} p.travelHeight_m
 * @param {'1_1'|'2_1'} p.reeving
 * @param {'es'|'en'} [p.lang]
 */
export function renderTractionElevatorDiagram(svg, p) {
  if (!svg) return;
  const H = Math.max(2, Number(p.travelHeight_m) || 12);
  const reeving = p.reeving === '2_1' ? '2_1' : '1_1';
  const en = (p.lang ?? 'es') === 'en';
  const revLabel = reeving === '2_1' ? '2:1' : '1:1';
  /** @type {Record<string, string>} */
  const T = en
    ? {
        title: 'Traction elevator',
        subLine: `H ${H.toFixed(1)} m \u00b7 Reeving ${revLabel}`,
        guideCar: 'Car guides',
        guideCw: 'Counterweight guides',
        sheave: 'Traction sheave',
        movSheave: 'Travelling sheave',
        car: 'Car',
        counterweight: 'Counterweight',
        carUp: 'Car \u2191',
        cwDown: 'CW \u2193',
        travelH: 'Travel H',
        machine: 'Machine',
        operation: 'Operation: car up / CW down',
        pit: 'Pit / ground floor (visual schematic)',
      }
    : {
        title: 'Ascensor de tracci\u00f3n',
        subLine: `H ${H.toFixed(1)} m \u00b7 Arrollamiento ${revLabel}`,
        guideCar: 'Gu\u00eda cabina',
        guideCw: 'Gu\u00eda contrapeso',
        sheave: 'Polea tractora',
        movSheave: 'Polea m\u00f3vil',
        car: 'Cabina',
        counterweight: 'Contrapeso',
        carUp: 'Cabina \u2191',
        cwDown: 'CP \u2193',
        travelH: 'Recorrido H',
        machine: 'M\u00e1quina',
        operation: 'Funcionamiento: cabina sube / CP baja',
        pit: 'Foso / planta baja (esquema visual)',
      };
  const scale = 9.8;
  const vbW = 340;
  const headY = 72;
  const shaftTop = 96;
  const shaftBottom = shaftTop + Math.max(220, Math.min(380, H * scale + 120));
  const shaftH = shaftBottom - shaftTop;
  const vbH = shaftBottom + 72;
  const shaftX = 44;
  const shaftW = 232;
  const xCabin = 117;
  const xCounter = 161;
  const guideOff = 18;
  const sheaveR = 22;
  const sheaveX = 164;
  const carW = 56;
  const carH = Math.min(86, Math.max(54, 48 + H * 0.6));
  const cwW = 44;
  const cwH = Math.round(carH * 0.85);
  const yTravelTop = shaftTop + 20;
  const yTravelBottom = shaftBottom - 12;
  const yCab = yTravelBottom - carH;
  const yCw = yTravelTop + 14;
  const yMid = (shaftTop + shaftBottom) / 2;
  /** Tangentes laterales de la polea (0° / 180°): el cable nace en el ecuador del círculo */
  const tLx = sheaveX - sheaveR;
  const tRx = sheaveX + sheaveR;
  const tY = headY;
  const carPulleyR = 8;
  const carPulleyCx = xCabin + carW / 2;
  const carPulleyCy = yCab - 12;
  const rope2L = carPulleyCx - carPulleyR;
  const rope2R = carPulleyCx + carPulleyR;
  const lblY = headY - sheaveR - 14;
  const ropeSvg =
    reeving === '2_1'
      ? `
    <line x1="${rope2L}" y1="${tY}" x2="${rope2L}" y2="${carPulleyCy}" stroke="#334155" stroke-width="1.25"/>
    <path d="M ${rope2L} ${carPulleyCy} A ${carPulleyR} ${carPulleyR} 0 0 0 ${rope2R} ${carPulleyCy}" fill="none" stroke="#334155" stroke-width="1.25"/>
    <line x1="${rope2R}" y1="${carPulleyCy}" x2="${rope2R}" y2="${tY}" stroke="#334155" stroke-width="1.25"/>
    <line x1="${rope2R}" y1="${tY}" x2="${tLx}" y2="${tY}" stroke="#334155" stroke-width="1.25"/>
    <path d="M ${tLx} ${tY} A ${sheaveR} ${sheaveR} 0 0 1 ${tRx} ${tY}" fill="none" stroke="#1e3a5f" stroke-width="1.25"/>
    <line x1="${tRx}" y1="${tY}" x2="${tRx}" y2="${yCw + 4}" stroke="#475569" stroke-width="1.25"/>
    <circle cx="${carPulleyCx}" cy="${carPulleyCy}" r="${carPulleyR}" fill="#f1f5f9" stroke="#64748b" stroke-width="1"/>
    <circle cx="${carPulleyCx}" cy="${carPulleyCy}" r="${carPulleyR * 0.42}" fill="none" stroke="#64748b" stroke-width="0.85"/>
    <rect x="${carPulleyCx - 23}" y="${carPulleyCy - 22}" width="46" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="none"/>
    <text x="${carPulleyCx}" y="${carPulleyCy - 13}" text-anchor="middle" font-size="6.3" fill="#475569" font-family="Inter,system-ui,sans-serif">${T.movSheave}</text>
    <rect x="${sheaveX + 24}" y="${lblY}" width="26" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="none"/>
    <text x="${sheaveX + 37}" y="${lblY + 8}" text-anchor="middle" font-size="7.1" fill="#475569" font-family="Inter,system-ui,sans-serif">2:1</text>`
      : `
    <line x1="${tLx}" y1="${tY}" x2="${tLx}" y2="${yCab + 4}" stroke="#334155" stroke-width="1.25"/>
    <line x1="${tRx}" y1="${tY}" x2="${tRx}" y2="${yCw + 4}" stroke="#475569" stroke-width="1.25"/>
    <path d="M ${tLx} ${tY} A ${sheaveR} ${sheaveR} 0 0 1 ${tRx} ${tY}" fill="none" stroke="#1e3a5f" stroke-width="1.25"/>
    <rect x="${sheaveX + 24}" y="${lblY}" width="26" height="12" rx="2" fill="rgba(255,255,255,0.82)" stroke="none"/>
    <text x="${sheaveX + 37}" y="${lblY + 8}" text-anchor="middle" font-size="7.1" fill="#475569" font-family="Inter,system-ui,sans-serif">1:1</text>`;

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <marker id="teArrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#0d9488" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <marker id="teArrowAcc" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1.5 L10 6 L1 10.5" fill="none" stroke="#b45309" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </marker>
      <style><![CDATA[ .diagram-svg-num { font-family: 'Roboto Mono', ui-monospace, monospace; } ]]></style>
    </defs>
    <rect width="100%" height="100%" fill="#f4f7fb"/>
    <text x="14" y="22" font-size="10.2" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">${T.title}</text>
    <text x="14" y="36" font-size="7.2" fill="#64748b" font-family="Inter,system-ui,sans-serif">${T.subLine}</text>

    <rect x="${shaftX}" y="${shaftTop}" width="${shaftW}" height="${shaftH}" rx="4" fill="#e8edf4" stroke="#64748b" stroke-width="1"/>
    <line x1="${xCabin - guideOff}" y1="${shaftTop + 10}" x2="${xCabin - guideOff}" y2="${shaftBottom}" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="${xCounter + cwW + guideOff}" y1="${shaftTop + 10}" x2="${xCounter + cwW + guideOff}" y2="${shaftBottom}" stroke="#cbd5e1" stroke-width="1"/>
    <text x="${xCabin - 32}" y="${yMid}" font-size="6.6" fill="#94a3b8" font-family="Inter,system-ui,sans-serif" transform="rotate(-90 ${xCabin - 32} ${yMid})">${T.guideCar}</text>
    <text x="${xCounter + cwW + 32}" y="${yMid}" font-size="6.6" fill="#94a3b8" font-family="Inter,system-ui,sans-serif" transform="rotate(-90 ${xCounter + cwW + 32} ${yMid})">${T.guideCw}</text>

    <circle cx="${sheaveX}" cy="${headY}" r="${sheaveR}" fill="#bae6fd" stroke="#0369a1" stroke-width="1.35"/>
    <circle cx="${sheaveX}" cy="${headY}" r="${sheaveR * 0.45}" fill="none" stroke="#0369a1" stroke-width="1"/>
    <line x1="${sheaveX + sheaveR * 0.75}" y1="${headY - sheaveR * 0.35}" x2="${sheaveX + 62}" y2="${headY - 18}" stroke="#64748b" stroke-width="0.75"/>
    <text x="${sheaveX + 66}" y="${headY - 14}" font-size="6.6" font-weight="600" fill="#0c4a6e" font-family="Inter,system-ui,sans-serif">${T.sheave}</text>

    ${ropeSvg}

    <rect x="${xCabin}" y="${yCab}" width="${carW}" height="${carH}" rx="3" fill="#0d9488" fill-opacity="0.88" stroke="#0f766e" stroke-width="1"/>
    <text x="${xCabin + carW / 2}" y="${yCab + carH / 2 + 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#f8fafc" font-family="Inter,system-ui,sans-serif">${T.car}</text>

    <rect x="${xCounter}" y="${yCw}" width="${cwW}" height="${cwH}" rx="3" fill="#78716c" fill-opacity="0.9" stroke="#57534e" stroke-width="1"/>
    <text x="${xCounter + cwW / 2}" y="${yCw + cwH / 2 + 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#f8fafc" font-family="Inter,system-ui,sans-serif">${T.counterweight}</text>

    <line x1="${xCabin - 16}" y1="${yCab + carH * 0.6}" x2="${xCabin - 16}" y2="${yCab - 28}" stroke="#0d9488" stroke-width="1.25" marker-end="url(#teArrow)"/>
    <line x1="${xCounter + cwW + 16}" y1="${yCw + cwH * 0.4}" x2="${xCounter + cwW + 16}" y2="${yCw + cwH + 28}" stroke="#b45309" stroke-width="1.25" marker-end="url(#teArrowAcc)"/>
    <text x="${xCabin - 31}" y="${yCab - 33}" text-anchor="middle" font-size="6.3" fill="#0f766e" font-family="Inter,system-ui,sans-serif">${T.carUp}</text>
    <text x="${xCounter + cwW + 16}" y="${yCw + cwH + 39}" text-anchor="middle" font-size="6.3" fill="#b45309" font-family="Inter,system-ui,sans-serif">${T.cwDown}</text>

    <line x1="${shaftX - 14}" y1="${shaftTop}" x2="${shaftX - 14}" y2="${shaftBottom}" stroke="#64748b" stroke-width="1"/>
    <line x1="${shaftX - 18}" y1="${shaftTop}" x2="${shaftX - 10}" y2="${shaftTop}" stroke="#64748b" stroke-width="1"/>
    <line x1="${shaftX - 18}" y1="${shaftBottom}" x2="${shaftX - 10}" y2="${shaftBottom}" stroke="#64748b" stroke-width="1"/>
    <text x="${shaftX - 28}" y="${yMid + 8}" font-size="7" fill="#64748b" transform="rotate(-90 ${shaftX - 28} ${yMid + 8})" font-family="Inter,system-ui,sans-serif">${T.travelH}</text>

    <line x1="${shaftX - 2}" y1="${shaftBottom}" x2="${shaftX + shaftW + 2}" y2="${shaftBottom}" stroke="#334155" stroke-width="1.25"/>
    <text x="${shaftX + shaftW + 10}" y="${shaftTop + 26}" font-size="6.8" font-weight="600" fill="#1e3a5f" font-family="Inter,system-ui,sans-serif">${T.machine}</text>

    <line x1="12" y1="${vbH - 38}" x2="${vbW - 12}" y2="${vbH - 38}" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="${vbH - 24}" font-size="6.7" fill="#64748b" font-family="Inter,system-ui,sans-serif">${T.operation}</text>
    <text x="14" y="${vbH - 12}" font-size="7" fill="#64748b" font-family="Inter,system-ui,sans-serif">${T.pit}</text>
  `;
}
