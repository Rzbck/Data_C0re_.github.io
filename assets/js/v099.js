(() => {
  const q=(s,r=document)=>r.querySelector(s);
  const fx=q('#realtime .fx-research-block');
  if(!fx) return;
  const style=document.createElement('style');
  style.textContent=`
    #realtime .fx-research-media{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.75fr);gap:10px;height:auto!important;min-height:0!important}
    #realtime .fx-film,#realtime .fx-process{height:auto!important;min-height:0!important;overflow:hidden;background:#070707}
    #realtime .fx-film-window{height:auto!important;min-height:0!important;overflow:hidden;background:#070707}
    #realtime .fx-film-track{display:block!important;width:100%!important;height:auto!important;animation:none!important;transform:none!important;will-change:auto!important}
    #realtime .fx-film-track img{display:none!important}
    #realtime .fx-film-track img:first-child{display:block!important;width:100%!important;height:auto!important;min-width:0!important;object-fit:contain!important}
    #realtime .fx-network img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;background:#070707}
    #realtime .fx-process{display:block!important;padding:0!important}
    #realtime .fx-process-line{padding:10px 0 0;margin:0!important}
    #realtime .fx-film figcaption,#realtime .fx-network figcaption{padding:8px 0!important}
    @media(max-width:900px){#realtime .fx-research-media{grid-template-columns:1fr!important}.fx-process{margin-top:8px!important}}
  `;
  document.head.appendChild(style);
  const film=q('.fx-film-track',fx);
  const net=q('.fx-network img',fx);
  if(film){
    film.innerHTML='<img src="./assets/media/research/fx-selection.jpg?v=100" alt="Selected realtime TouchDesigner FX studies" loading="lazy">';
  }
  if(net){
    net.src='./assets/media/research/fx-network.jpg?v=100';
    net.alt='TouchDesigner network used to build the modular realtime FX library';
    net.loading='lazy';
  }
})();