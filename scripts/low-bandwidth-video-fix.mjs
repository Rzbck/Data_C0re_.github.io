import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const files=[
  'projects/last-low-bandwidth-message.html',
  'en/projects/last-low-bandwidth-message.html',
  'fr/projects/last-low-bandwidth-message.html',
  'es/projects/last-low-bandwidth-message.html'
];

const caption={
  en:'Motion excerpt / signal-loss state',
  fr:'Extrait vidéo / état de perte du signal',
  es:'Extracto de vídeo / estado de pérdida de señal'
};

function langFor(rel){
  if(rel.startsWith('fr/'))return 'fr';
  if(rel.startsWith('es/'))return 'es';
  return 'en';
}

for(const rel of files){
  const file=path.join(ROOT,rel);
  if(!fs.existsSync(file))continue;
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  const video=$('.smallfile-media video').first();
  if(!video.length)continue;

  // Same loading/playback contract as the working project hero videos elsewhere on the site.
  video.removeAttr('autoplay controls webkit-playsinline');
  video.attr('muted','').attr('loop','').attr('playsinline','').attr('poster','assets/media/low-bandwidth-message/promo.webp').attr('data-lazy-video','');
  video.removeAttr('preload src');
  video.empty().append('<source data-src="assets/media/low-bandwidth-message/excerpt.mp4?v=20260816-3" type="video/mp4">');
  $('.smallfile-media figcaption').first().text(caption[langFor(rel)]);

  fs.writeFileSync(file,$.html(),'utf8');
}

console.log('Small-file project now uses the shared lazy video playback pattern.');
