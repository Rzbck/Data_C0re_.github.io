import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, value) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (before !== value) fs.writeFileSync(file, value, 'utf8');
};

const SOURCE = 'projects/fjm-atlas.html';
const PROJECT_ID = 'fjm-atlas';
const PROJECT_FILE = 'fjm-atlas.html';
const ORIGIN = 'https://datac0re.is-a.dev';

const locale = {
  en: {
    home: 'Home', archive: 'Archive', contact: 'Contact', projects: 'Projects', experience: 'Experience', career: 'Career / tools', collaborations: 'Projects / collaborations',
    title: 'FJM Atlas / Interactive Map Prototype — Touch Kiosk & Offline Map System — DATA C0RE',
    description: 'Prototype proposal for Fondation Jan Michalski: a touch-first offline Electron application combining a high-resolution tiled map, location-based editorial content and kiosk-oriented interaction.',
    replacements: {}
  },
  fr: {
    home: 'Accueil', archive: 'Archives', contact: 'Contact', projects: 'Projets', experience: 'Expérience', career: 'Parcours / outils', collaborations: 'Projets / collaborations',
    title: 'FJM Atlas / Prototype de carte interactive — Interface tactile & système hors ligne — DATA C0RE',
    description: 'Prototype de proposition pour la Fondation Jan Michalski : application Electron tactile et hors ligne combinant carte haute définition tuilée, contenus éditoriaux liés aux lieux et logique de borne.',
    replacements: {
      'Prototype proposal / interactive map / 2026': 'Proposition / prototype / carte interactive / 2026',
      'FJM Atlas /<br>Interactive Map': 'FJM Atlas /<br>Carte interactive',
      'A touch-first map interface designed as a calm, robust mediation system: high-resolution cartography, location-based editorial content and kiosk behaviour are treated as one software object.': 'Une interface cartographique tactile pensée comme un dispositif de médiation calme et robuste : cartographie haute définition, contenus liés aux lieux et comportement de borne sont conçus comme un seul système logiciel.',
      '<b>Status</b> proposal / prototype in development': '<b>Statut</b> proposition / prototype en développement',
      '<b>Role</b> interaction design / software architecture / implementation': '<b>Rôle</b> design d’interaction / architecture logicielle / développement',
      '<b>System</b> Electron / TypeScript / OpenSeadragon / offline runtime': '<b>Système</b> Electron / TypeScript / OpenSeadragon / fonctionnement hors ligne',
      'Schematic of the FJM Atlas touch interface': 'Schéma de l’interface tactile FJM Atlas',
      'Portfolio schematic / interface architecture — not final client UI': 'Schéma portfolio / architecture d’interface — pas une interface client finale',
      '<p>Interaction</p>': '<p>Interaction</p>',
      'A map that behaves like an exhibition interface.': 'Une carte qui se comporte comme une interface d’exposition.',
      'The map remains the main object. Touch targets, zoom, pan, location selection and editorial panels are designed to preserve spatial context instead of turning the experience into a conventional website. Opening a location keeps the map state visible; after inactivity, the kiosk can return to a neutral invitation state.': 'La carte reste l’objet principal. Cibles tactiles, zoom, déplacement, sélection des lieux et cartels éditoriaux sont conçus pour conserver le contexte spatial plutôt que reproduire la logique d’un site web. L’ouverture d’un lieu préserve l’état de la carte ; après inactivité, la borne peut revenir à un état d’invitation neutre.',
      'System architecture': 'Architecture système',
      'Cartography, interaction<br>and content stay separate.': 'Cartographie, interaction<br>et contenus restent séparés.',
      '<span>map source</span>': '<span>carte source</span>',
      '<span>tile pyramid</span>': '<span>pyramide de tuiles</span>',
      '<span>touch viewer</span>': '<span>visionneuse tactile</span>',
      '<span>location state</span>': '<span>état du lieu</span>',
      '<span>editorial content</span>': '<span>contenus éditoriaux</span>',
      '<span>kiosk reset</span>': '<span>reset borne</span>',
      'The current prototype is an offline Electron application built around a high-resolution tiled map and structured location data. Cartography, interaction logic and editorial content are decoupled so the map, gestures and texts can evolve without rebuilding the whole interface.': 'Le prototype actuel est une application Electron hors ligne articulée autour d’une carte haute définition tuilée et de données structurées par lieu. Cartographie, logique d’interaction et contenus éditoriaux sont séparés afin de faire évoluer la carte, les gestes et les textes sans reconstruire l’ensemble de l’interface.',
      'Touch-first UX / high-resolution tiled media / offline kiosk logic / structured editorial pipeline / interaction tuning / performance testing': 'UX tactile / média HD tuilé / logique de borne hors ligne / pipeline éditorial structuré / réglage des interactions / tests de performance',
      '<p>Current state</p>': '<p>État actuel</p>',
      '<strong>Prototype</strong>, not a commissioned deployment.': '<strong>Prototype</strong>, pas un projet commandé.',
      'This page documents a proposal and software prototype currently in development. It does not represent a commissioned, installed or delivered project for Fondation Jan Michalski.': 'Cette page documente une proposition et un prototype logiciel en cours de développement. Elle ne présente pas un projet commandé, installé ou livré pour la Fondation Jan Michalski.',
      '<span>Previous</span>': '<span>Précédent</span>',
      '<span>Archive</span><b>All projects</b>': '<span>Archives</span><b>Tous les projets</b>'
    }
  },
  es: {
    home: 'Inicio', archive: 'Archivo', contact: 'Contacto', projects: 'Proyectos', experience: 'Experiencia', career: 'Trayectoria / herramientas', collaborations: 'Proyectos / colaboraciones',
    title: 'FJM Atlas / Prototipo de mapa interactivo — Interfaz táctil y sistema offline — DATA C0RE',
    description: 'Prototipo de propuesta para la Fondation Jan Michalski: aplicación Electron táctil y offline que combina cartografía HD por teselas, contenido editorial por lugar y lógica de quiosco.',
    replacements: {
      'Prototype proposal / interactive map / 2026': 'Propuesta / prototipo / mapa interactivo / 2026',
      'FJM Atlas /<br>Interactive Map': 'FJM Atlas /<br>Mapa interactivo',
      'A touch-first map interface designed as a calm, robust mediation system: high-resolution cartography, location-based editorial content and kiosk behaviour are treated as one software object.': 'Una interfaz cartográfica táctil concebida como un dispositivo de mediación tranquilo y robusto: cartografía de alta resolución, contenidos vinculados a lugares y comportamiento de quiosco forman un único sistema de software.',
      '<b>Status</b> proposal / prototype in development': '<b>Estado</b> propuesta / prototipo en desarrollo',
      '<b>Role</b> interaction design / software architecture / implementation': '<b>Rol</b> diseño de interacción / arquitectura de software / desarrollo',
      '<b>System</b> Electron / TypeScript / OpenSeadragon / offline runtime': '<b>Sistema</b> Electron / TypeScript / OpenSeadragon / funcionamiento offline',
      'Schematic of the FJM Atlas touch interface': 'Esquema de la interfaz táctil FJM Atlas',
      'Portfolio schematic / interface architecture — not final client UI': 'Esquema de portfolio / arquitectura de interfaz — no es la interfaz final del cliente',
      '<p>Interaction</p>': '<p>Interacción</p>',
      'A map that behaves like an exhibition interface.': 'Un mapa que se comporta como una interfaz de exposición.',
      'The map remains the main object. Touch targets, zoom, pan, location selection and editorial panels are designed to preserve spatial context instead of turning the experience into a conventional website. Opening a location keeps the map state visible; after inactivity, the kiosk can return to a neutral invitation state.': 'El mapa sigue siendo el objeto principal. Los objetivos táctiles, zoom, desplazamiento, selección de lugares y paneles editoriales están diseñados para conservar el contexto espacial en lugar de convertir la experiencia en un sitio web convencional. Al abrir un lugar se conserva el estado del mapa; tras un periodo de inactividad, el quiosco puede volver a un estado de invitación neutro.',
      'System architecture': 'Arquitectura del sistema',
      'Cartography, interaction<br>and content stay separate.': 'Cartografía, interacción<br>y contenidos permanecen separados.',
      '<span>map source</span>': '<span>mapa fuente</span>',
      '<span>tile pyramid</span>': '<span>pirámide de teselas</span>',
      '<span>touch viewer</span>': '<span>visor táctil</span>',
      '<span>location state</span>': '<span>estado del lugar</span>',
      '<span>editorial content</span>': '<span>contenido editorial</span>',
      '<span>kiosk reset</span>': '<span>reset del quiosco</span>',
      'The current prototype is an offline Electron application built around a high-resolution tiled map and structured location data. Cartography, interaction logic and editorial content are decoupled so the map, gestures and texts can evolve without rebuilding the whole interface.': 'El prototipo actual es una aplicación Electron offline construida alrededor de un mapa de alta resolución por teselas y datos estructurados por lugar. La cartografía, la lógica de interacción y los contenidos editoriales están desacoplados para que el mapa, los gestos y los textos evolucionen sin reconstruir toda la interfaz.',
      'Touch-first UX / high-resolution tiled media / offline kiosk logic / structured editorial pipeline / interaction tuning / performance testing': 'UX táctil / medios HD por teselas / lógica de quiosco offline / pipeline editorial estructurado / ajuste de interacción / pruebas de rendimiento',
      '<p>Current state</p>': '<p>Estado actual</p>',
      '<strong>Prototype</strong>, not a commissioned deployment.': '<strong>Prototipo</strong>, no un despliegue encargado.',
      'This page documents a proposal and software prototype currently in development. It does not represent a commissioned, installed or delivered project for Fondation Jan Michalski.': 'Esta página documenta una propuesta y un prototipo de software actualmente en desarrollo. No representa un proyecto encargado, instalado ni entregado para la Fondation Jan Michalski.',
      '<span>Previous</span>': '<span>Anterior</span>',
      '<span>Archive</span><b>All projects</b>': '<span>Archivo</span><b>Todos los proyectos</b>'
    }
  }
};

function replaceAllLiteral(value, from, to) {
  return value.split(from).join(to);
}

function setMeta(html, selector, value) {
  if (selector === 'title') return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);
  if (selector === 'description') return html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${value}">`);
  if (selector === 'og:title') return html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${value}">`);
  if (selector === 'og:description') return html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${value}">`);
  return html;
}

function localizedProject(lang) {
  let html = read(SOURCE);
  const d = locale[lang];
  html = html.replace('<html lang="en">', `<html lang="${lang}">`);
  html = html.replace('<head>', `<head><script data-static-lang="">try{localStorage.setItem('data-c0re-lang-v1','${lang}')}catch{}</script>`);
  html = html.replace('<base href="../">', '<base href="../../">');
  html = setMeta(html, 'title', d.title);
  html = setMeta(html, 'description', d.description);
  html = setMeta(html, 'og:title', d.title);
  html = setMeta(html, 'og:description', d.description);
  html = html.replace(`href="${ORIGIN}/projects/${PROJECT_FILE}"`, `href="${ORIGIN}/${lang}/projects/${PROJECT_FILE}"`);
  html = html.replace(`content="${ORIGIN}/projects/${PROJECT_FILE}"`, `content="${ORIGIN}/${lang}/projects/${PROJECT_FILE}"`);

  html = html.replace('<a class="brand" href="index.html">', `<a class="brand" href="${lang}/">`);
  html = html.replace('<a class="nav-text nav-primary nav-primary--home" href="" data-v2-primary="home">Home</a>', `<a class="nav-text nav-primary nav-primary--home" href="${lang}/" data-v2-primary="home">${d.home}</a>`);
  html = html.replace('<a class="nav-text nav-primary nav-primary--archive" href="archive.html" data-v2-primary="archive">Archive</a>', `<a class="nav-text nav-primary nav-primary--archive" href="${lang}/archive.html" data-v2-primary="archive">${d.archive}</a>`);
  html = html.replace('<a class="nav-text nav-primary nav-primary--cv" href="cv.html" data-v2-primary="cv">CV</a>', `<a class="nav-text nav-primary nav-primary--cv" href="${lang}/cv.html" data-v2-primary="cv">CV</a>`);
  html = html.replace('<a class="nav-text nav-primary nav-primary--contact" href="contact.html" data-v2-primary="contact">Contact</a>', `<a class="nav-text nav-primary nav-primary--contact" href="${lang}/contact.html" data-v2-primary="contact">${d.contact}</a>`);
  html = html.replace(/(<a href="en\/projects\/fjm-atlas\.html" data-lang="en") aria-current="page"/, '$1');
  html = html.replace(new RegExp(`(<a href="${lang}/projects/fjm-atlas\\.html" data-lang="${lang}")`), '$1 aria-current="page"');

  html = html.replace('<b>01 / Projects</b><small>Work / R&amp;D / studies</small>', `<b>01 / ${d.projects}</b><small>${lang === 'en' ? 'Work / R&amp;D / studies' : lang === 'fr' ? 'Réalisé / R&amp;D / études' : 'Trabajo / I+D / estudios'}</small>`);
  html = html.replace('<span class="menu-card-title">Archive</span>', `<span class="menu-card-title">${d.archive}</span>`);
  html = html.replace('<b>02 / Experience</b><small>Career / tools</small>', `<b>02 / ${d.experience}</b><small>${d.career}</small>`);
  html = html.replace('<b>03 / Contact</b><small>Projects / collaborations</small>', `<b>03 / ${d.contact}</b><small>${d.collaborations}</small>`);
  html = html.replace('href="archive.html" aria-label="Archive"', `href="${lang}/archive.html" aria-label="${d.archive}"`);
  html = html.replace('href="cv.html" aria-label="CV"', `href="${lang}/cv.html" aria-label="CV"`);
  html = html.replace('href="contact.html" aria-label="Contact"', `href="${lang}/contact.html" aria-label="${d.contact}"`);
  html = html.replace('href="projects/last-low-bandwidth-message.html"', `href="${lang}/projects/last-low-bandwidth-message.html"`);
  html = html.replace('href="archive.html"><span>Archive</span>', `href="${lang}/archive.html"><span>${d.archive}</span>`);

  for (const [from, to] of Object.entries(d.replacements)) html = replaceAllLiteral(html, from, to);
  return html;
}

for (const lang of ['en', 'fr', 'es']) write(`${lang}/projects/${PROJECT_FILE}`, localizedProject(lang));

const archiveLocales = {
  root: { file: 'archive.html', prefix: '', countWord: 'projects', label: 'PROTOTYPE', title: 'FJM Atlas / Interactive Map Prototype', teaser: 'proposal / touch-first map / offline kiosk / editorial system', groups: { context: ['Context','Prototype'], discipline: ['Discipline','Interactive map'], tool: ['Tool'], system: ['System','Kiosk','Offline-first'] } },
  en: { file: 'en/archive.html', prefix: 'en/', countWord: 'projects', label: 'PROTOTYPE', title: 'FJM Atlas / Interactive Map Prototype', teaser: 'proposal / touch-first map / offline kiosk / editorial system', groups: { context: ['Context','Prototype'], discipline: ['Discipline','Interactive map'], tool: ['Tool'], system: ['System','Kiosk','Offline-first'] } },
  fr: { file: 'fr/archive.html', prefix: 'fr/', countWord: 'projets', label: 'PROTOTYPE', title: 'FJM Atlas / Prototype de carte interactive', teaser: 'proposition / carte tactile / borne hors ligne / système éditorial', groups: { context: ['Contexte','Prototype'], discipline: ['Discipline','Carte interactive'], tool: ['Outil'], system: ['Système','Borne','Hors ligne'] } },
  es: { file: 'es/archive.html', prefix: 'es/', countWord: 'proyectos', label: 'PROTOTIPO', title: 'FJM Atlas / Prototipo de mapa interactivo', teaser: 'propuesta / mapa táctil / quiosco offline / sistema editorial', groups: { context: ['Contexto','Prototipo'], discipline: ['Disciplina','Mapa interactivo'], tool: ['Herramienta'], system: ['Sistema','Quiosco','Offline-first'] } }
};

const esc = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function addOptionToGroup(html, label, value, text) {
  if (html.includes(`data-archive-tag-filter`) && html.includes(`<option value="${value}">${text}</option>`)) return html;
  const re = new RegExp(`(<optgroup label="${esc(label)}">)([\\s\\S]*?)(</optgroup>)`);
  return html.replace(re, (_all, open, body, close) => {
    if (body.includes(`value="${value}"`)) return `${open}${body}${close}`;
    return `${open}${body}<option value="${value}">${text}</option>${close}`;
  });
}

function patchArchive(key, cfg) {
  let html = read(cfg.file);
  if (!html.includes(`data-archive-project="${PROJECT_ID}"`)) {
    const snakeIndex = html.indexOf('data-archive-project="snake"');
    if (snakeIndex < 0) throw new Error(`Could not find Snake marker in ${cfg.file}`);
    const blockStart = html.lastIndexOf('<div class="archive-year reveal">', snakeIndex);
    if (blockStart < 0) throw new Error(`Could not find 2026 archive block in ${cfg.file}`);
    const block = `<div class="archive-year reveal"><div class="archive-year-head"><time>2026</time></div><div class="archive-list"><a class="archive-entry" href="${cfg.prefix}projects/${PROJECT_FILE}" data-archive-project="${PROJECT_ID}" data-archive-status="research" data-archive-type="software interactive" data-archive-years="2026" data-archive-tags="research prototype interactive interactive-map electron typescript openseadragon software kiosk offline-first" data-archive-media-auto="true" data-archive-image="assets/media/fjm-atlas/interface-schematic.svg" data-archive-images="[&quot;assets/media/fjm-atlas/interface-schematic.svg&quot;]" data-archive-media-kind="image"><span class="archive-entry-media" aria-hidden="true"><img src="assets/media/fjm-atlas/interface-schematic.svg" alt="" loading="lazy" decoding="async" fetchpriority="low"></span><span class="archive-status status-research">${cfg.label}</span><div><strong>${cfg.title}</strong><small>${cfg.teaser}</small></div><time>2026</time></a></div></div>`;
    html = html.slice(0, blockStart) + block + html.slice(blockStart);
    const countRe = new RegExp(`(<span class="archive-count"[^>]*>)(\\d+)(\\s+${esc(cfg.countWord)})(</span>)`);
    html = html.replace(countRe, (_m, a, n, c, d) => `${a}${Number(n) + 1}${c}${d}`);
  }

  const contextLabel = cfg.groups.context[0];
  const disciplineLabel = cfg.groups.discipline[0];
  const toolLabel = cfg.groups.tool[0];
  const systemLabel = cfg.groups.system[0];
  html = addOptionToGroup(html, contextLabel, 'prototype', cfg.groups.context[1]);
  html = addOptionToGroup(html, disciplineLabel, 'interactive-map', cfg.groups.discipline[1]);
  html = addOptionToGroup(html, toolLabel, 'electron', 'Electron');
  html = addOptionToGroup(html, toolLabel, 'typescript', 'TypeScript');
  html = addOptionToGroup(html, toolLabel, 'openseadragon', 'OpenSeadragon');
  html = addOptionToGroup(html, systemLabel, 'kiosk', cfg.groups.system[1]);
  html = addOptionToGroup(html, systemLabel, 'offline-first', cfg.groups.system[2]);
  write(cfg.file, html);
}

for (const [key, cfg] of Object.entries(archiveLocales)) patchArchive(key, cfg);

console.log('FJM Atlas DEV integration complete.');
