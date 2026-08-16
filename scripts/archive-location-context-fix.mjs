import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const archives=['archive.html','en/archive.html','fr/archive.html','es/archive.html'];

const contexts={
  en:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPERA',comedie:'THEATRE',hardwinner:'LIVE AV','stage-systems':'STAGE SYSTEMS',snake:'SOFTWARE',signal:'SIMULATION',ascii:'STUDY',realtime:'RESEARCH',cloud:'STUDY'},
  fr:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPÉRA',comedie:'THÉÂTRE',hardwinner:'LIVE AV','stage-systems':'SYSTÈMES SCÈNE',snake:'LOGICIEL',signal:'SIMULATION',ascii:'ÉTUDE',realtime:'RECHERCHE',cloud:'ÉTUDE'},
  es:{lumina:'INSTALACIÓN','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'ÓPERA',comedie:'TEATRO',hardwinner:'LIVE AV','stage-systems':'SISTEMAS ESCÉNICOS',snake:'SOFTWARE',signal:'SIMULACIÓN',ascii:'ESTUDIO',realtime:'INVESTIGACIÓN',cloud:'ESTUDIO'}
};

const copy={
  en:{
    lumina:'Geneva, Switzerland / public installation / realtime systems + integration',
    'last-low-bandwidth-message':'Vancouver, Canada / small-file film / 1:25 / 1.79 MB / SFMF 2026',
    'grand-theatre':'Geneva, Switzerland / opera / stage video / SMODE + projection',
    comedie:'Geneva, Switzerland / theatre / video systems + touring',
    hardwinner:'Grenoble, France / live AV / La Belle Électrique / TouchDesigner + Resolume',
    'stage-systems':'Chambéry, France / stage systems / Fun Radio / lighting + video'
  },
  fr:{
    lumina:'Genève, Suisse / installation publique / systèmes temps réel + intégration',
    'last-low-bandwidth-message':'Vancouver, Canada / film small-file / 1:25 / 1,79 MB / SFMF 2026',
    'grand-theatre':'Genève, Suisse / opéra / vidéo scène / SMODE + projection',
    comedie:'Genève, Suisse / théâtre / systèmes vidéo + tournée',
    hardwinner:'Grenoble, France / live AV / La Belle Électrique / TouchDesigner + Resolume',
    'stage-systems':'Chambéry, France / systèmes scène / Fun Radio / lumière + vidéo'
  },
  es:{
    lumina:'Ginebra, Suiza / instalación pública / sistemas en tiempo real + integración',
    'last-low-bandwidth-message':'Vancouver, Canadá / película small-file / 1:25 / 1,79 MB / SFMF 2026',
    'grand-theatre':'Ginebra, Suiza / ópera / vídeo escénico / SMODE + proyección',
    comedie:'Ginebra, Suiza / teatro / sistemas de vídeo + gira',
    hardwinner:'Grenoble, Francia / live AV / La Belle Électrique / TouchDesigner + Resolume',
    'stage-systems':'Chambéry, Francia / sistemas escénicos / Fun Radio / luz + vídeo'
  }
};

function langFor(file){if(file.startsWith('fr/'))return 'fr';if(file.startsWith('es/'))return 'es';return 'en'}

for(const rel of archives){
  const file=path.join(ROOT,rel);
  if(!fs.existsSync(file))continue;
  const lang=langFor(rel);
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  $('.archive-year-head > span').remove();
  $('.archive-entry').each((_,el)=>{
    const entry=$(el);
    const slug=entry.attr('data-archive-project')||(entry.attr('href')||'').match(/projects\/([^/.]+)\.html$/)?.[1];
    if(!slug)return;
    const context=contexts[lang]?.[slug];
    if(context)entry.find('.archive-status').first().text(context);
    const line=copy[lang]?.[slug];
    if(line)entry.find('small').first().text(line);
    if(slug==='last-low-bandwidth-message'){
      entry.removeAttr('data-archive-video');
      entry.attr('data-archive-tags','vancouver canada festival small-file low-bandwidth');
      let media=entry.find('.archive-entry-media').first();
      if(!media.length){
        entry.prepend('<span class="archive-entry-media" aria-hidden="true"><img src="assets/media/low-bandwidth-message/archive-still.webp" alt="" loading="lazy" decoding="async"></span>');
        media=entry.find('.archive-entry-media').first();
      }
      media.find('video').remove();
      let image=media.find('img').first();
      if(!image.length){media.prepend('<img src="assets/media/low-bandwidth-message/archive-still.webp" alt="" loading="lazy" decoding="async">');image=media.find('img').first()}
      image.attr('src','assets/media/low-bandwidth-message/archive-still.webp');
    }
  });
  const count=$('.archive-entry').length;
  $('[data-archive-count]').text(`${count} ${lang==='fr'?'projets':lang==='es'?'proyectos':'projects'}`);
  fs.writeFileSync(file,$.html(),'utf8');
}
console.log('Archive locations and media normalized.');
