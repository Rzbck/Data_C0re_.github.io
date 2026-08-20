import fs from 'node:fs';

const pages = [
  ['projects/grand-theatre.html', 'en'],
  ['en/projects/grand-theatre.html', 'en'],
  ['fr/projects/grand-theatre.html', 'fr'],
  ['es/projects/grand-theatre.html', 'es']
];

const copy = {
  en: {
    title:'Grand Théâtre de Genève — Video Systems, Projection Mapping & SMODE — DATA C0RE',
    desc:'Selected Grand Théâtre de Genève video work: SMODE floor projection, moving-stage mapping, cue integration and takeover of a complex multi-output media architecture.',
    eyebrow:'Professional / institutional / selected systems / 2023—2025',
    intent:'Projection systems for opera and ballet, from spatial calibration and moving-stage mapping to takeover of complex inherited media architectures.',
    role:'SMODE Programmer / Video Systems & Projection Integration',
    scope:'projection mapping / cue integration / system takeover',
    context:'opera / ballet / large-scale stage video',
    boleroRole:'SMODE / FLOOR PROJECTION',
    boleroText:'Operational reprise, mapping and calibration of the Geneva floor-projection system in SMODE. GTG documentation specifies two 21K projectors, fixed 0.8 optics, fibre feeds and a shared overlap requiring on-site alignment.',
    boleroCredit:'Boléro / Éléments — © GTG / Magali Dougados.',
    boleroNote:'Original work: concept & choreography Damien Jalet / Sidi Larbi Cherkaoui; concept & set Marina Abramović; video reprise Anouar Brissel.',
    donRole:'VIDEO SYSTEMS / MOVING-STAGE MAPPING',
    donText:'Mapping and cue integration across a four-projector system, including a 10K laser projector mounted on the rotating stage structure. Rehearsal cue sheets combine front, rear/onboard and upstage projection through more than fifty video states.',
    donCredit:'Don Carlos — © GTG / Magali Dougados.',
    donNote:'Set design & videos Momme Hinrichs. My contribution: technical video integration, mapping, cues and rehearsal-stage operation.',
    aaipRole:'SYSTEM TAKEOVER / LARGE-SCALE MAPPING',
    aaipText:'Takeover of an existing projection-heavy system for the final December 2025 performances: understanding the inherited media/network architecture, restoring a reliable show state, troubleshooting and operating a multi-output mapping system without redesigning it.',
    aaipCredit:'Un Américain à Paris — © GTG / Gregory Batardon.',
    aaipNote:'Video design 59 Studio; video collaborator Jon Lyle. My contribution: system takeover, troubleshooting, mapping and final-run operation.',
    process:'Small process documentation / backstage video integration',
    source:'Official production page ↗',
    architecture:'Inherited system', output:'Multi-output', network:'Media / network', mapping:'Large-scale mapping', run:'Final run · Dec. 2025'
  },
  fr: {
    title:'Grand Théâtre de Genève — Systèmes vidéo, mapping & SMODE — DATA C0RE',
    desc:'Sélection de travaux vidéo au Grand Théâtre de Genève : projection au sol sous SMODE, mapping de scénographie mobile, intégration de cues et reprise d’une architecture média multi-sorties complexe.',
    eyebrow:'Professionnel / institutionnel / systèmes sélectionnés / 2023—2025',
    intent:'Systèmes de projection pour l’opéra et le ballet : calibration spatiale, mapping de scénographie mobile et reprise d’architectures média complexes existantes.',
    role:'Programmation SMODE / Intégration systèmes vidéo & projection',
    scope:'mapping projection / intégration cues / reprise système',
    context:'opéra / ballet / vidéo scénique grand format',
    boleroRole:'SMODE / PROJECTION AU SOL',
    boleroText:'Reprise opérationnelle, mapping et calibration du système de projection au sol pour Genève dans SMODE. La documentation GTG précise deux vidéoprojecteurs 21K, des optiques fixes 0.8, des liaisons fibre et un overlap commun à aligner sur site.',
    boleroCredit:'Boléro / Éléments — © GTG / Magali Dougados.',
    boleroNote:'Œuvre : concept & chorégraphie Damien Jalet / Sidi Larbi Cherkaoui ; concept & scénographie Marina Abramović ; reprise vidéo Anouar Brissel.',
    donRole:'SYSTÈMES VIDÉO / MAPPING SCÉNOGRAPHIE MOBILE',
    donText:'Mapping et intégration des cues d’un système à quatre vidéoprojecteurs, dont un laser 10K embarqué sur la tournette. Les conduites de répétition combinent projection face, rétro/embarquée et lointain sur plus de cinquante états vidéo.',
    donCredit:'Don Carlos — © GTG / Magali Dougados.',
    donNote:'Scénographie & vidéos Momme Hinrichs. Ma contribution : intégration vidéo technique, mapping, cues et travail en répétition.',
    aaipRole:'REPRISE SYSTÈME / MAPPING GRAND FORMAT',
    aaipText:'Reprise d’un système de projection existant pour les dernières représentations de décembre 2025 : compréhension de l’architecture média/réseau héritée, remise en état fiable, dépannage et exploitation d’un mapping multi-sorties sans redessiner le système.',
    aaipCredit:'Un Américain à Paris — © GTG / Gregory Batardon.',
    aaipNote:'Création vidéo 59 Studio ; collaborateur vidéo Jon Lyle. Ma contribution : reprise système, dépannage, mapping et exploitation de fin de série.',
    process:'Documentation de travail / intégration vidéo en coulisse',
    source:'Page officielle de la production ↗',
    architecture:'Système repris', output:'Multi-sorties', network:'Média / réseau', mapping:'Mapping grand format', run:'Fin de série · déc. 2025'
  },
  es: {
    title:'Grand Théâtre de Genève — Sistemas de vídeo, mapping y SMODE — DATA C0RE',
    desc:'Selección de trabajo de vídeo en el Grand Théâtre de Genève: proyección de suelo en SMODE, mapping de escenografía móvil, integración de cues y toma de control de una arquitectura multimedia compleja.',
    eyebrow:'Profesional / institucional / sistemas seleccionados / 2023—2025',
    intent:'Sistemas de proyección para ópera y ballet: calibración espacial, mapping sobre escenografía móvil y toma de control de arquitecturas multimedia complejas ya existentes.',
    role:'Programación SMODE / Integración de sistemas de vídeo y proyección',
    scope:'projection mapping / integración de cues / system takeover',
    context:'ópera / ballet / vídeo escénico a gran escala',
    boleroRole:'SMODE / PROYECCIÓN SOBRE SUELO',
    boleroText:'Reposición operativa, mapping y calibración en SMODE del sistema de proyección sobre suelo para Ginebra. La documentación del GTG especifica dos proyectores 21K, ópticas fijas 0.8, enlaces por fibra y un solape común que debía alinearse in situ.',
    boleroCredit:'Boléro / Éléments — © GTG / Magali Dougados.',
    boleroNote:'Obra: concepto y coreografía Damien Jalet / Sidi Larbi Cherkaoui; concepto y escenografía Marina Abramović; reposición de vídeo Anouar Brissel.',
    donRole:'SISTEMAS DE VÍDEO / MAPPING DE ESCENOGRAFÍA MÓVIL',
    donText:'Mapping e integración de cues de un sistema de cuatro proyectores, incluido un láser 10K embarcado en la plataforma giratoria. Las conducciones de ensayo combinan proyección frontal, trasera/embarcada y de fondo en más de cincuenta estados de vídeo.',
    donCredit:'Don Carlos — © GTG / Magali Dougados.',
    donNote:'Escenografía y vídeos Momme Hinrichs. Mi contribución: integración técnica de vídeo, mapping, cues y trabajo durante los ensayos.',
    aaipRole:'SYSTEM TAKEOVER / MAPPING A GRAN ESCALA',
    aaipText:'Toma de control de un sistema de proyección existente para las últimas funciones de diciembre de 2025: comprensión de la arquitectura multimedia/red heredada, recuperación de un estado fiable, troubleshooting y operación de un mapping multi-salida sin rediseñar el sistema.',
    aaipCredit:'Un Américain à Paris — © GTG / Gregory Batardon.',
    aaipNote:'Diseño de vídeo 59 Studio; colaborador de vídeo Jon Lyle. Mi contribución: toma de control del sistema, troubleshooting, mapping y operación de las últimas funciones.',
    process:'Documentación de proceso / integración de vídeo backstage',
    source:'Página oficial de la producción ↗',
    architecture:'Sistema heredado', output:'Multi-salida', network:'Media / red', mapping:'Mapping gran formato', run:'Últimas funciones · dic. 2025'
  }
};

const style = `<style data-gtg-repair-v2="">
body.gtg-page{overflow-x:hidden}
body.gtg-page .project-hero{padding-top:clamp(96px,8vw,132px);padding-bottom:clamp(28px,3.5vw,48px)}
body.gtg-page .project-hero-copy{grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:clamp(28px,5vw,72px)}
body.gtg-page .project-hero h1{font-size:clamp(58px,8vw,126px)}
body.gtg-page .project-intent{font-size:clamp(16px,1.35vw,22px);max-width:620px}
body.gtg-page .project-facts{margin:28px 0 18px}
.gtg-hero-media{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(220px,.72fr);grid-template-rows:1fr 1fr;gap:8px;height:clamp(330px,47vh,560px);margin-top:18px}
.gtg-hero-media figure{position:relative;margin:0;min-width:0;overflow:hidden;background:#020202}
.gtg-hero-media .gtg-hero-main{grid-row:1/3}
.gtg-hero-media img{width:100%;height:100%;object-fit:cover;background:#020202}
.gtg-hero-media figcaption{position:absolute;left:8px;right:8px;bottom:7px;padding:5px 7px;background:rgba(4,4,4,.72);backdrop-filter:blur(6px);color:#d2d0ca;font-size:7.5px;line-height:1.25;text-transform:uppercase;letter-spacing:.07em}
.gtg-case{width:min(var(--max),100%);margin:0 auto;padding:clamp(44px,5.5vw,78px) var(--gutter);border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(280px,.78fr) minmax(0,1.22fr);gap:clamp(28px,5vw,82px);align-items:start}
.gtg-case-copy{min-width:0;position:sticky;top:calc(var(--header) + 28px)}
.gtg-index{margin:0 0 10px;color:var(--cyan);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}
.gtg-role{display:block;margin:0 0 12px;color:var(--acid);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.11em}
.gtg-case h2{margin:0;font-size:clamp(36px,4.6vw,70px);line-height:.91;letter-spacing:-.055em}
.gtg-case-copy>p{margin:20px 0 0;color:#bbb9b3;font-size:clamp(14px,1.05vw,16px);line-height:1.55;max-width:620px}
.gtg-tech{display:flex;flex-wrap:wrap;gap:6px;margin-top:20px}
.gtg-tech span{border:1px solid var(--line);padding:7px 9px;color:#aaa8a2;font-size:7.8px;line-height:1.2;text-transform:uppercase;letter-spacing:.07em}
.gtg-tech strong{color:var(--paper);font-weight:800}
.gtg-case-media{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;min-width:0}
.gtg-case-media figure{margin:0;min-width:0;background:#020202;overflow:hidden}
.gtg-case-media img{width:100%;aspect-ratio:16/10;object-fit:cover;background:#020202}
.gtg-case-media figcaption{padding-top:7px;color:var(--grey);font-size:7.8px;line-height:1.35;text-transform:uppercase;letter-spacing:.07em}
.gtg-case-media figcaption a:hover{color:var(--acid)}
.gtg-media-split{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(220px,.65fr);gap:10px;align-items:stretch}
.gtg-media-split figure{height:100%}
.gtg-media-split figure img{height:100%;min-height:280px;aspect-ratio:auto;object-fit:cover}
.gtg-media-split .gtg-technical img{object-fit:contain;background:#050505}
.gtg-credit{margin:2px 0 0;padding-left:10px;border-left:2px solid var(--magenta);color:#8f8d87;font-size:9px;line-height:1.45;max-width:920px}
.gtg-process-mini{display:grid;grid-template-columns:104px minmax(0,1fr);gap:12px;align-items:center;width:min(100%,340px);margin-top:22px;padding-top:12px;border-top:1px solid var(--line)}
.gtg-process-mini video{width:104px;aspect-ratio:16/10;object-fit:cover;background:#000}
.gtg-process-mini span{color:var(--grey);font-size:8px;line-height:1.4;text-transform:uppercase;letter-spacing:.075em}
.gtg-system-diagram{border:1px solid var(--line);padding:14px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;background:#090909}
.gtg-system-diagram span{border:1px solid rgba(243,241,235,.12);padding:12px 10px;min-height:68px;display:flex;align-items:center;color:#bbb9b3;font-size:8px;line-height:1.35;text-transform:uppercase;letter-spacing:.07em}
.gtg-system-diagram b{color:var(--acid);font-size:11px}
@media(max-width:900px){
  body.gtg-page .project-hero-copy{grid-template-columns:1fr}
  body.gtg-page .project-facts{grid-template-columns:1fr}
  body.gtg-page .project-facts span{border-right:0;border-bottom:1px solid var(--line);padding-left:0}
  body.gtg-page .project-facts span:last-child{border-bottom:0}
  .gtg-case{grid-template-columns:1fr;gap:22px}
  .gtg-case-copy{position:static}
  .gtg-media-split{grid-template-columns:minmax(0,1.4fr) minmax(180px,.6fr)}
}
@media(max-width:620px){
  body.gtg-page .project-hero{padding-top:88px;padding-bottom:26px}
  body.gtg-page .project-hero h1{font-size:clamp(48px,15vw,72px);line-height:.88}
  body.gtg-page .project-intent{font-size:15px;line-height:1.48}
  .gtg-hero-media{height:auto;grid-template-columns:1fr 1fr;grid-template-rows:auto;gap:6px}
  .gtg-hero-media .gtg-hero-main{grid-column:1/3;grid-row:auto;height:52vw;min-height:210px;max-height:330px}
  .gtg-hero-media figure:not(.gtg-hero-main){height:34vw;min-height:135px;max-height:220px}
  .gtg-hero-media figcaption{font-size:6.8px;left:5px;right:5px;bottom:5px}
  .gtg-case{padding-top:34px;padding-bottom:38px}
  .gtg-case h2{font-size:clamp(36px,11vw,54px)}
  .gtg-case-copy>p{font-size:14px;margin-top:16px}
  .gtg-media-split{grid-template-columns:1fr}
  .gtg-media-split figure img{height:auto;min-height:0;aspect-ratio:4/3}
  .gtg-media-split .gtg-technical img{aspect-ratio:16/10;object-fit:contain}
  .gtg-case-media>figure>img{aspect-ratio:4/3}
  .gtg-system-diagram{grid-template-columns:1fr;gap:6px}
  .gtg-system-diagram b{transform:rotate(90deg);justify-self:center}
  .gtg-system-diagram span{min-height:0}
  .gtg-process-mini{grid-template-columns:88px minmax(0,1fr);width:100%}
  .gtg-process-mini video{width:88px}
}
</style>`;

function body(c){
return `
<header class="project-hero">
  <div class="project-hero-copy reveal"><div><p class="eyebrow accent-cyan">${c.eyebrow}</p><h1>Grand Théâtre<br>de Genève</h1></div><p class="project-intent">${c.intent}</p></div>
  <div class="project-facts reveal"><span><b>Role</b> ${c.role}</span><span><b>Scope</b> ${c.scope}</span><span><b>Context</b> ${c.context}</span></div>
  <div class="gtg-hero-media reveal" aria-label="Selected Grand Théâtre de Genève production systems">
    <figure class="gtg-hero-main"><img src="assets/media/grand-theatre/don-carlos-projection.jpg" alt="Don Carlos stage with projected forest imagery" loading="eager"><figcaption>Don Carlos / moving-stage video mapping / © GTG · Magali Dougados</figcaption></figure>
    <figure><img src="assets/media/grand-theatre/bolero-projection.jpg" alt="Boléro at the Grand Théâtre de Genève" loading="eager"><figcaption>Boléro / floor projection / © GTG · Magali Dougados</figcaption></figure>
    <figure><img src="assets/media/grand-theatre/aaip-projection.jpg" alt="Un Américain à Paris at the Grand Théâtre de Genève" loading="eager"><figcaption>Un Américain à Paris / projection system / © GTG · Gregory Batardon</figcaption></figure>
  </div>
</header>

<section class="gtg-case" id="bolero">
  <div class="gtg-case-copy reveal"><p class="gtg-index">01 / 2023</p><span class="gtg-role">${c.boleroRole}</span><h2>Boléro /<br>Éléments</h2><p>${c.boleroText}</p><div class="gtg-tech"><span><strong>2 × 21K</strong> / VP</span><span><strong>0.8</strong> / optics</span><span><strong>SMODE</strong></span><span><strong>Fibre</strong></span><span>soft-edge / calibration</span></div></div>
  <div class="gtg-case-media reveal"><div class="gtg-media-split"><figure><img src="assets/media/grand-theatre/bolero-projection.jpg" alt="Boléro stage image at Grand Théâtre de Genève" loading="lazy"><figcaption>${c.boleroCredit} <a href="https://www.gtg.ch/saison-23-24/elements/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure><figure class="gtg-technical"><img src="assets/media/grand-theatre/geometry.webp" alt="Projection geometry and alignment documentation" loading="lazy"><figcaption>Projection geometry / alignment documentation</figcaption></figure></div><p class="gtg-credit">${c.boleroNote}</p></div>
</section>

<section class="gtg-case" id="don-carlos">
  <div class="gtg-case-copy reveal"><p class="gtg-index">02 / 2023</p><span class="gtg-role">${c.donRole}</span><h2>Don Carlos</h2><p>${c.donText}</p><div class="gtg-tech"><span><strong>4 VP</strong></span><span><strong>21K + 21K</strong> / face + rear</span><span><strong>10K laser</strong> / turntable</span><span><strong>NDI</strong></span><span><strong>50+</strong> / video states</span></div><div class="gtg-process-mini"><video muted loop playsinline preload="metadata" poster="assets/media/grand-theatre/hero.webp" data-lazy-video><source data-src="assets/media/grand-theatre/loop.mp4" type="video/mp4"></video><span>${c.process}</span></div></div>
  <div class="gtg-case-media reveal"><figure><img src="assets/media/grand-theatre/don-carlos-projection.jpg" alt="Don Carlos with clearly visible projected scenic imagery" loading="lazy"><figcaption>${c.donCredit} <a href="https://www.gtg.ch/saison-23-24/don-carlos/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure><p class="gtg-credit">${c.donNote}</p></div>
</section>

<section class="gtg-case" id="aaip">
  <div class="gtg-case-copy reveal"><p class="gtg-index">03 / 2025</p><span class="gtg-role">${c.aaipRole}</span><h2>Un Américain<br>à Paris</h2><p>${c.aaipText}</p><div class="gtg-tech"><span>${c.architecture}</span><span>${c.output}</span><span>${c.network}</span><span>${c.mapping}</span><span>${c.run}</span></div></div>
  <div class="gtg-case-media reveal"><figure><img src="assets/media/grand-theatre/aaip-projection.jpg" alt="Un Américain à Paris stage environment with large-scale scenic projection" loading="lazy"><figcaption>${c.aaipCredit} <a href="https://www.gtg.ch/saison-25-26/un-americain-a-paris/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure><div class="gtg-system-diagram" aria-label="Simplified inherited media system flow"><span>${c.architecture}<br>system diagram / show files</span><b>→</b><span>${c.network}<br>routing / troubleshooting</span><b>→</b><span>${c.output}<br>${c.mapping}</span></div><p class="gtg-credit">${c.aaipNote}</p></div>
</section>
`;
}

for(const [file,lang] of pages){
  if(!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const c=copy[lang];
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${c.title}</title>`);
  html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${c.desc}">`);
  html=html.replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${c.title}">`);
  html=html.replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${c.desc}">`);
  html=html.replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="https://datac0re.is-a.dev/assets/media/grand-theatre/don-carlos-projection.jpg">`);
  html=html.replace(/\n?<style data-gtg-case-study-v1="">[\s\S]*?<\/style>/g,'');
  html=html.replace(/\n?<style data-gtg-repair-v2="">[\s\S]*?<\/style>/g,'');
  html=html.replace('</head>',`${style}\n</head>`);
  html=html.replace(/<body(?:\s+class="[^"]*")?([^>]*)>/,(_m,rest)=>`<body class="gtg-page" data-gtg-repair-v2="1"${rest.replace(/\sdata-gtg-(?:case-study-v1|repair-v2)="1"/g,'')}>`);
  const start=html.indexOf('<main><article>');
  const nav=html.indexOf('<nav class="project-next">',start);
  if(start<0||nav<0) throw new Error(`Could not locate GTG body in ${file}`);
  html=html.slice(0,start+'<main><article>'.length)+body(c)+html.slice(nav);
  fs.writeFileSync(file,html);
  console.log(`Rebuilt ${file}`);
}

const fullpage='assets/js/fullpage.js';
let fp=fs.readFileSync(fullpage,'utf8');
fp=fp.replace("if(filename==='about.html')return;","if(filename==='about.html'||filename==='grand-theatre.html')return;");
fs.writeFileSync(fullpage,fp);
console.log('Disabled fullpage navigation for grand-theatre.html');
