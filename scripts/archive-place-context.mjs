import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const targets=[
  ['en','en/archive.html'],
  ['fr','fr/archive.html'],
  ['es','es/archive.html'],
  ['en','archive.html']
];

const contexts={
  en:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPERA',comedie:'THEATRE',hardwinner:'LIVE AV','stage-systems':'STAGE SYSTEMS',snake:'SOFTWARE',signal:'SIMULATION',ascii:'STUDY',realtime:'RESEARCH',cloud:'STUDY'},
  fr:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPÉRA',comedie:'THÉÂTRE',hardwinner:'LIVE AV','stage-systems':'SYSTÈMES SCÈNE',snake:'LOGICIEL',signal:'SIMULATION',ascii:'ÉTUDE',realtime:'RECHERCHE',cloud:'ÉTUDE'},
  es:{lumina:'INSTALACIÓN','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'ÓPERA',comedie:'TEATRO',hardwinner:'LIVE AV','stage-systems':'SISTEMAS ESCÉNICOS',snake:'SOFTWARE',signal:'SIMULACIÓN',ascii:'ESTUDIO',realtime:'INVESTIGACIÓN',cloud:'ESTUDIO'}
};

const summaries={
  en:{
    lumina:'Geneva, Switzerland / public installation / realtime systems + integration',
    'last-low-bandwidth-message':'Vancouver, Canada / small-file film / 1:25 / 1.79 MB / SFMF 2026',
    'grand-theatre':'Geneva, Switzerland / opera / stage video / projection / SMODE',
    comedie:'Geneva, Switzerland / theatre / stage video / touring / calibration',
    hardwinner:'Grenoble, France / La Belle Électrique / live AV / lighting',
    'stage-systems':'Chambéry, France / Fun Radio Party / stage systems / LED / DMX'
  },
  fr:{
    lumina:'Genève, Suisse / installation publique / systèmes temps réel + intégration',
    'last-low-bandwidth-message':'Vancouver, Canada / film small-file / 1:25 / 1,79 MB / SFMF 2026',
    'grand-theatre':'Genève, Suisse / opéra / vidéo scène / projection / SMODE',
    comedie:'Genève, Suisse / théâtre / vidéo scène / tournée / calibration',
    hardwinner:'Grenoble, France / La Belle Électrique / live AV / lumière',
    'stage-systems':'Chambéry, France / Fun Radio Party / systèmes scène / LED / DMX'
  },
  es:{
    lumina:'Ginebra, Suiza / instalación pública / sistemas en tiempo real + integración',
    'last-low-bandwidth-message':'Vancouver, Canadá / película small-file / 1:25 / 1,79 MB / SFMF 2026',
    'grand-theatre':'Ginebra, Suiza / ópera / vídeo escénico / proyección / SMODE',
    comedie:'Ginebra, Suiza / teatro / vídeo escénico / gira / calibración',
    hardwinner:'Grenoble, Francia / La Belle Électrique / live AV / iluminación',
    'stage-systems':'Chambéry, Francia / Fun Radio Party / sistemas escénicos / LED / DMX'
  }
};

for(const [lang,rel] of targets){
  const file=path.join(ROOT,rel);
  if(!fs.existsSync(file))continue;
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});

  // The year already provides chronology. Repeating the project context beside it
  // wastes space and becomes especially noisy on phones.
  $('.archive-year-head > span').remove();

  $('.archive-entry[data-archive-project]').each((_,el)=>{
    const entry=$(el);
    const slug=entry.attr('data-archive-project');
    if(!slug)return;
    const context=contexts[lang]?.[slug];
    if(context)entry.find('.archive-status').first().text(context);
    const summary=summaries[lang]?.[slug];
    if(summary)entry.find('small').first().text(summary);
  });

  fs.writeFileSync(file,$.html(),'utf8');
}

console.log('Archive context shown once; known physical places normalized as city, country.');
