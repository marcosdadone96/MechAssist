/**
 * Auditoría completa catálogo — laboratorio, máquinas, hidráulica.
 * node scripts/audit-full-catalog.mjs
 */
import fs from 'fs';

const CATALOG = JSON.parse(fs.readFileSync('config/calc-unlock-catalog.json', 'utf8'));

const FLUID_SLUGS = new Set([
  'calc-hydraulic-pump.html',
  'calc-hydraulic-cylinder.html',
  'calc-hydraulic-press.html',
  'calc-pneumatic-cylinder.html',
]);

const LAB = CATALOG.filter(
  (r) =>
    (r.slug.startsWith('calc-') || r.slug.startsWith('transmission-')) &&
    !FLUID_SLUGS.has(r.slug),
);
const MACHINES = CATALOG.filter((r) =>
  ['flat', 'inclined', 'roller', 'bucket', 'screw', 'traction', 'car-lift', 'centrifugal'].some((p) =>
    r.slug.includes(p),
  ),
);
const FLUIDS = CATALOG.filter((r) => FLUID_SLUGS.has(r.slug));

const navKeys = keysFromFile('js/lab/i18n/homeNavEn.js');
const hubUx = keysFromFile('js/lab/i18n/pages/machineHubUxEn.js');
const fluidsUx = keysFromFile('js/lab/i18n/pages/fluidsHubUxEn.js');

const EN_MAP = {
  'calc-gears.html': ['js/lab/i18n/pages/gearsPageEn.js'],
  'calc-belts.html': ['js/lab/i18n/pages/beltsEn.js'],
  'calc-chains.html': ['js/lab/i18n/pages/chainsEn.js'],
  'calc-bearings.html': ['js/lab/i18n/pages/bearingsPageEn.js'],
  'calc-bearings-catalog.html': ['js/lab/i18n/pages/bearingCatalogEn.js'],
  'calc-shaft.html': ['js/lab/i18n/pages/shaftPageEn.js'],
  'calc-keys-din6885.html': ['js/lab/i18n/pages/keysDinEn.js'],
  'calc-iso-fit.html': ['js/lab/i18n/pages/isoFitPageEn.js'],
  'calc-seeger.html': ['js/lab/i18n/pages/seegerPageEn.js'],
  'calc-couplings.html': ['js/lab/i18n/pages/couplingsEn.js'],
  'calc-bolts-iso898.html': ['js/lab/i18n/pages/boltsIsoEn.js'],
  'calc-gearmotor-inertia.html': ['js/lab/i18n/pages/gearmotorInertiaEn.js'],
  'calc-compression-spring.html': ['js/lab/i18n/pages/compressionSpringEn.js'],
  'calc-hydraulic-cylinder.html': ['js/lab/i18n/pages/hydCylEn.js', 'js/lab/i18n/pages/fluidsHubUxEn.js'],
  'calc-hydraulic-pump.html': ['js/lab/i18n/pages/hydraulicPumpEn.js', 'js/lab/i18n/pages/fluidsHubUxEn.js'],
  'calc-hydraulic-press.html': ['js/lab/i18n/pages/hydraulicPressEn.js', 'js/lab/i18n/pages/fluidsHubUxEn.js'],
  'calc-pneumatic-cylinder.html': ['js/lab/i18n/pages/pneumaticCylEn.js', 'js/lab/i18n/pages/fluidsHubUxEn.js'],
  'flat-conveyor.html': ['js/lab/i18n/pages/flatConvEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'inclined-conveyor.html': ['js/lab/i18n/pages/inclinedConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'roller-conveyor.html': ['js/lab/i18n/pages/rollerConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'bucket-elevator.html': ['js/lab/i18n/pages/bucketElevatorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'screw-conveyor.html': ['js/lab/i18n/pages/screwConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'traction-elevator.html': ['js/lab/i18n/pages/tractionElevatorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'car-lift-screw.html': ['js/lab/i18n/pages/carLiftEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
  'centrifugal-pump.html': ['js/lab/i18n/pages/centrifugalPumpEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'],
};

function keysFromFile(f) {
  if (!fs.existsSync(f)) return new Set();
  const s = fs.readFileSync(f, 'utf8');
  return new Set([...s.matchAll(/'([^']+)':/g)].map((m) => m[1]));
}

function enKeysForSlug(slug) {
  const files = EN_MAP[slug] || [];
  const keys = new Set([...navKeys, ...hubUx, ...fluidsUx]);
  for (const f of files) {
    for (const k of keysFromFile(f)) keys.add(k);
  }
  return keys;
}

function auditHtml(slug, group) {
  const html = fs.readFileSync(slug, 'utf8');
  const enKeys = enKeysForSlug(slug);

  const chips = (html.match(/class="info-chip"/g) || []).length;
  const chipsAttrs = (html.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
  const chipsRuntime = (html.match(/data-te-chip|data-sc-chip/g) || []).length;
  const helps = (html.match(/class="lab-field-help/g) || []).length;
  const helpsI18n = (html.match(/lab-field-help[^>]*data-i18n/g) || []).length;
  const dataI18n = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  const missing = dataI18n.filter((k) => !enKeys.has(k));
  const nextSteps = html.includes('lab-next-steps');
  const diagAria = /diagramSvgAria|diagAriaLabel|data-i18n-attr="aria-label"/.test(html);
  const presets = html.includes('lab-presets-bar') || html.includes('lab-presets-row');
  const hubFm = html.includes('hubFreemium.js');
  const heroI18n = /lab-calc-hero-lead[^>]*data-i18n|heroLead[^>]*data-i18n/.test(html);
  const seoI18n = /calc-seo-intro[^>]*data-i18n|calcSeoIntro/.test(html);

  const issues = [];
  if (missing.length)
    issues.push(
      `missing EN (${missing.length}): ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? '…' : ''}`,
    );
  if (chips > 0 && chipsAttrs < chips && chipsRuntime > 0)
    issues.push(`chips runtime (${chipsRuntime} data-sc/te-chip), no data-i18n-attrs`);
  else if (chips > 0 && chipsAttrs < chips)
    issues.push(`chips sin data-i18n-attrs: ${chips - chipsAttrs}/${chips}`);
  if (helps > 0 && helpsI18n < helps) issues.push(`lab-field-help sin i18n: ${helps - helpsI18n}/${helps}`);
  if (!nextSteps && group !== 'transmission') issues.push('sin lab-next-steps');
  if (!diagAria && (group === 'lab' || group === 'fluids' || group === 'machine'))
    issues.push('diagrama sin aria i18n');
  if (!presets && (group === 'lab' || group === 'fluids')) issues.push('sin presets bar');
  if (!hubFm) issues.push('sin hubFreemium.js');
  if (!heroI18n && group === 'lab') issues.push('hero sin data-i18n');
  if (!seoI18n && group === 'lab') issues.push('seo intro sin data-i18n');

  const score = issues.length === 0 ? 'OK' : issues.length <= 2 ? 'WARN' : 'GAP';
  return { slug, group, score, issues };
}

function auditPageJs(slug) {
  const entries = {
    'flat-conveyor.html': ['js/ui/flatConveyorPage.js'],
    'inclined-conveyor.html': ['js/ui/inclinedConveyorPage.js'],
    'roller-conveyor.html': ['js/ui/rollerConveyorPage.js'],
    'screw-conveyor.html': ['js/ui/screwConveyorPage.js'],
    'traction-elevator.html': ['js/ui/tractionElevatorPage.js'],
    'bucket-elevator.html': ['js/ui/bucketElevatorPage.js'],
    'car-lift-screw.html': ['js/ui/carLiftScrewPage.js'],
    'centrifugal-pump.html': ['js/ui/centrifugalPumpPage.js'],
  };
  const files = entries[slug];
  if (!files) return { reload: false, noReloadOnEs: null };
  let reload = false;
  let noReloadOnEs = null;
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, 'utf8');
    if (s.includes('location.reload')) reload = true;
    if (s.includes('watchLangAndApply')) noReloadOnEs = s.includes('reloadOnEs: false');
  }
  return { reload, noReloadOnEs };
}

console.log('=== AUDITORÍA COMPLETA TheMechAssist ===\n');

const rows = [];
const seen = new Set();

for (const { slug } of LAB) {
  if (seen.has(slug)) continue;
  seen.add(slug);
  const g = slug.startsWith('transmission') ? 'transmission' : 'lab';
  rows.push({ ...auditHtml(slug, g), ...auditPageJs(slug) });
}
for (const { slug } of FLUIDS) {
  if (seen.has(slug)) continue;
  seen.add(slug);
  rows.push({ ...auditHtml(slug, 'fluids'), ...auditPageJs(slug) });
}
for (const { slug } of MACHINES) {
  if (seen.has(slug)) continue;
  seen.add(slug);
  rows.push({ ...auditHtml(slug, 'machine'), ...auditPageJs(slug) });
}

for (const label of ['lab', 'fluids', 'machine', 'transmission']) {
  const list = rows.filter((r) => {
    if (label === 'lab') return LAB.some((x) => x.slug === r.slug) && !r.slug.startsWith('transmission');
    if (label === 'fluids') return FLUIDS.some((x) => x.slug === r.slug);
    if (label === 'machine') return MACHINES.some((x) => x.slug === r.slug);
    return r.slug.startsWith('transmission');
  });
  console.log(`\n## ${label.toUpperCase()} (${list.length})`);
  for (const r of list) {
    const flags = [
      r.reload ? 'RELOAD' : '',
      r.noReloadOnEs === false ? 'sin-reloadOnEs:false' : '',
    ]
      .filter(Boolean)
      .join(' ');
    console.log(`  [${r.score}] ${r.slug}${flags ? ` (${flags})` : ''}`);
    r.issues.forEach((i) => console.log(`      - ${i}`));
  }
}

const gaps = rows.filter((r) => r.score !== 'OK');
console.log(
  `\n=== RESUMEN: ${rows.length} páginas, ${gaps.length} con GAP/WARN, ${rows.filter((r) => r.score === 'OK').length} OK ===`,
);

process.exit(0);
