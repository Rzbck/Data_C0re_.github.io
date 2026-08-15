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

  const activateMedia=entry=>{
    entry.classList.add('is-media-active');
    if(!desktop()||motionOff())return;
    const src=entry.dataset.archiveVideo,video=entry.querySelector('.archive-entry-media video');
    if(!src||!video)return;
    if(video.dataset.src!==src){
      video.dataset.src=src;video.src=src;video.preload='metadata';video.load();
      video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(video.duration)&&video.duration>2){try{video.currentTime=Math.min(video.duration-0.5,Math.max(0.25,video.duration*0.18))}catch{}}},{once:true});
    }
    video.play().then(()=>entry.classList.add('has-archive-video')).catch(()=>{});
  };
  const deactivateMedia=entry=>{entry.classList.remove('is-media-active','has-archive-video');const video=entry.querySelector('.archive-entry-media video');if(video)video.pause()};
  entries.forEach(entry=>{entry.addEventListener('pointerenter',()=>activateMedia(entry));entry.addEventListener('pointerleave',()=>deactivateMedia(entry));entry.addEventListener('focus',()=>activateMedia(entry));entry.addEventListener('blur',()=>deactivateMedia(entry))});

  [...document.querySelectorAll('.archive-filter-button')].forEach(item=>{
    item.addEventListener('pointermove',event=>{if(!desktop())return;const r=item.getBoundingClientRect();item.style.setProperty('--magnet-x',`${((event.clientX-r.left-r.width/2)*.055).toFixed(2)}px`);item.style.setProperty('--magnet-y',`${((event.clientY-r.top-r.height/2)*.09).toFixed(2)}px`)});
    item.addEventListener('pointerleave',()=>{item.style.setProperty('--magnet-x','0px');item.style.setProperty('--magnet-y','0px')});
  });

  addEventListener('resize',()=>{if(!desktop())entries.forEach(deactivateMedia)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)entries.forEach(deactivateMedia)});
  syncCanonicalTaxonomy().finally(()=>{syncProjectChip();apply()});
})();
