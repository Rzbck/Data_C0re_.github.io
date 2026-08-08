(() => {
  const q = (s, root = document) => root.querySelector(s);
  const realtime = q('#realtime');
  if (!realtime) return;

  q('.fx-research-block', realtime)?.remove();

  const eyebrow = q('.project-head .eyebrow', realtime);
  const summary = q('.project-summary', realtime);
  const facts = q('.project-facts', realtime);
  if (eyebrow) eyebrow.textContent = 'Research series / 2025—2026';
  if (summary) summary.textContent = 'Personal realtime research spanning sound-reactive material, cellular systems and modular image-processing experiments. Each thread explores a distinct visual behaviour and a reusable way of transforming live imagery.';
  if (facts) facts.innerHTML = '<span><b>Format</b> three research threads</span><span><b>Method</b> audio / motion / temporal image systems</span><span><b>Tools</b> TouchDesigner / GLSL</span>';

  const style = document.createElement('style');
  style.textContent = `
    #realtime{min-height:auto!important;padding-bottom:clamp(72px,8vw,116px)!important}
    #realtime .fx-research-block{border-top:1px solid var(--line);margin-top:clamp(32px,4vw,50px);padding-top:clamp(24px,3vw,34px);opacity:1!important;transform:none!important;visibility:visible!important}
    #realtime .fx-research-head{display:grid;grid-template-columns:minmax(245px,.55fr) minmax(0,1.45fr);gap:clamp(28px,5vw,70px);align-items:end}
    #realtime .fx-research-head h3{margin:4px 0 0;font-size:clamp(38px,4.2vw,66px);line-height:.9;letter-spacing:-.055em}
    #realtime .fx-research-copy{margin:0;max-width:880px;color:#bbb9b3;font-size:clamp(14px,1.02vw,16.5px);line-height:1.48}
    #realtime .fx-research-facts{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
    #realtime .fx-research-facts span{border:1px solid var(--line);border-radius:999px;padding:7px 10px;color:#aaa8a2;font-size:8.5px;line-height:1;text-transform:uppercase;letter-spacing:.08em}

    #realtime .fx-research-media{display:grid;grid-template-columns:minmax(0,1.36fr) minmax(290px,.64fr);gap:10px;margin-top:clamp(22px,3vw,32px);align-items:stretch}
    #realtime .fx-showreel,#realtime .fx-network-card{min-width:0;margin:0;background:#030303;border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden}
    #realtime .fx-showreel{display:grid;grid-template-rows:auto auto}
    #realtime .fx-sprite-player{width:100%;aspect-ratio:16/9;background-color:#050505;background-image:url('./assets/media/research/fx-sprite.svg?v=104');background-repeat:no-repeat;background-size:700% 100%;background-position:0% 0;animation:fxSpriteFrames 28s linear infinite;will-change:background-position}
    #realtime .fx-sprite-player.is-paused{animation-play-state:paused!important}
    @keyframes fxSpriteFrames{
      0%,14.27%{background-position:0% 0}
      14.28%,28.55%{background-position:16.6667% 0}
      28.56%,42.83%{background-position:33.3333% 0}
      42.84%,57.11%{background-position:50% 0}
      57.12%,71.39%{background-position:66.6667% 0}
      71.40%,85.67%{background-position:83.3333% 0}
      85.68%,99.99%{background-position:100% 0}
      100%{background-position:0% 0}
    }
    #realtime .fx-network-card{display:grid;grid-template-rows:minmax(0,1fr) auto;padding:12px}
    #realtime .fx-network-card img{display:block;width:100%;height:100%;max-height:320px;object-fit:contain;background:#070707}
    #realtime .fx-showreel figcaption,#realtime .fx-network-card figcaption{margin:0;border-top:1px solid var(--line);padding:9px 0;color:#9d9b95;font-size:8.5px;line-height:1.35;text-transform:uppercase;letter-spacing:.075em}

    #realtime .fx-concepts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:12px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    #realtime .fx-concepts div{min-width:0;padding:12px;border-right:1px solid var(--line)}
    #realtime .fx-concepts div:last-child{border-right:0}
    #realtime .fx-concepts b{display:block;color:var(--acid);font-size:9px;line-height:1.2;text-transform:uppercase;letter-spacing:.08em}
    #realtime .fx-concepts span{display:block;margin-top:6px;color:#95938e;font-size:9px;line-height:1.35}

    @media(prefers-reduced-motion:reduce){#realtime .fx-sprite-player{animation:none!important;background-position:0 0!important}}
    @media(max-width:1000px){#realtime .fx-research-head,#realtime .fx-research-media{grid-template-columns:1fr}#realtime .fx-network-card img{max-height:300px}#realtime .fx-concepts{grid-template-columns:1fr 1fr}#realtime .fx-concepts div:nth-child(2){border-right:0}#realtime .fx-concepts div:nth-child(n+3){border-top:1px solid var(--line)}}
    @media(max-width:680px){#realtime{padding-bottom:70px!important}#realtime .fx-research-head h3{font-size:36px}#realtime .fx-network-card{padding:8px}#realtime .fx-network-card img{max-height:230px}#realtime .fx-concepts{grid-template-columns:1fr}#realtime .fx-concepts div{border-right:0!important;border-top:1px solid var(--line)}#realtime .fx-concepts div:first-child{border-top:0}}
  `;
  document.head.appendChild(style);

  realtime.insertAdjacentHTML('beforeend', `
    <div class="fx-research-block">
      <div class="fx-research-head">
        <div><p class="eyebrow accent-cyan">C / Solo research / 2026</p><h3>Realtime FX<br>Library</h3></div>
        <div>
          <p class="fx-research-copy">A modular TouchDesigner research system built from 43 realtime transformations. The focus is the artistic logic behind them: feedback and stored history, movement as a cause, image analysis becoming terrain or structure, and controlled signal failure as visual material.</p>
          <div class="fx-research-facts"><span>43 FX studies</span><span>modular system</span><span>TouchDesigner + GLSL</span><span>personal R&amp;D</span></div>
        </div>
      </div>

      <div class="fx-research-media">
        <figure class="fx-showreel">
          <div class="fx-sprite-player" role="img" aria-label="Animated selection of seven realtime TouchDesigner FX studies"></div>
          <figcaption>Selected realtime states / seven studies</figcaption>
        </figure>
        <figure class="fx-network-card">
          <img src="./assets/media/research/fx-network.svg?v=104" alt="TouchDesigner network used to build the modular realtime FX library" loading="lazy" decoding="async">
          <figcaption>TouchDesigner network / reusable processing architecture</figcaption>
        </figure>
      </div>

      <div class="fx-concepts">
        <div><b>Time as material</b><span>feedback, persistence, decay and stored history</span></div>
        <div><b>Movement as cause</b><span>motion drives erosion, growth and instability</span></div>
        <div><b>Image → matter</b><span>edges and gradients become terrain, symbols and structure</span></div>
        <div><b>Controlled failure</b><span>datamosh, displacement and signal damage</span></div>
      </div>
    </div>`);

  const player = q('.fx-sprite-player', realtime);
  const motionToggle = q('[data-motion-toggle]');
  const syncMotion = () => player?.classList.toggle('is-paused', motionToggle?.getAttribute('aria-pressed') === 'true');
  motionToggle?.addEventListener('click', () => requestAnimationFrame(syncMotion));
  syncMotion();

  const idxMeta = q('.index-rows a[href="#realtime"] em');
  if (idxMeta) idxMeta.textContent = 'Audio / cellular / realtime FX research';
})();