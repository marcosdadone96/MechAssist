/**
 * Esqueleto orientativo: endpoint serverless (Netlify / Vercel / Cloudflare Worker)
 * que recibe webhooks de Stripe y sincroniza el estado Pro en su backend o en
 * notificaciones al usuario. El sitio est\u00e1tico de MechAssist no puede verificar
 * la firma de Stripe; esto debe ejecutarse en su servidor.
 *
 * Eventos habituales:
 * - checkout.session.completed: cliente ha pagado (vincule customer/subscription)
 * - customer.subscription.updated: renovaci\u00f3n, m\u00e9todo de pago, cancel_at_period_end
 * - customer.subscription.deleted: suscripci\u00f3n terminada; revocar Pro en su sistema
 * - invoice.payment_failed: avisar al usuario, reintentos seg\u00fan Stripe
 *
 * Tras validar el pago, su backend podr\u00eda enviar un enlace al Customer Portal
 * (sesi\u00f3n creada con stripe.billingPortal.sessions.create) y guardar ese flujo
 * en FEATURES.subscriptionManageUrl s\u00f3lo si usa una URL fija (poco habitual;
 * lo normal es generar URL de portal por request).
 *
 * @example Despliegue: copie la l\u00f3gica a netlify/functions/stripe-webhook.mjs
 * y configure STRIPE_WEBHOOK_SECRET en el entorno.
 */

// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/** @param {Request} req */
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  // const sig = req.headers.get('stripe-signature');
  // const rawBody = await req.text();
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  // } catch (err) {
  //   return new Response(`Webhook error: ${String(err)}`, { status: 400 });
  // }
  // switch (event.type) {
  //   case 'customer.subscription.deleted':
  //     // TODO: marcar usuario como free en su BD y/o invalidar tokens
  //     break;
  //   default:
  //     break;
  // }
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
