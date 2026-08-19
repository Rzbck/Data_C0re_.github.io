(() => {
  'use strict';
  if(!document.body.classList.contains('lumina-v3'))return;

  const modal=document.querySelector('[data-lumina-plan-modal]');
  const modalImage=modal?.querySelector('[data-lumina-plan-modal-image]');
  const modalLabel=modal?.querySelector('[data-lumina-plan-modal-label]');
  const closeButton=modal?.querySelector('[data-lumina-plan-modal-close]');
  const cards=[...document.querySelectorAll('[data-lumina-plan-card]')];
  if(!modal||!modalImage||!cards.length)return;

  const candidates=card=>[card.dataset.planSrc,card.dataset.planFallback].filter(Boolean);
  const preload=src=>new Promise((resolve,reject)=>{
    const img=new Image();
    img.decoding='async';
    img.onload=()=>resolve(src);
    img.onerror=reject;
    img.src=new URL(src,document.baseURI).href;
  });
  const resolveSource=async card=>{
    for(const src of candidates(card)){
      try{return await preload(src)}catch{}
    }
    return '';
  };
  const close=()=>{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('lumina-plan-open');
  };
  const open=async card=>{
    const src=await resolveSource(card);
    if(!src)return;
    cards.forEach(item=>item.classList.toggle('active',item===card));
    modalImage.src=src;
    modalImage.alt=card.dataset.planLabel||'LUMINA technical drawing';
    if(modalLabel)modalLabel.textContent=card.dataset.planLabel||'';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('lumina-plan-open');
    closeButton?.focus({preventScroll:true});
  };

  cards.forEach(card=>{
    candidates(card).forEach(src=>{const img=new Image();img.src=new URL(src,document.baseURI).href});
    card.addEventListener('click',()=>open(card));
  });
  closeButton?.addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('open'))close()});
})();
