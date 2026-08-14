(() => {
  'use strict';
  const supported=['en','fr','es'];
  const storage='data-c0re-lang-v1';
  const repoSegment=location.hostname.endsWith('github.io')&&location.pathname.startsWith('/Data_C0re_.github.io')?'/Data_C0re_.github.io':'';

  /* Load the homepage selected-work guards on every route, including the legacy
     root-language runtime. A versioned URL avoids Safari/iOS keeping the broken
     pre-fix stylesheet after a deployment. */
  const ensureCss=(path,attr)=>{
    if(document.querySelector(`link[${attr}]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL(path,document.baseURI).href;
    link.setAttribute(attr,'true');
    document.head.appendChild(link);
  };
  ensureCss('assets/css/home-work-immersive-fix.css?v=20260814-7','data-home-work-immersive-fix');
  ensureCss('assets/css/home-work-mobile-final.css?v=20260814-7','data-home-work-mobile-final');

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
    return `${location.origin}${normalized}${tail?'':'/'}${location.hash||''}`;
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
