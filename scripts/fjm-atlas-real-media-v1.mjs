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
const AMBILIGHT_ATTR = 'data-ambilight-white-guard="off"';

const copy = {
  en: {
    heroAlt: 'FJM Atlas interactive map overview',
    heroCaption: 'Current interface / map overview — development capture',
    storyKicker: 'Context + brief + response',
    storyTitle: 'Turn a “world-novel” into a tactile atlas for exhibition.',
    briefText: 'For the exhibition Manuscript Found in Saragossa | investigation of a world-novel, the brief is to make Jean Potocki’s geography explorable while preserving the links between places, stories, characters and documentary sources.',
    responseText: 'I designed and developed a dedicated offline touch-kiosk application built around a high-resolution tiled map. The map remains the main object: touch navigation, location selection, editorial reading, related places and idle behaviour form one continuous museum interface.',
    flow: ['high-resolution map','touch navigation','interactive locations','editorial cartels','related places','offline kiosk'],
    tech: 'Electron / TypeScript / OpenSeadragon / tiled-map pipeline / pan + pinch + double-tap / structured editorial content / attract mode / inactivity reset / kiosk packaging / telemetry + remote maintenance',
    invitationAlt: 'FJM Atlas touch-map invitation state',
    invitationCaption: 'Idle invitation state / touch-first entry point — development interface',
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
    storyKicker: 'Contexte + demande + réponse',
    storyTitle: 'Transformer un « roman-monde » en atlas tactile de consultation.',
    briefText: 'Pour l’exposition Manuscrit trouvé à Saragosse | enquête sur un roman-monde, la demande consiste à rendre explorable la géographie du roman de Jean Potocki tout en conservant les liens entre lieux, récits, personnages et sources documentaires.',
    responseText: 'J’ai conçu et développé une application de borne tactile dédiée et hors ligne, construite autour d’une carte haute définition tuilée. La carte reste l’objet principal : navigation tactile, sélection des lieux, lecture éditoriale, lieux associés et comportement d’inactivité forment une seule interface muséale continue.',
    flow: ['carte haute définition','navigation tactile','lieux interactifs','cartels éditoriaux','autres lieux','borne hors ligne'],
    tech: 'Electron / TypeScript / OpenSeadragon / pipeline de carte tuilée / pan + pinch + double-tap / contenus éditoriaux structurés / mode attract / reset d’inactivité / packaging borne / télémétrie + maintenance distante',
    invitationAlt: 'État d’invitation de FJM Atlas avec le message Touchez la carte',
    invitationCaption: 'État d’invitation / entrée tactile — interface de développement',
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
    storyKicker: 'Contexto + encargo + respuesta',
    storyTitle: 'Transformar una «novela-mundo» en un atlas táctil de consulta.',
    briefText: 'Para la exposición Manuscrito encontrado en Zaragoza | investigación sobre una novela-mundo, el encargo consiste en hacer explorable la geografía de la novela de Jean Potocki conservando los vínculos entre lugares, relatos, personajes y fuentes documentales.',
    responseText: 'Diseñé y desarrollé una aplicación de quiosco táctil dedicada y offline, construida alrededor de un mapa de alta resolución por teselas. El mapa sigue siendo el objeto principal: navegación táctil, selección de lugares, lectura editorial, lugares relacionados y comportamiento de inactividad forman una única interfaz museística continua.',
    flow: ['mapa de alta resolución','navegación táctil','lugares interactivos','carteles editoriales','lugares relacionados','quiosco offline'],
    tech: 'Electron / TypeScript / OpenSeadragon / pipeline de mapa por teselas / pan + pinch + double-tap / contenidos editoriales estructurados / modo attract / reset por inactividad / packaging de quiosco / telemetría + mantenimiento remoto',
    invitationAlt: 'Estado de invitación táctil de FJM Atlas',
    invitationCaption: 'Estado de invitación / entrada táctil — interfaz de desarrollo',
    galleryKicker: 'Interfaz',
    galleryTitle: 'Del mapa-mundo a la lectura editorial.',
    galleryText: 'La selección de un lugar mantiene visible el mapa mientras abre su contenido editorial. La interfaz permite pasar de la geografía al texto y a los lugares relacionados sin romper el contexto espacial del visitante.',
    cartelAlt: 'Cartel editorial de FJM Atlas abierto sobre el mapa interactivo',
    cartelCaption: 'Lugar seleccionado / cartel editorial',
    selectedAlt: 'Lugar seleccionado en FJM Atlas con el contexto cartográfico conservado',
    selectedCaption: 'Lugar seleccionado / contexto cartográfico conservado',
  },
};

const style = `<style data-fjm-real-media-v4="">
.fjm-atlas-page .project-hero-media img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.fjm-atlas-page .fjm-story-section{padding-top:clamp(54px,5.4vw,88px);padding-bottom:clamp(54px,5.4vw,88px)}
.fjm-atlas-page .fjm-story-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:clamp(34px,5vw,78px);align-items:start}
.fjm-atlas-page .fjm-story-copy .section-kicker{margin-bottom:clamp(22px,2.6vw,38px)}
.fjm-atlas-page .fjm-story-copy h2{margin:0 0 24px;font-size:clamp(40px,4.6vw,74px);line-height:.92;letter-spacing:-.055em;max-width:920px}
.fjm-atlas-page .fjm-story-copy p{margin:0;max-width:860px;color:#b9b7b1;font-size:clamp(16px,1.08vw,19px);line-height:1.48}
.fjm-atlas-page .fjm-story-copy p+p{margin-top:16px}
.fjm-atlas-page .fjm-story-flow{grid-column:1 / -1;width:100%;margin-top:clamp(4px,.6vw,10px);display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr);gap:10px 14px;align-items:center}
.fjm-atlas-page .fjm-story-flow span{min-width:0;text-align:center}
.fjm-atlas-page .fjm-story-flow b{display:flex;align-items:center;justify-content:center;color:var(--acid);font-size:12px;line-height:1}
.fjm-atlas-page .fjm-story-tech{grid-column:1 / -1;width:100%;margin:0;padding-top:12px;border-top:1px solid var(--line);color:var(--grey);font-size:10px;line-height:1.55;letter-spacing:.07em;text-transform:uppercase}
.fjm-atlas-page .fjm-story-media{margin:0;min-width:0}
.fjm-atlas-page .fjm-invitation-visual{position:relative;overflow:hidden;border:1px solid var(--line);background:#dff}
.fjm-atlas-page .fjm-invitation-visual>img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.fjm-atlas-page .fjm-invitation-card{position:absolute;left:2.8%;bottom:6.2%;width:min(390px,38%);box-sizing:border-box;padding:clamp(16px,1.55vw,28px);background:#f4f1e9;color:#171717;border:1px solid rgba(20,20,20,.12);box-shadow:0 6px 22px rgba(0,0,0,.08)}
.fjm-atlas-page .fjm-invitation-card strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:clamp(18px,2vw,37px);font-weight:400;line-height:1.02;letter-spacing:-.025em}
.fjm-atlas-page .fjm-invitation-card em{display:block;margin-top:10px;padding-bottom:15px;border-bottom:1px solid rgba(20,20,20,.15);font-family:Georgia,'Times New Roman',serif;font-size:clamp(9px,.9vw,15px);line-height:1.25;color:#77736d}
.fjm-atlas-page .fjm-invitation-card small{display:block;margin-top:13px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(8px,.75vw,13px);line-height:1.3;font-style:italic;color:#77736d}
.fjm-atlas-page .fjm-story-media figcaption,.fjm-atlas-page .fjm-real-shot figcaption{padding:10px 2px 0;color:var(--grey);font-size:9px;line-height:1.5;letter-spacing:.07em;text-transform:uppercase}
.fjm-atlas-page .fjm-interface-head{margin-bottom:clamp(34px,4vw,62px)}
.fjm-atlas-page .fjm-interface-head>.section-kicker{margin-bottom:clamp(22px,2.4vw,38px)}
.fjm-atlas-page .fjm-interface-copy{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(320px,.82fr);gap:clamp(34px,5vw,90px);align-items:end}
.fjm-atlas-page .fjm-interface-copy h2{margin:0;font-size:clamp(44px,5vw,84px);line-height:.92;letter-spacing:-.055em;max-width:980px}
.fjm-atlas-page .fjm-interface-copy p{margin:0;max-width:720px;justify-self:end;color:#b9b7b1;font-size:clamp(17px,1.25vw,21px);line-height:1.5}
.fjm-atlas-page .fjm-real-gallery{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:clamp(14px,1.5vw,24px);align-items:start}
.fjm-atlas-page .fjm-real-shot{margin:0;min-width:0;background:transparent;overflow:visible}
.fjm-atlas-page .fjm-real-shot img{display:block;width:100%;height:auto;object-fit:contain;background:#070707;border:1px solid var(--line)}
@media(max-width:980px){.fjm-atlas-page .fjm-story-grid{grid-template-columns:1fr;gap:28px}.fjm-atlas-page .fjm-story-flow{grid-template-columns:1fr;justify-items:center;gap:8px}.fjm-atlas-page .fjm-story-flow b{transform:rotate(90deg)}.fjm-atlas-page .fjm-interface-copy{grid-template-columns:1fr;gap:18px}.fjm-atlas-page .fjm-interface-copy p{justify-self:start}.fjm-atlas-page .fjm-real-gallery{grid-template-columns:1fr}}
@media(max-width:620px){.fjm-atlas-page .fjm-invitation-card{width:46%;left:3.5%;bottom:5%;padding:12px}.fjm-atlas-page .fjm-invitation-card em{margin-top:6px;padding-bottom:8px}.fjm-atlas-page .fjm-invitation-card small{margin-top:7px}}
</style>`;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, value) { fs.writeFileSync(path.join(ROOT, rel), value, 'utf8'); }
function flow(items) { return items.map((item, i) => `${i ? '<b>→</b>' : ''}<span>${item}</span>`).join(''); }

function patchProject(rel, lang) {
  const c = copy[lang];
  let html = read(rel);

  html = html.replace(/<style data-fjm-real-media-v[1234]="">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', `${style}</head>`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${OG}">`);

  const hero = `<figure class="project-hero-media reveal" data-fjm-real-hero=""><img src="${OVERVIEW}" alt="${c.heroAlt}" loading="eager" ${AMBILIGHT_ATTR}><figcaption>${c.heroCaption}</figcaption></figure>`;
  html = html.replace(/<figure class="project-hero-media reveal"(?: data-fjm-real-hero="")?>[\s\S]*?<\/figure>/, hero);

  const story = `<section class="project-section fjm-story-section" data-fjm-story=""><div class="fjm-story-grid"><div class="fjm-story-copy"><div class="section-kicker reveal"><span>01</span><p>${c.storyKicker}</p></div><div class="reveal"><h2>${c.storyTitle}</h2><p>${c.briefText}</p><p>${c.responseText}</p></div></div><figure class="fjm-story-media reveal"><div class="fjm-invitation-visual"><img src="${OVERVIEW}" alt="${c.invitationAlt}" loading="lazy" ${AMBILIGHT_ATTR}><div class="fjm-invitation-card" aria-hidden="true"><strong>Touchez la carte</strong><em>Explorez les lieux et leurs récits.</em><small>○—○ &nbsp; Pincez ou touchez deux fois pour zoomer</small></div></div><figcaption>${c.invitationCaption}</figcaption></figure><div class="system-flow fjm-story-flow reveal">${flow(c.flow)}</div><p class="fjm-story-tech reveal">${c.tech}</p></div></section>`;

  const gallery = `<section class="project-section fjm-real-interface-v2" data-fjm-real-media-v2=""><div class="fjm-interface-head"><div class="section-kicker reveal"><span>03</span><p>${c.galleryKicker}</p></div><div class="fjm-interface-copy"><h2 class="reveal">${c.galleryTitle}</h2><p class="reveal">${c.galleryText}</p></div></div><div class="fjm-real-gallery"><figure class="fjm-real-shot reveal"><img src="${CARTEL}" alt="${c.cartelAlt}" loading="lazy" ${AMBILIGHT_ATTR}><figcaption>${c.cartelCaption}</figcaption></figure><figure class="fjm-real-shot reveal"><img src="${SELECTED}" alt="${c.selectedAlt}" loading="lazy" ${AMBILIGHT_ATTR}><figcaption>${c.selectedCaption}</figcaption></figure></div></section>`;

  const bodyPattern = /(<header class="project-hero">[\s\S]*?<\/header>)[\s\S]*?(<nav class="project-next">)/;
  if (!bodyPattern.test(html)) throw new Error(`Project body markers not found in ${rel}`);
  html = html.replace(bodyPattern, `$1${story}${gallery}$2`);
  html = html.replaceAll(OLD_SCHEMATIC, OVERVIEW);
  write(rel, html);
}

for (const [rel, lang] of PROJECTS) patchProject(rel, lang);
for (const rel of ARCHIVES) {
  let html = read(rel);
  html = html.replaceAll(OLD_SCHEMATIC, OVERVIEW);
  write(rel, html);
}

console.log('FJM Atlas reduced to one merged context/response section plus the approved interface section, with chromatic Ambilight white-guard opt-out on its real UI images.');