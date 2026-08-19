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
  ensureCss('assets/css/video-ambilight-v1.css?v=20260819-17','data-video-ambilight');
  ensureScript('assets/js/menu-card-trail.js?v=20260816-1','data-menu-card-trail');
  ensureScript('assets/js/video-ambilight-v1.js?v=20260819-17','data-video-ambilight');

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