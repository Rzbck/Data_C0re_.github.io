import fs from 'node:fs';

const pages=[
  ['projects/grand-theatre.html','en'],
  ['en/projects/grand-theatre.html','en'],
  ['fr/projects/grand-theatre.html','fr'],
  ['es/projects/grand-theatre.html','es']
];

const copy={
  en:{
    title:'Grand Théâtre de Genève — Video Systems, Projection Mapping & SMODE — DATA C0RE',
    desc:'Selected Grand Théâtre de Genève video work: SMODE floor projection, moving-stage mapping, cue integration and takeover of a complex multi-output media architecture.',
    eyebrow:'Professional / institutional / selected systems / 2023—2025',
    intent:'Projection systems for opera and ballet, from spatial calibration and moving-stage mapping to takeover of complex inherited media architectures.',
    role:'SMODE Programmer / Video Systems & Projection Integration',scope:'projection mapping / cue integration / system takeover',context:'opera / ballet / large-scale stage video',
    boleroRole:'SMODE / FLOOR PROJECTION',
    boleroText:'Operational reprise, mapping and calibration of the Geneva floor-projection system in SMODE. GTG documentation specifies two 21K projectors, fixed 0.8 optics, fibre feeds and a shared overlap requiring on-site alignment.',
    boleroNote:'Original work: concept & choreography Damien Jalet / Sidi Larbi Cherkaoui; concept & set Marina Abramović; video reprise Anouar Brissel.',
    donRole:'VIDEO SYSTEMS / MOVING-STAGE MAPPING',
    donText:'Mapping and cue integration across a four-projector system, including a 10K laser projector mounted on the rotating stage structure. Rehearsal cue sheets combine front, rear/onboard and upstage projection through more than fifty video states.',
    donNote:'Set design & videos Momme Hinrichs. My contribution: technical video integration, mapping, cues and rehearsal-stage operation.',
    aaipRole:'SYSTEM TAKEOVER / LARGE-SCALE MAPPING',
    aaipText:'Takeover of an existing projection-heavy system for the final December 2025 performances: understanding the inherited media/network architecture, restoring a reliable show state, troubleshooting and operating a multi-output mapping system without redesigning it.',
    aaipNote:'Video design 59 Studio; video collaborator Jon Lyle. My contribution: system takeover, troubleshooting, mapping and final-run operation.',
    source:'Official production page ↗',
    overview1:'floor projection / SMODE / calibration',overview2:'moving stage / onboard projection / cues',overview3:'media architecture / multi-output mapping',
    architecture:'Inherited system',network:'media / network',output:'multi-output',mapping:'large-scale mapping',run:'final run · Dec. 2025'
  },
  fr:{
    title:'Grand Théâtre de Genève — Systèmes vidéo, mapping & SMODE — DATA C0RE',
    desc:'Sélection de travaux vidéo au Grand Théâtre de Genève : projection au sol sous SMODE, mapping de scénographie mobile, intégration de cues et reprise d’une architecture média multi-sorties complexe.',
    eyebrow:'Professionnel / institutionnel / systèmes sélectionnés / 2023—2025',
    intent:'Systèmes de projection pour l’opéra et le ballet : calibration spatiale, mapping de scénographie mobile et reprise d’architectures média complexes existantes.',
    role:'Programmation SMODE / Intégration systèmes vidéo & projection',scope:'mapping projection / intégration cues / reprise système',context:'opéra / ballet / vidéo scénique grand format',
    boleroRole:'SMODE / PROJECTION AU SOL',
    boleroText:'Reprise opérationnelle, mapping et calibration du système de projection au sol pour Genève dans SMODE. La documentation GTG précise deux vidéoprojecteurs 21K, des optiques fixes 0.8, des liaisons fibre et un overlap commun à aligner sur site.',
    boleroNote:'Œuvre : concept & chorégraphie Damien Jalet / Sidi Larbi Cherkaoui ; concept & scénographie Marina Abramović ; reprise vidéo Anouar Brissel.',
    donRole:'SYSTÈMES VIDÉO / MAPPING SCÉNOGRAPHIE MOBILE',
    donText:'Mapping et intégration des cues d’un système à quatre vidéoprojecteurs, dont un laser 10K embarqué sur la tournette. Les conduites de répétition combinent projection face, rétro/embarquée et lointain sur plus de cinquante états vidéo.',
    donNote:'Scénographie & vidéos Momme Hinrichs. Ma contribution : intégration vidéo technique, mapping, cues et travail en répétition.',
    aaipRole:'REPRISE SYSTÈME / MAPPING GRAND FORMAT',
    aaipText:'Reprise d’un système de projection existant pour les dernières représentations de décembre 2025 : compréhension de l’architecture média/réseau héritée, remise en état fiable, dépannage et exploitation d’un mapping multi-sorties sans redessiner le système.',
    aaipNote:'Création vidéo 59 Studio ; collaborateur vidéo Jon Lyle. Ma contribution : reprise système, dépannage, mapping et exploitation de fin de série.',
    source:'Page officielle de la production ↗',
    overview1:'projection au sol / SMODE / calibration',overview2:'tournette / projection embarquée / cues',overview3:'architecture média / mapping multi-sorties',
    architecture:'Système repris',network:'média / réseau',output:'multi-sorties',mapping:'mapping grand format',run:'fin de série · déc. 2025'
  },
  es:{
    title:'Grand Théâtre de Genève — Sistemas de vídeo, mapping y SMODE — DATA C0RE',
    desc:'Selección de trabajo de vídeo en el Grand Théâtre de Genève: proyección de suelo en SMODE, mapping de escenografía móvil, integración de cues y toma de control de una arquitectura multimedia compleja.',
    eyebrow:'Profesional / institucional / sistemas seleccionados / 2023—2025',
    intent:'Sistemas de proyección para ópera y ballet: calibración espacial, mapping sobre escenografía móvil y toma de control de arquitecturas multimedia complejas ya existentes.',
    role:'Programación SMODE / Integración de sistemas de vídeo y proyección',scope:'projection mapping / integración de cues / system takeover',context:'ópera / ballet / vídeo escénico a gran escala',
    boleroRole:'SMODE / PROYECCIÓN SOBRE SUELO',
    boleroText:'Reposición operativa, mapping y calibración en SMODE del sistema de proyección sobre suelo para Ginebra. La documentación del GTG especifica dos proyectores 21K, ópticas fijas 0.8, enlaces por fibra y un solape común que debía alinearse in situ.',
    boleroNote:'Obra: concepto y coreografía Damien Jalet / Sidi Larbi Cherkaoui; concepto y escenografía Marina Abramović; reposición de vídeo Anouar Brissel.',
    donRole:'SISTEMAS DE VÍDEO / MAPPING DE ESCENOGRAFÍA MÓVIL',
    donText:'Mapping e integración de cues de un sistema de cuatro proyectores, incluido un láser 10K embarcado en la plataforma giratoria. Las conducciones de ensayo combinan proyección frontal, trasera/embarcada y de fondo en más de cincuenta estados de vídeo.',
    donNote:'Escenografía y vídeos Momme Hinrichs. Mi contribución: integración técnica de vídeo, mapping, cues y trabajo durante los ensayos.',
    aaipRole:'SYSTEM TAKEOVER / MAPPING A GRAN ESCALA',
    aaipText:'Toma de control de un sistema de proyección existente para las últimas funciones de diciembre de 2025: comprensión de la arquitectura multimedia/red heredada, recuperación de un estado fiable, troubleshooting y operación de un mapping multi-salida sin rediseñar el sistema.',
    aaipNote:'Diseño de vídeo 59 Studio; colaborador de vídeo Jon Lyle. Mi contribución: toma de control del sistema, troubleshooting, mapping y operación de las últimas funciones.',
    source:'Página oficial de la producción ↗',
    overview1:'proyección de suelo / SMODE / calibración',overview2:'plataforma giratoria / proyección embarcada / cues',overview3:'arquitectura multimedia / mapping multi-salida',
    architecture:'Sistema heredado',network:'media / red',output:'multi-salida',mapping:'mapping gran formato',run:'últimas funciones · dic. 2025'
  }
};

const style=`<style data-gtg-gallery-v3="">
body.gtg-page{overflow-x:hidden}
body.gtg-page .project-hero{padding-top:clamp(92px,7vw,120px);padding-bottom:clamp(30px,4vw,54px)}
body.gtg-page .project-hero-copy{grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:clamp(26px,4vw,64px);align-items:end}
body.gtg-page .project-hero h1{font-size:clamp(56px,7.7vw,120px)}
body.gtg-page .project-intent{font-size:clamp(16px,1.25vw,21px);max-width:620px}
body.gtg-page .project-facts{margin:24px 0 0}
.gtg-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:20px}
.gtg-overview a{min-width:0;padding:16px 16px 18px;border-right:1px solid var(--line);transition:background .2s,color .2s}
.gtg-overview a:first-child{padding-left:0}.gtg-overview a:last-child{border-right:0}
.gtg-overview span,.gtg-overview small{display:block;color:var(--grey);font-size:8px;line-height:1.35;text-transform:uppercase;letter-spacing:.08em}
.gtg-overview strong{display:block;margin:7px 0 9px;font-size:clamp(18px,1.55vw,26px);line-height:1.02;letter-spacing:-.035em}
.gtg-overview a:hover,.gtg-overview a:focus-visible{background:#0d0d0d}.gtg-overview a:hover strong,.gtg-overview a:focus-visible strong{color:var(--acid)}
.gtg-case{width:min(var(--max),100%);margin:0 auto;padding:clamp(44px,5vw,76px) var(--gutter);border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(270px,.7fr) minmax(0,1.3fr);gap:clamp(28px,4.5vw,72px);align-items:start}
.gtg-case-copy{position:sticky;top:calc(var(--header) + 26px);min-width:0}.gtg-index{margin:0 0 9px;color:var(--cyan);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.gtg-role{display:block;margin:0 0 11px;color:var(--acid);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.11em}.gtg-case h2{margin:0;font-size:clamp(36px,4.35vw,68px);line-height:.91;letter-spacing:-.055em}.gtg-case-copy>p{margin:18px 0 0;max-width:600px;color:#bbb9b3;font-size:clamp(14px,1vw,16px);line-height:1.54}.gtg-tech{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px}.gtg-tech span{border:1px solid var(--line);padding:7px 9px;color:#aaa8a2;font-size:7.8px;line-height:1.2;text-transform:uppercase;letter-spacing:.07em}.gtg-tech strong{color:var(--paper);font-weight:800}
.gtg-case-media{min-width:0}.gtg-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.gtg-gallery figure{margin:0;min-width:0;background:#020202;overflow:hidden}.gtg-gallery img{width:100%;aspect-ratio:16/10;object-fit:contain;background:#030303}.gtg-gallery figure.gtg-wide{grid-column:1/-1}.gtg-gallery figure.gtg-wide img{aspect-ratio:16/7.6}.gtg-gallery figure.gtg-techview img{object-fit:contain;background:#090909}.gtg-gallery figcaption{padding-top:6px;color:var(--grey);font-size:7.5px;line-height:1.35;text-transform:uppercase;letter-spacing:.065em}.gtg-gallery figcaption a:hover{color:var(--acid)}.gtg-credit{margin:12px 0 0;padding-left:10px;border-left:2px solid var(--magenta);color:#8f8d87;font-size:9px;line-height:1.45;max-width:900px}
.gtg-system-diagram{margin-top:9px;border:1px solid var(--line);padding:12px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:7px;align-items:center;background:#090909}.gtg-system-diagram span{border:1px solid rgba(243,241,235,.12);padding:10px 9px;min-height:58px;display:flex;align-items:center;color:#bbb9b3;font-size:7.5px;line-height:1.35;text-transform:uppercase;letter-spacing:.065em}.gtg-system-diagram b{color:var(--acid);font-size:10px}
@media(max-width:980px){body.gtg-page .project-hero-copy{grid-template-columns:1fr}.gtg-case{grid-template-columns:1fr;gap:22px}.gtg-case-copy{position:static}}
@media(max-width:760px){body.gtg-page .project-facts{grid-template-columns:1fr}.gtg-overview{grid-template-columns:1fr}.gtg-overview a{border-right:0;border-bottom:1px solid var(--line);padding-left:0}.gtg-overview a:last-child{border-bottom:0}.gtg-overview strong{font-size:21px}.gtg-gallery{grid-template-columns:1fr 1fr}}
@media(max-width:620px){body.gtg-page .project-hero{padding-top:84px;padding-bottom:28px}body.gtg-page .project-hero h1{font-size:clamp(46px,14.5vw,70px);line-height:.88}body.gtg-page .project-intent{font-size:15px;line-height:1.48}.gtg-case{padding-top:34px;padding-bottom:38px}.gtg-case h2{font-size:clamp(34px,10.5vw,52px)}.gtg-case-copy>p{font-size:14px;margin-top:15px}.gtg-gallery{grid-template-columns:1fr;gap:9px}.gtg-gallery figure.gtg-wide{grid-column:auto}.gtg-gallery img,.gtg-gallery figure.gtg-wide img{aspect-ratio:4/3}.gtg-system-diagram{grid-template-columns:1fr;gap:5px}.gtg-system-diagram b{transform:rotate(90deg);justify-self:center}.gtg-system-diagram span{min-height:0}}
</style>`;

function body(c){return `
<header class="project-hero">
  <div class="project-hero-copy reveal"><div><p class="eyebrow accent-cyan">${c.eyebrow}</p><h1>Grand Théâtre<br>de Genève</h1></div><p class="project-intent">${c.intent}</p></div>
  <div class="project-facts reveal"><span><b>Role</b> ${c.role}</span><span><b>Scope</b> ${c.scope}</span><span><b>Context</b> ${c.context}</span></div>
  <div class="gtg-overview reveal" aria-label="Selected productions"><a href="#bolero"><span>01 / 2023</span><strong>Boléro / Éléments</strong><small>${c.overview1}</small></a><a href="#don-carlos"><span>02 / 2023</span><strong>Don Carlos</strong><small>${c.overview2}</small></a><a href="#aaip"><span>03 / 2025</span><strong>Un Américain à Paris</strong><small>${c.overview3}</small></a></div>
</header>
<section class="gtg-case" id="bolero">
  <div class="gtg-case-copy reveal"><p class="gtg-index">01 / 2023</p><span class="gtg-role">${c.boleroRole}</span><h2>Boléro /<br>Éléments</h2><p>${c.boleroText}</p><div class="gtg-tech"><span><strong>2 × 21K</strong> / VP</span><span><strong>0.8</strong> / optics</span><span><strong>SMODE</strong></span><span><strong>Fibre</strong></span><span>soft-edge / calibration</span></div></div>
  <div class="gtg-case-media reveal"><div class="gtg-gallery"><figure><img src="assets/media/grand-theatre/bolero-stage-01.jpg" alt="Boléro stage view at Grand Théâtre de Genève" loading="lazy"><figcaption>Boléro / Éléments — © GTG / Filip Van Roe</figcaption></figure><figure><img src="assets/media/grand-theatre/bolero-stage-02.jpg" alt="Boléro stage and mirrored scenic space at Grand Théâtre de Genève" loading="lazy"><figcaption>Boléro / Éléments — © GTG / Filip Van Roe</figcaption></figure><figure><img src="assets/media/grand-theatre/bolero-stage-03.jpg" alt="Boléro stage view at Grand Théâtre de Genève" loading="lazy"><figcaption>Boléro / Éléments — © GTG / Magali Dougados</figcaption></figure><figure class="gtg-techview"><img src="assets/media/grand-theatre/geometry.webp" alt="Projection geometry and alignment documentation for Boléro" loading="lazy"><figcaption>Projection geometry / alignment documentation · <a href="https://www.gtg.ch/saison-23-24/elements/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div><p class="gtg-credit">${c.boleroNote}</p></div>
</section>
<section class="gtg-case" id="don-carlos">
  <div class="gtg-case-copy reveal"><p class="gtg-index">02 / 2023</p><span class="gtg-role">${c.donRole}</span><h2>Don Carlos</h2><p>${c.donText}</p><div class="gtg-tech"><span><strong>4 VP</strong></span><span><strong>21K + 21K</strong> / face + rear</span><span><strong>10K laser</strong> / turntable</span><span><strong>NDI</strong></span><span><strong>50+</strong> / video states</span></div></div>
  <div class="gtg-case-media reveal"><div class="gtg-gallery"><figure class="gtg-wide"><img src="assets/media/grand-theatre/don-carlos-projection.jpg" alt="Don Carlos with projected scenic imagery" loading="lazy"><figcaption>Don Carlos — © GTG / Magali Dougados</figcaption></figure><figure><img src="assets/media/grand-theatre/don-carlos-stage-02.jpg" alt="Don Carlos stage system and projected scenic surface" loading="lazy"><figcaption>Don Carlos — © GTG / Magali Dougados</figcaption></figure><figure><img src="assets/media/grand-theatre/don-carlos-stage-03.jpg" alt="Don Carlos stage view with video-integrated scenography" loading="lazy"><figcaption>Don Carlos — © GTG / Magali Dougados · <a href="https://www.gtg.ch/saison-23-24/don-carlos/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div><p class="gtg-credit">${c.donNote}</p></div>
</section>
<section class="gtg-case" id="aaip">
  <div class="gtg-case-copy reveal"><p class="gtg-index">03 / 2025</p><span class="gtg-role">${c.aaipRole}</span><h2>Un Américain<br>à Paris</h2><p>${c.aaipText}</p><div class="gtg-tech"><span>${c.architecture}</span><span>${c.output}</span><span>${c.network}</span><span>${c.mapping}</span><span>${c.run}</span></div></div>
  <div class="gtg-case-media reveal"><div class="gtg-gallery"><figure><img src="assets/media/grand-theatre/aaip-video-01.jpg" alt="Un Américain à Paris with large projected Paris streetscape" loading="lazy"><figcaption>Un Américain à Paris — © GTG / Gregory Batardon</figcaption></figure><figure><img src="assets/media/grand-theatre/aaip-video-02.jpg" alt="Un Américain à Paris with large projected floral scenic image" loading="lazy"><figcaption>Un Américain à Paris — © GTG / Gregory Batardon</figcaption></figure><figure class="gtg-wide"><img src="assets/media/grand-theatre/aaip-video-03.jpg" alt="Un Américain à Paris stage environment integrating projection and mobile scenography" loading="lazy"><figcaption>Un Américain à Paris — © GTG / Gregory Batardon · <a href="https://www.gtg.ch/saison-25-26/un-americain-a-paris/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div><div class="gtg-system-diagram" aria-label="Simplified inherited media system flow"><span>${c.architecture}<br>show files / system state</span><b>→</b><span>${c.network}<br>routing / troubleshooting</span><b>→</b><span>${c.output}<br>${c.mapping}</span></div><p class="gtg-credit">${c.aaipNote}</p></div>
</section>`}

for(const [file,lang] of pages){
  if(!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const c=copy[lang]; let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${c.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${c.desc}">`)
    .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${c.title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${c.desc}">`)
    .replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="https://datac0re.is-a.dev/assets/media/grand-theatre/don-carlos-projection.jpg">`)
    .replace(/\n?<style data-gtg-(?:case-study-v1|repair-v2|gallery-v3)="">[\s\S]*?<\/style>/g,'')
    .replace('</head>',`${style}\n</head>`)
    .replace(/<body(?:\s+class="[^"]*")?([^>]*)>/,(_m,rest)=>`<body class="gtg-page" data-gtg-gallery-v3="1"${rest.replace(/\sdata-gtg-(?:case-study-v1|repair-v2|gallery-v3)="1"/g,'')}>`);
  const start=html.indexOf('<main><article>'); const nav=html.indexOf('<nav class="project-next">',start);
  if(start<0||nav<0) throw new Error(`Could not locate GTG body in ${file}`);
  html=html.slice(0,start+'<main><article>'.length)+body(c)+html.slice(nav);
  fs.writeFileSync(file,html); console.log(`Rebuilt ${file}`);
}

const fullpage='assets/js/fullpage.js';
let fp=fs.readFileSync(fullpage,'utf8');
fp=fp.replace("if(filename==='about.html')return;","if(filename==='about.html'||filename==='grand-theatre.html')return;");
if(!fp.includes("filename==='grand-theatre.html'")) throw new Error('GTG fullpage bypass missing');
fs.writeFileSync(fullpage,fp);
