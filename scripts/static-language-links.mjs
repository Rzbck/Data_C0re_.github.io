import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const supported=['en','fr','es'];
const critical=`
/* Critical first-paint header geometry: no scrollbar or language-control layout shift. */
html{overflow-y:scroll;scrollbar-gutter:stable}
.site-header .motion-toggle{display:none!important}
.site-header .lang-switcher{display:flex;align-items:center;gap:0;flex:0 0 auto;margin-left:2px}
.site-header .lang-switcher>a{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:28px;height:34px;padding:9px 5px;border:0;background:transparent;color:var(--grey,#999791);text-decoration:none;font-family:inherit;font-size:9px;font-weight:800;line-height:1;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.site-header .lang-switcher>a:hover,.site-header .lang-switcher>a:focus-visible{color:var(--acid,#dfff00)}
.site-header .lang-switcher>a[aria-current="page"]{color:var(--paper,#f3f1eb)}
@media(max-width:900px){.site-header .lang-switcher>a{min-width:23px;height:32px;padding:8px 4px;font-size:8px;letter-spacing:.04em}}
@media(max-width:620px){.site-header .lang-switcher>a{min-width:20px;height:30px;padding:7px 3px;font-size:7.5px}}
@media(max-width:380px){.site-header .lang-switcher>a{min-width:18px;padding-left:2px;padding-right:2px;font-size:7px}}
`;

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(entry.name==='node_modules'||entry.name==='.git')return [];
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    return entry.isFile()&&entry.name.endsWith('.html')?[full]:[];
  });
}
function relPath(file){return path.relative(ROOT,file).replaceAll('\\','/')}
function stateFor(rel){
  const parts=rel.split('/');
  const lang=supported.includes(parts[0])?parts.shift():'en';
  const route=parts.join('/')||'index.html';
  return {lang,route};
}
function hrefFor(target,route){return route==='index.html'?`${target}/`:`${target}/${route}`}

for(const file of walk(ROOT)){
  const rel=relPath(file);
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  const actions=$('.header-actions').first();
  if(!actions.length)continue;

  /* Keep the public header identical on every route. The old homepage-only
     motion control is intentionally removed and must never be regenerated. */
  actions.find('.motion-toggle').remove();

  const {lang,route}=stateFor(rel);
  const switcher=actions.find('.lang-switcher').first();
  if(!switcher.length)continue;

  const links=supported.map(target=>{
    const label=target.toUpperCase();
    const active=target===lang;
    return `<a href="${hrefFor(target,route)}" data-lang="${target}"${active?' aria-current="page"':''}>${label}</a>`;
  }).join('');
  switcher.attr('role','group').attr('aria-label','Language / Langue / Idioma').attr('data-static-language-switcher','').html(links);

  $('style[data-language-switcher-critical]').remove();
  $('head').append(`<style data-language-switcher-critical>${critical}</style>`);
  fs.writeFileSync(file,$.html(),'utf8');
}
console.log('Stable four-link header, no public motion toggle, static language anchors and scrollbar gutter applied before first paint.');
