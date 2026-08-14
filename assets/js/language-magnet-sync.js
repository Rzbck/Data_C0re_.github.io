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

  /* GLSL stays quiet at rest. On desktop it wakes on click, middle click and wheel/trackpad scroll. */
  const isContact = /(^|\/)contact\.html$/.test(location.pathname);
  const asciiDesktopEligible = () => !isContact && window.matchMedia('(min-width:901px) and (pointer:fine) and (hover:hover)').matches;
  let asciiQueued = false;
  let asciiLoaded = false;
  let releaseTimer = 0;
  let lastPointer = { x: innerWidth * 0.5, y: innerHeight * 0.5, button: 0 };

  const asciiGateStyle = document.createElement('style');
  asciiGateStyle.dataset.asciiClickGate = 'true';
  asciiGateStyle.textContent = `
    body:not(.ascii-cursor-engaged) canvas[data-ascii-cursor] {
      opacity: 0 !important;
    }
  `;
  document.head.appendChild(asciiGateStyle);

  const wakeAscii = () => {
    if (!asciiLoaded || !body.classList.contains('ascii-cursor-engaged')) return;
    try {
      window.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: false,
        clientX: lastPointer.x,
        clientY: lastPointer.y,
        pointerType: 'mouse',
        button: lastPointer.button,
        buttons: lastPointer.button === 1 ? 4 : 1
      }));
    } catch {}
  };

  const loadAscii = () => {
    if (!asciiDesktopEligible()) return;
    const existing = document.querySelector('script[data-ascii-cursor-loader]');
    if (existing) {
      asciiLoaded = true;
      wakeAscii();
      return;
    }
    const script = document.createElement('script');
    script.src = new URL('assets/js/ascii-cursor-glsl-v3.js', document.baseURI).href;
    script.defer = true;
    script.dataset.asciiCursorLoader = 'true';
    script.addEventListener('load', () => {
      asciiLoaded = true;
      wakeAscii();
    }, { once: true });
    document.body.appendChild(script);
  };

  const queueAscii = () => {
    if (asciiQueued || !asciiDesktopEligible()) return;
    asciiQueued = true;
    loadAscii();
  };

  const engageAt = (x, y, button = 0, duration = 1250) => {
    if (!asciiDesktopEligible() || body.classList.contains('menu-open')) return;
    const nx = Number(x), ny = Number(y);
    if (Number.isFinite(nx)) lastPointer.x = nx;
    if (Number.isFinite(ny)) lastPointer.y = ny;
    lastPointer.button = button;
    clearTimeout(releaseTimer);
    body.classList.add('ascii-cursor-engaged');
    queueAscii();
    requestAnimationFrame(wakeAscii);
    releaseTimer = setTimeout(() => body.classList.remove('ascii-cursor-engaged'), duration);
  };

  const engageAscii = event => {
    if (!asciiDesktopEligible() || event.pointerType === 'touch' || (event.button !== 0 && event.button !== 1)) return;
    engageAt(event.clientX, event.clientY, event.button, 1250);
  };

  const trackAscii = event => {
    if (!body.classList.contains('ascii-cursor-engaged') || event.pointerType === 'touch') return;
    lastPointer.x = event.clientX;
    lastPointer.y = event.clientY;
  };

  const releaseAscii = () => {
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(() => body.classList.remove('ascii-cursor-engaged'), 1250);
  };

  const scrollAscii = event => {
    if (!asciiDesktopEligible() || body.classList.contains('language-reflowing')) return;
    engageAt(event.clientX, event.clientY, 0, 900);
  };

  window.addEventListener('pointerdown', engageAscii, { passive: true });
  window.addEventListener('pointermove', trackAscii, { passive: true });
  window.addEventListener('pointerup', releaseAscii, { passive: true });
  window.addEventListener('pointercancel', releaseAscii, { passive: true });
  window.addEventListener('wheel', scrollAscii, { passive: true });
  window.addEventListener('blur', releaseAscii, { passive: true });
  window.addEventListener('resize', () => {
    if (!asciiDesktopEligible()) body.classList.remove('ascii-cursor-engaged');
  }, { passive: true });
})();
