import fs from 'node:fs';
import * as cheerio from 'cheerio';

const files = [
  'projects/comedie.html',
  'en/projects/comedie.html',
  'fr/projects/comedie.html',
  'es/projects/comedie.html'
];

const perfStyle = `
<style data-comedie-performance="">
/* Keep the validated desktop composition while avoiding work for distant full-screen panels. */
@media (min-width:821px){
  body.comedie-page .production-block.comedie-show-screen{
    content-visibility:auto;
    contain-intrinsic-size:100svh;
  }
}
/* Mobile is intentionally a native document flow: do not defer layout of tall show sections. */
@media (max-width:820px){
  body.comedie-page .project-hero.comedie-show-screen,
  body.comedie-page .production-block.comedie-show-screen{
    content-visibility:visible;
  }
}
</style>`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  $('style[data-comedie-performance]').remove();
  $('head').append(perfStyle);

  $('[data-comedie-show-gallery]').each((_, gallery) => {
    const key = $(gallery).attr('data-comedie-show-gallery');
    $(gallery).find('img').each((index, image) => {
      const img = $(image);
      const isHeroImage = key === 'entre' && index === 0;
      img.attr('decoding', 'async');
      if (isHeroImage) {
        img.removeAttr('loading');
        img.attr('fetchpriority', 'high');
      } else {
        img.attr('loading', 'lazy');
        img.attr('fetchpriority', 'low');
      }
    });
  });

  fs.writeFileSync(file, $.html());
  console.log(`Optimized Comédie media scheduling: ${file}`);
}
