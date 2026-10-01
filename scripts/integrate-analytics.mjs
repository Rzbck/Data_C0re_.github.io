import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const analytics = config.analytics || {};
const enabled = analytics.enabled === true;
const measurementId = String(analytics.measurementId || '').trim();
const consentDays = Math.max(1, Number(analytics.consentStorageDays || 180));

if (!origin.startsWith('https://')) throw new Error('site.config.json origin must be HTTPS.');
if (String(analytics.provider || 'ga4').toLowerCase() !== 'ga4') throw new Error('Only GA4 is supported by this integration.');
if (enabled && !/^G-[A-Z0-9]+$/i.test(measurementId)) {
  throw new Error('analytics.enabled=true requires a valid GA4 measurementId such as G-XXXXXXXXXX.');
}
if (String(analytics.consentMode || 'basic').toLowerCase() !== 'basic') {
  throw new Error('Only basic consent mode is allowed: Google Analytics must not load before opt-in.');
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) throw new Error('sitemap.xml is missing.');

const xml = fs.readFileSync(sitemapPath, 'utf8');
const locs = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1].trim().replaceAll('&amp;', '&'));
const originUrl = new URL(origin + '/');

function repoPathFromUrl(value) {
  const url = new URL(value);
  if (url.origin !== originUrl.origin) throw new Error(`Unexpected sitemap origin: ${value}`);
  let pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!pathname) pathname = 'index.html';
  else if (pathname.endsWith('/')) pathname += 'index.html';
  return pathname;
}

function stripAnalyticsMarkup($) {
  $('link[data-site-analytics-style]').remove();
  $('script[data-site-analytics]').remove();
}

function injectAnalytics(file) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = load(html, { decodeEntities: false });
  stripAnalyticsMarkup($);

  $('head').append('<link rel="stylesheet" href="assets/css/analytics-consent.css" data-site-analytics-style>');
  const script = $('<script></script>');
  script.attr('src', 'assets/js/analytics.js');
  script.attr('defer', '');
  script.attr('data-site-analytics', '');
  script.attr('data-analytics-enabled', enabled ? 'true' : 'false');
  script.attr('data-measurement-id', measurementId);
  script.attr('data-consent-days', String(consentDays));
  $('head').append(script);

  fs.writeFileSync(file, $.html(), 'utf8');
}

const canonicalFiles = [];
for (const loc of locs) {
  const rel = repoPathFromUrl(loc);
  if (/^en\//.test(rel)) throw new Error(`Legacy /en URL must not be in canonical sitemap: ${loc}`);
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Canonical sitemap file is missing: ${rel}`);
  canonicalFiles.push(file);
}

for (const file of canonicalFiles) injectAnalytics(file);

// /en is a compatibility redirect layer only. Never run analytics there.
const enDir = path.join(ROOT, 'en');
if (fs.existsSync(enDir)) {
  const stack = [enDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const $ = load(fs.readFileSync(target, 'utf8'), { decodeEntities: false });
        const before = $('link[data-site-analytics-style],script[data-site-analytics]').length;
        if (before) {
          stripAnalyticsMarkup($);
          fs.writeFileSync(target, $.html(), 'utf8');
        }
      }
    }
  }
}

console.log(`Analytics integration prepared on ${canonicalFiles.length} canonical pages; GA4 ${enabled ? `enabled (${measurementId})` : 'disabled until a measurement ID is configured'}; basic opt-in consent enforced.`);
