(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.2 — stable theatre panels + final cleanups */
    .theatre-v092-head{display:grid;grid-template-columns:.48fr 1.52fr;gap:clamp(28px,5vw,88px);align-items:end;margin-bottom:28px}
    .theatre-v092-head h3{margin:0;font-size:clamp(42px,5.4vw,86px)!important;line-height:.9!important;letter-spacing:-.055em}
    .theatre-v092-head p{margin:0;max-width:820px;color:#b8b6b0;font-size:clamp(14px,1.08vw,17px);line-height:1.5}
    .theatre-production{border-top:1px solid var(--line);padding:clamp(26px,3.6vw,46px) 0}
    .theatre-production:last-child{padding-bottom:0}
    .theatre-production-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.82fr);gap:clamp(22px,4vw,66px);align-items:end}
    .theatre-production h4{margin:0;font-size:clamp(34px,3.9vw,60px);line-height:.94;letter-spacing:-.05em}
    .theatre-production-copy{margin:0;color:#bbb9b3;font-size:clamp(14px,1.02vw,16px);line-height:1.54;max-width:720px}
    .theatre-role{display:block;margin-bottom:9px;color:var(--acid);font-size:9px;text-transform:uppercase;letter-spacing:.11em;font-weight:800}
    .theatre-mini-facts{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}
    .theatre-mini-facts span{border:1px solid var(--line);border-radius:999px;padding:7px 10px;color:#a9a7a1;font-size:8.5px;line-height:1;text-transform:uppercase;letter-spacing:.075em}

    .theatre-panel{margin-top:24px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .theatre-panel-tabs{display:grid;grid-template-columns:repeat(3,1fr)}
    .theatre-panel-tabs button{appearance:none;background:none;color:#9e9c96;border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 10px;min-height:48px;text-transform:uppercase;letter-spacing:.09em;font-size:9px;font-weight:700;cursor:pointer}
    .theatre-panel-tabs button:last-child{border-right:0}
    .theatre-panel-tabs button.active{background:var(--paper);color:#070707}
    .theatre-panel-body{position:relative;min-height:320px}
    .theatre-panel-page{display:none;padding:18px 0 0}
    .theatre-panel-page.active{display:block}
    .theatre-panel-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:18px;align-items:start}
    .theatre-panel-copy{margin:0;color:#b9b7b2;font-size:13px;line-height:1.52;max-width:760px}
    .theatre-panel-copy strong{color:var(--paper)}
    .theatre-data-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:16px}
    .theatre-data-grid div{padding:12px;border-right:1px solid var(--line)}
    .theatre-data-grid div:last-child{border-right:0}
    .theatre-data-grid strong{display:block;font-size:clamp(18px,1.8vw,28px);line-height:1;letter-spacing:-.035em}
    .theatre-data-grid span{display:block;margin-top:6px;color:var(--grey);font-size:8px;line-height:1.3;text-transform:uppercase;letter-spacing:.085em}
    .theatre-media-duo{display:grid;grid-template-columns:1.2fr .8fr;gap:10px;margin-top:16px}
    .theatre-media-duo figure,.theatre-media-single figure{background:#030303;min-width:0}
    .theatre-media-duo img,.theatre-media-single img{width:100%;height:auto;display:block;object-fit:cover;background:#000}
    .theatre-media-duo .contain img{object-fit:contain}
    .theatre-media-duo figcaption,.theatre-media-single figcaption{border-top:1px solid var(--line);padding-top:8px;color:#a8a59f;font-size:10px;line-height:1.35}
    .theatre-media-single{margin-top:16px}
    .theatre-route{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .theatre-route div{padding:12px;border-right:1px solid var(--line)}
    .theatre-route div:last-child{border-right:0}
    .theatre-route time{display:block;color:var(--acid);font-size:8.5px;letter-spacing:.06em}
    .theatre-route strong{display:block;margin-top:5px;font-size:11px;line-height:1.15}
    .theatre-route span{display:block;margin-top:4px;color:var(--grey);font-size:8.5px;line-height:1.25}
    .theatre-note{margin:14px 0 0;padding-left:12px;border-left:2px solid var(--magenta);color:#aaa8a2;font-size:11px;line-height:1.48;max-width:900px}
    .install-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .install-step{border:1px solid var(--line);padding:14px;min-height:104px}
    .install-step b{display:block;color:var(--acid);font-size:9px;letter-spacing:.08em}
    .install-step strong{display:block;margin-top:9px;font-size:15px}
    .install-step span{display:block;margin-top:7px;color:var(--grey);font-size:9px;line-height:1.35}

    @media(max-width:1100px){
      .theatre-v092-head,.theatre-production-top,.theatre-panel-grid{grid-template-columns:1fr}
      .theatre-data-grid{grid-template-columns:repeat(2,1fr)}
      .theatre-data-grid div:nth-child(2n){border-right:0}
      .theatre-data-grid div:nth-child(n+3){border-top:1px solid var(--line)}
      .theatre-route{grid-template-columns:repeat(3,1fr)}
      .theatre-route div:nth-child(3n){border-right:0}
      .theatre-route div:nth-child(n+4){border-top:1px solid var(--line)}
      .install-strip{grid-template-columns:1fr 1fr}
    }
    @media(max-width:680px){
      .theatre-v092-head h3{font-size:40px!important}
      .theatre-production h4{font-size:34px}
      .theatre-panel-tabs{grid-template-columns:1fr}
      .theatre-panel-tabs button{border-right:0}
      .theatre-panel-body{min-height:0}
      .theatre-data-grid{grid-template-columns:1fr 1fr}
      .theatre-data-grid div{border-right:1px solid var(--line)!important;border-top:1px solid var(--line)}
      .theatre-data-grid div:nth-child(even){border-right:0!important}
      .theatre-media-duo,.install-strip{grid-template-columns:1fr}
      .theatre-route{display:flex;overflow-x:auto;scroll-snap-type:x mandatory}
      .theatre-route div{min-width:72vw;scroll-snap-align:start;border-right:1px solid var(--line)!important;border-top:0!important}
    }
  `;
  document.head.appendChild(style);

  // Ensure only one LUMINA architecture block exists.
  const lumina = q('#lumina');
  if (lumina) {
    const sysLine = q('#lumina .lumina-system-line');
    qa('#lumina .lumina-architecture').forEach((el, idx) => { if (idx > 0) el.remove(); });
    if (sysLine) {
      let arch = q('#lumina .lumina-architecture');
      if (!arch) {
        arch = document.createElement('div');
        arch.className = 'lumina-architecture reveal visible';
        sysLine.parentNode.insertBefore(arch, sysLine);
      }
      arch.innerHTML = `
        <div class="architecture-node architecture-node--paper"><strong>TOUCHDESIGNER</strong><span>animation / logic / 60 FPS</span></div><b>→</b>
        <div class="architecture-node architecture-node--cyan"><strong>ART-NET</strong><span>51 universes / 25,668 RGB channels</span></div><b>→</b>
        <div class="architecture-node architecture-node--magenta"><strong>4 × PIXLITE</strong><span>E4-S Mk3 / distributed control</span></div><b>→</b>
        <div class="architecture-node architecture-node--acid"><strong>8,556 RGB LEDs</strong><span>WS2815 / spatial output</span></div>`;
    }
  }

  const menuComedie = q('.menu-list a[href="#comedie-case"]');
  if (menuComedie) menuComedie.innerHTML = '<span>10</span> Theatre / Creation + Touring Systems <small>2021—23</small>';
  const indexComedie = q('.index-rows a[href="#comedie-case"] strong');
  if (indexComedie) indexComedie.textContent = 'Theatre / Creation + Touring Systems';
  const indexComedieMeta = q('.index-rows a[href="#comedie-case"] em');
  if (indexComedieMeta) indexComedieMeta.textContent = 'Jatahy / Lupa / Koohestani';

  const comedieCase = q('#comedie-case');
  if (comedieCase) {
    comedieCase.className = 'system-case theatre-case-v09 reveal visible';
    comedieCase.innerHTML = `
      <div class="theatre-v092-head">
        <div><span class="case-year">2021—23</span><h3>Theatre / Creation + Touring Systems</h3></div>
        <p>Three different responsibilities across contemporary theatre: <strong>creation + touring</strong> for <em>Entre chien et loup</em>, <strong>creation-phase system work</strong> for <em>Les Émigrants</em>, and <strong>touring installation + show operation</strong> for <em>En transit</em>. The page stays compact; detailed information switches inside stable panels instead of pushing the whole layout down.</p>
      </div>

      <section class="theatre-production" id="prod-ecel">
        <div class="theatre-production-top">
          <div><span class="theatre-role">01 / CREATION + TOURING / 2021—23</span><h4>Entre chien et loup<br>Christiane Jatahy</h4><div class="theatre-mini-facts"><span>live cinema</span><span>venue adaptation</span><span>multilingual surtitles</span><span>handover</span></div></div>
          <p class="theatre-production-copy">I participated in the creation and then in the touring life of the production. My work covered the video system as a working stage instrument: preparation, adaptation to each venue, local-team coordination, testing, troubleshooting, surtitling and reliable handover.</p>
        </div>
        <div class="theatre-panel" data-theatre-panel>
          <div class="theatre-panel-tabs">
            <button class="active" type="button" data-panel-target="ecel-role">role</button>
            <button type="button" data-panel-target="ecel-media">media</button>
            <button type="button" data-panel-target="ecel-route">route</button>
          </div>
          <div class="theatre-panel-body">
            <div class="theatre-panel-page active" id="ecel-role">
              <div class="theatre-panel-grid">
                <div>
                  <p class="theatre-panel-copy"><strong>Public credit:</strong> video system — Julio Parente & Charlélie Chauvel. This section keeps the focus on what the job actually involved: keeping a live-cinema setup production-ready, adapting it to different theatres, maintaining projection + surtitles, and handing over a stable system that could run reliably with local teams.</p>
                  <div class="theatre-data-grid"><div><strong>1 camera</strong><span>on-stage live capture</span></div><div><strong>8 × 4.32 m</strong><span>main projection screen</span></div><div><strong>live edit</strong><span>camera / media coordination</span></div><div><strong>touring</strong><span>adaptation + handover</span></div></div>
                  <p class="theatre-note"><strong>Precision:</strong> this block is intentionally compact. It describes your real role without overloading the page with technical inventory.</p>
                </div>
                <div class="theatre-media-single"><figure><img src="./assets/media/comedie/venue.jpg" alt="Comédie de Genève stage during Entre chien et loup production work" loading="lazy"><figcaption>Creation / venue context</figcaption></figure></div>
              </div>
            </div>
            <div class="theatre-panel-page" id="ecel-media">
              <div class="theatre-panel-grid">
                <div>
                  <p class="theatre-panel-copy">Rather than a synthetic plan, the page now keeps a more credible visual reading: venue context, video-control context and a short explanatory note. The goal is to show how the system lived inside production conditions, not to invent an unnecessary diagram.</p>
                  <div class="theatre-data-grid"><div><strong>setup</strong><span>venue checks / tests</span></div><div><strong>operation</strong><span>show-ready video flow</span></div><div><strong>surtitles</strong><span>multilingual playback</span></div><div><strong>support</strong><span>crew coordination</span></div></div>
                </div>
                <div class="theatre-media-duo"><figure><img src="./assets/media/comedie/venue.jpg" alt="Venue and stage context for Entre chien et loup" loading="lazy"><figcaption>Stage / venue situation</figcaption></figure><figure><img src="./assets/media/comedie/control.webp" alt="Video control environment for touring theatre work" loading="lazy"><figcaption>Control / operation context</figcaption></figure></div>
              </div>
            </div>
            <div class="theatre-panel-page" id="ecel-route">
              <p class="theatre-panel-copy">Selected contexts only — a compact route summary to show scale and circulation without claiming you operated every single date of the full international tour.</p>
              <div class="theatre-route"><div><time>2021</time><strong>Festival d'Avignon</strong><span>Avignon</span></div><div><time>2022</time><strong>Odéon</strong><span>Paris</span></div><div><time>2022</time><strong>Piccolo Teatro</strong><span>Milan</span></div><div><time>2022</time><strong>CDN</strong><span>Madrid</span></div><div><time>2023</time><strong>Edinburgh</strong><span>International Festival</span></div><div><time>2023</time><strong>SESC</strong><span>São Paulo</span></div></div>
              <p class="theatre-note"><strong>Route note:</strong> selected production contexts, not an exhaustive operated-date list.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="theatre-production" id="prod-emigrants">
        <div class="theatre-production-top">
          <div><span class="theatre-role">02 / CREATION-PHASE VIDEO SYSTEM / 2023</span><h4>Les Émigrants<br>Krystian Lupa</h4><div class="theatre-mini-facts"><span>cueing</span><span>datapath</span><span>multi-surface mapping</span><span>companion</span></div></div>
          <p class="theatre-production-copy">I participated in the Geneva creation phase. The working archive shows a dense video-control environment built around cameras, mapped surfaces, DataPath distribution, networked control and a large cue vocabulary coordinated with the stage process.</p>
        </div>
        <div class="theatre-panel" data-theatre-panel>
          <div class="theatre-panel-tabs">
            <button class="active" type="button" data-panel-target="lupa-role">role</button>
            <button type="button" data-panel-target="lupa-archive">archive</button>
            <button type="button" data-panel-target="lupa-credit">credit</button>
          </div>
          <div class="theatre-panel-body">
            <div class="theatre-panel-page active" id="lupa-role">
              <div class="theatre-panel-grid">
                <div>
                  <p class="theatre-panel-copy">Your contribution here is clearly framed as <strong>creation-phase technical video-system work</strong>: cueing, integration and operational structuring around a complex image-based scenic language. It stays distinct from the public artistic video-creation credit.</p>
                  <div class="theatre-data-grid"><div><strong>154</strong><span>cue states in archive</span></div><div><strong>2 acts</strong><span>long-form cue structure</span></div><div><strong>4 outputs</strong><span>left / center / right / front</span></div><div><strong>2 cameras</strong><span>live stage inputs</span></div></div>
                </div>
                <div class="theatre-media-single contain"><figure><img src="./assets/media/comedie/emigrants-cue-85.svg" alt="Les Émigrants mapped stage cue preview" loading="lazy"><figcaption>Mapped stage state / archive preview</figcaption></figure></div>
              </div>
            </div>
            <div class="theatre-panel-page" id="lupa-archive">
              <div class="theatre-panel-grid">
                <div>
                  <p class="theatre-panel-copy">The archive is visually rich enough to prove the work without drowning the reader. Two cue states are enough here to suggest the scale of the process: multi-surface composition, tulle logic, scenic images and the density of the cue-based environment.</p>
                </div>
                <div class="theatre-media-duo"><figure class="contain"><img src="./assets/media/comedie/emigrants-cue-30.svg" alt="Les Émigrants cue 030" loading="lazy"><figcaption>Cue 030 / multi-surface state</figcaption></figure><figure class="contain"><img src="./assets/media/comedie/emigrants-cue-64.svg" alt="Les Émigrants cue 064" loading="lazy"><figcaption>Cue 064 / scenic integration</figcaption></figure></div>
              </div>
            </div>
            <div class="theatre-panel-page" id="lupa-credit">
              <p class="theatre-panel-copy"><strong>Credit precision:</strong> public artistic credit for video creation is Natan Berkowicz, with Stanislaw Paweł Zieliński credited as video assistant. This portfolio block documents your own technical video-system / cueing / integration contribution during the Comédie de Genève creation phase.</p>
              <p class="theatre-note"><strong>Production context:</strong> the Geneva version was not publicly premiered in 2023; the work later premiered at the Odéon in Paris in January 2024.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="theatre-production" id="prod-transit">
        <div class="theatre-production-top">
          <div><span class="theatre-role">03 / TOURING INSTALLATION + SHOW OPERATION / 2022—23</span><h4>En transit<br>Amir Reza Koohestani</h4><div class="theatre-mini-facts"><span>full install</span><span>PTZ + fixed cameras</span><span>rear projection</span><span>surtitles</span></div></div>
          <p class="theatre-production-copy">I did not participate in the original creation. On selected touring dates I installed, calibrated, operated and struck the complete video system. The technical archive shows a stage-integrated multi-camera and projection setup, remote control between stage and FOH, and a dedicated three-screen surtitling chain.</p>
        </div>
        <div class="theatre-panel" data-theatre-panel>
          <div class="theatre-panel-tabs">
            <button class="active" type="button" data-panel-target="transit-role">role</button>
            <button type="button" data-panel-target="transit-flow">workflow</button>
            <button type="button" data-panel-target="transit-credit">credit</button>
          </div>
          <div class="theatre-panel-body">
            <div class="theatre-panel-page active" id="transit-role">
              <p class="theatre-panel-copy">This section stays straightforward: your job was <strong>touring technical exploitation</strong>, not authorship of the original video concept. That makes it strong, honest and clear.</p>
              <div class="theatre-data-grid"><div><strong>2 projectors</strong><span>rear projection system</span></div><div><strong>PTZ + fixed</strong><span>live camera capture</span></div><div><strong>3 screens</strong><span>surtitling display</span></div><div><strong>remote control</strong><span>stage ↔ FOH workflow</span></div></div>
            </div>
            <div class="theatre-panel-page" id="transit-flow">
              <div class="install-strip"><div class="install-step"><b>J−2</b><strong>Build</strong><span>complete video installation alongside stage / light / sound</span></div><div class="install-step"><b>J−1</b><strong>Calibrate</strong><span>projection, cameras and signal paths</span></div><div class="install-step"><b>J0</b><strong>Validate</strong><span>video / machinery adjustments and show protocol</span></div><div class="install-step"><b>SHOW</b><strong>Operate</strong><span>camera, projection and surtitling system</span></div></div>
            </div>
            <div class="theatre-panel-page" id="transit-credit">
              <p class="theatre-panel-copy"><strong>Public artistic credit:</strong> video — Phillip Hohenwarter. Your role on the toured dates was installation, calibration and show operation.</p>
              <p class="theatre-note"><strong>Touring precision:</strong> substantial number of dates, but not every date of the full tour.</p>
            </div>
          </div>
        </div>
      </section>`;
  }

  qa('[data-theatre-panel]').forEach(panel => {
    const buttons = qa('[data-panel-target]', panel);
    const pages = qa('.theatre-panel-page', panel);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      pages.forEach(page => page.classList.toggle('active', page.id === btn.dataset.panelTarget));
    }));
  });
})();
