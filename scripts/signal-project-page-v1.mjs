import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const file = rel => path.join(ROOT, rel);
const read = rel => fs.readFileSync(file(rel), 'utf8');
const write = (rel, value) => fs.writeFileSync(file(rel), value, 'utf8');

function replaceMain(html, main) {
  return html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/i, main);
}

function setMeta(html, { title, description, canonical }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`);
  if (/<meta name="twitter:title"/i.test(html)) html = html.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${title}">`);
  if (/<meta name="twitter:description"/i.test(html)) html = html.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${description}">`);
  return html;
}

const configs = {
  root: {
    file: 'projects/signal.html',
    canonical: 'https://datac0re.is-a.dev/projects/signal.html',
    title: 'SIGNAL — Simulation, Spatial Tracking & Realtime LED Systems — DATA C0RE',
    description: 'SIGNAL is an audiovisual installation project in active development: a Godot digital twin for spatial tracking, crowd simulation, modular radar sensing and realtime LED behaviour.',
    eyebrow: 'Simulation / tracking / R&D / 2026',
    intent: 'A spatial tracking and LED-system project currently being developed through a Godot digital twin. The simulator connects installation geometry, movement, sensing and realtime output before physical deployment.',
    status: 'in development / simulation',
    role: 'system design / digital twin / realtime architecture',
    tools: 'Godot 4.7.1 / LD2450 / ESP32 / WebSocket / TouchDesigner / Art-Net',
    projectLabel: 'Project',
    projectHeading: 'A digital twin for an installation that reacts to presence.',
    projectCopy: 'SIGNAL is being designed as a modular spatial system in which people moving through an architecture are tracked with mmWave radar rather than a camera image. Their positions become a shared realtime state that can drive text, light, motion and other behaviour across distributed LED surfaces. The current phase focuses on designing and testing the system before an in-situ build.',
    simLabel: 'Simulation / tracking',
    simEyebrow: 'System development',
    simHeading: 'Design. Simulate.<br>Track. Map.',
    simCopy: 'Godot is used as a design, simulation and diagnostic environment: installation geometry, walls and pedestrian flows, radar coverage, screens, crowd movement and shared device parameters can be tested inside one project. The target hardware remains modular, with radar pods feeding Ethernet gateways before the tracking state reaches TouchDesigner and the final LED mapping layer.',
    flow: ['CAD / spatial layout', 'crowd simulation', 'mmWave radar model', 'network / fusion', 'TouchDesigner', 'LED / Art-Net'],
    stateLabel: 'Current state',
    stateHeading: 'Built as a system before it becomes an installation.',
    stateCopy: 'No finished installation or final visual documentation is presented yet. SIGNAL is under active development. The current prototype already combines the CAD / 3D workspace, crowd and flow simulation, radar / fusion model, shared device inspector and project configuration. Physical multi-wall LED implementation and in-situ hardware integration remain part of the next phase.',
    docEyebrow: 'Visual documentation',
    docHeading: 'COMING WITH<br>THE BUILD.',
    docCopy: 'Simulator captures, hardware tests and installation documentation will be added as the project moves from digital twin to physical prototype.',
    back: 'Back',
    archive: 'Archive',
    lab: 'Lab / R&D',
    all: 'All projects',
    indexTitle: 'SIGNAL / Simulation + Tracking',
    indexSmall: 'Godot digital twin / spatial tracking / mmWave / TouchDesigner / LED systems'
  },
  en: null,
  fr: {
    file: 'fr/projects/signal.html',
    canonical: 'https://datac0re.is-a.dev/fr/projects/signal.html',
    title: 'SIGNAL — Simulation, tracking spatial & systèmes LED temps réel — DATA C0RE',
    description: 'SIGNAL est un projet d’installation audiovisuelle en développement : jumeau numérique Godot, tracking spatial, simulation de foule, radars modulaires et comportement LED temps réel.',
    eyebrow: 'Simulation / tracking spatial / R&D / 2026',
    intent: 'Un projet de tracking spatial et de système LED actuellement développé à travers un jumeau numérique sous Godot. Le simulateur relie géométrie de l’installation, mouvement, détection et sortie temps réel avant le déploiement physique.',
    status: 'en développement / simulation',
    role: 'conception système / jumeau numérique / architecture temps réel',
    tools: 'Godot 4.7.1 / LD2450 / ESP32 / WebSocket / TouchDesigner / Art-Net',
    projectLabel: 'Projet',
    projectHeading: 'Un jumeau numérique pour une installation qui réagit aux présences.',
    projectCopy: 'SIGNAL est conçu comme un système spatial modulaire dans lequel les personnes qui traversent l’architecture sont suivies par radar mmWave plutôt que par une image caméra. Leurs positions deviennent un état temps réel partagé capable de piloter texte, lumière, mouvement et autres comportements sur des surfaces LED distribuées. La phase actuelle consiste à concevoir et tester le système avant une construction in situ.',
    simLabel: 'Simulation / tracking',
    simEyebrow: 'Développement système',
    simHeading: 'Concevoir. Simuler.<br>Suivre. Mapper.',
    simCopy: 'Godot sert d’environnement de conception, de simulation et de diagnostic : géométrie de l’installation, murs et flux piétons, couverture radar, écrans, mouvement de foule et paramètres partagés des appareils peuvent être testés dans un même projet. L’architecture matérielle cible reste modulaire, avec des pods radar reliés à des passerelles Ethernet avant d’envoyer l’état de tracking vers TouchDesigner puis la couche finale de mapping LED.',
    flow: ['CAD / espace', 'simulation de foule', 'modèle radar mmWave', 'réseau / fusion', 'TouchDesigner', 'LED / Art-Net'],
    stateLabel: 'État actuel',
    stateHeading: 'Construire le système avant de construire l’installation.',
    stateCopy: 'Aucune installation finalisée ni documentation visuelle définitive n’est présentée pour l’instant. SIGNAL est en développement actif. Le prototype actuel réunit déjà le workspace CAD / 3D, la simulation de foule et de flux, le modèle radar / fusion, l’inspecteur appareil partagé et la configuration projet. L’implémentation physique des écrans LED multi-murs et l’intégration matérielle in situ restent dans la phase suivante.',
    docEyebrow: 'Documentation visuelle',
    docHeading: 'À VENIR AVEC<br>LA CONSTRUCTION.',
    docCopy: 'Captures du simulateur, tests matériels et documentation d’installation seront ajoutés au passage du jumeau numérique vers le prototype physique.',
    back: 'Retour',
    archive: 'Archives',
    lab: 'Lab / R&D',
    all: 'Tous les projets',
    indexTitle: 'SIGNAL / Simulation + Tracking',
    indexSmall: 'jumeau numérique Godot / tracking spatial / mmWave / TouchDesigner / systèmes LED'
  },
  es: {
    file: 'es/projects/signal.html',
    canonical: 'https://datac0re.is-a.dev/es/projects/signal.html',
    title: 'SIGNAL — Simulación, tracking espacial y sistemas LED en tiempo real — DATA C0RE',
    description: 'SIGNAL es un proyecto de instalación audiovisual en desarrollo: gemelo digital en Godot, tracking espacial, simulación de multitudes, radares modulares y comportamiento LED en tiempo real.',
    eyebrow: 'Simulación / tracking espacial / I+D / 2026',
    intent: 'Un proyecto de tracking espacial y sistema LED actualmente desarrollado mediante un gemelo digital en Godot. El simulador conecta geometría de instalación, movimiento, detección y salida en tiempo real antes del despliegue físico.',
    status: 'en desarrollo / simulación',
    role: 'diseño de sistema / gemelo digital / arquitectura en tiempo real',
    tools: 'Godot 4.7.1 / LD2450 / ESP32 / WebSocket / TouchDesigner / Art-Net',
    projectLabel: 'Proyecto',
    projectHeading: 'Un gemelo digital para una instalación que reacciona a la presencia.',
    projectCopy: 'SIGNAL se diseña como un sistema espacial modular en el que las personas que atraviesan la arquitectura son seguidas mediante radar mmWave, sin depender de una imagen de cámara. Sus posiciones se convierten en un estado compartido en tiempo real capaz de controlar texto, luz, movimiento y otros comportamientos sobre superficies LED distribuidas. La fase actual se centra en diseñar y probar el sistema antes de una construcción in situ.',
    simLabel: 'Simulación / tracking',
    simEyebrow: 'Desarrollo del sistema',
    simHeading: 'Diseñar. Simular.<br>Seguir. Mapear.',
    simCopy: 'Godot se utiliza como entorno de diseño, simulación y diagnóstico: geometría de la instalación, muros y flujos peatonales, cobertura de radar, pantallas, movimiento de multitudes y parámetros compartidos de dispositivos pueden probarse dentro de un mismo proyecto. La arquitectura física prevista sigue siendo modular, con pods radar conectados a gateways Ethernet antes de enviar el estado de tracking a TouchDesigner y a la capa final de mapeo LED.',
    flow: ['CAD / espacio', 'simulación de multitudes', 'modelo radar mmWave', 'red / fusión', 'TouchDesigner', 'LED / Art-Net'],
    stateLabel: 'Estado actual',
    stateHeading: 'Construir el sistema antes de construir la instalación.',
    stateCopy: 'Todavía no se presenta una instalación terminada ni documentación visual final. SIGNAL está en desarrollo activo. El prototipo actual ya reúne el workspace CAD / 3D, simulación de multitudes y flujos, modelo radar / fusión, inspector compartido de dispositivos y configuración de proyecto. La implementación física de pantallas LED multi-muro y la integración de hardware in situ forman parte de la siguiente fase.',
    docEyebrow: 'Documentación visual',
    docHeading: 'LLEGARÁ CON<br>LA CONSTRUCCIÓN.',
    docCopy: 'Las capturas del simulador, pruebas de hardware y documentación de instalación se añadirán a medida que el proyecto pase del gemelo digital al prototipo físico.',
    back: 'Volver',
    archive: 'Archivo',
    lab: 'Lab / I+D',
    all: 'Todos los proyectos',
    indexTitle: 'SIGNAL / Simulación + Tracking',
    indexSmall: 'gemelo digital Godot / tracking espacial / mmWave / TouchDesigner / sistemas LED'
  }
};
configs.en = { ...configs.root, file: 'en/projects/signal.html', canonical: 'https://datac0re.is-a.dev/en/projects/signal.html' };

function mainMarkup(c) {
  const flow = c.flow.map((item, i) => `${i ? '<b>→</b>' : ''}<span>${item}</span>`).join('');
  return `<main><article>
<header class="project-hero signal-hero">
  <div class="project-hero-copy reveal"><div><p class="eyebrow accent-acid">${c.eyebrow}</p><h1>SIGNAL</h1></div><p class="project-intent">${c.intent}</p></div>
  <div class="project-facts reveal"><span><b>Status</b> ${c.status}</span><span><b>Role</b> ${c.role}</span><span><b>System</b> ${c.tools}</span></div>
</header>
<section class="project-section project-section--split"><div class="section-kicker reveal"><span>01</span><p>${c.projectLabel}</p></div><div class="prose-large reveal"><h2>${c.projectHeading}</h2><p>${c.projectCopy}</p></div></section>
<section class="project-section"><div class="section-head reveal"><div><p class="eyebrow">${c.simEyebrow}</p><h2>${c.simHeading}</h2></div></div><div class="system-flow reveal">${flow}</div><div class="prose reveal" style="margin-top:clamp(34px,4vw,64px)"><p>${c.simCopy}</p></div></section>
<section class="project-section project-section--split"><div class="section-kicker reveal"><span>02</span><p>${c.stateLabel}</p></div><div class="prose-large reveal"><h2>${c.stateHeading}</h2><p>${c.stateCopy}</p></div></section>
<section class="project-section"><div class="section-head reveal"><div><p class="eyebrow accent-acid">${c.docEyebrow}</p><h2>${c.docHeading}</h2></div></div><div class="prose reveal"><p>${c.docCopy}</p></div></section>
<nav class="project-next"><a href="lab.html"><span>${c.back}</span><b>${c.lab}</b></a><a href="archive.html"><span>${c.archive}</span><b>${c.all}</b></a></nav>
</article></main>`;
}

for (const c of Object.values(configs)) {
  if (!c || !fs.existsSync(file(c.file))) continue;
  let html = read(c.file);
  html = setMeta(html, c);
  html = html.replace(/<body class="[^"]*">/i, '<body class="signal-page">');
  html = replaceMain(html, mainMarkup(c));
  write(c.file, html);
}

function updateIndex(rel, c) {
  if (!fs.existsSync(file(rel))) return;
  const $ = load(read(rel), { decodeEntities: false });
  const row = $('a[href$="projects/signal.html"]').first();
  if (!row.length) return;
  row.find('strong').first().text(c.indexTitle);
  row.find('small').first().text(c.indexSmall);
  write(rel, $.html());
}

for (const [lang, c] of Object.entries(configs)) {
  if (!c) continue;
  const prefix = lang === 'root' ? '' : `${lang}/`;
  updateIndex(`${prefix}lab.html`, c);
  updateIndex(`${prefix}archive.html`, c);
}

console.log('SIGNAL simplified development case study applied to EN / FR / ES and archive indexes.');
