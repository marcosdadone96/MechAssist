/**
 * Interactive Goodman / Gerber / Soderberg diagram (?_m vs ?_a).
 * @param {SVGSVGElement | null} el
 * @param {import('./fatigue.js').ReturnType<typeof import('./fatigue.js').computeFatigue>} r
 */
export function renderFatigueDiagram(el, r) {
  if (!(el instanceof SVGSVGElement) || !r) return;

  const Su = r.Su_MPa;
  const Sy = r.Sy_MPa;
  const Se = r.Se_MPa;
  const sm = r.sigmaM_MPa;
  const sa = r.sigmaA_MPa;

  const xMax = Su * 1.05;
  const yMax = Math.max(Se * 1.15, sa * 1.2, 1);

  const W = 420;
  const H = 300;
  const padL = 52;
  const padR = 16;
  const padT = 28;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const x = (vm) => padL + (vm / xMax) * plotW;
  const y = (va) => padT + plotH - (va / yMax) * plotH;

  const goodmanPts = [];
  const nPts = 48;
  for (let i = 0; i <= nPts; i++) {
    const vm = (i / nPts) * xMax;
    const va = Se * Math.max(0, 1 - vm / Su);
    goodmanPts.push(`${x(vm).toFixed(1)},${y(va).toFixed(1)}`);
  }

  const gerberPts = [];
  for (let i = 0; i <= nPts; i++) {
    const vm = (i / nPts) * Math.min(xMax, Su * 0.999);
    const va = Se * Math.max(0, 1 - (vm / Su) ** 2);
    gerberPts.push(`${x(vm).toFixed(1)},${y(va).toFixed(1)}`);
  }

  const soderbergPts = [];
  for (let i = 0; i <= nPts; i++) {
    const vm = (i / nPts) * xMax;
    const va = Se * Math.max(0, 1 - vm / Sy);
    soderbergPts.push(`${x(vm).toFixed(1)},${y(va).toFixed(1)}`);
  }

  const px = x(sm);
  const py = y(sa);
  const dotClr =
    r.status === 'safe' ? '#059669' : r.status === 'tight' ? '#d97706' : '#dc2626';
  const dotStroke = r.status === 'safe' ? '#047857' : r.status === 'tight' ? '#b45309' : '#b91c1c';

  const nfTxt = Number.isFinite(r.nf_governing)
    ? `nf ${r.nf_governing.toFixed(2)}`
    : 'nf \u221e';

  el.setAttribute('viewBox', `0 0 ${W} ${H}`);
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="ftPlotBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#ftPlotBg)" rx="8"/>
    <text x="${padL}" y="18" font-size="10" fill="#64748b" font-weight="600" font-family="Inter,system-ui,sans-serif">\u03c3\u2090 vs \u03c3\u2098 \u00b7 fatigue</text>

    <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="#fff" stroke="#cbd5e1" stroke-width="1"/>

    <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#94a3b8" stroke-width="1.2"/>

    <text x="${padL + plotW / 2}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#475569" font-family="Inter,sans-serif">\u03c3\u2098 mean (MPa)</text>
    <text x="14" y="${padT + plotH / 2}" text-anchor="middle" font-size="10" fill="#475569" font-family="Inter,sans-serif" transform="rotate(-90 14 ${padT + plotH / 2})">\u03c3\u2090 alt (MPa)</text>

    <text x="${x(Su).toFixed(1)}" y="${padT + plotH + 14}" text-anchor="middle" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Su</text>
    <text x="${padL - 6}" y="${y(Se).toFixed(1)}" text-anchor="end" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Se</text>

    <polyline points="${soderbergPts.join(' ')}" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="6 4" opacity="0.85"/>
    <polyline points="${gerberPts.join(' ')}" fill="none" stroke="#ea580c" stroke-width="2.2" opacity="0.9"/>
    <polyline points="${goodmanPts.join(' ')}" fill="none" stroke="#dc2626" stroke-width="2.4"/>

    <line x1="${padL}" y1="${padT + plotH}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${dotClr}" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.75"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="${dotClr}" fill-opacity="0.25" stroke="${dotStroke}" stroke-width="2.2"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${dotStroke}"/>

    <text x="${Math.min(px + 10, padL + plotW - 4)}" y="${Math.max(py - 10, padT + 12)}" font-size="9" fill="${dotStroke}" font-weight="600" font-family="Inter,sans-serif">${nfTxt}</text>

    <g transform="translate(${padL + plotW - 118} ${padT + 6})">
      <line x1="0" y1="4" x2="16" y2="4" stroke="#dc2626" stroke-width="2.2"/>
      <text x="20" y="7" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Goodman</text>
      <line x1="0" y1="16" x2="16" y2="16" stroke="#ea580c" stroke-width="2"/>
      <text x="20" y="19" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Gerber</text>
      <line x1="0" y1="28" x2="16" y2="28" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 3"/>
      <text x="20" y="31" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Soderberg</text>
    </g>
  `;
}
