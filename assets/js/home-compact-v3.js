(() => {
  'use strict';
  const fine=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  const magnets=[...document.querySelectorAll('[data-home-context-magnet],[data-home-gate-magnet]')];

  const reset=item=>{
    item.style.setProperty('--magnet-x','0px');
    item.style.setProperty('--magnet-y','0px');
  };

  magnets.forEach(item=>{
    item.addEventListener('pointermove',event=>{
      if(!fine())return;
      const r=item.getBoundingClientRect();
      const isGate=item.hasAttribute('data-home-gate-magnet');
      const x=(event.clientX-r.left-r.width/2)*(isGate?.018:.055);
      const y=(event.clientY-r.top-r.height/2)*(isGate?.035:.095);
      item.style.setProperty('--magnet-x',`${x.toFixed(2)}px`);
      item.style.setProperty('--magnet-y',`${y.toFixed(2)}px`);
    });
    item.addEventListener('pointerleave',()=>reset(item));
    item.addEventListener('blur',()=>reset(item));
  });

  addEventListener('resize',()=>{if(!fine())magnets.forEach(reset)},{passive:true});
})();
