(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  /* V0.7 — precision / mobile / LUMINA cleanup */
  const style = document.createElement('style');
  style.textContent = `
    .lumina-stats{grid-template-columns:repeat(6,1fr)!important}.lumina-stats div:nth-child(5) strong{color:var(--acid)}
    .lumina-context-grid{display:grid!important;grid-template-columns:1fr 1fr .82fr!important;gap:10px!important;align-items:stretch!important}
    .lumina-context-grid figure{background:#030303;display:flex;flex-direction:column;min-width:0}.lumina-context-grid figure img{aspect-ratio:16/9;width:100%;height:auto;object-fit:cover}.lumina-context-grid figcaption{border-top:1px solid var(--line);padding-top:10px}.lumina-context-grid figcaption b{color:var(--acid);margin-right:8px}.lumina-context-grid .role-card{min-height:100%!important}
    .lumina-architecture{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1.18fr;gap:12px;align-items:center;margin:clamp(38px,5vw,68px) 0 0}.lumina-architecture>b{color:var(--grey);font-weight:500}.architecture-node{min-height:132px;padding:20px;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:center;background:#0a0a0a}.architecture-node strong{font-size:clamp(19px,1.8vw,28px);line-height:1;letter-spacing:-.035em}.architecture-node span{margin-top:12px;color:#9b9994;font-size:11px;line-height:1.35}.architecture-node--paper{background:var(--paper);color:#080808}.architecture-node--paper span,.architecture-node--acid span{color:#454541}.architecture-node--cyan{border-color:var(--cyan)}.architecture-node--magenta{border-color:var(--magenta)}.architecture-node--acid{background:var(--acid);color:#070707;border-color:var(--acid)}
    .lumina-system-line{justify-content:flex-start!important;gap:8px 18px!important;flex-wrap:wrap!important;white-space:normal!important}
    .technical-tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important;flex-wrap:initial!important}.technical-tabs button{width:100%!important;min-width:0!important;white-space:nowrap!important;text-align:center!important;border-bottom:0!important}.technical-tabs button:last-child{border-right:0!important}.technical-viewer img{height:auto!important;max-height:min(68vh,720px)!important;object-fit:contain!important;padding:14px!important}.technical-viewer figcaption{min-height:30px}
    @media(max-width:1100px){.lumina-stats{grid-template-columns:repeat(3,1fr)!important}.lumina-stats div:nth-child(3n){border-right:0!important}.lumina-stats div:nth-child(n+4){border-top:1px solid var(--line)}.lumina-context-grid{grid-template-columns:1fr 1fr!important}.lumina-context-grid .role-card{grid-column:1/-1}.lumina-architecture{grid-template-columns:1fr auto 1fr}.lumina-architecture>b:nth-of-type(2){display:none}.lumina-architecture .architecture-node:nth-of-type(3){grid-column:1}.lumina-architecture>b:nth-of-type(3){grid-column:2}.lumina-architecture .architecture-node:nth-of-type(4){grid-column:3}}
    @media(max-width:680px){
      :root{--gutter:18px;--header-h:54px}body{font-size:15px}.site-header{padding:0 18px}.motion-toggle{display:none!important}.menu-toggle{border-left:0!important;padding-right:0}.brand{font-size:12px}.section,.project{padding:70px 18px!important}.hero-copy{left:18px;bottom:16vh}.hero h1{font-size:clamp(68px,24vw,98px)!important;line-height:.76!important}.hero-kicker{font-size:13px!important}
      .position-grid,.project-head,.systems-head,.research-head{grid-template-columns:1fr!important;gap:20px!important}.position-title h2,.work-index h2,.systems-head h2,.research-head h2{font-size:clamp(36px,10.2vw,48px)!important;line-height:.96!important;letter-spacing:-.045em!important}.position-copy>p{font-size:17px!important}.work-index-head{display:block!important;margin-bottom:36px!important}.project-head{margin-bottom:30px!important}.project-head h2{font-size:clamp(42px,12vw,58px)!important;line-height:.9!important;letter-spacing:-.055em!important}.project-summary{font-size:16px!important;line-height:1.4!important;max-width:none!important}.project-facts{margin:-6px 0 28px!important}
      .index-rows a{grid-template-columns:28px minmax(0,1fr) 46px!important;gap:8px!important;padding:11px 0!important}.index-rows strong{font-size:clamp(19px,5.7vw,25px)!important;line-height:1.02!important}.index-group-label{margin-top:18px}.lumina-stats{grid-template-columns:1fr 1fr!important;margin-bottom:28px!important}.lumina-stats div{padding:12px 10px!important;border-right:1px solid var(--line)!important;border-top:1px solid var(--line)!important}.lumina-stats div:nth-child(even){border-right:0!important}.lumina-stats strong{font-size:24px!important}
      .lumina-context-grid{grid-template-columns:1fr!important}.lumina-context-grid .role-card{grid-column:auto}.role-card--compact{padding:20px!important}.lumina-architecture{grid-template-columns:1fr!important;gap:8px}.lumina-architecture>b{transform:rotate(90deg);justify-self:center}.lumina-architecture>b:nth-of-type(2){display:block!important}.lumina-architecture .architecture-node:nth-of-type(3),.lumina-architecture .architecture-node:nth-of-type(4),.lumina-architecture>b:nth-of-type(3){grid-column:auto!important}.architecture-node{min-height:102px;padding:17px}.architecture-node strong{font-size:23px}.lumina-system-line{overflow:visible!important;gap:8px 13px!important;line-height:1.5}
      .technical-intro h3{font-size:36px!important}.technical-tabs{grid-template-columns:repeat(3,1fr)!important}.technical-tabs button{min-height:42px!important;font-size:8.5px!important;padding:10px 5px!important}.technical-viewer img{padding:8px!important;max-height:54svh!important}.systems-small-grid{grid-template-columns:1fr!important}.system-case-media,.system-case-media--pair{grid-template-columns:1fr!important}.study-split,.portrait-layout,.process-grid,.amen-grid,.timeline-media,.stage-video-pair{grid-template-columns:1fr!important}.portrait-hero{min-height:60svh!important}.study-media{height:58svh!important}.amen-live{grid-column:auto!important;height:58svh!important}.timeline-media figure{min-height:0!important}.timeline-media video{height:auto!important}.direction,.about{min-height:auto!important}.direction-copy h2{font-size:clamp(42px,11vw,58px)!important;line-height:.9!important}.about-top h2{font-size:clamp(48px,13vw,70px)!important}.skills span{font-size:9px!important;padding:7px 9px!important}
    }
  `;
  document.head.appendChild(style);

  // LUMINA: replace the confusing before/after slider with clear project documentation.
  const stats = q('#lumina .lumina-stats');
  if (stats) stats.innerHTML = `
    <div><strong>12.05 m</strong><span>overall length</span></div>
    <div><strong>8,556</strong><span>RGB LEDs / WS2815</span></div>
    <div><strong>25,668</strong><span>DMX channels</span></div>
    <div><strong>51</strong><span>Art-Net universes / RGB payload</span></div>
    <div><strong>60 FPS</strong><span>realtime output</span></div>
    <div><strong>4</strong><span>control zones / PixLite</span></div>`;

  const context = q('#lumina .lumina-context-grid');
  if (context) context.innerHTML = `
    <figure><img src="./assets/media/lumina/nested.webp" alt="Nested LUMINA LED arches defining the spatial installation." loading="lazy"><figcaption><b>01</b> spatial structure / nested arches</figcaption></figure>
    <figure><img src="./assets/media/lumina/human-scale.webp" alt="Visitor moving through LUMINA at Geneva Lux." loading="lazy"><figcaption><b>02</b> public scale / installed work</figcaption></figure>
    <div class="role-card role-card--compact"><p class="eyebrow">My contribution</p><ul><li>Fusion 360 structure / fabrication drawings</li><li>network planning / LED integration / Art-Net</li><li>TouchDesigner programming / realtime light behaviour</li><li>budgeting / workshop and fabrication coordination</li><li>profile / groove optimisation with the carpenter</li><li>custom flycase / storage / transport design</li></ul></div>`;

  const sysLine = q('#lumina .lumina-system-line');
  if (sysLine) {
    sysLine.insertAdjacentHTML('beforebegin', `
      <div class="lumina-architecture reveal" aria-label="LUMINA realtime control architecture">
        <div class="architecture-node architecture-node--paper"><strong>TOUCHDESIGNER</strong><span>animation / logic / 60 FPS</span></div><b>→</b>
        <div class="architecture-node architecture-node--cyan"><strong>ART-NET</strong><span>51 universes / 25,668 RGB channels</span></div><b>→</b>
        <div class="architecture-node architecture-node--magenta"><strong>4 × PIXLITE</strong><span>E4-S Mk3 / distributed control</span></div><b>→</b>
        <div class="architecture-node architecture-node--acid"><strong>8,556 RGB LEDs</strong><span>WS2815 / spatial output</span></div>
      </div>`);
    sysLine.innerHTML = '<span>4 BLOCK ARCHES</span><b>·</b><span>4 × 1000 W POWER</span><b>·</b><span>12 V LED SYSTEM</span><b>·</b><span>2025 → 2027 REINSTALLATION</span>';
  }

  // Technical viewer: fixed-size labels, no unstable changing tab titles, no clipped synthetic system diagram.
  const tabs = q('#lumina .technical-tabs');
  const techImage = q('[data-tech-image]');
  const techCaption = q('[data-tech-caption]');
  if (tabs) tabs.innerHTML = `
    <button type="button" class="active" data-tech-src="./assets/media/lumina/technical-structure.svg" data-tech-caption="01 / STRUCTURE + ASSEMBLY" data-tech-alt="LUMINA structure and assembly drawing">structure</button>
    <button type="button" data-tech-src="./assets/media/lumina/technical-profiles.svg" data-tech-caption="02 / PROFILES + RAINURAGE" data-tech-alt="LUMINA aluminium profile and groove planning drawing">profiles</button>
    <button type="button" data-tech-src="./assets/media/lumina/technical-flycase.svg" data-tech-caption="03 / CUSTOM FLYCASE" data-tech-alt="LUMINA custom flycase drawing">flycase</button>`;
  if (techImage) { techImage.src = './assets/media/lumina/technical-structure.svg'; techImage.alt = 'LUMINA structure and assembly drawing'; }
  if (techCaption) techCaption.textContent = '01 / STRUCTURE + ASSEMBLY';
  qa('[data-tech-src]').forEach(button => button.addEventListener('click', () => {
    qa('[data-tech-src]').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    if (!techImage) return;
    techImage.style.opacity = '.15';
    window.setTimeout(() => {
      techImage.src = button.dataset.techSrc || '';
      techImage.alt = button.dataset.techAlt || 'LUMINA technical drawing';
      if (techCaption) techCaption.textContent = button.dataset.techCaption || '';
      techImage.style.opacity = '1';
    }, 100);
  }));

  // Base navigation / motion / scroll behaviour.
  const body = document.body;
  const menu = q('[data-menu]');
  const menuToggle = q('[data-menu-toggle]');
  const header = q('[data-header]');
  const motionToggle = q('[data-motion-toggle]');
  const motionLabel = q('[data-motion-label]');
  const videos = qa('[data-autoplay]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = reduceMotion.matches;

  const setMenu = open => {
    menu?.classList.toggle('open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
  menu?.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive:true });

  const applyMotionState = () => {
    motionToggle?.setAttribute('aria-pressed', String(motionOff));
    if (motionLabel) motionLabel.textContent = motionOff ? 'motion off' : 'motion on';
    videos.forEach(video => { if (motionOff) video.pause(); else if (video.dataset.visible === 'true') video.play().catch(()=>{}); });
  };
  motionToggle?.addEventListener('click', () => { motionOff = !motionOff; applyMotionState(); });
  const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    const video = entry.target; video.dataset.visible = String(entry.isIntersecting);
    if (!motionOff && entry.isIntersecting) video.play().catch(()=>{}); else video.pause();
  }), { rootMargin:'100px 0px', threshold:.08 });
  videos.forEach(video => videoObserver.observe(video));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold:.08, rootMargin:'0px 0px -5% 0px' });
  qa('.reveal').forEach(el => revealObserver.observe(el));

  // Restrained index preview on desktop.
  const menuPreview = q('[data-menu-preview]');
  menu?.querySelectorAll('[data-preview]').forEach(link => link.addEventListener('mouseenter', () => {
    if (!menuPreview) return; const next = link.dataset.preview;
    if (next && menuPreview.getAttribute('src') !== next) {
      menuPreview.style.opacity='.35'; window.setTimeout(()=>{ menuPreview.src=next; menuPreview.style.opacity='.9'; },90);
    }
  }));

  reduceMotion.addEventListener?.('change', e => { if (e.matches) { motionOff=true; applyMotionState(); } });
  applyMotionState();
})();
