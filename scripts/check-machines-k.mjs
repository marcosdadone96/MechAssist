import fs from 'fs';

const machines = [
  { html: 'flat-conveyor.html', en: ['js/lab/i18n/pages/flatConvEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/flatConveyorPage.js' },
  { html: 'inclined-conveyor.html', en: ['js/lab/i18n/pages/inclinedConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/inclinedConveyorPage.js' },
  { html: 'roller-conveyor.html', en: ['js/lab/i18n/pages/rollerConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/rollerConveyorPage.js' },
  {
    html: 'bucket-elevator.html',
    en: [
      'js/lab/i18n/pages/bucketElevatorEn.js',
      'js/lab/i18n/pages/bucketElevatorMainEn.js',
      'js/lab/i18n/pages/machineHubUxEn.js',
    ],
    page: 'js/ui/bucketElevatorPage.js',
  },
  { html: 'car-lift-screw.html', en: ['js/lab/i18n/pages/carLiftEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/carLiftScrewPage.js' },
  { html: 'centrifugal-pump.html', en: ['js/lab/i18n/pages/centrifugalPumpEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/centrifugalPumpPage.js' },
  { html: 'screw-conveyor.html', en: ['js/lab/i18n/pages/screwConveyorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/screwConveyorPage.js' },
  { html: 'traction-elevator.html', en: ['js/lab/i18n/pages/tractionElevatorEn.js', 'js/lab/i18n/pages/machineHubUxEn.js'], page: 'js/ui/tractionElevatorPage.js' },
];

let failed = false;

for (const { html, en, page } of machines) {
  const htmlSrc = fs.readFileSync(html, 'utf8');
  const keys = new Set();
  for (const f of [...en, 'js/lab/i18n/homeNavEn.js']) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/'([^']+)':/g)) keys.add(m[1]);
    for (const m of src.matchAll(/\b(be[A-Za-z0-9_]+):/g)) keys.add(m[1]);
  }
  const chips = (htmlSrc.match(/class="info-chip"/g) || []).length;
  const chipsI18n = (htmlSrc.match(/info-chip[^>]*data-i18n-attrs/g) || []).length;
  const diagramAria = /diagramSvgAria|diagram.*data-i18n="[^"]+"[^>]*data-i18n-attr="aria-label"/.test(htmlSrc);
  const reloadInPage = fs.readFileSync(page, 'utf8').includes('location.reload');
  const reloadOnEsFalse = fs.readFileSync(page, 'utf8').includes('reloadOnEs: false');
  const dataI18n = [...htmlSrc.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  const missing = dataI18n.filter((k) => !keys.has(k));

  console.log(`\n${html}`);
  console.log(`  chips: ${chipsI18n}/${chips} with data-i18n-attrs`);
  console.log(`  diagram aria i18n: ${diagramAria ? 'yes' : 'MISSING'}`);
  console.log(`  page location.reload: ${reloadInPage ? 'YES (bad)' : 'no'}`);
  console.log(`  reloadOnEs: false: ${reloadOnEsFalse ? 'yes' : 'no'}`);
  console.log(`  missing EN keys: ${missing.length ? missing.slice(0, 8).join(', ') : 'none'}`);

  if (chips !== chipsI18n || !diagramAria || reloadInPage || !reloadOnEsFalse || missing.length) failed = true;
}

process.exit(failed ? 1 : 0);
