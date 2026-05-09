const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const re = new RegExp(
  '(<span class="site-nav__lang-sep" aria-hidden="true">)[^<]*(</span>)',
  'g',
);
for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.html'))) {
  const fp = path.join(root, f);
  let c = fs.readFileSync(fp, 'utf8');
  const n = c.replace(re, '$1\u00b7$2');
  if (n !== c) fs.writeFileSync(fp, n, 'utf8');
}
