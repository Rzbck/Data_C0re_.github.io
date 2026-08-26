(() => {
  'use strict';
  if (window.__DATA_C0RE_ADAPTIVE_PERF_V1__) return;
  window.__DATA_C0RE_ADAPTIVE_PERF_V1__ = true;

  const SESSION_KEY='data-c0re-adaptive-level-v1';
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const nativeSetTimeout=window.setTimeout.bind(window);
  const nativeClearTimeout=window.clearTimeout.bind(window);
  const REPORT_MS=900;
  const BASELINE_SAMPLES=72;

  const LEVELS=[
    {id:0,name:'OFF',target:0,collisionMs:2500,ambilight:false,ambilightMs:0},
    {id:1,name:'SAFE',target:8,collisionMs:900,ambilight:false,ambilightMs:0},
    {id:2,name:'LOW',target:16,collisionMs:500,ambilight:false,ambilightMs:0},
    {id:3,name:'BALANCED',target:26,collisionMs:280,ambilight:true,ambilightMs:340},
    {id:4,name:'HIGH',target:42,collisionMs:150,ambilight:true,ambilightMs:190},
    {id:5,name:'MAX',target:60,collisionMs:72,ambilight:true,ambilightMs:120}
  ];

  const coarse=matchMedia('(pointer:coarse)');
  const memory=Number.isFinite(navigator.deviceMemory)?navigator.deviceMemory:null;
  const cores=navigator.hardwareConcurrency||null;
  const percentile=(values,p)=>{
    if(!values.length)return 0;
    const sorted=[...values].sort((a,b)=>a-b);
    return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*p)))];
  };

  const hintedLevel=()=>{
    let level=coarse.matches?4:5;
    if(cores!==null&&cores<=4)level-=1;
    if(cores!==null&&cores<=2)level-=1;
    if(memory!==null&&memory<=4)level-=1;
    if(memory!==null&&memory<=2)level-=1;
    if(devicePixelRatio>2.5)level-=1;
    return Math.max(1,Math.min(5,level));
  };
  const rememberedLevel=()=>{
    try{
      const n=Number(sessionStorage.getItem(SESSION_KEY));
      return Number.isInteger(n)&&n>=0&&n<=5?n:null;
    }catch{return null;}
  };

  const remembered=rememberedLevel();
  let level=remembered===null?hintedLevel():remembered;
  let lastDownAt=-Infinity;
  let stressedStreak=0;
  let headroomStreak=0;
  let idleRecoveryStreak=0;
  let baselineMs=0;
  let baselineReady=false;
  let baselineSamples=[];
  let frameSamples=[];
  let lastNativeFrame=0;
  let lastReport=performance.now();
  let longTaskMs=0;
  let lastCollisionRAF=-Infinity;
  let shaderPhase=1;
  let ambilightLastRun=-Infinity;
  let ambilightPending=null;
  let ambilightTimer=0;

  const profile=()=>LEVELS[level];
  const refreshHz=()=>baselineReady?Math.max(20,Math.min(240,1000/baselineMs)):60;
  const targetHz=()=>{
    const target=profile().target;
    return target<=0?0:Math.max(6,Math.min(target,refreshHz()));
  };
  const shaderCanvas=()=>document.querySelector('canvas[data-ascii-cursor]');
  const shaderActive=()=>{
    const canvas=shaderCanvas();
    return Boolean(canvas&&(Number.parseFloat(canvas.style.opacity||'0')||0)>.04);
  };
  const ambientActive=()=>document.body?.classList.contains('video-page-ambient-active')||false;
  const meaningfulLoad=()=>shaderActive()||ambientActive();
  const remember=()=>{try{sessionStorage.setItem(SESSION_KEY,String(level));}catch{}};

  const style=document.createElement('style');
  style.dataset.adaptivePerformance='v1';
  style.textContent=`
    html[data-perf-level="OFF"] canvas[data-ascii-cursor]{opacity:0!important;visibility:hidden!important}
    html[data-perf-level="BALANCED"] .video-ambient-emitter[data-static="true"],
    html[data-perf-level="LOW"] .video-ambient-emitter[data-static="true"],
    html[data-perf-level="SAFE"] .video-ambient-emitter[data-static="true"],
    html[data-perf-level="OFF"] .video-ambient-emitter[data-static="true"]{animation:none!important}
    html[data-perf-level="LOW"] .video-ambient-field,
    html[data-perf-level="SAFE"] .video-ambient-field,
    html[data-perf-level="OFF"] .video-ambient-field{display:none!important}
  `;
  document.head.appendChild(style);

  const syncLevel=()=>{
    document.documentElement.dataset.perfLevel=profile().name;
    if(!profile().ambilight){
      if(ambilightTimer)nativeClearTimeout(ambilightTimer);
      ambilightTimer=0;
    }else scheduleAmbilightPending();
  };

  const setLevel=(next,direction)=>{
    next=Math.max(0,Math.min(5,next));
    if(next===level)return;
    level=next;
    shaderPhase=Math.min(shaderPhase,1);
    stressedStreak=0;
    headroomStreak=0;
    idleRecoveryStreak=0;
    if(direction==='down')lastDownAt=performance.now();
    remember();
    syncLevel();
  };

  const callbackCache=new WeakMap();
  const callbackKind=callback=>{
    if(typeof callback!=='function')return 'other';
    if(callbackCache.has(callback))return callbackCache.get(callback);
    let kind='other';
    try{
      const source=Function.prototype.toString.call(callback);
      if(source.includes('simulationPass')&&source.includes('displayPass')&&source.includes('pointer.px'))kind='ascii';
      else if(source.includes('videoIsActive')&&source.includes('updateGeometry')&&source.includes('sample(media,state)'))kind='ambilight';
      else if(source.includes('updateCollision'))kind='collision';
    }catch{}
    callbackCache.set(callback,kind);
    return kind;
  };

  const scheduleAmbilightPending=()=>{
    if(!ambilightPending||!profile().ambilight||ambilightTimer)return;
    const run=now=>{
      ambilightTimer=0;
      if(!ambilightPending||!profile().ambilight)return;
      const remaining=profile().ambilightMs-(now-ambilightLastRun);
      if(remaining>1){
        ambilightTimer=nativeSetTimeout(()=>nativeRAF(run),Math.max(8,remaining));
        return;
      }
      const callback=ambilightPending;
      ambilightPending=null;
      ambilightLastRun=now;
      callback(now);
    };
    nativeRAF(run);
  };

  window.requestAnimationFrame=function(callback){
    const kind=callbackKind(callback);
    if(kind==='other')return nativeRAF(callback);

    if(kind==='collision'){
      const run=now=>{
        const minGap=profile().collisionMs;
        if(now-lastCollisionRAF>=minGap){
          lastCollisionRAF=now;
          callback(now);
        }else nativeSetTimeout(()=>nativeRAF(run),Math.max(8,minGap-(now-lastCollisionRAF)));
      };
      return nativeRAF(run);
    }

    if(kind==='ambilight'){
      ambilightPending=callback;
      if(profile().ambilight)scheduleAmbilightPending();
      return 0;
    }

    const run=now=>{
      const target=targetHz();
      if(target<=0){nativeRAF(run);return;}
      const display=Math.max(20,refreshHz());
      shaderPhase+=Math.min(target,display)/display;
      if(shaderPhase>=1){shaderPhase-=1;callback(now)}else nativeRAF(run);
    };
    return nativeRAF(run);
  };

  window.setTimeout=function(callback,delay,...args){
    if(callbackKind(callback)!=='collision')return nativeSetTimeout(callback,delay,...args);
    const base=Number.isFinite(Number(delay))?Number(delay):0;
    return nativeSetTimeout(callback,Math.max(base,profile().collisionMs),...args);
  };

  const classify=(active,p95,jank,longMs)=>{
    const budget=baselineMs||16.67;
    if(p95>budget*2.15||jank>.30||longMs>130)return 'CRITICAL';
    if(p95>budget*1.55||jank>.14||longMs>55)return 'STRESSED';
    if(active&&p95<=budget*1.22&&jank<=.04&&longMs<22)return 'HEADROOM';
    return active?'STABLE':'IDLE';
  };

  const adapt=(status,now)=>{
    if(status==='CRITICAL'){
      stressedStreak=0;headroomStreak=0;idleRecoveryStreak=0;
      if(level>0)setLevel(level-1,'down');
      return;
    }
    if(status==='STRESSED'){
      stressedStreak+=1;headroomStreak=0;idleRecoveryStreak=0;
      if(stressedStreak>=2&&level>0)setLevel(level-1,'down');
      return;
    }
    stressedStreak=Math.max(0,stressedStreak-1);
    if(status==='HEADROOM'){
      idleRecoveryStreak=0;
      if(now-lastDownAt<15000){headroomStreak=0;return;}
      headroomStreak+=1;
      if(headroomStreak>=15&&level<5)setLevel(level+1,'up');
      return;
    }
    headroomStreak=0;
    if(status==='IDLE'&&level===0){
      idleRecoveryStreak+=1;
      if(idleRecoveryStreak>=28&&now-lastDownAt>=25000)setLevel(1,'up');
    }else idleRecoveryStreak=0;
  };

  if('PerformanceObserver'in window){
    try{
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries())longTaskMs+=entry.duration||0;
      });
      observer.observe({type:'longtask',buffered:false});
    }catch{}
  }

  const lockBaseline=()=>{
    if(baselineReady||baselineSamples.length<BASELINE_SAMPLES)return;
    const clean=baselineSamples.filter(ms=>ms>=3&&ms<=50);
    if(clean.length<36)return;
    const cut=percentile(clean,.55);
    const fast=clean.filter(ms=>ms<=cut);
    baselineMs=Math.max(4,Math.min(40,percentile(fast,.5)||percentile(clean,.25)||16.67));
    baselineReady=true;
  };

  const report=now=>{
    const samples=frameSamples.filter(ms=>ms>=3&&ms<250);
    frameSamples=[];
    if(!samples.length)return;
    const p95=percentile(samples,.95);
    const budget=baselineMs||percentile(samples,.5)||16.67;
    const jank=samples.filter(ms=>ms>budget*1.5).length/samples.length;
    adapt(classify(meaningfulLoad(),p95,jank,longTaskMs),now);
    longTaskMs=0;
    lastReport=now;
  };

  const monitor=now=>{
    if(lastNativeFrame){
      const delta=now-lastNativeFrame;
      if(delta>0&&delta<1000){
        if(!baselineReady&&baselineSamples.length<BASELINE_SAMPLES*2)baselineSamples.push(delta);
        frameSamples.push(delta);
        if(frameSamples.length>360)frameSamples.shift();
      }
    }
    lastNativeFrame=now;
    lockBaseline();
    if(now-lastReport>=REPORT_MS)report(now);
    nativeRAF(monitor);
  };

  syncLevel();
  nativeRAF(monitor);
})();
