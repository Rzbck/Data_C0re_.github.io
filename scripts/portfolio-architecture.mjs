import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, value) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (before !== value) fs.writeFileSync(file, value, 'utf8');
};
const replaceMain = (html, main) => html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/i, main);
const ensureCss = (html, href, marker) => {
  if (html.includes(marker)) return html;
  return html.replace('</head>', `<link rel="stylesheet" href="${href}" ${marker}>\n</head>`);
};
const setMeta = (html, { title, description, canonical, ogType = 'website' }) => {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:type" content="[^"]*">/i, `<meta property="og:type" content="${ogType}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`);
  return html;
};

// HOME — foreground realized work only.
{
  let html = read('index.html');
  const selected = `<section class="home-work"><div class="section-head reveal"><div><p class="eyebrow">Selected realized work</p><h2>Built, installed<br>and operated.</h2></div><a href="./work.html">Realized work ↗</a></div><div class="index-browser"><div class="index-list reveal">
<a class="index-row" href="./projects/lumina.html" data-preview-poster="./assets/media/lumina/tunnel-blue.webp" data-preview-video="./assets/media/lumina/experience-long.mp4?v=20260809-2"><span>01</span><div><strong>LUMINA / Geneva Lux</strong><small>collaborative public installation / structure / LED / realtime control</small></div><time>2025—27</time></a>
<a class="index-row" href="./projects/snake.html" data-preview-poster="./assets/media/snake/gameplay.webp" data-preview-video="./assets/media/snake/loop.mp4"><span>02</span><div><strong>Snake / Networked Retro System</strong><small>solo software / TouchDesigner / music sync / networked score</small></div><time>2026</time></a>
<a class="index-row" href="./projects/grand-theatre.html" data-preview-poster="./assets/media/grand-theatre/hero.webp" data-preview-video="./assets/media/grand-theatre/loop.mp4"><span>03</span><div><strong>Grand Théâtre de Genève</strong><small>professional / SMODE / projection integration / calibration</small></div><time>2023—24</time></a>
<a class="index-row" href="./projects/hardwinner.html" data-preview-poster="./assets/media/hardwinner/lbe-2018.webp" data-preview-videos="./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4"><span>04</span><div><strong>Hardwinner / Realtime AV Systems</strong><small>collaborative live systems / LED / DMX / GLSL / show control</small></div><time>2016—18</time></a>
<a class="index-row" href="./projects/comedie.html" data-preview-poster="./assets/media/comedie/venue.jpg" data-preview-video=""><span>05</span><div><strong>Comédie de Genève / Video Systems</strong><small>professional / theatre video / touring adaptation / operation</small></div><time>2021—23</time></a>
</div><figure class="index-preview index-preview--motion reveal" data-hover-preview-stage><img src="./assets/media/lumina/tunnel-blue.webp" alt="Selected realized project preview" data-hover-preview-poster><video muted loop playsinline preload="metadata" aria-hidden="true" data-hover-preview-video></video></figure></div></section>\n`;
  html = html.replace(/<section class="home-work">[\s\S]*?(?=<section class="home-direction">)/i, selected);
  write('index.html', html);
}

// WORK — only realized / delivered work.
{
  let html = read('work.html');
  html = setMeta(html, {
    title: 'Realized Work — Installations, Realtime AV, Projection & Video Systems — DATA C0RE',
    description: 'Realized projects by DATA C0RE across interactive software, public installation, realtime AV, theatre video, projection systems, LED, DMX and stage media.',
    canonical: 'https://datac0re.is-a.dev/work.html'
  });
  const main = `<main id="main">
<header class="page-intro reveal"><p class="eyebrow">Realized work / 2016—2026</p><h1>BUILT<br>WORK</h1><p>Realized projects across interactive software, public installation, live AV, theatre video, projection and stage systems.</p><div class="archive-shortcuts"><a href="archive.html">Project archive ↗</a><a href="lab.html">Simulation + R&amp;D ↗</a></div></header>

<section class="work-screen">
  <div class="work-screen-head reveal"><p>01 / Installation + software</p><h2>Systems made<br>to exist.</h2></div>
  <div class="index-browser"><div class="index-list reveal">
    <a class="index-row" href="./projects/lumina.html" data-work-preview-poster="./assets/media/lumina/tunnel-blue.webp" data-work-preview-video="./assets/media/lumina/experience-long.mp4?v=20260809-2"><span>01</span><div><strong>LUMINA / Geneva Lux</strong><small>REALIZED / collaborative public installation / realtime systems &amp; integration</small></div><time>2025—27</time></a>
    <a class="index-row" href="./projects/snake.html" data-work-preview-poster="./assets/media/snake/gameplay.webp" data-work-preview-video="./assets/media/snake/loop.mp4"><span>02</span><div><strong>Snake / Networked Retro System</strong><small>REALIZED / solo interactive software / TouchDesigner / networked score</small></div><time>2026</time></a>
  </div><figure class="index-preview index-preview--motion reveal" data-work-preview-stage><img src="./assets/media/lumina/tunnel-blue.webp" alt="Realized installation and software preview" data-work-preview-poster><video muted loop playsinline preload="auto" aria-hidden="true" data-work-preview-video></video></figure></div>
</section>

<section class="work-screen">
  <div class="work-screen-head reveal"><p>02 / Stage + institutional</p><h2>Projection<br>+ video systems.</h2></div>
  <div class="index-browser"><div class="index-list reveal">
    <a class="index-row" href="./projects/grand-theatre.html" data-work-preview-poster="./assets/media/grand-theatre/hero.webp" data-work-preview-video="./assets/media/grand-theatre/loop.mp4"><span>03</span><div><strong>Grand Théâtre de Genève</strong><small>REALIZED / SMODE / projection integration / cues / calibration</small></div><time>2023—24</time></a>
    <a class="index-row" href="./projects/comedie.html" data-work-preview-poster="./assets/media/comedie/venue.jpg" data-work-preview-video=""><span>04</span><div><strong>Comédie de Genève / Video Systems</strong><small>REALIZED / theatre video / creation / touring adaptation / operation</small></div><time>2021—23</time></a>
  </div><figure class="index-preview index-preview--motion reveal" data-work-preview-stage><img src="./assets/media/grand-theatre/hero.webp" alt="Stage and institutional systems preview" data-work-preview-poster><video muted loop playsinline preload="auto" aria-hidden="true" data-work-preview-video></video></figure></div>
</section>

<section class="work-screen">
  <div class="work-screen-head reveal"><p>03 / Live AV + stage systems</p><h2>Realtime systems<br>under show conditions.</h2></div>
  <div class="index-browser"><div class="index-list reveal">
    <a class="index-row" href="./projects/hardwinner.html" data-work-preview-poster="./assets/media/hardwinner/lbe-2018.webp" data-work-preview-videos="./assets/media/hardwinner/amen-loop.mp4|./assets/media/hardwinner/lbe-loop.mp4"><span>05</span><div><strong>Hardwinner / Realtime AV Systems</strong><small>REALIZED / collaborative AV / TouchDesigner / LED / DMX / GLSL</small></div><time>2016—18</time></a>
    <a class="index-row" href="./projects/stage-systems.html" data-work-preview-poster="./assets/media/stage/funradio-wide.webp" data-work-preview-videos="./assets/media/stage/funradio-loop.mp4|./assets/media/stage/national-radio-loop.mp4"><span>06</span><div><strong>Stage Systems / Fun Radio</strong><small>REALIZED / TouchDesigner / Resolume / LED / DMX / video-light sync</small></div><time>2016—17</time></a>
  </div><figure class="index-preview index-preview--motion reveal" data-work-preview-stage><img src="./assets/media/hardwinner/lbe-2018.webp" alt="Live audiovisual systems preview" data-work-preview-poster><video muted loop playsinline preload="auto" aria-hidden="true" data-work-preview-video></video></figure></div>
</section>
</main>`;
  html = replaceMain(html, main);
  html = ensureCss(html, 'assets/css/archive.css', 'data-archive-layout');
  write('work.html', html);
}

// LAB — research stays visible but clearly separated from realized work.
let labBase = read('lab.html');
{
  let html = labBase;
  html = setMeta(html, {
    title: 'Lab — Simulation, TouchDesigner, GLSL & Realtime Systems R&D — DATA C0RE',
    description: 'Simulation and research by DATA C0RE across spatial tracking, TouchDesigner, GLSL, realtime image systems, sensors, networks and interactive media.',
    canonical: 'https://datac0re.is-a.dev/lab.html'
  });
  const main = `<main id="main"><header class="page-intro reveal"><p class="eyebrow">Lab / simulation + R&amp;D</p><h1>SYSTEMS<br>IN DEVELOPMENT</h1><p>Technical simulations, image studies and experimental systems. Installed, staged and delivered projects remain in Work.</p><div class="archive-shortcuts"><a href="work.html">Realized work ↗</a><a href="archive.html">Full archive ↗</a></div></header>
<section class="archive-shell lab-archive">
  <div class="archive-year reveal"><div class="archive-year-head"><time>2026</time><span>Simulation / interaction</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/signal.html"><span class="archive-status status-simulation">SIMULATION</span><div><strong>SIGNAL / Spatial Interaction Simulator</strong><small>Godot / mmWave tracking model / WebSocket / TouchDesigner architecture / LED systems</small></div><time>2026</time></a>
    <a class="archive-entry" href="projects/ascii.html"><span class="archive-status status-study">STUDY</span><div><strong>ASCII / Pixel Realtime Study</strong><small>TouchDesigner / image reduction / computational portrait</small></div><time>2026</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2025—26</time><span>Realtime image systems</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/realtime.html"><span class="archive-status status-research">R&amp;D</span><div><strong>Realtime Studies</strong><small>audio-reactive behaviour / cellular systems / temporal image</small></div><time>2025—26</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2018</time><span>Image / shader study</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/cloud.html"><span class="archive-status status-study">STUDY</span><div><strong>Cloud Processing / Anisotropic GLSL</strong><small>TouchDesigner / GLSL / transformed timelapse</small></div><time>2018</time></a>
  </div></div>
</section></main>`;
  html = replaceMain(html, main);
  html = ensureCss(html, 'assets/css/archive.css', 'data-archive-layout');
  write('lab.html', html);
}

// ARCHIVE — chronological, status-led index. All entries remain separate case studies.
{
  let html = labBase;
  html = setMeta(html, {
    title: 'Project Archive — Realtime AV, Installations, Stage Systems & R&D — DATA C0RE',
    description: 'Chronological DATA C0RE project archive: realized installations and stage systems, interactive software, live AV, simulations and realtime media studies.',
    canonical: 'https://datac0re.is-a.dev/archive.html'
  });
  const main = `<main id="main"><header class="page-intro archive-intro reveal"><p class="eyebrow">Project archive / 2016—2026</p><h1>PROJECT<br>ARCHIVE</h1><p>A chronological record of realized work, systems, studies and simulations. Each project keeps its own case-study page as the archive grows.</p><div class="archive-legend"><span class="archive-status status-realized">REALIZED</span><span class="archive-status status-simulation">SIMULATION</span><span class="archive-status status-research">R&amp;D</span><span class="archive-status status-study">STUDY</span></div></header>
<section class="archive-shell">
  <div class="archive-year reveal"><div class="archive-year-head"><time>2026</time><span>Software / simulation / studies</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/snake.html"><span class="archive-status status-realized">REALIZED</span><div><strong>Snake / Networked Retro System</strong><small>solo interactive software / TouchDesigner / music sync / networked score</small></div><time>2026</time></a>
    <a class="archive-entry" href="projects/signal.html"><span class="archive-status status-simulation">SIMULATION</span><div><strong>SIGNAL / Spatial Interaction Simulator</strong><small>spatial tracking model / Godot / network architecture / TouchDesigner pipeline</small></div><time>2026</time></a>
    <a class="archive-entry" href="projects/ascii.html"><span class="archive-status status-study">STUDY</span><div><strong>ASCII / Pixel Realtime Study</strong><small>TouchDesigner / computational image reduction</small></div><time>2026</time></a>
    <a class="archive-entry" href="projects/realtime.html"><span class="archive-status status-research">R&amp;D</span><div><strong>Realtime Studies</strong><small>audio-reactive / cellular / temporal image systems</small></div><time>2025—26</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2025—27</time><span>Public installation</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/lumina.html"><span class="archive-status status-realized">REALIZED</span><div><strong>LUMINA / Geneva Lux</strong><small>collaborative installation / structure / LED / TouchDesigner / integration</small></div><time>2025—27</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2023—24</time><span>Opera / projection systems</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/grand-theatre.html"><span class="archive-status status-realized">REALIZED</span><div><strong>Grand Théâtre de Genève</strong><small>SMODE / projection integration / cues / geometry / calibration</small></div><time>2023—24</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2021—23</time><span>Theatre / touring video</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/comedie.html"><span class="archive-status status-realized">REALIZED</span><div><strong>Comédie de Genève / Video Systems</strong><small>creation / cameras / routing / projection / touring adaptation / operation</small></div><time>2021—23</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2018</time><span>Live AV / image study</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/cloud.html"><span class="archive-status status-study">STUDY</span><div><strong>Cloud Processing / Anisotropic GLSL</strong><small>solo visual study / TouchDesigner / GLSL</small></div><time>2018</time></a>
  </div></div>
  <div class="archive-year reveal"><div class="archive-year-head"><time>2016—18</time><span>Live AV / stage systems</span></div><div class="archive-list">
    <a class="archive-entry" href="projects/hardwinner.html"><span class="archive-status status-realized">REALIZED</span><div><strong>Hardwinner / Realtime AV Systems</strong><small>collaborative AV / simulation / LED / DMX / GLSL / show control</small></div><time>2016—18</time></a>
    <a class="archive-entry" href="projects/stage-systems.html"><span class="archive-status status-realized">REALIZED</span><div><strong>Stage Systems / Fun Radio</strong><small>TouchDesigner / Resolume / LED / DMX / video-light sync</small></div><time>2016—17</time></a>
  </div></div>
</section></main>`;
  html = replaceMain(html, main);
  html = ensureCss(html, 'assets/css/archive.css', 'data-archive-layout');
  write('archive.html', html);
}

// SIGNAL — anonymized simulation/R&D case study. No client, venue or deployment claim.
{
  let html = read('projects/realtime.html');
  html = setMeta(html, {
    title: 'SIGNAL — Spatial Tracking & Realtime LED System Simulation — DATA C0RE',
    description: 'Anonymized technical simulation for a spatial interaction system: Godot, mmWave tracking model, WebSocket data, TouchDesigner architecture and distributed LED behaviour.',
    canonical: 'https://datac0re.is-a.dev/projects/signal.html',
    ogType: 'article'
  });
  html = html.replace(/<link rel="stylesheet" href="assets\/css\/realtime-page\.css"[^>]*>\s*/i, '');
  html = ensureCss(html, 'assets/css/archive.css', 'data-archive-layout');
  html = html.replace(/<body class="[^"]*">/i, '<body class="signal-page">');
  const main = `<main><article>
<header class="project-hero signal-hero"><div class="project-hero-copy reveal"><div><p class="eyebrow accent-acid">Simulation / R&amp;D / 2026</p><h1>SIGNAL<br>Spatial System</h1></div><p class="project-intent">A technical simulation for a spatial interaction system in which human movement becomes realtime data, then behaviour distributed across LED surfaces.</p></div><div class="project-facts reveal"><span><b>Status</b> simulation only / not installed</span><span><b>Role</b> system design / simulator / realtime architecture</span><span><b>Tools</b> Godot / GDScript / mmWave / WebSocket / TouchDesigner / Art-Net</span></div><figure class="project-hero-media signal-hero-system reveal" aria-label="Target realtime pipeline"><div class="signal-node"><b>01</b><span>mmWave<br>tracking</span></div><i>→</i><div class="signal-node"><b>02</b><span>network<br>bridge</span></div><i>→</i><div class="signal-node"><b>03</b><span>spatial<br>data</span></div><i>→</i><div class="signal-node"><b>04</b><span>TouchDesigner<br>behaviour</span></div><i>→</i><div class="signal-node"><b>05</b><span>LED<br>output</span></div></figure></header>
<section class="project-section"><div class="section-kicker reveal"><span>A</span><p>System idea</p></div><div class="project-grid reveal"><article><h2>Movement becomes signal.</h2><p>The system is conceived around people moving through a physical zone. Radar observations describe position and motion without relying on a camera image. Those measurements are turned into a shared realtime state that can influence text, motion, intensity and other behaviours across multiple outputs.</p></article><article><h3>Readable at two levels</h3><p>For a visitor, the idea is simple: movement changes the environment. Technically, the work is a distributed sensing, networking and realtime-rendering pipeline.</p></article></div></section>
<section class="project-section signal-simulation"><div class="section-kicker reveal"><span>B</span><p>Simulation layer</p></div><div class="project-grid reveal"><article><h2>Godot as a design instrument.</h2><p>The current project is a simulator, not a documentation of an installed work. It models people, sensor coverage, spatial sectors and distributed LED surfaces so interaction logic can be tested before hardware deployment.</p></article><article><h3>What is already testable</h3><p>Multi-target movement, overlapping sensing zones, screen influence, crowd states, network packets, project configurations and runtime performance can all be explored inside the simulation.</p></article></div></section>
<section class="project-section"><div class="section-kicker reveal"><span>C</span><p>Target realtime pipeline</p></div><div class="signal-tech-grid reveal"><article><b>SENSING</b><h3>mmWave radar</h3><p>Multiple 24 GHz tracking modules provide position and movement observations at sensor rate.</p></article><article><b>EDGE / NETWORK</b><h3>ESP32 + Ethernet target</h3><p>A network bridge is planned to collect sensor data and expose a stable stream. Exact hardware remains part of the implementation phase.</p></article><article><b>DATA</b><h3>WebSocket / JSON</h3><p>The simulator already defines a network contract separating raw observations, spatial tracks and output states.</p></article><article><b>REALTIME</b><h3>TouchDesigner</h3><p>TouchDesigner remains the intended final realtime layer for behaviour, rendering, mapping and system monitoring.</p></article><article><b>OUTPUT</b><h3>Art-Net / LED</h3><p>The target output is a set of distributed LED surfaces addressed through a final pixel-mapping and Art-Net stage.</p></article></div></section>
<section class="project-section signal-status"><div class="section-kicker reveal"><span>D</span><p>Current state</p></div><div class="project-grid reveal"><article><h2>Simulation first.</h2><p>No physical installation is claimed here. The current value of SIGNAL is the system model: interaction logic, sensing assumptions, data architecture, visualisation and performance testing are being developed before an eventual in-situ implementation.</p></article><article><h3>Portfolio status</h3><p>R&amp;D / technical simulation. Client, venue and deployment details are intentionally absent.</p></article></div></section>
<nav class="project-next"><a href="lab.html"><span>Back</span><b>Lab / R&amp;D</b></a><a href="archive.html"><span>Archive</span><b>All projects</b></a></nav>
</article></main>`;
  html = replaceMain(html, main);
  write('projects/signal.html', html);
}

console.log('Portfolio architecture applied: realized Work, chronological Archive, separated Lab, anonymized SIGNAL simulation.');
