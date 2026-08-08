(() => {
  const q = (s, root = document) => root.querySelector(s);

  const style = document.createElement('style');
  style.textContent = `
    /* V0.9.4 — small theatre polish */
    #prod-emigrants #lupa-role .theatre-panel-grid{display:block!important}
    #prod-emigrants #lupa-role .theatre-media-single{display:none!important}
    #prod-emigrants #lupa-role .theatre-data-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;align-items:stretch!important}
    #prod-emigrants #lupa-role .theatre-data-grid>div{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;min-height:112px!important;padding:14px 12px!important}
    #prod-emigrants #lupa-role .theatre-data-grid strong{display:flex!important;align-items:flex-start!important;min-height:54px!important;font-size:clamp(24px,2vw,31px)!important;line-height:.95!important;white-space:normal!important}
    #prod-emigrants #lupa-role .theatre-data-grid span{margin-top:auto!important;min-height:29px!important;line-height:1.25!important}

    #prod-transit #transit-role .theatre-data-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
    #prod-transit #transit-role .theatre-data-grid>div{min-width:0!important}
    #prod-transit #transit-role .theatre-data-grid>div:last-child strong{white-space:nowrap!important;font-size:clamp(18px,1.55vw,25px)!important;letter-spacing:-.045em!important}

    @media(max-width:1100px){
      #prod-emigrants #lupa-role .theatre-data-grid,#prod-transit #transit-role .theatre-data-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #prod-transit #transit-role .theatre-data-grid>div:last-child strong{font-size:clamp(20px,2.4vw,27px)!important}
    }
    @media(max-width:680px){
      #prod-emigrants #lupa-role .theatre-data-grid,#prod-transit #transit-role .theatre-data-grid{grid-template-columns:1fr 1fr!important}
      #prod-emigrants #lupa-role .theatre-data-grid>div{min-height:104px!important}
      #prod-emigrants #lupa-role .theatre-data-grid strong{min-height:46px!important;font-size:23px!important}
      #prod-transit #transit-role .theatre-data-grid>div:last-child strong{white-space:normal!important;font-size:21px!important}
    }
  `;
  document.head.appendChild(style);

  // Remove the weak / abstract cue preview from the main Les Émigrants role tab.
  q('#prod-emigrants #lupa-role .theatre-media-single')?.remove();
})();
