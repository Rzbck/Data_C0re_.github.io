import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const configs = {
  fr: {
    home: {
      eyebrow: 'Travaux réalisés sélectionnés', heading: 'Construits, installés<br>et exploités.', link: 'Travaux réalisés ↗',
      rows: {
        lumina: 'installation publique collaborative / structure / LED / contrôle temps réel',
        snake: 'logiciel solo / TouchDesigner / synchro musicale / score en réseau',
        'grand-theatre': 'professionnel / SMODE / intégration projection / calibration',
        hardwinner: 'systèmes live collaboratifs / LED / DMX / GLSL / show control',
        comedie: 'professionnel / vidéo théâtre / adaptation tournée / exploitation'
      }
    },
    work: {
      eyebrow: 'Travaux réalisés / 2016—2026', heading: 'PROJETS<br>RÉALISÉS',
      intro: 'Projets réalisés entre logiciel interactif, installation publique, AV live, vidéo théâtre, projection et systèmes scéniques.',
      shortcuts: ['Archives projets ↗', 'Simulation + R&D ↗'],
      screens: [
        ['01 / Installation + logiciel', 'Systèmes conçus<br>pour exister.'],
        ['02 / Scène + institutionnel', 'Projection<br>+ systèmes vidéo.'],
        ['03 / AV live + systèmes scéniques', 'Systèmes temps réel<br>en conditions de spectacle.']
      ],
      rows: {
        lumina: 'RÉALISÉ / installation publique collaborative / systèmes temps réel & intégration',
        snake: 'RÉALISÉ / logiciel interactif solo / TouchDesigner / score en réseau',
        'grand-theatre': 'RÉALISÉ / SMODE / intégration projection / cues / calibration',
        comedie: 'RÉALISÉ / vidéo théâtre / création / adaptation tournée / exploitation',
        hardwinner: 'RÉALISÉ / AV collaboratif / TouchDesigner / LED / DMX / GLSL',
        'stage-systems': 'RÉALISÉ / TouchDesigner / Resolume / LED / DMX / synchro vidéo-lumière'
      }
    },
    lab: {
      eyebrow: 'Lab / simulation + R&D', heading: 'SYSTÈMES<br>EN DÉVELOPPEMENT',
      intro: 'Simulations techniques, études d’image et systèmes expérimentaux. Les projets installés, scéniques et livrés restent dans Travaux.',
      shortcuts: ['Travaux réalisés ↗', 'Archives complètes ↗'],
      rows: {
        signal: 'Godot / modèle de tracking mmWave / WebSocket / architecture TouchDesigner / systèmes LED',
        ascii: 'TouchDesigner / réduction d’image / portrait computationnel',
        realtime: 'comportement audio-réactif / systèmes cellulaires / image temporelle',
        cloud: 'TouchDesigner / GLSL / timelapse transformé'
      }
    },
    diagram: [
      ['01', 'mmWave', 'tracking'], ['02', 'passerelle', 'réseau'], ['03', 'données', 'spatiales'],
      ['04', 'comportement', 'TouchDesigner'], ['05', 'sortie', 'LED']
    ],
    diagramAria: 'Pipeline temps réel cible'
  },
  es: {
    home: {
      eyebrow: 'Trabajo realizado seleccionado', heading: 'Construido, instalado<br>y operado.', link: 'Trabajo realizado ↗',
      rows: {
        lumina: 'instalación pública colaborativa / estructura / LED / control en tiempo real',
        snake: 'software solo / TouchDesigner / sincronización musical / puntuación en red',
        'grand-theatre': 'profesional / SMODE / integración de proyección / calibración',
        hardwinner: 'sistemas live colaborativos / LED / DMX / GLSL / show control',
        comedie: 'profesional / vídeo teatral / adaptación de gira / operación'
      }
    },
    work: {
      eyebrow: 'Trabajo realizado / 2016—2026', heading: 'TRABAJO<br>REALIZADO',
      intro: 'Proyectos realizados entre software interactivo, instalación pública, AV en directo, vídeo teatral, proyección y sistemas escénicos.',
      shortcuts: ['Archivo de proyectos ↗', 'Simulación + I+D ↗'],
      screens: [
        ['01 / Instalación + software', 'Sistemas creados<br>para existir.'],
        ['02 / Escena + institucional', 'Proyección<br>+ sistemas de vídeo.'],
        ['03 / AV en directo + sistemas escénicos', 'Sistemas en tiempo real<br>en condiciones de espectáculo.']
      ],
      rows: {
        lumina: 'REALIZADO / instalación pública colaborativa / sistemas en tiempo real e integración',
        snake: 'REALIZADO / software interactivo solo / TouchDesigner / puntuación en red',
        'grand-theatre': 'REALIZADO / SMODE / integración de proyección / cues / calibración',
        comedie: 'REALIZADO / vídeo teatral / creación / adaptación de gira / operación',
        hardwinner: 'REALIZADO / AV colaborativo / TouchDesigner / LED / DMX / GLSL',
        'stage-systems': 'REALIZADO / TouchDesigner / Resolume / LED / DMX / sincronización vídeo-luz'
      }
    },
    lab: {
      eyebrow: 'Lab / simulación + I+D', heading: 'SISTEMAS<br>EN DESARROLLO',
      intro: 'Simulaciones técnicas, estudios de imagen y sistemas experimentales. Los proyectos instalados, escénicos y entregados permanecen en Trabajo.',
      shortcuts: ['Trabajo realizado ↗', 'Archivo completo ↗'],
      rows: {
        signal: 'Godot / modelo de tracking mmWave / WebSocket / arquitectura TouchDesigner / sistemas LED',
        ascii: 'TouchDesigner / reducción de imagen / retrato computacional',
        realtime: 'comportamiento audio-reactivo / sistemas celulares / imagen temporal',
        cloud: 'TouchDesigner / GLSL / timelapse transformado'
      }
    },
    diagram: [
      ['01', 'mmWave', 'tracking'], ['02', 'pasarela', 'de red'], ['03', 'datos', 'espaciales'],
      ['04', 'comportamiento', 'TouchDesigner'], ['05', 'salida', 'LED']
    ],
    diagramAria: 'Pipeline objetivo en tiempo real'
  }
};

function loadFile(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  return { file, $: load(fs.readFileSync(file, 'utf8'), { decodeEntities: false }) };
}
function save(ctx) { fs.writeFileSync(ctx.file, ctx.$.html(), 'utf8'); }
function setRowCopy($, rows, selector = '.index-row') {
  for (const [slug, copy] of Object.entries(rows)) {
    $(`${selector}[href$="projects/${slug}.html"] small`).first().text(copy);
  }
}
function setArchiveRowCopy($, rows) {
  for (const [slug, copy] of Object.entries(rows)) {
    $(`.archive-entry[href$="projects/${slug}.html"] small`).first().text(copy);
  }
}

for (const [lang, c] of Object.entries(configs)) {
  let ctx = loadFile(`${lang}/index.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.home-work .section-head .eyebrow').first().text(c.home.eyebrow);
    $('.home-work .section-head h2').first().html(c.home.heading);
    $('.home-work .section-head a').first().text(c.home.link);
    setRowCopy($, c.home.rows);
    save(ctx);
  }

  ctx = loadFile(`${lang}/work.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.page-intro .eyebrow').first().text(c.work.eyebrow);
    $('.page-intro h1').first().html(c.work.heading);
    $('.page-intro > p').not('.eyebrow').first().text(c.work.intro);
    $('.archive-shortcuts a').each((i, el) => { if (c.work.shortcuts[i]) $(el).text(c.work.shortcuts[i]); });
    $('.work-screen').each((i, el) => {
      const spec = c.work.screens[i];
      if (!spec) return;
      $(el).find('.work-screen-head p').first().text(spec[0]);
      $(el).find('.work-screen-head h2').first().html(spec[1]);
    });
    setRowCopy($, c.work.rows);
    save(ctx);
  }

  ctx = loadFile(`${lang}/lab.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.page-intro .eyebrow').first().text(c.lab.eyebrow);
    $('.page-intro h1').first().html(c.lab.heading);
    $('.page-intro > p').not('.eyebrow').first().text(c.lab.intro);
    $('.archive-shortcuts a').each((i, el) => { if (c.lab.shortcuts[i]) $(el).text(c.lab.shortcuts[i]); });
    setArchiveRowCopy($, c.lab.rows);
    save(ctx);
  }

  ctx = loadFile(`${lang}/projects/signal.html`);
  if (ctx) {
    const { $ } = ctx;
    $('.signal-hero-system').attr('aria-label', c.diagramAria);
    $('.signal-node').each((index, el) => {
      const spec = c.diagram[index];
      if (!spec) return;
      $(el).find('b').first().text(spec[0]);
      $(el).find('span').first().html(`${spec[1]}<br>${spec[2]}`);
    });
    $('meta[property="og:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
    $('meta[name="twitter:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
    save(ctx);
  }
}

for (const rel of ['projects/signal.html', 'en/projects/signal.html']) {
  const ctx = loadFile(rel);
  if (!ctx) continue;
  ctx.$('meta[property="og:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  ctx.$('meta[name="twitter:image"]').attr('content', 'https://datac0re.is-a.dev/assets/img/og-cover.jpg');
  save(ctx);
}

console.log('Localized Home / Work / Lab architecture and SIGNAL metadata locked by project selectors.');
