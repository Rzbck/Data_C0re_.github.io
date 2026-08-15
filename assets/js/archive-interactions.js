(() => {
  'use strict';
  const root=document.querySelector('[data-archive-interactive]');
  if(!root)return;

  const entries=[...root.querySelectorAll('.archive-entry[data-archive-status]')];
  const groups=[...root.querySelectorAll('.archive-year')];
  const statusButtons=[...document.querySelectorAll('[data-archive-status-filter]')];
  const typeSelect=document.querySelector('[data-archive-type-filter]');
  const yearSelect=document.querySelector('[data-archive-year-filter]');
  const count=document.querySelector('[data-archive-count]');
  const empty=document.querySelector('[data-archive-empty]');
  const lang=(document.documentElement.lang||'en').slice(0,2);
  let status='all';

  const countLabel=n=>lang==='fr'?`${n} projet${n>1?'s':''}`:lang==='es'?`${n} proyecto${n>1?'s':''}`:`${n} project${n>1?'s':''}`;

  const apply=()=>{
    const type=typeSelect?.value||'all';
    const year=yearSelect?.value||'all';
    let visible=0;
    entries.forEach(entry=>{
      const statuses=(entry.dataset.archiveStatus||'').split(/\s+/);
      const types=(entry.dataset.archiveType||'').split(/\s+/);
      const years=(entry.dataset.archiveYears||'').split(/\s+/);
      const matchesStatus=status==='all'||statuses.includes(status);
      const matchesType=type==='all'||types.includes(type);
      const matchesYear=year==='all'||years.includes(year);
      const show=matchesStatus&&matchesType&&matchesYear;
      entry.hidden=!show;
      if(show)visible++;
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

  const desktop=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff=()=>reduced.matches||document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed')==='true';

  const activateMedia=entry=>{
    entry.classList.add('is-media-active');
    if(!desktop()||motionOff())return;
    const src=entry.dataset.archiveVideo;
    const video=entry.querySelector('.archive-entry-media video');
    if(!src||!video)return;
    if(video.dataset.src!==src){
      video.dataset.src=src;
      video.src=src;
      video.preload='metadata';
      video.load();
      video.addEventListener('loadedmetadata',()=>{
        if(Number.isFinite(video.duration)&&video.duration>2){
          try{video.currentTime=Math.min(video.duration-0.5,Math.max(0.25,video.duration*0.18))}catch{}
        }
      },{once:true});
    }
    video.play().then(()=>entry.classList.add('has-archive-video')).catch(()=>{});
  };
  const deactivateMedia=entry=>{
    entry.classList.remove('is-media-active','has-archive-video');
    const video=entry.querySelector('.archive-entry-media video');
    if(video)video.pause();
  };

  entries.forEach(entry=>{
    entry.addEventListener('pointerenter',()=>activateMedia(entry));
    entry.addEventListener('pointerleave',()=>deactivateMedia(entry));
    entry.addEventListener('focus',()=>activateMedia(entry));
    entry.addEventListener('blur',()=>deactivateMedia(entry));
  });

  const magnetic=[...document.querySelectorAll('.archive-filter-button')];
  magnetic.forEach(item=>{
    item.addEventListener('pointermove',event=>{
      if(!desktop())return;
      const r=item.getBoundingClientRect();
      const x=(event.clientX-r.left-r.width/2)*.055;
      const y=(event.clientY-r.top-r.height/2)*.09;
      item.style.setProperty('--magnet-x',`${x.toFixed(2)}px`);
      item.style.setProperty('--magnet-y',`${y.toFixed(2)}px`);
    });
    item.addEventListener('pointerleave',()=>{
      item.style.setProperty('--magnet-x','0px');
      item.style.setProperty('--magnet-y','0px');
    });
  });

  addEventListener('resize',()=>{if(!desktop())entries.forEach(deactivateMedia)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)entries.forEach(deactivateMedia)});
  apply();
})();
