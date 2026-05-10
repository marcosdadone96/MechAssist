/**
 * labToast.js — Notificaciones toast no bloqueantes para el laboratorio.
 * Sin dependencias externas.
 */

let _container = null;

function getContainer() {
  if (_container && document.body.contains(_container)) return _container;
  _container = document.createElement('div');
  _container.setAttribute('aria-live', 'polite');
  _container.setAttribute('aria-atomic', 'false');
  Object.assign(_container.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: '9999',
    pointerEvents: 'none',
  });
  document.body.appendChild(_container);
  return _container;
}

/**
 * @param {string} message
 * @param {{ type?: 'ok'|'error'|'info', durationMs?: number }} [opts]
 */
export function showToast(message, { type = 'info', durationMs = 3500 } = {}) {
  if (typeof document === 'undefined') return;
  const palette = {
    ok:    { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
    error: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
    info:  { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  };
  const c = palette[type] || palette.info;
  const el = document.createElement('div');
  Object.assign(el.style, {
    background:    c.bg,
    border:        `1px solid ${c.border}`,
    color:         c.text,
    padding:       '0.65rem 1rem',
    borderRadius:  '8px',
    fontSize:      '13px',
    fontWeight:    '500',
    fontFamily:    'var(--font-sans, sans-serif)',
    pointerEvents: 'auto',
    maxWidth:      '320px',
    boxShadow:     '0 2px 8px rgba(0,0,0,0.12)',
    transition:    'opacity 0.3s ease, transform 0.3s ease',
    opacity:       '0',
    transform:     'translateY(8px)',
  });
  el.textContent = message;
  getContainer().appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 350);
  }, durationMs);
}
