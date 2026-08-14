import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const roots = ['fr', 'es'];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

let changed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const input = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(input, { decodeEntities: false });

    if (!$('link[data-localized-display-spacing]').length) {
      $('head').append('<link rel="stylesheet" href="assets/css/localized-display-spacing.css" data-localized-display-spacing>');
    }

    const output = $.html();
    if (output !== input) {
      fs.writeFileSync(file, output);
      changed += 1;
    }
  }
}

console.log(`Localized display spacing applied in ${changed} FR / ES HTML file(s); accents preserved.`);
