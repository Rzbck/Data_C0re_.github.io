import fs from 'node:fs';
import * as cheerio from 'cheerio';

const files = [
  'projects/comedie.html',
  'en/projects/comedie.html',
  'fr/projects/comedie.html',
  'es/projects/comedie.html'
];

const shows = {
  entre: {
    source: 'https://www.piccoloteatro.org/en/2021-2022/entre-chien-et-loup',
    credit: 'Magali Dougados / Piccolo Teatro',
    imageCredits: [
      'Magali Dougados / Piccolo Teatro',
      'Masiar Pasquali / Piccolo Teatro',
      'Magali Dougados / Piccolo Teatro'
    ],
    images: [
      'https://www.piccoloteatro.org/sites/default/files/styles/show_hero_i/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_entre-chien-et-loup-1000x750_original_11.jpg?itok=x502vh4f',
      'https://www.piccoloteatro.org/sites/default/files/styles/galley_image/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_backstage-entre-chien-et-loup-01_original_3.jpg?itok=E4pOkmW3',
      'https://www.piccoloteatro.org/sites/default/files/styles/galley_image/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_entre-chien-et-loup-01_original_3.jpg?itok=29D2jKtS'
    ]
  },
  emigrants: {
    source: 'https://www.theatre-odeon.eu/en/les-emigrants',
    credit: 'Simon Gosselin / Odéon–Théâtre de l’Europe',
    images: [
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVNek0zIiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--018c40d3bcfa95a4cdf2728f1670fa4e686c883144f2499d3b08cc14c4f2ecc1/4a41df1e38dc/les-emigrants-11-01-24-simon-gosselin-2-62.jpg',
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVNems1IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--a09558672e73c5e550e27845c61ab53e02ecfc7065307e11c230bf25ec20b56f/bca32ae5b6d6/les-emigrants-11-01-24-simon-gosselin-2-54.jpg',
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVOREF3IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--b14b9a4c45162b50293407ba680a28476c069c80301eb0b85ee101d56a1dc486/b1a149f0cd2b/les-emigrants-11-01-24-simon-gosselin-1-32-1.jpg'
    ]
  },
  transit: {
    source: 'https://www.theatre-odeon.eu/fr/en-transit',
    credit: 'Magali Dougados / Odéon–Théâtre de l’Europe',
    images: [
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREU1IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--f5b0720c9af9ad0782dd8ee9de1fe10a750bc072040033880a73adfba2eb7ef6/754ce36543cc/190408-22022022_en_transit_comedie_magali_dougados_e8a5076-min.jpg',
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREl4IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--bf77427afcdd49ceffde99bfa63d1fdb3acf66c8bc4fa02c1415348f3c0040c5/c17632739dfa/190408-22022022_en_transit_comedie_magali_dougados_e8a5098-min.jpg',
      'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREl6IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--b37b8fbc2f376424d336ca1aee67385440f9530d20cafb49d53e8fef2ba4a9f3/1c228908c1f7/190408-22022022_en_transit_comedie_magali_dougados_e8a5211-min.jpg'
    ]
  }
};

const copy = {
  en: {
    context: 'Comédie de Genève / Video Systems / 2021—2023',
    entre: 'Entre chien et loup / Christiane Jatahy',
    emigrants: 'Les Émigrants / Krystian Lupa',
    transit: 'En transit / Amir Reza Koohestani',
    source: 'Official production photography'
  },
  fr: {
    context: 'Comédie de Genève / Systèmes vidéo / 2021—2023',
    entre: 'Entre chien et loup / Christiane Jatahy',
    emigrants: 'Les Émigrants / Krystian Lupa',
    transit: 'En transit / Amir Reza Koohestani',
    source: 'Photographies officielles de production'
  },
  es: {
    context: 'Comédie de Genève / Sistemas de vídeo / 2021—2023',
    entre: 'Entre chien et loup / Christiane Jatahy',
    emigrants: 'Les Émigrants / Krystian Lupa',
    transit: 'En transit / Amir Reza Koohestani',
    source: 'Fotografías oficiales de producción'
  }
};

const style = `
<style data-comedie-official-media="">
/* Comédie case study — one magnetic screen per production. */
body.comedie-page main article>.project-section{width:100%;max-width:none;padding:0;border-top:0}
body.comedie-page .theatre-lead,[data-comedie-official-gallery]{display:none!important}
body.comedie-page .project-hero.comedie-show-screen,
body.comedie-page .production-block.comedie-show-screen{
  box-sizing:border-box;
  width:min(var(--max),100%);
  margin:0 auto;
  min-height:100svh;
  padding:calc(var(--header) + clamp(24px,3.5vh,46px)) var(--gutter) clamp(22px,3vh,38px)!important;
  border-top:1px solid var(--line);
  display:flex!important;
  flex-direction:column;
  justify-content:center;
  align-content:initial!important;
}
body.comedie-page .project-hero.comedie-show-screen{border-top:0}
body.comedie-page .comedie-show-context{margin:0 0 clamp(14px,2vh,24px);color:var(--cyan);font-size:9px;font-weight:800;line-height:1;text-transform:uppercase;letter-spacing:.12em}
body.comedie-page .production-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.78fr);gap:clamp(28px,4.5vw,72px);align-items:end}
body.comedie-page .production-head h2{margin:0;font-size:clamp(42px,5vw,76px)!important;line-height:.9;letter-spacing:-.055em}
body.comedie-page .production-role{display:block;margin-bottom:10px;color:var(--acid);font-size:8.5px;text-transform:uppercase;letter-spacing:.11em;font-weight:800}
body.comedie-page .production-head p{margin:0;color:#bbb9b3;font-size:clamp(13px,1.05vw,16px);line-height:1.48}
body.comedie-page .production-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:clamp(14px,2vh,22px) 0 12px!important}
body.comedie-page .production-facts div{padding:10px 11px;border-right:1px solid var(--line)}
body.comedie-page .production-facts div:first-child{padding-left:0}
body.comedie-page .production-facts div:last-child{border-right:0}
body.comedie-page .production-facts strong{display:block;font-size:clamp(16px,1.55vw,24px);line-height:1}
body.comedie-page .production-facts span{display:block;margin-top:5px;color:var(--grey);font-size:7.8px;line-height:1.25;text-transform:uppercase;letter-spacing:.075em}
.comedie-show-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:4px}
.comedie-show-gallery figure{margin:0;min-width:0;background:#020202;overflow:hidden}
.comedie-show-gallery img{display:block;width:100%;height:clamp(210px,27vh,330px);object-fit:cover;background:#020202}
.comedie-show-gallery figcaption{padding:7px 0 0;color:var(--grey);font-size:7.8px;line-height:1.3;text-transform:uppercase;letter-spacing:.07em}
.comedie-show-gallery figcaption a:hover{color:var(--acid)}
body.comedie-page .route{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:12px!important}
body.comedie-page .route div{padding:8px 9px;border-right:1px solid var(--line)}
body.comedie-page .route div:last-child{border-right:0}
body.comedie-page .route time{display:block;color:var(--acid);font-size:7.5px}
body.comedie-page .route strong{display:block;margin-top:4px;font-size:9.5px}
body.comedie-page .route span{display:block;margin-top:3px;color:var(--grey);font-size:7.4px;line-height:1.2}
body.comedie-page .install-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px!important}
body.comedie-page .install-steps div{border:1px solid var(--line);padding:9px 10px}
body.comedie-page .install-steps b{display:block;color:var(--cyan);font-size:7.5px}
body.comedie-page .install-steps strong{display:block;margin-top:5px;font-size:10px}
body.comedie-page .install-steps span{display:block;margin-top:4px;color:var(--grey);font-size:7.8px;line-height:1.25}
body.comedie-page .theatre-media{display:none!important}
body.fullpage-comedie .project-hero.comedie-show-screen.fullpage-panel{
  height:100svh!important;min-height:680px!important;display:flex!important;grid-template-rows:none!important;align-content:initial!important;
}
body.fullpage-comedie .production-block.comedie-show-screen.fullpage-panel{
  height:100svh!important;min-height:680px!important;display:flex!important;align-content:initial!important;
}
@media(max-height:800px) and (min-width:821px){
  body.comedie-page .project-hero.comedie-show-screen,body.comedie-page .production-block.comedie-show-screen{padding-top:calc(var(--header) + 14px)!important;padding-bottom:16px!important}
  body.comedie-page .comedie-show-context{margin-bottom:10px}
  body.comedie-page .production-head h2{font-size:clamp(34px,4.2vw,58px)!important}
  body.comedie-page .production-head p{font-size:12px;line-height:1.4}
  body.comedie-page .production-facts{margin:10px 0 8px!important}
  .comedie-show-gallery img{height:clamp(170px,24vh,250px)}
  body.comedie-page .route,body.comedie-page .install-steps{margin-top:8px!important}
}
@media(max-width:820px){
  html.fullpage-mode body.comedie-page{overflow-x:hidden}
  body.fullpage-comedie .project-hero.comedie-show-screen.fullpage-panel,
  body.fullpage-comedie .production-block.comedie-show-screen.fullpage-panel,
  body.comedie-page .project-hero.comedie-show-screen,
  body.comedie-page .production-block.comedie-show-screen{
    height:auto!important;
    min-height:auto!important;
    width:100%!important;
    max-width:100%!important;
    display:block!important;
    overflow:visible!important;
    padding:calc(var(--header) + 28px) max(18px,var(--gutter)) 48px!important;
  }
  body.comedie-page .comedie-show-context{margin-bottom:16px;font-size:8px;line-height:1.35}
  body.comedie-page .production-head{display:block!important}
  body.comedie-page .production-head>div{min-width:0}
  body.comedie-page .production-head h2{font-size:clamp(38px,11vw,58px)!important;line-height:.92!important;letter-spacing:-.052em;overflow-wrap:normal;word-break:normal}
  body.comedie-page .production-role{font-size:8px;line-height:1.35;margin-bottom:9px}
  body.comedie-page .production-head p{margin-top:18px;font-size:15px;line-height:1.5;max-width:none}
  body.comedie-page .production-facts{grid-template-columns:repeat(2,minmax(0,1fr));margin:24px 0 18px!important}
  body.comedie-page .production-facts div{min-width:0;padding:12px 10px;border-top:1px solid var(--line);border-right:1px solid var(--line)}
  body.comedie-page .production-facts div:nth-child(even){border-right:0}
  body.comedie-page .production-facts div:first-child{padding-left:10px}
  body.comedie-page .production-facts strong{font-size:20px;line-height:1.05;overflow-wrap:anywhere}
  body.comedie-page .production-facts span{font-size:8px;line-height:1.35}
  .comedie-show-gallery{grid-template-columns:1fr;gap:18px;margin-top:0}
  .comedie-show-gallery figure,.comedie-show-gallery figure:first-child{grid-column:auto;overflow:visible}
  .comedie-show-gallery img{height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:4/3;object-fit:cover}
  .comedie-show-gallery figcaption{padding-top:7px;font-size:8px;line-height:1.4;overflow-wrap:anywhere}
  body.comedie-page .route{display:grid!important;grid-template-columns:1fr 1fr!important;overflow:visible!important;margin-top:22px!important}
  body.comedie-page .route div{min-width:0!important;padding:11px 10px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
  body.comedie-page .route div:nth-child(even){border-right:0}
  body.comedie-page .route time{font-size:8px}
  body.comedie-page .route strong{font-size:11px}
  body.comedie-page .route span{font-size:8px}
  body.comedie-page .install-steps{grid-template-columns:1fr 1fr;margin-top:20px!important}
  body.comedie-page .install-steps div{padding:13px}
  body.comedie-page .install-steps b{font-size:8px}
  body.comedie-page .install-steps strong{font-size:12px}
  body.comedie-page .install-steps span{font-size:9px;line-height:1.4}
}
@media(max-width:520px){
  body.fullpage-comedie .project-hero.comedie-show-screen.fullpage-panel,
  body.fullpage-comedie .production-block.comedie-show-screen.fullpage-panel,
  body.comedie-page .project-hero.comedie-show-screen,
  body.comedie-page .production-block.comedie-show-screen{padding-left:18px!important;padding-right:18px!important;padding-bottom:42px!important}
  body.comedie-page .production-head h2{font-size:clamp(35px,12.5vw,50px)!important}
  body.comedie-page .production-head p{font-size:14px}
  body.comedie-page .production-facts{grid-template-columns:1fr}
  body.comedie-page .production-facts div,body.comedie-page .production-facts div:nth-child(even){border-right:0}
  .comedie-show-gallery img{aspect-ratio:3/2}
  body.comedie-page .route{grid-template-columns:1fr!important}
  body.comedie-page .route div,body.comedie-page .route div:nth-child(even){border-right:0}
  body.comedie-page .install-steps{grid-template-columns:1fr}
}
</style>`;

function languageFor(file){
  if(file.startsWith('fr/')) return 'fr';
  if(file.startsWith('es/')) return 'es';
  return 'en';
}

function gallery(key, lang){
  const show = shows[key];
  const t = copy[lang];
  const title = t[key];
  return `<div class="comedie-show-gallery" data-comedie-show-gallery="${key}">
    ${show.images.map((src,index)=>{
      const credit = show.imageCredits?.[index] || show.credit;
      return `<figure><img src="${src}" alt="${title} — ${index+1}" ${index ? 'loading="lazy"' : ''} decoding="async" referrerpolicy="no-referrer"><figcaption><a href="${show.source}" target="_blank" rel="noreferrer">${t.source} — © ${credit} ↗</a></figcaption></figure>`;
    }).join('')}
  </div>`;
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
  $('head').append('\n<link rel="preconnect" href="https://www.piccoloteatro.org" crossorigin data-comedie-preconnect="">\n<link rel="preconnect" href="https://cdn.artishoc.coop" crossorigin data-comedie-preconnect="">\n');

  $('[data-comedie-official-gallery]').remove();
  $('.theatre-lead').remove();
  $('.theatre-media').remove();
  $('[data-comedie-show-gallery]').remove();

  const blocks = $('.production-block').toArray();
  if(blocks.length < 3) continue;
  const keys = ['entre','emigrants','transit'];

  blocks.slice(0,3).forEach((node,index)=>{
    const key = keys[index];
    const block = $(node);
    block.addClass(`comedie-show-screen comedie-show-screen--${key}`).attr('data-comedie-show',key);
    const facts = block.find('.production-facts').first();
    if(facts.length) facts.after(gallery(key,lang));
    else block.find('.production-head').first().after(gallery(key,lang));
  });

  const first = $(blocks[0]);
  const hero = $('header.project-hero').first();
  if(hero.length){
    const firstHead = first.find('.production-head').first().clone();
    const firstFacts = first.find('.production-facts').first().clone();
    const firstGallery = first.find('[data-comedie-show-gallery="entre"]').first().clone();
    const firstRoute = first.find('.route').first().clone();
    hero.empty();
    hero.addClass('comedie-show-screen comedie-show-screen--entre').attr('data-comedie-show','entre');
    hero.append(`<p class="comedie-show-context">${copy[lang].context}</p>`);
    hero.append(firstHead);
    hero.append(firstFacts);
    hero.append(firstGallery);
    if(firstRoute.length) hero.append(firstRoute);
    first.remove();
  }

  fs.writeFileSync(file,$.html());
  console.log(`Rebuilt Comédie as one-screen-per-show: ${file}`);
}
