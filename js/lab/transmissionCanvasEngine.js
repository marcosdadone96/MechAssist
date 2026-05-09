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
  buildConvexBeltSegments,
  arcAlongCircleExterior,
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
  /* Tangente exterior: sin(theta) = (R1 - R2) / d */
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

/**
 * Tangente interior (cruzada) entre circunferencias.
 * Se usa para contacto "back-side" (cara externa) en polea tensora.
 * @returns {{ p0: Pt; p1: Pt; n: Pt } | null}
 */
export function innerTangentSegment(c0, r0, c1, r1, side) {
  const dx = c1.x - c0.x;
  const dy = c1.y - c0.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return null;
  if (r0 + r1 >= d - 1e-9) return null;
  const alpha = Math.atan2(dy, dx);
  /* Tangente interior: beta = acos((R1 + R2)/d) */
  const beta = Math.acos(Math.max(-1, Math.min(1, (r0 + r1) / d)));
  const ang = alpha + side * beta;
  const nx = Math.cos(ang);
  const ny = Math.sin(ang);
  return {
    p0: { x: c0.x + r0 * nx, y: c0.y + r0 * ny },
    p1: { x: c1.x - r1 * nx, y: c1.y - r1 * ny },
    n: { x: nx, y: ny },
  };
}

function orient(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function onSegment(a, b, p) {
  return (
    Math.min(a.x, b.x) - 1e-9 <= p.x &&
    p.x <= Math.max(a.x, b.x) + 1e-9 &&
    Math.min(a.y, b.y) - 1e-9 <= p.y &&
    p.y <= Math.max(a.y, b.y) + 1e-9
  );
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  if ((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) {
    if ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0)) return true;
  }
  if (Math.abs(o1) < 1e-9 && onSegment(a, b, c)) return true;
  if (Math.abs(o2) < 1e-9 && onSegment(a, b, d)) return true;
  if (Math.abs(o3) < 1e-9 && onSegment(c, d, a)) return true;
  if (Math.abs(o4) < 1e-9 && onSegment(c, d, b)) return true;
  return false;
}

function hasSelfIntersections(segments) {
  const n = segments.length;
  for (let i = 0; i < n; i++) {
    const a = segments[i];
    for (let j = i + 1; j < n; j++) {
      if (j === i || j === (i + 1) % n || i === (j + 1) % n) continue;
      const b = segments[j];
      if (segmentsIntersect(a.p0, a.p1, b.p0, b.p1)) return true;
    }
  }
  return false;
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

/** @typedef {{ x: number; y: number; r: number; inward: boolean; id?: number }} IdlerSpec */

function closestPointOnSegmentDetailed(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const vv = vx * vx + vy * vy;
  const wx = px - ax;
  const wy = py - ay;
  const t = vv > 1e-18 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv)) : 0;
  const qx = ax + t * vx;
  const qy = ay + t * vy;
  const dist = Math.hypot(px - qx, py - qy);
  return { qx, qy, t, dist };
}

/** Intersección del segmento AB con la circunferencia (ox,oy,r); parámetro t en [0,1]. */
function segmentCircleIntersections(ax, ay, bx, by, ox, oy, r) {
  const dx = bx - ax;
  const dy = by - ay;
  const fx = ax - ox;
  const fy = ay - oy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  if (a < 1e-18) return [];
  const disc = b * b - 4 * a * c;
  if (disc < -1e-11) return [];
  const sd = Math.sqrt(Math.max(0, disc));
  const ts = [(-b - sd) / (2 * a), (-b + sd) / (2 * a)].filter((tv) => tv >= -1e-9 && tv <= 1 + 1e-9);
  const uniq = [...new Set(ts.map((tv) => +tv.toFixed(12)))].sort((x, y) => x - y);
  return uniq.map((tv) => {
    const tt = Math.max(0, Math.min(1, tv));
    return { x: ax + tt * dx, y: ay + tt * dy, t: tt };
  });
}

/**
 * Puntos de tangencia sobre la circunferencia (O,r) desde un punto exterior P: PT ⟂ OT (tangente bitangente estándar).
 * @returns {Pt[]} 0, 1 (tangencia degenerada) o 2 puntos.
 */
function tangentTouchPointsFromExternal(P, O, r) {
  const px = P.x - O.x;
  const py = P.y - O.y;
  const d = Math.hypot(px, py);
  if (d <= r + 1e-10) return [];
  const alpha = Math.atan2(py, px);
  const beta = Math.acos(Math.min(1, Math.max(-1, r / d)));
  return [
    { x: O.x + r * Math.cos(alpha + beta), y: O.y + r * Math.sin(alpha + beta) },
    { x: O.x + r * Math.cos(alpha - beta), y: O.y + r * Math.sin(alpha - beta) },
  ];
}

/** Arco menor entre dos puntos en una circunferencia (tramo de tensora). */
function arcMinorSvg(cx, cy, r, pFrom, pTo) {
  const t0 = Math.atan2(pFrom.y - cy, pFrom.x - cx);
  const t1 = Math.atan2(pTo.y - cy, pTo.x - cx);
  let dShort = t1 - t0;
  while (dShort > Math.PI) dShort -= 2 * Math.PI;
  while (dShort < -Math.PI) dShort += 2 * Math.PI;
  const dLong = dShort > 0 ? dShort - 2 * Math.PI : dShort + 2 * Math.PI;
  const d = Math.abs(dShort) <= Math.abs(dLong) ? dShort : dLong;
  const largeArc = Math.abs(d) > Math.PI ? 1 : 0;
  const sweep = d > 0 ? 1 : 0;
  const arcLen = Math.abs(d) * r;
  return {
    svg: `A ${r.toFixed(3)} ${r.toFixed(3)} 0 ${largeArc} ${sweep} ${pTo.x.toFixed(2)} ${pTo.y.toFixed(2)}`,
    arcLen,
    arcRad: Math.abs(d),
  };
}

/**
 * Centroide mezclado (global + punto medio del tramo recto) para orientar dorsal/interior en cada span.
 */
function blendCentroidForStraightSpan(ax, ay, bx, by, globalCentroid) {
  if (!globalCentroid || !Number.isFinite(globalCentroid.x) || !Number.isFinite(globalCentroid.y)) {
    return globalCentroid;
  }
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  return { x: (globalCentroid.x + mx) / 2, y: (globalCentroid.y + my) / 2 };
}

/**
 * Elige Δθ (rad, con signo) sobre la circunferencia desde pFrom hacia pTo (rama dorsal/interior o menor si no hay centroide).
 */
function pickOrientedArcDelta(cx, cy, r, pFrom, pTo, centroid, preferOutward) {
  const t0 = Math.atan2(pFrom.y - cy, pFrom.x - cx);
  const t1 = Math.atan2(pTo.y - cy, pTo.x - cx);
  let dShort = t1 - t0;
  while (dShort > Math.PI) dShort -= 2 * Math.PI;
  while (dShort < -Math.PI) dShort += 2 * Math.PI;
  const dLong = dShort > 0 ? dShort - 2 * Math.PI : dShort + 2 * Math.PI;

  if (!centroid || !Number.isFinite(centroid.x) || !Number.isFinite(centroid.y)) {
    const d = Math.abs(dShort) <= Math.abs(dLong) ? dShort : dLong;
    return { t0, delta: d };
  }

  const midDist = (delta) => {
    const tm = t0 + delta / 2;
    const mx = cx + r * Math.cos(tm);
    const my = cy + r * Math.sin(tm);
    return Math.hypot(mx - centroid.x, my - centroid.y);
  };
  const dS = midDist(dShort);
  const dL = midDist(dLong);
  let pickShort;
  if (Math.abs(dS - dL) < 1e-7) {
    pickShort = Math.abs(dShort) <= Math.abs(dLong);
  } else if (preferOutward) {
    pickShort = dS >= dL;
  } else {
    pickShort = dS <= dL;
  }
  const d = pickShort ? dShort : dLong;
  return { t0, delta: d };
}

/** Arco orientado con barrido angular escalado por pressureRatio ∈ [0,1] (presión / penetración). */
function arcSvgOrientedPressure(cx, cy, r, pFrom, pTo, centroid, preferOutward, pressureRatio) {
  const pr = Math.max(0, Math.min(1, pressureRatio));
  const { t0, delta } = pickOrientedArcDelta(cx, cy, r, pFrom, pTo, centroid, preferOutward);
  const dScaled = delta * pr;
  if (Math.abs(dScaled) < 1e-12) {
    return { svg: '', arcLen: 0, arcRad: 0, endPt: { x: pFrom.x, y: pFrom.y } };
  }
  const endPt = { x: cx + r * Math.cos(t0 + dScaled), y: cy + r * Math.sin(t0 + dScaled) };
  const largeArc = Math.abs(dScaled) > Math.PI ? 1 : 0;
  const sweep = dScaled > 0 ? 1 : 0;
  const arcLen = Math.abs(dScaled) * r;
  return {
    svg: `A ${r.toFixed(3)} ${r.toFixed(3)} 0 ${largeArc} ${sweep} ${endPt.x.toFixed(2)} ${endPt.y.toFixed(2)}`,
    arcLen,
    arcRad: Math.abs(dScaled),
    endPt,
  };
}

/**
 * Elige el arco entre pFrom y pTo sobre la circunferencia según el lado respecto al centroide:
 * preferOutward=true (contacto dorsal / cara exterior): punto medio del arco más lejos del centroide.
 * preferOutward=false (contacto hacia el interior del lazo): punto medio más cercano al centroide.
 */
function arcSvgOriented(cx, cy, r, pFrom, pTo, centroid, preferOutward) {
  const { t0, delta } = pickOrientedArcDelta(cx, cy, r, pFrom, pTo, centroid, preferOutward);
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweep = delta > 0 ? 1 : 0;
  const arcLen = Math.abs(delta) * r;
  return {
    svg: `A ${r.toFixed(3)} ${r.toFixed(3)} 0 ${largeArc} ${sweep} ${pTo.x.toFixed(2)} ${pTo.y.toFixed(2)}`,
    arcLen,
    arcRad: Math.abs(delta),
  };
}

function cubicBumpFallback(ax, ay, bx, by, ox, oy, r, cl, centroid, inward) {
  const penetration = Math.max(0, r - cl.dist);
  const bulge = Math.min(penetration * 1.15, r * 0.92);
  let ux;
  let uy;
  if (centroid && Number.isFinite(centroid.x) && Number.isFinite(centroid.y)) {
    const gx = centroid.x - cl.qx;
    const gy = centroid.y - cl.qy;
    const gd = Math.hypot(gx, gy);
    const nx = ox - cl.qx;
    const ny = oy - cl.qy;
    const nd = Math.hypot(nx, ny);
    if (inward && gd > 1e-9) {
      ux = gx / gd;
      uy = gy / gd;
    } else if (!inward && nd > 1e-9) {
      ux = nx / nd;
      uy = ny / nd;
    } else if (nd > 1e-9) {
      ux = nx / nd;
      uy = ny / nd;
    } else {
      ux = 1;
      uy = 0;
    }
  } else {
    const nx = ox - cl.qx;
    const ny = oy - cl.qy;
    const nd = Math.hypot(nx, ny);
    ux = nx / (nd || 1);
    uy = ny / (nd || 1);
  }
  const cx1 = ax + ((bx - ax) / 3) * 1 + ux * bulge * 0.65;
  const cy1 = ay + ((by - ay) / 3) * 1 + uy * bulge * 0.65;
  const cx2 = bx - ((bx - ax) / 3) * 1 + ux * bulge * 0.65;
  const cy2 = by - ((by - ay) / 3) * 1 + uy * bulge * 0.65;
  const parts = [`C ${cx1.toFixed(2)} ${cy1.toFixed(2)} ${cx2.toFixed(2)} ${cy2.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`];
  const chord = Math.hypot(bx - ax, by - ay);
  const len = chord + bulge * 0.35;
  const arcApproxDeg = bulge > 1e-9 ? (bulge / Math.max(r, 1e-9)) * (180 / Math.PI) * 0.85 : 0;
  return { parts, length: len, endX: bx, endY: by, arcWrapDeg: arcApproxDeg };
}

/**
 * Camino A→B con contacto bitangente en la tensora: rectas A–Ta y Tb–B son tangentes al disco (perpendiculares al radio en Ta/Tb).
 * Elige el par (Ta,Tb) coherente con el avance a lo largo de AB y longitud mínima.
 */
function tryWrapIdlerBitangent(ax, ay, bx, by, ox, oy, r, centroid, inward, eps) {
  const dA = Math.hypot(ax - ox, ay - oy);
  const dB = Math.hypot(bx - ox, by - oy);
  if (dA <= r + 1e-8 || dB <= r + 1e-8) return null;

  const A = { x: ax, y: ay };
  const B = { x: bx, y: by };
  const O = { x: ox, y: oy };
  const TaList = tangentTouchPointsFromExternal(A, O, r);
  const TbList = tangentTouchPointsFromExternal(B, O, r);
  if (TaList.length < 2 || TbList.length < 2) return null;

  const preferOutward = !inward;
  const spanC = blendCentroidForStraightSpan(ax, ay, bx, by, centroid);

  const abx = bx - ax;
  const aby = by - ay;
  const abLen2 = abx * abx + aby * aby;
  if (abLen2 < 1e-18) return null;

  /** @type {{ Ta: Pt; Tb: Pt; arc: ReturnType<typeof arcSvgOriented>; da: number; db: number } | null} */
  let best = null;
  let bestLen = Infinity;

  for (const Ta of TaList) {
    for (const Tb of TbList) {
      const tTa = ((Ta.x - ax) * abx + (Ta.y - ay) * aby) / abLen2;
      const tTb = ((Tb.x - ax) * abx + (Tb.y - ay) * aby) / abLen2;
      if (tTb < tTa - 1e-6) continue;

      const da = Math.hypot(Ta.x - ax, Ta.y - ay);
      const db = Math.hypot(bx - Tb.x, by - Tb.y);
      const arc = arcSvgOriented(ox, oy, r, Ta, Tb, spanC, preferOutward);
      const L = da + arc.arcLen + db;
      if (L < bestLen) {
        bestLen = L;
        best = { Ta, Tb, arc, da, db };
      }
    }
  }

  /* Hendidura / rama “invertida”: si el filtro t₁≤t₂ elimina todo, tomar el mínimo global (4 pares). */
  if (!best) {
    for (const Ta of TaList) {
      for (const Tb of TbList) {
        const da = Math.hypot(Ta.x - ax, Ta.y - ay);
        const db = Math.hypot(bx - Tb.x, by - Tb.y);
        const arc = arcSvgOriented(ox, oy, r, Ta, Tb, spanC, preferOutward);
        const L = da + arc.arcLen + db;
        if (L < bestLen) {
          bestLen = L;
          best = { Ta, Tb, arc, da, db };
        }
      }
    }
  }

  if (!best) return null;

  const parts = [];
  let len = 0;
  if (best.da > eps) {
    parts.push(`L ${best.Ta.x.toFixed(2)} ${best.Ta.y.toFixed(2)}`);
    len += best.da;
  }
  parts.push(best.arc.svg);
  len += best.arc.arcLen;
  if (best.db > eps) {
    parts.push(`L ${bx.toFixed(2)} ${by.toFixed(2)}`);
    len += best.db;
  }
  const arcWrapDeg = (best.arc.arcRad * 180) / Math.PI;
  return { parts, length: len, endX: bx, endY: by, arcWrapDeg };
}

/**
 * Tramo recto con polea tensora: tangentes entrada/salida + arco orientado (dorsal vs interior del lazo).
 * @param {Pt | null | undefined} centroid Referencia del interior del lazo (casco convexo o punto medio en 2 poleas).
 * @param {boolean} inward true = contacto hacia el interior (empuje “normal”); false = dorsal / cara exterior.
 */
function wrapIdlerOnSegment(ax, ay, bx, by, ox, oy, r, centroid, inward, eps = 1e-7) {
  const preferOutward = !inward;
  const cl = closestPointOnSegmentDetailed(ox, oy, ax, ay, bx, by);
  const dAE = Math.hypot(ax - ox, ay - oy);
  const dBE = Math.hypot(bx - ox, by - oy);

  /* Contacto obligatorio: con ambos extremos fuera del disco, bitangentes (aunque el segmento no corte el círculo). */
  if (dAE > r + 1e-7 && dBE > r + 1e-7) {
    const bit = tryWrapIdlerBitangent(ax, ay, bx, by, ox, oy, r, centroid, inward, eps);
    if (bit) return bit;
  }

  const penetration = Math.max(0, r - cl.dist);
  const pressureRatio = Math.min(1, penetration / Math.max(r, 1e-9));

  const ints = segmentCircleIntersections(ax, ay, bx, by, ox, oy, r);
  if (ints.length >= 2) {
    const I1 = ints[0];
    const I2 = ints[ints.length - 1];
    const parts = [];
    let len = 0;
    const dA1 = Math.hypot(I1.x - ax, I1.y - ay);
    if (dA1 > eps) {
      parts.push(`L ${I1.x.toFixed(2)} ${I1.y.toFixed(2)}`);
      len += dA1;
    }
    const arc = arcSvgOrientedPressure(ox, oy, r, I1, I2, centroid, preferOutward, pressureRatio);
    if (arc.svg) {
      parts.push(arc.svg);
      len += arc.arcLen;
    }
    const endArc = arc.endPt || I2;
    const d2b = Math.hypot(bx - endArc.x, by - endArc.y);
    if (d2b > eps) {
      parts.push(`L ${bx.toFixed(2)} ${by.toFixed(2)}`);
      len += d2b;
    }
    const arcWrapDeg = (arc.arcRad * 180) / Math.PI;
    return { parts, length: len, endX: bx, endY: by, arcWrapDeg };
  }

  if (ints.length === 1) {
    const I = ints[0];
    const parts = [];
    let len = 0;
    const dA = Math.hypot(I.x - ax, I.y - ay);
    if (dA > eps) {
      parts.push(`L ${I.x.toFixed(2)} ${I.y.toFixed(2)}`);
      len += dA;
    }
    const dIb = Math.hypot(bx - I.x, by - I.y);
    if (dIb > eps) {
      parts.push(`L ${bx.toFixed(2)} ${by.toFixed(2)}`);
      len += dIb;
    }
    return { parts, length: len, endX: bx, endY: by };
  }

  return cubicBumpFallback(ax, ay, bx, by, ox, oy, r, cl, centroid, inward);
}

function sameIdler(a, b) {
  if (a.id != null && b.id != null) return a.id === b.id;
  return Math.abs(a.x - b.x) < 1e-7 && Math.abs(a.y - b.y) < 1e-7 && Math.abs(a.r - b.r) < 1e-7;
}

/**
 * Recorre A→B aplicando todas las tensoras en orden de avance (proyección sobre el tramo).
 * Persistencia de contacto: ya no se omite la tensora cuando el disco no corta el segmento recto.
 * @param {Pt | null | undefined} centroid
 * @param {{ id: number; wrapDeg: number }[]} [idlerWrapsOut] Si se pasa, acumula γ por tensora con contacto en orden de avance.
 */
function deflectStraightSegment(ax, ay, bx, by, idlers, centroid, eps = 1e-7, idlerWrapsOut) {
  let px = ax;
  let py = ay;
  const parts = [];
  let len = 0;
  /** @type {IdlerSpec[]} */
  let remaining = idlers.filter((id) => id && id.r > 1e-9);
  const spanCentroid = blendCentroidForStraightSpan(ax, ay, bx, by, centroid);

  while (Math.hypot(bx - px, by - py) > eps) {
    let best = null;
    let bestT = Infinity;
    for (const id of remaining) {
      const cl = closestPointOnSegmentDetailed(id.x, id.y, px, py, bx, by);
      if (cl.t < -1e-6 || cl.t > 1 + 1e-6) continue;
      if (cl.t < bestT - 1e-12) {
        bestT = cl.t;
        best = id;
      }
    }
    if (!best) {
      parts.push(`L ${bx.toFixed(2)} ${by.toFixed(2)}`);
      len += Math.hypot(bx - px, by - py);
      break;
    }

    const chunk = wrapIdlerOnSegment(px, py, bx, by, best.x, best.y, best.r, spanCentroid, !!best.inward, eps);
    parts.push(...chunk.parts);
    len += chunk.length;
    px = chunk.endX;
    py = chunk.endY;
    if (idlerWrapsOut && best.id != null && chunk.arcWrapDeg != null && chunk.arcWrapDeg > 1e-4) {
      idlerWrapsOut.push({ id: best.id, wrapDeg: chunk.arcWrapDeg });
    }
    remaining = remaining.filter((id) => !sameIdler(id, best));
  }

  return { parts, length: len };
}

function arcLenExteriorMmEngine(cx, cy, r, pFrom, pTo, centroid) {
  const t0 = Math.atan2(pFrom.y - cy, pFrom.x - cx);
  const t1 = Math.atan2(pTo.y - cy, pTo.x - cx);
  let dShort = t1 - t0;
  while (dShort > Math.PI) dShort -= 2 * Math.PI;
  while (dShort < -Math.PI) dShort += 2 * Math.PI;
  const dLong = dShort > 0 ? dShort - 2 * Math.PI : dShort + 2 * Math.PI;
  const midAng = (a) => {
    const t = t0 + a / 2;
    return Math.hypot(cx + r * Math.cos(t) - centroid.x, cy + r * Math.sin(t) - centroid.y);
  };
  const useShort = midAng(dShort) >= midAng(dLong);
  const d = useShort ? dShort : dLong;
  return r * Math.abs(d);
}

function buildHullBeltWithDeferredIdlers(centers, radii, hullIdx, idlers, idlerWrapsOut) {
  const g = buildConvexBeltSegments(centers, radii, hullIdx);
  if (!g) return null;
  const { segs, centroid } = g;
  const m = hullIdx.length;
  const fmt = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

  const first = deflectStraightSegment(segs[0].p0.x, segs[0].p0.y, segs[0].p1.x, segs[0].p1.y, idlers, centroid, 1e-7, idlerWrapsOut);
  const parts = [`M ${fmt(segs[0].p0)}`, ...first.parts];
  let straightLen = first.length;

  for (let k = 1; k < m; k++) {
    const prev = segs[k - 1];
    const cur = segs[k];
    const idx = hullIdx[k];
    const c = centers[idx];
    const r = radii[idx];
    parts.push(arcAlongCircleExterior(c.x, c.y, r, prev.p1, cur.p0, centroid));
    const chain = deflectStraightSegment(cur.p0.x, cur.p0.y, cur.p1.x, cur.p1.y, idlers, centroid, 1e-7, idlerWrapsOut);
    parts.push(...chain.parts);
    straightLen += chain.length;
  }

  const last = segs[m - 1];
  const firstS = segs[0];
  const i0 = hullIdx[0];
  parts.push(arcAlongCircleExterior(centers[i0].x, centers[i0].y, radii[i0], last.p1, firstS.p0, centroid));
  parts.push('Z');

  let arcSum = 0;
  for (let k = 0; k < m; k++) {
    const prev = segs[(k - 1 + m) % m];
    const cur = segs[k];
    const idx = hullIdx[k];
    arcSum += arcLenExteriorMmEngine(centers[idx].x, centers[idx].y, radii[idx], prev.p1, cur.p0, centroid);
  }

  return {
    pathD: parts.join(' '),
    length_mm: straightLen + arcSum,
  };
}

function buildTwoPulleyDeferredPath(c0, r0, c1, r1, idlers, idlerWrapsOut) {
  const sPos = outerTangentSegment(c0, r0, c1, r1, +1);
  const sNeg = outerTangentSegment(c0, r0, c1, r1, -1);
  const seg = sPos || sNeg;
  if (!seg) return null;
  const otherSide = seg === sPos ? -1 : +1;
  const opp = outerTangentSegment(c0, r0, c1, r1, otherSide);
  if (!opp) return null;

  const centroid = { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2 };
  const chain1 = deflectStraightSegment(seg.p0.x, seg.p0.y, seg.p1.x, seg.p1.y, idlers, centroid, 1e-7, idlerWrapsOut);
  const chain2 = deflectStraightSegment(opp.p1.x, opp.p1.y, opp.p0.x, opp.p0.y, idlers, centroid, 1e-7, idlerWrapsOut);

  const arc0Len = arcLenExteriorMmEngine(c0.x, c0.y, r0, opp.p0, seg.p0, centroid);
  const arc1Len = arcLenExteriorMmEngine(c1.x, c1.y, r1, seg.p1, opp.p1, centroid);
  const len = chain1.length + chain2.length + arc0Len + arc1Len;

  const pathD = [
    `M ${seg.p0.x.toFixed(2)} ${seg.p0.y.toFixed(2)}`,
    ...chain1.parts,
    arcAlongCircleExterior(c1.x, c1.y, r1, seg.p1, opp.p1, centroid),
    ...chain2.parts,
    arcAlongCircleExterior(c0.x, c0.y, r0, opp.p0, seg.p0, centroid),
    'Z',
  ].join(' ');

  return { pathD, length_mm: len, reliable: true, note: '' };
}

/**
 * Lazo principal solo entre poleas conductoras/conducidas; las tensoras no forman el casco inicial y deforman
 * localmente los tramos rectos cuando dist(centro, segmento) ≤ radio.
 * @param {{ x: number; y: number }[]} centers — solo núcleo (sin tensoras)
 * @param {number[]} radii
 * @param {IdlerSpec[]} idlers — tensoras de la corrida (inward = contacto interior del lazo)
 */
export function buildOpenBeltPathWithDeferredIdlers(centers, radii, idlers = []) {
  const base = buildOpenBeltPath2D(centers, radii);
  const specs = (idlers || []).filter((i) => i && i.r > 1e-9);
  /** @type {{ id: number; wrapDeg: number }[]} */
  const idlerWraps = [];

  if (!specs.length) return base;

  const n = centers.length;
  if (n < 2) return base;

  if (n === 2) {
    const geo = buildTwoPulleyDeferredPath(centers[0], radii[0], centers[1], radii[1], specs, idlerWraps);
    if (geo) {
      const note = specs.length ? 'Tensora: contacto local sobre tramos rectos entre poleas principales.' : '';
      return { ...geo, note, idlerWraps };
    }
    return base;
  }

  const hullIdx = convexHullIndices(centers);
  if (hullIdx.length >= 3) {
    const g = buildHullBeltWithDeferredIdlers(centers, radii, hullIdx, specs, idlerWraps);
    if (g) {
      let note = base.note || '';
      if (specs.length) note += ' Tensora: deformación local sobre tangentes del núcleo.';
      return {
        pathD: g.pathD,
        length_mm: g.length_mm,
        reliable: base.reliable,
        note: note.trim(),
        idlerWraps,
      };
    }
  }

  let note = base.note || '';
  if (specs.length) note += ' Tensora no aplicada en serpentín colineal (demo).';
  return { ...base, note: note.trim(), idlerWraps };
}

/**
 * Traslación aplicada a todas las poleas del núcleo con índice ≥ 1 cuando C1 manual ≠ distancia geométrica.
 * Las tensoras deben usar la misma traslación para coincidir con el trazado de la correa.
 */
export function centerOverrideTranslationMm(state, coreIds, centerOverrideMm = 0) {
  if (!(centerOverrideMm > 0) || coreIds.length < 2) return { tx: 0, ty: 0 };
  const a = state.nodes.find((x) => x.id === coreIds[0]);
  const b = state.nodes.find((x) => x.id === coreIds[1]);
  if (!a || !b) return { tx: 0, ty: 0 };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const ux = d > 1e-9 ? dx / d : 1;
  const uy = d > 1e-9 ? dy / d : 0;
  const bx = a.x + ux * centerOverrideMm;
  const by = a.y + uy * centerOverrideMm;
  return { tx: bx - b.x, ty: by - b.y };
}

/**
 * Posiciones de centro usadas para cotas y coherente con {@link beltRunGeometry} (núcleo ajustado + tensoras desplazadas).
 */
export function pulleyCentersAdjustedForBeltRun(state, br, centerOverrideMm = 0) {
  const orderedRaw = beltRunSequentialNodeIds(state, br);
  const coreIds = orderedRaw.filter((id) => state.nodes.find((x) => x.id === id)?.pulleyRole !== 'idler');
  const centersAdj = centersForBeltNodes(state, coreIds, centerOverrideMm);
  const d = centerOverrideTranslationMm(state, coreIds, centerOverrideMm);
  /** @type {Map<number, { x: number; y: number }>} */
  const map = new Map();
  let ci = 0;
  for (const id of orderedRaw) {
    const n = state.nodes.find((x) => x.id === id);
    if (!n) continue;
    if (n.pulleyRole === 'idler') {
      map.set(id, { x: n.x + d.tx, y: n.y + d.ty });
    } else if (centersAdj && ci < centersAdj.length) {
      map.set(id, { ...centersAdj[ci] });
      ci++;
    }
  }
  return map;
}

/**
 * Centros de poleas en orden, con override opcional del eje (corrida).
 */
export function centersForBeltNodes(state, nodeIds, centerOverrideMm = 0) {
  const centers = [];
  for (const id of nodeIds) {
    const n = state.nodes.find((x) => x.id === id);
    if (!n) return null;
    centers.push({ x: n.x, y: n.y });
  }
  if (!(centerOverrideMm > 0) || centers.length < 2) return centers;
  const a = centers[0];
  const b = centers[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const ux = d > 1e-9 ? dx / d : 1;
  const uy = d > 1e-9 ? dy / d : 0;
  const bx = a.x + ux * centerOverrideMm;
  const by = a.y + uy * centerOverrideMm;
  const tx = bx - b.x;
  const ty = by - b.y;
  for (let i = 1; i < centers.length; i++) {
    centers[i] = { x: centers[i].x + tx, y: centers[i].y + ty };
  }
  return centers;
}

function tokenizeSvgPathD(pathD) {
  const out = [];
  const s = pathD.trim();
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /[\s,]/.test(s[i])) i++;
    if (i >= s.length) break;
    const ch = s[i];
    if (/[MLAZmlaz]/.test(ch)) {
      out.push(s[i++]);
      continue;
    }
    let j = i;
    while (j < s.length && /[\d.eE+-]/.test(s[j])) j++;
    if (j > i) {
      out.push(s.slice(i, j));
      i = j;
    } else i++;
  }
  return out;
}

/**
 * Muestrea un arco SVG circular (rx≈ry, φ≈0) para pruebas de auto-intersección.
 */
function sampleCircularSvgArcPoints(sx, sy, rx, ry, rotDeg, largeArc, sweepFlag, ex, ey, nSeg) {
  if (Math.abs(rx - ry) > 1e-3 || Math.abs(rotDeg) > 1e-6) return [{ x: ex, y: ey }];
  const r = rx;
  const dx = ex - sx;
  const dy = ey - sy;
  const chord = Math.hypot(dx, dy);
  /**
   * Cuerda ~0: si no insertamos puntos intermedios, dos tramos rectos largos (p.ej. A→tensora y tensora→B)
   * quedan como segmentos **consecutivos** en la polilínea y el test de autocruce los omite → «X» visible en rojo.
   * Sintetizamos una cuerda mínima colineal para reutilizar el cálculo de centro y muestrear un arco corto.
   */
  if (chord < 1e-8) {
    const eps = Math.max(r * 1e-5, 1e-4);
    const sx2 = sx - eps * 0.5;
    const sy2 = sy;
    const ex2 = sx + eps * 0.5;
    const ey2 = sy;
    return sampleCircularSvgArcPoints(sx2, sy2, rx, ry, rotDeg, largeArc, sweepFlag, ex2, ey2, Math.max(nSeg, 8));
  }
  if (chord > 2 * r + 1e-4) return [{ x: ex, y: ey }];
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const h = Math.sqrt(Math.max(0, r * r - (chord / 2) * (chord / 2)));
  const ux = -dy / chord;
  const uy = dx / chord;
  const c1 = { x: mx + ux * h, y: my + uy * h };
  const c2 = { x: mx - ux * h, y: my - uy * h };

  function deltaForCenter(cx, cy) {
    const ta = Math.atan2(sy - cy, sx - cx);
    const tb = Math.atan2(ey - cy, ex - cx);
    let dPos = tb - ta;
    while (dPos <= 0) dPos += 2 * Math.PI;
    while (dPos > 2 * Math.PI) dPos -= 2 * Math.PI;
    let dNeg = tb - ta;
    while (dNeg >= 0) dNeg -= 2 * Math.PI;
    while (dNeg < -2 * Math.PI) dNeg += 2 * Math.PI;
    const usePos = sweepFlag >= 0.5;
    const delta = usePos ? dPos : dNeg;
    const isLarge = Math.abs(delta) > Math.PI;
    return { delta, isLarge, cx, cy };
  }

  let picked = null;
  for (const c of [c1, c2]) {
    const rr = deltaForCenter(c.x, c.y);
    if (rr.isLarge === !!largeArc) {
      picked = rr;
      break;
    }
  }
  if (!picked) picked = deltaForCenter(c1.x, c1.y);

  const { cx, cy, delta } = picked;
  const t0 = Math.atan2(sy - cy, sx - cx);
  const n = Math.max(2, nSeg);
  const pts = [];
  for (let k = 1; k <= n; k++) {
    const u = k / n;
    const t = t0 + delta * u;
    pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
  }
  return pts;
}

function pathDToSampledPolyline(pathD, arcSegs = 12) {
  const tok = tokenizeSvgPathD(pathD);
  const pts = [];
  let idx = 0;
  let cx = 0;
  let cy = 0;
  let subx = 0;
  let suby = 0;
  const push = (x, y) => {
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) > 1e-5) pts.push({ x, y });
  };
  const isCmd = (t) => t && /^[MLAZmlaz]$/.test(t);

  while (idx < tok.length) {
    let cmd = tok[idx++];
    if (!cmd) break;
    if (cmd === 'M' || cmd === 'm') {
      const rel = cmd === 'm';
      cx = parseFloat(tok[idx++]);
      cy = parseFloat(tok[idx++]);
      if (rel) {
        cx += subx;
        cy += suby;
      }
      subx = cx;
      suby = cy;
      push(cx, cy);
      cmd = rel ? 'l' : 'L';
      while (idx < tok.length && !isCmd(tok[idx])) {
        let nx = parseFloat(tok[idx++]);
        let ny = parseFloat(tok[idx++]);
        if (cmd === 'l') {
          cx += nx;
          cy += ny;
        } else {
          cx = nx;
          cy = ny;
        }
        push(cx, cy);
      }
      continue;
    }
    if (cmd === 'L' || cmd === 'l') {
      const rel = cmd === 'l';
      const nx = parseFloat(tok[idx++]);
      const ny = parseFloat(tok[idx++]);
      cx = rel ? cx + nx : nx;
      cy = rel ? cy + ny : ny;
      push(cx, cy);
    } else if (cmd === 'A' || cmd === 'a') {
      const rel = cmd === 'a';
      const rx = parseFloat(tok[idx++]);
      const ry = parseFloat(tok[idx++]);
      const rot = parseFloat(tok[idx++]);
      const large = parseFloat(tok[idx++]);
      const sweep = parseFloat(tok[idx++]);
      let ex = parseFloat(tok[idx++]);
      let ey = parseFloat(tok[idx++]);
      const sx0 = cx;
      const sy0 = cy;
      if (rel) {
        ex += cx;
        ey += cy;
      }
      const samples = sampleCircularSvgArcPoints(sx0, sy0, rx, ry, rot, large, sweep, ex, ey, arcSegs);
      for (const p of samples) push(p.x, p.y);
      cx = ex;
      cy = ey;
    } else if (cmd === 'Z' || cmd === 'z') {
      push(subx, suby);
      cx = subx;
      cy = suby;
    }
  }
  return pts;
}

function polylineSelfIntersectsXY(pts) {
  const n = pts.length;
  if (n < 4) return false;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    for (let j = i + 2; j < n - 1; j++) {
      const c = pts[j];
      const d = pts[j + 1];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }
  const a = pts[n - 2];
  const b = pts[n - 1];
  const c = pts[0];
  const d = pts[1];
  if (n > 3 && segmentsIntersect(a, b, c, d)) return true;
  return false;
}

function beltPathHasSelfIntersectionApprox(pathD, arcSegs = 24) {
  try {
    const pts = pathDToSampledPolyline(pathD, arcSegs);
    return polylineSelfIntersectsXY(pts);
  } catch {
    return false;
  }
}

/**
 * IDs de poleas en la corrida en el **orden del array** `br.nodeIds` (sin reordenar al casco convexo).
 */
export function beltRunSequentialNodeIds(state, br) {
  return (br.nodeIds || []).filter((id) => state.nodes.some((n) => n.id === id && n.kind === 'pulley'));
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} n
 */
function tangentMaskHamming(a, b, n) {
  let x = (a ^ b) >>> 0;
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (x & (1 << i)) c++;
  }
  return c;
}

/**
 * Histéresis: último lazo válido por id de corrida (topología fija en idsKey).
 * @type {Map<string, { idsKey: string; tangentMask: number; pathD: string; length_mm: number; idlerWraps: { id: number; wrapDeg: number }[] }>}
 */
const beltRunLastValidGeom = new Map();

/**
 * Geometría de correa: lazo cerrado en **orden de anillo** (tangentes externas/internas por tramo,
 * sin autocruce de segmentos). Sustituye el modelo casco+deflexión local cuando hay tensoras.
 */
export function beltRunGeometry(state, br, centerOverrideMm = 0) {
  const orderedRaw = beltRunSequentialNodeIds(state, br);

  if (orderedRaw.length < 2) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: 'Mínimo 2 poleas en la ruta.',
      idlerWraps: [],
      crossingWarning: false,
      geometryImpossible: false,
    };
  }

  const idsKey = orderedRaw.join(',');
  const cached = beltRunLastValidGeom.get(br.id);
  const preferredMask =
    cached && cached.idsKey === idsKey && Number.isFinite(cached.tangentMask) ? cached.tangentMask : null;

  const posMap = pulleyCentersAdjustedForBeltRun(state, br, centerOverrideMm);
  /** @type {{ x: number; y: number }[]} */
  const centers = [];
  for (const id of orderedRaw) {
    const p = posMap.get(id);
    if (!p) {
      return {
        pathD: '',
        length_mm: 0,
        reliable: false,
        note: 'Falta un nodo en la ruta.',
        idlerWraps: [],
        crossingWarning: false,
        geometryImpossible: false,
      };
    }
    centers.push(p);
  }

  const radii = orderedRaw.map((id) => {
    const n = state.nodes.find((x) => x.id === id);
    return pulleyBeltDiameter_mm(n, br) / 2;
  });

  const nodeMeta = orderedRaw.map((id) => {
    const n = state.nodes.find((x) => x.id === id);
    const isIdler = n.pulleyRole === 'idler';
    const role = isIdler ? 'idler' : n.pulleyRole === 'drive' ? 'drive' : 'driven';
    return {
      role,
      wrapSide: isIdler ? n.idlerWrapSide : undefined,
      isExternal: isIdler ? n.isExternal === true : false,
      contacto: isIdler ? (n.idlerWrapSide === 'outside' ? 'exterior' : 'interior') : undefined,
    };
  });

  const hasIdlerInRun = orderedRaw.some((id) => state.nodes.find((x) => x.id === id)?.pulleyRole === 'idler');

  const edgeSigns = Array.from({ length: orderedRaw.length }, (_, i) => {
    const s = br.edgeSigns?.[i];
    return s === 1 || s === -1 ? s : null;
  });

  let geo = buildOrderedBeltPath2D(centers, radii, nodeMeta, edgeSigns, { preferredMask });

  /** Solo con tensoras: la polilínea densa puede dar falsos positivos en lazos solo-núcleo. */
  const polyBad =
    geo.pathD && hasIdlerInRun ? beltPathHasSelfIntersectionApprox(geo.pathD) : false;
  const okOrdered = !!(geo.pathD && geo.reliable && !polyBad);

  if (okOrdered) {
    const idlerWraps = (geo.idlerWrapsByIndex || []).map(({ index, wrapDeg }) => ({
      id: orderedRaw[index],
      wrapDeg,
    }));
    const { idlerWrapsByIndex: _iw, tangentMask: _tm, ...geoRest } = geo;
    beltRunLastValidGeom.set(br.id, {
      idsKey,
      tangentMask: geo.tangentMask ?? 0,
      pathD: geoRest.pathD,
      length_mm: geoRest.length_mm,
      idlerWraps,
    });
    return {
      ...geoRest,
      idlerWraps,
      crossingWarning: false,
      geometryImpossible: false,
    };
  }

  if (cached && cached.idsKey === idsKey && cached.pathD) {
    const cachedCross =
      hasIdlerInRun && cached.pathD ? beltPathHasSelfIntersectionApprox(cached.pathD) : false;
    if (!cachedCross) {
      return {
        pathD: cached.pathD,
        length_mm: cached.length_mm,
        reliable: false,
        note: 'Geometría imposible o inestable: último trazado válido.',
        idlerWraps: cached.idlerWraps,
        crossingWarning: true,
        geometryImpossible: true,
      };
    }
    beltRunLastValidGeom.delete(br.id);
  }

  const coreIds = orderedRaw.filter((id) => state.nodes.find((x) => x.id === id)?.pulleyRole !== 'idler');
  const deferredIds = (br.nodeIds || []).filter((id) => {
    const n = state.nodes.find((x) => x.id === id);
    return n?.kind === 'pulley' && n.pulleyRole === 'idler';
  });
  const centersCore = centersForBeltNodes(state, coreIds, centerOverrideMm);
  if (!centersCore || coreIds.length < 2) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: geo.note || 'Geometría de correa no resoluble.',
      idlerWraps: [],
      crossingWarning: false,
      geometryImpossible: true,
    };
  }
  const radiiCore = coreIds.map((id) => getNodeD_mm(state.nodes.find((x) => x.id === id)) / 2);
  const tr = centerOverrideTranslationMm(state, coreIds, centerOverrideMm);
  const idlerSpecs = deferredIds.map((id) => {
    const n = state.nodes.find((x) => x.id === id);
    return {
      x: n.x + tr.tx,
      y: n.y + tr.ty,
      r: getNodeD_mm(n) / 2,
      inward: n.idlerWrapSide === 'inside',
      id: n.id,
    };
  });
  geo = buildOpenBeltPathWithDeferredIdlers(centersCore, radiiCore, idlerSpecs);
  /** Reserva casco+tensora: solo validar autocruce si hay tensoras (sin ellas el casco es estable y el test poligonal puede fallar en vano). */
  const fallbackCross =
    deferredIds.length > 0 && geo.pathD ? beltPathHasSelfIntersectionApprox(geo.pathD) : false;
  if (fallbackCross || !geo.pathD) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note:
        'Geometría imposible: la reserva (casco+tensora) se cruza o no hay trazado previo válido en memoria.',
      idlerWraps: [],
      crossingWarning: true,
      geometryImpossible: true,
    };
  }
  return {
    ...geo,
    idlerWraps: geo.idlerWraps || [],
    crossingWarning: false,
    geometryImpossible: false,
    note: `${geo.note || ''} (reserva: casco+tensora)`.trim(),
  };
}

/**
 * Tramos rectos de la correa (antes de tensoras) para estimar penetración y flecha.
 */
function collectDeferredStraightSpansMm(centers, radii) {
  if (!centers || centers.length < 2) return [];
  const n = centers.length;
  if (n === 2) {
    const c0 = centers[0];
    const c1 = centers[1];
    const r0 = radii[0];
    const r1 = radii[1];
    const sPos = outerTangentSegment(c0, r0, c1, r1, +1);
    const sNeg = outerTangentSegment(c0, r0, c1, r1, -1);
    const seg = sPos || sNeg;
    if (!seg) return [];
    const otherSide = seg === sPos ? -1 : +1;
    const opp = outerTangentSegment(c0, r0, c1, r1, otherSide);
    if (!opp) return [];
    return [
      { ax: seg.p0.x, ay: seg.p0.y, bx: seg.p1.x, by: seg.p1.y },
      { ax: opp.p1.x, ay: opp.p1.y, bx: opp.p0.x, by: opp.p0.y },
    ];
  }
  const hullIdx = convexHullIndices(centers);
  if (hullIdx.length < 3) return [];
  const g = buildConvexBeltSegments(centers, radii, hullIdx);
  if (!g) return [];
  return g.segs.map((s) => ({ ax: s.p0.x, ay: s.p0.y, bx: s.p1.x, by: s.p1.y }));
}

/**
 * Distancia mínima del punto (px,py) a la polilínea de correa **núcleo** (sin deformación por tensoras).
 * Sirve para auto-imán / snap visual respecto al lazo conductor.
 */
export function minDistPointToBeltRunCoreMm(state, br, px, py, centerOverrideMm = 0) {
  const orderedRaw = beltRunSequentialNodeIds(state, br);
  const coreIds = orderedRaw.filter((id) => state.nodes.find((x) => x.id === id)?.pulleyRole !== 'idler');
  const centers = centersForBeltNodes(state, coreIds, centerOverrideMm);
  const radii = coreIds.map((id) => getNodeD_mm(state.nodes.find((x) => x.id === id)) / 2);
  if (!centers || coreIds.length < 2) return Infinity;
  const spans = collectDeferredStraightSpansMm(centers, radii);
  let md = Infinity;
  for (const sp of spans) {
    const cl = closestPointOnSegmentDetailed(px, py, sp.ax, sp.ay, sp.bx, sp.by);
    md = Math.min(md, cl.dist);
  }
  return md;
}

/**
 * Flecha / penetración y criterio demo de sobre-tensión en tensoras.
 * @returns {{ maxGammaDeg: number; maxPenetrationMm: number; sagittaMm: number; flechaMm: number; overTension: boolean }}
 */
export function beltRunTensionDiagnostics(state, br, centerOverrideMm = 0) {
  const geo = beltRunGeometry(state, br, centerOverrideMm);
  const wraps = geo.idlerWraps || [];
  const maxGammaDeg = wraps.reduce((m, w) => Math.max(m, w.wrapDeg), 0);

  const orderedRaw = beltRunSequentialNodeIds(state, br);
  const coreIds = orderedRaw.filter((id) => state.nodes.find((x) => x.id === id)?.pulleyRole !== 'idler');
  const tr = centerOverrideTranslationMm(state, coreIds, centerOverrideMm);
  const deferredIds = (br.nodeIds || []).filter((id) => {
    const n = state.nodes.find((x) => x.id === id);
    return n?.kind === 'pulley' && n.pulleyRole === 'idler';
  });

  const centers = centersForBeltNodes(state, coreIds, centerOverrideMm);
  const radii = coreIds.map((id) => getNodeD_mm(state.nodes.find((x) => x.id === id)) / 2);
  const spans = centers && coreIds.length >= 2 ? collectDeferredStraightSpansMm(centers, radii) : [];

  let maxPenetrationMm = 0;
  for (const id of deferredIds) {
    const n = state.nodes.find((x) => x.id === id);
    if (!n) continue;
    const ox = n.x + tr.tx;
    const oy = n.y + tr.ty;
    const rid = getNodeD_mm(n) / 2;
    for (const sp of spans) {
      const cl = closestPointOnSegmentDetailed(ox, oy, sp.ax, sp.ay, sp.bx, sp.by);
      if (cl.dist < rid) maxPenetrationMm = Math.max(maxPenetrationMm, rid - cl.dist);
    }
  }

  let sagittaMm = 0;
  for (const w of wraps) {
    const n = state.nodes.find((x) => x.id === w.id);
    if (!n) continue;
    const rid = getNodeD_mm(n) / 2;
    const rad = (w.wrapDeg * Math.PI) / 180;
    const sag = rid * (1 - Math.cos(Math.min(Math.PI * 0.99, rad / 2)));
    sagittaMm = Math.max(sagittaMm, sag);
  }

  const flechaMm = Math.max(maxPenetrationMm, sagittaMm);
  const OVER_GAMMA = 118;
  const OVER_FLECHA = 38;
  const overTension = maxGammaDeg > OVER_GAMMA || flechaMm > OVER_FLECHA;

  return {
    maxGammaDeg,
    maxPenetrationMm,
    sagittaMm,
    flechaMm,
    overTension,
  };
}

const BELT_MIN_WRAP_OK_DEG = 120;
/** Ø mínimo orientativo demo para correa V (mm) — advertencia si se está por debajo */
export const V_BELT_WARN_MIN_D_MM = 56;

function wrapMetricsTwoPulley(c0, r0, c1, r1) {
  const sPos = outerTangentSegment(c0, r0, c1, r1, +1);
  const sNeg = outerTangentSegment(c0, r0, c1, r1, -1);
  const seg = sPos || sNeg;
  if (!seg) return null;
  const otherSide = seg === sPos ? -1 : +1;
  const opp = outerTangentSegment(c0, r0, c1, r1, otherSide);
  if (!opp) return null;
  const t0a = angleOnCircle(c0, seg.p0);
  const t0b = angleOnCircle(c0, opp.p0);
  const t1a = angleOnCircle(c1, seg.p1);
  const t1b = angleOnCircle(c1, opp.p1);
  const w0 = (arcLenCCW(r0, t0a, t0b) / r0) * (180 / Math.PI);
  const w1 = (arcLenCCW(r1, t1a, t1b) / r1) * (180 / Math.PI);
  return { seg, opp, w0, w1 };
}

/**
 * Longitud de lazo y ángulos de abrazamiento en poleas del núcleo; γ en tensoras con contacto (modelo diferido).
 */
export function beltCoreEngagementMetrics(state, br) {
  const geo = beltRunGeometry(state, br, br.centerOverride_mm ?? 0);
  const lengthMm = geo.length_mm;
  const rawIdler = geo.idlerWraps || [];
  /** Si una tensora toca más de un tramo recto, conservamos el mayor γ. */
  const idlerWrapById = new Map();
  for (const row of rawIdler) {
    const prev = idlerWrapById.get(row.id);
    if (prev == null || row.wrapDeg > prev) idlerWrapById.set(row.id, row.wrapDeg);
  }
  const idlerWraps = [...idlerWrapById.entries()].map(([id, wrapDeg]) => ({ id, wrapDeg }));

  const orderedRaw = beltRunSequentialNodeIds(state, br);
  const coreIds = orderedRaw.filter((id) => state.nodes.find((x) => x.id === id)?.pulleyRole !== 'idler');
  if (coreIds.length < 2) {
    return { lengthMm, rows: [], arcs: [], reliable: geo.reliable, idlerWraps };
  }

  const centers = coreIds.map((id) => {
    const n = state.nodes.find((x) => x.id === id);
    return { x: n.x, y: n.y };
  });
  const radii = coreIds.map((id) => getNodeD_mm(state.nodes.find((x) => x.id === id)) / 2);

  /** @type {{ id: number; wrapDeg: number; gripOk: boolean }[]} */
  const rows = [];
  /** @type {{ id: number; d: string; ok: boolean }[]} */
  const arcs = [];

  const n = centers.length;
  if (n === 2) {
    const w = wrapMetricsTwoPulley(centers[0], radii[0], centers[1], radii[1]);
    if (w) {
      rows.push({ id: coreIds[0], wrapDeg: w.w0, gripOk: w.w0 >= BELT_MIN_WRAP_OK_DEG });
      rows.push({ id: coreIds[1], wrapDeg: w.w1, gripOk: w.w1 >= BELT_MIN_WRAP_OK_DEG });
      const centroid = { x: (centers[0].x + centers[1].x) / 2, y: (centers[0].y + centers[1].y) / 2 };
      arcs.push({
        id: coreIds[0],
        d: `M ${w.seg.p0.x.toFixed(2)} ${w.seg.p0.y.toFixed(2)} ${arcAlongCircleExterior(centers[0].x, centers[0].y, radii[0], w.seg.p0, w.opp.p0, centroid)}`,
        ok: w.w0 >= BELT_MIN_WRAP_OK_DEG,
      });
      arcs.push({
        id: coreIds[1],
        d: `M ${w.seg.p1.x.toFixed(2)} ${w.seg.p1.y.toFixed(2)} ${arcAlongCircleExterior(centers[1].x, centers[1].y, radii[1], w.seg.p1, w.opp.p1, centroid)}`,
        ok: w.w1 >= BELT_MIN_WRAP_OK_DEG,
      });
    }
  } else {
    const hullIdx = convexHullIndices(centers);
    if (hullIdx.length >= 3) {
      const g = buildConvexBeltSegments(centers, radii, hullIdx);
      if (g) {
        const { segs, centroid } = g;
        const m = hullIdx.length;
        for (let k = 0; k < m; k++) {
          const prev = segs[(k - 1 + m) % m];
          const cur = segs[k];
          const ii = hullIdx[k];
          const cx = centers[ii].x;
          const cy = centers[ii].y;
          const r = radii[ii];
          const arcLen = arcLenExteriorMmEngine(cx, cy, r, prev.p1, cur.p0, centroid);
          const wrapDeg = (arcLen / r) * (180 / Math.PI);
          rows.push({ id: coreIds[ii], wrapDeg, gripOk: wrapDeg >= BELT_MIN_WRAP_OK_DEG });
          arcs.push({
            id: coreIds[ii],
            d: `M ${prev.p1.x.toFixed(2)} ${prev.p1.y.toFixed(2)} ${arcAlongCircleExterior(cx, cy, r, prev.p1, cur.p0, centroid)}`,
            ok: wrapDeg >= BELT_MIN_WRAP_OK_DEG,
          });
        }
      }
    }
  }

  return { lengthMm, rows, arcs, reliable: geo.reliable, idlerWraps };
}

/**
 * Lazo ordenado que fuerza contacto en todas las poleas (incluye tensoras/intermedias).
 * Aproxima puntos de entrada/salida por dirección entre centros consecutivos y suma arcos locales.
 * @param {{ x: number; y: number }[]} centers
 * @param {number[]} radii
 * @param {Array<{ role?: 'drive'|'driven'|'idler', wrapSide?: 'outside'|'inside', isExternal?: boolean, contacto?: 'interior'|'exterior' }>} [nodeMeta]
 * @param {Array<-1|1|null|undefined>} [edgeSigns] Signo por tramo i->i+1 (1=pos, -1=neg)
 * @returns {{ pathD: string; length_mm: number; reliable: boolean; note: string }}
 */
export function buildOrderedBeltPath2D(centers, radii, nodeMeta = [], edgeSigns = [], opts = {}) {
  const n = centers.length;
  const preferredMask =
    opts.preferredMask != null &&
    Number.isFinite(opts.preferredMask) &&
    opts.preferredMask >= 0 &&
    n <= 28 &&
    opts.preferredMask < 1 << n
      ? opts.preferredMask >>> 0
      : null;
  if (n < 2) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: 'Minimo 2 poleas.',
      idlerWrapsByIndex: [],
      tangentMask: null,
    };
  }
  if (n === 2) {
    const g = buildOpenBeltPath2D(centers, radii);
    return { ...g, idlerWrapsByIndex: [], tangentMask: null };
  }
  if (n > 24) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: 'Demasiadas poleas para enumerar tangentes (max 24).',
      idlerWrapsByIndex: [],
      tangentMask: null,
    };
  }
  const edges = Array.from({ length: n }, (_, i) => ({ i, j: (i + 1) % n }));
  const centroid = centers.reduce((acc, c) => ({ x: acc.x + c.x, y: acc.y + c.y }), { x: 0, y: 0 });
  centroid.x /= n;
  centroid.y /= n;
  const hasIdlerInPoly = nodeMeta.some((m) => m && m.role === 'idler');
  const isExternal = (meta) =>
    !!meta && (meta.contacto === 'exterior' || meta.isExternal === true || meta.wrapSide === 'outside');
  const edgeUsesInnerTangents = (i, j) => {
    const aExt = isExternal(nodeMeta[i] || {});
    const bExt = isExternal(nodeMeta[j] || {});
    return aExt !== bExt;
  };
  /** @type {Array<{pos: ReturnType<typeof outerTangentSegment>, neg: ReturnType<typeof outerTangentSegment>}>} */
  const edgeTangents = edges.map(({ i, j }) => {
    const useInner = edgeUsesInnerTangents(i, j);
    const tangentFn = useInner ? innerTangentSegment : outerTangentSegment;
    return {
      pos: tangentFn(centers[i], radii[i], centers[j], radii[j], +1),
      neg: tangentFn(centers[i], radii[i], centers[j], radii[j], -1),
    };
  });
  if (edgeTangents.some((e) => !e.pos && !e.neg)) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: 'Geometria invalida para tangencias en al menos un tramo.',
      idlerWrapsByIndex: [],
      tangentMask: null,
    };
  }

  const maxMask = 1 << n;
  /** @type {{ mask: number; score: number; len: number }[]} */
  const candidates = [];

  for (let mask = 0; mask < maxMask; mask++) {
    /** @type {Array<ReturnType<typeof outerTangentSegment>>} */
    const seg = [];
    let valid = true;
    for (let e = 0; e < n; e++) {
      const choosePos = ((mask >> e) & 1) === 1;
      const forced = edgeSigns[e];
      if (forced === 1 && !choosePos) {
        valid = false;
        break;
      }
      if (forced === -1 && choosePos) {
        valid = false;
        break;
      }
      const t = choosePos ? edgeTangents[e].pos : edgeTangents[e].neg;
      if (!t) {
        valid = false;
        break;
      }
      seg.push(t);
    }
    if (!valid) continue;
    if (hasSelfIntersections(seg)) continue;

    let L = 0;
    let externalWrapPenalty = 0;
    let externalWrapInvalid = false;
    for (let e = 0; e < n; e++) {
      const s = seg[e];
      L += Math.hypot(s.p1.x - s.p0.x, s.p1.y - s.p0.y);
    }
    for (let k = 0; k < n; k++) {
      const prev = seg[(k - 1 + n) % n];
      const cur = seg[k];
      const c = centers[k];
      const r = Math.max(1e-6, radii[k]);
      const tIn = angleOnCircle(c, prev.p1);
      const tOut = angleOnCircle(c, cur.p0);
      let d = tOut - tIn;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      const shortAbs = Math.abs(d);
      const meta = nodeMeta[k] || {};
      const insideIdler = meta.role === 'idler' && meta.wrapSide === 'inside';
      const externalIdler = meta.role === 'idler' && isExternal(meta);
      L += insideIdler ? r * (2 * Math.PI - shortAbs) : r * shortAbs;
      if (externalIdler) {
        const maxWrap = (95 * Math.PI) / 180;
        if (shortAbs > maxWrap) {
          externalWrapPenalty += shortAbs - maxWrap;
          externalWrapInvalid = true;
        }
      }
    }
    const dorsalExcessPenalty = externalWrapInvalid ? 2e6 : 0;
    let branchFlipPenalty = 0;
    for (let k = 0; k < n; k++) {
      const prevBit = (mask >> ((k - 1 + n) % n)) & 1;
      const curBit = (mask >> k) & 1;
      const meta = nodeMeta[k] || {};
      const isIdler = meta.role === 'idler';
      if (!isIdler && prevBit !== curBit) branchFlipPenalty += 1;
    }
    let exteriorPenalty = 0;
    let inflectionPenalty = 0;
    let idlerContactPenalty = 0;
    for (let e = 0; e < n; e++) {
      const i = e;
      const j = (e + 1) % n;
      const mi = nodeMeta[i] || {};
      const mj = nodeMeta[j] || {};
      if (mi.role === 'idler' || mj.role === 'idler') continue;
      const c0 = centers[i];
      const c1 = centers[j];
      const ux = c1.x - c0.x;
      const uy = c1.y - c0.y;
      const vx = centroid.x - c0.x;
      const vy = centroid.y - c0.y;
      const interiorSign = Math.sign(ux * vy - uy * vx);
      const tangentSign = Math.sign(ux * seg[e].n.y - uy * seg[e].n.x);
      if (interiorSign !== 0 && tangentSign !== 0 && interiorSign === tangentSign) exteriorPenalty += 1;

      const mixed = edgeUsesInnerTangents(i, j);
      if (mixed && interiorSign !== 0 && tangentSign !== 0 && interiorSign !== tangentSign) inflectionPenalty += 1;
    }
    for (let k = 0; k < n; k++) {
      const meta = nodeMeta[k] || {};
      const isExternalIdler = meta.role === 'idler' && isExternal(meta);
      if (!isExternalIdler) continue;
      const prev = seg[(k - 1 + n) % n];
      const cur = seg[k];
      const c = centers[k];
      const cx = centroid.x - c.x;
      const cy = centroid.y - c.y;
      const inx = prev.p1.x - c.x;
      const iny = prev.p1.y - c.y;
      const outx = cur.p0.x - c.x;
      const outy = cur.p0.y - c.y;
      const inToward = inx * cx + iny * cy;
      const outToward = outx * cx + outy * cy;
      if (!(inToward > 0)) idlerContactPenalty += 1;
      if (!(outToward > 0)) idlerContactPenalty += 1;
    }
    const maskStability =
      preferredMask != null ? tangentMaskHamming(mask, preferredMask, n) * 6e3 : 0;
    const score =
      L +
      branchFlipPenalty * 1e6 +
      exteriorPenalty * 1e6 +
      inflectionPenalty * 1e6 +
      idlerContactPenalty * 1e6 +
      externalWrapPenalty * 1e5 +
      dorsalExcessPenalty +
      maskStability;
    candidates.push({ mask, score, len: L });
  }

  candidates.sort((a, b) => a.score - b.score);

  function materializeFromMask(mask) {
    /** @type {Array<ReturnType<typeof outerTangentSegment>>} */
    const bestSeg = [];
    for (let e = 0; e < n; e++) {
      const choosePos = ((mask >> e) & 1) === 1;
      bestSeg.push((choosePos ? edgeTangents[e].pos : edgeTangents[e].neg) || edgeTangents[e].pos || edgeTangents[e].neg);
    }

    let pathD = `M ${bestSeg[0].p0.x.toFixed(2)} ${bestSeg[0].p0.y.toFixed(2)}`;
    for (let e = 0; e < n; e++) {
      const s = bestSeg[e];
      const k = (e + 1) % n;
      const nextOut = bestSeg[k].p0;
      const c = centers[k];
      const r = Math.max(1e-6, radii[k]);
      const tIn = angleOnCircle(c, s.p1);
      const tOut = angleOnCircle(c, nextOut);
      let d = tOut - tIn;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      const shortAbs = Math.abs(d);
      const meta = nodeMeta[k] || {};
      const insideIdler = meta.role === 'idler' && meta.wrapSide === 'inside';
      const externalIdler = isExternal(meta);
      const largeArc = insideIdler ? 1 : externalIdler ? 0 : shortAbs > Math.PI ? 1 : 0;
      const sweep = insideIdler ? (d >= 0 ? 0 : 1) : d >= 0 ? 1 : 0;
      pathD += ` L ${s.p1.x.toFixed(2)} ${s.p1.y.toFixed(2)}`;
      pathD += ` A ${r.toFixed(3)} ${r.toFixed(3)} 0 ${largeArc} ${sweep} ${nextOut.x.toFixed(2)} ${nextOut.y.toFixed(2)}`;
    }
    pathD += ' Z';

    /** @type {{ index: number; wrapDeg: number }[]} */
    const idlerWrapsByIndex = [];
    for (let k = 0; k < n; k++) {
      const meta = nodeMeta[k] || {};
      if (meta.role !== 'idler') continue;
      const prev = bestSeg[(k - 1 + n) % n];
      const cur = bestSeg[k];
      const c = centers[k];
      const r = Math.max(1e-6, radii[k]);
      const tIn = angleOnCircle(c, prev.p1);
      const tOut = angleOnCircle(c, cur.p0);
      let d = tOut - tIn;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      const shortAbs = Math.abs(d);
      const insideIdler = meta.role === 'idler' && meta.wrapSide === 'inside';
      const arcLen = insideIdler ? r * (2 * Math.PI - shortAbs) : r * shortAbs;
      const wrapDeg = (arcLen / r) * (180 / Math.PI);
      idlerWrapsByIndex.push({ index: k, wrapDeg });
    }
    return { pathD, idlerWrapsByIndex };
  }

  /** @type {{ mask: number; len: number; pathD: string; idlerWrapsByIndex: { index: number; wrapDeg: number }[] } | null} */
  let picked = null;
  for (const c of candidates) {
    const m = materializeFromMask(c.mask);
    const polyOk = !hasIdlerInPoly || !beltPathHasSelfIntersectionApprox(m.pathD);
    if (m.pathD && polyOk) {
      picked = { mask: c.mask, len: c.len, pathD: m.pathD, idlerWrapsByIndex: m.idlerWrapsByIndex };
      break;
    }
  }

  if (!picked) {
    return {
      pathD: '',
      length_mm: 0,
      reliable: false,
      note: 'No se encontro combinacion de tangentes valida (segmentos o autocruce poligonal).',
      idlerWrapsByIndex: [],
      tangentMask: null,
    };
  }

  return {
    pathD: picked.pathD,
    length_mm: picked.len,
    reliable: true,
    note:
      'Lazo ordenado en secuencia de poleas: tangentes sin cruce de tramos; validacion poligonal; máscara estable preferida.',
    idlerWrapsByIndex: picked.idlerWrapsByIndex,
    tangentMask: picked.mask,
  };
}

function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const vv = vx * vx + vy * vy;
  const t = vv > 1e-9 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv)) : 0;
  const qx = ax + t * vx;
  const qy = ay + t * vy;
  return Math.hypot(px - qx, py - qy);
}

/**
 * Ordena nodos (inserta tensoras en el tramo del casco más cercano). **No** es el orden del trazado:
 * el lazo de correa usa {@link beltRunSequentialNodeIds} = orden estricto de `br.nodeIds`.
 * @param {TxState} state
 * @param {{ nodeIds: number[] }} br
 */
export function orderedBeltNodeIds(state, br) {
  const all = (br.nodeIds || []).filter((id) => state.nodes.some((n) => n.id === id && n.kind === 'pulley'));
  if (all.length < 3) return all;

  /** @type {number[]} */
  const core = [];
  /** @type {number[]} */
  const idlers = [];
  for (const id of all) {
    const n = state.nodes.find((x) => x.id === id);
    if (!n || n.kind !== 'pulley') continue;
    if (n.pulleyRole === 'idler') idlers.push(id);
    else core.push(id);
  }
  if (core.length < 2) return all;

  /** @type {number[]} */
  const ring = [...core];
  for (const id of idlers) {
    const p = state.nodes.find((x) => x.id === id);
    if (!p) continue;
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < ring.length; i++) {
      const a = state.nodes.find((x) => x.id === ring[i]);
      const b = state.nodes.find((x) => x.id === ring[(i + 1) % ring.length]);
      if (!a || !b) continue;
      const d = pointSegmentDistance(p.x, p.y, a.x, a.y, b.x, b.y);
      if (d < bestD) {
        bestD = d;
        bestIdx = i + 1;
      }
    }
    ring.splice(bestIdx, 0, id);
  }
  return ring;
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
 *   pulleyRole?: 'drive'|'driven'|'idler';
 *   idlerWrapSide?: 'outside'|'inside';
 *   isExternal?: boolean;
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
 *   beltRuns: { id: string; nodeIds: number[]; kind: 'v'|'sync'|'flat'; slip: number; pitch_mm?: number; edgeSigns?: Array<-1|1> }[];
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

/** Diámetro primitivo correa síncrona: d = z·p/π */
export function syncBeltPitchDiameter_mm(z, pitch_mm) {
  const zf = Math.max(6, z);
  const p = Math.max(1e-6, pitch_mm);
  return (zf * p) / Math.PI;
}

/**
 * Diámetro efectivo para cinemática de correa en una corrida.
 * Síncrona: si la polea tiene z y existe paso de corrida, usa z·p/π; si no, Ø geométrico.
 */
export function pulleyBeltDiameter_mm(node, br) {
  if (!node || node.kind !== 'pulley') return getNodeD_mm(node);
  if (br.kind !== 'sync') return getNodeD_mm(node);
  const p = Math.max(1e-6, br.pitch_mm ?? 8);
  const z = node.z;
  if (z != null && Number.isFinite(z) && z >= 6) return syncBeltPitchDiameter_mm(z, p);
  return getNodeD_mm(node);
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
      pulleyRole: 'driven',
      idlerWrapSide: 'outside',
      isExternal: false,
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
      const orderedIds = beltRunSequentialNodeIds(state, br);
      if (orderedIds.length < 2) continue;

      const bk = br.kind ?? 'v';
      const slip = bk === 'sync' ? 0 : Math.max(0, Math.min(0.08, br.slip ?? 0.015));
      const eff = 1 - slip;
      const lossT = bk === 'sync' ? 1 : 0.98;

      for (let i = 0; i < orderedIds.length; i++) {
        const aId = orderedIds[i];
        const bId = orderedIds[(i + 1) % orderedIds.length];
        if (aId === bId) continue;

        const a = state.nodes.find((n) => n.id === aId);
        const b = state.nodes.find((n) => n.id === bId);
        if (!a || !b) continue;
        const da = pulleyBeltDiameter_mm(a, br);
        const db = pulleyBeltDiameter_mm(b, br);
        if (!(da > 0 && db > 0)) continue;

        if (cur.id === aId && !seen.has(bId)) {
          const nAbs = Math.abs(cur.n);
          const nNext = nAbs * (da / db) * eff;
          const Tnext = cur.T * (db / da) * lossT;
          seen.add(bId);
          out.byId[bId] = {
            n_rpm: nNext * cur.sign,
            T_Nm: Math.abs(Tnext),
            omega: (nNext * cur.sign * 2 * Math.PI) / 60,
          };
          q.push({ id: bId, n: nNext, T: Math.abs(Tnext), sign: cur.sign });
          const za = a.z != null && Number.isFinite(a.z) ? Math.max(6, a.z) : null;
          const zb = b.z != null && Number.isFinite(b.z) ? Math.max(6, b.z) : null;
          const pSync = Math.max(1e-6, br.pitch_mm ?? 8);
          if (bk === 'sync' && za != null && zb != null) {
            out.formulas.push(
              `Correa síncrona: n₂ = n₁·z₁/z₂ = ${nAbs.toFixed(2)}·${za}/${zb} = ${(nAbs * (za / zb)).toFixed(2)} min⁻¹ (paso p=${pSync.toFixed(3)} mm).`,
            );
          } else if (bk === 'sync') {
            out.formulas.push(
              `Correa síncrona: n₂ = n₁·d₁/d₂ = ${nAbs.toFixed(2)}·${da.toFixed(1)}/${db.toFixed(1)} = ${(nAbs * (da / db)).toFixed(2)} min⁻¹ (defina z en poleas para usar z₁/z₂).`,
            );
          } else if (bk === 'flat') {
            out.formulas.push(
              `Correa plana: n₂ ≈ n₁·(d₁/d₂)·(1−s), s=${(slip * 100).toFixed(2)}% → ${nNext.toFixed(2)} min⁻¹.`,
            );
          } else {
            out.formulas.push(
              `Correa V: n₂ ≈ n₁·(d₁/d₂)·(1−s), s=${(slip * 100).toFixed(2)}% → ${nNext.toFixed(2)} min⁻¹.`,
            );
          }
        } else if (cur.id === bId && !seen.has(aId)) {
          const nAbs = Math.abs(cur.n);
          const nPrev = nAbs * (db / da) * eff;
          const Tprev = cur.T * (da / db) * lossT;
          seen.add(aId);
          out.byId[aId] = {
            n_rpm: nPrev * cur.sign,
            T_Nm: Math.abs(Tprev),
            omega: (nPrev * cur.sign * 2 * Math.PI) / 60,
          };
          q.push({ id: aId, n: nPrev, T: Math.abs(Tprev), sign: cur.sign });
        }
      }
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
    const bk = br.kind ?? 'v';
    const geo = beltRunGeometry(state, br, br.centerOverride_mm ?? 0);
    const Lgeom = geo.length_mm;
    const Leff = bk === 'sync' ? Lgeom : Lgeom * (1 + (br.slip ?? 0.015));
    const comm = nearestCommercialVBeltLength(Leff);
    if (!geo.reliable) items.push({ level: VERDICT.WARN, text: `Correa ${br.id}: ${geo.note}` });
    else if (bk === 'v' && !comm.ok) {
      items.push({
        level: VERDICT.WARN,
        text: `Correa V ${br.id}: L efectiva ≈${Leff.toFixed(0)} mm no encaja en paso comercial ±15 mm (nominal demo ${comm.L_nom} mm). Desplace poleas Δ≈${comm.delta_mm.toFixed(0)} mm en tramo libre o elija otra referencia.`,
      });
    }
    const orderedIds = beltRunSequentialNodeIds(state, br);
    for (const pid of orderedIds) {
      const pn = state.nodes.find((x) => x.id === pid);
      if (bk === 'v' && pn?.kind === 'pulley' && (pn.d_mm ?? 0) < V_BELT_WARN_MIN_D_MM) {
        items.push({
          level: VERDICT.WARN,
          text: `Correa V ${br.id}: Ø primitivo polea #${pid} = ${(pn.d_mm ?? 0).toFixed(0)} mm < orientativo mínimo demo (${V_BELT_WARN_MIN_D_MM} mm) para agarre típico — valide sección y catálogo.`,
        });
      }
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
