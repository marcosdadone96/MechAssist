const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const HI = 'js/ui/homeI18n.js';
const HF = 'js/ui/hubFreemium.js';

for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.html'))) {
  if (f === 'index.html') continue;
  const fp = path.join(root, f);
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes(HI) || !c.includes(HF)) continue;

  const re = /<script type="module" src="([^"]+)"><\/script>\s*/g;
  const modules = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    modules.push(m[1]);
  }
  if (modules.length === 0) continue;

  const rest = modules.filter((s) => s !== HI && s !== HF);
  const ordered = [HI, HF, ...rest];
  if (ordered.join(',') === modules.join(',')) continue;

  let cut = c.replace(/\s*<script type="module" src="[^"]+"><\/script>\s*/g, '\n');
  const idx = cut.lastIndexOf('</body>');
  if (idx === -1) continue;
  const block =
    '\n' +
    ordered.map((s) => `    <script type="module" src="${s}"></script>`).join('\n') +
    '\n  ';
  cut = cut.slice(0, idx) + block + cut.slice(idx);
  fs.writeFileSync(fp, cut, 'utf8');
  console.log('normalized', f);
}
