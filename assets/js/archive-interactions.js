(() => {
  'use strict';

  const root = document.querySelector('[data-archive-interactive]');
  if (!root || window.__DATA_C0RE_ARCHIVE_ROLLOVER_V4__) return;
  window.__DATA_C0RE_ARCHIVE_ROLLOVER_V4__ = true;
  window.__DATA_C0RE_ARCHIVE_ROLLOVER_V3__ = true;
  window.__DATA_C0RE_ARCHIVE_ROLLOVER_SOLID__ = true;
  window.__DATA_C0RE_ARCHIVE_ROLLOVER_V2__ = true;
  window.__DATA_C0RE_ARCHIVE_AMBIENT_BRIDGE__ = true;

  const entries = [...root.querySelectorAll('.archive-entry[data-archive-status]')];
  const groups = [...root.querySelectorAll('.archive-year')];
  const statusButtons = [...document.querySelectorAll('[data-archive-status-filter]')];
  const typeSelect = document.querySelector('[data-archive-type-filter]');
  const yearSelect = document.querySelector('[data-archive-year-filter]');
  const tagSelect = document.querySelector('[data-archive-tag-filter]');
  const count = document.querySelector('[data-archive-count]');
  const empty = document.querySelector('[data-archive-empty]');
  const statusRow = document.querySelector('.archive-control-row--status');
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  const params = new URLSearchParams(location.search);
  const hoverCapable = matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!connection?.saveData;
  const desktop = () => hoverCapable.matches;
  const motionOff = () => reduced.matches || document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed') === 'true';

  let status = 'all';
  let projectFilter = params.get('project') || '';
  if (projectFilter && !entries.some(entry => entry.dataset.archiveProject === projectFilter)) projectFilter = '';
  const requestedTag = params.get('tag') || '';
  if (tagSelect && requestedTag && [...tagSelect.options].some(option => option.value === requestedTag)) tagSelect.value = requestedTag;

  const countLabel = n => lang === 'fr'
    ? `${n} projet${n > 1 ? 's' : ''}`
    : lang === 'es'
      ? `${n} proyecto${n > 1 ? 's' : ''}`
      : `${n} project${n > 1 ? 's' : ''}`;
  const projectPrefix = lang === 'fr' ? 'Projet' : lang === 'es' ? 'Proyecto' : 'Project';

  const replaceQuery = (key, value) => {
    const next = new URL(location.href);
    if (value && value !== 'all') next.searchParams.set(key, value);
    else next.searchParams.delete(key);
    history.replaceState({}, '', `${next.pathname}${next.search}${next.hash}`);
  };

  let projectChip = null;
  const syncProjectChip = () => {
    projectChip?.remove();
    projectChip = null;
    if (!projectFilter || !statusRow) return;
    const entry = entries.find(item => item.dataset.archiveProject === projectFilter);
    if (!entry) return;
    const title = entry.querySelector('strong')?.textContent?.trim() || projectFilter;
    projectChip = document.createElement('button');
    projectChip.type = 'button';
    projectChip.className = 'archive-project-query';
    projectChip.textContent = `${projectPrefix} · ${title} ×`;
    projectChip.setAttribute('aria-label', `${projectPrefix}: ${title}`);
    projectChip.addEventListener('click', () => {
      projectFilter = '';
      replaceQuery('project', '');
      syncProjectChip();
      apply();
    });
    statusRow.appendChild(projectChip);
  };

  /* One rollover = one selected medium. Images and videos use the same ready gate:
     the layer stays hidden until the selected medium itself is composited. */
  const style = document.createElement('style');
  style.dataset.archiveRolloverV4 = '';
  style.textContent = `
    @media (min-width:901px) and (hover:hover) and (pointer:fine){
      .archive-entry-media{pointer-events:none!important;contain:paint;will-change:opacity;opacity:0!important;transition:opacity .08s linear!important}
      .archive-entry.is-media-ready .archive-entry-media{opacity:1!important}
      .archive-entry-media>img,.archive-entry-media>video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;visibility:visible!important;opacity:0!important}
      .archive-entry.is-media-ready.is-media-image .archive-entry-media>img{opacity:1!important}
      .archive-entry.is-media-ready.is-media-video .archive-entry-media>video{opacity:1!important}
    }
  `;
  document.head.appendChild(style);

  const parsePool = (raw, fallback = '') => {
    if (!raw) return fallback ? [fallback] : [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return [...new Set(parsed.filter(Boolean))];
    } catch {}
    const list = raw.split('|').map(item => item.trim()).filter(Boolean);
    return list.length ? [...new Set(list)] : fallback ? [fallback] : [];
  };

  const buildPool = entry => {
    const images = parsePool(entry.dataset.archiveImages || '', entry.dataset.archiveImage || '');
    const videos = parsePool(entry.dataset.archiveVideos || '', entry.dataset.archiveVideo || '');
    const pool = [];
    const seen = new Set();
    const total = Math.max(images.length, videos.length);
    for (let i = 0; i < total; i++) {
      for (const item of [
        images[i] ? { kind: 'image', src: images[i] } : null,
        videos[i] ? { kind: 'video', src: videos[i] } : null
      ]) {
        if (!item) continue;
        const key = `${item.kind}:${item.src}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pool.push(item);
      }
    }
    return pool;
  };

  const ensureMediaLayer = entry => {
    let media = entry.querySelector('.archive-entry-media');
    if (!media) {
      media = document.createElement('span');
      media.className = 'archive-entry-media';
      media.setAttribute('aria-hidden', 'true');
      entry.prepend(media);
    }

    let image = media.querySelector('img');
    if (!image) {
      image = document.createElement('img');
      image.alt = '';
      media.prepend(image);
    }
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';

    let video = media.querySelector('video');
    if (!video) {
      video = document.createElement('video');
      media.append(video);
    }
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('data-stagger-video', '');
    video.removeAttribute('poster');
    return { media, image, video };
  };

  const imageCache = new Map();
  const preloadImage = src => {
    if (!src) return Promise.reject(new Error('missing image'));
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const loader = new Image();
      loader.decoding = 'async';
      loader.onload = () => resolve(src);
      loader.onerror = reject;
      loader.src = src;
    });
    imageCache.set(src, promise);
    return promise;
  };

  const mediaState = new WeakMap();
  const stateFor = entry => {
    let state = mediaState.get(entry);
    if (state) return state;
    state = { pool: buildPool(entry), index: -1, token: 0, selected: null, videoSrc: '' };
    mediaState.set(entry, state);
    return state;
  };

  const nextMedium = entry => {
    const state = stateFor(entry);
    if (!state.pool.length) return null;
    state.index = (state.index + 1) % state.pool.length;
    state.selected = state.pool[state.index];
    entry.dataset.archiveCycleIndex = String(state.index);
    entry.dataset.archiveCycleKind = state.selected.kind;
    return state.selected;
  };

  const peekNextMedium = entry => {
    const state = stateFor(entry);
    if (!state.pool.length) return null;
    return state.pool[(state.index + 1) % state.pool.length];
  };

  let activeEntry = null;

  const stillCurrent = (entry, state, token, kind, src) => (
    activeEntry === entry
    && entry.dataset.archiveMediaWanted === 'true'
    && state.token === token
    && state.selected?.kind === kind
    && state.selected?.src === src
  );

  const reveal = (entry, kind) => {
    entry.classList.toggle('is-media-image', kind === 'image');
    entry.classList.toggle('is-media-video', kind === 'video');
    entry.classList.add('is-media-ready');
  };

  const showImage = (entry, selected, state, token) => {
    const { image, video } = ensureMediaLayer(entry);
    video.pause();
    entry.classList.remove('has-archive-video', 'is-video-ready', 'is-media-video', 'is-media-ready');
    entry.classList.add('is-media-image');

    preloadImage(selected.src).then(() => {
      if (!stillCurrent(entry, state, token, 'image', selected.src)) return;
      image.src = selected.src;
      requestAnimationFrame(() => {
        if (!stillCurrent(entry, state, token, 'image', selected.src)) return;
        reveal(entry, 'image');
      });
    }).catch(() => {
      if (stillCurrent(entry, state, token, 'image', selected.src)) {
        entry.classList.remove('is-media-ready');
      }
    });
  };

  const showVideo = (entry, selected, state, token) => {
    const { video } = ensureMediaLayer(entry);
    entry.classList.remove('is-media-image', 'is-media-ready', 'is-video-ready');
    entry.classList.add('is-media-video', 'has-archive-video');

    if (state.videoSrc !== selected.src || video.currentSrc !== new URL(selected.src, document.baseURI).href) {
      state.videoSrc = selected.src;
      video.pause();
      video.src = selected.src;
      video.dataset.src = selected.src;
      video.preload = saveData ? 'metadata' : 'auto';
      try { video.load(); } catch {}
    } else if (!saveData && video.preload !== 'auto') {
      video.preload = 'auto';
      try { video.load(); } catch {}
    }

    let revealed = false;
    const revealFrame = () => {
      if (revealed || !stillCurrent(entry, state, token, 'video', selected.src) || video.paused) return;
      revealed = true;
      entry.classList.add('is-video-ready');
      reveal(entry, 'video');
    };

    const waitForFrame = () => {
      if (!stillCurrent(entry, state, token, 'video', selected.src)) return;
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(revealFrame);
      } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        requestAnimationFrame(revealFrame);
      } else {
        video.addEventListener('loadeddata', () => requestAnimationFrame(revealFrame), { once: true });
      }
    };

    waitForFrame();
    const play = video.play();
    if (play?.then) {
      play.then(waitForFrame).catch(() => {
        if (stillCurrent(entry, state, token, 'video', selected.src)) {
          entry.classList.remove('is-media-ready', 'is-video-ready');
        }
      });
    } else if (!video.paused) {
      waitForFrame();
    }
  };

  const prewarmNext = (entry, aggressive = false) => {
    if (!entry || entry.hidden || !desktop() || motionOff()) return;
    const next = peekNextMedium(entry);
    if (!next) return;

    if (next.kind === 'image') {
      preloadImage(next.src).catch(() => {});
      return;
    }

    if (saveData || activeEntry === entry) return;
    const state = stateFor(entry);
    const { video } = ensureMediaLayer(entry);
    if (state.videoSrc === next.src && video.src) return;
    state.videoSrc = next.src;
    video.pause();
    video.src = next.src;
    video.dataset.src = next.src;
    video.preload = aggressive ? 'auto' : 'metadata';
    try { video.load(); } catch {}
  };

  entries.forEach(entry => {
    entry.dataset.archiveMediaWanted = 'false';
    ensureMediaLayer(entry);
    stateFor(entry);
  });

  const warmObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(items => {
        items.forEach(item => {
          if (!item.isIntersecting || !desktop() || motionOff()) return;
          const state = stateFor(item.target);
          const images = state.pool.filter(media => media.kind === 'image');
          const preloadSet = saveData ? images.slice(0, 1) : images;
          preloadSet.forEach(media => preloadImage(media.src).catch(() => {}));
          prewarmNext(item.target, !saveData);
        });
      }, { rootMargin: saveData ? '350px 0px' : '1500px 0px', threshold: 0 })
    : null;
  entries.forEach(entry => warmObserver?.observe(entry));

  const activateMedia = entry => {
    if (!entry || entry.hidden || !desktop() || motionOff()) return;
    if (entry === activeEntry && entry.dataset.archiveMediaWanted === 'true') return;

    if (activeEntry && activeEntry !== entry) deactivateMedia(activeEntry);
    const state = stateFor(entry);
    const selected = nextMedium(entry);
    if (!selected) return;

    activeEntry = entry;
    state.token += 1;
    const token = state.token;
    entry.dataset.archiveMediaWanted = 'true';
    entry.classList.add('is-media-active');
    entry.classList.remove('is-media-ready', 'is-media-image', 'is-media-video', 'has-archive-video', 'is-video-ready');

    if (selected.kind === 'image') showImage(entry, selected, state, token);
    else showVideo(entry, selected, state, token);
  };

  function deactivateMedia(entry) {
    if (!entry) return;
    const state = stateFor(entry);
    state.token += 1;
    entry.dataset.archiveMediaWanted = 'false';
    entry.classList.remove('is-media-active', 'is-media-ready', 'is-media-image', 'is-media-video', 'has-archive-video', 'is-video-ready');
    const video = entry.querySelector('.archive-entry-media video');
    if (video && !video.paused) video.pause();
    if (activeEntry === entry) activeEntry = null;
    prewarmNext(entry, !saveData);
  }

  let keyboardEntry = null;
  let pointerX = -1;
  let pointerY = -1;
  let pointerKnown = false;
  let reconcileRAF = 0;

  const rememberPointer = event => {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerKnown = true;
  };

  const hitTest = () => {
    if (!desktop() || motionOff() || document.hidden) return null;
    if (keyboardEntry && !keyboardEntry.hidden) return keyboardEntry;
    if (!pointerKnown || pointerX < 0 || pointerY < 0 || pointerX > innerWidth || pointerY > innerHeight) return null;
    const node = document.elementFromPoint(pointerX, pointerY);
    const entry = node instanceof Element ? node.closest('.archive-entry') : null;
    return entry && root.contains(entry) && !entry.hidden ? entry : null;
  };

  const reconcile = () => {
    reconcileRAF = 0;
    const next = hitTest();
    if (next === activeEntry) return;
    if (activeEntry) deactivateMedia(activeEntry);
    if (next) activateMedia(next);
  };

  const scheduleReconcile = () => {
    if (reconcileRAF || !desktop()) return;
    reconcileRAF = requestAnimationFrame(reconcile);
  };

  /* Direct pointer delegation stays the fastest path. Scroll/resize only use one
     hit-test per painted frame; there is still no permanent RAF loop. */
  root.addEventListener('pointerover', event => {
    rememberPointer(event);
    const entry = event.target instanceof Element ? event.target.closest('.archive-entry') : null;
    if (entry && root.contains(entry) && !entry.hidden) activateMedia(entry);
    else scheduleReconcile();
  }, { passive: true });
  root.addEventListener('pointermove', event => {
    rememberPointer(event);
    scheduleReconcile();
  }, { passive: true });
  addEventListener('wheel', event => {
    rememberPointer(event);
    scheduleReconcile();
  }, { passive: true });
  addEventListener('scroll', scheduleReconcile, { passive: true });
  if ('onscrollend' in window) addEventListener('scrollend', scheduleReconcile, { passive: true });
  addEventListener('resize', () => {
    if (!desktop()) {
      pointerKnown = false;
      if (activeEntry) deactivateMedia(activeEntry);
      return;
    }
    scheduleReconcile();
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    pointerKnown = false;
    if (!keyboardEntry && activeEntry) deactivateMedia(activeEntry);
  }, { passive: true });

  root.addEventListener('focusin', event => {
    const entry = event.target instanceof Element ? event.target.closest('.archive-entry') : null;
    if (!entry) return;
    keyboardEntry = entry;
    activateMedia(entry);
  });
  root.addEventListener('focusout', event => {
    const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.archive-entry') : null;
    keyboardEntry = to || null;
    scheduleReconcile();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (reconcileRAF) cancelAnimationFrame(reconcileRAF);
      reconcileRAF = 0;
      const video = activeEntry?.querySelector('.archive-entry-media video');
      video?.pause();
      return;
    }
    scheduleReconcile();
  });

  const apply = () => {
    const type = typeSelect?.value || 'all';
    const year = yearSelect?.value || 'all';
    const tag = tagSelect?.value || 'all';
    let visible = 0;

    entries.forEach(entry => {
      const statuses = (entry.dataset.archiveStatus || '').split(/\s+/).filter(Boolean);
      const types = (entry.dataset.archiveType || '').split(/\s+/).filter(Boolean);
      const years = (entry.dataset.archiveYears || '').split(/\s+/).filter(Boolean);
      const tags = (entry.dataset.archiveTags || '').split(/\s+/).filter(Boolean);
      const show = (status === 'all' || statuses.includes(status))
        && (type === 'all' || types.includes(type))
        && (year === 'all' || years.includes(year))
        && (tag === 'all' || tags.includes(tag))
        && (!projectFilter || entry.dataset.archiveProject === projectFilter);
      entry.hidden = !show;
      if (show) visible++;
    });

    groups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('.archive-entry')].some(entry => !entry.hidden);
    });
    if (count) count.textContent = countLabel(visible);
    empty?.classList.toggle('is-visible', visible === 0);
    if (activeEntry?.hidden) deactivateMedia(activeEntry);
    scheduleReconcile();
  };

  statusButtons.forEach(button => button.addEventListener('click', () => {
    status = button.dataset.archiveStatusFilter || 'all';
    statusButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    apply();
  }));
  typeSelect?.addEventListener('change', apply);
  yearSelect?.addEventListener('change', apply);
  tagSelect?.addEventListener('change', () => {
    replaceQuery('tag', tagSelect.value);
    apply();
  });

  [...document.querySelectorAll('.archive-filter-button')].forEach(item => {
    item.addEventListener('pointermove', event => {
      if (!desktop()) return;
      const r = item.getBoundingClientRect();
      item.style.setProperty('--magnet-x', `${((event.clientX - r.left - r.width / 2) * .055).toFixed(2)}px`);
      item.style.setProperty('--magnet-y', `${((event.clientY - r.top - r.height / 2) * .09).toFixed(2)}px`);
    }, { passive: true });
    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--magnet-x', '0px');
      item.style.setProperty('--magnet-y', '0px');
    }, { passive: true });
  });

  hoverCapable.addEventListener?.('change', () => {
    if (!desktop()) {
      pointerKnown = false;
      if (activeEntry) deactivateMedia(activeEntry);
    } else {
      scheduleReconcile();
    }
  });
  reduced.addEventListener?.('change', () => {
    if (motionOff()) {
      if (activeEntry) deactivateMedia(activeEntry);
    } else {
      scheduleReconcile();
    }
  });

  syncProjectChip();
  apply();
})();