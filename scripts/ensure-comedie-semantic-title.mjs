import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const pages = {
  'projects/comedie.html': 'Comédie de Genève — Video Systems & Touring',
  'fr/projects/comedie.html': 'Comédie de Genève — Systèmes vidéo & tournée',
  'es/projects/comedie.html': 'Comédie de Genève — Sistemas de vídeo y gira'
};
const style = '.project-semantic-title{position:absolute!important;left:0;top:0;width:1px!important;height:1px!important;padding:0!important;margin:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}';

let changed = 0;
for (const [rel, title] of Object.entries(pages)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing Comédie page: ${rel}`);
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });

  $('style[data-comedie-semantic-title]').remove();
  $('head').append(`<style data-comedie-semantic-title>${style}</style>`);

  $('main h1.project-semantic-title').remove();
  const hero = $('main .project-hero').first();
  if (!hero.length) throw new Error(`${rel}: missing project hero.`);
  hero.prepend(`<h1 class="project-semantic-title">${title}</h1>`);

  if ($('main h1').length !== 1) throw new Error(`${rel}: expected exactly one semantic H1 after normalization.`);
  if ($('main .project-hero h1.project-semantic-title').length !== 1) throw new Error(`${rel}: semantic H1 must live inside the project hero.`);

  fs.writeFileSync(file, $.html(), 'utf8');
  changed += 1;
}

console.log(`Comédie semantic H1 normalized inside the project hero on ${changed} canonical locale pages.`);
