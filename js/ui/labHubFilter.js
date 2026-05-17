/**
 * Live filter for hub index cards (Laboratorio / Maquinas / Fluidos).
 * @param {ParentNode} root
 */
export function initLabHubCardFilter(root = document.body) {
  const input = root.querySelector('[data-lab-hub-filter]');
  if (!(input instanceof HTMLInputElement)) return;

  const cards = root.querySelectorAll('[data-lab-hub-keywords]');
  if (!cards.length) return;

  const sections = root.querySelectorAll('.lab-index-section');

  const favSection = root.querySelector('.lab-hub-favorites');

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    cards.forEach((el) => {
      const kw = (el.getAttribute('data-lab-hub-keywords') || '').toLowerCase();
      const text = el.textContent?.toLowerCase() || '';
      const show = !q || kw.includes(q) || text.includes(q);
      const wrap = el.closest('.lab-hub-card-wrap');
      if (wrap instanceof HTMLElement) {
        wrap.style.display = show ? '' : 'none';
      } else {
        el.style.display = show ? '' : 'none';
      }
    });

    sections.forEach((h) => {
      const grid = h.nextElementSibling;
      if (!(grid instanceof HTMLElement) || !grid.classList.contains('lab-index-grid')) return;
      const visible = [...grid.querySelectorAll('[data-lab-hub-keywords]')].some((c) => {
        const wrap = c.closest('.lab-hub-card-wrap');
        if (wrap instanceof HTMLElement) return wrap.style.display !== 'none';
        return c.style.display !== 'none';
      });
      h.style.display = visible ? '' : 'none';
      grid.style.display = visible ? '' : 'none';
    });

    if (favSection instanceof HTMLElement && !favSection.hidden) {
      const favGrid = favSection.querySelector('.lab-hub-favorites__grid');
      const favVisible =
        favGrid instanceof HTMLElement &&
        [...favGrid.querySelectorAll('[data-lab-hub-keywords]')].some((c) => {
          const wrap = c.closest('.lab-hub-card-wrap');
          if (wrap instanceof HTMLElement) return wrap.style.display !== 'none';
          return c.style.display !== 'none';
        });
      favSection.style.display = favVisible ? '' : 'none';
    }
  };

  input.addEventListener('input', apply);
  root.addEventListener('lab-hub-layout-changed', apply);
  apply();
}
