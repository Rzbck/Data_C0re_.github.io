(() => {
  const lumina = document.querySelector('#lumina');
  if (!lumina) return;

  const style = document.createElement('style');
  style.textContent = `
    #lumina .technical-tabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;width:100%!important}
    #lumina .technical-tabs button{width:100%!important;min-width:0!important;min-height:44px!important;box-sizing:border-box!important;white-space:nowrap!important;text-align:center!important}
    #lumina .technical-viewer{margin:0!important;min-height:0!important;overflow:hidden!important;background:#070707!important}
    #lumina .technical-viewer img{display:block!important;width:100%!important;height:auto!important;aspect-ratio:1166/824!important;max-height:none!important;object-fit:contain!important;object-position:center!important;padding:0!important;background:#f5f5f3!important}
    #lumina .technical-viewer figcaption{box-sizing:border-box!important;min-height:32px!important;margin:0!important;padding:9px 0!important}
    @media(max-width:680px){
      #lumina .technical-tabs{grid-template-columns:1fr 1fr!important}
      #lumina .technical-tabs button{min-height:42px!important;font-size:8.5px!important;padding:10px 5px!important}
      #lumina .technical-viewer img{aspect-ratio:1166/824!important}
    }
  `;
  document.head.appendChild(style);
})();