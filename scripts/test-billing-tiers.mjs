/**
 * Comprobaciùn local de detecciùn de planes (Starter / Ilimitado / desbloqueo 1 EUR).
 * Ejecutar: node scripts/test-billing-tiers.mjs
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const p = require('../netlify/functions/lib/proEntitlementLogic.js');
const c = require('../netlify/functions/lib/creditsLogic.js');

const cases = [
  ['Starter 9 EUR (num)', { variant_id: 1623283, product_id: 1034986, product_name: 'themechassist Pro' }, 'subscription'],
  ['Ilimitado 25 EUR (num)', { variant_id: 1623284, product_id: 1034986, product_name: 'themechassist Pro' }, 'subscription'],
  ['Ilimitado UUID', { variant_id: 'a8ac7a03-694b-43be-89cf-75804a221e30', product_name: 'themechassist Pro' }, 'subscription'],
  ['Unlock UUID order', { variant_id: '3e5a7c0f-4faf-47fd-aede-0a6488ef5f40', product_name: 'Desbloqueo calculadora', status: 'paid' }, 'order'],
  ['Unlock nombre order', { variant_id: 777777, product_name: 'Desbloqueo calc-gears', status: 'paid' }, 'order'],
  ['Unlock variant desconocida en Pro compartido', { variant_id: 777777, product_id: 1034986, product_name: 'themechassist Pro', status: 'paid' }, 'order'],
  ['Order paid no clasifica como sub activa', { source: 'order', active: true, status: 'paid', variantId: '777' }, 'record'],
];

let failed = 0;
for (const [label, attrs, kind] of cases) {
  if (kind === 'record') {
    const active = p.subscriptionRecordActive(attrs);
    const ok = active === false;
    console.log(ok ? 'OK' : 'FAIL', label, '? subscriptionRecordActive=', active);
    if (!ok) failed += 1;
    continue;
  }
  const tier =
    kind === 'order'
      ? p.tierFromVariant(attrs.variant_id) || p.tierFromOrderAttrs(attrs, attrs.variant_id)
      : p.tierFromVariant(attrs.variant_id) || p.tierFromSubscriptionAttrs(attrs);
  const expected = label.includes('Starter')
    ? 'starter'
    : label.includes('desconocida')
      ? null
      : label.includes('Ilimitado')
        ? 'unlimited'
        : 'calc_unlock';
  const ok = tier === expected;
  console.log(ok ? 'OK' : 'FAIL', label, '?', tier, `(expected ${expected})`);
  if (!ok) failed += 1;
}

const slug = c.extractCalcSlugFromOrder(
  {
    custom_data: { calc_slug: 'calc-gears.html' },
    status: 'paid',
  },
  null,
);
console.log(slug === 'calc-gears.html' ? 'OK' : 'FAIL', 'extractCalcSlug', '?', slug);

process.exit(failed + (slug === 'calc-gears.html' ? 0 : 1));
