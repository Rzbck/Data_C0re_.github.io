(() => {
  'use strict';
  const ROOT = location.hostname.endsWith('github.io') ? `${location.origin}/Data_C0re_.github.io/` : `${location.origin}/`;
  const path = location.pathname.replace(/^\/Data_C0re_\.github\.io\/?/, '').replace(/^\//, '');
  const route = path || 'index.html';
  const canonicalPath = route === 'index.html' ? '' : route;
  const canonical = ROOT + canonicalPath;
  const ogImage = ROOT + 'assets/img/og-cover.jpg';

  const profiles = {
    'index.html': {
      title: 'DATA C0RE — Realtime Audiovisual Systems / Creative Technologist',
      description: 'DATA C0RE is a digital artist and creative technologist based in Annecy, working internationally across realtime audiovisual systems, TouchDesigner, interactive video, projection, light, live AV and stage media.'
    },
    'work.html': {
      title: 'Work — Realtime AV, Interactive Video, Projection & Stage Systems — DATA C0RE',
      description: 'Selected artistic and professional work in realtime audiovisual systems, TouchDesigner, interactive video, projection mapping, LED, DMX, live AV, theatre video and media-system integration.'
    },
    'about.html': {
      title: 'About — Digital Artist & Creative Technologist — DATA C0RE',
      description: 'DATA C0RE develops realtime audiovisual systems where code, sound, data, image and light interact across screens, stages, theatre, public installations and physical space.'
    },
    'cv.html': {
      title: 'CV — Video Systems, TouchDesigner, Projection, Interactive Media — DATA C0RE',
      description: 'Professional CV: realtime video systems, TouchDesigner, SMODE, projection integration, mapping, LED, DMX, Art-Net, OSC, theatre, touring, live AV and interactive media. Annecy / France / international.'
    },
    'lab.html': {
      title: 'Lab — Creative Coding, GLSL & Realtime Media Research — DATA C0RE',
      description: 'Research in creative coding, TouchDesigner, GLSL, realtime rendering, audio-reactive systems, networks, sensors, APIs, WebSocket, media servers and interactive audiovisual tools.'
    },
    'projects/snake.html': { title: 'Snake / Networked Retro System — TouchDesigner Interactive Project — DATA C0RE', description: 'Solo TouchDesigner system combining game logic, music synchronisation, custom UI, online leaderboard, database integration and realtime audiovisual behaviour.' },
    'projects/ascii.html': { title: 'ASCII / Pixel Realtime Study — TouchDesigner — DATA C0RE', description: 'Realtime computational image study using TouchDesigner to reduce portraits and graphic forms into pixels, symbols and colour fields.' },
    'projects/lumina.html': { title: 'LUMINA / Geneva Lux — Interactive LED Installation — DATA C0RE', description: 'Collaborative Geneva Lux installation: Fusion 360 structure, TouchDesigner programming, Art-Net, addressable LED architecture, network planning, fabrication coordination and realtime light integration.' },
    'projects/realtime.html': { title: 'Realtime Studies — Audio-Reactive TouchDesigner Systems — DATA C0RE', description: 'Realtime audio-reactive visual research in TouchDesigner exploring material behaviour, cellular systems, sound analysis and temporal image generation.' },
    'projects/hardwinner.html': { title: 'Hardwinner — Realtime AV Systems, LED, DMX & Live Visuals — DATA C0RE', description: 'Collaborative live AV systems combining TouchDesigner, Resolume, GLSL, LED, DMX, realtime show control, stage design and electronic-music performance contexts.' },
    'projects/cloud.html': { title: 'Cloud Processing / Anisotropic GLSL — DATA C0RE', description: 'Solo visual study transforming cloud timelapse imagery through anisotropic GLSL processing in TouchDesigner.' },
    'projects/grand-theatre.html': { title: 'Grand Théâtre de Genève — SMODE, Projection Integration & Video Systems — DATA C0RE', description: 'Professional projection integration: SMODE programming, cues, multi-plane projection, edge blending, very short-throw optics and on-site calibration at Grand Théâtre de Genève.' },
    'projects/comedie.html': { title: 'Comédie de Genève — Touring Interactive Video System — DATA C0RE', description: 'Touring video and interactive media system work: venue adaptation, technical-team coordination, multilingual surtitling, testing, troubleshooting and video-regie handover.' },
    'projects/stage-systems.html': { title: 'Stage Systems — TouchDesigner, Resolume, LED & Lighting Integration — DATA C0RE', description: 'Stage media systems combining TouchDesigner, Resolume, LED screens, DMX lighting, realtime simulation, video-light synchronisation and live deployment.' }
  };

  const p = profiles[route] || { title: document.title || 'DATA C0RE', description: document.querySelector('meta[name="description"]')?.content || 'Realtime audiovisual systems, creative coding, interactive video, projection, light and stage media.' };
  document.title = p.title;

  const setMeta = (selector, attrs) => {
    let el = document.head.querySelector(selector);
    if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    return el;
  };
  const setLink = (rel, href) => {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
    el.href = href;
  };

  setMeta('meta[name="description"]', { name:'description', content:p.description });
  setMeta('meta[name="robots"]', { name:'robots', content:'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });
  setMeta('meta[name="googlebot"]', { name:'googlebot', content:'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });
  setMeta('meta[property="og:type"]', { property:'og:type', content: route.startsWith('projects/') ? 'article' : 'website' });
  setMeta('meta[property="og:site_name"]', { property:'og:site_name', content:'DATA C0RE' });
  setMeta('meta[property="og:title"]', { property:'og:title', content:p.title });
  setMeta('meta[property="og:description"]', { property:'og:description', content:p.description });
  setMeta('meta[property="og:url"]', { property:'og:url', content:canonical });
  setMeta('meta[property="og:image"]', { property:'og:image', content:ogImage });
  setMeta('meta[property="og:image:alt"]', { property:'og:image:alt', content:'DATA C0RE — realtime audiovisual systems portfolio' });
  setMeta('meta[name="twitter:card"]', { name:'twitter:card', content:'summary_large_image' });
  setMeta('meta[name="twitter:title"]', { name:'twitter:title', content:p.title });
  setMeta('meta[name="twitter:description"]', { name:'twitter:description', content:p.description });
  setMeta('meta[name="twitter:image"]', { name:'twitter:image', content:ogImage });
  setLink('canonical', canonical);

  if (!document.head.querySelector('link[rel="icon"]')) {
    const icon = document.createElement('link');
    icon.rel='icon'; icon.type='image/svg+xml';
    icon.href=new URL('assets/img/favicon.svg', document.baseURI).href;
    document.head.appendChild(icon);
  }

  // Static JSON-LD is preferred on core pages. This fallback only fills pages that do not already ship schema in HTML.
  if (document.head.querySelector('script[type="application/ld+json"]')) return;

  const person = {
    '@type':'Person', '@id':ROOT+'#data-c0re', name:'DATA C0RE', url:ROOT,
    image:ogImage,
    jobTitle:['Digital artist','Creative technologist','Realtime audiovisual systems designer'],
    description:'Digital artist and creative technologist working with realtime audiovisual systems, creative coding, interactive video, projection, light and media-system integration.',
    homeLocation:{'@type':'Place',name:'Annecy, Auvergne-Rhône-Alpes, France'},
    sameAs:['https://www.instagram.com/data_c0re_/','https://github.com/Rzbck'],
    knowsLanguage:['fr','en'],
    knowsAbout:['TouchDesigner','realtime audiovisual systems','interactive video','projection mapping','projection integration','creative coding','live AV','GLSL','SMODE','Resolume','Millumin','LED','DMX','Art-Net','OSC','show control','media servers','theatre video','touring video systems','interactive installations','Fusion 360']
  };
  const graph = [
    { '@type':'WebSite', '@id':ROOT+'#website', url:ROOT, name:'DATA C0RE', description:profiles['index.html'].description, inLanguage:['en','fr','es'], publisher:{'@id':ROOT+'#data-c0re'} },
    person
  ];

  if (route === 'about.html' || route === 'cv.html') {
    graph.push({ '@type':'ProfilePage', '@id':canonical+'#profile', url:canonical, name:p.title, mainEntity:{'@id':ROOT+'#data-c0re'}, inLanguage:['en','fr','es'] });
  }
  if (route === 'cv.html') {
    graph.push({
      '@type':'Service', '@id':ROOT+'#av-services', name:'Realtime audiovisual and video systems', provider:{'@id':ROOT+'#data-c0re'},
      areaServed:'International',
      serviceType:['Realtime video systems','TouchDesigner programming','Projection integration','Interactive media','Live AV systems','Stage media systems','Video régie and touring systems']
    });
  }
  if (route.startsWith('projects/')) {
    graph.push({ '@type':'CreativeWork', '@id':canonical+'#work', url:canonical, name:p.title.replace(/ — DATA C0RE.*$/,''), description:p.description, creator:{'@id':ROOT+'#data-c0re'}, image:ogImage, inLanguage:['en','fr','es'] });
  }

  const ld=document.createElement('script');
  ld.type='application/ld+json'; ld.dataset.seoJsonld='true';
  ld.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph});
  document.head.appendChild(ld);
})();