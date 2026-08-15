import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const legacy = /(^|\/)(work|about|services|lab)\.html$/;
const V2_STYLE = 'assets/css/v2-interface-20260815.css';
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT,'data/project-taxonomy.json'),'utf8'));

const projectMeta = {
  lumina:{status:'realized',type:'installation',years:'2025 2026 2027',poster:'assets/media/lumina/tunnel-blue.webp',video:'assets/media/lumina/experience-long.mp4?v=20260809-2'},
  'grand-theatre':{status:'realized',type:'stage',years:'2023 2024',poster:'assets/media/grand-theatre/hero.webp',video:'assets/media/grand-theatre/loop.mp4'},
  comedie:{status:'realized',type:'stage',years:'2021 2022 2023',poster:'assets/media/comedie/venue.jpg'},
  hardwinner:{status:'realized',type:'live-av stage',years:'2016 2017 2018',poster:'assets/media/hardwinner/lbe-2018.webp',video:'assets/media/hardwinner/amen-loop.mp4'},
  'stage-systems':{status:'realized',type:'live-av stage',years:'2016',poster:'assets/media/stage/funradio-wide.webp',video:'assets/media/stage/funradio-loop.mp4'},
  snake:{status:'research',type:'software interactive',years:'2026',poster:'assets/media/snake/gameplay.webp',video:'assets/media/snake/loop.mp4'},
  signal:{status:'simulation',type:'simulation interactive',years:'2026'},
  ascii:{status:'study',type:'study',years:'2026',poster:'assets/media/ascii/portrait.webp',video:'assets/media/ascii/loop.mp4'},
  realtime:{status:'research',type:'study',years:'2025 2026',poster:'assets/media/realtime/audio-material.webp',video:'assets/media/realtime/audio-loop.mp4'},
  cloud:{status:'study',type:'study',years:'2018',poster:'assets/media/cloud/pastel.webp',video:'assets/media/cloud/loop.mp4'}
};

const locale = {
  en:{archive:'Archive',contact:'Contact',projects:'projects',all:'All',type:'Type',year:'Year',tag:'Tag',allTypes:'All types',allYears:'All years',allTags:'All tags',installation:'Installation',stage:'Stage',live:'Live AV',software:'Software',simulation:'Simulation',study:'Study',realized:'Realized',research:'R&D',empty:'No project matches these filters.'},
  fr:{archive:'Archives',contact:'Contact',projects:'projets',all:'Tous',type:'Type',year:'Année',tag:'Tag',allTypes:'Tous les types',allYears:'Toutes les années',allTags:'Tous les tags',installation:'Installation',stage:'Scène',live:'Live AV',software:'Logiciel',simulation:'Simulation',study:'Étude',realized:'Réalisé',research:'R&D',empty:'Aucun projet ne correspond à ces filtres.'},
  es:{archive:'Archivo',contact:'Contacto',projects:'proyectos',all:'Todos',type:'Tipo',year:'Año',tag:'Tag',allTypes:'Todos los tipos',allYears:'Todos los años',allTags:'Todos los tags',installation:'Instalación',stage:'Escena',live:'Live AV',software:'Software',simulation:'Simulación',study:'Estudio',realized:'Realizado',research:'I+D',empty:'Ningún proyecto coincide con estos filtros.'}
};

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);if(entry.isDirectory())return entry.name==='node_modules'?[]:walk(full);return entry.isFile()&&entry.name.endsWith('.html')?[full]:[]})}
function langFor(rel){if(rel.startsWith('fr/'))return 'fr';if(rel.startsWith('es/'))return 'es';return 'en'}
function prefixFor(rel){if(rel.startsWith('fr/'))return 'fr/';if(rel.startsWith('es/'))return 'es/';if(rel.startsWith('en/'))return 'en/';return ''}
function routeFor(rel){return rel.replace(/^(en|fr|es)\//,'')}
function esc(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

function ensureV2Styles($){const link=$('link[data-v2-interface]').first();if(link.length)link.attr('href',V2_STYLE);else $('head').append(`<link rel="stylesheet" href="${V2_STYLE}" data-v2-interface>`)}

function languageSwitcher(lang){
  return `<div class="lang-switcher" role="group" aria-label="Language / Langue / Idioma" data-static-language-switcher>${[['en','EN'],['fr','FR'],['es','ES']].map(([target,label])=>`<button type="button" data-lang="${target}" aria-pressed="${target===lang?'true':'false'}">${label}</button>`).join('')}</div>`;
}

function rebuildHeader($,rel){
  const actions=$('.header-actions').first();if(!actions.length)return;
  const lang=langFor(rel),t=locale[lang],prefix=prefixFor(rel),route=routeFor(rel);
  actions.find('.nav-text').remove();
  actions.find('.lang-switcher').remove();
  const current=route==='archive.html'?'archive':route==='cv.html'?'cv':route==='contact.html'?'contact':'';
  const links=[['archive',`${prefix}archive.html`,t.archive],['cv',`${prefix}cv.html`,'CV'],['contact',`${prefix}contact.html`,t.contact]].map(([key,href,label])=>{const active=current===key;return `<a class="nav-text nav-primary nav-primary--${key}${active?' is-active':''}" href="${href}" data-v2-primary="${key}"${active?' aria-current="page"':''}>${label}</a>`}).join('');
  const menu=actions.find('[data-menu-toggle]').first();
  const stableHeader=`${links}${languageSwitcher(lang)}`;
  if(menu.length)menu.before(stableHeader);else actions.append(stableHeader);
}

function tagOptions(lang){
  const used=new Set(Object.values(taxonomy.projects||{}).flat());
  return Object.entries(taxonomy.categories||{}).map(([category,categoryLabels])=>{
    const tags=Object.entries(taxonomy.tags||{}).filter(([slug,meta])=>meta.category===category&&used.has(slug)).sort((a,b)=>(a[1][lang]||a[1].en).localeCompare(b[1][lang]||b[1].en,lang));
    if(!tags.length)return '';
    return `<optgroup label="${esc(categoryLabels[lang]||categoryLabels.en)}">${tags.map(([slug,meta])=>`<option value="${esc(slug)}">${esc(meta[lang]||meta.en||slug)}</option>`).join('')}</optgroup>`;
  }).join('');
}

function archiveControls(lang){
  const t=locale[lang],years=['2027','2026','2025','2024','2023','2022','2021','2018','2017','2016'];
  return `<section class="archive-controls" aria-label="Archive filters">
    <div>
      <div class="archive-control-row archive-control-row--status" role="group" aria-label="Status">
        <button class="archive-filter-button" type="button" data-archive-status-filter="all" aria-pressed="true">${t.all}</button>
        <button class="archive-filter-button" type="button" data-archive-status-filter="realized" aria-pressed="false">${t.realized}</button>
        <button class="archive-filter-button" type="button" data-archive-status-filter="research" aria-pressed="false">${t.research}</button>
        <button class="archive-filter-button" type="button" data-archive-status-filter="simulation" aria-pressed="false">${t.simulation}</button>
        <button class="archive-filter-button" type="button" data-archive-status-filter="study" aria-pressed="false">${t.study}</button>
      </div>
      <div class="archive-control-row archive-control-row--selects">
        <label class="archive-filter-label"><span>${t.type}</span><select class="archive-filter-select" data-archive-type-filter><option value="all">${t.allTypes}</option><option value="installation">${t.installation}</option><option value="stage">${t.stage}</option><option value="live-av">${t.live}</option><option value="software">${t.software}</option><option value="simulation">${t.simulation}</option><option value="study">${t.study}</option></select></label>
        <label class="archive-filter-label"><span>${t.year}</span><select class="archive-filter-select" data-archive-year-filter><option value="all">${t.allYears}</option>${years.map(y=>`<option value="${y}">${y}</option>`).join('')}</select></label>
        <label class="archive-filter-label"><span>${t.tag}</span><select class="archive-filter-select" data-archive-tag-filter><option value="all">${t.allTags}</option>${tagOptions(lang)}</select></label>
      </div>
    </div>
    <span class="archive-count" data-archive-count aria-live="polite">10 ${t.projects}</span>
  </section>`;
}

function enhanceArchive($,rel){
  const lang=langFor(rel),t=locale[lang],shell=$('.archive-shell').first();if(!shell.length)return;
  shell.attr('data-archive-interactive','');
  $('.archive-intro .archive-legend').remove();
  $('.archive-controls').remove();
  $('.archive-intro').first().after(archiveControls(lang));
  $('[data-archive-empty]').remove();shell.after(`<p class="archive-empty" data-archive-empty>${t.empty}</p>`);

  shell.find('.archive-entry').each((_,el)=>{
    const entry=$(el),href=entry.attr('href')||'',match=href.match(/projects\/([^/.]+)\.html$/);if(!match)return;
    const slug=match[1],meta=projectMeta[slug];if(!meta)return;
    const tags=taxonomy.projects?.[slug]||[];
    entry.attr('data-archive-project',slug).attr('data-archive-status',meta.status).attr('data-archive-type',meta.type).attr('data-archive-years',meta.years).attr('data-archive-tags',tags.join(' '));
    if(meta.video)entry.attr('data-archive-video',meta.video);else entry.removeAttr('data-archive-video');
    entry.find('.archive-entry-media').remove();
    if(meta.poster)entry.prepend(`<span class="archive-entry-media" aria-hidden="true"><img src="${meta.poster}" alt="" loading="lazy" decoding="async">${meta.video?'<video muted loop playsinline preload="none"></video>':''}</span>`);
  });
  $('script[data-archive-interactions]').remove();$('body').append('<script src="assets/js/archive-interactions.js?v=20260815-3" defer data-archive-interactions></script>');
}

for(const file of walk(ROOT)){
  const rel=path.relative(ROOT,file).replaceAll('\\','/');
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  ensureV2Styles($);rebuildHeader($,rel);
  if(!legacy.test(rel))$('meta[http-equiv="refresh"]').remove();
  if(/(^|\/)index\.html$/.test(rel))$('.hero-foot span').first().text(rel.startsWith('fr/')?'Pratique sélectionnée / 2016—2027':rel.startsWith('es/')?'Práctica seleccionada / 2016—2027':'Selected practice / 2016—2027');
  if(/(^|\/)archive\.html$/.test(rel))enhanceArchive($,rel);
  if(/(^|\/)cv\.html$/.test(rel))$('.cv-section .cv-head > p').each((i,el)=>{const current=$(el).text().replace(/^\s*\d+\s*\/\s*/,'').trim();$(el).text(`${String(i+1).padStart(2,'0')} / ${current}`)});
  if(legacy.test(rel)){$('title').text('DATA C0RE');$('meta[name="description"]').attr('content','DATA C0RE');$('meta[property="og:title"]').attr('content','DATA C0RE');$('meta[property="og:description"]').attr('content','DATA C0RE');$('meta[name="twitter:title"]').attr('content','DATA C0RE');$('meta[name="twitter:description"]').attr('content','DATA C0RE')}
  fs.writeFileSync(file,$.html(),'utf8');
}
console.log('Portfolio V2 final cleanup applied: stable static header language switcher, primary navigation, single archive filter layer and reusable project taxonomy.');
