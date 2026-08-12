(() => {
  const panelSelector='.about-panel,.fullpage-panel';
  const langButtonSelector='.lang-switcher button[data-lang]';
  const root=document.documentElement;
  const body=document.body;
  let snapshot=null,resizeObserver=null,endTimer=null,timers=[];
  let previousScrollBehavior='',previousOverflowAnchor='';

  const panels=()=>[...document.querySelectorAll(panelSelector)];
  const topOf=panel=>panel.getBoundingClientRect().top+window.scrollY;
  const nearestPanel=()=>{
    const list=panels();
    if(!list.length)return null;
    const center=window.scrollY+window.innerHeight*.5;
    let best=list[0],bestDistance=Infinity;
    list.forEach(panel=>{
      const centerY=topOf(panel)+panel.offsetHeight*.5;
      const distance=Math.abs(centerY-center);
      if(distance<bestDistance){bestDistance=distance;best=panel}
    });
    return best;
  };

  const captureAnchor=()=>{
    const list=panels();
    if(!list.length){snapshot=null;return}
    const panel=nearestPanel();
    if(!panel){snapshot=null;return}
    const top=topOf(panel),height=panel.offsetHeight;
    const maxInside=Math.max(0,height-window.innerHeight);
    const local=Math.max(0,Math.min(maxInside||height,window.scrollY-top));
    snapshot={
      panel,
      index:list.indexOf(panel),
      id:panel.id||'',
      fits:maxInside<=2,
      progress:maxInside>2?local/maxInside:0,
      nearTop:Math.abs(window.scrollY-top)<48
    };
  };

  const resolvePanel=()=>{
    if(snapshot?.panel?.isConnected)return snapshot.panel;
    const list=panels();
    if(!list.length)return null;
    if(snapshot?.id){const byId=document.getElementById(snapshot.id);if(byId&&byId.matches(panelSelector))return byId}
    if(Number.isInteger(snapshot?.index))return list[Math.max(0,Math.min(list.length-1,snapshot.index))]||null;
    return nearestPanel();
  };

  const desktopMagnet=()=>window.matchMedia('(min-width:821px) and (pointer:fine)').matches;
  const syncAnchor=()=>{
    if(!body.classList.contains('language-reflowing'))return;
    const panel=resolvePanel();
    if(!panel)return;
    const top=topOf(panel),maxInside=Math.max(0,panel.offsetHeight-window.innerHeight);
    let target=top;
    if(!desktopMagnet()&&!snapshot?.fits&&!snapshot?.nearTop&&maxInside>2){
      target=top+Math.max(0,Math.min(maxInside,(snapshot?.progress||0)*maxInside));
    }
    window.scrollTo(0,Math.round(target));
    const list=panels(),index=list.indexOf(panel);
    if(index>=0){
      list.forEach((item,i)=>{
        if(item.classList.contains('about-panel'))item.classList.toggle('is-active',i===index);
        if(item.classList.contains('fullpage-panel'))item.classList.toggle('is-fullpage-active',i===index);
      });
    }
  };

  const scheduleSync=delay=>{
    const timer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(syncAnchor)),delay);
    timers.push(timer);
  };

  const finish=()=>{
    if(!body.classList.contains('language-reflowing'))return;
    syncAnchor();
    resizeObserver?.disconnect();resizeObserver=null;
    timers.forEach(clearTimeout);timers=[];
    clearTimeout(endTimer);endTimer=null;
    body.classList.remove('language-reflowing');
    root.style.scrollBehavior=previousScrollBehavior;
    body.style.overflowAnchor=previousOverflowAnchor;
    snapshot=null;
  };

  const begin=()=>{
    if(!snapshot)captureAnchor();
    if(!snapshot)return;
    timers.forEach(clearTimeout);timers=[];
    clearTimeout(endTimer);
    if(!body.classList.contains('language-reflowing')){
      previousScrollBehavior=root.style.scrollBehavior;
      previousOverflowAnchor=body.style.overflowAnchor;
    }
    body.classList.add('language-reflowing');
    root.style.scrollBehavior='auto';
    body.style.overflowAnchor='none';
    resizeObserver?.disconnect();
    resizeObserver=new ResizeObserver(()=>requestAnimationFrame(syncAnchor));
    panels().forEach(panel=>resizeObserver.observe(panel));
    requestAnimationFrame(()=>requestAnimationFrame(syncAnchor));
    [60,140,280,480,720].forEach(scheduleSync);
    endTimer=setTimeout(finish,860);
  };

  // Capture the current magnetic panel before i18n changes any text dimensions.
  document.addEventListener('pointerdown',event=>{
    if(event.target instanceof Element&&event.target.closest(langButtonSelector))captureAnchor();
  },true);
  document.addEventListener('click',event=>{
    if(event.target instanceof Element&&event.target.closest(langButtonSelector)&&!snapshot)captureAnchor();
  },true);

  document.addEventListener('data-c0re-languagechange',begin);

  // Do not let a wheel/key gesture race against the short layout-settling window.
  window.addEventListener('wheel',event=>{
    if(body.classList.contains('language-reflowing'))event.preventDefault();
  },{capture:true,passive:false});
  window.addEventListener('keydown',event=>{
    if(!body.classList.contains('language-reflowing'))return;
    if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))event.preventDefault();
  },true);
})();