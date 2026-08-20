(() => {
  'use strict';

  const root = document.querySelector('[data-archive-interactive]');
  if (!root || window.__DATA_C0RE_ARCHIVE_MEDIA_CYCLE_V1__) return;
  window.__DATA_C0RE_ARCHIVE_MEDIA_CYCLE_V1__ = true;

  const parsePool = (raw, fallback = '') => {
    if (!raw) return fallback ? [fallback] : [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return [...new Set(parsed.filter(Boolean))];
    } catch {}
    const list = raw.split('|').map(item => item.trim()).filter(Boolean);
    return list.length ? [...new Set(list)] : fallback ? [fallback] : [];
  };

  const states = new WeakMap();

  const buildPool = entry => {
    const images = parsePool(entry.dataset.archiveImages || '', entry.dataset.archiveImage || '');
    const videos = parsePool(entry.dataset.archiveVideos || '', entry.dataset.archiveVideo || '');
    const pool = [];
    const total = Math.max(images.length, videos.length);
    for (let i = 0; i < total; i++) {
      if (images[i]) pool.push({ kind: 'image', src: images[i] });
      if (videos[i]) pool.push({ kind: 'video', src: videos[i] });
    }
    return pool;
  };

  const ensureState = entry => {
    let state = states.get(entry);
    if (state) return state;
    state = { pool: buildPool(entry), index: -1 };
    states.set(entry, state);
    return state;
  };

  const selectNext = entry => {
    const state = ensureState(entry);
    if (!state.pool.length) return;
    state.index = (state.index + 1) % state.pool.length;
    const selected = state.pool[state.index];
    const media = entry.querySelector('.archive-entry-media');
    const image = media?.querySelector('img');
    const video = media?.querySelector('video');

    entry.dataset.archiveCycleIndex = String(state.index);
    entry.dataset.archiveCycleKind = selected.kind;

    if (selected.kind === 'image') {
      entry.removeAttribute('data-archive-video');
      entry.removeAttribute('data-archive-videos');
      entry.dataset.archiveImage = selected.src;
      entry.dataset.archiveImages = JSON.stringify([selected.src]);
      entry.dataset.archiveMediaKind = 'image';
      entry.classList.remove('has-archive-video', 'is-video-ready');
      if (video && !video.paused) video.pause();
      if (image) image.src = selected.src;
      return;
    }

    entry.dataset.archiveVideo = selected.src;
    entry.dataset.archiveVideos = JSON.stringify([selected.src]);
    entry.dataset.archiveMediaKind = 'video';
  };

  root.addEventListener('pointerover', event => {
    if (!(event.target instanceof Element)) return;
    const entry = event.target.closest('.archive-entry[data-archive-status]');
    if (!entry || !root.contains(entry)) return;
    const from = event.relatedTarget;
    if (from instanceof Node && entry.contains(from)) return;
    selectNext(entry);
  }, { capture: true, passive: true });

  root.addEventListener('focusin', event => {
    if (!(event.target instanceof Element)) return;
    const entry = event.target.closest('.archive-entry[data-archive-status]');
    if (!entry || !root.contains(entry)) return;
    const from = event.relatedTarget;
    if (from instanceof Node && entry.contains(from)) return;
    selectNext(entry);
  }, { capture: true });
})();
