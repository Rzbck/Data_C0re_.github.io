import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const analytics = config.analytics || {};
const enabled = analytics.enabled === true;
const measurementId = String(analytics.measurementId || '').trim();
const consentDays = String(Math.max(1, Number(analytics.consentStorageDays || 180)));

if (String(analytics.consentMode || '').toLowerCase() !== 'basic') {
  throw new Error('Analytics safety check requires consentMode=basic.');
}
if (enabled && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
  throw new Error('Enabled analytics requires a valid GA4 measurement ID.');
}

for (const rel of ['assets/js/analytics.js', 'assets/css/analytics-consent.css']) {
  if (!fs.existsSync(path.join(ROOT, rel))) throw new Error(`Missing analytics asset: ${rel}`);
}

const analyticsJs = fs.readFileSync(path.join(ROOT, 'assets/js/analytics.js'), 'utf8');
for (const required of [
  "analytics_storage: 'denied'",
  "ad_storage: 'denied'",
  "ad_user_data: 'denied'",
  "ad_personalization: 'denied'",
  'googletagmanager.com/gtag/js',
  'traffic_origin_hint'
]) {
  if (!analyticsJs.includes(required)) throw new Error(`Analytics runtime is missing required privacy/attribution behavior: ${required}`);
}

const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1].trim().replaceAll('&amp;', '&'));
if (!locs.length) throw new Error('No canonical sitemap URLs found.');

const originUrl = new URL(origin + '/');
function repoPathFromUrl(value) {
  const url = new URL(value);
  if (url.origin !== originUrl.origin) throw new Error(`Unexpected sitemap origin: ${value}`);
  let pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!pathname) pathname = 'index.html';
  else if (pathname.endsWith('/')) pathname += 'index.html';
  return pathname;
}

let canonicalCount = 0;
for (const loc of locs) {
  const rel = repoPathFromUrl(loc);
  if (/^en\//.test(rel)) throw new Error(`Legacy /en URL found in canonical sitemap: ${loc}`);
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical file: ${rel}`);
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  const style = $('link[data-site-analytics-style]');
  const script = $('script[data-site-analytics]');
  if (style.length !== 1 || script.length !== 1) throw new Error(`${rel}: expected exactly one analytics style and script.`);
  if (script.attr('src') !== 'assets/js/analytics.js') throw new Error(`${rel}: unexpected analytics script src.`);
  if (style.attr('href') !== 'assets/css/analytics-consent.css') throw new Error(`${rel}: unexpected analytics stylesheet href.`);
  if (script.attr('data-analytics-enabled') !== (enabled ? 'true' : 'false')) throw new Error(`${rel}: analytics enabled flag mismatch.`);
  if ((script.attr('data-measurement-id') || '') !== measurementId) throw new Error(`${rel}: analytics measurement ID mismatch.`);
  if ((script.attr('data-consent-days') || '') !== consentDays) throw new Error(`${rel}: consent duration mismatch.`);
  canonicalCount += 1;
}

const enDir = path.join(ROOT, 'en');
let redirectCount = 0;
if (fs.existsSync(enDir)) {
  const stack = [enDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const $ = load(fs.readFileSync(target, 'utf8'), { decodeEntities: false });
        if ($('link[data-site-analytics-style],script[data-site-analytics]').length) {
          throw new Error(`${path.relative(ROOT, target)}: analytics must not run on /en redirect pages.`);
        }
        redirectCount += 1;
      }
    }
  }
}

console.log(`Analytics safety OK: ${canonicalCount} canonical pages instrumented, ${redirectCount} /en redirect pages excluded, basic opt-in consent enforced, GA4 ${enabled ? 'enabled' : 'still disabled'}.`);
