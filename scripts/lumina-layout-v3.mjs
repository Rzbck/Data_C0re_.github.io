import fs from 'node:fs';
import * as cheerio from 'cheerio';

const pages=['projects/lumina.html','en/projects/lumina.html','fr/projects/lumina.html','es/projects/lumina.html'];
const copy={
  en:{workshop:'Fabrication / integration',live:'From profile to live system.',tech:'Technical design',plans:'4 fabrication drawings',open:'Open technical drawing',close:'Close'},
  fr:{workshop:'Fabrication / intégration',live:'Du profil au système live.',tech:'Conception technique',plans:'4 plans de fabrication',open:'Ouvrir le plan technique',close:'Fermer'},
  es:{workshop:'Fabricación / integración',live:'Del perfil al sistema en vivo.',tech:'Diseño técnico',plans:'4 planos de fabricación',open:'Abrir plano técnico',close:'Cerrar'}
};

const localeFor=file=>file.startsWith('fr/')?'fr':file.startsWith('es/')?'es':'en';
const norm=s=>(s||'').replace(/\s+/g,' ').trim();

const critical=`body.lumina-v3 .lumina-panel-intro{display:grid;grid-template-columns:minmax(150px,.62fr) minmax(0,2fr);gap:clamp(24px,4vw,90px);align-items:start}body.lumina-v3 .lumina-panel-intro .section-kicker,body.lumina-v3 .lumina-panel-intro .prose,body.lumina-v3 .lumina-panel-intro .prose-large{margin:0}body.lumina-v3 .lumina-experience-media{width:100%;min-width:0}body.lumina-v3 .lumina-contribution-panel .lumina-production-grid{width:100%;min-width:0}@media(max-width:820px),(pointer:coarse){body.lumina-v3 .lumina-panel-intro{grid-template-columns:1fr;gap:16px}}`;

for(const file of pages){
  if(!fs.existsSync(file))continue;
  const lang=localeFor(file),t=copy[lang];
  const html=fs.readFileSync(file,'utf8');
  const $=cheerio.load(html,{decodeEntities:false});
  const $body=$('body');
  $body.addClass('lumina-v3').attr('data-lumina-v3','1');

  if(!$('link[data-lumina-v3-css]').length){
    $('head').append('<link rel="stylesheet" href="assets/css/lumina-v3.css?v=20260819-2" data-lumina-v3-css>');
  }
  $('style[data-lumina-v3-critical]').remove();
  $('head').append(`<style data-lumina-v3-critical>${critical}</style>`);

  const sections=$('article > section.project-section').toArray();
  const findKicker=n=>norm($(n).find('.section-kicker span').first().text());
  const experienceNode=sections.find(n=>findKicker(n)==='01');
  const contributionNode=sections.find(n=>findKicker(n)==='02');
  const mediaNode=sections.find(n=>$(n).is('[data-lumina-experience-section]'));
  const fabricationNode=sections.find(n=>$(n).find('[data-fabrication-grid]').length);
  const technicalNode=sections.find(n=>$(n).is('[data-tabs]')||$(n).find('.tech-tabs [data-tab-src]').length);

  if(experienceNode&&mediaNode&&experienceNode!==mediaNode){
    const $experience=$(experienceNode);
    const kicker=$experience.find('.section-kicker').first().prop('outerHTML')||'';
    const prose=$experience.find('.prose-large,.prose').first().prop('outerHTML')||'';
    const motion=$(mediaNode).find('.experience-motion-grid').first().prop('outerHTML')||'';
    const flow=$(mediaNode).find('.system-flow').first().prop('outerHTML')||'';
    $experience.removeClass('project-section--split').addClass('lumina-experience-panel').attr('data-lumina-experience-section','');
    $experience.html(`<div class="lumina-panel-intro">${kicker}${prose}</div><div class="lumina-experience-media">${motion}${flow}</div>`);
    $(mediaNode).remove();
  }

  if(contributionNode&&fabricationNode&&technicalNode){
    const $contribution=$(contributionNode);
    const kicker=$contribution.find('.section-kicker').first().prop('outerHTML')||'';
    const prose=$contribution.find('.prose,.prose-large').first().prop('outerHTML')||'';
    const fabrication=$(fabricationNode).find('[data-fabrication-grid]').first().prop('outerHTML')||'';
    const buttons=$(technicalNode).find('.tech-tabs [data-tab-src]').toArray();
    const planCards=buttons.slice(0,4).map((button,index)=>{
      const $button=$(button);
      const src=$button.attr('data-tab-src')||'';
      const fallback=$button.attr('data-tab-fallback')||'';
      const label=norm($button.text())||norm($button.attr('data-tab-caption'))||`Plan ${index+1}`;
      return `<button class="lumina-plan-card${index===0?' active':''}" type="button" data-lumina-plan-card data-plan-src="${src}"${fallback?` data-plan-fallback="${fallback}"`:''} data-plan-label="${label}" aria-label="${t.open}: ${label}"><img src="${src}" alt="${label}" loading="${index<2?'eager':'lazy'}" decoding="async"><span class="lumina-plan-meta"><span>${label}</span><b>0${index+1}</b></span></button>`;
    }).join('');

    $contribution.removeClass('project-section--split').addClass('lumina-contribution-panel');
    $contribution.html(`<div class="lumina-panel-intro">${kicker}${prose}</div><div class="lumina-production-grid"><div class="lumina-workshop"><div class="lumina-workshop-head"><p>${t.workshop}</p><strong>${t.live}</strong></div>${fabrication}</div><div class="lumina-tech"><div class="lumina-tech-head"><p>${t.tech}</p><strong>${t.plans}</strong></div><div class="lumina-plan-grid">${planCards}</div></div></div>`);
    $(fabricationNode).remove();
    $(technicalNode).remove();
  }

  $('[data-lumina-plan-modal]').remove();
  const modal=`<div class="lumina-plan-modal" data-lumina-plan-modal aria-hidden="true"><div class="lumina-plan-modal-inner" role="dialog" aria-modal="true" aria-label="${t.tech}"><img data-lumina-plan-modal-image alt=""><div class="lumina-plan-modal-bar"><span data-lumina-plan-modal-label>${t.tech}</span><button class="lumina-plan-modal-close" type="button" data-lumina-plan-modal-close>${t.close} ×</button></div></div></div>`;
  $('body').append(modal);

  $('script[data-lumina-v3-js]').remove();
  $('body').append('<script src="assets/js/lumina-v3.js?v=20260819-2" defer data-lumina-v3-js></script>');

  fs.writeFileSync(file,$.html());
  console.log(`LUMINA v3: ${file}`);
}
