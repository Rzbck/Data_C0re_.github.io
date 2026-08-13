(() => {
  'use strict';
  if(window.__DATA_C0RE_STATIC_I18N__)return;
  window.__DATA_C0RE_STATIC_I18N__=true;

  const supported=['en','fr','es'];
  const storage='data-c0re-lang-v1';
  const repoSegment=location.hostname.endsWith('github.io')&&location.pathname.startsWith('/Data_C0re_.github.io')?'/Data_C0re_.github.io':'';
  const rel=location.pathname.slice(repoSegment.length).replace(/^\/+|\/+$/g,'');
  const parts=rel?rel.split('/'):[];
  const pathLang=supported.includes(parts[0])?parts.shift():null;
  const htmlLang=(document.documentElement.lang||'').slice(0,2);
  const lang=pathLang||(supported.includes(htmlLang)?htmlLang:'en');
  document.documentElement.lang=lang;
  try{localStorage.setItem(storage,lang)}catch{}

  const ui={
    en:{'motion on':'motion on','motion off':'motion off'},
    fr:{'motion on':'animation active','motion off':'animation désactivée'},
    es:{'motion on':'animación activa','motion off':'animación desactivada'}
  };
  const t=text=>ui[lang]?.[text]||text;

  const destination=target=>{
    let route=parts.join('/');
    if(!route||route==='index.html')route='';
    const path=[repoSegment,target,route].filter(Boolean).join('/').replace(/\/+/g,'/');
    const normalized=path.startsWith('/')?path:`/${path}`;
    return `${location.origin}${normalized}${route?'':'/'}${location.hash||''}`;
  };

  const injectSwitcher=()=>{
    const actions=document.querySelector('.header-actions'),menu=document.querySelector('[data-menu-toggle]');
    if(!actions||actions.querySelector('.lang-switcher'))return;
    const wrap=document.createElement('div');
    wrap.className='lang-switcher';wrap.setAttribute('role','group');wrap.setAttribute('aria-label','Language / Langue / Idioma');
    [['en','EN'],['fr','FR'],['es','ES']].forEach(([target,label])=>{
      const button=document.createElement('button');
      button.type='button';button.dataset.lang=target;button.textContent=label;button.setAttribute('aria-pressed',String(target===lang));
      button.addEventListener('click',event=>{
        if(target===lang){event.preventDefault();return}
        try{localStorage.setItem(storage,target)}catch{}
        location.assign(destination(target));
      });
      wrap.appendChild(button);
    });
    actions.insertBefore(wrap,menu||null);
  };

  injectSwitcher();
  window.DATA_C0RE_I18N={get lang(){return lang},set:target=>{if(supported.includes(target)&&target!==lang)location.assign(destination(target))},t};
  document.dispatchEvent(new CustomEvent('data-c0re-languagechange',{detail:{lang,static:true}}));

  if(!document.querySelector('script[data-language-magnet-sync]')){
    const script=document.createElement('script');
    script.src=new URL('assets/js/language-magnet-sync.js',document.baseURI).href;
    script.async=false;script.dataset.languageMagnetSync='true';document.head.appendChild(script);
  }
})();
