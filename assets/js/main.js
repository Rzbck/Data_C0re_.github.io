(() => {
  const q = (selector, root = document) => root.querySelector(selector);

  const style = document.createElement('style');
  style.textContent = `
    .site-menu { overflow-y:auto; overscroll-behavior:contain; }
    .menu-inner { min-height:100dvh; height:auto; padding-bottom:clamp(34px,5vh,70px); }
    .menu-list a { font-size:clamp(19px,min(2.5vw,4.35vh),45px); padding:clamp(8px,1.15vh,13px) 0; }
    .amen-process--video { background:#020202; overflow:hidden; }
    .amen-process--video video { width:100%; height:100%; min-height:360px; object-fit:cover; }
    .timeline-media--video figure { background:#020202; }
    .timeline-media--video video { width:100%; height:100%; min-height:0; object-fit:cover; }
    .timeline-media--video figure:nth-child(2) video { object-fit:contain; }
    .lumina-technical { margin-top:clamp(54px,7vw,110px); border-top:1px solid var(--line); padding-top:clamp(28px,3vw,48px); }
    .technical-intro { display:grid; grid-template-columns:.42fr 1.25fr .75fr; gap:clamp(24px,4vw,70px); align-items:start; margin-bottom:clamp(28px,4vw,58px); }
    .technical-intro .eyebrow { padding-top:8px; }
    .technical-intro h3 { margin:0; font-size:clamp(28px,3.8vw,62px); line-height:.96; letter-spacing:-.05em; font-weight:760; }
    .technical-intro > p:last-child { margin:0; color:#bdbbb5; font-size:clamp(14px,1.15vw,18px); line-height:1.45; }
    .technical-drawings { display:grid; grid-template-columns:1.15fr .85fr; gap:10px; }
    .technical-drawings figure { background:#050505; border:1px solid rgba(243,241,235,.10); overflow:hidden; min-height:300px; }
    .technical-drawings figure img { width:100%; height:100%; object-fit:contain; background:#070707; transition:transform .45s var(--ease); }
    .technical-drawings figure:hover img { transform:scale(1.018); }
    .technical-drawings .technical-flycase { grid-column:1/-1; min-height:360px; }
    .technical-drawings figcaption { padding:0 12px 12px; }
    .stage-video-pair figure { display:flex; flex-direction:column; min-width:0; }
    .stage-video-pair video { min-height:360px; object-fit:contain; background:#000; }
    .stage-video-pair figcaption { padding-top:10px; border-top:1px solid var(--line); }
    @media (max-width:1100px) {
      .technical-intro { grid-template-columns:1fr 1.35fr; }
      .technical-intro > p:last-child { grid-column:2; }
    }
    @media (max-width:800px) {
      .technical-intro { grid-template-columns:1fr; }
      .technical-intro > p:last-child { grid-column:auto; }
      .technical-drawings { grid-template-columns:1fr; }
      .technical-drawings .technical-flycase { grid-column:auto; }
      .technical-drawings figure,.technical-drawings .technical-flycase { min-height:240px; }
      .amen-process--video video,.stage-video-pair video { min-height:260px; }
    }
  `;
  document.head.appendChild(style);

  const indexHardwinner = q('.index-rows a[href="#hardwinner-live"] strong');
  if (indexHardwinner) indexHardwinner.textContent = 'Hardwinner / Grenoble Live Systems';
  const indexStage = q('.index-rows a[href="#stage-case"] strong');
  if (indexStage) indexStage.textContent = 'Stage Systems / Fun Radio + National Radio';
  const menuHardwinner = q('.menu-list a[href="#hardwinner-live"]');
  if (menuHardwinner) menuHardwinner.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Hardwinner')) node.textContent = ' Hardwinner / Grenoble Live Systems '; });

  const luminaRole = q('#lumina .role-card ul');
  if (luminaRole && !luminaRole.textContent.includes('flycase')) {
    luminaRole.insertAdjacentHTML('beforeend', '<li>technical drawings / profile &amp; groove planning</li><li>flycase / transport design</li>');
  }
  const luminaGrid = q('#lumina .lumina-grid');
  if (luminaGrid && !q('#lumina .lumina-technical')) {
    luminaGrid.insertAdjacentHTML('afterend', `
      <div class="lumina-technical reveal" aria-label="LUMINA technical design documentation">
        <div class="technical-intro">
          <p class="eyebrow">Design / fabrication / transport</p>
          <h3>From spatial concept to a buildable, serviceable and transportable system.</h3>
          <p>Selected production drawings: global structure, profile / groove dimensions and a dedicated flycase designed for storage and transport of the installation.</p>
        </div>
        <div class="technical-drawings">
          <figure><img src="./assets/media/lumina/technical-structure.svg" alt="LUMINA global structure and assembly drawing." loading="lazy"><figcaption>01 / structure &amp; assembly</figcaption></figure>
          <figure><img src="./assets/media/lumina/technical-profiles.svg" alt="LUMINA profile dimensions and groove planning drawing." loading="lazy"><figcaption>02 / profiles &amp; rainurage</figcaption></figure>
          <figure class="technical-flycase"><img src="./assets/media/lumina/technical-flycase.svg" alt="Flycase design for storing and transporting the LUMINA installation." loading="lazy"><figcaption>03 / dedicated flycase</figcaption></figure>
        </div>
      </div>`);
  }

  const amenGrid = q('#amen .amen-grid');
  if (amenGrid) {
    amenGrid.innerHTML = `
      <figure class="amen-process amen-process--video">
        <video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-sim.webp" data-autoplay><source src="./assets/media/hardwinner/amen-process-simulation.mp4" type="video/mp4"></video>
        <figcaption>01 / TouchDesigner + realtime 3D / show-control development</figcaption>
      </figure>
      <figure class="amen-process amen-process--video">
        <video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-control.webp" data-autoplay><source src="./assets/media/hardwinner/amen-process-lighting.mp4" type="video/mp4"></video>
        <figcaption>02 / architectural lighting test / system behaviour</figcaption>
      </figure>
      <figure class="amen-live">
        <video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-live.webp" data-autoplay><source src="./assets/media/hardwinner/amen-loop.mp4" type="video/mp4"></video>
        <figcaption>03 / live architectural deployment</figcaption>
      </figure>`;
  }

  const hardwinnerTimeline = q('#hardwinner-live .timeline-media');
  if (hardwinnerTimeline) {
    hardwinnerTimeline.classList.add('timeline-media--video');
    hardwinnerTimeline.innerHTML = `
      <figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/dave-clarke.webp" data-autoplay><source src="./assets/media/hardwinner/grenoble-2016-loop.mp4" type="video/mp4"></video><figcaption><b>2016</b> Dave Clarke / Grenoble / LBE — LED + light system</figcaption></figure>
      <figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/light-control.webp" data-autoplay><source src="./assets/media/hardwinner/grenoble-control-loop.mp4" type="video/mp4"></video><figcaption><b>2016</b> realtime light control / BPM / operator interface</figcaption></figure>
      <figure class="timeline-feature"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/lbe-2018.webp" data-autoplay><source src="./assets/media/hardwinner/lbe-loop.mp4" type="video/mp4"></video><figcaption><b>2018</b> La Belle Électrique / TouchDesigner + GLSL + Resolume</figcaption></figure>`;
  }

  const stageCase = q('#stage-case');
  if (stageCase) {
    const stageTitle = q('h3', stageCase);
    const stageCopy = q('.system-case-copy p', stageCase);
    const stageMedia = q('.system-case-media', stageCase);
    if (stageTitle) stageTitle.textContent = 'Stage Systems / Fun Radio + “National Radio”';
    if (stageCopy) stageCopy.innerHTML = '<strong>Fun Radio Party / Chambéry — 2016:</strong> stage design and live show, TouchDesigner / Resolume, video-light colour synchronisation and live deployment. <strong>“National Radio” — 2016–17:</strong> P3 LED-screen and DMX stage-design studies, realtime simulation, video routing and lighting-control development.';
    if (stageMedia) {
      stageMedia.classList.add('stage-video-pair');
      stageMedia.innerHTML = '<figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/stage/funradio-wide.webp" data-autoplay><source src="./assets/media/stage/funradio-loop.mp4" type="video/mp4"></video><figcaption>Fun Radio Party / Chambéry / live result</figcaption></figure><figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/stage/national-wip.webp" data-autoplay><source src="./assets/media/stage/national-radio-loop.mp4" type="video/mp4"></video><figcaption>“National Radio” / Annecy / realtime stage simulation</figcaption></figure>';
    }
  }
})();

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
