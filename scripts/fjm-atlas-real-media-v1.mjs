import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROJECTS = [
  ['projects/fjm-atlas.html', 'en'],
  ['en/projects/fjm-atlas.html', 'en'],
  ['fr/projects/fjm-atlas.html', 'fr'],
  ['es/projects/fjm-atlas.html', 'es'],
];
const ARCHIVES = ['archive.html', 'en/archive.html', 'fr/archive.html', 'es/archive.html'];
const OVERVIEW = 'assets/media/fjm-atlas/real/02-map-overview.png';
const CARTEL = 'assets/media/fjm-atlas/real/04-editorial-cartel.png';
const SELECTED = 'assets/media/fjm-atlas/real/05-selected-location-map.png';
const SCHEMATIC = 'assets/media/fjm-atlas/interface-schematic.svg';
const OG = `https://datac0re.is-a.dev/${OVERVIEW}`;

const copy = {
  en: {
    heroAlt: 'FJM Atlas interactive map overview',
    heroCaption: 'Current interface / map overview — development capture',
    interaction: 'Interaction',
    galleryKicker: 'Interface',
    galleryTitle: 'From world map to editorial reading.',
    galleryText: 'A location selection keeps the map in view while opening its editorial material. The interface is designed so exploration can move between geography, text and related places without breaking the visitor’s spatial context.',
    cartelAlt: 'FJM Atlas editorial cartel open over the interactive map',
    cartelCaption: 'Location selected / editorial cartel',
    selectedAlt: 'FJM Atlas selected location with map context preserved',
    selectedCaption: 'Selected location / map context preserved',
    schematicAlt: 'FJM Atlas interface architecture schematic',
    schematicCaption: 'System synthesis / interface architecture',
  },
  fr: {
    heroAlt: 'Vue générale de la carte interactive FJM Atlas',
    heroCaption: 'Interface actuelle / vue générale de la carte — capture de développement',
    interaction: 'Interaction',
    galleryKicker: 'Interface',
    galleryTitle: 'De la carte-monde à la lecture éditoriale.',
    galleryText: 'La sélection d’un lieu conserve la carte visible tout en ouvrant son contenu éditorial. L’interface permet de passer de la géographie au texte puis aux lieux associés sans rompre le contexte spatial du visiteur.',
    cartelAlt: 'Cartel éditorial FJM Atlas ouvert sur la carte interactive',
    cartelCaption: 'Lieu sélectionné / cartel éditorial',
    selectedAlt: 'Lieu sélectionné dans FJM Atlas avec contexte cartographique conservé',
    selectedCaption: 'Lieu sélectionné / contexte cartographique conservé',
    schematicAlt: 'Schéma de l’architecture d’interface FJM Atlas',
    schematicCaption: 'Schéma de synthèse / architecture d’interface',
  },
  es: {
    heroAlt: 'Vista general del mapa interactivo FJM Atlas',
    heroCaption: 'Interfaz actual / vista general del mapa — captura de desarrollo',
    interaction: 'Interacción',
    galleryKicker: 'Interfaz',
    galleryTitle: 'Del mapa-mundo a la lectura editorial.',
    galleryText: 'La selección de un lugar mantiene visible el mapa mientras abre su contenido editorial. La interfaz permite pasar de la geografía al texto y a los lugares relacionados sin romper el contexto espacial del visitante.',
    cartelAlt: 'Cartel editorial de FJM Atlas abierto sobre el mapa interactivo',
    cartelCaption: 'Lugar seleccionado / cartel editorial',
    selectedAlt: 'Lugar seleccionado en FJM Atlas con el contexto cartográfico conservado',
    selectedCaption: 'Lugar seleccionado / contexto cartográfico conservado',
    schematicAlt: 'Esquema de arquitectura de la interfaz FJM Atlas',
    schematicCaption: 'Síntesis del sistema / arquitectura de interfaz',
  },
};

const style = `<style data-fjm-real-media-v1="">
.fjm-atlas-page .project-hero-media img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.fjm-atlas-page .fjm-real-gallery{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(12px,1.5vw,24px);margin-top:clamp(34px,4vw,58px)}.fjm-atlas-page .fjm-real-shot{margin:0;border:1px solid var(--line);background:#070707;overflow:hidden}.fjm-atlas-page .fjm-real-shot img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}.fjm-atlas-page .fjm-real-shot figcaption,.fjm-atlas-page .fjm-system-schematic figcaption{padding:10px 2px 0;color:var(--grey);font-size:9px;line-height:1.5;letter-spacing:.07em;text-transform:uppercase}.fjm-atlas-page .fjm-system-schematic{margin:clamp(34px,4vw,64px) 0 0;padding-top:clamp(24px,3vw,42px);border-top:1px solid var(--line)}.fjm-atlas-page .fjm-system-schematic img{display:block;width:100%;height:auto;border:1px solid var(--line)}@media(max-width:760px){.fjm-atlas-page .fjm-real-gallery{grid-template-columns:1fr}}
</style>`;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, value) { fs.writeFileSync(path.join(ROOT, rel), value, 'utf8'); }

function patchProject(rel, lang) {
  const c = copy[lang];
  let html = read(rel);

  html = html.replace(/<style data-fjm-real-media-v1="">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', `${style}</head>`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${OG}">`);

  const hero = `<figure class="project-hero-media reveal" data-fjm-real-hero=""><img src="${OVERVIEW}" alt="${c.heroAlt}" loading="eager"><figcaption>${c.heroCaption}</figcaption></figure>`;
  html = html.replace(/<figure class="project-hero-media reveal"(?: data-fjm-real-hero="")?>[\s\S]*?<\/figure>/, hero);

  html = html.replace(/<section class="project-section fjm-real-interface-v1"[\s\S]*?<\/section>/g, '');
  const interactionMarker = `<section class="project-section project-section--split"><div class="section-kicker reveal"><span>03</span><p>${c.interaction}</p>`;
  const interactionMarkerV4 = `<section class="project-section project-section--split"><div class="section-kicker reveal"><span>04</span><p>${c.interaction}</p>`;
  const gallery = `<section class="project-section fjm-real-interface-v1" data-fjm-real-media-v1=""><div class="fjm-brief-grid"><div class="section-kicker reveal"><span>03</span><p>${c.galleryKicker}</p></div><div><div class="prose-large reveal"><h2>${c.galleryTitle}</h2><p>${c.galleryText}</p></div><div class="fjm-real-gallery"><figure class="fjm-real-shot reveal"><img src="${CARTEL}" alt="${c.cartelAlt}" loading="lazy"><figcaption>${c.cartelCaption}</figcaption></figure><figure class="fjm-real-shot reveal"><img src="${SELECTED}" alt="${c.selectedAlt}" loading="lazy"><figcaption>${c.selectedCaption}</figcaption></figure></div></div></div></section>`;
  if (html.includes(interactionMarker)) html = html.replace(interactionMarker, `${gallery}${interactionMarkerV4}`);
  else if (html.includes(interactionMarkerV4)) html = html.replace(interactionMarkerV4, `${gallery}${interactionMarkerV4}`);
  else throw new Error(`Interaction marker not found in ${rel}`);

  html = html.replace(/<figure class="fjm-system-schematic reveal"[\s\S]*?<\/figure>/g, '');
  const statusMarker = '</section><section class="project-section project-section--split fjm-status">';
  const schematic = `<figure class="fjm-system-schematic reveal" data-fjm-system-schematic=""><img src="${SCHEMATIC}" alt="${c.schematicAlt}" loading="lazy"><figcaption>${c.schematicCaption}</figcaption></figure>`;
  const idx = html.lastIndexOf(statusMarker);
  if (idx < 0) throw new Error(`Status marker not found in ${rel}`);
  html = `${html.slice(0, idx)}${schematic}${statusMarker}${html.slice(idx + statusMarker.length)}`;

  write(rel, html);
}

for (const [rel, lang] of PROJECTS) patchProject(rel, lang);

for (const rel of ARCHIVES) {
  let html = read(rel);
  html = html.replaceAll(SCHEMATIC, OVERVIEW);
  write(rel, html);
}

console.log('FJM Atlas real interface media applied to DEV pages and archives.');
