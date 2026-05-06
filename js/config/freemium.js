/**
 * Freemium policy: which calculator pages require Pro vs Free.
 * Mùquinas: cinta plana, inclinada y rodillos gratis; el resto del hub mùquinas es Pro.
 * Laboratorio (transmission-canvas) sigue en Pro. El resto del sitio no listado aquù se trata como gratis.
 */

/** Mùdulos de mùquinas con acceso completo sin Pro (sin bloqueo de acordeones). */
export const FREE_MACHINE_FULL_ACCESS_PATHS = new Set([
  'flat-conveyor.html',
  'inclined-conveyor.html',
  'roller-conveyor.html',
]);

/** Mismas rutas sin extensiùn (pretty URLs, rewrites). */
const FREE_MACHINE_PATH_SLUGS = new Set(['flat-conveyor', 'inclined-conveyor', 'roller-conveyor']);

/** Calculadoras de m\u00e1quinas con paywall de app (el lienzo usa su propia UI). */
export const PRO_MACHINE_APP_PATHS = new Set([
  'centrifugal-pump.html',
  'bucket-elevator.html',
  'screw-conveyor.html',
  'traction-elevator.html',
  'car-lift-screw.html',
]);

/** Pro en hubs y badges: m\u00e1quinas Pro + lienzo. */
export const PRO_CALCULATOR_PATHS = new Set([...PRO_MACHINE_APP_PATHS, 'transmission-canvas.html']);

/**
 * @param {string} hrefOrPath filename or full URL/path ending in .html
 * @returns {boolean}
 */
function pathToFile(hrefOrPath) {
  if (!hrefOrPath) return '';
  const clean = String(hrefOrPath).split('?')[0].split('#')[0].replace(/\\/g, '/');
  const parts = clean.split('/').filter((s) => s.length > 0);
  const last = parts.length ? parts[parts.length - 1] : '';
  return last || clean;
}

export function isProCalculatorPath(hrefOrPath) {
  return PRO_CALCULATOR_PATHS.has(pathToFile(hrefOrPath));
}

/**
 * @param {string} hrefOrPath
 * @returns {boolean}
 */
export function isProMachineAppPath(hrefOrPath) {
  return PRO_MACHINE_APP_PATHS.has(pathToFile(hrefOrPath));
}

/**
 * Cinta plana y rodillos: sin paywall de acordeones ni (en UI) PDF/config como Pro.
 * Acepta pathname, URL completa o se evalùa `window.location` si existe.
 *
 * @param {string} [hrefOrPath]
 * @returns {boolean}
 */
export function isFreeMachineFullAccess(hrefOrPath) {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      const tool = document.documentElement.getAttribute('data-conveyor-tool');
      if (tool === 'flat' || tool === 'inclined' || tool === 'roller') return true;
    }
  } catch (_) {
    /* ignore */
  }

  /** @type {string[]} */
  const candidates = [];
  if (hrefOrPath) candidates.push(String(hrefOrPath));
  try {
    if (typeof window !== 'undefined' && window.location) {
      candidates.push(window.location.pathname || '', window.location.href || '');
    }
  } catch (_) {
    /* ignore */
  }
  for (const raw of candidates) {
    if (!raw) continue;
    const file = pathToFile(raw);
    if (FREE_MACHINE_FULL_ACCESS_PATHS.has(file)) return true;
    const slug = file.replace(/\.html?$/i, '');
    if (FREE_MACHINE_PATH_SLUGS.has(slug)) return true;
  }
  return false;
}

/** Pro-only capability labels (for pricing / marketing copy keys only). */
export const PRO_CAPABILITY_KEYS = Object.freeze([
  'exportPdfExcel',
  'savedProjects',
  'history',
  'noDailyLimits',
  'premiumCalcs',
  'prioritySupport',
]);
