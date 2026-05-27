import fs from 'fs';

const files = [
  {
    path: 'js/config/credits.js',
    head: `/**
 * Creditos (saldo unico) y costes de uso.
 * \`creditPoolFromPath\` solo etiqueta la seccion; el saldo es compartido.
 * Persistencia en Netlify Blobs via \`credits-balance\` y \`credits-consume\`.
 */
`,
  },
  {
    path: 'js/config/calcUnlockCatalog.js',
    head: `/**
 * Calculadoras elegibles para desbloqueo puntual (1 credito / 30 dias).
 */
`,
  },
];

for (const { path: filePath, head } of files) {
  let s = fs.readFileSync(filePath, 'utf8');
  s = s.replace(/^\/\*\*[\s\S]*?\*\/\n+/, head);
  fs.writeFileSync(filePath, s, 'utf8');
  const left = (s.match(/\uFFFD/g) || []).length;
  console.log(filePath, 'FFFD', left);
}
