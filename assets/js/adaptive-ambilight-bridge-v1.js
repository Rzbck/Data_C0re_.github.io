(() => {
  'use strict';
  if (window.__DATA_C0RE_ADAPTIVE_AMBILIGHT_DEV_V1__) return;
  window.__DATA_C0RE_ADAPTIVE_AMBILIGHT_DEV_V1__ = true;

  const previousRAF = window.requestAnimationFrame.bind(window);
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeClearTimeout = window.clearTimeout.bind(window);

  const PROFILES = {
    MAX:      { enabled:true,  interval:120, label:'FULL' },
    HIGH:     { enabled:true,  interval:190, label:'LIGHT' },
    BALANCED: { enabled:true,  interval:340, label:'THROTTLED' },
    LOW:      { enabled:false, interval:0,   label:'OFF' },
    SAFE:     { enabled:false, interval:0,   label:'OFF' },
    OFF:      { enabled:false, interval:0,   label:'OFF' }
  };

  const level = () => window.__DATA_C0RE_ADAPT_CONFIG__?.level || document.documentElement.dataset.glslAdaptLevel || 'MAX';
  const profile = () => PROFILES[level()] || PROFILES.MAX;

  const style = document.createElement('style');
  style.dataset.adaptiveAmbilightDev = 'v1';
  style.textContent = `
    html[data-glsl-adapt-level="BALANCED"] .video-ambient-emitter[data-static="true"],
    html[data-glsl-adapt-level="LOW"] .video-ambient-emitter[data-static="true"],
    html[data-glsl-adapt-level="SAFE"] .video-ambient-emitter[data-static="true"],
    html[data-glsl-adapt-level="OFF"] .video-ambient-emitter[data-static="true"]{animation:none!important}
    html[data-glsl-adapt-level="LOW"] .video-ambient-field,
    html[data-glsl-adapt-level="SAFE"] .video-ambient-field,
    html[data-glsl-adapt-level="OFF"] .video-ambient-field{display:none!important}
  `;
  document.head.appendChild(style);

  const callbackCache = new WeakMap();
  const isAmbilightTick = callback => {
    if (typeof callback !== 'function') return false;
    if (callbackCache.has(callback)) return callbackCache.get(callback);
    let match = false;
    try {
      const source = Function.prototype.toString.call(callback);
      match = source.includes('videoIsActive') && source.includes('updateGeometry') && source.includes('sample(media,state)');
    } catch {}
    callbackCache.set(callback, match);
    return match;
  };

  let lastRun = -Infinity;
  let pendingCallback = null;
  let pendingTimer = 0;
  let bridgeRuns = 0;
  let lastBridgeRun = performance.now();
  let measuredHz = 0;

  const schedulePending = () => {
    if (!pendingCallback || !profile().enabled || pendingTimer) return;
    const run = now => {
      pendingTimer = 0;
      if (!pendingCallback || !profile().enabled) return;
      const gap = profile().interval;
      const remaining = gap - (now - lastRun);
      if (remaining > 1) {
        pendingTimer = nativeSetTimeout(() => previousRAF(run), Math.max(8, remaining));
        return;
      }
      const callback = pendingCallback;
      pendingCallback = null;
      lastRun = now;
      bridgeRuns += 1;
      callback(now);
    };
    previousRAF(run);
  };

  window.requestAnimationFrame = function(callback) {
    if (!isAmbilightTick(callback)) return previousRAF(callback);
    pendingCallback = callback;
    if (!profile().enabled) return 0;
    schedulePending();
    return 0;
  };

  const hudLine = document.createElement('div');
  hudLine.dataset.adaptAmbilight = 'true';
  Object.assign(hudLine.style, { marginTop:'4px', color:'#8fdcff' });
  const attachHudLine = () => {
    const hud = document.getElementById('data-c0re-adaptive-dev-hud');
    const main = hud?.querySelector('[data-adapt-main]');
    if (main && hudLine.parentNode !== main.parentNode) main.insertAdjacentElement('afterend', hudLine);
  };

  const render = () => {
    attachHudLine();
    const p = profile();
    const interval = p.enabled ? `~${p.interval}ms` : 'stopped';
    hudLine.textContent = `ambilight ${p.label} | sampling ${interval}${measuredHz ? ` | ${measuredHz.toFixed(1)} Hz measured` : ''}`;
    window.__DATA_C0RE_ADAPT_CONFIG__.ambilight = {
      enabled:p.enabled,
      intervalMs:p.interval,
      label:p.label,
      measuredHz
    };
  };

  const sync = () => {
    const p = profile();
    if (!p.enabled) {
      if (pendingTimer) nativeClearTimeout(pendingTimer);
      pendingTimer = 0;
    } else {
      schedulePending();
    }
    render();
  };

  document.addEventListener('data-c0re-adapt-levelchange', sync);

  nativeSetTimeout(function meter(){
    const now = performance.now();
    const elapsed = Math.max(.25, (now - lastBridgeRun) / 1000);
    measuredHz = bridgeRuns / elapsed;
    bridgeRuns = 0;
    lastBridgeRun = now;
    render();
    nativeSetTimeout(meter, 2000);
  }, 2000);

  sync();
  console.info('[DATA C0RE ADAPT] ambilight bridge v1 active: BALANCED throttles, LOW/SAFE/OFF stop ambient sampling and rendering.');
})();
