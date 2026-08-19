import fs from 'node:fs';
import * as cheerio from 'cheerio';

const files=['cv.html','en/cv.html','fr/cv.html','es/cv.html'];

const esc=value=>String(value??'')
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;');

for(const file of files){
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,'utf8');
  const $=cheerio.load(html,{decodeEntities:false});
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

  const experience=outer(sections.eq(0).find('.cv-list').first());
  const stack=outer(sections.eq(1).find('.stack-grid').first());
  const meta=outer(sections.eq(2).find('.meta-grid').first());
  const references=outer(sections.eq(3).find('.references').first());
  const links=outer(sections.eq(3).find('.cv-links').first());

  const compact=`
  <header class="cv-one-page__mast reveal">
    <div class="cv-one-page__identity">${introEyebrow}${introTitle}</div>
    <div class="cv-one-page__summary">${introCopy}${introMeta}</div>
  </header>
  <div class="cv-one-page__layout">
    <section class="cv-one-page__section cv-one-page__experience reveal">
      ${sectionHead(0)}
      ${experience}
    </section>
    <aside class="cv-one-page__aside">
      <section class="cv-one-page__aside-section reveal">
        ${sectionHead(1)}
        ${stack}
      </section>
      <section class="cv-one-page__aside-section reveal">
        ${sectionHead(2)}
        ${meta}
      </section>
      <section class="cv-one-page__references reveal">
        ${references}
        ${links}
      </section>
    </aside>
  </div>`;

  main.attr('class','cv-one-page').attr('data-cv-one-page','');
  main.html(compact);
  $('body').addClass('cv-one-page-ready');

  $('link[data-cv-one-page]').remove();
  const prefix=file.includes('/')?'../':'';
  $('head').append(`\n<link rel="stylesheet" href="${prefix}assets/css/cv-one-page-v1.css?v=20260819-1" data-cv-one-page="">\n`);

  fs.writeFileSync(file,$.html());
  console.log(`Composed compact CV: ${file}`);
}
