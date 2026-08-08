(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  const style = document.createElement('style');
  style.textContent = `
    #prod-ecel .theatre-panel-body{height:410px;min-height:410px;overflow:hidden}
    #prod-ecel .theatre-panel-page{position:absolute;inset:0;padding:18px 0 0;overflow:hidden}
    #prod-ecel .theatre-panel-page:not(.active){display:block;visibility:hidden;pointer-events:none;opacity:0}
    #prod-ecel .theatre-panel-page.active{visibility:visible;pointer-events:auto;opacity:1}
    #prod-ecel .theatre-panel-grid{height:100%;grid-template-columns:1.05fr .95fr;align-items:start}
    #prod-ecel .theatre-data-grid{grid-template-columns:repeat(2,1fr);max-width:640px}
    #prod-ecel .theatre-data-grid div:nth-child(2n){border-right:0}
    #prod-ecel .theatre-data-grid div:nth-child(n+3){border-top:1px solid var(--line)}
    #prod-ecel .theatre-media-single{margin-top:0;height:100%}
    #prod-ecel .theatre-media-single figure{height:100%;display:flex;flex-direction:column}
    #prod-ecel .theatre-media-single img{height:calc(100% - 28px);object-fit:cover}
    #prod-ecel .theatre-media-duo{height:100%;grid-template-columns:1fr;max-width:520px;margin:0 0 0 auto}
    #prod-ecel .theatre-media-duo figure{height:100%;display:flex;flex-direction:column}
    #prod-ecel .theatre-media-duo img{height:calc(100% - 28px);object-fit:cover}
    #prod-ecel .theatre-route{margin-top:20px}
    #prod-ecel .theatre-panel-copy{max-width:720px}
    .theatre-note{display:none!important}
    #lupa-archive .theatre-panel-grid{grid-template-columns:minmax(0,.85fr) minmax(360px,1.15fr)}
    #lupa-archive .theatre-media-single{margin:0}
    #lupa-archive .theatre-media-single img{width:100%;height:auto;max-height:360px;object-fit:contain}
    @media(max-width:1100px){
      #prod-ecel .theatre-panel-body{height:470px;min-height:470px}
      #prod-ecel .theatre-panel-grid{grid-template-columns:1fr 1fr}
      #lupa-archive .theatre-panel-grid{grid-template-columns:1fr}
    }
    @media(max-width:680px){
      #prod-ecel .theatre-panel-body{height:660px;min-height:660px}
      #prod-ecel .theatre-panel-page{overflow:auto;padding-right:4px}
      #prod-ecel .theatre-panel-grid{grid-template-columns:1fr;height:auto}
      #prod-ecel .theatre-media-single{height:310px}
      #prod-ecel .theatre-media-duo{height:310px;max-width:none;margin-top:14px}
      #prod-ecel .theatre-route{margin-top:12px}
    }
  `;
  document.head.appendChild(style);

  qa('.theatre-note').forEach(el => el.remove());

  const ecel = q('#prod-ecel');
  if (ecel) {
    const role = q('#ecel-role', ecel);
    const media = q('#ecel-media', ecel);
    const route = q('#ecel-route', ecel);

    if (role) role.innerHTML = `
      <div class="theatre-panel-grid">
        <div>
          <p class="theatre-panel-copy"><strong>Video system — Julio Parente & Charlélie Chauvel.</strong> Creation and touring work focused on keeping the live-cinema system production-ready across changing venues: preparation, projection and subtitle checks, operation, troubleshooting, local-team coordination and handover.</p>
          <div class="theatre-data-grid">
            <div><strong>1 camera</strong><span>on-stage live capture</span></div>
            <div><strong>8 × 4.32 m</strong><span>main projection screen</span></div>
            <div><strong>live edit</strong><span>camera + media coordination</span></div>
            <div><strong>touring</strong><span>venue adaptation + handover</span></div>
          </div>
        </div>
        <div class="theatre-media-single"><figure><img src="./assets/media/comedie/venue.jpg" alt="Comédie de Genève stage during Entre chien et loup production work" loading="lazy"><figcaption>Creation / venue context</figcaption></figure></div>
      </div>`;

    if (media) media.innerHTML = `
      <div class="theatre-panel-grid">
        <div>
          <p class="theatre-panel-copy"><strong>Touring operation.</strong> The video system moved between creation, rehearsals and international venues. My work covered stage/video checks, live operation, projection alignment, multilingual surtitles, troubleshooting and coordination with the host technical team.</p>
          <div class="theatre-data-grid">
            <div><strong>stage</strong><span>camera + projection checks</span></div>
            <div><strong>FOH</strong><span>live video operation</span></div>
            <div><strong>surtitles</strong><span>multilingual playback</span></div>
            <div><strong>handover</strong><span>documentation + local crews</span></div>
          </div>
        </div>
        <div class="theatre-media-duo"><figure><img src="./assets/media/comedie/control.webp" alt="Video control environment during touring theatre work" loading="lazy"><figcaption>Control / operation context</figcaption></figure></div>
      </div>`;

    if (route) route.innerHTML = `
      <p class="theatre-panel-copy">Selected production contexts from the touring period.</p>
      <div class="theatre-route">
        <div><time>2021</time><strong>Festival d'Avignon</strong><span>Avignon</span></div>
        <div><time>2022</time><strong>Odéon</strong><span>Paris</span></div>
        <div><time>2022</time><strong>Piccolo Teatro</strong><span>Milan</span></div>
        <div><time>2022</time><strong>CDN</strong><span>Madrid</span></div>
        <div><time>2023</time><strong>Edinburgh</strong><span>International Festival</span></div>
        <div><time>2023</time><strong>SESC</strong><span>São Paulo</span></div>
      </div>`;
  }

  const lupa = q('#prod-emigrants');
  if (lupa) {
    const archiveButton = q('[data-panel-target="lupa-archive"]', lupa);
    if (archiveButton) archiveButton.textContent = 'process';
    const archive = q('#lupa-archive', lupa);
    if (archive) archive.innerHTML = `
      <div class="theatre-panel-grid">
        <div>
          <p class="theatre-panel-copy"><strong>Cue-based creation process.</strong> A sequence of 154 working states coordinated live cameras, mapped scenic surfaces, projection and tulle/shutter states across two acts. One selected cue is shown here at a readable scale.</p>
          <div class="theatre-data-grid"><div><strong>154</strong><span>working cue states</span></div><div><strong>2 acts</strong><span>long-form structure</span></div><div><strong>4 outputs</strong><span>mapped projection endpoints</span></div><div><strong>live inputs</strong><span>camera + scenic media</span></div></div>
        </div>
        <div class="theatre-media-single"><figure><img src="./assets/media/comedie/emigrants-cue-85.svg" alt="Les Émigrants mapped stage cue state" loading="lazy"><figcaption>Selected cue / mapped scenic composition</figcaption></figure></div>
      </div>`;
    const credit = q('#lupa-credit', lupa);
    if (credit) credit.innerHTML = `<p class="theatre-panel-copy"><strong>Video creation:</strong> Natan Berkowicz. <strong>Video assistant:</strong> Stanislaw Paweł Zieliński. My contribution at the Comédie de Genève was technical video-system integration and cueing during the creation phase. The production later premiered at the Odéon in Paris in January 2024.</p>`;
  }

  const transit = q('#prod-transit');
  if (transit) {
    const credit = q('#transit-credit', transit);
    if (credit) credit.innerHTML = `<p class="theatre-panel-copy"><strong>Video:</strong> Phillip Hohenwarter. On the toured dates, my role was complete installation, calibration, show operation and strike of the video system. I worked a substantial selection of dates rather than the complete tour.</p>`;
  }
})();
