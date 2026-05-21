import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('config/calc-unlock-catalog.json', 'utf8'));
let failed = false;

console.log('N1 flat next-steps');
const flat = fs.readFileSync('flat-conveyor.html', 'utf8');
if (!flat.includes('machineHub.nextStepsFlatLi1Html')) {
  console.log('  MISSING flat next-steps');
  failed = true;
} else {
  console.log('  ok');
}

console.log('\nN2 screw + traction eng/motor i18n');
for (const f of ['screw-conveyor.html', 'traction-elevator.html']) {
  const html = fs.readFileSync(f, 'utf8');
  const eng = html.includes('engTitle') && html.includes('data-i18n');
  const motors = html.includes('motorsTitle') && html.includes('data-i18n');
  const teHelp = f.includes('traction') ? html.includes('teConv.helpBodyHtml') : true;
  const teSf = f.includes('traction') ? html.includes('teConv.sfGuideSummary') : true;
  console.log(`  ${f}: eng=${eng} motors=${motors} help=${teHelp} sfGuide=${teSf}`);
  if (!eng || !motors || !teHelp || !teSf) failed = true;
}

console.log('\nN3 inclined quality runtime');
const incPage = fs.readFileSync('js/ui/inclinedConveyorPage.js', 'utf8');
if (!incPage.includes('incQualityStrings')) {
  console.log('  MISSING incQualityStrings');
  failed = true;
} else {
  console.log('  ok');
}

console.log('\nN4 RFQ aria (machineRfqExport)');
const rfqJs = fs.readFileSync('js/ui/machineRfqExport.js', 'utf8');
if (!rfqJs.includes('aria-label') || !rfqJs.includes('machineHub.rfqAriaText')) {
  console.log('  MISSING rfq aria wiring');
  failed = true;
} else {
  console.log('  ok');
}

console.log('\nN5 guest + catalog hubFreemium');
let missingHub = 0;
for (const { slug } of catalog) {
  if (!fs.existsSync(slug)) {
    console.log(`  missing file: ${slug}`);
    failed = true;
    continue;
  }
  const html = fs.readFileSync(slug, 'utf8');
  if (!html.includes('hubFreemium.js')) {
    console.log(`  no hubFreemium: ${slug}`);
    missingHub++;
    failed = true;
  }
}
console.log(`  catalog ${catalog.length} slugs, hubFreemium missing: ${missingHub}`);

const guestJs = fs.readFileSync('js/ui/guestCalcMode.js', 'utf8');
if (!guestJs.includes('data-guest-calc') || !guestJs.includes('guest-calc-banner')) {
  console.log('  guestCalcMode incomplete');
  failed = true;
}

const noCr = fs.readFileSync('js/ui/noCreditsLockMode.js', 'utf8');
if (!noCr.includes('data-no-credits-lock')) {
  console.log('  noCreditsLockMode incomplete');
  failed = true;
}

process.exit(failed ? 1 : 0);
