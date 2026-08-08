(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  const fx = q('#realtime .fx-research-block');
  if (!fx) return;

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.7 — GitHub Pages embedded-image repair */
    #realtime .fx-research-media{background:transparent!important}
    #realtime .fx-film-window{background:#090909!important}
    #realtime .fx-film-track{align-items:center!important}
    #realtime .fx-film-track img{height:auto!important;width:auto!important;min-width:1400px!important;max-width:none!important;object-fit:contain!important}
    #realtime .fx-process{background:#090909!important}
    #realtime .fx-network img{width:100%!important;height:100%!important;object-fit:contain!important;background:#090909!important}
    #realtime .fx-media-error{display:none!important}
    @media(max-width:1000px){
      #realtime .fx-film-track img{min-width:1100px!important}
    }
    @media(max-width:680px){
      #realtime .fx-film-track img{min-width:900px!important}
    }
  `;
  document.head.appendChild(style);

  const extractEmbeddedRaster = async path => {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const svg = await response.text();
    const match = svg.match(/(?:href|xlink:href)=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["']/i);
    if (!match) throw new Error('No embedded raster found');
    return match[1];
  };

  const repair = async () => {
    try {
      const [spriteData, networkData] = await Promise.all([
        extractEmbeddedRaster('./assets/media/research/fx-sprite.svg'),
        extractEmbeddedRaster('./assets/media/research/fx-network.svg')
      ]);

      qa('.fx-film-track img', fx).forEach((img, i) => {
        img.src = spriteData;
        if (i > 0) {
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
        } else {
          img.alt = 'Selected realtime TouchDesigner FX studies';
        }
      });

      const network = q('.fx-network img', fx);
      if (network) {
        network.src = networkData;
        network.alt = 'TouchDesigner network used to build the modular realtime FX library';
      }
    } catch (error) {
      console.warn('FX media repair failed', error);
      const film = q('.fx-film', fx);
      const process = q('.fx-process', fx);
      if (film) film.style.display = 'none';
      if (process) process.style.display = 'none';
      const media = q('.fx-research-media', fx);
      if (media) media.style.display = 'none';
    }
  };

  repair();
})();