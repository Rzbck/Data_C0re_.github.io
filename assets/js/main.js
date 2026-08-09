(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const body=document.body, header=q('[data-header]'), menu=q('[data-menu]'), toggle=q('[data-menu-toggle]'), motion=q('[data-motion-toggle]'), motionLabel=q('[data-motion-label]');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff=reduce.matches,lastFocused=null;

  const setMenu=open=>{
    if(!menu||!toggle)return;
    if(open)lastFocused=document.activeElement;
    menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));body.classList.toggle('menu-open',open);
    if(open)requestAnimationFrame(()=>q('.menu-links a',menu)?.focus());else if(lastFocused instanceof HTMLElement)lastFocused.focus();
  };
  toggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menu?.classList.contains('open'))setMenu(false);
    if(e.key!=='Tab'||!menu?.classList.contains('open'))return;
    const f=qa('a[href],button:not([disabled])',menu);if(!f.length)return;const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>24);updateHeader();addEventListener('scroll',updateHeader,{passive:true});

  const randomStart=video=>{
    const duration=video.duration;
    if(!Number.isFinite(duration)||duration<=.6)return;
    const edge=Math.min(1.5,duration*.06);
    const min=edge,max=Math.max(min,duration-Math.min(2,duration*.08));
    let target=min+Math.random()*Math.max(.01,max-min);
    const previous=Number(video.dataset.lastRandomStart);
    if(Number.isFinite(previous)&&duration>4&&Math.abs(target-previous)<duration*.18){
      target=min+((target-min)+(duration*.41))%Math.max(.01,max-min);
    }
    target=Math.max(min,Math.min(max,target));
    try{video.currentTime=target;video.dataset.lastRandomStart=String(target)}catch{}
  };
  const seekWhenReady=video=>{
    if(video.readyState>=1)randomStart(video);
    else video.addEventListener('loadedmetadata',()=>randomStart(video),{once:true});
  };
  const loadLazy=v=>{
    if(v.dataset.loaded==='true')return;
    qa('source[data-src]',v).forEach(s=>{s.src=s.dataset.src||'';s.removeAttribute('data-src')});
    v.load();v.dataset.loaded='true';
  };
  const pageVideos=qa('video:not([data-hover-preview-video])');
  const syncVideo=v=>{
    const visible=v.dataset.visible!=='false';
    if(!motionOff&&visible){if(v.matches('[data-lazy-video]'))loadLazy(v);v.play().catch(()=>{})}else v.pause();
  };
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const v=entry.target,was=v.dataset.visible==='true',now=entry.isIntersecting;
    v.dataset.visible=String(now);
    if(now&&v.matches('[data-lazy-video]'))loadLazy(v);
    if(now&&!was)seekWhenReady(v);
    syncVideo(v);
  }),{rootMargin:'180px 0px',threshold:.05});
  pageVideos.forEach(v=>observer.observe(v));

  const hoverPreviewStage=q('[data-hover-preview-stage]');
  const hoverPreviewPoster=q('[data-hover-preview-poster]');
  const hoverPreviewVideo=q('[data-hover-preview-video]');
  let hoverPreviewToken=0;
  const sourceList=row=>(row.dataset.previewVideos||row.dataset.previewVideo||'').split('|').map(s=>s.trim()).filter(Boolean);
  const chooseSource=row=>{
    const sources=sourceList(row);if(!sources.length)return '';
    if(sources.length===1)return sources[0];
    const previous=row.dataset.lastPreviewSource||'';
    let choices=sources.filter(s=>s!==previous);if(!choices.length)choices=sources;
    const src=choices[Math.floor(Math.random()*choices.length)];row.dataset.lastPreviewSource=src;return src;
  };
  const activateHoverPreview=row=>{
    if(!hoverPreviewStage||!hoverPreviewPoster||!hoverPreviewVideo)return;
    const poster=row.dataset.previewPoster||row.dataset.preview||'',src=chooseSource(row);
    if(poster&&hoverPreviewPoster.getAttribute('src')!==poster)hoverPreviewPoster.src=poster;
    hoverPreviewStage.classList.add('is-changing');
    const token=++hoverPreviewToken;
    if(!src){
      hoverPreviewVideo.pause();hoverPreviewVideo.removeAttribute('src');hoverPreviewVideo.dataset.activeSrc='';
      hoverPreviewStage.classList.remove('has-video','is-changing');return;
    }
    const show=()=>{
      if(token!==hoverPreviewToken||hoverPreviewVideo.dataset.activeSrc!==src)return;
      randomStart(hoverPreviewVideo);hoverPreviewStage.classList.remove('is-changing');hoverPreviewStage.classList.add('has-video');
      if(!motionOff)hoverPreviewVideo.play().catch(()=>{});else hoverPreviewVideo.pause();
    };
    if(hoverPreviewVideo.dataset.activeSrc===src){show();return;}
    hoverPreviewVideo.pause();hoverPreviewStage.classList.remove('has-video');hoverPreviewVideo.dataset.activeSrc=src;hoverPreviewVideo.src=src;hoverPreviewVideo.load();
    if(hoverPreviewVideo.readyState>=1)show();else hoverPreviewVideo.addEventListener('loadedmetadata',show,{once:true});
  };
  qa('[data-preview-video],[data-preview-videos]').forEach(row=>{
    row.addEventListener('mouseenter',()=>activateHoverPreview(row));row.addEventListener('focus',()=>activateHoverPreview(row));
  });

  // Decode assets accidentally stored as base64 text instead of binary image files.
  qa('[data-base64-source]').forEach(async img=>{
    try{
      const res=await fetch(img.dataset.base64Source,{cache:'force-cache'});if(!res.ok)throw new Error(String(res.status));
      const raw=(await res.text()).replace(/\s+/g,'');
      if(!raw.startsWith('/9j/')&&!raw.startsWith('iVBOR'))throw new Error('not base64 image data');
      img.src=`data:${raw.startsWith('/9j/')?'image/jpeg':'image/png'};base64,${raw}`;img.classList.add('is-loaded');
    }catch{img.removeAttribute('src');img.classList.add('is-error')}
  });

  // Robustly decode the embedded JPEG from the existing FX sprite SVG before using it.
  qa('[data-fx-player]').forEach(async player=>{
    const layers=qa('[data-fx-frame]',player),counter=q('[data-fx-index]',player),label=q('[data-fx-label]',player);
    const count=Math.max(1,Number(player.dataset.frameCount)||7);if(!layers.length)return;
    const labels=(player.dataset.frameLabels||'').split('|');
    try{
      const res=await fetch(player.dataset.spriteSource||'assets/media/research/fx-sprite.svg',{cache:'force-cache'});if(!res.ok)throw new Error(String(res.status));
      const text=await res.text(),match=text.match(/data:image\/(?:jpeg|jpg);base64,([^"']+)/i);if(!match)throw new Error('sprite data missing');
      const uri=`data:image/jpeg;base64,${match[1].replace(/\s+/g,'')}`;
      layers.forEach(layer=>{layer.style.backgroundImage=`url(${uri})`;layer.style.backgroundSize=`${count*100}% 100%`});
      player.classList.add('is-ready');
    }catch{player.classList.add('is-error');return;}
    const positions=Array.from({length:count},(_,i)=>count===1?0:(i/(count-1))*100);
    let current=0,activeLayer=0,history=[0],visible=true;
    const setLayer=(layer,index)=>{layer.style.backgroundPosition=`${positions[index]}% center`};
    setLayer(layers[0],0);if(counter)counter.textContent='01';if(label&&labels[0])label.textContent=labels[0];
    const chooseNext=()=>{
      if(count<2)return 0;let next=current,guard=0;
      while((next===current||history.slice(-2).includes(next))&&guard++<30)next=Math.floor(Math.random()*count);
      return next===current?(current+1)%count:next;
    };
    const advance=()=>{
      if(!motionOff&&!document.hidden&&visible){
        const next=chooseNext(),incoming=(activeLayer+1)%layers.length;setLayer(layers[incoming],next);
        requestAnimationFrame(()=>{layers.forEach((layer,i)=>layer.classList.toggle('is-active',i===incoming));activeLayer=incoming;current=next;history.push(next);if(history.length>4)history.shift();if(counter)counter.textContent=String(next+1).padStart(2,'0');if(label&&labels[next])label.textContent=labels[next]});
      }
      setTimeout(advance,2200+Math.random()*1900);
    };
    new IntersectionObserver(es=>es.forEach(e=>visible=e.isIntersecting),{rootMargin:'160px 0px',threshold:.02}).observe(player);
    setTimeout(advance,1000+Math.random()*900);
  });

  const applyMotion=()=>{
    motion?.setAttribute('aria-pressed',String(motionOff));if(motionLabel)motionLabel.textContent=motionOff?'motion off':'motion on';body.classList.toggle('motion-off',motionOff);
    pageVideos.forEach(syncVideo);
    if(hoverPreviewVideo?.src){if(motionOff)hoverPreviewVideo.pause();else if(hoverPreviewStage?.classList.contains('has-video'))hoverPreviewVideo.play().catch(()=>{})}
  };
  motion?.addEventListener('click',()=>{motionOff=!motionOff;applyMotion()});reduce.addEventListener?.('change',e=>{if(e.matches){motionOff=true;applyMotion()}});applyMotion();

  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -4% 0px'});qa('.reveal').forEach(el=>reveal.observe(el));
  const preview=q('[data-index-preview]');
  const setPreview=src=>{if(!preview||!src||preview.getAttribute('src')===src)return;const wrap=preview.closest('.index-preview');wrap?.classList.add('is-changing');setTimeout(()=>{preview.src=src;wrap?.classList.remove('is-changing')},90)};
  qa('[data-preview]:not([data-preview-video]):not([data-preview-videos])').forEach(row=>{const fn=()=>setPreview(row.dataset.preview);row.addEventListener('mouseenter',fn);row.addEventListener('focus',fn)});
  qa('[data-tabs]').forEach(set=>{const buttons=qa('[data-tab-src]',set),image=q('[data-tab-image]',set),caption=q('[data-tab-caption]',set);buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>{const on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});if(!image)return;image.style.opacity='.2';setTimeout(()=>{image.src=btn.dataset.tabSrc||'';image.alt=btn.dataset.tabCaption||'Technical drawing';if(caption)caption.textContent=btn.dataset.tabCaption||'';image.style.opacity='1'},100)}))});
})();
