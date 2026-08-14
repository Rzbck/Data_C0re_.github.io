import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const roots = ['', 'projects', 'en', 'en/projects', 'fr', 'fr/projects', 'es', 'es/projects'];
const menuLink = '<link rel="stylesheet" href="assets/css/menu-two-column.css" data-menu-layout>';
const contactGuard = '<script data-contact-no-ascii>window.__DATA_C0RE_ASCII_CURSOR__=true;window.__DATA_C0RE_ASCII_CURSOR_V2__=true;window.__DATA_C0RE_ASCII_CURSOR_V17__=true;<\/script>';

function htmlFiles() {
  const files = [];
  for (const dir of roots) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (!name.endsWith('.html')) continue;
      files.push(path.posix.join(dir, name).replace(/^\//, ''));
    }
  }
  return files;
}

function writeIfChanged(file, before, after) {
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}

for (const rel of htmlFiles()) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let html = before
    .replace(/<link\b[^>]*data-menu-layout[^>]*>\s*/gi, '')
    .replace(/<script\b[^>]*data-contact-no-ascii[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  html = html.replace('</head>', `${menuLink}\n</head>`);

  if (/(^|\/)contact\.html$/i.test(rel)) {
    html = html.replace(/<script\b[^>]*src=["'][^"']*ascii-cursor-glsl[^"']*["'][^>]*><\/script>\s*/gi, '');
    html = html.replace('</head>', `${contactGuard}\n</head>`);
  }

  writeIfChanged(file, before, html);
}

console.log('Compact two-column index applied; ASCII/GLSL cursor disabled on contact routes.');
