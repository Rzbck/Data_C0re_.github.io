(() => {
  'use strict';
  const fine=()=>matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
  const magnets=[...document.querySelectorAll('[data-home-context-magnet],[data-home-topic-magnet],[data-home-gate-magnet]')];
  const gates=[...document.querySelectorAll('[data-home-gate-magnet]')];

  const reset=item=>{
    item.style.setProperty('--magnet-x','0px');
    item.style.setProperty('--magnet-y','0px');
  };

  const resetGateTrail=gate=>{
    gate.classList.remove('is-gate-trailing');
    for(let i=1;i<=4;i++){
      gate.style.setProperty(`--gate-echo-${i}-x`,'0px');
      gate.style.setProperty(`--gate-echo-${i}-y`,'0px');
    }
  };

  const prepareGateTrail=gate=>{
    const strong=gate.querySelector('strong');
    if(!strong||strong.dataset.gateTrailReady==='true')return;
    const text=strong.textContent.trim();
    strong.textContent='';
    strong.dataset.gateTrailReady='true';
    strong.classList.add('home-gate-title');

    for(let i=4;i>=1;i--){
      const echo=document.createElement('span');
      echo.className=`home-gate-title__echo home-gate-title__echo--${i}`;
      echo.setAttribute('aria-hidden','true');
      echo.textContent=text;
      strong.appendChild(echo);
    }

    const front=document.createElement('span');
    front.className='home-gate-title__front';
    front.textContent=text;
    strong.appendChild(front);
    resetGateTrail(gate);
  };

  gates.forEach(prepareGateTrail);

  magnets.forEach(item=>{
    item.addEventListener('pointermove',event=>{
      if(!fine())return;
      const r=item.getBoundingClientRect();
      const isGate=item.hasAttribute('data-home-gate-magnet');
      const isTopic=item.hasAttribute('data-home-topic-magnet');
      const localX=(event.clientX-r.left-r.width/2)/(r.width/2||1);
      const localY=(event.clientY-r.top-r.height/2)/(r.height/2||1);
      const x=(event.clientX-r.left-r.width/2)*(isGate ? .018 : isTopic ? .05 : .055);
      const y=(event.clientY-r.top-r.height/2)*(isGate ? .035 : isTopic ? .085 : .095);
      item.style.setProperty('--magnet-x',`${x.toFixed(2)}px`);
      item.style.setProperty('--magnet-y',`${y.toFixed(2)}px`);

      if(isGate){
        item.classList.add('is-gate-trailing');
        const nx=Math.max(-1,Math.min(1,localX));
        const ny=Math.max(-1,Math.min(1,localY));
        const distances=[6,12,19,28];
        distances.forEach((distance,index)=>{
          const layer=index+1;
          item.style.setProperty(`--gate-echo-${layer}-x`,`${(nx*distance).toFixed(2)}px`);
          item.style.setProperty(`--gate-echo-${layer}-y`,`${(ny*distance*.66).toFixed(2)}px`);
        });
      }
    });
    item.addEventListener('pointerleave',()=>{
      reset(item);
      if(item.hasAttribute('data-home-gate-magnet'))resetGateTrail(item);
    });
    item.addEventListener('blur',()=>{
      reset(item);
      if(item.hasAttribute('data-home-gate-magnet'))resetGateTrail(item);
    });
  });

  addEventListener('resize',()=>{
    if(!fine()){
      magnets.forEach(reset);
      gates.forEach(resetGateTrail);
    }
  },{passive:true});
})();
