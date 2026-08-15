import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();

const copy = {
  en: {
    home: {
      eyebrow: 'Realtime audiovisual systems / production + creative technology',
      statement: 'I design, program and operate realtime audiovisual systems for installations, stages and live performance.',
      statementCopy: 'The work connects TouchDesigner, projection, light, video and show control — from system design and programming to calibration, integration and operation on site.',
      contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
      selectedEyebrow: 'Selected realized contexts',
      selectedHeading: 'Work that existed<br>in real spaces.',
      selectedLink: 'View realized work ↗',
      capabilitiesEyebrow: 'Capabilities',
      capabilitiesHeading: 'From realtime software<br>to on-site integration.',
      capabilitiesCopy: 'Creative and technical practice spanning realtime programming, projection, stage video, light systems and media integration.',
      capabilityTags: ['TouchDesigner', 'SMODE + projection', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibration + soft edge', 'networked media', 'Fusion 360 + fabrication'],
      nextEyebrow: 'Explore',
      nextHeading: 'Case studies first.<br>The full history stays in the archive.',
      nextCopy: 'Work contains the strongest delivered and operated projects. Archive keeps prototypes, simulations, studies and the wider project history without mixing them into the first impression.',
      links: ['Work ↗', 'Archive ↗', 'About ↗', 'Contact ↗']
    },
    work: {
      eyebrow: 'Realized work / selected contexts',
      heading: 'BUILT<br>IN CONTEXT',
      intro: 'Selected professional and collaborative work across public installation, theatre, opera, projection, live AV and stage systems.',
      archive: 'Full project archive ↗'
    },
    archive: {
      eyebrow: 'Archive / complete project index',
      heading: 'PROJECT<br>ARCHIVE',
      intro: 'One index for the wider practice: realized work first, then prototypes, simulations, studies and R&D. No separate Lab section.',
      realized: 'Realized / professional contexts',
      research: 'R&D / studies / simulations'
    },
    menu: {
      home: ['00 / Overview', 'Identity / selected work', 'Home'],
      work: ['01 / Realized', 'Case studies / contexts', 'Work'],
      archive: ['02 / Full index', 'Projects / R&D / studies', 'Archive'],
      about: ['03 / Practice', 'Approach / direction', 'About'],
      cv: ['04 / Experience', 'Career / tools', 'CV'],
      contact: ['05 / Contact', 'Projects / production', 'Contact']
    },
    archiveLabel: 'Archive'
  },
  fr: {
    home: {
      eyebrow: 'Systèmes audiovisuels temps réel / production + creative technology',
      statement: 'Je conçois, programme et exploite des systèmes audiovisuels temps réel pour l’installation, la scène et le live.',
      statementCopy: 'La pratique relie TouchDesigner, projection, lumière, vidéo et show control — de la conception système et la programmation jusqu’à la calibration, l’intégration et l’exploitation sur site.',
      contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
      selectedEyebrow: 'Contextes réalisés sélectionnés',
      selectedHeading: 'Du travail qui a existé<br>dans des lieux réels.',
      selectedLink: 'Voir les travaux réalisés ↗',
      capabilitiesEyebrow: 'Compétences',
      capabilitiesHeading: 'Du logiciel temps réel<br>à l’intégration sur site.',
      capabilitiesCopy: 'Une pratique créative et technique qui couvre programmation temps réel, projection, vidéo scénique, systèmes lumière et intégration média.',
      capabilityTags: ['TouchDesigner', 'SMODE + projection', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibration + soft edge', 'média en réseau', 'Fusion 360 + fabrication'],
      nextEyebrow: 'Explorer',
      nextHeading: 'Les case studies d’abord.<br>L’historique complet dans les archives.',
      nextCopy: 'Travaux rassemble les projets les plus solides, livrés ou exploités. Archives conserve prototypes, simulations, études et historique sans les mélanger à la première impression.',
      links: ['Travaux ↗', 'Archives ↗', 'À propos ↗', 'Contact ↗']
    },
    work: {
      eyebrow: 'Travaux réalisés / contextes sélectionnés',
      heading: 'RÉALISÉ<br>EN CONTEXTE',
      intro: 'Sélection de travaux professionnels et collaboratifs entre installation publique, théâtre, opéra, projection, live AV et systèmes scéniques.',
      archive: 'Archives complètes ↗'
    },
    archive: {
      eyebrow: 'Archives / index complet des projets',
      heading: 'ARCHIVES<br>PROJETS',
      intro: 'Un seul index pour la pratique élargie : réalisations d’abord, puis prototypes, simulations, études et R&D. Plus de section Lab séparée.',
      realized: 'Réalisé / contextes professionnels',
      research: 'R&D / études / simulations'
    },
    menu: {
      home: ['00 / Vue d’ensemble', 'Identité / sélection', 'Accueil'],
      work: ['01 / Réalisé', 'Case studies / contextes', 'Travaux'],
      archive: ['02 / Index complet', 'Projets / R&D / études', 'Archives'],
      about: ['03 / Pratique', 'Approche / direction', 'À propos'],
      cv: ['04 / Expérience', 'Parcours / outils', 'CV'],
      contact: ['05 / Contact', 'Projets / production', 'Contact']
    },
    archiveLabel: 'Archives'
  },
  es: {
    home: {
      eyebrow: 'Sistemas audiovisuales en tiempo real / producción + creative technology',
      statement: 'Diseño, programo y opero sistemas audiovisuales en tiempo real para instalaciones, escena y directo.',
      statementCopy: 'La práctica conecta TouchDesigner, proyección, luz, vídeo y show control — desde el diseño del sistema y la programación hasta la calibración, integración y operación in situ.',
      contexts: ['Geneva Lux / StripLab', 'Grand Théâtre de Genève', 'Comédie de Genève', 'Hardwinner / La Belle Électrique', 'Fun Radio / Chambéry'],
      selectedEyebrow: 'Contextos realizados seleccionados',
      selectedHeading: 'Trabajo que existió<br>en espacios reales.',
      selectedLink: 'Ver trabajo realizado ↗',
      capabilitiesEyebrow: 'Capacidades',
      capabilitiesHeading: 'Del software en tiempo real<br>a la integración in situ.',
      capabilitiesCopy: 'Una práctica creativa y técnica que abarca programación en tiempo real, proyección, vídeo escénico, sistemas de luz e integración multimedia.',
      capabilityTags: ['TouchDesigner', 'SMODE + proyección', 'Resolume + live AV', 'LED / DMX / Art-Net', 'show control', 'calibración + soft edge', 'media en red', 'Fusion 360 + fabricación'],
      nextEyebrow: 'Explorar',
      nextHeading: 'Primero los case studies.<br>El historial completo queda en el archivo.',
      nextCopy: 'Trabajo reúne los proyectos más sólidos, entregados u operados. Archivo conserva prototipos, simulaciones, estudios e historial sin mezclarlos con la primera impresión.',
      links: ['Trabajo ↗', 'Archivo ↗', 'Acerca de ↗', 'Contacto ↗']
    },
    work: {
      eyebrow: 'Trabajo realizado / contextos seleccionados',
      heading: 'REALIZADO<br>EN CONTEXTO',
      intro: 'Selección de trabajo profesional y colaborativo entre instalación pública, teatro, ópera, proyección, live AV y sistemas escénicos.',
      archive: 'Archivo completo ↗'
    },
    archive: {
      eyebrow: 'Archivo / índice completo de proyectos',
      heading: 'ARCHIVO<br>DE PROYECTOS',
      intro: 'Un único índice para la práctica ampliada: realizaciones primero, después prototipos, simulaciones, estudios e I+D. Sin una sección Lab separada.',
      realized: 'Realizado / contextos profesionales',
      research: 'I+D / estudios / simulaciones'
    },
    menu: {
      home: ['00 / Vista general', 'Identidad / selección', 'Inicio'],
      work: ['01 / Realizado', 'Case studies / contextos', 'Trabajo'],
      archive: ['02 / Índice completo', 'Proyectos / I+D / estudios', 'Archivo'],
      about: ['03 / Práctica', 'Enfoque / dirección', 'Acerca de'],
      cv: ['04 / Experiencia', 'Trayectoria / herramientas', 'CV'],
      contact: ['05 / Contacto', 'Proyectos / producción', 'Contacto']
    },
    archiveLabel: 'Archivo'
  }
};

const variants = [
  { rel: '', lang: 'en' },
  { rel: 'en/', lang: 'en' },
  { rel: 'fr/', lang: 'fr' },
  { rel: 'es/', lang: 'es' }
];

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const h = (v, file) => `${v.rel}${file}`;

function open(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  return { file, $: load(fs.readFileSync(file, 'utf8'), { decodeEntities: false }) };
}
function save(ctx) { fs.writeFileSync(ctx.file, ctx.$.html(), 'utf8'); }
function meta($, title, description, canonical) {
  $('title').text(title);
  $('meta[name="description"]').attr('content', description);
  $('link[rel="canonical"]').attr('href', canonical);
  $('meta[property="og:title"]').attr('content', title);
  $('meta[property="og:description"]').attr('content', description);
  $('meta[property="og:url"]').attr('content', canonical);
  $('meta[name="twitter:title"]').attr('content', title);
  $('meta[name="twitter:description"]').attr('content', description);
}

function homeRows(v, lang) {
  const rows = {
    en: [
      ['lumina','LUMINA / Geneva Lux','Geneva / StripLab / realtime systems + integration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Geneva / SMODE / projection integration / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / collaborative live AV / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','stage design / realtime video + lighting / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ],
    fr: [
      ['lumina','LUMINA / Geneva Lux','Genève / StripLab / systèmes temps réel + intégration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Genève / SMODE / intégration projection / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / live AV collaboratif / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','stage design / vidéo + lumière temps réel / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ],
    es: [
      ['lumina','LUMINA / Geneva Lux','Ginebra / StripLab / sistemas en tiempo real + integración','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Ginebra / SMODE / integración de proyección / cues / calibración','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / live AV colaborativo / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','stage design / vídeo + luz en tiempo real / TouchDesigner + Resolume','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ]
  }[lang];
  return rows.map((r, i) => {
    const video = r[5] ? ` data-preview-video="${r[5]}"` : '';
    const videos = r[6] ? ` data-preview-videos="${r[6]}"` : '';
    return `<a class="index-row" href="${h(v, `projects/${r[0]}.html`)}" data-preview-poster="${r[4]}"${video}${videos}><span>0${i+1}</span><div><strong>${r[1]}</strong><small>${r[2]}</small></div><time>${r[3]}</time></a>`;
  }).join('\n');
}

function workRows(v, lang) {
  const rows = {
    en: [
      ['lumina','LUMINA / Geneva Lux','Geneva / StripLab / collaborative public installation / realtime systems + integration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Geneva / SMODE programmer / projection integration / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['comedie','Comédie de Genève / Video Systems','Geneva + touring / theatre video / creation / adaptation / operation','2021—23','./assets/media/comedie/venue.jpg','',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / core collaborative contribution / live AV / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','realtime video + lighting system / TouchDesigner / Resolume / video-light sync','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ],
    fr: [
      ['lumina','LUMINA / Geneva Lux','Genève / StripLab / installation publique collaborative / systèmes temps réel + intégration','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Genève / programmation SMODE / intégration projection / cues / calibration','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['comedie','Comédie de Genève / Systèmes vidéo','Genève + tournée / vidéo théâtre / création / adaptation / exploitation','2021—23','./assets/media/comedie/venue.jpg','',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / contribution collaborative centrale / live AV / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','système vidéo + lumière temps réel / TouchDesigner / Resolume / synchro vidéo-lumière','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ],
    es: [
      ['lumina','LUMINA / Geneva Lux','Ginebra / StripLab / instalación pública colaborativa / sistemas en tiempo real + integración','2025—27','./assets/media/lumina/tunnel-blue.webp','./assets/media/lumina/experience-long.mp4?v=20260809-2',''],
      ['grand-theatre','Grand Théâtre de Genève','Ginebra / programación SMODE / integración de proyección / cues / calibración','2023—24','./assets/media/grand-theatre/hero.webp','./assets/media/grand-theatre/loop.mp4',''],
      ['comedie','Comédie de Genève / Sistemas de vídeo','Ginebra + gira / vídeo teatral / creación / adaptación / operación','2021—23','./assets/media/comedie/venue.jpg','',''],
      ['hardwinner','Hardwinner / La Belle Électrique','Grenoble / contribución colaborativa central / live AV / TouchDesigner / GLSL / LED + DMX','2016—18','./assets/media/hardwinner/lbe-2018.webp','','./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4'],
      ['stage-systems','Fun Radio Party / Chambéry','sistema de vídeo + luz en tiempo real / TouchDesigner / Resolume / sincronización vídeo-luz','2016','./assets/media/stage/funradio-wide.webp','','./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4']
    ]
  }[lang];
  return rows.map((r, i) => {
    const video = r[5] ? ` data-work-preview-video="${r[5]}"` : '';
    const videos = r[6] ? ` data-work-preview-videos="${r[6]}"` : '';
    return `<a class="index-row" href="${h(v, `projects/${r[0]}.html`)}" data-work-preview-poster="${r[4]}"${video}${videos}><span>0${i+1}</span><div><strong>${r[1]}</strong><small>${r[2]}</small></div><time>${r[3]}</time></a>`;
  }).join('\n');
}

function archiveRows(v, lang) {
  const a = lang === 'fr' ? {
    realized: [
      ['lumina','RÉALISÉ','LUMINA / Geneva Lux','Genève / StripLab / installation publique / systèmes temps réel + intégration','2025—27'],
      ['grand-theatre','RÉALISÉ','Grand Théâtre de Genève','Genève / SMODE / projection / cues / calibration','2023—24'],
      ['comedie','RÉALISÉ','Comédie de Genève / Systèmes vidéo','Genève + tournée / vidéo théâtre / adaptation / exploitation','2021—23'],
      ['hardwinner','RÉALISÉ','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX','2016—18'],
      ['stage-systems','RÉALISÉ','Fun Radio Party / Chambéry','stage design / vidéo-lumière temps réel / TouchDesigner + Resolume','2016']
    ],
    research: [
      ['snake','R&D','Snake / Networked Retro System','prototype logiciel interactif solo / TouchDesigner / synchro musicale / leaderboard','2026','status-research'],
      ['signal','SIMULATION','SIGNAL / Spatial Interaction Simulator','simulation uniquement / tracking spatial / réseau / architecture TouchDesigner','2026','status-simulation'],
      ['ascii','ÉTUDE','ASCII / Pixel Realtime Study','TouchDesigner / réduction d’image / étude computationnelle','2026','status-study'],
      ['realtime','R&D','Realtime Studies','audio-réactif / systèmes cellulaires / image temporelle','2025—26','status-research'],
      ['cloud','ÉTUDE','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / timelapse transformé','2018','status-study']
    ]
  } : lang === 'es' ? {
    realized: [
      ['lumina','REALIZADO','LUMINA / Geneva Lux','Ginebra / StripLab / instalación pública / sistemas en tiempo real + integración','2025—27'],
      ['grand-theatre','REALIZADO','Grand Théâtre de Genève','Ginebra / SMODE / proyección / cues / calibración','2023—24'],
      ['comedie','REALIZADO','Comédie de Genève / Sistemas de vídeo','Ginebra + gira / vídeo teatral / adaptación / operación','2021—23'],
      ['hardwinner','REALIZADO','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX','2016—18'],
      ['stage-systems','REALIZADO','Fun Radio Party / Chambéry','stage design / vídeo-luz en tiempo real / TouchDesigner + Resolume','2016']
    ],
    research: [
      ['snake','I+D','Snake / Networked Retro System','prototipo de software interactivo solo / TouchDesigner / sincronización musical / leaderboard','2026','status-research'],
      ['signal','SIMULACIÓN','SIGNAL / Spatial Interaction Simulator','solo simulación / tracking espacial / red / arquitectura TouchDesigner','2026','status-simulation'],
      ['ascii','ESTUDIO','ASCII / Pixel Realtime Study','TouchDesigner / reducción de imagen / estudio computacional','2026','status-study'],
      ['realtime','I+D','Realtime Studies','audio-reactivo / sistemas celulares / imagen temporal','2025—26','status-research'],
      ['cloud','ESTUDIO','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / timelapse transformado','2018','status-study']
    ]
  } : {
    realized: [
      ['lumina','REALIZED','LUMINA / Geneva Lux','Geneva / StripLab / public installation / realtime systems + integration','2025—27'],
      ['grand-theatre','REALIZED','Grand Théâtre de Genève','Geneva / SMODE / projection / cues / calibration','2023—24'],
      ['comedie','REALIZED','Comédie de Genève / Video Systems','Geneva + touring / theatre video / adaptation / operation','2021—23'],
      ['hardwinner','REALIZED','Hardwinner / La Belle Électrique','Grenoble / live AV / TouchDesigner / GLSL / LED + DMX','2016—18'],
      ['stage-systems','REALIZED','Fun Radio Party / Chambéry','stage design / realtime video-light / TouchDesigner + Resolume','2016']
    ],
    research: [
      ['snake','R&D','Snake / Networked Retro System','solo interactive software prototype / TouchDesigner / music sync / leaderboard','2026','status-research'],
      ['signal','SIMULATION','SIGNAL / Spatial Interaction Simulator','simulation only / spatial tracking / network / TouchDesigner architecture','2026','status-simulation'],
      ['ascii','STUDY','ASCII / Pixel Realtime Study','TouchDesigner / image reduction / computational study','2026','status-study'],
      ['realtime','R&D','Realtime Studies','audio-reactive / cellular systems / temporal image','2025—26','status-research'],
      ['cloud','STUDY','Cloud Processing / Anisotropic GLSL','TouchDesigner / GLSL / transformed timelapse','2018','status-study']
    ]
  };
  const render = (rows, defaultClass) => rows.map(r => `<a class="archive-entry" href="${h(v, `projects/${r[0]}.html`)}"><span class="archive-status ${r[5] || defaultClass}">${r[1]}</span><div><strong>${r[2]}</strong><small>${r[3]}</small></div><time>${r[4]}</time></a>`).join('\n');
  return { realized: render(a.realized, 'status-realized'), research: render(a.research, 'status-research') };
}

for (const v of variants) {
  const c = copy[v.lang];

  // HOME — proof and skills first; experiments removed from first impression.
  let ctx = open(`${v.rel}index.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.hero h1').first().html('DATA<br>C0RE');
    $('.hero .eyebrow').first().text(c.home.eyebrow);
    const kicker = v.lang === 'fr' ? 'TouchDesigner / projection / lumière / systèmes scéniques' : v.lang === 'es' ? 'TouchDesigner / proyección / luz / sistemas escénicos' : 'TouchDesigner / projection / light / stage systems';
    $('.hero-kicker').first().text(kicker);

    const statement = `<section class="home-statement" id="practice"><div class="home-statement-grid"><div class="reveal"><p class="eyebrow">${v.lang === 'fr' ? 'Pratique' : v.lang === 'es' ? 'Práctica' : 'Practice'}</p><h2>${c.home.statement}</h2></div><div class="reveal"><p class="home-statement-copy">${c.home.statementCopy}</p><div class="field-line">${c.home.contexts.map(x => `<span>${esc(x)}</span>`).join('')}</div></div></div></section>`;
    $('section.home-statement').first().replaceWith(statement);

    const selected = `<section class="home-work"><div class="section-head reveal"><div><p class="eyebrow">${c.home.selectedEyebrow}</p><h2>${c.home.selectedHeading}</h2></div><a href="${h(v,'work.html')}">${c.home.selectedLink}</a></div><div class="index-browser"><div class="index-list reveal">${homeRows(v,v.lang)}</div><figure class="index-preview index-preview--motion reveal" data-hover-preview-stage><img src="./assets/media/lumina/tunnel-blue.webp" alt="Selected realized project preview" data-hover-preview-poster><video muted loop playsinline preload="metadata" aria-hidden="true" data-hover-preview-video></video></figure></div></section>`;
    $('section.home-work').first().replaceWith(selected);

    const capabilities = `<section class="page-section home-capabilities"><p class="eyebrow reveal">${c.home.capabilitiesEyebrow}</p><h2 class="reveal">${c.home.capabilitiesHeading}</h2><div class="about-grid"><p class="reveal">${c.home.capabilitiesCopy}</p><div class="skills reveal">${c.home.capabilityTags.map(x => `<span>${esc(x)}</span>`).join('')}</div></div></section>`;
    const next = `<section class="home-direction"><div class="reveal"><p class="eyebrow accent-acid">${c.home.nextEyebrow}</p><h2>${c.home.nextHeading}</h2><p>${c.home.nextCopy}</p><div class="social-contact"><a href="${h(v,'work.html')}">${c.home.links[0]}</a><a href="${h(v,'archive.html')}">${c.home.links[1]}</a><a href="${h(v,'about.html')}">${c.home.links[2]}</a><a href="${h(v,'contact.html')}">${c.home.links[3]}</a></div></div></section>`;
    $('section.home-direction').first().replaceWith(capabilities + next);

    const title = v.lang === 'fr' ? 'DATA C0RE — Systèmes audiovisuels temps réel, projection & scène' : v.lang === 'es' ? 'DATA C0RE — Sistemas audiovisuales en tiempo real, proyección y escena' : 'DATA C0RE — Realtime Audiovisual Systems, Projection & Stage Media';
    const desc = v.lang === 'fr' ? 'DATA C0RE conçoit et exploite des systèmes audiovisuels temps réel pour installation, théâtre, opéra et live AV, avec des contextes à Genève, Grenoble et Chambéry.' : v.lang === 'es' ? 'DATA C0RE diseña y opera sistemas audiovisuales en tiempo real para instalación, teatro, ópera y live AV, con contextos en Ginebra, Grenoble y Chambéry.' : 'DATA C0RE designs and operates realtime audiovisual systems for installation, theatre, opera and live AV, with work across Geneva, Grenoble and Chambéry.';
    const canonical = v.rel === '' ? 'https://datac0re.is-a.dev/' : `https://datac0re.is-a.dev/${v.rel}`;
    meta($, title, desc, canonical);
    save(ctx);
  }

  // WORK — one clear list of strongest delivered / operated contexts.
  ctx = open(`${v.rel}work.html`);
  if (ctx) {
    const { $ } = ctx;
    const main = `<main id="main"><header class="page-intro reveal"><p class="eyebrow">${c.work.eyebrow}</p><h1>${c.work.heading}</h1><p>${c.work.intro}</p><div class="archive-shortcuts"><a href="${h(v,'archive.html')}">${c.work.archive}</a></div></header><section class="work-browser"><div class="index-browser"><div class="index-list reveal">${workRows(v,v.lang)}</div><figure class="index-preview index-preview--motion reveal" data-work-preview-stage><img src="./assets/media/lumina/tunnel-blue.webp" alt="Realized work preview" data-work-preview-poster><video muted loop playsinline preload="auto" aria-hidden="true" data-work-preview-video></video></figure></div></section></main>`;
    $('main').first().replaceWith(main);
    const title = v.lang === 'fr' ? 'Travaux réalisés — Installation, projection, live AV & systèmes scéniques — DATA C0RE' : v.lang === 'es' ? 'Trabajo realizado — Instalación, proyección, live AV y sistemas escénicos — DATA C0RE' : 'Realized Work — Installation, Projection, Live AV & Stage Systems — DATA C0RE';
    const desc = v.lang === 'fr' ? 'Case studies réalisés : Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, Hardwinner / La Belle Électrique et Fun Radio à Chambéry.' : v.lang === 'es' ? 'Case studies realizados: Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, Hardwinner / La Belle Électrique y Fun Radio en Chambéry.' : 'Realized case studies across Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, Hardwinner / La Belle Électrique and Fun Radio in Chambéry.';
    meta($, title, desc, `https://datac0re.is-a.dev/${v.rel}work.html`);
    save(ctx);
  }

  // ARCHIVE — realized + R&D in one place. No separate Lab IA.
  ctx = open(`${v.rel}archive.html`);
  if (ctx) {
    const { $ } = ctx;
    const rows = archiveRows(v,v.lang);
    const main = `<main id="main"><header class="page-intro archive-intro reveal"><p class="eyebrow">${c.archive.eyebrow}</p><h1>${c.archive.heading}</h1><p>${c.archive.intro}</p><div class="archive-legend"><span class="archive-status status-realized">${v.lang === 'fr' ? 'RÉALISÉ' : v.lang === 'es' ? 'REALIZADO' : 'REALIZED'}</span><span class="archive-status status-research">R&amp;D</span><span class="archive-status status-simulation">${v.lang === 'fr' ? 'SIMULATION' : v.lang === 'es' ? 'SIMULACIÓN' : 'SIMULATION'}</span><span class="archive-status status-study">${v.lang === 'fr' ? 'ÉTUDE' : v.lang === 'es' ? 'ESTUDIO' : 'STUDY'}</span></div></header><section class="archive-shell"><div class="archive-year reveal"><div class="archive-year-head"><time>01</time><span>${c.archive.realized}</span></div><div class="archive-list">${rows.realized}</div></div><div class="archive-year reveal"><div class="archive-year-head"><time>02</time><span>${c.archive.research}</span></div><div class="archive-list">${rows.research}</div></div></section></main>`;
    $('main').first().replaceWith(main);
    $('.global-footer > span').first().text('DATA C0RE / ARCHIVE');
    const title = v.lang === 'fr' ? 'Archives projets — Réalisations, R&D, études & simulations — DATA C0RE' : v.lang === 'es' ? 'Archivo de proyectos — Realizaciones, I+D, estudios y simulaciones — DATA C0RE' : 'Project Archive — Realized Work, R&D, Studies & Simulations — DATA C0RE';
    const desc = v.lang === 'fr' ? 'Index complet des projets DATA C0RE : réalisations professionnelles, systèmes live, prototypes, simulations, études TouchDesigner et R&D.' : v.lang === 'es' ? 'Índice completo de proyectos DATA C0RE: trabajo profesional, sistemas live, prototipos, simulaciones, estudios TouchDesigner e I+D.' : 'Complete DATA C0RE project index covering professional work, live systems, prototypes, simulations, TouchDesigner studies and R&D.';
    meta($, title, desc, `https://datac0re.is-a.dev/${v.rel}archive.html`);
    save(ctx);
  }

  // LAB — legacy route only, no longer part of information architecture.
  ctx = open(`${v.rel}lab.html`);
  if (ctx) {
    const { $ } = ctx;
    const target = h(v,'archive.html');
    $('meta[name="robots"]').attr('content','noindex,follow');
    $('link[rel="canonical"]').attr('href',`https://datac0re.is-a.dev/${v.rel}archive.html`);
    $('meta[http-equiv="refresh"]').remove();
    $('head').append(`<meta http-equiv="refresh" content="0;url=${target}">`);
    const heading = v.lang === 'fr' ? 'LAB EST DÉSORMAIS DANS LES ARCHIVES' : v.lang === 'es' ? 'LAB AHORA FORMA PARTE DEL ARCHIVO' : 'LAB NOW LIVES IN THE ARCHIVE';
    const body = v.lang === 'fr' ? 'R&D, simulations et études sont désormais rangées dans un seul index.' : v.lang === 'es' ? 'I+D, simulaciones y estudios ahora están organizados en un único índice.' : 'R&D, simulations and studies are now organized in one index.';
    $('main').first().replaceWith(`<main id="main"><header class="page-intro reveal"><p class="eyebrow">Archive</p><h1>${heading}</h1><p>${body}</p><div class="archive-shortcuts"><a href="${target}">${c.archiveLabel} ↗</a></div></header></main>`);
    save(ctx);
  }
}

// Simplify the global menu everywhere and route old Lab links to Archive.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT,file).replaceAll('\\','/');
  if (rel.includes('node_modules/')) continue;
  const lang = rel.startsWith('fr/') ? 'fr' : rel.startsWith('es/') ? 'es' : 'en';
  const c = copy[lang];
  const $ = load(fs.readFileSync(file,'utf8'), { decodeEntities:false });

  $('.menu-card--lab, .menu-card--services').remove();
  const specs = c.menu;
  for (const key of ['home','work','archive','about','cv','contact']) {
    const card = $(`.menu-card--${key}`).first();
    if (!card.length) continue;
    const spec = specs[key];
    card.find('.menu-card-meta b').first().text(spec[0]);
    card.find('.menu-card-meta small').first().text(spec[1]);
    card.find('.menu-card-title').first().text(spec[2]);
  }

  $('footer a').filter((_,el) => /(?:^|\/)services\.html$|(?:^|\/)lab\.html$/.test($(el).attr('href') || '')).remove();
  $('a').each((_,el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    if (!/lab\.html$/.test(href)) return;
    a.attr('href', href.replace(/lab\.html$/, 'archive.html'));
    if (a.find('b').length) a.find('b').first().text(c.archiveLabel);
    else if (/^\s*Lab/i.test(a.text())) a.text(`${c.archiveLabel} ↗`);
  });

  fs.writeFileSync(file,$.html(),'utf8');
}

// Lab is a legacy redirect and should not be advertised in the sitemap.
const sitemap = path.join(ROOT,'sitemap.xml');
if (fs.existsSync(sitemap)) {
  const xml = fs.readFileSync(sitemap,'utf8');
  const cleaned = xml.replace(/\s*<url>\s*<loc>https:\/\/datac0re\.is-a\.dev\/(?:en\/|fr\/|es\/)?lab\.html<\/loc>[\s\S]*?<\/url>/g,'');
  fs.writeFileSync(sitemap,cleaned,'utf8');
}

console.log('Portfolio simplified: realized contexts foregrounded, R&D moved to Archive, Lab removed from primary IA.');
