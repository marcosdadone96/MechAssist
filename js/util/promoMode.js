/** Embed en promo-30s.html (?promo=1): sin modo visitante ni bloqueos de creditos. */
export function isPromoEmbed() {
  try {
    return new URLSearchParams(location.search).has('promo');
  } catch (_) {
    return false;
  }
}
