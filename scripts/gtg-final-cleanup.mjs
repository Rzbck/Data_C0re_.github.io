import fs from 'node:fs';

const pages = [
  'projects/grand-theatre.html',
  'en/projects/grand-theatre.html',
  'fr/projects/grand-theatre.html',
  'es/projects/grand-theatre.html'
];

for (const file of pages) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/\n?\s*<style>\s*\.pro-main-media[\s\S]*?<\/style>/, '');
  html = html.replace(/<body[^>]*>/, '<body class="gtg-page" data-gtg-case-study-v1="1">');
  if (html.includes('undefined')) throw new Error(`Unexpected undefined label in ${file}`);
  fs.writeFileSync(file, html);
  console.log(`Cleaned ${file}`);
}
