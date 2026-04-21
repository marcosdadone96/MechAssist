/**
 * Lienzo técnico Pro — estado, cinemática, geometría de correa 2D, validaciones.
 * Modelos educativos; no sustituyen catálogo OEM.
 */

import { chainPitchDiameter_mm } from './chains.js';
import { getChainById, chainAssemblyHints } from './chainCatalog.js';
import {
  svgSerpentineClosedPath,
  convexHullIndices,
  svgConvexExteriorBelt,
  convexExteriorBeltLengthMm,
} from './diagramGeometry.js';

/** @typedef {{ x: number; y: number }} Pt */

/** @type {'ok'|'warn'|'err'} */
export const VERDICT = { OK: 'ok', WARN: 'warn', ERR: 'err' };

/** Longitudes comerciales demo (mm) — paso 10 en rango habitual correas V */
export const DEMO_V_BELT_LENGTHS_MM = (() => {
  const a = [];
  for (let L = 500; L <= 5000; L += 10) a.push(L);
  return a;
})();

/**
 * @param {number} L_mm
 * @returns {{ L_nom: number; delta_mm: number; ok: boolean }}
 */
export function nearestCommercialVBeltLength(L_mm) {
  const L = Number(L_mm);
  if (!Number.isFinite(L) || L <= 0) return { L_nom: L_mm, delta_mm: 0, ok: false };
  let best = DEMO_V_BELT_LENGTHS_MM[0];
  let bd = Math.abs(L - best);
  for (const v of DEMO_V_BELT_LENGTHS_MM) {
    const d = Math.abs(L - v);
    if (d < bd) {
      bd = d;
      best = v;
    }
  }
  const tol = 15;
  return { L_nom: best, delta_mm: L - best, ok: bd <= tol };
}

/**
 * Tangente exterior entre circunferencias (correa abierta).
 * @returns {{ p0: Pt; p1: Pt; n: Pt } | null}
 */
export function outerTangentSegment(c0, r0, c1, r1, side) {
  const dx = c1.x - c0.x;
  const dy = c1.y - c0.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return null;
  if (Math.abs(r0 - r1) >= d - 1e-9) return null;
  const ux = dx / d;
  const uy = dy / d;
  const rrel = (r0 - r1) / d;
  const h = Math.sqrt(Math.max(0, 1 - rrel * rrel)) * side;
  const nx = rrel * ux - h * uy;
  const ny = rrel * uy + h * ux;
  return {
    p0: { x: c0.x + r0 * nx, y: c0.y + r0 * ny },
    p1: { x: c1.x + r1 * nx, y: c1.y + r1 * ny },
    n: { x: nx, y: ny },
  };
}

function angleOnCircle(c, p) {
  return Math.atan2(p.y - c.y, p.x - c.x);
}

/** Arco CCW length r * |Δθ| con Δθ en (-π, π] */
function arcLenCCW(r, t0, t1) {
  let d = t1 - t0;
  while (d <= -Math.PI) d += 2 * Math.PI;
  while (d > Math.PI) d -= 2 * Math.PI;
  return r * Math.abs(d);
}

/**
 * Construye lazo de correa abierta por poleas ordenadas; elige rama de tangente por continuidad.
 * @param {{ x: number; y: number }[]} centers
 * @param {number[]} radii
 * @returns {{ pathD: string; length_mm: number; reliable: boolean; note: string }}
 */
export function buildOpenBeltPath2D(centers, radii) {
  const n = centers.length;
  if (n < 2) return { pathD: '', length_mm: 0, reliable: false, note: 'Mínimo 2 poleas.' };
  if (n === 2) {
    const c0 = centers[0];
    const c1 = centers[1];
    const r0 = radii[0];
    const r1 = radii[1];
    const sPos = outerTangentSegment(c0, r0, c1, r1, +1);
    const sNeg = outerTangentSegment(c0, r0, c1, r1, -1);
    const seg = sPos || sNeg;
    if (!seg) return { pathD: '', length_mm: 0, reliable: false, note: 'Geometría inválida (una polea dentro de otra).' };
    const otherSide = seg === sPos ? -1 : +1;
    const opp = outerTangentSegment(c0, r0, c1, r1, otherSide);
    if (!opp) {
      return { pathD: '', length_mm: 0, reliable: false, note: 'No se pudo cerrar el lazo de correa entre las dos poleas.' };
    }
    const t0a = angleOnCircle(c0, seg.p0);
    const t1a = angleOnCircle(c1, seg.p1);
    const t0b = angleOnCircle(c0, opp.p0);
    const t1b = angleOnCircle(c1, opp.p1);
    const straight1 = Math.hypot(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y);
    const straight2 = Math.hypot(opp.p1.x - opp.p0.x, opp.p1.y - opp.p0.y);
    const arc0 = arcLenCCW(r0, t0a, t0b);
    const arc1 = arcLenCCW(r1, t1a, t1b);
    const len = straight1 + straight2 + arc0 + arc1;
    const pathD = [
      `M ${seg.p0.x.toFixed(2)} ${seg.p0.y.toFixed(2)}`,
      `L ${seg.p1.x.toFixed(2)} ${seg.p1.y.toFixed(2)}`,
      `A ${r1.toFixed(3)} ${r1.toFixed(3)} 0 0 1 ${opp.p1.x.toFixed(2)} ${opp.p1.y.toFixed(2)}`,
      `L ${opp.p0.x.toFixed(2)} ${opp.p0.y.toFixed(2)}`,
      `A ${r0.toFixed(3)} ${r0.toFixed(3)} 0 0 1 ${seg.p0.x.toFixed(2)} ${seg.p0.y.toFixed(2)}`,
      'Z',
    ].join(' ');
    return { pathD, length_mm: len, reliable: true, note: '' };
  }

  /** Triángulo / polígono: lazo exterior tangente al cierre convexo (como envolvente real). */
  const hullIdx = convexHullIndices(centers);
  if (hullIdx.length >= 3) {
    const path = svgConvexExteriorBelt(centers, radii, hullIdx);
    if (path) {
      const len = convexExteriorBeltLengthMm(centers, radii, hullIdx);
      let note = 'Correa/cadena en lazo exterior del cierre convexo (tangentes).';
      if (hullIdx.length < n) {
        note += ' Piezas dentro del polígono no forman parte de este contorno; valide trazado interior si aplica.';
      }
      return {
        pathD: path,
        length_mm: len,
        reliable: hullIdx.length === n,
        note,
      };
    }
  }

  /** Colineales (caso degenerado del casco): serpentín proyectado a Y media y orden por X. */
  const ys = centers.map((c) => c.y);
  const xsRaw = centers.map((c) => c.x);
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const yVar = Math.max(...ys.map((yy) => Math.abs(yy - yMean)));
  const xsSpan = Math.max(...xsRaw) - Math.min(...xsRaw);

  const geomCenters = centers.map((c) => ({ x: c.x, y: yMean }));
  const projected = yVar > Math.max(8, 0.02 * Math.max(xsSpan, 60));

  const orderIdx = geomCenters.map((_, i) => i).sort((i, j) => geomCenters[i].x - geomCenters[j].x);
  const xs = orderIdx.map((i) => geomCenters[i].x);
  const rs = orderIdx.map((i) => radii[i]);
  const path = svgSerpentineClosedPath(xs, yMean, rs);

  let len = 0;
  for (let k = 0; k < n - 1; k++) {
    const dx = xs[k + 1] - xs[k];
    len += Math.sqrt(Math.max(0, dx * dx - (rs[k + 1] - rs[k]) ** 2));
  }
  len *= 2;
  for (let k = 0; k < n; k++) {
    len += Math.PI * rs[k];
  }

  let note = 'Serpentín cerrado (poleas casi alineadas; orden por X).';
  if (projected) note += ' Dispersión en Y: trazo en plano medio (referencia).';

  return {
    pathD: path,
    length_mm: len,
    reliable: !projected,
    note,
  };
}

/** Carga de rotura demo kN ~ f(paso) — orientativa */
export function demoChainBreakingLoad_kN(pitch_mm) {
  const p = Number(pitch_mm) || 12.7;
  return Math.max(4, 12 + (p - 6) * 2.2);
}

/** Lewis simplificado: σ ≈ 2T/(b m² z Y) con Y aproximado */
export function gearBendingStress_MPa(T_Nm, m_mm, z, faceWidth_mm) {
  const m = Math.max(0.25, m_mm);
  const zf = Math.max(6, z);
  const b = Math.max(4, faceWidth_mm);
  const Y = 0.3 + 0.4 / zf;
  const d_m = (m * zf) / 1000;
  const Ft = (2 * T_Nm) / Math.max(1e-6, d_m);
  return Ft / (b * m * Y);
}

export function gearContactHint_MPa(T_Nm, m_mm, z1, z2, faceWidth_mm) {
  const m = Math.max(0.25, m_mm);
  const d1 = (m * z1) / 1000;
  const d2 = (m * z2) / 1000;
  const b = Math.max(4, faceWidth_mm) / 1000;
  const Ft = (2 * T_Nm) / Math.max(1e-6, d1);
  const rho1 = d1 / 2;
  const rho2 = d2 / 2;
  const E = 210e9;
  const inv = 1 / rho1 + 1 / rho2;
  const sigmaH = Math.sqrt((Ft * E * inv) / (Math.PI * b * Math.sin((20 * Math.PI) / 180) * Math.cos((20 * Math.PI) / 180)));
  return sigmaH / 1e6;
}

/**
 * @typedef {{
 *   id: number;
 *   kind: 'gear'|'pulley'|'sprocket';
 *   x: number;
 *   y: number;
 *   z?: number;
 *   module_mm?: number;
 *   faceWidth_mm?: number;
 *   d_mm?: number;
 *   pitch_mm?: number;
 *   chainRefId?: string;
 *   isMotor?: boolean;
 *   phase_rad?: number;
 * }} TxNode
 */

/**
 * @typedef {{
 *   nodes: TxNode[];
 *   meshes: { a: number; b: number }[];
 *   beltRuns: { id: string; nodeIds: number[]; kind: 'v'|'sync'; slip: number }[];
 *   chainRuns: { id: string; nodeIds: number[]; chainRefId: string }[];
 *   selectedId: number | null;
 *   beltPickOrder: number[];
 *   chainPickOrder: number[];
 *   nextId: number;
 * }} TxState
 */

export function createInitialState() {
  return {
    nodes: [],
    meshes: [],
    beltRuns: [],
    chainRuns: [],
    selectedId: null,
    beltPickOrder: [],
    chainPickOrder: [],
    nextId: 1,
  };
}

export function gearPrimitiveDiameter_mm(m, z) {
  return m * z;
}

export function getNodeD_mm(node) {
  if (node.kind === 'gear') {
    const m = Math.max(0.25, node.module_mm ?? 2.5);
    const z = Math.max(6, node.z ?? 20);
    return m * z;
  }
  if (node.kind === 'pulley') return Math.max(10, node.d_mm ?? 100);
  const p = node.pitch_mm ?? getChainById(node.chainRefId || '')?.pitch_mm ?? 12.7;
  const z = Math.max(6, node.z ?? 17);
  return chainPitchDiameter_mm(p, z);
}

/** Distancia entre centros teórica engrane exterior */
export function theoreticalMeshCenter_mm(m, z1, z2) {
  return (m * (Math.max(6, z1) + Math.max(6, z2))) / 2;
}

/**
 * Ajusta posición de nodeId acercándolo a otro engranaje compatible (snap magnético).
 * @returns {boolean} si hubo snap
 */
export function snapGearToPeer(state, nodeId, snapPx = 14) {
  const node = state.nodes.find((n) => n.id === nodeId);
  if (!node || node.kind !== 'gear') return false;
  const m = Math.max(0.25, node.module_mm ?? 2.5);
  const z = Math.max(6, node.z ?? 20);
  let best = null;
  let bestD = Infinity;
  for (const o of state.nodes) {
    if (o.id === node.id || o.kind !== 'gear') continue;
    const mo = Math.max(0.25, o.module_mm ?? 2.5);
    if (Math.abs(mo - m) > 0.01) continue;
    const zo = Math.max(6, o.z ?? 20);
    const a = theoreticalMeshCenter_mm(m, z, zo);
    const dx = o.x - node.x;
    const dy = o.y - node.y;
    const d = Math.hypot(dx, dy);
    const err = Math.abs(d - a);
    if (err < snapPx && err < bestD) {
      bestD = err;
      best = { o, a, dx, dy, d };
    }
  }
  if (!best) return false;
  const u = best.d > 1e-6 ? best.dx / best.d : 1;
  const v = best.d > 1e-6 ? best.dy / best.d : 0;
  node.x = best.o.x - u * best.a;
  node.y = best.o.y - v * best.a;
  if (!state.meshes.some((e) => (e.a === node.id && e.b === best.o.id) || (e.b === node.id && e.a === best.o.id))) {
    state.meshes.push({ a: node.id, b: best.o.id });
  }
  return true;
}

export function addNode(state, kind, x, y) {
  const id = state.nextId++;
  if (kind === 'gear') {
    state.nodes.push({
      id,
      kind: 'gear',
      x,
      y,
      z: 24,
      module_mm: 2.5,
      faceWidth_mm: 18,
      isMotor: false,
      phase_rad: 0,
    });
  } else if (kind === 'pulley') {
    state.nodes.push({
      id,
      kind: 'pulley',
      x,
      y,
      d_mm: 120,
      isMotor: false,
      phase_rad: 0,
    });
  } else {
    state.nodes.push({
      id,
      kind: 'sprocket',
      x,
      y,
      z: 17,
      chainRefId: 'iso-08b-1',
      pitch_mm: getChainById('iso-08b-1')?.pitch_mm ?? 12.7,
      isMotor: false,
      phase_rad: 0,
    });
  }
  state.selectedId = id;
  return id;
}

export function removeNode(state, id) {
  state.nodes = state.nodes.filter((n) => n.id !== id);
  state.meshes = state.meshes.filter((e) => e.a !== id && e.b !== id);
  state.beltRuns = state.beltRuns.map((r) => ({
    ...r,
    nodeIds: r.nodeIds.filter((nid) => nid !== id),
  })).filter((r) => r.nodeIds.length >= 2);
  state.chainRuns = state.chainRuns.map((r) => ({
    ...r,
    nodeIds: r.nodeIds.filter((nid) => nid !== id),
  })).filter((r) => r.nodeIds.length >= 2);
  if (state.selectedId === id) state.selectedId = null;
}

/** Un solo motor */
export function setMotor(state, id) {
  for (const n of state.nodes) n.isMotor = n.id === id;
}

/**
 * @param {TxState} state
 * @param {number} n0_rpm
 * @param {number} T0_Nm
 */
export function propagateKinematics(state, n0_rpm, T0_Nm) {
  const motor = state.nodes.find((n) => n.isMotor);
  const out = {
    byId: /** @type {Record<number, { n_rpm: number; T_Nm: number; omega: number }>} */ ({}),
    formulas: /** @type {string[]} */ ([]),
  };
  if (!motor) {
    out.formulas.push('Defina un **motor**: seleccione un elemento y pulse «Marcar motor».');
    return out;
  }

  for (const n of state.nodes) {
    out.byId[n.id] = { n_rpm: 0, T_Nm: 0, omega: 0 };
  }

  /** @type {{ id: number; n: number; T: number; sign: number }[]} */
  const q = [{ id: motor.id, n: n0_rpm, T: T0_Nm, sign: 1 }];
  out.byId[motor.id] = {
    n_rpm: n0_rpm,
    T_Nm: T0_Nm,
    omega: (n0_rpm * 2 * Math.PI) / 60,
  };
  out.formulas.push(
    `Motor (#${motor.id}): n = ${n0_rpm.toFixed(1)} min⁻¹, T = ${T0_Nm.toFixed(2)} N·m → ω = 2π·n/60 = ${out.byId[motor.id].omega.toFixed(3)} rad/s.`,
  );

  /** @type {Set<number>} */
  const seen = new Set([motor.id]);

  while (q.length) {
    const cur = q.shift();
    if (!cur) break;
    const curNode = state.nodes.find((n) => n.id === cur.id);
    if (!curNode) continue;

    for (const e of state.meshes) {
      if (e.a !== cur.id && e.b !== cur.id) continue;
      const otherId = e.a === cur.id ? e.b : e.a;
      if (seen.has(otherId)) continue;
      const a = state.nodes.find((n) => n.id === e.a);
      const b = state.nodes.find((n) => n.id === e.b);
      if (!a || !b || a.kind !== 'gear' || b.kind !== 'gear') continue;
      const zCur = Math.max(6, (cur.id === a.id ? a : b).z ?? 20);
      const zOth = Math.max(6, (cur.id === a.id ? b : a).z ?? 20);
      const nAbs = Math.abs(cur.n);
      const nNext = nAbs * (zCur / zOth);
      const TNext = cur.T * (zOth / zCur);
      const newSign = -cur.sign;
      seen.add(otherId);
      out.byId[otherId] = {
        n_rpm: nNext * newSign,
        T_Nm: Math.abs(TNext),
        omega: (nNext * newSign * 2 * Math.PI) / 60,
      };
      out.formulas.push(
        `Engranaje: n₂ = n₁·z₁/z₂ = ${nAbs.toFixed(2)}·${zCur}/${zOth} = ${nNext.toFixed(2)} min⁻¹; T₂ = T₁·z₂/z₁ = ${Math.abs(TNext).toFixed(2)} N·m (sentido visual alternado).`,
      );
      q.push({ id: otherId, n: nNext, T: Math.abs(TNext), sign: newSign });
    }

    for (const br of state.beltRuns) {
      const idx = br.nodeIds.indexOf(cur.id);
      if (idx < 0 || idx >= br.nodeIds.length - 1) continue;
      const idNext = br.nodeIds[idx + 1];
      if (seen.has(idNext)) continue;
      const pa = state.nodes.find((n) => n.id === br.nodeIds[idx]);
      const pb = state.nodes.find((n) => n.id === idNext);
      if (!pa || !pb) continue;
      const da = getNodeD_mm(pa);
      const db = getNodeD_mm(pb);
      const slip = br.kind === 'sync' ? 0 : Math.max(0, Math.min(0.08, br.slip ?? 0.015));
      const eff = 1 - slip;
      const nAbs = Math.abs(cur.n);
      const nNext = nAbs * (da / db) * eff;
      const Tnext = cur.T * (db / da) * (br.kind === 'sync' ? 1 : 0.98);
      seen.add(idNext);
      out.byId[idNext] = {
        n_rpm: nNext * cur.sign,
        T_Nm: Math.abs(Tnext),
        omega: (nNext * cur.sign * 2 * Math.PI) / 60,
      };
      out.formulas.push(
        br.kind === 'sync'
          ? `Correa síncrona: n₂ = n₁·d₁/d₂ = ${nAbs.toFixed(2)}·${da.toFixed(1)}/${db.toFixed(1)} = ${(nAbs * (da / db)).toFixed(2)} min⁻¹.`
          : `Correa V: n₂ ≈ n₁·(d₁/d₂)·(1−s), s=${(slip * 100).toFixed(2)}% → ${nNext.toFixed(2)} min⁻¹.`,
      );
      q.push({ id: idNext, n: nNext, T: Math.abs(Tnext), sign: cur.sign });
    }

    for (const cr of state.chainRuns) {
      const idx = cr.nodeIds.indexOf(cur.id);
      if (idx < 0 || idx >= cr.nodeIds.length - 1) continue;
      const idNext = cr.nodeIds[idx + 1];
      if (seen.has(idNext)) continue;
      const pa = state.nodes.find((n) => n.id === cr.nodeIds[idx]);
      const pb = state.nodes.find((n) => n.id === idNext);
      if (!pa || !pb) continue;
      const Da = getNodeD_mm(pa);
      const Db = getNodeD_mm(pb);
      const nAbs = Math.abs(cur.n);
      const nNext = nAbs * (Da / Db);
      const Tnext = cur.T * (Db / Da);
      seen.add(idNext);
      out.byId[idNext] = {
        n_rpm: nNext * cur.sign,
        T_Nm: Math.abs(Tnext),
        omega: (nNext * cur.sign * 2 * Math.PI) / 60,
      };
      out.formulas.push(
        `Cadena: n₂ = n₁·D₁/D₂ = ${nAbs.toFixed(2)}·${Da.toFixed(1)}/${Db.toFixed(1)} = ${nNext.toFixed(2)} min⁻¹; T₂ = ${Math.abs(Tnext).toFixed(2)} N·m.`,
      );
      q.push({ id: idNext, n: nNext, T: Math.abs(Tnext), sign: cur.sign });
    }
  }

  return out;
}

/**
 * @param {TxState} state
 * @param {ReturnType<typeof propagateKinematics>} kin
 */
export function computeVerdicts(state, kin) {
  /** @type {{ level: 'ok'|'warn'|'err'; text: string }[]} */
  const items = [];

  const motor = state.nodes.find((n) => n.isMotor);
  if (!motor) {
    items.push({ level: VERDICT.ERR, text: 'Sin motor definido en el lienzo.' });
    return { items, worst: VERDICT.ERR };
  }

  for (const e of state.meshes) {
    const a = state.nodes.find((n) => n.id === e.a);
    const b = state.nodes.find((n) => n.id === e.b);
    if (!a || !b || a.kind !== 'gear' || b.kind !== 'gear') continue;
    const za = Math.max(6, a.z ?? 20);
    const zb = Math.max(6, b.z ?? 20);
    const ma = Math.max(0.25, a.module_mm ?? 2.5);
    const mb = Math.max(0.25, b.module_mm ?? 2.5);
    if (Math.abs(ma - mb) > 0.02) {
      items.push({ level: VERDICT.ERR, text: `Engranaje ${a.id}-${b.id}: módulos distintos (${ma} ≠ ${mb}) — interferencia de tallado.` });
    }
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const aTh = theoreticalMeshCenter_mm(ma, za, zb);
    if (Math.abs(d - aTh) > 2) {
      items.push({
        level: VERDICT.WARN,
        text: `Engranaje ${a.id}-${b.id}: a=${d.toFixed(1)} mm vs a₀=m(z₁+z₂)/2=${aTh.toFixed(1)} mm — reajuste posición o valide holgura.`,
      });
    }
    const Tuse = Math.max(kin.byId[a.id]?.T_Nm ?? 0, kin.byId[b.id]?.T_Nm ?? 0, 1e-6);
    const sigmaB = gearBendingStress_MPa(Tuse, ma, za, a.faceWidth_mm ?? 18);
    const sigmaH = gearContactHint_MPa(Tuse, ma, za, zb, a.faceWidth_mm ?? 18);
    if (sigmaB > 320) items.push({ level: VERDICT.ERR, text: `Flexión aprox. σF≈${sigmaB.toFixed(0)} MPa > 320 MPa (acero templado demo) — riesgo de fractura.` });
    else if (sigmaB > 220) items.push({ level: VERDICT.WARN, text: `Flexión σF≈${sigmaB.toFixed(0)} MPa elevada — valide con AGMA/ISO 6336 y acabado real.` });
    if (sigmaH > 1200) items.push({ level: VERDICT.ERR, text: `Presión de contacto orientativa σH≈${sigmaH.toFixed(0)} MPa — límite habitual superado (modelo simplificado).` });
    else if (sigmaH > 850) items.push({ level: VERDICT.WARN, text: `σH≈${sigmaH.toFixed(0)} MPa — revise endurecimiento y curvatura.` });
  }

  for (const br of state.beltRuns) {
    const centers = br.nodeIds.map((id) => {
      const n = state.nodes.find((x) => x.id === id);
      return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
    });
    const radii = br.nodeIds.map((id) => getNodeD_mm(state.nodes.find((x) => x.id === id)) / 2);
    const geo = buildOpenBeltPath2D(centers, radii);
    const Lgeom = geo.length_mm;
    const Leff = br.kind === 'sync' ? Lgeom : Lgeom * (1 + (br.slip ?? 0.015));
    const comm = nearestCommercialVBeltLength(Leff);
    if (!geo.reliable) items.push({ level: VERDICT.WARN, text: `Correa ${br.id}: ${geo.note}` });
    else if (br.kind === 'v' && !comm.ok) {
      items.push({
        level: VERDICT.WARN,
        text: `Correa V ${br.id}: L efectiva ≈${Leff.toFixed(0)} mm no encaja en paso comercial ±15 mm (nominal demo ${comm.L_nom} mm). Desplace poleas Δ≈${comm.delta_mm.toFixed(0)} mm en tramo libre o elija otra referencia.`,
      });
    }
  }

  for (const cr of state.chainRuns) {
    const ids = cr.nodeIds;
    if (ids.length < 2) continue;
    const n0n = state.nodes.find((x) => x.id === ids[0]);
    const n1n = state.nodes.find((x) => x.id === ids[1]);
    if (!n0n || !n1n) continue;
    const p = n0n.pitch_mm ?? getChainById(cr.chainRefId)?.pitch_mm ?? 12.7;
    const z0 = Math.max(6, n0n.z ?? 17);
    const z1 = Math.max(6, n1n.z ?? 17);
    const C = Math.hypot(n1n.x - n0n.x, n1n.y - n0n.y);
    const Cd = C / p;
    const inv = ((z1 - z0) * (z1 - z0)) / (4 * Math.PI * Math.PI * Cd);
    const Lp = 2 * Cd + (z0 + z1) / 2 + inv;
    const LpInt = Math.ceil(Lp);
    const hints = chainAssemblyHints(Lp);
    if (Math.abs(Lp - Math.round(Lp)) > 0.12) {
      items.push({
        level: VERDICT.WARN,
        text: `Cadena ${cr.id}: L en pasos = ${Lp.toFixed(3)} → entero de montaje recomendado **${LpInt}** (catálogo por paso p=${p.toFixed(3)} mm).`,
      });
    }
    if (hints.offsetLink_recommended) {
      items.push({
        level: VERDICT.WARN,
        text: `Cadena ${cr.id}: número impar de pasos al cerrar bucle — valorar **eslabón desplazado** o variar C ±${(p * 0.5).toFixed(1)} mm.`,
      });
    }
    const zMin = Math.min(...ids.map((id) => Math.max(6, state.nodes.find((x) => x.id === id)?.z ?? 17)));
    if (zMin < 17) {
      items.push({
        level: VERDICT.WARN,
        text: `Efecto poligonal: z_min=${zMin} < 17 — fluctuación de tensión/velocidad; piñón mayor recomendado.`,
      });
    }
    const Fbreak_kN = demoChainBreakingLoad_kN(p);
    const T = kin.byId[ids[0]]?.T_Nm ?? 50;
    const D0_m = getNodeD_mm(n0n) / 1000;
    const Ft = (2 * T) / Math.max(1e-6, D0_m);
    const FkN = Ft / 1000;
    if (FkN > Fbreak_kN * 0.35) {
      items.push({
        level: VERDICT.ERR,
        text: `Cadena ${cr.id}: tensión estimada ≈${FkN.toFixed(2)} kN vs rotura demo ~${Fbreak_kN.toFixed(1)} kN — margen bajo (<35% rotura).`,
      });
    }
  }

  if (!items.length) items.push({ level: VERDICT.OK, text: 'Sin incidencias críticas en el modelo actual (validación orientativa).' });

  const worst = items.some((x) => x.level === VERDICT.ERR)
    ? VERDICT.ERR
    : items.some((x) => x.level === VERDICT.WARN)
      ? VERDICT.WARN
      : VERDICT.OK;
  return { items, worst };
}
