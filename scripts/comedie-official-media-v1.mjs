import fs from 'node:fs';
import * as cheerio from 'cheerio';

const files = [
  'projects/comedie.html',
  'en/projects/comedie.html',
  'fr/projects/comedie.html',
  'es/projects/comedie.html'
];

const images = {
  entre: 'https://festival-avignon.com/storage/image/62/76162_60e2fdac27430.jpeg',
  emigrants: 'https://cdn.artishoc.coop/b8491946-0301-4489-b3ce-b6e22d3cd19e/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1qRTFNVFF4IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--9446bdacd4d3a704546ff57f911244d3bbfb682e5aafa45602220f8e8604f167/9d4e9c845bfb/149181-20230509_plateau_emigrants_dougados_magali__e8a4963.jpg',
  transit: 'https://festival-avignon.com/storage/image/96/218796_62c6aa2080515.jpeg'
};

const sourceLinks = {
  entre: 'https://festival-avignon.com/fr/edition-2021/programmation/entre-chien-et-loup-59236',
  emigrants: 'https://www.comedie.ch/fr/jouer-avec-krystian-lupa',
  transit: 'https://festival-avignon.com/fr/edition-2022/programmation/en-transit-190913'
};

const copy = {
  en: {
    entreAlt: 'Entre chien et loup by Christiane Jatahy, Festival d Avignon 2021',
    entreCap: 'Entre chien et loup / Christiane Jatahy — Festival d’Avignon 2021 — © Christophe Raynaud de Lage / Festival d’Avignon',
    emigrantsAlt: 'Les Emigrants by Krystian Lupa during creation at Comedie de Geneve',
    emigrantsCap: 'Les Émigrants / creation at Comédie de Genève — © Magali Dougados',
    transitAlt: 'En transit by Amir Reza Koohestani, Festival d Avignon 2022',
    transitCap: 'En transit / Amir Reza Koohestani — Festival d’Avignon 2022 — © Christophe Raynaud de Lage / Festival d’Avignon'
  },
  fr: {
    entreAlt: 'Entre chien et loup de Christiane Jatahy au Festival d Avignon 2021',
    entreCap: 'Entre chien et loup / Christiane Jatahy — Festival d’Avignon 2021 — © Christophe Raynaud de Lage / Festival d’Avignon',
    emigrantsAlt: 'Les Emigrants de Krystian Lupa en creation a la Comedie de Geneve',
    emigrantsCap: 'Les Émigrants / création à la Comédie de Genève — © Magali Dougados',
    transitAlt: 'En transit de Amir Reza Koohestani au Festival d Avignon 2022',
    transitCap: 'En transit / Amir Reza Koohestani — Festival d’Avignon 2022 — © Christophe Raynaud de Lage / Festival d’Avignon'
  },
  es: {
    entreAlt: 'Entre chien et loup de Christiane Jatahy en el Festival de Avignon 2021',
    entreCap: 'Entre chien et loup / Christiane Jatahy — Festival d’Avignon 2021 — © Christophe Raynaud de Lage / Festival d’Avignon',
    emigrantsAlt: 'Les Emigrants de Krystian Lupa durante la creacion en Comedie de Geneve',
    emigrantsCap: 'Les Émigrants / creación en Comédie de Genève — © Magali Dougados',
    transitAlt: 'En transit de Amir Reza Koohestani en el Festival de Avignon 2022',
    transitCap: 'En transit / Amir Reza Koohestani — Festival d’Avignon 2022 — © Christophe Raynaud de Lage / Festival d’Avignon'
  }
};

const style = `
<style data-comedie-official-media="">
/* Comédie case study — official production imagery, using the shared DATA C0RE layout language. */
body.comedie-page .project-hero{padding-top:clamp(96px,9vw,150px);padding-bottom:clamp(24px,3vw,42px)}
body.comedie-page .project-hero-copy{align-items:end}
body.comedie-page .project-facts{margin-bottom:0}
.comedie-visual-intro{width:min(var(--max),100%);margin:0 auto;padding:0 var(--gutter) clamp(64px,8vw,118px);display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,.64fr);gap:10px}
.comedie-visual-intro figure{margin:0;min-width:0;background:#020202;overflow:hidden}
.comedie-visual-intro__main,.comedie-visual-intro__stack{height:min(62vh,720px)}
.comedie-visual-intro__stack{display:grid;grid-template-rows:1fr 1fr;gap:10px}
.comedie-visual-intro__stack figure{min-height:0}
.comedie-visual-intro img{display:block;width:100%;height:100%;object-fit:cover;background:#020202}
.comedie-visual-intro figcaption{padding:9px 0 2px;color:var(--grey);font-size:9px;line-height:1.35;text-transform:uppercase;letter-spacing:.075em}
.comedie-visual-intro figcaption a:hover{color:var(--acid)}
body.comedie-page .theatre-lead{display:none}
@media(max-width:900px){.comedie-visual-intro{grid-template-columns:1fr}.comedie-visual-intro__main{height:min(58vh,620px)}.comedie-visual-intro__stack{height:auto;grid-template-columns:1fr 1fr;grid-template-rows:none}.comedie-visual-intro__stack figure{height:42vw;min-height:260px;max-height:440px}}
@media(max-width:620px){body.comedie-page .project-hero{padding-top:90px}.comedie-visual-intro{padding-inline:18px}.comedie-visual-intro__main{height:58vw;min-height:300px}.comedie-visual-intro__stack{grid-template-columns:1fr}.comedie-visual-intro__stack figure{height:58vw;min-height:260px}.comedie-visual-intro figcaption{font-size:8px}}
</style>`;

function languageFor(file){
  if(file.startsWith('fr/')) return 'fr';
  if(file.startsWith('es/')) return 'es';
  return 'en';
}

function gallery(lang){
  const t = copy[lang];
  return `<section class="comedie-visual-intro reveal" data-comedie-official-gallery="">
    <figure class="comedie-visual-intro__main">
      <img src="${images.entre}" alt="${t.entreAlt}" decoding="async" fetchpriority="high" referrerpolicy="no-referrer">
      <figcaption><a href="${sourceLinks.entre}" target="_blank" rel="noreferrer">${t.entreCap} ↗</a></figcaption>
    </figure>
    <div class="comedie-visual-intro__stack">
      <figure>
        <img src="${images.emigrants}" alt="${t.emigrantsAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <figcaption><a href="${sourceLinks.emigrants}" target="_blank" rel="noreferrer">${t.emigrantsCap} ↗</a></figcaption>
      </figure>
      <figure>
        <img src="${images.transit}" alt="${t.transitAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <figcaption><a href="${sourceLinks.transit}" target="_blank" rel="noreferrer">${t.transitCap} ↗</a></figcaption>
      </figure>
    </div>
  </section>`;
}

for(const file of files){
  if(!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file,'utf8');
  const $ = cheerio.load(html,{decodeEntities:false});
  const lang = languageFor(file);

  $('body').addClass('comedie-page');
  $('style[data-comedie-official-media]').remove();
  $('head').append(style);

  $('link[data-comedie-preconnect]').remove();
  $('head').append('\n<link rel="preconnect" href="https://festival-avignon.com" crossorigin data-comedie-preconnect="">\n<link rel="preconnect" href="https://cdn.artishoc.coop" crossorigin data-comedie-preconnect="">\n');

  $('[data-comedie-official-gallery]').remove();
  const hero = $('header.project-hero').first();
  if(hero.length) hero.after(gallery(lang));

  fs.writeFileSync(file,$.html());
  console.log(`Applied official Comédie imagery: ${file}`);
}
