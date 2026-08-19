(() => {
  'use strict';

  const root = document.querySelector('[data-archive-interactive]');
  if (!root || window.__DATA_C0RE_ARCHIVE_ROLLOVER_SOLID__) return;
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
  let status = 'all';
  let projectFilter = params.get('project') || '';
  if (projectFilter && !entries.some(entry => entry.dataset.archiveProject === projectFilter)) projectFilter = '';

  const requestedTag = params.get('tag') || '';
  if (tagSelect && requestedTag && [...tagSelect.options].some(option => option.value === requestedTag)) {
    tagSelect.value = requestedTag;
  }

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

  const hoverCapable = matchMedia('(min-width:901px) and (hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = () => hoverCapable.matches;
  const motionOff = () => reduced.matches || document.querySelector('[data-motion-toggle]')?.getAttribute('aria-pressed') === 'true';

  /* Native :hover is authoritative. JS prepares media and continuously
     reconciles the hit target while the document moves under a still pointer. */
  const style = document.createElement('style');
  style.dataset.archiveRolloverSolid = '';
  style.textContent = `
    @media (min-width:901px) and (hover:hover) and (pointer:fine){
      .archive-entry-media{pointer-events:none!important;contain:paint;will-change:opacity,transform}
      .archive-entry:hover .archive-entry-media,
      .archive-entry:focus-visible .archive-entry-media,
      .archive-entry.is-media-active .archive-entry-media{opacity:1!important;transform:scale(1)!important}
      .archive-entry-media>img,.archive-entry-media>video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
      .archive-entry-media>img{opacity:1!important;visibility:visible!important;transition:opacity .08s linear!important}
      .archive-entry-media>video{opacity:0!important;visibility:hidden!important;transition:opacity .08s linear!important}
      .archive-entry.is-video-ready .archive-entry-media>img{opacity:0!important;visibility:hidden!important}
      .archive-entry.is-video-ready .archive-entry-media>video{opacity:1!important;visibility:visible!important}
    }
  `;
  document.head.appendChild(style);

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
    video.preload = 'metadata';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    return { media, image, video };
  };

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
    realtime: 'assets/media/realtime/gol.webp',
    'grand-theatre': 'assets/media/grand-theatre/opera-01.webp',
    'stage-systems': 'assets/media/stage/funradio-01.webp'
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

  const posterState = new WeakMap();
  const preparePoster = entry => {
    if (posterState.has(entry)) return posterState.get(entry);
    const { image, video } = ensureMediaLayer(entry);
    const placeholder = placeholderFor(entry);
    image.src = placeholder;
    image.fetchPriority = 'low';
    video.poster = placeholder;

    const configured = getImagePool(entry)[0] || fallbackPosters[entry.dataset.archiveProject] || '';
    const state = { placeholder, configured, ready: false };
    posterState.set(entry, state);
    if (!configured) return state;

    const loader = new Image();
    loader.decoding = 'async';
    loader.onload = () => {
      state.ready = true;
      image.src = configured;
      video.poster = configured;
    };
    loader.onerror = () => { state.ready = false; };
    loader.src = configured;
    return state;
  };

  const videoState = new WeakMap();
  const prepareVideo = (entry, aggressive = false) => {
    const pool = getVideoPool(entry);
    if (!pool.length) return null;
    const { video } = ensureMediaLayer(entry);
    let state = videoState.get(entry);
    if (!state) {
      state = { index: 0, src: '', prepared: false };
      videoState.set(entry, state);
      video.addEventListener('playing', () => {
        if (activeEntry === entry && entry.dataset.archiveMediaWanted === 'true') {
          entry.classList.add('is-video-ready');
        }
      });
      const fallBackToPoster = () => entry.classList.remove('is-video-ready');
      video.addEventListener('waiting', fallBackToPoster);
      video.addEventListener('stalled', fallBackToPoster);
      video.addEventListener('error', fallBackToPoster);
      video.addEventListener('emptied', fallBackToPoster);
    }

    const wanted = pool[state.index % pool.length] || pool[0];
    if (state.src !== wanted) {
      state.src = wanted;
      video.src = wanted;
      video.dataset.src = wanted;
      video.preload = aggressive ? 'auto' : 'metadata';
      try { video.load(); } catch {}
      state.prepared = true;
    } else if (aggressive && video.preload !== 'auto') {
      video.preload = 'auto';
      try { video.load(); } catch {}
    }
    return { video, state, pool };
  };

  entries.forEach(entry => preparePoster(entry));

  const warmObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(items => {
        items.forEach(item => {
          if (!item.isIntersecting || !desktop() || motionOff()) return;
          prepareVideo(item.target, true);
        });
      }, { rootMargin: '1400px 0px', threshold: 0 })
    : null;
  entries.forEach(entry => warmObserver?.observe(entry));

  let activeEntry = null;
  let keyboardEntry = null;
  let pointerX = -1;
  let pointerY = -1;
  let pointerKnown = false;
  let hoverRAF = 0;

  const activateMedia = entry => {
    if (!entry || entry.hidden || !desktop() || motionOff()) return;
    entry.dataset.archiveMediaWanted = 'true';
    entry.classList.add('is-media-active');
    entry.classList.remove('is-video-ready');
    preparePoster(entry);

    const prepared = prepareVideo(entry, true);
    if (!prepared) return;
    const { video } = prepared;
    const play = video.play();
    if (play?.catch) play.catch(() => entry.classList.remove('is-video-ready'));
    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      requestAnimationFrame(() => {
        if (activeEntry === entry && !video.paused) entry.classList.add('is-video-ready');
      });
    }
  };

  const deactivateMedia = entry => {
    if (!entry) return;
    entry.dataset.archiveMediaWanted = 'false';
    entry.classList.remove('is-media-active', 'is-video-ready');
    const video = entry.querySelector('.archive-entry-media video');
    video?.pause();
  };

  const setActiveEntry = next => {
    if (next === activeEntry) return;
    const previous = activeEntry;
    activeEntry = next;
    if (previous) deactivateMedia(previous);
    if (next) activateMedia(next);
  };

  const hitTest = () => {
    if (!desktop() || motionOff() || document.hidden) return null;
    if (keyboardEntry && !keyboardEntry.hidden) return keyboardEntry;
    if (!pointerKnown) return null;
    if (pointerX < 0 || pointerY < 0 || pointerX > innerWidth || pointerY > innerHeight) return null;
    const node = document.elementFromPoint(pointerX, pointerY);
    const entry = node instanceof Element ? node.closest('.archive-entry') : null;
    return entry && root.contains(entry) && !entry.hidden ? entry : null;
  };

  const reconcile = () => setActiveEntry(hitTest());
  const hoverLoop = () => {
    hoverRAF = 0;
    reconcile();
    if (pointerKnown && desktop() && !document.hidden) hoverRAF = requestAnimationFrame(hoverLoop);
  };
  const ensureHoverLoop = () => {
    if (!hoverRAF && pointerKnown && desktop() && !document.hidden) hoverRAF = requestAnimationFrame(hoverLoop);
  };

  const rememberPointer = event => {
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerKnown = true;
      ensureHoverLoop();
    }
  };

  addEventListener('pointermove', rememberPointer, { passive: true });
  addEventListener('pointerover', rememberPointer, { passive: true });
  addEventListener('wheel', rememberPointer, { passive: true });
  addEventListener('scroll', ensureHoverLoop, { passive: true });
  addEventListener('resize', () => {
    if (!desktop()) setActiveEntry(null);
    else ensureHoverLoop();
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    pointerKnown = false;
    if (hoverRAF) cancelAnimationFrame(hoverRAF);
    hoverRAF = 0;
    if (!keyboardEntry) setActiveEntry(null);
  }, { passive: true });

  root.addEventListener('focusin', event => {
    const entry = event.target instanceof Element ? event.target.closest('.archive-entry') : null;
    if (!entry) return;
    keyboardEntry = entry;
    setActiveEntry(entry);
  });
  root.addEventListener('focusout', event => {
    const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest('.archive-entry') : null;
    keyboardEntry = to || null;
    if (keyboardEntry) setActiveEntry(keyboardEntry);
    else reconcile();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (hoverRAF) cancelAnimationFrame(hoverRAF);
      hoverRAF = 0;
      const video = activeEntry?.querySelector('.archive-entry-media video');
      video?.pause();
      return;
    }
    ensureHoverLoop();
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
    if (activeEntry?.hidden) setActiveEntry(null);
    reconcile();
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
      setActiveEntry(null);
    }
  });
  reduced.addEventListener?.('change', () => {
    if (motionOff()) setActiveEntry(null);
    else ensureHoverLoop();
  });

  syncProjectChip();
  apply();
})();
