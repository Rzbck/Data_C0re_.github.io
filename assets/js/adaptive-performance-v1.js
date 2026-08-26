(() => {
  'use strict';
  if (window.__DATA_C0RE_ADAPTIVE_PERF_V5__) return;
  window.__DATA_C0RE_ADAPTIVE_PERF_V5__ = true;

  const SESSION_KEY='data-c0re-adaptive-v5';
  const OLD_SESSION_KEY='data-c0re-adaptive-level-v1';
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const nativeSetTimeout=window.setTimeout.bind(window);
  const nativeClearTimeout=window.clearTimeout.bind(window);
  const REPORT_MS=800;
  const WARMUP_MS=2200;
  const SCROLL_GRACE_MS=280;
  const PROBE_MS=900;
  const PROBE_IMPROVEMENT=.18;
  const RECOVERY_WINDOWS=14;

  const GLSL=[
    {id:0,name:'OFF',target:0,collisionMs:2200},
    {id:1,name:'SAFE',target:12,collisionMs:900},
    {id:2,name:'LOW',target:22,collisionMs:520},
    {id:3,name:'BALANCED',target:34,collisionMs:300},
    {id:4,name:'HIGH',target:48,collisionMs:170},
    {id:5,name:'MAX',target:60,collisionMs:84}
  ];
  const AMBI=[
    {id:0,name:'OFF',enabled:false,interval:0},
    {id:1,name:'LOW',enabled:true,interval:460},
    {id:2,name:'LIGHT',enabled:true,interval:240},
    {id:3,name:'FULL',enabled:true,interval:120}
  ];

  const coarse=matchMedia('(pointer:coarse)').matches;
  const memory=Number.isFinite(navigator.deviceMemory)?navigator.deviceMemory:null;
  const cores=navigator.hardwareConcurrency||null;

  const percentile=(values,p)=>{
    if(!values.length)return 0;
    const sorted=[...values].sort((a,b)=>a-b);
    return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*p)))];
  };
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  const hinted=()=>{
    let g=5,a=3;
    const veryWeak=(cores!==null&&cores<=2)||(memory!==null&&memory<=2);
    const modest=(cores!==null&&cores<=4)&&(memory!==null&&memory<=4);
    if(veryWeak){g=4;a=2;}
    else if(coarse&&devicePixelRatio>2.5){g=4;a=2;}
    else if(modest&&coarse){g=4;a=3;}
    return {g,a};
  };
  const remembered=()=>{
    try{
      const raw=sessionStorage.getItem(SESSION_KEY);
      if(!raw)return null;
      const value=JSON.parse(raw);
      if(!Number.isInteger(value?.g)||!Number.isInteger(value?.a))return null;
      return {g:clamp(value.g,0,5),a:clamp(value.a,0,3)};
    }catch{return null;}
  };
  try{sessionStorage.removeItem(OLD_SESSION_KEY)}catch{}
  const hint=hinted(),memoryState=remembered();
  // Re-open one quality step on every navigation so a temporary bad page never
  // condemns the rest of the visit. Actual sustained performance remains authoritative.
  let glslLevel=memoryState?Math.min(5,memoryState.g+1):hint.g;
  let ambiLevel=memoryState?Math.min(3,memoryState.a+1):hint.a;

  let baselineMs=0,baselineReady=false,baselineSamples=[],frameSamples=[];
  let lastNativeFrame=0,lastReport=performance.now(),longTaskMs=0;
  let loadedAt=document.readyState==='complete'?performance.now():0;
  let warmupUntil=loadedAt?loadedAt+WARMUP_MS:Infinity;
  let lastScroll=-Infinity,scrollGraceUntil=-Infinity;
  let badStreak=0,cleanStreak=0,lastPermanentChange=-Infinity,lastProbeAt=-Infinity;
  let transientUntil=-Infinity;
  let probe=null;
  let lastUpgradeKind='ambi';
  let lastCollisionRAF=-Infinity,shaderPhase=1,ambiLastRun=-Infinity,ambiPending=null,ambiTimer=0;

  const shaderCanvas=()=>document.querySelector('canvas[data-ascii-cursor]');
  const shaderActive=()=>{
    const canvas=shaderCanvas();
    return Boolean(canvas&&(Number.parseFloat(canvas.style.opacity||'0')||0)>.04);
  };
  const ambientActive=()=>Boolean(document.body?.classList.contains('video-page-ambient-active'));

  const phase=now=>{
    if(!loadedAt||now<warmupUntil)return 'WARMUP';
    if(now<scrollGraceUntil)return 'SCROLL_GRACE';
    if(probe)return `PROBE_${probe.kind.toUpperCase()}`;
    return 'READY';
  };

  const effectiveGlslLevel=now=>{
    let value=glslLevel;
    if(now<transientUntil)value=Math.max(0,value-1);
    if(probe?.kind==='glsl')value=0;
    return value;
  };
  const effectiveAmbiLevel=now=>{
    let value=ambiLevel;
    if(now<transientUntil)value=Math.max(0,value-1);
    if(probe?.kind==='ambi')value=0;
    return value;
  };
  const glslProfile=now=>GLSL[effectiveGlslLevel(now)];
  const ambiProfile=now=>AMBI[effectiveAmbiLevel(now)];

  const remember=()=>{
    try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({g:glslLevel,a:ambiLevel,t:Date.now()}))}catch{}
  };

  const style=document.createElement('style');
  style.dataset.adaptivePerformance='v5';
  style.textContent=`
    html[data-perf-glsl-disabled="true"] canvas[data-ascii-cursor]{opacity:0!important;visibility:hidden!important}
    html[data-perf-ambi="OFF"] .video-ambient-field,
    html[data-perf-probe="ambi"] .video-ambient-field{display:none!important}
    html[data-perf-ambi="LOW"] .video-ambient-emitter[data-static="true"]{animation:none!important}
  `;
  document.head.appendChild(style);

  const syncDom=now=>{
    document.documentElement.dataset.perfGlsl=glslProfile(now).name;
    document.documentElement.dataset.perfGlslDisabled=String(glslLevel===0);
    document.documentElement.dataset.perfAmbi=ambiProfile(now).name;
    document.documentElement.dataset.perfProbe=probe?.kind||'none';
    document.documentElement.dataset.perfPhase=phase(now);
    if(!ambiProfile(now).enabled){
      if(ambiTimer)nativeClearTimeout(ambiTimer);
      ambiTimer=0;
    }else scheduleAmbilightPending(now);
    window.__DATA_C0RE_PERF_STATE__={
      version:5,
      phase:phase(now),
      glsl:glslProfile(now).name,
      ambilight:ambiProfile(now).name,
      baselineMs:baselineReady?baselineMs:null
    };
  };

  const permanentChange=(kind,next,now)=>{
    if(kind==='glsl')glslLevel=clamp(next,0,5);else ambiLevel=clamp(next,0,3);
    lastPermanentChange=now;
    badStreak=0;cleanStreak=0;shaderPhase=Math.min(shaderPhase,1);
    remember();
    syncDom(now);
  };

  const callbackCache=new WeakMap();
  const callbackKind=callback=>{
    if(typeof callback!=='function')return 'other';
    if(callbackCache.has(callback))return callbackCache.get(callback);
    let kind='other';
    try{
      const src=Function.prototype.toString.call(callback);
      if(src.includes('simulationPass')&&src.includes('displayPass')&&src.includes('pointer.px'))kind='ascii';
      else if(src.includes('videoIsActive')&&src.includes('updateGeometry')&&src.includes('sample(media,state)'))kind='ambilight';
      else if(src.includes('updateCollision'))kind='collision';
    }catch{}
    callbackCache.set(callback,kind);
    return kind;
  };

  const refreshHz=()=>baselineReady?clamp(1000/baselineMs,20,240):60;
  const scheduleAmbilightPending=now=>{
    if(!ambiPending||!ambiProfile(now).enabled||ambiTimer)return;
    const run=t=>{
      ambiTimer=0;
      const p=ambiProfile(t);
      if(!ambiPending||!p.enabled)return;
      const remaining=p.interval-(t-ambiLastRun);
      if(remaining>1){ambiTimer=nativeSetTimeout(()=>nativeRAF(run),Math.max(8,remaining));return;}
      const cb=ambiPending;ambiPending=null;ambiLastRun=t;cb(t);
    };
    nativeRAF(run);
  };

  window.requestAnimationFrame=function(callback){
    const kind=callbackKind(callback);
    if(kind==='other')return nativeRAF(callback);
    if(kind==='collision'){
      const run=now=>{
        const gap=glslProfile(now).collisionMs;
        if(now-lastCollisionRAF>=gap){lastCollisionRAF=now;callback(now)}
        else nativeSetTimeout(()=>nativeRAF(run),Math.max(8,gap-(now-lastCollisionRAF)));
      };
      return nativeRAF(run);
    }
    if(kind==='ambilight'){
      ambiPending=callback;
      const now=performance.now();
      if(ambiProfile(now).enabled)scheduleAmbilightPending(now);
      return 0;
    }
    const run=now=>{
      const target=glslProfile(now).target;
      if(target<=0){nativeSetTimeout(()=>nativeRAF(run),220);return;}
      const display=Math.max(20,refreshHz());
      shaderPhase+=Math.min(target,display)/display;
      if(shaderPhase>=1){shaderPhase-=1;callback(now)}else nativeRAF(run);
    };
    return nativeRAF(run);
  };

  window.setTimeout=function(callback,delay,...args){
    if(callbackKind(callback)!=='collision')return nativeSetTimeout(callback,delay,...args);
    const now=performance.now();
    const base=Number.isFinite(Number(delay))?Number(delay):0;
    return nativeSetTimeout(callback,Math.max(base,glslProfile(now).collisionMs),...args);
  };

  const scoreMetrics=(p95,jank,longMs)=>{
    const budget=baselineMs||16.67;
    const p=p95/Math.max(4,budget);
    const j=1+jank*2.5;
    const l=1+Math.min(2,longMs/120);
    return p*j*l;
  };
  const classify=(active,p95,jank,longMs)=>{
    if(!active)return 'IDLE';
    const budget=baselineMs||16.67;
    if(p95>budget*2.15||jank>.30||longMs>130)return 'CRITICAL';
    if(p95>budget*1.55||jank>.14||longMs>55)return 'STRESSED';
    if(p95<=budget*1.24&&jank<=.045&&longMs<25)return 'HEADROOM';
    return 'STABLE';
  };

  const activeKinds=()=>({glsl:shaderActive()&&glslLevel>0,ambi:ambientActive()&&ambiLevel>0});
  const startProbe=(kind,baseScore,status,now,chain=false)=>{
    if(probe||(!chain&&now-lastProbeAt<1800))return false;
    if(kind==='glsl'&&glslLevel<=0)return false;
    if(kind==='ambi'&&ambiLevel<=0)return false;
    probe={kind,baseScore,status,startedAt:now,until:now+PROBE_MS};
    lastProbeAt=now;syncDom(now);return true;
  };
  const nextProbeKind=failedKind=>{
    const kinds=activeKinds();
    if(failedKind!=='glsl'&&kinds.glsl)return 'glsl';
    if(failedKind!=='ambi'&&kinds.ambi)return 'ambi';
    return null;
  };
  const finishProbe=(score,status,now)=>{
    if(!probe)return;
    const old=probe;
    const improvement=(old.baseScore-score)/Math.max(.001,old.baseScore);
    const materiallyBetter=improvement>=PROBE_IMPROVEMENT||
      ((old.status==='CRITICAL'||old.status==='STRESSED')&&(status==='STABLE'||status==='HEADROOM'));
    probe=null;
    if(materiallyBetter){
      if(old.kind==='glsl')permanentChange('glsl',glslLevel-1,now);
      else permanentChange('ambi',ambiLevel-1,now);
      return;
    }
    const other=nextProbeKind(old.kind);
    if(other){startProbe(other,old.baseScore,old.status,now,true);return;}
    // The decorations did not explain the slowdown: do not punish them.
    badStreak=0;transientUntil=Math.max(transientUntil,now+700);syncDom(now);
  };

  const maybeRecover=(now)=>{
    if(now-lastPermanentChange<9000||probe||now<transientUntil)return;
    cleanStreak+=1;
    if(cleanStreak<RECOVERY_WINDOWS)return;
    cleanStreak=0;
    const kinds=activeKinds();
    if(lastUpgradeKind==='ambi'&&kinds.glsl&&glslLevel<5){lastUpgradeKind='glsl';permanentChange('glsl',glslLevel+1,now);return;}
    if(kinds.ambi&&ambiLevel<3){lastUpgradeKind='ambi';permanentChange('ambi',ambiLevel+1,now);return;}
    if(kinds.glsl&&glslLevel<5){lastUpgradeKind='glsl';permanentChange('glsl',glslLevel+1,now);}
  };

  const handleStatus=(status,score,now)=>{
    const currentPhase=phase(now);
    if(currentPhase==='WARMUP'||currentPhase==='SCROLL_GRACE'){
      badStreak=0;cleanStreak=0;
      if(status==='CRITICAL')transientUntil=Math.max(transientUntil,now+900);
      syncDom(now);return;
    }
    if(probe){
      if(now>=probe.until)finishProbe(score,status,now);
      return;
    }
    if(status==='CRITICAL'||status==='STRESSED'){
      cleanStreak=0;badStreak+=status==='CRITICAL'?2:1;
      if(badStreak===2){
        // First serious warning: protect temporarily but do not remember it.
        transientUntil=Math.max(transientUntil,now+1000);syncDom(now);return;
      }
      if(badStreak>=3){
        const kinds=activeKinds();
        const first=kinds.glsl?'glsl':kinds.ambi?'ambi':null;
        if(first)startProbe(first,score,status,now);
        else badStreak=0;
      }
      return;
    }
    badStreak=Math.max(0,badStreak-1);
    if(status==='HEADROOM')maybeRecover(now);else cleanStreak=0;
  };

  if('PerformanceObserver'in window){
    try{
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries())longTaskMs+=entry.duration||0;
      });
      observer.observe({type:'longtask',buffered:false});
    }catch{}
  }

  const lockBaseline=now=>{
    if(baselineReady||!loadedAt||now<loadedAt+450||baselineSamples.length<84)return;
    const clean=baselineSamples.filter(ms=>ms>=3&&ms<=50);
    if(clean.length<42)return;
    const cut=percentile(clean,.45);
    const fast=clean.filter(ms=>ms<=cut);
    baselineMs=clamp(percentile(fast,.5)||percentile(clean,.2)||16.67,4,40);
    baselineReady=true;
  };

  const report=now=>{
    const samples=frameSamples.filter(ms=>ms>=3&&ms<250);
    frameSamples=[];
    if(!samples.length){lastReport=now;return;}
    const p95=percentile(samples,.95);
    const budget=baselineMs||percentile(samples,.5)||16.67;
    const jank=samples.filter(ms=>ms>budget*1.5).length/samples.length;
    const active=shaderActive()||ambientActive();
    const status=classify(active,p95,jank,longTaskMs);
    const score=scoreMetrics(p95,jank,longTaskMs);
    handleStatus(status,score,now);
    longTaskMs=0;lastReport=now;syncDom(now);
  };

  const monitor=now=>{
    if(lastNativeFrame){
      const delta=now-lastNativeFrame;
      if(delta>0&&delta<1000){
        if(!baselineReady&&baselineSamples.length<180)baselineSamples.push(delta);
        frameSamples.push(delta);
        if(frameSamples.length>360)frameSamples.shift();
      }
    }
    lastNativeFrame=now;
    lockBaseline(now);
    if(now-lastReport>=REPORT_MS)report(now);
    nativeRAF(monitor);
  };

  addEventListener('load',()=>{
    loadedAt=performance.now();warmupUntil=loadedAt+WARMUP_MS;
    baselineSamples=[];baselineReady=false;baselineMs=0;
    syncDom(loadedAt);
  },{once:true,passive:true});
  addEventListener('scroll',()=>{
    const now=performance.now();
    if(now-lastScroll>220)scrollGraceUntil=now+SCROLL_GRACE_MS;
    lastScroll=now;
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){
      lastNativeFrame=0;lastReport=performance.now();
      transientUntil=Math.max(transientUntil,performance.now()+500);
    }
  });

  syncDom(performance.now());
  nativeRAF(monitor);
})();
