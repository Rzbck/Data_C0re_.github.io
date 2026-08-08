(() => {
  const q = (s, root = document) => root.querySelector(s);

  const style = document.createElement('style');
  style.textContent = `
    /* Les Emigrants — clean process + consistent metrics */
    #prod-emigrants #lupa-role .theatre-panel-grid,
    #prod-emigrants #lupa-archive .theatre-panel-grid{
      display:block!important;
    }

    #prod-emigrants #lupa-role .theatre-media-single,
    #prod-emigrants #lupa-archive .theatre-media-single,
    #prod-emigrants #lupa-archive .theatre-media-duo{
      display:none!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid,
    #prod-emigrants #lupa-archive .theatre-data-grid{
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      width:100%!important;
      max-width:none!important;
      align-items:stretch!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid>div,
    #prod-emigrants #lupa-archive .theatre-data-grid>div{
      min-width:0!important;
      min-height:102px!important;
      padding:14px 16px!important;
      display:flex!important;
      flex-direction:column!important;
      justify-content:flex-start!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid strong,
    #prod-emigrants #lupa-archive .theatre-data-grid strong{
      display:block!important;
      white-space:nowrap!important;
      font-size:clamp(18px,1.55vw,27px)!important;
      line-height:1!important;
      letter-spacing:-.04em!important;
      min-height:0!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid span,
    #prod-emigrants #lupa-archive .theatre-data-grid span{
      margin-top:8px!important;
      min-height:0!important;
      line-height:1.2!important;
    }

    #prod-emigrants #lupa-archive .theatre-panel-copy{
      max-width:900px!important;
      margin-bottom:18px!important;
    }

    #prod-transit #transit-role .theatre-data-grid{
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
    }
    #prod-transit #transit-role .theatre-data-grid>div:last-child strong{
      white-space:nowrap!important;
      font-size:clamp(18px,1.55vw,25px)!important;
    }

    @media(max-width:900px){
      #prod-emigrants #lupa-role .theatre-data-grid,
      #prod-emigrants #lupa-archive .theatre-data-grid,
      #prod-transit #transit-role .theatre-data-grid{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }

    @media(max-width:680px){
      #prod-emigrants #lupa-role .theatre-data-grid strong,
      #prod-emigrants #lupa-archive .theatre-data-grid strong,
      #prod-transit #transit-role .theatre-data-grid>div:last-child strong{
        white-space:normal!important;
        font-size:21px!important;
      }
    }
  `;
  document.head.appendChild(style);

  q('#prod-emigrants #lupa-role .theatre-media-single')?.remove();

  const process = q('#prod-emigrants #lupa-archive');
  if (process) {
    process.innerHTML = `
      <div class="theatre-panel-grid">
        <div>
          <p class="theatre-panel-copy"><strong>Cue-based creation process.</strong> Across two acts, the video system coordinated live camera inputs, mapped projection surfaces and cue-driven scenic states in a repeatable show-control structure.</p>
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

import('./v096.js?v=96').catch(() => {});