import fs from 'fs';

const pages = [
  { html: 'calc-hydraulic-cylinder.html', en: 'js/lab/i18n/pages/hydCylEn.js', prefix: 'hydCyl.' },
  { html: 'calc-hydraulic-pump.html', en: 'js/lab/i18n/pages/hydraulicPumpEn.js', prefix: 'hpump.' },
  { html: 'calc-hydraulic-press.html', en: 'js/lab/i18n/pages/hydraulicPressEn.js', prefix: 'hpress.' },
  { html: 'calc-pneumatic-cylinder.html', en: 'js/lab/i18n/pages/pneumaticCylEn.js', prefix: 'pneuCyl.' },
  { html: 'fluids-hub.html', en: 'js/lab/i18n/pages/fluidsHubUxEn.js', prefix: 'fluids.' },
];

const uxSrc = fs.readFileSync('js/lab/i18n/pages/fluidsHubUxEn.js', 'utf8');
const uxKeys = new Set([...uxSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));
const navSrc = fs.readFileSync('js/lab/i18n/homeNavEn.js', 'utf8');
const navKeys = new Set([...navSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]));

let failed = false;

for (const { html, en, prefix } of pages) {
  const htmlSrc = fs.readFileSync(html, 'utf8');
  const enSrc = fs.readFileSync(en, 'utf8');
  const keys = new Set([
    ...[...enSrc.matchAll(/'([^']+)':/g)].map((m) => m[1]),
    ...uxKeys,
    ...navKeys,
  ]);
  const dataI18n = [...htmlSrc.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  const attrBundle = [...htmlSrc.matchAll(/data-i18n-attrs="[^"]*?([a-zA-Z0-9_.]+)"/g)].map((m) => m[1]);
  const scoped = (k) => html === 'fluids-hub.html' ? k.startsWith('fluids.') : true;
  const all = [...dataI18n, ...attrBundle].filter(scoped);
  const missing = all.filter((k) => !keys.has(k));
  const helps = (htmlSrc.match(/class="lab-field-help"/g) || []).length;
  const helpsBare = [...htmlSrc.matchAll(/<(?:p|div)[^>]*class="[^"]*lab-field-help[^"]*"[^>]*>/g)].filter((m) => {
    if (m[0].includes('data-i18n')) return false;
    if (
      /\blab-field-help--(?:gear|bolt|hp)-modes\b/.test(m[0]) &&
      /data-(?:gear|bolt|hp)-mode/.test(htmlSrc)
    ) {
      return false;
    }
    return true;
  }).length;
  console.log(`\n${html} (${prefix})`);
  console.log(`  data-i18n keys: ${dataI18n.length}, missing EN: ${missing.length ? missing.join(', ') : 'none'}`);
  console.log(`  lab-field-help: ${helps}, without data-i18n on tag: ${helpsBare}`);
  if (helpsBare > 0) failed = true;
  const presetsBar = htmlSrc.includes('lab-presets-bar');
  const presets3 = (htmlSrc.match(/labelKey:/g) || []).length;
  if (presetsBar) console.log(`  presets bar: yes (${presets3} labelKey in page JS ? expect 3 per calc)`);
  if (missing.length) failed = true;
}

const hub = fs.readFileSync('fluids-hub.html', 'utf8');
const hubNext = hub.includes('fluids.hubNextStepsLi1Html');
console.log(`\nfluids-hub.html hub next-steps: ${hubNext ? 'yes' : 'MISSING'}`);
if (!hubNext) failed = true;

const labCss = fs.readFileSync('css/lab.css', 'utf8');
const mobilePanelled =
  labCss.includes('.lab-calc-layout--panelled.lab-calc-layout--with-diag') &&
  labCss.includes('max-width: 919px') &&
  labCss.includes("'inputs diagram'");
const mobileHc =
  labCss.includes('fluid-calc--pump') && labCss.includes('hp-diagrams-row');
console.log(`css/lab.css lab panelled layout (919px stack): ${mobilePanelled ? 'yes' : 'MISSING'}`);
console.log(`css/lab.css fluid hp-diagrams-row: ${mobileHc ? 'yes' : 'MISSING'}`);
if (!mobilePanelled) failed = true;
const fluidWrappers = pages
  .filter((p) => p.html.startsWith('calc-'))
  .every((p) => {
    const src = fs.readFileSync(p.html, 'utf8');
    const slug = p.html.replace('calc-', '').replace('.html', '');
    const mod =
      slug === 'hydraulic-cylinder'
        ? 'cylinder'
        : slug === 'hydraulic-pump'
          ? 'pump'
          : slug === 'hydraulic-press'
            ? 'press'
            : slug === 'pneumatic-cylinder'
              ? 'pneumatic'
              : null;
    return mod && src.includes(`fluid-calc--${mod}`);
  });
console.log(`fluid-calc--* wrappers on calc pages: ${fluidWrappers ? 'yes' : 'MISSING'}`);
if (!fluidWrappers) failed = true;
if (!mobileHc) failed = true;

process.exit(failed ? 1 : 0);
