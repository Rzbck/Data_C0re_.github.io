import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const diagramLabels = {
  fr: [
    ['01', 'mmWave', 'tracking'],
    ['02', 'passerelle', 'réseau'],
    ['03', 'données', 'spatiales'],
    ['04', 'comportement', 'TouchDesigner'],
    ['05', 'sortie', 'LED']
  ],
  es: [
    ['01', 'mmWave', 'tracking'],
    ['02', 'pasarela', 'de red'],
    ['03', 'datos', 'espaciales'],
    ['04', 'comportamiento', 'TouchDesigner'],
    ['05', 'salida', 'LED']
  ]
};
const diagramAria = {
  fr: 'Pipeline temps réel cible',
  es: 'Pipeline objetivo en tiempo real'
};

for (const lang of ['fr', 'es']) {
  const file = path.join(ROOT, lang, 'projects', 'signal.html');
  if (!fs.existsSync(file)) continue;
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  $('.signal-hero-system').attr('aria-label', diagramAria[lang]);
  $('.signal-node').each((index, el) => {
    const spec = diagramLabels[lang][index];
    if (!spec) return;
    $(el).find('b').first().text(spec[0]);
    $(el).find('span').first().html(`${spec[1]}<br>${spec[2]}`);
  });
  $('meta[property="og:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  $('meta[name="twitter:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  fs.writeFileSync(file, $.html(), 'utf8');
}

for (const rel of ['projects/signal.html', 'en/projects/signal.html']) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
  $('meta[property="og:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  $('meta[name="twitter:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  fs.writeFileSync(file, $.html(), 'utf8');
}

console.log('SIGNAL localized diagram labels and social image finalized.');
