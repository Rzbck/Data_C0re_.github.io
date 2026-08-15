import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const variants = [
  ['lab.html', '/archive.html', 'https://datac0re.is-a.dev/archive.html'],
  ['en/lab.html', '/en/archive.html', 'https://datac0re.is-a.dev/en/archive.html'],
  ['fr/lab.html', '/fr/archive.html', 'https://datac0re.is-a.dev/fr/archive.html'],
  ['es/lab.html', '/es/archive.html', 'https://datac0re.is-a.dev/es/archive.html']
];

for (const [rel, target, canonical] of variants) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  $('meta[name="robots"]').attr('content', 'noindex,follow');
  $('link[rel="canonical"]').attr('href', canonical);
  $('meta[http-equiv="refresh"]').remove();
  $('head').append(`<meta http-equiv="refresh" content="0;url=${target}">`);
  $('.global-footer > span').first().text('DATA C0RE / ARCHIVE');
  fs.writeFileSync(file, $.html(), 'utf8');
}

console.log('Legacy Lab routes now redirect root-relatively to Archive.');
