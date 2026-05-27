/**
 * Viga en flexion ù diagrama tecnico (apoyos, carga, momento y flecha).
 * @param {SVGElement | null} svg
 * @param {object} p
 */
export function renderBeamDiagram(svg, p) {
  if (!svg) return;
  const type = p.beamType || 'simply-supported';
  const load = p.loadType || 'point-center';
  const span = Math.max(0.1, p.span_m || 3);
  const Lpx = 420;
  const x0 = 72;
  const yBeam = 118;
  const aFrac = Math.min(1, Math.max(0, (p.loadPos_m ?? span / 2) / span));
  const lx = x0 + Lpx * (load === 'point-center' ? 0.5 : aFrac);
  const deflAmp = Math.min(42, Math.max(6, (p.delta_mm || 0) * 0.05));

  const typeLabel =
    type === 'simply-supported'
      ? 'Viga apoyada'
      : type === 'cantilever'
        ? 'Voladizo'
        : 'Empotrada\u2013empotrada';

  let supports = '';
  if (type === 'simply-supported') {
    supports = `
      <g id="bmSupL">
        <polygon points="${x0},${yBeam + 8} ${x0 - 14},${yBeam + 32} ${x0 + 14},${yBeam + 32}" fill="#334155"/>
        <text x="${x0}" y="${yBeam + 48}" text-anchor="middle" font-size="9" fill="#64748b">Apoyo</text>
      </g>
      <g id="bmSupR">
        <circle cx="${x0 + Lpx}" cy="${yBeam + 24}" r="10" fill="#fff" stroke="#334155" stroke-width="2"/>
        <line x1="${x0 + Lpx}" y1="${yBeam + 8}" x2="${x0 + Lpx}" y2="${yBeam + 34}" stroke="#334155" stroke-width="2"/>
        <line x1="${x0 + Lpx - 16}" y1="${yBeam + 34}" x2="${x0 + Lpx + 16}" y2="${yBeam + 34}" stroke="#334155" stroke-width="1.5"/>
        <text x="${x0 + Lpx}" y="${yBeam + 48}" text-anchor="middle" font-size="9" fill="#64748b">Rodillo</text>
      </g>`;
  } else if (type === 'cantilever') {
    supports = `
      <rect x="${x0 - 22}" y="${yBeam - 48}" width="22" height="96" fill="#334155" rx="2"/>
      ${Array.from({ length: 7 }, (_, i) => {
        const y = yBeam - 40 + i * 12;
        return `<line x1="${x0 - 30 - (i % 2) * 4}" y1="${y}" x2="${x0 - 22}" y2="${y + 4}" stroke="#94a3b8" stroke-width="1.2"/>`;
      }).join('')}
      <text x="${x0 - 11}" y="${yBeam + 58}" text-anchor="middle" font-size="9" fill="#64748b" transform="rotate(-90 ${x0 - 11} ${yBeam + 20})">Empotramiento</text>`;
  } else {
    supports = `
      <rect x="${x0 - 22}" y="${yBeam - 48}" width="22" height="96" fill="#334155" rx="2"/>
      <rect x="${x0 + Lpx}" y="${yBeam - 48}" width="22" height="96" fill="#334155" rx="2"/>
      ${Array.from({ length: 5 }, (_, i) => `<line x1="${x0 - 30 - i * 3}" y1="${yBeam - 36 + i * 16}" x2="${x0 - 22}" y2="${yBeam - 28 + i * 16}" stroke="#94a3b8" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 5 }, (_, i) => `<line x1="${x0 + Lpx + 22 + i * 3}" y1="${yBeam - 36 + i * 16}" x2="${x0 + Lpx + 30 + i * 3}" y2="${yBeam - 28 + i * 16}" stroke="#94a3b8" stroke-width="1"/>`).join('')}`;
  }

  let loadGfx = '';
  if (load === 'distributed' || load === 'distributed-partial') {
    const x1 = load === 'distributed' ? x0 : x0 + Lpx * ((p.loadPos_m || 0) / span);
    const x2 = load === 'distributed' ? x0 + Lpx : x0 + Lpx * ((p.loadPosB_m || span) / span);
    for (let x = x1; x <= x2; x += 14) {
      loadGfx += `<line x1="${x}" y1="${yBeam - 12}" x2="${x}" y2="${yBeam - 42}" stroke="#dc2626" stroke-width="1.5" marker-end="url(#bmArr)"/>`;
    }
    loadGfx += `<text x="${(x1 + x2) / 2}" y="${yBeam - 50}" text-anchor="middle" font-size="12" font-weight="700" fill="#b91c1c">q (N/m)</text>`;
  } else {
    loadGfx = `
      <line x1="${lx}" y1="${yBeam - 10}" x2="${lx}" y2="${yBeam - 48}" stroke="#dc2626" stroke-width="2.5" marker-end="url(#bmArr)"/>
      <rect x="${lx - 28}" y="${yBeam - 62}" width="56" height="16" rx="4" fill="#fef2f2" stroke="#fecaca"/>
      <text x="${lx}" y="${yBeam - 51}" text-anchor="middle" font-size="11" font-weight="700" fill="#b91c1c">F</text>`;
  }

  const mX = load === 'point-center' ? x0 + Lpx / 2 : lx;
  const mVal =
    p.M_max != null && Number.isFinite(p.M_max)
      ? `${(p.M_max / 1000).toFixed(2)} kN\u00b7m`
      : 'M';
  const deltaTxt =
    p.delta_mm != null && Number.isFinite(p.delta_mm) ? ` = ${p.delta_mm.toFixed(2)} mm` : '';

  svg.setAttribute('viewBox', '0 0 600 280');
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <marker id="bmArr" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#dc2626"/></marker>
      <linearGradient id="bmBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
    </defs>
    <rect width="600" height="280" fill="#f8fafc" rx="10"/>
    <text x="300" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">Euler-Bernoulli \u00b7 ${typeLabel}</text>

    ${supports}

    <!-- Viga -->
    <rect x="${x0}" y="${yBeam - 10}" width="${Lpx}" height="20" rx="3" fill="url(#bmBeam)" stroke="#475569" stroke-width="1.5"/>

    <!-- Flecha deformada -->
    <path d="M${x0} ${yBeam} Q${x0 + Lpx * 0.25} ${yBeam + deflAmp * 0.6} ${x0 + Lpx * 0.5} ${yBeam + deflAmp} T${x0 + Lpx} ${yBeam}"
      fill="none" stroke="#0d9488" stroke-width="2.5" stroke-dasharray="7 5"/>
    <text x="${x0 + Lpx * 0.55}" y="${yBeam + deflAmp + 22}" font-size="11" font-weight="600" fill="#0f766e">\u03b4 max${deltaTxt}</text>

    ${loadGfx}

    <!-- Diagrama momento (simplificado) -->
    <path d="M${x0} ${yBeam - 70} Q${mX} ${yBeam - 92} ${x0 + Lpx} ${yBeam - 70}" fill="none" stroke="#d97706" stroke-width="2"/>
    <circle cx="${mX}" cy="${yBeam - 86}" r="18" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
    <text x="${mX}" y="${yBeam - 82}" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e">M</text>
    <text x="${mX}" y="${yBeam - 68}" text-anchor="middle" font-size="9" fill="#92400e">${mVal}</text>

    <!-- Cota L -->
    <line x1="${x0}" y1="${yBeam + 42}" x2="${x0 + Lpx}" y2="${yBeam + 42}" stroke="#64748b" stroke-width="1.2"/>
    <line x1="${x0}" y1="${yBeam + 36}" x2="${x0}" y2="${yBeam + 48}"/>
    <line x1="${x0 + Lpx}" y1="${yBeam + 36}" x2="${x0 + Lpx}" y2="${yBeam + 48}"/>
    <text x="${x0 + Lpx / 2}" y="${yBeam + 58}" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">L = ${span.toFixed(2)} m</text>
  `;
}
