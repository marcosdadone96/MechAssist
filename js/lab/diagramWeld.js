/**
 * Junta soldada — diagrama técnico con cotas h, a, l y fuerzas.
 * @param {SVGElement | null} svg
 * @param {object} p
 */
export function renderWeldDiagram(svg, p) {
  if (!svg) return;
  const mode = p.mode || 'fillet';
  const joint = p.jointType || 'T';
  const h = p.cathetus_mm || 6;
  const a = 0.7 * h;
  const l = p.length_mm || 120;
  const t = p.plateThickness_mm || 10;
  const F = p.force_N || 0;
  const vbW = 620;
  const vbH = 280;

  let jointGfx = '';
  if (joint === 'lap') {
    jointGfx = `
      <rect x="120" y="130" width="180" height="${Math.max(8, t * 0.8)}" fill="#94a3b8" stroke="#475569"/>
      <rect x="160" y="${130 + Math.max(8, t * 0.8)}" width="180" height="${Math.max(8, t * 0.8)}" fill="#64748b" stroke="#475569"/>
      <polygon points="160,${130 + Math.max(8, t * 0.8)} ${160 + h * 2.2},${130 + Math.max(8, t * 0.8) - h * 1.6} 160,${130 + Math.max(8, t * 0.8) - h * 3.2}" fill="#fed7aa" stroke="#ea580c" stroke-width="1.8"/>
      <polygon points="340,${130 + Math.max(8, t * 0.8) + Math.max(8, t * 0.8)} ${340 - h * 2.2},${130 + Math.max(8, t * 0.8) + Math.max(8, t * 0.8) - h * 1.6} 340,${130 + Math.max(8, t * 0.8) + Math.max(8, t * 0.8) - h * 3.2}" fill="#fed7aa" stroke="#ea580c" stroke-width="1.8"/>
    `;
  } else if (joint === 'butt' || mode === 'butt') {
    jointGfx = `
      <rect x="180" y="120" width="90" height="${Math.max(10, t * 0.9)}" fill="#94a3b8" stroke="#475569"/>
      <rect x="270" y="120" width="90" height="${Math.max(10, t * 0.9)}" fill="#94a3b8" stroke="#475569"/>
      <rect x="268" y="118" width="4" height="${Math.max(14, t * 0.9 + 4)}" fill="#fb923c"/>
      <line x1="268" y1="118" x2="272" y2="${118 + Math.max(14, t * 0.9 + 4)}" stroke="#ea580c" stroke-width="2"/>
    `;
  } else {
    const baseY = 155;
    const webH = 70;
    jointGfx = `
      <rect x="80" y="${baseY}" width="360" height="${Math.max(10, t * 0.85)}" fill="#94a3b8" stroke="#475569"/>
      <rect x="248" y="${baseY - webH}" width="${Math.max(10, t * 0.85)}" height="${webH}" fill="#64748b" stroke="#475569"/>
      <polygon points="248,${baseY} ${248 + h * 2.5},${baseY - h * 2.2} 248,${baseY - h * 4.4}" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
      <polygon points="248,${baseY} ${248 - h * 2.5},${baseY - h * 2.2} 248,${baseY - h * 4.4}" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
      <line x1="248" y1="${baseY}" x2="${248 - a * 2.8}" y2="${baseY - a * 2.8}" stroke="#0d9488" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="${248 - a * 1.4}" y="${baseY - a * 1.2}" font-size="10" fill="#0f766e">a</text>
    `;
  }

  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.innerHTML = `
    <defs>
      <marker id="wArr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dc2626"/></marker>
    </defs>
    <rect width="${vbW}" height="${vbH}" fill="#f8fafc" rx="10"/>
    <text x="${vbW / 2}" y="22" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">${mode === 'fillet' ? 'Cord\u00f3n de filete' : 'Soldadura a tope'} &middot; ${joint === 'T' ? 'junta en T' : joint}</text>
    ${jointGfx}
    <line x1="300" y1="52" x2="300" y2="95" stroke="#dc2626" stroke-width="2.2" marker-end="url(#wArr)"/>
    <text x="308" y="72" font-size="11" fill="#b91c1c">F = ${(F / 1000).toFixed(1)} kN</text>
    ${mode === 'fillet' ? `
      <line x1="420" y1="200" x2="480" y2="200" stroke="#64748b" stroke-width="1"/>
      <line x1="420" y1="195" x2="420" y2="205"/><line x1="480" y1="195" x2="480" y2="205"/>
      <text x="450" y="192" text-anchor="middle" font-size="10" fill="#334155">l = ${l.toFixed(0)} mm</text>
      <line x1="500" y1="168" x2="500" y2="200" stroke="#64748b" stroke-width="1"/>
      <line x1="495" y1="168" x2="505" y2="168"/><line x1="495" y1="200" x2="505" y2="200"/>
      <text x="512" y="188" font-size="10" fill="#b45309">h = ${h}</text>
      <text x="512" y="218" font-size="10" fill="#0f766e">a = ${a.toFixed(1)}</text>
      <text x="512" y="238" font-size="9" fill="#64748b">l<sub>eff</sub> &asymp; ${Math.max(0, l - 2 * h).toFixed(0)} mm</text>
    ` : `
      <text x="400" y="200" font-size="10" fill="#334155">t = ${t} mm &middot; l = ${l} mm</text>
    `}
    <text x="36" y="${vbH - 16}" font-size="9" fill="#64748b">Esquema did\u00e1ctico EN 1993-1-8 orientativo &mdash; no plano WPS</text>
  `;
}
