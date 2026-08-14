import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const locales = ['source', 'en', 'fr', 'es'];

const copy = {
  source: {
    workIntro: 'Selected solo work, collaborative installations and professional stage/media systems spanning realtime graphics, interactive light, projection and live production.',
    labIntro: 'Ongoing R&D across TouchDesigner, GLSL, realtime rendering, sensors, networks and generative systems, feeding directly into installations, stage systems and audiovisual work.',
    serviceHead: '03 / Selected contexts',
    serviceTitle: 'Production<br>contexts.',
    serviceNote: 'Recent production contexts include Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, La Belle Électrique and international touring with Entre chien et loup, including São Paulo, Brazil.',
    hardwinner: 'The same approach continued into club and stage contexts: Dave Clarke / Grenoble in 2016 with realtime BPM and lighting control, then La Belle Électrique in 2018 with TouchDesigner, GLSL and Resolume. The systems were developed collaboratively across visual programming, lighting and live operation.',
    emigrants: 'During the Geneva creation phase, the video-control environment combined cameras, mapped surfaces, DataPath distribution, networked control and a large cue vocabulary coordinated with the stage process.',
    emigrantsCredit: '<strong>Credits:</strong> artistic video creation by Natan Berkowicz; DATA C0RE contributed to technical video systems, cueing and integration during the Geneva creation phase.',
    transit: 'On selected touring dates I installed, calibrated, operated and struck the complete video system: stage cameras, projection, remote control between stage and FOH, and a dedicated three-screen surtitling chain.',
    funRadio: 'Fun Radio Party combined TouchDesigner and Resolume in a single live pipeline for realtime video, colour synchronisation, lighting relationships and stage operation in front of the audience.',
    stageHero: 'Stage Systems /<br>Fun Radio + Studies',
    stageStudyTitle: 'Realtime Stage Studies',
    stageStudy: 'A parallel series of stage-design studies explored P3 LED screens, DMX control, video-colour synchronisation, realtime simulation and routing. The 2017 development extended the approach with PBR simulation and a new LED-screen stage configuration in Annecy.',
    luminaFabLabel: 'Fabrication / integration',
    luminaFabNote: 'Workshop footage from the Geneva Lux production: profile preparation, LED-strip work and cabling.',
    luminaTechLabel: 'Design / fabrication',
    luminaTechTitle: 'Technical design<br>+ fabrication.'
  },
  en: null,
  fr: {
    workIntro: 'Sélection de travaux solo, installations collaboratives et systèmes scéniques professionnels autour du temps réel, de la lumière interactive, de la projection et du live.',
    labIntro: 'Recherche continue autour de TouchDesigner, GLSL, du rendu temps réel, des capteurs, des réseaux et des systèmes génératifs, directement reliée aux installations, aux systèmes scéniques et au travail audiovisuel.',
    serviceHead: '03 / Contextes sélectionnés',
    serviceTitle: 'Contextes<br>de production.',
    serviceNote: 'Parmi les contextes récents : Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, La Belle Électrique et la tournée internationale d’Entre chien et loup, notamment à São Paulo, au Brésil.',
    hardwinner: 'La même approche s’est poursuivie dans des contextes club et scène : Dave Clarke / Grenoble en 2016 avec contrôle BPM et lumière en temps réel, puis La Belle Électrique en 2018 avec TouchDesigner, GLSL et Resolume. Les systèmes ont été développés collectivement entre programmation visuelle, lumière et exploitation live.',
    emigrants: 'Pendant la phase de création à Genève, l’environnement vidéo réunissait caméras, surfaces mappées, distribution DataPath, contrôle en réseau et un grand nombre de cues coordonnés avec le travail scénique.',
    emigrantsCredit: '<strong>Crédits :</strong> création vidéo artistique par Natan Berkowicz ; DATA C0RE a contribué aux systèmes vidéo techniques, au cueing et à l’intégration pendant la création genevoise.',
    transit: 'Sur certaines dates de tournée, j’ai assuré l’installation, la calibration, l’exploitation et le démontage du système vidéo complet : caméras plateau, projection, contrôle distant entre scène et régie, et chaîne de surtitrage sur trois écrans.',
    funRadio: 'Fun Radio Party réunissait TouchDesigner et Resolume dans une seule chaîne live pour la vidéo temps réel, la synchronisation couleur, les relations vidéo-lumière et l’exploitation scénique face au public.',
    stageHero: 'Stage Systems /<br>Fun Radio + Études',
    stageStudyTitle: 'Études scéniques temps réel',
    stageStudy: 'Une série parallèle d’études de scénographie explorait les écrans LED P3, le contrôle DMX, la synchronisation vidéo-couleur, la simulation temps réel et le routing. Le développement 2017 prolongeait cette approche avec une simulation PBR et une nouvelle configuration d’écrans LED à Annecy.',
    luminaFabLabel: 'Fabrication / intégration',
    luminaFabNote: 'Images d’atelier de la production Geneva Lux : préparation des profils, travail sur les rubans LED et câblage.',
    luminaTechLabel: 'Conception / fabrication',
    luminaTechTitle: 'Conception technique<br>+ fabrication.'
  },
  es: {
    workIntro: 'Selección de trabajos en solitario, instalaciones colaborativas y sistemas escénicos profesionales en torno al tiempo real, la luz interactiva, la proyección y la producción live.',
    labIntro: 'Investigación continua con TouchDesigner, GLSL, renderizado en tiempo real, sensores, redes y sistemas generativos, conectada directamente con instalaciones, sistemas escénicos y trabajo audiovisual.',
    serviceHead: '03 / Contextos seleccionados',
    serviceTitle: 'Contextos<br>de producción.',
    serviceNote: 'Entre los contextos recientes: Geneva Lux, Grand Théâtre de Genève, Comédie de Genève, La Belle Électrique y la gira internacional de Entre chien et loup, incluida São Paulo, Brasil.',
    hardwinner: 'El mismo enfoque continuó en contextos de club y escenario: Dave Clarke / Grenoble en 2016 con control BPM e iluminación en tiempo real, y La Belle Électrique en 2018 con TouchDesigner, GLSL y Resolume. Los sistemas se desarrollaron de forma colaborativa entre programación visual, iluminación y operación live.',
    emigrants: 'Durante la fase de creación en Ginebra, el entorno de vídeo combinaba cámaras, superficies mapeadas, distribución DataPath, control en red y un amplio vocabulario de cues coordinado con el proceso escénico.',
    emigrantsCredit: '<strong>Créditos:</strong> creación artística de vídeo por Natan Berkowicz; DATA C0RE contribuyó a los sistemas técnicos de vídeo, cueing e integración durante la creación en Ginebra.',
    transit: 'En determinadas fechas de gira instalé, calibré, operé y desmonté el sistema de vídeo completo: cámaras de escenario, proyección, control remoto entre escenario y FOH, y una cadena de sobretítulos dedicada de tres pantallas.',
    funRadio: 'Fun Radio Party combinó TouchDesigner y Resolume en una única cadena live para vídeo en tiempo real, sincronización de color, relaciones vídeo-luz y operación escénica frente al público.',
    stageHero: 'Stage Systems /<br>Fun Radio + Estudios',
    stageStudyTitle: 'Estudios escénicos en tiempo real',
    stageStudy: 'Una serie paralela de estudios de diseño escénico exploró pantallas LED P3, control DMX, sincronización vídeo-color, simulación en tiempo real y routing. El desarrollo de 2017 amplió el enfoque con simulación PBR y una nueva configuración de pantallas LED en Annecy.',
    luminaFabLabel: 'Fabricación / integración',
    luminaFabNote: 'Imágenes de taller de la producción Geneva Lux: preparación de perfiles, trabajo con tiras LED y cableado.',
    luminaTechLabel: 'Diseño / fabricación',
    luminaTechTitle: 'Diseño técnico<br>+ fabricación.'
  }
};
copy.en = copy.source;

function fileFor(locale, rel) {
  return locale === 'source' ? path.join(ROOT, rel) : path.join(ROOT, locale, rel);
}

function edit(locale, rel, fn) {
  const file = fileFor(locale, rel);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before, copy[locale]);
  if (after !== before) fs.writeFileSync(file, after);
}

function replacePageIntro(html, text) {
  return html.replace(/(<header class="page-intro reveal">[\s\S]*?<h1>[\s\S]*?<\/h1>)<p>[\s\S]*?<\/p>(<\/header>)/i, `$1<p>${text}</p>$2`);
}

for (const locale of locales) {
  edit(locale, 'work.html', (html, c) => replacePageIntro(html, c.workIntro));
  edit(locale, 'lab.html', (html, c) => replacePageIntro(html, c.labIntro));

  edit(locale, 'services.html', (html, c) => {
    html = html.replace(/<p class="services-note reveal">[\s\S]*?<\/p>/i, `<p class="services-note reveal">${c.serviceNote}</p>`);
    html = html.replace(/<div class="services-head reveal"><p>03 \/ [^<]*<\/p><h2>[\s\S]*?<\/h2><\/div>/i, `<div class="services-head reveal"><p>${c.serviceHead}</p><h2>${c.serviceTitle}</h2></div>`);
    return html;
  });

  edit(locale, 'projects/hardwinner.html', (html, c) => html.replace(/(<div class="section-kicker reveal"><span>02<\/span>[\s\S]*?<div class="prose reveal"><p>)[\s\S]*?(<\/p><\/div><\/section>)/i, `$1${c.hardwinner}$2`));

  edit(locale, 'projects/comedie.html', (html, c) => {
    html = html.replace(/(<h2>Les Émigrants<br>Krystian Lupa<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div>)/i, `$1${c.emigrants}$2`);
    html = html.replace(/(<h2>En transit<br>Amir Reza Koohestani<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div>)/i, `$1${c.transit}$2`);
    let noteIndex = 0;
    html = html.replace(/\s*<p class="credit-note">[\s\S]*?<\/p>/gi, () => {
      noteIndex += 1;
      return noteIndex === 2 ? `\n    <p class="credit-note">${c.emigrantsCredit}</p>` : '';
    });
    return html;
  });

  edit(locale, 'projects/stage-systems.html', (html, c) => {
    html = html.replace(/<h1>Stage Systems \/<br>Fun Radio \+ [\s\S]*?<\/h1>/i, `<h1>${c.stageHero}</h1>`);
    html = html.replace(/(<h2>Fun Radio Party<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div>)/i, `$1${c.funRadio}$2`);
    html = html.replace(/<h2>[“\"]?National Radio[”\"]?<\/h2>/i, `<h2>${c.stageStudyTitle}</h2>`);
    html = html.replace(/(<span class="stage-role">02 \/ [^<]*<\/span><h2>[^<]*<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div>)/i, `$1${c.stageStudy}$2`);
    html = html.replace(/\s*<p class="archive-note">[\s\S]*?<\/p>/i, '');
    return html;
  });

  edit(locale, 'projects/lumina.html', (html, c) => {
    html = html.replace(/(<div class="section-head reveal"><div><p class="eyebrow">)[\s\S]*?(<\/p><h2>[\s\S]*?<\/h2><\/div><\/div>\s*<p class="fabrication-note reveal">)[\s\S]*?(<\/p>)/i, `$1${c.luminaFabLabel}$2${c.luminaFabNote}$3`);
    html = html.replace(/(<section class="project-section" data-tabs>[\s\S]*?<div class="section-head"><div><p class="eyebrow">)[\s\S]*?(<\/p><h2>)[\s\S]*?(<\/h2>)/i, `$1${c.luminaTechLabel}$2${c.luminaTechTitle}$3`);
    return html;
  });
}

console.log('Cleaned recruiter-facing copy across source and localized pages.');
