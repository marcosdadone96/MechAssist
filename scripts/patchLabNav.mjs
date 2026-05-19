import fs from 'node:fs';

const labCalcs = [
  'calc-belts.html',
  'calc-gearmotor-inertia.html',
  'calc-iso-fit.html',
  'calc-seeger.html',
  'calc-keys-din6885.html',
  'calc-couplings.html',
  'calc-gears.html',
  'calc-bolts-iso898.html',
  'calc-shaft.html',
  'calc-bearings-catalog.html',
  'calc-compression-spring.html',
  'calc-bearings.html',
  'calc-chains.html',
  'transmission-canvas.html',
  'transmission-studio.html',
];

const re =
  /(<a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisión<\/a>)\s*\n(\s*)<a class="site-nav__link" href="my-gearmotors.html">/g;

const ins =
  '$1\n$2<a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>\n$2<a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>\n$2<a class="site-nav__link" href="my-gearmotors.html">';

for (const f of labCalcs) {
  let s = fs.readFileSync(f, 'utf8');
  if (!re.test(s)) {
    console.error('NO MATCH', f);
    continue;
  }
  re.lastIndex = 0;
  s = s.replace(re, ins);
  fs.writeFileSync(f, s);
  console.log('patched', f);
}

const machineNav =
  /(<a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas<\/a>)\s*\n(\s*)<a class="site-nav__link" href="my-gearmotors.html">/g;

const machineIns =
  '$1\n$2<a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisión</a>\n$2<a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>\n$2<a class="site-nav__link" href="my-gearmotors.html">';

const machineFiles = [
  'flat-conveyor.html',
  'roller-conveyor.html',
  'inclined-conveyor.html',
  'screw-conveyor.html',
  'traction-elevator.html',
  'car-lift-screw.html',
  'bucket-elevator.html',
  'centrifugal-pump.html',
];

for (const f of machineFiles) {
  let s = fs.readFileSync(f, 'utf8');
  if (!machineNav.test(s)) {
    console.error('NO MATCH machine', f);
    continue;
  }
  machineNav.lastIndex = 0;
  s = s.replace(machineNav, machineIns);
  fs.writeFileSync(f, s);
  console.log('patched machine', f);
}

const fluidNav =
  /(<a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica<\/a>)\s*\n(\s*)<a class="site-nav__link" href="my-gearmotors.html">/g;

const fluidIns =
  '$1\n$2<a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisión</a>\n$2<a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>\n$2<a class="site-nav__link" href="my-gearmotors.html">';

const fluidFiles = [
  'calc-hydraulic-pump.html',
  'calc-hydraulic-cylinder.html',
  'calc-hydraulic-press.html',
  'calc-pneumatic-cylinder.html',
];

for (const f of fluidFiles) {
  let s = fs.readFileSync(f, 'utf8');
  if (!fluidNav.test(s)) {
    console.error('NO MATCH fluid', f);
    continue;
  }
  fluidNav.lastIndex = 0;
  s = s.replace(fluidNav, fluidIns);
  fs.writeFileSync(f, s);
  console.log('patched fluid', f);
}

const hubOnly = `<nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio de transmisión</a>
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
        <a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const hubOld = /<nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">\s*\n\s*<a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores<\/span> <span class="premium-flag">Pro<\/span><\/a>\s*\n\s*<\/nav>/g;

for (const f of ['transmission-lab.html', 'fluids-hub.html', 'machines-hub.html']) {
  let s = fs.readFileSync(f, 'utf8');
  if (!hubOld.test(s)) {
    console.error('NO MATCH hub', f);
    continue;
  }
  s = s.replace(hubOld, hubOnly);
  fs.writeFileSync(f, s);
  console.log('patched hub', f);
}
