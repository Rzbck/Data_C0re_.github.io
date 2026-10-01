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

  checked += 1;
}

console.log(`Navigation safety OK: ${checked} canonical pages have working Home and brand links.`);
