import fs from 'node:fs';
import * as cheerio from 'cheerio';

// Editorial CV v3 — first desktop viewport is reserved for the full professional path.
const files=['cv.html','en/cv.html','fr/cv.html','es/cv.html'];

const esc=value=>String(value??'')
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;');

const genevaLux={
  en:{
    name:'Geneva Lux / LUMINA',
    role:'Creative technologist / realtime systems + integration — ongoing',
    detail:'Fusion 360 structure and fabrication drawings, network planning, addressable LED integration, TouchDesigner programming, Art-Net architecture, workshop coordination and technical integration on site.',
    jump:'Technical range + background'
  },
  fr:{
    name:'Geneva Lux / LUMINA',
    role:'Creative technologist / systèmes temps réel + intégration — en cours',
    detail:'Structure et plans de fabrication sous Fusion 360, planification réseau, intégration LED adressable, programmation TouchDesigner, architecture Art-Net, coordination atelier et intégration technique sur site.',
    jump:'Compétences + parcours'
  },
  es:{
    name:'Geneva Lux / LUMINA',
    role:'Creative technologist / sistemas en tiempo real + integración — en curso',
    detail:'Estructura y planos de fabricación en Fusion 360, planificación de red, integración LED direccionable, programación TouchDesigner, arquitectura Art-Net, coordinación de taller e integración técnica in situ.',
    jump:'Herramientas + trayectoria'
  }
};

const languageFor=file=>file.startsWith('fr/')?'fr':file.startsWith('es/')?'es':'en';

function genevaRow(lang){
  const g=genevaLux[lang];
  return `<article class="cv-row cv-row--current"><time>2025—27</time><div class="cv-title"><strong>${esc(g.name)}</strong><span class="cv-status">${esc(g.role)}</span></div><div class="cv-detail"><p>${esc(g.detail)}</p></div></article>`;
}

function ensureCurrentLayout($,file){
  const main=$('main.cv-one-page').first();
  if(!main.length)return false;

  const lang=languageFor(file);
  const experience=main.find('.cv-one-page__experience').first();
  const list=experience.find('.cv-list').first();
  if(experience.length&&list.length){
    const hasGeneva=list.find('.cv-row').filter((_,el)=>/geneva\s*lux|lumina/i.test($(el).text())).length>0;
    if(!hasGeneva)list.prepend(genevaRow(lang));
    const current=list.find('.cv-row').filter((_,el)=>/geneva\s*lux|lumina/i.test($(el).text())).first();
    if(current.length)current.addClass('cv-row--current');

    experience.find('.cv-jump').remove();
    experience.append(`<a class="cv-jump" href="#cv-details" aria-label="${esc(genevaLux[lang].jump)}"><span>${esc(genevaLux[lang].jump)}</span><b aria-hidden="true">↓</b></a>`);
  }

  const lower=main.find('.cv-one-page__aside,.cv-one-page__lower').first();
  if(lower.length)lower.attr('id','cv-details');

  $('link[data-cv-one-page]').remove();
  const prefix=file.includes('/')?'../':'';
  $('head').append(`\n<link rel="stylesheet" href="${prefix}assets/css/cv-one-page-v1.css?v=20260819-3" data-cv-one-page="">\n`);
  $('body').addClass('cv-one-page-ready');

  fs.writeFileSync(file,$.html());
  console.log(`Updated viewport CV: ${file}`);
  return true;
}

for(const file of files){
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,'utf8');
  const $=cheerio.load(html,{decodeEntities:false});

  // Most dev builds already contain the composed CV. Patch that representation directly.
  if(ensureCurrentLayout($,file))continue;

  // Fallback for a fresh source build that still contains the original four CV sections.
  const main=$('main').first();
  const intro=main.children('.cv-intro').first();
  const sections=main.children('.cv-section');
  if(!intro.length||sections.length<4)continue;

  const outer=node=>node?.length?$.html(node):'';
  const introEyebrow=outer(intro.find('.eyebrow').first());
  const introTitle=outer(intro.find('h1').first());
  const introCopy=outer(intro.children('p').not('.eyebrow').first());
  const introMeta=outer(intro.find('.cv-intro-meta').first());

  const sectionHead=index=>{
    const section=sections.eq(index);
    const label=section.find('.cv-head p').first().text().trim();
    const title=section.find('.cv-head h2').first().text().trim();
    return `<div class="cv-one-page__section-head"><p>${esc(label)}</p><h2>${esc(title)}</h2></div>`;
  };

  const lang=languageFor(file);
  const experienceNode=sections.eq(0).find('.cv-list').first().clone();
  const hasGeneva=experienceNode.find('.cv-row').filter((_,el)=>/geneva\s*lux|lumina/i.test($(el).text())).length>0;
  if(!hasGeneva)experienceNode.prepend(genevaRow(lang));

  const stack=outer(sections.eq(1).find('.stack-grid').first());
  const meta=outer(sections.eq(2).find('.meta-grid').first());
  const referencesNode=sections.eq(3).find('.references').first().clone();
  referencesNode.find('.references-label').each((_,el)=>{
    const current=$(el).text();
    $(el).text(current.replace(/^\s*06\s*\//,'04 /'));
  });
  const references=outer(referencesNode);

  const labels={
    en:{archive:'Archive ↗',contact:'Contact ↗'},
    fr:{archive:'Archive ↗',contact:'Contact ↗'},
    es:{archive:'Archivo ↗',contact:'Contacto ↗'}
  }[lang];
  const links=`<div class="cv-links reveal"><a href="archive.html">${labels.archive}</a><a href="contact.html">${labels.contact}</a><a href="https://www.instagram.com/data_c0re_/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://github.com/Rzbck" target="_blank" rel="noreferrer">GitHub ↗</a></div>`;

  const composed=`
  <header class="cv-one-page__mast reveal">
    <div class="cv-one-page__identity">${introEyebrow}${introTitle}</div>
    <div class="cv-one-page__summary">${introCopy}${introMeta}</div>
  </header>
  <div class="cv-one-page__layout">
    <section class="cv-one-page__section cv-one-page__experience reveal">
      ${sectionHead(0)}
      ${outer(experienceNode)}
      <a class="cv-jump" href="#cv-details" aria-label="${esc(genevaLux[lang].jump)}"><span>${esc(genevaLux[lang].jump)}</span><b aria-hidden="true">↓</b></a>
    </section>
    <aside class="cv-one-page__aside" id="cv-details">
      <section class="cv-one-page__aside-section reveal">${sectionHead(1)}${stack}</section>
      <section class="cv-one-page__aside-section reveal">${sectionHead(2)}${meta}</section>
      <section class="cv-one-page__references reveal">${references}${links}</section>
    </aside>
  </div>`;

  main.attr('class','cv-one-page').attr('data-cv-one-page','');
  main.html(composed);
  $('body').addClass('cv-one-page-ready');
  $('link[data-cv-one-page]').remove();
  const prefix=file.includes('/')?'../':'';
  $('head').append(`\n<link rel="stylesheet" href="${prefix}assets/css/cv-one-page-v1.css?v=20260819-3" data-cv-one-page="">\n`);

  fs.writeFileSync(file,$.html());
  console.log(`Composed viewport CV: ${file}`);
}
