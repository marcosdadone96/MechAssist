/**
 * Cookie consent (EU): GA4 only after explicit analytics consent.
 * SYNC key with js/legal/cookieConsentKeys.js
 */
(function () {
  var LS_KEY = 'mdr-cookie-consent-v1';
  var GA_ID = 'G-43E5C8TB38';

  function getConsent() {
    try {
      return localStorage.getItem(LS_KEY);
    } catch (_) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(LS_KEY, value);
    } catch (_) {
      /* ignore */
    }
  }

  function loadStylesheet(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  function loadGtag() {
    if (window.__mdrGtagLoaded) return;
    window.__mdrGtagLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    s.onload = function () {
      var g = document.createElement('script');
      g.src = 'js/gtag.js';
      document.head.appendChild(g);
    };
  }

  function refreshCanonicalAndOg() {
    try {
      var url = window.location.href.split('#')[0];
      var link = document.getElementById('mdr-canonical');
      if (link) link.setAttribute('href', url);
      var og = document.getElementById('mdr-og-url') || document.querySelector('meta[property="og:url"]');
      if (og) og.setAttribute('content', url);
    } catch (_) {
      /* ignore */
    }
  }

  function removeBanner() {
    var b = document.getElementById('mdr-cookie-banner');
    if (b) b.remove();
  }

  function showBanner(lang) {
    if (document.getElementById('mdr-cookie-banner')) return;
    loadStylesheet('css/legal.css');

    var isEn = lang === 'en';
    var text = isEn
      ? 'We use optional analytics cookies (Google Analytics) to understand traffic. See our '
      : 'Usamos cookies de anal\u00edtica opcionales (Google Analytics) para entender el tr\u00e1fico. Consulte nuestra ';
    var privacyWord = isEn ? 'Privacy policy' : 'Pol\u00edtica de privacidad';
    var accept = isEn ? 'Accept analytics' : 'Aceptar anal\u00edtica';
    var reject = isEn ? 'Reject non-essential' : 'Rechazar no esenciales';
    var prefs = isEn ? 'Cookie settings' : 'Preferencias';

    var aside = document.createElement('aside');
    aside.id = 'mdr-cookie-banner';
    aside.className = 'mdr-cookie-banner';
    aside.setAttribute('role', 'dialog');
    aside.setAttribute('aria-label', isEn ? 'Cookie consent' : 'Consentimiento de cookies');
    aside.innerHTML =
      '<div class="mdr-cookie-banner__inner">' +
      '<p class="mdr-cookie-banner__text">' +
      text +
      '<a href="cookies.html">Cookies</a> / <a href="privacy.html">' +
      privacyWord +
      '</a>. <a class="mdr-cookie-banner__prefs" href="cookie-preferences.html">' +
      prefs +
      '</a>.</p>' +
      '<div class="mdr-cookie-banner__actions">' +
      '<button type="button" class="mdr-cookie-banner__btn mdr-cookie-banner__btn--primary" data-mdr-cookie="analytics">' +
      accept +
      '</button>' +
      '<button type="button" class="mdr-cookie-banner__btn mdr-cookie-banner__btn--ghost" data-mdr-cookie="reject">' +
      reject +
      '</button>' +
      '</div></div>';

    aside.querySelector('[data-mdr-cookie="analytics"]').addEventListener('click', function () {
      setConsent('analytics');
      removeBanner();
      loadGtag();
    });
    aside.querySelector('[data-mdr-cookie="reject"]').addEventListener('click', function () {
      setConsent('essential');
      removeBanner();
    });

    document.body.appendChild(aside);
  }

  function detectLang() {
    try {
      return localStorage.getItem('mdr-home-lang') === 'en' ? 'en' : 'es';
    } catch (_) {
      return 'es';
    }
  }

  refreshCanonicalAndOg();

  var consent = getConsent();
  if (consent === 'analytics') {
    loadGtag();
  } else if (consent === null) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        showBanner(detectLang());
      });
    } else {
      showBanner(detectLang());
    }
  }
})();
