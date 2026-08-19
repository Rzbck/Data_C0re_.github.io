(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const interval = saveData ? 280 : coarse ? 170 : 110;
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 14;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const root = document.documentElement;
  const states = new Map();
  let timer = 0;
  let activeVideo = null;
  let lastSample = 0;
  const colours = {
    left: [22, 22, 22],
    right: [22, 22, 22],
    top: [22, 22, 22],
    bottom: [22, 22, 22],
    all: [22, 22, 22]
  };

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

  const setColourVar = (name, colour) => root.style.setProperty(name, `${colour[0]} ${colour[1]} ${colour[2]}`);
  const setPositionVar = (name, value) => root.style.setProperty(name, `${Math.round(value)}px`);

  const updateGeometry = video => {
    const rect = video.getBoundingClientRect();
    const left = clamp(rect.left, 0, innerWidth);
    const right = clamp(rect.right, 0, innerWidth);
    const top = clamp(rect.top, 0, innerHeight);
    const bottom = clamp(rect.bottom, 0, innerHeight);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    /* Light sources sit visibly inside the current video image, then diffuse into the page. */
    setPositionVar('--amb-source-left', left + width * .14);
    setPositionVar('--amb-source-right', right - width * .14);
    setPositionVar('--amb-source-top', top + height * .18);
    setPositionVar('--amb-source-bottom', bottom - height * .18);
    setPositionVar('--amb-source-x', left + width * .5);
    setPositionVar('--amb-source-y', top + height * .5);
  };

  const score = (video, state) => {
    if (!state.visible || state.unavailable || video.paused || video.ended || video.readyState < 2) return -1;
    const rect = video.getBoundingClientRect();
    const visibleW = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const viewportShare = (visibleW * visibleH) / Math.max(innerWidth * innerHeight, 1);
    return state.ratio * .62 + Math.min(viewportShare, 1) * .38;
  };

  const chooseVideo = () => {
    let best = null;
    let bestScore = -1;
    for (const [video, state] of states) {
      const s = score(video, state);
      if (s > bestScore) {
        best = video;
        bestScore = s;
      }
    }
    if (activeVideo && states.has(activeVideo)) {
      const currentScore = score(activeVideo, states.get(activeVideo));
      if (currentScore >= 0 && currentScore >= bestScore * .84) return activeVideo;
    }
    return best;
  };

  const sample = video => {
    const state = states.get(video);
    if (!state) return false;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const next = {
        left: average(data, pointSets.left),
        right: average(data, pointSets.right),
        top: average(data, pointSets.top),
        bottom: average(data, pointSets.bottom),
        all: average(data, pointSets.all)
      };
      for (const key of Object.keys(next)) {
        colours[key] = next[key].map((value, index) => Math.round(mix(colours[key][index], value, .28)));
      }
      setColourVar('--page-amb-left', colours.left);
      setColourVar('--page-amb-right', colours.right);
      setColourVar('--page-amb-top', colours.top);
      setColourVar('--page-amb-bottom', colours.bottom);
      setColourVar('--page-amb-all', colours.all);
      updateGeometry(video);
      document.body?.classList.add('video-page-ambient', 'video-page-ambient-active');
      return true;
    } catch {
      state.unavailable = true;
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
    const nextVideo = chooseVideo();
    if (!nextVideo) {
      activeVideo = null;
      document.body?.classList.add('video-page-ambient');
      document.body?.classList.remove('video-page-ambient-active');
      return;
    }
    activeVideo = nextVideo;
    if (now - lastSample >= interval) {
      lastSample = now;
      if (!sample(activeVideo)) activeVideo = null;
    }
    schedule();
  };

  const wake = () => schedule(0);

  const attach = video => {
    if (!(video instanceof HTMLVideoElement) || states.has(video)) return;
    const state = { visible: false, ratio: 0, unavailable: false };
    states.set(video, state);

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .015);
      state.ratio = entry?.intersectionRatio || 0;
      wake();
    }, { rootMargin: '100px 0px', threshold: [0, .015, .1, .25, .5, .75, 1] });
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
