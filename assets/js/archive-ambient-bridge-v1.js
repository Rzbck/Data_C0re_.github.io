(() => {
  'use strict';
  const root=document.querySelector('[data-archive-interactive]');
  if(!root||window.__DATA_C0RE_ARCHIVE_AMBIENT_BRIDGE__)return;
  window.__DATA_C0RE_ARCHIVE_AMBIENT_BRIDGE__=true;

  const desktop=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  let px=-1,py=-1,last=null,raf=0;

  const currentEntry=()=>{
    if(!desktop()||document.hidden)return null;
    let node=null;
    if(px>=0&&py>=0)node=document.elementFromPoint(px,py);
    const fromPoint=node instanceof Element?node.closest('.archive-entry'):null;
    if(fromPoint&&!fromPoint.hidden)return fromPoint;
    try{return root.querySelector('.archive-entry:hover:not([hidden])')}catch{return null}
  };

  const enter=(entry,force=false)=>{
    if(!entry)return;
    if(last===entry&&!force&&entry.dataset.archiveMediaWanted==='true')return;
    if(last&&last!==entry){
      try{last.dispatchEvent(new PointerEvent('pointerleave',{bubbles:false,relatedTarget:entry,pointerType:'mouse'}))}catch{last.dispatchEvent(new Event('pointerleave'))}
    }
    last=entry;
    try{entry.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false,relatedTarget:null,pointerType:'mouse'}))}catch{entry.dispatchEvent(new Event('pointerenter'))}
  };

  const leave=()=>{
    if(!last)return;
    const old=last;last=null;
    try{old.dispatchEvent(new PointerEvent('pointerleave',{bubbles:false,relatedTarget:null,pointerType:'mouse'}))}catch{old.dispatchEvent(new Event('pointerleave'))}
  };

  const reconcile=(force=false)=>{
    raf=0;
    const entry=currentEntry();
    if(entry)enter(entry,force);else leave();
  };
  const schedule=(force=false)=>{
    if(raf)cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>reconcile(force));
  };

  addEventListener('pointermove',event=>{px=event.clientX;py=event.clientY;schedule(false)},{passive:true});
  addEventListener('scroll',()=>schedule(false),{passive:true});
  addEventListener('resize',()=>schedule(true),{passive:true});
  addEventListener('focus',()=>setTimeout(()=>schedule(true),40),{passive:true});
  addEventListener('pageshow',()=>setTimeout(()=>schedule(true),40),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>schedule(true),60)});
})();