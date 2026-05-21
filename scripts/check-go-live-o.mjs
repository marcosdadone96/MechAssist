/**
 * Fase O  verificaciones automatizadas pre-deploy.
 * Ejecutar: node scripts/check-go-live-o.mjs
 * QA manual en navegador: docs/go-live-qa-o-manual.md
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();

const SUB_CHECKS = [
  'scripts/check-fluids-i18n.mjs',
  'scripts/check-lab-i18n.mjs',
  'scripts/check-machines-k.mjs',
  'scripts/check-phase-n.mjs',
  'scripts/check-bucket-i18n.mjs',
];

const HUBS = ['index.html', 'machines-hub.html', 'transmission-lab.html', 'fluids-hub.html'];

const CATALOG = JSON.parse(fs.readFileSync('config/calc-unlock-catalog.json', 'utf8'));

/** slug -> expected module script fragment */
const PAGE_MODULE = {
  'calc-gears.html': 'calcGearsPage.js',
  'calc-belts.html': 'calcBeltsPage.js',
  'calc-chains.html': 'calcChainsPage.js',
  'calc-bearings.html': 'calcBearingsPage.js',
  'calc-bearings-catalog.html': 'bearingCatalogPage.js',
  'calc-shaft.html': 'calcShaftPage.js',
  'calc-keys-din6885.html': 'keysDinPage.js',
  'calc-iso-fit.html': 'calcIsoFitPage.js',
  'calc-seeger.html': 'calcSeegerPage.js',
  'calc-couplings.html': 'couplingsPage.js',
  'calc-bolts-iso898.html': 'boltsIsoPage.js',
  'calc-gearmotor-inertia.html': 'gearmotorInertiaPage.js',
  'calc-compression-spring.html': 'compressionSpringPage.js',
  'transmission-canvas.html': 'transmissionCanvasAppEntry',
  'transmission-studio.html': 'studioAppEntry',
  'flat-conveyor.html': 'conveyorAppEntry.js',
  'inclined-conveyor.html': 'conveyorAppEntry.js',
  'roller-conveyor.html': 'rollerConveyorAppEntry',
  'bucket-elevator.html': 'bucketElevatorAppEntry',
  'screw-conveyor.html': 'screwAppEntry',
  'traction-elevator.html': 'tractionElevatorAppEntry',
  'car-lift-screw.html': 'carLiftScrewAppEntry',
  'centrifugal-pump.html': 'pumpAppEntry',
  'calc-hydraulic-pump.html': 'hydraulicPumpPage.js',
  'calc-hydraulic-cylinder.html': 'hydraulicCylinderPage.js',
  'calc-hydraulic-press.html': 'hydraulicPressPage.js',
  'calc-pneumatic-cylinder.html': 'pneumaticCylinderPage.js',
};

let failed = false;

function runNode(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log(`SKIP missing ${rel}`);
    return true;
  }
  console.log(`\n--- ${rel} ---`);
  const r = spawnSync(process.execPath, [file], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  const ok = r.status === 0;
  if (!ok) failed = true;
  return ok;
}

console.log('=== Fase O  checks automatizados ===\n');

for (const rel of SUB_CHECKS) {
  runNode(rel);
}

console.log('\n--- billing tiers ---');
runNode('scripts/test-billing-tiers.mjs');

console.log('\n--- catalog + hubs ---');
for (const hub of HUBS) {
  if (!fs.existsSync(hub)) {
    console.log(`FAIL missing hub ${hub}`);
    failed = true;
    continue;
  }
  const html = fs.readFileSync(hub, 'utf8');
  if (!html.includes('hubFreemium.js')) {
    console.log(`FAIL ${hub}: no hubFreemium.js`);
    failed = true;
  }
}

for (const { slug } of CATALOG) {
  if (!fs.existsSync(slug)) {
    console.log(`FAIL missing ${slug}`);
    failed = true;
    continue;
  }
  const html = fs.readFileSync(slug, 'utf8');
  const issues = [];
  if (!html.includes('hubFreemium.js')) issues.push('hubFreemium');
  if (!html.includes('homeI18n.js') && !html.includes('conveyorAppEntry.js')) {
    if (!slug.includes('transmission')) issues.push('homeI18n');
  }
  const mod = PAGE_MODULE[slug];
  if (mod && !html.includes(mod)) issues.push(`module ${mod}`);
  if (!html.includes('data-i18n=') && !slug.startsWith('transmission')) issues.push('data-i18n');
  if (issues.length) {
    console.log(`FAIL ${slug}: ${issues.join(', ')}`);
    failed = true;
  }
}

if (!fs.existsSync('assets/conveyor-belt-reference.png')) {
  console.log('FAIL assets/conveyor-belt-reference.png missing');
  failed = true;
} else {
  console.log('OK assets/conveyor-belt-reference.png');
}

const uiDir = 'js/ui';
const pageFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith('Page.js'));
const missingReload = [];
for (const f of pageFiles) {
  const src = fs.readFileSync(path.join(uiDir, f), 'utf8');
  if (!src.includes('watchLangAndApply')) continue;
  if (!src.includes('reloadOnEs: false')) missingReload.push(f);
}
if (missingReload.length) {
  console.log(`WARN watchLang without reloadOnEs: false (${missingReload.length}):`);
  missingReload.forEach((f) => console.log(`  - ${f}`));
} else {
  console.log('OK all *Page.js with watchLangAndApply use reloadOnEs: false');
}

console.log(failed ? '\n=== O AUTOMATED: FAILED ===' : '\n=== O AUTOMATED: PASSED ===');
console.log('Complete manual steps: docs/go-live-qa-o-manual.md');
process.exit(failed ? 1 : 0);
