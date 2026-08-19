(() => {
  'use strict';

  if (window.__DATA_C0RE_VIDEO_AMBILIGHT__) return;
  window.__DATA_C0RE_VIDEO_AMBILIGHT__ = true;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const minInterval = saveData ? 220 : coarse ? 125 : 82;
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 16;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const controllers = new WeakMap();

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;

  const boost = color => {
    let [r, g, b] = color;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2;
    const span = max - min;
    if (span > 8) {
      const amount = 0.17;
      r = clamp(r + (r - light) * amount, 0, 255);
      g = clamp(g + (g - light) * amount, 0, 255);
      b = clamp(b + (b - light) * amount, 0, 255);
    }
    const peak = Math.max(r, g, b);
    if (peak < 46) {
      const lift = 46 / Math.max(peak, 1);
      r *= lift;
      g *= lift;
      b *= lift;
    }
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  const average = (data, points) => {
    let r = 0, g = 0, b = 0, weight = 0;
    for (const [x, y] of points) {
      const i = (y * canvas.width + x) * 4;
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      const luminance = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 255;
      const w = 0.35 + luminance * 0.65;
      r += rr * w;
      g += gg * w;
      b += bb * w;
      weight += w;
    }
    if (!weight) return [0, 0, 0];
    return boost([r / weight, g / weight, b / weight]);
  };

  const edgePoints = (() => {
    const w = canvas.width, h = canvas.height;
    const insetX = Math.max(1, Math.floor(w * 0.08));
    const insetY = Math.max(1, Math.floor(h * 0.12));
    const top = [], right = [], bottom = [], left = [], all = [];
    for (let x = insetX; x < w - insetX; x++) {
      top.push([x, 1]);
      bottom.push([x, h - 2]);
    }
    for (let y = insetY; y < h - insetY; y++) {
      left.push([1, y]);
      right.push([w - 2, y]);
    }
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) all.push([x, y]);
    }
    return { top, right, bottom, left, all };
  })();

  const chooseHost = video => {
    const explicit = video.closest('[data-video-ambilight-host]');
    if (explicit) return explicit;
    const candidates = [
      video.closest('.project-hero-media'),
      video.closest('figure'),
      video.closest('.archive-entry-media'),
      video.closest('.index-preview--motion'),
      video.closest('.hero')
    ].filter(Boolean);
    const host = candidates.find(node => node.querySelectorAll('video').length === 1) || video;
    host.dataset.videoAmbilightHost = '';
    return host;
  };

  const setColorVar = (host, name, color) => {
    host.style.setProperty(name, `${color[0]} ${color[1]} ${color[2]}`);
  };

  const attach = video => {
    if (!(video instanceof HTMLVideoElement) || controllers.has(video)) return;
    const host = chooseHost(video);
    const state = {
      host,
      visible: false,
      running: false,
      frameHandle: 0,
      rafHandle: 0,
      lastPaint: 0,
      colors: {
        top: [18, 18, 18],
        right: [18, 18, 18],
        bottom: [18, 18, 18],
        left: [18, 18, 18],
        all: [18, 18, 18]
      }
    };
    controllers.set(video, state);

    let observer;

    const stop = () => {
      if (state.frameHandle && 'cancelVideoFrameCallback' in video) {
        try { video.cancelVideoFrameCallback(state.frameHandle); } catch {}
      }
      if (state.rafHandle) cancelAnimationFrame(state.rafHandle);
      state.frameHandle = 0;
      state.rafHandle = 0;
      state.running = false;
      host.classList.remove('video-ambilight-active');
    };

    const schedule = () => {
      if (!state.running) return;
      if ('requestVideoFrameCallback' in video) {
        state.frameHandle = video.requestVideoFrameCallback(now => paint(now));
      } else {
        state.rafHandle = requestAnimationFrame(paint);
      }
    };

    const paint = now => {
      if (!state.running || !state.visible || video.paused || video.ended) {
        stop();
        return;
      }
      if (now - state.lastPaint >= minInterval && video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        state.lastPaint = now;
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const next = {
            top: average(data, edgePoints.top),
            right: average(data, edgePoints.right),
            bottom: average(data, edgePoints.bottom),
            left: average(data, edgePoints.left),
            all: average(data, edgePoints.all)
          };
          for (const key of Object.keys(next)) {
            const prev = state.colors[key];
            state.colors[key] = next[key].map((value, index) => Math.round(mix(prev[index], value, 0.32)));
          }
          setColorVar(host, '--amb-top', state.colors.top);
          setColorVar(host, '--amb-right', state.colors.right);
          setColorVar(host, '--amb-bottom', state.colors.bottom);
          setColorVar(host, '--amb-left', state.colors.left);
          setColorVar(host, '--amb-all', state.colors.all);
          host.classList.add('video-ambilight-active');
        } catch {
          host.classList.add('video-ambilight-unavailable');
          stop();
          observer?.disconnect();
          return;
        }
      }
      schedule();
    };

    const start = () => {
      if (state.running || !state.visible || video.paused || video.ended || host.classList.contains('video-ambilight-unavailable')) return;
      state.running = true;
      schedule();
    };

    observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      state.visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio > 0.01);
      if (state.visible && !video.paused && !video.ended) start();
      if (!state.visible) stop();
    }, { rootMargin: '160px 0px', threshold: [0, 0.01, 0.2] });
    observer.observe(video);

    video.addEventListener('playing', start, { passive: true });
    video.addEventListener('play', start, { passive: true });
    video.addEventListener('pause', stop, { passive: true });
    video.addEventListener('ended', stop, { passive: true });
    video.addEventListener('emptied', stop, { passive: true });
  };

  const scan = root => {
    if (root instanceof HTMLVideoElement) attach(root);
    root.querySelectorAll?.('video').forEach(attach);
  };

  scan(document);
  const mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node instanceof Element) scan(node);
      });
    }
  });
  mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
})();
