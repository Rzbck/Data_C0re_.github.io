import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const homes=['index.html','en/index.html','fr/index.html','es/index.html'];
const archives=['archive.html','en/archive.html','fr/archive.html','es/archive.html'];

const copy={
  en:{
    label:'Practice',
    statement:'I design, program and operate realtime audiovisual systems for installations, stages and live performance.',
    detail:'TouchDesigner, projection, light, video and show control — from system design and programming to calibration, integration and operation on site.',
    geo:['Geneva','Switzerland','Lyon','Grenoble','Paris','Brazil','Europe','International'],
    capabilities:['TouchDesigner / SMODE / Resolume','Projection / realtime video / LED / DMX / Art-Net / show control'],
    archive:'ARCHIVE ↗',archiveSmall:'Projects / installations / stage / live AV / R&D',
    contact:'CONTACT ↗',contactSmall:'Projects / collaborations / production'
  },
  fr:{
    label:'Pratique',
    statement:'Je conçois, programme et exploite des systèmes audiovisuels temps réel pour l’installation, la scène et le live.',
    detail:'TouchDesigner, projection, lumière, vidéo et show control — de la conception système et la programmation jusqu’à la calibration, l’intégration et l’exploitation sur site.',
    geo:['Genève','Suisse','Lyon','Grenoble','Paris','Brésil','Europe','International'],
    capabilities:['TouchDesigner / SMODE / Resolume','Projection / vidéo temps réel / LED / DMX / Art-Net / show control'],
    archive:'ARCHIVES ↗',archiveSmall:'Projets / installations / scène / live AV / R&D',
    contact:'CONTACT ↗',contactSmall:'Projets / collaborations / production'
  },
  es:{
    label:'Práctica',
    statement:'Diseño, programo y opero sistemas audiovisuales en tiempo real para instalaciones, escena y directo.',
    detail:'TouchDesigner, proyección, luz, vídeo y show control — desde el diseño y la programación hasta la calibración, integración y operación in situ.',
    geo:['Ginebra','Suiza','Lyon','Grenoble','París','Brasil','Europa','Internacional'],
    capabilities:['TouchDesigner / SMODE / Resolume','Proyección / vídeo en tiempo real / LED / DMX / Art-Net / show control'],
    archive:'ARCHIVO ↗',archiveSmall:'Proyectos / instalaciones / escena / live AV / I+D',
    contact:'CONTACTO ↗',contactSmall:'Proyectos / colaboraciones / producción'
  }
};

const refs=[
  ['lumina','Geneva Lux / StripLab'],
  ['grand-theatre','Grand Théâtre de Genève'],
  ['comedie','Comédie de Genève'],
  ['hardwinner','La Belle Électrique / Hardwinner'],
  ['stage-systems','Fun Radio / Chambéry']
];

function langFor(rel){return rel.startsWith('fr/')?'fr':rel.startsWith('es/')?'es':'en'}
function prefixFor(rel){return rel.startsWith('fr/')?'fr/':rel.startsWith('es/')?'es/':rel.startsWith('en/')?'en/':''}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

for(const rel of homes){
  const file=path.join(ROOT,rel);if(!fs.existsSync(file))continue;
  const lang=langFor(rel),t=copy[lang],prefix=prefixFor(rel);
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});

  $('link[data-home-compact-v3]').remove();
  $('head').append('<link rel="stylesheet" href="assets/css/home-compact-v3.css?v=20260815-1" data-home-compact-v3>');

  const hero=$('main .hero').first();
  if(!hero.length)continue;
  hero.find('.hero-foot span').text(lang==='fr'?'Systèmes audiovisuels / 2016—2027':lang==='es'?'Sistemas audiovisuales / 2016—2027':'Audiovisual systems / 2016—2027');
  hero.find('.hero-foot a').attr('href','#practice').text(lang==='fr'?'voir ↓':lang==='es'?'ver ↓':'view ↓');

  $('main').children().not(hero).remove();
  const geo=t.geo.map(x=>`<span>${esc(x)}</span>`).join('');
  const contexts=refs.map(([slug,label])=>`<a class="home-context-link" href="${prefix}archive.html?project=${slug}" data-home-context-magnet>${esc(label)} ↗</a>`).join('');
  const section=`<section class="home-compact-v3" id="practice">
    <div class="home-compact-v3__intro">
      <div class="reveal"><p class="eyebrow">${esc(t.label)}</p><h2>${esc(t.statement)}</h2></div>
      <p class="home-compact-v3__intro-copy reveal">${esc(t.detail)}</p>
    </div>
    <div class="home-proof-line reveal">${geo}</div>
    <div class="home-context-links reveal">${contexts}</div>
    <div class="home-capability-lines reveal"><p>${esc(t.capabilities[0])}</p><p>${esc(t.capabilities[1])}</p></div>
    <div class="home-gates reveal">
      <a class="home-gate" href="${prefix}archive.html"><span>01</span><div><strong>${esc(t.archive)}</strong><small>${esc(t.archiveSmall)}</small></div></a>
      <a class="home-gate" href="${prefix}contact.html"><span>02</span><div><strong>${esc(t.contact)}</strong><small>${esc(t.contactSmall)}</small></div></a>
    </div>
  </section>`;
  hero.after(section);

  $('footer.global-footer').remove();
  $('body script[data-home-compact-v3-js]').remove();
  $('body').append('<script src="assets/js/home-compact-v3.js?v=20260815-1" defer data-home-compact-v3-js></script>');
  fs.writeFileSync(file,$.html(),'utf8');
}

for(const rel of archives){
  const file=path.join(ROOT,rel);if(!fs.existsSync(file))continue;
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  $('.archive-entry').each((_,el)=>{
    const href=$(el).attr('href')||'';
    const m=href.match(/projects\/([^/.]+)\.html/);
    if(m)$(el).attr('data-archive-project',m[1]);
  });
  if(!$('link[data-home-compact-v3]').length)$('head').append('<link rel="stylesheet" href="assets/css/home-compact-v3.css?v=20260815-1" data-home-compact-v3>');
  fs.writeFileSync(file,$.html(),'utf8');
}

console.log('Compact Home V3 applied: proof, references, capabilities and Archive/Contact gates.');
