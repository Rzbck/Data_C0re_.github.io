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

  const q = (selector, scope = document) => scope.querySelector(selector);
  const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const panelList = () => {
    let list = [];
    if (filename === 'comedie.html') {
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

  root.classList.add('project-native-scroll');
  body.classList.add('project-native-scroll-body');
  panels.forEach(panel => panel.classList.add('project-native-panel'));

  const style = document.createElement('style');
  style.dataset.projectNativeScroll = 'true';
  style.textContent = `
    html.project-native-scroll{scroll-behavior:auto!important}
    html.project-native-scroll .project-native-panel{scroll-snap-stop:normal!important}
    html.project-native-scroll .project-next{scroll-snap-align:none!important;scroll-snap-stop:normal!important}
    body.comedie-page .production-block.comedie-show-screen{
      content-visibility:visible!important;
      contain-intrinsic-size:none!important;
    }
    @media(max-width:820px),(pointer:coarse),(prefers-reduced-motion:reduce){
      html.project-native-scroll{scroll-snap-type:none!important}
    }
    @media(min-width:821px) and (pointer:fine) and (prefers-reduced-motion:no-preference){
      html.project-native-scroll{scroll-snap-type:y proximity!important;scroll-padding-top:0!important}
      html.project-native-scroll .project-native-panel{scroll-snap-align:start}
      body.project-native-scroll-body{overscroll-behavior-y:auto!important}
      body.fullpage-project .project-section.fullpage-panel,
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

  applyDesktopLayout();

  const warmImage = image => {
    if (!(image instanceof HTMLImageElement) || image.dataset.projectWarm === 'true') return;
    image.dataset.projectWarm = 'true';
    if (image.loading === 'lazy') image.loading = 'eager';
    if ('fetchPriority' in image && image.fetchPriority === 'low') image.fetchPriority = 'auto';
    const decode = () => {
      try {
        const promise = image.decode?.();
        promise?.catch?.(() => {});
      } catch {}
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

  if ('IntersectionObserver' in window) {
    const ratios = new Map(panels.map(panel => [panel, 0]));
    const activeObserver = new IntersectionObserver(entries => {
      for (const entry of entries) ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      let best = -1;
      let bestRatio = 0;
      panels.forEach((panel, index) => {
        const ratio = ratios.get(panel) || 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = index;
        }
      });
      if (best < 0) return;
      panels.forEach((panel, index) => panel.classList.toggle('is-fullpage-active', index === best));
      warmAround(best);
    }, { threshold: [0, .1, .25, .4, .55, .7, .85] });
    panels.forEach(panel => activeObserver.observe(panel));

    const warmObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = panels.indexOf(entry.target);
        warmAround(index);
      }
    }, { rootMargin: '120% 0px 120% 0px', threshold: 0 });
    panels.forEach(panel => warmObserver.observe(panel));
  } else {
    panels.slice(0, 2).forEach(warmPanel);
  }

  fineDesktop.addEventListener?.('change', applyDesktopLayout);
  reduce.addEventListener?.('change', applyDesktopLayout);
})();