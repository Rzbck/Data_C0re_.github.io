(() => {
  const STORAGE='data-c0re-lang-v1';
  const normalizeLang=value=>{
    const lang=String(value||'').toLowerCase().slice(0,2);
    return ['en','fr','es'].includes(lang)?lang:'en';
  };
  const currentLang=()=>normalizeLang(document.documentElement.lang||localStorage.getItem(STORAGE)||navigator.language||'en');

  /* These are editorial refinements, not machine-style literal translations.
     The goal is natural portfolio language while retaining AV / stage terms that
     practitioners actually use (TouchDesigner, GLSL, DMX, Art-Net, OSC,
     mapping, edge blending, show control, cues, routing, etc.). */
  const exact={
    fr:{
      'Je construis des systèmes audiovisuels temps réel où le son, les données et le code deviennent image, lumière et comportement spatial.':'Je crée des systèmes audiovisuels temps réel où son, données et code deviennent image, lumière et comportement spatial.',
      'La pratique circule entre creative coding, performance audiovisuelle live, lumière interactive et intégration de systèmes média — du logiciel sur ordinateur aux installations architecturales et environnements scéniques.':'La pratique relie creative coding, AV live, lumière interactive et intégration média — du logiciel aux installations architecturales et environnements scéniques.',
      'Des années de travail dans le spectacle vivant, la tournée, la fabrication et les systèmes média ont façonné une pratique où expérimentation et fiabilité ne s’opposent pas. Un même projet peut passer d’un prototype logiciel à une installation publique ou un environnement scénique sans séparer logique artistique et mise en œuvre technique.':'Des années de travail en spectacle vivant, tournée, fabrication et systèmes média ont façonné une pratique où expérimentation et fiabilité avancent ensemble. Un projet peut passer du prototype logiciel à l’installation ou à la scène sans séparer intention artistique et intégration technique.',
      'Développer les systèmes à partir de leur logique fondamentale : logiciel, interfaces, comportements et structures de contrôle.':'Développer le système depuis sa logique : logiciel, interfaces, comportements et contrôle.',
      'Prototyper directement, révéler les modes de panne et affiner le système par l’usage plutôt que par la seule présentation.':'Prototyper en conditions réelles, révéler les failles et itérer par l’usage.',
      'Relier le logiciel au son, aux réseaux, aux caméras, à la projection, aux LED, à la lumière et à l’espace physique.':'Relier logiciel, son, réseaux, caméras, projection, LED, lumière et espace.',
      'Concevoir pour des conditions techniques changeantes, des études sur ordinateur aux installations et environnements de tournée.':'Concevoir pour des configurations variables, du laptop à l’installation et à la tournée.',
      'Programmation, cues de spectacle, projection multi-plans, soft-edge monumental, surfaces déformées et calibration sur site pour des environnements scéniques de grande échelle.':'Programmation SMODE, cues, projection multi-plans, edge blending, surfaces déformées et calibration sur site pour de grands dispositifs scéniques.',
      'Programmation SMODE, géométrie de projection, cues, soft-edge et calibration dans des environnements de production opéra et ballet.':'Programmation SMODE, géométrie de projection, cues, edge blending et calibration en contexte opéra / ballet.',
      'Préparation du système vidéo en tournée et adaptation aux lieux, coordination avec les équipes techniques locales, surtitrage multilingue, tests, dépannage et passation de régie.':'Préparation et adaptation du système vidéo en tournée, coordination des équipes locales, surtitrage multilingue, tests, dépannage et passation régie.',
      'Adaptation de systèmes vidéo interactifs, caméras, routage, projection, surtitrage, installation en tournée et continuité d’exploitation.':'Adaptation du système vidéo interactif, caméras, routing, projection, surtitrage, installation en tournée et continuité d’exploitation.',
      'Fusion 360 / modélisation 3D / travail du bois / charpenterie-menuiserie / prototypage / intégration électronique':'Fusion 360 / modélisation 3D / menuiserie-charpente / prototypage / intégration électronique'
    },
    es:{
      'Construyo sistemas audiovisuales en tiempo real donde el sonido, los datos y el código se convierten en imagen, luz y comportamiento espacial.':'Creo sistemas audiovisuales en tiempo real donde sonido, datos y código se transforman en imagen, luz y comportamiento espacial.',
      'La práctica se mueve entre creative coding, performance audiovisual en vivo, luz interactiva e integración de sistemas multimedia, desde software en un portátil hasta instalaciones arquitectónicas y entornos escénicos.':'La práctica cruza creative coding, AV en directo, luz interactiva e integración multimedia — del software a instalaciones arquitectónicas y entornos escénicos.',
      'Años de trabajo en espectáculo en vivo, gira, fabricación y sistemas multimedia han dado forma a una práctica donde experimentación y fiabilidad no son opuestas. Un mismo proyecto puede pasar de un prototipo de software a una instalación pública o un entorno escénico sin separar la lógica artística de la implementación técnica.':'Años de trabajo en directo, gira, fabricación y sistemas multimedia han formado una práctica donde experimentación y fiabilidad van juntas. Un proyecto puede pasar del prototipo de software a la instalación o al escenario sin separar lógica artística e integración técnica.',
      'Desarrollar sistemas desde su lógica fundamental: software, interfaces, comportamientos y estructuras de control.':'Desarrollar el sistema desde su lógica: software, interfaces, comportamientos y control.',
      'Prototipar directamente, revelar fallos y perfeccionar el sistema mediante el uso y no solo la presentación.':'Prototipar en condiciones reales, detectar fallos e iterar a través del uso.',
      'Conectar el software con sonido, redes, cámaras, proyección, LED, iluminación y espacio físico.':'Conectar software, sonido, redes, cámaras, proyección, LED, iluminación y espacio.',
      'Diseñar para condiciones técnicas cambiantes, desde estudios en portátil hasta instalaciones y entornos de gira.':'Diseñar para configuraciones cambiantes, del portátil a la instalación y la gira.',
      'Programación, cues de espectáculo, proyección multiplano, soft-edge monumental, superficies deformadas y calibración in situ para grandes entornos escénicos.':'Programación SMODE, cues, proyección multiplano, edge blending, superficies deformadas y calibración in situ para grandes sistemas escénicos.',
      'Programación SMODE, geometría de proyección, cues, soft-edge y calibración en entornos de producción de ópera y ballet.':'Programación SMODE, geometría de proyección, cues, edge blending y calibración en producción de ópera / ballet.',
      'Preparación del sistema de vídeo en gira y adaptación a los espacios, coordinación con equipos técnicos locales, sobretítulos multilingües, pruebas, resolución de problemas y entrega de control.':'Preparación y adaptación del sistema de vídeo en gira, coordinación de equipos locales, sobretítulos multilingües, pruebas, troubleshooting y entrega de control.',
      'Adaptación de sistemas de vídeo interactivos, cámaras, routing, proyección, sobretítulos, instalación en gira y continuidad operativa.':'Adaptación del sistema de vídeo interactivo, cámaras, routing, proyección, sobretítulos, instalación en gira y continuidad operativa.',
      'Carpintería y trabajo en madera — titulación profesional francesa CAP':'Carpintería / construcción en madera — titulación profesional francesa CAP'
    }
  };

  const generic={
    fr:[
      [/soft[- ]edge/gi,'edge blending'],
      [/contrôle de spectacle/gi,'show control'],
      [/cartographie vidéo/gi,'mapping vidéo']
    ],
    es:[
      [/soft[- ]edge/gi,'edge blending'],
      [/control de espectáculo/gi,'show control'],
      [/mapeo de proyección/gi,'mapping de proyección']
    ]
  };

  const excluded=node=>{
    const parent=node.parentElement;
    return !parent||Boolean(parent.closest('script,style,noscript,svg,code,pre'));
  };

  const polishText=lang=>{
    if(lang==='en')return;
    const map=exact[lang]||{};
    const terms=generic[lang]||[];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(excluded(node))return;
      const raw=node.data;
      const trimmed=raw.trim();
      if(!trimmed)return;
      let next=map[trimmed]||trimmed;
      terms.forEach(([pattern,replacement])=>{next=next.replace(pattern,replacement)});
      if(next===trimmed)return;
      const leading=raw.match(/^\s*/)?.[0]||'';
      const trailing=raw.match(/\s*$/)?.[0]||'';
      node.data=leading+next+trailing;
    });
  };

  const desktopFit=()=>window.matchMedia('(min-width:821px)').matches;
  const fitSelectors='.fullpage-panel,.about-panel,.home-statement,.page-intro,.work-screen,.cv-section,.project-hero,.project-section';
  const fitPanels=()=>{
    const panels=[...new Set([...document.querySelectorAll(fitSelectors)])];
    panels.forEach(panel=>panel.removeAttribute('data-locale-tight'));
    if(!desktopFit()||window.innerHeight<640)return;
    const viewport=window.innerHeight;
    requestAnimationFrame(()=>{
      panels.forEach(panel=>{
        const box=panel.getBoundingClientRect();
        if(box.width<1||box.height<1)return;
        const overflow=panel.scrollHeight-viewport;
        if(overflow>12)panel.dataset.localeTight='1';
      });
      requestAnimationFrame(()=>{
        panels.forEach(panel=>{
          if(panel.dataset.localeTight!=='1')return;
          if(panel.scrollHeight-viewport>12)panel.dataset.localeTight='2';
        });
      });
    });
  };

  let timer=null;
  const apply=()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      const lang=currentLang();
      document.documentElement.lang=lang;
      polishText(lang);
      fitPanels();
      document.documentElement.dataset.localePolished=lang;
    },36);
  };

  document.addEventListener('data-c0re-languagechange',()=>{
    apply();setTimeout(apply,120);setTimeout(apply,320);
  });
  window.addEventListener('resize',apply,{passive:true});
  window.visualViewport?.addEventListener('resize',apply,{passive:true});
  window.addEventListener('pageshow',apply,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  setTimeout(apply,180);
  setTimeout(apply,600);
})();
