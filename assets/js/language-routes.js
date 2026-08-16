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

/* Small-file project media: Safari/iOS-safe poster + explicit playback fallback.
   The real poster remains visible until the browser confirms `playing`, so a
   refused/stalled autoplay can never leave a large black rectangle. */
(() => {
  'use strict';
  const boot=()=>{
    const figure=document.querySelector('.smallfile-media');
    const video=figure?.querySelector('video');
    if(!figure||!video||figure.dataset.videoFallbackReady==='true')return;
    figure.dataset.videoFallbackReady='true';

    const lang=(document.documentElement.lang||'en').slice(0,2);
    const label=lang==='fr'?'LIRE L’EXTRAIT':lang==='es'?'REPRODUCIR EXTRACTO':'PLAY EXCERPT';
    const posterSrc=video.getAttribute('poster')||'assets/media/low-bandwidth-message/promo.webp';

    if(!document.querySelector('style[data-smallfile-video-fallback]')){
      const style=document.createElement('style');
      style.dataset.smallfileVideoFallback='true';
      style.textContent=`
        .smallfile-media{position:relative}
        .smallfile-media>video{position:relative;z-index:1}
        .smallfile-video-poster{position:absolute;z-index:2;inset:0 0 auto 0;width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;background:#020202;opacity:1;transition:opacity .18s ease;pointer-events:none}
        .smallfile-media.is-video-playing .smallfile-video-poster{opacity:0}
        .smallfile-video-play{position:absolute;z-index:3;left:14px;bottom:34px;display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:8px 11px;border:1px solid rgba(223,255,0,.55);background:rgba(2,2,2,.88);color:var(--acid,#dfff00);font:800 8px/1 inherit;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
        .smallfile-video-play[hidden]{display:none}
        .smallfile-video-play:hover,.smallfile-video-play:focus-visible{background:var(--acid,#dfff00);color:#050505}
        @media(max-width:620px){.smallfile-video-play{left:10px;bottom:31px;min-height:30px;padding:7px 9px;font-size:7px}}
      `;
      document.head.appendChild(style);
    }

    const poster=document.createElement('img');
    poster.className='smallfile-video-poster';
    poster.src=new URL(posterSrc,document.baseURI).href;
    poster.alt='';
    poster.decoding='async';
    figure.insertBefore(poster,video);

    const play=document.createElement('button');
    play.type='button';
    play.className='smallfile-video-play';
    play.textContent=label;
    play.hidden=true;
    figure.insertBefore(play,figure.querySelector('figcaption'));

    video.muted=true;
    video.defaultMuted=true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
    video.preload='auto';

    let fallbackTimer=0;
    const playing=()=>{
      clearTimeout(fallbackTimer);
      figure.classList.add('is-video-playing');
      play.hidden=true;
    };
    const fallback=()=>{
      if(!figure.classList.contains('is-video-playing'))play.hidden=false;
    };
    const tryPlay=()=>{
      video.muted=true;
      const result=video.play();
      if(result&&typeof result.catch==='function')result.catch(fallback);
    };

    video.addEventListener('playing',playing);
    video.addEventListener('canplay',tryPlay,{once:true});
    video.addEventListener('error',fallback);
    video.addEventListener('stalled',fallback);
    play.addEventListener('click',tryPlay);

    fallbackTimer=setTimeout(fallback,1200);
    if(video.readyState>=2)tryPlay();
    else {
      try{video.load()}catch{}
      requestAnimationFrame(tryPlay);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();