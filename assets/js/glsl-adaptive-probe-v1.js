(() => {
  'use strict';
  if (window.__DATA_C0RE_PERF_PROBE_V1__) return;
  window.__DATA_C0RE_PERF_PROBE_V1__ = true;

  const PREFIX = '[DATA C0RE PERF]';
  const REPORT_MS = 2000;
  const BASELINE_SAMPLES = 90;
  const MAX_WINDOW_SAMPLES = 360;
  const MAX_HISTORY = 60;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer:coarse)');
  const fine = matchMedia('(pointer:fine) and (hover:hover)');

  const capabilities = {
    cores: navigator.hardwareConcurrency || null,
    memoryGB: Number.isFinite(navigator.deviceMemory) ? navigator.deviceMemory : null,
    dpr: Number((devicePixelRatio || 1).toFixed(2)),
    viewport: `${innerWidth}x${innerHeight}`,
    touchPoints: navigator.maxTouchPoints || 0,
    pointer: coarse.matches ? 'coarse' : fine.matches ? 'fine' : 'unknown',
    reducedMotion: reduce.matches,
    webgl2: 'pending',
    gpuTimerQuery: 'pending'
  };

  let running = true;
  let raf = 0;
  let lastFrameAt = 0;
  let lastReportAt = performance.now();
  let baselineMs = 0;
  let baselineReady = false;
  let baselineSamples = [];
  let windowSamples = [];
  let longTaskCount = 0;
  let longTaskMs = 0;
  let lastSnapshot = null;
  const history = [];

  const percentile = (values, p) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p)));
    return sorted[index];
  };

  const shaderCanvas = () => document.querySelector('canvas[data-ascii-cursor]');

  const refreshWebGLInfo = () => {
    const canvas = shaderCanvas();
    if (!canvas) return;
    try {
      const gl = canvas.getContext('webgl2');
      if (!gl) {
        capabilities.webgl2 = false;
        capabilities.gpuTimerQuery = false;
        return;
      }
      capabilities.webgl2 = true;
      capabilities.gpuTimerQuery = Boolean(gl.getExtension('EXT_disjoint_timer_query_webgl2'));
    } catch {
      capabilities.webgl2 = false;
      capabilities.gpuTimerQuery = false;
    }
  };

  const estimateBaseline = () => {
    if (baselineReady || baselineSamples.length < BASELINE_SAMPLES) return;
    const clean = baselineSamples.filter(ms => ms >= 3 && ms <= 40);
    if (clean.length < 30) return;
    const fastHalfCut = percentile(clean, 0.5);
    const fastHalf = clean.filter(ms => ms <= fastHalfCut);
    baselineMs = percentile(fastHalf, 0.5) || percentile(clean, 0.2);
    baselineMs = Math.max(4, Math.min(34, baselineMs));
    baselineReady = true;
    refreshWebGLInfo();
    console.info(`${PREFIX} baseline locked at ${(1000 / baselineMs).toFixed(1)} Hz (${baselineMs.toFixed(2)} ms budget)`);
  };

  const classify = (active, medianMs, p95Ms, jankRatio) => {
    if (!active) return { status: 'IDLE', adaptiveHint: 'hold' };
    const budget = baselineMs || 16.67;
    if (p95Ms <= budget * 1.35 && jankRatio <= 0.05) return { status: 'HEADROOM', adaptiveHint: 'hold / possible +1' };
    if (p95Ms <= budget * 1.75 && jankRatio <= 0.15) return { status: 'STABLE', adaptiveHint: 'hold' };
    if (p95Ms <= budget * 2.5 && jankRatio <= 0.32) return { status: 'STRESSED', adaptiveHint: 'candidate -1' };
    return { status: 'CRITICAL', adaptiveHint: 'candidate -2 / safe mode' };
  };

  const report = now => {
    const samples = windowSamples.filter(ms => ms >= 3 && ms < 250);
    windowSamples = [];
    if (!samples.length) return;

    const canvas = shaderCanvas();
    refreshWebGLInfo();
    const opacity = canvas ? Number.parseFloat(canvas.style.opacity || '0') || 0 : 0;
    const active = Boolean(canvas && opacity > 0.04);
    const medianMs = percentile(samples, 0.5);
    const p95Ms = percentile(samples, 0.95);
    const budget = baselineMs || medianMs || 16.67;
    const jankThreshold = budget * 1.5;
    const jankCount = samples.reduce((count, ms) => count + (ms > jankThreshold ? 1 : 0), 0);
    const jankRatio = samples.length ? jankCount / samples.length : 0;
    const fps = medianMs ? 1000 / medianMs : 0;
    const classification = classify(active, medianMs, p95Ms, jankRatio);

    const snapshot = {
      at: new Date().toISOString(),
      shader: active ? 'active' : canvas ? 'idle' : 'not-found',
      status: classification.status,
      adaptiveHint: classification.adaptiveHint,
      fps: Number(fps.toFixed(1)),
      medianMs: Number(medianMs.toFixed(2)),
      p95Ms: Number(p95Ms.toFixed(2)),
      budgetMs: Number(budget.toFixed(2)),
      refreshHz: baselineReady ? Number((1000 / baselineMs).toFixed(1)) : null,
      jankPct: Number((jankRatio * 100).toFixed(1)),
      longTasks: longTaskCount,
      longTaskMs: Number(longTaskMs.toFixed(1)),
      viewport: `${innerWidth}x${innerHeight}`,
      dpr: Number((devicePixelRatio || 1).toFixed(2))
    };

    lastSnapshot = snapshot;
    history.push(snapshot);
    if (history.length > MAX_HISTORY) history.shift();

    console.info(
      `${PREFIX} ${snapshot.shader.toUpperCase()} / ${snapshot.status} | ${snapshot.fps} fps | p95 ${snapshot.p95Ms} ms | budget ${snapshot.budgetMs} ms | jank ${snapshot.jankPct}% | long ${snapshot.longTaskMs} ms | ${snapshot.adaptiveHint}`
    );

    longTaskCount = 0;
    longTaskMs = 0;
    lastReportAt = now;
  };

  const frame = now => {
    if (!running || document.hidden) return;
    if (lastFrameAt) {
      const delta = now - lastFrameAt;
      if (delta > 0 && delta < 1000) {
        if (!baselineReady && baselineSamples.length < BASELINE_SAMPLES * 2) baselineSamples.push(delta);
        windowSamples.push(delta);
        if (windowSamples.length > MAX_WINDOW_SAMPLES) windowSamples.shift();
      }
    }
    lastFrameAt = now;
    estimateBaseline();
    if (now - lastReportAt >= REPORT_MS) report(now);
    raf = requestAnimationFrame(frame);
  };

  let longTaskObserver = null;
  if ('PerformanceObserver' in window) {
    try {
      longTaskObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          longTaskCount += 1;
          longTaskMs += entry.duration || 0;
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: false });
    } catch {
      longTaskObserver = null;
    }
  }

  const start = () => {
    if (running && raf) return;
    running = true;
    lastFrameAt = 0;
    lastReportAt = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const api = {
    capabilities,
    history,
    snapshot: () => lastSnapshot,
    start,
    stop,
    resetBaseline: () => {
      baselineMs = 0;
      baselineReady = false;
      baselineSamples = [];
      console.info(`${PREFIX} baseline reset`);
    }
  };
  window.__DATA_C0RE_PERF__ = api;

  console.groupCollapsed(`${PREFIX} adaptive probe v1 active (console only)`);
  console.table(capabilities);
  console.info(`${PREFIX} live snapshot: window.__DATA_C0RE_PERF__.snapshot()`);
  console.info(`${PREFIX} history: window.__DATA_C0RE_PERF__.history`);
  console.groupEnd();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastFrameAt = 0;
    } else if (running && !raf) {
      lastReportAt = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  addEventListener('resize', () => {
    capabilities.viewport = `${innerWidth}x${innerHeight}`;
    capabilities.dpr = Number((devicePixelRatio || 1).toFixed(2));
  }, { passive: true });

  raf = requestAnimationFrame(frame);
})();
