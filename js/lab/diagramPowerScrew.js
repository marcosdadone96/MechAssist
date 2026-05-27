/**
 * Husillo trapezoidal ISO 2904 — diagrama claro (vista lateral + perfil Tr).
 * @param {SVGElement | null} svg
 * @param {object} p
 */
export function renderPowerScrewDiagram(svg, p) {
  if (!svg) return;
  const pitch = p.pitch_mm || 4;
  const d = p.diameter_mm || 16;
  const d2 = d - 0.5 * pitch;
  const d1 = d - pitch;
  const F = p.load_N || 0;
  const starts = p.starts || 1;
  const L = starts * pitch;
  const W = 640;
  const H = 300;

  const screwX = 48;
  const screwTop = 56;
  const screwH = 168;
  const scale = Math.min(5.2, 130 / d);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = `
    <defs>
      <marker id="psArrD" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#dc2626"/></marker>
      <marker id="psArrT" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#d97706"/></marker>
      <linearGradient id="psSteel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#94a3b8"/><stop offset="45%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <pattern id="psThread" width="${pitch * scale}" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,3 L${pitch * scale},0 L${pitch * scale},6 L0,3" fill="none" stroke="#64748b" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="#f8fafc" rx="10"/>
    <text x="${W / 2}" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">ISO 2904 Tr &middot; perfil 30&deg; (semi&aacute;ngulo 15&deg;)</text>

    <!-- Panel lateral -->
    <rect x="16" y="40" width="300" height="228" fill="#fff" stroke="#e2e8f0" rx="8"/>
    <text x="28" y="58" font-size="11" font-weight="700" fill="#475569">Vista lateral</text>

    <!-- Husillo -->
    <rect x="${screwX + 36}" y="${screwTop}" width="${d * scale * 0.55}" height="${screwH}" fill="url(#psSteel)" stroke="#334155" stroke-width="1.5" rx="2"/>
    <rect x="${screwX + 36}" y="${screwTop}" width="${d * scale * 0.55}" height="${screwH}" fill="url(#psThread)" opacity="0.35"/>

    <!-- Tuerca -->
    <rect x="${screwX + 22}" y="${screwTop + screwH * 0.28}" width="${d * scale * 0.85 + 28}" height="${screwH * 0.44}" fill="#fef3c7" stroke="#d97706" stroke-width="2" rx="4"/>
    <text x="${screwX + 55}" y="${screwTop + screwH * 0.52}" font-size="11" font-weight="600" fill="#92400e">Tuerca</text>

    <!-- Carga F -->
    <line x1="${screwX + 55}" y1="${screwTop - 6}" x2="${screwX + 55}" y2="${screwTop + 22}" stroke="#dc2626" stroke-width="2.5" marker-end="url(#psArrD)"/>
    <rect x="${screwX + 18}" y="${screwTop - 28}" width="74" height="18" rx="4" fill="#fef2f2" stroke="#fecaca"/>
    <text x="${screwX + 55}" y="${screwTop - 15}" text-anchor="middle" font-size="11" font-weight="700" fill="#b91c1c">F = ${(F / 1000).toFixed(1)} kN</text>

    <!-- Par T -->
    <path d="M${screwX + 36 + d * scale * 0.6} ${screwTop + 40} A 26 26 0 1 1 ${screwX + 36 + d * scale * 0.6 - 20} ${screwTop + 58}"
      fill="none" stroke="#d97706" stroke-width="2.2" marker-end="url(#psArrT)"/>
    <text x="${screwX + 36 + d * scale * 0.75}" y="${screwTop + 34}" font-size="11" font-weight="700" fill="#b45309">T</text>

    <!-- Cotas d -->
    <line x1="${screwX + 36}" y1="${screwTop + screwH + 14}" x2="${screwX + 36 + d * scale * 0.55}" y2="${screwTop + screwH + 14}" stroke="#64748b" stroke-width="1"/>
    <text x="${screwX + 36 + (d * scale * 0.55) / 2}" y="${screwTop + screwH + 28}" text-anchor="middle" font-size="10" fill="#334155">d = ${d.toFixed(1)} mm</text>

    <!-- Panel perfil -->
    <rect x="332" y="40" width="292" height="228" fill="#fff" stroke="#e2e8f0" rx="8"/>
    <text x="478" y="58" text-anchor="middle" font-size="11" font-weight="700" fill="#475569">Perfil de filete (ampliado)</text>

    <g transform="translate(478, 155) scale(${Math.min(3.4, 52 / pitch)})">
      <path d="M-22 0 L-9 -${pitch * 0.48} L9 -${pitch * 0.48} L22 0 L9 ${pitch * 0.48} L-9 ${pitch * 0.48} Z"
        fill="#cbd5e1" stroke="#475569" stroke-width="0.7"/>
      <line x1="-22" y1="0" x2="22" y2="0" stroke="#0d9488" stroke-width="0.5" stroke-dasharray="2 2"/>
      <text x="0" y="-${pitch * 0.58}" text-anchor="middle" font-size="3.8" font-weight="700" fill="#b91c1c">p = ${pitch}</text>
      <line x1="-14" y1="-${pitch * 0.15}" x2="-14" y2="${pitch * 0.15}" stroke="#0f766e" stroke-width="0.45"/>
      <text x="-12" y="1" font-size="3.2" fill="#0f766e">d&#8322;</text>
      <text x="24" y="8" font-size="3.2" fill="#64748b">15&deg;</text>
      <text x="-24" y="8" font-size="3.2" fill="#64748b">15&deg;</text>
    </g>

    <text x="478" y="218" text-anchor="middle" font-size="10" fill="#475569">d&#8321; &asymp; ${d1.toFixed(1)} mm &middot; d&#8322; &asymp; ${d2.toFixed(1)} mm</text>
    <text x="478" y="236" text-anchor="middle" font-size="10" fill="#475569">Avance L = n&middot;p = ${L.toFixed(1)} mm (${starts} entrada${starts > 1 ? 's' : ''})</text>
    <text x="478" y="254" text-anchor="middle" font-size="9" fill="#94a3b8">Esquema did&aacute;ctico; no sustituye plano de taller</text>
  `;
}
