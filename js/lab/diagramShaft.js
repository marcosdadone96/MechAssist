/**
 * SVG: eje macizo con par torsor, opcional flexión y sección Ød (esquema).
 */

function uid() {
  return `s${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {SVGSVGElement | null} el
 * @param {{ diameter_mm?: number, showBending?: boolean, moment_Nm?: number }} [opts]
 */
export function renderShaftTorsionDiagram(el, opts) {
  if (!el) return;
  const d = Number(opts?.diameter_mm) || 45;
  const showBending = Boolean(opts?.showBending);
  const M = Number(opts?.moment_Nm) || 0;
  const id = uid();
  const dm = d / 1000;
  /** Radio en sección transversal (visual, acotado) */
  const cr = Math.min(40, Math.max(16, d * 0.42));

  el.setAttribute('viewBox', '0 0 680 320');
  el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${id}Bg" x1="0" y1="0" x2="680" y2="320" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e8eef4" />
      </linearGradient>
      <linearGradient id="${id}Shaft" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#cbd5e1" />
        <stop offset="50%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#94a3b8" />
      </linearGradient>
      <marker id="${id}Arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#c2410c"/></marker>
      <marker id="${id}ArrBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#1d4ed8"/></marker>
      <filter id="${id}Sh" x="-4%" y="-10%" width="108%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.12" />
      </filter>
    </defs>
    <rect width="680" height="320" fill="url(#${id}Bg)" />
    <text x="340" y="30" text-anchor="middle" font-size="15" font-weight="800" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Eje macizo · torsión${showBending ? ' + flexión' : ''}</text>
    <text x="340" y="50" text-anchor="middle" font-size="10" fill="#475569" font-family="Inter, system-ui, sans-serif">τ = 16T / (πd³)${showBending ? ' · tensión equivalente con M' : ''}</text>

    <!-- Eje en vista lateral -->
    <g transform="translate(56, 168)" filter="url(#${id}Sh)">
      <rect x="0" y="-28" width="420" height="56" rx="10" fill="url(#${id}Shaft)" stroke="#334155" stroke-width="2" />
      <!-- Apoyos / secciones de corte -->
      <line x1="0" y1="-42" x2="0" y2="46" stroke="#0f766e" stroke-width="2.4" />
      <line x1="420" y1="-42" x2="420" y2="46" stroke="#0f766e" stroke-width="2.4" />
      <text x="0" y="-50" text-anchor="middle" font-size="9" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">Sección</text>
      <text x="420" y="-50" text-anchor="middle" font-size="9" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">Sección</text>
      <!-- Par T en extremos (flechas radiales, sin cruzar la zona central) -->
      <path d="M -32,-12 L 0,0 L -32,12" fill="none" stroke="#c2410c" stroke-width="3" marker-end="url(#${id}Arr)" />
      <path d="M 452,-12 L 420,0 L 452,12" fill="none" stroke="#c2410c" stroke-width="3" marker-end="url(#${id}Arr)" />
      <!-- Arcos de par bajo el eje (radios válidos para la cuerda) -->
      <path d="M 48,30 A 42 42 0 0 0 132,30" fill="none" stroke="#b45309" stroke-width="2.2" marker-end="url(#${id}Arr)" />
      <path d="M 372,30 A 42 42 0 0 1 288,30" fill="none" stroke="#b45309" stroke-width="2.2" marker-end="url(#${id}Arr)" />
      <text x="210" y="86" text-anchor="middle" font-size="12" font-weight="800" fill="#9a3412" font-family="Inter,system-ui,sans-serif">Par T</text>
      ${
        showBending
          ? `<g>
        <line x1="210" y1="-72" x2="210" y2="-34" stroke="#1d4ed8" stroke-width="2.4" marker-end="url(#${id}ArrBlue)"/>
        <line x1="218" y1="-72" x2="218" y2="-34" stroke="#1d4ed8" stroke-width="2.4" marker-end="url(#${id}ArrBlue)"/>
        <path d="M 170,-78 Q 214,-92 258,-78" fill="none" stroke="#1d4ed8" stroke-width="1.6" stroke-dasharray="3 3"/>
        <text x="214" y="-88" text-anchor="middle" font-size="11" font-weight="800" fill="#1d4ed8" font-family="Inter,system-ui,sans-serif">M ≈ ${M.toFixed(0)} N·m</text>
        <text x="214" y="-96" text-anchor="middle" font-size="8.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">flexión en tramo central</text>
      </g>`
          : ''
      }
    </g>

    <!-- Sección transversal esquemática Ød -->
    <g transform="translate(568, 172)" filter="url(#${id}Sh)">
      <circle cx="0" cy="0" r="${cr.toFixed(1)}" fill="#e2e8f0" stroke="#475569" stroke-width="2.2" />
      <circle cx="0" cy="0" r="${(cr * 0.22).toFixed(1)}" fill="#94a3b8" opacity="0.35" />
      <line x1="0" y1="${(-cr).toFixed(1)}" x2="0" y2="${cr.toFixed(1)}" stroke="#0f766e" stroke-width="1.4" stroke-dasharray="3 2" />
      <text x="0" y="${(cr + 20).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="#334155" font-family="Inter,system-ui,sans-serif">Ø d</text>
    </g>
    <text x="568" y="132" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="Inter,system-ui,sans-serif">Sección</text>

    <text x="340" y="262" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">Ø mín. ≈ ${dm.toFixed(5)} m (${d.toFixed(2)} mm)</text>
    <text x="340" y="288" text-anchor="middle" font-size="9" fill="#64748b" font-family="Inter, system-ui, sans-serif">Referencia comercial; valide deflexión, concentración y acople.</text>
  `;
}
