(() => {
  const panelSelector = '.about-panel,.fullpage-panel';
  const langButtonSelector = '.lang-switcher button[data-lang]';
  const root = document.documentElement;
  const body = document.body;
  let anchor = null;
  let resizeObserver = null;
  let endTimer = null;
  let timers = [];
  let previousScrollBehavior = '';
  let previousOverflowAnchor = '';

  const style = document.createElement('style');
  style.dataset.languageMagnetStyle = 'true';
  style.textContent = `
    body.language-reflowing .about-panel-inner,
    body.language-reflowing .reveal,
    body.language-reflowing .fullpage-panel {
      transition: none !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(style);

  const panels = () => [...document.querySelectorAll(panelSelector)];
  const topOf = panel => panel.getBoundingClientRect().top + window.scrollY;

  const activePanel = () => {
    const list = panels();
    if (!list.length) return null;
    const marked = list.find(panel => panel.classList.contains('is-active') || panel.classList.contains('is-fullpage-active'));
    if (marked) return marked;
    const center = window.scrollY + window.innerHeight * 0.5;
    let best = list[0];
    let bestDistance = Infinity;
    list.forEach(panel => {
      const panelCenter = topOf(panel) + panel.offsetHeight * 0.5;
      const distance = Math.abs(panelCenter - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = panel;
      }
    });
    return best;
  };

  const capture = () => {
    const list = panels();
    const panel = activePanel();
    if (!panel || !list.length) {
      anchor = null;
      return;
    }
    anchor = {
      panel,
      id: panel.id || '',
      index: list.indexOf(panel)
    };
  };

  const resolve = () => {
    const list = panels();
    if (!list.length) return null;
    if (anchor?.panel?.isConnected) return anchor.panel;
    if (anchor?.id) {
      const byId = document.getElementById(anchor.id);
      if (byId?.matches(panelSelector)) return byId;
    }
    if (Number.isInteger(anchor?.index)) return list[Math.max(0, Math.min(list.length - 1, anchor.index))] || null;
    return activePanel();
  };

  const markActive = panel => {
    const list = panels();
    const index = list.indexOf(panel);
    if (index < 0) return;
    list.forEach((item, i) => {
      if (item.classList.contains('about-panel')) item.classList.toggle('is-active', i === index);
      if (item.classList.contains('fullpage-panel')) item.classList.toggle('is-fullpage-active', i === index);
    });
  };

  const sync = () => {
    if (!body.classList.contains('language-reflowing')) return;
    const panel = resolve();
    if (!panel) return;
    window.scrollTo(0, Math.round(topOf(panel)));
    markActive(panel);
  };

  const schedule = delay => {
    const timer = setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(sync)), delay);
    timers.push(timer);
  };

  const finish = () => {
    if (!body.classList.contains('language-reflowing')) return;
    sync();
    resizeObserver?.disconnect();
    resizeObserver = null;
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(endTimer);
    endTimer = null;
    body.classList.remove('language-reflowing');
    root.style.scrollBehavior = previousScrollBehavior;
    body.style.overflowAnchor = previousOverflowAnchor;
    anchor = null;
  };

  const begin = () => {
    if (!anchor) capture();
    if (!anchor) return;

    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(endTimer);

    if (!body.classList.contains('language-reflowing')) {
      previousScrollBehavior = root.style.scrollBehavior;
      previousOverflowAnchor = body.style.overflowAnchor;
    }

    body.classList.add('language-reflowing');
    root.style.scrollBehavior = 'auto';
    body.style.overflowAnchor = 'none';

    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => requestAnimationFrame(sync));
    panels().forEach(panel => resizeObserver.observe(panel));

    sync();
    requestAnimationFrame(() => requestAnimationFrame(sync));
    [35, 90, 170, 300, 480, 650].forEach(schedule);
    document.fonts?.ready?.then(() => schedule(0)).catch?.(() => {});
    endTimer = setTimeout(finish, 760);
  };

  document.addEventListener('pointerdown', event => {
    if (event.target instanceof Element && event.target.closest(langButtonSelector)) capture();
  }, true);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest(langButtonSelector) && !anchor) capture();
  }, true);

  document.addEventListener('data-c0re-languagechange', begin);

  const blockDuringReflow = event => {
    if (!body.classList.contains('language-reflowing')) return;
    event.preventDefault();
  };
  window.addEventListener('wheel', blockDuringReflow, { capture: true, passive: false });
  window.addEventListener('touchmove', blockDuringReflow, { capture: true, passive: false });
  window.addEventListener('keydown', event => {
    if (!body.classList.contains('language-reflowing')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.preventDefault();
  }, true);

  // Temporary test: larger desktop-only GLSL ASCII reaction-diffusion cursor.
  if (!document.querySelector('script[data-ascii-cursor-loader]')) {
    const script = document.createElement('script');
    script.src = new URL('assets/js/ascii-cursor-glsl-v2.js', document.baseURI).href;
    script.defer = true;
    script.dataset.asciiCursorLoader = 'true';
    document.body.appendChild(script);
  }
})();