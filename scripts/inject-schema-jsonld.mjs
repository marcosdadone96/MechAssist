import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const seoMeta = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-meta.json'), 'utf8'));
const BASE = 'https://www.themechassist.com';

/** Páginas que NO deben tener WebApplication (gestión, legal, hubs con WebSite). */
const SKIP = new Set([
  'index.html',
  'checkout.html',
  'register.html',
  'my-gearmotors.html',
  'my-saved-calcs.html',
  'privacy.html',
  'terms.html',
  'cookies.html',
  'cookie-preferences.html',
  'feedback.html',
  'trust.html',
  '404.html',
  'promo-30s.html',
  'promo-45s.html',
  'machines-hub.html',
  'fluids-hub.html',
  'transmission-lab.html',
]);

const PRO_PAGES = new Set(['transmission-studio.html', 'transmission-canvas.html']);

let count = 0;
for (const [file, meta] of Object.entries(seoMeta)) {
  if (SKIP.has(file)) continue;
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.warn('skip (not found):', file);
    continue;
  }
  let html = fs.readFileSync(fullPath, 'utf8');
  if (html.includes('application/ld+json')) {
    console.log('skip (already has ld+json):', file);
    continue;
  }

  const canonical = meta.canonical || `${BASE}/${file}`;
  const isPro = PRO_PAGES.has(file);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title.replace(' \u2014 TheMechAssist', '').replace(' — TheMechAssist', ''),
    description: meta.description,
    url: canonical,
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Any',
    inLanguage: ['es', 'en'],
    offers: {
      '@type': 'Offer',
      price: isPro ? undefined : '0',
      priceCurrency: 'EUR',
      description: isPro ? 'Requires Pro subscription' : 'Free to use',
    },
    provider: {
      '@type': 'Organization',
      name: 'TheMechAssist',
      url: BASE,
    },
    featureList: getFeatureList(file),
  };

  const cleanJsonld = JSON.parse(JSON.stringify(jsonld));
  const tag = `\n<script type="application/ld+json">\n${JSON.stringify(cleanJsonld, null, 2)}\n</script>`;
  html = html.replace('</head>', `${tag}\n</head>`);
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log('injected:', file);
  count++;
}
console.log(`\nDone: ${count} files updated.`);

/** @param {string} file */
function getFeatureList(file) {
  const map = {
    'calc-gears.html': 'Gear ratio, pitch line speed, simplified AGMA check',
    'calc-belts.html': 'Belt kinematics, belt length, speed ratio',
    'calc-chains.html': 'Chain drives, polygon effect, lubrication',
    'calc-hydraulic-cylinder.html': 'Force, buckling, tube wall, ISO 3320 standard sizes',
    'calc-pneumatic-compressor.html': 'Throughput, IEC motor sizing, tank volume',
    'extruder.html': 'Screw extruder throughput, die pressure, Power-Law model',
    'transmission-canvas.html': 'Multi-shaft design, n/T propagation, belt geometry',
    'transmission-studio.html': 'Modular kinematic chain builder',
  };
  return map[file] || 'Engineering calculation tool';
}
