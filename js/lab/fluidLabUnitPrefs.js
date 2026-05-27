/**
 * Preferencias de unidades para calculadoras de fluidos (presion y caudal).
 */

const STORAGE_KEY = 'mdt_lab_fluid_units_v1';

/** @typedef {{ pressure: 'bar'|'mpa'|'psi', flow: 'Lmin'|'m3h' }} FluidUnitPrefs */

const DEFAULTS = /** @type {FluidUnitPrefs} */ ({
  pressure: 'bar',
  flow: 'Lmin',
});

/**
 * @returns {FluidUnitPrefs}
 */
export function getFluidUnitPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const j = JSON.parse(raw);
    return { ...DEFAULTS, ...j };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * @param {Partial<FluidUnitPrefs>} p
 */
export function saveFluidUnitPrefs(p) {
  const next = { ...getFluidUnitPrefs(), ...p };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * @param {number | null | undefined} bar
 * @param {'bar'|'mpa'|'psi'} [pref]
 */
export function formatPressureBar(bar, pref = getFluidUnitPrefs().pressure) {
  if (bar == null || !Number.isFinite(bar)) return '\u2014';
  if (pref === 'mpa') return `${(bar * 0.1).toFixed(2)} MPa`;
  if (pref === 'psi') return `${(bar * 14.5038).toFixed(0)} psi`;
  return `${bar.toFixed(1)} bar`;
}

/**
 * @param {number | null | undefined} lmin
 * @param {'Lmin'|'m3h'} [pref]
 */
export function formatFlowLmin(lmin, pref = getFluidUnitPrefs().flow) {
  if (lmin == null || !Number.isFinite(lmin)) return '\u2014';
  if (pref === 'm3h') return `${(lmin * 0.06).toFixed(2)} m\u00b3/h`;
  return `${lmin.toFixed(2)} L/min`;
}

/**
 * @param {number | null | undefined} nlMin
 * @param {'Lmin'|'m3h'} [pref]
 */
export function formatNlMin(nlMin, pref = getFluidUnitPrefs().flow) {
  if (nlMin == null || !Number.isFinite(nlMin)) return '\u2014';
  if (pref === 'm3h') return `${(nlMin * 0.06).toFixed(2)} m\u00b3/h`;
  return `${nlMin.toFixed(1)} Nl/min`;
}

/**
 * @param {() => void} onChange — repintar resultados (sin tocar entradas).
 */
export function bindFluidLabUnitSelectors(onChange) {
  const pres = document.getElementById('labUnitPressure');
  const flow = document.getElementById('labUnitFlow');
  const p = getFluidUnitPrefs();

  if (pres instanceof HTMLSelectElement) pres.value = p.pressure;
  if (flow instanceof HTMLSelectElement) flow.value = p.flow;

  const fire = () => {
    saveFluidUnitPrefs({
      pressure:
        pres instanceof HTMLSelectElement ? /** @type {'bar'|'mpa'|'psi'} */ (pres.value) : p.pressure,
      flow: flow instanceof HTMLSelectElement ? /** @type {'Lmin'|'m3h'} */ (flow.value) : p.flow,
    });
    onChange();
  };

  pres?.addEventListener('change', fire);
  flow?.addEventListener('change', fire);
}
