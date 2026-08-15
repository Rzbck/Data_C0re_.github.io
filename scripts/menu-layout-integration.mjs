import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const roots = ['', 'projects', 'en', 'en/projects', 'fr', 'fr/projects', 'es', 'es/projects'];
const menuLink = '<link rel="stylesheet" href="assets/css/menu-two-column.css" data-menu-layout>\n<link rel="stylesheet" href="assets/css/menu-eight-card.css" data-menu-eight-card>';
const contactGuard = '<script data-contact-no-ascii>window.__DATA_C0RE_ASCII_CURSOR__=true;window.__DATA_C0RE_ASCII_CURSOR_V2__=true;window.__DATA_C0RE_ASCII_CURSOR_V17__=true;<\/script>';

const menuCopy = {
  en: {
    label: 'DATA C0RE / site index',
    items: [
      ['home', 'Home', '00 / Overview', 'Identity / selected work', 'index.html'],
      ['work', 'Work', '01 / Realized', 'Built / installed / operated', 'work.html'],
      ['archive', 'Archive', '02 / Chronology', 'Projects / systems / studies', 'archive.html'],
      ['lab', 'Lab', '03 / R&D', 'Simulation / research', 'lab.html'],
      ['services', 'Services', '04 / Services', 'TouchDesigner / video', 'services.html'],
      ['about', 'About', '05 / Practice', 'Approach / direction', 'about.html'],
      ['cv', 'CV', '06 / Experience', 'Roles / tools', 'cv.html'],
      ['contact', 'Contact', '07 / Contact', 'Projects / production', 'contact.html']
    ]
  },
  fr: {
    label: 'DATA C0RE / index du site',
    items: [
      ['home', 'Accueil', '00 / Vue d’ensemble', 'Identité / sélection', 'index.html'],
      ['work', 'Travaux', '01 / Réalisé', 'Construit / installé / exploité', 'work.html'],
      ['archive', 'Archives', '02 / Chronologie', 'Projets / systèmes / études', 'archive.html'],
      ['lab', 'Lab', '03 / R&D', 'Simulation / recherche', 'lab.html'],
      ['services', 'Services', '04 / Services', 'TouchDesigner / vidéo', 'services.html'],
      ['about', 'À propos', '05 / Pratique', 'Approche / direction', 'about.html'],
      ['cv', 'CV', '06 / Expérience', 'Parcours / outils', 'cv.html'],
      ['contact', 'Contact', '07 / Contact', 'Projets / production', 'contact.html']
    ]
  },
  es: {
    label: 'DATA C0RE / índice del sitio',
    items: [
      ['home', 'Inicio', '00 / Vista general', 'Identidad / selección', 'index.html'],
      ['work', 'Trabajo', '01 / Realizado', 'Construido / instalado / operado', 'work.html'],
      ['archive', 'Archivo', '02 / Cronología', 'Proyectos / sistemas / estudios', 'archive.html'],
      ['lab', 'Lab', '03 / I+D', 'Simulación / investigación', 'lab.html'],
      ['services', 'Servicios', '04 / Servicios', 'TouchDesigner / vídeo', 'services.html'],
      ['about', 'Acerca de', '05 / Práctica', 'Enfoque / dirección', 'about.html'],
      ['cv', 'CV', '06 / Experiencia', 'Trayectoria / herramientas', 'cv.html'],
      ['contact', 'Contacto', '07 / Contacto', 'Proyectos / producción', 'contact.html']
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
  if (route.startsWith('projects/')) {
    const project = path.posix.basename(route, '.html');
    if (['ascii', 'cloud', 'realtime', 'signal'].includes(project)) return 'lab';
    return 'work';
  }
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
    .replace(/<link\b[^>]*data-menu-eight-card[^>]*>\s*/gi, '')
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

console.log('Structured 8-card index applied; research projects route to Lab and ASCII/GLSL cursor stays disabled on contact routes.');
