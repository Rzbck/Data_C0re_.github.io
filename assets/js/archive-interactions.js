(() => {
  'use strict';

  const root = document.querySelector('[data-archive-interactive]');
  if (!root || window.__DATA_C0RE_ARCHIVE_ROLLOVER_V3__) return;
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

  /* CSS :hover is the zero-latency visual path. JS only decides which prepared
     video should play and never blocks the appearance of the rollover. */
  const style = document.createElement('style');
  style.dataset.archiveRolloverV3 = '';
  style.textContent = `
    @media (min-width:901px) and (hover:hover) and (pointer:fine){
      .archive-entry-media{pointer-events:none!important;contain:paint;will-change:opacity}
      .archive-entry:hover .archive-entry-media,
      .archive-entry:focus-visible .archive-entry-media,
      .archive-entry.is-media-active .archive-entry-media{opacity:1!important}
      .archive-entry-media>img,.archive-entry-media>video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
      .archive-entry-media>img{opacity:1;visibility:visible}
      .archive-entry-media>video{opacity:0;visibility:visible}
      .archive-entry.has-archive-video .archive-entry-media>img{opacity:.08!important}
      .archive-entry.has-archive-video .archive-entry-media>video{opacity:1!important}
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
  const getVideoPool = entry => parsePool(entry.dataset.archiveVideos || '', entry.dataset.archiveVideo || '');
  const getImagePool = entry => parsePool(entry.dataset.archiveImages || '', entry.dataset.archiveImage || '');

  const fallbackPosters = {
    lumina: 'assets/media/lumina/human-scale.webp',
    realtime: 'assets/media/realtime/game-of-life.webp',
    'grand-theatre': 'assets/media/grand-theatre/hero.webp',
    'stage-systems': 'assets/media/stage/funradio-wide.webp'
  };

  const svgData = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const placeholderFor = entry => {
    const key = entry.dataset.archiveProject || 'data-c0re';
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const a = 18 + (Math.abs(hash) % 58);
    const b = 22 + (Math.abs(hash >> 8) % 54);
    const c = 24 + (Math.abs(hash >> 16) % 52);
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#0a0b0b"/><g fill="none" stroke="#48e7ff" stroke-opacity=".32" stroke-width="2"><path d="M0 ${a * 9}H1600M${b * 14} 0V900"/><circle cx="${b * 14}" cy="${a * 9}" r="${90 + c}"/><circle cx="${b * 14}" cy="${a * 9}" r="${180 + a}" stroke-opacity=".16"/><path d="M0 900L${900 + a * 4} 0M${200 + c * 5} 900L1600 ${120 + b * 3}" stroke-opacity=".12"/></g><g fill="#dfff00"><rect x="${60 + a * 6}" y="${70 + b * 4}" width="10" height="10"/><rect x="${780 + c * 5}" y="${520 - a * 2}" width="7" height="7"/></g></svg>`);
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
    return { media, image, video };
  };

  const posterState = new WeakMap();
  const preparePoster = entry => {
    if (posterState.has(entry)) return posterState.get(entry);
    const { image, video } = ensureMediaLayer(entry);
    const placeholder = placeholderFor(entry);
    const configured = getImagePool(entry)[0] || fallbackPosters[entry.dataset.archiveProject] || '';
    const state = { placeholder, configured, ready: false };
    posterState.set(entry, state);

    image.src = placeholder;
    image.fetchPriority = 'low';
    video.poster = placeholder;

    if (configured) {
      const loader = new Image();
      loader.decoding = 'async';
      loader.onload = () => {
        state.ready = true;
        image.src = configured;
        video.poster = configured;
      };
      loader.src = configured;
    }
    return state;
  };

  const videoState = new WeakMap();
  let activeEntry = null;

  const markVideoVisible = (entry, video) => {
    if (activeEntry !== entry || entry.dataset.archiveMediaWanted !== 'true' || video.paused) return;
    entry.classList.add('has-archive-video', 'is-video-ready');
  };

  const waitForCompositedFrame = (entry, video) => {
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => markVideoVisible(entry, video));
      return;
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      requestAnimationFrame(() => markVideoVisible(entry, video));
    }
  };

  const prepareVideo = (entry, aggressive = false) => {
    const pool = getVideoPool(entry);
    if (!pool.length) return null;
    const { video } = ensureMediaLayer(entry);
    let state = videoState.get(entry);

    if (!state) {
      state = { src: '', index: 0, prepared: false, firstFrameSeen: false };
      videoState.set(entry, state);

      video.addEventListener('loadeddata', () => {
        state.firstFrameSeen = true;
        if (!video.paused) waitForCompositedFrame(entry, video);
      });
      video.addEventListener('playing', () => {
        state.firstFrameSeen = true;
        waitForCompositedFrame(entry, video);
      });
      video.addEventListener('error', () => {
        entry.classList.remove('has-archive-video', 'is-video-ready');
      });
    }

    const wanted = pool[state.index % pool.length] || pool[0];
    if (state.src !== wanted) {
      state.src = wanted;
      state.firstFrameSeen = false;
      video.src = wanted;
      video.dataset.src = wanted;
      video.preload = aggressive && !saveData ? 'auto' : 'metadata';
      try { video.load(); } catch {}
      state.prepared = true;
    } else if (aggressive && !saveData && video.preload !== 'auto') {
      video.preload = 'auto';
      try { video.load(); } catch {}
    }
    return { video, state, pool };
  };

  entries.forEach(entry => {
    entry.dataset.archiveMediaWanted = 'false';
    preparePoster(entry);
  });

  const warmObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(items => {
        items.forEach(item => {
          if (!item.isIntersecting || !desktop() || motionOff()) return;
          prepareVideo(item.target, !saveData);
        });
      }, { rootMargin: saveData ? '350px 0px' : '1500px 0px', threshold: 0 })
    : null;
  entries.forEach(entry => warmObserver?.observe(entry));

  const activateMedia = entry => {
    if (!entry || entry.hidden || !desktop() || motionOff()) return;
    if (entry === activeEntry && entry.dataset.archiveMediaWanted === 'true') return;

    if (activeEntry && activeEntry !== entry) deactivateMedia(activeEntry);
    activeEntry = entry;
    entry.dataset.archiveMediaWanted = 'true';
    entry.classList.add('is-media-active');
    entry.classList.remove('has-archive-video', 'is-video-ready');
    preparePoster(entry);

    const prepared = prepareVideo(entry, true);
    if (!prepared) return;
    const { video } = prepared;

    const play = video.play();
    if (play?.then) {
      play.then(() => waitForCompositedFrame(entry, video)).catch(() => {
        if (activeEntry === entry) entry.classList.remove('has-archive-video', 'is-video-ready');
      });
    } else if (!video.paused) {
      waitForCompositedFrame(entry, video);
    }
  };

  function deactivateMedia(entry) {
    if (!entry) return;
    entry.dataset.archiveMediaWanted = 'false';
    entry.classList.remove('is-media-active', 'has-archive-video', 'is-video-ready');
    const video = entry.querySelector('.archive-entry-media video');
    if (video && !video.paused) video.pause();
    if (activeEntry === entry) activeEntry = null;
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

  /* Direct pointer delegation is the fastest JS path. Scroll/resize use one
     batched hit-test per painted frame; there is no permanent RAF loop. */
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