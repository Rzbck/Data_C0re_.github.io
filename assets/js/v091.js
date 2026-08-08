(() => {
  const q = (s, root = document) => root.querySelector(s);

  // V0.9.1 — theatre verification pass: distinct roles, fewer technical details, explicit public credits.
  const menuComedie = q('.menu-list a[href="#comedie-case"]');
  if (menuComedie) menuComedie.innerHTML = '<span>10</span> Theatre / Video Systems <small>2021—23</small>';
  const indexComedie = q('.index-rows a[href="#comedie-case"] strong');
  if (indexComedie) indexComedie.textContent = 'Theatre / Video Systems';
  const indexComedieMeta = q('.index-rows a[href="#comedie-case"] em');
  if (indexComedieMeta) indexComedieMeta.textContent = 'Creation / integration / touring';

  const comedieCase = q('#comedie-case');
  if (!comedieCase) return;

  comedieCase.className = 'system-case theatre-case-v09 reveal visible';
  comedieCase.innerHTML = `
    <div class="theatre-v09-head">
      <div><span class="case-year">2021—23</span><h3>Theatre / Video Systems</h3></div>
      <p>Three productions, three clearly different roles: <strong>creation + touring</strong> for <em>Entre chien et loup</em>, <strong>creation-process video-system integration</strong> for <em>Les Émigrants</em>, and <strong>touring installation + operation</strong> for <em>En transit</em>. Extra detail opens only when useful.</p>
    </div>

    <section class="theatre-production">
      <div class="theatre-production-top">
        <div><span class="theatre-role">01 / CREATION + TOURING / 2021—23</span><h4>Entre chien et loup<br>Christiane Jatahy</h4><div class="theatre-mini-facts"><span>live cinema</span><span>video system</span><span>venue adaptation</span><span>surtitles</span></div></div>
        <p class="theatre-production-copy">I participated in the creation and then toured the production. My responsibility was the video system as a live stage tool: preparation, venue adaptation, operation / troubleshooting, local-team coordination, surtitles and reliable handover.</p>
      </div>
      <details class="project-drawer">
        <summary>Role / stage-video logic / selected tour contexts</summary>
        <div class="drawer-inner">
          <p class="drawer-note"><strong>Public credit:</strong> video system — Julio Parente &amp; Charlélie Chauvel. The touring dossier documents a compact live-cinema chain built around two cameras, live switching / media playback, an 8 × 4.32 m projection surface and multilingual surtitles.</p>
          <div class="theatre-facts-v09"><div><strong>2 cameras</strong><span>live cinema capture</span></div><div><strong>8 × 4.32 m</strong><span>main projection surface</span></div><div><strong>live switch</strong><span>camera / media routing</span></div><div><strong>surtitles</strong><span>multilingual touring</span></div><div><strong>multi-venue</strong><span>adaptation + handover</span></div></div>
          <div class="theatre-media-v09"><figure><img src="./assets/media/comedie/venue.jpg" alt="Comédie de Genève stage during Entre chien et loup creation work" loading="lazy"><figcaption>Creation / venue context</figcaption></figure><figure><img src="./assets/media/comedie/ecel-stage-plan.svg" alt="Entre chien et loup projection and stage plan" loading="lazy"><figcaption>Projection / venue-adaptation plan</figcaption></figure></div>
          <div class="production-route" aria-label="Selected production contexts for Entre chien et loup"><div><time>2021</time><strong>Festival d'Avignon</strong><span>Avignon</span></div><div><time>2022</time><strong>Odéon</strong><span>Paris</span></div><div><time>2022</time><strong>Piccolo Teatro</strong><span>Milan</span></div><div><time>2022</time><strong>CDN</strong><span>Madrid</span></div><div><time>2023</time><strong>Edinburgh</strong><span>International Festival</span></div><div><time>2023</time><strong>SESC</strong><span>São Paulo</span></div></div>
          <p class="role-precision"><strong>Route note:</strong> these are selected production contexts, not a claim that I personally operated every performance on the complete international tour.</p>
        </div>
      </details>
    </section>

    <section class="theatre-production">
      <div class="theatre-production-top">
        <div><span class="theatre-role">02 / CREATION PROCESS / VIDEO-SYSTEM INTEGRATION / 2023</span><h4>Les Émigrants<br>Krystian Lupa</h4><div class="theatre-mini-facts"><span>cueing</span><span>multi-surface video</span><span>camera inputs</span><span>system integration</span></div></div>
        <p class="theatre-production-copy">I participated in the creation process at the Comédie de Genève, working on the technical video system, cueing and integration around a highly image-driven stage language. This is distinct from the artistic video-creation credit.</p>
      </div>
      <details class="project-drawer">
        <summary>Creation archive / cueing / system overview</summary>
        <div class="drawer-inner">
          <p class="drawer-note"><strong>Credit precision:</strong> public artistic credit for video creation is Natan Berkowicz, with Stanislaw Paweł Zieliński credited as video assistant. My portfolio documents my video-system / cueing / integration contribution during the creation process. The production premiered at the Odéon in January 2024.</p>
          <div class="theatre-facts-v09"><div><strong>154</strong><span>cue-preview states in archive</span></div><div><strong>2 cameras</strong><span>live stage inputs</span></div><div><strong>4 outputs</strong><span>left / center / right / front</span></div><div><strong>2 acts</strong><span>long-form cue structure</span></div><div><strong>mapping</strong><span>projection + tulle states</span></div></div>
          <div class="theatre-media-v09"><figure><img src="./assets/media/comedie/emigrants-cue-30.svg" alt="Les Émigrants cue 30 multi-surface preview" loading="lazy"><figcaption>Cue 030 / multi-surface state</figcaption></figure><figure><img src="./assets/media/comedie/emigrants-cue-85.svg" alt="Les Émigrants cue 85 mapped architecture preview" loading="lazy"><figcaption>Cue 085 / mapped stage state</figcaption></figure></div>
          <p class="role-precision"><strong>System summary:</strong> two live camera inputs feed a networked video-control environment distributing mapped content to four projection outputs; the cue archive also tracks tulle / shutter states as part of the scenic composition.</p>
        </div>
      </details>
    </section>

    <section class="theatre-production">
      <div class="theatre-production-top">
        <div><span class="theatre-role">03 / SELECTED TOUR DATES / INSTALLATION + OPERATION / 2022—23</span><h4>En transit<br>Amir Reza Koohestani</h4><div class="theatre-mini-facts"><span>full video install</span><span>camera system</span><span>rear projection</span><span>surtitles</span></div></div>
        <p class="theatre-production-copy">I did not participate in the original creation. On selected touring dates I installed, calibrated, operated and struck the complete video system — from cameras and projection to control links and surtitles.</p>
      </div>
      <details class="project-drawer">
        <summary>Touring setup / installation workflow</summary>
        <div class="drawer-inner">
          <p class="drawer-note"><strong>Public artistic credit:</strong> video — Phillip Hohenwarter. My role on the dates I toured was technical exploitation: complete installation, calibration and show operation. The production was created in 2022 at the Comédie de Genève.</p>
          <div class="theatre-facts-v09"><div><strong>2 projectors</strong><span>rear-projection system</span></div><div><strong>PTZ + fixed</strong><span>live camera capture</span></div><div><strong>3 screens</strong><span>surtitling display</span></div><div><strong>remote control</strong><span>stage ↔ FOH workflow</span></div><div><strong>J−2 → show</strong><span>installation protocol</span></div></div>
          <div class="en-transit-install"><div class="install-step"><b>J−2</b><strong>Build</strong><span>complete video installation alongside stage / light / sound</span></div><div class="install-step"><b>J−1</b><strong>Calibrate</strong><span>projection, cameras and signal paths</span></div><div class="install-step"><b>J0</b><strong>Validate</strong><span>video / machinery adjustments and show protocol</span></div><div class="install-step"><b>SHOW</b><strong>Operate</strong><span>camera, projection and surtitling system</span></div></div>
          <p class="role-precision"><strong>Touring precision:</strong> I worked a substantial number of dates, but not every date of the full tour.</p>
        </div>
      </details>
    </section>`;
})();
