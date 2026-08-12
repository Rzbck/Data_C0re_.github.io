import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const languages = config.languages || ['en', 'fr', 'es'];
if (!origin.startsWith('https://')) throw new Error('site.config.json origin must be an https:// URL');

const rootPages = fs.readdirSync(ROOT)
  .filter(name => name.endsWith('.html') && name !== '404.html')
  .sort();
const projectDir = path.join(ROOT, 'projects');
const projectPages = fs.existsSync(projectDir)
  ? fs.readdirSync(projectDir).filter(name => name.endsWith('.html')).sort().map(name => `projects/${name}`)
  : [];
const sourcePages = [...rootPages, ...projectPages];
const sourceSet = new Set(sourcePages);

function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find ${marker}`);
  const start = source.indexOf('{', markerIndex + marker.length);
  if (start < 0) throw new Error(`Could not find object after ${marker}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Unclosed object for ${marker}`);
}

const i18nSource = fs.readFileSync(path.join(ROOT, 'assets/js/i18n.js'), 'utf8');
const extraSource = fs.readFileSync(path.join(ROOT, 'assets/js/i18n-extra.js'), 'utf8');
const polishSource = fs.readFileSync(path.join(ROOT, 'assets/js/i18n-polish.js'), 'utf8');
const baseFr = vm.runInNewContext(`(${extractObjectLiteral(i18nSource, 'const commonFr=')})`);
const baseEs = vm.runInNewContext(`(${extractObjectLiteral(i18nSource, 'const commonEs=')})`);
const extraMaps = vm.runInNewContext(`(${extractObjectLiteral(extraSource, 'const maps=')})`);
const polishExact = vm.runInNewContext(`(${extractObjectLiteral(polishSource, 'const exact=')})`);
const dictionaries = {
  en: {},
  fr: { ...baseFr, ...(extraMaps.fr || {}) },
  es: { ...baseEs, ...(extraMaps.es || {}) }
};

const seoOverrides = {
  fr: {
    'index.html': {
      title: 'DATA C0RE — TouchDesigner, vidéo interactive & systèmes audiovisuels temps réel',
      description: 'Artiste numérique et creative technologist basé à Annecy, actif entre France, Suisse et contextes internationaux : TouchDesigner, vidéo interactive, projection, SMODE, LED/DMX, live AV et systèmes scéniques.'
    },
    'work.html': {
      title: 'Travaux — TouchDesigner, projection, vidéo théâtre & live AV — DATA C0RE',
      description: 'Portfolio de systèmes audiovisuels temps réel : TouchDesigner, projection et mapping, vidéo interactive, SMODE, LED/DMX, régie vidéo théâtre, installations et live AV.'
    },
    'about.html': {
      title: 'À propos — Artiste numérique & Creative Technologist — DATA C0RE',
      description: 'DATA C0RE développe des systèmes audiovisuels temps réel reliant code, son, données, image, projection, lumière et espace, depuis Annecy avec des projets en France, en Suisse et à l’international.'
    },
    'cv.html': {
      title: 'CV — TouchDesigner, régie vidéo théâtre, SMODE & projection — DATA C0RE',
      description: 'CV professionnel : TouchDesigner, systèmes vidéo interactifs, régie vidéo théâtre et tournée, SMODE, projection, edge blending, LED, DMX, Art-Net, OSC et intégration média. Annecy / France, Genève / Suisse, mobilité internationale.'
    },
    'lab.html': {
      title: 'Lab — TouchDesigner, GLSL, creative coding & systèmes temps réel — DATA C0RE',
      description: 'Recherche et développement autour de TouchDesigner, GLSL, creative coding, audio-réactivité, feedback, réseaux, capteurs, API, WebSocket et systèmes audiovisuels temps réel.'
    },
    'projects/lumina.html': {
      title: 'LUMINA / Geneva Lux — Installation LED interactive, TouchDesigner & Art-Net — DATA C0RE',
      description: 'Installation publique à Genève : structure Fusion 360, TouchDesigner, Art-Net, LED adressables, réseau, fabrication et intégration lumière temps réel pour Geneva Lux.'
    },
    'projects/grand-theatre.html': {
      title: 'Grand Théâtre de Genève — SMODE, projection & intégration vidéo — DATA C0RE',
      description: 'Programmation SMODE, cues, projection multi-plans, edge blending, optiques très courte focale et calibration sur site au Grand Théâtre de Genève, Suisse.'
    },
    'projects/comedie.html': {
      title: 'Comédie de Genève — Régie vidéo théâtre & système interactif en tournée — DATA C0RE',
      description: 'Systèmes vidéo théâtre en création et tournée : caméras, routing, projection, mapping, surtitrage, adaptation aux lieux, dépannage et passation régie.'
    },
    'projects/stage-systems.html': {
      title: 'Systèmes scéniques — TouchDesigner, Resolume, LED & DMX — DATA C0RE',
      description: 'Systèmes vidéo et lumière temps réel : TouchDesigner, Resolume, écrans LED, DMX, simulation scénique, synchronisation vidéo-lumière et déploiement live.'
    },
    'projects/hardwinner.html': {
      title: 'Hardwinner — TouchDesigner, GLSL, LED, DMX & live AV — DATA C0RE',
      description: 'Systèmes AV collaboratifs reliant TouchDesigner, Resolume, GLSL, LED, DMX, show control, simulation 3D temps réel et contextes de musique électronique live.'
    }
  },
  es: {
    'index.html': {
      title: 'DATA C0RE — TouchDesigner, vídeo interactivo y sistemas audiovisuales en tiempo real',
      description: 'Artista digital y creative technologist con base en Annecy: TouchDesigner, vídeo interactivo, proyección, SMODE, LED/DMX, live AV y sistemas escénicos en Francia, Suiza y contextos internacionales.'
    },
    'work.html': {
      title: 'Trabajos — TouchDesigner, proyección, vídeo teatral y live AV — DATA C0RE',
      description: 'Portfolio de sistemas audiovisuales en tiempo real: TouchDesigner, proyección y mapping, vídeo interactivo, SMODE, LED/DMX, vídeo teatral, instalaciones y live AV.'
    },
    'about.html': {
      title: 'Acerca de — Artista digital & Creative Technologist — DATA C0RE',
      description: 'DATA C0RE desarrolla sistemas audiovisuales en tiempo real que conectan código, sonido, datos, imagen, proyección, luz y espacio.'
    },
    'cv.html': {
      title: 'CV — TouchDesigner, vídeo teatral, SMODE & proyección — DATA C0RE',
      description: 'CV profesional: TouchDesigner, sistemas de vídeo interactivo, vídeo teatral y gira, SMODE, proyección, edge blending, LED, DMX, Art-Net, OSC e integración multimedia.'
    },
    'lab.html': {
      title: 'Lab — TouchDesigner, GLSL, creative coding & tiempo real — DATA C0RE',
      description: 'Investigación con TouchDesigner, GLSL, creative coding, audio-reactividad, feedback, redes, sensores, API, WebSocket y sistemas audiovisuales en tiempo real.'
    }
  }
};

const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();
const preserveWhitespace = (raw, replacement) => {
  const lead = raw.match(/^\s*/)?.[0] || '';
  const trail = raw.match(/\s*$/)?.[0] || '';
  return lead + replacement + trail;
};
function polish(value, lang) {
  if (lang === 'en') return value;
  let next = (polishExact[lang] || {})[value] || value;
  if (lang === 'fr') {
    next = next.replace(/soft[- ]edge/gi, 'edge blending').replace(/contrôle de spectacle/gi, 'show control').replace(/cartographie vidéo/gi, 'mapping vidéo');
  } else if (lang === 'es') {
    next = next.replace(/soft[- ]edge/gi, 'edge blending').replace(/control de espectáculo/gi, 'show control').replace(/mapeo de proyección/gi, 'mapping de proyección');
  }
  return next;
}
function translate(value, lang) {
  const normalized = normalize(value);
  if (!normalized || lang === 'en') return value;
  const translated = dictionaries[lang]?.[normalized] || normalized;
  return preserveWhitespace(value, polish(translated, lang));
}

function pageUrl(sourcePath, lang = null) {
  const clean = sourcePath === 'index.html' ? '' : sourcePath;
  const suffix = lang ? `${lang}/${clean}` : clean;
  return `${origin}/${suffix}`.replace(/([^:]\/)\/+/g, '$1');
}
function alternatesFor(sourcePath) {
  return {
    en: pageUrl(sourcePath, 'en'),
    fr: pageUrl(sourcePath, 'fr'),
    es: pageUrl(sourcePath, 'es'),
    'x-default': pageUrl(sourcePath)
  };
}
function altMarkup(sourcePath) {
  const alts = alternatesFor(sourcePath);
  return [
    '<!-- DATA C0RE LANGUAGE ROUTES START -->',
    ...languages.map(lang => `<link rel="alternate" hreflang="${lang}" href="${alts[lang]}" data-i18n-alt>`),
    `<link rel="alternate" hreflang="x-default" href="${alts['x-default']}" data-i18n-alt>`,
    '<script src="assets/js/language-routes.js" defer data-language-routes></script>',
    '<!-- DATA C0RE LANGUAGE ROUTES END -->'
  ].join('\n');
}
function injectSourceHead(html, sourcePath) {
  const cleaned = html.replace(/\n?<!-- DATA C0RE LANGUAGE ROUTES START -->[\s\S]*?<!-- DATA C0RE LANGUAGE ROUTES END -->\n?/g, '\n');
  return cleaned.replace('</head>', `${altMarkup(sourcePath)}\n</head>`);
}

function resolveInternalPage(href, sourcePath, sourceBaseHref) {
  if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null;
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  const rawPath = match?.[1] || '';
  const suffix = match?.[2] || '';
  if (!rawPath) return null;
  const sourceDir = path.posix.dirname(sourcePath);
  const baseDir = sourceBaseHref
    ? path.posix.normalize(path.posix.join(sourceDir, sourceBaseHref))
    : sourceDir;
  const resolved = path.posix.normalize(path.posix.join(baseDir, rawPath.replace(/^\.\//, ''))).replace(/^\.\//, '');
  if (!sourceSet.has(resolved)) return null;
  return { target: resolved, suffix };
}
function localizedHref(lang, target, suffix = '') {
  if (target === 'index.html') return `${lang}/${suffix.startsWith('#') ? suffix : ''}` || `${lang}/`;
  return `${lang}/${target}${suffix}`;
}

function setMeta($, selector, attrs) {
  let el = $(selector).first();
  if (!el.length) {
    el = $('<meta>');
    $('head').append(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.attr(key, value);
}
function addLocalizedSeo($, sourcePath, lang) {
  const override = seoOverrides[lang]?.[sourcePath];
  const sourceTitle = $('title').text();
  const sourceDescription = $('meta[name="description"]').attr('content') || '';
  const title = override?.title || polish(normalize(translate(sourceTitle, lang)), lang);
  const description = override?.description || polish(normalize(translate(sourceDescription, lang)), lang);
  $('title').text(title);
  setMeta($, 'meta[name="description"]', { name: 'description', content: description });
  setMeta($, 'meta[name="robots"]', { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });
  setMeta($, 'meta[property="og:type"]', { property: 'og:type', content: sourcePath.startsWith('projects/') ? 'article' : 'website' });
  setMeta($, 'meta[property="og:site_name"]', { property: 'og:site_name', content: 'DATA C0RE' });
  setMeta($, 'meta[property="og:title"]', { property: 'og:title', content: title });
  setMeta($, 'meta[property="og:description"]', { property: 'og:description', content: description });
  setMeta($, 'meta[property="og:url"]', { property: 'og:url', content: pageUrl(sourcePath, lang) });
  setMeta($, 'meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  setMeta($, 'meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  setMeta($, 'meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  let canonical = $('link[rel="canonical"]').first();
  if (!canonical.length) { canonical = $('<link rel="canonical">'); $('head').append(canonical); }
  canonical.attr('href', pageUrl(sourcePath, lang));
}

function translateDom($, lang) {
  if (lang === 'en') return;
  const excluded = new Set(['script', 'style', 'noscript', 'svg', 'code', 'pre']);
  const walk = node => {
    if (!node) return;
    if (node.type === 'text') {
      if (!normalize(node.data)) return;
      node.data = translate(node.data, lang);
      return;
    }
    const tag = String(node.name || '').toLowerCase();
    if (excluded.has(tag)) return;
    if (node.attribs) {
      for (const attr of ['alt', 'title', 'aria-label', 'data-tab-caption']) {
        if (node.attribs[attr]) node.attribs[attr] = normalize(translate(node.attribs[attr], lang));
      }
    }
    for (const child of node.children || []) walk(child);
  };
  walk($('body')[0]);
}

function generateLocalized(sourcePath, sourceHtml, lang) {
  const $ = load(sourceHtml, { decodeEntities: false });
  const originalBaseHref = $('base').first().attr('href') || '';
  $('html').attr('lang', lang);
  translateDom($, lang);
  addLocalizedSeo($, sourcePath, lang);

  const alts = alternatesFor(sourcePath);
  $('link[rel="alternate"][hreflang]').remove();
  for (const code of languages) $('head').append(`<link rel="alternate" hreflang="${code}" href="${alts[code]}" data-i18n-alt>`);
  $('head').append(`<link rel="alternate" hreflang="x-default" href="${alts['x-default']}" data-i18n-alt>`);

  $('script[data-static-lang]').remove();
  $('head').prepend(`<script data-static-lang>try{localStorage.setItem('data-c0re-lang-v1','${lang}')}catch{}</script>`);
  if (!$('script[data-language-routes]').length) $('head').append('<script src="assets/js/language-routes.js" defer data-language-routes></script>');

  const generatedPath = `${lang}/${sourcePath}`;
  const depth = path.posix.dirname(generatedPath).split('/').filter(Boolean).length;
  const baseHref = '../'.repeat(depth) || './';
  if ($('base').length) $('base').first().attr('href', baseHref);
  else $('head').prepend(`<base href="${baseHref}">`);

  $('a[href]').each((_, element) => {
    const anchor = $(element);
    const href = anchor.attr('href');
    const resolved = resolveInternalPage(href, sourcePath, originalBaseHref);
    if (!resolved) return;
    anchor.attr('href', localizedHref(lang, resolved.target, resolved.suffix));
  });

  const outPath = path.join(ROOT, generatedPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, $.html(), 'utf8');
}

function replaceOriginInSeoRuntime() {
  const file = path.join(ROOT, 'assets/js/seo.js');
  let seo = fs.readFileSync(file, 'utf8');
  seo = seo.replace(
    /const ROOT = 'https:\/\/rzbck\.github\.io\/Data_C0re_\.github\.io\/';/,
    "const ROOT = location.hostname.endsWith('github.io') ? `${location.origin}/Data_C0re_.github.io/` : `${location.origin}/`;"
  );
  fs.writeFileSync(file, seo, 'utf8');
}

function updateSourcePagesAndGenerate() {
  for (const sourcePath of sourcePages) {
    const file = path.join(ROOT, sourcePath);
    let sourceHtml = fs.readFileSync(file, 'utf8');
    sourceHtml = sourceHtml.replaceAll('https://rzbck.github.io/Data_C0re_.github.io', origin);
    sourceHtml = injectSourceHead(sourceHtml, sourcePath);
    fs.writeFileSync(file, sourceHtml, 'utf8');
    for (const lang of languages) generateLocalized(sourcePath, sourceHtml, lang);
  }
}

function writeSitemap() {
  const esc = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const entries = [];
  for (const sourcePath of sourcePages) {
    const alts = alternatesFor(sourcePath);
    const urls = [pageUrl(sourcePath), ...languages.map(lang => pageUrl(sourcePath, lang))];
    for (const loc of urls) {
      entries.push([
        '  <url>',
        `    <loc>${esc(loc)}</loc>`,
        ...languages.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${esc(alts[lang])}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(alts['x-default'])}"/>`,
        '  </url>'
      ].join('\n'));
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
}

function writeRobots() {
  const robots = `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');
}

for (const lang of languages) {
  const dir = path.join(ROOT, lang);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
replaceOriginInSeoRuntime();
updateSourcePagesAndGenerate();
writeSitemap();
writeRobots();
console.log(`Generated ${sourcePages.length * languages.length} localized pages across ${languages.join(', ')}.`);
