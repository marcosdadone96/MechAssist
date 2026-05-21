import fs from 'fs';

const pages = [
  { html: 'calc-seeger.html', en: 'js/lab/i18n/pages/seegerPageEn.js' },
  { html: 'calc-shaft.html', en: 'js/lab/i18n/pages/shaftPageEn.js' },
  { html: 'calc-gears.html', en: 'js/lab/i18n/pages/gearsPageEn.js' },
  { html: 'calc-couplings.html', en: 'js/lab/i18n/pages/couplingsEn.js' },
  { html: 'calc-bearings.html', en: 'js/lab/i18n/pages/bearingsPageEn.js' },
  { html: 'calc-bearings-catalog.html', en: 'js/lab/i18n/pages/bearingCatalogEn.js' },
  { html: 'calc-belts.html', en: 'js/lab/i18n/pages/beltsEn.js' },
  { html: 'calc-chains.html', en: 'js/lab/i18n/pages/chainsEn.js' },
  { html: 'calc-bolts-iso898.html', en: 'js/lab/i18n/pages/boltsIsoEn.js' },
  { html: 'calc-keys-din6885.html', en: 'js/lab/i18n/pages/keysDinEn.js' },
  { html: 'calc-iso-fit.html', en: 'js/lab/i18n/pages/isoFitPageEn.js' },
  { html: 'calc-gearmotor-inertia.html', en: 'js/lab/i18n/pages/gearmotorInertiaEn.js' },
  { html: 'calc-compression-spring.html', en: 'js/lab/i18n/pages/compressionSpringEn.js' },
  { html: 'calc-hydraulic-pump.html', en: 'js/lab/i18n/pages/hydraulicPumpEn.js' },
];

const navSrc = fs.readFileSync('js/lab/i18n/homeNavEn.js', 'utf8');
const navKeys = new Set([...navSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const fluidsUxSrc = fs.readFileSync('js/lab/i18n/pages/fluidsHubUxEn.js', 'utf8');
const fluidsUxKeys = new Set([...fluidsUxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));

let failed = false;

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
  const helps = (htmlSrc.match(/class="lab-field-help/g) || []).length;
  const helpsBare = [...htmlSrc.matchAll(/<(?:p|div)[^>]*class="[^"]*lab-field-help[^"]*"[^>]*>/g)].filter((m) => {
    if (m[0].includes('data-i18n')) return false;
    if (html === 'calc-shaft.html' && /\bid="sh(T|AvailableD)Help"/.test(m[0])) return false;
    if (
      /\blab-field-help--(?:gear|bolt|hp)-modes\b/.test(m[0]) &&
      /data-(?:gear|bolt|hp)-mode/.test(htmlSrc)
    ) {
      return false;
    }
    return true;
  }).length;
  const nextSteps = htmlSrc.includes('lab-next-steps');
  const hasSeoIntro = htmlSrc.includes('calc-seo-intro');
  const seoIntroI18n =
    /<p class="calc-seo-intro"[^>]*data-i18n=/.test(htmlSrc) ||
    /class="calc-seo-intro"[^>]*data-i18n=/.test(htmlSrc);

  console.log(`\n${html}`);
  console.log(`  data-i18n: ${dataI18n.length}, missing EN: ${missing.length ? missing.join(', ') : 'none'}`);
  console.log(`  lab-field-help without data-i18n: ${helpsBare}`);
  console.log(`  lab-next-steps: ${nextSteps ? 'yes' : 'no'}`);
  console.log(`  calc-seo-intro i18n: ${hasSeoIntro ? (seoIntroI18n ? 'yes' : 'MISSING') : 'n/a'}`);

  if (missing.length || helpsBare > 0) failed = true;
  if (hasSeoIntro && !seoIntroI18n) failed = true;
  if (['calc-couplings.html', 'calc-bearings.html', 'calc-bearings-catalog.html'].includes(html) && !nextSteps) {
    failed = true;
  }
}

const gearsHelp = fs.readFileSync('calc-gears.html', 'utf8');
const gMode = gearsHelp.includes('gear.helpCalcModeDesignHtml') && gearsHelp.includes('gear.helpCalcModeDiagnosticHtml');
console.log(`\ncalc-gears.html gCalcModeHelp keys: ${gMode ? 'yes' : 'MISSING'}`);
if (!gMode) failed = true;

process.exit(failed ? 1 : 0);
