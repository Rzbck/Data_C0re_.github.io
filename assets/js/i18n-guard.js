(() => {
  if(window.__DATA_C0RE_NATIVE_MUTATION_OBSERVER)return;
  const Native=window.MutationObserver;
  if(!Native)return;
  window.__DATA_C0RE_NATIVE_MUTATION_OBSERVER=Native;
  window.MutationObserver=class extends Native{
    observe(target,options={}){
      const safe={...options};
      if(safe.characterData){
        safe.characterData=false;
        delete safe.characterDataOldValue;
      }
      return super.observe(target,safe);
    }
  };
  window.__DATA_C0RE_RESTORE_MUTATION_OBSERVER=()=>{
    if(window.__DATA_C0RE_NATIVE_MUTATION_OBSERVER){
      window.MutationObserver=window.__DATA_C0RE_NATIVE_MUTATION_OBSERVER;
      delete window.__DATA_C0RE_NATIVE_MUTATION_OBSERVER;
      delete window.__DATA_C0RE_RESTORE_MUTATION_OBSERVER;
    }
  };
})();
