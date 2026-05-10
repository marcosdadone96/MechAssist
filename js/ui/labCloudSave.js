/**
 * Bot�n "Guardar en la nube" para calculadoras del laboratorio (sin barra CFG de m�quinas).
 */

import { FEATURES } from '../config/features.js';
import {
  collectInputsFromScope,
  collectResultsFromScope,
  insertCalculoMecanico,
} from '../services/calculosMecanicosSave.js';

/**
 * Inserta el bloque del botón sin romper grids (`app-main--flat-wb`, `app-main--be`).
 * @param {HTMLElement} panel  — típ. `main.app-main` o `main.lab-main`
 * @param {HTMLElement} wrap
 */
function attachLabCloudSaveWrap(panel, wrap) {
  const head =
    panel.querySelector('.lab-calc-page-head') ||
    panel.querySelector('.flat-sidebar__head');
  if (head) {
    head.appendChild(wrap);
    return;
  }

  /** Elevador de cangilones: `.be-main-col > section.panel` (sin flat-sidebar). */
  const bucketPanel = panel.querySelector('.be-main-col > section.panel');
  /** Ascensor de tracción: `main > section.panel` directo. */
  const tractionPanel =
    bucketPanel ||
    (panel.matches('main.app-main') ? panel.querySelector(':scope > section.panel') : null);
  const topPanel = tractionPanel;
  if (topPanel) {
    const lead = topPanel.querySelector('p.form-lead');
    if (lead) {
      lead.insertAdjacentElement('afterend', wrap);
      return;
    }
    const h2 = topPanel.querySelector('h2');
    if (h2) {
      h2.insertAdjacentElement('afterend', wrap);
      return;
    }
  }

  const sidebar = panel.querySelector('.flat-sidebar');
  if (sidebar) {
    sidebar.prepend(wrap);
    return;
  }

  panel.prepend(wrap);
}

/**
 * @param {string} tipo_maquina � etiqueta legible (ej. "Engranajes cil�ndricos").
 * @param {{ scopeSelector?: string }} [opts]
 */
export function mountLabCloudSaveBar(tipo_maquina, opts = {}) {
  if (!FEATURES.showLabCloudSnapshotButton) return;

  /** Laboratorio: `main.lab-main`. Máquinas: `main.app-main` (no usan `.lab-main`). */
  const sel = opts.scopeSelector || 'main.app-main, main.lab-main';
  const panel = document.querySelector(sel);
  if (!panel) return;

  const wrap = document.createElement('p');
  wrap.className = 'lab-cloud-save-actions';
  wrap.style.marginTop = '0.75rem';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'button button--ghost';
  const en =
    typeof document !== 'undefined' &&
    String(document.documentElement.lang || '')
      .toLowerCase()
      .startsWith('en');
  btn.textContent = en ? 'Save to cloud' : 'Guardar en la nube';
  wrap.appendChild(btn);

  attachLabCloudSaveWrap(panel, wrap);

  btn.addEventListener('click', async () => {
    const scope = document.querySelector(sel) || document.body;
    const datos_entrada = collectInputsFromScope(scope);
    const resultados = collectResultsFromScope(scope);
    await insertCalculoMecanico({
      tipo_maquina,
      datos_entrada,
      resultados,
    });
  });
}
