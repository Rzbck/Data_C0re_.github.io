(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];
  const fx = q('#realtime .fx-research-block');
  if (!fx) return;

  const TRANSPARENT = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.8 — deterministic FX media: no marquee, no layout jump */
    #realtime .fx-research-media{height:clamp(250px,23vw,350px)!important;align-items:stretch!important}
    #realtime .fx-film-window{background:#070707!important;overflow:hidden!important}
    #realtime .fx-film-track{
      display:block!important;
      width:100%!important;
      height:100%!important;
      animation:none!important;
      transform:none!important;
      will-change:auto!important;
    }
    #realtime .fx-film-track img{
      display:none!important;
      width:100%!important;
      height:100%!important;
      min-width:0!important;
      max-width:none!important;
      object-fit:cover!important;
      object-position:center center!important;
      transform:none!important;
    }
    #realtime .fx-film-track img:first-child{display:block!important}
    #realtime .fx-film:hover .fx-film-track{animation:none!important}
    #realtime .fx-process{background:#070707!important}
    #realtime .fx-network{position:relative!important;overflow:hidden!important}
    #realtime .fx-network img{
      display:block!important;
      width:100%!important;
      height:100%!important;
      object-fit:contain!important;
      background:#070707!important;
    }
    #realtime .fx-media-fallback{
      height:100%;min-height:0;display:grid;place-items:center;padding:18px;
      border:1px solid #242424;background:#080808;color:#77756f;
      font-size:9px;line-height:1.45;letter-spacing:.08em;text-transform:uppercase;text-align:center;
    }
    #realtime .fx-network-fallback{
      height:100%;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;align-items:center;
      padding:16px;background:#070707;
    }
    #realtime .fx-network-fallback span{
      min-height:58px;border:1px solid #292929;display:flex;align-items:center;justify-content:center;
      padding:7px;color:#96938d;font-size:8px;line-height:1.25;text-align:center;text-transform:uppercase;letter-spacing:.06em;
    }
    #realtime .fx-network-fallback b{color:var(--cyan);font-weight:500;text-align:center}
    @media(max-width:1000px){#realtime .fx-research-media{height:auto!important}#realtime .fx-film{height:280px!important}#realtime .fx-process{height:300px!important}}
    @media(max-width:680px){#realtime .fx-film{height:220px!important}#realtime .fx-process{height:250px!important}.fx-network-fallback{padding:10px!important;gap:4px!important}.fx-network-fallback span{font-size:7px!important;min-height:48px!important}}
  `;
  document.head.appendChild(style);

  const filmImgs = qa('.fx-film-track img', fx);
  const hero = filmImgs[0];
  const duplicate = filmImgs[1];
  const network = q('.fx-network img', fx);

  if (hero) {
    hero.loading = 'eager';
    hero.src = TRANSPARENT;
    hero.alt = 'Selected realtime TouchDesigner FX studies';
  }
  if (duplicate) {
    duplicate.src = TRANSPARENT;
    duplicate.alt = '';
    duplicate.setAttribute('aria-hidden', 'true');
  }
  if (network) {
    network.loading = 'eager';
    network.src = TRANSPARENT;
    network.alt = 'TouchDesigner network used to build the modular realtime FX library';
  }

  const extractEmbeddedRaster = async path => {
    const response = await fetch(`${path}?v=098`, { cache: 'reload' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    const svg = await response.text();
    const match = svg.match(/(?:href|xlink:href)=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["']/i);
    if (!match) throw new Error(`${path}: embedded raster not found`);
    return match[1];
  };

  const preload = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });

  const showFilmFallback = () => {
    const windowEl = q('.fx-film-window', fx);
    if (!windowEl) return;
    windowEl.innerHTML = '<div class="fx-media-fallback">FX library media unavailable in this build.<br>Realtime research remains documented below.</div>';
  };

  const showNetworkFallback = () => {
    const figure = q('.fx-network', fx);
    const caption = figure?.querySelector('figcaption');
    if (!figure) return;
    figure.querySelector('img')?.remove();
    const diagram = document.createElement('div');
    diagram.className = 'fx-network-fallback';
    diagram.innerHTML = '<span>source</span><b>→</b><span>analysis</span><b>→</b><span>feedback / transform</span>';
    figure.insertBefore(diagram, caption || null);
  };

  Promise.all([
    extractEmbeddedRaster('./assets/media/research/fx-sprite.svg').then(preload),
    extractEmbeddedRaster('./assets/media/research/fx-network.svg').then(preload)
  ]).then(([spriteData, networkData]) => {
    if (hero) hero.src = spriteData;
    if (network) network.src = networkData;
  }).catch(error => {
    console.warn('V0.9.8 FX media fallback', error);
    showFilmFallback();
    showNetworkFallback();
  });
})();
