(() => {
  const panels=[...document.querySelectorAll('[data-about-panel]')];
  if(panels.length<2)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(pointer:fine)');
  const touchMode=()=>window.matchMedia('(max-width:820px), (pointer:coarse)').matches&&!reduce.matches;
  let tracking=false,startY=0,startX=0,startPanel=-1,animating=false;
  const topOf=panel=>panel.getBoundingClientRect().top+window.scrollY;
  const clamp=i=>Math.max(0,Math.min(panels.length-1,i));
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const animateTo=index=>{
    if(animating)return;
    index=clamp(index);
    const start=window.scrollY,target=topOf(panels[index]),distance=target-start;
    if(Math.abs(distance)<2)return;
    animating=true;
    panels.forEach((panel,i)=>panel.classList.toggle('is-active',i===index));
    const begun=performance.now();
    const frame=now=>{
      const t=Math.min(1,(now-begun)/560);
      window.scrollTo(0,start+distance*ease(t));
      if(t<1)requestAnimationFrame(frame);
      else{window.scrollTo(0,target);animating=false}
    };
    requestAnimationFrame(frame);
  };
  const ignore=target=>target instanceof Element&&Boolean(target.closest('input,textarea,select,[contenteditable="true"],.about-links'));

  window.addEventListener('touchstart',event=>{
    if(!touchMode()||document.body.classList.contains('menu-open')||event.touches.length!==1||ignore(event.target)){tracking=false;return}
    const touched=event.target instanceof Element?event.target.closest('[data-about-panel]'):null;
    const index=touched?panels.indexOf(touched):-1;
    if(index<0){tracking=false;return}
    const touch=event.touches[0];
    tracking=true;startY=touch.clientY;startX=touch.clientX;startPanel=index;
  },{capture:true,passive:true});

  window.addEventListener('touchend',event=>{
    if(!tracking||!touchMode()){tracking=false;return}
    tracking=false;
    event.stopImmediatePropagation();
    if(animating)return;
    const touch=event.changedTouches?.[0];if(!touch)return;
    const dy=startY-touch.clientY,dx=startX-touch.clientX;
    if(Math.abs(dy)<56||Math.abs(dy)<Math.abs(dx)*1.2)return;
    const direction=dy>0?1:-1,index=clamp(startPanel),panel=panels[index];
    const top=topOf(panel),bottom=top+panel.offsetHeight;
    const viewTop=window.scrollY,viewBottom=viewTop+window.innerHeight;
    const fits=panel.offsetHeight<=window.innerHeight*1.12;
    const edge=Math.max(28,Math.min(84,window.innerHeight*.09));
    let snap=fits;
    if(!fits&&direction>0)snap=viewBottom>=bottom-edge;
    if(!fits&&direction<0)snap=viewTop<=top+edge;
    if(!snap)return;
    const next=clamp(index+direction);
    if(next!==index)requestAnimationFrame(()=>animateTo(next));
  },{capture:true,passive:true});

  // Desktop performance: keep the current panel moving, pause the other
  // full-screen backgrounds. Neighbouring panels remain buffered so the
  // visual transition is unchanged when navigation advances.
  const videos=panels.map(panel=>panel.querySelector('[data-about-video]'));
  const syncVideos=()=>{
    if(document.hidden||reduce.matches){videos.forEach(video=>video?.pause());return}
    panels.forEach((panel,index)=>{
      const video=videos[index];if(!video)return;
      const rect=panel.getBoundingClientRect();
      const visible=rect.bottom>0&&rect.top<window.innerHeight;
      video.preload=visible?'auto':'metadata';
      if(visible&&video.dataset.ready==='true')video.play().catch(()=>{});else video.pause();
    });
  };
  let syncRaf=0;
  const queueSync=()=>{if(syncRaf)return;syncRaf=requestAnimationFrame(()=>{syncRaf=0;syncVideos()})};
  const observer=new IntersectionObserver(queueSync,{rootMargin:'10% 0px',threshold:[0,.02]});
  panels.forEach(panel=>observer.observe(panel));
  window.addEventListener('scroll',queueSync,{passive:true});
  window.addEventListener('resize',queueSync,{passive:true});
  window.addEventListener('pageshow',queueSync,{passive:true});
  document.addEventListener('visibilitychange',queueSync);
  reduce.addEventListener?.('change',queueSync);
  fine.addEventListener?.('change',queueSync);
  requestAnimationFrame(()=>requestAnimationFrame(syncVideos));
})();
