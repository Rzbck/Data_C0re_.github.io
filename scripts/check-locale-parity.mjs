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

console.log('Locale parity OK: EN / FR / ES share the same primary header, language controls and no motion toggle.');
