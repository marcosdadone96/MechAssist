/**
 * Genera sitemap.xml en la raiz del repo.
 * Uso: node scripts/generate-sitemap.mjs
 * Configure FEATURES.publicSiteBaseUrl (sin barra final) o sustituya el marcador en el XML.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const { FEATURES } = await import(pathToFileURL(path.join(root, 'js', 'config', 'features.js')).href);

let base =
  typeof FEATURES.publicSiteBaseUrl === 'string' ? FEATURES.publicSiteBaseUrl.trim().replace(/\/$/, '') : '';
if (!base) {
  base = 'https://REPLACE-WITH-YOUR-DOMAIN';
  console.warn('[sitemap] publicSiteBaseUrl vacio: usando marcador REPLACE-WITH-YOUR-DOMAIN');
}

const exclude = new Set(['register.html', 'checkout.html', 'calc-gearmotor-inertia.html']);
const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.html') && !exclude.has(f))
  .sort();

const urls = files.map((f) => `${base}/${f}`);

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((loc) => `  <url><loc>${escapeXml(loc)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n') +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
console.log('Wrote sitemap.xml with', urls.length, 'URLs');
if (base.includes('REPLACE')) {
  console.warn(
    '[sitemap] Configure FEATURES.publicSiteBaseUrl y vuelva a ejecutar antes de desplegar. robots.txt: descomente la linea Sitemap con su dominio.',
  );
} else {
  console.log('[sitemap] En robots.txt descomente y fije: Sitemap:', base + '/sitemap.xml');
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
