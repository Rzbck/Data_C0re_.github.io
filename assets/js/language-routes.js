(() => {
  'use strict';
  const supported=['en','fr','es'];
  const storage='data-c0re-lang-v1';
  const repoSegment=location.hostname.endsWith('github.io')&&location.pathname.startsWith('/Data_C0re_.github.io')?'/Data_C0re_.github.io':'';

  /* Mobile preflight runs before main.js: remove stale LUMINA observer targets,
     mark normal page videos so legacy autoplay observers ignore them, and let the
     shared controller become the sole playback authority. */
  const mobileMedia=matchMedia('(max-width:820px), (pointer:coarse)').matches;
  if(mobileMedia){
    const luminaSection=document.querySelector('[data-lumina-experience-section]');
    if(luminaSection){
      const legacy=[...luminaSection.querySelectorAll('video[data-lumina-experience]'),...document.querySelectorAll('[data-fabrication-grid] video[data-stagger-video]')];
      [...new Set(legacy)].forEach(video=>video.replaceWith(video.cloneNode(true)));
      luminaSection.removeAttribute('data-lumina-experience-section');
    }
    document.querySelectorAll('video').forEach(video=>{
      if(video.matches('[data-hover-preview-video],[data-work-preview-video]'))return;
      video.setAttribute('data-stagger-video','');
      video.dataset.perfDetached='true';
    });
  }

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
  ensureCss('assets/css/video-ambilight-v1.css?v=20260819-20','data-video-ambilight');
  ensureScript('assets/js/menu-card-trail.js?v=20260816-1','data-menu-card-trail');
  ensureScript('assets/js/mobile-media-controller-v1.js?v=20260824-media4','data-mobile-media-controller');
  ensureScript('assets/js/video-ambilight-v1.js?v=20260820-22','data-video-ambilight');
  ensureScript('assets/js/ambilight-interpolator-v1.js?v=20260820-1','data-ambilight-interpolator');
  const archiveInteractive=Boolean(document.querySelector('[data-archive-interactive]'));
  if(!archiveInteractive)ensureScript('assets/js/ambilight-white-image-guard-v1.js?v=20260820-1','data-ambilight-white-image-guard');
  if(archiveInteractive)ensureScript('assets/js/archive-ambient-bridge-v1.js?v=20260819-1','data-archive-ambient-bridge');

  /* Dev-branch adaptive governor HUD. It reacts to page-wide frame pressure,
     progressively throttles the ASCII shader and collision work, and can fully
     hide the effect at OFF. Production/main is untouched. */
  const perfProbeHost=location.hostname.includes('datac0re-dev-preview-git-dev-');
  const perfProbeEnabled=perfProbeHost||new URLSearchParams(location.search).get('perfprobe')==='1';
  if(perfProbeEnabled)ensureScript('assets/js/glsl-adaptive-probe-v1.js?v=20260826-3','data-glsl-adaptive-probe');

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

  const state=routeState();
  if(state.route==='cv.html')ensureScript('assets/js/cv-content-canonical-v1.js?v=20260820-1','data-cv-content-canonical');
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