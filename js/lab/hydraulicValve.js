/** Indicative hydraulic valve sizing  Kv, pressure drop, heat. */

/** Kv in L/min / sqrt(bar)  based on Bosch/Parker/Hydac NG-series catalog data */
export const HV_DN_KV_TABLE = [
  { dn: 6, kv: 10 },
  { dn: 10, kv: 20 },
  { dn: 16, kv: 50 },
  { dn: 25, kv: 100 },
];

/**
 * @param {number} qLmin
 * @param {number} kv L/min / sqrt(bar)
 * @returns {number} bar
 */
/**
 * ?P [bar] = (Q [L/min] / Kv [L/min/?bar])
 * Standard hydraulic valve formula (Q = Kv??P).
 */
export function deltaPFromFlowKv(qLmin, kv) {
  const kvSafe = Math.max(1e-6, kv);
  return (qLmin / kvSafe) ** 2;
}

/**
 * Kv [L/min/?bar] = Q [L/min] / ??P [bar]
 * @param {number} qLmin
 * @param {number} deltaPBar
 * @returns {number}
 */
export function kvFromFlowDeltaP(qLmin, deltaPBar) {
  const dp = Math.max(1e-6, deltaPBar);
  return qLmin / Math.sqrt(dp);
}

/**
 * @param {number} kvReq
 * @returns {{ dn: number, kv: number }}
 */
export function pickNominalDn(kvReq) {
  for (const row of HV_DN_KV_TABLE) {
    if (row.kv >= kvReq) return { ...row };
  }
  return { ...HV_DN_KV_TABLE[HV_DN_KV_TABLE.length - 1] };
}

/**
 * @param {number} qLmin
 * @param {number} deltaPBar
 * @returns {number} kW
 */
export function dissipatedPowerKw(qLmin, deltaPBar) {
  return (qLmin * deltaPBar) / 600;
}

/**
 * @param {number} deltaPBar
 * @returns {'green'|'yellow'|'red'}
 */
export function workingZone(deltaPBar) {
  if (deltaPBar < 5) return 'green';
  if (deltaPBar <= 15) return 'yellow';
  return 'red';
}

/**
 * @param {object} p
 * @param {'design'|'diagnostic'} p.mode
 * @param {string} p.valveType relief|reducing|flow|check|proportional
 * @param {number} p.qLmin
 * @param {number} p.pMaxBar
 * @param {number} p.pSetBar
 * @param {number} p.viscCst
 * @param {number} [p.kvInstalled]
 * @param {number} [p.dnInstalled]
 */
export function computeHydraulicValve(p) {
  const q = Math.max(0, p.qLmin);
  let kvUsed = p.kvInstalled ?? 0;
  let dnRec = p.dnInstalled ?? 0;

  let targetDeltaP = 5;
  if (p.valveType === 'relief' && p.pMaxBar > p.pSetBar) {
    targetDeltaP = Math.max(2, p.pMaxBar - p.pSetBar);
  }

  if (p.mode === 'design') {
    kvUsed = kvFromFlowDeltaP(q, targetDeltaP);
    const pick = pickNominalDn(kvUsed);
    dnRec = pick.dn;
    kvUsed = pick.kv;
  } else if (dnRec) {
    const row = HV_DN_KV_TABLE.find((r) => r.dn === dnRec);
    kvUsed = row ? row.kv : HV_DN_KV_TABLE[1].kv;
  } else if (!kvUsed) {
    kvUsed = HV_DN_KV_TABLE[1].kv;
    dnRec = HV_DN_KV_TABLE[1].dn;
  }

  const deltaP = deltaPFromFlowKv(q, kvUsed);
  const heatKw = dissipatedPowerKw(q, deltaP);
  const zone = workingZone(deltaP);

  let crackingBar = null;
  let hysteresisBar = null;
  if (p.valveType === 'relief') {
    crackingBar = Math.max(0, p.pSetBar * 0.92);
    hysteresisBar = Math.max(0.5, p.pSetBar * 0.08);
  }

  return {
    deltaPBar: deltaP,
    kvUsed,
    kvRequired: p.mode === 'design' ? kvFromFlowDeltaP(q, targetDeltaP) : kvUsed,
    heatKw,
    zone,
    dnRec,
    targetDeltaP,
    crackingBar,
    hysteresisBar,
  };
}

/**
 * @param {SVGElement|null} svg
 * @param {object} opts
 */
export function renderValveDiagram(svg, opts) {
  if (!(svg instanceof SVGSVGElement)) return;
  const { valveType, deltaPBar, qLmin, zone, labels } = opts;
  const sym = valveType || 'relief';
  const dp = Number.isFinite(deltaPBar) ? deltaPBar : 0;
  const q = Number.isFinite(qLmin) ? qLmin : 0;
  const w = 400;
  const h = 248;
  const zoneClr =
    zone === 'green' ? '#059669' : zone === 'yellow' ? '#ca8a04' : '#dc2626';
  const zoneBg =
    zone === 'green' ? '#ecfdf5' : zone === 'yellow' ? '#fef9c3' : '#fef2f2';

  const pipe = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>`;
  const flow = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0d9488" stroke-width="2.5" marker-end="url(#hvArr)" stroke-linecap="round"/>`;

  let symbol = '';
  if (sym === 'relief') {
    symbol = `
      <rect x="152" y="88" width="96" height="48" rx="5" fill="#fff" stroke="#0f766e" stroke-width="2.5"/>
      <line x1="168" y1="104" x2="232" y2="120" stroke="#dc2626" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M200 72 L200 88" stroke="#dc2626" stroke-width="2"/>
      <path d="M192 72 L208 72" stroke="#dc2626" stroke-width="2"/>
      <text x="200" y="66" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Inter,sans-serif">${labels?.spring || 'Pset'}</text>
      <path d="M200 136 L200 158" stroke="#64748b" stroke-width="2" marker-end="url(#hvArrGray)"/>
      <rect x="178" y="158" width="44" height="22" rx="3" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
      <text x="200" y="172" text-anchor="middle" font-size="9" fill="#475569" font-weight="600" font-family="Inter,sans-serif">${labels?.tank || 'T'}</text>`;
  } else if (sym === 'reducing') {
    symbol = `
      <rect x="152" y="88" width="96" height="48" rx="5" fill="#fff" stroke="#0f766e" stroke-width="2.5"/>
      <polygon points="188,112 202,100 202,124" fill="#0d9488"/>
      <line x1="210" y1="100" x2="210" y2="124" stroke="#0f766e" stroke-width="2"/>`;
  } else if (sym === 'check') {
    symbol = `
      <rect x="152" y="88" width="96" height="48" rx="5" fill="#fff" stroke="#0f766e" stroke-width="2.5"/>
      <circle cx="188" cy="112" r="10" fill="#ecfdf5" stroke="#0d9488" stroke-width="2"/>
      <polygon points="210,112 198,102 198,122" fill="#0d9488"/>`;
  } else if (sym === 'proportional') {
    symbol = `
      <rect x="152" y="88" width="96" height="48" rx="5" fill="#faf5ff" stroke="#7c3aed" stroke-width="2.5"/>
      <rect x="168" y="64" width="64" height="20" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
      <path d="M176 74 h48 M188 64 v20 M212 64 v20" stroke="#7c3aed" stroke-width="1.5"/>
      <text x="200" y="114" text-anchor="middle" font-size="10" fill="#5b21b6" font-weight="800" font-family="Inter,sans-serif">X</text>`;
  } else {
    symbol = `
      <rect x="152" y="88" width="96" height="48" rx="5" fill="#fff" stroke="#0f766e" stroke-width="2.5"/>
      <path d="M170 100 h60 M170 124 h60 M182 100 v24 M218 100 v24" stroke="#0d9488" stroke-width="2" fill="none"/>`;
  }

  const dpLabel = dp >= 100 ? dp.toFixed(0) : dp.toFixed(1);

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <marker id="hvArr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill="#0d9488"/>
      </marker>
      <marker id="hvArrGray" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/>
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="16" y="22" font-size="10" fill="#64748b" font-weight="600" font-family="Inter,sans-serif">ISO 1219 \u00b7 ${labels?.typeName || sym}</text>

    ${pipe(24, 112, 148, 112)}
    ${pipe(252, 112, 376, 112)}
    ${flow(36, 112, 148, 112)}
    ${flow(252, 112, 364, 112)}

    <text x="28" y="100" font-size="11" fill="#0f766e" font-weight="700" font-family="Inter,sans-serif">${labels?.in || 'P'}</text>
    <text x="372" y="100" text-anchor="end" font-size="11" fill="#0f766e" font-weight="700" font-family="Inter,sans-serif">${labels?.out || 'A'}</text>

    ${symbol}

    <rect x="88" y="196" width="224" height="40" rx="10" fill="${zoneBg}" stroke="${zoneClr}" stroke-width="1.5"/>
    <text x="200" y="216" text-anchor="middle" font-size="13" fill="${zoneClr}" font-weight="800" font-family="Inter,sans-serif">\u0394P \u2248 ${dpLabel} bar</text>
    <text x="200" y="232" text-anchor="middle" font-size="10" fill="#475569" font-family="Inter,sans-serif">Q \u2248 ${q.toFixed(1)} L/min</text>
  `;
}
