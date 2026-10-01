import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const analytics = config.analytics || {};
const enabled = analytics.enabled === true;
const measurementId = String(analytics.measurementId || '').trim();

if (String(analytics.provider || '').toLowerCase() !== 'ga4') throw new Error('analytics.provider must be ga4.');
if (String(analytics.consentMode || '').toLowerCase() !== 'basic') throw new Error('analytics.consentMode must be basic.');
if (Number(analytics.consentStorageDays) !== 180) throw new Error('Consent choice retention must remain 180 days (6 months).');
if (enabled && !/^G-[A-Z0-9]+$/i.test(measurementId)) throw new Error('Enabled GA4 requires a valid G- measurement ID.');

for (const rel of ['assets/js/analytics.js', 'assets/css/analytics-consent.css', 'assets/js/language-routes.js']) {
  if (!fs.existsSync(path.join(ROOT, rel))) throw new Error(`Missing analytics asset: ${rel}`);
}

const analyticsJs = fs.readFileSync(path.join(ROOT, 'assets/js/analytics.js'), 'utf8');
const routesJs = fs.readFileSync(path.join(ROOT, 'assets/js/language-routes.js'), 'utf8');

for (const required of [
  "analytics_storage: 'denied'",
  "ad_storage: 'denied'",
  "ad_user_data: 'denied'",
  "ad_personalization: 'denied'",
  'allow_google_signals: false',
  'allow_ad_personalization_signals: false',
  'googletagmanager.com/gtag/js',
  'traffic_origin_hint',
  'direct_or_dark',
  "localStorage.setItem(CONSENT_KEY",
  'location.reload()',
  'const AUTO_DISMISS_MS = 10_000',
  'setTimeout(dismissWithoutConsent, AUTO_DISMISS_MS)'
]) {
  if (!analyticsJs.includes(required)) throw new Error(`Analytics runtime missing safeguard: ${required}`);
}

for (const required of [
  "ensureCss('assets/css/analytics-consent.css?v=20261001-2','data-site-analytics-style')",
  "ensureScript('assets/js/analytics.js?v=20261001-2','data-site-analytics')"
]) {
  if (!routesJs.includes(required)) throw new Error(`Global route loader missing analytics wiring: ${required}`);
}

const googleTagIndex = analyticsJs.indexOf('googletagmanager.com/gtag/js');
const loadFunctionIndex = analyticsJs.indexOf('function loadGoogleAnalytics()');
if (googleTagIndex < 0 || loadFunctionIndex < 0 || googleTagIndex < loadFunctionIndex) {
  throw new Error('Google tag must only be created inside loadGoogleAnalytics after opt-in.');
}

const dismissStart = analyticsJs.indexOf('function dismissWithoutConsent()');
const dismissEnd = analyticsJs.indexOf('function applyConsent', dismissStart);
if (dismissStart < 0 || dismissEnd < 0) throw new Error('Missing safe auto-dismiss implementation.');
const dismissBody = analyticsJs.slice(dismissStart, dismissEnd);
if (dismissBody.includes("storeConsent('granted'") || dismissBody.includes('loadGoogleAnalytics()')) {
  throw new Error('Inactivity must never grant analytics consent or load GA4.');
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1].trim());
if (!locs.length) throw new Error('sitemap.xml contains no canonical URLs.');

const origin = String(config.origin || '').replace(/\/$/, '');
for (const loc of locs) {
  const url = new URL(loc.replaceAll('&amp;', '&'));
  if (url.origin !== origin) throw new Error(`Unexpected sitemap origin: ${loc}`);
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!rel) rel = 'index.html';
  else if (rel.endsWith('/')) rel += 'index.html';
  if (/^en\//.test(rel)) throw new Error(`Legacy /en URL present in canonical sitemap: ${loc}`);
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical file: ${rel}`);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('assets/js/language-routes.js')) throw new Error(`${rel} does not load the shared route/analytics bootstrap.`);
}

const enDir = path.join(ROOT, 'en');
if (fs.existsSync(enDir)) {
  const stack = [enDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const html = fs.readFileSync(file, 'utf8');
        if (html.includes('analytics.js') || html.includes('language-routes.js')) {
          throw new Error(`${path.relative(ROOT, file)} is a redirect compatibility page and must not run analytics.`);
        }
      }
    }
  }
}

console.log(`Analytics safety OK: shared loader reaches ${locs.length} canonical URLs, /en redirects are excluded, GA4 ${enabled ? 'enabled' : 'disabled pending measurement ID'}, basic opt-in consent enforced, inactivity remains non-consent.`);
