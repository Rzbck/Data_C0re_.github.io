/* DATA C0RE ambient runtime v20 — contour chroma, cross-origin safe, archive-aware, LUMINA workshop-safe. */
(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const videoInterval = saveData ? 320 : coarse ? 190 : 120;
  const imageInterval = saveData ? 12000 : 5000;
  const canvas = document.createElement('canvas');
  const CANVAS_W = 30;
  const CANVAS_H = 18;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const states = new Map();
  let layer = null;
  let timer = 0;
  const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
  const mix = (a,b,t)=>a+(b-a)*t;

  const resetCanvas = () => {
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
  };

  const pointSets = (() => {
    const left=[],right=[],top=[],bottom=[];
    for(let y=1;y<CANVAS_H-1;y++){
      left.push([0,y],[0,y],[1,y],[2,y]);
      right.push([CANVAS_W-1,y],[CANVAS_W-1,y],[CANVAS_W-2,y],[CANVAS_W-3,y]);
    }
    for(let x=1;x<CANVAS_W-1;x++){
      top.push([x,0],[x,0],[x,1],[x,2]);
      bottom.push([x,CANVAS_H-1],[x,CANVAS_H-1],[x,CANVAS_H-2],[x,CANVAS_H-3]);
    }
    return {left,right,top,bottom};
  })();

  const toneChromatic = input => {
    let [r,g,b]=input;
    let max=Math.max(r,g,b),min=Math.min(r,g,b);
    if(max<=0)return [0,0,0];
    const mid=(max+min)*.5;
    const boost=1.36;
    r=clamp(r+(r-mid)*boost,0,255);
    g=clamp(g+(g-mid)*boost,0,255);
    b=clamp(b+(b-mid)*boost,0,255);

    max=Math.max(r,g,b);
    if(max<96){const s=96/Math.max(max,1);r*=s;g*=s;b*=s}
    const luma=r*.2126+g*.7152+b*.0722;
    if(luma>94){const s=94/luma;r*=s;g*=s;b*=s}
    max=Math.max(r,g,b);
    if(max>190){const s=190/max;r*=s;g*=s;b*=s}
    return [Math.round(r),Math.round(g),Math.round(b)];
  };

  const analyseEdge = (data,points) => {
    let chromaR=0,chromaG=0,chromaB=0,chromaW=0;
    let chromaCount=0,chromaSat=0,vividCount=0;

    for(const [x,y] of points){
      const i=(y*CANVAS_W+x)*4;
      const rr=data[i],gg=data[i+1],bb=data[i+2];
      const max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb);
      const span=max-min;
      const sat=max>0?span/max:0;
      const lum=(rr*.2126+gg*.7152+bb*.0722)/255;

      const nearWhite=lum>.62&&sat<.25;
      const paleNeutral=lum>.46&&sat<.14;
      const lowChroma=sat<.11||span<13;
      const brightWeak=lum>.80&&sat<.34;
      const neutral=nearWhite||paleNeutral||lowChroma||brightWeak;
      const chromatic=!neutral&&((sat>=.16&&span>=15)||(lum<.46&&sat>=.13&&span>=13));
      if(!chromatic)continue;

      const vivid=sat>=.42||span>=56;
      const w=(.48+sat*3.3+Math.min(lum,.70)*.34)*(vivid?1.2:1);
      chromaR+=rr*w;chromaG+=gg*w;chromaB+=bb*w;chromaW+=w;
      chromaCount++;chromaSat+=sat;if(vivid)vividCount++;
    }

    const total=Math.max(points.length,1);
    const chromaRatio=chromaCount/total;
    const vividRatio=vividCount/total;
    const avgChroma=chromaCount?chromaSat/chromaCount:0;
    if(!chromaW||chromaRatio<.018)return {colour:[0,0,0],energy:0,neutral:true};

    const colour=[chromaR/chromaW,chromaG/chromaW,chromaB/chromaW];
    let energy=(Math.max(0,avgChroma-.07)*1.02)+Math.sqrt(chromaRatio)*.78+Math.sqrt(vividRatio)*.28;
    if(chromaRatio<.045&&avgChroma<.30)energy*=.72;
    energy=clamp(energy,.08,1.08);
    return {colour:toneChromatic(colour),energy,neutral:false};
  };

  const ensureLayer=()=>{
    if(layer?.isConnected)return layer;
    layer=document.createElement('div');
    layer.className='video-ambient-field';
    layer.setAttribute('aria-hidden','true');
    document.body.appendChild(layer);
    return layer;
  };
  const setColour=(emitter,name,c)=>emitter.style.setProperty(name,`${c[0]} ${c[1]} ${c[2]}`);
  const setNumber=(emitter,name,v)=>emitter.style.setProperty(name,Number(v).toFixed(3));
  const setPosition=(emitter,name,v)=>emitter.style.setProperty(name,`${Math.round(v)}px`);
  const intrinsicSize=media=>media instanceof HTMLVideoElement?[media.videoWidth,media.videoHeight]:[media.naturalWidth,media.naturalHeight];

  const mediaSource=media=>media instanceof HTMLVideoElement?(media.currentSrc||media.src||''):(media.currentSrc||media.src||'');
  const sourceIsSampleSafe=media=>{
    const src=mediaSource(media);
    if(!src)return true;
    try{
      const url=new URL(src,document.baseURI);
      return url.protocol==='data:'||url.protocol==='blob:'||url.origin===location.origin;
    }catch{return false}
  };

  const mediaRejected=media=>{
    const src=`${mediaSource(media)}`.toLowerCase();
    if(/\.(svg)(?:\?|$)/.test(src))return true;
    if(/(logo|favicon|icon|sprite|avatar|qr|og-cover)/.test(src))return true;
    if(media.closest('.site-header,.site-menu,.lumina-tech-grid,.lumina-plan-modal,.tech-viewer,[data-lumina-plan-card]'))return true;
    /* These three workshop clips are intentionally excluded: their dominant skin/wood/white
       content produces exactly the cream page wash that conflicts with the white typography. */
    if(media.closest('.lumina-workshop .fabrication-grid,[data-fabrication-grid]'))return true;
    if(/assets\/media\/lumina\/fabrication-(profile|led|wiring)\./.test(src))return true;
    return false;
  };

  const archiveMediaActive=media=>{
    const entry=media.closest('.archive-entry');
    if(!entry)return true;
    if(!entry.classList.contains('is-media-active'))return false;
    if(media instanceof HTMLVideoElement)return entry.classList.contains('has-archive-video');
    return !entry.classList.contains('has-archive-video');
  };

  const mediaRect=media=>{
    const rect=media.getBoundingClientRect();
    const [iw,ih]=intrinsicSize(media);
    if(!rect.width||!rect.height||!iw||!ih)return rect;
    const fit=getComputedStyle(media).objectFit||'fill';
    if(fit==='cover'||fit==='fill')return rect;
    const sourceRatio=iw/ih,boxRatio=rect.width/rect.height;
    let width=rect.width,height=rect.height;
    if(sourceRatio>boxRatio)height=width/sourceRatio;else width=height*sourceRatio;
    return {left:rect.left+(rect.width-width)*.5,right:rect.left+(rect.width+width)*.5,top:rect.top+(rect.height-height)*.5,bottom:rect.top+(rect.height+height)*.5,width,height};
  };

  const drawVisibleFrame=media=>{
    resetCanvas();
    const [iw,ih]=intrinsicSize(media);
    const rect=media.getBoundingClientRect();
    const fit=getComputedStyle(media).objectFit||'fill';
    let sx=0,sy=0,sw=iw,sh=ih;
    if(fit==='cover'&&rect.width>0&&rect.height>0){
      const sourceRatio=iw/ih,boxRatio=rect.width/rect.height;
      if(sourceRatio>boxRatio){sw=ih*boxRatio;sx=(iw-sw)*.5}else{sh=iw/boxRatio;sy=(ih-sh)*.5}
    }
    ctx.drawImage(media,sx,sy,sw,sh,0,0,CANVAS_W,CANVAS_H);
  };

  const updateGeometry=(media,state,activeCount)=>{
    const rect=mediaRect(media);
    const left=clamp(rect.left,0,innerWidth),right=clamp(rect.right,0,innerWidth),top=clamp(rect.top,0,innerHeight),bottom=clamp(rect.bottom,0,innerHeight);
    const width=Math.max(1,right-left),height=Math.max(1,bottom-top);
    setPosition(state.emitter,'--amb-source-left',left+Math.min(3,width*.012));
    setPosition(state.emitter,'--amb-source-right',right-Math.min(3,width*.012));
    setPosition(state.emitter,'--amb-source-top',top+Math.min(3,height*.018));
    setPosition(state.emitter,'--amb-source-bottom',bottom-Math.min(3,height*.018));
    setPosition(state.emitter,'--amb-source-x',left+width*.5);
    setPosition(state.emitter,'--amb-source-y',top+height*.5);
    const visibleW=Math.max(0,Math.min(rect.right,innerWidth)-Math.max(rect.left,0));
    const visibleH=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));
    const viewportShare=(visibleW*visibleH)/Math.max(innerWidth*innerHeight,1);
    const crowdFactor=activeCount>=5?.70:activeCount===4?.78:activeCount===3?.87:activeCount===2?.95:1;
    const colourStrength=clamp(.31+state.energy*1.08,.24,1.05);
    const base=state.kind==='image'?.60:.72;
    const strength=clamp((base+state.ratio*.17+Math.min(viewportShare,.52)*.23)*crowdFactor*colourStrength,.035,.90);
    setNumber(state.emitter,'--amb-strength',strength);
  };

  const videoIsActive=(video,state)=>Boolean(
    state.visible&&!state.unavailable&&!mediaRejected(video)&&archiveMediaActive(video)&&sourceIsSampleSafe(video)&&
    !video.paused&&!video.ended&&video.readyState>=2&&video.videoWidth&&video.videoHeight
  );

  const imageIsActive=(img,state)=>{
    if(!state.visible||state.unavailable||mediaRejected(img)||!archiveMediaActive(img)||!sourceIsSampleSafe(img)||!img.complete||!img.naturalWidth||!img.naturalHeight)return false;
    const style=getComputedStyle(img);
    if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity||1)<.04)return false;
    const rect=img.getBoundingClientRect();
    return rect.width>=110&&rect.height>=75&&rect.width*rect.height>=18000;
  };

  const clearEmitter=state=>{
    state.energy=0;
    for(const key of ['left','right','top','bottom']){
      state.edgeEnergy[key]=0;state.colours[key]=[0,0,0];
      setColour(state.emitter,`--page-amb-${key}`,[0,0,0]);
      setNumber(state.emitter,`--amb-energy-${key}`,0);
    }
    state.emitter.classList.remove('is-active');
  };

  const sample=(media,state)=>{
    if(!sourceIsSampleSafe(media)||mediaRejected(media)||!archiveMediaActive(media)){clearEmitter(state);return false}
    try{
      drawVisibleFrame(media);
      const data=ctx.getImageData(0,0,CANVAS_W,CANVAS_H).data;
      const next={left:analyseEdge(data,pointSets.left),right:analyseEdge(data,pointSets.right),top:analyseEdge(data,pointSets.top),bottom:analyseEdge(data,pointSets.bottom)};
      let energy=0,activeEdges=0;
      for(const key of Object.keys(next)){
        if(next[key].neutral||next[key].energy===0){
          state.edgeEnergy[key]=0;state.colours[key]=[0,0,0];
          setColour(state.emitter,`--page-amb-${key}`,[0,0,0]);
          setNumber(state.emitter,`--amb-energy-${key}`,0);
          continue;
        }
        const amount=state.kind==='image'?.68:.42;
        state.colours[key]=next[key].colour.map((v,n)=>Math.round(mix(state.colours[key][n],v,amount)));
        state.edgeEnergy[key]=mix(state.edgeEnergy[key],next[key].energy,state.kind==='image'?.80:.52);
        energy+=state.edgeEnergy[key];activeEdges++;
        const edgeScale=clamp(.90+state.edgeEnergy[key]*.20,.90,1.08);
        const displayColour=state.colours[key].map(v=>Math.round(clamp(v*edgeScale,0,255)));
        setColour(state.emitter,`--page-amb-${key}`,displayColour);
        setNumber(state.emitter,`--amb-energy-${key}`,state.edgeEnergy[key]);
      }
      state.energy=activeEdges?energy/activeEdges:0;
      state.emitter.classList.toggle('is-active',state.energy>.008);
      return true;
    }catch{
      /* A foreign image must never poison the shared sampler for everything below it.
         Resetting the canvas restores origin-clean state and we retry other media normally. */
      resetCanvas();
      clearEmitter(state);
      return false;
    }
  };

  const schedule=(delay=videoInterval)=>{
    if(timer||document.hidden)return;
    timer=setTimeout(()=>{timer=0;requestAnimationFrame(tick)},delay);
  };

  const tick=now=>{
    if(document.hidden)return;
    const active=[];
    for(const [media,state] of states){
      const on=state.kind==='video'?videoIsActive(media,state):imageIsActive(media,state);
      if(on)active.push([media,state]);else state.emitter.classList.remove('is-active');
    }
    if(!active.length){document.body?.classList.remove('video-page-ambient-active');return}
    document.body?.classList.add('video-page-ambient','video-page-ambient-active');
    for(const [media,state] of active){
      const due=state.kind==='video'?videoInterval:imageInterval;
      if(now-state.lastSample>=due){state.lastSample=now;sample(media,state)}
      updateGeometry(media,state,active.length);
    }
    schedule();
  };
  const wake=()=>schedule(0);

  const previewSelector='[data-hover-preview-video],[data-work-preview-video],.archive-entry-media video';
  const shouldAutoResume=video=>{
    if(!video.muted||video.dataset.perfDetached==='true'||mediaRejected(video))return false;
    if(video.matches(previewSelector))return false;
    return video.loop||video.autoplay||video.matches('[data-stagger-video],[data-lumina-experience],[data-lazy-video]');
  };
  const hoveredPreview=video=>{
    if(!video.matches(previewSelector))return false;
    const host=video.closest('.archive-entry,[data-archive-project],[data-work-card],[data-project-card],a');
    try{return Boolean(host&&host.matches(':hover'))}catch{return false}
  };
  const resumeVideo=(video,state)=>{
    const force=Boolean(state.resumeAfterVisibility||hoveredPreview(video));
    const allowed=force||shouldAutoResume(video);
    if(document.hidden||!state.visible||!allowed)return;
    const before=video.currentTime;
    Promise.resolve(video.play()).then(()=>{state.lastKnownPlaying=true;state.lastPlayingAt=performance.now();state.resumeAfterVisibility=false;wake()}).catch(()=>{});
    setTimeout(()=>{
      const stillAllowed=state.resumeAfterVisibility||hoveredPreview(video)||shouldAutoResume(video);
      if(document.hidden||!state.visible||video.paused||!stillAllowed)return;
      if(Math.abs(video.currentTime-before)>.025)return;
      video.pause();requestAnimationFrame(()=>video.play().then(()=>{state.lastKnownPlaying=true;state.lastPlayingAt=performance.now();state.resumeAfterVisibility=false;wake()}).catch(()=>{}));
    },420);
  };
  const resumeVisibleVideos=()=>{
    if(document.hidden)return;
    for(const [media,state] of states)if(state.kind==='video')resumeVideo(media,state);
    wake();setTimeout(wake,180);
  };

  const makeEmitter=kind=>{
    const emitter=document.createElement('div');
    emitter.className='video-ambient-emitter';
    if(kind==='image'){
      emitter.dataset.static='true';
      emitter.style.setProperty('--amb-drift-duration',`${16+Math.random()*10}s`);
      emitter.style.setProperty('--amb-drift-delay',`${-Math.random()*12}s`);
    }
    ensureLayer().appendChild(emitter);return emitter;
  };
  const makeState=(kind,emitter)=>({kind,visible:false,ratio:0,unavailable:false,emitter,lastSample:kind==='image'?-Infinity:0,energy:0,lastKnownPlaying:false,lastPlayingAt:0,resumeAfterVisibility:false,colours:{left:[0,0,0],right:[0,0,0],top:[0,0,0],bottom:[0,0,0]},edgeEnergy:{left:0,right:0,top:0,bottom:0}});

  const attachVideo=video=>{
    if(!(video instanceof HTMLVideoElement)||states.has(video)||mediaRejected(video))return;
    const state=makeState('video',makeEmitter('video'));states.set(video,state);
    const observer=new IntersectionObserver(entries=>{
      const entry=entries[0];state.visible=Boolean(entry?.isIntersecting&&entry.intersectionRatio>.015);state.ratio=entry?.intersectionRatio||0;
      if(state.visible&&!document.hidden&&video.paused&&shouldAutoResume(video))video.play().catch(()=>{});wake();
    },{rootMargin:'100px 0px',threshold:[0,.015,.1,.25,.5,.75,1]});
    observer.observe(video);
    video.addEventListener('play',()=>{state.lastKnownPlaying=true;state.lastPlayingAt=performance.now();wake()},{passive:true});
    video.addEventListener('playing',()=>{state.lastKnownPlaying=true;state.lastPlayingAt=performance.now();wake()},{passive:true});
    video.addEventListener('timeupdate',()=>{if(!video.paused){state.lastKnownPlaying=true;state.lastPlayingAt=performance.now()}},{passive:true});
    video.addEventListener('pause',()=>{if(!document.hidden&&!state.resumeAfterVisibility)state.lastKnownPlaying=false;wake()},{passive:true});
    video.addEventListener('ended',()=>{state.lastKnownPlaying=false;state.resumeAfterVisibility=false;wake()},{passive:true});
    ['emptied','loadeddata'].forEach(type=>video.addEventListener(type,()=>{state.unavailable=false;wake()},{passive:true}));
  };

  const attachImage=img=>{
    if(!(img instanceof HTMLImageElement)||states.has(img)||mediaRejected(img))return;
    const state=makeState('image',makeEmitter('image'));states.set(img,state);
    const observer=new IntersectionObserver(entries=>{
      const entry=entries[0];state.visible=Boolean(entry?.isIntersecting&&entry.intersectionRatio>.025);state.ratio=entry?.intersectionRatio||0;
      if(state.visible)state.lastSample=-Infinity;wake();
    },{rootMargin:'120px 0px',threshold:[0,.025,.1,.25,.5,.75,1]});
    observer.observe(img);
    img.addEventListener('load',()=>{state.unavailable=false;state.lastSample=-Infinity;wake()},{passive:true});
  };

  const scan=rootNode=>{
    if(rootNode instanceof HTMLVideoElement)attachVideo(rootNode);else if(rootNode instanceof HTMLImageElement)attachImage(rootNode);
    rootNode.querySelectorAll?.('video').forEach(attachVideo);rootNode.querySelectorAll?.('img').forEach(attachImage);
  };

  const boot=()=>{
    document.body?.classList.add('video-page-ambient');ensureLayer();scan(document);
    new MutationObserver(mutations=>{for(const mutation of mutations)mutation.addedNodes.forEach(node=>{if(node instanceof Element)scan(node)})}).observe(document.documentElement,{childList:true,subtree:true});
    addEventListener('resize',wake,{passive:true});addEventListener('scroll',wake,{passive:true});
    addEventListener('focus',()=>setTimeout(resumeVisibleVideos,40),{passive:true});addEventListener('pageshow',()=>setTimeout(resumeVisibleVideos,40),{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        const now=performance.now();
        for(const [media,state] of states){if(state.kind==='video')state.resumeAfterVisibility=Boolean(state.visible&&(state.lastKnownPlaying||!media.paused||(now-state.lastPlayingAt)<1600))}
        if(timer)clearTimeout(timer);timer=0;return;
      }
      resetCanvas();requestAnimationFrame(resumeVisibleVideos);setTimeout(resumeVisibleVideos,180);
    });
    wake();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();