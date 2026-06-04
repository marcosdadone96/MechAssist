/**
 * Illustrations for hub calculator cards (theme + SVG or asset image).
 * Mini schematics mirror each calculator diagram (not abstract icons).
 * @typedef {{ theme: string, type: 'svg', svg: string } | { theme: string, type: 'img', src: string, alt?: string }} HubCardArt
 */
/** SVG de mquinas: carga diferida en labHubCardArt.js para no romper el hub si falta el archivo en deploy. */

const HUB_VB = '0 0 160 96';
const HUB_BG = `<rect width="160" height="96" fill="#f1f5f9"/>`;

/** @param {number} cx @param {number} cy @param {number} rp @param {number} ra @param {number} n @param {number} z */
function hubGearToothPaths(cx, cy, rp, ra, n, z) {
  const step = (2 * Math.PI) / z;
  let d = '';
  for (let i = 0; i < n; i++) {
    const t0 = i * step;
    const t1 = t0 + step * 0.34;
    const t2 = t0 + step * 0.66;
    const x0 = cx + rp * Math.cos(t0);
    const y0 = cy + rp * Math.sin(t0);
    const x1 = cx + ra * Math.cos(t1);
    const y1 = cy + ra * Math.sin(t1);
    const x2 = cx + rp * Math.cos(t2);
    const y2 = cy + rp * Math.sin(t2);
    d += ` M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

function hubGearsSvg() {
  const cy = 50;
  const cx1 = 46;
  const cx2 = 114;
  const p1 = hubGearToothPaths(cx1, cy, 22, 24, 12, 20);
  const p2 = hubGearToothPaths(cx2, cy, 14, 16, 10, 28);
  return `<svg viewBox="${HUB_VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HUB_BG}
    <circle cx="${cx1}" cy="${cy}" r="24" fill="#e2e8f0" stroke="#334155" stroke-width="1.6"/>
    <circle cx="${cx2}" cy="${cy}" r="16" fill="#cbd5e1" stroke="#334155" stroke-width="1.6"/>
    <path d="${p1}" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="${p2}" fill="none" stroke="#0d9488" stroke-width="2" stroke-linejoin="round"/>
    <line x1="${cx1}" y1="${cy - 26}" x2="${cx1}" y2="${cy + 26}" stroke="#64748b" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
    <line x1="${cx2}" y1="${cy - 18}" x2="${cx2}" y2="${cy + 18}" stroke="#64748b" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
    <line x1="${cx1 + 24}" y1="${cy}" x2="${cx2 - 16}" y2="${cy}" stroke="#0f766e" stroke-width="1.2" opacity="0.45"/>
  </svg>`;
}

function hubBeltsSvg() {
  return `<svg viewBox="${HUB_VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HUB_BG.replace('#f1f5f9', '#f8fafc')}
    <circle cx="40" cy="54" r="22" fill="#fdba74" stroke="#92400e" stroke-width="2"/>
    <circle cx="120" cy="54" r="15" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
    <path d="M16 36 Q80 14 144 36" stroke="#92400e" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M16 72 Q80 94 144 72" stroke="#d97706" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M18 54 L142 54" stroke="#78716c" stroke-width="2.5" stroke-dasharray="5 4" opacity="0.55"/>
  </svg>`;
}

function hubShaftSvg() {
  return `<svg viewBox="${HUB_VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HUB_BG}
    <rect x="14" y="40" width="132" height="18" rx="5" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
    <line x1="14" y1="28" x2="14" y2="68" stroke="#0f766e" stroke-width="2.2"/>
    <line x1="146" y1="28" x2="146" y2="68" stroke="#0f766e" stroke-width="2.2"/>
    <path d="M0 46 L14 52 L0 58" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M160 46 L146 52 L160 58" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36 66 A28 28 0 0 0 72 66" fill="none" stroke="#b45309" stroke-width="2"/>
    <path d="M88 66 A28 28 0 0 1 124 66" fill="none" stroke="#b45309" stroke-width="2"/>
    <circle cx="80" cy="72" r="14" fill="#f8fafc" stroke="#1d4ed8" stroke-width="1.8"/>
    <circle cx="80" cy="72" r="5" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
  </svg>`;
}

function hubBearingsSvg() {
  return `<svg viewBox="${HUB_VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HUB_BG.replace('#f1f5f9', '#eff6ff')}
    <path d="M28 32 L132 32 L142 48 L132 64 L28 64 L18 48 Z" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
    <path d="M48 40 L112 40 L120 48 L112 56 L48 56 L40 48 Z" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.8"/>
    <circle cx="58" cy="48" r="5" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/>
    <circle cx="80" cy="48" r="5" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/>
    <circle cx="102" cy="48" r="5" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/>
    <circle cx="69" cy="48" r="5" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/>
    <circle cx="91" cy="48" r="5" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/>
  </svg>`;
}

/** @param {string} _page */
function machineCardArt(_page) {
  return { theme: 'machine', type: 'svg', svg: '' };
}

/** @type {Record<string, HubCardArt>} */
export const HUB_CARD_ART = {
  'calc-gears.html': {
    theme: 'kinematic',
    type: 'svg',
    svg: hubGearsSvg(),
  },
  'calc-belts.html': {
    theme: 'kinematic',
    type: 'svg',
    svg: hubBeltsSvg(),
  },
  'calc-chains.html': {
    theme: 'kinematic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#ecfdf5"/><circle cx="38" cy="50" r="20" fill="#64748b" stroke="#334155" stroke-width="2"/><circle cx="122" cy="50" r="20" fill="#64748b" stroke="#334155" stroke-width="2"/><rect x="14" y="44" width="132" height="12" rx="3" fill="#475569"/><circle cx="26" cy="50" r="4" fill="#94a3b8"/><circle cx="50" cy="50" r="4" fill="#94a3b8"/><circle cx="74" cy="50" r="4" fill="#94a3b8"/><circle cx="98" cy="50" r="4" fill="#94a3b8"/><circle cx="122" cy="50" r="4" fill="#94a3b8"/><circle cx="146" cy="50" r="4" fill="#94a3b8"/></svg>`,
  },
  'calc-worm-gear.html': {
    theme: 'kinematic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#ecfdf5"/><circle cx="48" cy="50" r="18" fill="#e2e8f0" stroke="#475569" stroke-width="2"/><path d="M38 38 Q48 50 58 62 Q52 44 38 38" fill="none" stroke="#0f766e" stroke-width="2.4"/><circle cx="108" cy="50" r="28" fill="#fff" stroke="#0f766e" stroke-width="2.2"/><line x1="108" y1="22" x2="108" y2="78" stroke="#0d9488" stroke-width="1.4"/><line x1="80" y1="50" x2="136" y2="50" stroke="#0d9488" stroke-width="1.4"/><line x1="92" y1="32" x2="124" y2="68" stroke="#0d9488" stroke-width="1.4"/><line x1="92" y1="68" x2="124" y2="32" stroke="#0d9488" stroke-width="1.4"/><line x1="66" y1="50" x2="80" y2="50" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4 3"/><text x="80" y="86" text-anchor="middle" fill="#0f766e" font-size="10" font-family="system-ui,sans-serif">worm</text></svg>`,
  },
  'calc-fatigue.html': {
    theme: 'shaft',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#fef2f2"/><line x1="28" y1="72" x2="132" y2="72" stroke="#94a3b8" stroke-width="1.5"/><line x1="28" y1="72" x2="28" y2="20" stroke="#94a3b8" stroke-width="1.5"/><polyline points="28,72 132,20" fill="none" stroke="#dc2626" stroke-width="2.5"/><path d="M28,68 Q80,36 132,28" fill="none" stroke="#ea580c" stroke-width="2"/><path d="M28,72 Q70,48 132,38" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 4"/><circle cx="96" cy="38" r="7" fill="#059669" fill-opacity="0.3" stroke="#047857" stroke-width="2"/><line x1="28" y1="72" x2="96" y2="38" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/></svg>`,
  },
  'calc-bearings.html': {
    theme: 'shaft',
    type: 'svg',
    svg: hubBearingsSvg(),
  },
  'calc-shaft.html': {
    theme: 'shaft',
    type: 'svg',
    svg: hubShaftSvg(),
  },
  'calc-keys-din6885.html': {
    theme: 'shaft',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f8fafc"/><rect x="24" y="36" width="112" height="28" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/><rect x="62" y="44" width="36" height="12" rx="1" fill="#0d9488" opacity="0.85"/><path d="M62 44 L98 56 L62 56Z" fill="#14b8a6"/></svg>`,
  },
  'calc-iso-fit.html': {
    theme: 'shaft',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#eef2ff"/><rect x="28" y="28" width="48" height="44" rx="2" fill="#c7d2fe" stroke="#4f46e5" stroke-width="2"/><rect x="84" y="34" width="44" height="32" rx="2" fill="#a5b4fc" stroke="#4338ca" stroke-width="2"/><path d="M76 50h12" stroke="#6366f1" stroke-width="2" stroke-dasharray="3 2"/></svg>`,
  },
  'calc-seeger.html': {
    theme: 'shaft',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f8fafc"/><circle cx="80" cy="48" r="28" fill="none" stroke="#64748b" stroke-width="6"/><path d="M108 28a28 28 0 1 1 0 40" stroke="#0d9488" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="80" cy="48" r="18" fill="#e2e8f0"/></svg>`,
  },
  'calc-bearings-catalog.html': {
    theme: 'shaft',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#eff6ff"/><rect x="24" y="22" width="112" height="52" rx="6" fill="#fff" stroke="#93c5fd" stroke-width="1.5"/><circle cx="52" cy="48" r="14" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/><circle cx="80" cy="48" r="14" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/><circle cx="108" cy="48" r="14" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/><text x="80" y="78" text-anchor="middle" fill="#3b82f6" font-size="11" font-family="system-ui,sans-serif">62xx</text></svg>`,
  },
  'calc-couplings.html': {
    theme: 'join',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#fffbeb"/><circle cx="48" cy="48" r="16" fill="#fcd34d" stroke="#b45309" stroke-width="2"/><circle cx="112" cy="48" r="16" fill="#fcd34d" stroke="#b45309" stroke-width="2"/><rect x="62" y="40" width="36" height="16" rx="4" fill="#f59e0b" stroke="#d97706" stroke-width="2"/><path d="M70 44c4 4 8 4 12 0M70 52c4-4 8-4 12 0" stroke="#92400e" stroke-width="1.5" fill="none"/></svg>`,
  },
  'calc-bolts-iso898.html': {
    theme: 'join',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#fafaf9"/><path d="M72 18 L88 34 L84 34 L84 72 L76 72 L76 34 L72 34Z" fill="#78716c" stroke="#44403c" stroke-width="1.5"/><rect x="70" y="72" width="20" height="8" rx="1" fill="#a8a29e"/><path d="M80 26v38" stroke="#0d9488" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/></svg>`,
  },
  'calc-bolt-shear.html': {
    theme: 'join',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f8fafc"/><rect x="36" y="28" width="88" height="44" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/><circle cx="56" cy="44" r="6" fill="#fff" stroke="#0f766e" stroke-width="1.8"/><circle cx="104" cy="44" r="6" fill="#fff" stroke="#0f766e" stroke-width="1.8"/><circle cx="56" cy="64" r="6" fill="#fff" stroke="#0f766e" stroke-width="1.8"/><circle cx="104" cy="64" r="6" fill="#fff" stroke="#0f766e" stroke-width="1.8"/><path d="M12 50h136" stroke="#2563eb" stroke-width="3" marker-end="url(#none)"/><path d="M80 20v56" stroke="#c2410c" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/></svg>`,
  },
  'calc-gearmotor-inertia.html': {
    theme: 'dynamic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f5f3ff"/><rect x="22" y="38" width="56" height="28" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="2"/><rect x="78" y="42" width="28" height="20" rx="2" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2"/><circle cx="36" cy="52" r="10" fill="#ddd6fe" stroke="#6d28d9" stroke-width="1.5"/><path d="M106 52h28" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><path d="M24 68 Q80 82 136 68" stroke="#8b5cf6" stroke-width="2" fill="none" opacity="0.5"/></svg>`,
  },
  'calc-compression-spring.html': {
    theme: 'dynamic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#fdf4ff"/><path d="M28 72c8-28 16-28 24 0s16 28 24 0 16-28 24 0 16 28 24 0" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="24" y="68" width="112" height="6" rx="2" fill="#c084fc" opacity="0.5"/><rect x="24" y="22" width="112" height="6" rx="2" fill="#c084fc" opacity="0.5"/></svg>`,
  },
  'calc-beam.html': {
    theme: 'dynamic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#ecfdf5"/><rect x="18" y="42" width="124" height="14" rx="2" fill="#cbd5e1" stroke="#334155" stroke-width="2.2"/><path d="M80 18v22M73 24l7-7 7 7" stroke="#0f766e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 56v16M132 56v16" stroke="#0d9488" stroke-width="2.6" stroke-linecap="round"/><path d="M22 74 Q80 88 138 74" stroke="#14b8a6" stroke-width="2.2" fill="none" opacity="0.45"/></svg>`,
  },
  'calc-power-screw.html': {
    theme: 'dynamic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0fdfa"/><rect x="72" y="12" width="16" height="72" rx="2" fill="#e2e8f0" stroke="#475569" stroke-width="2"/><path d="M64 22h32M62 34h36M64 46h32M62 58h36M64 70h32" stroke="#0f766e" stroke-width="2.2" stroke-linecap="round"/><rect x="48" y="78" width="64" height="8" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1.5"/><path d="M80 6v6" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  'calc-weld-joint.html': {
    theme: 'join',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#fffbeb"/><rect x="20" y="64" width="120" height="12" rx="2" fill="#cbd5e1" stroke="#475569" stroke-width="2"/><rect x="68" y="26" width="24" height="38" rx="1" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><path d="M68 64 L68 54 L48 64 Z" fill="#d97706" stroke="#b45309" stroke-width="1.8" stroke-linejoin="round"/><path d="M92 64 L112 64 L92 54 Z" fill="#d97706" stroke="#b45309" stroke-width="1.8" stroke-linejoin="round"/><path d="M32 70h96" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/></svg>`,
  },
  'transmission-canvas.html': {
    theme: 'canvas',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#0f172a"/><circle cx="36" cy="30" r="6" fill="#2dd4bf"/><circle cx="124" cy="30" r="6" fill="#2dd4bf"/><circle cx="80" cy="68" r="6" fill="#38bdf8"/><path d="M42 32 L74 64 M118 32 L86 64 M42 32 L118 32" stroke="#64748b" stroke-width="2"/><path d="M20 78h120" stroke="#334155" stroke-width="1"/><text x="80" y="88" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="system-ui">multieje</text></svg>`,
  },
  'centrifugal-pump.html': machineCardArt('centrifugal-pump.html'),
  'flat-conveyor.html': machineCardArt('flat-conveyor.html'),
  'roller-conveyor.html': machineCardArt('roller-conveyor.html'),
  'inclined-conveyor.html': machineCardArt('inclined-conveyor.html'),
  'bucket-elevator.html': machineCardArt('bucket-elevator.html'),
  'screw-conveyor.html': machineCardArt('screw-conveyor.html'),
  'traction-elevator.html': machineCardArt('traction-elevator.html'),
  'car-lift-screw.html': machineCardArt('car-lift-screw.html'),
  'calc-hydraulic-pump.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#ecfeff"/><circle cx="56" cy="52" r="22" fill="#67e8f9" stroke="#0891b2" stroke-width="2"/><path d="M78 52h48" stroke="#0e7490" stroke-width="4" stroke-linecap="round"/><path d="M126 40v24" stroke="#155e75" stroke-width="3"/><path d="M118 44h16v16h-16z" fill="#22d3ee" stroke="#0891b2" stroke-width="1.5"/><path d="M30 70 Q56 30 82 70" stroke="#06b6d4" stroke-width="2" fill="none" opacity="0.6"/></svg>`,
  },
  'calc-pneumatic-cylinder.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0f9ff"/><rect x="28" y="32" width="24" height="40" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/><rect x="52" y="44" width="56" height="16" rx="2" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><rect x="108" y="32" width="24" height="40" rx="3" fill="#7dd3fc" stroke="#0369a1" stroke-width="2"/><path d="M40 28h8M112 28h8" stroke="#64748b" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  'calc-pneumatic-compressor.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0f9ff"/><rect x="22" y="54" width="116" height="26" rx="6" fill="#bae6fd" stroke="#0284c7" stroke-width="2.2"/><rect x="54" y="28" width="52" height="32" rx="3" fill="#7dd3fc" stroke="#0369a1" stroke-width="2"/><path d="M80 14v14" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/><path d="M66 18l14 10M94 18L80 28" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><circle cx="46" cy="72" r="8" fill="#fff" stroke="#0284c7" stroke-width="2"/><circle cx="114" cy="72" r="8" fill="#fff" stroke="#0284c7" stroke-width="2"/><circle cx="46" cy="72" r="3" fill="#64748b"/><circle cx="114" cy="72" r="3" fill="#64748b"/></svg>`,
  },
  'calc-hydraulic-cylinder.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#eff6ff"/><rect x="30" y="30" width="20" height="44" rx="2" fill="#1e40af" opacity="0.85"/><rect x="50" y="46" width="60" height="14" rx="2" fill="#3b82f6"/><rect x="110" y="38" width="20" height="28" rx="2" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/><circle cx="20" cy="72" r="4" fill="#93c5fd"/><circle cx="140" cy="72" r="4" fill="#93c5fd"/></svg>`,
  },
  'calc-hydraulic-press.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0fdfa"/><rect x="48" y="18" width="64" height="12" rx="2" fill="#64748b"/><rect x="40" y="30" width="80" height="8" fill="#94a3b8"/><rect x="36" y="38" width="88" height="28" rx="3" fill="#0d9488" opacity="0.9"/><rect x="52" y="66" width="56" height="14" rx="2" fill="#475569"/><path d="M80 30v8" stroke="#fbbf24" stroke-width="3"/></svg>`,
  },
  'calc-hydraulic-valve.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#ecfeff"/><rect x="52" y="34" width="56" height="28" rx="4" fill="#cffafe" stroke="#0891b2" stroke-width="2"/><path d="M16 48h36M108 48h36" stroke="#0e7490" stroke-width="3" stroke-linecap="round"/><path d="M80 16v18M80 62v18" stroke="#155e75" stroke-width="2.5" stroke-linecap="round"/><rect x="68" y="42" width="24" height="12" rx="2" fill="#22d3ee" stroke="#0891b2" stroke-width="1.5"/><path d="M72 48h16" stroke="#0e7490" stroke-width="2" stroke-linecap="round"/><path d="M28 48l8-6v12zM132 48l-8-6v12z" fill="#06b6d4" opacity="0.75"/></svg>`,
  },
  'calc-hydraulic-accumulator.html': {
    theme: 'fluid',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0f9ff"/><rect x="58" y="14" width="44" height="68" rx="22" fill="none" stroke="#0284c7" stroke-width="2.5"/><ellipse cx="80" cy="48" rx="14" ry="28" fill="#bae6fd" stroke="#0369a1" stroke-width="1.5"/><rect x="72" y="4" width="16" height="10" rx="2" fill="#e0f2fe" stroke="#64748b" stroke-width="1.2"/><rect x="72" y="82" width="16" height="10" rx="2" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.2"/><text x="80" y="11" text-anchor="middle" font-size="7" fill="#475569">N2</text></svg>`,
  },
  _soon: {
    theme: 'soon',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f1f5f9"/><circle cx="80" cy="44" r="22" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 4"/><path d="M56 72h48" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><circle cx="64" cy="72" r="2" fill="#94a3b8"/><circle cx="80" cy="72" r="2" fill="#94a3b8"/><circle cx="96" cy="72" r="2" fill="#94a3b8"/></svg>`,
  },
  _default: {
    theme: 'kinematic',
    type: 'svg',
    svg: `<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="160" height="96" fill="#f0fdfa"/><circle cx="80" cy="48" r="24" fill="#99f6e4" stroke="#0d9488" stroke-width="2"/><path d="M80 30v36M62 48h36" stroke="#0f766e" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
};

/**
 * @param {string} hrefOrName
 * @returns {string}
 */
export function normalizeHubCalcId(hrefOrName) {
  let key = String(hrefOrName || '').trim();
  if (!key) return '';
  if (key.includes('/')) {
    try {
      key = new URL(key, 'https://example.com').pathname;
    } catch {
      /* keep key */
    }
    key = key.split('/').pop() || key;
  }
  key = key.split('?')[0].split('#')[0];
  if (!key || key === '_soon') return key;
  // Netlify pretty URLs sirven /calc-gears sin .html; el catálogo usa calc-gears.html
  if (!key.endsWith('.html') && !key.includes('.')) {
    return `${key}.html`;
  }
  return key;
}

/**
 * @param {string} hrefOrName
 * @returns {HubCardArt}
 */
export function getHubCardArt(hrefOrName) {
  const key = normalizeHubCalcId(hrefOrName);
  if (key && HUB_CARD_ART[key]) return HUB_CARD_ART[key];
  return HUB_CARD_ART._default;
}
