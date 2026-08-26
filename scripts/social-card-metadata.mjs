import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ORIGIN = 'https://datac0re.is-a.dev';
const IMAGE_URL = `${ORIGIN}/assets/img/og-cover-v2.jpg`;
const TARGETS = [
  'index.html',
  'en/index.html',
  'fr/index.html',
  'es/index.html',
];

const detailTags = [
  `<meta property="og:image:secure_url" content="${IMAGE_URL}">`,
  '<meta property="og:image:type" content="image/jpeg">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
].join('');

for (const relative of TARGETS) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll(`${ORIGIN}/assets/img/og-cover.jpg`, IMAGE_URL);

  html = html.replace(/<meta property="og:image:secure_url"[^>]*>/g, '');
  html = html.replace(/<meta property="og:image:type"[^>]*>/g, '');
  html = html.replace(/<meta property="og:image:width"[^>]*>/g, '');
  html = html.replace(/<meta property="og:image:height"[^>]*>/g, '');

  const imageTag = /<meta property="og:image"[^>]*>/;
  if (!imageTag.test(html)) {
    throw new Error(`Missing og:image in ${relative}`);
  }
  html = html.replace(imageTag, match => `${match}${detailTags}`);

  const expectedOg = `<meta property="og:image" content="${IMAGE_URL}">`;
  const expectedTwitter = `<meta name="twitter:image" content="${IMAGE_URL}">`;
  if (!html.includes(expectedOg) || !html.includes(expectedTwitter)) {
    throw new Error(`Social image URL did not normalize in ${relative}`);
  }

  fs.writeFileSync(file, html);
  console.log(`Normalized social preview metadata: ${relative}`);
}
