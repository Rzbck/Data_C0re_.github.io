(() => {
  'use strict';
  const fine=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  document.querySelectorAll('[data-home-context-magnet]').forEach(item=>{
    item.addEventListener('pointermove',event=>{
      if(!fine())return;
      const r=item.getBoundingClientRect();
      const x=(event.clientX-r.left-r.width/2)*.04;
      const y=(event.clientY-r.top-r.height/2)*.08;
      item.style.setProperty('--magnet-x',`${x.toFixed(2)}px`);
      item.style.setProperty('--magnet-y',`${y.toFixed(2)}px`);
    });
    item.addEventListener('pointerleave',()=>{
      item.style.setProperty('--magnet-x','0px');
      item.style.setProperty('--magnet-y','0px');
    });
  });
})();
