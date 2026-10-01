import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/project-taxonomy.json'), 'utf8'));
const projects = taxonomy.projects || {};
const archives = ['archive.html', 'fr/archive.html', 'es/archive.html'];

let filesChanged = 0;
let entriesSynced = 0;

for (const rel of archives) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing canonical archive page: ${rel}`);
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  let touched = false;

  $('.archive-entry[data-archive-project]').each((_, el) => {
    const entry = $(el);
    const slug = String(entry.attr('data-archive-project') || '').trim();
    const tags = projects[slug];
    if (!Array.isArray(tags) || !tags.length) throw new Error(`${rel}: taxonomy tags missing for ${slug}`);
    const value = tags.join(' ');
    if ((entry.attr('data-archive-tags') || '') !== value) {
      entry.attr('data-archive-tags', value);
      touched = true;
    }
    entriesSynced += 1;
  });

  if (touched) {
    fs.writeFileSync(file, $.html(), 'utf8');
    filesChanged += 1;
  }
}

console.log(`Archive taxonomy synchronized: ${entriesSynced} entries checked across ${archives.length} canonical archives (${filesChanged} files changed).`);
