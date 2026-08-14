import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const roots = ['fr', 'es'];
const selector = [
  'h1',
  'h2',
  '.menu-links a',
  '.about-display',
  '.cv-title strong',
  '.references-list'
].join(',');

const stripDiacritics = value => value.normalize('NFD').replace(/\p{M}+/gu, '').normalize('NFC');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function cleanTextNodes($, element) {
  $(element).contents().each((_, node) => {
    if (node.type === 'text' && typeof node.data === 'string') {
      node.data = stripDiacritics(node.data);
      return;
    }
    if (node.type === 'tag') cleanTextNodes($, node);
  });
}

let changed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const input = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(input, { decodeEntities: false });
    $(selector).each((_, el) => cleanTextNodes($, el));

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

console.log(`Display heading diacritics/spacing applied in ${changed} localized HTML file(s).`);
