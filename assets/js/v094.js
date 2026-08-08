(() => {
  const q = (s, root = document) => root.querySelector(s);

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.5 — Les Emigrants consistency pass */
    #prod-emigrants #lupa-role .theatre-panel-grid,
    #prod-emigrants #lupa-archive .theatre-panel-grid{display:block!important}

    #prod-emigrants #lupa-role .theatre-media-single,
    #prod-emigrants #lupa-archive .theatre-media-single{display:none!important}

    #prod-emigrants #lupa-role .theatre-data-grid,
    #prod-emigrants #lupa-archive .theatre-data-grid,
    #prod-transit #transit-role .theatre-data-grid{
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      align-items:stretch!important;
      width:100%!important;
      max-width:none!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid>div,
    #prod-emigrants #lupa-archive .theatre-data-grid>div{
      display:flex!important;
      flex-direction:column!important;
      justify-content:flex-start!important;
      min-height:108px!important;
      padding:14px 13px!important;
      min-width:0!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid strong,
    #prod-emigrants #lupa-archive .theatre-data-grid strong{
      display:block!important;
      min-height:0!important;
      font-size:clamp(20px,1.7vw,28px)!important;
      line-height:1!important;
      letter-spacing:-.045em!important;
      white-space:nowrap!important;
    }

    #prod-emigrants #lupa-role .theatre-data-grid span,
    #prod-emigrants #lupa-archive .theatre-data-grid span{
      margin-top:8px!important;
      min-height:0!important;
      line-height:1.22!important;
    }

    #prod-emigrants #lupa-archive .theatre-panel-copy{max-width:920px!important}

    #prod-transit #transit-role .theatre-data-grid>div{min-width:0!important}
    #prod-transit #transit-role .theatre-data-grid>div:last-child strong{
      white-space:nowrap!important;
      font-size:clamp(18px,1.55vw,25px)!important;
      letter-spacing:-.045em!important;
    }

    @media(max-width:1100px){
      #prod-emigrants #lupa-role .theatre-data-grid,
      #prod-emigrants #lupa-archive .theatre-data-grid,
      #prod-transit #transit-role .theatre-data-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #prod-emigrants #lupa-role .theatre-data-grid strong,
      #prod-emigrants #lupa-archive .theatre-data-grid strong{font-size:clamp(21px,2.5vw,27px)!important}
      #prod-transit #transit-role .theatre-data-grid>div:last-child strong{font-size:clamp(20px,2.4vw,27px)!important}
    }

    @media(max-width:680px){
      #prod-emigrants #lupa-role .theatre-data-grid,
      #prod-emigrants #lupa-archive .theatre-data-grid,
      #prod-transit #transit-role .theatre-data-grid{grid-template-columns:1fr 1fr!important}
      #prod-emigrants #lupa-role .theatre-data-grid>div,
      #prod-emigrants #lupa-archive .theatre-data-grid>div{min-height:98px!important;padding:12px 10px!important}
      #prod-emigrants #lupa-role .theatre-data-grid strong,
      #prod-emigrants #lupa-archive .theatre-data-grid strong{font-size:20px!important;white-space:normal!important}
      #prod-transit #transit-role .theatre-data-grid>div:last-child strong{white-space:normal!important;font-size:21px!important}
    }
  `;
  document.head.appendChild(style);

  // Remove the abstract cue preview everywhere in the Les Emigrants main tabs.
  q('#prod-emigrants #lupa-role .theatre-media-single')?.remove();
  q('#prod-emigrants #lupa-archive .theatre-media-single')?.remove();
})();
