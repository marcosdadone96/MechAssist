/**
 * One-click preset button labels (ES in HTML, EN applied on language switch).
 */

/** @type {Record<string, { es: string; en: string; titleEs?: string; titleEn?: string }>} */
const PRESET_BUTTONS = {
  'grain_elevator': {
    es: 'Grano \u00b7 elevador',
    en: 'Wheat \u00b7 elevator',
    titleEs: 'Grano seco, descarga centr\u00edfuga',
    titleEn: 'Dry grain, centrifugal discharge',
  },
  minerals: {
    es: 'Mineral \u00b7 abrasivo',
    en: 'Cement \u00b7 abrasive',
    titleEs: 'Mineral denso, descarga por gravedad',
    titleEn: 'Dense mineral, gravity discharge',
  },
  food_powder: {
    es: 'Polvo \u00b7 alimentaci\u00f3n',
    en: 'Powder \u00b7 food',
    titleEs: 'Polvo fino / alimentaci\u00f3n, \u00d8250 mm, pendiente suave',
    titleEn: 'Fine powder / feed, \u00d8250 mm, gentle incline',
  },
  biomass_chip: {
    es: 'Astilla \u00b7 biomasa',
    en: 'Biomass \u00b7 chips',
    titleEs: 'Astilla o biomasa, \u00d8400 mm, mayor pendiente',
    titleEn: 'Wood chips / biomass, \u00d8400 mm, steeper incline',
  },
  cement_slurry: {
    es: 'Mineral \u00b7 denso',
    en: 'Dense \u00b7 abrasive',
    titleEs: 'Material denso y abrasivo, tornillo grande',
    titleEn: 'Dense abrasive bulk, large screw',
  },
  quarry_short: {
    es: 'Cantera \u00b7 corta',
    en: 'Aggregates \u00b7 short',
    titleEs: 'Cantera, L~35 m, carga variada',
    titleEn: 'Quarry, L~35 m, variable load',
  },
  sand_wet: {
    es: 'Arena \u00b7 h\u00fameda',
    en: 'Wet sand',
    titleEs: 'Arena h\u00fameda, mayor \u03bc y resistencia adicional',
    titleEn: 'Wet sand, higher \u03bc and extra resistance',
  },
  warehouse_feed: {
    es: 'Alimentaci\u00f3n \u00b7 silo',
    en: 'Silo feed',
    titleEs: 'Alimentaci\u00f3n a silo, cinta m\u00e1s corta y ligera',
    titleEn: 'Silo feed, shorter lighter belt',
  },
  ecommerce_line: {
    es: 'E-commerce \u00b7 ligera',
    en: 'E-commerce \u00b7 light',
    titleEs: 'L\u00ednea corta, cajas ligeras, Crr bajo',
    titleEn: 'Short line, light cartons, low Crr',
  },
  pallet_distribution: {
    es: 'Distribuci\u00f3n \u00b7 paleta',
    en: 'Distribution \u00b7 pallet',
    titleEs: 'Paleta EUR, recorrido medio',
    titleEn: 'EUR pallet, medium run',
  },
  heavy_pallet: {
    es: 'Paleta \u00b7 pesada',
    en: 'Pallet \u00b7 heavy',
    titleEs: 'Carga pesada, Crr m\u00e1s alto',
    titleEn: 'Heavy load, higher Crr',
  },
  freight_warehouse: {
    es: 'Montacargas \u00b7 almac\u00e9n',
    en: 'Freight \u00b7 warehouse',
    titleEs: 'Q 2000 kg, 1:1, v 1 m/s',
    titleEn: 'Q 2000 kg, 1:1, v 1 m/s',
  },
  goods_slow: {
    es: 'Mercanc\u00edas \u00b7 2:1',
    en: 'Goods \u00b7 2:1',
    titleEs: 'Mayor carga, 2:1, m\u00e1s lento',
    titleEn: 'Higher load, 2:1, slower',
  },
  workshop_light: {
    es: 'Taller \u00b7 ligero',
    en: 'Workshop \u00b7 light',
    titleEs: 'Taller ligero, Tr 32\u00d76',
    titleEn: 'Light workshop, Tr 32\u00d76',
  },
  workshop_heavy: {
    es: 'Taller \u00b7 pesado',
    en: 'Workshop \u00b7 heavy',
    titleEs: 'Mayor masa, Tr 45\u00d77',
    titleEn: 'Higher mass, Tr 45\u00d77',
  },
  chilled_water: {
    es: 'ACS \u00b7 agua',
    en: 'Water \u00b7 HVAC',
    titleEs: 'ACS / agua glicolada ligera',
    titleEn: 'HVAC / light glycol water',
  },
  process_transfer: {
    es: 'Proceso \u00b7 salmuera',
    en: 'Process \u00b7 transfer',
    titleEs: 'Transferencia industrial, fluido m\u00e1s denso',
    titleEn: 'Industrial transfer, denser fluid',
  },
  viscous_duty: {
    es: 'Aceite \u00b7 viscoso',
    en: 'Oil \u00b7 viscous',
    titleEs: 'Aceite caliente, Q menor, \u03b7 m\u00e1s baja',
    titleEn: 'Hot oil, lower Q, lower \u03b7',
  },
};

/**
 * @param {'es'|'en'} lang
 */
export function applyMachinePresetLabels(lang) {
  const en = lang === 'en';

  document.querySelectorAll('[data-be-preset], [data-screw-preset], [data-inc-preset], [data-roller-preset], [data-te-preset], [data-cl-preset], [data-pump-preset]').forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const id =
      btn.getAttribute('data-be-preset') ||
      btn.getAttribute('data-screw-preset') ||
      btn.getAttribute('data-inc-preset') ||
      btn.getAttribute('data-roller-preset') ||
      btn.getAttribute('data-te-preset') ||
      btn.getAttribute('data-cl-preset') ||
      btn.getAttribute('data-pump-preset');
    if (!id || !PRESET_BUTTONS[id]) return;
    const row = PRESET_BUTTONS[id];
    const name = btn.querySelector('.btn-flat-preset__name');
    if (name) name.textContent = en ? row.en : row.es;
    const title = en ? row.titleEn || row.titleEs : row.titleEs;
    if (title) btn.title = title;
  });

}
