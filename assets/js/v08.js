(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  // Technical viewer: stable labels + two new drawings from the supplied Geneva Lux plans.
  const tabs = q('#lumina .technical-tabs');
  const techImage = q('[data-tech-image]');
  const techCaption = q('[data-tech-caption]');
  if (tabs) tabs.innerHTML = `
    <button type="button" class="active" data-tech-src="./assets/media/lumina/technical-general.svg" data-tech-caption="01 / GENERAL STRUCTURE" data-tech-alt="LUMINA general structure drawing">general</button>
    <button type="button" data-tech-src="./assets/media/lumina/technical-dimensions-v2.svg" data-tech-caption="02 / DIMENSIONS / 12.05 M × 2.385 M × 2.553 M" data-tech-alt="LUMINA dimension drawing">dimensions</button>
    <button type="button" data-tech-src="./assets/media/lumina/technical-profiles.svg" data-tech-caption="03 / PROFILES + RAINURAGE" data-tech-alt="LUMINA aluminium profile and groove planning drawing">profiles</button>
    <button type="button" data-tech-src="./assets/media/lumina/technical-flycase.svg" data-tech-caption="04 / CUSTOM FLYCASE" data-tech-alt="LUMINA custom flycase drawing">flycase</button>`;
  if (techImage) { techImage.src = './assets/media/lumina/technical-general.svg'; techImage.alt = 'LUMINA general structure drawing'; }
  if (techCaption) techCaption.textContent = '01 / GENERAL STRUCTURE';
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

  /* V0.8 — theatre / touring systems editorial pass */
  const styleV08 = document.createElement('style');
  styleV08.textContent = `
    .technical-tabs{grid-template-columns:repeat(4,1fr)!important}
    #comedie-case,#stage-case{grid-column:1/-1}
    .theatre-case{padding-top:clamp(28px,4vw,54px)!important}
    .theatre-case-head{display:grid;grid-template-columns:.42fr 1.58fr;gap:clamp(28px,5vw,90px);align-items:end;margin-bottom:clamp(30px,4vw,56px)}
    .theatre-case-head h3{margin:0;font-size:clamp(42px,5.2vw,82px)!important;line-height:.91!important;letter-spacing:-.055em}
    .theatre-case-intro{margin:0;max-width:720px;color:#c8c6c0;font-size:clamp(15px,1.25vw,19px);line-height:1.45}
    .theatre-project{border-top:1px solid var(--line);padding:clamp(28px,4vw,52px) 0}
    .theatre-project:last-child{padding-bottom:0}
    .theatre-project-head{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:clamp(30px,5vw,80px);align-items:end;margin-bottom:26px}
    .theatre-project h4{margin:0;font-size:clamp(34px,4.1vw,66px);line-height:.94;letter-spacing:-.05em}
    .theatre-project-copy{margin:0;color:#bbb9b3;font-size:clamp(14px,1.12vw,17px);line-height:1.5;max-width:700px}
    .theatre-kicker{display:block;margin-bottom:11px;color:var(--acid);font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
    .theatre-facts{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:22px 0 10px}
    .theatre-facts div{padding:12px 12px 12px 0;border-right:1px solid var(--line)}.theatre-facts div:not(:first-child){padding-left:12px}.theatre-facts div:last-child{border-right:0}
    .theatre-facts strong{display:block;font-size:clamp(18px,2vw,30px);line-height:1;letter-spacing:-.04em}.theatre-facts span{display:block;margin-top:6px;color:var(--grey);font-size:8.5px;text-transform:uppercase;letter-spacing:.095em;line-height:1.3}
    .ecel-visual-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.ecel-visual-grid figure{background:#030303;min-width:0}.ecel-visual-grid img{height:auto;aspect-ratio:16/10;object-fit:cover}.ecel-visual-grid .ecel-plan img{object-fit:contain;background:#070707}
    .ecel-system{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin:26px 0 0}.ecel-node{border:1px solid var(--line);padding:15px;min-height:88px;background:#090909}.ecel-node strong{display:block;font-size:14px}.ecel-node span{display:block;color:var(--grey);font-size:10px;margin-top:6px;line-height:1.35}.ecel-system>b{color:var(--acid)}
    .tour-head{display:flex;justify-content:space-between;gap:20px;margin-top:26px;padding-top:14px;border-top:1px solid var(--line);color:var(--grey);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.tour-head b{color:var(--paper)}
    .tour-strip{display:grid;grid-template-columns:repeat(6,1fr);border-bottom:1px solid var(--line)}.tour-stop{padding:12px 12px 13px 0;border-right:1px solid var(--line);min-width:0}.tour-stop:not(:first-child){padding-left:12px}.tour-stop:last-child{border-right:0}.tour-stop time{display:block;color:var(--acid);font-size:9px;letter-spacing:.07em}.tour-stop strong{display:block;margin-top:4px;font-size:12px;line-height:1.15}.tour-stop span{display:block;margin-top:4px;color:var(--grey);font-size:9px;line-height:1.2}
    .lupa-cue-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.lupa-cue-grid figure{background:#020202;min-width:0}.lupa-cue-grid img{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#000}.lupa-cue-grid figcaption{border-top:1px solid var(--line);padding-top:8px}
    .lupa-system{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin-top:24px}.lupa-system .ecel-node{min-height:82px}.lupa-system>b{color:var(--cyan)}
    .production-note{margin:18px 0 0;padding-left:12px;border-left:2px solid var(--magenta);color:#aaa8a2;font-size:11px;line-height:1.45;max-width:820px}
    @media(max-width:1100px){.theatre-case-head,.theatre-project-head{grid-template-columns:1fr}.theatre-facts{grid-template-columns:repeat(3,1fr)}.theatre-facts div:nth-child(3){border-right:0}.theatre-facts div:nth-child(n+4){border-top:1px solid var(--line)}.tour-strip{grid-template-columns:repeat(3,1fr)}.tour-stop:nth-child(3){border-right:0}.tour-stop:nth-child(n+4){border-top:1px solid var(--line)}.ecel-system{grid-template-columns:1fr auto 1fr}.ecel-system>b:nth-of-type(2){display:none}.ecel-system .ecel-node:nth-of-type(3){grid-column:1}.ecel-system>b:nth-of-type(3){grid-column:2}.ecel-system .ecel-node:nth-of-type(4){grid-column:3}}
    @media(max-width:680px){.technical-tabs{grid-template-columns:1fr 1fr!important}.theatre-case-head h3{font-size:42px!important}.theatre-project-head{gap:16px}.theatre-project h4{font-size:36px}.theatre-facts{grid-template-columns:1fr 1fr}.theatre-facts div{border-top:1px solid var(--line);border-right:1px solid var(--line)!important;padding:10px!important}.theatre-facts div:nth-child(even){border-right:0!important}.ecel-visual-grid,.lupa-cue-grid{grid-template-columns:1fr}.ecel-system,.lupa-system{grid-template-columns:1fr}.ecel-system>b,.lupa-system>b{transform:rotate(90deg);justify-self:center}.ecel-system>b:nth-of-type(2){display:block}.ecel-system .ecel-node:nth-of-type(3),.ecel-system>b:nth-of-type(3),.ecel-system .ecel-node:nth-of-type(4){grid-column:auto}.tour-strip{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.tour-stop{min-width:72vw;scroll-snap-align:start;border-right:1px solid var(--line)!important;border-top:0!important;padding:12px!important}.tour-head{align-items:flex-end}.lupa-system .ecel-node{min-height:74px}}
  `;
  document.head.appendChild(styleV08);

  const menuComedie = q('.menu-list a[href="#comedie-case"]');
  if (menuComedie) menuComedie.innerHTML = '<span>10</span> Comédie de Genève / Video Systems <small>2021—23</small>';
  const indexComedie = q('.index-rows a[href="#comedie-case"] strong');
  if (indexComedie) indexComedie.textContent = 'Comédie de Genève / Jatahy + Lupa';
  const indexComedieMeta = q('.index-rows a[href="#comedie-case"] em');
  if (indexComedieMeta) indexComedieMeta.textContent = 'Touring + creation systems';

  const comedieCase = q('#comedie-case');
  if (comedieCase) {
    comedieCase.className = 'system-case theatre-case reveal visible';
    comedieCase.innerHTML = `
      <div class="theatre-case-head">
        <div><span class="case-year">2021—23</span><h3>Comédie de Genève / Video Systems</h3></div>
        <p class="theatre-case-intro">Two very different production contexts: a touring live-cinema system built to survive constant venue changes, and a dense multi-surface creation workflow where image, mapping, cues, cameras and control protocols became part of the stage architecture.</p>
      </div>

      <section class="theatre-project theatre-project--ecel">
        <div class="theatre-project-head">
          <div><span class="theatre-kicker">01 / TOURING SYSTEM / 2021—23</span><h4>Entre chien et loup<br>Christiane Jatahy</h4></div>
          <p class="theatre-project-copy">The production mixes theatre and cinema in real time: performers film and are filmed, while live editing becomes part of the dramaturgy. <strong>My role: Régisseur vidéo &amp; interactive designer</strong> — adapting the system to each venue, coordinating local crews, multilingual surtitling, testing / troubleshooting and writing handover documentation for autonomous operation.</p>
        </div>
        <div class="theatre-facts">
          <div><strong>8 × 4.32 m</strong><span>projection screen</span></div>
          <div><strong>2 × 4K</strong><span>Blackmagic cameras</span></div>
          <div><strong>PT-RZ970</strong><span>Panasonic projection</span></div>
          <div><strong>23</strong><span>documented tour entries / 2021—23</span></div>
          <div><strong>1h50</strong><span>live cinema / theatre</span></div>
        </div>
        <div class="ecel-visual-grid">
          <figure><img src="./assets/media/comedie/venue.jpg" alt="Comédie de Genève stage during Entre chien et loup production work." loading="lazy"><figcaption>Creation / venue context</figcaption></figure>
          <figure class="ecel-plan"><img src="./assets/media/comedie/ecel-stage-plan.svg" alt="Entre chien et loup touring video stage plan." loading="lazy"><figcaption>8 m projection screen / touring architecture</figcaption></figure>
        </div>
        <div class="ecel-system" aria-label="Entre chien et loup touring video architecture">
          <div class="ecel-node"><strong>2 × BLACKMAGIC 4K</strong><span>live camera capture / wireless + safety SDI path</span></div><b>→</b>
          <div class="ecel-node"><strong>ATEM TV STUDIO HD</strong><span>live routing / multiview / program output</span></div><b>→</b>
          <div class="ecel-node"><strong>MILLUMIN + COMPANION</strong><span>media / cues / Stream Deck / show operation</span></div><b>→</b>
          <div class="ecel-node"><strong>PROJECTION + GLYPHEO</strong><span>Panasonic output / multilingual surtitles / LED subtitle option</span></div>
        </div>
        <div class="tour-head"><b>Selected tour milestones</b><span>23 documented calendar entries / highlights only</span></div>
        <div class="tour-strip" aria-label="Selected Entre chien et loup tour dates">
          <div class="tour-stop"><time>05—12 JUL 2021</time><strong>Festival d'Avignon</strong><span>Avignon / FR</span></div>
          <div class="tour-stop"><time>05 MAR—01 APR 2022</time><strong>Odéon</strong><span>Paris / FR</span></div>
          <div class="tour-stop"><time>18—20 MAY 2022</time><strong>Piccolo Teatro</strong><span>Milan / IT</span></div>
          <div class="tour-stop"><time>25—27 NOV 2022</time><strong>CDN</strong><span>Madrid / ES</span></div>
          <div class="tour-stop"><time>05—08 AUG 2023</time><strong>Edinburgh Int. Festival</strong><span>Edinburgh / UK</span></div>
          <div class="tour-stop"><time>22 SEP—15 OCT 2023</time><strong>SESC Consolação</strong><span>São Paulo / BR</span></div>
        </div>
      </section>

      <section class="theatre-project theatre-project--lupa">
        <div class="theatre-project-head">
          <div><span class="theatre-kicker">02 / CREATION PROCESS / 2023</span><h4>Les Émigrants<br>Krystian Lupa</h4></div>
          <p class="theatre-project-copy">The working archive documents a large video-cue and mapping system developed during the Geneva creation process: multiple mapped surfaces, camera inputs, OSC-linked cues, shutters, DataPath distribution and FOH control. The archive contains <strong>154 rendered cue previews</strong> spanning two acts and five logical video surfaces.</p>
        </div>
        <div class="theatre-facts">
          <div><strong>154</strong><span>cue-preview states in archive</span></div>
          <div><strong>5</strong><span>logical surfaces / left center right front tulle</span></div>
          <div><strong>4</strong><span>projector endpoints</span></div>
          <div><strong>2</strong><span>camera inputs</span></div>
          <div><strong>2 acts</strong><span>video / light / sound cueing</span></div>
        </div>
        <div class="lupa-cue-grid">
          <figure><img src="./assets/media/comedie/emigrants-cue-30.svg" alt="Les Émigrants cue 030 multi-surface system schematic." loading="lazy"><figcaption>Cue 030 / multi-surface state</figcaption></figure>
          <figure><img src="./assets/media/comedie/emigrants-cue-64.svg" alt="Les Émigrants cue 064 multi-surface system schematic." loading="lazy"><figcaption>Cue 064 / mapped room state</figcaption></figure>
          <figure><img src="./assets/media/comedie/emigrants-cue-85.svg" alt="Les Émigrants cue 085 multi-surface system schematic." loading="lazy"><figcaption>Cue 085 / mapped archive state</figcaption></figure>
        </div>
        <div class="lupa-system" aria-label="Les Émigrants video system architecture">
          <div class="ecel-node"><strong>CAMERAS + STAGE PC</strong><span>live inputs / mapped media / cue states</span></div><b>→</b>
          <div class="ecel-node"><strong>DATAPATH + NETWORK</strong><span>distributed video outputs / stage routing</span></div><b>→</b>
          <div class="ecel-node"><strong>LEFT / CENTER / RIGHT / FRONT</strong><span>projection endpoints + tulle as a logical media surface</span></div>
        </div>
        <p class="production-note">Context — the planned Geneva run was cancelled before its public premiere in 2023. The work was subsequently created at the Odéon–Théâtre de l’Europe in Paris, 13 January—4 February 2024. Public creation-video credit: Natan Berkowicz. This portfolio block documents the technical video-system / cueing archive from the Geneva creation process without claiming that public creation credit.</p>
      </section>`;
  }
})();
