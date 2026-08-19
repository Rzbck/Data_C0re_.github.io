import fs from 'node:fs';
import * as cheerio from 'cheerio';

// v2: preserve the validated desktop composition, remove the duplicate Entre chien et loup image, and force a native mobile flow.
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
      'assets/media/comedie/entre/official-01.jpg',
      'assets/media/comedie/entre/official-02.jpg',
      'assets/media/comedie/entre/official-03.jpg'
    ]
  },
  emigrants: {
    source: 'https://www.theatre-odeon.eu/en/les-emigrants',
    credit: 'Simon Gosselin / Odéon–Théâtre de l’Europe',
    images: [
      'assets/media/comedie/emigrants/official-01.jpg',
      'assets/media/comedie/emigrants/official-02.jpg',
      'assets/media/comedie/emigrants/official-03.jpg'
    ]
  },
  transit: {
    source: 'https://www.theatre-odeon.eu/fr/en-transit',
    credit: 'Magali Dougados / Odéon–Théâtre de l’Europe',
    images: [
      'assets/media/comedie/transit/official-01.jpg',
      'assets/media/comedie/transit/official-02.jpg',
      'assets/media/comedie/transit/official-03.jpg'
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
  $('head').append('\n\n\n');

  $('[data-comedie-official-gallery]').remove();
  $('.theatre-lead').remove();
  $('.theatre-media').remove();
  $('[data-comedie-show-gallery]').remove();

  const hero = $('header.project-hero').first();
  const blocks = $('.production-block').toArray();

  // Re-running the dev build must refresh an already-composed Comédie page instead of silently skipping it.
  if(hero.attr('data-comedie-show') === 'entre' && blocks.length >= 2){
    hero.addClass('comedie-show-screen comedie-show-screen--entre').attr('data-comedie-show','entre');
    const context = hero.find('.comedie-show-context').first();
    if(context.length) context.text(copy[lang].context);
    else hero.prepend(`<p class="comedie-show-context">${copy[lang].context}</p>`);
    const heroFacts = hero.find('.production-facts').first();
    if(heroFacts.length) heroFacts.after(gallery('entre',lang));
    else hero.find('.production-head').first().after(gallery('entre',lang));

    ['emigrants','transit'].forEach((key,index)=>{
      const block = $(blocks[index]);
      if(!block.length) return;
      block.addClass(`comedie-show-screen comedie-show-screen--${key}`).attr('data-comedie-show',key);
      const facts = block.find('.production-facts').first();
      if(facts.length) facts.after(gallery(key,lang));
      else block.find('.production-head').first().after(gallery(key,lang));
    });

    fs.writeFileSync(file,$.html());
    console.log(`Refreshed existing Comédie one-screen layout: ${file}`);
    continue;
  }

  if(blocks.length < 3){
    fs.writeFileSync(file,$.html());
    console.log(`Updated Comédie responsive shell: ${file}`);
    continue;
  }

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
