(() => {
  const body = document.body;
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const header = document.querySelector('[data-header]');
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const motionLabel = document.querySelector('[data-motion-label]');
  const videos = [...document.querySelectorAll('[data-autoplay]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = reduceMotion.matches;

  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu?.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const applyMotionState = () => {
    motionToggle?.setAttribute('aria-pressed', String(motionOff));
    if (motionLabel) motionLabel.textContent = motionOff ? 'motion off' : 'motion on';
    videos.forEach(video => {
      if (motionOff) video.pause();
      else if (video.dataset.visible === 'true') video.play().catch(() => {});
    });
  };

  motionToggle?.addEventListener('click', () => {
    motionOff = !motionOff;
    applyMotionState();
  });

  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      video.dataset.visible = String(entry.isIntersecting);
      if (!motionOff && entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { rootMargin: '100px 0px', threshold: 0.08 });
  videos.forEach(video => videoObserver.observe(video));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));



  // Editorial index preview (desktop only): one restrained visual cue, no hover-video noise.
  const menuPreview = document.querySelector('[data-menu-preview]');
  menu?.querySelectorAll('[data-preview]').forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (!menuPreview) return;
      const next = link.dataset.preview;
      if (next && menuPreview.getAttribute('src') !== next) {
        menuPreview.style.opacity = '.35';
        window.setTimeout(() => {
          menuPreview.setAttribute('src', next);
          menuPreview.style.opacity = '.9';
        }, 90);
      }
    });
  });

  // LUMINA site → installation comparison.
  document.querySelectorAll('[data-compare]').forEach(compare => {
    const range = compare.querySelector('[data-compare-range]');
    const after = compare.querySelector('[data-compare-after]');
    const handle = compare.querySelector('[data-compare-handle]');
    const update = () => {
      const v = Number(range?.value || 50);
      if (after) after.style.clipPath = `inset(0 0 0 ${v}%)`;
      if (handle) handle.style.left = `${v}%`;
    };
    range?.addEventListener('input', update);
    update();
  });

  // LUMINA technical viewer: one drawing at a time keeps the page compact.
  const techImage = document.querySelector('[data-tech-image]');
  const techCaption = document.querySelector('[data-tech-caption]');
  document.querySelectorAll('[data-tech-src]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-tech-src]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      if (!techImage) return;
      techImage.style.opacity = '.15';
      window.setTimeout(() => {
        techImage.setAttribute('src', button.dataset.techSrc || '');
        techImage.setAttribute('alt', button.dataset.techAlt || 'LUMINA technical drawing');
        if (techCaption) techCaption.textContent = button.dataset.techCaption || '';
        techImage.style.opacity = '1';
      }, 120);
    });
  });

  const onReducedMotionChange = (event) => {
    if (event.matches) {
      motionOff = true;
      applyMotionState();
    }
  };
  reduceMotion.addEventListener?.('change', onReducedMotionChange);
  applyMotionState();
})();
