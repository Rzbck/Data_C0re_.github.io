(() => {
  const q = (s, root = document) => root.querySelector(s);

  const realtime = q('#realtime');
  if (!realtime) return;

  q('.fx-research-block', realtime)?.remove();

  const eyebrow = q('.project-head .eyebrow', realtime);
  const summary = q('.project-summary', realtime);
  const facts = q('.project-facts', realtime);
  if (eyebrow) eyebrow.textContent = 'Research series / 2025—2026';
  if (summary) summary.textContent = 'A compact body of personal realtime research spanning sound-reactive material, cellular systems and a modular library of image-processing experiments. Each study explores a distinct visual behaviour rather than functioning as a decorative effect.';
  if (facts) facts.innerHTML = '<span><b>Format</b> three research threads</span><span><b>Method</b> audio / motion / temporal image systems</span><span><b>Tools</b> TouchDesigner / GLSL</span>';

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.6 — compact source-grounded realtime FX research */
    #realtime{min-height:auto!important;padding-bottom:clamp(70px,8vw,120px)!important}
    .fx-research-block{border-top:1px solid var(--line);margin-top:clamp(30px,4vw,52px);padding-top:clamp(24px,3vw,36px);opacity:1!important;transform:none!important;visibility:visible!important}
    .fx-research-head{display:grid;grid-template-columns:minmax(260px,.58fr) minmax(0,1.42fr);gap:clamp(28px,5vw,72px);align-items:end}
    .fx-research-head h3{margin:5px 0 0;font-size:clamp(38px,4.3vw,68px);line-height:.9;letter-spacing:-.055em}
    .fx-research-copy{margin:0;max-width:900px;color:#bbb9b3;font-size:clamp(14px,1.04vw,17px);line-height:1.5}
    .fx-research-facts{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}
    .fx-research-facts span{border:1px solid var(--line);border-radius:999px;padding:7px 10px;color:#aaa8a2;font-size:8.5px;line-height:1;text-transform:uppercase;letter-spacing:.08em}

    .fx-research-media{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);gap:10px;margin-top:clamp(22px,3vw,34px);height:clamp(230px,22vw,330px)}
    .fx-film,.fx-process{min-width:0;height:100%;overflow:hidden;background:#030303;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .fx-film{position:relative;display:grid;grid-template-rows:1fr auto}
    .fx-film-window{position:relative;overflow:hidden;min-height:0;display:flex;align-items:center}
    .fx-film-track{display:flex;width:max-content;height:100%;will-change:transform;animation:fxFilmCompact 28s linear infinite}
    .fx-film-track img{display:block;height:100%;width:auto;max-width:none;flex:none;object-fit:cover}
    .fx-film:hover .fx-film-track{animation-play-state:paused}
    .fx-film-window::before,.fx-film-window::after{content:'';position:absolute;top:0;bottom:0;width:8%;z-index:2;pointer-events:none}
    .fx-film-window::before{left:0;background:linear-gradient(90deg,#070707,transparent)}
    .fx-film-window::after{right:0;background:linear-gradient(-90deg,#070707,transparent)}
    @keyframes fxFilmCompact{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
    .fx-film figcaption,.fx-network figcaption{margin:0;border-top:1px solid var(--line);padding:9px 0;color:#9d9b95;font-size:8.5px;line-height:1.35;text-transform:uppercase;letter-spacing:.075em}

    .fx-process{display:grid;grid-template-rows:minmax(0,1fr) auto;padding:12px}
    .fx-network{min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto}
    .fx-network img{display:block;width:100%;height:100%;min-height:0;object-fit:contain;background:#070707}
    .fx-process-line{margin:10px 0 0;color:#c3c1bb;font-size:10.5px;line-height:1.4}
    .fx-process-line b{color:var(--cyan);font-weight:700}

    .fx-concepts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .fx-concepts div{min-width:0;padding:12px;border-right:1px solid var(--line)}
    .fx-concepts div:last-child{border-right:0}
    .fx-concepts b{display:block;color:var(--acid);font-size:9px;line-height:1.2;text-transform:uppercase;letter-spacing:.08em}
    .fx-concepts span{display:block;margin-top:6px;color:#95938e;font-size:9px;line-height:1.35}

    body.motion-off .fx-film-track{animation-play-state:paused!important}
    @media(max-width:1000px){
      .fx-research-head{grid-template-columns:1fr}
      .fx-research-media{grid-template-columns:1fr;height:auto}
      .fx-film{height:260px}.fx-process{height:280px}
      .fx-concepts{grid-template-columns:1fr 1fr}.fx-concepts div:nth-child(2){border-right:0}.fx-concepts div:nth-child(n+3){border-top:1px solid var(--line)}
    }
    @media(max-width:680px){
      #realtime{padding-bottom:70px!important}
      .fx-research-block{margin-top:30px;padding-top:24px}.fx-research-head h3{font-size:36px}
      .fx-film{height:210px}.fx-process{height:240px}
      .fx-concepts{grid-template-columns:1fr}.fx-concepts div{border-right:0!important;border-top:1px solid var(--line)}.fx-concepts div:first-child{border-top:0}
    }
  `;
  document.head.appendChild(style);

  realtime.insertAdjacentHTML('beforeend', `
    <div class="fx-research-block">
      <div class="fx-research-head">
        <div>
          <p class="eyebrow accent-cyan">C / Solo research / 2026</p>
          <h3>Realtime FX<br>Library</h3>
        </div>
        <div>
          <p class="fx-research-copy">A modular TouchDesigner research system built from 43 realtime transformations. Across the library, time becomes material through feedback and stored history; movement becomes a cause that erodes, grows or destabilizes an image; and luminance, edges and gradients are reinterpreted as topography, architecture, symbolic language or synthetic matter. The aim is a reusable visual vocabulary, not a catalogue of filters.</p>
          <div class="fx-research-facts"><span>43 FX studies</span><span>modular system</span><span>TouchDesigner + GLSL</span><span>personal R&amp;D</span></div>
        </div>
      </div>

      <div class="fx-research-media">
        <figure class="fx-film" aria-label="Moving selection of TouchDesigner FX studies">
          <div class="fx-film-window">
            <div class="fx-film-track" data-fx-film>
              <img src="./assets/media/research/fx-sprite.svg" alt="Selected TouchDesigner realtime FX states" loading="lazy">
              <img src="./assets/media/research/fx-sprite.svg" alt="" aria-hidden="true" loading="lazy">
            </div>
          </div>
          <figcaption>Selected states / Cymatics · Topography · Palimpsest · Singularity · Temporal memory · Synthetic texture</figcaption>
        </figure>

        <div class="fx-process">
          <figure class="fx-network">
            <img src="./assets/media/research/fx-network.svg" alt="Modular TouchDesigner network containing the realtime FX research library" loading="lazy">
            <figcaption>TouchDesigner network / reusable processing architecture</figcaption>
          </figure>
          <p class="fx-process-line"><b>Approach</b> — effects are built as systems that can be routed, layered and re-used inside future live and generative work.</p>
        </div>
      </div>

      <div class="fx-concepts" aria-label="Core research ideas">
        <div><b>Time as material</b><span>feedback, persistence, decay and temporal slices</span></div>
        <div><b>Movement as cause</b><span>motion drives erosion, growth, threat, heat or memory</span></div>
        <div><b>Image → matter</b><span>analysis becomes terrain, architecture, organisms and glyphs</span></div>
        <div><b>Controlled failure</b><span>datamosh, displacement and signal damage expose the digital image</span></div>
      </div>
    </div>`);

  const motionToggle = q('[data-motion-toggle]');
  const syncMotionClass = () => document.body.classList.toggle('motion-off', motionToggle?.getAttribute('aria-pressed') === 'true');
  motionToggle?.addEventListener('click', () => requestAnimationFrame(syncMotionClass));
  syncMotionClass();

  const film = q('[data-fx-film]', realtime);
  if (film && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => film.style.animationPlayState = entry.isIntersecting && !document.body.classList.contains('motion-off') ? 'running' : 'paused');
    }, {rootMargin:'120px 0px', threshold:.05}).observe(film);
  }

  const idxMeta = q('.index-rows a[href="#realtime"] em');
  if (idxMeta) idxMeta.textContent = 'Audio / cellular / realtime FX research';
})();