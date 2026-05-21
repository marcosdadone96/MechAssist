/**
 * Menú hamburguesa en cabecera global (< 768px).
 * Mantiene visibles: logo, botón menú y selector de idioma.
 */

const MQ = '(min-width: 768px)';

/**
 * @param {HTMLElement} nav
 */
function placeLangForViewport(nav) {
  const end = nav.querySelector('.site-nav__end');
  const lang = nav.querySelector('.site-nav__lang, .hub-lang');
  const slot = nav.querySelector('.site-nav__lang-slot');
  if (!end || !lang) return;

  const desktop = window.matchMedia(MQ).matches;
  if (desktop) {
    if (slot?.contains(lang)) {
      end.insertBefore(lang, end.firstChild);
    }
    if (slot) slot.hidden = true;
    nav.classList.remove('site-nav--menu-open');
    const toggle = nav.querySelector('.site-nav__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  } else if (slot && !slot.contains(lang)) {
    slot.appendChild(lang);
    slot.hidden = false;
  }
}

function initSiteNavMobile() {
  const nav = document.querySelector('header.site-nav');
  if (!nav || nav.dataset.navMobileInit === '1') return;
  nav.dataset.navMobileInit = '1';

  const end = nav.querySelector('.site-nav__end');
  const lang = end?.querySelector('.site-nav__lang, .hub-lang');
  if (!lang) return;

  const langSlot = document.createElement('div');
  langSlot.className = 'site-nav__lang-slot';
  nav.appendChild(langSlot);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'site-nav__toggle';
  toggle.setAttribute('aria-expanded', 'false');
  const en = (() => {
    try {
      return localStorage.getItem('mdr-home-lang') === 'en';
    } catch (_) {
      return false;
    }
  })();
  toggle.setAttribute('aria-label', en ? 'Open menu' : 'Abrir menú');
  toggle.innerHTML =
    '<span class="site-nav__toggle-bar" aria-hidden="true"></span><span class="site-nav__toggle-bar" aria-hidden="true"></span><span class="site-nav__toggle-bar" aria-hidden="true"></span>';

  const brand = nav.querySelector('.site-nav__brand');
  if (brand) brand.insertAdjacentElement('afterend', toggle);

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('site-nav--menu-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Cerrar menú') : en ? 'Open menu' : 'Abrir menú');
  });

  nav.querySelectorAll('.site-nav__center a, .site-nav__end a').forEach((a) => {
    a.addEventListener('click', () => {
      if (!window.matchMedia(MQ).matches) {
        nav.classList.remove('site-nav--menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  placeLangForViewport(nav);
  window.matchMedia(MQ).addEventListener('change', () => placeLangForViewport(nav));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteNavMobile);
} else {
  initSiteNavMobile();
}
