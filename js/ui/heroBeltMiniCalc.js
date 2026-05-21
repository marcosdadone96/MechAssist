/**
 * Mini calculadora de correas en el hero de index.html (T = 9550·P/n, v lineal orientativa).
 */

const R1_REF = 22;
const N_REF = 1450;
const CX_MOTOR = 88;
const CX_DRIVEN = 268;
const CY = 44;
const R2_MIN = 12;
const R2_MAX = 50;
const INNER_RATIO = 13 / 22;

function fmtNum(n, digits = 1) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * @param {number} r1
 * @param {number} r2
 * @param {number} x1
 * @param {number} x2
 * @param {number} cy
 */
function externalTangents(r1, r2, x1, x2, cy) {
  return {
    top: { x1: x1, y1: cy - r1, x2: x2, y2: cy - r2 },
    bottom: { x1: x1, y1: cy + r1, x2: x2, y2: cy + r2 },
  };
}

/**
 * @param {ParentNode} root
 * @param {number} r1
 * @param {number} r2
 */
function updateHeroBeltSvg(root, r1, r2) {
  const svg = root.querySelector('.hub-hero__mockup-svg');
  if (!svg) return;

  const circles = svg.querySelectorAll('circle');
  const lines = svg.querySelectorAll('line');
  if (circles.length < 4 || lines.length < 2) return;

  const r1In = r1 * INNER_RATIO;
  const r2In = r2 * INNER_RATIO;

  const setCircle = (/** @type {SVGCircleElement} */ el, cx, cy, r) => {
    el.setAttribute('cx', String(cx));
    el.setAttribute('cy', String(cy));
    el.setAttribute('r', String(r));
  };

  setCircle(circles[0], CX_MOTOR, CY, r1);
  setCircle(circles[1], CX_MOTOR, CY, r1In);
  setCircle(circles[2], CX_DRIVEN, CY, r2);
  setCircle(circles[3], CX_DRIVEN, CY, r2In);

  const tan = externalTangents(r1, r2, CX_MOTOR, CX_DRIVEN, CY);
  const top = lines[0];
  const bottom = lines[1];
  top.setAttribute('x1', String(tan.top.x1));
  top.setAttribute('y1', String(tan.top.y1));
  top.setAttribute('x2', String(tan.top.x2));
  top.setAttribute('y2', String(tan.top.y2));
  bottom.setAttribute('x1', String(tan.bottom.x1));
  bottom.setAttribute('y1', String(tan.bottom.y1));
  bottom.setAttribute('x2', String(tan.bottom.x2));
  bottom.setAttribute('y2', String(tan.bottom.y2));
}

function recalc() {
  const root = document.getElementById('heroBeltMini');
  const pEl = document.getElementById('heroBeltP');
  const nEl = document.getElementById('heroBeltN');
  const tOut = document.getElementById('heroBeltTorque');
  const vOut = document.getElementById('heroBeltV');
  if (!(pEl instanceof HTMLInputElement) || !(nEl instanceof HTMLInputElement)) return;

  const P = Math.max(0, Number(pEl.value) || 0);
  const n = Math.max(1, Number(nEl.value) || 1);
  const T = (9550 * P) / n;
  const Dmm = 200;
  const v = (Math.PI * Dmm * n) / 60000;

  const r2 = clamp(R1_REF * (N_REF / n), R2_MIN, R2_MAX);

  if (root) updateHeroBeltSvg(root, R1_REF, r2);

  if (tOut) tOut.textContent = `${fmtNum(T, 1)} N·m`;
  if (vOut) vOut.textContent = `${fmtNum(v, 2)} m/s`;
}

function initHeroBeltMiniCalc() {
  const root = document.getElementById('heroBeltMini');
  if (!root) return;
  root.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('input', recalc);
  });
  recalc();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroBeltMiniCalc);
} else {
  initHeroBeltMiniCalc();
}
