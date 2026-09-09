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
const OLD_SCHEMATIC = 'assets/media/fjm-atlas/interface-schematic.svg';
const OG = `https://datac0re.is-a.dev/${OVERVIEW}`;

const copy = {
  en: {
    heroAlt: 'FJM Atlas interactive map overview',
    heroCaption: 'Current interface / map overview — development capture',
    contextKicker: 'Context + brief',
    contextTitle: 'Make a “world-novel” explorable without reducing it to a conventional map.',
    contextText: 'The exhibition investigates Jean Potocki’s The Manuscript Found in Saragossa and the circulation of its nested stories across places and periods. The device must let visitors explore those locations, understand their links to stories and characters, and move between them without losing either reading continuity or the documentary nature of the exhibition.',
    responseKicker: 'Response + system',
    responseTitle: 'A museum interface built around the map, not around menus.',
    responseText: 'I designed and developed the atlas as a dedicated offline kiosk application. The high-resolution tiled map remains the main object; touch navigation, location selection, editorial reading, related places and idle behaviour form one continuous system. Cartography, interaction logic and editorial content remain separated so the map, gestures and texts can evolve independently.',
    flow: ['high-resolution map','touch navigation','interactive locations','editorial cartels','related places','offline kiosk'],
    tech: 'Electron / TypeScript / OpenSeadragon / tiled-map pipeline / pan + pinch + double-tap / structured editorial content / attract mode / inactivity reset / kiosk packaging / telemetry + remote maintenance',
    galleryKicker: 'Interface',
    galleryTitle: 'From world map to editorial reading.',
    galleryText: 'A location selection keeps the map in view while opening its editorial material. The interface is designed so exploration can move between geography, text and related places without breaking the visitor’s spatial context.',
    cartelAlt: 'FJM Atlas editorial cartel open over the interactive map',
    cartelCaption: 'Location selected / editorial cartel',
    selectedAlt: 'FJM Atlas selected location with map context preserved',
    selectedCaption: 'Selected location / map context preserved',
  },
  fr: {
    heroAlt: 'Vue générale de la carte interactive FJM Atlas',
    heroCaption: 'Interface actuelle / vue générale de la carte — capture de développement',
    contextKicker: 'Contexte + demande',
    contextTitle: 'Rendre un « roman-monde » explorable sans le réduire à une carte classique.',
    contextText: 'L’exposition met en scène l’enquête littéraire autour du Manuscrit trouvé à Saragosse de Jean Potocki et la circulation de ses récits enchâssés à travers les lieux et les époques. Le dispositif doit permettre aux visiteurs d’explorer ces lieux, de comprendre leurs liens avec les histoires et les personnages, et de passer de l’un à l’autre sans perdre la continuité de lecture ni le caractère documentaire de l’exposition.',
    responseKicker: 'Ma réponse + système',
    responseTitle: 'Une interface muséale construite autour de la carte, pas autour de menus.',
    responseText: 'J’ai conçu et développé l’atlas comme une application de borne dédiée et hors ligne. La carte haute définition tuilée reste l’objet principal ; navigation tactile, sélection des lieux, lecture éditoriale, lieux associés et comportement d’inactivité forment un seul système continu. Cartographie, logique d’interaction et contenus éditoriaux restent séparés pour faire évoluer indépendamment la carte, les gestes et les textes.',
    flow: ['carte haute définition','navigation tactile','lieux interactifs','cartels éditoriaux','autres lieux','borne hors ligne'],
    tech: 'Electron / TypeScript / OpenSeadragon / pipeline de carte tuilée / pan + pinch + double-tap / contenus éditoriaux structurés / mode attract / reset d’inactivité / packaging borne / télémétrie + maintenance distante',
    galleryKicker: 'Interface',
    galleryTitle: 'De la carte-monde à la lecture éditoriale.',
    galleryText: 'La sélection d’un lieu conserve la carte visible tout en ouvrant son contenu éditorial. L’interface permet de passer de la géographie au texte puis aux lieux associés sans rompre le contexte spatial du visiteur.',
    cartelAlt: 'Cartel éditorial FJM Atlas ouvert sur la carte interactive',
    cartelCaption: 'Lieu sélectionné / cartel éditorial',
    selectedAlt: 'Lieu sélectionné dans FJM Atlas avec contexte cartographique conservé',
    selectedCaption: 'Lieu sélectionné / contexte cartographique conservé',
  },
  es: {
    heroAlt: 'Vista general del mapa interactivo FJM Atlas',
    heroCaption: 'Interfaz actual / vista general del mapa — captura de desarrollo',
    contextKicker: 'Contexto + encargo',
    contextTitle: 'Hacer explorable una «novela-mundo» sin reducirla a un mapa convencional.',
    contextText: 'La exposición investiga El manuscrito encontrado en Zaragoza de Jean Potocki y la circulación de sus relatos encajados a través de lugares y épocas. El dispositivo debe permitir explorar esos lugares, comprender sus vínculos con historias y personajes y pasar de uno a otro sin perder la continuidad de lectura ni el carácter documental de la exposición.',
    responseKicker: 'Mi respuesta + sistema',
    responseTitle: 'Una interfaz museística construida alrededor del mapa, no de menús.',
    responseText: 'Diseñé y desarrollé el atlas como una aplicación de quiosco dedicada y offline. El mapa de alta resolución por teselas sigue siendo el objeto principal; navegación táctil, selección de lugares, lectura editorial, lugares relacionados y comportamiento de inactividad forman un único sistema continuo. Cartografía, lógica de interacción y contenidos editoriales permanecen separados para poder evolucionar de forma independiente.',
    flow: ['mapa de alta resolución','navegación táctil','lugares interactivos','carteles editoriales','lugares relacionados','quiosco offline'],
    tech: 'Electron / TypeScript / OpenSeadragon / pipeline de mapa por teselas / pan + pinch + double-tap / contenidos editoriales estructurados / modo attract / reset por inactividad / packaging de quiosco / telemetría + mantenimiento remoto',
    galleryKicker: 'Interfaz',
    galleryTitle: 'Del mapa-mundo a la lectura editorial.',
    galleryText: 'La selección de un lugar mantiene visible el mapa mientras abre su contenido editorial. La interfaz permite pasar de la geografía al texto y a los lugares relacionados sin romper el contexto espacial del visitante.',
    cartelAlt: 'Cartel editorial de FJM Atlas abierto sobre el mapa interactivo',
    cartelCaption: 'Lugar seleccionado / cartel editorial',
    selectedAlt: 'Lugar seleccionado en FJM Atlas con el contexto cartográfico conservado',
    selectedCaption: 'Lugar seleccionado / contexto cartográfico conservado',
  },
};

const style = `<style data-fjm-real-media-v3="">
.fjm-atlas-page .project-hero-media img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.fjm-atlas-page .fjm-compact-section{padding-top:clamp(54px,5.6vw,92px);padding-bottom:clamp(54px,5.6vw,92px)}
.fjm-atlas-page .fjm-compact-grid{display:grid;grid-template-columns:minmax(0,.44fr) minmax(0,1.56fr);gap:clamp(34px,5vw,84px);align-items:start}
.fjm-atlas-page .fjm-compact-grid .section-kicker{padding-top:7px}
.fjm-atlas-page .fjm-compact-copy h2{margin:0 0 24px;font-size:clamp(40px,4.8vw,78px);line-height:.92;letter-spacing:-.055em;max-width:1080px}
.fjm-atlas-page .fjm-compact-copy p{margin:0;max-width:980px;color:#b9b7b1;font-size:clamp(16px,1.2vw,20px);line-height:1.5}
.fjm-atlas-page .fjm-compact-flow{margin-top:clamp(28px,3vw,46px)}
.fjm-atlas-page .fjm-compact-tech{margin:clamp(24px,2.6vw,40px) 0 0;padding-top:13px;border-top:1px solid var(--line);color:var(--grey);font-size:10px;line-height:1.6;letter-spacing:.07em;text-transform:uppercase}
.fjm-atlas-page .fjm-interface-head{margin-bottom:clamp(34px,4vw,62px)}
.fjm-atlas-page .fjm-interface-head>.section-kicker{margin-bottom:clamp(22px,2.4vw,38px)}
.fjm-atlas-page .fjm-interface-copy{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(320px,.82fr);gap:clamp(34px,5vw,90px);align-items:end}
.fjm-atlas-page .fjm-interface-copy h2{margin:0;font-size:clamp(44px,5vw,84px);line-height:.92;letter-spacing:-.055em;max-width:980px}
.fjm-atlas-page .fjm-interface-copy p{margin:0;max-width:720px;justify-self:end;color:#b9b7b1;font-size:clamp(17px,1.25vw,21px);line-height:1.5}
.fjm-atlas-page .fjm-real-gallery{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:clamp(14px,1.5vw,24px);align-items:start}
.fjm-atlas-page .fjm-real-shot{margin:0;min-width:0;background:transparent;overflow:visible}
.fjm-atlas-page .fjm-real-shot img{display:block;width:100%;height:auto;object-fit:contain;background:#070707;border:1px solid var(--line)}
.fjm-atlas-page .fjm-real-shot figcaption{padding:10px 2px 0;color:var(--grey);font-size:9px;line-height:1.5;letter-spacing:.07em;text-transform:uppercase}
@media(max-width:900px){.fjm-atlas-page .fjm-compact-grid{grid-template-columns:1fr;gap:20px}.fjm-atlas-page .fjm-interface-copy{grid-template-columns:1fr;gap:18px}.fjm-atlas-page .fjm-interface-copy p{justify-self:start}.fjm-atlas-page .fjm-real-gallery{grid-template-columns:1fr}}
</style>`;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, value) { fs.writeFileSync(path.join(ROOT, rel), value, 'utf8'); }

function flow(items) {
  return items.map((item, i) => `${i ? '<b>→</b>' : ''}<span>${item}</span>`).join('');
}

function patchProject(rel, lang) {
  const c = copy[lang];
  let html = read(rel);

  html = html.replace(/<style data-fjm-real-media-v[123]="">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', `${style}</head>`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${OG}">`);

  const hero = `<figure class="project-hero-media reveal" data-fjm-real-hero=""><img src="${OVERVIEW}" alt="${c.heroAlt}" loading="eager"><figcaption>${c.heroCaption}</figcaption></figure>`;
  html = html.replace(/<figure class="project-hero-media reveal"(?: data-fjm-real-hero="")?>[\s\S]*?<\/figure>/, hero);

  const context = `<section class="project-section fjm-compact-section" data-fjm-compact-context=""><div class="fjm-compact-grid"><div class="section-kicker reveal"><span>01</span><p>${c.contextKicker}</p></div><div class="fjm-compact-copy reveal"><h2>${c.contextTitle}</h2><p>${c.contextText}</p></div></div></section>`;

  const response = `<section class="project-section fjm-compact-section" data-fjm-compact-response=""><div class="fjm-compact-grid"><div class="section-kicker reveal"><span>02</span><p>${c.responseKicker}</p></div><div class="fjm-compact-copy"><div class="reveal"><h2>${c.responseTitle}</h2><p>${c.responseText}</p></div><div class="system-flow fjm-compact-flow reveal">${flow(c.flow)}</div><p class="fjm-compact-tech reveal">${c.tech}</p></div></div></section>`;

  const gallery = `<section class="project-section fjm-real-interface-v2" data-fjm-real-media-v2=""><div class="fjm-interface-head"><div class="section-kicker reveal"><span>03</span><p>${c.galleryKicker}</p></div><div class="fjm-interface-copy"><h2 class="reveal">${c.galleryTitle}</h2><p class="reveal">${c.galleryText}</p></div></div><div class="fjm-real-gallery"><figure class="fjm-real-shot reveal"><img src="${CARTEL}" alt="${c.cartelAlt}" loading="lazy"><figcaption>${c.cartelCaption}</figcaption></figure><figure class="fjm-real-shot reveal"><img src="${SELECTED}" alt="${c.selectedAlt}" loading="lazy"><figcaption>${c.selectedCaption}</figcaption></figure></div></section>`;

  const bodyPattern = /(<header class="project-hero">[\s\S]*?<\/header>)[\s\S]*?(<nav class="project-next">)/;
  if (!bodyPattern.test(html)) throw new Error(`Project body markers not found in ${rel}`);
  html = html.replace(bodyPattern, `$1${context}${response}${gallery}$2`);
  html = html.replaceAll(OLD_SCHEMATIC, OVERVIEW);
  write(rel, html);
}

for (const [rel, lang] of PROJECTS) patchProject(rel, lang);

for (const rel of ARCHIVES) {
  let html = read(rel);
  html = html.replaceAll(OLD_SCHEMATIC, OVERVIEW);
  write(rel, html);
}

console.log('FJM Atlas condensed to context, response/system and the approved interface section.');
