(() => {
  'use strict';
  const supported=['en','fr','es'];
  const storage='data-c0re-lang-v1';
  const repoSegment=location.hostname.endsWith('github.io')&&location.pathname.startsWith('/Data_C0re_.github.io')?'/Data_C0re_.github.io':'';

  /* Load shared interaction guards on every route, including generated locales. */
  const ensureCss=(path,attr)=>{
    const href=new URL(path,document.baseURI).href;
    const existing=document.querySelector(`link[${attr}]`);
    if(existing){
      if(existing.href!==href)existing.href=href;
      return;
    }
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.setAttribute(attr,'true');
    document.head.appendChild(link);
  };
  const ensureScript=(path,attr)=>{
    if(document.querySelector(`script[${attr}]`))return;
    const script=document.createElement('script');
    script.src=new URL(path,document.baseURI).href;
    script.async=false;
    script.setAttribute(attr,'true');
    document.head.appendChild(script);
  };
  ensureCss('assets/css/home-work-immersive-fix.css?v=20260814-7','data-home-work-immersive-fix');
  ensureCss('assets/css/home-work-mobile-final.css?v=20260814-7','data-home-work-mobile-final');
  ensureCss('assets/css/home-gate-trail.css?v=20260816-3','data-home-gate-trail');
  ensureScript('assets/js/menu-card-trail.js?v=20260816-1','data-menu-card-trail');

  const routeState=()=>{
    let rel=location.pathname.slice(repoSegment.length).replace(/^\/+|\/+$/g,'');
    const parts=rel?rel.split('/'):[];
    const pathLang=supported.includes(parts[0])?parts.shift():null;
    let route=parts.join('/');
    if(!pathLang) route=rel;
    if(!route||route==='index.html')route='index.html';
    return {pathLang,route};
  };

  const destination=(lang,route)=>{
    const tail=route==='index.html'?'':route;
    const path=[repoSegment,lang,tail].filter(Boolean).join('/').replace(/\/+/g,'/');
    const normalized=path.startsWith('/')?path:`/${path}`;
    return `${location.origin}${normalized}${tail?'':'/'}${location.search||''}${location.hash||''}`;
  };

  const setupLuminaFabrication=()=>{
    const fabricationGrid=document.querySelector('[data-fabrication-grid]');
    const technicalSection=document.querySelector('section[data-tabs]');
    if(!fabricationGrid||!technicalSection)return;
    const fabricationSection=fabricationGrid.closest('.project-section');
    const tabs=technicalSection.querySelector('.tech-tabs');
    const viewer=technicalSection.querySelector('.tech-viewer');
    const mainImage=viewer?.querySelector('img');
    if(!fabricationSection||!tabs||!viewer||!mainImage)return;

    document.body.classList.add('lumina-build-compact');
    const lang=(document.documentElement.lang||'en').slice(0,2);
    const copy={
      en:{label:'Technical design',count:'4 fabrication drawings',drawing:'Technical drawing'},
      fr:{label:'Conception technique',count:'4 plans de fabrication',drawing:'Dessin technique'},
      es:{label:'Diseño técnico',count:'4 planos de fabricación',drawing:'Plano técnico'}
    }[lang]||{label:'Technical design',count:'4 fabrication drawings',drawing:'Technical drawing'};

    if(!document.querySelector('style[data-lumina-build-compact]')){
      const style=document.createElement('style');
      style.dataset.luminaBuildCompact='true';
      style.textContent=`
        .lumina-build-compact .fabrication-grid{margin-top:clamp(20px,2.4vw,34px)}
        .lumina-build-compact .lumina-tech-band{display:grid;grid-template-columns:minmax(270px,.42fr) minmax(0,1.58fr);gap:clamp(18px,2.2vw,34px);align-items:stretch;margin-top:clamp(34px,4vw,60px);padding-top:18px;border-top:1px solid var(--line)}
        .lumina-build-compact .lumina-tech-side{display:flex;flex-direction:column;min-width:0}
        .lumina-build-compact .lumina-tech-band-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:0 0 12px}
        .lumina-build-compact .lumina-tech-band-head .eyebrow{margin:0}
        .lumina-build-compact .lumina-tech-count{color:var(--grey);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-align:right}
        .lumina-build-compact .lumina-tech-band .tech-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;overflow:visible;border:0;margin:0}
        .lumina-build-compact .lumina-tech-band .tech-tabs button{display:grid;grid-template-rows:minmax(92px,1fr) auto;min-width:0;min-height:142px;padding:0;border:1px solid var(--line);background:#030303;color:var(--grey);overflow:hidden;text-align:left;white-space:normal;cursor:pointer;transition:border-color .16s ease,color .16s ease}
        .lumina-build-compact .lumina-tech-band .tech-tabs button:hover,.lumina-build-compact .lumina-tech-band .tech-tabs button:focus-visible,.lumina-build-compact .lumina-tech-band .tech-tabs button.active{border-color:var(--paper);color:var(--paper)}
        .lumina-build-compact .lumina-tech-thumb-media{display:block;min-height:0;overflow:hidden;background:#020202}
        .lumina-build-compact .lumina-tech-thumb-media img{display:block;width:100%;height:100%;min-height:92px;object-fit:contain;background:#020202;opacity:.58;transform:scale(.97);transition:opacity .16s ease,transform .16s ease}
        .lumina-build-compact .lumina-tech-band .tech-tabs button:hover img,.lumina-build-compact .lumina-tech-band .tech-tabs button:focus-visible img,.lumina-build-compact .lumina-tech-band .tech-tabs button.active img{opacity:1;transform:scale(1)}
        .lumina-build-compact .lumina-tech-thumb-label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-top:1px solid var(--line);font-size:8.5px;font-weight:800;letter-spacing:.065em;text-transform:uppercase;line-height:1.15}
        .lumina-build-compact .lumina-tech-thumb-index{color:var(--acid);font-variant-numeric:tabular-nums}
        .lumina-build-compact .lumina-tech-band .tech-viewer{display:grid;grid-template-rows:minmax(0,1fr) auto;min-width:0;margin:0!important;padding:0!important;border:1px solid var(--line);background:#030303!important;overflow:hidden}
        .lumina-build-compact .lumina-tech-band .tech-viewer img{display:block;width:100%;height:clamp(360px,43vw,610px);max-height:62vh;margin:0!important;padding:0!important;object-fit:contain;background:#030303!important;filter:none!important;mix-blend-mode:normal!important;image-rendering:auto!important}
        .lumina-build-compact .lumina-tech-band .tech-viewer figcaption{padding:9px 11px;border-top:1px solid var(--line);background:#070707;color:var(--grey);font-size:8.5px;letter-spacing:.075em;text-transform:uppercase}
        @media(max-width:900px){
          .lumina-build-compact .lumina-tech-band{grid-template-columns:minmax(220px,.5fr) minmax(0,1.5fr);gap:14px}
          .lumina-build-compact .lumina-tech-band .tech-tabs button{min-height:120px;grid-template-rows:minmax(72px,1fr) auto}
          .lumina-build-compact .lumina-tech-thumb-media img{min-height:72px}
        }
        @media(max-width:800px){
          .lumina-build-compact .fabrication-grid{display:flex!important;grid-template-columns:none!important;gap:10px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain;padding-bottom:6px;scrollbar-width:none}
          .lumina-build-compact .fabrication-grid::-webkit-scrollbar{display:none}
          .lumina-build-compact .fabrication-grid figure{flex:0 0 min(84vw,560px);scroll-snap-align:start}
          .lumina-build-compact .fabrication-grid video{aspect-ratio:16/10!important}
          .lumina-build-compact .lumina-tech-band{grid-template-columns:1fr;gap:12px;margin-top:34px;padding-top:14px}
          .lumina-build-compact .lumina-tech-band-head{margin-bottom:10px}
          .lumina-build-compact .lumina-tech-band .tech-tabs{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
          .lumina-build-compact .lumina-tech-band .tech-tabs button{min-height:112px;grid-template-rows:minmax(66px,1fr) auto}
          .lumina-build-compact .lumina-tech-thumb-media img{min-height:66px}
          .lumina-build-compact .lumina-tech-band .tech-viewer img{height:min(66vw,430px);max-height:none}
        }
        @media(max-width:460px){
          .lumina-build-compact .lumina-tech-count{max-width:120px;font-size:8px}
          .lumina-build-compact .lumina-tech-thumb-label{padding:8px;font-size:7.5px}
          .lumina-build-compact .lumina-tech-band .tech-viewer img{height:70vw}
        }
      `;
      document.head.appendChild(style);
    }

    const band=document.createElement('div');
    band.className='lumina-tech-band reveal';
    const side=document.createElement('div');
    side.className='lumina-tech-side';
    const head=document.createElement('div');
    head.className='lumina-tech-band-head';
    const label=document.createElement('p');
    label.className='eyebrow';
    label.textContent=copy.label;
    const count=document.createElement('span');
    count.className='lumina-tech-count';
    count.textContent=copy.count;
    head.append(label,count);

    const buttons=[...tabs.querySelectorAll('button[data-tab-src]')];
    const caption=viewer.querySelector('figcaption');
    let switchToken=0;
    const cache=new Map();
    const preload=(primary,fallback='')=>{
      const key=`${primary}|${fallback}`;
      if(cache.has(key))return cache.get(key);
      const promise=new Promise(resolve=>{
        const test=(src,next)=>{
          if(!src){resolve('');return;}
          const img=new Image();
          img.decoding='async';
          img.onload=()=>{if(typeof img.decode==='function')img.decode().catch(()=>{}).finally(()=>resolve(src));else resolve(src);};
          img.onerror=()=>next?test(next,''):resolve('');
          img.src=src;
        };
        test(primary,fallback);
      });
      cache.set(key,promise);
      return promise;
    };

    mainImage.removeAttribute('data-tab-image');
    buttons.forEach((button,index)=>{
      const text=(button.textContent||'').trim();
      const primary=button.dataset.tabSrc||'';
      const fallback=button.dataset.tabFallback||'';
      button.innerHTML='';
      const media=document.createElement('span');
      media.className='lumina-tech-thumb-media';
      const thumb=document.createElement('img');
      thumb.alt='';thumb.loading='lazy';thumb.decoding='async';thumb.src=primary;
      if(fallback)thumb.addEventListener('error',()=>{if(thumb.getAttribute('src')!==fallback)thumb.src=fallback;},{once:true});
      media.appendChild(thumb);
      const row=document.createElement('span');
      row.className='lumina-tech-thumb-label';
      const name=document.createElement('span');name.textContent=text;
      const number=document.createElement('span');number.className='lumina-tech-thumb-index';number.textContent=String(index+1).padStart(2,'0');
      row.append(name,number);
      button.append(media,row);
      preload(primary,fallback);
      button.addEventListener('click',async()=>{
        const token=++switchToken;
        const resolved=await preload(primary,fallback);
        if(token!==switchToken||!resolved)return;
        buttons.forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-selected',String(active));});
        if(mainImage.getAttribute('src')!==resolved)mainImage.src=resolved;
        mainImage.alt=button.dataset.tabCaption||text||copy.drawing;
        if(caption)caption.textContent=button.dataset.tabCaption||`${copy.drawing} / ${text}`;
      });
    });

    side.append(head,tabs);
    band.append(side,viewer);
    fabricationSection.appendChild(band);
    technicalSection.remove();
  };

  const state=routeState();
  if(state.pathLang){
    try{localStorage.setItem(storage,state.pathLang)}catch{}
    document.documentElement.lang=state.pathLang;
  }else{
    /* FR/ES now use the generated static routes as the single source of truth.
       This prevents the old root-page runtime dictionary from resurfacing stale
       wording such as “travaux spatiaux” and keeps mobile CSS identical. */
    let preferred='';
    try{preferred=localStorage.getItem(storage)||''}catch{}
    if(preferred==='fr'||preferred==='es'){
      location.replace(destination(preferred,state.route));
      return;
    }
  }

  if(state.route==='projects/lumina.html')setupLuminaFabrication();

  document.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('.lang-switcher [data-lang]'):null;
    if(!button)return;
    const lang=button.dataset.lang;
    if(!supported.includes(lang))return;
    const current=routeState();
    if(current.pathLang===lang){event.preventDefault();event.stopImmediatePropagation();return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    try{localStorage.setItem(storage,lang)}catch{}
    location.assign(destination(lang,current.route));
  },true);
})();