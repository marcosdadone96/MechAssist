/**
 * Freemium policy: which calculator pages require Pro vs Free.
 * Mùquinas: cinta plana, inclinada y rodillos con cùlculo completo sin Pro; el resto del hub mùquinas es Pro.
 * En esas 3, guardar configuraciùn e informe PDF siguen siendo Pro (ver machineConfigMount, reportPdfExport).
 * Laboratorio (transmission-canvas) sigue en Pro. El resto del sitio no listado aquù se trata como gratis.
 */

/** Mùdulos con cùlculo y acordeones abiertos sin Pro (no aplican `applyMachinePremiumGates` de acordeùn). */
export const FREE_MACHINE_FULL_ACCESS_PATHS = new Set([
  'flat-conveyor.html',
  'inclined-conveyor.html',
  'roller-conveyor.html',
]);

/** Mismas rutas sin extensiÛn (pretty URLs, rewrites). */
const FREE_MACHINE_PATH_SLUGS = new Set(['flat-conveyor', 'inclined-conveyor', 'roller-conveyor']);

/** Calculadoras de m\u00e1quinas Pro (UI restringida v\u00eda `applyMachinePremiumGates`; el lienzo usa su propia UI). */
export const PRO_MACHINE_APP_PATHS = new Set([
  'centrifugal-pump.html',
  'bucket-elevator.html',
  'screw-conveyor.html',
  'traction-elevator.html',
  'car-lift-screw.html',
]);

/** Pro en hubs y badges: m\u00e1quinas Pro + lienzo. */
export const PRO_CALCULATOR_PATHS = new Set([...PRO_MACHINE_APP_PATHS, 'transmission-canvas.html']);

/** Slugs sin extensi\u00f3n (pretty URLs / rewrites), derivados de los mismos conjuntos .html. */
const PRO_MACHINE_APP_SLUGS = new Set(
  [...PRO_MACHINE_APP_PATHS].map((f) => f.replace(/\.html?$/i, '')),
);
const PRO_CALCULATOR_SLUGS = new Set(
  [...PRO_CALCULATOR_PATHS].map((f) => f.replace(/\.html?$/i, '')),
);

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

function pathMatchesSet(file, htmlSet, slugSet) {
  if (htmlSet.has(file)) return true;
  const slug = file.replace(/\.html?$/i, '');
  return slugSet.has(slug);
}

export function isProCalculatorPath(hrefOrPath) {
  return pathMatchesSet(pathToFile(hrefOrPath), PRO_CALCULATOR_PATHS, PRO_CALCULATOR_SLUGS);
}

/**
 * @param {string} hrefOrPath
 * @returns {boolean}
 */
export function isProMachineAppPath(hrefOrPath) {
  return pathMatchesSet(pathToFile(hrefOrPath), PRO_MACHINE_APP_PATHS, PRO_MACHINE_APP_SLUGS);
}

/**
 * Cinta plana, inclinada, rodillos: sin paywall de acordeones (bloques extra).
 * Configuraciùn guardada e informe PDF no dependen de esta funciùn; requieren `isPremiumEffective()`.
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
