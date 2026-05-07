/**
 * Inyecci\u00f3n inicial de bloque SEO (favicon, canonical, OG, Twitter) en p\u00e1ginas sin \u00e9l.
 * Textos: scripts/seo-meta.json (ASCII + \\u, v\u00e1lido en cualquier editor Windows).
 *
 * 1) A\u00f1ada la p\u00e1gina en scripts/seo-meta.json
 * 2) node scripts/inject-seo-meta.mjs
 * 3) node scripts/repair-html-seo.mjs   (normaliza t\u00edtulos y metas desde el mismo JSON)
 *
 * Solo procesa entradas del JSON cuyo HTML a\u00fan no tiene favicon.svg.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escTitle(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function buildBlock(title, description) {
  const t = escAttr(title);
  const d = escAttr(description);
  return `    <meta name="description" content="${d}" />
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="canonical" href="" id="mdr-canonical" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="" id="mdr-og-url" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${t}" />
`;
}

const viewportRe =
  /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0"\s*\/>/i;

const SKIP = new Set([
  'index.html',
  'machines-hub.html',
  'fluids-hub.html',
  'transmission-lab.html',
  'flat-conveyor.html',
  'calc-gears.html',
  'calc-hydraulic-pump.html',
]);

function main() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-meta.json'), 'utf8'));
  let n = 0;
  for (const [file, { title, description }] of Object.entries(data)) {
    if (SKIP.has(file)) continue;
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    let html = fs.readFileSync(full, 'utf8');
    if (html.includes('favicon.svg')) continue;
    const block = buildBlock(title, description);
    if (!viewportRe.test(html)) continue;
    html = html.replace(viewportRe, (m) => `${m}\n${block}`);
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escTitle(title)}</title>`);
    fs.writeFileSync(full, html, 'utf8');
    console.log('inject', file);
    n++;
  }
  console.log('Listo:', n, 'archivos con bloque nuevo.');
}

main();
