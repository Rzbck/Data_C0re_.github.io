(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const interval = saveData ? 300 : coarse ? 180 : 115;
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 14;
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
    if (span > 5) {
      const saturation = .48;
      r = clamp(r + (r - mid) * saturation, 0, 255);
      g = clamp(g + (g - mid) * saturation, 0, 255);
      b = clamp(b + (b - mid) * saturation, 0, 255);
    }
    const peak = Math.max(r, g, b);
    if (peak < 88) {
      const lift = 88 / Math.max(peak, 1);
      r *= lift;
      g *= lift;
      b *= lift;
    }
    return [Math.round(clamp(r, 0, 255)), Math.round(clamp(g, 0, 255)), Math.round(clamp(b, 0, 255))];
  };

  const pointSets = (() => {
    const w = canvas.width, h = canvas.height;
    const left = [], right = [], top = [], bottom = [], all = [];
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
        const p = [x, y];
        all.push(p);
        if (x <= Math.floor(w * .34)) left.push(p);
        if (x >= Math.ceil(w * .66)) right.push(p);
        if (y <= Math.floor(h * .34)) top.push(p);
        if (y >= Math.ceil(h * .66)) bottom.push(p);
      }
    }
    return { left, right, top, bottom, all };
  })();

  const average = (data, points) => {
    let r = 0, g = 0, b = 0, weight = 0;
    for (const [x, y] of points) {
      const i = (y * canvas.width + x) * 4;
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
      const saturation = (max - min) / 255;
      const luminance = (rr * .2126 + gg * .7152 + bb * .0722) / 255;
      const w = .24 + luminance * .42 + saturation * .68;
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

    /* Every visible video becomes its own light source. Sources stay just inside the image edges. */
    setPosition(state.emitter, '--amb-source-left', left + width * .12);
    setPosition(state.emitter, '--amb-source-right', right - width * .12);
    setPosition(state.emitter, '--amb-source-top', top + height * .15);
    setPosition(state.emitter, '--amb-source-bottom', bottom - height * .15);
    setPosition(state.emitter, '--amb-source-x', left + width * .5);
    setPosition(state.emitter, '--amb-source-y', top + height * .5);

    const visibleW = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const viewportShare = (visibleW * visibleH) / Math.max(innerWidth * innerHeight, 1);
    const crowdFactor = activeCount > 1 ? .78 : 1;
    const strength = clamp((.38 + state.ratio * .36 + Math.min(viewportShare, .55) * .45) * crowdFactor, .28, .92);
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
        bottom: average(data, pointSets.bottom),
        all: average(data, pointSets.all)
      };
      for (const key of Object.keys(next)) {
        state.colours[key] = next[key].map((value, index) => Math.round(mix(state.colours[key][index], value, .30)));
      }
      setColour(state.emitter, '--page-amb-left', state.colours.left);
      setColour(state.emitter, '--page-amb-right', state.colours.right);
      setColour(state.emitter, '--page-amb-top', state.colours.top);
      setColour(state.emitter, '--page-amb-bottom', state.colours.bottom);
      setColour(state.emitter, '--page-amb-all', state.colours.all);
      state.emitter.classList.add('is-active');
      return true;
    } catch {
      state.unavailable = true;
      state.emitter.classList.remove('is-active');
      return false;
    }
  };

  const schedule = (delay = interval) => {
    if (timer) return;
    timer = window.setTimeout(() => {
      timer = 0;
      requestAnimationFrame(tick);
    }, delay);
  };

  const tick = now => {
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
        bottom: [22, 22, 22],
        all: [22, 22, 22]
      }
    };
    states.set(video, state);

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .015);
      state.ratio = entry?.intersectionRatio || 0;
      wake();
    }, { rootMargin: '80px 0px', threshold: [0, .015, .1, .25, .5, .75, 1] });
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
    wake();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
