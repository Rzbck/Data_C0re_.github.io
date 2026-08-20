import fs from 'node:fs';

const pages = [
  ['projects/grand-theatre.html','en'],
  ['en/projects/grand-theatre.html','en'],
  ['fr/projects/grand-theatre.html','fr'],
  ['es/projects/grand-theatre.html','es']
];

const summaries = {
  en:'Selected work across three productions: floor-projection calibration, moving-stage mapping and takeover of an inherited multi-output media system.',
  fr:'Sélection de travail sur trois productions : calibration de projection au sol, mapping sur scénographie mobile et reprise d’un système média multi-sorties existant.',
  es:'Selección de trabajo en tres producciones: calibración de proyección de suelo, mapping sobre escenografía móvil y toma de control de un sistema multimedia multi-salida existente.'
};

const style = `<style data-gtg-paged-v4="">
html{scroll-snap-type:y mandatory;scroll-padding-top:0}
body.gtg-page{overflow-x:clip}
body.gtg-page main{overflow:visible}
body.gtg-page .project-hero,body.gtg-page .gtg-case{box-sizing:border-box;min-height:100svh;scroll-snap-align:start;scroll-snap-stop:always}
body.gtg-page .project-hero{display:flex;flex-direction:column;justify-content:center;padding-top:calc(var(--header) + 34px);padding-bottom:34px}
body.gtg-page .project-hero-copy{grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);gap:clamp(28px,5vw,78px);align-items:end}
body.gtg-page .project-hero h1{font-size:clamp(56px,7.8vw,122px)}
body.gtg-page .project-intent{font-size:clamp(16px,1.25vw,21px);max-width:620px}
body.gtg-page .project-facts{margin:24px 0 0}
.gtg-general-summary{margin:24px 0 0;padding-top:16px;border-top:1px solid var(--line);max-width:920px;color:#aaa8a2;font-size:clamp(12px,.95vw,15px);line-height:1.55}
.gtg-scroll-cue{margin:22px 0 0;color:var(--grey);font-size:8px;text-transform:uppercase;letter-spacing:.11em}
.gtg-case{width:min(var(--max),100%);margin:0 auto;padding:calc(var(--header) + 24px) var(--gutter) 24px;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(270px,.72fr) minmax(0,1.28fr);gap:clamp(28px,4.5vw,72px);align-items:center;align-content:center}
.gtg-case-copy{min-width:0}.gtg-index{margin:0 0 8px;color:var(--cyan);font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.gtg-role{display:block;margin:0 0 10px;color:var(--acid);font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.11em}.gtg-case h2{margin:0;font-size:clamp(34px,4.15vw,64px);line-height:.91;letter-spacing:-.052em}.gtg-case-copy>p{margin:16px 0 0;max-width:600px;color:#bbb9b3;font-size:clamp(13px,.98vw,15.5px);line-height:1.5}.gtg-tech{display:flex;flex-wrap:wrap;gap:5px;margin-top:16px}.gtg-tech span{border:1px solid var(--line);padding:6px 8px;color:#aaa8a2;font-size:7.3px;line-height:1.2;text-transform:uppercase;letter-spacing:.065em}.gtg-tech strong{color:var(--paper);font-weight:800}
.gtg-case-media{min-width:0}.gtg-gallery{height:clamp(260px,38vh,370px);display:grid;grid-template-columns:minmax(0,1.65fr) minmax(150px,.72fr);grid-template-rows:1fr 1fr;gap:7px}.gtg-gallery figure{position:relative;margin:0;min-width:0;min-height:0;background:#020202;overflow:hidden}.gtg-gallery figure:first-child{grid-row:1/3}.gtg-gallery img{display:block;width:100%;height:100%;object-fit:contain;background:#030303}.gtg-gallery figcaption{position:absolute;left:5px;right:5px;bottom:5px;padding:5px 6px;background:rgba(4,4,4,.76);backdrop-filter:blur(4px);color:#c6c4be;font-size:6.8px;line-height:1.28;text-transform:uppercase;letter-spacing:.06em}.gtg-gallery figcaption a:hover{color:var(--acid)}.gtg-credit{margin:10px 0 0;padding-left:9px;border-left:2px solid var(--magenta);color:#8f8d87;font-size:8.5px;line-height:1.4;max-width:900px}
.gtg-system-diagram{margin-top:8px;border:1px solid var(--line);padding:8px 9px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:6px;align-items:center;background:#090909}.gtg-system-diagram span{border:1px solid rgba(243,241,235,.1);padding:7px 8px;min-height:38px;display:flex;align-items:center;color:#aaa8a2;font-size:6.8px;line-height:1.25;text-transform:uppercase;letter-spacing:.06em}.gtg-system-diagram b{color:var(--acid);font-size:9px}
body.gtg-page .project-next{scroll-snap-align:end}
@media(max-width:980px){body.gtg-page .project-hero-copy{grid-template-columns:1fr}.gtg-case{grid-template-columns:1fr;gap:18px;align-content:center}.gtg-gallery{height:clamp(250px,34vh,340px)}}
@media(max-width:760px){body.gtg-page .project-facts{grid-template-columns:1fr}.gtg-general-summary{margin-top:18px;padding-top:13px}.gtg-case{padding-top:calc(var(--header) + 18px);padding-bottom:18px}.gtg-case-copy>p{margin-top:13px}.gtg-tech{margin-top:12px}.gtg-gallery{height:250px;grid-template-columns:minmax(0,1.5fr) minmax(92px,.75fr);gap:6px}.gtg-credit{margin-top:7px}.gtg-system-diagram{margin-top:6px}}
@media(max-width:620px){html{scroll-snap-type:y mandatory}body.gtg-page .project-hero{padding-top:calc(var(--header) + 20px);padding-bottom:20px}body.gtg-page .project-hero h1{font-size:clamp(44px,14vw,66px);line-height:.88}body.gtg-page .project-intent{font-size:14px;line-height:1.45}body.gtg-page .project-facts{margin-top:16px}.gtg-general-summary{font-size:11.5px;line-height:1.45}.gtg-scroll-cue{margin-top:16px}.gtg-case{gap:13px;padding-top:calc(var(--header) + 14px);padding-bottom:14px}.gtg-case h2{font-size:clamp(32px,10vw,48px)}.gtg-case-copy>p{font-size:12.5px;line-height:1.43;margin-top:11px}.gtg-role,.gtg-index{font-size:7.2px}.gtg-tech{gap:4px;margin-top:10px}.gtg-tech span{padding:5px 6px;font-size:6.5px}.gtg-gallery{height:220px;grid-template-columns:minmax(0,1.48fr) minmax(86px,.72fr);gap:5px}.gtg-gallery figcaption{font-size:5.8px;padding:4px 5px;left:4px;right:4px;bottom:4px}.gtg-credit{font-size:7.6px;line-height:1.32}.gtg-system-diagram{padding:6px;gap:4px}.gtg-system-diagram span{min-height:30px;padding:5px 6px;font-size:5.8px}.gtg-system-diagram b{font-size:7px}}
@media(max-height:700px){body.gtg-page .project-hero{padding-top:calc(var(--header) + 14px);padding-bottom:14px}.gtg-case{padding-top:calc(var(--header) + 10px);padding-bottom:10px;gap:10px}.gtg-gallery{height:190px}.gtg-case-copy>p{font-size:11.5px;line-height:1.38}.gtg-tech span{padding:4px 6px}.gtg-credit{font-size:7px}.gtg-system-diagram{display:none}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>`;

for (const [file,lang] of pages) {
  let html = fs.readFileSync(file,'utf8');
  html = html.replace(/\n?<style data-gtg-gallery-v3="">[\s\S]*?<\/style>/g,'');
  html = html.replace(/\n?<style data-gtg-paged-v4="">[\s\S]*?<\/style>/g,'');
  html = html.replace('</head>',`${style}\n</head>`);
  html = html.replace(/<body class="gtg-page"[^>]*>/, '<body class="gtg-page" data-gtg-paged-v4="1">');
  html = html.replace(/\n\s*<div class="gtg-overview reveal"[\s\S]*?<\/div>\s*(?=<\/header>)/,'');
  html = html.replace(/<div class="project-facts reveal">([\s\S]*?)<\/div>\s*(?=<\/header>)/, `<div class="project-facts reveal">$1</div><p class="gtg-general-summary reveal">${summaries[lang]}</p><p class="gtg-scroll-cue reveal">SCROLL ↓</p>`);
  html = html.replace(/<figure class="gtg-techview">[\s\S]*?geometry\.webp[\s\S]*?<\/figure>/g,'');
  html = html.replace(/\sclass="gtg-wide"/g,'');
  html = html.replaceAll('don-carlos-stage-02.jpg','don-carlos-stage-04.jpg');
  html = html.replaceAll('don-carlos-stage-03.jpg','don-carlos-stage-05.jpg');
  html = html.replace(/alt="Don Carlos stage system and projected scenic surface"/g,'alt="Don Carlos stage view at Grand Théâtre de Genève"');
  html = html.replace(/alt="Don Carlos stage view with video-integrated scenography"/g,'alt="Don Carlos stage view at Grand Théâtre de Genève"');
  fs.writeFileSync(file,html);
  console.log(`Paged GTG: ${file}`);
}

// trigger workflow after workflow file exists on dev
