import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const legacy = /(^|\/)(work|about|services|lab)\.html$/;

function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
    const full = path.join(dir,entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT,file).replaceAll('\\','/');
  const $ = load(fs.readFileSync(file,'utf8'), {decodeEntities:false});

  if (!legacy.test(rel)) $('meta[http-equiv="refresh"]').remove();

  if (/(^|\/)index\.html$/.test(rel)) {
    $('.hero-foot span').first().text(
      rel.startsWith('fr/') ? 'Pratique sélectionnée / 2016—2027' :
      rel.startsWith('es/') ? 'Práctica seleccionada / 2016—2027' :
      'Selected practice / 2016—2027'
    );
  }

  if (/(^|\/)cv\.html$/.test(rel)) {
    $('.cv-section .cv-head > p').each((i,el) => {
      const current = $(el).text().replace(/^\s*\d+\s*\/\s*/,'').trim();
      $(el).text(`${String(i+1).padStart(2,'0')} / ${current}`);
    });
  }

  if (legacy.test(rel)) {
    $('title').text('DATA C0RE');
    $('meta[name="description"]').attr('content','DATA C0RE');
    $('meta[property="og:title"]').attr('content','DATA C0RE');
    $('meta[property="og:description"]').attr('content','DATA C0RE');
    $('meta[name="twitter:title"]').attr('content','DATA C0RE');
    $('meta[name="twitter:description"]').attr('content','DATA C0RE');
  }

  fs.writeFileSync(file,$.html(),'utf8');
}

console.log('Portfolio V2 final cleanup applied.');
