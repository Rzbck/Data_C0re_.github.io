import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT=process.cwd();
const targets=[
  'projects/last-low-bandwidth-message.html',
  'en/projects/last-low-bandwidth-message.html',
  'fr/projects/last-low-bandwidth-message.html',
  'es/projects/last-low-bandwidth-message.html'
];

for(const rel of targets){
  const file=path.join(ROOT,rel);
  if(!fs.existsSync(file))continue;
  const $=load(fs.readFileSync(file,'utf8'),{decodeEntities:false});
  const video=$('.smallfile-media video').first();
  if(!video.length)continue;

  // Same playback pattern as the working project videos elsewhere on the site:
  // main.js loads/plays the source when the video enters the viewport.
  video.removeAttr('autoplay').removeAttr('preload');
  video.attr('muted','').attr('loop','').attr('playsinline','').attr('data-lazy-video','');
  const source=video.find('source').first();
  if(source.length){
    source.removeAttr('src');
    source.attr('data-src','assets/media/low-bandwidth-message/excerpt.mp4?v=20260816-2');
    source.attr('type','video/mp4');
  }
  fs.writeFileSync(file,$.html(),'utf8');
}

console.log('Low-bandwidth excerpt now uses the standard DATA C0RE lazy video pattern.');
