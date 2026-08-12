import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const config=JSON.parse(fs.readFileSync(path.join(ROOT,'site.config.json'),'utf8'));
const origin=String(config.origin||'').replace(/\/$/,'');
const languages=config.languages||['en','fr','es'];
const rootPages=fs.readdirSync(ROOT).filter(name=>name.endsWith('.html')&&name!=='404.html').sort();
const projectPages=fs.readdirSync(path.join(ROOT,'projects')).filter(name=>name.endsWith('.html')).sort().map(name=>`projects/${name}`);
const pages=[...rootPages,...projectPages];

const smallCopy={
  fr:{
    'solo project / game logic / music sync / networked score':'projet solo / logique de jeu / synchro musicale / score en réseau',
    'solo study / image reduction / computational portrait':'étude solo / réduction d’image / portrait computationnel',
    'collaborative installation / light / architecture / realtime control':'installation collaborative / lumière / architecture / contrôle temps réel',
    'solo research / sound / motion / temporal image systems':'recherche solo / son / mouvement / systèmes d’image temporelle',
    'collaborative systems / stage / LED / GLSL / show control':'systèmes collaboratifs / scène / LED / GLSL / show control',
    'selected project preview':'aperçu du projet sélectionné',
    'skip to work':'aller aux travaux'
  },
  es:{
    'solo project / game logic / music sync / networked score':'proyecto solo / lógica de juego / sincronización musical / puntuación en red',
    'solo study / image reduction / computational portrait':'estudio solo / reducción de imagen / retrato computacional',
    'collaborative installation / light / architecture / realtime control':'instalación colaborativa / luz / arquitectura / control en tiempo real',
    'solo research / sound / motion / temporal image systems':'investigación solo / sonido / movimiento / sistemas de imagen temporal',
    'collaborative systems / stage / LED / GLSL / show control':'sistemas colaborativos / escena / LED / GLSL / show control',
    'selected project preview':'vista previa del proyecto seleccionado',
    'skip to work':'ir a trabajos'
  }
};

const norm=value=>String(value||'').replace(/\s+/g,' ').trim();
const localizedUrl=(source,lang)=>`${origin}/${lang}/${source==='index.html'?'':source}`;

for(const lang of languages){
  for(const source of pages){
    const file=path.join(ROOT,lang,source);
    if(!fs.existsSync(file))continue;
    const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});

    if(lang!=='en'){
      const replacements=smallCopy[lang]||{};
      $('body').find('*').addBack().contents().each((_,node)=>{
        if(node.type!=='text'||!node.parent)return;
        const parent=String(node.parent.name||'').toLowerCase();
        if(['script','style','noscript','svg','code','pre'].includes(parent))return;
        const key=norm(node.data).toLowerCase();
        if(!replacements[key])return;
        const lead=node.data.match(/^\s*/)?.[0]||'';
        const trail=node.data.match(/\s*$/)?.[0]||'';
        node.data=lead+replacements[key]+trail;
      });
      $('[alt],[aria-label],[title]').each((_,el)=>{
        for(const attr of ['alt','aria-label','title']){
          const raw=$(el).attr(attr);if(!raw)continue;
          const next=replacements[norm(raw).toLowerCase()];
          if(next)$(el).attr(attr,next);
        }
      });
    }

    if(source!=='index.html'){
      const oldUrl=`${origin}/${source}`;
      const newUrl=localizedUrl(source,lang);
      $('script[type="application/ld+json"]').each((_,el)=>{
        let raw=$(el).html()||'';
        raw=raw.split(oldUrl).join(newUrl);
        try{
          const data=JSON.parse(raw);
          const visit=value=>{
            if(Array.isArray(value)){value.forEach(visit);return;}
            if(!value||typeof value!=='object')return;
            const type=value['@type'];
            if(type==='ProfilePage'||type==='CreativeWork'||type==='WebPage'||type==='Article')value.inLanguage=lang;
            Object.values(value).forEach(visit);
          };
          visit(data);
          raw=JSON.stringify(data);
        }catch{}
        $(el).text(raw);
      });
    }

    fs.writeFileSync(file,$.html(),'utf8');
  }
}
console.log('Post-processed localized copy and structured data.');
