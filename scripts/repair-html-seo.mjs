/**
 * Repara t\u00edtulos y metas en HTML usando scripts/seo-meta.json (ASCII + \\u, UTF-8 v\u00e1lido).
 * Uso: node scripts/repair-html-seo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const metaPath = path.join(__dirname, 'seo-meta.json');

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escTitle(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/** Bloque duplicado en p\u00e1ginas legales tras el primer bloque OG */
const LEGAL_DUP =
  /\n    <meta name="robots" content="index,follow" \/>\n    <meta property="og:type" content="website" \/>\n    <meta property="og:url" content="" \/>\n    <link rel="canonical" href="" id="mdr-canonical" \/>\n/g;

function repair(html, title, description) {
  let out = html;
  const t = escAttr(title);
  const d = escAttr(description);
  const titleInner = escTitle(title);

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleInner}</title>`);
  out = out.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${d}" />`);
  out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${t}" />`);
  out = out.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/im, `<meta property="og:description" content="${d}" />`);
  out = out.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${t}" />`);

  const matches = out.match(LEGAL_DUP);
  if (matches && matches.length > 1) {
    let first = true;
    out = out.replace(LEGAL_DUP, (m) => {
      if (first) {
        first = false;
        return m;
      }
      return '\n';
    });
  } else if (matches?.length === 1) {
    /* ya una sola */
  }

  /* Si queda og:url sin id duplicado junto a robots duplicado */
  out = out.replace(
    /\n    <meta name="robots" content="index,follow" \/>\n    <meta property="og:type" content="website" \/>\n    <meta property="og:url" content="" \/>\n    <link rel="canonical" href="" id="mdr-canonical" \/>\n(?=\s*<link rel="stylesheet")/,
    '\n    <meta name="robots" content="index,follow" />\n',
  );

  return out;
}

function normalizeLegalNav(html) {
  return html.replace(
    /(<a href="terms\.html"[^>]*>)[^<]*(T[\s\S]*?rminos)(<\/a>)/gi,
      '$1T\u00e9rminos$3',
  );
}

function main() {
  const raw = fs.readFileSync(metaPath, 'utf8');
  const data = JSON.parse(raw);

  let n = 0;
  for (const [file, { title, description }] of Object.entries(data)) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) {
      console.warn('omitido (no existe):', file);
      continue;
    }
    let html = fs.readFileSync(full, 'utf8');
    html = repair(html, title, description);
    if (file.includes('privacy') || file.includes('terms') || file.includes('cookies') || file.includes('cookie-preferences')) {
      html = normalizeLegalNav(html);
    }
    if (file === 'my-gearmotors.html') {
      html = html.replace(
        /(<a href="machines-hub\.html">)[^<]+(<\/a>)/,
        '$1M\u00e1quinas$2',
      );
    }
    fs.writeFileSync(full, html, 'utf8');
    console.log('OK', file);
    n++;
  }
  console.log('Reparado:', n, 'archivos.');
}

main();
