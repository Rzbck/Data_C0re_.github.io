(() => {
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const filename=location.pathname.endsWith('/')?'index.html':location.pathname.split('/').pop();
  if(filename==='about.html')return;
  if(window.matchMedia('(max-width:820px), (pointer:coarse)').matches)return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href=new URL('assets/css/fullpage.css?v=20260815-2',document.baseURI).href;
  document.head.appendChild(css);

  const pageClass=filename.replace(/\.html$/,'').replace(/[^a-z0-9-]/gi,'-');
  const body=document.body;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopEligible=()=>window.matchMedia('(min-width:821px) and (pointer:fine)').matches&&!reduce.matches;
  const touchEligible=()=>false;

  let panels=[];
  if(filename==='index.html'){
    body.classList.add('fullpage-index');
    const compactPanels=qa('main > .home-compact-v3 > .home-compact-v3__panel');
    panels=[q('main > .hero'),...(compactPanels.length?compactPanels:qa('main > .home-statement,main > .home-work,main > .home-direction'))].filter(Boolean);
  }else if(filename==='work.html'){
    body.classList.add('fullpage-work');
    panels=qa('main > .page-intro,main > .work-screen');
  }else if(filename==='lab.html'){
    body.classList.add('fullpage-lab');
    panels=qa('main > .page-intro,main > .page-section');
  }else if(filename==='cv.html'){
    body.classList.add('fullpage-cv');
    panels=qa('main > .page-intro,main > .cv-section');
  }else if(location.pathname.includes('/projects/')){
    body.classList.add('fullpage-project',`fullpage-${pageClass}`);
    if(filename==='comedie.html'){
      panels=[q('.project-hero'),q('.theatre-lead'),...qa('.production-block')].filter(Boolean);
    }else if(filename==='stage-systems.html'){
      panels=[q('.project-hero'),q('.stage-main-media'),...qa('.stage-study')].filter(Boolean);
    }else if(filename==='grand-theatre.html'){
      panels=[q('.project-hero'),q('.pro-main-media'),...qa('.project-section')].filter(Boolean);
    }else{
      panels=[q('.project-hero'),...qa('.project-section')].filter(Boolean);
    }
  }

  if(panels.length<2)return;
  panels.forEach(panel=>panel.classList.add('fullpage-panel'));
  document.documentElement.classList.add('fullpage-mode');
  body.classList.add('fullpage-nav');

  let current=0,animating=false,wheelGesture=false,wheelQuietTimer=null;
  const clampIndex=index=>Math.max(0,Math.min(panels.length-1,index));
  const panelTop=panel=>panel.getBoundingClientRect().top+window.scrollY;
  const nearestIndex=()=>{
    const center=window.scrollY+window.innerHeight*.5;
    let best=0,bestDistance=Infinity;
    panels.forEach((panel,index)=>{
      const top=panelTop(panel),panelCenter=top+panel.offsetHeight*.5;
      const distance=Math.abs(panelCenter-center);
      if(distance<bestDistance){bestDistance=distance;best=index}
    });
    return best;
  };
  const nearestIndexAt=center=>{
    let best=0,bestDistance=Infinity;
    panels.forEach((panel,index)=>{
      const top=panelTop(panel),panelCenter=top+panel.offsetHeight*.5;
      const distance=Math.abs(panelCenter-center);
      if(distance<bestDistance){bestDistance=distance;best=index}
    });
    return best;
  };
  const setActive=index=>{
    current=clampIndex(index);
    panels.forEach((panel,i)=>panel.classList.toggle('is-fullpage-active',i===current));
  };
  const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const defaultDuration=filename==='comedie.html'?620:880;
  const goTo=(index,duration=defaultDuration)=>{
    index=clampIndex(index);
    if(animating)return;
    const start=window.scrollY,target=panelTop(panels[index]),distance=target-start;
    if(Math.abs(distance)<2){window.scrollTo(0,target);setActive(index);return}
    animating=true;setActive(index);
    const started=performance.now();
    const frame=now=>{
      const t=Math.min(1,(now-started)/duration);
      window.scrollTo(0,start+distance*easeInOut(t));
      if(t<1)requestAnimationFrame(frame);
      else{window.scrollTo(0,target);animating=false}
    };
    requestAnimationFrame(frame);
  };
  const move=direction=>{
    const nearest=nearestIndex();
    const panel=panels[nearest];
    const top=panelTop(panel);
    const deltaFromPanel=window.scrollY-top;
    if(direction<0&&deltaFromPanel>18){goTo(nearest);return true}
    if(direction>0&&deltaFromPanel<-18){goTo(nearest);return true}
    const next=clampIndex(nearest+direction);
    if(next===nearest)return false;
    goTo(next);return true;
  };
  const endWheelGestureSoon=()=>{
    clearTimeout(wheelQuietTimer);
    wheelQuietTimer=setTimeout(()=>{wheelGesture=false},190);
  };

  window.addEventListener('wheel',event=>{
    if(!desktopEligible()||body.classList.contains('menu-open')||event.ctrlKey)return;
    const direction=event.deltaY>0?1:-1;
    if(Math.abs(event.deltaY)<1)return;
    if(animating||wheelGesture){event.preventDefault();endWheelGestureSoon();return}
    const nearest=nearestIndex();
    const firstTop=panelTop(panels[0]);
    const last=panels[panels.length-1],lastTop=panelTop(last);
    const atUpperEdge=nearest===0&&direction<0&&window.scrollY<=firstTop+2;
    const atLowerEdge=nearest===panels.length-1&&direction>0&&window.scrollY>=lastTop-2;
    if(atUpperEdge||atLowerEdge)return;
    event.preventDefault();wheelGesture=true;endWheelGestureSoon();move(direction);
  },{passive:false});

  window.addEventListener('keydown',event=>{
    if(!desktopEligible()||body.classList.contains('menu-open'))return;
    const target=event.target;
    if(target instanceof HTMLElement&&target.matches('input,textarea,select,[contenteditable="true"]'))return;
    let direction=0;
    if(event.key==='ArrowDown'||event.key==='PageDown'||(event.key===' '&&!event.shiftKey))direction=1;
    if(event.key==='ArrowUp'||event.key==='PageUp'||(event.key===' '&&event.shiftKey))direction=-1;
    if(event.key==='Home'){event.preventDefault();if(!event.repeat&&!animating)goTo(0);return}
    if(event.key==='End'){event.preventDefault();if(!event.repeat&&!animating)goTo(panels.length-1);return}
    if(!direction)return;
    const nearest=nearestIndex();
    if((nearest===0&&direction<0)||(nearest===panels.length-1&&direction>0))return;
    event.preventDefault();if(event.repeat||animating)return;move(direction);
  });

  let touchTracking=false,touchStartY=0,touchStartX=0,touchStartScroll=0,touchStartPanel=0;
  const ignoreTouchTarget=target=>target instanceof Element&&Boolean(target.closest('.tech-tabs,.route,input,textarea,select,[contenteditable="true"]'));
  window.addEventListener('touchstart',event=>{
    if(!touchEligible()||body.classList.contains('menu-open')||event.touches.length!==1||ignoreTouchTarget(event.target)){touchTracking=false;return}
    const touch=event.touches[0];
    touchTracking=true;
    touchStartY=touch.clientY;
    touchStartX=touch.clientX;
    touchStartScroll=window.scrollY;
    const touched=event.target instanceof Element?event.target.closest('.fullpage-panel'):null;
    const touchedIndex=touched?panels.indexOf(touched):-1;
    touchStartPanel=touchedIndex>=0?touchedIndex:nearestIndexAt(touchStartScroll+window.innerHeight*.5);
  },{passive:true});

  window.addEventListener('touchend',event=>{
    if(!touchTracking||!touchEligible()||animating){touchTracking=false;return}
    touchTracking=false;
    const touch=event.changedTouches?.[0];
    if(!touch)return;
    const dy=touchStartY-touch.clientY,dx=touchStartX-touch.clientX;
    if(Math.abs(dy)<56||Math.abs(dy)<Math.abs(dx)*1.2)return;
    const direction=dy>0?1:-1;
    const index=clampIndex(touchStartPanel);
    const panel=panels[index];
    const top=panelTop(panel),bottom=top+panel.offsetHeight;
    const viewTop=window.scrollY,viewBottom=viewTop+window.innerHeight;
    const fits=panel.offsetHeight<=window.innerHeight*1.12;
    const edge=Math.max(28,Math.min(84,window.innerHeight*.09));
    let shouldSnap=fits;
    if(!fits&&direction>0)shouldSnap=viewBottom>=bottom-edge;
    if(!fits&&direction<0)shouldSnap=viewTop<=top+edge;
    if(!shouldSnap)return;
    const next=clampIndex(index+direction);
    if(next===index)return;
    requestAnimationFrame(()=>goTo(next,560));
  },{passive:true});

  let scrollTick=false;
  window.addEventListener('scroll',()=>{
    if(animating||scrollTick)return;
    scrollTick=true;
    requestAnimationFrame(()=>{setActive(nearestIndex());scrollTick=false});
  },{passive:true});

  const syncMode=()=>{
    current=nearestIndex();setActive(current);
    if(desktopEligible()&&!animating){
      const panel=panels[current];
      const distance=Math.abs(window.scrollY-panelTop(panel));
      if(distance<window.innerHeight*.45)window.scrollTo(0,panelTop(panel));
    }
  };
  window.addEventListener('resize',syncMode,{passive:true});
  reduce.addEventListener?.('change',syncMode);
  requestAnimationFrame(syncMode);

  if(filename==='work.html'){
    const randomStart=video=>{
      const duration=video.duration;if(!Number.isFinite(duration)||duration<=.6)return;
      const edge=Math.min(1.5,duration*.06),max=Math.max(edge,duration-Math.min(2,duration*.08));
      try{video.currentTime=edge+Math.random()*Math.max(.01,max-edge)}catch{}
    };
    qa('.work-screen .index-browser').forEach(browser=>{
      const stage=q('[data-work-preview-stage]',browser),poster=stage&&q('img[data-work-preview-poster]',stage),video=stage&&q('video[data-work-preview-video]',stage);
      if(!stage||!poster||!video)return;
      let token=0;
      const rows=qa('.index-row[data-work-preview-video],.index-row[data-work-preview-videos]',browser);
      const sources=row=>(row.dataset.workPreviewVideos||row.dataset.workPreviewVideo||'').split('|').map(v=>v.trim()).filter(Boolean);
      const activate=row=>{
        const posterSrc=row.dataset.workPreviewPoster||'',list=sources(row),src=list[Math.floor(Math.random()*Math.max(1,list.length))]||'',localToken=++token;
        if(posterSrc&&poster.getAttribute('src')!==posterSrc)poster.src=posterSrc;
        stage.classList.add('is-changing');stage.classList.remove('has-video');
        if(!src){video.pause();stage.classList.remove('is-changing');return}
        const reveal=()=>{
          if(localToken!==token)return;randomStart(video);
          const done=()=>{if(localToken!==token)return;stage.classList.remove('is-changing');stage.classList.add('has-video');video.play().catch(()=>{})};
          if(video.seeking)video.addEventListener('seeked',done,{once:true});else requestAnimationFrame(done);
        };
        video.pause();video.src=src;video.load();
        if(video.readyState>=1)reveal();else video.addEventListener('loadedmetadata',reveal,{once:true});
      };
      rows.forEach(row=>{row.addEventListener('mouseenter',()=>activate(row));row.addEventListener('focus',()=>activate(row))});
    });
  }
})();