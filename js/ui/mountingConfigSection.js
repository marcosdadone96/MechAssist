/**
 * Bloque UI reutilizable: configuración de montaje motorreductor (mismas ids en todas las páginas).
 */

export const MOUNTING_SECTION_HOST_ID = 'mountingConfigHost';

const SECTION_HTML = `
<details class="input-details mounting-config" open>
  <summary class="mounting-config__summary">Configuración de montaje del motorreductor</summary>
  <p class="muted mounting-config__lead">
    Define cómo se integrará en su máquina. Las recomendaciones <strong>filtran</strong> el catálogo por tipo IEC (B3/B5/B14) o <strong>eje hueco</strong>.
    Los dibujos son esquemáticos.
  </p>

  <div class="mounting-legend" aria-hidden="true">
    <div class="mounting-legend__item">
      <svg class="mounting-ico" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="8" y="14" width="48" height="22" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
        <path d="M14 36 L14 42 M32 36 L32 42 M50 36 L50 42" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        <text x="32" y="28" text-anchor="middle" font-size="9" fill="#334155" font-family="system-ui,sans-serif">B3</text>
      </svg>
      <span>Patas</span>
    </div>
    <div class="mounting-legend__item">
      <svg class="mounting-ico" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="10" width="24" height="28" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
        <circle cx="32" cy="24" r="14" fill="none" stroke="#0d9488" stroke-width="2" stroke-dasharray="4 3"/>
        <text x="32" y="27" text-anchor="middle" font-size="9" fill="#334155" font-family="system-ui,sans-serif">B5</text>
      </svg>
      <span>Brida grande</span>
    </div>
    <div class="mounting-legend__item">
      <svg class="mounting-ico" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="22" y="12" width="20" height="24" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
        <circle cx="32" cy="24" r="9" fill="none" stroke="#0d9488" stroke-width="2"/>
        <text x="32" y="27" text-anchor="middle" font-size="8" fill="#334155" font-family="system-ui,sans-serif">B14</text>
      </svg>
      <span>Brida compacta</span>
    </div>
    <div class="mounting-legend__item">
      <svg class="mounting-ico" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="18" y="12" width="28" height="24" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
        <circle cx="32" cy="24" r="7" fill="#fff" stroke="#0f172a" stroke-width="2"/>
        <text x="32" y="8" text-anchor="middle" font-size="7" fill="#64748b" font-family="system-ui,sans-serif">hueco</text>
      </svg>
      <span>Eje hueco</span>
    </div>
  </div>

  <div class="field-grid mounting-config__fields">
    <div class="field mounting-config__field--wide">
      <label for="mountingType">Tipo de montaje</label>
      <select id="mountingType" name="mountingType">
        <option value="B3" selected>Patas en suelo / bastidor (IEC B3)</option>
        <option value="B5">Brida grande frontal (IEC B5)</option>
        <option value="B14">Brida compacta (IEC B14)</option>
        <option value="hollowShaft">Montaje sobre eje de máquina (reductor eje hueco)</option>
      </select>
      <span class="field-hint">B3/B5/B14 son formas habituales de fijar el motor-reductor; el eje hueco envuelve el árbol del tambor o rodillo.</span>
    </div>
    <div class="field">
      <label for="mountMachineShaftDiam">Ø eje máquina (opcional, mm)</label>
      <input id="mountMachineShaftDiam" type="number" step="0.1" min="0" placeholder="ej. 50" />
      <span class="field-hint">Para comprobar hueco o acoplamiento (orientativo).</span>
    </div>
    <div class="field">
      <label for="mountOrientation">Orientación</label>
      <select id="mountOrientation" name="mountOrientation">
        <option value="horizontal" selected>Horizontal (eje salida ~ horizontal)</option>
        <option value="vertical">Vertical u oblicua fuerte</option>
      </select>
      <span class="field-hint">En vertical, los sinfín-cubo suelen requerir revisiones de lubricación.</span>
    </div>
    <div class="field mounting-config__field--wide">
      <label for="mountSpaceNote">Espacio / interferencias (opcional)</label>
      <input id="mountSpaceNote" type="text" maxlength="500" placeholder="ej. máx. 400 mm de largo total; pasillo estrecho…" />
    </div>
  </div>
</details>
`;

/**
 * Inserta el bloque en el host vacío del HTML (una vez por página).
 * @param {string} [hostId]
 */
export function injectMountingConfigSection(hostId = MOUNTING_SECTION_HOST_ID) {
  const el = document.getElementById(hostId);
  if (el && !el.dataset.mountingInjected) {
    el.innerHTML = SECTION_HTML;
    el.dataset.mountingInjected = '1';
  }
}

/** Ids de controles que deben disparar recálculo de recomendaciones */
export const MOUNTING_INPUT_IDS = [
  'mountingType',
  'mountMachineShaftDiam',
  'mountOrientation',
  'mountSpaceNote',
];
