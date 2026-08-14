import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const roots = ['', 'projects', 'en', 'en/projects', 'fr', 'fr/projects', 'es', 'es/projects'];
const balanceLink = '<link rel="stylesheet" href="assets/css/layout-balance.css" data-layout-balance>';

function htmlFiles() {
  const out = [];
  for (const dir of roots) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (name.endsWith('.html')) out.push(path.posix.join(dir, name).replace(/^\//, ''));
    }
  }
  return out;
}

for (const rel of htmlFiles()) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let html = before.replace(/<link\b[^>]*data-layout-balance[^>]*>\s*/gi, '');
  html = html.replace('</head>', `${balanceLink}\n</head>`);
  if (html !== before) fs.writeFileSync(file, html, 'utf8');
}

console.log('Global visual-balance stylesheet integrated across source, EN, FR and ES routes.');
