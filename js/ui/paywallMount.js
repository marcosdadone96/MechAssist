/**
 * Pantalla de módulo Pro cuando el usuario está en plan gratuito.
 */

import { FEATURES } from '../config/features.js';
import {
  getFreemiumStrategy,
  setPremiumPersistent,
  clearPremiumPersistent,
  isPremiumEffective,
} from '../services/accessTier.js';

/**
 * @param {'flat'|'inclined'} lockedTool — módulo de esta página (bloqueado para el visitante actual).
 */
export function mountPaywall(lockedTool) {
  const free = getFreemiumStrategy();
  const freeLabel = free === 'flat' ? 'cinta plana' : 'cinta inclinada';
  const lockedLabel = lockedTool === 'flat' ? 'cinta plana' : 'cinta inclinada';
  const freeHref = free === 'flat' ? 'flat-conveyor.html' : 'inclined-conveyor.html';

  const wrap = document.createElement('div');
  wrap.className = 'paywall-screen';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'paywall-title');
  wrap.innerHTML = `
    <div class="paywall-screen__card">
      <p class="paywall-screen__eyebrow">DriveLab</p>
      <h1 id="paywall-title" class="paywall-screen__title">Módulo Pro</h1>
      <p class="paywall-screen__lead">
        El simulador de <strong>${lockedLabel}</strong> forma parte del <strong>plan de pago</strong>.
        En la versión gratuita puede usar el modelo de <strong>${freeLabel}</strong> con el mismo nivel de detalle (resultados, informe y motorreductores).
      </p>
      <ul class="paywall-screen__list">
        <li>Acceda al calculador gratuito: <a href="${freeHref}">${freeHref}</a></li>
        <li>Vuelva al <a href="index.html">inicio</a> para ver todos los sistemas</li>
        <li>Pruebe con <span class="paywall-screen__code">?pro=1</span> en la URL para simular un usuario Pro solo en esta sesión del navegador</li>
      </ul>
      <div class="paywall-screen__actions">
        <a class="button button--primary" href="${freeHref}">Ir al calculador gratuito (${freeLabel})</a>
        <a class="button button--ghost" href="index.html">Inicio</a>
      </div>
      <div class="paywall-screen__demo">
        <p class="paywall-screen__demo-title">Demostración local (sin pago real)</p>
        <p class="paywall-screen__demo-text">
          Use esto para probar la experiencia Pro antes de integrar Stripe u otro cobro.
        </p>
        <div class="paywall-screen__demo-row">
          <button type="button" class="button button--accent" data-paywall-activate>Activar Pro (demo persistente)</button>
          <button type="button" class="button button--ghost" data-paywall-clear>Volver a plan gratuito</button>
        </div>
      </div>
    </div>
  `;

  const header = document.querySelector('.app-header');
  if (header) {
    header.insertAdjacentElement('afterend', wrap);
  } else {
    document.body.prepend(wrap);
  }

  const main = document.querySelector('.app-main');
  if (main) {
    main.hidden = true;
    main.setAttribute('aria-hidden', 'true');
  }

  wrap.querySelector('[data-paywall-activate]')?.addEventListener('click', () => {
    setPremiumPersistent();
    window.location.reload();
  });
  wrap.querySelector('[data-paywall-clear]')?.addEventListener('click', () => {
    clearPremiumPersistent();
    window.location.reload();
  });
}

/**
 * Barra discreta: plan actual y atajos de prueba (solo si está habilitado en config).
 */
export function mountTierStatusBar() {
  if (!FEATURES.showTierSwitcherInDev) return;

  const header = document.querySelector('.app-header, .lab-header');
  if (!header) return;
  if (header.querySelector(':scope > .tier-status-bar')) return;

  const tier = isPremiumEffective() ? 'Pro activo' : 'Plan gratuito';
  const strat = getFreemiumStrategy();
  const stratLabel = strat === 'flat' ? 'Gratis: plana · Pro: inclinada' : 'Gratis: inclinada · Pro: plana';

  const bar = document.createElement('div');
  bar.className = 'tier-status-bar';
  bar.innerHTML = `
    <span class="tier-status-bar__pill">${tier}</span>
    <span class="tier-status-bar__hint" title="Cambie whichCalculatorIsFree en features.js o use ?freeTool=flat|inclined">${stratLabel}</span>
    <span class="tier-status-bar__links">
      <a href="?pro=1">Sesión Pro</a>
      <span aria-hidden="true">·</span>
      <a href="?freeTool=flat">Probar: gratis plana</a>
      <span aria-hidden="true">·</span>
      <a href="?freeTool=inclined">Probar: gratis inclinada</a>
    </span>
  `;
  header.appendChild(bar);
}
