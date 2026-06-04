/**
 * Extrusora de husillo — esquema SVG (tolva, cilindro zonificado, husillo, boquilla).
 */

import { clamp } from '../utils/calculations.js';

const NS = 'http://www.w3.org/2000/svg';

/** @param {SVGSVGElement} svg */
function ensureGroup(svg, id) {
  let g = svg.querySelector(`#${id}`);
  if (!g) {
    g = document.createElementNS(NS, 'g');
    g.setAttribute('id', id);
    svg.appendChild(g);
  }
  return g;
}

/** @param {Element} parent @param {string} tag */
function el(parent, tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) node.setAttribute(k, String(v));
  }
  parent.appendChild(node);
  return node;
}

/**
 * @param {string} svgId
 * @param {object} inputs
 * @param {object} results
 */
export function renderExtruderDiagram(svgId, inputs, results) {
  const svg = document.getElementById(svgId);
  if (!(svg instanceof SVGSVGElement)) return;

  svg.setAttribute('viewBox', '0 0 600 180');

  const LD = clamp(Number(inputs.LD) || 25, 10, 40);
  const barrelW = clamp(LD * 14, 200, 430);
  const xBarrel = 70;
  const yBarrel = 60;
  const hBarrel = 60;
  const feedW = barrelW * 0.3;
  const compW = barrelW * 0.4;
  const meterW = barrelW * 0.3;

  const Q = Number(results.Q_net_kg_h) || 0;
  const arrowW = clamp(Q / 15, 2, 12);
  const arrowColor = Q <= 0 ? '#dc2626' : 'var(--c-teal,#0f766e)';
  const isAnnular = inputs.die_type === 'annular';

  let root = svg.querySelector('#extDiagRoot');
  if (!root) {
    svg.innerHTML = '';
    root = document.createElementNS(NS, 'g');
    root.setAttribute('id', 'extDiagRoot');
    svg.appendChild(root);
  } else {
    root.innerHTML = '';
  }

  const hopper = el(root, 'polygon', {
    points: '30,10 70,10 70,60 50,80 30,60',
    fill: '#e2e8f0',
    stroke: '#64748b',
    'stroke-width': '1',
  });
  hopper.setAttribute('fill', '#e2e8f0');

  el(root, 'rect', {
    x: xBarrel,
    y: yBarrel,
    width: feedW,
    height: hBarrel,
    fill: 'var(--c-feed,#bfdbfe)',
    stroke: '#64748b',
    'stroke-width': '1',
  });
  el(root, 'rect', {
    x: xBarrel + feedW,
    y: yBarrel,
    width: compW,
    height: hBarrel,
    fill: 'url(#extCompGrad)',
    stroke: '#64748b',
    'stroke-width': '1',
  });
  el(root, 'rect', {
    x: xBarrel + feedW + compW,
    y: yBarrel,
    width: meterW,
    height: hBarrel,
    fill: 'var(--c-meter,#fdba74)',
    stroke: '#64748b',
    'stroke-width': '1',
  });

  if (!svg.querySelector('#extCompGrad')) {
    const defs = document.createElementNS(NS, 'defs');
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.setAttribute('id', 'extCompGrad');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('x2', '100%');
    const s1 = document.createElementNS(NS, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', '#bfdbfe');
    const s2 = document.createElementNS(NS, 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', '#fdba74');
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.insertBefore(defs, root);
  }

  const screwY = yBarrel + hBarrel / 2;
  const screwEnd = xBarrel + barrelW;
  el(root, 'line', {
    x1: xBarrel + 8,
    y1: screwY,
    x2: screwEnd - 4,
    y2: screwY,
    stroke: 'var(--c-navy,#1e3a5f)',
    'stroke-width': '3',
  });

  const pitchVis = clamp(barrelW / 7, 28, 55);
  for (let i = 0; i < 7; i++) {
    const sx = xBarrel + 12 + i * pitchVis;
    el(root, 'line', {
      x1: sx,
      y1: screwY - 14,
      x2: sx + pitchVis * 0.55,
      y2: screwY + 14,
      stroke: 'var(--c-navy,#1e3a5f)',
      'stroke-width': '1.5',
      opacity: '0.7',
    });
  }

  const dieX = screwEnd;
  const dieY = yBarrel + 8;
  const dieH = hBarrel - 16;
  if (isAnnular) {
    el(root, 'polygon', {
      points: `${dieX},${dieY + dieH / 2} ${dieX + 28},${dieY} ${dieX + 48},${dieY + dieH / 2} ${dieX + 28},${dieY + dieH}`,
      fill: '#94a3b8',
      stroke: '#475569',
      'stroke-width': '1',
    });
    el(root, 'circle', {
      cx: dieX + 38,
      cy: dieY + dieH / 2,
      r: 6,
      fill: '#f8fafc',
      stroke: '#475569',
      'stroke-width': '1',
    });
  } else {
    el(root, 'polygon', {
      points: `${dieX},${dieY + dieH / 2} ${dieX + 22},${dieY + 4} ${dieX + 22},${dieY + dieH - 4}`,
      fill: '#94a3b8',
      stroke: '#475569',
      'stroke-width': '1',
    });
  }

  const arrowY = screwY;
  const arrowX0 = dieX + (isAnnular ? 52 : 26);
  el(root, 'line', {
    x1: arrowX0,
    y1: arrowY,
    x2: arrowX0 + 55,
    y2: arrowY,
    stroke: arrowColor,
    'stroke-width': arrowW,
    'stroke-linecap': 'round',
  });
  el(root, 'polygon', {
    points: `${arrowX0 + 55},${arrowY} ${arrowX0 + 44},${arrowY - 8} ${arrowX0 + 44},${arrowY + 8}`,
    fill: arrowColor,
  });

  el(root, 'text', {
    x: xBarrel + feedW / 2,
    y: yBarrel + hBarrel / 2 + 4,
    'text-anchor': 'middle',
    'font-size': '9',
    fill: '#1e293b',
  }).textContent = 'Feed';
  el(root, 'text', {
    x: xBarrel + feedW + compW / 2,
    y: yBarrel + hBarrel / 2 + 4,
    'text-anchor': 'middle',
    'font-size': '9',
    fill: '#1e293b',
  }).textContent = 'Comp.';
  el(root, 'text', {
    x: xBarrel + feedW + compW + meterW / 2,
    y: yBarrel + hBarrel / 2 + 4,
    'text-anchor': 'middle',
    'font-size': '9',
    fill: '#1e293b',
  }).textContent = 'Metering';

  el(root, 'text', {
    x: xBarrel + 10,
    y: yBarrel - 8,
    'font-size': '10',
    fill: '#334155',
  }).textContent = `${inputs.N_rpm ?? '—'} RPM`;
  el(root, 'text', {
    x: xBarrel + barrelW - 10,
    y: yBarrel - 8,
    'text-anchor': 'end',
    'font-size': '10',
    fill: '#334155',
  }).textContent = `${inputs.Tb_C ?? '—'} °C`;

  el(root, 'line', {
    x1: xBarrel + barrelW * 0.35,
    y1: yBarrel - 18,
    x2: xBarrel + barrelW * 0.35,
    y2: yBarrel - 4,
    stroke: '#334155',
    'stroke-width': '1',
  });
  el(root, 'text', {
    x: xBarrel + barrelW * 0.35,
    y: yBarrel - 22,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: '#334155',
  }).textContent = 'D';

  el(root, 'line', {
    x1: xBarrel,
    y1: yBarrel + hBarrel + 14,
    x2: xBarrel + barrelW,
    y2: yBarrel + hBarrel + 14,
    stroke: '#334155',
    'stroke-width': '1',
  });
  el(root, 'text', {
    x: xBarrel + barrelW / 2,
    y: yBarrel + hBarrel + 28,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: '#334155',
  }).textContent = `L (L/D=${LD})`;
}
