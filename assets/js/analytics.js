(() => {
  'use strict';

  const loader = document.currentScript;
  if (!loader || !loader.src) return;
  const configUrl = new URL('../../site.config.json', loader.src).href;

  function clearLegacyGaState() {
    try {
      localStorage.removeItem('data-c0re-analytics-consent-v1');
      sessionStorage.removeItem('data-c0re-traffic-hint-sent-v1');
      sessionStorage.removeItem('data-c0re-analytics-dismissed-v1');
    } catch {}

    try {
      const names = document.cookie.split(';').map(v => v.trim().split('=')[0]).filter(Boolean);
      for (const name of names) {
        if (!/^_ga(?:_|$)/.test(name)) continue;
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
      }
    } catch {}
  }

  function safePageUrl(stripQueryString) {
    if (!stripQueryString) return location.href.split('#')[0];
    return `${location.origin}${location.pathname}`;
  }

  function safeReferrer(mode) {
    if (!document.referrer) return '';
    try {
      const ref = new URL(document.referrer);
      if (mode === 'host-only') return `${ref.protocol}//${ref.host}/`;
      return ref.href.split('#')[0];
    } catch {
      return '';
    }
  }

  async function bootstrap() {
    // GA4 was intentionally retired. Remove any stale local state/cookies left by
    // the previous optional implementation before doing anything else.
    clearLegacyGaState();

    let siteConfig;
    try {
      const response = await fetch(configUrl, { credentials: 'same-origin', cache: 'no-cache' });
      if (!response.ok) return;
      siteConfig = await response.json();
    } catch {
      // Analytics is optional. Blockers, offline mode or a missing config must
      // never affect navigation, media, language switching or page rendering.
      return;
    }

    const analytics = siteConfig && siteConfig.analytics ? siteConfig.analytics : {};
    if (String(analytics.provider || '').toLowerCase() !== 'matomo') return;
    if (analytics.enabled !== true) return;

    // The site only permits the consent-exempt profile when explicitly marked as
    // CNIL mode in config. The matching server-side Matomo Compliance mode must
    // also be enabled before this flag is switched on in production.
    if (analytics.cnilExemptionMode !== true) return;

    const siteId = String(analytics.siteId || '').trim();
    if (!/^\d+$/.test(siteId) || Number(siteId) < 1) return;

    let baseUrl;
    try {
      const parsed = new URL(String(analytics.baseUrl || '').trim());
      if (parsed.protocol !== 'https:') return;
      parsed.hash = '';
      parsed.search = '';
      baseUrl = parsed.href.endsWith('/') ? parsed.href : `${parsed.href}/`;
    } catch {
      return;
    }

    const queue = window._paq = window._paq || [];

    // Client-side hardening in addition to Matomo's server-side CNIL Compliance
    // mode: no tracking cookies, DNT respected, page query strings stripped, and
    // referrers reduced to scheme + host only. No UTM/campaign data is created or
    // forwarded by this runtime.
    if (analytics.disableCookies !== false) queue.push(['disableCookies']);
    if (analytics.respectDoNotTrack !== false) queue.push(['setDoNotTrack', true]);

    queue.push(['setCustomUrl', safePageUrl(analytics.stripQueryString !== false)]);
    const referrer = safeReferrer(String(analytics.referrerMode || 'host-only').toLowerCase());
    if (referrer) queue.push(['setReferrerUrl', referrer]);

    queue.push(['setTrackerUrl', `${baseUrl}matomo.php`]);
    queue.push(['setSiteId', siteId]);
    queue.push(['trackPageView']);

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `${baseUrl}matomo.js`;
    tag.referrerPolicy = 'strict-origin-when-cross-origin';
    tag.dataset.matomoRuntime = 'true';
    tag.onerror = () => {
      // Brave, uBlock, AdGuard, DNS filters, etc. may block analytics. That is an
      // expected state: the portfolio deliberately has zero dependency on Matomo.
    };
    document.head.appendChild(tag);
  }

  bootstrap();
})();
