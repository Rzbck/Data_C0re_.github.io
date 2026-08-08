(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];
  const body = document.body;

  // Remove the unclear three-colour header marker immediately.
  q('.brand-mark')?.remove();

  // Single override layer: keeps the existing static site intact while applying the V0.6 editorial pass.
  const style = document.createElement('style');
  style.textContent = `
    .brand-mark{display:none!important}.brand{gap:0!important}
    .section,.project{padding:clamp(76px,8vw,132px) var(--gutter)!important}.project{min-height:auto!important}
    .direction,.about{min-height:72vh!important}.project-head{margin-bottom:clamp(34px,4.5vw,66px)!important}
    .project-head h2{font-size:clamp(48px,7vw,116px)!important;line-height:.86!important}.project-summary{font-size:clamp(15px,1.25vw,20px)!important}
    .site-menu{overflow-y:auto!important;overscroll-behavior:contain}.menu-inner{min-height:100dvh!important;height:auto!important;padding-top:calc(var(--header-h) + clamp(28px,4.5vh,56px))!important;padding-bottom:42px!important;padding-right:min(35vw,520px)!important;display:block!important;position:relative}
    .menu-meta{margin-bottom:18px!important}.menu-category,.index-group-label{color:var(--grey);text-transform:uppercase;letter-spacing:.13em;font-size:9px;font-weight:700;padding:10px 0 8px}.menu-category--spaced,.index-group-label--spaced{margin-top:18px}
    .menu-list a{font-size:clamp(18px,min(2vw,3.4vh),36px)!important;padding:clamp(7px,.9vh,11px) 0!important}.menu-list--secondary a{font-size:clamp(16px,min(1.65vw,2.8vh),29px)!important}
    .menu-preview{position:fixed;right:var(--gutter);top:18vh;width:min(30vw,450px);height:min(58vh,620px);background:#030303;border:1px solid var(--line);overflow:hidden;pointer-events:none}.menu-preview img{width:100%;height:100%;object-fit:contain;opacity:.88;transform:scale(1.01);transition:opacity .25s ease,transform .45s var(--ease)}.site-menu.open .menu-preview img{transform:scale(1)}
    .index-group-label{border-bottom:1px solid var(--line);padding-top:16px}.index-rows{border-top:0!important}.index-rows a{grid-template-columns:52px minmax(0,1fr) 220px 72px!important;padding:13px 0!important}.index-rows strong{font-size:clamp(17px,1.85vw,28px)!important}
    .project-facts{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:-18px 0 clamp(28px,4vw,50px)}.project-facts span{padding:10px 13px 10px 0;color:#b9b7b1;font-size:10px;letter-spacing:.055em;text-transform:uppercase;border-right:1px solid var(--line)}.project-facts span:last-child{border-right:0;padding-left:13px}.project-facts span:nth-child(2){padding-left:13px}.project-facts b{color:var(--paper);font-weight:800;margin-right:8px}
    .amen-process--video{background:#020202;overflow:hidden}.amen-process--video video{width:100%;height:100%;min-height:360px;object-fit:cover}.timeline-media--video figure{background:#020202}.timeline-media--video video{width:100%;height:100%;min-height:0;object-fit:cover}.timeline-media--video figure:nth-child(2) video{object-fit:contain}
    .lumina-stats{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:10px 0 clamp(34px,4vw,56px)}.lumina-stats div{padding:14px 14px 14px 0;border-right:1px solid var(--line)}.lumina-stats div:not(:first-child){padding-left:14px}.lumina-stats div:last-child{border-right:0}.lumina-stats strong{display:block;font-size:clamp(20px,2.2vw,36px);line-height:1;letter-spacing:-.04em}.lumina-stats span{display:block;margin-top:7px;color:var(--grey);font-size:9px;text-transform:uppercase;letter-spacing:.1em}
    .lumina-context-grid{display:grid;grid-template-columns:1.35fr .65fr;gap:10px;align-items:stretch}.compare-stage{position:relative;aspect-ratio:16/9;overflow:hidden;background:#020202}.compare-stage>img,.compare-after,.compare-after img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.compare-after{clip-path:inset(0 0 0 50%)}.compare-handle{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--acid)}.compare-handle:after{content:'↔';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:var(--acid);color:#050505;font-size:15px;font-weight:900}.lumina-compare input[type=range]{width:100%;margin:10px 0 0;accent-color:var(--acid)}.compare-labels{display:flex;justify-content:space-between;color:var(--grey);text-transform:uppercase;letter-spacing:.09em;font-size:9px}
    .lumina-role-stack{display:grid;grid-template-rows:.85fr 1.15fr;gap:10px}.lumina-human{min-height:0;background:#020202;overflow:hidden}.lumina-human img{object-fit:cover}.role-card--compact{min-height:0!important;padding:clamp(20px,2.3vw,32px)!important}.role-card--compact ul{margin-top:10px!important}.role-card--compact li{font-size:10px!important;padding:7px 0!important}
    .lumina-system-line{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:clamp(32px,4vw,55px) 0 0;padding:12px 0;color:var(--grey);font-size:9px;text-transform:uppercase;letter-spacing:.09em}.lumina-system-line b{color:var(--acid)}
    .lumina-technical{margin-top:clamp(40px,5vw,70px)!important;border-top:0!important;padding-top:0!important}.technical-intro{display:grid!important;grid-template-columns:1.1fr .9fr!important;gap:clamp(28px,5vw,80px)!important;align-items:end!important;margin-bottom:24px!important}.technical-intro h3{margin:0;font-size:clamp(30px,3.6vw,56px)!important;line-height:.96;letter-spacing:-.05em}.technical-intro>p{margin:0!important;max-width:600px;color:#aaa8a2!important;font-size:14px!important}
    .technical-tabs{display:flex;flex-wrap:wrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:10px}.technical-tabs button{appearance:none;border:0;border-right:1px solid var(--line);background:transparent;color:var(--grey);padding:11px 14px;cursor:pointer;font-size:9px;text-transform:uppercase;letter-spacing:.11em}.technical-tabs button.active,.technical-tabs button:hover{background:var(--paper);color:#080808}.technical-viewer{background:#050505;border:1px solid rgba(243,241,235,.10);overflow:hidden}.technical-viewer img{display:block;width:100%;height:min(66vh,720px);object-fit:contain;background:#070707;transition:opacity .18s ease}.technical-viewer figcaption{padding:0 12px 12px}
    .cloud-presentation{display:grid;grid-template-columns:minmax(0,640px) minmax(280px,1fr);gap:clamp(18px,3vw,48px);align-items:start;max-width:1240px;margin:0 auto}.cloud-video{max-width:640px;background:#000}.cloud-video video{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain}.cloud-stills{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cloud-stills img{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#000}
    .stage-video-pair figure{display:flex;flex-direction:column;min-width:0}.stage-video-pair video{min-height:360px;object-fit:contain;background:#000}.stage-video-pair figcaption{padding-top:10px;border-top:1px solid var(--line)}
    .systems-small-grid .system-case h3{font-size:clamp(30px,3.25vw,50px)!important}.system-case{padding-bottom:42px!important}.system-case p{font-size:clamp(14px,1.05vw,17px)!important}.research-timeline li{padding:14px 0!important}.research-timeline strong{font-size:clamp(18px,1.8vw,28px)!important}.direction-copy h2{font-size:clamp(48px,6.7vw,112px)!important}.about-grid{margin:58px 0!important}.about-grid>div>p{margin:0;max-width:720px;font-size:clamp(17px,1.7vw,27px);line-height:1.28}.selected-contexts{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.selected-contexts b,.selected-contexts span{border:1px solid var(--line);padding:7px 9px;font-size:9px;text-transform:uppercase;letter-spacing:.075em}.selected-contexts b{color:var(--acid)}
    @media(max-width:1100px){.menu-inner{padding-right:var(--gutter)!important}.menu-preview{display:none}.index-rows a{grid-template-columns:42px minmax(0,1fr) 150px 64px!important}.project-facts{grid-template-columns:1fr}.project-facts span,.project-facts span:nth-child(2),.project-facts span:last-child{padding:9px 0;border-right:0;border-bottom:1px solid var(--line)}.project-facts span:last-child{border-bottom:0}.lumina-stats{grid-template-columns:repeat(3,1fr)}.lumina-stats div:nth-child(3){border-right:0}.lumina-stats div:nth-child(n+4){border-top:1px solid var(--line)}.lumina-context-grid{grid-template-columns:1fr}.lumina-role-stack{grid-template-columns:1fr 1fr;grid-template-rows:auto}.technical-intro{grid-template-columns:1fr!important}.cloud-presentation{grid-template-columns:1fr;max-width:760px}}
    @media(max-width:680px){.menu-list a,.menu-list--secondary a{grid-template-columns:28px 1fr!important;font-size:clamp(20px,6.6vw,31px)!important}.menu-list small{display:none}.lumina-stats{grid-template-columns:1fr 1fr}.lumina-stats div{border-top:1px solid var(--line);border-right:1px solid var(--line)!important}.lumina-stats div:nth-child(even){border-right:0!important}.lumina-role-stack{grid-template-columns:1fr}.lumina-system-line{overflow-x:auto;justify-content:flex-start;white-space:nowrap;padding-bottom:14px}.technical-tabs button{flex:1 1 50%;border-bottom:1px solid var(--line)}.technical-viewer img{height:auto;max-height:65svh}.cloud-stills{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  // --- Navigation: three clear families, plus a visual preview on desktop. ---
  const menu = q('[data-menu]');
  const menuInner = q('.menu-inner');
  const menuFooter = q('.menu-footer');
  if (menuInner && menuFooter) {
    [...menuInner.children].forEach(el => { if (el !== menuFooter) el.remove(); });
    menuFooter.insertAdjacentHTML('beforebegin', `
      <div class="menu-meta">Portfolio index / 2016—2026</div>
      <div class="menu-category">Selected artistic work</div>
      <ol class="menu-list">
        <li><a href="#ascii" data-preview="./assets/media/ascii/portrait.webp"><span>01</span> ASCII / Pixel Realtime Study <small>2026</small></a></li>
        <li><a href="#snake" data-preview="./assets/media/snake/gameplay.webp"><span>02</span> Snake / Networked Retro System <small>2026</small></a></li>
        <li><a href="#lumina" data-preview="./assets/media/lumina/tunnel-blue.webp"><span>03</span> LUMINA / Geneva Lux <small>2025</small></a></li>
        <li><a href="#realtime" data-preview="./assets/media/realtime/audio-material.webp"><span>04</span> Realtime Studies <small>2025</small></a></li>
        <li><a href="#amen" data-preview="./assets/media/hardwinner/amen-live.webp"><span>05</span> AMEN / Church AV System <small>2016</small></a></li>
        <li><a href="#hardwinner-live" data-preview="./assets/media/hardwinner/lbe-2018.webp"><span>06</span> Hardwinner / Grenoble Live Systems <small>2016—18</small></a></li>
        <li><a href="#cloud" data-preview="./assets/media/cloud/pastel.webp"><span>07</span> Cloud Processing / GLSL <small>2018</small></a></li>
        <li><a href="#av-install" data-preview="./assets/media/av-install/hero.webp"><span>08</span> TouchDesigner AV System <small>2017</small></a></li>
      </ol>
      <div class="menu-category menu-category--spaced">Professional / institutional</div>
      <ol class="menu-list menu-list--secondary">
        <li><a href="#grand-theatre-case" data-preview="./assets/media/grand-theatre/geometry.webp"><span>09</span> Grand Théâtre de Genève <small>2023—24</small></a></li>
        <li><a href="#comedie-case" data-preview="./assets/media/comedie/venue.jpg"><span>10</span> Entre chien et loup / Comédie de Genève <small>2021—23</small></a></li>
        <li><a href="#stage-case" data-preview="./assets/media/stage/funradio-wide.webp"><span>11</span> Fun Radio + “National Radio” / Stage Systems <small>2016—17</small></a></li>
      </ol>
      <div class="menu-category menu-category--spaced">Research / profile</div>
      <ol class="menu-list menu-list--secondary">
        <li><a href="#research" data-preview="./assets/img/og-cover.jpg"><span>12</span> Selected R&amp;D <small>2016—25</small></a></li>
        <li><a href="#direction" data-preview="./assets/media/lumina/tunnel-blue.webp"><span>13</span> Current Direction <small>2027</small></a></li>
        <li><a href="#about" data-preview="./assets/media/ascii/symbol-field.webp"><span>14</span> Profile / Contact <small>—</small></a></li>
      </ol>
      <figure class="menu-preview" aria-hidden="true"><img src="./assets/media/lumina/tunnel-blue.webp" alt="" data-menu-preview></figure>
    `);
  }

  const workIndex = q('.index-rows');
  if (workIndex) workIndex.innerHTML = `
    <div class="index-group-label">Selected artistic work</div>
    <a href="#ascii"><span>01</span><strong>ASCII / Pixel Realtime Study</strong><em>Solo study</em><small>2026</small></a>
    <a href="#snake"><span>02</span><strong>Snake / Networked Retro System</strong><em>Solo project</em><small>2026</small></a>
    <a href="#lumina"><span>03</span><strong>LUMINA / Geneva Lux</strong><em>Collaborative installation</em><small>2025</small></a>
    <a href="#realtime"><span>04</span><strong>Realtime Studies</strong><em>Research series</em><small>2025</small></a>
    <a href="#amen"><span>05</span><strong>AMEN / Church AV System</strong><em>Collaborative project</em><small>2016</small></a>
    <a href="#hardwinner-live"><span>06</span><strong>Hardwinner / Grenoble Live Systems</strong><em>Collaborative live systems</em><small>2016—18</small></a>
    <a href="#cloud"><span>07</span><strong>Cloud Processing / GLSL</strong><em>Solo study</em><small>2018</small></a>
    <a href="#av-install"><span>08</span><strong>TouchDesigner AV System</strong><em>Solo system study</em><small>2017</small></a>
    <div class="index-group-label index-group-label--spaced">Professional / institutional</div>
    <a href="#grand-theatre-case"><span>09</span><strong>Grand Théâtre de Genève</strong><em>Projection integration</em><small>2023—24</small></a>
    <a href="#comedie-case"><span>10</span><strong>Entre chien et loup / Comédie de Genève</strong><em>Touring video system</em><small>2021—23</small></a>
    <a href="#stage-case"><span>11</span><strong>Fun Radio + “National Radio” / Stage Systems</strong><em>Realtime video + light</em><small>2016—17</small></a>
    <div class="index-group-label index-group-label--spaced">Research</div>
    <a href="#research"><span>12</span><strong>Selected R&amp;D</strong><em>Code / networks / media systems</em><small>2016—25</small></a>`;

  const fact = (id, html) => {
    const section = q(id); if (!section || q('.project-facts', section)) return;
    q('.project-head', section)?.insertAdjacentHTML('afterend', `<div class="project-facts reveal">${html}</div>`);
  };
  fact('#ascii','<span><b>Role</b> concept / visual system / programming</span><span><b>Context</b> solo realtime study</span><span><b>Tools</b> TouchDesigner</span>');
  fact('#snake','<span><b>Role</b> concept / programming / visual direction</span><span><b>System</b> game logic / music sync / online leaderboard</span><span><b>Tools</b> TouchDesigner + database integration</span>');
  fact('#realtime','<span><b>Format</b> two independent studies</span><span><b>Method</b> audio-reactive / cellular systems</span><span><b>Tools</b> TouchDesigner</span>');
  fact('#amen','<span><b>Role</b> core creative &amp; technical contributor</span><span><b>System</b> realtime 3D / show control / LED / DMX</span><span><b>Tools</b> TouchDesigner / Resolume / Python</span>');
  fact('#hardwinner-live','<span><b>Role</b> core creative &amp; technical contributor</span><span><b>Context</b> Grenoble / club + electronic-music stages</span><span><b>Tools</b> TouchDesigner / Resolume / GLSL / DMX</span>');
  fact('#cloud','<span><b>Role</b> solo visual study</span><span><b>Method</b> anisotropic image processing</span><span><b>Tools</b> TouchDesigner / GLSL</span>');
  fact('#av-install','<span><b>Type</b> realtime AV system study</span><span><b>Method</b> light / sound FX / audio analysis</span><span><b>Tools</b> TouchDesigner / Resolume</span>');

  // --- LUMINA: deep case study without making the page unnecessarily long. ---
  const lumina = q('#lumina');
  if (lumina) lumina.innerHTML = `
    <div class="project-number">03</div>
    <div class="project-head reveal"><div><p class="eyebrow accent-magenta">Collaborative public installation / Geneva Lux / 2025</p><h2>LUMINA</h2></div><p class="project-summary">A 12-metre interactive light environment developed with StripLab for Geneva Lux. My role connected structure, fabrication, realtime software and integration: Fusion 360, network planning, LED architecture, TouchDesigner programming, budgeting, workshop coordination and on-site setup.</p></div>
    <div class="project-facts reveal"><span><b>Role</b> Creative Technologist / Realtime Systems &amp; Integration</span><span><b>Context</b> Geneva Lux / public space / multi-year operation</span><span><b>System</b> TouchDesigner → Art-Net → addressable LED architecture</span></div>
    <div class="lumina-hero reveal"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/lumina/tunnel-blue.webp" data-autoplay><source src="./assets/media/lumina/loop.mp4" type="video/mp4"></video></div>
    <div class="lumina-stats reveal"><div><strong>12.05 m</strong><span>overall length</span></div><div><strong>8,556</strong><span>addressable LEDs</span></div><div><strong>4</strong><span>Block Arch sections</span></div><div><strong>4 × 1000 W</strong><span>power zones</span></div><div><strong>2025→27</strong><span>designed for reinstallation</span></div></div>
    <div class="lumina-context-grid reveal">
      <div class="lumina-compare" data-compare><div class="compare-stage"><img class="compare-before" src="./assets/media/lumina/site-before.svg" alt="Geneva Lux tunnel during site survey before LUMINA was installed."><div class="compare-after" data-compare-after><img src="./assets/media/lumina/tunnel-blue.webp" alt="LUMINA installed in the tunnel during Geneva Lux."></div><div class="compare-handle" data-compare-handle aria-hidden="true"></div></div><input type="range" min="8" max="92" value="50" aria-label="Compare the Geneva Lux site before and after LUMINA installation" data-compare-range><div class="compare-labels"><span>site survey / 2024</span><span>installation / 2025</span></div></div>
      <div class="lumina-role-stack"><figure class="lumina-human"><img src="./assets/media/lumina/human-scale.webp" alt="Visitor moving through the LUMINA installation." loading="lazy"><figcaption>human scale / public interaction</figcaption></figure><div class="role-card role-card--compact"><p class="eyebrow">My contribution</p><ul><li>Fusion 360 structure / fabrication drawings</li><li>network planning / LED integration / Art-Net</li><li>TouchDesigner programming / realtime light behaviour</li><li>budgeting / workshop and fabrication coordination</li><li>profile / groove optimisation with the carpenter</li><li>custom flycase / storage / transport design</li></ul></div></div>
    </div>
    <div class="lumina-system-line reveal"><span>TOUCHDESIGNER</span><b>→</b><span>ART-NET</span><b>→</b><span>4 CONTROL ZONES</span><b>→</b><span>8,556 LEDs</span><b>→</b><span>SPATIAL LIGHT</span></div>
    <div class="lumina-technical reveal"><div class="technical-intro"><div><p class="eyebrow">Design / fabrication / transport</p><h3>One system, from drawing to reinstallation.</h3></div><p>The project documentation covers structure, grooved timber profiles, LED integration, network/control architecture and a dedicated flycase. One drawing is shown at a time so the technical depth stays readable without turning the portfolio into an engineering dossier.</p></div><div class="technical-tabs" role="tablist" aria-label="LUMINA technical drawings"><button type="button" class="active" data-tech-src="./assets/media/lumina/technical-structure.svg" data-tech-caption="01 / STRUCTURE + ASSEMBLY" data-tech-alt="LUMINA structure and assembly drawing">structure</button><button type="button" data-tech-src="./assets/media/lumina/technical-profiles.svg" data-tech-caption="02 / PROFILES + RAINURAGE" data-tech-alt="LUMINA profile dimensions and groove planning">profiles</button><button type="button" data-tech-src="./assets/media/lumina/technical-flycase.svg" data-tech-caption="03 / CUSTOM FLYCASE" data-tech-alt="Custom flycase drawing for LUMINA storage and transport">flycase</button><button type="button" data-tech-src="./assets/media/lumina/technical-system.svg" data-tech-caption="04 / REALTIME CONTROL ARCHITECTURE" data-tech-alt="Sanitized LUMINA realtime control architecture diagram">system</button></div><figure class="technical-viewer"><img src="./assets/media/lumina/technical-structure.svg" alt="LUMINA structure and assembly drawing" data-tech-image><figcaption data-tech-caption>01 / STRUCTURE + ASSEMBLY</figcaption></figure></div>`;

  // Preserve the V0.5 media decisions: video over weak compressed stills.
  const amenGrid = q('#amen .amen-grid');
  if (amenGrid) amenGrid.innerHTML = `<figure class="amen-process amen-process--video"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-sim.webp" data-autoplay><source src="./assets/media/hardwinner/amen-process-simulation.mp4" type="video/mp4"></video><figcaption>01 / TouchDesigner + realtime 3D / show-control development</figcaption></figure><figure class="amen-process amen-process--video"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-control.webp" data-autoplay><source src="./assets/media/hardwinner/amen-process-lighting.mp4" type="video/mp4"></video><figcaption>02 / architectural lighting test / system behaviour</figcaption></figure><figure class="amen-live"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/amen-live.webp" data-autoplay><source src="./assets/media/hardwinner/amen-loop.mp4" type="video/mp4"></video><figcaption>03 / live architectural deployment</figcaption></figure>`;
  const hardwinner = q('#hardwinner-live .timeline-media');
  if (hardwinner) { hardwinner.classList.add('timeline-media--video'); hardwinner.innerHTML = `<figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/dave-clarke.webp" data-autoplay><source src="./assets/media/hardwinner/grenoble-2016-loop.mp4" type="video/mp4"></video><figcaption><b>2016</b> Dave Clarke / Grenoble / LBE — LED + light system</figcaption></figure><figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/light-control.webp" data-autoplay><source src="./assets/media/hardwinner/grenoble-control-loop.mp4" type="video/mp4"></video><figcaption><b>2016</b> realtime light control / BPM / operator interface</figcaption></figure><figure class="timeline-feature"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/hardwinner/lbe-2018.webp" data-autoplay><source src="./assets/media/hardwinner/lbe-loop.mp4" type="video/mp4"></video><figcaption><b>2018</b> La Belle Électrique / TouchDesigner + GLSL + Resolume</figcaption></figure>`; }

  // Cloud: stop scaling the compressed source to near full-screen.
  const cloud = q('#cloud');
  if (cloud) {
    const summary = q('.project-summary', cloud); if (summary) summary.textContent = 'A cloud timelapse transformed through anisotropic GLSL processing in TouchDesigner — shifting between recognisable atmosphere and a painterly field of directional colour.';
    q('.artwork-grid', cloud)?.replaceWith(Object.assign(document.createElement('div'), {className:'cloud-presentation reveal', innerHTML:`<figure class="cloud-video"><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/cloud/hero.webp" data-autoplay><source src="./assets/media/cloud/loop.mp4" type="video/mp4"></video><figcaption>processed timelapse / displayed close to source resolution</figcaption></figure><div class="cloud-stills"><figure><img src="./assets/media/cloud/pastel.webp" alt="Pastel cyan and magenta cloud processing state." loading="lazy"><figcaption>pastel diffusion</figcaption></figure><figure><img src="./assets/media/cloud/cyan-orange.webp" alt="Cyan and orange cloud processing state." loading="lazy"><figcaption>directional colour state</figcaption></figure></div>`}));
  }

  // Professional contexts: exact roles / clearer grouping.
  const systems = q('#systems');
  if (systems) { const n=q('.section-index',systems); if(n)n.textContent='09—11'; const large=q('.system-case--large',systems); if(large) large.id='grand-theatre-case'; }
  const comedie = q('#comedie-case');
  if (comedie) { const p=q('.system-case-copy p',comedie); if(p)p.innerHTML='<em>Entre chien et loup</em> — <strong>Régisseur vidéo &amp; interactive designer / touring video system.</strong> Preparation and adaptation to each venue, coordination of local technical teams, multilingual surtitling, testing / troubleshooting and written handovers for autonomous operation.'; const tags=q('.tag-row',comedie); if(tags)tags.innerHTML='<span>video system</span><span>touring adaptation</span><span>team coordination</span><span>surtitling</span><span>handover</span>'; }
  const stage = q('#stage-case');
  if (stage) { const title=q('h3',stage); if(title)title.textContent='Stage Systems / Fun Radio + “National Radio”'; const p=q('.system-case-copy p',stage); if(p)p.innerHTML='<strong>Fun Radio Party / Chambéry — 2016:</strong> stage design and live show, TouchDesigner / Resolume, video-light colour synchronisation and live deployment. <strong>“National Radio” — 2016–17:</strong> P3 LED-screen and DMX stage-design studies, realtime simulation, video routing and lighting-control development.'; const media=q('.system-case-media',stage); if(media){media.classList.add('stage-video-pair');media.innerHTML='<figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/stage/funradio-wide.webp" data-autoplay><source src="./assets/media/stage/funradio-loop.mp4" type="video/mp4"></video><figcaption>Fun Radio Party / Chambéry / live result</figcaption></figure><figure><video class="media-video" autoplay muted loop playsinline preload="metadata" poster="./assets/media/stage/national-wip.webp" data-autoplay><source src="./assets/media/stage/national-radio-loop.mp4" type="video/mp4"></video><figcaption>“National Radio” / Annecy / realtime stage simulation</figcaption></figure>';}}
  const research=q('#research'); if(research){const n=q('.section-index',research);if(n)n.textContent='12';const h=q('.research-head h2',research);if(h)h.textContent='Selected technical research behind the work.';}

  const about=q('#about .about-grid');
  if(about) about.innerHTML=`<div><p>Digital artist and creative technologist working across creative coding, interactive light, projection and realtime media systems — from solo software studies to public installations and touring theatre systems.</p><div class="selected-contexts"><b>Selected contexts</b><span>Geneva Lux</span><span>Festival d’Avignon</span><span>Odéon–Théâtre de l’Europe</span><span>Comédie de Genève</span><span>Grand Théâtre de Genève</span><span>La Belle Électrique</span></div></div><div class="skills"><span>TouchDesigner — advanced / ~15 years</span><span>Resolume</span><span>Millumin</span><span>SMODE</span><span>GLSL</span><span>Python</span><span>HTML / API REST / Git</span><span>DMX / Art-Net / OSC / DMX→SPI</span><span>Arduino / ESP32 / Raspberry Pi</span><span>Fusion 360 / 3D</span><span>LED / projection / mapping</span><span>streaming / realtime systems</span></div>`;

  // --- Interaction layer ---
  const menuToggle = q('[data-menu-toggle]');
  const header = q('[data-header]');
  const motionToggle = q('[data-motion-toggle]');
  const motionLabel = q('[data-motion-label]');
  let videos = qa('[data-autoplay]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = reduceMotion.matches;

  const setMenu = open => { if(!menu)return; menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));menuToggle?.setAttribute('aria-expanded',String(open));body.classList.toggle('menu-open',open); };
  menuToggle?.addEventListener('click',()=>setMenu(!menu?.classList.contains('open')));
  menu?.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  window.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  const updateHeader=()=>header?.classList.toggle('scrolled',window.scrollY>24);updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});

  const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;video.dataset.visible=String(entry.isIntersecting);if(!motionOff&&entry.isIntersecting)video.play().catch(()=>{});else video.pause()}),{rootMargin:'100px 0px',threshold:.08});
  videos.forEach(v=>videoObserver.observe(v));
  const applyMotion=()=>{motionToggle?.setAttribute('aria-pressed',String(motionOff));if(motionLabel)motionLabel.textContent=motionOff?'motion off':'motion on';videos.forEach(v=>{if(motionOff)v.pause();else if(v.dataset.visible==='true')v.play().catch(()=>{})})};
  motionToggle?.addEventListener('click',()=>{motionOff=!motionOff;applyMotion()});

  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -5% 0px'});qa('.reveal').forEach(el=>revealObserver.observe(el));

  const menuPreview=q('[data-menu-preview]');
  menu?.querySelectorAll('[data-preview]').forEach(link=>link.addEventListener('mouseenter',()=>{const next=link.dataset.preview;if(!menuPreview||!next||menuPreview.getAttribute('src')===next)return;menuPreview.style.opacity='.35';setTimeout(()=>{menuPreview.setAttribute('src',next);menuPreview.style.opacity='.9'},90)}));

  qa('[data-compare]').forEach(compare=>{const range=q('[data-compare-range]',compare),after=q('[data-compare-after]',compare),handle=q('[data-compare-handle]',compare);const update=()=>{const v=Number(range?.value||50);if(after)after.style.clipPath=`inset(0 0 0 ${v}%)`;if(handle)handle.style.left=`${v}%`};range?.addEventListener('input',update);update()});

  const techImage=q('[data-tech-image]'),techCaption=q('[data-tech-caption]');
  qa('[data-tech-src]').forEach(button=>button.addEventListener('click',()=>{qa('[data-tech-src]').forEach(b=>b.classList.remove('active'));button.classList.add('active');if(!techImage)return;techImage.style.opacity='.15';setTimeout(()=>{techImage.src=button.dataset.techSrc||'';techImage.alt=button.dataset.techAlt||'LUMINA technical drawing';if(techCaption)techCaption.textContent=button.dataset.techCaption||'';techImage.style.opacity='1'},120)}));

  reduceMotion.addEventListener?.('change',e=>{if(e.matches){motionOff=true;applyMotion()}});applyMotion();
})();
