import fs from 'fs';

/** Lab transmission calculators — HTML + matching *En.js bundle. */
const pages = [
  { html: 'calc-seeger.html', en: 'js/lab/i18n/pages/seegerPageEn.js' },
  { html: 'calc-shaft.html', en: 'js/lab/i18n/pages/shaftPageEn.js' },
  { html: 'calc-gears.html', en: 'js/lab/i18n/pages/gearsPageEn.js' },
  { html: 'calc-worm-gear.html', en: 'js/lab/i18n/pages/wormGearPageEn.js' },
  { html: 'calc-fatigue.html', en: 'js/lab/i18n/pages/fatiguePageEn.js' },
  { html: 'calc-couplings.html', en: 'js/lab/i18n/pages/couplingsEn.js' },
  { html: 'calc-bearings.html', en: 'js/lab/i18n/pages/bearingsPageEn.js' },
  { html: 'calc-bearings-catalog.html', en: 'js/lab/i18n/pages/bearingCatalogEn.js' },
  { html: 'calc-belts.html', en: 'js/lab/i18n/pages/beltsEn.js' },
  { html: 'calc-chains.html', en: 'js/lab/i18n/pages/chainsEn.js' },
  { html: 'calc-bolts-iso898.html', en: 'js/lab/i18n/pages/boltsIsoEn.js' },
  { html: 'calc-bolt-shear.html', en: 'js/lab/i18n/pages/boltShearPageEn.js' },
  { html: 'calc-keys-din6885.html', en: 'js/lab/i18n/pages/keysDinEn.js' },
  { html: 'calc-iso-fit.html', en: 'js/lab/i18n/pages/isoFitPageEn.js' },
  { html: 'calc-gearmotor-inertia.html', en: 'js/lab/i18n/pages/gearmotorInertiaEn.js' },
  { html: 'calc-compression-spring.html', en: 'js/lab/i18n/pages/compressionSpringEn.js' },
  { html: 'calc-beam.html', en: 'js/lab/i18n/pages/beamPageEn.js' },
  { html: 'calc-power-screw.html', en: 'js/lab/i18n/pages/powerScrewPageEn.js' },
  { html: 'calc-weld-joint.html', en: 'js/lab/i18n/pages/weldJointPageEn.js' },
  { html: 'calc-hydraulic-pump.html', en: 'js/lab/i18n/pages/hydraulicPumpEn.js' },
];

const navSrc = fs.readFileSync('js/lab/i18n/homeNavEn.js', 'utf8');
const navKeys = new Set([...navSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const fluidsUxSrc = fs.readFileSync('js/lab/i18n/pages/fluidsHubUxEn.js', 'utf8');
const fluidsUxKeys = new Set([...fluidsUxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));

/** Dynamic calc-mode help blocks: inner lines carry data-*-mode + data-i18n. */
function isExemptModeHelp(htmlSrc, tagHtml) {
  const modePairs = [
    { cls: 'lab-field-help--gear-modes', attr: 'data-gear-mode' },
    { cls: 'lab-field-help--bolt-modes', attr: 'data-bolt-mode' },
    { cls: 'lab-field-help--hp-modes', attr: 'data-hp-mode' },
    { cls: 'lab-field-help--hc-modes', attr: 'data-hc-mode' },
    { cls: 'lab-field-help--hpress-modes', attr: 'data-hpress-mode' },
    { cls: 'lab-field-help--worm-modes', attr: 'data-worm-mode' },
    { cls: 'lab-field-help--fatigue-modes', attr: 'data-fatigue-mode' },
  ];
  return modePairs.some(
    ({ cls, attr }) => tagHtml.includes(cls) && htmlSrc.includes(attr),
  );
}

let failed = false;
let warnCount = 0;

for (const { html, en } of pages) {
  const htmlSrc = fs.readFileSync(html, 'utf8');
  const enSrc = fs.readFileSync(en, 'utf8');
  const keys = new Set([
    ...[...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
    ...navKeys,
    ...(html === 'calc-hydraulic-pump.html' ? fluidsUxKeys : []),
  ]);
  const dataI18n = [...htmlSrc.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  const missing = dataI18n.filter((k) => !keys.has(k));
  const helpsBare = [...htmlSrc.matchAll(/<(?:p|div)[^>]*class="[^"]*lab-field-help[^"]*"[^>]*>/g)].filter((m) => {
    if (m[0].includes('data-i18n')) return false;
    if (html === 'calc-shaft.html' && /\bid="sh(T|AvailableD)Help"/.test(m[0])) return false;
    if (isExemptModeHelp(htmlSrc, m[0])) return false;
    return true;
  }).length;
  const nextSteps = htmlSrc.includes('lab-next-steps');
  const hasSeoIntro = htmlSrc.includes('calc-seo-intro');
  const seoIntroI18n =
    /<p class="calc-seo-intro"[^>]*data-i18n=/.test(htmlSrc) ||
    /class="calc-seo-intro"[^>]*data-i18n=/.test(htmlSrc);

  console.log(`\n${html}`);
  console.log(`  data-i18n: ${dataI18n.length}, missing EN: ${missing.length ? missing.join(', ') : 'none'}`);
  if (helpsBare > 0) {
    console.warn(`  WARN lab-field-help without data-i18n: ${helpsBare}`);
    warnCount += helpsBare;
  } else {
    console.log('  lab-field-help without data-i18n: 0');
  }
  console.log(`  lab-next-steps: ${nextSteps ? 'yes' : 'MISSING'}`);
  console.log(`  calc-seo-intro i18n: ${hasSeoIntro ? (seoIntroI18n ? 'yes' : 'MISSING') : 'n/a'}`);

  if (missing.length) failed = true;
  if (!nextSteps) failed = true;
  if (hasSeoIntro && !seoIntroI18n) failed = true;
}

const gearsHelp = fs.readFileSync('calc-gears.html', 'utf8');
const gMode = gearsHelp.includes('gear.helpCalcModeDesignHtml') && gearsHelp.includes('gear.helpCalcModeDiagnosticHtml');
console.log(`\ncalc-gears.html gCalcModeHelp keys: ${gMode ? 'yes' : 'MISSING'}`);
if (!gMode) failed = true;

const wormHelp = fs.readFileSync('calc-worm-gear.html', 'utf8');
const wMode = wormHelp.includes('worm.helpCalcModeDesignHtml') && wormHelp.includes('worm.helpCalcModeDiagnosticHtml');
console.log(`calc-worm-gear.html wgCalcModeHelp keys: ${wMode ? 'yes' : 'MISSING'}`);
if (!wMode) failed = true;

const fatigueHelp = fs.readFileSync('calc-fatigue.html', 'utf8');
const fMode =
  fatigueHelp.includes('fatigue.helpCalcModeDesignHtml') &&
  fatigueHelp.includes('fatigue.helpCalcModeDiagnosticHtml');
console.log(`calc-fatigue.html ftCalcModeHelp keys: ${fMode ? 'yes' : 'MISSING'}`);
if (!fMode) failed = true;

console.log(`\n--- summary: ${pages.length} lab pages, ${warnCount} field-help WARN(s) ---`);
if (failed) {
  console.error('check-lab-i18n: FAILED');
  process.exit(1);
}
console.log('check-lab-i18n: PASSED');
process.exit(0);
