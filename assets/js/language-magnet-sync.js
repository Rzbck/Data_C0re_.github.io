(() => {
  const panelSelector = '.about-panel,.fullpage-panel';
  const langButtonSelector = '.lang-switcher button[data-lang]';
  const root = document.documentElement;
  const body = document.body;
  const isAbout = /(^|\/)about\.html$/.test(location.pathname);

  let anchor = null;
  let endTimer = null;
  let safetyTimer = null;
  let timers = [];
  let previousScrollBehavior = '';
  let previousOverflowAnchor = '';
  let primed = false;

  const style = document.createElement('style');
  style.dataset.languageMagnetStyle = 'true';
  style.textContent = `
    body.language-reflowing .about-panel-inner,
    body.language-reflowing .reveal,
    body.language-reflowing .fullpage-panel {
      transition: none !important;
      animation: none !important;
    }
    body.language-reflowing .about-panel-inner {
      transform: none !important;
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
    anchor = { panel, id: panel.id || '', index: list.indexOf(panel) };
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

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(endTimer);
    endTimer = null;
  };

  const finish = () => {
    if (!body.classList.contains('language-reflowing')) return;
    sync();
    clearTimers();
    clearTimeout(safetyTimer);
    safetyTimer = null;
    body.classList.remove('language-reflowing');
    root.style.scrollBehavior = previousScrollBehavior;
    body.style.overflowAnchor = previousOverflowAnchor;
    anchor = null;
    primed = false;
  };

  const prime = () => {
    if (!anchor) capture();
    if (!anchor) return;
    if (!primed) {
      previousScrollBehavior = root.style.scrollBehavior;
      previousOverflowAnchor = body.style.overflowAnchor;
    }
    primed = true;
    body.classList.add('language-reflowing');
    root.style.scrollBehavior = 'auto';
    body.style.overflowAnchor = 'none';
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(finish, 900);
  };

  const schedule = delay => {
    const timer = setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(sync)), delay);
    timers.push(timer);
  };

  const begin = () => {
    prime();
    if (!anchor) return;
    clearTimers();
    sync();
    requestAnimationFrame(() => requestAnimationFrame(sync));
    [90, 220, 420].forEach(schedule);
    document.fonts?.ready?.then(() => schedule(0)).catch?.(() => {});
    endTimer = setTimeout(finish, 500);
  };

  if (isAbout) {
    const stripLocaleTight = () => {
      document.querySelectorAll('.about-panel[data-locale-tight]').forEach(panel => panel.removeAttribute('data-locale-tight'));
    };
    stripLocaleTight();
    const tightObserver = new MutationObserver(mutations => {
      let dirty = false;
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-locale-tight') {
          const target = mutation.target;
          if (target instanceof Element && target.matches('.about-panel[data-locale-tight]')) {
            target.removeAttribute('data-locale-tight');
            dirty = true;
          }
        }
      }
      if (dirty && body.classList.contains('language-reflowing')) requestAnimationFrame(sync);
    });
    document.querySelectorAll('.about-panel').forEach(panel => tightObserver.observe(panel, { attributes: true, attributeFilter: ['data-locale-tight'] }));
  }

  document.addEventListener('pointerdown', event => {
    if (event.target instanceof Element && event.target.closest(langButtonSelector)) {
      capture();
      prime();
    }
  }, true);

  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest(langButtonSelector) && !anchor) {
      capture();
      prime();
    }
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

  const loadAscii = () => {
    if (document.querySelector('script[data-ascii-cursor-loader]')) return;
    const script = document.createElement('script');
    script.src = new URL('assets/js/ascii-cursor-glsl-v3.js', document.baseURI).href;
    script.defer = true;
    script.dataset.asciiCursorLoader = 'true';
    document.body.appendChild(script);
  };
  let asciiQueued = false;
  const queueAscii = () => {
    if (asciiQueued) return;
    asciiQueued = true;
    loadAscii();
  };
  window.addEventListener('pointermove', queueAscii, { once:true, passive:true });
  window.addEventListener('touchstart', queueAscii, { once:true, passive:true });
  if ('requestIdleCallback' in window) requestIdleCallback(queueAscii, { timeout:650 });
  else setTimeout(queueAscii, 180);
})();
