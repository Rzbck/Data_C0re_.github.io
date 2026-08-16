import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const langs=['en','fr','es'];
const routes=['index.html','archive.html','cv.html','contact.html'];
const expectedPrimary=['home','archive','cv','contact'];
const expectedLangs=['en','fr','es'];

function read(lang,route){
  const file=path.join(ROOT,lang,route);
  if(!fs.existsSync(file))throw new Error(`Missing localized page: ${lang}/${route}`);
  return load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
}
function same(label,values){
  const first=JSON.stringify(values[0]);
  if(values.some(v=>JSON.stringify(v)!==first))throw new Error(`${label} differs across EN/FR/ES: ${JSON.stringify(values)}`);
}
function projectFiles(lang){
  const dir=path.join(ROOT,lang,'projects');
  if(!fs.existsSync(dir))throw new Error(`Missing localized project directory: ${lang}/projects`);
  return fs.readdirSync(dir).filter(name=>name.endsWith('.html')).sort();
}
function structuralSignature($){
  const root=$('main').first()[0];
  if(!root)return [];
  const signature=[];
  const walk=node=>{
    if(!node||node.type!=='tag')return;
    const classes=String(node.attribs?.class||'').split(/\s+/).filter(Boolean).filter(name=>name!=='reveal').sort();
    signature.push(`${node.name}${classes.length?'.'+classes.join('.'):''}`);
    for(const child of node.children||[])walk(child);
  };
  walk(root);
  return signature;
}

for(const route of routes){
  const states=langs.map(lang=>{
    const $=read(lang,route);
    const primary=$('.site-header [data-v2-primary]').map((_,el)=>$(el).attr('data-v2-primary')).get();
    const switcher=$('.site-header .lang-switcher [data-lang]').map((_,el)=>$(el).attr('data-lang')).get();
    const motion=$('.site-header .motion-toggle').length;
    const active=$('.site-header [data-v2-primary][aria-current="page"]').attr('data-v2-primary')||'';
    return {primary,switcher,motion,active};
  });

  same(`${route} primary navigation`,states.map(s=>s.primary));
  same(`${route} language switcher`,states.map(s=>s.switcher));
  same(`${route} motion-toggle count`,states.map(s=>s.motion));

  if(JSON.stringify(states[0].primary)!==JSON.stringify(expectedPrimary))throw new Error(`${route}: expected ${expectedPrimary.join(', ')}, got ${states[0].primary.join(', ')}`);
  if(JSON.stringify(states[0].switcher)!==JSON.stringify(expectedLangs))throw new Error(`${route}: language switcher must be EN/FR/ES in all locales.`);
  if(states[0].motion!==0)throw new Error(`${route}: public motion toggle must not exist in any locale.`);

  const expectedActive=route==='index.html'?'home':route.replace('.html','');
  for(const [i,state] of states.entries())if(state.active!==expectedActive)throw new Error(`${langs[i]}/${route}: active header link is ${state.active||'none'}, expected ${expectedActive}.`);
}

const canonicalProjects=projectFiles('en');
for(const lang of langs) same('localized project route list',[canonicalProjects,projectFiles(lang)]);

for(const project of canonicalProjects){
  const signatures=langs.map(lang=>structuralSignature(read(lang,`projects/${project}`)));
  same(`projects/${project} main DOM structure`,signatures);
}

const lowBandwidth='projects/last-low-bandwidth-message.html';
for(const lang of langs){
  const $=read(lang,lowBandwidth);
  const label=`${lang}/${lowBandwidth}`;
  if($('link[href="assets/css/project-low-bandwidth.css"]').length!==1)throw new Error(`${label}: missing shared low-bandwidth stylesheet.`);
  if($('.smallfile-media--hero').length!==1||$('.smallfile-media--hero img').length!==1||$('.smallfile-media--hero video').length!==0)throw new Error(`${label}: hero must use exactly one still image and no hero video.`);
  if($('.smallfile-narrative-aside').length!==1)throw new Error(`${label}: narrative media wrapper missing.`);
  if($('.smallfile-narrative-aside .smallfile-quote').length!==1)throw new Error(`${label}: narrative quote overlay missing.`);
  if($('.smallfile-narrative-aside .smallfile-preview video').length!==1)throw new Error(`${label}: narrative preview video missing.`);
  const previewSrc=$('.smallfile-narrative-aside .smallfile-preview source').attr('data-src')||'';
  if(previewSrc!=='assets/media/low-bandwidth-message/excerpt.mp4')throw new Error(`${label}: preview source must be the shared direct excerpt.mp4, got ${previewSrc||'none'}.`);
  if($('.smallfile-pipeline article').length!==6)throw new Error(`${label}: expected 6 process cards.`);
  if($('.smallfile-phases > div').length!==4)throw new Error(`${label}: expected 4 narrative phases.`);
  if($('.smallfile-tech-note').length!==1)throw new Error(`${label}: generated-source/contact-sheet block missing.`);
}

console.log(`Locale parity OK: EN / FR / ES share the same primary UI and ${canonicalProjects.length} structurally identical project pages, including the low-bandwidth media composition.`);
