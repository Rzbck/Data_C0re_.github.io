(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const videoInterval = saveData ? 320 : coarse ? 190 : 120;
  const imageInterval = saveData ? 12000 : 5000;
  const canvas = document.createElement('canvas');
  canvas.width = 30;
  canvas.height = 18;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const states = new Map();
  let layer = null;
  let timer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;

  const pointSets = (() => {
    const w = canvas.width, h = canvas.height;
    const left = [], right = [], top = [], bottom = [];
    for (let y = 1; y < h - 1; y++) {
      left.push([0, y], [0, y], [1, y], [2, y]);
      right.push([w - 1, y], [w - 1, y], [w - 2, y], [w - 3, y]);
    }
    for (let x = 1; x < w - 1; x++) {
      top.push([x, 0], [x, 0], [x, 1], [x, 2]);
      bottom.push([x, h - 1], [x, h - 1], [x, h - 2], [x, h - 3]);
    }
    return { left, right, top, bottom };
  })();

  const toneColour = input => {
    let [r, g, b] = input;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    const span = max - min;

    /* White / grey / beige fields must never become a large white wash. */
    if (span < 11) return [24, 24, 27];

    const mid = (max + min) * .5;
    const saturationBoost = .48;
    r = clamp(r + (r - mid) * saturationBoost, 0, 255);
    g = clamp(g + (g - mid) * saturationBoost, 0, 255);
    b = clamp(b + (b - mid) * saturationBoost, 0, 255);

    max = Math.max(r, g, b);
    if (max > 178) {
      const scale = 178 / max;
      r *= scale; g *= scale; b *= scale;
    } else if (max < 72) {
      const scale = 72 / Math.max(max, 1);
      r *= scale; g *= scale; b *= scale;
    }
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  const analyseEdge = (data, points) => {
    let r = 0, g = 0, b = 0, weight = 0;
    let chromaMass = 0;
    let whiteMass = 0;

    for (const [x, y] of points) {
      const i = (y * canvas.width + x) * 4;
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
      const span = max - min;
      const sat = max > 0 ? span / max : 0;
      const lum = (rr * .2126 + gg * .7152 + bb * .0722) / 255;
      const nearWhite = lum > .72 && sat < .14;
      const neutral = sat < .09;

      let w = .025 + Math.pow(sat, 1.35) * 2.15;
      w *= .55 + Math.min(lum, .72) * .7;
      if (neutral) w *= .18;
      if (nearWhite) w *= .08;

      r += rr * w;
      g += gg * w;
      b += bb * w;
      weight += w;
      chromaMass += sat * (.35 + Math.min(lum, .72) * .65);
      if (nearWhite) whiteMass += 1;
    }

    if (!weight) return { colour: [24, 24, 27], energy: .025 };

    const colour = toneColour([r / weight, g / weight, b / weight]);
    const chroma = chromaMass / Math.max(points.length, 1);
    const whiteRatio = whiteMass / Math.max(points.length, 1);
    const energy = clamp((chroma - .035) * 2.35, .025, 1) * (1 - whiteRatio * .82);
    return { colour, energy: clamp(energy, .02, 1) };
  };

  const ensureLayer = () => {
    if (layer?.isConnected) return layer;
    layer = document.createElement('div');
    layer.className = 'video-ambient-field';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    return layer;
  };

  const setColour = (emitter, name, colour) => emitter.style.setProperty(name, `${colour[0]} ${colour[1]} ${colour[2]}`);
  const setNumber = (emitter, name, value) => emitter.style.setProperty(name, Number(value).toFixed(3));
  const setPosition = (emitter, name, value) => emitter.style.setProperty(name, `${Math.round(value)}px`);

  const intrinsicSize = media => media instanceof HTMLVideoElement
    ? [media.videoWidth, media.videoHeight]
    : [media.naturalWidth, media.naturalHeight];

  const mediaRect = media => {
    const rect = media.getBoundingClientRect();
    const [iw, ih] = intrinsicSize(media);
    if (!rect.width || !rect.height || !iw || !ih) return rect;
    const fit = getComputedStyle(media).objectFit || 'fill';
    if (fit === 'cover' || fit === 'fill') return rect;

    const sourceRatio = iw / ih;
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

  const drawVisibleFrame = media => {
    const [iw, ih] = intrinsicSize(media);
    const rect = media.getBoundingClientRect();
    const fit = getComputedStyle(media).objectFit || 'fill';
    let sx = 0, sy = 0, sw = iw, sh = ih;

    if (fit === 'cover' && rect.width > 0 && rect.height > 0) {
      const sourceRatio = iw / ih;
      const boxRatio = rect.width / rect.height;
      if (sourceRatio > boxRatio) {
        sw = ih * boxRatio;
        sx = (iw - sw) * .5;
      } else {
        sh = iw / boxRatio;
        sy = (ih - sh) * .5;
      }
    }
    ctx.drawImage(media, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  };

  const updateGeometry = (media, state, activeCount) => {
    const rect = mediaRect(media);
    const left = clamp(rect.left, 0, innerWidth);
    const right = clamp(rect.right, 0, innerWidth);
    const top = clamp(rect.top, 0, innerHeight);
    const bottom = clamp(rect.bottom, 0, innerHeight);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    setPosition(state.emitter, '--amb-source-left', left + Math.min(3, width * .012));
    setPosition(state.emitter, '--amb-source-right', right - Math.min(3, width * .012));
    setPosition(state.emitter, '--amb-source-top', top + Math.min(3, height * .018));
    setPosition(state.emitter, '--amb-source-bottom', bottom - Math.min(3, height * .018));
    setPosition(state.emitter, '--amb-source-x', left + width * .5);
    setPosition(state.emitter, '--amb-source-y', top + height * .5);

    const visibleW = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const visibleH = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const viewportShare = (visibleW * visibleH) / Math.max(innerWidth * innerHeight, 1);
    const crowdFactor = activeCount >= 5 ? .56 : activeCount === 4 ? .62 : activeCount === 3 ? .70 : activeCount === 2 ? .82 : 1;
    const chromaStrength = clamp(state.energy * 1.18, .08, 1);
    const base = state.kind === 'image' ? .55 : .66;
    const strength = clamp((base + state.ratio * .18 + Math.min(viewportShare, .52) * .28) * crowdFactor * chromaStrength, .04, .92);
    setNumber(state.emitter, '--amb-strength', strength);
  };

  const videoIsActive = (video, state) => Boolean(
    state.visible && !state.unavailable && !video.paused && !video.ended &&
    video.readyState >= 2 && video.videoWidth && video.videoHeight
  );

  const imageIsActive = (img, state) => {
    if (!state.visible || state.unavailable || !img.complete || !img.naturalWidth || !img.naturalHeight) return false;
    const rect = img.getBoundingClientRect();
    return rect.width >= 110 && rect.height >= 75 && rect.width * rect.height >= 18000;
  };

  const sample = (media, state) => {
    try {
      drawVisibleFrame(media);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const next = {
        left: analyseEdge(data, pointSets.left),
        right: analyseEdge(data, pointSets.right),
        top: analyseEdge(data, pointSets.top),
        bottom: analyseEdge(data, pointSets.bottom)
      };

      let energy = 0;
      for (const key of Object.keys(next)) {
        const target = next[key].colour;
        const amount = state.kind === 'image' ? .58 : .34;
        state.colours[key] = target.map((value, index) => Math.round(mix(state.colours[key][index], value, amount)));
        state.edgeEnergy[key] = mix(state.edgeEnergy[key], next[key].energy, state.kind === 'image' ? .72 : .42);
        energy += state.edgeEnergy[key];
        setColour(state.emitter, `--page-amb-${key}`, state.colours[key]);
        setNumber(state.emitter, `--amb-energy-${key}`, state.edgeEnergy[key]);
      }
      state.energy = energy / 4;
      state.emitter.classList.add('is-active');
      return true;
    } catch {
      state.unavailable = true;
      state.emitter.classList.remove('is-active');
      return false;
    }
  };

  const schedule = (delay = videoInterval) => {
    if (timer || document.hidden) return;
    timer = window.setTimeout(() => {
      timer = 0;
      requestAnimationFrame(tick);
    }, delay);
  };

  const tick = now => {
    if (document.hidden) return;
    const active = [];
    for (const [media, state] of states) {
      const on = state.kind === 'video' ? videoIsActive(media, state) : imageIsActive(media, state);
      if (on) active.push([media, state]);
      else state.emitter.classList.remove('is-active');
    }

    if (!active.length) {
      document.body?.classList.remove('video-page-ambient-active');
      return;
    }

    document.body?.classList.add('video-page-ambient', 'video-page-ambient-active');
    for (const [media, state] of active) {
      const due = state.kind === 'video' ? videoInterval : imageInterval;
      if (now - state.lastSample >= due) {
        state.lastSample = now;
        sample(media, state);
      }
      updateGeometry(media, state, active.length);
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
      video.pause();
      requestAnimationFrame(() => video.play().catch(() => {}));
    }, 420);
  };

  const resumeVisibleVideos = () => {
    if (document.hidden) return;
    for (const [media, state] of states) if (state.kind === 'video') resumeVideo(media, state);
    wake();
    window.setTimeout(wake, 180);
  };

  const makeEmitter = kind => {
    const emitter = document.createElement('div');
    emitter.className = 'video-ambient-emitter';
    if (kind === 'image') {
      emitter.dataset.static = 'true';
      emitter.style.setProperty('--amb-drift-duration', `${16 + Math.random() * 10}s`);
      emitter.style.setProperty('--amb-drift-delay', `${-Math.random() * 12}s`);
    }
    ensureLayer().appendChild(emitter);
    return emitter;
  };

  const makeState = (kind, emitter) => ({
    kind,
    visible: false,
    ratio: 0,
    unavailable: false,
    emitter,
    lastSample: kind === 'image' ? -Infinity : 0,
    energy: .2,
    colours: { left: [24, 24, 27], right: [24, 24, 27], top: [24, 24, 27], bottom: [24, 24, 27] },
    edgeEnergy: { left: .08, right: .08, top: .08, bottom: .08 }
  });

  const attachVideo = video => {
    if (!(video instanceof HTMLVideoElement) || states.has(video)) return;
    const state = makeState('video', makeEmitter('video'));
    states.set(video, state);

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .015);
      state.ratio = entry?.intersectionRatio || 0;
      if (state.visible && !document.hidden && video.paused && shouldAutoResume(video)) video.play().catch(() => {});
      wake();
    }, { rootMargin: '100px 0px', threshold: [0, .015, .1, .25, .5, .75, 1] });
    observer.observe(video);

    ['playing', 'play', 'pause', 'ended', 'emptied', 'loadeddata'].forEach(type => video.addEventListener(type, wake, { passive: true }));
  };

  const imageRejected = img => {
    const src = `${img.currentSrc || img.src || ''}`.toLowerCase();
    if (/\.(svg)(?:\?|$)/.test(src)) return true;
    if (/(logo|favicon|icon|sprite|avatar|qr|og-cover)/.test(src)) return true;
    if (img.closest('.site-header,.site-menu,.lumina-tech-grid,.lumina-plan-modal,.tech-viewer,[data-lumina-plan-card]')) return true;
    return false;
  };

  const attachImage = img => {
    if (!(img instanceof HTMLImageElement) || states.has(img) || imageRejected(img)) return;
    const state = makeState('image', makeEmitter('image'));
    states.set(img, state);

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .025);
      state.ratio = entry?.intersectionRatio || 0;
      if (state.visible) state.lastSample = -Infinity;
      wake();
    }, { rootMargin: '120px 0px', threshold: [0, .025, .1, .25, .5, .75, 1] });
    observer.observe(img);

    img.addEventListener('load', () => {
      state.unavailable = false;
      state.lastSample = -Infinity;
      wake();
    }, { passive: true });
  };

  const scan = rootNode => {
    if (rootNode instanceof HTMLVideoElement) attachVideo(rootNode);
    else if (rootNode instanceof HTMLImageElement) attachImage(rootNode);
    rootNode.querySelectorAll?.('video').forEach(attachVideo);
    rootNode.querySelectorAll?.('img').forEach(attachImage);
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
