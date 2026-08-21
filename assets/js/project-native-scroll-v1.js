(() => {
  'use strict';

  if (window.__DATA_C0RE_PROJECT_NATIVE_SCROLL__) return;
  window.__DATA_C0RE_PROJECT_NATIVE_SCROLL__ = true;

  const root = document.documentElement;
  const body = document.body;
  const filename = location.pathname.endsWith('/') ? 'index.html' : location.pathname.split('/').pop();
  const pageClass = String(filename || 'project').replace(/\.html$/,'').replace(/[^a-z0-9-]/gi,'-');
  const fineDesktop = window.matchMedia('(min-width:821px) and (pointer:fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isGrandTheatre = filename === 'grand-theatre.html';
  const isComedie = filename === 'comedie.html';
  const isRealtime = filename === 'realtime.html';

  const q = (selector, scope = document) => scope.querySelector(selector);
  const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const prepareRealtimeTriad = () => {
    if (!isRealtime || body.dataset.realtimeTriad === 'true') return;

    const lang = (document.documentElement.lang || 'en').slice(0, 2);
    const copy = {
      en: {
        eyebrow: 'Realtime systems / 2017—2025',
        intent: 'Three realtime system studies linking image, sound and spatial behaviour: an architectural AV tunnel, an audio-reactive material system and a cellular signal field.',
        axes: [
          ['A', 'TouchDesigner AV System', 'LED-screen logic, light and realtime audio analysis become an architectural tunnel.'],
          ['B', 'Audio-Reactive Material', 'Sonic structure changes the behaviour and surface of a realtime material system.'],
          ['C', 'Game of Life / Audio-Reactive', 'Cellular states become temporal structure and a second way of translating sound into image.']
        ],
        labels: ['A / AV SYSTEM', 'B / AUDIO-REACTIVE MATERIAL', 'C / GAME OF LIFE'],
        alts: ['Luminous architectural tunnel from the TouchDesigner AV system study.', 'Audio-reactive material study realtime output.', 'Game of Life audio-reactive cellular study realtime output.'],
        avIndex: 'A / TouchDesigner AV System / 2017',
        avTitle: 'Light as spatial image.',
        avBody: 'A spatial audiovisual system study combining LED-screen logic, light, SoundFX and realtime audio analysis. Repeated luminous frames turn a flat output into an architectural tunnel.',
        avFacts: [
          ['System', 'LED screen / light'],
          ['Input', 'realtime audio analysis'],
          ['Tools', 'TouchDesigner / Resolume'],
          ['Type', 'system study / 2017']
        ],
        avCaption: 'Study A / TouchDesigner AV System / realtime spatial output',
        materialIndex: 'B / Audio-Reactive Material / 2025',
        cellularIndex: 'C / Game of Life / Audio-Reactive / 2025'
      },
      fr: {
        eyebrow: 'Systèmes temps réel / 2017—2025',
        intent: 'Trois études de systèmes temps réel reliant image, son et comportement spatial : un tunnel AV architectural, un système de matière audio-réactive et un champ cellulaire.',
        axes: [
          ['A', 'TouchDesigner AV System', 'Écran LED, lumière et analyse audio temps réel deviennent un tunnel architectural.'],
          ['B', 'Matière audio-réactive', 'La structure sonore transforme le comportement et la surface d’un système de matière temps réel.'],
          ['C', 'Game of Life / Audio-réactif', 'Les états cellulaires deviennent une structure temporelle et une autre manière de traduire le son en image.']
        ],
        labels: ['A / SYSTÈME AV', 'B / MATIÈRE AUDIO-RÉACTIVE', 'C / GAME OF LIFE'],
        alts: ['Tunnel architectural lumineux issu de l’étude de système AV TouchDesigner.', 'Sortie temps réel de l’étude de matière audio-réactive.', 'Sortie temps réel de l’étude cellulaire Game of Life audio-réactive.'],
        avIndex: 'A / TouchDesigner AV System / 2017',
        avTitle: 'La lumière comme image spatiale.',
        avBody: 'Une étude de système audiovisuel spatial combinant logique d’écran LED, lumière, SoundFX et analyse audio temps réel. La répétition de cadres lumineux transforme une sortie plane en tunnel architectural.',
        avFacts: [
          ['Système', 'écran LED / lumière'],
          ['Entrée', 'analyse audio temps réel'],
          ['Outils', 'TouchDesigner / Resolume'],
          ['Type', 'étude système / 2017']
        ],
        avCaption: 'Étude A / TouchDesigner AV System / sortie spatiale temps réel',
        materialIndex: 'B / Matière audio-réactive / 2025',
        cellularIndex: 'C / Game of Life / Audio-réactif / 2025'
      },
      es: {
        eyebrow: 'Sistemas en tiempo real / 2017—2025',
        intent: 'Tres estudios de sistemas en tiempo real que conectan imagen, sonido y comportamiento espacial: un túnel AV arquitectónico, un sistema de materia audio-reactiva y un campo celular.',
        axes: [
          ['A', 'TouchDesigner AV System', 'La lógica de pantalla LED, la luz y el análisis de audio en tiempo real forman un túnel arquitectónico.'],
          ['B', 'Materia audio-reactiva', 'La estructura sonora transforma el comportamiento y la superficie de un sistema material en tiempo real.'],
          ['C', 'Game of Life / Audio-reactivo', 'Los estados celulares se convierten en estructura temporal y en otra forma de traducir sonido a imagen.']
        ],
        labels: ['A / SISTEMA AV', 'B / MATERIA AUDIO-REACTIVA', 'C / GAME OF LIFE'],
        alts: ['Túnel arquitectónico luminoso del estudio de sistema AV con TouchDesigner.', 'Salida en tiempo real del estudio de materia audio-reactiva.', 'Salida en tiempo real del estudio celular Game of Life audio-reactivo.'],
        avIndex: 'A / TouchDesigner AV System / 2017',
        avTitle: 'La luz como imagen espacial.',
        avBody: 'Un estudio de sistema audiovisual espacial que combina lógica de pantalla LED, luz, SoundFX y análisis de audio en tiempo real. La repetición de marcos luminosos convierte una salida plana en un túnel arquitectónico.',
        avFacts: [
          ['Sistema', 'pantalla LED / luz'],
          ['Entrada', 'análisis de audio en tiempo real'],
          ['Herramientas', 'TouchDesigner / Resolume'],
          ['Tipo', 'estudio de sistema / 2017']
        ],
        avCaption: 'Estudio A / TouchDesigner AV System / salida espacial en tiempo real',
        materialIndex: 'B / Materia audio-reactiva / 2025',
        cellularIndex: 'C / Game of Life / Audio-reactivo / 2025'
      }
    }[lang] || null;
    if (!copy) return;

    const hero = q('.realtime-hero');
    const grid = q('.realtime-hero-grid', hero || document);
    const heroCopy = q('.realtime-hero-copy', hero || document);
    const currentVisual = q('.realtime-hero-still', hero || document);
    const material = q('.realtime-study--material');
    const cellular = q('.realtime-study--cellular');
    if (!hero || !grid || !heroCopy || !currentVisual || !material || !cellular) return;

    const eyebrow = q('.eyebrow', heroCopy);
    const intent = q('.project-intent', heroCopy);
    if (eyebrow) eyebrow.textContent = copy.eyebrow;
    if (intent) intent.textContent = copy.intent;
    q('.realtime-hero-meta', heroCopy)?.remove();

    const axes = document.createElement('div');
    axes.className = 'realtime-hero-axes';
    copy.axes.forEach(([index, title, text]) => {
      const row = document.createElement('div');
      row.className = 'realtime-hero-axis';
      row.innerHTML = `<span>${index}</span><div><h3>${title}</h3><p>${text}</p></div>`;
      axes.appendChild(row);
    });
    heroCopy.appendChild(axes);

    const mosaic = document.createElement('div');
    mosaic.className = 'realtime-hero-mosaic reveal';
    const imageData = [
      ['av', 'assets/media/av-install/hero.webp', copy.labels[0], copy.alts[0]],
      ['material', 'assets/media/realtime/audio-material.webp', copy.labels[1], copy.alts[1]],
      ['cellular', 'assets/media/realtime/game-of-life.webp', copy.labels[2], copy.alts[2]]
    ];
    imageData.forEach(([kind, src, label, alt], index) => {
      const figure = document.createElement('figure');
      figure.className = `realtime-hero-tile realtime-hero-tile--${kind}`;
      figure.innerHTML = `<img src="${src}" alt="${alt}" decoding="async"${index === 0 ? ' fetchpriority="high"' : ''}><figcaption>${label}</figcaption>`;
      mosaic.appendChild(figure);
    });
    currentVisual.replaceWith(mosaic);

    const facts = copy.avFacts.map(([key, value]) => `<div><strong>${key}</strong><span>${value}</span></div>`).join('');
    const av = document.createElement('section');
    av.className = 'project-section realtime-study realtime-study--av';
    av.innerHTML = `
      <div class="realtime-study-layout">
        <div class="realtime-study-copy reveal">
          <p class="realtime-study-index">${copy.avIndex}</p>
          <h2>${copy.avTitle}</h2>
          <p>${copy.avBody}</p>
          <div class="realtime-study-facts">${facts}</div>
        </div>
        <figure class="realtime-study-media reveal">
          <video muted loop playsinline preload="auto" poster="assets/media/av-install/hero.webp"><source src="assets/media/av-install/loop.mp4" type="video/mp4"></video>
          <figcaption>${copy.avCaption}</figcaption>
        </figure>
      </div>`;
    material.before(av);

    const materialIndex = q('.realtime-study-index', material);
    const cellularIndex = q('.realtime-study-index', cellular);
    if (materialIndex) materialIndex.textContent = copy.materialIndex;
    if (cellularIndex) cellularIndex.textContent = copy.cellularIndex;
    q('.realtime-states')?.remove();

    const style = document.createElement('style');
    style.dataset.realtimeTriad = 'true';
    style.textContent = `
      body.realtime-page .realtime-hero-grid{
        grid-template-columns:minmax(390px,.86fr) minmax(0,1.14fr)!important;
        gap:clamp(32px,4vw,68px)!important;
        align-items:center!important;
      }
      body.realtime-page .realtime-hero-copy{justify-content:center!important}
      body.realtime-page .realtime-hero-copy h1{
        font-size:clamp(58px,7vw,112px)!important;
        margin-top:8px!important;
      }
      body.realtime-page .realtime-hero-copy .project-intent{
        margin-top:clamp(20px,2.5vh,30px)!important;
        max-width:650px!important;
        font-size:clamp(15px,1.08vw,18px)!important;
      }
      body.realtime-page .realtime-hero-axes{
        margin-top:clamp(24px,3vh,36px);
        border-top:1px solid var(--line);
      }
      body.realtime-page .realtime-hero-axis{
        display:grid;
        grid-template-columns:34px minmax(0,1fr);
        gap:12px;
        padding:11px 0 12px;
        border-bottom:1px solid var(--line);
      }
      body.realtime-page .realtime-hero-axis>span{
        color:var(--acid);
        font-size:9px;
        font-weight:800;
        letter-spacing:.1em;
      }
      body.realtime-page .realtime-hero-axis h3{
        margin:0;
        color:var(--paper);
        font-size:12px;
        line-height:1.15;
        letter-spacing:.01em;
      }
      body.realtime-page .realtime-hero-axis p{
        margin:5px 0 0;
        max-width:580px;
        color:var(--grey);
        font-size:9px;
        line-height:1.4;
      }
      body.realtime-page .realtime-hero-mosaic{
        height:min(66vh,700px);
        min-height:440px;
        display:grid;
        grid-template-columns:1fr 1fr;
        grid-template-rows:minmax(0,1.12fr) minmax(0,.88fr);
        gap:8px;
      }
      body.realtime-page .realtime-hero-tile{
        position:relative;
        min-width:0;
        min-height:0;
        margin:0;
        overflow:hidden;
        background:#020202;
      }
      body.realtime-page .realtime-hero-tile--av{grid-column:1 / -1}
      body.realtime-page .realtime-hero-tile img{
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
        filter:saturate(.92) contrast(1.03);
      }
      body.realtime-page .realtime-hero-tile figcaption{
        position:absolute;
        left:0;right:0;bottom:0;
        padding:28px 12px 10px;
        background:linear-gradient(180deg,transparent,rgba(7,7,7,.88));
        color:var(--paper);
        font-size:8px;
        line-height:1.2;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      body.realtime-page .realtime-study--av .realtime-study-layout{
        grid-template-columns:minmax(0,1.28fr) minmax(300px,.72fr)!important;
      }
      body.realtime-page .realtime-study--av .realtime-study-media{order:1}
      body.realtime-page .realtime-study--av .realtime-study-copy{order:2}
      @media(max-height:780px) and (min-width:821px) and (pointer:fine){
        body.realtime-page .realtime-hero-mosaic{height:min(61vh,570px);min-height:360px}
        body.realtime-page .realtime-hero-axis{padding:8px 0 9px}
        body.realtime-page .realtime-hero-axis p{font-size:8.5px}
      }
      @media(max-width:900px){
        body.realtime-page .realtime-hero-grid{grid-template-columns:1fr!important;gap:32px!important}
        body.realtime-page .realtime-hero-mosaic{
          height:auto;
          min-height:0;
          grid-template-columns:1fr;
          grid-template-rows:none;
          gap:10px;
        }
        body.realtime-page .realtime-hero-tile,
        body.realtime-page .realtime-hero-tile--av{
          grid-column:auto;
          width:100%;
          aspect-ratio:16/9;
        }
        body.realtime-page .realtime-study--av .realtime-study-layout{grid-template-columns:1fr!important}
        body.realtime-page .realtime-study--av .realtime-study-copy,
        body.realtime-page .realtime-study--av .realtime-study-media{order:initial}
      }
      @media(max-width:620px){
        body.realtime-page .realtime-hero-axis{grid-template-columns:28px minmax(0,1fr);gap:9px}
        body.realtime-page .realtime-hero-axis h3{font-size:11px}
        body.realtime-page .realtime-hero-axis p{font-size:8.5px}
      }
    `;
    document.head.appendChild(style);

    body.dataset.realtimeTriad = 'true';
    body.classList.add('realtime-triad-ready');
  };

  prepareRealtimeTriad();

  const panelList = () => {
    let list = [];
    if (isComedie) {
      list = [q('.project-hero.comedie-show-screen'), ...qa('.production-block.comedie-show-screen')];
    } else if (filename === 'stage-systems.html') {
      list = [q('.project-hero'), q('.stage-main-media'), ...qa('.stage-study')];
    } else if (isGrandTheatre) {
      list = [q('.project-hero'), ...qa('.gtg-case')];
    } else {
      list = [q('.project-hero'), ...qa('.project-section')];
    }
    return list.filter(panel => panel && getComputedStyle(panel).display !== 'none');
  };

  const panels = panelList();
  if (!panels.length) return;
  const footer = q('.project-next');
  const snapTargets = [...panels, ...(footer ? [footer] : [])];

  root.classList.add('project-native-scroll');
  body.classList.add('project-native-scroll-body');
  panels.forEach(panel => panel.classList.add('project-native-panel'));
  footer?.classList.add('project-native-footer');

  const style = document.createElement('style');
  style.dataset.projectNativeScroll = 'true';
  style.textContent = `
    html.project-native-scroll{scroll-behavior:auto!important}
    html.project-native-scroll .project-native-panel,
    html.project-native-scroll .project-native-footer{scroll-snap-stop:always!important}
    body.comedie-page .production-block.comedie-show-screen{
      content-visibility:visible!important;
      contain-intrinsic-size:none!important;
    }
    @media(max-width:820px),(pointer:coarse),(prefers-reduced-motion:reduce){
      html.project-native-scroll{scroll-snap-type:none!important}
    }
    @media(min-width:821px) and (pointer:fine) and (prefers-reduced-motion:no-preference){
      html.project-native-scroll{scroll-snap-type:y proximity!important;scroll-padding-top:0!important}
      html.project-native-scroll .project-native-panel,
      html.project-native-scroll .project-native-footer{scroll-snap-align:start!important}
      html.project-native-scroll .project-native-panel.is-project-tall{scroll-snap-stop:normal!important}
      body.project-native-scroll-body{overscroll-behavior-y:auto!important}
      body.fullpage-project .project-section.fullpage-panel,
      body.fullpage-comedie .production-block.fullpage-panel,
      body.fullpage-comedie .production-block.comedie-show-screen.fullpage-panel,
      body.fullpage-stage-systems .stage-study.fullpage-panel{
        height:auto!important;
        min-height:100svh!important;
      }
    }
  `;
  document.head.appendChild(style);

  const ensureFullpageCss = () => {
    if (isGrandTheatre || document.querySelector('link[data-project-native-fullpage-css]')) return;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = new URL('assets/css/fullpage.css?v=20260815-2', document.baseURI).href;
    css.dataset.projectNativeFullpageCss = 'true';
    document.head.appendChild(css);
  };

  const applyDesktopLayout = () => {
    if (isGrandTheatre) return;
    const desktop = fineDesktop.matches && !reduce.matches;
    if (desktop) {
      ensureFullpageCss();
      body.classList.add('fullpage-project', `fullpage-${pageClass}`, 'fullpage-nav');
      root.classList.add('fullpage-mode');
      panels.forEach(panel => panel.classList.add('fullpage-panel'));
    } else {
      body.classList.remove('fullpage-project', `fullpage-${pageClass}`, 'fullpage-nav');
      root.classList.remove('fullpage-mode');
      panels.forEach(panel => panel.classList.remove('fullpage-panel'));
    }
  };

  const measurePanels = () => {
    const limit = innerHeight * 1.08;
    panels.forEach(panel => panel.classList.toggle('is-project-tall', panel.scrollHeight > limit));
  };

  applyDesktopLayout();
  requestAnimationFrame(measurePanels);

  const warmImage = image => {
    if (!(image instanceof HTMLImageElement) || image.dataset.projectWarm === 'true') return;
    image.dataset.projectWarm = 'true';
    if (image.loading === 'lazy') image.loading = 'eager';
    if ('fetchPriority' in image && image.fetchPriority === 'low') image.fetchPriority = 'auto';
    const decode = () => {
      try { image.decode?.().catch?.(() => {}); } catch {}
    };
    if (image.complete && image.naturalWidth > 0) decode();
    else image.addEventListener('load', decode, { once: true });
  };

  const warmPanel = panel => {
    if (!panel || panel.dataset.projectPanelWarm === 'true') return;
    panel.dataset.projectPanelWarm = 'true';
    qa('img', panel).forEach(warmImage);
    qa('video', panel).forEach(video => {
      if (video.matches('[data-lazy-video],[data-hover-preview-video],[data-work-preview-video],[data-archive-video]')) return;
      if (video.preload === 'none') video.preload = 'metadata';
    });
  };

  const warmAround = index => {
    if (index < 0) return;
    warmPanel(panels[index]);
    warmPanel(panels[index + 1]);
  };

  warmAround(0);
  if (isComedie && panels[2]) {
    const warmTransit = () => warmPanel(panels[2]);
    if ('requestIdleCallback' in window) requestIdleCallback(warmTransit, { timeout: 900 });
    else setTimeout(warmTransit, 350);
  }

  if ('IntersectionObserver' in window) {
    const ratios = new Map(panels.map(panel => [panel, 0]));
    const activeObserver = new IntersectionObserver(entries => {
      for (const entry of entries) ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      let best = -1;
      let bestRatio = 0;
      panels.forEach((panel, index) => {
        const ratio = ratios.get(panel) || 0;
        if (ratio > bestRatio) { bestRatio = ratio; best = index; }
      });
      if (best < 0) return;
      panels.forEach((panel, index) => panel.classList.toggle('is-fullpage-active', index === best));
      warmAround(best);
    }, { threshold: [0, .1, .25, .4, .55, .7, .85] });
    panels.forEach(panel => activeObserver.observe(panel));
  }

  const normalizeWheel = event => {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * innerHeight;
    return event.deltaY;
  };

  const nearestTargetIndex = () => {
    let best = 0;
    let distance = Infinity;
    snapTargets.forEach((target, index) => {
      const d = Math.abs(target.getBoundingClientRect().top);
      if (d < distance) { distance = d; best = index; }
    });
    return best;
  };

  let wheelLocked = false;
  let unlockTimer = 0;
  let snapIndex = nearestTargetIndex();
  const atDocumentEnd = () => Math.abs((document.documentElement.scrollHeight - innerHeight) - scrollY) < 3;
  const currentTargetIndex = () => {
    if (footer && atDocumentEnd()) return snapTargets.length - 1;
    return wheelLocked ? snapIndex : nearestTargetIndex();
  };
  const unlockWheel = () => {
    wheelLocked = false;
    clearTimeout(unlockTimer);
    unlockTimer = 0;
    snapIndex = footer && atDocumentEnd() ? snapTargets.length - 1 : nearestTargetIndex();
  };
  const lockUntilScrollEnds = () => {
    wheelLocked = true;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlockWheel, 620);
    if ('onscrollend' in window) addEventListener('scrollend', unlockWheel, { once: true });
  };

  const shouldAllowInsideTallPanel = (target, direction) => {
    if (!target?.classList.contains('is-project-tall')) return false;
    const rect = target.getBoundingClientRect();
    const edge = 28;
    if (direction > 0 && rect.bottom > innerHeight + edge) return true;
    if (direction < 0 && rect.top < -edge) return true;
    return false;
  };

  addEventListener('wheel', event => {
    if (!fineDesktop.matches || reduce.matches || body.classList.contains('menu-open') || event.ctrlKey) return;
    const delta = normalizeWheel(event);
    if (Math.abs(delta) < 4) return;
    const direction = delta > 0 ? 1 : -1;

    if (wheelLocked) {
      event.preventDefault();
      return;
    }

    const current = currentTargetIndex();
    const currentTarget = snapTargets[current];
    if (shouldAllowInsideTallPanel(currentTarget, direction)) return;

    const next = Math.max(0, Math.min(snapTargets.length - 1, current + direction));
    if (next === current) return;

    event.preventDefault();
    const nextTarget = snapTargets[next];
    const panelIndex = panels.indexOf(nextTarget);
    if (panelIndex >= 0) warmAround(panelIndex);
    else if (direction > 0) warmPanel(panels[panels.length - 1]);
    snapIndex = next;
    lockUntilScrollEnds();
    nextTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { passive: false });

  const syncMode = () => {
    applyDesktopLayout();
    requestAnimationFrame(measurePanels);
    if (!fineDesktop.matches || reduce.matches) unlockWheel();
  };

  addEventListener('resize', syncMode, { passive: true });
  fineDesktop.addEventListener?.('change', syncMode);
  reduce.addEventListener?.('change', syncMode);
})();