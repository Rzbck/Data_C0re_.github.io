(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const interval = saveData ? 300 : coarse ? 180 : 115;
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 16;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const states = new Map();
  let layer = null;
  let timer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;

  const boost = input => {
    let [r, g, b] = input;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const mid = (max + min) * .5;
    const span = max - min;
    if (span > 4) {
      const saturation = .58;
      r = clamp(r + (r - mid) * saturation, 0, 255);
      g = clamp(g + (g - mid) * saturation, 0, 255);
      b = clamp(b + (b - mid) * saturation, 0, 255);
    }
    const peak = Math.max(r, g, b);
    if (peak < 96) {
      const lift = 96 / Math.max(peak, 1);
      r *= lift;
      g *= lift;
      b *= lift;
    }
    return [Math.round(clamp(r, 0, 255)), Math.round(clamp(g, 0, 255)), Math.round(clamp(b, 0, 255))];
  };

  /* Only sample a shallow band around the actual image contour. The centre of
     the image never contributes to the ambient field. The outermost row/column
     is intentionally weighted twice so the colour feels emitted by the frame. */
  const pointSets = (() => {
    const w = canvas.width, h = canvas.height;
    const left = [], right = [], top = [], bottom = [];
    for (let y = 1; y < h - 1; y++) {
      left.push([0, y], [0, y], [1, y], [2, y]);
      right.push([w - 1, y], [w - 1, y], [w - 2, y], [w - 3, y]);
    }
    for (let x = 1; x < w - 1; x++) {
      top.push([x, 0], [x, 0], [x, 1]);
      bottom.push([x, h - 1], [x, h - 1], [x, h - 2]);
    }
    return { left, right, top, bottom };
  })();

  const average = (data, points) => {
    let r = 0, g = 0, b = 0, weight = 0;
    for (const [x, y] of points) {
      const i = (y * canvas.width + x) * 4;
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
      const saturation = (max - min) / 255;
      const luminance = (rr * .2126 + gg * .7152 + bb * .0722) / 255;
      const w = .22 + luminance * .46 + saturation * .82;
      r += rr * w;
      g += gg * w;
      b += bb * w;
      weight += w;
    }
    return weight ? boost([r / weight, g / weight, b / weight]) : [20, 20, 20];
  };

  const ensureLayer = () => {
    if (layer?.isConnected) return layer;
    layer = document.createElement('div');
    layer.className = 'video-ambient-field';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    return layer;
  };

  const setColour = (emitter, name, colour) => {
    emitter.style.setProperty(name, `${colour[0]} ${colour[1]} ${colour[2]}`);
  };
  const setPosition = (emitter, name, value) => {
    emitter.style.setProperty(name, `${Math.round(value)}px`);
  };

  const mediaRect = video => {
    const rect = video.getBoundingClientRect();
    if (!rect.width || !rect.height || !video.videoWidth || !video.videoHeight) return rect;
    const fit = getComputedStyle(video).objectFit || 'fill';
    if (fit === 'cover' || fit === 'fill') return rect;

    const sourceRatio = video.videoWidth / video.videoHeight;
    const boxRatio = rect.width / rect.height;
    let width = rect.width;
    let height = rect.height;
    if (sourceRatio > boxRatio) height = width / sourceRatio;
    else width = height * sourceRatio;
    return {
      left: rect.left + (rect.width - width) * .5,
      right: rect.left + (rect.width + width) * .5,
      top: rect.top + (rect.height - height) * .5,
      bottom: rect.top + (rect.height + height) * .5,
      width,
      height
    };
  };

  const drawVisibleFrame = video => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const rect = video.getBoundingClientRect();
    const fit = getComputedStyle(video).objectFit || 'fill';
    let sx = 0, sy = 0, sw = vw, sh = vh;

    if (fit === 'cover' && rect.width > 0 && rect.height > 0) {
      const sourceRatio = vw / vh;
      const boxRatio = rect.width / rect.height;
      if (sourceRatio > boxRatio) {
        sw = vh * boxRatio;
        sx = (vw - sw) * .5;
      } else {
        sh = vw / boxRatio;
        sy = (vh - sh) * .5;
      }
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  };

  const updateGeometry = (video, state, activeCount) => {
    const rect = mediaRect(video);
    const left = clamp(rect.left, 0, innerWidth);
    const right = clamp(rect.right, 0, innerWidth);
    const top = clamp(rect.top, 0, innerHeight);
    const bottom = clamp(rect.bottom, 0, innerHeight);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    /* The emitters sit on the actual contour, not in the centre of the video. */
    setPosition(state.emitter, '--amb-source-left', left + Math.min(3, width * .012));
    setPosition(state.emitter, '--amb-source-right', right - Math.min(3, width * .012));
    setPosition(state.emitter, '--amb-source-top', top + Math.min(3, height * .018));
    setPosition(state.emitter, '--amb-source-bottom', bottom - Math.min(3, height * .018));
    setPosition(state.emitter, '--amb-source-x', left + width * .5);
    setPosition(state.emitter, '--amb-source-y', top + height * .5);

    const visibleW = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const viewportShare = (visibleW * visibleH) / Math.max(innerWidth * innerHeight, 1);
    const crowdFactor = activeCount > 3 ? .90 : activeCount > 1 ? .96 : 1;
    const strength = clamp((.66 + state.ratio * .22 + Math.min(viewportShare, .55) * .34) * crowdFactor, .58, 1);
    state.emitter.style.setProperty('--amb-strength', strength.toFixed(3));
  };

  const isActive = (video, state) => Boolean(
    state.visible &&
    !state.unavailable &&
    !video.paused &&
    !video.ended &&
    video.readyState >= 2 &&
    video.videoWidth &&
    video.videoHeight
  );

  const sample = (video, state) => {
    try {
      drawVisibleFrame(video);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const next = {
        left: average(data, pointSets.left),
        right: average(data, pointSets.right),
        top: average(data, pointSets.top),
        bottom: average(data, pointSets.bottom)
      };
      for (const key of Object.keys(next)) {
        state.colours[key] = next[key].map((value, index) => Math.round(mix(state.colours[key][index], value, .34)));
      }
      setColour(state.emitter, '--page-amb-left', state.colours.left);
      setColour(state.emitter, '--page-amb-right', state.colours.right);
      setColour(state.emitter, '--page-amb-top', state.colours.top);
      setColour(state.emitter, '--page-amb-bottom', state.colours.bottom);
      state.emitter.classList.add('is-active');
      return true;
    } catch {
      state.unavailable = true;
      state.emitter.classList.remove('is-active');
      return false;
    }
  };

  const schedule = (delay = interval) => {
    if (timer || document.hidden) return;
    timer = window.setTimeout(() => {
      timer = 0;
      requestAnimationFrame(tick);
    }, delay);
  };

  const tick = now => {
    if (document.hidden) return;
    const active = [];
    for (const [video, state] of states) {
      if (isActive(video, state)) active.push([video, state]);
      else state.emitter.classList.remove('is-active');
    }

    if (!active.length) {
      document.body?.classList.remove('video-page-ambient-active');
      return;
    }

    document.body?.classList.add('video-page-ambient', 'video-page-ambient-active');
    for (const [video, state] of active) {
      updateGeometry(video, state, active.length);
      if (now - state.lastSample >= interval) {
        state.lastSample = now;
        sample(video, state);
      }
    }
    schedule();
  };

  const wake = () => schedule(0);

  const shouldAutoResume = video => {
    if (!video.muted || video.dataset.perfDetached === 'true') return false;
    if (video.matches('[data-hover-preview-video],[data-work-preview-video],.archive-entry-media video')) return false;
    return video.loop || video.autoplay || video.matches('[data-stagger-video],[data-lumina-experience],[data-lazy-video]');
  };

  const resumeVideo = (video, state) => {
    if (document.hidden || !state.visible || !shouldAutoResume(video)) return;
    const before = video.currentTime;
    video.play().catch(() => {});
    window.setTimeout(() => {
      if (document.hidden || !state.visible || video.paused || !shouldAutoResume(video)) return;
      if (Math.abs(video.currentTime - before) > .025) return;
      /* Some browsers return from a background tab with a live play state but a
         stalled decoder. A pause/play cycle reliably wakes that decoder without
         reloading the source or losing the current timeline position. */
      video.pause();
      requestAnimationFrame(() => video.play().catch(() => {}));
    }, 420);
  };

  const resumeVisibleVideos = () => {
    if (document.hidden) return;
    for (const [video, state] of states) resumeVideo(video, state);
    wake();
    window.setTimeout(wake, 180);
  };

  const attach = video => {
    if (!(video instanceof HTMLVideoElement) || states.has(video)) return;
    const emitter = document.createElement('div');
    emitter.className = 'video-ambient-emitter';
    ensureLayer().appendChild(emitter);

    const state = {
      visible: false,
      ratio: 0,
      unavailable: false,
      emitter,
      lastSample: 0,
      colours: {
        left: [22, 22, 22],
        right: [22, 22, 22],
        top: [22, 22, 22],
        bottom: [22, 22, 22]
      }
    };
    states.set(video, state);

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .015);
      state.ratio = entry?.intersectionRatio || 0;
      if (state.visible && !document.hidden && video.paused && shouldAutoResume(video)) {
        video.play().catch(() => {});
      }
      wake();
    }, { rootMargin: '90px 0px', threshold: [0, .015, .1, .25, .5, .75, 1] });
    observer.observe(video);

    video.addEventListener('playing', wake, { passive: true });
    video.addEventListener('play', wake, { passive: true });
    video.addEventListener('pause', wake, { passive: true });
    video.addEventListener('ended', wake, { passive: true });
    video.addEventListener('emptied', wake, { passive: true });
  };

  const scan = rootNode => {
    if (rootNode instanceof HTMLVideoElement) attach(rootNode);
    rootNode.querySelectorAll?.('video').forEach(attach);
  };

  const boot = () => {
    document.body?.classList.add('video-page-ambient');
    ensureLayer();
    scan(document);
    new MutationObserver(mutations => {
      for (const mutation of mutations) mutation.addedNodes.forEach(node => {
        if (node instanceof Element) scan(node);
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
    addEventListener('resize', wake, { passive: true });
    addEventListener('scroll', wake, { passive: true });
    addEventListener('focus', () => window.setTimeout(resumeVisibleVideos, 40), { passive: true });
    addEventListener('pageshow', () => window.setTimeout(resumeVisibleVideos, 40), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = 0;
        return;
      }
      requestAnimationFrame(resumeVisibleVideos);
      window.setTimeout(resumeVisibleVideos, 180);
    });
    wake();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
