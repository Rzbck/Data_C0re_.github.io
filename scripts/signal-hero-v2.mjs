import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const file = rel => path.join(ROOT, rel);

const configs = [
  {
    file: 'projects/signal.html',
    eyebrow: 'Digital twin / spatial tracking / LED system / 2026',
    intent: 'SIGNAL is a digital twin for a future interactive LED installation. People are tracked with mmWave radar; their movement is simulated in Godot, then sent to TouchDesigner to drive distributed LED surfaces.',
    how: 'How SIGNAL works',
    phrase: 'Human movement → realtime light',
    aria: 'How SIGNAL works: tracking, digital twin and LED output',
    steps: [
      ['01 / SENSING', 'TRACK', 'mmWave radar / presence / position / movement'],
      ['02 / DIGITAL TWIN', 'TWIN', 'Godot / CAD + 3D / crowd / sensor fusion'],
      ['03 / REALTIME OUTPUT', 'DRIVE', 'TouchDesigner / pixel mapping / LED / Art-Net']
    ]
  },
  {
    file: 'en/projects/signal.html',
    eyebrow: 'Digital twin / spatial tracking / LED system / 2026',
    intent: 'SIGNAL is a digital twin for a future interactive LED installation. People are tracked with mmWave radar; their movement is simulated in Godot, then sent to TouchDesigner to drive distributed LED surfaces.',
    how: 'How SIGNAL works',
    phrase: 'Human movement → realtime light',
    aria: 'How SIGNAL works: tracking, digital twin and LED output',
    steps: [
      ['01 / SENSING', 'TRACK', 'mmWave radar / presence / position / movement'],
      ['02 / DIGITAL TWIN', 'TWIN', 'Godot / CAD + 3D / crowd / sensor fusion'],
      ['03 / REALTIME OUTPUT', 'DRIVE', 'TouchDesigner / pixel mapping / LED / Art-Net']
    ]
  },
  {
    file: 'fr/projects/signal.html',
    eyebrow: 'Jumeau numérique / tracking spatial / système LED / 2026',
    intent: 'SIGNAL est le jumeau numérique d’une future installation LED interactive. Les personnes sont suivies par radar mmWave ; leurs mouvements sont simulés dans Godot, puis transmis à TouchDesigner pour piloter des surfaces LED distribuées.',
    how: 'Comment fonctionne SIGNAL',
    phrase: 'Mouvement humain → lumière temps réel',
    aria: 'Fonctionnement de SIGNAL : tracking, jumeau numérique et sortie LED',
    steps: [
      ['01 / CAPTATION', 'TRACK', 'radar mmWave / présence / position / mouvement'],
      ['02 / JUMEAU NUMÉRIQUE', 'TWIN', 'Godot / CAD + 3D / foule / fusion capteurs'],
      ['03 / SORTIE TEMPS RÉEL', 'DRIVE', 'TouchDesigner / pixel mapping / LED / Art-Net']
    ]
  },
  {
    file: 'es/projects/signal.html',
    eyebrow: 'Gemelo digital / tracking espacial / sistema LED / 2026',
    intent: 'SIGNAL es el gemelo digital de una futura instalación LED interactiva. Las personas se rastrean con radar mmWave; su movimiento se simula en Godot y después se envía a TouchDesigner para controlar superficies LED distribuidas.',
    how: 'Cómo funciona SIGNAL',
    phrase: 'Movimiento humano → luz en tiempo real',
    aria: 'Funcionamiento de SIGNAL: tracking, gemelo digital y salida LED',
    steps: [
      ['01 / CAPTACIÓN', 'TRACK', 'radar mmWave / presencia / posición / movimiento'],
      ['02 / GEMELO DIGITAL', 'TWIN', 'Godot / CAD + 3D / multitudes / fusión de sensores'],
      ['03 / SALIDA EN TIEMPO REAL', 'DRIVE', 'TouchDesigner / pixel mapping / LED / Art-Net']
    ]
  }
];

const css = `
<style data-signal-hero-v2>
.signal-page .signal-hero--v2{min-height:100svh;display:flex;flex-direction:column;padding-top:clamp(112px,12vh,154px);padding-bottom:clamp(28px,4vh,48px)}
.signal-page .signal-hero--v2 .project-hero-copy{grid-template-columns:minmax(0,1.32fr) minmax(420px,.68fr);gap:clamp(54px,7vw,124px);align-items:end}
.signal-page .signal-hero--v2 .project-hero-copy>div{min-width:0}
.signal-page .signal-hero--v2 .eyebrow{margin-bottom:16px;font-size:clamp(10px,.7vw,12px)}
.signal-page .signal-hero--v2 h1{font-size:clamp(112px,11.4vw,218px);line-height:.74;letter-spacing:-.085em}
.signal-page .signal-hero--v2 .project-intent{max-width:700px;margin:0 0 10px;font-size:clamp(21px,1.42vw,30px);line-height:1.34;color:#d7d5cf}
.signal-page .signal-hero--v2 .project-facts{margin:clamp(28px,3.2vh,42px) 0 0}
.signal-page .signal-hero--v2 .project-facts span{padding-top:13px;padding-bottom:13px;font-size:clamp(9.5px,.62vw,11px)}
.signal-page .signal-hero-overview{flex:1;min-height:330px;margin-top:clamp(30px,4vh,52px);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.signal-page .signal-overview-head{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:28px;padding:12px 0;border-bottom:1px solid var(--line);font-size:10px;font-weight:800;line-height:1;text-transform:uppercase;letter-spacing:.1em;color:var(--grey)}
.signal-page .signal-overview-head span:first-child{color:var(--acid)}
.signal-page .signal-step{position:relative;min-width:0;padding:clamp(22px,2vw,34px);border-right:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;background:#080808}
.signal-page .signal-step:last-child{border-right:0}
.signal-page .signal-step:nth-child(3){background:#0a0a0a}
.signal-page .signal-step::after{content:attr(data-step);position:absolute;right:clamp(12px,1.4vw,24px);bottom:-.18em;font-size:clamp(100px,9vw,174px);font-weight:900;line-height:1;letter-spacing:-.08em;color:rgba(243,241,235,.035);pointer-events:none}
.signal-page .signal-step small{position:relative;z-index:1;color:var(--grey);font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
.signal-page .signal-step h2{position:relative;z-index:1;margin:24px 0 auto;font-size:clamp(58px,5.8vw,112px);font-weight:850;line-height:.78;letter-spacing:-.07em}
.signal-page .signal-step p{position:relative;z-index:1;max-width:360px;margin:28px 0 0;color:#aaa8a2;font-size:clamp(12px,.82vw,15px);line-height:1.42;text-transform:uppercase;letter-spacing:.045em}
.signal-page .signal-step:nth-child(2) h2{color:var(--acid)}
@media(max-width:1100px){
  .signal-page .signal-hero--v2{min-height:auto;padding-top:120px}
  .signal-page .signal-hero--v2 .project-hero-copy{grid-template-columns:1fr;gap:32px}
  .signal-page .signal-hero--v2 .project-intent{max-width:850px}
  .signal-page .signal-hero-overview{min-height:520px}
  .signal-page .signal-step h2{font-size:clamp(52px,7vw,86px)}
}
@media(max-width:760px){
  .signal-page .signal-hero--v2{padding-top:104px;padding-bottom:28px}
  .signal-page .signal-hero--v2 h1{font-size:clamp(82px,24vw,150px)}
  .signal-page .signal-hero--v2 .project-intent{font-size:20px}
  .signal-page .signal-hero--v2 .project-facts{grid-template-columns:1fr}
  .signal-page .signal-hero--v2 .project-facts span{border-right:0;border-bottom:1px solid var(--line);padding-left:0}
  .signal-page .signal-hero--v2 .project-facts span:last-child{border-bottom:0}
  .signal-page .signal-hero-overview{display:block;min-height:0;margin-top:34px}
  .signal-page .signal-overview-head{display:flex;padding:13px 0}
  .signal-page .signal-overview-head span:last-child{display:none}
  .signal-page .signal-step{min-height:260px;border-right:0;border-bottom:1px solid var(--line);padding:24px 0}
  .signal-page .signal-step:last-child{border-bottom:0}
  .signal-page .signal-step::after{right:0}
  .signal-page .signal-step h2{font-size:clamp(62px,19vw,104px)}
}
</style>`;

for (const c of configs) {
  if (!fs.existsSync(file(c.file))) continue;
  const html = fs.readFileSync(file(c.file), 'utf8');
  const $ = load(html, { decodeEntities: false });
  const hero = $('.signal-hero').first();
  if (!hero.length) continue;

  hero.addClass('signal-hero--v2');
  hero.find('.eyebrow').first().text(c.eyebrow);
  hero.find('.project-intent').first().text(c.intent);
  hero.find('.signal-hero-overview').remove();

  const steps = c.steps.map((step, index) => `
    <article class="signal-step" data-step="0${index + 1}">
      <small>${step[0]}</small>
      <h2>${step[1]}</h2>
      <p>${step[2]}</p>
    </article>`).join('');
  hero.append(`
  <section class="signal-hero-overview reveal" aria-label="${c.aria}">
    <div class="signal-overview-head"><span>${c.how}</span><span>${c.phrase}</span></div>${steps}
  </section>`);

  $('style[data-signal-hero-v2]').remove();
  $('head').append(css);
  fs.writeFileSync(file(c.file), $.html(), 'utf8');
}

console.log('SIGNAL hero V2 applied: full-screen hierarchy + TRACK / TWIN / DRIVE overview.');
