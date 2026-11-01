import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const origin = String(config.origin || '').replace(/\/$/, '');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1].trim().replaceAll('&amp;', '&'));

if (!locs.length) throw new Error('No canonical URLs found in sitemap.xml.');

function repoPathFromUrl(value) {
  const url = new URL(value);
  if (url.origin !== origin) throw new Error(`Unexpected sitemap origin: ${value}`);
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!rel) rel = 'index.html';
  else if (rel.endsWith('/')) rel += 'index.html';
  return rel;
}

function expectedHome(rel) {
  if (rel.startsWith('fr/')) return 'fr/';
  if (rel.startsWith('es/')) return 'es/';
  return 'index.html';
}

let checked = 0;
for (const loc of locs) {
  const rel = repoPathFromUrl(loc);
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical page: ${rel}`);
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  const expected = expectedHome(rel);

  const home = $('.nav-primary--home').first();
  if (!home.length) throw new Error(`${rel}: missing .nav-primary--home link.`);
  if ((home.attr('href') || '') !== expected) {
    throw new Error(`${rel}: Home href is "${home.attr('href') || ''}"; expected "${expected}".`);
  }

  const brand = $('.site-header .brand').first();
  if (!brand.length) throw new Error(`${rel}: missing header brand link.`);
  if ((brand.attr('href') || '') !== expected) {
    throw new Error(`${rel}: brand href is "${brand.attr('href') || ''}"; expected "${expected}".`);
  }

  // Legacy pages may still exist for old bookmarks, but canonical pages must
  // link directly to current destinations, never through noindex stubs.
  const obsolete = /^(?:\.\/)?(?:(?:fr|es)\/)?(?:work|about|lab)\.html$/;
  $('a[href]').each((_, element) => {
    const link = $(element).attr('href') || '';
    if (obsolete.test(link)) throw new Error(`${rel}: link to obsolete route "${link}".`);
  });

  checked += 1;
}

// Ensure sitemap project pages remain easy to discover in each language.
const priorityProjects = ['lumina', 'grand-theatre', 'comedie', 'hardwinner', 'stage-systems'];
const allProjects = [...new Set(locs
  .map(url => new URL(url).pathname)
  .filter(p => /^\/projects\/[^/]+\.html$/.test(p))
  .map(p => p.replace('/projects/', ''))
)];
for (const lang of ['en', 'fr', 'es']) {
  const prefix = lang === 'en' ? '' : `${lang}/`;
  for (const [source, names] of [
    ['index.html', priorityProjects],
    ['archive.html', allProjects]
  ]) {
    const sourceFile = path.join(ROOT, prefix + source);
    const $ = load(fs.readFileSync(sourceFile, 'utf8'), { decodeEntities: false });
    for (const name of names) {
      const href = `${prefix}projects/${name}.html`;
      if (!$('a[href]').toArray().some(node => $(node).attr('href') === href)) {
        throw new Error(`${prefix + source}: missing discoverable link to ${href}.`);
      }
    }
  }
}

console.log(`Navigation safety OK: ${checked} canonical pages; no obsolete links; all project links present in EN/FR/ES archives and priority projects on Home.`);
