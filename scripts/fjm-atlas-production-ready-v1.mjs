import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, value) => {
  const file = path.join(ROOT, rel);
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (before !== value) fs.writeFileSync(file, value, 'utf8');
};

const PROJECT_ID = 'fjm-atlas';
const OVERVIEW = 'assets/media/fjm-atlas/real/02-map-overview.png';
const CARTEL = 'assets/media/fjm-atlas/real/04-editorial-cartel.png';
const SELECTED = 'assets/media/fjm-atlas/real/05-selected-location-map.png';
const TAGS = [
  'montricher', 'switzerland',
  'installation', 'exhibition', 'museum',
  'interactive', 'interactive-map',
  'electron', 'typescript', 'openseadragon',
  'software', 'kiosk', 'offline-first'
];

const archiveLocales = {
  root: {
    file: 'archive.html',
    locationGroup: 'Location', contextGroup: 'Context',
    exhibition: 'Exhibition', museum: 'Museum',
    label: 'INSTALLATION',
    title: 'FJM Atlas / Interactive Map',
    teaser: 'Montricher, Switzerland / Fondation Jan Michalski / interactive literary atlas / offline museum kiosk'
  },
  en: {
    file: 'en/archive.html',
    locationGroup: 'Location', contextGroup: 'Context',
    exhibition: 'Exhibition', museum: 'Museum',
    label: 'INSTALLATION',
    title: 'FJM Atlas / Interactive Map',
    teaser: 'Montricher, Switzerland / Fondation Jan Michalski / interactive literary atlas / offline museum kiosk'
  },
  fr: {
    file: 'fr/archive.html',
    locationGroup: 'Lieu', contextGroup: 'Contexte',
    exhibition: 'Exposition', museum: 'Musée',
    label: 'INSTALLATION',
    title: 'FJM Atlas / Carte interactive',
    teaser: 'Montricher, Suisse / Fondation Jan Michalski / atlas littéraire tactile / borne muséale hors ligne'
  },
  es: {
    file: 'es/archive.html',
    locationGroup: 'Lugar', contextGroup: 'Contexto',
    exhibition: 'Exposición', museum: 'Museo',
    label: 'INSTALACIÓN',
    title: 'FJM Atlas / Mapa interactivo',
    teaser: 'Montricher, Suiza / Fondation Jan Michalski / atlas literario táctil / quiosco museístico offline'
  }
};

const pageLocales = {
  'projects/fjm-atlas.html': {
    description: 'Commissioned interactive literary atlas for Fondation Jan Michalski in Montricher, Switzerland: an offline touch installation connecting a high-resolution world map, literary locations, editorial cartels and exhibition-kiosk behaviour.',
    status: '<span><b>Status</b> commissioned / installed / operational</span>',
    heroCaption: 'Interface / map overview',
    invitationCaption: 'Idle invitation state / touch-first entry point'
  },
  'en/projects/fjm-atlas.html': {
    description: 'Commissioned interactive literary atlas for Fondation Jan Michalski in Montricher, Switzerland: an offline touch installation connecting a high-resolution world map, literary locations, editorial cartels and exhibition-kiosk behaviour.',
    status: '<span><b>Status</b> commissioned / installed / operational</span>',
    heroCaption: 'Interface / map overview',
    invitationCaption: 'Idle invitation state / touch-first entry point'
  },
  'fr/projects/fjm-atlas.html': {
    description: 'Atlas littéraire interactif commandé pour la Fondation Jan Michalski à Montricher, Suisse : installation tactile hors ligne reliant carte haute définition, lieux littéraires, cartels éditoriaux et logique de borne d’exposition.',
    status: '<span><b>Statut</b> projet commandé / installé / opérationnel</span>',
    heroCaption: 'Interface / vue générale de la carte',
    invitationCaption: 'État d’invitation / entrée tactile'
  },
  'es/projects/fjm-atlas.html': {
    description: 'Atlas literario interactivo encargado para la Fondation Jan Michalski en Montricher, Suiza: instalación táctil offline que conecta mapa de alta resolución, lugares literarios, carteles editoriales y lógica de quiosco de exposición.',
    status: '<span><b>Estado</b> proyecto encargado / instalado / operativo</span>',
    heroCaption: 'Interfaz / vista general del mapa',
    invitationCaption: 'Estado de invitación / entrada táctil'
  }
};

const esc = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function addOptionToGroup(html, label, value, text) {
  if (html.includes(`<option value="${value}">${text}</option>`)) return html;
  const re = new RegExp(`(<optgroup label="${esc(label)}">)([\\s\\S]*?)(</optgroup>)`);
  return html.replace(re, (_m, open, body, close) => `${open}${body}<option value="${value}">${text}</option>${close}`);
}

function removeOption(html, value) {
  return html.replace(new RegExp(`<option value="${esc(value)}">[^<]*</option>`, 'g'), '');
}

function patchArchive(cfg) {
  let html = read(cfg.file);
  const entryRe = new RegExp(`<a class="archive-entry"[^>]*data-archive-project="${PROJECT_ID}"[\\s\\S]*?</a>`);
  const match = html.match(entryRe);
  if (!match) throw new Error(`FJM Atlas archive entry not found in ${cfg.file}`);

  let entry = match[0];
  entry = entry
    .replace(/data-archive-status="[^"]*"/, 'data-archive-status="realized"')
    .replace(/data-archive-type="[^"]*"/, 'data-archive-type="installation software"')
    .replace(/data-archive-tags="[^"]*"/, `data-archive-tags="${TAGS.join(' ')}"`)
    .replace(/data-archive-image="[^"]*"/, `data-archive-image="${OVERVIEW}"`)
    .replace(/data-archive-images="[^"]*"/, `data-archive-images="[&quot;${OVERVIEW}&quot;,&quot;${CARTEL}&quot;,&quot;${SELECTED}&quot;]"`)
    .replace(/data-archive-media-kind="[^"]*"/, 'data-archive-media-kind="image"')
    .replace(/<span class="archive-status status-[^"]*">[\s\S]*?<\/span>/, `<span class="archive-status status-realized">${cfg.label}</span>`)
    .replace(/<strong>[\s\S]*?<\/strong>/, `<strong>${cfg.title}</strong>`)
    .replace(/<small>[\s\S]*?<\/small>/, `<small>${cfg.teaser}</small>`);

  const imgRe = /<span class="archive-entry-media" aria-hidden="true"><img[^>]*><\/span>/;
  entry = entry.replace(imgRe, `<span class="archive-entry-media" aria-hidden="true"><img src="${OVERVIEW}" alt="" loading="lazy" decoding="async" fetchpriority="low"></span>`);

  html = html.replace(entryRe, entry);
  html = addOptionToGroup(html, cfg.locationGroup, 'montricher', 'Montricher');
  html = addOptionToGroup(html, cfg.contextGroup, 'exhibition', cfg.exhibition);
  html = addOptionToGroup(html, cfg.contextGroup, 'museum', cfg.museum);
  html = removeOption(html, 'prototype');
  write(cfg.file, html);
}

function setMetaDescription(html, description) {
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`);
  return html;
}

function patchProject(rel, cfg) {
  let html = read(rel);
  html = setMetaDescription(html, cfg.description);
  html = html.replace(/<span><b>(?:Status|Statut|Estado)<\/b>[\s\S]*?<\/span>/, cfg.status);
  html = html.replace(/<figcaption>(?:Current interface \/ map overview — development capture|Interface actuelle \/ vue générale de la carte — capture de développement|Interfaz actual \/ vista general del mapa — captura de desarrollo)<\/figcaption>/, `<figcaption>${cfg.heroCaption}</figcaption>`);
  html = html.replace(/<figcaption>(?:Idle invitation state \/ touch-first entry point — development interface|État d’invitation \/ entrée tactile — interface de développement|Estado de invitación \/ entrada táctil — interfaz de desarrollo)<\/figcaption>/, `<figcaption>${cfg.invitationCaption}</figcaption>`);
  write(rel, html);
}

function patchTaxonomy() {
  const rel = 'data/project-taxonomy.json';
  const data = JSON.parse(read(rel));
  data.version = Math.max(Number(data.version) || 0, 6);
  data.tags.montricher = { category: 'location', en: 'Montricher', fr: 'Montricher', es: 'Montricher' };
  data.tags.exhibition = { category: 'context', en: 'Exhibition', fr: 'Exposition', es: 'Exposición' };
  data.tags.museum = { category: 'context', en: 'Museum', fr: 'Musée', es: 'Museo' };
  data.projects[PROJECT_ID] = TAGS;
  write(rel, `${JSON.stringify(data, null, 2)}\n`);
}

patchTaxonomy();
for (const cfg of Object.values(archiveLocales)) patchArchive(cfg);
for (const [rel, cfg] of Object.entries(pageLocales)) patchProject(rel, cfg);

console.log('FJM Atlas production-ready archive metadata applied.');
