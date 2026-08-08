(() => {
  const q = (s, root = document) => root.querySelector(s);

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.5 — Les Emigrants final visual cleanup */
    #prod-emigrants #lupa-role .theatre-data-grid,
    #prod-emigrants #lupa-archive .theatre-data-grid{
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      width:100%!important;
      max-width:none!important;
    }
    #prod-emigrants #lupa-role .theatre-data-grid>div,
    #prod-emigrants #lupa-archive .theatre-data-grid>div{
      min-width:0!important;
      min-height:104px!important;
      padding:14px 14px!important;
      display:flex!important;
      flex-direction:column!important;
      justify-content:flex-start!important;
    }
    #prod-emigrants #lupa-role .theatre-data-grid strong,
    #prod-emigrants #lupa-archive .theatre-data-grid strong{
      white-space:nowrap!important;
      font-size:clamp(20px,1.62vw,28px)!important;
      line-height:1!important;
      letter-spacing:-.045em!important;
      min-height:0!important;
    }
    #prod-emigrants #lupa-role .theatre-data-grid span,
    #prod-emigrants #lupa-archive .theatre-data-grid span{
      margin-top:9px!important;
      min-height:0!important;
      line-height:1.22!important;
    }
    #prod-emigrants #lupa-archive .theatre-panel-grid{
      display:block!important;
    }
    #prod-emigrants #lupa-archive .theatre-media-single,
    #prod-emigrants #lupa-archive .theatre-media-duo{
      display:none!important;
    }
    @media(max-width:900px){
      #prod-emigrants #lupa-role .theatre-data-grid,
      #prod-emigrants #lupa-archive .theatre-data-grid{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }
    @media(max-width:680px){
      #prod-emigrants #lupa-role .theatre-data-grid strong,
      #prod-emigrants #lupa-archive .theatre-data-grid strong{
        white-space:normal!important;
        font-size:22px!important;
      }
    }
  `;
  document.head.appendChild(style);

  const process = q('#prod-emigrants #lupa-archive');
  if (process) {
    process.innerHTML = `
      <div class="theatre-panel-grid">
        <div>
          <p class="theatre-panel-copy"><strong>Cue-based creation process.</strong> Across two acts, the video system coordinated live camera inputs, mapped projection surfaces and cue-driven scenic states. The working structure was built to stay precise and repeatable throughout a long-form stage piece.</p>
          <div class="theatre-data-grid">
            <div><strong>154 cues</strong><span>working states</span></div>
            <div><strong>2 acts</strong><span>long-form structure</span></div>
            <div><strong>4 outputs</strong><span>mapped projection endpoints</span></div>
            <div><strong>live inputs</strong><span>camera + scenic media</span></div>
          </div>
        </div>
      </div>`;
  }
})();