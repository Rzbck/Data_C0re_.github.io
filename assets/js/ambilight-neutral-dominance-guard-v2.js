/* DATA C0RE DEV experiment — image-only post-process neutral-dominance veto.
   Video emitters are never touched: flashes, whites and neutral frames in moving
   images keep the production Ambilight behaviour exactly as before. */
(() => {
  'use strict';
  if (window.__DATA_C0RE_AMBILIGHT_NEUTRAL_DOMINANCE_GUARD_V2__) return;
  window.__DATA_C0RE_AMBILIGHT_NEUTRAL_DOMINANCE_GUARD_V2__ = true;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const interval = coarse ? 420 : 300;
  const W = 24, H = 14;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha:false, willReadFrequently:true });
  if (!ctx) return;

  const records = new Map();
  const pairs = new Map();
  let timer = 0;
  let style = null;

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const srcOf=media=>media.currentSrc||media.src||'';
  const intrinsic=media=>media instanceof HTMLVideoElement?[media.videoWidth,media.videoHeight]:[media.naturalWidth,media.naturalHeight];

  const mediaRejected=media=>{
    const src=`${srcOf(media)}`.toLowerCase();
    if(/\.(svg)(?:\?|$)/.test(src))return true;
    if(/(logo|favicon|icon|sprite|avatar|qr|og-cover)/.test(src))return true;
    return Boolean(media.closest('.site-header,.site-menu,.lumina-tech-grid,.lumina-plan-modal,.tech-viewer,[data-lumina-plan-card]'));
  };

  const sourceSafe=media=>{
    const src=srcOf(media);
    if(!src)return true;
    try{
      const u=new URL(src,document.baseURI);
      return u.protocol==='data:'||u.protocol==='blob:'||u.origin===location.origin;
    }catch{return false}
  };

  const ensureStyle=()=>{
    if(style?.isConnected)return;
    style=document.createElement('style');
    style.dataset.ambilightNeutralDominanceGuard='v2';
    style.textContent=`
      .video-ambient-emitter[data-neutral-dominance-guard="1"].is-active{
        opacity:calc(var(--amb-strength) * var(--amb-neutral-guard-scale,1))!important;
      }
    `;
    document.head.appendChild(style);
  };

  const srgbLinear=v=>{
    v/=255;
    return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
  };
  const oklabLC=(r8,g8,b8)=>{
    const r=srgbLinear(r8),g=srgbLinear(g8),b=srgbLinear(b8);
    const l=.4122214708*r+.5363325363*g+.0514459929*b;
    const m=.2119034982*r+.6806995451*g+.1073969566*b;
    const s=.0883024619*r+.2817188376*g+.6299787005*b;
    const ll=Math.cbrt(Math.max(0,l)),mm=Math.cbrt(Math.max(0,m)),ss=Math.cbrt(Math.max(0,s));
    const L=.2104542553*ll+.793617785*mm-.0040720468*ss;
    const a=1.9779984951*ll-2.428592205*mm+.4505937099*ss;
    const bb=.0259040371*ll+.7827717662*mm-.808675766*ss;
    return [L,Math.hypot(a,bb)];
  };
  const quantile=(sorted,q)=>{
    if(!sorted.length)return 0;
    const pos=(sorted.length-1)*q,lo=Math.floor(pos),hi=Math.ceil(pos);
    return lo===hi?sorted[lo]:mix(sorted[lo],sorted[hi],pos-lo);
  };

  const drawFrame=media=>{
    canvas.width=W; canvas.height=H;
    const [iw,ih]=intrinsic(media);
    if(!iw||!ih)return false;
    const rect=media.getBoundingClientRect();
    const fit=getComputedStyle(media).objectFit||'fill';
    let sx=0,sy=0,sw=iw,sh=ih;
    if(fit==='cover'&&rect.width>0&&rect.height>0){
      const sourceRatio=iw/ih,boxRatio=rect.width/rect.height;
      if(sourceRatio>boxRatio){sw=ih*boxRatio;sx=(iw-sw)*.5}
      else{sh=iw/boxRatio;sy=(ih-sh)*.5}
    }
    ctx.drawImage(media,sx,sy,sw,sh,0,0,W,H);
    return true;
  };

  const classify=data=>{
    const chroma=[],light=[];
    let verySoft=0,muted=0,strong=0,vivid=0,brightMuted=0;
    const total=W*H;
    for(let p=0;p<total;p++){
      const i=p*4;
      const [L,C]=oklabLC(data[i],data[i+1],data[i+2]);
      chroma.push(C); light.push(L);
      if(C<.065)verySoft++;
      if(C<.12)muted++;
      if(C>=.16)strong++;
      if(C>=.20)vivid++;
      if(L>=.50&&C<.115)brightMuted++;
    }
    chroma.sort((a,b)=>a-b); light.sort((a,b)=>a-b);
    const metrics={
      c50:quantile(chroma,.50),
      c75:quantile(chroma,.75),
      c90:quantile(chroma,.90),
      l50:quantile(light,.50),
      l75:quantile(light,.75),
      verySoft:verySoft/total,
      muted:muted/total,
      strong:strong/total,
      vivid:vivid/total,
      brightMuted:brightMuted/total
    };

    const definite = metrics.muted>.70 && metrics.strong<.11 && metrics.vivid<.065 && metrics.c75<.115 &&
      (metrics.brightMuted>.30 || (metrics.verySoft>.46&&metrics.c50<.072));
    const probable = !definite && metrics.muted>.60 && metrics.strong<.15 && metrics.vivid<.09 && metrics.c75<.13 &&
      (metrics.brightMuted>.22 || (metrics.verySoft>.36&&metrics.c50<.085));

    metrics.scale=definite?0:probable?.10:1;
    metrics.definite=definite;
    metrics.probable=probable;
    return metrics;
  };

  const setScale=(media,emitter,metrics)=>{
    const scale=metrics?.scale??1;
    const prev=records.get(media)?.scale;
    records.set(media,{src:srcOf(media),scale,metrics,at:performance.now()});
    if(scale>=.999){
      emitter.removeAttribute('data-neutral-dominance-guard');
      emitter.style.removeProperty('--amb-neutral-guard-scale');
    }else{
      emitter.setAttribute('data-neutral-dominance-guard','1');
      emitter.style.setProperty('--amb-neutral-guard-scale',String(clamp(scale,0,1)));
    }
    if(prev!==scale&&scale<1)console.info('[DATA C0RE Ambilight whole-frame neutral guard]',{src:srcOf(media),scale,metrics});
  };

  const eligibleMedia=()=>[...document.querySelectorAll('img')].filter(media=>!mediaRejected(media));

  const syncPairs=()=>{
    ensureStyle();
    const media=eligibleMedia();
    const emitters=[...document.querySelectorAll('.video-ambient-field .video-ambient-emitter')];
    if(!emitters.length)return;
    const n=Math.min(media.length,emitters.length);
    for(let i=0;i<n;i++)pairs.set(media[i],emitters[i]);
    for(const key of [...pairs.keys()])if(!media.includes(key))pairs.delete(key);
  };

  const nearViewport=media=>{
    const r=media.getBoundingClientRect();
    return r.width>1&&r.height>1&&r.bottom>-140&&r.top<innerHeight+140&&r.right>0&&r.left<innerWidth;
  };

  const samplePair=(media,emitter)=>{
    if(!media.isConnected||!emitter.isConnected||!sourceSafe(media)||!nearViewport(media))return;
    if(!(media instanceof HTMLImageElement)||!media.complete||!media.naturalWidth||!media.naturalHeight)return;
    try{
      if(!drawFrame(media))return;
      const data=ctx.getImageData(0,0,W,H).data;
      setScale(media,emitter,classify(data));
    }catch{
      canvas.width=W;canvas.height=H;
      setScale(media,emitter,{scale:1,error:true});
    }
  };

  const tick=()=>{
    timer=0;
    if(document.hidden){schedule();return}
    syncPairs();
    for(const [media,emitter] of pairs)samplePair(media,emitter);
    schedule();
  };
  const schedule=()=>{
    if(timer)return;
    timer=setTimeout(tick,interval);
  };

  window.DATA_C0RE_AMBILIGHT_NEUTRAL_GUARD_V2_STATUS=()=>[...records.values()];

  const boot=()=>{
    ensureStyle();
    requestAnimationFrame(()=>{syncPairs();schedule()});
    new MutationObserver(()=>syncPairs()).observe(document.documentElement,{childList:true,subtree:true});
    addEventListener('resize',syncPairs,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()},{passive:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
