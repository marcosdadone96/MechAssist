/**
 * Geometría para diagramas SVG — correa/cadena abierta entre dos poleas circulares.
 * Convención SVG: eje y hacia abajo; ángulos en radianes (Math.cos / Math.sin).
 */

/**
 * Puntos de tangencia para tramos rectos exteriores (correa abierta).
 * rL en xL, rR en xR; se asume xR > xL y rL ≥ rR (polea mayor a la izquierda).
 */
export function svgOpenBeltTangents(xL, y, rL, xR, rR) {
  const d = Math.max(1e-6, xR - xL);
  const phi = 0;
  const dr = rL - rR;
  const alpha = Math.asin(Math.min(1, Math.max(-1, dr / d)));
  const tUpper = phi + alpha + Math.PI / 2;
  const tLower = phi - alpha - Math.PI / 2;
  return {
    UL: { x: xL + rL * Math.cos(tUpper), y: y + rL * Math.sin(tUpper) },
    UR: { x: xR + rR * Math.cos(tUpper), y: y + rR * Math.sin(tUpper) },
    LL: { x: xL + rL * Math.cos(tLower), y: y + rL * Math.sin(tLower) },
    LR: { x: xR + rR * Math.cos(tLower), y: y + rR * Math.sin(tLower) },
    tUpper,
    tLower,
  };
}

function fmtPt(p) {
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

/**
 * Trayectoria cerrada del ramal exterior de correa/cadena (tangentes + arcos).
 */
export function svgOpenBeltLoopPath(xL, y, rL, xR, rR) {
  const { UL, UR, LL, LR } = svgOpenBeltTangents(xL, y, rL, xR, rR);
  return [
    `M ${fmtPt(UL)}`,
    `L ${fmtPt(UR)}`,
    `A ${rR} ${rR} 0 0 1 ${fmtPt(LR)}`,
    `L ${fmtPt(LL)}`,
    `A ${rL} ${rL} 0 1 0 ${fmtPt(UL)}`,
    'Z',
  ].join(' ');
}

/**
 * Tangente externa entre dos circunferencias colineales (mismo y): tramo superior o inferior.
 * @param {boolean} upper
 * @returns {{ a: {x:number,y:number}, b: {x:number,y:number} }}
 */
export function svgBeltExternalSegment(xL, y, rL, xR, rR, upper) {
  const t = svgOpenBeltTangents(xL, y, rL, xR, rR);
  return upper ? { a: t.UL, b: t.UR } : { a: t.LL, b: t.LR };
}

function arcAlongCircle(cx, cy, r, pFrom, pTo) {
  const t0 = Math.atan2(pFrom.y - cy, pFrom.x - cx);
  const t1 = Math.atan2(pTo.y - cy, pTo.x - cx);
  let d = t1 - t0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const largeArc = Math.abs(d) > Math.PI ? 1 : 0;
  const sweep = d > 0 ? 1 : 0;
  return `A ${r} ${r} 0 ${largeArc} ${sweep} ${fmtPt(pTo)}`;
}

/** Arco cuyo punto medio queda más alejado del centroide (lado exterior del polígono). */
function arcAlongCircleExterior(cx, cy, r, pFrom, pTo, centroid) {
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
  const largeArc = Math.abs(d) > Math.PI ? 1 : 0;
  const sweep = d > 0 ? 1 : 0;
  return `A ${r} ${r} 0 ${largeArc} ${sweep} ${fmtPt(pTo)}`;
}

/**
 * Tangente exterior entre circunferencias en posición general (2D).
 * @param {1|-1} side
 */
function outerTangent2D(c0, r0, c1, r1, side) {
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
  };
}

function pickExteriorTangentSegment(Ci, ri, Cj, rj, midEdge, outward) {
  const a = outerTangent2D(Ci, ri, Cj, rj, 1);
  const b = outerTangent2D(Ci, ri, Cj, rj, -1);
  const score = (seg) => {
    if (!seg) return -Infinity;
    const mx = (seg.p0.x + seg.p1.x) / 2;
    const my = (seg.p0.y + seg.p1.y) / 2;
    return (mx - midEdge.x) * outward.x + (my - midEdge.y) * outward.y;
  };
  if (!a) return b;
  if (!b) return a;
  return score(a) >= score(b) ? a : b;
}

/**
 * Índices del cierre convexo (CCW en coords. matemáticas; válido para tangentes con centroide).
 * @param {{ x: number; y: number }[]} centers
 * @returns {number[]}
 */
export function convexHullIndices(centers) {
  const n = centers.length;
  if (n <= 2) return [...Array(n).keys()];
  const idx = [...Array(n).keys()].sort((i, j) =>
    centers[i].x === centers[j].x ? centers[i].y - centers[j].y : centers[i].x - centers[j].x,
  );
  const cross = (i, j, k) => {
    const o = centers[i];
    const a = centers[j];
    const b = centers[k];
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  };
  const lower = [];
  for (const i of idx) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], i) <= 0) lower.pop();
    lower.push(i);
  }
  const upper = [];
  for (let u = idx.length - 1; u >= 0; u--) {
    const i = idx[u];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], i) <= 0) upper.pop();
    upper.push(i);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/**
 * @returns {{ segs: { p0: { x: number; y: number }; p1: { x: number; y: number } }[]; centroid: { x: number; y: number } } | null}
 */
function buildConvexBeltSegments(centers, radii, hullIdx) {
  const m = hullIdx.length;
  if (m < 3) return null;
  const centroid = {
    x: centers.reduce((s, c) => s + c.x, 0) / centers.length,
    y: centers.reduce((s, c) => s + c.y, 0) / centers.length,
  };
  /** @type {{ p0: { x: number; y: number }; p1: { x: number; y: number } }[]} */
  const segs = [];
  for (let k = 0; k < m; k++) {
    const i = hullIdx[k];
    const j = hullIdx[(k + 1) % m];
    const Ci = centers[i];
    const Cj = centers[j];
    const ri = radii[i];
    const rj = radii[j];
    const mid = { x: (Ci.x + Cj.x) / 2, y: (Ci.y + Cj.y) / 2 };
    const toC = { x: centroid.x - mid.x, y: centroid.y - mid.y };
    const len = Math.hypot(toC.x, toC.y) || 1;
    const outward = { x: -toC.x / len, y: -toC.y / len };
    const seg = pickExteriorTangentSegment(Ci, ri, Cj, rj, mid, outward);
    if (!seg) return null;
    segs.push(seg);
  }
  return { segs, centroid };
}

function arcLenExteriorMm(cx, cy, r, pFrom, pTo, centroid) {
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

/**
 * Longitud aproximada del lazo exterior convexo (mm).
 */
export function convexExteriorBeltLengthMm(centers, radii, hullIdx) {
  const g = buildConvexBeltSegments(centers, radii, hullIdx);
  if (!g) return 0;
  const { segs, centroid } = g;
  const m = hullIdx.length;
  let L = 0;
  for (const seg of segs) {
    L += Math.hypot(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y);
  }
  for (let k = 0; k < m; k++) {
    const prev = segs[(k - 1 + m) % m];
    const cur = segs[k];
    const idx = hullIdx[k];
    const c = centers[idx];
    const r = radii[idx];
    L += arcLenExteriorMm(c.x, c.y, r, prev.p1, cur.p0, centroid);
  }
  return L;
}

/**
 * Lazo cerrado envolviendo el exterior del cierre convexo (tangentes + arcos), como correa/cadena alrededor.
 * @param {{ x: number; y: number }[]} centers
 * @param {number[]} radii — mismo índice que centers
 * @param {number[]} hullIdx — salida de convexHullIndices(centers)
 */
export function svgConvexExteriorBelt(centers, radii, hullIdx) {
  const g = buildConvexBeltSegments(centers, radii, hullIdx);
  if (!g) return '';
  const { segs, centroid } = g;
  const m = hullIdx.length;
  const parts = [];
  parts.push(`M ${fmtPt(segs[0].p0)}`, `L ${fmtPt(segs[0].p1)}`);
  for (let k = 1; k < m; k++) {
    const prev = segs[k - 1];
    const cur = segs[k];
    const idx = hullIdx[k];
    const c = centers[idx];
    const r = radii[idx];
    parts.push(arcAlongCircleExterior(c.x, c.y, r, prev.p1, cur.p0, centroid));
    parts.push(`L ${fmtPt(cur.p1)}`);
  }
  const last = segs[m - 1];
  const first = segs[0];
  const i0 = hullIdx[0];
  parts.push(arcAlongCircleExterior(centers[i0].x, centers[i0].y, radii[i0], last.p1, first.p0, centroid));
  parts.push('Z');
  return parts.join(' ');
}

/**
 * Correa serpentina abierta sobre N poleas colineales (alterna tramos superior/inferior).
 * Para N=2 devuelve el lazo cerrado habitual.
 * @param {number[]} xsPos — posiciones X de centros (misma unidad que r)
 * @param {number} y — eje común
 * @param {number[]} radii — r_i
 */
export function svgSerpentineOpenPath(xsPos, y, radii) {
  const n = xsPos.length;
  if (n < 2) return '';
  if (n === 2) return svgOpenBeltLoopPath(xsPos[0], y, radii[0], xsPos[1], radii[1]);

  const parts = [];
  let upper = true;
  /** @type {{x:number,y:number}|null} */
  let prevPt = null;

  for (let k = 0; k < n - 1; k++) {
    const xL = xsPos[k];
    const rL = radii[k];
    const xR = xsPos[k + 1];
    const rR = radii[k + 1];
    const seg = svgBeltExternalSegment(xL, y, rL, xR, rR, upper);

    if (k === 0) {
      parts.push(`M ${fmtPt(seg.a)}`);
      parts.push(`L ${fmtPt(seg.b)}`);
      prevPt = seg.b;
    } else {
      const cx = xsPos[k];
      const cy = y;
      const r = radii[k];
      parts.push(arcAlongCircle(cx, cy, r, prevPt, seg.a));
      parts.push(`L ${fmtPt(seg.b)}`);
      prevPt = seg.b;
    }
    upper = !upper;
  }

  return parts.join(' ');
}

/**
 * Lazo cerrado serpentín sobre N poleas colineales (misma cota Y): ida por un ramal y vuelta por el opuesto.
 * Orden de xsPos debe ser de izquierda a derecha en el plano de la correa.
 */
export function svgSerpentineClosedPath(xsPos, y, radii) {
  const n = xsPos.length;
  if (n < 2) return '';
  if (n === 2) return svgOpenBeltLoopPath(xsPos[0], y, radii[0], xsPos[1], radii[1]);

  const parts = [];
  let upper = true;
  /** @type {{ x: number; y: number } | null} */
  let prevPt = null;
  /** @type {{ x: number; y: number } | null} */
  let startPt = null;

  for (let k = 0; k < n - 1; k++) {
    const seg = svgBeltExternalSegment(xsPos[k], y, radii[k], xsPos[k + 1], y, radii[k + 1], upper);
    if (k === 0) {
      startPt = seg.a;
      parts.push(`M ${fmtPt(seg.a)}`, `L ${fmtPt(seg.b)}`);
      prevPt = seg.b;
    } else {
      parts.push(arcAlongCircle(xsPos[k], y, radii[k], prevPt, seg.a));
      parts.push(`L ${fmtPt(seg.b)}`);
      prevPt = seg.b;
    }
    upper = !upper;
  }

  upper = !upper;
  for (let k = n - 1; k > 0; k--) {
    const seg = svgBeltExternalSegment(xsPos[k - 1], y, radii[k - 1], xsPos[k], y, radii[k], upper);
    parts.push(arcAlongCircle(xsPos[k], y, radii[k], prevPt, seg.b));
    parts.push(`L ${fmtPt(seg.a)}`);
    prevPt = seg.a;
    upper = !upper;
  }

  if (startPt && prevPt) {
    parts.push(arcAlongCircle(xsPos[0], y, radii[0], prevPt, startPt));
  }
  parts.push('Z');
  return parts.join(' ');
}
