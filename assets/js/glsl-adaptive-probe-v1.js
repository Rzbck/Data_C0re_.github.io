(() => {
  'use strict';
  if (window.__DATA_C0RE_ADAPTIVE_DEV_V2__) return;
  window.__DATA_C0RE_ADAPTIVE_DEV_V2__ = true;

  const PREFIX='[DATA C0RE ADAPT]';
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const REPORT_MS=1000;
  const BASELINE_SAMPLES=72;
  const MAX_HISTORY=90;
  const LEVELS=[
    {id:0,name:'SAFE',target:20},
    {id:1,name:'LOW',target:30},
    {id:2,name:'BALANCED',target:40},
    {id:3,name:'HIGH',target:50},
    {id:4,name:'MAX',target:60}
  ];

  const coarse=matchMedia('(pointer:coarse)');
  const fine=matchMedia('(pointer:fine) and (hover:hover)');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const memory=Number.isFinite(navigator.deviceMemory)?navigator.deviceMemory:null;
  const cores=navigator.hardwareConcurrency||null;

  const capabilities={
    cores,
    memoryGB:memory,
    dpr:Number((devicePixelRatio||1).toFixed(2)),
    viewport:`${innerWidth}x${innerHeight}`,
    touchPoints:navigator.maxTouchPoints||0,
    pointer:coarse.matches?'coarse':fine.matches?'fine':'unknown',
    reducedMotion:reduce.matches,
    webgl2:'pending',
    gpuTimerQuery:'pending'
  };

  const percentile=(values,p)=>{
    if(!values.length)return 0;
    const sorted=[...values].sort((a,b)=>a-b);
    return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*p)))];
  };

  const shaderCanvas=()=>document.querySelector('canvas[data-ascii-cursor]');
  const shaderActive=()=>{
    const canvas=shaderCanvas();
    if(!canvas)return false;
    const opacity=Number.parseFloat(canvas.style.opacity||'0')||0;
    return opacity>.04;
  };

  let webglChecked=false;
  const refreshWebGLInfo=()=>{
    if(webglChecked)return;
    const canvas=shaderCanvas();
    if(!canvas)return;
    try{
      const gl=canvas.getContext('webgl2');
      capabilities.webgl2=Boolean(gl);
      capabilities.gpuTimerQuery=Boolean(gl&&gl.getExtension('EXT_disjoint_timer_query_webgl2'));
    }catch{
      capabilities.webgl2=false;
      capabilities.gpuTimerQuery=false;
    }
    webglChecked=true;
  };

  const initialLevel=()=>{
    let level=coarse.matches?3:4;
    if(cores!==null&&cores<=4)level-=1;
    if(cores!==null&&cores<=2)level-=1;
    if(memory!==null&&memory<=4)level-=1;
    if(memory!==null&&memory<=2)level-=1;
    if(devicePixelRatio>2.5)level-=1;
    return Math.max(1,Math.min(4,level));
  };

  let autoLevel=initialLevel();
  let forcedLevel=null;
  let lastLevelChange=performance.now();
  let lastLevelReason='initial device hints';
  let stressStreak=0;
  let headroomStreak=0;
  let activeStreak=0;
  let baselineMs=0;
  let baselineReady=false;
  let baselineSamples=[];
  let frameSamples=[];
  let lastNativeFrame=0;
  let lastReport=performance.now();
  let longTaskCount=0;
  let longTaskMs=0;
  let shaderRuns=0;
  let shaderRunsPrev=0;
  let lastSnapshot=null;
  const history=[];

  const currentLevel=()=>forcedLevel===null?autoLevel:forcedLevel;
  const currentProfile=()=>LEVELS[currentLevel()];
  const refreshHz=()=>baselineReady?Math.max(20,Math.min(240,1000/baselineMs)):60;
  const effectiveTarget=()=>Math.max(15,Math.min(currentProfile().target,refreshHz()));

  const callbackCache=new WeakMap();
  const isAsciiFrame=callback=>{
    if(typeof callback!=='function')return false;
    if(callbackCache.has(callback))return callbackCache.get(callback);
    let match=false;
    try{
      const source=Function.prototype.toString.call(callback);
      match=source.includes('simulationPass')&&source.includes('displayPass')&&source.includes('pointer.px');
    }catch{}
    callbackCache.set(callback,match);
    return match;
  };

  let shaderPhase=1;
  window.requestAnimationFrame=function(callback){
    if(!isAsciiFrame(callback))return nativeRAF(callback);
    const run=now=>{
      const display=Math.max(20,refreshHz());
      const target=Math.min(effectiveTarget(),display);
      shaderPhase+=target/display;
      if(shaderPhase>=1){
        shaderPhase-=1;
        shaderRuns+=1;
        callback(now);
      }else{
        nativeRAF(run);
      }
    };
    return nativeRAF(run);
  };

  const setAutoLevel=(next,reason)=>{
    next=Math.max(0,Math.min(4,next));
    if(next===autoLevel)return;
    const before=LEVELS[autoLevel].name;
    autoLevel=next;
    shaderPhase=Math.min(shaderPhase,1);
    lastLevelChange=performance.now();
    lastLevelReason=reason;
    stressStreak=0;
    headroomStreak=0;
    console.info(`${PREFIX} ${before} -> ${LEVELS[autoLevel].name} | ${reason}`);
  };

  const classify=(active,p95,jank,longMs)=>{
    if(!active)return 'IDLE';
    const budget=baselineMs||16.67;
    if(p95>budget*2.35||jank>.38||longMs>180)return 'CRITICAL';
    if(p95>budget*1.65||jank>.18||longMs>90)return 'STRESSED';
    if(p95<=budget*1.28&&jank<=.05&&longMs<35)return 'HEADROOM';
    return 'STABLE';
  };

  const maybeAdapt=(status,now)=>{
    if(forcedLevel!==null)return;
    if(!shaderActive()){
      stressStreak=0;
      headroomStreak=0;
      activeStreak=0;
      return;
    }
    activeStreak+=1;
    if(activeStreak<2)return;
    if(now-lastLevelChange<3500)return;

    if(status==='CRITICAL'){
      stressStreak+=2;
      headroomStreak=0;
    }else if(status==='STRESSED'){
      stressStreak+=1;
      headroomStreak=0;
    }else if(status==='HEADROOM'){
      headroomStreak+=1;
      stressStreak=Math.max(0,stressStreak-1);
    }else{
      stressStreak=Math.max(0,stressStreak-1);
      headroomStreak=0;
    }

    if(stressStreak>=2&&autoLevel>0){
      const step=status==='CRITICAL'&&autoLevel>=2?2:1;
      setAutoLevel(autoLevel-step,`${status.toLowerCase()} frame budget`);
      return;
    }
    if(headroomStreak>=10&&autoLevel<4){
      setAutoLevel(autoLevel+1,'sustained headroom');
    }
  };

  const hud=document.createElement('aside');
  hud.id='data-c0re-adaptive-dev-hud';
  hud.setAttribute('aria-label','DATA C0RE adaptive GLSL development monitor');
  Object.assign(hud.style,{
    position:'fixed',left:'10px',bottom:'10px',zIndex:'2147483647',width:'min(360px,calc(100vw - 20px))',
    boxSizing:'border-box',padding:'10px 11px',background:'rgba(5,5,5,.92)',color:'#f3f1eb',
    border:'1px solid rgba(223,255,0,.58)',font:'600 10px/1.38 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
    letterSpacing:'.015em',boxShadow:'0 8px 30px rgba(0,0,0,.38)',backdropFilter:'blur(7px)'
  });
  hud.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px">
      <strong style="color:#dfff00;font-size:10px;letter-spacing:.08em">DEV / GLSL ADAPT V2</strong>
      <button type="button" data-adapt-close style="all:unset;cursor:pointer;color:#999;padding:2px 4px">hide</button>
    </div>
    <div data-adapt-main style="white-space:pre-wrap"></div>
    <div data-adapt-event style="margin-top:6px;color:#dfff00;min-height:14px"></div>
    <div data-adapt-buttons style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px"></div>`;
  document.documentElement.appendChild(hud);

  const mainEl=hud.querySelector('[data-adapt-main]');
  const eventEl=hud.querySelector('[data-adapt-event]');
  const buttonsEl=hud.querySelector('[data-adapt-buttons]');
  const makeButton=(label,value)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=label;
    button.dataset.level=String(value);
    Object.assign(button.style,{
      appearance:'none',border:'1px solid #555',background:'#111',color:'#bbb',padding:'4px 6px',
      font:'700 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',cursor:'pointer'
    });
    button.addEventListener('click',()=>{
      if(value==='auto'){
        forcedLevel=null;
        lastLevelReason='AUTO resumed';
        lastLevelChange=performance.now();
      }else{
        forcedLevel=Number(value);
        shaderPhase=1;
        lastLevelReason=`manual dev force: ${LEVELS[forcedLevel].name}`;
        lastLevelChange=performance.now();
      }
      renderHud();
    });
    buttonsEl.appendChild(button);
  };
  makeButton('AUTO','auto');
  LEVELS.slice().reverse().forEach(level=>makeButton(level.name,level.id));
  hud.querySelector('[data-adapt-close]').addEventListener('click',()=>{hud.style.display='none';});

  const renderHud=()=>{
    if(!mainEl)return;
    const profile=currentProfile();
    const snap=lastSnapshot;
    const mode=forcedLevel===null?'AUTO':'FORCED';
    const shader=shaderActive()?'ACTIVE':shaderCanvas()?'IDLE':'WAITING';
    const displayHz=snap?.refreshHz||null;
    const target=Number(effectiveTarget().toFixed(0));
    const hw=`${cores??'?'}c / ${memory??'?'}GB / DPR ${Number((devicePixelRatio||1).toFixed(2))}`;
    const perf=snap?`${snap.fps.toFixed(1)} fps UI | shader ${snap.shaderHz.toFixed(1)} Hz\np95 ${snap.p95Ms.toFixed(1)} ms | jank ${snap.jankPct.toFixed(1)}% | long ${snap.longTaskMs.toFixed(0)} ms`:'calibrating frame budget…';
    mainEl.textContent=`${mode}  ${profile.name}  target ${target}Hz\nshader ${shader} | display ${displayHz?displayHz.toFixed(0)+'Hz':'calibrating'}\n${perf}\n${hw} | WebGL2 ${capabilities.webgl2} | GPU timer ${capabilities.gpuTimerQuery}`;
    eventEl.textContent=`${snap?.status||'CALIBRATING'} · ${lastLevelReason}`;
    buttonsEl.querySelectorAll('button').forEach(button=>{
      const active=button.dataset.level===(forcedLevel===null?'auto':String(forcedLevel));
      button.style.borderColor=active?'#dfff00':'#555';
      button.style.color=active?'#dfff00':'#bbb';
    });
  };

  if('PerformanceObserver' in window){
    try{
      const observer=new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          longTaskCount+=1;
          longTaskMs+=entry.duration||0;
        }
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
    refreshWebGLInfo();
    lastLevelReason=`display calibrated ${(1000/baselineMs).toFixed(0)}Hz`;
    console.info(`${PREFIX} display budget ${baselineMs.toFixed(2)} ms / ${(1000/baselineMs).toFixed(1)} Hz`);
  };

  const report=now=>{
    const samples=frameSamples.filter(ms=>ms>=3&&ms<250);
    frameSamples=[];
    if(!samples.length)return;
    refreshWebGLInfo();
    const median=percentile(samples,.5);
    const p95=percentile(samples,.95);
    const budget=baselineMs||median||16.67;
    const jank=samples.filter(ms=>ms>budget*1.5).length/samples.length;
    const status=classify(shaderActive(),p95,jank,longTaskMs);
    const elapsed=Math.max(.25,(now-lastReport)/1000);
    const runs=shaderRuns-shaderRunsPrev;
    shaderRunsPrev=shaderRuns;
    const snapshot={
      at:new Date().toISOString(),
      status,
      fps:median?1000/median:0,
      p95Ms:p95,
      jankPct:jank*100,
      longTasks:longTaskCount,
      longTaskMs,
      shaderHz:runs/elapsed,
      refreshHz:baselineReady?1000/baselineMs:0,
      level:currentProfile().name,
      mode:forcedLevel===null?'AUTO':'FORCED',
      targetHz:effectiveTarget()
    };
    lastSnapshot=snapshot;
    history.push({...snapshot});
    if(history.length>MAX_HISTORY)history.shift();
    maybeAdapt(status,now);
    console.info(`${PREFIX} ${snapshot.mode}/${snapshot.level} ${status} | UI ${snapshot.fps.toFixed(1)}fps | shader ${snapshot.shaderHz.toFixed(1)}Hz | p95 ${p95.toFixed(1)}ms | jank ${snapshot.jankPct.toFixed(1)}%`);
    longTaskCount=0;
    longTaskMs=0;
    lastReport=now;
    renderHud();
  };

  const monitor=now=>{
    if(lastNativeFrame){
      const delta=now-lastNativeFrame;
      if(delta>0&&delta<1000){
        if(!baselineReady&&baselineSamples.length<BASELINE_SAMPLES*2)baselineSamples.push(delta);
        frameSamples.push(delta);
        if(frameSamples.length>300)frameSamples.shift();
      }
    }
    lastNativeFrame=now;
    lockBaseline();
    if(now-lastReport>=REPORT_MS)report(now);
    nativeRAF(monitor);
  };

  window.__DATA_C0RE_PERF__={
    capabilities,
    history,
    snapshot:()=>lastSnapshot,
    get level(){return currentProfile().name;},
    get mode(){return forcedLevel===null?'AUTO':'FORCED';},
    auto:()=>{forcedLevel=null;lastLevelReason='AUTO resumed';renderHud();},
    force:name=>{
      const found=LEVELS.find(level=>level.name===String(name).toUpperCase());
      if(!found)return false;
      forcedLevel=found.id;
      shaderPhase=1;
      lastLevelReason=`manual dev force: ${found.name}`;
      renderHud();
      return true;
    },
    show:()=>{hud.style.display='block';renderHud();}
  };

  console.info(`${PREFIX} dev adaptive controller active; use the on-page HUD — no console commands required.`);
  renderHud();
  nativeRAF(monitor);

  addEventListener('resize',()=>{
    capabilities.viewport=`${innerWidth}x${innerHeight}`;
    capabilities.dpr=Number((devicePixelRatio||1).toFixed(2));
    renderHud();
  },{passive:true});
})();