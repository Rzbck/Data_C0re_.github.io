(() => {
  'use strict';
  const root=document.querySelector('[data-archive-interactive]');
  if(!root)return;

  const lang=(document.documentElement.lang||'en').slice(0,2);
  const localizedPath=/^\/(en|fr|es)\//.test(location.pathname);
  const routePrefix=localizedPath?`${lang}/`:'';
  const copy={
    en:{year:'FESTIVAL',status:'FESTIVAL',summary:'Vancouver, Canada / small-file film / 1:25 / 1.79 MB / SFMF 2026'},
    fr:{year:'FESTIVAL',status:'FESTIVAL',summary:'Vancouver, Canada / film small-file / 1:25 / 1,79 MB / SFMF 2026'},
    es:{year:'FESTIVAL',status:'FESTIVAL',summary:'Vancouver, Canadá / película small-file / 1:25 / 1,79 MB / SFMF 2026'}
  }[lang]||null;
  const contextLabels={
    en:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPERA',comedie:'THEATRE',hardwinner:'LIVE AV','stage-systems':'STAGE SYSTEMS',snake:'SOFTWARE',signal:'SIMULATION',ascii:'STUDY',realtime:'RESEARCH',cloud:'STUDY'},
    fr:{lumina:'INSTALLATION','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'OPÉRA',comedie:'THÉÂTRE',hardwinner:'LIVE AV','stage-systems':'SYSTÈMES SCÈNE',snake:'LOGICIEL',signal:'SIMULATION',ascii:'ÉTUDE',realtime:'RECHERCHE',cloud:'ÉTUDE'},
    es:{lumina:'INSTALACIÓN','last-low-bandwidth-message':'FESTIVAL','grand-theatre':'ÓPERA',comedie:'TEATRO',hardwinner:'LIVE AV','stage-systems':'SISTEMAS ESCÉNICOS',snake:'SOFTWARE',signal:'SIMULACIÓN',ascii:'ESTUDIO',realtime:'INVESTIGACIÓN',cloud:'ESTUDIO'}
  }[lang]||{};

  const ensureLowBandwidthEntry=()=>{
    if(root.querySelector('[data-archive-project="last-low-bandwidth-message"]'))return;
    const group=document.createElement('div');
    group.className='archive-year';
    group.dataset.archiveInjected='last-low-bandwidth-message';
    group.innerHTML=`<div class="archive-year-head"><time>2026</time><span>${copy.year}</span></div><div class="archive-list"><a class="archive-entry" href="${routePrefix}projects/last-low-bandwidth-message.html" data-archive-project="last-low-bandwidth-message" data-archive-status="realized" data-archive-type="film" data-archive-years="2026" data-archive-tags="festival vancouver canada small-file low-bandwidth"><span class="archive-entry-media" aria-hidden="true"><img src="assets/media/low-bandwidth-message/archive-still.webp" alt="" loading="lazy" decoding="async"></span><span class="archive-status status-realized">${copy.status}</span><div><strong>The Last Low-Bandwidth Message</strong><small>${copy.summary}</small></div><time>2026</time></a></div>`;
    const firstGroup=root.querySelector('.archive-year');
    if(firstGroup)firstGroup.after(group);else root.appendChild(group);
  };
  ensureLowBandwidthEntry();

  const lowBandwidthEntry=root.querySelector('[data-archive-project="last-low-bandwidth-message"]');
  if(lowBandwidthEntry){
    const summary=lowBandwidthEntry.querySelector('small');
    if(summary)summary.textContent=copy.summary;
    lowBandwidthEntry.removeAttribute('data-archive-video');
    lowBandwidthEntry.removeAttribute('data-archive-videos');
    lowBandwidthEntry.dataset.archiveVideoResolved='true';
    lowBandwidthEntry.dataset.archiveTags='festival vancouver canada small-file low-bandwidth';
    let media=lowBandwidthEntry.querySelector('.archive-entry-media');
    if(!media){
      lowBandwidthEntry.insertAdjacentHTML('afterbegin','<span class="archive-entry-media" aria-hidden="true"><img src="assets/media/low-bandwidth-message/archive-still.webp" alt="" loading="lazy" decoding="async"></span>');
      media=lowBandwidthEntry.querySelector('.archive-entry-media');
    }
    if(media){
      let image=media.querySelector('img');
      if(!image){
        media.insertAdjacentHTML('afterbegin','<img src="assets/media/low-bandwidth-message/archive-still.webp" alt="" loading="lazy" decoding="async">');
        image=media.querySelector('img');
      }
      if(image){image.src='assets/media/low-bandwidth-message/archive-still.webp';image.style.objectPosition='center center'}
      media.querySelectorAll('video').forEach(video=>{video.pause();video.remove()});
    }
  }

  const entries=[...root.querySelectorAll('.archive-entry[data-archive-status]')];
  const groups=[...root.querySelectorAll('.archive-year')];
  const syncContextLabels=()=>{
    entries.forEach(entry=>{
      const slug=entry.dataset.archiveProject;
      const label=contextLabels[slug];
      if(!label)return;
      const badge=entry.querySelector('.archive-status');
      if(badge)badge.textContent=label;
      const group=entry.closest('.archive-year');
      const heading=group?.querySelector('.archive-year-head span');
      if(heading)heading.textContent=label;
    });
  };
  syncContextLabels();

  const statusButtons=[...document.querySelectorAll('[data-archive-status-filter]')];
  const typeSelect=document.querySelector('[data-archive-type-filter]');
  const yearSelect=document.querySelector('[data-archive-year-filter]');
  const tagSelect=document.querySelector('[data-archive-tag-filter]');
  const count=document.querySelector('[data-archive-count]');
  const empty=document.querySelector('[data-archive-empty]');
  const statusRow=document.querySelector('.archive-control-row--status');
  const params=new URLSearchParams(location.search);
  let status='all';
  let projectFilter=params.get('project')||'';
  if(projectFilter&&!entries.some(entry=>entry.dataset.archiveProject===projectFilter))projectFilter='';

  if(typeSelect&&![...typeSelect.options].some(option=>option.value==='film')){
    const option=document.createElement('option');
    option.value='film';
    option.textContent=lang==='es'?'Película':'Film';
    const software=[...typeSelect.options].find(item=>item.value==='software');
    if(software)software.before(option);else typeSelect.appendChild(option);
  }

  const requestedTag=params.get('tag')||'';
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

  const syncTagOptions=taxonomy=>{
    if(!tagSelect)return;
    const categories=taxonomy?.categories||{};
    const tags=taxonomy?.tags||{};
    const projects=taxonomy?.projects||{};
    const used=new Set(Object.values(projects).flatMap(value=>Array.isArray(value)?value:[]));
    const all=tagSelect.querySelector('option[value="all"]');
    [...tagSelect.querySelectorAll('optgroup')].forEach(group=>group.remove());
    [...tagSelect.querySelectorAll('option:not([value="all"])')].forEach(option=>option.remove());
    for(const [category,labels] of Object.entries(categories)){
      const items=Object.entries(tags)
        .filter(([slug,meta])=>meta?.category===category&&used.has(slug))
        .sort((a,b)=>(a[1]?.[lang]||a[1]?.en||a[0]).localeCompare(b[1]?.[lang]||b[1]?.en||b[0],lang));
      if(!items.length)continue;
      const group=document.createElement('optgroup');
      group.label=labels?.[lang]||labels?.en||category;
      for(const [slug,meta] of items){
        const option=document.createElement('option');
        option.value=slug;option.textContent=meta?.[lang]||meta?.en||slug;group.appendChild(option);
      }
      tagSelect.appendChild(group);
    }
    if(all)tagSelect.prepend(all);
    if(requestedTag&&[...tagSelect.options].some(option=>option.value===requestedTag))tagSelect.value=requestedTag;
  };

  const syncCanonicalTaxonomy=async()=>{
    try{
      const url=new URL('data/project-taxonomy.json',document.baseURI);
      const response=await fetch(url,{credentials:'same-origin'});
      if(!response.ok)return;
      const taxonomy=await response.json();
      const projects=taxonomy?.projects||{};
      entries.forEach(entry=>{
        const slug=entry.dataset.archiveProject;
        const tags=projects[slug];
        if(slug&&Array.isArray(tags))entry.dataset.archiveTags=tags.join(' ');
      });
      syncTagOptions(taxonomy);
    }catch{}
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

  const ensureMediaLayer=entry=>{
    let media=entry.querySelector('.archive-entry-media');
    if(!media){
      media=document.createElement('span');
      media.className='archive-entry-media';media.setAttribute('aria-hidden','true');
      media.innerHTML='<video muted loop playsinline preload="none"></video>';
      entry.prepend(media);
    }else if(!media.querySelector('video')){
      const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';media.append(video);
    }
    return media;
  };

  const getVideoPool=entry=>{
    const fallback=entry.dataset.archiveVideo||'';
    const raw=entry.dataset.archiveVideos||'';
    if(!raw)return fallback?[fallback]:[];
    try{
      const parsed=JSON.parse(raw);
      if(Array.isArray(parsed))return [...new Set(parsed.filter(Boolean))];
    }catch{}
    const list=raw.split('|').map(item=>item.trim()).filter(Boolean);
    return list.length?[...new Set(list)]:fallback?[fallback]:[];
  };

  const discoverVideos=async entry=>{
    let pool=getVideoPool(entry);
    if(pool.length){ensureMediaLayer(entry);return pool;}
    if(entry.dataset.archiveVideoResolved==='true')return [];
    entry.dataset.archiveVideoResolved='true';
    try{
      const response=await fetch(entry.href,{credentials:'same-origin',cache:'force-cache'});
      if(!response.ok)return [];
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const found=[];
      doc.querySelectorAll('video,video source').forEach(node=>{
        [node.getAttribute('src'),node.getAttribute('data-src')].filter(Boolean).forEach(src=>{
          src=src.trim();if(videoPattern.test(src)&&!found.includes(src))found.push(src);
        });
      });
      if(!found.length)return [];
      entry.dataset.archiveVideo=found[0];
      if(found.length>1)entry.dataset.archiveVideos=JSON.stringify(found);
      ensureMediaLayer(entry);
      return found;
    }catch{return [];}
  };

  const chooseVideo=(entry,pool)=>{
    if(pool.length<2)return pool[0]||'';
    const previous=entry.dataset.archiveVideoLast||'';
    const candidates=pool.filter(src=>src!==previous);
    const source=candidates[Math.floor(Math.random()*candidates.length)]||pool[0];
    entry.dataset.archiveVideoLast=source;
    return source;
  };

  const activateMedia=async entry=>{
    entry.classList.add('is-media-active');entry.dataset.archiveMediaWanted='true';
    if(!desktop()||motionOff())return;
    const pool=await discoverVideos(entry);
    if(entry.dataset.archiveMediaWanted!=='true'||!desktop()||motionOff())return;
    const src=chooseVideo(entry,pool),video=entry.querySelector('.archive-entry-media video');
    if(!src||!video)return;
    if(video.dataset.src!==src){
      video.dataset.src=src;video.src=src;video.preload='metadata';video.load();
      video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(video.duration)&&video.duration>2){try{video.currentTime=Math.min(video.duration-0.5,Math.max(0.25,video.duration*0.18))}catch{}}},{once:true});
    }
    video.play().then(()=>entry.classList.add('has-archive-video')).catch(()=>{});
  };
  const deactivateMedia=entry=>{entry.dataset.archiveMediaWanted='false';entry.classList.remove('is-media-active','has-archive-video');const video=entry.querySelector('.archive-entry-media video');if(video)video.pause()};
  entries.forEach(entry=>{entry.addEventListener('pointerenter',()=>activateMedia(entry));entry.addEventListener('pointerleave',()=>deactivateMedia(entry));entry.addEventListener('focus',()=>activateMedia(entry));entry.addEventListener('blur',()=>deactivateMedia(entry))});

  [...document.querySelectorAll('.archive-filter-button')].forEach(item=>{
    item.addEventListener('pointermove',event=>{if(!desktop())return;const r=item.getBoundingClientRect();item.style.setProperty('--magnet-x',`${((event.clientX-r.left-r.width/2)*.055).toFixed(2)}px`);item.style.setProperty('--magnet-y',`${((event.clientY-r.top-r.height/2)*.09).toFixed(2)}px`)});
    item.addEventListener('pointerleave',()=>{item.style.setProperty('--magnet-x','0px');item.style.setProperty('--magnet-y','0px')});
  });

  addEventListener('resize',()=>{if(!desktop())entries.forEach(deactivateMedia)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)entries.forEach(deactivateMedia)});
  syncCanonicalTaxonomy().finally(()=>{syncContextLabels();syncProjectChip();apply()});
})();
