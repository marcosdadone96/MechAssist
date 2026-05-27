/**
 * Top view ù bolt pattern, shear force, eccentricity, load per bolt.
 * @param {SVGSVGElement | null} el
 * @param {import('./boltShear.js').ReturnType<typeof import('./boltShear.js').computeBoltShear>} r
 */
export function renderBoltShearDiagram(el, r) {
  if (!(el instanceof SVGSVGElement) || !r) return;

  const W = 420;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const scale = Math.min(3.2, 110 / Math.max(r.spacing_mm, 20));

  const maxV = Math.max(...r.distribution.map((b) => b.V_N), 1);
  const Vcrit = r.criticalBolt.V_N;

  const plateHalf = r.spacing_mm * scale * 0.72 + 28;

  const boltsSvg = r.distribution
    .map((b) => {
      const px = cx + b.x * scale;
      const py = cy + b.y * scale;
      const rad = 5 + (b.V_N / maxV) * 7;
      const isCrit = b.index === r.criticalBolt.index;
      const fill = isCrit ? '#dc2626' : b.V_N > maxV * 0.85 ? '#d97706' : '#0f766e';
      const stroke = isCrit ? '#991b1b' : '#047857';
      return `
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rad.toFixed(1)}" fill="${fill}" fill-opacity="0.35" stroke="${stroke}" stroke-width="${isCrit ? 2.2 : 1.6}"/>
        <text x="${px.toFixed(1)}" y="${(py + rad + 11).toFixed(1)}" text-anchor="middle" font-size="8" fill="#475569" font-family="Inter,sans-serif">${(b.V_N / 1000).toFixed(1)} kN</text>
      `;
    })
    .join('');

  const eccPx = r.ecc_mm * scale;
  const forceY = cy - eccPx;
  const arrowLen = plateHalf + 20;

  el.setAttribute('viewBox', `0 0 ${W} ${H}`);
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <marker id="bsArr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb"/>
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="14" y="20" font-size="10" font-weight="600" fill="#64748b" font-family="Inter,sans-serif">Top view \u00b7 bolt pattern</text>

    <rect x="${(cx - plateHalf).toFixed(1)}" y="${(cy - plateHalf).toFixed(1)}" width="${(plateHalf * 2).toFixed(1)}" height="${(plateHalf * 2).toFixed(1)}" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6 4"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="#64748b"/>
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="8" fill="#64748b" font-family="Inter,sans-serif">C</text>

    ${boltsSvg}

    <line x1="${(cx - arrowLen).toFixed(1)}" y1="${forceY.toFixed(1)}" x2="${(cx + arrowLen).toFixed(1)}" y2="${forceY.toFixed(1)}" stroke="#2563eb" stroke-width="2.2" marker-end="url(#bsArr)"/>
    <text x="${(cx + arrowLen + 4).toFixed(1)}" y="${(forceY + 4).toFixed(1)}" font-size="9" fill="#1d4ed8" font-family="Inter,sans-serif">F</text>

    ${Math.abs(r.ecc_mm) > 0.5 ? `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${forceY.toFixed(1)}" stroke="#c2410c" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${(cx + 6).toFixed(1)}" y="${((cy + forceY) / 2).toFixed(1)}" font-size="8" fill="#c2410c" font-family="Inter,sans-serif">e</text>` : ''}

    <text x="14" y="${H - 12}" font-size="8" fill="#64748b" font-family="Inter,sans-serif">Max bolt #${r.criticalBolt.index}: ${(Vcrit / 1000).toFixed(2)} kN \u00b7 n=${r.n} \u00b7 ${r.planes}\u00d7 plane(s)</text>
  `;
}
