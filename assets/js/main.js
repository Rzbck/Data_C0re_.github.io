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

  const onReducedMotionChange = (event) => {
    if (event.matches) {
      motionOff = true;
      applyMotionState();
    }
  };
  reduceMotion.addEventListener?.('change', onReducedMotionChange);
  applyMotionState();
})();
