(() => {
  'use strict';

  const start=()=>{
    const menu=document.querySelector('[data-menu]');
    if(!menu)return;

    const cards=[...menu.querySelectorAll('.menu-card')];
    if(!cards.length)return;

    const fineMedia=matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)');
    const reduceMedia=matchMedia('(prefers-reduced-motion: reduce)');
    const ECHO_COUNT=6;
    const distances=[10,20,32,46,62,80];
    const fine=()=>fineMedia.matches&&!reduceMedia.matches;

    const reset=card=>{
      card.classList.remove('is-gate-trailing');
      card.style.setProperty('--menu-magnet-x','0px');
      card.style.setProperty('--menu-magnet-y','0px');
      for(let i=1;i<=ECHO_COUNT;i++){
        card.style.setProperty(`--gate-echo-${i}-x`,'0px');
        card.style.setProperty(`--gate-echo-${i}-y`,'0px');
        card.style.setProperty(`--gate-echo-${i}-r`,'0deg');
        card.style.setProperty(`--gate-echo-${i}-s`,'1');
      }
    };

    const prepare=card=>{
      const title=card.querySelector('.menu-card-title');
      if(!title||title.dataset.menuTrailReady==='true')return;
      const text=title.textContent.trim();
      if(!text)return;

      title.textContent='';
      title.dataset.menuTrailReady='true';
      title.classList.add('home-gate-title','menu-card-title--trail');

      for(let i=ECHO_COUNT;i>=1;i--){
        const echo=document.createElement('span');
        echo.className=`home-gate-title__echo home-gate-title__echo--${i}`;
        echo.setAttribute('aria-hidden','true');
        echo.textContent=text;
        title.appendChild(echo);
      }

      const front=document.createElement('span');
      front.className='home-gate-title__front';
      front.textContent=text;
      title.appendChild(front);
      reset(card);
    };

    cards.forEach(card=>{
      prepare(card);
      card.addEventListener('pointermove',event=>{
        if(!fine())return;
        const r=card.getBoundingClientRect();
        const localX=(event.clientX-r.left-r.width/2)/(r.width/2||1);
        const localY=(event.clientY-r.top-r.height/2)/(r.height/2||1);
        const nx=Math.max(-1,Math.min(1,localX));
        const ny=Math.max(-1,Math.min(1,localY));
        const x=(event.clientX-r.left-r.width/2)*.026;
        const y=(event.clientY-r.top-r.height/2)*.052;

        card.style.setProperty('--menu-magnet-x',`${x.toFixed(2)}px`);
        card.style.setProperty('--menu-magnet-y',`${y.toFixed(2)}px`);
        card.classList.add('is-gate-trailing');

        distances.forEach((distance,index)=>{
          const layer=index+1;
          const depth=layer/distances.length;
          const rotation=(nx*.9+ny*.35)*depth*4.6;
          const scale=1+depth*.035;
          card.style.setProperty(`--gate-echo-${layer}-x`,`${(nx*distance).toFixed(2)}px`);
          card.style.setProperty(`--gate-echo-${layer}-y`,`${(ny*distance*.78).toFixed(2)}px`);
          card.style.setProperty(`--gate-echo-${layer}-r`,`${rotation.toFixed(2)}deg`);
          card.style.setProperty(`--gate-echo-${layer}-s`,scale.toFixed(3));
        });
      });
      card.addEventListener('pointerleave',()=>reset(card));
      card.addEventListener('blur',()=>reset(card),true);
    });

    const resetAll=()=>cards.forEach(reset);
    fineMedia.addEventListener?.('change',resetAll);
    reduceMedia.addEventListener?.('change',resetAll);
    addEventListener('resize',()=>{if(!fine())resetAll()},{passive:true});

    new MutationObserver(()=>{
      if(!menu.classList.contains('open'))resetAll();
    }).observe(menu,{attributes:true,attributeFilter:['class']});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
