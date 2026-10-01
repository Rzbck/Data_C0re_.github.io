import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const analytics = config.analytics || {};
const enabled = analytics.enabled === true;
const baseUrl = String(analytics.baseUrl || '').trim();
const siteId = String(analytics.siteId || '').trim();

if (String(analytics.provider || '').toLowerCase() !== 'matomo') throw new Error('analytics.provider must be matomo.');
if (analytics.cnilExemptionMode !== true) throw new Error('Matomo CNIL exemption mode must remain explicitly required.');
if (analytics.disableCookies !== true) throw new Error('Matomo must remain cookieless in the site runtime.');
if (analytics.respectDoNotTrack !== true) throw new Error('Matomo must respect browser Do Not Track.');
if (String(analytics.referrerMode || '').toLowerCase() !== 'host-only') throw new Error('Referrers must remain host-only.');
if (analytics.stripQueryString !== true) throw new Error('Tracked page URLs must strip query strings.');

if (enabled) {
  let parsed;
  try { parsed = new URL(baseUrl); } catch { throw new Error('Enabled Matomo requires a valid baseUrl.'); }
  if (parsed.protocol !== 'https:') throw new Error('Enabled Matomo baseUrl must use HTTPS.');
  if (!/^\d+$/.test(siteId) || Number(siteId) < 1) throw new Error('Enabled Matomo requires a positive numeric siteId.');
}

for (const rel of ['assets/js/analytics.js', 'assets/js/language-routes.js']) {
  if (!fs.existsSync(path.join(ROOT, rel))) throw new Error(`Missing analytics asset: ${rel}`);
}

const analyticsJs = fs.readFileSync(path.join(ROOT, 'assets/js/analytics.js'), 'utf8');
const routesJs = fs.readFileSync(path.join(ROOT, 'assets/js/language-routes.js'), 'utf8');

for (const forbidden of [
  'googletagmanager.com',
  'google-analytics.com',
  'Google Analytics',
  'gtag(',
  'window.gtag',
  'dataLayer',
  'traffic_origin_hint'
]) {
  if (analyticsJs.includes(forbidden) || routesJs.includes(forbidden)) {
    throw new Error(`GA4 residue detected: ${forbidden}`);
  }
}

for (const required of [
  "queue.push(['disableCookies'])",
  "queue.push(['setDoNotTrack', true])",
  "queue.push(['setCustomUrl'",
  "queue.push(['setReferrerUrl'",
  "queue.push(['setTrackerUrl'",
  "queue.push(['setSiteId'",
  "queue.push(['trackPageView'])",
  'matomo.php',
  'matomo.js',
  'clearLegacyGaState()',
  "referrerMode || 'host-only'"
]) {
  if (!analyticsJs.includes(required)) throw new Error(`Matomo runtime missing privacy safeguard: ${required}`);
}

if (analyticsJs.includes('enableLinkTracking')) {
  throw new Error('Automatic link/outlink tracking is intentionally disabled in the consent-exempt profile.');
}

if (routesJs.includes('analytics-consent.css') || routesJs.includes('data-site-analytics-style')) {
  throw new Error('Consent banner CSS must not be loaded after GA4 removal.');
}
if (!routesJs.includes("ensureScript('assets/js/analytics.js?v=20261001-3','data-site-analytics')")) {
  throw new Error('Global route loader is missing the Matomo runtime.');
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

console.log(`Analytics safety OK: GA4 removed, no consent banner, Matomo CNIL-ready runtime reaches ${locs.length} canonical URLs, /en redirects are excluded, Matomo ${enabled ? 'enabled' : 'disabled pending CNIL-configured endpoint + site ID'}.`);
