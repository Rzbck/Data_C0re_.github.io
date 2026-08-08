(() => {
  const q = (s, root = document) => root.querySelector(s);

  const realtime = q('#realtime');
  if (!realtime || q('.fx-research-block', realtime)) return;

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.6 — condensed personal TouchDesigner FX research */
    .fx-research-block{border-top:1px solid var(--line);margin-top:clamp(42px,6vw,84px);padding-top:clamp(26px,3.5vw,46px)}
    .fx-research-head{display:grid;grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr);gap:clamp(28px,5vw,78px);align-items:end}
    .fx-research-head h3{margin:5px 0 0;font-size:clamp(40px,4.8vw,74px);line-height:.9;letter-spacing:-.055em}
    .fx-research-copy{margin:0;max-width:800px;color:#b9b7b2;font-size:clamp(14px,1.08vw,17px);line-height:1.5}
    .fx-research-facts{display:flex;flex-wrap:wrap;gap:7px;margin-top:17px}
    .fx-research-facts span{border:1px solid var(--line);border-radius:999px;padding:7px 10px;color:#aaa8a2;font-size:8.5px;line-height:1;text-transform:uppercase;letter-spacing:.08em}

    .fx-research-media{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.7fr);gap:10px;margin-top:clamp(26px,3.5vw,44px);align-items:stretch}
    .fx-film{position:relative;overflow:hidden;min-height:250px;background:#030303;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;flex-direction:column;justify-content:center}
    .fx-film-track{display:flex;width:max-content;will-change:transform;animation:fxFilm 24s linear infinite}
    .fx-film-track img{display:block;width:1400px;height:112px;max-width:none;flex:none}
    .fx-film:hover .fx-film-track{animation-play-state:paused}
    .fx-film::before,.fx-film::after{content:'';position:absolute;top:0;bottom:0;width:11%;z-index:2;pointer-events:none}
    .fx-film::before{left:0;background:linear-gradient(90deg,#070707,transparent)}
    .fx-film::after{right:0;background:linear-gradient(-90deg,#070707,transparent)}
    .fx-film figcaption,.fx-network figcaption{border-top:1px solid var(--line);margin-top:17px;padding:9px 0 0;color:#9f9d97;font-size:9px;line-height:1.35;text-transform:uppercase;letter-spacing:.075em}
    @keyframes fxFilm{from{transform:translate3d(0,0,0)}to{transform:translate3d(-1400px,0,0)}}

    .fx-process{display:grid;grid-template-rows:1fr auto;min-width:0;background:#030303;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px}
    .fx-network{margin:0;min-width:0;display:flex;flex-direction:column;justify-content:center}
    .fx-network img{display:block;width:100%;height:auto;max-height:300px;object-fit:contain;opacity:.9}
    .fx-process-line{margin-top:14px;color:#d7d5cf;font-size:11px;line-height:1.45}
    .fx-process-line b{color:var(--cyan);font-weight:700}

    .fx-family-strip{display:flex;flex-wrap:wrap;gap:8px 18px;border-bottom:1px solid var(--line);padding:14px 0;color:#8f8d88;font-size:8.5px;text-transform:uppercase;letter-spacing:.085em}
    .fx-family-strip b{color:var(--acid);font-weight:500}

    body.motion-off .fx-film-track{animation-play-state:paused!important}

    @media(max-width:1000px){
      .fx-research-head,.fx-research-media{grid-template-columns:1fr}
      .fx-process{min-height:310px}
    }
    @media(max-width:680px){
      .fx-research-block{margin-top:44px;padding-top:26px}
      .fx-research-head h3{font-size:38px}
      .fx-film{min-height:205px}
      .fx-process{min-height:260px;padding:10px}
      .fx-network img{max-height:220px}
      .fx-family-strip{gap:7px 13px;line-height:1.45}
    }
  `;
  document.head.appendChild(style);

  realtime.insertAdjacentHTML('beforeend', `
    <div class="fx-research-block reveal">
      <div class="fx-research-head">
        <div>
          <p class="eyebrow accent-cyan">C / Solo research / 2026</p>
          <h3>Realtime FX<br>Library</h3>
        </div>
        <div>
          <p class="fx-research-copy">A modular TouchDesigner research system built around 43 realtime image transformations. Rather than treating each module as an isolated effect, the library develops a reusable visual vocabulary around distortion, topology, temporal layering, signal degradation, memory and synthetic texture — material that can be recombined inside live, generative and audiovisual work.</p>
          <div class="fx-research-facts"><span>43 FX modules</span><span>TouchDesigner</span><span>realtime image processing</span><span>personal R&amp;D</span></div>
        </div>
      </div>

      <div class="fx-research-media">
        <figure class="fx-film" aria-label="Moving selection of TouchDesigner FX studies">
          <div class="fx-film-track" data-fx-film>
            <img src="./assets/media/research/fx-sprite.svg" alt="Selected TouchDesigner realtime FX states" loading="lazy">
            <img src="./assets/media/research/fx-sprite.svg" alt="" aria-hidden="true" loading="lazy">
          </div>
          <figcaption>Selected states / Contours Neon · Cymatic Synesthesia · Emergent Architecture · Ephemeral Topography · Identity Palimpsest · Negative Singularity · Thermodynamic Aura</figcaption>
        </figure>

        <div class="fx-process">
          <figure class="fx-network">
            <img src="./assets/media/research/fx-network.svg" alt="Modular TouchDesigner network containing the personal realtime FX library" loading="lazy">
            <figcaption>Modular TouchDesigner network / reusable processing blocks</figcaption>
          </figure>
          <p class="fx-process-line"><b>Intent</b> — build effects as a flexible visual language that can be layered, routed and re-used, rather than a fixed collection of finished looks.</p>
        </div>
      </div>

      <div class="fx-family-strip"><b>selected families</b><span>cymatics</span><span>topography</span><span>palimpsest</span><span>singularity</span><span>semiotics</span><span>temporal strata</span><span>thermodynamic texture</span></div>
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
  if (idxMeta) idxMeta.textContent = 'Realtime image / audio / FX research';
})();
