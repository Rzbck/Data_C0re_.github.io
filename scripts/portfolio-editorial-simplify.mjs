import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();

const variants = [
  { rel: '', lang: 'en', homePath: '/', archivePath: '/archive.html', cvPath: '/cv.html', contactPath: '/contact.html' },
  { rel: 'en/', lang: 'en', homePath: '/en/', archivePath: '/en/archive.html', cvPath: '/en/cv.html', contactPath: '/en/contact.html' },
  { rel: 'fr/', lang: 'fr', homePath: '/fr/', archivePath: '/fr/archive.html', cvPath: '/fr/cv.html', contactPath: '/fr/contact.html' },
  { rel: 'es/', lang: 'es', homePath: '/es/', archivePath: '/es/archive.html', cvPath: '/es/cv.html', contactPath: '/es/contact.html' }
];

const copy = {
  en: {
    practiceLabel: 'Practice',
    heroEyebrow: 'Realtime audiovisual systems / production + creative technology',
    heroKicker: 'TouchDesigner / projection / light / stage systems',
    statement: 'I design, program and operate realtime audiovisual systems for installations, stages and live performance.',
    statementCopy: 'TouchDesigner, projection, light, video and show control — from system design and programming to calibration, integration and operation on site.',
    contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
    selectedLabel: 'Selected contexts',
    selectedHeading: 'Installed, staged<br>and operated.',
    archiveLink: 'Archive ↗',
    capabilitiesLabel: 'Capabilities',
    capabilitiesHeading: 'Realtime software<br>to on-site integration.',
    capabilitiesCopy: 'Creative and technical work across realtime programming, projection, stage video, lighting systems and media integration.',
    capabilityTags: ['TouchDesigner', 'SMODE + projection', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibration + soft edge', 'networked media', 'Fusion 360 + fabrication'],
    availabilityLabel: 'Available for',
    availabilityHeading: 'Installations / stage / touring / realtime systems.',
    availabilityCopy: 'Annecy / Geneva / France / Switzerland / Europe / international.',
    nav: { archive: ['01 / Projects', 'Work / R&D / studies', 'Archive'], cv: ['02 / Experience', 'Career / tools', 'CV'], contact: ['03 / Contact', 'Projects / collaborations', 'Contact'] },
    archive: { eyebrow: 'Archive / 2016—2027', heading: 'PROJECT<br>ARCHIVE', intro: 'Installations, theatre video, live AV, software, simulations and realtime image studies.' },
    cvIntro: 'Professional experience across realtime audiovisual systems, stage video, projection, interactive light and media integration.',
    redirectHome: 'Home', redirectArchive: 'Archive'
  },
  fr: {
    practiceLabel: 'Pratique',
    heroEyebrow: 'Systèmes audiovisuels temps réel / production + creative technology',
    heroKicker: 'TouchDesigner / projection / lumière / systèmes scéniques',
    statement: 'Je conçois, programme et exploite des systèmes audiovisuels temps réel pour l’installation, la scène et le live.',
    statementCopy: 'TouchDesigner, projection, lumière, vidéo et show control — de la conception système et la programmation jusqu’à la calibration, l’intégration et l’exploitation sur site.',
    contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
    selectedLabel: 'Contextes sélectionnés',
    selectedHeading: 'Installé, joué<br>et exploité.',
    archiveLink: 'Archives ↗',
    capabilitiesLabel: 'Compétences',
    capabilitiesHeading: 'Du logiciel temps réel<br>à l’intégration sur site.',
    capabilitiesCopy: 'Programmation temps réel, projection, vidéo scénique, systèmes lumière et intégration média.',
    capabilityTags: ['TouchDesigner', 'SMODE + projection', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibration + soft edge', 'média en réseau', 'Fusion 360 + fabrication'],
    availabilityLabel: 'Disponible pour',
    availabilityHeading: 'Installations / scène / tournée / systèmes temps réel.',
    availabilityCopy: 'Annecy / Genève / France / Suisse / Europe / international.',
    nav: { archive: ['01 / Projets', 'Réalisé / R&D / études', 'Archives'], cv: ['02 / Expérience', 'Parcours / outils', 'CV'], contact: ['03 / Contact', 'Projets / collaborations', 'Contact'] },
    archive: { eyebrow: 'Archives / 2016—2027', heading: 'ARCHIVES<br>PROJETS', intro: 'Installations, vidéo théâtre, live AV, logiciels, simulations et études d’image temps réel.' },
    cvIntro: 'Expérience professionnelle en systèmes audiovisuels temps réel, vidéo scénique, projection, lumière interactive et intégration média.',
    redirectHome: 'Accueil', redirectArchive: 'Archives'
  },
  es: {
    practiceLabel: 'Práctica',
    heroEyebrow: 'Sistemas audiovisuales en tiempo real / producción + creative technology',
    heroKicker: 'TouchDesigner / proyección / luz / sistemas escénicos',
    statement: 'Diseño, programo y opero sistemas audiovisuales en tiempo real para instalaciones, escena y directo.',
    statementCopy: 'TouchDesigner, proyección, luz, vídeo y show control — desde el diseño del sistema y la programación hasta la calibración, integración y operación in situ.',
    contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
    selectedLabel: 'Contextos seleccionados',
    selectedHeading: 'Instalado, presentado<br>y operado.',
    archiveLink: 'Archivo ↗',
    capabilitiesLabel: 'Capacidades',
    capabilitiesHeading: 'Del software en tiempo real<br>a la integración in situ.',
    capabilitiesCopy: 'Programación en tiempo real, proyección, vídeo escénico, sistemas de luz e integración multimedia.',
    capabilityTags: ['TouchDesigner', 'SMODE + proyección', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibración + soft edge', 'media en red', 'Fusion 360 + fabricación'],
    availabilityLabel: 'Disponible para',
    availabilityHeading: 'Instalaciones / escena / gira / sistemas en tiempo real.',
    availabilityCopy: 'Annecy / Ginebra / Francia / Suiza / Europa / internacional.',
    nav: { archive: ['01 / Proyectos', 'Realizado / I+D / estudios', 'Archivo'], cv: ['02 / Experiencia', 'Trayectoria / herramientas', 'CV'], contact: ['03 / Contacto', 'Proyectos / colaboraciones', 'Contacto'] },
    archive: { eyebrow: 'Archivo / 2016—2027', heading: 'ARCHIVO<br>DE PROYECTOS', intro: 'Instalaciones, vídeo teatral, live AV, software, simulaciones y estudios de imagen en tiempo real.' },
    cvIntro: 'Experiencia profesional en sistemas audiovisuales en tiempo real, vídeo escénico, proyección, luz interactiva e integración multimedia.',
    redirectHome: 'Inicio', redirectArchive: 'Archivo'
  }
};

const projectRows = {
  en: [
    ['lumina','LUMINA / Geneva Lux','Geneva / StripLab / realtime systems + integration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
    ['grand-theatre','Grand Théâtre de Genève','Geneva / SMODE / projection integration / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
    ['comedie','Comédie de Genève / Video Systems','Geneva + touring / theatre video / creation / adaptation / operation','2021—23','./assets/media/comedie/venue.jpg','',''],
    ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / collaborative live AV / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
    ['stage-systems','Fun Radio Party / Chambéry','realtime video + lighting / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
  ],
  fr: [
    ['lumina','LUMINA / Geneva Lux','Genève / StripLab / systèmes temps réel + intégration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
    ['grand-theatre','Grand Théâtre de Genève','Genève / SMODE / intégration projection / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
    ['comedie','Comédie de Genève / Systèmes vidéo','Genève + tournée / vidéo théâtre / création / adaptation / exploitation','2021—23','./assets/media/comedie/venue.jpg','',''],
    ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / live AV collaboratif / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
    ['stage-systems','Fun Radio Party / Chambéry','vidéo + lumière temps réel / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
  ],
  es: [
    ['lumina','LUMINA / Geneva Lux','Ginebra / StripLab / sistemas en tiempo real + integración','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
    ['grand-theatre','Grand Théâtre de Genève','Ginebra / SMODE / integración de proyección / cues / calibración','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
    ['comedie','Comédie de Genève / Sistemas de vídeo','Ginebra + gira / vídeo teatral / creación / adaptación / operación','2021—23','./assets/media/comedie/venue.jpg','',''],
    ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / live AV colaborativo / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
    ['stage-systems','Fun Radio Party / Chambéry','vídeo + luz en tiempo real / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
  ]
};

const archiveEntries = {
  en: [
    ['2025—27','lumina','REALIZED','status-realized','LUMINA / Geneva Lux','Geneva / public installation / realtime systems + integration'],
    ['2026','snake','R&D','status-research','Snake / Networked Retro System','interactive software prototype / TouchDesigner / music sync / leaderboard'],
    ['2026','signal','SIMULATION','status-simulation','SIGNAL / Spatial Interaction Simulator','simulation only / spatial tracking / network / TouchDesigner architecture'],
    ['2026','ascii','STUDY','status-study','ASCII / Pixel Realtime Study','TouchDesigner / image reduction / computational study'],
    ['2025—26','realtime','R&D','status-research','Realtime Studies','audio-reactive / cellular systems / temporal image'],
    ['2023—24','grand-theatre','REALIZED','status-realized','Grand Théâtre de Genève','Geneva / SMODE / projection / cues / calibration'],
    ['2021—23','comedie','REALIZED','status-realized','Comédie de Genève / Video Systems','Geneva + touring / theatre video / adaptation / operation'],
    ['2018','cloud','STUDY','status-study','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / transformed timelapse'],
    ['2016—18','hardwinner','REALIZED','status-realized','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX'],
    ['2016','stage-systems','REALIZED','status-realized','Fun Radio Party / Chambéry','realtime video-light / TouchDesigner + Resolume']
  ],
  fr: [
    ['2025—27','lumina','RÉALISÉ','status-realized','LUMINA / Geneva Lux','Genève / installation publique / systèmes temps réel + intégration'],
    ['2026','snake','R&D','status-research','Snake / Networked Retro System','prototype logiciel interactif / TouchDesigner / synchro musicale / leaderboard'],
    ['2026','signal','SIMULATION','status-simulation','SIGNAL / Spatial Interaction Simulator','simulation uniquement / tracking spatial / réseau / architecture TouchDesigner'],
    ['2026','ascii','ÉTUDE','status-study','ASCII / Pixel Realtime Study','TouchDesigner / réduction d’image / étude computationnelle'],
    ['2025—26','realtime','R&D','status-research','Realtime Studies','audio-réactif / systèmes cellulaires / image temporelle'],
    ['2023—24','grand-theatre','RÉALISÉ','status-realized','Grand Théâtre de Genève','Genève / SMODE / projection / cues / calibration'],
    ['2021—23','comedie','RÉALISÉ','status-realized','Comédie de Genève / Systèmes vidéo','Genève + tournée / vidéo théâtre / adaptation / exploitation'],
    ['2018','cloud','ÉTUDE','status-study','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / timelapse transformé'],
    ['2016—18','hardwinner','RÉALISÉ','status-realized','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX'],
    ['2016','stage-systems','RÉALISÉ','status-realized','Fun Radio Party / Chambéry','vidéo-lumière temps réel / TouchDesigner + Resolume']
  ],
  es: [
    ['2025—27','lumina','REALIZADO','status-realized','LUMINA / Geneva Lux','Ginebra / instalación pública / sistemas en tiempo real + integración'],
    ['2026','snake','I+D','status-research','Snake / Networked Retro System','prototipo de software interactivo / TouchDesigner / sincronización musical / leaderboard'],
    ['2026','signal','SIMULACIÓN','status-simulation','SIGNAL / Spatial Interaction Simulator','solo simulación / tracking espacial / red / arquitectura TouchDesigner'],
    ['2026','ascii','ESTUDIO','status-study','ASCII / Pixel Realtime Study','TouchDesigner / reducción de imagen / estudio computacional'],
    ['2025—26','realtime','I+D','status-research','Realtime Studies','audio-reactivo / sistemas celulares / imagen temporal'],
    ['2023—24','grand-theatre','REALIZADO','status-realized','Grand Théâtre de Genève','Ginebra / SMODE / proyección / cues / calibración'],
    ['2021—23','comedie','REALIZADO','status-realized','Comédie de Genève / Sistemas de vídeo','Ginebra + gira / vídeo teatral / adaptación / operación'],
    ['2018','cloud','ESTUDIO','status-study','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / timelapse transformado'],
    ['2016—18','hardwinner','REALIZADO','status-realized','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX'],
    ['2016','stage-systems','REALIZADO','status-realized','Fun Radio Party / Chambéry','vídeo-luz en tiempo real / TouchDesigner + Resolume']
  ]
};

const esc = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const href = (v, file) => `${v.rel}${file}`;

function open(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  return { file, $: load(fs.readFileSync(file,'utf8'), { decodeEntities:false }) };
}
function save(ctx) { fs.writeFileSync(ctx.file, ctx.$.html(), 'utf8'); }
function setMeta($, title, description, canonical) {
  $('title').text(title);
  $('meta[name="description"]').attr('content', description);
  $('link[rel="canonical"]').attr('href', canonical);
  $('meta[property="og:title"]').attr('content', title);
  $('meta[property="og:description"]').attr('content', description);
  $('meta[property="og:url"]').attr('content', canonical);
  $('meta[name="twitter:title"]').attr('content', title);
  $('meta[name="twitter:description"]').attr('content', description);
}
function renderHomeRows(v) {
  return projectRows[v.lang].map((r,i) => {
    const video = r[5] ? ` data-preview-video="${r[5]}"` : '';
    const videos = r[6] ? ` data-preview-videos="${r[6]}"` : '';
    return `<a class="index-row" href="${href(v,`projects/${r[0]}.html`)}" data-preview-poster="${r[4]}"${video}${videos}><span>0${i+1}</span><div><strong>${r[1]}</strong><small>${r[2]}</small></div><time>${r[3]}</time></a>`;
  }).join('\n');
}
function renderArchive(v) {
  return archiveEntries[v.lang].map(r => `<div class="archive-year reveal"><div class="archive-year-head"><time>${r[0]}</time><span>${r[2]}</span></div><div class="archive-list"><a class="archive-entry" href="${href(v,`projects/${r[1]}.html`)}"><span class="archive-status ${r[3]}">${r[2]}</span><div><strong>${r[4]}</strong><small>${r[5]}</small></div><time>${r[0]}</time></a></div></div>`).join('');
}
function redirectPage(v, rel, target, label, canonical) {
  const ctx = open(`${v.rel}${rel}`);
  if (!ctx) return;
  const { $ } = ctx;
  $('meta[name="robots"]').attr('content','noindex,follow');
  $('link[rel="canonical"]').attr('href', canonical);
  $('meta[property="og:url"]').attr('content', canonical);
  $('meta[http-equiv="refresh"]').remove();
  $('head').append(`<meta http-equiv="refresh" content="0;url=${target}">`);
  $('main').first().replaceWith(`<main id="main"><header class="page-intro reveal"><h1>DATA<br>C0RE</h1><p><a href="${target}">${label} ↗</a></p></header></main>`);
  save(ctx);
}

for (const v of variants) {
  const c = copy[v.lang];

  // HOME — the portfolio front door: practice, proof, capabilities, availability.
  let ctx = open(`${v.rel}index.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.hero h1').first().html('DATA<br>C0RE');
    $('.hero .eyebrow').first().text(c.heroEyebrow);
    $('.hero-kicker').first().text(c.heroKicker);

    const statement = `<section class="home-statement" id="practice"><div class="home-statement-grid"><div class="reveal"><p class="eyebrow">${c.practiceLabel}</p><h2>${c.statement}</h2></div><div class="reveal"><p class="home-statement-copy">${c.statementCopy}</p><div class="field-line">${c.contexts.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></div></section>`;
    $('section.home-statement').first().replaceWith(statement);

    const selected = `<section class="home-work"><div class="section-head reveal"><div><p class="eyebrow">${c.selectedLabel}</p><h2>${c.selectedHeading}</h2></div><a href="${href(v,'archive.html')}">${c.archiveLink}</a></div><div class="index-browser"><div class="index-list reveal">${renderHomeRows(v)}</div><figure class="index-preview index-preview--motion reveal" data-hover-preview-stage><img src="./assets/media/lumina/tunnel-blue.webp" alt="Selected project preview" data-hover-preview-poster><video muted loop playsinline preload="metadata" aria-hidden="true" data-hover-preview-video></video></figure></div></section>`;
    $('section.home-work').first().replaceWith(selected);

    const capabilities = `<section class="page-section home-capabilities"><p class="eyebrow reveal">${c.capabilitiesLabel}</p><h2 class="reveal">${c.capabilitiesHeading}</h2><div class="about-grid"><p class="reveal">${c.capabilitiesCopy}</p><div class="skills reveal">${c.capabilityTags.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></section>`;
    const availability = `<section class="home-direction"><div class="reveal"><p class="eyebrow accent-acid">${c.availabilityLabel}</p><h2>${c.availabilityHeading}</h2><p>${c.availabilityCopy}</p><div class="social-contact"><a href="${href(v,'archive.html')}">${c.nav.archive[2]} ↗</a><a href="${href(v,'cv.html')}">CV ↗</a><a href="${href(v,'contact.html')}">${c.nav.contact[2]} ↗</a></div></div></section>`;
    $('section.home-direction').first().replaceWith(capabilities + availability);

    const title = v.lang === 'fr' ? 'DATA C0RE — Systèmes audiovisuels temps réel, projection & scène' : v.lang === 'es' ? 'DATA C0RE — Sistemas audiovisuales en tiempo real, proyección y escena' : 'DATA C0RE — Realtime Audiovisual Systems, Projection & Stage Media';
    const desc = v.lang === 'fr' ? 'DATA C0RE conçoit, programme et exploite des systèmes audiovisuels temps réel pour installation, théâtre, projection et live AV, avec des expériences à Genève, Grenoble et Chambéry.' : v.lang === 'es' ? 'DATA C0RE diseña, programa y opera sistemas audiovisuales en tiempo real para instalación, teatro, proyección y live AV, con experiencia en Ginebra, Grenoble y Chambéry.' : 'DATA C0RE designs, programs and operates realtime audiovisual systems for installation, theatre, projection and live AV, with experience across Geneva, Grenoble and Chambéry.';
    const canonical = v.rel === '' ? 'https://datac0re.is-a.dev/' : `https://datac0re.is-a.dev/${v.rel}`;
    setMeta($, title, desc, canonical);
    save(ctx);
  }

  // ARCHIVE — one chronological catalogue. Status labels do the sorting work.
  ctx = open(`${v.rel}archive.html`);
  if (ctx) {
    const { $ } = ctx;
    const legend = v.lang === 'fr' ? ['RÉALISÉ','R&D','SIMULATION','ÉTUDE'] : v.lang === 'es' ? ['REALIZADO','I+D','SIMULACIÓN','ESTUDIO'] : ['REALIZED','R&D','SIMULATION','STUDY'];
    const main = `<main id="main"><header class="page-intro archive-intro reveal"><p class="eyebrow">${c.archive.eyebrow}</p><h1>${c.archive.heading}</h1><p>${c.archive.intro}</p><div class="archive-legend"><span class="archive-status status-realized">${legend[0]}</span><span class="archive-status status-research">${legend[1]}</span><span class="archive-status status-simulation">${legend[2]}</span><span class="archive-status status-study">${legend[3]}</span></div></header><section class="archive-shell">${renderArchive(v)}</section></main>`;
    $('main').first().replaceWith(main);
    $('.global-footer > span').first().text('DATA C0RE / ARCHIVE');
    const title = v.lang === 'fr' ? 'Archives — installations, scène, live AV & R&D — DATA C0RE' : v.lang === 'es' ? 'Archivo — instalaciones, escena, live AV e I+D — DATA C0RE' : 'Archive — Installations, Stage, Live AV & R&D — DATA C0RE';
    const desc = v.lang === 'fr' ? 'Archives DATA C0RE : installations, vidéo théâtre, live AV, TouchDesigner, projection, logiciels, simulations et études temps réel.' : v.lang === 'es' ? 'Archivo DATA C0RE: instalaciones, vídeo teatral, live AV, TouchDesigner, proyección, software, simulaciones y estudios en tiempo real.' : 'DATA C0RE archive: installations, theatre video, live AV, TouchDesigner, projection, software, simulations and realtime studies.';
    setMeta($, title, desc, `https://datac0re.is-a.dev/${v.rel}archive.html`);
    save(ctx);
  }

  // CV — remove portfolio/profile duplication; keep professional evidence.
  ctx = open(`${v.rel}cv.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.cv-section--tight').first().remove();
    $('.project-grid').first().closest('.cv-section').remove();
    $('.cv-intro > p').not('.eyebrow').first().text(c.cvIntro);
    save(ctx);
  }

  // Legacy top-level pages no longer carry parallel editorial content.
  redirectPage(v, 'work.html', v.homePath, c.redirectHome, v.rel === '' ? 'https://datac0re.is-a.dev/' : `https://datac0re.is-a.dev/${v.rel}`);
  redirectPage(v, 'about.html', v.homePath, c.redirectHome, v.rel === '' ? 'https://datac0re.is-a.dev/' : `https://datac0re.is-a.dev/${v.rel}`);
  redirectPage(v, 'services.html', v.homePath, c.redirectHome, v.rel === '' ? 'https://datac0re.is-a.dev/' : `https://datac0re.is-a.dev/${v.rel}`);
  redirectPage(v, 'lab.html', v.archivePath, c.redirectArchive, `https://datac0re.is-a.dev/${v.rel}archive.html`);
}

function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
    const full = path.join(dir,entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

// Three destinations everywhere. Brand = Home.
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT,file).replaceAll('\\','/');
  const lang = rel.startsWith('fr/') ? 'fr' : rel.startsWith('es/') ? 'es' : 'en';
  const v = variants.find(x => x.lang === lang && (x.rel === '' ? !/^(en|fr|es)\//.test(rel) : rel.startsWith(x.rel))) || variants[0];
  const c = copy[lang];
  const $ = load(fs.readFileSync(file,'utf8'), {decodeEntities:false});

  const current = rel.endsWith('archive.html') ? 'archive' : rel.endsWith('cv.html') ? 'cv' : rel.endsWith('contact.html') ? 'contact' : '';
  const card = (key, hrefValue) => {
    const spec = c.nav[key];
    return `<a class="menu-card menu-card--${key}${current===key?' is-current':''}" href="${hrefValue}" aria-label="${esc(spec[2])}"${current===key?' aria-current="page"':''}${key==='contact'?' data-contact-nav="1"':''}><span class="menu-card-meta" aria-hidden="true"><b>${spec[0]}</b><small>${spec[1]}</small></span><span class="menu-card-title">${spec[2]}</span><span class="menu-card-arrow" aria-hidden="true">↗</span></a>`;
  };
  $('.menu-links').first().html(card('archive',href(v,'archive.html')) + card('cv',href(v,'cv.html')) + card('contact',href(v,'contact.html')));
  $('.menu-label').first().text('DATA C0RE / INDEX');

  const actions = $('.header-actions').first();
  actions.find('.nav-text').not('.contact-direct').remove();
  const contactDirect = actions.find('.contact-direct').first();
  const archiveDirect = `<a class="nav-text" href="${href(v,'archive.html')}">${c.nav.archive[2]}</a>`;
  if (contactDirect.length) contactDirect.before(archiveDirect); else actions.prepend(archiveDirect);

  const footerLinks = $('.global-footer > div').first();
  if (footerLinks.length) {
    const instagram = footerLinks.find('a[href*="instagram.com"]').first().prop('outerHTML') || '';
    const github = footerLinks.find('a[href*="github.com"]').first().prop('outerHTML') || '';
    footerLinks.html(`<a href="${href(v,'archive.html')}">${c.nav.archive[2]}</a><a href="${href(v,'cv.html')}">CV</a>${instagram}${github}`);
  }

  fs.writeFileSync(file,$.html(),'utf8');
}

// Remove obsolete top-level editorial routes from the sitemap.
const sitemap = path.join(ROOT,'sitemap.xml');
if (fs.existsSync(sitemap)) {
  let xml = fs.readFileSync(sitemap,'utf8');
  for (const route of ['work','about','services','lab']) {
    const re = new RegExp(`\\s*<url>\\s*<loc>https:\\/\\/datac0re\\.is-a\\.dev\\/(?:en\\/|fr\\/|es\\/)?${route}\\.html<\\/loc>[\\s\\S]*?<\\/url>`,'g');
    xml = xml.replace(re,'');
  }
  fs.writeFileSync(sitemap,xml,'utf8');
}

console.log('Portfolio V2: Home + Archive + CV + Contact, with one detailed page per project and legacy redirects only.');
