import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const defaultLanguage = String(config.defaultLanguage || 'en').toLowerCase();
const supportedLanguages = Array.isArray(config.languages) ? config.languages.map(String) : ['en', 'fr', 'es'];
const localizedLanguages = supportedLanguages.filter(lang => lang !== defaultLanguage);
const sitemapPath = path.join(ROOT, 'sitemap.xml');

if (!origin.startsWith('https://')) throw new Error('site.config.json origin must be HTTPS.');
if (defaultLanguage !== 'en') throw new Error(`Expected defaultLanguage=en, got ${defaultLanguage}.`);
if (!localizedLanguages.includes('fr') || !localizedLanguages.includes('es')) {
  throw new Error(`Expected fr/es localized languages, got ${localizedLanguages.join(', ')}.`);
}
if (!fs.existsSync(sitemapPath)) throw new Error('sitemap.xml is missing before SEO finalization.');

const originUrl = new URL(origin + '/');
const today = new Date().toISOString().slice(0, 10);

function xmlDecode(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function routeFromUrl(value) {
  const url = new URL(value);
  if (url.origin !== originUrl.origin) throw new Error(`Unexpected sitemap origin: ${value}`);
  const originBase = originUrl.pathname.replace(/\/$/, '');
  let pathname = url.pathname;
  if (originBase && originBase !== '/' && pathname.startsWith(originBase)) pathname = pathname.slice(originBase.length);
  pathname = pathname.replace(/^\/+/, '');
  return pathname || 'index.html';
}

function canonicalUrl(route, lang = defaultLanguage) {
  const tail = route === 'index.html' ? '' : route;
  const prefix = lang === defaultLanguage ? '' : `${lang}/`;
  const url = new URL(`${prefix}${tail}`, origin + '/');
  if (!tail && !url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}

function fileFor(route, lang = defaultLanguage) {
  if (lang === defaultLanguage) return path.join(ROOT, route);
  return path.join(ROOT, lang, route);
}

function relativeRepoPath(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

function gitLastmod(file) {
  const rel = relativeRepoPath(file);
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', rel], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (dirty) return today;
  } catch {}

  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  } catch {}

  return today;
}

function ensureLink($, rel, attrs) {
  let link = $(`link[rel="${rel}"]`).filter((_, el) => {
    if (attrs.hreflang) return $(el).attr('hreflang') === attrs.hreflang;
    return !$(el).attr('hreflang');
  }).first();
  if (!link.length) {
    link = $('<link>');
    $('head').append(link);
  }
  link.attr('rel', rel);
  for (const [key, value] of Object.entries(attrs)) link.attr(key, value);
  return link;
}

function normalizeCanonicalPage(route, lang) {
  const file = fileFor(route, lang);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical page: ${relativeRepoPath(file)}`);

  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  $('html').attr('lang', lang);

  if (lang === defaultLanguage) $('script[data-static-lang]').remove();

  const self = canonicalUrl(route, lang);
  ensureLink($, 'canonical', { href: self });

  $('link[rel="alternate"][hreflang]').remove();
  $('head').append(`<link rel="alternate" hreflang="en" href="${canonicalUrl(route, 'en')}" data-i18n-alt>`);
  $('head').append(`<link rel="alternate" hreflang="fr" href="${canonicalUrl(route, 'fr')}" data-i18n-alt>`);
  $('head').append(`<link rel="alternate" hreflang="es" href="${canonicalUrl(route, 'es')}" data-i18n-alt>`);
  $('head').append(`<link rel="alternate" hreflang="x-default" href="${canonicalUrl(route, 'en')}" data-i18n-alt>`);

  const ogUrl = $('meta[property="og:url"]').first();
  if (ogUrl.length) ogUrl.attr('content', self);

  const switcher = $('.lang-switcher').first();
  if (switcher.length) {
    switcher.find('a').removeAttr('aria-current');

    // EN is the canonical root route, not /en/. Remove data-lang so the legacy
    // runtime click interceptor cannot rewrite the click back to /en/. The
    // inline handler only stores the explicit English preference, then the
    // normal anchor navigation goes directly to the root canonical URL.
    const enAnchor = switcher.find('a[data-lang="en"], a[data-default-lang="en"]').first();
    if (enAnchor.length) {
      enAnchor
        .attr('href', canonicalUrl(route, 'en'))
        .attr('data-default-lang', 'en')
        .attr('onclick', "try{localStorage.setItem('data-c0re-lang-v1','en')}catch{}")
        .removeAttr('data-lang');
      if (lang === 'en') enAnchor.attr('aria-current', 'page');
    }

    for (const target of ['fr', 'es']) {
      const anchor = switcher.find(`a[data-lang="${target}"]`).first();
      if (!anchor.length) continue;
      anchor.attr('href', canonicalUrl(route, target));
      if (target === lang) anchor.attr('aria-current', 'page');
    }
  }

  fs.writeFileSync(file, $.html(), 'utf8');
}

function redirectHtml(route) {
  const target = canonicalUrl(route, 'en');
  const title = route === 'index.html' ? 'DATA C0RE' : 'Moved — DATA C0RE';
  const jsTarget = JSON.stringify(target);
  return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>${title}</title>\n  <meta name="robots" content="noindex,follow">\n  <link rel="canonical" href="${target}">\n  <link rel="alternate" hreflang="en" href="${canonicalUrl(route, 'en')}">\n  <link rel="alternate" hreflang="fr" href="${canonicalUrl(route, 'fr')}">\n  <link rel="alternate" hreflang="es" href="${canonicalUrl(route, 'es')}">\n  <link rel="alternate" hreflang="x-default" href="${canonicalUrl(route, 'en')}">\n  <meta http-equiv="refresh" content="0; url=${target}">\n  <script>\n    (()=>{\n      const target=${jsTarget};\n      try{localStorage.setItem('data-c0re-lang-v1','en')}catch{}\n      const url=new URL(target);\n      url.search=location.search;\n      url.hash=location.hash;\n      location.replace(url.href);\n    })();\n  </script>\n</head>\n<body>\n  <p>This English URL has moved to <a href="${target}">${target}</a>.</p>\n</body>\n</html>\n`;
}

function parseCanonicalRoutesFromCurrentSitemap() {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => xmlDecode(match[1].trim()));
  const routes = [];
  const seen = new Set();

  for (const loc of locs) {
    const route = routeFromUrl(loc);
    if (/^(en|fr|es)(\/|$)/.test(route)) continue;
    if (seen.has(route)) continue;
    const file = fileFor(route, 'en');
    if (!fs.existsSync(file)) continue;
    seen.add(route);
    routes.push(route);
  }

  if (!routes.length) throw new Error('Could not derive canonical English routes from sitemap.xml.');
  return routes.sort((a, b) => a.localeCompare(b));
}

function writeRedirectLayer(routes) {
  const enDir = path.join(ROOT, 'en');
  fs.rmSync(enDir, { recursive: true, force: true });
  for (const route of routes) {
    const file = path.join(ROOT, 'en', route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, redirectHtml(route), 'utf8');
  }
}

function writeSitemap(routes) {
  const entries = [];
  for (const route of routes) {
    const alternates = {
      en: canonicalUrl(route, 'en'),
      fr: canonicalUrl(route, 'fr'),
      es: canonicalUrl(route, 'es'),
      'x-default': canonicalUrl(route, 'en')
    };

    for (const lang of ['en', 'fr', 'es']) {
      const file = fileFor(route, lang);
      const loc = alternates[lang];
      const lastmod = gitLastmod(file);
      entries.push([
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(alternates.en)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="fr" href="${xmlEscape(alternates.fr)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="es" href="${xmlEscape(alternates.es)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(alternates['x-default'])}"/>`,
        '  </url>'
      ].join('\n'));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, xml, 'utf8');
}

const routes = parseCanonicalRoutesFromCurrentSitemap();

for (const route of routes) {
  normalizeCanonicalPage(route, 'en');
  normalizeCanonicalPage(route, 'fr');
  normalizeCanonicalPage(route, 'es');
}

writeRedirectLayer(routes);
writeSitemap(routes);

console.log(`Default-English SEO architecture finalized: ${routes.length} routes, ${routes.length * 3} canonical sitemap URLs, /en retained only as noindex redirect compatibility layer.`);
