import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const files=['projects/last-low-bandwidth-message.html','en/projects/last-low-bandwidth-message.html','fr/projects/last-low-bandwidth-message.html','es/projects/last-low-bandwidth-message.html'];
const caption={en:'12-second silent excerpt / proof → loss → survival',fr:'Extrait silencieux de 12 s / preuve → perte → survie',es:'Extracto silencioso de 12 s / prueba → pérdida → supervivencia'};
function langFor(rel){if(rel.startsWith('fr/'))return 'fr';if(rel.startsWith('es/'))return 'es';return 'en'}

for(const rel of files){
  const file=path.join(ROOT,rel);
  if(!fs.existsSync(file))continue;
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  const video=$('.smallfile-media video').first();
  if(!video.length)continue;
  video.removeAttr('autoplay controls webkit-playsinline preload src');
  video.attr('muted','').attr('loop','').attr('playsinline','').attr('poster','assets/media/low-bandwidth-message/promo.webp').attr('data-lazy-video','');
  video.empty().append('<source data-src="assets/media/low-bandwidth-message/excerpt.mp4?v=20260816-4" type="video/mp4">');
  $('.smallfile-media figcaption').first().text(caption[langFor(rel)]);
  fs.writeFileSync(file,$.html(),'utf8');
}
console.log('Small-file project uses the same lazy video contract as other project videos.');
// Final release audit marker: archive/location/video correction 2026-08-16.
