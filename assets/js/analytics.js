(() => {
  'use strict';

  const loader = document.currentScript;
  if (!loader || !loader.src) return;
  const configUrl = new URL('../../site.config.json', loader.src).href;

  const CONSENT_KEY = 'data-c0re-analytics-consent-v1';
  const SESSION_HINT_KEY = 'data-c0re-traffic-hint-sent-v1';
  const SESSION_DISMISS_KEY = 'data-c0re-analytics-dismissed-v1';
  const PREVIEW_PARAM = 'analytics_preview';
  const AUTO_DISMISS_MS = 10_000;

  const translations = {
    en: {
      title: 'Audience analytics',
      body: 'Optional analytics helps DATA C0RE understand visits, pages viewed and where visitors arrive from. Google Analytics loads only after you accept. No advertising or remarketing is used.',
      accept: 'Accept analytics',
      refuse: 'Refuse',
      settings: 'Analytics settings',
      detailsLabel: 'Details',
      preview: 'Preview only — no analytics data is sent.',
      details: 'Source attribution is automatic when the browser provides a referrer. Email clients, Discord and some apps may hide it and appear as direct traffic. If you do nothing, the notice closes after 10 seconds and analytics stays off. Your explicit choice is kept for 6 months and can be changed at any time.'
    },
    fr: {
      title: 'Mesure d’audience',
      body: 'La mesure d’audience facultative aide DATA C0RE à comprendre les visites, les pages consultées et la provenance des visiteurs. Google Analytics ne se charge qu’après votre accord. Aucune publicité ni remarketing.',
      accept: 'Accepter',
      refuse: 'Refuser',
      settings: 'Réglages analytics',
      detailsLabel: 'Détails',
      preview: 'Aperçu uniquement — aucune donnée analytics n’est envoyée.',
      details: 'La provenance est détectée automatiquement lorsque le navigateur transmet un référent. Les e-mails, Discord et certaines applications peuvent le masquer et apparaître en trafic direct. Sans action, le bandeau se referme après 10 secondes et la mesure reste désactivée. Votre choix explicite est conservé 6 mois et peut être modifié à tout moment.'
    },
    es: {
      title: 'Analítica de audiencia',
      body: 'La analítica opcional ayuda a DATA C0RE a entender las visitas, las páginas consultadas y de dónde llegan los visitantes. Google Analytics solo se carga después de aceptar. No se usa publicidad ni remarketing.',
      accept: 'Aceptar',
      refuse: 'Rechazar',
      settings: 'Ajustes de analítica',
      detailsLabel: 'Detalles',
      preview: 'Solo vista previa — no se envían datos de analítica.',
      details: 'La procedencia se detecta automáticamente cuando el navegador transmite un referente. El correo, Discord y algunas aplicaciones pueden ocultarlo y aparecer como tráfico directo. Si no haces nada, el aviso se cierra después de 10 segundos y la analítica permanece desactivada. La elección explícita se conserva 6 meses y puede cambiarse en cualquier momento.'
    }
  };

  function languageCopy() {
    const lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    return translations[lang] || translations.en;
  }

  function sourceHint() {
    const params = new URLSearchParams(location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    if (utmSource) {
      return {
        type: 'campaign',
        source: utmSource.slice(0, 100),
        medium: (utmMedium || '').slice(0, 100),
        campaign: (utmCampaign || '').slice(0, 100),
        referrerHost: ''
      };
    }

    let referrerHost = '';
    try { referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch {}
    if (referrerHost && referrerHost !== location.hostname.toLowerCase()) {
      return { type: 'referrer', source: referrerHost, medium: 'referral', campaign: '', referrerHost };
    }

    const ua = navigator.userAgent || '';
    const appHints = [
      [/Instagram/i, 'instagram_app'],
      [/FBAN|FBAV|\bFacebook\b/i, 'facebook_app'],
      [/Discord/i, 'discord_app'],
      [/LinkedInApp/i, 'linkedin_app'],
      [/Twitter|X\//i, 'x_app']
    ];
    for (const [pattern, value] of appHints) {
      if (pattern.test(ua)) return { type: 'app_hint', source: value, medium: 'in_app', campaign: '', referrerHost: '' };
    }

    return { type: 'unknown', source: 'direct_or_dark', medium: 'none', campaign: '', referrerHost: '' };
  }

  async function bootstrap() {
    const previewMode = new URLSearchParams(location.search).get(PREVIEW_PARAM) === '1';

    let siteConfig;
    try {
      const response = await fetch(configUrl, { credentials: 'same-origin', cache: 'no-cache' });
      if (!response.ok) return;
      siteConfig = await response.json();
    } catch {
      // Analytics is optional. A blocked/missing config must never affect the site.
      return;
    }

    const analytics = siteConfig && siteConfig.analytics ? siteConfig.analytics : {};
    const enabled = analytics.enabled === true;
    const measurementId = String(analytics.measurementId || '').trim();
    const consentMode = String(analytics.consentMode || '').toLowerCase();
    const consentDays = Math.max(1, Number(analytics.consentStorageDays || 180));
    const maxAgeMs = consentDays * 24 * 60 * 60 * 1000;
    const configured = enabled && consentMode === 'basic' && /^G-[A-Z0-9]+$/i.test(measurementId);

    // Normal visitors see nothing until GA4 is configured. The preview query is
    // intentionally UI-only and can never send analytics data.
    if (!configured && !previewMode) return;

    const text = languageCopy();
    let googleLoaded = false;
    let panel = null;
    let dismissTimer = null;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    function readConsent() {
      if (previewMode) return null;
      try {
        const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
        if (!parsed || !['granted', 'denied'].includes(parsed.value) || !Number.isFinite(parsed.ts)) return null;
        if (Date.now() - parsed.ts > maxAgeMs) {
          localStorage.removeItem(CONSENT_KEY);
          return null;
        }
        return parsed.value;
      } catch {
        return null;
      }
    }

    function storeConsent(value) {
      if (previewMode) return;
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, ts: Date.now() })); } catch {}
      try { sessionStorage.removeItem(SESSION_DISMISS_KEY); } catch {}
    }

    function wasDismissedThisSession() {
      if (previewMode) return false;
      try { return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'; } catch { return false; }
    }

    function markDismissedThisSession() {
      if (previewMode) return;
      try { sessionStorage.setItem(SESSION_DISMISS_KEY, '1'); } catch {}
    }

    function sendOriginHintOnce() {
      try {
        if (sessionStorage.getItem(SESSION_HINT_KEY)) return;
        sessionStorage.setItem(SESSION_HINT_KEY, '1');
      } catch {}

      const hint = sourceHint();
      window.gtag('event', 'traffic_origin_hint', {
        origin_type: hint.type,
        origin_source_hint: hint.source,
        origin_medium_hint: hint.medium,
        origin_campaign_hint: hint.campaign,
        referrer_host: hint.referrerHost,
        page_path: location.pathname
      });
    }

    function loadGoogleAnalytics() {
      if (previewMode || !configured || googleLoaded) return;
      googleLoaded = true;

      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });

      const tag = document.createElement('script');
      tag.async = true;
      tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      tag.referrerPolicy = 'strict-origin-when-cross-origin';
      tag.onerror = () => {
        // Brave, uBlock, DNS filters, etc. may block Google. This is expected and
        // intentionally silent: the portfolio never depends on analytics.
        googleLoaded = false;
      };
      document.head.appendChild(tag);

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        send_page_view: true
      });
      sendOriginHintOnce();
    }

    function removeGoogleCookies() {
      const names = document.cookie.split(';').map(v => v.trim().split('=')[0]).filter(Boolean);
      for (const name of names) {
        if (!/^_ga(?:_|$)/.test(name)) continue;
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
      }
    }

    function clearDismissTimer() {
      if (dismissTimer !== null) {
        clearTimeout(dismissTimer);
        dismissTimer = null;
      }
    }

    function hidePanel() {
      clearDismissTimer();
      if (panel) panel.hidden = true;
    }

    function dismissWithoutConsent() {
      // Inactivity is never treated as consent. We only collapse the notice for
      // the current browser session; analytics remains denied until a real click.
      markDismissedThisSession();
      hidePanel();
    }

    function applyConsent(value) {
      if (previewMode) {
        hidePanel();
        return;
      }

      storeConsent(value);
      if (value === 'granted') {
        loadGoogleAnalytics();
        hidePanel();
        return;
      }

      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      removeGoogleCookies();
      hidePanel();

      // If Google code had already been loaded after a previous opt-in, reload so
      // the current document contains no active Google Analytics runtime at all.
      if (googleLoaded) location.reload();
    }

    function showPanel({ autoDismiss = true } = {}) {
      if (!panel) buildUi();
      clearDismissTimer();
      panel.hidden = false;
      const current = readConsent();
      panel.dataset.currentConsent = current || 'unset';
      const focusTarget = panel.querySelector(current === 'granted' ? '[data-consent-refuse]' : '[data-consent-accept]');
      if (focusTarget) requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
      if (autoDismiss && !current) dismissTimer = setTimeout(dismissWithoutConsent, AUTO_DISMISS_MS);
    }

    function buildUi() {
      const settings = document.createElement('button');
      settings.type = 'button';
      settings.className = 'analytics-settings-trigger';
      settings.textContent = text.settings;
      settings.setAttribute('aria-haspopup', 'dialog');
      settings.addEventListener('click', () => showPanel({ autoDismiss: false }));

      panel = document.createElement('section');
      panel.className = 'analytics-consent';
      panel.hidden = true;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', text.title);
      panel.innerHTML = `
        <div class="analytics-consent__copy">
          <strong>${text.title}</strong>
          ${previewMode ? `<span class="analytics-consent__preview">${text.preview}</span>` : ''}
          <p>${text.body}</p>
          <details><summary>${text.detailsLabel}</summary><p>${text.details}</p></details>
        </div>
        <div class="analytics-consent__actions">
          <button type="button" data-consent-accept>${text.accept}</button>
          <button type="button" data-consent-refuse>${text.refuse}</button>
        </div>`;

      panel.querySelector('[data-consent-accept]').addEventListener('click', () => applyConsent('granted'));
      panel.querySelector('[data-consent-refuse]').addEventListener('click', () => applyConsent('denied'));
      document.body.append(panel, settings);
    }

    function init() {
      buildUi();
      if (previewMode) {
        showPanel();
        return;
      }
      const consent = readConsent();
      if (consent === 'granted') loadGoogleAnalytics();
      else if (consent !== 'denied' && !wasDismissedThisSession()) showPanel();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
  }

  bootstrap();
})();
