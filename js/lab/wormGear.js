/** Worm gear pair — indicative geometry and efficiency (ISO 3408-style q). */

const DEG = 180 / Math.PI;

/**
 * Diameter quotient q from axial module (ISO 3408 indicative).
 * @param {number} mx_mm
 */
export function diameterQuotientISO3408(mx_mm) {
  const mx = Math.max(0.1, mx_mm);
  if (mx <= 4) return 10;
  if (mx <= 8) return 11;
  if (mx <= 16) return 12;
  if (mx <= 25) return 13;
  return 14;
}

/**
 * @param {object} p
 * @param {number} p.mx_mm axial module
 * @param {number} p.nw worm starts (threads)
 * @param {number} p.z2 wheel teeth
 * @param {number} p.friction mu
 * @param {number} p.n1_rpm
 * @param {number} [p.power_kw]
 * @param {number} [p.q] optional override
 */
export function computeWormGear(p) {
  const mx = Math.max(0.1, p.mx_mm);
  const nw = Math.max(1, Math.round(p.nw));
  const z2 = Math.max(1, Math.round(p.z2));
  const mu = Math.max(0, Math.min(0.5, p.friction));
  const n1 = Math.max(0, p.n1_rpm);
  const powerKw = p.power_kw > 0 ? p.power_kw : null;

  const q = p.q != null && p.q > 0 ? p.q : diameterQuotientISO3408(mx);
  const d1 = q * mx;
  const d2 = mx * z2;
  const a = (d1 + d2) / 2;
  const i = z2 / nw;

  const gammaRad = Math.atan((nw * mx) / Math.max(1e-9, d1));
  const phiRad = Math.atan(mu);
  const gammaDeg = gammaRad * DEG;
  const phiDeg = phiRad * DEG;

  const tanG = Math.tan(gammaRad);
  const tanGp = Math.tan(gammaRad + phiRad);
  const etaDirect = tanGp > 1e-12 ? Math.max(0, Math.min(1, tanG / tanGp)) : 0;
  const etaDirectPct = etaDirect * 100;

  const selfLocking = gammaRad <= phiRad + 1e-12;
  let etaInverse = null;
  if (!selfLocking && tanG > 1e-12) {
    const tanGm = Math.tan(Math.max(1e-9, gammaRad - phiRad));
    etaInverse = Math.max(0, Math.min(1, tanGm / tanG));
  }

  const T1 = powerKw != null && n1 > 0 ? (9550 * powerKw) / n1 : null;
  const T2 = T1 != null ? T1 * i * etaDirect : null;
  const n2 = n1 > 0 ? n1 / i : null;

  return {
    mx_mm: mx,
    nw,
    z2,
    q,
    d1_mm: d1,
    d2_mm: d2,
    a_mm: a,
    i,
    gammaDeg,
    phiDeg,
    etaDirect,
    etaDirectPct,
    etaInverse,
    selfLocking,
    T1_Nm: T1,
    T2_Nm: T2,
    n2_rpm: n2,
  };
}

/**
 * @param {number} targetI desired z2/nw
 * @returns {{ nw: number, z2: number, mx_mm: number }}
 */
export function suggestWormDesignFromRatio(targetI) {
  const i = Math.max(5, targetI);
  const starts = [1, 2, 4];
  for (const nw of starts) {
    const z2 = Math.round(i * nw);
    if (z2 >= 20 && Math.abs(z2 / nw - i) < 0.02) {
      return { nw, z2, mx_mm: i >= 30 ? 3 : i >= 15 ? 2.5 : 2 };
    }
  }
  const nw = 1;
  return { nw, z2: Math.max(20, Math.round(i)), mx_mm: 3 };
}
