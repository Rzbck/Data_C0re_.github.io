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

/* Portfolio refinement pass — v0.4 */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const style = document.createElement('style');
  style.textContent = `
    .site-menu{overflow-y:auto;overscroll-behavior:contain}
    .menu-inner{min-height:100dvh;height:auto;padding-top:calc(var(--header-h) + clamp(30px,5vh,64px));padding-bottom:clamp(34px,5vh,70px)}
    .menu-list a{font-size:clamp(19px,min(2.45vw,4.3vh),44px);padding:clamp(8px,1.15vh,13px) 0}
    .work-index{min-height:auto}
    .index-rows a{grid-template-columns:52px minmax(0,1fr) 220px 72px}
    .index-rows strong{font-size:clamp(18px,2vw,31px)}
    .lumina-grid img{object-fit:cover}
    .timeline-media.v04-focus{display:block;max-width:1000px;margin:0 auto}
    .timeline-media.v04-focus figure{min-height:0}
    .timeline-media.v04-focus video{height:auto;aspect-ratio:16/9;object-fit:contain;background:#000}
    .artwork-grid.v04-cloud{grid-template-columns:minmax(0,640px) minmax(240px,1fr) minmax(240px,1fr);align-items:start;max-width:1280px;margin:0 auto;gap:10px}
    .artwork-grid.v04-cloud .artwork-hero{grid-row:auto;min-height:0!important;max-width:640px}
    .artwork-grid.v04-cloud .artwork-hero video{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#000}
    .artwork-grid.v04-cloud figure:not(.artwork-hero){min-height:0}
    .artwork-grid.v04-cloud img{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#000}
    .case-credit{margin-top:18px!important;color:var(--grey)!important;font-size:13px!important;line-height:1.45!important}
    .system-case-media.v04-stage{grid-template-columns:1.45fr .75fr;min-height:0;align-items:start}
    .system-case-media.v04-stage img{height:auto;object-fit:contain;background:#000}
    .skills.v04-skills{display:flex;flex-wrap:wrap;gap:9px}
    .skills.v04-skills span{border:1px solid var(--line);padding:8px 11px;border-radius:999px;font-size:10px;text-transform:uppercase;letter-spacing:.075em;color:#d5d3cd}
    @media(max-width:1100px){
      .index-rows a{grid-template-columns:42px minmax(0,1fr) 150px 64px}
      .artwork-grid.v04-cloud{grid-template-columns:1fr 1fr;max-width:760px}
      .artwork-grid.v04-cloud .artwork-hero{grid-column:1/-1}
    }
    @media(max-width:800px){
      .menu-inner{padding-top:calc(var(--header-h) + 24px)}
      .menu-list a{grid-template-columns:32px 1fr auto;gap:8px;font-size:clamp(17px,5.2vw,26px)}
      .index-rows a{grid-template-columns:30px 1fr 54px;gap:8px}
      .index-rows em{display:none}
      .artwork-grid.v04-cloud{grid-template-columns:1fr}
      .artwork-grid.v04-cloud .artwork-hero{grid-column:auto}
      .system-case-media.v04-stage{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  // Complete the fullscreen index and make it scrollable.
  const menuList = $('.menu-list');
  if (menuList) {
    menuList.innerHTML = `
      <li><a href="#ascii"><span>01</span> ASCII / Pixel Realtime Study <small>2026</small></a></li>
      <li><a href="#snake"><span>02</span> Snake / Networked Retro System <small>2026</small></a></li>
      <li><a href="#lumina"><span>03</span> LUMINA / Geneva Lux <small>2025</small></a></li>
      <li><a href="#realtime"><span>04</span> Realtime Studies <small>2025</small></a></li>
      <li><a href="#amen"><span>05</span> AMEN / Church AV System <small>2016</small></a></li>
      <li><a href="#hardwinner-live"><span>06</span> Hardwinner / Live Systems <small>2016—18</small></a></li>
      <li><a href="#cloud"><span>07</span> Cloud Processing / GLSL <small>2018</small></a></li>
      <li><a href="#av-install"><span>08</span> TouchDesigner AV System <small>2017</small></a></li>
      <li><a href="#grand-theatre-case"><span>09</span> Grand Théâtre de Genève <small>2023—24</small></a></li>
      <li><a href="#comedie-case"><span>10</span> Entre chien et loup / Comédie de Genève <small>2021—23</small></a></li>
      <li><a href="#stage-case"><span>11</span> Fun Radio + National Radio / Stage Systems <small>2016—17</small></a></li>
      <li><a href="#research"><span>12</span> Selected R&D <small>2016—25</small></a></li>`;
    menuList.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      $('[data-menu]')?.classList.remove('open');
      $('[data-menu]')?.setAttribute('aria-hidden', 'true');
      $('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
    }));
  }

  // Complete the visible work index instead of stopping at 08.
  const indexRows = $('.index-rows');
  if (indexRows && !indexRows.querySelector('a[href="#grand-theatre-case"]')) {
    indexRows.insertAdjacentHTML('beforeend', `
      <a href="#grand-theatre-case"><span>09</span><strong>Grand Théâtre de Genève</strong><em>Projection integration</em><small>2023—24</small></a>
      <a href="#comedie-case"><span>10</span><strong>Entre chien et loup / Comédie de Genève</strong><em>Touring video system</em><small>2021—23</small></a>
      <a href="#stage-case"><span>11</span><strong>Fun Radio + National Radio / Stage Systems</strong><em>Realtime video + light</em><small>2016—17</small></a>
      <a href="#research"><span>12</span><strong>Selected R&D</strong><em>Code / networks / media systems</em><small>2016—25</small></a>`);
  }

  // LUMINA: replace the weak lower-left still with the clearer installation overview.
  const luminaFirst = $('#lumina .lumina-grid figure:first-child img');
  if (luminaFirst) {
    luminaFirst.src = './assets/media/lumina/tunnel-blue.webp';
    luminaFirst.alt = 'Blue-lit overview through the LUMINA installation.';
    const cap = luminaFirst.closest('figure')?.querySelector('figcaption');
    if (cap) cap.textContent = 'Installation / spatial overview';
  }

  // Hardwinner Live Systems: remove the two unreadable stills and let the actual LBE live video carry the section.
  const liveTimeline = $('#hardwinner-live .timeline-media');
  if (liveTimeline) {
    const figures = $$('figure', liveTimeline);
    figures.slice(0, 2).forEach(fig => fig.remove());
    liveTimeline.classList.add('v04-focus');
    const remainingCaption = liveTimeline.querySelector('figcaption');
    if (remainingCaption) remainingCaption.innerHTML = '<b>2018</b> La Belle Électrique / TouchDesigner + GLSL + Resolume';
  }

  // Cloud Processing: preserve native detail instead of scaling the compressed source to a giant block.
  const cloudGrid = $('#cloud .artwork-grid');
  if (cloudGrid) cloudGrid.classList.add('v04-cloud');
  const cloudSummary = $('#cloud .project-summary');
  if (cloudSummary) cloudSummary.textContent = 'A cloud timelapse transformed through anisotropic GLSL processing in TouchDesigner. The presentation keeps the compressed archive media close to source scale so the movement and painterly diffusion remain legible instead of becoming an oversized pixel field.';

  // Give stable anchors to institutional cases.
  const systemCases = $$('#systems .system-case');
  if (systemCases[0]) systemCases[0].id = 'grand-theatre-case';
  if (systemCases[1]) systemCases[1].id = 'comedie-case';
  if (systemCases[2]) systemCases[2].id = 'stage-case';

  // Comédie de Genève / Christiane Jatahy — exact role from CV + public production credits.
  const comedie = $('#comedie-case');
  if (comedie) {
    const year = $('.case-year', comedie);
    const title = $('h3', comedie);
    const copy = $('.system-case-copy', comedie);
    const tags = $('.tag-row', comedie);
    if (year) year.textContent = '2021—23';
    if (title) title.textContent = 'Entre chien et loup / Comédie de Genève / Christiane Jatahy';
    if (copy) {
      const p = copy.querySelector('p');
      if (p) p.innerHTML = '<strong>Régisseur vidéo & designer interactif — touring video system.</strong> Responsibility for the interactive video system in touring contexts: preparation and venue adaptation, coordination of local technical teams, task allocation, multilingual surtitling, testing / troubleshooting, and written handover documents so the system could be operated autonomously in my absence.';
      if (!copy.querySelector('.case-credit')) {
        const credit = document.createElement('p');
        credit.className = 'case-credit';
        credit.textContent = 'Public production credits list Julio Parente and Charlélie Chauvel for video / video system; the Centro Dramático Nacional also credits Charlélie Chauvel as Head of Video for the Madrid dates.';
        tags?.before(credit);
      }
    }
    if (tags) tags.innerHTML = '<span>video system</span><span>touring</span><span>surtitling</span><span>team coordination</span><span>handover</span>';
  }

  // Stage systems: stronger hierarchy for Fun Radio and preserve the literal “National Radio” archive label.
  const stage = $('#stage-case');
  if (stage) {
    const title = $('h3', stage);
    const p = $('.system-case-copy p', stage);
    const tags = $('.tag-row', stage);
    const media = $('.system-case-media', stage);
    if (title) title.textContent = 'Fun Radio / Chambéry + “National Radio” / Annecy';
    if (p) p.innerHTML = '<strong>Fun Radio Party / Chambéry — 2016:</strong> stage design and live show, light/video colour synchronisation, TouchDesigner and Resolume, with the final system documented in front of the audience. <strong>“National Radio” — 2016–17:</strong> WIP and stage-design studies using P3 LED screen, DMX control, realtime simulation, TouchDesigner and Resolume.';
    if (tags) tags.innerHTML = '<span>TouchDesigner</span><span>Resolume</span><span>DMX</span><span>LED screen</span><span>video / light sync</span>';
    if (media) {
      media.classList.add('v04-stage');
      const imgs = $$('img', media);
      if (imgs[0]) { imgs[0].src = './assets/media/stage/funradio-wide.webp'; imgs[0].alt = 'Wide Fun Radio Party stage view in Chambéry.'; }
      if (imgs[1]) { imgs[1].src = './assets/media/stage/national-wip.webp'; imgs[1].alt = 'Realtime stage-system work in progress labelled National Radio in the archive.'; }
    }
  }

  // CV-backed profile and technology stack.
  const aboutText = $('#about .about-grid > p');
  const skills = $('#about .skills');
  if (aboutText) aboutText.textContent = 'Digital artist, creative technologist and interactive-systems designer working across live performance, digital creation, electronics and fabrication. The practice connects software to physical production: prototyping, installation, testing, troubleshooting, documentation and technical handover.';
  if (skills) {
    skills.classList.add('v04-skills');
    skills.innerHTML = '<span>TouchDesigner — advanced / ~15 years</span><span>Resolume</span><span>Millumin</span><span>SMODE</span><span>GLSL</span><span>Python</span><span>HTML / API REST / Git</span><span>DMX / Art-Net / OSC / DMX→SPI</span><span>Arduino / ESP32 / Raspberry Pi</span><span>Fusion 360 / 3D</span><span>LED / projection / mapping</span><span>streaming / realtime systems</span>';
  }
})();
