/**
 * Pagina: instantaneas guardadas en calculos_mecanicos (Supabase RLS).
 */

import { getCurrentUser } from '../services/localAuth.js';
import { FEATURES } from '../config/features.js';
import {
  listMyCalculosMecanicos,
  deleteCalculoMecanicoById,
} from '../services/calculosMecanicosSave.js';

function getLang() {
  try {
    return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
  } catch (_) {
    return 'es';
  }
}

/** @type {Record<'es'|'en', Record<string, string>>} */
const TX = {
  es: {
    docTitle: 'Mis c\u00e1lculos guardados \u2014 TheMechAssist',
    title: 'Mis c\u00e1lculos guardados',
    lead:
      'Instant\u00e1neas que ha enviado a TheMechAssist Cloud desde calculadoras (bot\u00f3n \u00abGuardar en la nube\u00bb o panel de configuraci\u00f3n Pro). Puede ver el JSON o eliminar una fila.',
    needLogin: 'Inicie sesi\u00f3n para ver sus datos en la nube.',
    needSession:
      'No hay sesi\u00f3n Supabase activa. Vuelva a iniciar sesi\u00f3n en la web (o abra una calculadora y guarde de nuevo) para sincronizar.',
    empty: 'A\u00fan no hay filas guardadas en su cuenta.',
    refresh: 'Actualizar',
    thWhen: 'Fecha',
    thType: 'Tipo',
    thActions: 'Acciones',
    viewJson: 'Ver JSON',
    delete: 'Eliminar',
    deleteConfirm: '\u00bfEliminar esta fila de la nube? No se puede deshacer.',
    dialogClose: 'Cerrar',
    jsonTitle: 'Detalle (solo lectura)',
    navSaved: 'Mis c\u00e1lculos guardados',
    noRls:
      'El listado en la nube requiere el modo seguro (RLS) activado en la aplicaci\u00f3n.',
  },
  en: {
    docTitle: 'My saved calculations \u2014 TheMechAssist',
    title: 'My saved calculations',
    lead:
      'Snapshots you sent to TheMechAssist Cloud from calculators (\u201cSave to cloud\u201d or the Pro machine configuration panel). You can inspect JSON or delete a row.',
    needLogin: 'Sign in to see your cloud data.',
    needSession:
      'No active Supabase session. Sign in again on the site (or save once from a calculator) to sync.',
    empty: 'No saved rows yet for this account.',
    refresh: 'Refresh',
    thWhen: 'Date',
    thType: 'Type',
    thActions: 'Actions',
    viewJson: 'View JSON',
    delete: 'Delete',
    deleteConfirm: 'Delete this row from the cloud? This cannot be undone.',
    dialogClose: 'Close',
    jsonTitle: 'Detail (read-only)',
    navSaved: 'My saved calculations',
    noRls: 'Cloud listing needs secure (RLS) mode enabled in the app.',
  },
};

function formatWhen(iso, lang) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso || '');
    return d.toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch (_) {
    return String(iso || '');
  }
}

function safeJsonPreview(obj) {
  try {
    const s = JSON.stringify(obj, null, 2);
    if (s.length > 48000) return `${s.slice(0, 48000)}\n\u2026`;
    return s;
  } catch (_) {
    return String(obj);
  }
}

export function mountMySavedCalcsPage() {
  const lang = getLang();
  const t = TX[lang];
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';
  document.title = t.docTitle;

  const titleEl = document.getElementById('mscTitle');
  const leadEl = document.getElementById('mscLead');
  const statusEl = document.getElementById('mscStatus');
  const tbody = document.getElementById('mscTbody');
  const refreshBtn = document.getElementById('mscRefresh');
  const dlg = document.getElementById('mscDialog');
  const dlgPre = document.getElementById('mscDialogPre');
  const dlgTitle = document.getElementById('mscDialogTitle');
  const dlgClose = document.getElementById('mscDialogClose');

  if (titleEl) titleEl.textContent = t.title;
  if (leadEl) leadEl.textContent = t.lead;
  if (refreshBtn) refreshBtn.textContent = t.refresh;
  document.querySelectorAll('[data-msc-tx]').forEach((el) => {
    const k = el.getAttribute('data-msc-tx');
    if (k && t[k]) el.textContent = t[k];
  });

  const navSaved = document.getElementById('nav-saved');
  if (navSaved) navSaved.textContent = t.navSaved;

  async function render() {
    if (!(tbody instanceof HTMLElement) || !(statusEl instanceof HTMLElement)) return;
    tbody.replaceChildren();
    statusEl.textContent = '';
    statusEl.hidden = true;

    if (!getCurrentUser()) {
      statusEl.hidden = false;
      statusEl.textContent = t.needLogin;
      return;
    }

    if (!FEATURES.useSupabaseRLS) {
      statusEl.hidden = false;
      statusEl.textContent = t.noRls;
      return;
    }

    const res = await listMyCalculosMecanicos({ limit: 200, silent: true });
    if (!res.ok) {
      statusEl.hidden = false;
      if (res.reason === 'no_session') statusEl.textContent = t.needSession;
      else statusEl.textContent = lang === 'en' ? 'Could not load list.' : 'No se pudo cargar la lista.';
      return;
    }

    const rows = res.rows || [];
    if (!rows.length) {
      statusEl.hidden = false;
      statusEl.textContent = t.empty;
      return;
    }

    for (const row of rows) {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      td1.textContent = formatWhen(row.created_at, lang);
      const td2 = document.createElement('td');
      td2.textContent = String(row.tipo_maquina || '').slice(0, 200);
      const td3 = document.createElement('td');
      td3.className = 'msc-actions';

      const btnView = document.createElement('button');
      btnView.type = 'button';
      btnView.className = 'button button--ghost';
      btnView.textContent = t.viewJson;
      btnView.addEventListener('click', () => {
        if (!(dlg instanceof HTMLDialogElement) || !dlgPre || !dlgTitle) return;
        dlgTitle.textContent = t.jsonTitle;
        const payload = {
          id: row.id,
          created_at: row.created_at,
          tipo_maquina: row.tipo_maquina,
          datos_entrada: row.datos_entrada,
          resultados: row.resultados,
        };
        dlgPre.textContent = safeJsonPreview(payload);
        dlg.showModal();
      });

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'button button--ghost';
      btnDel.style.color = 'var(--color-danger, #b91c1c)';
      btnDel.textContent = t.delete;
      btnDel.addEventListener('click', async () => {
        if (!window.confirm(t.deleteConfirm)) return;
        const delRes = await deleteCalculoMecanicoById(String(row.id));
        if (delRes.ok) await render();
      });

      td3.appendChild(btnView);
      td3.appendChild(btnDel);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tbody.appendChild(tr);
    }
  }

  refreshBtn?.addEventListener('click', () => {
    void render();
  });

  dlgClose?.addEventListener('click', () => {
    if (dlg instanceof HTMLDialogElement) dlg.close();
  });

  void render();
}
