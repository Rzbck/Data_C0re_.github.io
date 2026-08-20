import fs from 'node:fs';
import * as cheerio from 'cheerio';

// Canonical editorial CV content. Keep dates and descriptions aligned with the
// portfolio project pages and the source professional CV.
const files=['cv.html','en/cv.html','fr/cv.html','es/cv.html'];

const esc=value=>String(value??'')
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;');

const content={
  en:{
    summary:'Professional experience across realtime audiovisual systems, stage video, projection, interactive light and media integration.',
    heads:[['01 / Selected experience','Professional path'],['02 / Practices + tools','Technical field'],['03 / Background','Training + languages']],
    references:'04 / Selected places + contexts',
    experiences:[
      ['2025—27','Geneva Lux / LUMINA','Creative technologist / realtime systems + integration — ongoing','Fusion 360 structure and fabrication drawings, network planning, addressable LED integration, TouchDesigner programming, Art-Net architecture, workshop coordination and technical integration on site.'],
      ['2023—25','Grand Théâtre de Genève','Video systems / projection / SMODE / mapping','SMODE programming, floor-projection calibration, mapping of moving scenery, cue integration and takeover of an existing multi-output media architecture across three productions at the Grand Théâtre de Genève.'],
      ['2021—23','Comédie de Genève — Entre chien et loup','Video operator & interactive designer','Responsibility for the interactive video system on tour: preparation and venue adaptation, coordination of local technical teams, task distribution, multilingual surtitling, testing and troubleshooting. Writing operating notes and handover documents so the system could be run autonomously in my absence.'],
      ['2013—present','Hardwinner','Lighting / video designer','Co-design of audiovisual installations, interactive scenographies and sound-reactive systems. LED prototyping, mapping, DMX / Art-Net interfaces and repurposed tools within a DIY approach spanning low-tech and high-tech, from artistic intent to live operation.'],
      ['2006—present','Independent / intermittent technician','Theatre / dance / opera / events','Design, installation, operation and reliability work on video, lighting and streaming systems. Technical mediation with artists and teams of varied experience levels: explaining systems, adapting documentation, finding solutions and supporting autonomous operation.']
    ]
  },
  fr:{
    summary:'Expérience professionnelle en systèmes audiovisuels temps réel, vidéo scénique, projection, lumière interactive et intégration média.',
    heads:[['01 / Expérience sélectionnée','Parcours professionnel'],['02 / Pratiques + outils','Champ technique'],['03 / Parcours','Formation + langues']],
    references:'04 / Lieux + contextes sélectionnés',
    experiences:[
      ['2025—27','Geneva Lux / LUMINA','Creative technologist / systèmes temps réel + intégration — en cours','Structure et plans de fabrication sous Fusion 360, planification réseau, intégration LED adressable, programmation TouchDesigner, architecture Art-Net, coordination atelier et intégration technique sur site.'],
      ['2023—25','Grand Théâtre de Genève','Systèmes vidéo / projection / SMODE / mapping','Programmation SMODE, calibration de projection au sol, mapping de scénographie mobile, intégration de cues et reprise d’une architecture média multi-sorties existante sur trois productions au Grand Théâtre de Genève.'],
      ['2021—23','Comédie de Genève — Entre chien et loup','Régisseur vidéo & designer interactif','Responsabilité du dispositif vidéo interactif en tournée : préparation et adaptation aux lieux, coordination des équipes techniques d’accueil, répartition des tâches, sous-titrage multilingue, tests et dépannage. Rédaction de fiches et passations de régie pour garantir une exploitation autonome en mon absence.'],
      ['2013—aujourd’hui','Hardwinner','Concepteur lumière / vidéo','Co-conception d’installations audiovisuelles, de scénographies interactives et de dispositifs réactifs au son. Prototypage LED, mapping, interfaces DMX / Art-Net et détournement d’outils dans une démarche DIY, entre low-tech et high-tech. Dialogue avec artistes et partenaires, de l’intention à la mise en exploitation.'],
      ['2006—aujourd’hui','Technicien indépendant / intermittent','Théâtre / danse / opéra / événementiel','Conception, installation, exploitation et fiabilisation de systèmes vidéo, lumière et streaming. Médiation technique auprès d’artistes et d’équipes aux niveaux variés : présentation du fonctionnement, adaptation des explications, recherche de solutions et accompagnement à la prise en main.']
    ]
  },
  es:{
    summary:'Experiencia profesional en sistemas audiovisuales en tiempo real, vídeo escénico, proyección, luz interactiva e integración de medios.',
    heads:[['01 / Experiencia seleccionada','Trayectoria profesional'],['02 / Prácticas + herramientas','Campo técnico'],['03 / Trayectoria','Formación + idiomas']],
    references:'04 / Lugares + contextos seleccionados',
    experiences:[
      ['2025—27','Geneva Lux / LUMINA','Creative technologist / sistemas en tiempo real + integración — en curso','Estructura y planos de fabricación en Fusion 360, planificación de red, integración LED direccionable, programación TouchDesigner, arquitectura Art-Net, coordinación de taller e integración técnica in situ.'],
      ['2023—25','Grand Théâtre de Genève','Sistemas de vídeo / proyección / SMODE / mapping','Programación SMODE, calibración de proyección al suelo, mapping de escenografía móvil, integración de cues y toma de control de una arquitectura de medios multi-salida existente en tres producciones del Grand Théâtre de Genève.'],
      ['2021—23','Comédie de Genève — Entre chien et loup','Técnico de vídeo & diseñador interactivo','Responsabilidad del sistema de vídeo interactivo en gira: preparación y adaptación a los espacios, coordinación de los equipos técnicos locales, reparto de tareas, sobretitulado multilingüe, pruebas y resolución de incidencias. Redacción de fichas y documentos de relevo para garantizar una explotación autónoma en mi ausencia.'],
      ['2013—presente','Hardwinner','Diseñador de luz / vídeo','Co-diseño de instalaciones audiovisuales, escenografías interactivas y dispositivos reactivos al sonido. Prototipado LED, mapping, interfaces DMX / Art-Net y reutilización de herramientas dentro de un enfoque DIY entre low-tech y high-tech, desde la intención artística hasta la explotación.'],
      ['2006—presente','Técnico independiente / intermitente','Teatro / danza / ópera / eventos','Diseño, instalación, operación y fiabilización de sistemas de vídeo, luz y streaming. Mediación técnica con artistas y equipos de distintos niveles: explicación del funcionamiento, adaptación de la documentación, búsqueda de soluciones y acompañamiento hacia una operación autónoma.']
    ]
  }
};

const languageFor=file=>file.startsWith('fr/')?'fr':file.startsWith('es/')?'es':'en';
const rowsFor=lang=>content[lang].experiences.map((entry,index)=>`<article class="cv-row${index===0?' cv-row--current':''}"><time>${esc(entry[0])}</time><div class="cv-title"><strong>${esc(entry[1])}</strong><span class="cv-status">${esc(entry[2])}</span></div><div class="cv-detail"><p>${esc(entry[3])}</p></div></article>`).join('');

function applyCanonicalCopy($,main,lang){
  const c=content[lang];
  const list=main.find('.cv-one-page__experience .cv-list').first();
  if(list.length)list.html(rowsFor(lang));

  const summary=main.find('.cv-one-page__summary > p').first();
  if(summary.length)summary.text(c.summary);

  const heads=main.find('.cv-one-page__section-head');
  c.heads.forEach((copy,index)=>{
    const head=heads.eq(index);
    if(!head.length)return;
    head.find('p').first().text(copy[0]);
    head.find('h2').first().text(copy[1]);
  });

  const references=main.find('.references-label').first();
  if(references.length)references.text(c.references);
  main.attr('data-cv-canonical','1');
}

function finish($,file){
  $('link[data-cv-one-page]').remove();
  const prefix=file.includes('/')?'../':'';
  $('head').append(`\n<link rel="stylesheet" href="${prefix}assets/css/cv-one-page-v1.css?v=20260820-1" data-cv-one-page="">\n`);
  $('body').addClass('cv-one-page-ready');
  fs.writeFileSync(file,$.html());
}

function patchComposed($,file){
  const main=$('main.cv-one-page').first();
  if(!main.length)return false;
  const lang=languageFor(file);
  applyCanonicalCopy($,main,lang);
  main.find('.cv-jump').remove();
  const lower=main.find('.cv-one-page__aside,.cv-one-page__lower').first();
  if(lower.length)lower.attr('id','cv-details');
  finish($,file);
  console.log(`Canonicalized CV: ${file}`);
  return true;
}

for(const file of files){
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,'utf8');
  const $=cheerio.load(html,{decodeEntities:false});
  if(patchComposed($,file))continue;

  // Fallback for a fresh build that still contains the four original CV sections.
  const main=$('main').first();
  const intro=main.children('.cv-intro').first();
  const sections=main.children('.cv-section');
  if(!intro.length||sections.length<4)continue;

  const lang=languageFor(file);
  const c=content[lang];
  const outer=node=>node?.length?$.html(node):'';
  const introEyebrow=outer(intro.find('.eyebrow').first());
  const introTitle=outer(intro.find('h1').first());
  const introMeta=outer(intro.find('.cv-intro-meta').first());
  const stack=outer(sections.eq(1).find('.stack-grid').first());
  const meta=outer(sections.eq(2).find('.meta-grid').first());
  const referencesNode=sections.eq(3).find('.references').first().clone();
  referencesNode.find('.references-label').first().text(c.references);
  const references=outer(referencesNode);

  const labels={
    en:{archive:'Archive ↗',contact:'Contact ↗'},
    fr:{archive:'Archives ↗',contact:'Contact ↗'},
    es:{archive:'Archivo ↗',contact:'Contacto ↗'}
  }[lang];
  const links=`<div class="cv-links reveal"><a href="archive.html">${labels.archive}</a><a href="contact.html">${labels.contact}</a><a href="https://www.instagram.com/data_c0re_/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://github.com/Rzbck" target="_blank" rel="noreferrer">GitHub ↗</a></div>`;

  const composed=`
  <header class="cv-one-page__mast reveal">
    <div class="cv-one-page__identity">${introEyebrow}${introTitle}</div>
    <div class="cv-one-page__summary"><p>${esc(c.summary)}</p>${introMeta}</div>
  </header>
  <div class="cv-one-page__layout">
    <section class="cv-one-page__section cv-one-page__experience reveal">
      <div class="cv-one-page__section-head"><p>${esc(c.heads[0][0])}</p><h2>${esc(c.heads[0][1])}</h2></div>
      <div class="cv-list reveal">${rowsFor(lang)}</div>
    </section>
    <aside class="cv-one-page__aside" id="cv-details">
      <section class="cv-one-page__aside-section reveal"><div class="cv-one-page__section-head"><p>${esc(c.heads[1][0])}</p><h2>${esc(c.heads[1][1])}</h2></div>${stack}</section>
      <section class="cv-one-page__aside-section reveal"><div class="cv-one-page__section-head"><p>${esc(c.heads[2][0])}</p><h2>${esc(c.heads[2][1])}</h2></div>${meta}</section>
      <section class="cv-one-page__references reveal">${references}${links}</section>
    </aside>
  </div>`;

  main.attr('class','cv-one-page').attr('data-cv-one-page','').attr('data-cv-canonical','1');
  main.html(composed);
  finish($,file);
  console.log(`Composed canonical CV: ${file}`);
}
