import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, value) => {
  const file = path.join(ROOT, rel);
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (before !== value) fs.writeFileSync(file, value, 'utf8');
};

const pages = {
  root: {
    file: 'projects/fjm-atlas.html',
    title: 'FJM Atlas — Interactive Literary Map, Touch Kiosk & Offline System — DATA C0RE',
    description: 'Commissioned project in development for Fondation Jan Michalski: an offline touch atlas connecting a high-resolution world map, literary locations, editorial cartels and exhibition-kiosk behaviour.',
    eyebrow: 'Commissioned project / interactive literary atlas / 2026',
    intent: 'For the exhibition Manuscrit trouvé à Saragosse | enquête sur un roman-monde, the atlas turns the geography of Jean Potocki’s novel into a tactile editorial interface: visitors move between places, stories and sources while keeping the feeling of one continuous literary investigation.',
    statusFact: '<b>Status</b> commissioned / in development / not yet delivered',
    roleFact: '<b>Role</b> interaction design / software architecture / development / map integration',
    briefLabel: '01 / Context + brief',
    briefTitle: 'Make a “novel-world” explorable without reducing it to a conventional map.',
    briefBody: 'The exhibition follows the literary investigation behind Jean Potocki’s Manuscrit trouvé à Saragosse and the circulation of its nested stories across places and periods. The requested atlas has to help visitors explore those locations and their links to stories and characters while preserving continuity, reading and the documentary character of the exhibition.',
    responseLabel: '02 / Response',
    responseTitle: 'A museum interface built around the map, not around menus.',
    responseBody: 'I designed and developed the atlas as a dedicated offline kiosk application. The map remains the primary object; touch navigation, location selection, editorial reading and passive exhibition behaviour are treated as one continuous system rather than separate screens.',
    responseFlow: ['high-resolution map','touch navigation','interactive places','editorial cartels','related locations','offline kiosk'],
    responseNote: 'Electron / TypeScript / OpenSeadragon / tiled map pipeline / touch pan + pinch + double-tap / structured editorial content / attract mode / idle reset / kiosk packaging / telemetry + remote maintenance',
    statusLabel: '05 / Current state',
    statusTitle: '<strong>Commissioned</strong> and actively developed.',
    statusBody: 'The project is currently under development for Fondation Jan Michalski and has not yet been delivered. This DEV portfolio page is being prepared while the software, interaction details and final installation qualification are still evolving.',
    archiveLabel: 'IN DEVELOPMENT',
    archiveTeaser: 'commissioned project / touch map / editorial kiosk / offline system'
  },
  en: null,
  fr: {
    file: 'fr/projects/fjm-atlas.html',
    title: 'FJM Atlas — Atlas littéraire interactif, borne tactile & système hors ligne — DATA C0RE',
    description: 'Projet commandé en cours de développement pour la Fondation Jan Michalski : atlas tactile hors ligne reliant carte haute définition, lieux littéraires, cartels éditoriaux et logique de borne d’exposition.',
    eyebrow: 'Projet commandé / atlas littéraire interactif / 2026',
    intent: 'Pour l’exposition Manuscrit trouvé à Saragosse | enquête sur un roman-monde, l’atlas transforme la géographie du roman de Jean Potocki en interface éditoriale tactile : le visiteur circule entre lieux, récits et sources tout en gardant la sensation de poursuivre une même enquête littéraire.',
    statusFact: '<b>Statut</b> projet commandé / en développement / non livré',
    roleFact: '<b>Rôle</b> design d’interaction / architecture logicielle / développement / intégration cartographique',
    briefLabel: '01 / Contexte + demande',
    briefTitle: 'Rendre un « roman-monde » explorable sans le réduire à une carte classique.',
    briefBody: 'L’exposition met en scène l’enquête littéraire autour du Manuscrit trouvé à Saragosse de Jean Potocki et la circulation de ses récits enchâssés à travers les lieux et les époques. Le dispositif doit permettre aux visiteurs d’explorer ces lieux, de comprendre leurs liens avec les histoires et les personnages, et de passer de l’un à l’autre sans perdre la continuité de lecture ni le caractère documentaire de l’exposition.',
    responseLabel: '02 / Ma réponse',
    responseTitle: 'Une interface muséale construite autour de la carte, pas autour de menus.',
    responseBody: 'J’ai conçu et développé l’atlas comme une application de borne dédiée et hors ligne. La carte reste l’objet principal ; navigation tactile, sélection des lieux, lecture éditoriale et comportement passif d’exposition sont pensés comme un seul système continu plutôt que comme une suite d’écrans.',
    responseFlow: ['carte haute définition','navigation tactile','lieux interactifs','cartels éditoriaux','autres lieux','borne hors ligne'],
    responseNote: 'Electron / TypeScript / OpenSeadragon / pipeline de carte tuilée / pan + pinch + double-tap / contenus éditoriaux structurés / mode attract / reset d’inactivité / packaging borne / télémétrie + maintenance distante',
    statusLabel: '05 / État actuel',
    statusTitle: '<strong>Commandé</strong> et en développement actif.',
    statusBody: 'Le projet est actuellement en cours de développement pour la Fondation Jan Michalski et n’est pas encore livré. Cette page portfolio DEV est préparée pendant que le logiciel, les détails d’interaction et la qualification finale de l’installation continuent d’évoluer.',
    archiveLabel: 'EN COURS',
    archiveTeaser: 'projet commandé / carte tactile / borne éditoriale / système hors ligne'
  },
  es: {
    file: 'es/projects/fjm-atlas.html',
    title: 'FJM Atlas — Atlas literario interactivo, quiosco táctil y sistema offline — DATA C0RE',
    description: 'Proyecto encargado en desarrollo para Fondation Jan Michalski: atlas táctil offline que conecta mapa de alta resolución, lugares literarios, cartelas editoriales y lógica de quiosco de exposición.',
    eyebrow: 'Proyecto encargado / atlas literario interactivo / 2026',
    intent: 'Para la exposición Manuscrit trouvé à Saragosse | enquête sur un roman-monde, el atlas convierte la geografía de la novela de Jean Potocki en una interfaz editorial táctil: el visitante circula entre lugares, relatos y fuentes manteniendo la sensación de seguir una misma investigación literaria.',
    statusFact: '<b>Estado</b> proyecto encargado / en desarrollo / aún no entregado',
    roleFact: '<b>Rol</b> diseño de interacción / arquitectura de software / desarrollo / integración cartográfica',
    briefLabel: '01 / Contexto + encargo',
    briefTitle: 'Hacer explorable una «novela-mundo» sin reducirla a un mapa convencional.',
    briefBody: 'La exposición presenta la investigación literaria en torno a Manuscrit trouvé à Saragosse de Jean Potocki y la circulación de sus relatos encajados a través de lugares y épocas. El dispositivo debe permitir explorar esos lugares, comprender sus vínculos con historias y personajes y pasar de uno a otro sin perder la continuidad de lectura ni el carácter documental de la exposición.',
    responseLabel: '02 / Mi respuesta',
    responseTitle: 'Una interfaz museográfica construida alrededor del mapa, no de menús.',
    responseBody: 'Diseñé y desarrollé el atlas como una aplicación de quiosco dedicada y offline. El mapa sigue siendo el objeto principal; navegación táctil, selección de lugares, lectura editorial y comportamiento pasivo de exposición se conciben como un único sistema continuo y no como una sucesión de pantallas.',
    responseFlow: ['mapa de alta resolución','navegación táctil','lugares interactivos','cartelas editoriales','otros lugares','quiosco offline'],
    responseNote: 'Electron / TypeScript / OpenSeadragon / pipeline de mapa por teselas / pan + pinch + doble toque / contenidos editoriales estructurados / modo attract / reset por inactividad / packaging de quiosco / telemetría + mantenimiento remoto',
    statusLabel: '05 / Estado actual',
    statusTitle: '<strong>Encargado</strong> y en desarrollo activo.',
    statusBody: 'El proyecto está actualmente en desarrollo para Fondation Jan Michalski y todavía no ha sido entregado. Esta página de portfolio DEV se prepara mientras el software, los detalles de interacción y la cualificación final de la instalación siguen evolucionando.',
    archiveLabel: 'EN DESARROLLO',
    archiveTeaser: 'proyecto encargado / mapa táctil / quiosco editorial / sistema offline'
  }
};
pages.en = { ...pages.root, file: 'en/projects/fjm-atlas.html' };

function setMeta(html, selector, value) {
  if (selector === 'title') return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);
  if (selector === 'description') return html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${value}">`);
  if (selector === 'og:title') return html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${value}">`);
  if (selector === 'og:description') return html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${value}">`);
  return html;
}

const contextCss = `<style data-fjm-context-v2="">
.fjm-atlas-page .fjm-brief-grid{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:clamp(36px,6vw,110px);align-items:start}.fjm-atlas-page .fjm-brief-grid .section-kicker{position:sticky;top:110px}.fjm-atlas-page .fjm-brief-grid .prose-large h2{max-width:980px}.fjm-atlas-page .fjm-response-flow{margin-top:clamp(34px,4vw,58px)}.fjm-atlas-page .fjm-response-note{margin-top:clamp(30px,3vw,48px);padding-top:14px;border-top:1px solid var(--line);color:var(--grey);font-size:10px;line-height:1.6;letter-spacing:.07em;text-transform:uppercase}.fjm-atlas-page .fjm-status strong{color:var(--acid)}
@media(max-width:820px){.fjm-atlas-page .fjm-brief-grid{grid-template-columns:1fr;gap:24px}.fjm-atlas-page .fjm-brief-grid .section-kicker{position:static}}
</style>`;

function flow(items) {
  return items.map((item, index) => `${index ? '<b>→</b>' : ''}<span>${item}</span>`).join('');
}

function enhanceProject(key, d) {
  let html = read(d.file);
  html = setMeta(html, 'title', d.title);
  html = setMeta(html, 'description', d.description);
  html = setMeta(html, 'og:title', d.title);
  html = setMeta(html, 'og:description', d.description);

  if (!html.includes('data-fjm-context-v2')) html = html.replace('</head>', `${contextCss}</head>`);

  html = html.replace(/<p class="eyebrow accent-acid">[^<]*<\/p><h1>/, `<p class="eyebrow accent-acid">${d.eyebrow}</p><h1>`);
  html = html.replace(/<p class="project-intent">[\s\S]*?<\/p><\/div><div class="project-facts reveal">/, `<p class="project-intent">${d.intent}</p></div><div class="project-facts reveal">`);
  html = html.replace(/<span><b>(Status|Statut|Estado)<\/b>[\s\S]*?<\/span><span><b>(Role|Rôle|Rol)<\/b>[\s\S]*?<\/span><span><b>(System|Système|Sistema)<\/b>/, `<span>${d.statusFact}</span><span>${d.roleFact}</span><span><b>${key === 'fr' ? 'Système' : key === 'es' ? 'Sistema' : 'System'}</b>`);

  html = html.replace(/<section class="project-section fjm-context-v2"[\s\S]*?<\/section><section class="project-section fjm-response-v2"[\s\S]*?<\/section>/, '');

  const contextBlock = `<section class="project-section fjm-context-v2" data-fjm-context-v2><div class="fjm-brief-grid"><div class="section-kicker reveal"><span>${d.briefLabel.split(' / ')[0]}</span><p>${d.briefLabel.split(' / ').slice(1).join(' / ')}</p></div><div class="prose-large reveal"><h2>${d.briefTitle}</h2><p>${d.briefBody}</p></div></div></section><section class="project-section fjm-response-v2"><div class="fjm-brief-grid"><div class="section-kicker reveal"><span>${d.responseLabel.split(' / ')[0]}</span><p>${d.responseLabel.split(' / ').slice(1).join(' / ')}</p></div><div><div class="prose-large reveal"><h2>${d.responseTitle}</h2><p>${d.responseBody}</p></div><div class="system-flow fjm-response-flow reveal">${flow(d.responseFlow)}</div><p class="fjm-response-note reveal">${d.responseNote}</p></div></div></section>`;

  const firstContentSection = '<section class="project-section project-section--split">';
  if (!html.includes('data-fjm-context-v2')) throw new Error(`Could not inject context marker into ${d.file}`);
  const bodyMarkerIndex = html.indexOf(firstContentSection);
  const contextIndex = html.indexOf('<section class="project-section fjm-context-v2"');
  if (contextIndex < 0 && bodyMarkerIndex >= 0) html = html.slice(0, bodyMarkerIndex) + contextBlock + html.slice(bodyMarkerIndex);

  // Renumber the pre-existing interaction section after the two new project-context sections.
  html = html.replace(/(<section class="project-section project-section--split"><div class="section-kicker reveal"><span>)01(<\/span>)/, '$103$2');

  html = html.replace(/<section class="project-section project-section--split fjm-status">[\s\S]*?<\/section>/, `<section class="project-section project-section--split fjm-status"><div class="section-kicker reveal"><span>${d.statusLabel.split(' / ')[0]}</span><p>${d.statusLabel.split(' / ').slice(1).join(' / ')}</p></div><div class="prose-large reveal"><h2>${d.statusTitle}</h2><p>${d.statusBody}</p></div></section>`);

  write(d.file, html);
}

for (const [key, d] of Object.entries(pages)) enhanceProject(key, d);

const archives = {
  root: { file: 'archive.html', label: pages.root.archiveLabel, teaser: pages.root.archiveTeaser },
  en: { file: 'en/archive.html', label: pages.root.archiveLabel, teaser: pages.root.archiveTeaser },
  fr: { file: 'fr/archive.html', label: pages.fr.archiveLabel, teaser: pages.fr.archiveTeaser },
  es: { file: 'es/archive.html', label: pages.es.archiveLabel, teaser: pages.es.archiveTeaser }
};

for (const d of Object.values(archives)) {
  let html = read(d.file);
  const re = /(<a class="archive-entry"[^>]*data-archive-project="fjm-atlas"[\s\S]*?<span class="archive-status status-research">)[^<]*(<\/span><div><strong>[^<]*<\/strong><small>)[^<]*(<\/small><\/div><time>2026<\/time><\/a>)/;
  if (!re.test(html)) throw new Error(`FJM Atlas archive entry missing in ${d.file}`);
  html = html.replace(re, `$1${d.label}$2${d.teaser}$3`);
  write(d.file, html);
}
