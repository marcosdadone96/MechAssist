/**
 * Esquema SVG modular: tren de engranajes tangentes, correa N poleas (serpentín), cadena N ruedas.
 */

import { svgOpenBeltLoopPath, svgSerpentineOpenPath } from '../lab/diagramGeometry.js';
import {
  gearTrainLayout_mm,
  beltMinCenter_mm,
  beltMaxCenter_mm,
  normalizeBeltStage,
  clampBeltSpansInPlace,
  beltCumulativeCenters_mm,
  normalizeChainStage,
  clampChainSpansInPlace,
  chainSprocketCenters_mm,
} from '../lab/studioKinematics.js';
import { chainPitchDiameter_mm } from '../lab/chains.js';

const COLORS = {
  gearStroke: '#0f766e',
  belt: ['#92400e', '#ca8a04'],
  chain: '#334155',
  axis: '#64748b',
  primitive: '#0d9488',
};

/**
 * @type {{ stageId: number; kind: 'belt'|'chain'; spanIdx: number; startClientX: number; ppm: number; minC: number; maxC: number; onChange: (id: number, kind: string, spanIdx: number, c: number) => void; getSpan: () => number } | null}
 */
let spanDrag = null;

if (typeof window !== 'undefined' && !window.__mdtStudioSpanDrag) {
  window.__mdtStudioSpanDrag = true;
  window.addEventListener(
    'pointermove',
    (ev) => {
      if (!spanDrag) return;
      const dx = ev.clientX - spanDrag.startClientX;
      const dMm = dx / spanDrag.ppm;
      const cur = spanDrag.getSpan();
      const lo = spanDrag.minC;
      const hi = spanDrag.maxC;
      const next = Math.min(hi, Math.max(lo, cur + dMm));
      if (Math.abs(next - cur) > 0.25) {
        spanDrag.onChange(spanDrag.stageId, spanDrag.kind, spanDrag.spanIdx, next);
        spanDrag.startClientX = ev.clientX;
      }
    },
    { passive: true },
  );
  window.addEventListener('pointerup', () => {
    spanDrag = null;
  });
}

/**
 * @param {SVGSVGElement | null} svg
 * @param {object} opts
 * @param {object[]} opts.stages
 * @param {(stageId: number, kind: 'belt'|'chain', spanIndex: number, span_mm: number) => void} [opts.onStudioSpanChange]
 */
export function renderStudioSchematic(svg, opts) {
  if (!(svg instanceof SVGSVGElement)) return;

  const stages = opts.stages || [];
  const rowGap = 20;
  let yCursor = 18;
  const blocks = [];

  for (const st of stages) {
    if (st.type === 'gear_train') {
      blocks.push(drawGearTrainBlock(st, yCursor));
      yCursor += blocks[blocks.length - 1].height + rowGap;
    } else if (st.type === 'belt') {
      blocks.push(drawBeltBlock(st, yCursor));
      yCursor += blocks[blocks.length - 1].height + rowGap;
    } else if (st.type === 'chain') {
      blocks.push(drawChainBlock(st, yCursor));
      yCursor += blocks[blocks.length - 1].height + rowGap;
    }
  }

  const vbW = Math.max(720, ...blocks.map((b) => b.width));
  const vbH = Math.max(120, yCursor + 12);
  svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
  svg.setAttribute('role', 'img');
  svg.innerHTML = blocks.map((b) => b.html).join('');

  svg.querySelectorAll('[data-studio-span-drag]').forEach((el) => {
    if (!(el instanceof SVGElement)) return;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (ev) => {
      if (!opts.onStudioSpanChange) return;
      const kind = el.getAttribute('data-studio-span-drag');
      if (kind !== 'belt' && kind !== 'chain') return;
      const id = Number(el.getAttribute('data-stage-id'));
      const spanIdx = Number(el.getAttribute('data-span-idx')) || 0;
      const st = stages.find((s) => s.id === id && s.type === kind);
      if (!st) return;
      ev.preventDefault();
      try {
        el.setPointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
      const ppm = Number(el.getAttribute('data-ppm')) || 0.42;
      let minC = 50;
      if (kind === 'belt') {
        normalizeBeltStage(st);
        const dL = Math.max(10, st.pulleys[spanIdx].d);
        const dR = Math.max(10, st.pulleys[spanIdx + 1].d);
        minC = beltMinCenter_mm(dL, dR);
      } else {
        normalizeChainStage(st);
        const p = Math.max(4, st.pitch_mm ?? 19.05);
        const zL = Math.max(6, st.sprockets[spanIdx].z);
        const zR = Math.max(6, st.sprockets[spanIdx + 1].z);
        const DL = chainPitchDiameter_mm(p, zL);
        const DR = chainPitchDiameter_mm(p, zR);
        minC = Math.max(2 * p, beltMinCenter_mm(DL, DR));
      }
      spanDrag = {
        stageId: id,
        kind,
        spanIdx,
        startClientX: ev.clientX,
        ppm,
        minC,
        maxC: beltMaxCenter_mm(),
        onChange: opts.onStudioSpanChange,
        getSpan: () => {
          const cur = stages.find((s) => s.id === id && s.type === kind);
          if (!cur) return 400;
          if (kind === 'belt') {
            normalizeBeltStage(cur);
            return Number(cur.spans_mm?.[spanIdx]) || minC;
          }
          normalizeChainStage(cur);
          return Number(cur.spans_mm?.[spanIdx]) || minC;
        },
      };
      el.style.cursor = 'grabbing';
    });
    el.addEventListener('pointerup', () => {
      el.style.cursor = 'grab';
    });
  });
}

function drawGearTrainBlock(st, y0) {
  const m = st.module_mm ?? 2.5;
  const gearFill = ['#ecfdf5', '#ccfbf1', '#99f6e4', '#5eead4'];
  const { points, totalSpan_mm } = gearTrainLayout_mm(m, st.gears);
  const ppm = 0.52;
  const pad = 40;
  const cy = y0 + 95;
  const baseX = pad;
  const maxR = Math.max(...points.map((p) => p.r), 1) * ppm;
  const height = maxR * 2 + 118;

  let html = `<g class="studio-schematic__row" data-stage-type="gear_train" data-stage-id="${st.id}">
    <text x="14" y="${y0 + 12}" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Tren de engranajes · m = ${m} mm · ${st.gears.length} ruedas · contacto en primitivo</text>
    <line x1="10" x2="720" y1="${cy}" y2="${cy}" stroke="${COLORS.axis}" stroke-width="1" stroke-dasharray="5 4" opacity="0.75" />`;

  points.forEach((p, idx) => {
    const cx = baseX + p.x * ppm;
    const r = p.r * ppm;
    const fill = gearFill[idx % gearFill.length];
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${COLORS.gearStroke}" stroke-width="2" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COLORS.primitive}" stroke-width="1.4" stroke-dasharray="3 2" opacity="0.95" />
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">z${idx + 1}=${p.z}</text>`;
  });

  html += `<text x="14" y="${cy + maxR + 26}" font-size="9.5" fill="#475569" font-family="Inter,system-ui,sans-serif">Eje común · aᵢ = m(zᵢ+zᵢ₊₁)/2 · nₛₐₗ/nₑₙₜ = z₁/zₙ</text></g>`;

  const width = pad * 2 + totalSpan_mm * ppm + 48;
  return { html, height, width };
}

function drawBeltBlock(st, y0) {
  normalizeBeltStage(st);
  clampBeltSpansInPlace(st);
  const n = st.pulleys.length;
  const ppm = 0.42;
  const x0 = 118;
  const y = y0 + 118;
  const xsMm = beltCumulativeCenters_mm(st.pulleys, st.spans_mm);
  const xs = xsMm.map((xm) => x0 + xm * ppm);
  const rs = st.pulleys.map((p) => (Math.max(10, p.d) / 2) * ppm);
  const beltPath = n === 2 ? svgOpenBeltLoopPath(xs[0], y, rs[0], xs[1], rs[1]) : svgSerpentineOpenPath(xs, y, rs);
  const maxR = Math.max(...rs, 1);
  const height = maxR * 2 + 156;
  const lineL = xs[0] - rs[0] - 28;
  const lineR = xs[n - 1] + rs[n - 1] + 28;
  const ds = st.pulleys.map((p) => p.d.toFixed(0)).join(', ');
  const cs = st.spans_mm.map((c) => Number(c).toFixed(0)).join(', ');

  let html = `<g class="studio-schematic__row" data-stage-type="belt" data-stage-id="${st.id}">
    <text x="14" y="${y0 + 12}" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Correa · ${n} poleas · serpentín (esquema)</text>
    <text x="14" y="${y0 + 28}" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">Ø mm: ${ds} · tramos C mm: ${cs}</text>
    <line x1="${lineL}" x2="${lineR}" y1="${y}" y2="${y}" stroke="${COLORS.axis}" stroke-width="1" stroke-dasharray="5 4" opacity="0.75" />`;

  for (let i = 0; i < n; i++) {
    const cx = xs[i];
    const r = rs[i];
    html += `<line x1="${cx}" y1="${y - 48}" x2="${cx}" y2="${y + 48}" stroke="#475569" stroke-width="3" stroke-linecap="round" />
      <circle cx="${cx}" cy="${y}" r="${r}" fill="#ecfdf5" stroke="${COLORS.gearStroke}" stroke-width="2" />
      <circle cx="${cx}" cy="${y}" r="${r}" fill="none" stroke="${COLORS.primitive}" stroke-dasharray="3 2" stroke-width="1.5" />`;
    const lab = i === 0 ? 'motriz' : i === n - 1 ? 'conducida' : `polea ${i + 1}`;
    html += `<text x="${cx}" y="${y + r + 32}" text-anchor="middle" font-size="8.5" fill="#334155" font-family="Inter,system-ui,sans-serif">Ø${st.pulleys[i].d.toFixed(0)} · ${lab}</text>`;
  }

  if (n === 2) {
    html += `<path d="${beltPath}" fill="none" stroke="${COLORS.belt[0]}" stroke-width="10" stroke-linejoin="round" opacity="0.88" />
    <path d="${beltPath}" fill="none" stroke="${COLORS.belt[1]}" stroke-width="3" stroke-linejoin="round" stroke-dasharray="6 5" opacity="0.55" />`;
  } else {
    html += `<path d="${beltPath}" fill="none" stroke="${COLORS.belt[0]}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" opacity="0.88" />
    <path d="${beltPath}" fill="none" stroke="${COLORS.belt[1]}" stroke-width="2.8" stroke-linejoin="round" stroke-dasharray="6 5" opacity="0.55" />`;
  }

  const lastIdx = st.spans_mm.length - 1;
  const hitR = rs[n - 1] + 16;
  html += `<circle data-studio-span-drag="belt" data-stage-id="${st.id}" data-span-idx="${lastIdx}" data-ppm="${ppm}" cx="${xs[n - 1]}" cy="${y}" r="${hitR}" fill="rgba(13,148,136,0.12)" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="4 3" />
    <text x="${xs[n - 1]}" y="${y + rs[n - 1] + 52}" text-anchor="middle" font-size="9" font-weight="700" fill="#0f766e" font-family="Inter,system-ui,sans-serif">⇄ último C</text>
  </g>`;

  return { html, height, width: lineR + 56 };
}

function drawChainBlock(st, y0) {
  normalizeChainStage(st);
  clampChainSpansInPlace(st);
  const p = Math.max(4, st.pitch_mm ?? 19.05);
  const n = st.sprockets.length;
  const ppm = 0.38;
  const x0 = 118;
  const y = y0 + 118;
  const xsMm = chainSprocketCenters_mm(st.sprockets, p, st.spans_mm);
  const xs = xsMm.map((xm) => x0 + xm * ppm);
  const rs = st.sprockets.map((sp) => (chainPitchDiameter_mm(p, sp.z) / 2) * ppm);
  const beltPath = n === 2 ? svgOpenBeltLoopPath(xs[0], y, rs[0], xs[1], rs[1]) : svgSerpentineOpenPath(xs, y, rs);
  const maxR = Math.max(...rs, 1);
  const height = maxR * 2 + 150;
  const lineL = xs[0] - rs[0] - 28;
  const lineR = xs[n - 1] + rs[n - 1] + 28;
  const zs = st.sprockets.map((s) => s.z).join(', ');
  const cs = st.spans_mm.map((c) => Number(c).toFixed(0)).join(', ');

  let html = `<g class="studio-schematic__row" data-stage-type="chain" data-stage-id="${st.id}">
    <text x="14" y="${y0 + 12}" font-size="12" font-weight="800" fill="#0f172a" font-family="Inter,system-ui,sans-serif">Cadena · ${n} ruedas · p = ${p.toFixed(2)} mm</text>
    <text x="14" y="${y0 + 28}" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">z: ${zs} · C mm: ${cs}</text>
    <line x1="${lineL}" x2="${lineR}" y1="${y}" y2="${y}" stroke="${COLORS.axis}" stroke-width="1" stroke-dasharray="5 4" opacity="0.75" />`;

  for (let i = 0; i < n; i++) {
    const cx = xs[i];
    const r = rs[i];
    html += `<line x1="${cx}" y1="${y - 44}" x2="${cx}" y2="${y + 44}" stroke="#475569" stroke-width="3" stroke-linecap="round" />
      <circle cx="${cx}" cy="${y}" r="${r}" fill="#f8fafc" stroke="${COLORS.chain}" stroke-width="2" />
      <circle cx="${cx}" cy="${y}" r="${r}" fill="none" stroke="${COLORS.primitive}" stroke-dasharray="3 2" />
      <text x="${cx}" y="${y + r + 28}" text-anchor="middle" font-size="9" fill="#334155" font-family="Inter,system-ui,sans-serif">z${i + 1}=${st.sprockets[i].z}</text>`;
  }

  if (n === 2) {
    html += `<path d="${beltPath}" fill="none" stroke="${COLORS.chain}" stroke-width="6" stroke-linejoin="round" opacity="0.32" />
    <path d="${beltPath}" fill="none" stroke="${COLORS.chain}" stroke-width="2.2" stroke-linejoin="round" stroke-dasharray="2 5" />`;
  } else {
    html += `<path d="${beltPath}" fill="none" stroke="${COLORS.chain}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity="0.28" />
    <path d="${beltPath}" fill="none" stroke="${COLORS.chain}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="2 5" />`;
  }

  const lastIdx = st.spans_mm.length - 1;
  const hitR = rs[n - 1] + 16;
  html += `<circle data-studio-span-drag="chain" data-stage-id="${st.id}" data-span-idx="${lastIdx}" data-ppm="${ppm}" cx="${xs[n - 1]}" cy="${y}" r="${hitR}" fill="rgba(71,85,105,0.12)" stroke="#475569" stroke-width="1.5" stroke-dasharray="4 3" />
    <text x="${xs[n - 1]}" y="${y + rs[n - 1] + 48}" text-anchor="middle" font-size="9" font-weight="700" fill="#334155" font-family="Inter,system-ui,sans-serif">⇄ último C</text>
  </g>`;

  return { html, height, width: lineR + 56 };
}
