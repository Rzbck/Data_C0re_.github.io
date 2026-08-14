import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const roots = ['', 'projects', 'en', 'en/projects', 'fr', 'fr/projects', 'es', 'es/projects'];
const menuLink = '<link rel="stylesheet" href="assets/css/menu-two-column.css" data-menu-layout>';
const contactGuard = '<script data-contact-no-ascii>window.__DATA_C0RE_ASCII_CURSOR__=true;window.__DATA_C0RE_ASCII_CURSOR_V2__=true;window.__DATA_C0RE_ASCII_CURSOR_V17__=true;<\/script>';

const menuCopy = {
  en: {
    label: 'DATA C0RE / site index',
    items: [
      ['home', 'Home', '00 / Overview', 'Identity / selected work', 'index.html'],
      ['work', 'Work', '01 / Portfolio', 'Projects / systems', 'work.html'],
      ['services', 'Services', '02 / Services', 'TouchDesigner / video', 'services.html'],
      ['lab', 'Lab', '03 / R&D', 'Research / prototypes', 'lab.html'],
      ['about', 'About', '04 / Practice', 'Approach / direction', 'about.html'],
      ['cv', 'CV', '05 / Experience', 'Roles / tools', 'cv.html'],
      ['contact', 'Contact', '06 / Contact', 'Projects / production', 'contact.html']
    ]
  },
  fr: {
    label: 'DATA C0RE / index du site',
    items: [
      ['home', 'Accueil', '00 / Vue d’ensemble', 'Identité / sélection', 'index.html'],
      ['work', 'Travail', '01 / Portfolio', 'Projets / systèmes', 'work.html'],
      ['services', 'Services', '02 / Services', 'TouchDesigner / vidéo', 'services.html'],
      ['lab', 'Lab', '03 / R&D', 'Recherche / prototypes', 'lab.html'],
      ['about', 'À propos', '04 / Pratique', 'Approche / direction', 'about.html'],
      ['cv', 'CV', '05 / Expérience', 'Parcours / outils', 'cv.html'],
      ['contact', 'Contact', '06 / Contact', 'Projets / production', 'contact.html']
    ]
  },
  es: {
    label: 'DATA C0RE / índice del sitio',
    items: [
      ['home', 'Inicio', '00 / Vista general', 'Identidad / selección', 'index.html'],
      ['work', 'Trabajo', '01 / Portfolio', 'Proyectos / sistemas', 'work.html'],
      ['services', 'Servicios', '02 / Servicios', 'TouchDesigner / vídeo', 'services.html'],
      ['lab', 'Lab', '03 / I+D', 'Investigación / prototipos', 'lab.html'],
      ['about', 'Acerca de', '04 / Práctica', 'Enfoque / dirección', 'about.html'],
      ['cv', 'CV', '05 / Experiencia', 'Trayectoria / herramientas', 'cv.html'],
      ['contact', 'Contacto', '06 / Contacto', 'Proyectos / producción', 'contact.html']
    ]
  }
};

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

function routeInfo(rel) {
  const parts = rel.split('/');
  const localized = ['en', 'fr', 'es'].includes(parts[0]);
  const locale = localized ? parts[0] : 'en';
  const route = localized ? parts.slice(1).join('/') : rel;
  return { localized, locale, route };
}

function currentKey(route) {
  if (route === 'index.html') return 'home';
  if (route.startsWith('projects/')) return 'work';
  return path.posix.basename(route, '.html');
}

function hrefFor(localized, locale, target) {
  if (localized) return target === 'index.html' ? `${locale}/` : `${locale}/${target}`;
  return target;
}

function renderMenu(rel) {
  const { localized, locale, route } = routeInfo(rel);
  const copy = menuCopy[locale] || menuCopy.en;
  const active = currentKey(route);
  const links = copy.items.map(([key, title, meta, detail, target]) => {
    const href = hrefFor(localized, locale, target);
    const current = active === key ? ' is-current' : '';
    const ariaCurrent = active === key ? ' aria-current="page"' : '';
    const contact = key === 'contact' ? ' data-contact-nav="1"' : '';
    return `<a class="menu-card menu-card--${key}${current}" href="${href}" aria-label="${title}"${ariaCurrent}${contact}><span class="menu-card-meta" aria-hidden="true"><b>${meta}</b><small>${detail}</small></span><span class="menu-card-title">${title}</span><span class="menu-card-arrow" aria-hidden="true">↗</span></a>`;
  }).join('');
  return { label: copy.label, links };
}

for (const rel of htmlFiles()) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let html = before
    .replace(/<link\b[^>]*data-menu-layout[^>]*>\s*/gi, '')
    .replace(/<script\b[^>]*data-contact-no-ascii[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  const menu = renderMenu(rel);
  html = html.replace(/<p class="menu-label">[\s\S]*?<\/p>/i, `<p class="menu-label">${menu.label}</p>`);
  html = html.replace(/<div class="menu-links"[^>]*>[\s\S]*?<\/div><div class="menu-small">/i, `<div class="menu-links" data-menu-grid>${menu.links}</div><div class="menu-small">`);
  html = html.replace('</head>', `${menuLink}\n</head>`);

  if (/(^|\/)contact\.html$/i.test(rel)) {
    html = html.replace(/<script\b[^>]*src=["'][^"']*ascii-cursor-glsl[^"']*["'][^>]*><\/script>\s*/gi, '');
    html = html.replace('</head>', `${contactGuard}\n</head>`);
  }

  writeIfChanged(file, before, html);
}

console.log('Structured full-viewport index applied; ASCII/GLSL cursor disabled on contact routes.');
