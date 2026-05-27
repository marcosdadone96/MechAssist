/**
 * Simplified worm + worm wheel schematic (side / isometric hint).
 * @param {SVGSVGElement | null} el
 * @param {object} geom from computeWormGear
 */
export function renderWormGearDiagram(el, geom) {
  if (!(el instanceof SVGSVGElement) || !geom) return;

  const d1 = geom.d1_mm;
  const d2 = geom.d2_mm;
  const a = geom.a_mm;
  const scale = Math.min(1.65, 200 / Math.max(a, 40));
  const sD1 = (d1 / 2) * scale;
  const sD2 = (d2 / 2) * scale;
  const sA = a * scale;

  const vbW = 400;
  const vbH = 260;
  const cy = 118;
  const cxWorm = 118;
  const cxWheel = cxWorm + sA;

  const lockClr = geom.selfLocking ? '#dc2626' : '#059669';
  const lockBg = geom.selfLocking ? '#fef2f2' : '#ecfdf5';

  el.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <marker id="wgArr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#0f766e"/>
      </marker>
      <linearGradient id="wgWormG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="14" y="22" font-size="10" fill="#64748b" font-weight="600" font-family="Inter,sans-serif">Worm pair \u00b7 indicative</text>

    <line x1="${cxWorm - sD1 - 28}" y1="${cy}" x2="${cxWorm - sD1}" y2="${cy}" stroke="#0d9488" stroke-width="2" marker-end="url(#wgArr)"/>
    <text x="${cxWorm - sD1 - 32}" y="${cy - 8}" text-anchor="end" font-size="9" fill="#0f766e" font-family="Inter,sans-serif">n\u2081</text>

    <circle cx="${cxWorm}" cy="${cy}" r="${sD1}" fill="url(#wgWormG)" stroke="#475569" stroke-width="2"/>
    <path d="M ${cxWorm - sD1 * 0.3} ${cy - sD1 * 0.55}
             Q ${cxWorm + sD1 * 0.5} ${cy - sD1 * 0.2} ${cxWorm + sD1 * 0.35} ${cy + sD1 * 0.5}
             Q ${cxWorm - sD1 * 0.4} ${cy + sD1 * 0.15} ${cxWorm - sD1 * 0.3} ${cy - sD1 * 0.55}"
          fill="none" stroke="#0f766e" stroke-width="2.2"/>

    <circle cx="${cxWheel}" cy="${cy}" r="${sD2}" fill="#fff" stroke="#0f766e" stroke-width="2.2"/>
    ${Array.from({ length: Math.min(geom.z2, 24) }, (_, k) => {
      const ang = (k / Math.min(geom.z2, 24)) * Math.PI * 2 - Math.PI / 2;
      const x1 = cxWheel + sD2 * 0.72 * Math.cos(ang);
      const y1 = cy + sD2 * 0.72 * Math.sin(ang);
      const x2 = cxWheel + sD2 * Math.cos(ang);
      const y2 = cy + sD2 * Math.sin(ang);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#0d9488" stroke-width="1.4"/>`;
    }).join('')}

    <line x1="${cxWorm + sD1}" y1="${cy + sD2 + 18}" x2="${cxWheel - sD2}" y2="${cy + sD2 + 18}" stroke="#64748b" stroke-width="1"/>
    <text x="${(cxWorm + cxWheel) / 2}" y="${cy + sD2 + 32}" text-anchor="middle" font-size="11" fill="#0f172a" font-weight="700" font-family="Inter,sans-serif">a \u2248 ${a.toFixed(1)} mm</text>

    <line x1="${cxWorm - sD1 - 8}" y1="${cy - sD1 - 14}" x2="${cxWorm + sD1 + 8}" y2="${cy - sD1 - 14}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${cxWorm}" y="${cy - sD1 - 18}" text-anchor="middle" font-size="9" fill="#475569" font-family="Inter,sans-serif">d\u2081 \u2248 ${d1.toFixed(1)} mm</text>

    <line x1="${cxWheel - sD2 - 6}" y1="${cy + sD2 + 42}" x2="${cxWheel + sD2 + 6}" y2="${cy + sD2 + 42}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${cxWheel}" y="${cy + sD2 + 54}" text-anchor="middle" font-size="9" fill="#475569" font-family="Inter,sans-serif">d\u2082 \u2248 ${d2.toFixed(1)} mm</text>

    <rect x="88" y="196" width="224" height="52" rx="10" fill="${lockBg}" stroke="${lockClr}" stroke-width="1.5"/>
    <text x="200" y="216" text-anchor="middle" font-size="11" fill="${lockClr}" font-weight="800" font-family="Inter,sans-serif">\u03b3 \u2248 ${geom.gammaDeg.toFixed(2)}\u00b0 \u00b7 \u03b7 \u2248 ${geom.etaDirectPct.toFixed(1)}%</text>
    <text x="200" y="234" text-anchor="middle" font-size="10" fill="#475569" font-family="Inter,sans-serif">i = ${geom.i.toFixed(2)}${geom.selfLocking ? ' \u00b7 Self-locking' : ''}</text>
  `;
}
