/**
 * Catálogo ilustrativo de motorreductores (datos de ejemplo para la herramienta).
 * No sustituye fichas técnicas del fabricante — validar siempre con el proveedor.
 *
 * Catálogo: filas demo empaquetadas + expansión paramétrica opcional (`gearmotorParametricRegistry.js`, flag `parametricGearmotors`).
 */

import { isFeatureEnabled, FEATURES } from '../config/features.js';
import { PARAMETRIC_REGISTRY } from './gearmotorParametricRegistry.js';
import { expandParametricRegistryToGearmotorModels } from '../modules/gearmotorParametricEngine.js';

/** @type {{ id: string; name: string; region: string }[]} */
export const BRANDS = [
  { id: 'sew', name: 'SEW-Eurodrive', region: 'DE' },
  { id: 'siemens', name: 'Siemens (Simogear)', region: 'DE' },
  { id: 'nord', name: 'Nord Drivesystems', region: 'DE' },
  { id: 'bonfiglioli', name: 'Bonfiglioli', region: 'IT' },
  { id: 'motovario', name: 'Motovario', region: 'IT' },
  { id: 'custom', name: 'Usuario / ficha manual', region: '—' },
];

/**
 * T2_nom: par nominal de uso continuo aprox. en el eje de salida (Nm).
 * T2_peak: par máximo admisible corto tiempo (si no hay dato, = T2_nom * 1.3).
 * n2: rpm salida con motor a ~nominal (4 polos).
 * eta_g: rendimiento aprox. del reductor (solo orientativo).
 */
/** @type {GearmotorModel[]} */
const BUNDLED_RAW = [
  {
    id: 'mv-h-063-71',
    brandId: 'motovario',
    code: 'H 063 / IEC 71 B5 / i≈20',
    series: 'H (helicoidal)',
    motor_kW: 0.55,
    motor_rpm_nom: 1400,
    ratio: 20,
    n2_rpm: 70,
    T2_nom_Nm: 52,
    T2_peak_Nm: 78,
    eta_g: 0.93,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Compacto; cintas ligeras y transportadores cortos.',
  },
  {
    id: 'mv-nmrv050-71',
    brandId: 'motovario',
    code: 'NMRV 050 + IEC 71 / i≈30',
    series: 'NMRV (sinfín-cubo)',
    motor_kW: 0.37,
    motor_rpm_nom: 1400,
    ratio: 30,
    n2_rpm: 46.7,
    T2_nom_Nm: 42,
    T2_peak_Nm: 63,
    eta_g: 0.76,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'NMRV: ratios altos y tamaño reducido; η típica menor que helicoidal. Comprobar temperatura en servicio continuo.',
  },
  {
    id: 'mv-nmrv063-80',
    brandId: 'motovario',
    code: 'NMRV 063 + IEC 80 / i≈40',
    series: 'NMRV (sinfín-cubo)',
    motor_kW: 0.75,
    motor_rpm_nom: 1400,
    ratio: 40,
    n2_rpm: 35,
    T2_nom_Nm: 155,
    T2_peak_Nm: 230,
    eta_g: 0.78,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Muy habitual como primer escalón NMRV en transporte ligero.',
  },
  {
    id: 'mv-nmrv075-90',
    brandId: 'motovario',
    code: 'NMRV 075 + IEC 90 / i≈50',
    series: 'NMRV (sinfín-cubo)',
    motor_kW: 1.5,
    motor_rpm_nom: 1400,
    ratio: 50,
    n2_rpm: 28,
    T2_nom_Nm: 395,
    T2_peak_Nm: 590,
    eta_g: 0.79,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Equilibrio coste-compacidad; validar par pico en arranques frecuentes.',
  },
  {
    id: 'mv-nmrv090-100',
    brandId: 'motovario',
    code: 'NMRV 090 + IEC 100 / i≈60',
    series: 'NMRV (sinfín-cubo)',
    motor_kW: 2.2,
    motor_rpm_nom: 1400,
    ratio: 60,
    n2_rpm: 23.3,
    T2_nom_Nm: 640,
    T2_peak_Nm: 960,
    eta_g: 0.8,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'NMRV mayor tamaño; aún sinfín — no confundir rendimiento con gama H.',
  },
  {
    id: 'mv-h-083-90',
    brandId: 'motovario',
    code: 'H 083 / IEC 90 / i≈30',
    series: 'H (helicoidal)',
    motor_kW: 1.5,
    motor_rpm_nom: 1420,
    ratio: 29.3,
    n2_rpm: 48.5,
    T2_nom_Nm: 220,
    T2_peak_Nm: 330,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Muy habitual en bandas alimentación / paquetería.',
  },
  {
    id: 'mv-ha-102-112',
    brandId: 'motovario',
    code: 'HA 102 / IEC 112 / i≈40',
    series: 'HA (helicoidal-alto par)',
    motor_kW: 4.0,
    motor_rpm_nom: 1440,
    ratio: 40,
    n2_rpm: 36,
    T2_nom_Nm: 820,
    T2_peak_Nm: 1200,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Inclinaciones medias o cargas altas con baja velocidad de giro en tambor.',
  },
  {
    id: 'sew-r47-90l',
    brandId: 'sew',
    code: 'R47 DRN90L4 BE2 / i≈29',
    series: 'R (helicoidal)',
    motor_kW: 1.5,
    motor_rpm_nom: 1455,
    ratio: 28.87,
    n2_rpm: 50.4,
    T2_nom_Nm: 265,
    T2_peak_Nm: 400,
    eta_g: 0.95,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Línea R muy usada en transporte general.',
  },
  {
    id: 'sew-k87-132s',
    brandId: 'sew',
    code: 'K87 DRN132S4 / i≈40',
    series: 'K (cónico-helicoidal)',
    motor_kW: 5.5,
    motor_rpm_nom: 1460,
    ratio: 40.3,
    n2_rpm: 36.2,
    T2_nom_Nm: 1100,
    T2_peak_Nm: 1650,
    eta_g: 0.95,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Mayor capacidad que R; buena para inclinación y arranques exigentes.',
  },
  {
    id: 'sew-f67-100l',
    brandId: 'sew',
    code: 'F67 DRN100L4 / i≈24',
    series: 'F (eje paralelo)',
    motor_kW: 3.0,
    motor_rpm_nom: 1450,
    ratio: 24.1,
    n2_rpm: 60.2,
    T2_nom_Nm: 360,
    T2_peak_Nm: 540,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Montaje paralelo al eje de tambor; compruebe alineación.',
  },
  {
    id: 'sie-d28-80',
    brandId: 'siemens',
    code: 'SIMOGEAR D28 + 0.55 kW IE3',
    series: 'D (helicoidal coaxial)',
    motor_kW: 0.55,
    motor_rpm_nom: 1390,
    ratio: 18.5,
    n2_rpm: 75,
    T2_nom_Nm: 48,
    T2_peak_Nm: 72,
    eta_g: 0.93,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Coaxial compacto; revisar longitud total en gabinete.',
  },
  {
    id: 'sie-d48-112',
    brandId: 'siemens',
    code: 'SIMOGEAR D48 + 4 kW IE3',
    series: 'D (helicoidal coaxial)',
    motor_kW: 4.0,
    motor_rpm_nom: 1445,
    ratio: 35.5,
    n2_rpm: 40.7,
    T2_nom_Nm: 780,
    T2_peak_Nm: 1170,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Alternativa directa a muchos H / R de gama media.',
  },
  {
    id: 'sie-e39-90',
    brandId: 'siemens',
    code: 'SIMOGEAR E39 + 1.1 kW IE3',
    series: 'E (helicoidal)',
    motor_kW: 1.1,
    motor_rpm_nom: 1420,
    ratio: 32,
    n2_rpm: 44.4,
    T2_nom_Nm: 180,
    T2_peak_Nm: 270,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Eje paralelo; comprobar altura de centro.',
  },
  {
    id: 'nord-sk1s-71',
    brandId: 'nord',
    code: 'SK 1S50 / IEC 71 / i≈22',
    series: 'UNICASE SK 1S',
    motor_kW: 0.75,
    motor_rpm_nom: 1410,
    ratio: 22.4,
    n2_rpm: 63,
    T2_nom_Nm: 85,
    T2_peak_Nm: 128,
    eta_g: 0.93,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Carcasa UNICASE; buena robustez en entorno industrial.',
  },
  {
    id: 'nord-sk3s-100',
    brandId: 'nord',
    code: 'SK 3S100 / IEC 100 / i≈35',
    series: 'UNICASE SK 3S',
    motor_kW: 3.0,
    motor_rpm_nom: 1450,
    ratio: 35.2,
    n2_rpm: 41.2,
    T2_nom_Nm: 520,
    T2_peak_Nm: 780,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Helicoidal-bevel; adecuado cuando hay desvío de eje.',
  },
  {
    id: 'nord-sk4s-132',
    brandId: 'nord',
    code: 'SK 4S132 / IEC 132 / i≈45',
    series: 'UNICASE SK 4S',
    motor_kW: 7.5,
    motor_rpm_nom: 1465,
    ratio: 45.1,
    n2_rpm: 32.5,
    T2_nom_Nm: 1650,
    T2_peak_Nm: 2400,
    eta_g: 0.95,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Gama alta para inclinaciones fuertes o arranques frecuentes.',
  },
  {
    id: 'bon-vf63-80',
    brandId: 'bonfiglioli',
    code: 'VF 63 + IEC 80 / i≈30',
    series: 'VF (sinfín-cubo)',
    motor_kW: 0.75,
    motor_rpm_nom: 1400,
    ratio: 30,
    n2_rpm: 46.7,
    T2_nom_Nm: 125,
    T2_peak_Nm: 188,
    eta_g: 0.78,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Datos ilustrativos — confirme con catálogo Bonfiglioli (VF/W).',
  },
  {
    id: 'bon-a20-90',
    brandId: 'bonfiglioli',
    code: 'A 20 + IEC 90 / i≈28',
    series: 'A (helicoidal)',
    motor_kW: 1.5,
    motor_rpm_nom: 1440,
    ratio: 28,
    n2_rpm: 51.4,
    T2_nom_Nm: 235,
    T2_peak_Nm: 350,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Línea A coaxial/helicoidal; alternativa típica a R/D de otras marcas.',
  },
  {
    id: 'bon-a35-112',
    brandId: 'bonfiglioli',
    code: 'A 35 + IEC 112 / i≈40',
    series: 'A (helicoidal)',
    motor_kW: 4.0,
    motor_rpm_nom: 1450,
    ratio: 40,
    n2_rpm: 36.25,
    T2_nom_Nm: 820,
    T2_peak_Nm: 1230,
    eta_g: 0.94,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'Gama media-alta para transporte con par sostenido.',
  },
  {
    id: 'bon-ta35-112',
    brandId: 'bonfiglioli',
    code: 'TA 35 + IEC 112 / i≈35',
    series: 'TA (montaje eje hueco / rodillo)',
    motor_kW: 4.0,
    motor_rpm_nom: 1450,
    ratio: 35,
    n2_rpm: 41.4,
    T2_nom_Nm: 780,
    T2_peak_Nm: 1170,
    eta_g: 0.93,
    enclosure: 'IP55',
    duty: 'S1',
    notes: 'TA habitual en accionamiento de tambor; valide HDR y rodamientos con Bonfiglioli.',
  },
];

/**
 * Montaje IEC / eje de salida (catálogo demo — variantes reales según pedido).
 * @type {Record<string, { mountingTypes: Array<'B3'|'B5'|'B14'|'hollowShaft'>; flangeLabel: string; shaftConfigLabel: string; outputShaft: { kind: 'solid' | 'hollow'; nominalDiameter_mm: number } }>}
 */
const MOUNT_PROFILES = {
  'mv-h-063-71': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'IEC 71 — brida B5 o patas B3',
    shaftConfigLabel: 'Eje cilíndrico salida reductor',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 20 },
  },
  'mv-nmrv050-71': {
    mountingTypes: ['B3', 'B5', 'B14'],
    flangeLabel: 'Brida B5 / B14 en cubo + patas opcionales',
    shaftConfigLabel: 'Eje salida sinfín-cubo',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 18 },
  },
  'mv-nmrv063-80': {
    mountingTypes: ['B3', 'B5', 'B14'],
    flangeLabel: 'Brida B5 / B14 + patas B3 habituales',
    shaftConfigLabel: 'Eje salida sinfín-cubo',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 25 },
  },
  'mv-nmrv075-90': {
    mountingTypes: ['B3', 'B5', 'B14'],
    flangeLabel: 'Brida B5 / B14 + patas B3',
    shaftConfigLabel: 'Eje salida sinfín-cubo',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 28 },
  },
  'mv-nmrv090-100': {
    mountingTypes: ['B3', 'B5', 'B14'],
    flangeLabel: 'Brida B5 / B14 + patas B3',
    shaftConfigLabel: 'Eje salida sinfín-cubo',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 35 },
  },
  'mv-h-083-90': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'IEC 90 — B5 / B3',
    shaftConfigLabel: 'Eje cilíndrico salida',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 28 },
  },
  'mv-ha-102-112': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'IEC 112 — B5 / B3',
    shaftConfigLabel: 'Eje cilíndrico salida (alto par)',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 40 },
  },
  'sew-r47-90l': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'Pie B3 o brida B5 (según versión)',
    shaftConfigLabel: 'Eje paralelo salida',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 28 },
  },
  'sew-k87-132s': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'Pie B3 / brida B5 coaxial',
    shaftConfigLabel: 'Eje salida cónico-helicoidal',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 45 },
  },
  'sew-f67-100l': {
    mountingTypes: ['B3'],
    flangeLabel: 'Principalmente patas B3 (eje paralelo)',
    shaftConfigLabel: 'Eje paralelo a motor',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 32 },
  },
  'sie-d28-80': {
    mountingTypes: ['B5', 'B14'],
    flangeLabel: 'Coaxial — B5 / B14 compacta',
    shaftConfigLabel: 'Eje en línea (coaxial)',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 25 },
  },
  'sie-d48-112': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'B5 coaxial o versión con patas',
    shaftConfigLabel: 'Eje en línea',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 40 },
  },
  'sie-e39-90': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'B3 / B5 eje paralelo',
    shaftConfigLabel: 'Eje cilíndrico salida',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 28 },
  },
  'nord-sk1s-71': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'UNICASE — B3 / B5',
    shaftConfigLabel: 'Eje salida integrado',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 20 },
  },
  'nord-sk3s-100': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'UNICASE — B3 / B5',
    shaftConfigLabel: 'Eje salida bevel-helicoidal',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 32 },
  },
  'nord-sk4s-132': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'UNICASE — B3 / B5',
    shaftConfigLabel: 'Eje salida',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 45 },
  },
  'bon-vf63-80': {
    mountingTypes: ['B3', 'B5', 'B14'],
    flangeLabel: 'VF — B5 / B14 + patas',
    shaftConfigLabel: 'Eje salida sinfín-cubo',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 25 },
  },
  'bon-a20-90': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'A — B3 / B5',
    shaftConfigLabel: 'Eje helicoidal/coaxial según etapa',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 28 },
  },
  'bon-a35-112': {
    mountingTypes: ['B3', 'B5'],
    flangeLabel: 'A — B3 / B5',
    shaftConfigLabel: 'Eje salida',
    outputShaft: { kind: 'solid', nominalDiameter_mm: 40 },
  },
  'bon-ta35-112': {
    mountingTypes: ['hollowShaft'],
    flangeLabel: 'TA — fijación sobre eje máquina (eje hueco)',
    shaftConfigLabel: 'Salida hueca sobre eje tambor / árbol (demo Ø nominal)',
    outputShaft: { kind: 'hollow', nominalDiameter_mm: 60 },
  },
};

/** Catálogo demo con perfiles de montaje aplicados (inmutable en runtime). */
export const BUNDLED_GEARMODELS = BUNDLED_RAW.map((m) => ({ ...m }));

for (const m of BUNDLED_GEARMODELS) {
  const x = MOUNT_PROFILES[m.id];
  if (x) Object.assign(m, x);
}

/** @type {GearmotorModel[] | null} */
let __parametricGearmotorCache = null;

function getParametricModelsLayer() {
  if (!isFeatureEnabled('parametricGearmotors')) return [];
  if (__parametricGearmotorCache) return __parametricGearmotorCache;
  const cap = Number(FEATURES.parametricGearmotorMaxModels);
  __parametricGearmotorCache = expandParametricRegistryToGearmotorModels(PARAMETRIC_REGISTRY, {
    maxModels: Number.isFinite(cap) && cap > 0 ? cap : 8000,
  });
  return __parametricGearmotorCache;
}

/**
 * Invalida la expansión paramétrica (p. ej. tras cambiar el registro en caliente en desarrollo).
 */
export function invalidateParametricGearmotorCache() {
  __parametricGearmotorCache = null;
}

/**
 * Añade filas generadas desde el registro paramétrico sin sobrescribir ids ya presentes en el demo.
 * @param {GearmotorModel[]} baseList
 */
function mergeParametricIntoCatalog(baseList) {
  const extra = getParametricModelsLayer();
  if (!extra.length) return baseList;
  const map = new Map(baseList.map((m) => [m.id, m]));
  for (const m of extra) {
    if (!map.has(m.id)) map.set(m.id, m);
  }
  return Array.from(map.values());
}

/**
 * Lista activa para recomendaciones y comprobador.
 * @returns {GearmotorModel[]}
 */
export function getGearmodels() {
  return mergeParametricIntoCatalog([...BUNDLED_GEARMODELS]);
}

/**
 * Portales oficiales de descargas / documentación (cuando el modelo no define `datasheetUrl`).
 * Suelen incluir PDF de catálogo o enlaces a fichas por referencia.
 */
export const BRAND_DATASHEET_PORTAL = Object.freeze({
  sew: 'https://download.sew-eurodrive.com/',
  siemens: 'https://support.industry.siemens.com/cs/document/109479103/simogear-documentation?dti=0&lc=en-WW',
  nord: 'https://www.nord.com/en/support/downloads.php',
  bonfiglioli: 'https://www.bonfiglioli.com/en/downloads',
  motovario: 'https://www.motovario.com/en/downloads',
});

/**
 * @param {{ brandId: string; code?: string; datasheetUrl?: string }} m
 * @returns {string}
 */
export function getModelDatasheetUrl(m) {
  if (m.datasheetUrl && typeof m.datasheetUrl === 'string') return m.datasheetUrl;
  const portal = BRAND_DATASHEET_PORTAL[m.brandId];
  if (portal) return portal;
  return `https://www.google.com/search?q=${encodeURIComponent(String(m.code || m.brandId) + ' PDF datasheet')}`;
}

/**
 * @param {string} brandId
 * @returns {GearmotorModel[]}
 */
export function modelsForBrand(brandId) {
  return getGearmodels().filter((m) => m.brandId === brandId);
}

/**
 * Busca modelos por texto libre (código o serie).
 * @param {string} brandId
 * @param {string} query
 */
export function searchModels(brandId, query) {
  const q = query.trim().toLowerCase();
  const list = modelsForBrand(brandId);
  if (!q) return list;
  return list.filter(
    (m) =>
      m.code.toLowerCase().includes(q) ||
      m.series.toLowerCase().includes(q) ||
      m.id.includes(q),
  );
}

/**
 * @param {string} modelId
 * @returns {GearmotorModel | undefined}
 */
export function getModelById(modelId) {
  return getGearmodels().find((m) => m.id === modelId);
}
