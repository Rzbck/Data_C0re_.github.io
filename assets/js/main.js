(() => {
  const head=document.head;
  const completeStaticSeo=Boolean(
    head.querySelector('meta[name="description"]')&&
    head.querySelector('meta[name="robots"]')&&
    head.querySelector('link[rel="canonical"]')&&
    head.querySelector('meta[property="og:title"]')&&
    head.querySelector('meta[property="og:description"]')&&
    head.querySelector('meta[property="og:url"]')
  );
  if(completeStaticSeo){
    if(!head.querySelector('script[type="application/ld+json"]')){
      const rel=location.pathname.replace(/^\/Data_C0re_\.github\.io\/?/,'').replace(/^\/+/, '');
      const route=rel.replace(/^(en|fr|es)(?:\/|$)/,'')||'index.html';
      const lang=(document.documentElement.lang||'en').slice(0,2);
      const canonical=head.querySelector('link[rel="canonical"]')?.href||location.href;
      const title=document.title||'DATA C0RE';
      const description=head.querySelector('meta[name="description"]')?.content||'';
      const image=head.querySelector('meta[property="og:image"]')?.content||new URL('assets/img/og-cover.jpg',document.baseURI).href;
      const type=route.startsWith('projects/')?'CreativeWork':route==='about.html'||route==='cv.html'?'ProfilePage':'WebPage';
      const node={'@type':type,'@id':`${canonical}#page`,url:canonical,name:title,description,inLanguage:lang};
      if(image)node.image=image;
      const ld=document.createElement('script');ld.type='application/ld+json';ld.dataset.runtimeStaticSchema='true';ld.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[node]});head.appendChild(ld);
    }
    return;
  }
  if(!document.querySelector('script[data-seo-loader]')){
    const seo=document.createElement('script');
    seo.src=new URL('assets/js/seo.js',document.baseURI).href;
    seo.async=false;
    seo.dataset.seoLoader='true';
    document.head.appendChild(seo);
  }
})();

(() => {
  const addCss=(path,attr)=>{
    if(document.querySelector(`link[${attr}]`))return;
    const css=document.createElement('link');
    css.rel='stylesheet';css.href=new URL(path,document.baseURI).href;css.setAttribute(attr,'true');document.head.appendChild(css);
  };
  addCss('assets/css/responsive.css','data-responsive-css');
  addCss('assets/css/mobile-hardening.css','data-mobile-hardening');
  addCss('assets/css/i18n-layout.css','data-i18n-layout');

  const rel=location.pathname.replace(/^\/Data_C0re_\.github\.io\/?/,'').replace(/^\/+/,'');
  const staticLocalized=/^(en|fr|es)(?:\/|$)/.test(rel);
  if(staticLocalized){
    if(!document.querySelector('script[data-static-i18n-runtime]')){
      const script=document.createElement('script');
      script.src=new URL('assets/js/static-i18n.js',document.baseURI).href;
      script.async=false;script.dataset.staticI18nRuntime='true';document.head.appendChild(script);
    }
    return;
  }

  if(document.querySelector('script[data-i18n-loader]'))return;
  const restore=()=>window.__DATA_C0RE_RESTORE_MUTATION_OBSERVER?.();
  const loadPolish=()=>{
    if(document.querySelector('script[data-i18n-polish]')){restore();return}
    const polish=document.createElement('script');
    polish.src=new URL('assets/js/i18n-polish.js',document.baseURI).href;
    polish.async=false;polish.dataset.i18nPolish='true';polish.onload=restore;polish.onerror=restore;document.head.appendChild(polish);
  };
  const loadExtra=()=>{
    if(document.querySelector('script[data-i18n-extra]')){loadPolish();return}
    const extra=document.createElement('script');
    extra.src=new URL('assets/js/i18n-extra.js',document.baseURI).href;
    extra.async=false;extra.dataset.i18nExtra='true';extra.onload=loadPolish;extra.onerror=loadPolish;document.head.appendChild(extra);
  };
  const loadI18n=()=>{
    const script=document.createElement('script');
    script.src=new URL('assets/js/i18n.js',document.baseURI).href;
    script.async=false;script.dataset.i18nLoader='true';script.onload=loadExtra;script.onerror=()=>{loadExtra()};document.head.appendChild(script);
  };
  const guard=document.createElement('script');
  guard.src=new URL('assets/js/i18n-guard.js',document.baseURI).href;
  guard.async=false;guard.dataset.i18nGuard='true';guard.onload=loadI18n;guard.onerror=loadI18n;document.head.appendChild(guard);
})();

(() => {
  const main=document.querySelector('main');
  if(main&&!main.id)main.id='main';
  if(main&&!document.querySelector('.skip-link')){
    const skip=document.createElement('a');
    skip.className='skip-link';skip.href='#main';skip.dataset.runtimeSkip='true';
    const label=()=>{
      const lang=(document.documentElement.lang||'en').slice(0,2);
      skip.textContent=lang==='fr'?'Aller au contenu':lang==='es'?'Saltar al contenido':'Skip to content';
    };
    label();document.body.prepend(skip);document.addEventListener('data-c0re-languagechange',label);
  }
  if(!document.querySelector('style[data-focus-visible-runtime]')){
    const style=document.createElement('style');style.dataset.focusVisibleRuntime='true';
    style.textContent=`:where(a,button,input,select,textarea,[tabindex]):focus-visible{outline:2px solid var(--acid,#dfff00);outline-offset:4px}.site-menu :where(a,button):focus-visible{outline-offset:3px}`;
    document.head.appendChild(style);
  }

  const experienceSection=document.querySelector('[data-lumina-experience-section]');
  if(!experienceSection)return;
  const experience=[...experienceSection.querySelectorAll('video[data-lumina-experience]')];
  const fabrication=[...document.querySelectorAll('[data-fabrication-grid] video[data-stagger-video]')];
  const managed=[...experience,...fabrication];
  if(!managed.length)return;

  const sourceState=new WeakMap();
  const remember=video=>{
    if(sourceState.has(video))return sourceState.get(video);
    const state={
      direct:video.getAttribute('src')||'',
      sources:[...video.querySelectorAll('source')].map(source=>({source,src:source.getAttribute('src')||source.dataset.src||''})),
      releaseTimer:0
    };
    sourceState.set(video,state);return state;
  };
  const detach=video=>{
    const state=remember(video);
    clearTimeout(state.releaseTimer);state.releaseTimer=0;
    if(video.dataset.perfDetached==='true')return;
    video.pause();video.preload='none';
    if(video.getAttribute('src'))video.removeAttribute('src');
    state.sources.forEach(({source})=>source.removeAttribute('src'));
    video.dataset.perfDetached='true';
    try{video.load()}catch{}
  };
  const restore=video=>{
    const state=remember(video);
    clearTimeout(state.releaseTimer);state.releaseTimer=0;
    if(video.dataset.perfDetached!=='true')return;
    if(state.direct)video.setAttribute('src',state.direct);
    state.sources.forEach(({source,src})=>{if(src)source.setAttribute('src',src)});
    video.preload='metadata';delete video.dataset.perfDetached;
    try{video.load()}catch{}
  };
  const releaseLater=video=>{
    const state=remember(video);clearTimeout(state.releaseTimer);
    state.releaseTimer=setTimeout(()=>detach(video),900);
  };

  managed.forEach(video=>{remember(video);detach(video)});

  const experienceWarm=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting)experience.forEach(restore);else experience.forEach(releaseLater);
  }),{rootMargin:'80% 0px',threshold:0});
  experienceWarm.observe(experienceSection);

  const fabricationWarm=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const video=entry.target.querySelector('video[data-stagger-video]');if(!video)return;
    if(entry.isIntersecting)restore(video);else releaseLater(video);
  }),{rootMargin:'70% 0px',threshold:0});
  fabrication.forEach(video=>fabricationWarm.observe(video.closest('figure')||video));

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)managed.forEach(video=>video.pause());
  });
})();

(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const body=document.body, header=q('[data-header]'), menu=q('[data-menu]'), toggle=q('[data-menu-toggle]'), motion=q('[data-motion-toggle]'), motionLabel=q('[data-motion-label]');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff=reduce.matches,lastFocused=null;

  const setMenu=open=>{
    if(!menu||!toggle)return;
    if(open)lastFocused=document.activeElement;
    menu.classList.toggle('open',open);
    menu.setAttribute('aria-hidden',String(!open));
    toggle.setAttribute('aria-expanded',String(open));
    body.classList.toggle('menu-open',open);
    if(open)requestAnimationFrame(()=>q('.menu-links a',menu)?.focus());
    else if(lastFocused instanceof HTMLElement)lastFocused.focus();
  };
  toggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menu?.classList.contains('open'))setMenu(false);
    if(e.key!=='Tab'||!menu?.classList.contains('open'))return;
    const f=qa('a[href],button:not([disabled])',menu);if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>24);
  updateHeader();addEventListener('scroll',updateHeader,{passive:true});

  const randomStart=video=>{
    const duration=video.duration;
    if(!Number.isFinite(duration)||duration<=.6)return;
    const edge=Math.min(1.5,duration*.06);
    const min=edge,max=Math.max(min,duration-Math.min(2,duration*.08));
    let target=min+Math.random()*Math.max(.01,max-min);
    const previous=Number(video.dataset.lastRandomStart);
    if(Number.isFinite(previous)&&duration>4&&Math.abs(target-previous)<duration*.18){target=min+((target-min)+(duration*.41))%Math.max(.01,max-min)}
    target=Math.max(min,Math.min(max,target));
    try{video.currentTime=target;video.dataset.lastRandomStart=String(target)}catch{}
  };
  const seekWhenReady=video=>{if(video.readyState>=1)randomStart(video);else video.addEventListener('loadedmetadata',()=>randomStart(video),{once:true})};
  const loadLazy=v=>{if(v.dataset.loaded==='true')return;qa('source[data-src]',v).forEach(s=>{s.src=s.dataset.src||'';s.removeAttribute('data-src')});v.load();v.dataset.loaded='true'};
  const pageVideos=qa('video:not([data-hover-preview-video]):not([data-stagger-video]):not([data-work-preview-video])');
  const syncVideo=v=>{const visible=v.dataset.visible!=='false'&&!document.hidden;if(!motionOff&&visible){if(v.matches('[data-lazy-video]'))loadLazy(v);v.play().catch(()=>{})}else v.pause()};
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target,was=v.dataset.visible==='true',now=entry.isIntersecting;v.dataset.visible=String(now);if(now&&v.matches('[data-lazy-video]'))loadLazy(v);if(now&&!was)seekWhenReady(v);syncVideo(v)}),{rootMargin:'180px 0px',threshold:.05});
  pageVideos.forEach(v=>observer.observe(v));

  const hoverPreviewStage=q('[data-hover-preview-stage]'),hoverPreviewPoster=q('[data-hover-preview-poster]'),hoverPreviewVideo=q('[data-hover-preview-video]');
  let hoverPreviewToken=0;
  const sourceList=row=>(row.dataset.previewVideos||row.dataset.previewVideo||'').split('|').map(s=>s.trim()).filter(Boolean);
  const chooseSource=row=>{const sources=sourceList(row);if(!sources.length)return '';if(sources.length===1)return sources[0];const previous=row.dataset.lastPreviewSource||'';let choices=sources.filter(s=>s!==previous);if(!choices.length)choices=sources;const src=choices[Math.floor(Math.random()*choices.length)];row.dataset.lastPreviewSource=src;return src};
  const activateHoverPreview=row=>{
    if(!hoverPreviewStage||!hoverPreviewPoster||!hoverPreviewVideo)return;
    const poster=row.dataset.previewPoster||row.dataset.preview||'',src=chooseSource(row),token=++hoverPreviewToken;
    if(poster&&hoverPreviewPoster.getAttribute('src')!==poster)hoverPreviewPoster.src=poster;
    hoverPreviewStage.classList.add('is-changing');hoverPreviewStage.classList.remove('has-video');
    if(!src){hoverPreviewVideo.pause();hoverPreviewVideo.removeAttribute('src');hoverPreviewVideo.dataset.activeSrc='';hoverPreviewStage.classList.remove('is-changing');return}
    const revealPreparedFrame=()=>{
      if(token!==hoverPreviewToken||hoverPreviewVideo.dataset.activeSrc!==src)return;
      const reveal=()=>{if(token!==hoverPreviewToken||hoverPreviewVideo.dataset.activeSrc!==src)return;hoverPreviewStage.classList.remove('is-changing');hoverPreviewStage.classList.add('has-video');if(!motionOff&&!document.hidden)hoverPreviewVideo.play().catch(()=>{});else hoverPreviewVideo.pause()};
      randomStart(hoverPreviewVideo);
      if(hoverPreviewVideo.seeking)hoverPreviewVideo.addEventListener('seeked',reveal,{once:true});else if(hoverPreviewVideo.readyState>=2)requestAnimationFrame(reveal);else hoverPreviewVideo.addEventListener('canplay',reveal,{once:true});
    };
    if(hoverPreviewVideo.dataset.activeSrc===src){if(hoverPreviewVideo.readyState>=1)revealPreparedFrame();else hoverPreviewVideo.addEventListener('loadedmetadata',revealPreparedFrame,{once:true});return}
    hoverPreviewVideo.pause();hoverPreviewVideo.dataset.activeSrc=src;hoverPreviewVideo.preload='auto';hoverPreviewVideo.src=src;hoverPreviewVideo.load();
    if(hoverPreviewVideo.readyState>=1)revealPreparedFrame();else hoverPreviewVideo.addEventListener('loadedmetadata',revealPreparedFrame,{once:true});
  };
  qa('[data-preview-video],[data-preview-videos]').forEach(row=>{row.addEventListener('mouseenter',()=>activateHoverPreview(row));row.addEventListener('focus',()=>activateHoverPreview(row))});

  const previewVideos=qa('video[data-hover-preview-video],video[data-work-preview-video]');
  const previewObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const video=entry.target,stage=video.closest('[data-hover-preview-stage],[data-work-preview-stage],.index-preview');
    video.dataset.previewVisible=String(entry.isIntersecting);
    if(!entry.isIntersecting||motionOff||document.hidden)video.pause();
    else if(stage?.classList.contains('has-video'))video.play().catch(()=>{});
  }),{rootMargin:'80px 0px',threshold:.02});
  previewVideos.forEach(video=>previewObserver.observe(video));

  qa('[data-base64-source]').forEach(async img=>{try{const res=await fetch(img.dataset.base64Source,{cache:'force-cache'});if(!res.ok)throw new Error(String(res.status));const raw=(await res.text()).replace(/\s+/g,'');if(!raw.startsWith('/9j/')&&!raw.startsWith('iVBOR'))throw new Error('not base64 image data');img.src=`data:${raw.startsWith('/9j/')?'image/jpeg':'image/png'};base64,${raw}`;img.classList.add('is-loaded')}catch{img.removeAttribute('src');img.classList.add('is-error')}});

  const syncPreviews=()=>previewVideos.forEach(video=>{
    const stage=video.closest('[data-hover-preview-stage],[data-work-preview-stage],.index-preview');
    if(motionOff||document.hidden||video.dataset.previewVisible==='false')video.pause();
    else if(stage?.classList.contains('has-video'))video.play().catch(()=>{});
  });
  const applyMotion=()=>{
    motion?.setAttribute('aria-pressed',String(motionOff));
    if(motionLabel){const raw=motionOff?'motion off':'motion on';motionLabel.textContent=window.DATA_C0RE_I18N?.t(raw)||raw}
    body.classList.toggle('motion-off',motionOff);pageVideos.forEach(syncVideo);syncPreviews();
    if(hoverPreviewVideo?.src){if(motionOff||document.hidden)hoverPreviewVideo.pause();else if(hoverPreviewStage?.classList.contains('has-video')&&hoverPreviewVideo.dataset.previewVisible!=='false')hoverPreviewVideo.play().catch(()=>{})}
  };
  motion?.addEventListener('click',()=>{motionOff=!motionOff;applyMotion()});
  reduce.addEventListener?.('change',e=>{if(e.matches){motionOff=true;applyMotion()}});
  document.addEventListener('data-c0re-languagechange',applyMotion);
  document.addEventListener('visibilitychange',()=>{pageVideos.forEach(syncVideo);syncPreviews()});
  applyMotion();

  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -4% 0px'});
  qa('.reveal').forEach(el=>reveal.observe(el));

  const preview=q('[data-index-preview]');
  const setPreview=src=>{if(!preview||!src||preview.getAttribute('src')===src)return;const wrap=preview.closest('.index-preview');wrap?.classList.add('is-changing');setTimeout(()=>{preview.src=src;wrap?.classList.remove('is-changing')},90)};
  qa('[data-preview]:not([data-preview-video]):not([data-preview-videos])').forEach(row=>{const fn=()=>setPreview(row.dataset.preview);row.addEventListener('mouseenter',fn);row.addEventListener('focus',fn)});

  qa('[data-tabs]').forEach(set=>{const buttons=qa('[data-tab-src]',set),image=q('[data-tab-image]',set),caption=q('[data-tab-caption]',set);buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>{const on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});if(!image)return;image.style.opacity='.2';setTimeout(()=>{image.src=btn.dataset.tabSrc||'';image.alt=btn.dataset.tabCaption||'Technical drawing';if(caption)caption.textContent=btn.dataset.tabCaption||'';image.style.opacity='1'},100)}))});
})();

(() => {
  if(!document.querySelector('[data-about-panel]')||document.querySelector('script[data-about-touch-fix]'))return;
  const script=document.createElement('script');script.src=new URL('assets/js/about-touch-fix.js',document.baseURI).href;script.defer=true;script.dataset.aboutTouchFix='true';document.body.appendChild(script);
})();

(() => {
  if(document.querySelector('script[data-fullpage-loader]'))return;
  const script=document.createElement('script');script.src=new URL('assets/js/fullpage.js',document.baseURI).href;script.defer=true;script.dataset.fullpageLoader='true';document.body.appendChild(script);
})();
