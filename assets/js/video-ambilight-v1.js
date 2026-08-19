/* DATA C0RE ambient runtime v17 — white-safe chroma recovery with stronger coloured light. */
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
  canvas.width = 30;
  canvas.height = 18;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const states = new Map();
  let layer = null;
  let timer = 0;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const mix = (a, b, t) => a + (b - a) * t;

  const pointSets = (() => {
    const w = canvas.width, h = canvas.height;
    const left = [], right = [], top = [], bottom = [];
    for (let y = 1; y < h - 1; y++) {
      left.push([0,y],[0,y],[1,y],[2,y]);
      right.push([w-1,y],[w-1,y],[w-2,y],[w-3,y]);
    }
    for (let x = 1; x < w - 1; x++) {
      top.push([x,0],[x,0],[x,1],[x,2]);
      bottom.push([x,h-1],[x,h-1],[x,h-2],[x,h-3]);
    }
    return { left, right, top, bottom };
  })();

  const toneChromatic = input => {
    let [r,g,b] = input;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    if (max <= 0) return [0,0,0];
    const mid = (max + min) * .5;
    const boost = 1.12;
    r = clamp(r + (r-mid)*boost, 0, 255);
    g = clamp(g + (g-mid)*boost, 0, 255);
    b = clamp(b + (b-mid)*boost, 0, 255);
    max = Math.max(r,g,b);
    if (max > 176) {
      const s = 176 / max; r*=s; g*=s; b*=s;
    } else if (max < 94) {
      const s = 94 / Math.max(max,1); r*=s; g*=s; b*=s;
    }
    return [Math.round(r),Math.round(g),Math.round(b)];
  };

  const analyseEdge = (data, points) => {
    let chromaR=0, chromaG=0, chromaB=0, chromaW=0;
    let chromaCount=0, chromaSat=0, neutralCount=0;

    for (const [x,y] of points) {
      const i=(y*canvas.width+x)*4;
      const rr=data[i], gg=data[i+1], bb=data[i+2];
      const max=Math.max(rr,gg,bb), min=Math.min(rr,gg,bb);
      const span=max-min;
      const sat=max>0?span/max:0;
      const lum=(rr*.2126+gg*.7152+bb*.0722)/255;

      const nearWhite = lum>.72 && sat<.16;
      const paleNeutral = lum>.56 && sat<.14;
      const lowChroma = sat<.11 || span<11;
      const veryBrightWeakColour = lum>.84 && sat<.24;
      const neutral = nearWhite || paleNeutral || lowChroma || veryBrightWeakColour;
      if (neutral) neutralCount++;

      const chromatic = !neutral && (
        (sat>=.16 && span>=14) ||
        (lum<.48 && sat>=.12 && span>=12)
      );

      if (chromatic) {
        const cw=.46 + sat*3.05 + Math.min(lum,.72)*.38;
        chromaR+=rr*cw; chromaG+=gg*cw; chromaB+=bb*cw; chromaW+=cw;
        chromaCount++;
        chromaSat+=sat;
      }
    }

    const total=Math.max(points.length,1);
    const chromaRatio=chromaCount/total;
    const neutralRatio=neutralCount/total;
    const avgChroma=chromaCount?chromaSat/chromaCount:0;

    if (!chromaW || chromaRatio < .02) {
      return { colour:[0,0,0], energy:0, neutral:true };
    }

    const colour=[chromaR/chromaW,chromaG/chromaW,chromaB/chromaW];
    let energy=(Math.max(0,avgChroma-.08)*.88) + Math.sqrt(chromaRatio)*.68;
    energy*=clamp(1-neutralRatio*.20,.72,1);
    if (chromaRatio<.055 && avgChroma<.30) energy*=.78;
    energy=clamp(energy,.11,1);

    return { colour:toneChromatic(colour), energy, neutral:false };
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

  const mediaRect=media=>{
    const rect=media.getBoundingClientRect();
    const [iw,ih]=intrinsicSize(media);
    if(!rect.width||!rect.height||!iw||!ih)return rect;
    const fit=getComputedStyle(media).objectFit||'fill';
    if(fit==='cover'||fit==='fill')return rect;
    const sourceRatio=iw/ih, boxRatio=rect.width/rect.height;
    let width=rect.width,height=rect.height;
    if(sourceRatio>boxRatio)height=width/sourceRatio;else width=height*sourceRatio;
    return {left:rect.left+(rect.width-width)*.5,right:rect.left+(rect.width+width)*.5,top:rect.top+(rect.height-height)*.5,bottom:rect.top+(rect.height+height)*.5,width,height};
  };

  const drawVisibleFrame=media=>{
    const [iw,ih]=intrinsicSize(media);
    const rect=media.getBoundingClientRect();
    const fit=getComputedStyle(media).objectFit||'fill';
    let sx=0,sy=0,sw=iw,sh=ih;
    if(fit==='cover'&&rect.width>0&&rect.height>0){
      const sourceRatio=iw/ih,boxRatio=rect.width/rect.height;
      if(sourceRatio>boxRatio){sw=ih*boxRatio;sx=(iw-sw)*.5}else{sh=iw/boxRatio;sy=(ih-sh)*.5}
    }
    ctx.drawImage(media,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
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
    const crowdFactor=activeCount>=5?.70:activeCount===4?.77:activeCount===3?.85:activeCount===2?.94:1;
    const colourStrength=clamp(.30+state.energy*1.02,.26,1.04);
    const base=state.kind==='image'?.58:.70;
    const strength=clamp((base+state.ratio*.17+Math.min(viewportShare,.52)*.23)*crowdFactor*colourStrength,.05,.90);
    setNumber(state.emitter,'--amb-strength',strength);
  };

  const videoIsActive=(video,state)=>Boolean(state.visible&&!state.unavailable&&!video.paused&&!video.ended&&video.readyState>=2&&video.videoWidth&&video.videoHeight);
  const imageIsActive=(img,state)=>{
    if(!state.visible||state.unavailable||!img.complete||!img.naturalWidth||!img.naturalHeight)return false;
    const rect=img.getBoundingClientRect();
    return rect.width>=110&&rect.height>=75&&rect.width*rect.height>=18000;
  };

  const sample=(media,state)=>{
    try{
      drawVisibleFrame(media);
      const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const next={left:analyseEdge(data,pointSets.left),right:analyseEdge(data,pointSets.right),top:analyseEdge(data,pointSets.top),bottom:analyseEdge(data,pointSets.bottom)};
      let energy=0;
      let activeEdges=0;
      for(const key of Object.keys(next)){
        if(next[key].neutral||next[key].energy===0){
          state.edgeEnergy[key]=0;
          state.colours[key]=[0,0,0];
          setColour(state.emitter,`--page-amb-${key}`,[0,0,0]);
          setNumber(state.emitter,`--amb-energy-${key}`,0);
          continue;
        }
        const amount=state.kind==='image'?.68:.42;
        state.colours[key]=next[key].colour.map((v,n)=>Math.round(mix(state.colours[key][n],v,amount)));
        state.edgeEnergy[key]=mix(state.edgeEnergy[key],next[key].energy,state.kind==='image'?.80:.52);
        energy+=state.edgeEnergy[key];
        activeEdges++;
        const edgeScale=clamp(.82+state.edgeEnergy[key]*.26,.82,1.08);
        const displayColour=state.colours[key].map(v=>Math.round(clamp(v*edgeScale,0,255)));
        setColour(state.emitter,`--page-amb-${key}`,displayColour);
        setNumber(state.emitter,`--amb-energy-${key}`,state.edgeEnergy[key]);
      }
      state.energy=activeEdges?energy/activeEdges:0;
      state.emitter.classList.toggle('is-active',state.energy>.008);
      return true;
    }catch{
      state.unavailable=true;
      state.emitter.classList.remove('is-active');
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

  const shouldAutoResume=video=>{
    if(!video.muted||video.dataset.perfDetached==='true')return false;
    if(video.matches('[data-hover-preview-video],[data-work-preview-video],.archive-entry-media video'))return false;
    return video.loop||video.autoplay||video.matches('[data-stagger-video],[data-lumina-experience],[data-lazy-video]');
  };
  const resumeVideo=(video,state)=>{
    if(document.hidden||!state.visible||!shouldAutoResume(video))return;
    const before=video.currentTime;
    video.play().catch(()=>{});
    setTimeout(()=>{
      if(document.hidden||!state.visible||video.paused||!shouldAutoResume(video))return;
      if(Math.abs(video.currentTime-before)>.025)return;
      video.pause();requestAnimationFrame(()=>video.play().catch(()=>{}));
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
  const makeState=(kind,emitter)=>({kind,visible:false,ratio:0,unavailable:false,emitter,lastSample:kind==='image'?-Infinity:0,energy:0,colours:{left:[0,0,0],right:[0,0,0],top:[0,0,0],bottom:[0,0,0]},edgeEnergy:{left:0,right:0,top:0,bottom:0}});

  const attachVideo=video=>{
    if(!(video instanceof HTMLVideoElement)||states.has(video))return;
    const state=makeState('video',makeEmitter('video'));states.set(video,state);
    const observer=new IntersectionObserver(entries=>{
      const entry=entries[0];state.visible=Boolean(entry?.isIntersecting&&entry.intersectionRatio>.015);state.ratio=entry?.intersectionRatio||0;
      if(state.visible&&!document.hidden&&video.paused&&shouldAutoResume(video))video.play().catch(()=>{});wake();
    },{rootMargin:'100px 0px',threshold:[0,.015,.1,.25,.5,.75,1]});
    observer.observe(video);
    ['playing','play','pause','ended','emptied','loadeddata'].forEach(type=>video.addEventListener(type,wake,{passive:true}));
  };

  const imageRejected=img=>{
    const src=`${img.currentSrc||img.src||''}`.toLowerCase();
    if(/\.(svg)(?:\?|$)/.test(src))return true;
    if(/(logo|favicon|icon|sprite|avatar|qr|og-cover)/.test(src))return true;
    if(img.closest('.site-header,.site-menu,.lumina-tech-grid,.lumina-plan-modal,.tech-viewer,[data-lumina-plan-card]'))return true;
    return false;
  };
  const attachImage=img=>{
    if(!(img instanceof HTMLImageElement)||states.has(img)||imageRejected(img))return;
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
      if(document.hidden){if(timer)clearTimeout(timer);timer=0;return}
      requestAnimationFrame(resumeVisibleVideos);setTimeout(resumeVisibleVideos,180);
    });
    wake();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();