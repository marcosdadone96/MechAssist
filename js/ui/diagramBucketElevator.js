/**
 * Esquema SVG vertical de elevador de cangilones — escala con altura de elevación.
 */

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} p
 * @param {number} p.liftHeight_m
 * @param {number} p.centerDistance_m
 * @param {number} p.headDrumDiameter_m
 * @param {number} p.bootDrumDiameter_m
 * @param {number} p.pitch_mm
 * @param {number} p.beltSpeed_m_s
 * @param {number} [p.animPhase] — 0..1 para desplazar cangilones
 */
export function renderBucketElevatorDiagram(svg, p) {
  if (!svg) return;

  const H = Math.max(1, Number(p.liftHeight_m) || 10);
  const C = Math.max(H, Number(p.centerDistance_m) || H);
  const Dh = Math.max(0.25, Number(p.headDrumDiameter_m) || 0.65);
  const Db = Math.max(0.25, Number(p.bootDrumDiameter_m) || 0.55);
  const pitch_mm = Math.max(150, Number(p.pitch_mm) || 400);
  const v = Math.max(0.2, Number(p.beltSpeed_m_s) || 1.5);
  const phase = Number(p.animPhase) || 0;

  const scale = 12;
  const marginTop = 38;
  const marginBottom = 56;
  const railH = Math.min(480, Math.max(100, 20 + H * scale));
  const vbW = 210;
  const vbH = marginTop + railH + marginBottom;

  const yHeadC = marginTop + (Dh * scale) / 2;
  const yBootC = marginTop + railH - (Db * scale) / 2;
  const cx = vbW / 2;
  const gap = 26;
  const xLoad = cx - gap;
  const xReturn = cx + gap;

  const rHead = (Dh * scale) / 2;
  const rBoot = (Db * scale) / 2;

  const yTop = yHeadC - rHead;
  const yBot = yBootC + rBoot;
  const runLen = Math.max(40, yBot - yTop);
  const pitch_px = Math.max(12, (pitch_mm / 1000) * scale);
  const nBuckets = Math.min(28, Math.max(4, Math.ceil(runLen / pitch_px) + 2));

  let bucketsSvg = '';
  for (let i = 0; i < nBuckets; i++) {
    const off = ((i * pitch_px) / runLen + phase) % 1;
    const y = yTop + off * runLen;
    const w = 11;
    const h = 8;
    const filled = off < 0.48;
    const fill = filled ? '#f59e0b' : '#fde68a';
    const stroke = filled ? '#b45309' : '#ca8a04';
    bucketsSvg += `<g transform="translate(${xLoad},${y.toFixed(1)})">
      <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="0.9"/>
    </g>`;
    const yR = yBot - off * runLen;
    bucketsSvg += `<g transform="translate(${xReturn},${yR.toFixed(1)})">
      <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="1.5" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8" opacity="0.9"/>
    </g>`;
  }

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.setAttribute('aria-label', 'Esquema elevador de cangilones');
  svg.innerHTML = `
    <defs>
      <linearGradient id="beLeg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <text x="${cx}" y="16" text-anchor="middle" font-size="10" font-family="Inter,system-ui,sans-serif" fill="#0f172a" font-weight="800">Elevador de cangilones</text>
    <text x="${cx}" y="28" text-anchor="middle" font-size="7.5" font-family="Inter,system-ui,sans-serif" fill="#64748b">H = ${H.toFixed(1)} m · C ≈ ${C.toFixed(1)} m · v = ${v.toFixed(2)} m/s</text>
    <line x1="${xLoad}" y1="${yTop}" x2="${xLoad}" y2="${yBot}" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="${xReturn}" y1="${yTop}" x2="${xReturn}" y2="${yBot}" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>
    ${bucketsSvg}
    <circle cx="${cx}" cy="${yHeadC}" r="${rHead}" fill="url(#beLeg)" stroke="#0369a1" stroke-width="2.2"/>
    <circle cx="${cx}" cy="${yBootC}" r="${rBoot}" fill="#fef9c3" stroke="#a16207" stroke-width="2.2"/>
    <text x="${cx}" y="${yHeadC - rHead - 5}" text-anchor="middle" font-size="7" fill="#075985" font-family="Inter,system-ui,sans-serif" font-weight="700">Tambor cabeza Ø${(Dh * 1000).toFixed(0)}</text>
    <text x="${cx}" y="${yBootC + rBoot + 12}" text-anchor="middle" font-size="7" fill="#713f12" font-family="Inter,system-ui,sans-serif" font-weight="700">Tambor pie Ø${(Db * 1000).toFixed(0)}</text>
    <text x="${xLoad - 16}" y="${(yTop + yBot) / 2}" text-anchor="middle" font-size="6.5" fill="#334155" font-family="Inter,system-ui,sans-serif" transform="rotate(-90,${xLoad - 16},${(yTop + yBot) / 2})">Rama carga</text>
  `;
}
