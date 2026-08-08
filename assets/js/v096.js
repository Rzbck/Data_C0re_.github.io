(() => {
  const q = (s, root = document) => root.querySelector(s);

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.6 — Realtime FX research study */
    #realtime .study-split.study-split--three{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:10px!important;
      align-items:stretch!important;
    }
    #realtime .study-split--three .study-card{
      min-width:0!important;
      display:flex!important;
      flex-direction:column!important;
    }
    #realtime .study-split--three .study-media{
      height:auto!important;
      aspect-ratio:16/10!important;
      min-height:0!important;
      overflow:hidden!important;
      background:#030303!important;
    }
    #realtime .study-split--three .study-media video,
    #realtime .study-split--three .study-media img{
      width:100%!important;
      height:100%!important;
      display:block!important;
      object-fit:cover!important;
    }
    #realtime .study-split--three .study-copy{
      flex:1!important;
      min-height:178px!important;
    }
    #realtime .study-split--three .study-copy h3{
      font-size:clamp(22px,2.05vw,34px)!important;
      line-height:.96!important;
      letter-spacing:-.04em!important;
    }
    #realtime .study-split--three .study-copy p{
      max-width:42ch!important;
      color:#aaa8a2!important;
    }
    .fx-study .study-media{position:relative}
    .fx-study .study-media::after{
      content:'REALTIME IMAGE RESEARCH';
      position:absolute;
      left:12px;
      bottom:10px;
      padding:6px 8px;
      background:#070707d9;
      border:1px solid #ffffff26;
      color:#f3f1eb;
      font-size:8px;
      letter-spacing:.11em;
      text-transform:uppercase;
    }
    .fx-study .fx-research-line{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      border-top:1px solid var(--line);
      border-bottom:1px solid var(--line);
      margin-top:auto;
    }
    .fx-study .fx-research-line span{
      padding:10px 9px;
      border-right:1px solid var(--line);
      color:#8f8d88;
      font-size:8px;
      line-height:1.25;
      letter-spacing:.075em;
      text-transform:uppercase;
    }
    .fx-study .fx-research-line span:last-child{border-right:0}
    @media(max-width:1100px){
      #realtime .study-split.study-split--three{grid-template-columns:1fr 1fr!important}
      #realtime .study-split--three .fx-study{grid-column:1/-1!important;display:grid!important;grid-template-columns:1fr 1fr!important}
      #realtime .study-split--three .fx-study .study-media{aspect-ratio:16/9!important}
      #realtime .study-split--three .fx-study .study-copy{min-height:0!important}
      #realtime .study-split--three .fx-study .fx-research-line{grid-column:1/-1!important}
    }
    @media(max-width:680px){
      #realtime .study-split.study-split--three{grid-template-columns:1fr!important;gap:18px!important}
      #realtime .study-split--three .fx-study{grid-column:auto!important;display:flex!important}
      #realtime .study-split--three .study-copy{min-height:0!important}
      .fx-study .fx-research-line{grid-template-columns:1fr 1fr 1fr}
    }
  `;
  document.head.appendChild(style);

  const realtime = q('#realtime');
  if (!realtime) return;

  const summary = q('.project-summary', realtime);
  if (summary) summary.textContent = 'Three separate realtime studies exploring sonic response, emergent systems and image transformation. Presented as an evolving personal research practice rather than as one single artwork.';

  const split = q('.study-split', realtime);
  if (!split) return;
  split.classList.add('study-split--three');

  q('.fx-study', split)?.remove();
  split.insertAdjacentHTML('beforeend', `
    <article class="study-card fx-study reveal visible">
      <div class="study-media">
        <img src="./assets/media/realtime/fx-output.svg" alt="Realtime image-processing study from the TouchDesigner FX research library" loading="lazy" onerror="this.src='./assets/media/realtime/audio-material.webp'">
      </div>
      <div class="study-copy">
        <span>C</span>
        <h3>Realtime FX Library / Visual Behaviour</h3>
        <p>A self-built vocabulary of realtime image transformations developed for performance and installation. The research focuses on how effects behave over time, combine with one another and become controllable visual material inside TouchDesigner.</p>
      </div>
      <div class="fx-research-line" aria-label="Research principles">
        <span>modular processes</span>
        <span>parameterised behaviour</span>
        <span>live composition</span>
      </div>
    </article>`);
})();
