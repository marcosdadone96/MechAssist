/**
 * Future monetization & export hooks (not implemented).
 *
 * Stripe: never put secret keys in frontend. Typical flow:
 *   1) Authenticated client calls your backend.
 *   2) Backend creates a Checkout Session or Customer Portal session.
 *   3) Backend returns session URL; browser redirects.
 *
 * PDF: generate server-side (preferred) or client-side (pdf-lib) from the
 * same result objects produced by conveyor modules.
 *
 * User auth: issue HTTP-only session cookie or JWT after OAuth/password flow.
 *
 * Enable via `FEATURES` in `js/config/features.js` before wiring calls here.
 */

export const FutureIntegrations = Object.freeze({
  stripe: {
    /** @returns {Promise<void>} */
    async createCheckoutSession() {
      throw new Error('Stripe Checkout not wired — implement on backend first.');
    },
  },
  pdf: {
    /** @returns {Promise<void>} */
    async exportProjectReport() {
      throw new Error('PDF export not implemented.');
    },
  },
  auth: {
    /** @returns {Promise<void>} */
    async signIn() {
      throw new Error('User login not implemented.');
    },
  },
});
