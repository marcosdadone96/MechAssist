/**
 * Contador de c�lculos en la pesta�a actual (sessionStorage).
 * No env�a datos al servidor.
 */

const SESSION_KEY = 'mdr-session-calcs';

export function incrementCalcCounter() {
  try {
    const current = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
    sessionStorage.setItem(SESSION_KEY, String(current + 1));
    updateCounterUI();
  } catch {
    /* ignore */
  }
}

export function updateCounterUI() {
  const el = document.getElementById('session-calc-count');
  if (!el) return;
  try {
    const count = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
    el.textContent = String(count);
    const wrap = el.closest('.session-counter');
    if (wrap) wrap.classList.toggle('session-counter--visible', count > 0);
  } catch {
    /* ignore */
  }
}
