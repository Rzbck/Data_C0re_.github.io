import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const sitemapPath = path.join(ROOT, 'sitemap.xml');
const verificationFile = path.join(ROOT, 'googlea17a6d7e73755190.html');
const expectedVerification = 'google-site-verification: googlea17a6d7e73755190.html';

function decode(value) {
  return String(value).replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function routeFromUrl(value) {
  const url = new URL(value);
  if (url.origin !== new URL(origin).origin) throw new Error(`Unexpected origin in sitemap: ${value}`);
  return url.pathname.replace(/^\/+/, '') || 'index.html';
}

function canonicalUrl(route, lang) {
  const tail = route === 'index.html' ? '' : route;
  const prefix = lang === 'en' ? '' : `${lang}/`;
  return new URL(`${prefix}${tail}`, origin + '/').href;
}

function readPage(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing file: ${path.relative(ROOT, file)}`);
  return load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
}

function visibleText($) {
  $('script,style,noscript,svg,template').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
if (!urlBlocks.length) throw new Error('sitemap.xml contains no <url> entries.');

const locs = urlBlocks.map(block => {
  const match = block.match(/<loc>([\s\S]*?)<\/loc>/);
  if (!match) throw new Error('A sitemap entry has no <loc>.');
  return decode(match[1].trim());
});

const enLocs = locs.filter(loc => !/^https:\/\/[^/]+\/(fr|es|en)(\/|$)/.test(loc.replace(origin, origin)));
const frLocs = locs.filter(loc => new URL(loc).pathname.startsWith('/fr/'));
const esLocs = locs.filter(loc => new URL(loc).pathname.startsWith('/es/'));
const duplicateEnLocs = locs.filter(loc => new URL(loc).pathname.startsWith('/en/'));

if (duplicateEnLocs.length) throw new Error(`sitemap.xml must not contain /en/ canonical URLs: ${duplicateEnLocs.slice(0, 3).join(', ')}`);
if (enLocs.length !== frLocs.length || enLocs.length !== esLocs.length) {
  throw new Error(`Canonical locale counts differ: EN=${enLocs.length}, FR=${frLocs.length}, ES=${esLocs.length}.`);
}
if (locs.length !== enLocs.length * 3) throw new Error(`Expected exactly 3 canonical URLs per route; got ${locs.length} URLs for ${enLocs.length} routes.`);

for (const block of urlBlocks) {
  const lastmod = block.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)?.[1];
  if (!lastmod) throw new Error('Every sitemap entry must contain a YYYY-MM-DD <lastmod>.');
  for (const lang of ['en', 'fr', 'es', 'x-default']) {
    if (!new RegExp(`hreflang="${lang}"`).test(block)) throw new Error(`Missing ${lang} hreflang in sitemap entry.`);
  }
}

const leakagePatterns = [
  /\bAccueil\b/i,
  /\bTous les types\b/i,
  /\bAucun projet\b/i,
  /\bAnnée\b/i,
  /\bInicio\b/i,
  /\bTodos los tipos\b/i,
  /\bNingún proyecto\b/i,
  /\bAño\b/i
];

for (const rootLoc of enLocs) {
  const route = routeFromUrl(rootLoc);
  const variants = {
    en: path.join(ROOT, route),
    fr: path.join(ROOT, 'fr', route),
    es: path.join(ROOT, 'es', route)
  };

  for (const lang of ['en', 'fr', 'es']) {
    const $ = readPage(variants[lang]);
    if ($('html').attr('lang') !== lang) throw new Error(`${lang}/${route}: html lang is not ${lang}.`);

    const canonical = $('link[rel="canonical"]').first().attr('href') || '';
    if (canonical !== canonicalUrl(route, lang)) throw new Error(`${lang}/${route}: canonical mismatch: ${canonical}`);

    for (const target of ['en', 'fr', 'es']) {
      const expected = canonicalUrl(route, target);
      const actual = $(`link[rel="alternate"][hreflang="${target}"]`).first().attr('href') || '';
      if (actual !== expected) throw new Error(`${lang}/${route}: hreflang ${target} mismatch: ${actual}`);
    }
    const xDefault = $('link[rel="alternate"][hreflang="x-default"]').first().attr('href') || '';
    if (xDefault !== canonicalUrl(route, 'en')) throw new Error(`${lang}/${route}: x-default must point to root English canonical.`);

    const enAnchor = $('.lang-switcher a[data-default-lang="en"], .lang-switcher a[data-lang="en"]').first();
    const switchEn = enAnchor.attr('href');
    if (switchEn && switchEn !== canonicalUrl(route, 'en')) throw new Error(`${lang}/${route}: EN switcher must point directly to root English URL.`);
    if (enAnchor.attr('data-lang') === 'en') throw new Error(`${lang}/${route}: EN switcher must bypass the legacy /en runtime interceptor.`);
  }

  const $en = readPage(variants.en);
  if ($en('script[data-static-lang]').length) throw new Error(`${route}: root English page must not force a localized path language.`);
  const body = visibleText($en);
  for (const pattern of leakagePatterns) {
    if (pattern.test(body)) throw new Error(`${route}: likely FR/ES UI leakage detected by ${pattern}.`);
  }

  const redirectFile = path.join(ROOT, 'en', route);
  const $redirect = readPage(redirectFile);
  const robots = ($redirect('meta[name="robots"]').attr('content') || '').toLowerCase();
  if (!robots.includes('noindex')) throw new Error(`en/${route}: compatibility page must be noindex.`);
  if (($redirect('link[rel="canonical"]').attr('href') || '') !== canonicalUrl(route, 'en')) throw new Error(`en/${route}: redirect canonical mismatch.`);
  const refresh = $redirect('meta[http-equiv="refresh"]').attr('content') || '';
  if (!refresh.includes(canonicalUrl(route, 'en'))) throw new Error(`en/${route}: redirect target mismatch.`);
}

if (fs.existsSync(verificationFile)) {
  const actual = fs.readFileSync(verificationFile, 'utf8').replace(/[\r\n]+$/g, '');
  if (actual !== expectedVerification) throw new Error('Google Search Console verification token changed.');
}

const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) throw new Error('robots.txt does not point at canonical sitemap.xml.');

console.log(`SEO architecture OK: ${enLocs.length} English root routes + FR/ES = ${locs.length} canonical sitemap URLs; /en is redirect-only; root English guard passed.`);
