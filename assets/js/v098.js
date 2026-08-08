(() => {
  const q = (s, root = document) => root.querySelector(s);
  const fx = q('#realtime .fx-research-block');
  if (!fx) return;

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.8 CLEAN — static lightweight FX media */
    #realtime .fx-research-media{
      display:grid!important;
      grid-template-columns:minmax(0,1.55fr) minmax(300px,.75fr)!important;
      gap:10px!important;
      height:auto!important;
      min-height:0!important;
      align-items:start!important;
    }
    #realtime .fx-film,#realtime .fx-process{
      height:auto!important;
      min-height:0!important;
      overflow:hidden!important;
      background:#070707!important;
    }
    #realtime .fx-film-window{
      height:auto!important;
      min-height:0!important;
      background:#070707!important;
      overflow:hidden!important;
    }
    #realtime .fx-film-track{
      display:block!important;
      width:100%!important;
      height:auto!important;
      animation:none!important;
      transform:none!important;
      will-change:auto!important;
    }
    #realtime .fx-film-track img{display:none!important}
    #realtime .fx-film-track img:first-child{
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-width:0!important;
      max-width:100%!important;
      object-fit:contain!important;
      transform:none!important;
    }
    #realtime .fx-process{display:block!important;padding:0!important}
    #realtime .fx-network img{
      display:block!important;
      width:100%!important;
      height:auto!important;
      max-height:330px!important;
      object-fit:contain!important;
      background:#070707!important;
    }
    #realtime .fx-process-line{margin:0!important;padding:10px 0 0!important}
    #realtime .fx-film figcaption,#realtime .fx-network figcaption{padding:8px 0!important}
    #realtime .fx-media-fallback,#realtime .fx-network-fallback{display:none!important}
    @media(max-width:900px){
      #realtime .fx-research-media{grid-template-columns:1fr!important}
      #realtime .fx-process{margin-top:8px!important}
    }
  `;
  document.head.appendChild(style);

  const filmTrack = q('.fx-film-track', fx);
  const networkFigure = q('.fx-network', fx);
  if (!filmTrack || !networkFigure) return;

  filmTrack.innerHTML = '<img alt="Selected realtime TouchDesigner FX studies">';
  const fxImage = q('img', filmTrack);

  let networkImage = q('img', networkFigure);
  if (!networkImage) {
    networkImage = document.createElement('img');
    networkFigure.prepend(networkImage);
  }
  networkImage.alt = 'TouchDesigner network used to build the modular realtime FX library';

  const loadBase64Text = async (path) => {
    const response = await fetch(path, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const base64 = (await response.text()).trim();
    if (!base64.startsWith('/9j/')) throw new Error('Invalid JPEG payload');
    return `data:image/jpeg;base64,${base64}`;
  };

  let started = false;
  const loadMedia = async () => {
    if (started) return;
    started = true;
    try {
      const [selection, network] = await Promise.all([
        loadBase64Text('./assets/media/research/fx-selection.jpg?v=101'),
        loadBase64Text('./assets/media/research/fx-network.jpg?v=101')
      ]);
      fxImage.src = selection;
      networkImage.src = network;
    } catch (error) {
      console.warn('FX static media load failed', error);
      q('.fx-research-media', fx)?.remove();
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        loadMedia();
      }
    }, { rootMargin: '700px 0px', threshold: 0 });
    observer.observe(fx);
  } else {
    loadMedia();
  }
})();