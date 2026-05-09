/**
 * Actualiza cabecera site-nav: enlace de vuelta al hub según área + Sugerencias junto al idioma.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const LAB = new Set([
  'calc-belts.html',
  'calc-bolts-iso898.html',
  'calc-chains.html',
  'calc-compression-spring.html',
  'calc-couplings.html',
  'calc-gearmotor-inertia.html',
  'calc-gears.html',
  'calc-iso-fit.html',
  'calc-keys-din6885.html',
  'calc-seeger.html',
  'calc-shaft.html',
  'calc-bearings.html',
  'calc-bearings-catalog.html',
  'transmission-studio.html',
  'transmission-canvas.html',
]);

const MACHINES = new Set([
  'flat-conveyor.html',
  'inclined-conveyor.html',
  'roller-conveyor.html',
  'screw-conveyor.html',
  'centrifugal-pump.html',
  'bucket-elevator.html',
  'traction-elevator.html',
  'car-lift-screw.html',
  'my-gearmotors.html',
]);

const FLUIDS = new Set([
  'calc-hydraulic-cylinder.html',
  'calc-hydraulic-pump.html',
  'calc-hydraulic-press.html',
  'calc-pneumatic-cylinder.html',
]);

const MINIMAL = new Set([
  'index.html',
  'feedback.html',
  'checkout.html',
  'register.html',
  'transmission-lab.html',
  'machines-hub.html',
  'fluids-hub.html',
]);

function hubCategory(base) {
  if (MINIMAL.has(base)) return 'minimal';
  if (LAB.has(base)) return 'lab';
  if (MACHINES.has(base)) return 'machines';
  if (FLUIDS.has(base)) return 'fluids';
  return 'minimal';
}

const CENTER_LAB = `      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="transmission-lab.html" data-i18n="nav.hubLab">Laboratorio</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const CENTER_MACHINES = `      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const CENTER_MACHINES_GM = `      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="machines-hub.html" data-i18n="nav.hubMachines">M\u00e1quinas</a>
        <a class="site-nav__link" href="my-gearmotors.html" aria-current="page"><span class="mygm-nav-txt" data-gm-nav-title data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const CENTER_FLUIDS = `      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link site-nav__link--hub" href="fluids-hub.html" data-i18n="nav.hubFluids">Hidr\u00e1ulica</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const CENTER_MINIMAL = `      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>`;

const NAV_OPEN =
  /<nav class="site-nav__center"[^>]*>[\s\S]*?<\/nav>/;

const AUTH_SLOT =
  '<div id="hub-header-auth-slot" class="site-nav__auth"></div>';

const FEEDBACK_LINK =
  '\n        <a class="site-nav__link site-nav__link--feedback" href="feedback.html" data-i18n="nav.feedback">Sugerencias</a>';

function ensureFeedbackBeforeLang(html) {
  if (html.includes('site-nav__link--feedback')) return html;
  let h = html.replace(
    new RegExp(`(${AUTH_SLOT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*(<div class="site-nav__lang hub-lang")`, 'm'),
    `$1${FEEDBACK_LINK}\n        $2`,
  );
  if (h === html) {
    h = html.replace(
      new RegExp(
        `(${AUTH_SLOT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*(<span id="gmLangHost")`,
        'm',
      ),
      `$1${FEEDBACK_LINK}\n        $2`,
    );
  }
  return h;
}

function stripFeedbackFromCenter(html) {
  return html.replace(
    /\n?\s*<a class="site-nav__link" href="feedback\.html"[^>]*data-i18n="nav\.feedback"[^>]*>[\s\S]*?<\/a>/g,
    '',
  );
}

function patchFile(fp) {
  const base = path.basename(fp);
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes('class="site-nav')) return false;

  const orig = c;
  c = stripFeedbackFromCenter(c);

  const cat = hubCategory(base);
  let center = CENTER_MINIMAL;
  if (cat === 'lab') center = CENTER_LAB;
  else if (cat === 'machines') center = base === 'my-gearmotors.html' ? CENTER_MACHINES_GM : CENTER_MACHINES;
  else if (cat === 'fluids') center = CENTER_FLUIDS;

  c = c.replace(NAV_OPEN, center);

  c = ensureFeedbackBeforeLang(c);

  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log('updated', base);
    return true;
  }
  return false;
}

let n = 0;
for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.html'))) {
  if (patchFile(path.join(root, f))) n += 1;
}
console.log('done,', n, 'files');
