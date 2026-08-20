/* DATA C0RE DEV — conservative white-dominance guard for static images only.
   It never touches video emitters. Dark/grey/low-chroma images are left alone;
   suppression only happens when the rendered image is genuinely bright/white-dominant. */
(() => {
  'use strict';
  if (window.__DATA_C0RE_AMBILIGHT_WHITE_IMAGE_GUARD__) return;
  window.__DATA_C0RE_AMBILIGHT_WHITE_IMAGE_GUARD__ = true;

  const W = 24, H = 14;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha:false, willReadFrequently:true });
  if (!ctx) return;

  const records = new Map();
  let timer = 0;
  let style = null;

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const srcOf=img=>img.currentSrc||img.src||'';

  const mediaRejected=img=>{
    const src=`${srcOf(img)}`.toLowerCase();
    if(/\.(svg)(?:\?|$)/.test(src))return true;
    if(/(logo|favicon|icon|sprite|avatar|qr|og-cover)/.test(src))return true;
    return Boolean(img.closest('.site-header,.site-menu,.lumina-tech-grid,.lumina-plan-modal,.tech-viewer,[data-lumina-plan-card]'));
  };

  const sourceSafe=img=>{
    const src=srcOf(img);
    if(!src)return true;
    try{
      const u=new URL(src,document.baseURI);
      return u.protocol==='data:'||u.protocol==='blob:'||u.origin===location.origin;
    }catch{return false}
  };

  const ensureStyle=()=>{
    if(style?.isConnected)return;
    style=document.createElement('style');
    style.dataset.ambilightWhiteImageGuard='v1';
    style.textContent=`
      .video-ambient-emitter[data-white-image-guard="1"].is-active{
        opacity:calc(var(--amb-strength) * var(--amb-white-image-scale,1))!important;
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

  const drawVisibleImage=img=>{
    canvas.width=W; canvas.height=H;
    const iw=img.naturalWidth,ih=img.naturalHeight;
    if(!iw||!ih)return false;
    const rect=img.getBoundingClientRect();
    const fit=getComputedStyle(img).objectFit||'fill';
    let sx=0,sy=0,sw=iw,sh=ih;
    if(fit==='cover'&&rect.width>0&&rect.height>0){
      const sourceRatio=iw/ih,boxRatio=rect.width/rect.height;
      if(sourceRatio>boxRatio){sw=ih*boxRatio;sx=(iw-sw)*.5}
      else{sh=iw/boxRatio;sy=(ih-sh)*.5}
    }
    ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);
    return true;
  };

  const classifyWhite=data=>{
    let brightNeutral=0,whiteNeutral=0,paperWhite=0,vivid=0;
    const light=[];
    const total=W*H;
    for(let p=0;p<total;p++){
      const i=p*4;
      const [L,C]=oklabLC(data[i],data[i+1],data[i+2]);
      light.push(L);
      if(L>=.70&&C<.095)brightNeutral++;
      if(L>=.82&&C<.080)whiteNeutral++;
      if(L>=.90&&C<.065)paperWhite++;
      if(C>=.16)vivid++;
    }
    light.sort((a,b)=>a-b);
    const metrics={
      l50:quantile(light,.50),
      l75:quantile(light,.75),
      brightNeutral:brightNeutral/total,
      whiteNeutral:whiteNeutral/total,
      paperWhite:paperWhite/total,
      vivid:vivid/total
    };

    const definite=(
      metrics.l50>.72 &&
      metrics.brightNeutral>.70 &&
      metrics.whiteNeutral>.48 &&
      metrics.vivid<.08
    ) || (
      metrics.l50>.76 &&
      metrics.paperWhite>.36 &&
      metrics.brightNeutral>.68 &&
      metrics.vivid<.10
    );

    const probable=!definite &&
      metrics.l50>.64 &&
      metrics.brightNeutral>.58 &&
      metrics.whiteNeutral>.34 &&
      metrics.vivid<.12;

    metrics.scale=definite?0:probable?.10:1;
    metrics.definite=definite;
    metrics.probable=probable;
    return metrics;
  };

  const clearGuard=emitter=>{
    emitter.removeAttribute('data-white-image-guard');
    emitter.style.removeProperty('--amb-white-image-scale');
  };

  const applyScale=(img,emitter,metrics)=>{
    const scale=metrics?.scale??1;
    records.set(img,{src:srcOf(img),scale,metrics,at:performance.now()});
    if(scale>=.999){clearGuard(emitter);return}
    emitter.setAttribute('data-white-image-guard','1');
    emitter.style.setProperty('--amb-white-image-scale',String(clamp(scale,0,1)));
  };

  const eligibleImages=()=>[...document.querySelectorAll('img')].filter(img=>!mediaRejected(img));
  const staticEmitters=()=>[...document.querySelectorAll('.video-ambient-field .video-ambient-emitter[data-static="true"]')];

  const nearViewport=img=>{
    const r=img.getBoundingClientRect();
    return r.width>1&&r.height>1&&r.bottom>-180&&r.top<innerHeight+180&&r.right>0&&r.left<innerWidth;
  };

  const sample=()=>{
    timer=0;
    if(document.hidden)return schedule();
    ensureStyle();
    const images=eligibleImages();
    const emitters=staticEmitters();

    /* Fail open instead of ever suppressing the wrong media. The base Ambilight
       creates one static emitter per eligible image in DOM scan order. */
    if(images.length!==emitters.length){
      emitters.forEach(clearGuard);
      return schedule(700);
    }

    for(let i=0;i<images.length;i++){
      const img=images[i],emitter=emitters[i];
      if(!img.complete||!img.naturalWidth||!img.naturalHeight||!sourceSafe(img)||!nearViewport(img))continue;
      try{
        if(!drawVisibleImage(img))continue;
        applyScale(img,emitter,classifyWhite(ctx.getImageData(0,0,W,H).data));
      }catch{
        canvas.width=W;canvas.height=H;
        clearGuard(emitter);
      }
    }
    schedule(1200);
  };

  const schedule=(delay=180)=>{
    if(timer)return;
    timer=setTimeout(sample,delay);
  };

  window.DATA_C0RE_AMBILIGHT_WHITE_IMAGE_GUARD_STATUS=()=>[...records.values()];

  const boot=()=>{
    ensureStyle();
    schedule(0);
    new MutationObserver(()=>schedule(80)).observe(document.documentElement,{childList:true,subtree:true});
    addEventListener('scroll',()=>schedule(80),{passive:true});
    addEventListener('resize',()=>schedule(80),{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(0)},{passive:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
