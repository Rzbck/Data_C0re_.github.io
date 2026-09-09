import fs from 'node:fs';

const files = [
  'projects/fjm-atlas.html',
  'en/projects/fjm-atlas.html',
  'fr/projects/fjm-atlas.html',
  'es/projects/fjm-atlas.html'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  const after = before
    .replace(/<b>All projects<\/b>/g, '<b>INDEX</b>')
    .replace(/<b>Tous les projets<\/b>/g, '<b>INDEX</b>')
    .replace(/<b>Todos los proyectos<\/b>/g, '<b>INDEX</b>');
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}

console.log('FJM Atlas navigation copy normalized.');
