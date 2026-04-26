/**
 * One-shot: reemplaza carga directa de GA por cookiesAndAnalyticsBoot.js
 * Ejecutar desde la raíz del repo: node scripts/patch-gtag-to-consent.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const blockA =
  /\r?\n\s*<!-- Google tag \(gtag\.js\) -->\s*\r?\n\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-43E5C8TB38"><\/script>\s*\r?\n\s*<script src="js\/gtag\.js"><\/script>/g;

const blockB =
  /\r?\n\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-43E5C8TB38"><\/script>\s*\r?\n\s*<script src="js\/gtag\.js"><\/script>/g;

const replacement = '\n    <script defer src="js/legal/cookiesAndAnalyticsBoot.js"></script>';

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.html')) {
      let c = fs.readFileSync(p, 'utf8');
      if (!c.includes('googletagmanager.com/gtag')) continue;
      const orig = c;
      c = c.replace(blockA, replacement);
      c = c.replace(blockB, replacement);
      if (c === orig) {
        console.warn('No change (check pattern):', p);
        continue;
      }
      fs.writeFileSync(p, c, 'utf8');
      console.log('Patched', path.relative(root, p));
    }
  }
}

walk(root);
