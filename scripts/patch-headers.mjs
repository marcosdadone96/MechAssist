/**
 * One-off batch: replace legacy headers with unified site-nav markup.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SNIPPET_SUB = `    <header class="site-nav site-nav--sticky">
      <a class="site-nav__brand" href="index.html">
        <img class="site-nav__logo" src="logo-themechassist.svg" width="40" height="40" alt="" decoding="async" />
        <span class="site-nav__title">The<em>MechAssist</em></span>
      </a>
      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link" href="feedback.html" data-i18n="nav.feedback">Sugerencias</a>
        <a class="site-nav__link" href="my-gearmotors.html"><span data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>
      <div class="site-nav__end">
        <a class="site-nav__link site-nav__link--plans" href="index.html#hub-pricing" data-nav-plans data-i18n="nav.plans">Planes</a>
        <div id="hub-header-auth-slot" class="site-nav__auth"></div>
        <div class="site-nav__lang hub-lang" role="group" aria-label="Selector de idioma" data-i18n="aria.langSelector" data-i18n-attr="aria-label">
          <button type="button" class="hub-lang__btn site-nav__lang-btn" data-lang="es">ES</button>
          <span class="site-nav__lang-sep" aria-hidden="true">ù</span>
          <button type="button" class="hub-lang__btn site-nav__lang-btn" data-lang="en">EN</button>
        </div>
      </div>
    </header>`;

const SNIPPET_MYGM = `    <header class="site-nav site-nav--sticky">
      <a class="site-nav__brand" href="index.html">
        <img class="site-nav__logo" src="logo-themechassist.svg" width="40" height="40" alt="" decoding="async" />
        <span class="site-nav__title">The<em>MechAssist</em></span>
      </a>
      <nav class="site-nav__center" data-i18n="aria.siteNav" data-i18n-attr="aria-label">
        <a class="site-nav__link" href="feedback.html" data-i18n="nav.feedback">Sugerencias</a>
        <a class="site-nav__link" href="my-gearmotors.html" aria-current="page"><span class="mygm-nav-txt" data-gm-nav-title data-i18n="nav.myGearmotors">Mis motorreductores</span> <span class="premium-flag">Pro</span></a>
      </nav>
      <div class="site-nav__end">
        <a class="site-nav__link site-nav__link--plans" href="index.html#hub-pricing" data-nav-plans data-i18n="nav.plans">Planes</a>
        <div id="hub-header-auth-slot" class="site-nav__auth"></div>
        <span id="gmLangHost" class="site-nav__gm-lang-wrap"></span>
      </div>
    </header>`;

const SKIP = new Set([
  'index.html',
  'register.html',
  'privacy.html',
  'terms.html',
  'cookies.html',
  'cookie-preferences.html',
]);

function injectHubScripts(html) {
  if (!html.includes('site-nav')) return html;
  if (html.includes('js/ui/hubFreemium.js')) return html;
  const inject = `    <script type="module" src="js/ui/homeI18n.js"></script>
    <script type="module" src="js/ui/hubFreemium.js"></script>
`;
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) return html;
  return html.slice(0, idx) + inject + html.slice(idx);
}

function patchFile(fp) {
  const base = path.basename(fp);
  if (SKIP.has(base)) return false;
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;

  if (base === 'my-gearmotors.html') {
    c = c.replace(/<header class="app-header">[\s\S]*?<\/header>/m, SNIPPET_MYGM);
  } else if (/<header class="hub-header">/.test(c)) {
    c = c.replace(/<header class="hub-header">[\s\S]*?<\/header>/m, SNIPPET_SUB);
  } else if (/<header class="lab-header"/.test(c)) {
    c = c.replace(/<header class="lab-header"[^>]*>[\s\S]*?<\/header>/m, SNIPPET_SUB);
  } else if (/<header class="app-header">/.test(c)) {
    c = c.replace(/<header class="app-header">[\s\S]*?<\/header>/m, SNIPPET_SUB);
  } else {
    return false;
  }

  if (c === orig) return false;

  c = injectHubScripts(c);

  fs.writeFileSync(fp, c, 'utf8');
  console.log('patched', path.relative(root, fp));
  return true;
}

const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
let n = 0;
for (const f of files) {
  if (patchFile(path.join(root, f))) n += 1;
}
console.log('done,', n, 'files');
