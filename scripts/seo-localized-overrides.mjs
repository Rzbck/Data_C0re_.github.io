import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const overrides = {
  fr: {
    'index.html': {
      title: 'DATA C0RE — TouchDesigner & systèmes audiovisuels — Annecy / Genève',
      description: 'Artiste numérique, creative technologist et spécialiste TouchDesigner basé à Annecy, actif à Genève et mobile à Lyon, Grenoble, Paris, en France, Suisse et Europe : vidéo temps réel, projection, installations, théâtre, opéra et live AV.'
    },
    'work.html': {
      title: 'Travaux — TouchDesigner, projection, live AV & vidéo scénique — DATA C0RE',
      description: 'Portfolio de systèmes audiovisuels temps réel : TouchDesigner, projection, SMODE, vidéo interactive, LED/DMX, théâtre, opéra, installations et live AV, avec des projets à Genève, Grenoble et en tournée européenne.'
    },
    'about.html': {
      title: 'À propos — Creative Technologist / TouchDesigner — Annecy · Genève — DATA C0RE',
      description: 'DATA C0RE développe des systèmes audiovisuels temps réel reliant code, son, données, projection, lumière et espace. Basé à Annecy, actif à Genève, mobile en France, Suisse et Europe.'
    },
    'cv.html': {
      title: 'CV — Technicien vidéo, TouchDesigner, SMODE & projection — Annecy / Genève — DATA C0RE',
      description: 'Technicien vidéo et creative technologist : TouchDesigner, SMODE, régie vidéo théâtre et opéra, projection, mapping, LED/DMX, Art-Net, OSC et systèmes interactifs. Annecy / Genève / Lyon / France / Suisse / Europe.'
    },
    'services.html': {
      title: 'TouchDesigner & technicien vidéo — Annecy / Genève / Lyon — DATA C0RE',
      description: 'Programmation TouchDesigner, régie et systèmes vidéo, SMODE, projection, mapping, LED/DMX et média interactif pour théâtre, opéra, festivals et installations. Basé à Annecy, actif à Genève, mobile Lyon, Grenoble, Paris, France, Suisse et Europe.'
    },
    'projects/snake.html': {
      title: 'Snake / Networked Retro System — Projet interactif TouchDesigner — DATA C0RE',
      description: 'Projet solo TouchDesigner combinant logique de jeu, synchronisation musicale, interface sur mesure, classement en ligne, base de données et comportement audiovisuel temps réel.'
    },
    'projects/ascii.html': {
      title: 'ASCII / Pixel Realtime Study — Image générative TouchDesigner — DATA C0RE',
      description: 'Étude d’image computationnelle temps réel sous TouchDesigner, réduisant portraits et formes graphiques en pixels, symboles et champs colorés.'
    },
    'projects/realtime.html': {
      title: 'Realtime Studies — Systèmes audio-réactifs TouchDesigner — DATA C0RE',
      description: 'Recherche visuelle audio-réactive sous TouchDesigner autour du comportement de matière, des systèmes cellulaires, de l’analyse sonore et de la génération temporelle d’images.'
    },
    'projects/cloud.html': {
      title: 'Cloud Processing / GLSL anisotrope — Étude visuelle temps réel — DATA C0RE',
      description: 'Étude visuelle solo transformant des timelapses de nuages par traitement GLSL anisotrope dans TouchDesigner.'
    }
  },
  es: {
    'index.html': {
      title: 'DATA C0RE — TouchDesigner y sistemas audiovisuales — Annecy / Ginebra',
      description: 'Artista digital y creative technologist especializado en TouchDesigner, con base en Annecy y actividad en Ginebra; disponible para Lyon, Grenoble, París, Francia, Suiza y Europa: vídeo en tiempo real, proyección, instalaciones y live AV.'
    },
    'work.html': {
      title: 'Trabajos — TouchDesigner, proyección, live AV y vídeo escénico — DATA C0RE',
      description: 'Portfolio de sistemas audiovisuales en tiempo real: TouchDesigner, proyección, SMODE, vídeo interactivo, LED/DMX, teatro, ópera, instalaciones y live AV.'
    },
    'about.html': {
      title: 'Acerca de — Creative Technologist / TouchDesigner — Annecy · Ginebra — DATA C0RE',
      description: 'DATA C0RE desarrolla sistemas audiovisuales en tiempo real que conectan código, sonido, datos, proyección, luz y espacio. Base en Annecy, actividad en Ginebra y movilidad europea.'
    },
    'cv.html': {
      title: 'CV — Técnico de vídeo, TouchDesigner, SMODE y proyección — DATA C0RE',
      description: 'Técnico de vídeo y creative technologist: TouchDesigner, SMODE, vídeo teatral, proyección, mapping, LED/DMX, Art-Net, OSC y sistemas interactivos. Annecy / Ginebra / Lyon / Francia / Suiza / Europa.'
    },
    'services.html': {
      title: 'TouchDesigner y técnico de vídeo — Annecy / Ginebra / Lyon — DATA C0RE',
      description: 'Programación TouchDesigner, sistemas de vídeo, SMODE, proyección, mapping, LED/DMX y medios interactivos para teatro, ópera, festivales e instalaciones. Base en Annecy, actividad en Ginebra y movilidad europea.'
    },
    'projects/snake.html': {
      title: 'Snake / Networked Retro System — Proyecto interactivo TouchDesigner — DATA C0RE',
      description: 'Proyecto solo en TouchDesigner que combina lógica de juego, sincronización musical, interfaz propia, clasificación online, base de datos y comportamiento audiovisual en tiempo real.'
    },
    'projects/ascii.html': {
      title: 'ASCII / Pixel Realtime Study — Imagen generativa con TouchDesigner — DATA C0RE',
      description: 'Estudio de imagen computacional en tiempo real con TouchDesigner que reduce retratos y formas gráficas a píxeles, símbolos y campos de color.'
    },
    'projects/realtime.html': {
      title: 'Realtime Studies — Sistemas audio-reactivos con TouchDesigner — DATA C0RE',
      description: 'Investigación visual audio-reactiva con TouchDesigner sobre comportamiento material, sistemas celulares, análisis de sonido y generación temporal de imagen.'
    },
    'projects/cloud.html': {
      title: 'Cloud Processing / GLSL anisotrópico — Estudio visual en tiempo real — DATA C0RE',
      description: 'Estudio visual solo que transforma timelapses de nubes mediante procesamiento GLSL anisotrópico en TouchDesigner.'
    },
    'projects/lumina.html': {
      title: 'LUMINA / Geneva Lux — Instalación LED interactiva, TouchDesigner y Art-Net — DATA C0RE',
      description: 'Instalación pública en Ginebra: estructura Fusion 360, TouchDesigner, Art-Net, LED direccionables, red, fabricación e integración de luz en tiempo real para Geneva Lux.'
    },
    'projects/hardwinner.html': {
      title: 'Hardwinner — TouchDesigner, GLSL, LED, DMX y live AV — DATA C0RE',
      description: 'Sistemas AV colaborativos con TouchDesigner, Resolume, GLSL, LED, DMX, show control, simulación 3D en tiempo real y contextos de música electrónica en directo.'
    },
    'projects/grand-theatre.html': {
      title: 'Grand Théâtre de Genève — SMODE, proyección e integración de vídeo — DATA C0RE',
      description: 'Programación SMODE, cues, proyección multiplano, edge blending, ópticas de tiro ultracorto y calibración in situ en el Grand Théâtre de Genève.'
    },
    'projects/comedie.html': {
      title: 'Comédie de Genève — Sistema de vídeo interactivo en gira — DATA C0RE',
      description: 'Trabajo de vídeo teatral en creación y gira: cámaras, routing, proyección, subtítulos, adaptación a espacios, pruebas, resolución de incidencias y transferencia de régie.'
    },
    'projects/stage-systems.html': {
      title: 'Sistemas escénicos — TouchDesigner, Resolume, LED y DMX — DATA C0RE',
      description: 'Sistemas de vídeo y luz en tiempo real con TouchDesigner, Resolume, pantallas LED, DMX, simulación escénica, sincronización vídeo-luz y despliegue live.'
    }
  }
};

const bodyReplacements = {
  fr: {
    'Services / mobility':'Services / mobilité',
    'VIDEO SYSTEMS':'SYSTÈMES VIDÉO',
    'DATA C0RE works as a creative technologist and video systems technician across TouchDesigner programming, realtime video, projection, interactive media, LED / DMX and stage-media integration for theatre, opera, festivals, installations and live performance.':'DATA C0RE travaille comme creative technologist et technicien vidéo sur la programmation TouchDesigner, la vidéo temps réel, la projection, les médias interactifs, les LED / DMX et l’intégration média scénique pour le théâtre, l’opéra, les festivals, les installations et le spectacle vivant.',
    'Annecy base':'Basé à Annecy',
    'Geneva activity':'Activité à Genève',
    'France / Switzerland / Europe':'France / Suisse / Europe',
    '01 / Realtime systems':'01 / Systèmes temps réel',
    'Programming':'Programmation',
    'Video systems':'Systèmes vidéo',
    'Live production':'Production live',
    'Physical integration':'Intégration physique',
    'Custom TouchDesigner systems, GLSL and Python integration, audio- or data-reactive behaviours, OSC / Art-Net / DMX, interactive media and show-control logic.':'Systèmes TouchDesigner sur mesure, intégration GLSL et Python, comportements réactifs au son ou aux données, OSC / Art-Net / DMX, médias interactifs et logique de show control.',
    'SMODE, projection geometry, mapping, edge blending, cameras, routing, media servers, output design and on-site calibration for stage and installation environments.':'SMODE, géométrie de projection, mapping, edge blending, caméras, routing, media servers, conception des sorties et calibration sur site pour la scène et l’installation.',
    'Video-system preparation, venue adaptation, cues, surtitles, testing, troubleshooting, local-team coordination and control-room handover for touring and institutional productions.':'Préparation des systèmes vidéo, adaptation aux lieux, cues, surtitrage, tests, dépannage, coordination des équipes locales et passation de régie pour les tournées et productions institutionnelles.',
    'Addressable LED, DMX / Art-Net, network planning, Fusion 360, fabrication coordination and integration of realtime software with physical light and architectural systems.':'LED adressables, DMX / Art-Net, planification réseau, Fusion 360, coordination de fabrication et intégration du logiciel temps réel avec la lumière et les systèmes architecturaux.',
    '02 / Mobility + service area':'02 / Mobilité + zone d’intervention',
    'Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, and for touring, festival and institutional projects throughout Europe.':'Basé à Annecy, avec une expérience de production importante à Genève. Disponible sur site à Lyon, Grenoble et Paris, partout en France et en Suisse, ainsi que pour des tournées, festivals et projets institutionnels en Europe.',
    'The location list describes real mobility and production availability. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique.':'La liste géographique décrit une mobilité et une disponibilité réelles. Les pages projets servent de preuves : le travail à Genève est documenté par Geneva Lux, le Grand Théâtre de Genève et la Comédie de Genève ; Grenoble par Hardwinner / La Belle Électrique.',
    '03 / Selected proof':'03 / Références sélectionnées',
    'video systems / touring / handover ↗':'systèmes vidéo / tournée / passation ↗',
    '<h2>TouchDesigner<br>+ control.</h2>':'<h2>TouchDesigner<br>+ contrôle.</h2>',
    '<h3>Theatre / opera / touring</h3>':'<h3>Théâtre / opéra / tournée</h3>',
    '<h3>LED / light / installation</h3>':'<h3>LED / lumière / installation</h3>',
    '<h2>Production<br>contexts.</h2>':'<h2>Contextes<br>de production.</h2>',
    '<span>Geneva</span>':'<span>Genève</span>',
    '<span>Geneva / touring</span>':'<span>Genève / tournée</span>',
    '<span>Switzerland</span>':'<span>Suisse</span>',
    'TouchDesigner / LED / Art-Net / integration ↗':'TouchDesigner / LED / Art-Net / intégration ↗',
    '"Systèmes vidéo technician"':'"Technicien vidéo"'
  },
  es: {
    'Services / mobility':'Servicios / movilidad',
    'VIDEO SYSTEMS':'SISTEMAS DE VÍDEO',
    'DATA C0RE works as a creative technologist and video systems technician across TouchDesigner programming, realtime video, projection, interactive media, LED / DMX and stage-media integration for theatre, opera, festivals, installations and live performance.':'DATA C0RE trabaja como creative technologist y técnico de vídeo en programación TouchDesigner, vídeo en tiempo real, proyección, medios interactivos, LED / DMX e integración escénica para teatro, ópera, festivales, instalaciones y espectáculos en directo.',
    'Annecy base':'Base en Annecy',
    'Geneva activity':'Actividad en Ginebra',
    'France / Switzerland / Europe':'Francia / Suiza / Europa',
    '01 / Realtime systems':'01 / Sistemas en tiempo real',
    'Programming':'Programación',
    'Video systems':'Sistemas de vídeo',
    'Live production':'Producción en directo',
    'Physical integration':'Integración física',
    'Custom TouchDesigner systems, GLSL and Python integration, audio- or data-reactive behaviours, OSC / Art-Net / DMX, interactive media and show-control logic.':'Sistemas TouchDesigner a medida, integración GLSL y Python, comportamientos reactivos al sonido o a datos, OSC / Art-Net / DMX, medios interactivos y lógica de show control.',
    'SMODE, projection geometry, mapping, edge blending, cameras, routing, media servers, output design and on-site calibration for stage and installation environments.':'SMODE, geometría de proyección, mapping, edge blending, cámaras, routing, media servers, diseño de salidas y calibración in situ para escenarios e instalaciones.',
    'Video-system preparation, venue adaptation, cues, surtitles, testing, troubleshooting, local-team coordination and control-room handover for touring and institutional productions.':'Preparación de sistemas de vídeo, adaptación a espacios, cues, subtítulos, pruebas, resolución de incidencias, coordinación de equipos locales y transferencia de régie para giras y producciones institucionales.',
    'Addressable LED, DMX / Art-Net, network planning, Fusion 360, fabrication coordination and integration of realtime software with physical light and architectural systems.':'LED direccionables, DMX / Art-Net, planificación de red, Fusion 360, coordinación de fabricación e integración del software en tiempo real con luz y sistemas arquitectónicos.',
    '02 / Mobility + service area':'02 / Movilidad + zona de servicio',
    'Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, and for touring, festival and institutional projects throughout Europe.':'Con base en Annecy y amplia experiencia de producción en Ginebra. Disponible para trabajo in situ en Lyon, Grenoble y París, en Francia y Suiza, y para giras, festivales y proyectos institucionales en toda Europa.',
    'The location list describes real mobility and production availability. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique.':'La lista geográfica describe movilidad y disponibilidad reales. Las páginas de proyectos aportan las pruebas: el trabajo en Ginebra está documentado por Geneva Lux, Grand Théâtre de Genève y Comédie de Genève; Grenoble por Hardwinner / La Belle Électrique.',
    '03 / Selected proof':'03 / Referencias seleccionadas',
    'video systems / touring / handover ↗':'sistemas de vídeo / gira / transferencia ↗',
    '<h3>Theatre / opera / touring</h3>':'<h3>Teatro / ópera / gira</h3>',
    '<h3>LED / light / installation</h3>':'<h3>LED / luz / instalación</h3>',
    '<h2>Production<br>contexts.</h2>':'<h2>Contextos<br>de producción.</h2>',
    '<span>Geneva</span>':'<span>Ginebra</span>',
    '<span>Geneva / touring</span>':'<span>Ginebra / gira</span>',
    '<span>Switzerland</span>':'<span>Suiza</span>',
    'TouchDesigner / LED / Art-Net / integration ↗':'TouchDesigner / LED / Art-Net / integración ↗'
  }
};

function replaceTitle(html, value) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);
}

function replaceMetaByName(html, name, value) {
  const re = new RegExp(`(<meta\\s+name=["']${name}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

function replaceMetaByProperty(html, property, value) {
  const re = new RegExp(`(<meta\\s+property=["']${property}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

for (const [lang, pages] of Object.entries(overrides)) {
  for (const [rel, seo] of Object.entries(pages)) {
    const file = path.join(ROOT, lang, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = replaceTitle(html, seo.title);
    html = replaceMetaByName(html, 'description', seo.description);
    html = replaceMetaByProperty(html, 'og:title', seo.title);
    html = replaceMetaByProperty(html, 'og:description', seo.description);
    html = replaceMetaByName(html, 'twitter:title', seo.title);
    html = replaceMetaByName(html, 'twitter:description', seo.description);
    if (rel === 'services.html') {
      for (const [from, to] of Object.entries(bodyReplacements[lang] || {})) html = html.split(from).join(to);
    }
    fs.writeFileSync(file, html);
  }
}

console.log('Applied localized SEO and service-area overrides.');
