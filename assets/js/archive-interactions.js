(() => {
  'use strict';
  const root=document.querySelector('[data-archive-interactive]');
  if(!root)return;

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

  const apply=()=>{
    const type=typeSelect?.value||'all';
    const year=yearSelect?.value||'all';
    const tag=tagSelect?.value||'all';
    let visible=0;
    entries.forEach(entry=>{
      const statuses=(entry.dataset.archiveStatus||'').split(/\s+/).filter(Boolean);
      const types=(entry.dataset.archiveType||'').split(/\s+/).filter(Boolean);
      const years=(entry.dataset.archiveYears||'').split(/\s+/).filter(Boolean);
      const tags=(entry.dataset.archiveTags||'').split(/\s+/).filter(Boolean);
      const matchesStatus=status==='all'||statuses.includes(status);
      const matchesType=type==='all'||types.includes(type);
      const matchesYear=year==='all'||years.includes(year);
      const matchesTag=tag==='all'||tags.includes(tag);
      const matchesProject=!projectFilter||entry.dataset.archiveProject===projectFilter;
      const show=matchesStatus&&matchesType&&matchesYear&&matchesTag&&matchesProject;
      entry.hidden=!show;if(show)visible++;
    });
    groups.forEach(group=>{group.hidden=![...group.querySelectorAll('.archive-entry')].some(entry=>!entry.hidden)});
    if(count)count.textContent=countLabel(visible);
    empty?.classList.toggle('is-visible',visible===0);
  };

  statusButtons.forEach(button=>button.addEventListener('click',()=>{
    status=button.dataset.archiveStatusFilter||'all';
    statusButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    apply();
  }));
  typeSelect?.addEventListener('change',apply);
  yearSelect?.addEventListener('change',apply);
  tagSelect?.addEventListener('change',()=>{replaceQuery('tag',tagSelect.value);apply()});

  const desktop=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff=()=>reduced.matches||document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed')==='true';
  const videoPattern=/\.(mp4|webm|m4v)(?:[?#].*)?$/i;
  const imagePattern=/\.(avif|webp|png|jpe?g|gif)(?:[?#].*)?$/i;
  const imageRejectPattern=/(?:favicon|(?:^|[\/_-])icon(?:[\/_-]|\.)|logo|og-cover|avatar|sprite|placeholder)/i;
  const maxDiscoveredImages=4;

  const ensureMediaLayer=entry=>{
    let media=entry.querySelector('.archive-entry-media');
    if(!media){
      media=document.createElement('span');
      media.className='archive-entry-media';media.setAttribute('aria-hidden','true');
      media.innerHTML='<img alt="" loading="lazy" decoding="async" fetchpriority="low"><video muted loop playsinline preload="none"></video>';
      entry.prepend(media);
    }
    if(!media.querySelector('img')){
      const image=document.createElement('img');image.alt='';image.loading='lazy';image.decoding='async';image.fetchPriority='low';media.prepend(image);
    }
    if(!media.querySelector('video')){
      const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';media.append(video);
    }
    return media;
  };

  const parsePool=(raw,fallback='')=>{
    if(!raw)return fallback?[fallback]:[];
    try{
      const parsed=JSON.parse(raw);
      if(Array.isArray(parsed))return [...new Set(parsed.filter(Boolean))];
    }catch{}
    const list=raw.split('|').map(item=>item.trim()).filter(Boolean);
    return list.length?[...new Set(list)]:fallback?[fallback]:[];
  };
  const getVideoPool=entry=>parsePool(entry.dataset.archiveVideos||'',entry.dataset.archiveVideo||'');
  const getImagePool=entry=>parsePool(entry.dataset.archiveImages||'',entry.dataset.archiveImage||'');
  const firstSrcsetSource=value=>(value||'').split(',')[0]?.trim().split(/\s+/)[0]||'';
  const representativeImages=images=>{
    if(images.length<=maxDiscoveredImages)return images;
    const last=images.length-1;
    const indices=[0,Math.round(last/3),Math.round(last*2/3),last];
    return [...new Set(indices.map(index=>images[index]).filter(Boolean))].slice(0,maxDiscoveredImages);
  };

  const discoverMedia=async entry=>{
    let videos=getVideoPool(entry),images=getImagePool(entry);
    if(videos.length||images.length){ensureMediaLayer(entry);return {videos,images};}
    if(entry.dataset.archiveMediaResolved==='true')return {videos:[],images:[]};
    entry.dataset.archiveMediaResolved='true';
    try{
      const response=await fetch(entry.href,{credentials:'same-origin',cache:'force-cache'});
      if(!response.ok)return {videos:[],images:[]};
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const foundVideos=[];
      doc.querySelectorAll('main video,main video source').forEach(node=>{
        [node.getAttribute('src'),node.getAttribute('data-src')].filter(Boolean).forEach(src=>{
          src=src.trim();if(videoPattern.test(src)&&!foundVideos.includes(src))foundVideos.push(src);
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

      videos=foundVideos;
      images=representativeImages(foundImages);
      if(videos.length){entry.dataset.archiveVideo=videos[0];if(videos.length>1)entry.dataset.archiveVideos=JSON.stringify(videos)}
      if(images.length){entry.dataset.archiveImage=images[0];if(images.length>1)entry.dataset.archiveImages=JSON.stringify(images)}
      if(videos.length||images.length)ensureMediaLayer(entry);
      return {videos,images};
    }catch{return {videos:[],images:[]};}
  };

  const chooseFromPool=(entry,pool,lastKey)=>{
    if(pool.length<2)return pool[0]||'';
    const previous=entry.dataset[lastKey]||'';
    const candidates=pool.filter(src=>src!==previous);
    const source=candidates[Math.floor(Math.random()*candidates.length)]||pool[0];
    entry.dataset[lastKey]=source;
    return source;
  };

  const activateImage=(entry,images)=>{
    const src=chooseFromPool(entry,images,'archiveImageLast');
    const media=ensureMediaLayer(entry),image=media.querySelector('img'),video=media.querySelector('video');
    entry.classList.remove('has-archive-video');
    video?.pause();
    if(!src||!image)return false;
    if(image.getAttribute('src')!==src){
      image.fetchPriority='low';image.decoding='async';image.loading='eager';image.src=src;
    }
    return true;
  };

  const activateVideo=async(entry,videos)=>{
    const src=chooseFromPool(entry,videos,'archiveVideoLast');
    const media=ensureMediaLayer(entry),video=media.querySelector('video');
    if(!src||!video)return false;
    if(video.dataset.src!==src){
      video.pause();video.dataset.src=src;video.src=src;video.preload='metadata';video.load();
      video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(video.duration)&&video.duration>2){try{video.currentTime=Math.min(video.duration-0.5,Math.max(0.25,video.duration*0.18))}catch{}}},{once:true});
    }
    try{
      await video.play();
      if(entry.dataset.archiveMediaWanted==='true')entry.classList.add('has-archive-video');
      return true;
    }catch{return false;}
  };

  const activateMedia=async entry=>{
    entry.classList.add('is-media-active');entry.dataset.archiveMediaWanted='true';
    if(!desktop()||motionOff())return;
    const {videos,images}=await discoverMedia(entry);
    if(entry.dataset.archiveMediaWanted!=='true'||!desktop()||motionOff())return;
    if(videos.length){
      const played=await activateVideo(entry,videos);
      if(played||entry.dataset.archiveMediaWanted!=='true')return;
    }
    activateImage(entry,images);
  };
  const deactivateMedia=entry=>{
    entry.dataset.archiveMediaWanted='false';entry.classList.remove('is-media-active','has-archive-video');
    const video=entry.querySelector('.archive-entry-media video');if(video)video.pause();
  };
  entries.forEach(entry=>{entry.addEventListener('pointerenter',()=>activateMedia(entry));entry.addEventListener('pointerleave',()=>deactivateMedia(entry));entry.addEventListener('focus',()=>activateMedia(entry));entry.addEventListener('blur',()=>deactivateMedia(entry))});

  [...document.querySelectorAll('.archive-filter-button')].forEach(item=>{
    item.addEventListener('pointermove',event=>{if(!desktop())return;const r=item.getBoundingClientRect();item.style.setProperty('--magnet-x',`${((event.clientX-r.left-r.width/2)*.055).toFixed(2)}px`);item.style.setProperty('--magnet-y',`${((event.clientY-r.top-r.height/2)*.09).toFixed(2)}px`)});
    item.addEventListener('pointerleave',()=>{item.style.setProperty('--magnet-x','0px');item.style.setProperty('--magnet-y','0px')});
  });

  addEventListener('resize',()=>{if(!desktop())entries.forEach(deactivateMedia)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)entries.forEach(deactivateMedia)});
  syncProjectChip();apply();
})();
