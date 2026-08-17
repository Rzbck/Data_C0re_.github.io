import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const file = rel => path.join(ROOT, rel);

const configs = [
  {
    file: 'projects/signal.html',
    label: 'Current simulation / crowd flow',
    copy: 'Crowd movement crosses the current sensor-coverage model inside the Godot digital twin. This is a working simulation used to test presence, trajectories and spatial response before the physical installation exists.',
    meta: 'Godot / crowd simulation / sensor coverage / work in progress',
    aria: 'Current SIGNAL crowd-flow and sensor-coverage simulation'
  },
  {
    file: 'en/projects/signal.html',
    label: 'Current simulation / crowd flow',
    copy: 'Crowd movement crosses the current sensor-coverage model inside the Godot digital twin. This is a working simulation used to test presence, trajectories and spatial response before the physical installation exists.',
    meta: 'Godot / crowd simulation / sensor coverage / work in progress',
    aria: 'Current SIGNAL crowd-flow and sensor-coverage simulation'
  },
  {
    file: 'fr/projects/signal.html',
    label: 'Simulation actuelle / flux de foule',
    copy: 'Le mouvement de la foule traverse le modèle actuel de couverture des capteurs dans le jumeau numérique Godot. Cette simulation de travail sert à tester présences, trajectoires et réponse spatiale avant l’existence de l’installation physique.',
    meta: 'Godot / simulation de foule / couverture capteurs / en cours',
    aria: 'Simulation actuelle des flux de foule et de la couverture des capteurs de SIGNAL'
  },
  {
    file: 'es/projects/signal.html',
    label: 'Simulación actual / flujo de personas',
    copy: 'El movimiento de la multitud atraviesa el modelo actual de cobertura de sensores dentro del gemelo digital en Godot. Esta simulación de trabajo permite probar presencia, trayectorias y respuesta espacial antes de que exista la instalación física.',
    meta: 'Godot / simulación de multitudes / cobertura de sensores / en desarrollo',
    aria: 'Simulación actual de flujo de personas y cobertura de sensores de SIGNAL'
  }
];

const css = `
<style data-signal-video-feature>
.signal-page .signal-simulation-feature{padding-top:clamp(88px,9vw,148px);padding-bottom:clamp(88px,9vw,148px);border-top:1px solid var(--line)}
.signal-page .signal-simulation-grid{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(270px,.52fr);gap:clamp(34px,5.5vw,94px);align-items:end}
.signal-page .signal-simulation-media{position:relative;margin:0;min-width:0;background:#020202;border:1px solid var(--line);overflow:hidden}
.signal-page .signal-simulation-media::before{content:'SIM / LIVE MODEL';position:absolute;z-index:2;left:14px;top:13px;padding:6px 8px;background:rgba(7,7,7,.78);border:1px solid rgba(243,241,235,.18);color:var(--acid);font-size:8.5px;font-weight:800;line-height:1;letter-spacing:.11em;text-transform:uppercase;pointer-events:none}
.signal-page .signal-simulation-media video{display:block;width:100%;aspect-ratio:16/9;height:auto;object-fit:cover;background:#020202}
.signal-page .signal-simulation-caption{max-width:390px;padding-bottom:4px}
.signal-page .signal-simulation-caption .eyebrow{margin-bottom:17px}
.signal-page .signal-simulation-caption>p:not(.eyebrow){margin:0;color:#c6c4be;font-size:clamp(16px,1.12vw,20px);line-height:1.48}
.signal-page .signal-simulation-caption small{display:block;margin-top:clamp(24px,3vw,42px);padding-top:13px;border-top:1px solid var(--line);color:var(--grey);font-size:9px;line-height:1.45;letter-spacing:.09em;text-transform:uppercase}
@media(max-width:980px){
  .signal-page .signal-simulation-grid{grid-template-columns:1fr;gap:28px}
  .signal-page .signal-simulation-caption{max-width:720px;display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,.45fr);column-gap:34px;align-items:start}
  .signal-page .signal-simulation-caption .eyebrow{grid-column:1/-1}
  .signal-page .signal-simulation-caption small{margin-top:0}
}
@media(max-width:620px){
  .signal-page .signal-simulation-feature{padding-top:68px;padding-bottom:72px}
  .signal-page .signal-simulation-grid{gap:22px}
  .signal-page .signal-simulation-media{margin-left:calc(var(--gutter) * -.18);margin-right:calc(var(--gutter) * -.18)}
  .signal-page .signal-simulation-media::before{left:10px;top:10px;font-size:7.5px}
  .signal-page .signal-simulation-media video{aspect-ratio:16/10;object-fit:cover}
  .signal-page .signal-simulation-caption{display:block;max-width:none}
  .signal-page .signal-simulation-caption>p:not(.eyebrow){font-size:16px;line-height:1.5}
  .signal-page .signal-simulation-caption small{margin-top:20px}
}
@media(max-width:380px){
  .signal-page .signal-simulation-feature{padding-top:58px;padding-bottom:62px}
  .signal-page .signal-simulation-media video{aspect-ratio:4/3}
}
</style>`;

for (const c of configs) {
  if (!fs.existsSync(file(c.file))) continue;
  const html = fs.readFileSync(file(c.file), 'utf8');
  const $ = load(html, { decodeEntities: false });
  const hero = $('.signal-hero').first();
  if (!hero.length) continue;

  $('.signal-simulation-feature').remove();
  hero.after(`
<section class="project-section signal-simulation-feature" aria-label="${c.aria}">
  <div class="signal-simulation-grid reveal">
    <figure class="signal-simulation-media">
      <video muted loop playsinline preload="none" data-lazy-video data-signal-simulation-video aria-label="${c.aria}">
        <source data-src="assets/media/signal/simulation-loop.mp4?v=20260817-1" type="video/mp4">
      </video>
    </figure>
    <div class="signal-simulation-caption">
      <p class="eyebrow accent-acid">${c.label}</p>
      <p>${c.copy}</p>
      <small>${c.meta}</small>
    </div>
  </div>
</section>`);

  $('style[data-signal-video-feature]').remove();
  $('head').append(css);
  fs.writeFileSync(file(c.file), $.html(), 'utf8');
}

console.log('SIGNAL simulation video feature applied after hero for EN / FR / ES.');
