(() => {
  'use strict';
  const root=document.querySelector('[data-archive-interactive]');
  if(!root||window.__DATA_C0RE_ARCHIVE_ROLLOVER_V2__)return;
  window.__DATA_C0RE_ARCHIVE_ROLLOVER_V2__=true;
  /* The old synthetic bridge is no longer needed. Setting its guard prevents
     duplicate pointerenter/pointerleave dispatches if an older cached route loader runs. */
  window.__DATA_C0RE_ARCHIVE_AMBIENT_BRIDGE__=true;

  const entries=[...root.querySelectorAll('.archive-entry[data-archive-status]')];
  const groups=[...root.querySelectorAll('.archive-year')];
  const statusButtons=[...document.querySelectorAll('[data-archive-status-filter]')];
  const typeSelect=document.querySelector('[data-archive-type-filter]');
  const yearSelect=document.querySelector('[data-archive-year-filter]');
  const tagSelect=document.querySelector('[data-archive-tag-filter]');
  const count=document.querySelector('[data-archive-count]');
  const empty=document.querySelector('[data-archive-empty]');
  const statusRow=document.querySelector('.archive-control-row--status');
  const lang=(document.documentElement.lang||'en').slice(0,2);
  const params=new URLSearchParams(location.search);
  let status='all';
  let projectFilter=params.get('project')||'';
  if(projectFilter&&!entries.some(entry=>entry.dataset.archiveProject===projectFilter))projectFilter='';

  const requestedTag=params.get('tag')||'';
  if(tagSelect&&requestedTag&&[...tagSelect.options].some(option=>option.value===requestedTag))tagSelect.value=requestedTag;
  const countLabel=n=>lang==='fr'?`${n} projet${n>1?'s':''}`:lang==='es'?`${n} proyecto${n>1?'s':''}`:`${n} project${n>1?'s':''}`;
  const projectPrefix=lang==='fr'?'Projet':lang==='es'?'Proyecto':'Project';

  const replaceQuery=(key,value)=>{
    const next=new URL(location.href);
    if(value&&value!=='all')next.searchParams.set(key,value);else next.searchParams.delete(key);
    history.replaceState({},'',`${next.pathname}${next.search}${next.hash}`);
  };

  let projectChip=null;
  const syncProjectChip=()=>{
    projectChip?.remove();projectChip=null;
    if(!projectFilter||!statusRow)return;
    const entry=entries.find(item=>item.dataset.archiveProject===projectFilter);if(!entry)return;
    const title=entry.querySelector('strong')?.textContent?.trim()||projectFilter;
    projectChip=document.createElement('button');
    projectChip.type='button';projectChip.className='archive-project-query';
    projectChip.textContent=`${projectPrefix} · ${title} ×`;
    projectChip.setAttribute('aria-label',`${projectPrefix}: ${title}`);
    projectChip.addEventListener('click',()=>{projectFilter='';replaceQuery('project','');syncProjectChip();apply()});
    statusRow.appendChild(projectChip);
  };

  const desktop=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff=()=>reduced.matches||document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed')==='true';
  const videoPattern=/\.(mp4|webm|m4v)(?:[?#].*)?$/i;
  const imagePattern=/\.(avif|webp|png|jpe?g|gif)(?:[?#].*)?$/i;
  const imageRejectPattern=/(?:favicon|(?:^|[\/_-])icon(?:[\/_-]|\.)|logo|og-cover|avatar|sprite|placeholder)/i;
  const maxDiscoveredImages=4;
  const mediaTokens=new WeakMap();
  const discoveryPromises=new WeakMap();
  const warmedImages=new Set();
  const warmedVideos=new WeakSet();

  const ensureMediaLayer=entry=>{
    let media=entry.querySelector('.archive-entry-media');
    if(!media){
      media=document.createElement('span');
      media.className='archive-entry-media';media.setAttribute('aria-hidden','true');
      media.innerHTML='<img alt="" loading="eager" decoding="async" fetchpriority="low"><video muted loop playsinline preload="metadata"></video>';
      entry.prepend(media);
    }
    if(!media.querySelector('img')){
      const image=document.createElement('img');image.alt='';image.loading='eager';image.decoding='async';image.fetchPriority='low';media.prepend(image);
    }
    if(!media.querySelector('video')){
      const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='metadata';media.append(video);
    }
    return media;
  };

  const parsePool=(raw,fallback='')=>{
    if(!raw)return fallback?[fallback]:[];
    try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))return [...new Set(parsed.filter(Boolean))]}catch{}
    const list=raw.split('|').map(item=>item.trim()).filter(Boolean);
    return list.length?[...new Set(list)]:fallback?[fallback]:[];
  };
  const getVideoPool=entry=>parsePool(entry.dataset.archiveVideos||'',entry.dataset.archiveVideo||'');
  const getImagePool=entry=>parsePool(entry.dataset.archiveImages||'',entry.dataset.archiveImage||'');
  const firstSrcsetSource=value=>(value||'').split(',')[0]?.trim().split(/\s+/)[0]||'';
  const representativeImages=images=>{
    if(images.length<=maxDiscoveredImages)return images;
    const last=images.length-1;
    return [...new Set([0,Math.round(last/3),Math.round(last*2/3),last].map(index=>images[index]).filter(Boolean))].slice(0,maxDiscoveredImages);
  };

  const discoverMedia=entry=>{
    const knownVideos=getVideoPool(entry),knownImages=getImagePool(entry);
    if(knownVideos.length||knownImages.length){ensureMediaLayer(entry);return Promise.resolve({videos:knownVideos,images:knownImages})}
    if(discoveryPromises.has(entry))return discoveryPromises.get(entry);
    const promise=(async()=>{
      if(entry.dataset.archiveMediaResolved==='true')return {videos:[],images:[]};
      entry.dataset.archiveMediaResolved='true';
      try{
        const response=await fetch(entry.href,{credentials:'same-origin',cache:'force-cache'});
        if(!response.ok)return {videos:[],images:[]};
        const html=await response.text();
        const doc=new DOMParser().parseFromString(html,'text/html');
        const videos=[];
        doc.querySelectorAll('main video,main video source').forEach(node=>{
          [node.getAttribute('src'),node.getAttribute('data-src')].filter(Boolean).forEach(raw=>{
            const src=raw.trim();if(videoPattern.test(src)&&!videos.includes(src))videos.push(src);
          });
        });
        const foundImages=[];
        const addImage=node=>{
          if(node.closest('[hidden]'))return;
          const candidates=[node.getAttribute('src'),node.getAttribute('data-src'),firstSrcsetSource(node.getAttribute('srcset'))];
          const src=candidates.map(value=>(value||'').trim()).find(value=>value&&imagePattern.test(value)&&!imageRejectPattern.test(value));
          if(src&&!foundImages.includes(src))foundImages.push(src);
        };
        const explicit=[...doc.querySelectorAll('main img[data-archive-preview],main [data-archive-preview] img')];
        if(explicit.length)explicit.forEach(addImage);
        else doc.querySelectorAll('main .comedie-show-gallery img,main article figure img,main .project-section figure img,main figure img').forEach(addImage);
        const images=representativeImages(foundImages);
        if(videos.length){entry.dataset.archiveVideo=videos[0];if(videos.length>1)entry.dataset.archiveVideos=JSON.stringify(videos)}
        if(images.length){entry.dataset.archiveImage=images[0];if(images.length>1)entry.dataset.archiveImages=JSON.stringify(images)}
        if(videos.length||images.length)ensureMediaLayer(entry);
        return {videos,images};
      }catch{return {videos:[],images:[]}}
    })();
    discoveryPromises.set(entry,promise);
    return promise;
  };

  const warmImage=src=>{
    if(!src||warmedImages.has(src))return;
    warmedImages.add(src);
    const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=src;
  };

  const warmEntry=async entry=>{
    if(!desktop()||motionOff()||entry.hidden)return;
    const {videos,images}=await discoverMedia(entry);
    images.slice(0,2).forEach(warmImage);
    if(videos[0]){
      const video=ensureMediaLayer(entry).querySelector('video');
      if(video&&!warmedVideos.has(video)){
        warmedVideos.add(video);video.preload='metadata';
        if(!video.dataset.src){video.dataset.src=videos[0];video.src=videos[0];try{video.load()}catch{}}
      }
    }
  };

  const warmObserver='IntersectionObserver'in window?new IntersectionObserver(items=>{
    items.forEach(item=>{if(item.isIntersecting){warmEntry(item.target);warmObserver.unobserve(item.target)}});
  },{rootMargin:'900px 0px',threshold:0}):null;
  entries.forEach(entry=>warmObserver?.observe(entry));
  const idleWarm=()=>{
    let index=0;
    const next=deadline=>{
      let n=0;
      while(index<entries.length&&n<2&&(!deadline||deadline.timeRemaining()>3)){
        warmEntry(entries[index++]);n++;
      }
      if(index<entries.length){
        if('requestIdleCallback'in window)requestIdleCallback(next,{timeout:900});else setTimeout(()=>next(null),180);
      }
    };
    if('requestIdleCallback'in window)requestIdleCallback(next,{timeout:700});else setTimeout(()=>next(null),250);
  };

  const chooseFromPool=(entry,pool,lastKey)=>{
    if(pool.length<2)return pool[0]||'';
    const previous=entry.dataset[lastKey]||'';
    const candidates=pool.filter(src=>src!==previous);
    const source=candidates[Math.floor(Math.random()*candidates.length)]||pool[0];
    entry.dataset[lastKey]=source;return source;
  };
  const chooseMedia=(entry,videos,images)=>{
    if(!videos.length&&!images.length)return null;
    let kind='';
    if(videos.length&&images.length){
      const previousKind=entry.dataset.archiveMediaKindLast||'';
      kind=previousKind==='video'?'image':previousKind==='image'?'video':(Math.random()<.5?'video':'image');
    }else kind=videos.length?'video':'image';
    entry.dataset.archiveMediaKindLast=kind;
    const src=kind==='video'?chooseFromPool(entry,videos,'archiveVideoLast'):chooseFromPool(entry,images,'archiveImageLast');
    return src?{kind,src}:null;
  };
  const tokenIsCurrent=(entry,token)=>mediaTokens.get(entry)===token&&entry.dataset.archiveMediaWanted==='true'&&desktop()&&!motionOff()&&!document.hidden;

  const stageImage=(entry,src)=>{
    if(!src)return false;
    const media=ensureMediaLayer(entry),image=media.querySelector('img');
    if(!image)return false;
    warmImage(src);image.loading='eager';image.decoding='async';image.fetchPriority='high';
    if(image.getAttribute('src')!==src)image.src=src;
    image.style.opacity='';entry.classList.remove('has-archive-video');entry.classList.add('is-media-active');
    return true;
  };

  const showImage=(entry,src,token)=>{
    const media=ensureMediaLayer(entry),video=media.querySelector('video');
    video?.pause();
    if(!tokenIsCurrent(entry,token))return;
    stageImage(entry,src);
  };

  const showVideo=async(entry,src,token,fallback='')=>{
    const media=ensureMediaLayer(entry),image=media.querySelector('img'),video=media.querySelector('video');
    if(!video||!src)return;
    if(fallback)stageImage(entry,fallback);else if(image)image.style.opacity='0';
    video.preload='auto';
    if(video.dataset.src!==src||video.currentSrc.endsWith(src)===false){
      video.pause();video.dataset.src=src;video.src=src;
      try{video.load()}catch{}
      video.addEventListener('loadedmetadata',()=>{
        if(Number.isFinite(video.duration)&&video.duration>2){try{video.currentTime=Math.min(video.duration-.35,Math.max(.18,video.duration*.14))}catch{}}
      },{once:true});
    }
    const commit=()=>{
      if(!tokenIsCurrent(entry,token))return;
      entry.classList.add('is-media-active','has-archive-video');
    };
    video.addEventListener('playing',commit,{once:true});
    try{await video.play();commit()}catch{if(fallback)stageImage(entry,fallback)}
    if(!tokenIsCurrent(entry,token))video.pause();
  };

  const activateMedia=async(entry,force=false)=>{
    if(!entry||entry.hidden||!desktop()||motionOff())return;
    if(!force&&entry.dataset.archiveMediaWanted==='true')return;
    const token=(mediaTokens.get(entry)||0)+1;
    mediaTokens.set(entry,token);entry.dataset.archiveMediaWanted='true';
    const {videos,images}=await discoverMedia(entry);
    if(!tokenIsCurrent(entry,token))return;
    const choice=chooseMedia(entry,videos,images);if(!choice)return;
    if(choice.kind==='image')showImage(entry,choice.src,token);
    else showVideo(entry,choice.src,token,images[0]||'');
  };

  const deactivateMedia=entry=>{
    if(!entry)return;
    mediaTokens.set(entry,(mediaTokens.get(entry)||0)+1);
    entry.dataset.archiveMediaWanted='false';
    entry.classList.remove('is-media-active','has-archive-video');
    const media=entry.querySelector('.archive-entry-media');
    media?.querySelector('video')?.pause();
    const image=media?.querySelector('img');if(image)image.style.opacity='';
  };

  let pointerX=-1,pointerY=-1,pointerKnown=false,activeEntry=null,keyboardEntry=null;
  let syncRAF=0,chaseRAF=0,chaseUntil=0;

  const hitTest=()=>{
    if(!desktop()||motionOff()||document.hidden)return null;
    if(keyboardEntry&&!keyboardEntry.hidden)return keyboardEntry;
    if(pointerKnown){
      const node=document.elementFromPoint(pointerX,pointerY);
      const entry=node instanceof Element?node.closest('.archive-entry'):null;
      if(entry&&root.contains(entry)&&!entry.hidden)return entry;
    }
    try{return root.querySelector('.archive-entry:hover:not([hidden])')}catch{return null}
  };

  const setActiveEntry=(next,force=false)=>{
    if(next===activeEntry){if(force&&next)activateMedia(next,true);return}
    const previous=activeEntry;activeEntry=next;
    if(previous)deactivateMedia(previous);
    if(next)activateMedia(next,false);
  };

  const reconcile=(force=false)=>setActiveEntry(hitTest(),force);
  const scheduleReconcile=(force=false)=>{
    if(syncRAF)cancelAnimationFrame(syncRAF);
    syncRAF=requestAnimationFrame(()=>{syncRAF=0;reconcile(force)});
  };
  const chase=(duration=320,force=false)=>{
    chaseUntil=Math.max(chaseUntil,performance.now()+duration);
    if(force)scheduleReconcile(true);
    if(chaseRAF)return;
    const loop=now=>{
      reconcile(false);
      if(now<chaseUntil)chaseRAF=requestAnimationFrame(loop);else chaseRAF=0;
    };
    chaseRAF=requestAnimationFrame(loop);
  };

  const rememberPointer=event=>{
    if(Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)){
      pointerX=event.clientX;pointerY=event.clientY;pointerKnown=true;
    }
  };
  addEventListener('pointermove',event=>{rememberPointer(event);scheduleReconcile(false)},{passive:true});
  root.addEventListener('pointerover',event=>{rememberPointer(event);scheduleReconcile(false)},{passive:true});
  addEventListener('wheel',event=>{rememberPointer(event);chase(520,false)},{passive:true});
  addEventListener('scroll',()=>chase(360,false),{passive:true});
  addEventListener('resize',()=>{
    if(!desktop()){setActiveEntry(null);return}
    chase(260,true);
  },{passive:true});
  document.addEventListener('mouseleave',()=>{pointerKnown=false;if(!keyboardEntry)setActiveEntry(null)},{passive:true});

  root.addEventListener('focusin',event=>{
    const entry=event.target instanceof Element?event.target.closest('.archive-entry'):null;
    if(entry){keyboardEntry=entry;setActiveEntry(entry)}
  });
  root.addEventListener('focusout',event=>{
    const from=event.target instanceof Element?event.target.closest('.archive-entry'):null;
    const to=event.relatedTarget instanceof Element?event.relatedTarget.closest('.archive-entry'):null;
    if(from&&from!==to){keyboardEntry=to||null;scheduleReconcile(false)}
  });

  addEventListener('focus',()=>setTimeout(()=>chase(420,true),25),{passive:true});
  addEventListener('pageshow',()=>setTimeout(()=>chase(420,true),25),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      const video=activeEntry?.querySelector('.archive-entry-media video');video?.pause();
      return;
    }
    setTimeout(()=>chase(520,true),35);
  });

  const apply=()=>{
    const type=typeSelect?.value||'all',year=yearSelect?.value||'all',tag=tagSelect?.value||'all';
    let visible=0;
    entries.forEach(entry=>{
      const statuses=(entry.dataset.archiveStatus||'').split(/\s+/).filter(Boolean);
      const types=(entry.dataset.archiveType||'').split(/\s+/).filter(Boolean);
      const years=(entry.dataset.archiveYears||'').split(/\s+/).filter(Boolean);
      const tags=(entry.dataset.archiveTags||'').split(/\s+/).filter(Boolean);
      const show=(status==='all'||statuses.includes(status))&&(type==='all'||types.includes(type))&&(year==='all'||years.includes(year))&&(tag==='all'||tags.includes(tag))&&(!projectFilter||entry.dataset.archiveProject===projectFilter);
      entry.hidden=!show;if(show)visible++;
    });
    groups.forEach(group=>{group.hidden=![...group.querySelectorAll('.archive-entry')].some(entry=>!entry.hidden)});
    if(count)count.textContent=countLabel(visible);
    empty?.classList.toggle('is-visible',visible===0);
    if(activeEntry?.hidden)setActiveEntry(null);
    chase(220,false);
  };

  statusButtons.forEach(button=>button.addEventListener('click',()=>{
    status=button.dataset.archiveStatusFilter||'all';
    statusButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply();
  }));
  typeSelect?.addEventListener('change',apply);
  yearSelect?.addEventListener('change',apply);
  tagSelect?.addEventListener('change',()=>{replaceQuery('tag',tagSelect.value);apply()});

  [...document.querySelectorAll('.archive-filter-button')].forEach(item=>{
    item.addEventListener('pointermove',event=>{if(!desktop())return;const r=item.getBoundingClientRect();item.style.setProperty('--magnet-x',`${((event.clientX-r.left-r.width/2)*.055).toFixed(2)}px`);item.style.setProperty('--magnet-y',`${((event.clientY-r.top-r.height/2)*.09).toFixed(2)}px`)},{passive:true});
    item.addEventListener('pointerleave',()=>{item.style.setProperty('--magnet-x','0px');item.style.setProperty('--magnet-y','0px')},{passive:true});
  });

  syncProjectChip();apply();idleWarm();
})();
