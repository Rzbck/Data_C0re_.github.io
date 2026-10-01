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

function homeHrefFor(rel) {
  if (rel.startsWith('fr/')) return 'fr/';
  if (rel.startsWith('es/')) return 'es/';
  return 'index.html';
}

let changed = 0;
for (const loc of locs) {
  const rel = repoPathFromUrl(loc);
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical page: ${rel}`);
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  const href = homeHrefFor(rel);
  let touched = false;

  $('.nav-primary--home').each((_, el) => {
    const node = $(el);
    if (node.attr('href') !== href) {
      node.attr('href', href);
      touched = true;
    }
  });

  $('.site-header .brand').first().each((_, el) => {
    const node = $(el);
    if (node.attr('href') !== href) {
      node.attr('href', href);
      touched = true;
    }
  });

  if (touched) {
    fs.writeFileSync(file, $.html(), 'utf8');
    changed += 1;
  }
}

console.log(`Home navigation normalized on ${locs.length} canonical pages (${changed} files changed).`);
