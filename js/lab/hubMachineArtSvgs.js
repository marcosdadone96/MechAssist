/**
 * Hub card illustrations for machine calculators.
 * viewBox 200x130: drawing area y 14-104, caption strip y 106-124 (ASCII labels only).
 */

const VB = '0 0 200 130';

/** @param {string} label */
function cap(label) {
  return `<rect x="0" y="104" width="200" height="26" fill="#fff7ed"/>
    <line x1="10" y1="104" x2="190" y2="104" stroke="#fdba74" stroke-width="1"/>
    <text x="100" y="120" text-anchor="middle" fill="#9a3412" font-size="9" font-weight="600" font-family="system-ui,sans-serif">${label}</text>`;
}

/** @type {Record<string, string>} */
export const HUB_MACHINE_ART_SVG = {
  'centrifugal-pump.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <path d="M44 78 Q44 36 96 36 Q148 36 148 54 L174 54 L174 72 L148 72 Q148 96 96 96 Q44 96 44 78Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
    <circle cx="96" cy="64" r="20" fill="#7dd3fc" stroke="#0369a1" stroke-width="2"/>
    <path d="M96 64 L96 46 M96 64 L114 64 M96 64 L78 64 M96 64 L108 50 M96 64 L84 50" stroke="#0c4a6e" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="84" y="90" width="26" height="12" rx="2" fill="#94a3b8" stroke="#475569"/>
    <path d="M174 48 L194 64 L174 80 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
    ${cap('Bomba - Q - H')}
  </svg>`,

  'flat-conveyor.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <rect x="12" y="78" width="176" height="8" fill="#cbd5e1"/>
    <circle cx="38" cy="72" r="16" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
    <circle cx="162" cy="72" r="13" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
    <path d="M54 56 L146 56" stroke="#1e3a8a" stroke-width="5" stroke-linecap="round"/>
    <path d="M54 66 L146 66" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>
    <rect x="72" y="40" width="28" height="16" rx="2" fill="#d97706" stroke="#b45309"/>
    <rect x="104" y="42" width="22" height="14" rx="2" fill="#f59e0b" stroke="#b45309"/>
    ${cap('Cinta plana - tambores')}
  </svg>`,

  'roller-conveyor.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <path d="M10 72 L190 72" stroke="#64748b" stroke-width="3"/>
    <circle cx="34" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <circle cx="62" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <circle cx="90" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <circle cx="118" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <circle cx="146" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <circle cx="174" cy="68" r="9" fill="#334155" stroke="#0f172a"/>
    <rect x="48" y="42" width="84" height="20" rx="2" fill="#d97706" stroke="#b45309"/>
    <rect x="54" y="36" width="20" height="10" rx="1" fill="#fbbf24" stroke="#d97706"/>
    <rect x="80" y="38" width="18" height="9" rx="1" fill="#fbbf24" stroke="#d97706"/>
    ${cap('Rodillos - palet')}
  </svg>`,

  'inclined-conveyor.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <line x1="16" y1="92" x2="184" y2="92" stroke="#94a3b8" stroke-width="2"/>
    <path d="M36 92 L36 52 L148 36 L148 92 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.2"/>
    <path d="M58 78 L132 42 L132 52 L58 88 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1.5"/>
    <path d="M58 88 L132 52 L132 62 L58 98 Z" fill="#60a5fa" stroke="#3b82f6" stroke-width="1"/>
    <circle cx="44" cy="84" r="14" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
    <circle cx="140" cy="44" r="12" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
    <rect x="88" y="48" width="26" height="16" rx="2" fill="#d97706" stroke="#b45309" transform="rotate(-18 101 56)"/>
    <path d="M44 84 L44 68 A18 18 0 0 1 58 58" fill="none" stroke="#0f766e" stroke-width="1.5"/>
    <text x="50" y="66" fill="#0f766e" font-size="10" font-weight="700" font-family="system-ui,sans-serif">A</text>
    ${cap('Cinta inclinada - H - L')}
  </svg>`,

  'bucket-elevator.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <rect x="64" y="18" width="72" height="8" rx="2" fill="#64748b"/>
    <circle cx="100" cy="22" r="12" fill="#475569" stroke="#1e293b" stroke-width="2"/>
    <rect x="64" y="88" width="72" height="8" rx="2" fill="#64748b"/>
    <circle cx="100" cy="94" r="10" fill="#64748b" stroke="#334155" stroke-width="2"/>
    <path d="M84 30 L84 86" stroke="#1e40af" stroke-width="3"/>
    <path d="M116 30 L116 86" stroke="#93c5fd" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M86 34 L112 34 L110 44 L88 44 Z M86 48 L112 48 L110 58 L88 58 Z M86 62 L112 62 L110 72 L88 72 Z M86 76 L112 76 L110 86 L88 86 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/>
    <path d="M124 40 L124 52" stroke="#0d9488" stroke-width="2"/>
    <polygon points="124,52 118,48 118,56" fill="#0d9488"/>
    ${cap('Cangilones - vertical')}
  </svg>`,

  'screw-conveyor.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
  <!-- canal U -->
    <path d="M22 72 L178 72 L178 88 L22 88 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.8"/>
    <path d="M22 72 L178 72" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M22 88 L178 88" stroke="#1e3a5f" stroke-width="2" stroke-linecap="round"/>
  <!-- material -->
    <path d="M30 82 L170 82" stroke="#d97706" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
  <!-- eje -->
    <line x1="28" y1="80" x2="172" y2="80" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
  <!-- palas helicoidales -->
    <g stroke="#0d9488" stroke-width="2" fill="none">
      <ellipse cx="48" cy="80" rx="14" ry="6"/><ellipse cx="72" cy="80" rx="14" ry="6"/>
      <ellipse cx="96" cy="80" rx="14" ry="6"/><ellipse cx="120" cy="80" rx="14" ry="6"/>
      <ellipse cx="144" cy="80" rx="14" ry="6"/><ellipse cx="168" cy="80" rx="14" ry="6"/>
    </g>
    <circle cx="28" cy="80" r="10" fill="#134e4a" fill-opacity="0.3" stroke="#0f766e" stroke-width="2"/>
    <circle cx="172" cy="80" r="8" fill="#134e4a" fill-opacity="0.3" stroke="#0f766e" stroke-width="2"/>
  <!-- tolva entrada -->
    <path d="M14 58 L14 72 L26 72 L26 64 Z" fill="#94a3b8" stroke="#475569"/>
    <path d="M178 76 L196 76" stroke="#0d9488" stroke-width="2"/>
    <polygon points="196,76 190,72 190,80" fill="#0d9488"/>
    ${cap('Tornillo - canal - Q')}
  </svg>`,

  'traction-elevator.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
  <!-- hueco -->
    <rect x="36" y="20" width="128" height="78" rx="3" fill="#e8edf4" stroke="#64748b" stroke-width="1.5"/>
    <line x1="72" y1="26" x2="72" y2="94" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="128" y1="26" x2="128" y2="94" stroke="#cbd5e1" stroke-width="1"/>
  <!-- sala maquinas + polea -->
    <rect x="88" y="8" width="44" height="14" rx="2" fill="#94a3b8" stroke="#475569"/>
    <circle cx="110" cy="28" r="13" fill="#bae6fd" stroke="#0369a1" stroke-width="2"/>
    <circle cx="110" cy="28" r="5" fill="none" stroke="#0369a1" stroke-width="1"/>
    <path d="M97 28 L70 58" stroke="#334155" stroke-width="2"/>
    <path d="M123 28 L132 38" stroke="#475569" stroke-width="2"/>
    <path d="M97 28 A13 13 0 0 1 123 28" fill="none" stroke="#1e3a5f" stroke-width="1.8"/>
    <rect x="52" y="58" width="36" height="32" rx="2" fill="#0d9488" stroke="#0f766e" stroke-width="1.8"/>
    <line x1="60" y1="66" x2="80" y2="66" stroke="#ecfdf5" stroke-width="1.2"/>
    <line x1="60" y1="74" x2="80" y2="74" stroke="#ecfdf5" stroke-width="1.2"/>
  <!-- contrapeso (arriba derecha) -->
    <rect x="118" y="38" width="28" height="28" rx="2" fill="#78716c" stroke="#57534e" stroke-width="1.8"/>
    <path d="M70 58 L70 48" stroke="#0d9488" stroke-width="1.5" marker-end="none"/>
    <polygon points="70,48 66,52 74,52" fill="#0d9488"/>
    <path d="M132 66 L132 74" stroke="#b45309" stroke-width="1.5"/>
    <polygon points="132,74 128,70 136,70" fill="#b45309"/>
    ${cap('Cabina - contrapeso - polea')}
  </svg>`,

  'car-lift-screw.html': `<svg viewBox="${VB}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="200" height="104" fill="#fff7ed"/>
    <rect x="32" y="54" width="136" height="10" rx="2" fill="#64748b" stroke="#334155" stroke-width="2"/>
    <rect x="44" y="34" width="112" height="22" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
    <rect x="54" y="38" width="92" height="14" rx="2" fill="#cbd5e1"/>
    <rect x="50" y="64" width="9" height="28" fill="#f1f5f9" stroke="#64748b"/>
    <rect x="141" y="64" width="9" height="28" fill="#f1f5f9" stroke="#64748b"/>
    <line x1="54" y1="64" x2="54" y2="30" stroke="#475569" stroke-width="3"/>
    <line x1="58" y1="64" x2="58" y2="30" stroke="#475569" stroke-width="3"/>
    <line x1="145" y1="64" x2="145" y2="30" stroke="#475569" stroke-width="3"/>
    <line x1="149" y1="64" x2="149" y2="30" stroke="#475569" stroke-width="3"/>
    <path d="M54 30c0-3 2-5 4-5s4 2 4 5M145 30c0-3 2-5 4-5s4 2 4 5" stroke="#d97706" stroke-width="2" fill="none"/>
    ${cap('Vehiculo - tornillos')}
  </svg>`,
};
