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

/* Homepage selected work: full-width moving image layers live directly behind each row.
   Only the hovered/focused desktop row plays. Tablet/mobile remain static and light. */
(() => {
  const init = () => {
    const section = document.querySelector('.home-work');
    if (!section || section.dataset.immersiveWorkReady === 'true') return;
    const list = section.querySelector('.index-list');
    if (!list) return;
    const rows = [...list.querySelectorAll('.index-row[data-preview-video],.index-row[data-preview-videos]')];
    if (!rows.length) return;

    section.dataset.immersiveWorkReady = 'true';
    section.classList.add('home-work-immersive');

    const visualStyle = document.createElement('style');
    visualStyle.dataset.homeWorkImmersive = 'true';
    visualStyle.textContent = `
      .home-work.home-work-immersive .index-browser{
        display:block!important;
        grid-template-columns:none!important;
        gap:0!important;
        min-height:0!important;
      }
      .home-work.home-work-immersive .index-preview{display:none!important}
      .home-work.home-work-immersive .index-list{
        width:100%;
        border-top:1px solid var(--line);
      }
      .home-work.home-work-immersive .index-row{
        position:relative;
        isolation:isolate;
        overflow:hidden;
        min-height:clamp(98px,11.5vh,138px);
        display:grid!important;
        grid-template-columns:52px minmax(0,1fr) 92px!important;
        gap:clamp(14px,2vw,30px)!important;
        align-items:center!important;
        padding:0 clamp(8px,1vw,16px)!important;
        background:#070707!important;
        border-bottom:1px solid var(--line)!important;
        transition:background .25s ease!important;
      }
      .home-work.home-work-immersive .index-row:hover,
      .home-work.home-work-immersive .index-row:focus{
        padding-left:clamp(8px,1vw,16px)!important;
        background:#070707!important;
      }
      .home-work.home-work-immersive .index-row>span,
      .home-work.home-work-immersive .index-row>div,
      .home-work.home-work-immersive .index-row>time{
        position:relative;
        z-index:4;
        min-width:0;
      }
      .home-work.home-work-immersive .index-row>span,
      .home-work.home-work-immersive .index-row>time{
        color:#b8b6b0;
        font-size:10px;
        letter-spacing:.1em;
      }
      .home-work.home-work-immersive .index-row>time{text-align:right}
      .home-work.home-work-immersive .index-row strong{
        display:block;
        max-width:1180px;
        font-size:clamp(28px,3.15vw,54px)!important;
        line-height:.92!important;
        letter-spacing:-.045em!important;
        color:var(--paper);
        transition:transform .3s var(--ease),color .2s ease;
      }
      .home-work.home-work-immersive .index-row small{
        display:block;
        max-width:1050px;
        margin-top:7px;
        color:#b1afa9;
        font-size:10px;
        line-height:1.25;
        letter-spacing:.075em;
        text-transform:uppercase;
      }
      .home-work.home-work-immersive .index-row.is-media-active strong{
        transform:translateX(8px);
        color:#fff;
      }
      .home-work-card-media{
        position:absolute;
        inset:0;
        z-index:0;
        overflow:hidden;
        pointer-events:none;
        background:#070707;
      }
      .home-work-card-media img,
      .home-work-card-media video{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
        transform:scale(1.025);
        filter:saturate(.82) contrast(1.05) brightness(.74);
        transition:opacity .32s ease,transform 1s var(--ease);
      }
      .home-work-card-media img{opacity:.105}
      .home-work-card-media video{opacity:0}
      .home-work-card-media::after{
        content:"";
        position:absolute;
        inset:0;
        z-index:2;
        background:linear-gradient(90deg,rgba(7,7,7,.82) 0%,rgba(7,7,7,.66) 46%,rgba(7,7,7,.72) 100%),linear-gradient(0deg,rgba(7,7,7,.3),rgba(7,7,7,.12));
      }
      .home-work.home-work-immersive .index-row.is-media-active .home-work-card-media video.is-ready{opacity:.42}
      .home-work.home-work-immersive .index-row.is-media-active .home-work-card-media img{opacity:.035}
      .home-work.home-work-immersive .index-row.is-media-active .home-work-card-media img,
      .home-work.home-work-immersive .index-row.is-media-active .home-work-card-media video{transform:scale(1)}

      @media(min-width:821px) and (pointer:fine){
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel{
          display:grid!important;
          grid-template-rows:auto minmax(0,1fr)!important;
          align-content:stretch!important;
          padding-top:calc(var(--header) + 18px)!important;
          padding-bottom:16px!important;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .section-head{
          margin-bottom:12px!important;
          min-height:0;
          align-items:end;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .section-head h2{
          max-width:none;
          font-size:clamp(40px,min(5vw,7.8vh),76px)!important;
          line-height:.9!important;
          letter-spacing:-.055em;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .section-head h2 br{display:none}
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .index-browser,
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .index-list{
          height:100%!important;
          min-height:0!important;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .index-list{
          display:grid!important;
          grid-template-rows:repeat(5,minmax(0,1fr))!important;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .index-row{
          min-height:0!important;
          height:auto!important;
        }
      }

      @media(min-width:821px) and (pointer:fine) and (max-height:780px){
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel{
          padding-top:calc(var(--header) + 12px)!important;
          padding-bottom:10px!important;
        }
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .section-head{margin-bottom:8px!important}
        body.fullpage-index .home-work.home-work-immersive.fullpage-panel .section-head h2{
          font-size:clamp(34px,min(4.3vw,6.4vh),54px)!important;
        }
        .home-work.home-work-immersive .index-row strong{
          font-size:clamp(24px,2.7vw,42px)!important;
        }
        .home-work.home-work-immersive .index-row small{font-size:9px;margin-top:5px}
      }

      @media(max-width:900px){
        .home-work.home-work-immersive .index-row{
          grid-template-columns:38px minmax(0,1fr) 64px!important;
          min-height:118px;
          gap:12px!important;
        }
        .home-work.home-work-immersive .index-row strong{
          font-size:clamp(27px,6vw,48px)!important;
          line-height:.96!important;
        }
        .home-work-card-media img{opacity:.16}
        .home-work-card-media video{display:none!important}
      }

      @media(max-width:600px){
        .home-work.home-work-immersive .section-head{align-items:flex-end;gap:18px;margin-bottom:22px}
        .home-work.home-work-immersive .section-head h2{font-size:clamp(42px,12vw,62px)!important}
        .home-work.home-work-immersive .index-row{
          grid-template-columns:30px minmax(0,1fr) 52px!important;
          min-height:112px;
          padding:0 5px!important;
        }
        .home-work.home-work-immersive .index-row:hover,
        .home-work.home-work-immersive .index-row:focus{padding-left:5px!important}
        .home-work.home-work-immersive .index-row strong{font-size:clamp(24px,7vw,38px)!important}
        .home-work.home-work-immersive .index-row small{font-size:8.5px;line-height:1.3}
      }
    `;
    document.head.appendChild(visualStyle);

    section.querySelector('[data-hover-preview-stage]')?.remove();

    const hoverCapable = () => window.matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeRow = null;
    let pauseTimer = 0;

    const deactivate = row => {
      if (!row) return;
      row.classList.remove('is-media-active');
      const video = row.querySelector('.home-work-card-media video');
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => video?.pause(), 260);
      if (activeRow === row) activeRow = null;
    };

    rows.forEach(row => {
      const posterSrc = row.dataset.previewPoster || '';
      const videoSources = (row.dataset.previewVideos || row.dataset.previewVideo || '').split('|').map(value => value.trim()).filter(Boolean);
      const media = document.createElement('span');
      media.className = 'home-work-card-media';
      media.setAttribute('aria-hidden', 'true');

      if (posterSrc) {
        const poster = document.createElement('img');
        poster.src = posterSrc;
        poster.alt = '';
        poster.loading = 'lazy';
        media.appendChild(poster);
      }

      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.tabIndex = -1;
      media.appendChild(video);
      row.prepend(media);

      row.removeAttribute('data-preview-poster');
      row.removeAttribute('data-preview-video');
      row.removeAttribute('data-preview-videos');

      let lastSource = '';
      const pickSource = () => {
        if (!videoSources.length) return '';
        if (videoSources.length === 1) return videoSources[0];
        const choices = videoSources.filter(source => source !== lastSource);
        const source = choices[Math.floor(Math.random() * choices.length)] || videoSources[0];
        lastSource = source;
        return source;
      };

      const play = () => {
        if (!hoverCapable() || reduce.matches) return;
        const motionToggle = document.querySelector('[data-motion-toggle]');
        if (motionToggle?.getAttribute('aria-pressed') === 'true') return;
        if (activeRow && activeRow !== row) deactivate(activeRow);
        activeRow = row;
        clearTimeout(pauseTimer);
        row.classList.add('is-media-active');

        const source = video.dataset.activeSource || pickSource();
        if (!source) return;
        const reveal = () => {
          if (!row.classList.contains('is-media-active')) return;
          if (Number.isFinite(video.duration) && video.duration > .8) {
            const edge = Math.min(1.2, video.duration * .06);
            const max = Math.max(edge, video.duration - Math.min(1.8, video.duration * .08));
            try { video.currentTime = edge + Math.random() * Math.max(.01, max - edge); } catch {}
          }
          video.classList.add('is-ready');
          video.play().catch(() => {});
        };

        if (video.dataset.activeSource === source) {
          if (video.readyState >= 2) reveal();
          else video.addEventListener('canplay', reveal, { once: true });
          return;
        }
        video.classList.remove('is-ready');
        video.dataset.activeSource = source;
        video.src = source;
        video.load();
        if (video.readyState >= 2) reveal();
        else video.addEventListener('canplay', reveal, { once: true });
      };

      row.addEventListener('mouseenter', play, { passive: true });
      row.addEventListener('mouseleave', () => deactivate(row), { passive: true });
      row.addEventListener('focus', play);
      row.addEventListener('blur', () => deactivate(row));
    });

    window.addEventListener('resize', () => {
      if (!hoverCapable() && activeRow) deactivate(activeRow);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && activeRow) deactivate(activeRow);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
