import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const overrides = {
  fr: {
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
    fs.writeFileSync(file, html);
  }
}

console.log('Applied localized project SEO overrides.');
