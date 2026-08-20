/* DATA C0RE Ambilight interpolator v1 — low-cost colour smoothing between sampled video frames. */
(() => {
  'use strict';

  if (window.__DATA_C0RE_AMBILIGHT_INTERPOLATOR__) return;
  window.__DATA_C0RE_AMBILIGHT_INTERPOLATOR__ = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const sampleMs = saveData ? 320 : coarse ? 190 : 120;
  const blendMs = Math.max(90, sampleMs - (coarse ? 12 : 8));
  const frameMs = saveData ? 1000 / 24 : coarse ? 1000 / 30 : 1000 / 60;
  const edges = ['left', 'right', 'top', 'bottom'];
  const hosts = new Map();
  let raf = 0;
  let lastFrame = 0;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const parseColour = value => {
    const parts = String(value || '').trim().split(/\s+/).map(Number);
    return parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite) ? parts.slice(0, 3) : [0, 0, 0];
  };
  const parseEnergy = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const cloneFrame = frame => ({
    colours: Object.fromEntries(edges.map(edge => [edge, [...frame.colours[edge]]])),
    energy: Object.fromEntries(edges.map(edge => [edge, frame.energy[edge]]))
  });
  const frameSignature = frame => edges.map(edge => `${frame.colours[edge].map(v => Math.round(v)).join(',')}:${frame.energy[edge].toFixed(4)}`).join('|');

  const readTarget = host => ({
    colours: Object.fromEntries(edges.map(edge => [edge, parseColour(host.style.getPropertyValue(`--page-amb-${edge}`))])),
    energy: Object.fromEntries(edges.map(edge => [edge, parseEnergy(host.style.getPropertyValue(`--amb-energy-${edge}`))]))
  });

  const writeFrame = (surface, frame) => {
    for (const edge of edges) {
      const colour = frame.colours[edge];
      surface.style.setProperty(`--page-amb-${edge}`, `${Math.round(colour[0])} ${Math.round(colour[1])} ${Math.round(colour[2])}`);
      surface.style.setProperty(`--amb-energy-${edge}`, clamp(frame.energy[edge], 0, 1.25).toFixed(4));
    }
  };

  const injectStyle = () => {
    if (document.querySelector('style[data-ambilight-interpolator]')) return;
    const style = document.createElement('style');
    style.dataset.ambilightInterpolator = '';
    style.textContent = `
      .video-ambient-emitter.ambilight-interpolated{background:none!important;filter:none!important}
      .video-ambient-emitter.ambilight-interpolated>.video-ambient-interpolated-surface{
        position:absolute;inset:0;pointer-events:none;transform:translateZ(0);filter:saturate(1.52);
        background:
          radial-gradient(ellipse 88vw 112vh at var(--amb-source-left) var(--amb-source-y), rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .57)) 0%, rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .33)) 18%, rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .145)) 43%, rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .05)) 66%, transparent 90%),
          radial-gradient(ellipse 88vw 112vh at var(--amb-source-right) var(--amb-source-y), rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .57)) 0%, rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .33)) 18%, rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .145)) 43%, rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .05)) 66%, transparent 90%),
          radial-gradient(ellipse 108vw 72vh at var(--amb-source-x) var(--amb-source-top), rgb(var(--page-amb-top) / calc(var(--amb-energy-top) * .33)) 0%, rgb(var(--page-amb-top) / calc(var(--amb-energy-top) * .145)) 30%, rgb(var(--page-amb-top) / calc(var(--amb-energy-top) * .05)) 62%, transparent 89%),
          radial-gradient(ellipse 108vw 72vh at var(--amb-source-x) var(--amb-source-bottom), rgb(var(--page-amb-bottom) / calc(var(--amb-energy-bottom) * .31)) 0%, rgb(var(--page-amb-bottom) / calc(var(--amb-energy-bottom) * .135)) 31%, rgb(var(--page-amb-bottom) / calc(var(--amb-energy-bottom) * .047)) 63%, transparent 90%);
      }
      @media(max-width:820px),(pointer:coarse){
        .video-ambient-emitter.ambilight-interpolated>.video-ambient-interpolated-surface{
          filter:saturate(1.40);
          background:
            radial-gradient(ellipse 104vw 92vh at var(--amb-source-left) var(--amb-source-y), rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .44)) 0%, rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .22)) 28%, rgb(var(--page-amb-left) / calc(var(--amb-energy-left) * .07)) 61%, transparent 90%),
            radial-gradient(ellipse 104vw 92vh at var(--amb-source-right) var(--amb-source-y), rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .44)) 0%, rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .22)) 28%, rgb(var(--page-amb-right) / calc(var(--amb-energy-right) * .07)) 61%, transparent 90%),
            radial-gradient(ellipse 118vw 62vh at var(--amb-source-x) var(--amb-source-top), rgb(var(--page-amb-top) / calc(var(--amb-energy-top) * .24)) 0%, rgb(var(--page-amb-top) / calc(var(--amb-energy-top) * .08)) 55%, transparent 89%),
            radial-gradient(ellipse 118vw 62vh at var(--amb-source-x) var(--amb-source-bottom), rgb(var(--page-amb-bottom) / calc(var(--amb-energy-bottom) * .23)) 0%, rgb(var(--page-amb-bottom) / calc(var(--amb-energy-bottom) * .075)) 56%, transparent 90%);
        }
      }
    `;
    document.head.appendChild(style);
  };

  const schedule = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };

  const retarget = state => {
    const next = readTarget(state.host);
    const signature = frameSignature(next);
    if (signature === state.targetSignature) return;
    state.from = cloneFrame(state.current);
    state.target = next;
    state.targetSignature = signature;
    state.started = performance.now();
    state.animating = true;
    schedule();
  };

  const attach = host => {
    if (!(host instanceof HTMLElement) || hosts.has(host) || !host.classList.contains('video-ambient-emitter')) return;
    const surface = document.createElement('div');
    surface.className = 'video-ambient-interpolated-surface';
    surface.setAttribute('aria-hidden', 'true');
    host.appendChild(surface);
    host.classList.add('ambilight-interpolated');

    const initial = readTarget(host);
    writeFrame(surface, initial);
    const state = {
      host,
      surface,
      current: cloneFrame(initial),
      from: cloneFrame(initial),
      target: cloneFrame(initial),
      targetSignature: frameSignature(initial),
      started: performance.now(),
      animating: false,
      observer: null
    };
    const observer = new MutationObserver(() => retarget(state));
    observer.observe(host, { attributes: true, attributeFilter: ['style'] });
    state.observer = observer;
    hosts.set(host, state);
  };

  function render(now) {
    raf = 0;
    if (document.hidden) return;
    if (now - lastFrame < frameMs - 1) {
      schedule();
      return;
    }
    lastFrame = now;
    let keepAlive = false;
    for (const state of hosts.values()) {
      if (!state.host.isConnected) {
        state.observer?.disconnect();
        hosts.delete(state.host);
        continue;
      }
      if (!state.animating) continue;
      const t = clamp((now - state.started) / blendMs, 0, 1);
      const eased = t * t * (3 - 2 * t);
      for (const edge of edges) {
        state.current.colours[edge] = state.from.colours[edge].map((v, i) => mix(v, state.target.colours[edge][i], eased));
        state.current.energy[edge] = mix(state.from.energy[edge], state.target.energy[edge], eased);
      }
      writeFrame(state.surface, state.current);
      if (t < 1) keepAlive = true;
      else {
        state.current = cloneFrame(state.target);
        state.animating = false;
      }
    }
    if (keepAlive) schedule();
  }

  const scan = root => {
    if (root instanceof HTMLElement && root.classList.contains('video-ambient-emitter')) attach(root);
    root.querySelectorAll?.('.video-ambient-emitter').forEach(attach);
  };

  const boot = () => {
    injectStyle();
    scan(document);
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) scan(node);
    }).observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
