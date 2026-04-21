/**
 * Cinemática y layout para el estudio modular Pro (engranajes en tren, correa, cadena).
 */

import { chainPitchDiameter_mm } from './chains.js';

/**
 * Tren de engranajes cilíndricos rectos en serie (contacto exterior por primitivos).
 * n_salida / n_entrada = z_primero / z_último (los intermedios son intermedios / idlers en el producto).
 * @param {{ z: number }[]} gears
 */
export function gearTrainSpeedRatio(gears) {
  if (!gears?.length) return 1;
  const z0 = Math.max(6, gears[0].z);
  const zN = Math.max(6, gears[gears.length - 1].z);
  return z0 / zN;
}

/**
 * Posiciones de centros en mm sobre eje X; círculos tangentes (a = m(z_i+z_{i+1})/2).
 * @param {number} module_mm
 * @param {{ z: number }[]} gears
 */
export function gearTrainLayout_mm(module_mm, gears) {
  const m = Math.max(0.25, Number(module_mm) || 2.5);
  const pts = [];
  let x = 0;
  for (let i = 0; i < gears.length; i++) {
    const z = Math.max(6, Math.round(gears[i].z));
    const r = (m * z) / 2;
    pts.push({ x, z, r, i });
    if (i < gears.length - 1) {
      const zn = Math.max(6, Math.round(gears[i + 1].z));
      const a = (m * (z + zn)) / 2;
      x += a;
    }
  }
  return { points: pts, totalSpan_mm: x, module_mm: m };
}

/**
 * C mínima orientativa para tramo abierto (tangentes existentes).
 */
export function beltMinCenter_mm(d1, d2) {
  const r1 = Math.max(5, Number(d1) || 100) / 2;
  const r2 = Math.max(5, Number(d2) || 100) / 2;
  return Math.abs(r1 - r2) + 10;
}

export function beltMaxCenter_mm() {
  return 2500;
}

export function chainSpanMin_mm(pitch_mm, zA, zB) {
  const p = Math.max(4, Number(pitch_mm) || 19.05);
  const D1 = chainPitchDiameter_mm(p, Math.max(6, zA));
  const D2 = chainPitchDiameter_mm(p, Math.max(6, zB));
  return Math.max(2 * p, beltMinCenter_mm(D1, D2));
}

function syncBeltLegacyFields(st) {
  if (st.type !== 'belt' || !st.pulleys?.length) return;
  st.d1 = st.pulleys[0].d;
  st.d2 = st.pulleys[st.pulleys.length - 1].d;
  st.center_mm = st.spans_mm?.[0] ?? st.center_mm ?? 400;
}

function syncChainLegacyFields(st) {
  if (st.type !== 'chain' || !st.sprockets?.length) return;
  st.z1 = st.sprockets[0].z;
  st.z2 = st.sprockets[st.sprockets.length - 1].z;
  st.center_mm = st.spans_mm?.[0] ?? st.center_mm ?? 400;
}

/**
 * Garantiza pulleys[] y spans_mm[] (N-1 tramos). Compatible con d1,d2,center_mm antiguos.
 * @param {object} st
 */
export function normalizeBeltStage(st) {
  if (st.type !== 'belt') return;
  if (
    Array.isArray(st.pulleys) &&
    st.pulleys.length >= 2 &&
    Array.isArray(st.spans_mm) &&
    st.spans_mm.length === st.pulleys.length - 1
  ) {
    syncBeltLegacyFields(st);
    return;
  }
  const d1 = Math.max(10, st.d1 ?? 125);
  const d2 = Math.max(10, st.d2 ?? 250);
  const c = Math.max(beltMinCenter_mm(d1, d2), st.center_mm ?? 400);
  st.pulleys = [{ d: d1 }, { d: d2 }];
  st.spans_mm = [c];
  syncBeltLegacyFields(st);
}

export function clampBeltSpansInPlace(st) {
  normalizeBeltStage(st);
  const { pulleys, spans_mm } = st;
  for (let i = 0; i < spans_mm.length; i++) {
    const lo = beltMinCenter_mm(pulleys[i].d, pulleys[i + 1].d);
    const hi = beltMaxCenter_mm();
    spans_mm[i] = Math.min(hi, Math.max(lo, Number(spans_mm[i]) || lo));
  }
  syncBeltLegacyFields(st);
}

export function beltCumulativeCenters_mm(pulleys, spans_mm) {
  const xs = [0];
  let acc = 0;
  for (let i = 0; i < pulleys.length - 1; i++) {
    acc += Number(spans_mm[i]) || 0;
    xs.push(acc);
  }
  return xs;
}

/** Inserta una polea antes de la última (tensor/intermedia) y reparte el último tramo. */
export function addIntermediateBeltPulley(st) {
  normalizeBeltStage(st);
  if (st.pulleys.length < 2) return;
  const dBefore = st.pulleys[st.pulleys.length - 2].d;
  const dEnd = st.pulleys[st.pulleys.length - 1].d;
  const oldSpan = st.spans_mm[st.spans_mm.length - 1];
  const dMid = Math.max(80, Math.round((dBefore + dEnd) / 2));
  st.pulleys.splice(st.pulleys.length - 1, 0, { d: dMid });
  st.spans_mm.pop();
  const half = (Number(oldSpan) || 400) * 0.5;
  st.spans_mm.push(
    Math.max(beltMinCenter_mm(dBefore, dMid), half),
    Math.max(beltMinCenter_mm(dMid, dEnd), half),
  );
  clampBeltSpansInPlace(st);
}

/** Quita la penúltima polea (intermedia) y fusiona tramos. */
export function removeIntermediateBeltPulley(st) {
  normalizeBeltStage(st);
  if (st.pulleys.length <= 2) return;
  const merged = (Number(st.spans_mm[st.spans_mm.length - 2]) || 0) + (Number(st.spans_mm[st.spans_mm.length - 1]) || 0);
  st.pulleys.splice(st.pulleys.length - 2, 1);
  st.spans_mm.pop();
  st.spans_mm[st.spans_mm.length - 1] = merged;
  clampBeltSpansInPlace(st);
}

/**
 * @param {object} st
 */
export function normalizeChainStage(st) {
  if (st.type !== 'chain') return;
  if (
    Array.isArray(st.sprockets) &&
    st.sprockets.length >= 2 &&
    Array.isArray(st.spans_mm) &&
    st.spans_mm.length === st.sprockets.length - 1
  ) {
    syncChainLegacyFields(st);
    return;
  }
  const p = Math.max(4, st.pitch_mm ?? 19.05);
  const z1 = Math.max(6, st.z1 ?? 17);
  const z2 = Math.max(6, st.z2 ?? 25);
  const lo = chainSpanMin_mm(p, z1, z2);
  const c = Math.max(lo, st.center_mm ?? 400);
  st.pitch_mm = p;
  st.sprockets = [{ z: z1 }, { z: z2 }];
  st.spans_mm = [c];
  syncChainLegacyFields(st);
}

export function clampChainSpansInPlace(st) {
  normalizeChainStage(st);
  const p = Math.max(4, st.pitch_mm ?? 19.05);
  const { sprockets, spans_mm } = st;
  for (let i = 0; i < spans_mm.length; i++) {
    const lo = chainSpanMin_mm(p, sprockets[i].z, sprockets[i + 1].z);
    const hi = beltMaxCenter_mm();
    spans_mm[i] = Math.min(hi, Math.max(lo, Number(spans_mm[i]) || lo));
  }
  syncChainLegacyFields(st);
}

export function chainSprocketCenters_mm(sprockets, pitch_mm, spans_mm) {
  const xs = [0];
  let acc = 0;
  for (let i = 0; i < sprockets.length - 1; i++) {
    acc += Number(spans_mm[i]) || 0;
    xs.push(acc);
  }
  return xs;
}

export function addIntermediateChainSprocket(st) {
  normalizeChainStage(st);
  if (st.sprockets.length < 2) return;
  const p = Math.max(4, st.pitch_mm ?? 19.05);
  const zA = st.sprockets[st.sprockets.length - 2].z;
  const zB = st.sprockets[st.sprockets.length - 1].z;
  const oldSpan = st.spans_mm[st.spans_mm.length - 1];
  const zMid = Math.max(6, Math.round((zA + zB) / 2));
  st.sprockets.splice(st.sprockets.length - 1, 0, { z: zMid });
  st.spans_mm.pop();
  const half = (Number(oldSpan) || 400) * 0.5;
  st.spans_mm.push(
    Math.max(chainSpanMin_mm(p, zA, zMid), half),
    Math.max(chainSpanMin_mm(p, zMid, zB), half),
  );
  clampChainSpansInPlace(st);
}

export function removeIntermediateChainSprocket(st) {
  normalizeChainStage(st);
  if (st.sprockets.length <= 2) return;
  const merged =
    (Number(st.spans_mm[st.spans_mm.length - 2]) || 0) + (Number(st.spans_mm[st.spans_mm.length - 1]) || 0);
  st.sprockets.splice(st.sprockets.length - 2, 1);
  st.spans_mm.pop();
  st.spans_mm[st.spans_mm.length - 1] = merged;
  clampChainSpansInPlace(st);
}

export function addIntermediateGear(st) {
  if (st.type !== 'gear_train' || st.gears.length < 2) return;
  const zA = st.gears[st.gears.length - 2].z;
  const zB = st.gears[st.gears.length - 1].z;
  st.gears.splice(st.gears.length - 1, 0, { z: Math.max(6, Math.round((zA + zB) / 2)) });
}

export function removeIntermediateGear(st) {
  if (st.type !== 'gear_train' || st.gears.length <= 2) return;
  st.gears.splice(st.gears.length - 2, 1);
}

/**
 * @param {object} s
 * @param {'gear_train'|'belt'|'chain'} s.type
 */
export function stageOutputRatio(s) {
  if (s.type === 'gear_train') {
    return gearTrainSpeedRatio(s.gears);
  }
  if (s.type === 'belt') {
    normalizeBeltStage(s);
    const d0 = Math.max(10, s.pulleys[0].d);
    const dN = Math.max(10, s.pulleys[s.pulleys.length - 1].d);
    return d0 / dN;
  }
  if (s.type === 'chain') {
    normalizeChainStage(s);
    const p = Math.max(4, s.pitch_mm ?? 19.05);
    const z0 = Math.max(6, s.sprockets[0].z);
    const zN = Math.max(6, s.sprockets[s.sprockets.length - 1].z);
    const D0 = chainPitchDiameter_mm(p, z0);
    const DN = chainPitchDiameter_mm(p, zN);
    return D0 / DN;
  }
  return 1;
}

/**
 * @param {number} n0
 * @param {object[]} stages
 */
export function cascadeSpeeds(n0, stages) {
  let n = n0;
  const rows = [];
  for (const s of stages) {
    const r = stageOutputRatio(s);
    const nNext = n * r;
    rows.push({ stage: s, ratio: r, n_in: n, n_out: nNext });
    n = nNext;
  }
  const total = rows.reduce((a, x) => a * x.ratio, 1);
  return { rows, n_final: n, total_ratio: total };
}
