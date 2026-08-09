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

  const directVideos=qa('[data-autoplay]'), lazyVideos=qa('[data-lazy-video]');
  const loadLazy=v=>{if(v.dataset.loaded==='true')return;qa('source[data-src]',v).forEach(s=>{s.src=s.dataset.src||'';s.removeAttribute('data-src')});v.load();v.dataset.loaded='true'};
  const syncVideo=v=>{const visible=v.dataset.visible!=='false';if(!motionOff&&visible){if(v.matches('[data-lazy-video]'))loadLazy(v);v.play().catch(()=>{})}else v.pause()};
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target;v.dataset.visible=String(entry.isIntersecting);if(entry.isIntersecting&&v.matches('[data-lazy-video]'))loadLazy(v);syncVideo(v)}),{rootMargin:'180px 0px',threshold:.05});
  [...directVideos,...lazyVideos].forEach(v=>observer.observe(v));
  const applyMotion=()=>{motion?.setAttribute('aria-pressed',String(motionOff));if(motionLabel)motionLabel.textContent=motionOff?'motion off':'motion on';[...directVideos,...lazyVideos].forEach(syncVideo)};
  motion?.addEventListener('click',()=>{motionOff=!motionOff;applyMotion()});reduce.addEventListener?.('change',e=>{if(e.matches){motionOff=true;applyMotion()}});applyMotion();

  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -4% 0px'});qa('.reveal').forEach(el=>reveal.observe(el));

  const preview=q('[data-index-preview]');
  const setPreview=src=>{if(!preview||!src||preview.getAttribute('src')===src)return;const wrap=preview.closest('.index-preview');wrap?.classList.add('is-changing');setTimeout(()=>{preview.src=src;wrap?.classList.remove('is-changing')},90)};
  qa('[data-preview]').forEach(row=>{const fn=()=>setPreview(row.dataset.preview);row.addEventListener('mouseenter',fn);row.addEventListener('focus',fn)});

  qa('[data-tabs]').forEach(set=>{const buttons=qa('[data-tab-src]',set),image=q('[data-tab-image]',set),caption=q('[data-tab-caption]',set);buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>{const on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});if(!image)return;image.style.opacity='.2';setTimeout(()=>{image.src=btn.dataset.tabSrc||'';image.alt=btn.dataset.tabCaption||'Technical drawing';if(caption)caption.textContent=btn.dataset.tabCaption||'';image.style.opacity='1'},100)}))});
})();
