/**
 * Diagramas SVG detallados para calculadoras de catálogo (acoplamiento, chaveta, tornillo, rodamiento, línea motor).
 */

function uid() {
  return `dc${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Acoplamiento elástico en tres piezas: bridas, elemento elástico, flechas y par.
 * @param {SVGSVGElement | null} el
 */
export function renderCouplingAssemblyDiagram(el) {
  if (!(el instanceof SVGSVGElement)) return;
  const g = uid();
  el.setAttribute('viewBox', '0 0 720 400');
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${g}bg" x1="0" y1="0" x2="720" y2="400"><stop offset="0%" stop-color="#f0fdfa"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
      <linearGradient id="${g}hub" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
      <filter id="${g}sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/></filter>
      <marker id="${g}arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#b45309"/></marker>
    </defs>
    <rect width="720" height="400" fill="url(#${g}bg)"/>
    <text x="24" y="34" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Acoplamiento flexible tipo mandíbula / estrella</text>
    <text x="24" y="54" font-size="10.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Bridas en ambos extremos · elemento elástico intermedio · transmisión de par T</text>

    <!-- Eje motor -->
    <g transform="translate(48,200)" filter="url(#${g}sh)">
      <rect x="-40" y="-14" width="120" height="28" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      <text x="22" y="5" font-size="10" fill="#f8fafc" font-family="Inter,system-ui,sans-serif" text-anchor="middle">Eje motor</text>
    </g>
    <!-- Brida izq -->
    <g transform="translate(168,200)" filter="url(#${g}sh)">
      <rect x="0" y="-48" width="22" height="96" fill="url(#${g}hub)" stroke="#334155" stroke-width="2"/>
      <circle cx="11" cy="-28" r="5" fill="#1e293b" stroke="#0f172a"/>
      <circle cx="11" cy="0" r="5" fill="#1e293b" stroke="#0f172a"/>
      <circle cx="11" cy="28" r="5" fill="#1e293b" stroke="#0f172a"/>
    </g>
    <!-- Elástico -->
    <g transform="translate(210,200)" filter="url(#${g}sh)">
      <path d="M0,-42 C35,-50 55,-20 55,0 C55,20 35,50 0,42 C-35,50 -55,20 -55,0 C-55,-20 -35,-50 0,-42 Z"
        fill="#5eead4" fill-opacity="0.55" stroke="#0d9488" stroke-width="2.5"/>
      <path d="M0,-28 L18,-8 L0,12 L-18,-8 Z" fill="#99f6e4" stroke="#0f766e" stroke-width="1.2"/>
      <path d="M0,-8 L18,12 L0,32 L-18,12 Z" fill="#99f6e4" stroke="#0f766e" stroke-width="1.2"/>
      <text x="0" y="-58" text-anchor="middle" font-size="9" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">Elemento elástico</text>
    </g>
    <!-- Brida der -->
    <g transform="translate(488,200)" filter="url(#${g}sh)">
      <rect x="0" y="-48" width="22" height="96" fill="url(#${g}hub)" stroke="#334155" stroke-width="2"/>
      <circle cx="11" cy="-28" r="5" fill="#1e293b" stroke="#0f172a"/>
      <circle cx="11" cy="0" r="5" fill="#1e293b" stroke="#0f172a"/>
      <circle cx="11" cy="28" r="5" fill="#1e293b" stroke="#0f172a"/>
    </g>
    <!-- Eje conducido -->
    <g transform="translate(552,200)" filter="url(#${g}sh)">
      <rect x="0" y="-14" width="120" height="28" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      <text x="60" y="5" font-size="10" fill="#f8fafc" font-family="Inter,system-ui,sans-serif" text-anchor="middle">Eje conducido</text>
    </g>

    <!-- Par T -->
    <path d="M 320 115 A 42 42 0 1 1 380 130" fill="none" stroke="#b45309" stroke-width="2.5" marker-end="url(#${g}arr)"/>
    <text x="330" y="108" font-size="12" font-weight="800" fill="#b45309" font-family="Inter,system-ui,sans-serif">T</text>
    <text x="400" y="95" font-size="10" fill="#64748b" font-family="Inter,system-ui,sans-serif">T = P / ω = 9550·P(kW)/n(rpm)</text>

    <!-- Potencia -->
    <rect x="24" y="300" width="200" height="52" rx="8" fill="#fff" stroke="#99f6e4" stroke-width="1.5"/>
    <text x="34" y="322" font-size="10" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">Entrada de datos</text>
    <text x="34" y="340" font-size="9.5" fill="#475569" font-family="Inter,system-ui,sans-serif">P · n · K  →  T diseño vs T nom catálogo</text>

    <text x="24" y="388" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">Esquema didáctico; geometría real según placa del fabricante.</text>
  `;
}

/**
 * Chaveta paralela: vista en corte del eje + cota L.
 * @param {SVGSVGElement | null} el
 * @param {{ d: number; b: number; h: number; t1: number; t2: number; L: number }} p
 */
export function renderParallelKeyShaftDiagram(el, p) {
  if (!(el instanceof SVGSVGElement)) return;
  const g = uid();
  const { d, b, h, t1, t2, L } = p;
  const cx = 220;
  const cy = 210;
  const R = Math.min(88, Math.max(48, d * 1.35));
  const scale = R / (d / 2);
  const bw = (b / 2) * scale * 0.95;
  const keyH = h * scale * 0.9;
  const kwDepth = t1 * scale * 0.95;

  el.setAttribute('viewBox', '0 0 720 420');
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${g}bg" x1="0" y1="0" x2="720" y2="420"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
      <linearGradient id="${g}shaft" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
      <filter id="${g}sh"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/></filter>
    </defs>
    <rect width="720" height="420" fill="url(#${g}bg)"/>
    <text x="24" y="32" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Chaveta paralela forma A · DIN 6885-1 (referencia)</text>
    <text x="24" y="52" font-size="10.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Corte por eje: profundidad ranura t₁ · altura chaveta h · ancho b · longitud útil L</text>

    <!-- Eje circular -->
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${g}shaft)" stroke="#334155" stroke-width="2.5" filter="url(#${g}sh)"/>
    <!-- Ranura (wedge cut top) -->
    <path d="M ${cx - bw} ${cy - R} L ${cx + bw} ${cy - R} L ${cx + bw} ${cy - R + kwDepth} L ${cx} ${cy - R + kwDepth + 2} L ${cx - bw} ${cy - R + kwDepth} Z"
      fill="#1e293b" stroke="#0f172a" stroke-width="1.2" opacity="0.92"/>
    <!-- Chaveta -->
    <rect x="${cx - bw}" y="${cy - R - keyH}" width="${bw * 2}" height="${keyH}" fill="#fbbf24" stroke="#b45309" stroke-width="2" rx="1" filter="url(#${g}sh)"/>
    <!-- Cotas -->
    <line x1="${cx - bw - 35}" y1="${cy - R - keyH}" x2="${cx - bw - 35}" y2="${cy - R + kwDepth}" stroke="#0d9488" stroke-width="1.2"/>
    <line x1="${cx - bw - 40}" y1="${cy - R - keyH}" x2="${cx - bw - 30}" y2="${cy - R - keyH}" stroke="#0d9488"/>
    <line x1="${cx - bw - 40}" y1="${cy - R + kwDepth}" x2="${cx - bw - 30}" y2="${cy - R + kwDepth}" stroke="#0d9488"/>
    <text x="${cx - bw - 42}" y="${cy - R - keyH / 2 + kwDepth / 2}" text-anchor="end" font-size="11" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">h</text>

    <line x1="${cx - bw}" y1="${cy - R - keyH - 28}" x2="${cx + bw}" y2="${cy - R - keyH - 28}" stroke="#0d9488" stroke-width="1.2"/>
    <line x1="${cx - bw}" y1="${cy - R - keyH - 32}" x2="${cx - bw}" y2="${cy - R - keyH - 22}" stroke="#0d9488"/>
    <line x1="${cx + bw}" y1="${cy - R - keyH - 32}" x2="${cx + bw}" y2="${cy - R - keyH - 22}" stroke="#0d9488"/>
    <text x="${cx}" y="${cy - R - keyH - 36}" text-anchor="middle" font-size="11" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">b</text>

    <text x="${cx + R + 18}" y="${cy + 6}" font-size="12" font-weight="800" fill="#334155" font-family="Inter,system-ui,sans-serif">Ø d = ${d.toFixed(1)} mm</text>
    <text x="${cx + R + 18}" y="${cy + 26}" font-size="10" fill="#64748b" font-family="Inter,system-ui,sans-serif">t₁ = ${t1} mm · t₂ (cubo) = ${t2} mm</text>

    <!-- Vista lateral longitud L -->
    <g transform="translate(460, 160)" filter="url(#${g}sh)">
      <rect x="0" y="0" width="${Math.min(220, L * 2.2)}" height="36" rx="4" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <rect x="20" y="-14" width="${Math.min(180, L * 2.2 - 40)}" height="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
      <text x="${Math.min(110, L * 1.1)}" y="-22" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309" font-family="Inter,system-ui,sans-serif">L ≈ ${L} mm</text>
      <text x="8" y="54" font-size="10" fill="#475569" font-family="Inter,system-ui,sans-serif">Vista lateral · chaveta sobre eje</text>
    </g>

    <text x="24" y="400" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">Aplastamiento: modelo σ ≈ 2|T| / (d · L · h/2); verificar con norma y tolerancias de taller.</text>
  `;
}

/**
 * Unión atornillada: platinas, tornillo, fuerza axial.
 * @param {SVGSVGElement | null} el
 * @param {number} d_mm
 */
export function renderBoltedJointDiagram(el, d_mm) {
  if (!(el instanceof SVGSVGElement)) return;
  const g = uid();
  const sh = Math.max(14, Math.min(36, d_mm * 1.4));
  const head = sh * 1.15;

  el.setAttribute('viewBox', '0 0 720 380');
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${g}bg" x1="0" y1="0" x2="720" y2="380"><stop offset="0%" stop-color="#fefce8"/><stop offset="100%" stop-color="#e7e5e4"/></linearGradient>
      <linearGradient id="${g}bolt" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#d6d3d1"/><stop offset="100%" stop-color="#78716c"/></linearGradient>
      <filter id="${g}sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.14"/></filter>
    </defs>
    <rect width="720" height="380" fill="url(#${g}bg)"/>
    <text x="24" y="32" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Unión pretensada · tornillo métrico ISO</text>
    <text x="24" y="52" font-size="10.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Platinas rígidas · precarga F_V · tracción de cálculo F · rosca a resistencia</text>

    <!-- Platinas -->
    <g transform="translate(360, 200)" filter="url(#${g}sh)">
      <rect x="-140" y="-55" width="280" height="28" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <rect x="-140" y="27" width="280" height="28" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <!-- Tornillo -->
      <rect x="${-sh / 2}" y="${-55 - head}" width="${sh}" height="${head}" fill="#a8a29e" stroke="#44403c" stroke-width="1.5" rx="2"/>
      <polygon points="0,${-55 - head - 2} ${sh * 0.35},${-55 - head * 0.55} ${-sh * 0.35},${-55 - head * 0.55}" fill="#d6d3d1" stroke="#57534e"/>
      <rect x="${-sh * 0.35}" y="-55" width="${sh * 0.7}" height="110" fill="url(#${g}bolt)" stroke="#44403c" stroke-width="1.8"/>
      <!-- Rosca indicada -->
      <line x1="${sh * 0.35}" y1="-20" x2="${sh * 0.35}" y2="40" stroke="#292524" stroke-width="0.8" stroke-dasharray="2 2"/>
      <line x1="${-sh * 0.35}" y1="-20" x2="${-sh * 0.35}" y2="40" stroke="#292524" stroke-width="0.8" stroke-dasharray="2 2"/>
    </g>

    <!-- Fuerza F -->
    <g transform="translate(520, 200)">
      <line x1="0" y1="-40" x2="0" y2="40" stroke="#dc2626" stroke-width="3" marker-start="url(#${g}ar1)" marker-end="url(#${g}ar2)"/>
      <defs>
        <marker id="${g}ar1" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7,0 L0,3.5 L7,7 Z" fill="#dc2626"/></marker>
        <marker id="${g}ar2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#dc2626"/></marker>
      </defs>
      <text x="14" y="6" font-size="12" font-weight="800" fill="#dc2626" font-family="Inter,system-ui,sans-serif">F</text>
    </g>

    <rect x="24" y="285" width="240" height="62" rx="8" fill="#fff" stroke="#fca5a5" stroke-width="1.2"/>
    <text x="34" y="308" font-size="10" font-weight="700" fill="#991b1b" font-family="Inter,system-ui,sans-serif">M${d_mm} · Área tensión A_s · Rp (grado)</text>
    <text x="34" y="328" font-size="9.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Par apriete T ≈ K · F_V · d (K orientativo 0,20)</text>

    <text x="24" y="368" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">No incluye interacción placa/placa ni rosca en fatiga; ver EN 1993-1-8 / montaje.</text>
  `;
}

/**
 * Rodamiento rígido de bolas a escala d,D,B.
 * @param {SVGSVGElement | null} el
 * @param {{ d: number; D: number; B: number; designation: string }} p
 */
export function renderCatalogDeepGrooveSection(el, p) {
  if (!(el instanceof SVGSVGElement)) return;
  const g = uid();
  const { d, D, B, designation } = p;
  const cx = 360;
  const cy = 215;
  const k = 118 / D;
  const ri = (d / 2) * k;
  const ro = (D / 2) * k;
  const halfB = (B / 2) * k * 0.85;
  const nBalls = 7;
  const rm = (ri + ro) / 2;
  const rb = Math.max(4, (ro - ri) * 0.32);

  el.setAttribute('viewBox', '0 0 720 430');
  el.setAttribute('role', 'img');
  let balls = '';
  for (let i = 0; i < nBalls; i++) {
    const ang = (i / nBalls) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + rm * Math.cos(ang);
    const by = cy + (rm * Math.sin(ang) * 0.42);
    balls += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${rb}" ry="${rb * 0.42}" fill="#e2e8f0" stroke="#475569" stroke-width="1.1"/>`;
  }

  el.innerHTML = `
    <defs>
      <linearGradient id="${g}bg" x1="0" y1="0" x2="720" y2="430"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
      <linearGradient id="${g}steel" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
      <filter id="${g}sh"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.16"/></filter>
    </defs>
    <rect width="720" height="430" fill="url(#${g}bg)"/>
    <text x="24" y="34" font-size="17" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Rodamiento rígido de bolas · ${designation}</text>
    <text x="24" y="54" font-size="10.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Sección esquemática · d × D × B según fila catálogo · bolas en surco</text>

    <g filter="url(#${g}sh)">
      <path d="M ${cx - ro},${cy - halfB} L ${cx + ro},${cy - halfB} L ${cx + ro + 8},${cy} L ${cx + ro},${cy + halfB} L ${cx - ro},${cy + halfB} L ${cx - ro - 8},${cy} Z"
        fill="url(#${g}steel)" stroke="#334155" stroke-width="2"/>
      <path d="M ${cx - ri + 4},${cy - halfB * 0.88} L ${cx + ri - 4},${cy - halfB * 0.88} L ${cx + ri + 2},${cy} L ${cx + ri - 4},${cy + halfB * 0.88} L ${cx - ri + 4},${cy + halfB * 0.88} L ${cx - ri - 2},${cy} Z"
        fill="url(#${g}steel)" stroke="#1e293b" stroke-width="1.8"/>
      ${balls}
      <ellipse cx="${cx}" cy="${cy}" rx="${(ri + ro) / 2 + 2}" ry="${((ri + ro) / 2) * 0.38}" fill="none" stroke="#0d9488" stroke-width="1.3" stroke-dasharray="5 4"/>
    </g>

    <text x="24" y="120" font-size="10" fill="#334155" font-family="Inter,system-ui,sans-serif">d = ${d} mm</text>
    <text x="24" y="138" font-size="10" fill="#334155" font-family="Inter,system-ui,sans-serif">D = ${D} mm</text>
    <text x="24" y="156" font-size="10" fill="#334155" font-family="Inter,system-ui,sans-serif">B = ${B} mm</text>
    <text x="24" y="180" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">C dinámica y L₁₀ con P, n en el formulario</text>

    <text x="24" y="408" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">Ilustración didáctica; geometría y radios de curvatura según catálogo SKF/FAG.</text>
  `;
}

/**
 * Línea de transmisión: motor J_m · carga J_ext.
 * @param {SVGSVGElement | null} el
 */
export function renderInertiaTransmissionLine(el) {
  if (!(el instanceof SVGSVGElement)) return;
  const g = uid();
  el.setAttribute('viewBox', '0 0 720 200');
  el.setAttribute('role', 'img');
  el.innerHTML = `
    <defs>
      <linearGradient id="${g}bg" x1="0" y1="0" x2="720" y2="200"><stop offset="0%" stop-color="#ecfdf5"/><stop offset="100%" stop-color="#e0e7ff"/></linearGradient>
      <filter id="${g}sh"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.12"/></filter>
      <marker id="${g}a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#64748b"/></marker>
    </defs>
    <rect width="720" height="200" fill="url(#${g}bg)"/>
    <text x="24" y="28" font-size="15" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Cadena de inercias (referencia al eje motor)</text>
    <text x="24" y="48" font-size="10" fill="#475569" font-family="Inter,system-ui,sans-serif">Criterio fabricante: J_ext / J_mot &lt; límite típico (10…15) para arranque con variador</text>

    <g transform="translate(90, 120)" filter="url(#${g}sh)">
      <rect x="-50" y="-35" width="100" height="70" rx="6" fill="#0d9488" stroke="#0f766e" stroke-width="2"/>
      <text x="0" y="6" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Inter,system-ui,sans-serif">Motor</text>
      <text x="0" y="22" text-anchor="middle" font-size="9" fill="#ccfbf1" font-family="Inter,system-ui,sans-serif">J_mot</text>
    </g>
    <line x1="145" y1="120" x2="235" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#${g}a)"/>
    <text x="175" y="108" font-size="9" fill="#64748b" font-family="Inter,system-ui,sans-serif">eje</text>

    <g transform="translate(290, 120)" filter="url(#${g}sh)">
      <rect x="-40" y="-28" width="80" height="56" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      <text x="0" y="6" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Inter,system-ui,sans-serif">Acople</text>
    </g>

    <line x1="335" y1="120" x2="420" y2="120" stroke="#64748b" stroke-width="2" marker-end="url(#${g}a)"/>

    <g transform="translate(500, 120)" filter="url(#${g}sh)">
      <circle cx="0" cy="0" r="48" fill="#cbd5e1" stroke="#475569" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="18" fill="#64748b" stroke="#334155"/>
      <text x="0" y="-58" text-anchor="middle" font-size="10" font-weight="800" fill="#334155" font-family="Inter,system-ui,sans-serif">Carga</text>
      <text x="0" y="72" text-anchor="middle" font-size="9" fill="#475569" font-family="Inter,system-ui,sans-serif">J_ext reflejada</text>
    </g>

    <text x="24" y="178" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">El gráfico inferior compara par motor disponible vs par resistente a régimen.</text>
  `;
}
