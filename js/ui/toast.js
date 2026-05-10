/**
 * Toasts no bloqueantes (sustituye alert() en la UI).
 * @param {string} message
 * @param {{ variant?: 'info'|'success'|'error'; duration?: number }} [opts]
 */
export function showToast(message, opts = {}) {
  const variant = opts.variant ?? 'info';
  const duration = opts.duration ?? 4200;
  const text = String(message ?? '').trim();
  if (!text) return;

  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = `mdr-toast mdr-toast--${variant}`;
  el.setAttribute('role', variant === 'error' ? 'alert' : 'status');
  el.textContent = text;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('mdr-toast--visible'));
  window.setTimeout(() => {
    el.classList.remove('mdr-toast--visible');
    window.setTimeout(() => el.remove(), 280);
  }, duration);
}

function ensureToastHost() {
  let host = document.getElementById('mdr-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'mdr-toast-host';
    host.className = 'mdr-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  return host;
}
