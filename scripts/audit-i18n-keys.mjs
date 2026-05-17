import fs from 'fs';

function keysFromHtml(f) {
  const t = fs.readFileSync(f, 'utf8');
  return [...new Set([...t.matchAll(/data-i18n="([^"]+)"/g)].map((x) => x[1]))].sort();
}

function keysFromJs(f) {
  const t = fs.readFileSync(f, 'utf8');
  return [...new Set([...t.matchAll(/'([^']+)':/g)].map((x) => x[1]))].sort();
}

const pairs = [
  ['flat-conveyor.html', 'js/lab/i18n/pages/flatConvEn.js'],
  ['inclined-conveyor.html', 'js/lab/i18n/pages/inclinedConveyorEn.js'],
  ['roller-conveyor.html', 'js/lab/i18n/pages/machineHubUxEn.js'],
  ['car-lift-screw.html', 'js/lab/i18n/pages/machineHubUxEn.js'],
  ['centrifugal-pump.html', 'js/lab/i18n/pages/centrifugalPumpEn.js'],
  ['bucket-elevator.html', 'js/lab/i18n/pages/bucketElevatorEn.js'],
  ['screw-conveyor.html', 'js/lab/i18n/pages/screwConveyorEn.js'],
  ['traction-elevator.html', 'js/lab/i18n/pages/tractionElevatorEn.js'],
];

for (const [html, js] of pairs) {
  const h = keysFromHtml(html);
  const j = keysFromJs(js);
  const missing = h.filter((k) => !j.includes(k));
  console.log(`\n=== ${html} (${h.length} keys) ===`);
  if (missing.length) console.log('MISSING:', missing.join('\n  '));
  else console.log('OK - all HTML keys in JS');
}
