import fs from 'node:fs';

const pages = [
  ['projects/grand-theatre.html', 'en'],
  ['en/projects/grand-theatre.html', 'en'],
  ['fr/projects/grand-theatre.html', 'fr'],
  ['es/projects/grand-theatre.html', 'es']
];

const copy = {
  en: {
    title: 'Grand Théâtre de Genève — Video Systems, Projection Mapping & SMODE — DATA C0RE',
    description: 'Selected Grand Théâtre de Genève video-system work: SMODE floor projection, moving-stage mapping, cue integration and takeover of a complex multi-output media architecture.',
    eyebrow: 'Professional / institutional / selected systems / 2023—2025',
    intent: 'Large-scale stage video work where projection geometry, moving scenography and inherited media systems had to remain show-ready through rehearsal and performance conditions.',
    role: 'SMODE Programmer / Video Systems & Projection Integration',
    scope: 'projection mapping / cue integration / system takeover',
    context: 'opera / ballet / large-scale stage video',
    process: 'Process documentation / Grand Théâtre de Genève / video integration on stage',
    selected: 'Selected production systems',
    selectedText: 'Three productions, three different technical problems: monumental projection geometry, mapping on moving scenography, and takeover of an inherited multi-output media system.',
    boleroRole: 'SMODE / PROJECTION INTEGRATION',
    boleroText: 'For the 2023 Geneva reprise, I integrated and calibrated the floor-projection system in SMODE. GTG plans document two 21K projectors in top-down position; the technical handover specified fixed 0.8 optics, fibre feeds and an overlap to be checked in SMODE. My role was the operational reprise, mapping and calibration — not the original video design.',
    boleroCap: 'Boléro / Éléments — floor projection and mirrored scenography. © GTG / Filip Van Roe.',
    boleroCredit: 'Original work credits: concept & choreography Damien Jalet / Sidi Larbi Cherkaoui; concept & set Marina Abramović; video reprise Anouar Brissel.',
    boleroFacts: [['2 × 21K','Projectors'],['0.8','Optics'],['SMODE','Software'],['Fibre','Signal'],['2023','Year']],
    donRole: 'VIDEO SYSTEMS / MOVING-SCENE MAPPING',
    donText: 'During creation and rehearsals, I worked on mapping and cue integration for a four-projector video system, including projection onto the rotating stage structure. The initial brief lists 21K front and rear projectors plus a 10K laser projector onboard the turntable, linked over NDI. Later rehearsal cue sheets integrate front, onboard and upstage projection through more than fifty video states.',
    donCap: 'Don Carlos — video integrated into the production’s moving scenography. © GTG / Magali Dougados.',
    donCredit: 'Production credit: set design and videos Momme Hinrichs. My contribution was technical video integration, mapping, cue work and rehearsal-stage operation.',
    donFacts: [['4 VP','System'],['21K + 21K','Front / rear'],['10K laser','Turntable'],['NDI','Transport'],['50+','Video states']],
    aaipRole: 'SYSTEM TAKEOVER / LARGE-SCALE MAPPING',
    aaipText: 'For the final December 2025 run, I took over an existing large-scale video system rather than redesigning it: understanding the inherited media/network architecture, restoring it to a reliable show state and operating a projection-heavy production with many outputs and substantial mapping. The handover included the production’s AAIP System Diagram shared by the GTG video team.',
    aaipCap: 'Un Américain à Paris — projection-led scenic environment. © GTG / Gregory Batardon.',
    aaipCredit: 'Production credits: video design 59 Studio; video collaborator Jon Lyle. My contribution was system takeover, troubleshooting, mapping and final-run operation.',
    aaipFacts: [['Existing','Architecture'],['Multi-output','Outputs'],['Media / network','Network'],['Large-scale','Mapping'],['Dec. 2025','Run']],
    source: 'Official production source ↗'
  },
  fr: {
    title: 'Grand Théâtre de Genève — Systèmes vidéo, mapping & SMODE — DATA C0RE',
    description: 'Sélection de travaux vidéo au Grand Théâtre de Genève : projection au sol sous SMODE, mapping de scénographie mobile, intégration de cues et reprise d’une architecture média multi-sorties complexe.',
    eyebrow: 'Professionnel / institutionnel / systèmes sélectionnés / 2023—2025',
    intent: 'Des systèmes vidéo scéniques à grande échelle où géométrie de projection, scénographie mobile et architectures média reprises devaient rester fiables des répétitions aux représentations.',
    role: 'Programmation SMODE / Intégration systèmes vidéo & projection',
    scope: 'mapping projection / intégration cues / reprise système',
    context: 'opéra / ballet / vidéo scénique grand format',
    process: 'Documentation de travail / Grand Théâtre de Genève / intégration vidéo en scène',
    selected: 'Systèmes de production sélectionnés',
    selectedText: 'Trois productions, trois problèmes techniques distincts : géométrie de projection monumentale, mapping sur scénographie mobile et reprise d’un système média multi-sorties existant.',
    boleroRole: 'SMODE / INTÉGRATION PROJECTION',
    boleroText: 'Pour la reprise genevoise 2023, j’ai intégré et calibré le système de projection au sol dans SMODE. Les plans GTG documentent deux vidéoprojecteurs 21K en douche ; le passage technique précisait des optiques fixes 0.8, des liaisons fibre et un overlap à vérifier dans SMODE. Mon rôle concernait la reprise opérationnelle, le mapping et la calibration — pas la création vidéo originale.',
    boleroCap: 'Boléro / Éléments — projection au sol et scénographie miroir. © GTG / Filip Van Roe.',
    boleroCredit: 'Crédits de l’œuvre : concept & chorégraphie Damien Jalet / Sidi Larbi Cherkaoui ; concept & scénographie Marina Abramović ; reprise vidéo Anouar Brissel.',
    boleroFacts: [['2 × 21K','Projecteurs'],['0.8','Optiques'],['SMODE','Logiciel'],['Fibre','Signal'],['2023','Année']],
    donRole: 'SYSTÈMES VIDÉO / MAPPING SCÉNOGRAPHIE MOBILE',
    donText: 'Pendant la création et les répétitions, j’ai travaillé sur le mapping et l’intégration des cues d’un système à quatre vidéoprojecteurs, dont une projection embarquée sur la tournette. Le brief initial mentionne un 21K face, un 21K rétro et un laser 10K embarqué sur la tournette, avec des liaisons NDI. Les conduites de répétition intègrent ensuite projection face, embarquée et lointain sur plus de cinquante états vidéo.',
    donCap: 'Don Carlos — vidéo intégrée à la scénographie mobile de la production. © GTG / Magali Dougados.',
    donCredit: 'Crédit production : scénographie et vidéos Momme Hinrichs. Ma contribution : intégration vidéo technique, mapping, cues et travail en répétition.',
    donFacts: [['4 VP','Système'],['21K + 21K','Face / rétro'],['10K laser','Tournette'],['NDI','Transport'],['50+','États vidéo']],
    aaipRole: 'REPRISE SYSTÈME / MAPPING GRAND FORMAT',
    aaipText: 'Pour les dernières représentations de décembre 2025, j’ai repris un système vidéo grand format existant sans le redessiner : compréhension de l’architecture média/réseau héritée, remise en état de fonctionnement fiable et exploitation d’une production très projetée, avec de nombreuses sorties et un mapping conséquent. Le passage de relais comprenait le « AAIP System Diagram » transmis par l’équipe vidéo du GTG.',
    aaipCap: 'Un Américain à Paris — environnement scénique largement construit par la projection. © GTG / Gregory Batardon.',
    aaipCredit: 'Crédits production : création vidéo 59 Studio ; collaborateur vidéo Jon Lyle. Ma contribution : reprise système, dépannage, mapping et exploitation de fin de série.',
    aaipFacts: [['Existant','Architecture'],['Multi-sorties','Sorties'],['Média / réseau','Réseau'],['Grand format','Mapping'],['Déc. 2025','Série']],
    source: 'Source officielle de la production ↗'
  },
  es: {
    title: 'Grand Théâtre de Genève — Sistemas de vídeo, mapping y SMODE — DATA C0RE',
    description: 'Selección de trabajo de vídeo en el Grand Théâtre de Genève: proyección de suelo en SMODE, mapping de escenografía móvil, integración de cues y toma de control de una arquitectura multimedia compleja.',
    eyebrow: 'Profesional / institucional / sistemas seleccionados / 2023—2025',
    intent: 'Sistemas de vídeo escénico a gran escala donde la geometría de proyección, la escenografía móvil y las arquitecturas multimedia heredadas debían mantenerse fiables desde los ensayos hasta la función.',
    role: 'Programación SMODE / Integración de sistemas de vídeo y proyección',
    scope: 'projection mapping / integración de cues / system takeover',
    context: 'ópera / ballet / vídeo escénico a gran escala',
    process: 'Documentación de proceso / Grand Théâtre de Genève / integración de vídeo en escena',
    selected: 'Sistemas de producción seleccionados',
    selectedText: 'Tres producciones, tres problemas técnicos distintos: geometría de proyección monumental, mapping sobre escenografía móvil y toma de control de un sistema multimedia multi-salida existente.',
    boleroRole: 'SMODE / INTEGRACIÓN DE PROYECCIÓN',
    boleroText: 'Para la reposición de Ginebra de 2023 integré y calibré en SMODE el sistema de proyección sobre el suelo. Los planos del GTG documentan dos proyectores 21K en posición cenital; el traspaso técnico especificaba ópticas fijas 0.8, enlaces por fibra y un solape que debía verificarse en SMODE. Mi función fue la reposición operativa, el mapping y la calibración, no el diseño de vídeo original.',
    boleroCap: 'Boléro / Éléments — proyección sobre suelo y escenografía con espejo. © GTG / Filip Van Roe.',
    boleroCredit: 'Créditos de la obra: concepto y coreografía Damien Jalet / Sidi Larbi Cherkaoui; concepto y escenografía Marina Abramović; reposición de vídeo Anouar Brissel.',
    boleroFacts: [['2 × 21K','Proyectores'],['0.8','Ópticas'],['SMODE','Software'],['Fibra','Señal'],['2023','Año']],
    donRole: 'SISTEMAS DE VÍDEO / MAPPING DE ESCENOGRAFÍA MÓVIL',
    donText: 'Durante la creación y los ensayos trabajé en el mapping y la integración de cues de un sistema de cuatro proyectores, incluida una proyección embarcada sobre la plataforma giratoria. El brief inicial cita un 21K frontal, un 21K trasero y un láser 10K embarcado en la giratoria, enlazados por NDI. Las conducciones de ensayo integran después proyección frontal, embarcada y de fondo en más de cincuenta estados de vídeo.',
    donCap: 'Don Carlos — vídeo integrado en la escenografía móvil de la producción. © GTG / Magali Dougados.',
    donCredit: 'Crédito de producción: escenografía y vídeos Momme Hinrichs. Mi contribución: integración técnica de vídeo, mapping, cues y trabajo durante ensayos.',
    donFacts: [['4 VP','Sistema'],['21K + 21K','Frontal / trasero'],['10K láser','Giratoria'],['NDI','Transporte'],['50+','Estados vídeo']],
    aaipRole: 'SYSTEM TAKEOVER / MAPPING A GRAN ESCALA',
    aaipText: 'Para las últimas funciones de diciembre de 2025 tomé el control de un sistema de vídeo a gran escala ya existente, sin rediseñarlo: comprensión de la arquitectura multimedia/red heredada, recuperación de un estado de show fiable y operación de una producción muy basada en proyección, con numerosas salidas y un mapping importante. El traspaso incluía el « AAIP System Diagram » compartido por el equipo de vídeo del GTG.',
    aaipCap: 'Un Américain à Paris — entorno escénico construido en gran parte mediante proyección. © GTG / Gregory Batardon.',
    aaipCredit: 'Créditos de producción: diseño de vídeo 59 Studio; colaborador de vídeo Jon Lyle. Mi contribución: toma de control del sistema, troubleshooting, mapping y operación de las últimas funciones.',
    aaipFacts: [['Existente','Arquitectura'],['Multi-salida','Salidas'],['Media / red','Red'],['Gran escala','Mapping'],['Dic. 2025','Funciones']],
    source: 'Fuente oficial de la producción ↗'
  }
};

const css = `
<style data-gtg-case-study-v1="">
body.gtg-page .gtg-process{padding:0 clamp(20px,4vw,72px) clamp(34px,5vw,76px)}
body.gtg-page .gtg-process figure{margin:0;background:#020202}
body.gtg-page .gtg-process video{display:block;width:100%;aspect-ratio:16/9;max-height:72vh;object-fit:cover;background:#000}
body.gtg-page .gtg-process figcaption,body.gtg-page .gtg-show-media figcaption{padding-top:8px;color:var(--grey);font-size:8.5px;line-height:1.4;text-transform:uppercase;letter-spacing:.075em}
body.gtg-page .gtg-intro{border-top:1px solid var(--line);padding-top:clamp(34px,5vw,64px);padding-bottom:clamp(34px,5vw,64px)}
body.gtg-page .production-block{border-top:1px solid var(--line);padding:clamp(42px,6vw,82px) 0}
body.gtg-page .production-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.84fr);gap:clamp(28px,5vw,80px);align-items:end}
body.gtg-page .production-index{margin:0 0 12px;color:var(--cyan);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}
body.gtg-page .production-head h2{margin:0;font-size:clamp(38px,5vw,74px);line-height:.92;letter-spacing:-.055em}
body.gtg-page .production-role{display:block;margin-bottom:12px;color:var(--acid);font-size:9px;text-transform:uppercase;letter-spacing:.11em;font-weight:800}
body.gtg-page .production-head p{margin:0;color:#bbb9b3;font-size:clamp(14px,1.08vw,16px);line-height:1.52}
body.gtg-page .production-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:26px 0 18px}
body.gtg-page .production-facts div{padding:12px;border-right:1px solid var(--line)}
body.gtg-page .production-facts div:first-child{padding-left:0}body.gtg-page .production-facts div:last-child{border-right:0}
body.gtg-page .production-facts strong{display:block;font-size:clamp(16px,1.6vw,25px);line-height:1;letter-spacing:-.025em}
body.gtg-page .production-facts span{display:block;margin-top:6px;color:var(--grey);font-size:8px;line-height:1.3;text-transform:uppercase;letter-spacing:.075em}
body.gtg-page .gtg-show-media{margin-top:24px}
body.gtg-page .gtg-show-media figure{margin:0;background:#020202;overflow:hidden}
body.gtg-page .gtg-show-media img{display:block;width:100%;height:clamp(300px,48vw,690px);object-fit:cover;background:#020202}
body.gtg-page .gtg-show-media a{color:inherit;text-decoration:none}body.gtg-page .gtg-show-media a:hover{color:var(--acid)}
body.gtg-page .credit-note{margin:18px 0 0;padding-left:12px;border-left:2px solid var(--magenta);color:#aaa8a2;font-size:10.5px;line-height:1.5;max-width:900px}
body.gtg-page .credit-note strong{color:var(--paper)}
@media(max-width:900px){body.gtg-page .production-head{grid-template-columns:1fr}body.gtg-page .production-facts{grid-template-columns:repeat(2,minmax(0,1fr))}body.gtg-page .production-facts div{border-top:1px solid var(--line)}body.gtg-page .production-facts div:nth-child(even){border-right:0}}
@media(max-width:680px){body.gtg-page .gtg-process{padding-inline:18px}body.gtg-page .production-head h2{font-size:40px}body.gtg-page .gtg-show-media img{height:auto;aspect-ratio:4/3}body.gtg-page .production-facts{grid-template-columns:1fr 1fr}}
</style>`;

const facts = entries => `<div class="production-facts reveal">${entries.map(([value,label])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>`;

function body(c){
  return `
<header class="project-hero">
  <div class="project-hero-copy reveal"><div><p class="eyebrow accent-cyan">${c.eyebrow}</p><h1>Grand Théâtre<br>de Genève</h1></div><p class="project-intent">${c.intent}</p></div>
  <div class="project-facts reveal"><span><b>Role</b> ${c.role}</span><span><b>Scope</b> ${c.scope}</span><span><b>Context</b> ${c.context}</span></div>
</header>

<div class="gtg-process reveal"><figure><video muted loop playsinline poster="assets/media/grand-theatre/hero.webp" data-lazy-video><source data-src="assets/media/grand-theatre/loop.mp4" type="video/mp4"></video><figcaption>${c.process}</figcaption></figure></div>

<section class="project-section project-section--split gtg-intro"><div class="section-kicker reveal"><span>GTG</span><p>${c.selected}</p></div><div class="prose-large reveal"><h2>${c.selected}</h2><p>${c.selectedText}</p></div></section>

<section class="project-section">
  <article class="production-block" id="bolero">
    <p class="production-index reveal">01 / 2023</p>
    <div class="production-head reveal"><div><span class="production-role">${c.boleroRole}</span><h2>Boléro / Éléments</h2></div><p>${c.boleroText}</p></div>
    ${facts(c.boleroFacts)}
    <div class="gtg-show-media reveal"><figure><img src="assets/media/grand-theatre/bolero-filip-van-roe.jpg" alt="Boléro at Grand Théâtre de Genève with large-scale floor projection" loading="lazy"><figcaption>${c.boleroCap} <a href="https://www.gtg.ch/saison-23-24/elements/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div>
    <p class="credit-note reveal">${c.boleroCredit}</p>
  </article>

  <article class="production-block" id="don-carlos">
    <p class="production-index reveal">02 / 2023</p>
    <div class="production-head reveal"><div><span class="production-role">${c.donRole}</span><h2>Don Carlos</h2></div><p>${c.donText}</p></div>
    ${facts(c.donFacts)}
    <div class="gtg-show-media reveal"><figure><img src="assets/media/grand-theatre/don-carlos-gtg.jpg" alt="Don Carlos at Grand Théâtre de Genève with video integrated into the stage scenography" loading="lazy"><figcaption>${c.donCap} <a href="https://www.gtg.ch/saison-23-24/don-carlos/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div>
    <p class="credit-note reveal">${c.donCredit}</p>
  </article>

  <article class="production-block" id="aaip">
    <p class="production-index reveal">03 / 2025</p>
    <div class="production-head reveal"><div><span class="production-role">${c.aaipRole}</span><h2>Un Américain<br>à Paris</h2></div><p>${c.aaipText}</p></div>
    ${facts(c.aaipFacts)}
    <div class="gtg-show-media reveal"><figure><img src="assets/media/grand-theatre/aaip-gregory-batardon.jpg" alt="Un Américain à Paris at Grand Théâtre de Genève with projection-led scenic environment" loading="lazy"><figcaption>${c.aaipCap} <a href="https://www.gtg.ch/saison-25-26/un-americain-a-paris/" target="_blank" rel="noreferrer">${c.source}</a></figcaption></figure></div>
    <p class="credit-note reveal">${c.aaipCredit}</p>
  </article>
</section>
`;
}

for (const [file, lang] of pages) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const c = copy[lang];
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${c.title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${c.description}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${c.title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${c.description}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="https://datac0re.is-a.dev/assets/media/grand-theatre/bolero-filip-van-roe.jpg">');
  html = html.replace(/<body(?:\s+class="[^"]*")?([^>]*)>/, (_m, rest) => `<body class="gtg-page" data-gtg-case-study-v1="1"${rest}>`);
  html = html.replace(/\n?<style data-gtg-case-study-v1="">[\s\S]*?<\/style>/, '');
  html = html.replace('</head>', `${css}\n</head>`);
  const start = html.indexOf('<main><article>');
  const nav = html.indexOf('<nav class="project-next">', start);
  if (start < 0 || nav < 0) throw new Error(`Could not locate project body in ${file}`);
  const prefix = html.slice(0, start + '<main><article>'.length);
  const suffix = html.slice(nav);
  html = `${prefix}${body(c)}${suffix}`;
  fs.writeFileSync(file, html);
  console.log(`Updated ${file}`);
}
