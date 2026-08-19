(() => {
  'use strict';

  const mobileQuery = matchMedia('(max-width:820px), (pointer:coarse)');
  if (!mobileQuery.matches || window.DATA_C0RE_MEDIA_CONTROLLER) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const saveData = Boolean(connection?.saveData);
  const effectiveType = String(connection?.effectiveType || '');
  const constrainedNetwork = saveData || /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g';
  const HOT_LIMIT = saveData ? 5 : constrainedNetwork ? 6 : 8;
  const RELEASE_DELAY = saveData ? 8500 : constrainedNetwork ? 11000 : 15000;
  const START_THRESHOLD = 0.34;
  const STOP_THRESHOLD = 0.10;
  const KINETIC_STOP_THRESHOLD = 0.025;
  const WARM_MARGIN = constrainedNetwork ? '85% 0px' : '125% 0px';
  const managed = new Map();
  let warmObserver = null;
  let playObserver = null;
  let scrolling = false;
  let scrollTimer = 0;
  let lastScrollY = scrollY;
  let lastScrollAt = performance.now();

  const now = () => performance.now();
  const isPreview = video => Boolean(
    video.closest('.archive-entry-media,.home-work-card-media') ||
    video.matches('[data-hover-preview-video],[data-work-preview-video]')
  );
  const isEligible = video => video instanceof HTMLVideoElement && !isPreview(video);
  const motionOff = () => reduced.matches || document.body.classList.contains('motion-off');
  const viewportDistance = video => {
    const r = video.getBoundingClientRect();
    if (r.bottom < 0) return -r.bottom;
    if (r.top > innerHeight) return r.top - innerHeight;
    return 0;
  };
  const visibilityScore = entry => {
    const h = Math.max(1, Math.min(entry.boundingClientRect.height || 1, innerHeight || 1));
    const vertical = Math.max(0, entry.intersectionRect.height || 0) / h;
    return Math.max(entry.intersectionRatio || 0, vertical);
  };

  const style = document.createElement('style');
  style.dataset.dcMobileMediaController = '';
  style.textContent = `
    @media (max-width:820px), (pointer:coarse){
      video[data-dc-media-managed="1"]{transition:opacity .11s linear}
      video[data-dc-media-managed="1"].dc-media-awaiting-frame:not([poster]){opacity:0!important}
      html.fullpage-mode{scroll-snap-type:y proximity}
      html.fullpage-mode .fullpage-panel{scroll-snap-align:start;scroll-snap-stop:normal}
      main>article>.project-section,.fullpage-project .project-section{content-visibility:auto;contain-intrinsic-size:auto 900px}
      .fullpage-project .project-hero{content-visibility:auto;contain-intrinsic-size:auto 100svh}
    }
  `;
  document.head.appendChild(style);

  const rememberSources = video => ({
    direct: video.getAttribute('src') || '',
    directData: video.dataset.src || '',
    sources: [...video.querySelectorAll('source')].map(source => ({
      source,
      src: source.getAttribute('src') || '',
      dataSrc: source.dataset.src || ''
    }))
  });

  const hasAttachedSource = video => Boolean(video.getAttribute('src') || [...video.querySelectorAll('source')].some(source => source.getAttribute('src')));

  const restoreSources = state => {
    const video = state.video;
    clearTimeout(state.releaseTimer);
    state.releaseTimer = 0;
    if (!state.detached && hasAttachedSource(video)) return;
    if (state.sources.direct) video.setAttribute('src', state.sources.direct);
    else if (state.sources.directData) video.setAttribute('src', state.sources.directData);
    state.sources.sources.forEach(item => {
      const src = item.src || item.dataSrc;
      if (src) item.source.setAttribute('src', src);
    });
    video.preload = state.wantPlay && !constrainedNetwork ? 'auto' : 'metadata';
    state.detached = false;
    try { video.load(); } catch {}
  };

  const detachSources = state => {
    const video = state.video;
    if (state.playing || state.wantPlay || state.warm || state.detached) return;
    if (viewportDistance(video) < innerHeight * 2.4) return;
    video.pause();
    if (video.getAttribute('src')) video.removeAttribute('src');
    state.sources.sources.forEach(item => item.source.removeAttribute('src'));
    video.preload = 'none';
    state.detached = true;
    state.prepared = false;
    state.frameReady = Boolean(video.getAttribute('poster'));
    video.classList.toggle('dc-media-awaiting-frame', !state.frameReady);
    try { video.load(); } catch {}
  };

  const releaseLater = state => {
    clearTimeout(state.releaseTimer);
    state.releaseTimer = setTimeout(() => detachSources(state), RELEASE_DELAY);
  };

  const prepareStartPosition = state => {
    if (state.positionPrepared) return;
    const video = state.video;
    if (video.readyState < HTMLMediaElement.HAVE_METADATA || !Number.isFinite(video.duration) || video.duration <= .6) return;
    state.positionPrepared = true;
    const duration = video.duration;
    const timeline = Number(video.dataset.timeline);
    let target;
    if (Number.isFinite(timeline)) {
      target = duration * Math.max(.02, Math.min(.96, timeline));
    } else {
      const edge = Math.min(1.5, duration * .06);
      const max = Math.max(edge, duration - Math.min(2, duration * .08));
      target = edge + Math.random() * Math.max(.01, max - edge);
    }
    try { video.currentTime = Math.max(0, Math.min(duration - .05, target)); } catch {}
    const rate = Number(video.dataset.rate);
    if (Number.isFinite(rate) && rate > 0) video.playbackRate = rate;
  };

  const markFrameReady = state => {
    if (!state.wantPlay || document.hidden) return;
    state.frameReady = true;
    state.video.classList.remove('dc-media-awaiting-frame');
    state.lastActive = now();
  };

  const armFirstFrame = state => {
    const video = state.video;
    if (state.frameReady || state.frameArmed) return;
    state.frameArmed = true;
    const done = () => {
      state.frameArmed = false;
      markFrameReady(state);
    };
    if ('requestVideoFrameCallback' in video) {
      try { video.requestVideoFrameCallback(done); return; } catch {}
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) requestAnimationFrame(done);
    else video.addEventListener('loadeddata', () => requestAnimationFrame(done), { once: true });
  };

  const pauseState = (state, preserveIntent = false) => {
    if (!preserveIntent) state.wantPlay = false;
    if (!state.video.paused) state.video.pause();
    state.playing = false;
  };

  const startState = state => {
    const video = state.video;
    if (motionOff() || document.hidden || !state.wantPlay) return;
    restoreSources(state);
    video.preload = constrainedNetwork ? 'metadata' : 'auto';
    prepareStartPosition(state);
    const playNow = () => {
      if (!state.wantPlay || motionOff() || document.hidden) return;
      armFirstFrame(state);
      const promise = video.play();
      if (promise?.then) promise.then(() => {
        state.playing = true;
        state.lastActive = now();
        armFirstFrame(state);
      }).catch(() => { state.playing = false; });
    };
    const begin = () => {
      if (!state.wantPlay || motionOff() || document.hidden) return;
      prepareStartPosition(state);
      if (video.seeking) video.addEventListener('seeked', playNow, { once: true });
      else playNow();
    };
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) begin();
    else video.addEventListener('loadedmetadata', begin, { once: true });
  };

  const syncState = state => {
    if (motionOff() || document.hidden) {
      pauseState(state, true);
      return;
    }
    const stopThreshold = scrolling ? KINETIC_STOP_THRESHOLD : STOP_THRESHOLD;
    if (state.wantPlay) {
      if (!state.inViewport || state.score <= stopThreshold) {
        pauseState(state);
        releaseLater(state);
      } else if (!state.playing && (!scrolling || state.score >= .72)) {
        startState(state);
      }
      return;
    }
    if (state.score >= START_THRESHOLD && state.inViewport) {
      state.wantPlay = true;
      if (!scrolling || state.score >= .72) startState(state);
    } else if (!state.warm) {
      releaseLater(state);
    }
  };

  const enforceHotBudget = () => {
    const hot = [...managed.values()].filter(state => !state.detached && !state.playing && !state.wantPlay);
    if (hot.length <= HOT_LIMIT) return;
    hot.sort((a, b) => (viewportDistance(b.video) - viewportDistance(a.video)) || (a.lastActive - b.lastActive));
    hot.slice(0, hot.length - HOT_LIMIT).forEach(detachSources);
  };

  const register = video => {
    if (!isEligible(video) || managed.has(video)) return managed.get(video) || null;
    const state = {
      video,
      sources: rememberSources(video),
      warm: false,
      inViewport: false,
      score: 0,
      wantPlay: false,
      playing: !video.paused,
      detached: false,
      prepared: false,
      positionPrepared: false,
      frameReady: video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
      frameArmed: false,
      releaseTimer: 0,
      lastActive: now()
    };
    managed.set(video, state);
    video.dataset.dcMediaManaged = '1';
    video.dataset.perfDetached = 'true';
    video.setAttribute('data-stagger-video', '');
    video.preload = 'none';
    if (!state.frameReady && !video.getAttribute('poster')) video.classList.add('dc-media-awaiting-frame');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    video.addEventListener('playing', () => {
      state.playing = true;
      state.lastActive = now();
      armFirstFrame(state);
    }, { passive: true });
    video.addEventListener('pause', () => { state.playing = false; }, { passive: true });
    video.addEventListener('loadedmetadata', () => prepareStartPosition(state), { passive: true });

    warmObserver?.observe(video);
    playObserver?.observe(video);
    return state;
  };

  const registerAll = input => {
    const videos = input ? [...input] : [...document.querySelectorAll('video')];
    videos.forEach(register);
    return videos.length;
  };

  warmObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = managed.get(entry.target);
      if (!state) return;
      state.warm = entry.isIntersecting;
      if (state.warm) {
        restoreSources(state);
        state.video.preload = 'metadata';
        if (state.video.readyState === 0 && hasAttachedSource(state.video)) {
          try { state.video.load(); } catch {}
        }
        state.lastActive = now();
      } else if (!state.wantPlay) {
        releaseLater(state);
      }
    });
    enforceHotBudget();
  }, { rootMargin: WARM_MARGIN, threshold: 0 });

  playObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = managed.get(entry.target);
      if (!state) return;
      state.inViewport = entry.isIntersecting && entry.intersectionRect.height > 0 && entry.intersectionRect.width > 0;
      state.score = visibilityScore(entry);
      syncState(state);
    });
  }, { rootMargin: '0px', threshold: [0, .025, .10, .18, .34, .5, .72, 1] });

  const syncAll = () => managed.forEach(syncState);
  const setScrolling = value => {
    if (scrolling === value) return;
    scrolling = value;
    document.documentElement.toggleAttribute('data-dc-media-scrolling', value);
    if (!value) syncAll();
  };
  const finishScrollSoon = () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => setScrolling(false), 130);
  };
  addEventListener('scroll', () => {
    const t = now();
    const dy = Math.abs(scrollY - lastScrollY);
    const dt = Math.max(1, t - lastScrollAt);
    lastScrollY = scrollY;
    lastScrollAt = t;
    if (dy / dt > .45 || dy > 24) setScrolling(true);
    finishScrollSoon();
  }, { passive: true });
  addEventListener('scrollend', () => setScrolling(false), { passive: true });
  addEventListener('touchmove', () => { setScrolling(true); finishScrollSoon(); }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) managed.forEach(state => pauseState(state, true));
    else requestAnimationFrame(syncAll);
  });
  reduced.addEventListener?.('change', syncAll);
  addEventListener('resize', syncAll, { passive: true });

  const mutation = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node instanceof HTMLVideoElement) register(node);
      node.querySelectorAll?.('video').forEach(register);
    }));
  });
  mutation.observe(document.documentElement, { childList: true, subtree: true });

  const controller = {
    register,
    registerAll,
    owns: video => managed.has(video),
    sync: video => { const state = managed.get(video) || register(video); if (state) syncState(state); },
    rescan: () => registerAll(),
    status: () => [...managed.values()].map(state => ({
      src: state.video.currentSrc || state.video.src || '',
      visible: state.inViewport,
      score: Number(state.score.toFixed(3)),
      warm: state.warm,
      playing: !state.video.paused,
      detached: state.detached,
      droppedFrames: state.video.getVideoPlaybackQuality ? state.video.getVideoPlaybackQuality().droppedVideoFrames : null
    }))
  };
  window.DATA_C0RE_MEDIA_CONTROLLER = controller;
  window.DATA_C0RE_MEDIA_STATUS = controller.status;

  const boot = () => {
    registerAll();
    dispatchEvent(new CustomEvent('data-c0re-media-controller-ready'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
