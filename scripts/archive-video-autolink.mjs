import fs from 'node:fs';
import * as cheerio from 'cheerio';

// Archive hover media is derived from the current project page at build time.
// Priority: video when available; otherwise a small representative image pool.
// Runtime discovery remains as a fallback, but the archive should normally ship pre-linked.
const archiveFiles = ['archive.html', 'en/archive.html', 'fr/archive.html', 'es/archive.html'];
const videoPattern = /\.(mp4|webm|m4v)(?:[?#].*)?$/i;
const imagePattern = /\.(avif|webp|png|jpe?g|gif)(?:[?#].*)?$/i;
const imageRejectPattern = /(?:favicon|(?:^|[\/_-])icon(?:[\/_-]|\.)|logo|og-cover|avatar|sprite|placeholder)/i;
const maxArchiveImages = 4;
const archiveRuntimeVersion = '20260819-media2';

const cleanSource = value => (value || '').trim();
const sourceKey = value => cleanSource(value).split(/[?#]/, 1)[0];
const firstSrcsetSource = value => cleanSource(value).split(',')[0]?.trim().split(/\s+/)[0] || '';

const projectFileFor = (archiveFile, slug) => {
  const locale = archiveFile.includes('/') ? archiveFile.split('/')[0] : '';
  return locale ? `${locale}/projects/${slug}.html` : `projects/${slug}.html`;
};

const addUnique = (found, seen, value, pattern) => {
  const src = cleanSource(value);
  const key = sourceKey(src);
  if (!src || !key || !pattern.test(src) || seen.has(key)) return;
  seen.add(key);
  found.push(src);
};

const collectVideos = projectFile => {
  if (!fs.existsSync(projectFile)) return [];
  const html = fs.readFileSync(projectFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const found = [];
  const seen = new Set();

  $('main video, main video source').each((_, element) => {
    const node = $(element);
    [node.attr('src'), node.attr('data-src')].forEach(src => addUnique(found, seen, src, videoPattern));
  });

  return found;
};

const representativeImages = images => {
  if (images.length <= maxArchiveImages) return images;
  const last = images.length - 1;
  const indices = [0, Math.round(last / 3), Math.round((last * 2) / 3), last];
  return [...new Set(indices.map(index => images[index]).filter(Boolean))].slice(0, maxArchiveImages);
};

const collectImages = projectFile => {
  if (!fs.existsSync(projectFile)) return [];
  const html = fs.readFileSync(projectFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const found = [];
  const seen = new Set();

  const addImageNode = element => {
    const node = $(element);
    if (node.closest('[hidden]').length) return;
    const candidates = [node.attr('src'), node.attr('data-src'), firstSrcsetSource(node.attr('srcset'))];
    for (const candidate of candidates) {
      const src = cleanSource(candidate);
      const key = sourceKey(src);
      if (!src || !key || !imagePattern.test(src) || imageRejectPattern.test(key) || seen.has(key)) continue;
      seen.add(key);
      found.push(src);
      break;
    }
  };

  // Future project pages can explicitly mark preferred archive imagery.
  const explicit = $('main img[data-archive-preview], main [data-archive-preview] img').toArray();
  if (explicit.length) {
    explicit.forEach(addImageNode);
    return representativeImages(found);
  }

  // Otherwise keep only content imagery from the project itself, never global/header assets.
  $('main .comedie-show-gallery img, main article figure img, main .project-section figure img, main figure img').each((_, element) => addImageNode(element));
  return representativeImages(found);
};

const ensureMediaLayer = ($, entry) => {
  let media = entry.children('.archive-entry-media').first();
  if (!media.length) {
    entry.prepend('<span class="archive-entry-media" aria-hidden="true"><img alt="" loading="lazy" decoding="async" fetchpriority="low"><video muted loop playsinline preload="none"></video></span>');
    media = entry.children('.archive-entry-media').first();
  }
  if (!media.find('img').length) media.prepend('<img alt="" loading="lazy" decoding="async" fetchpriority="low">');
  if (!media.find('video').length) media.append('<video muted loop playsinline preload="none"></video>');
  media.find('img').first().attr({ alt: '', loading: 'lazy', decoding: 'async', fetchpriority: 'low' });
  media.find('video').first().attr({ muted: '', loop: '', playsinline: '', preload: 'none' });
  return media;
};

const syncPoolAttrs = (entry, singular, plural, values) => {
  if (!values.length) {
    entry.removeAttr(singular).removeAttr(plural);
    return;
  }
  entry.attr(singular, values[0]);
  if (values.length > 1) entry.attr(plural, JSON.stringify(values));
  else entry.removeAttr(plural);
};

for (const archiveFile of archiveFiles) {
  if (!fs.existsSync(archiveFile)) continue;
  const html = fs.readFileSync(archiveFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  let changed = false;

  $('.archive-entry[data-archive-project]').each((_, element) => {
    const entry = $(element);
    const slug = (entry.attr('data-archive-project') || '').trim();
    if (!slug) return;

    const projectFile = projectFileFor(archiveFile, slug);
    const videos = collectVideos(projectFile);
    const images = collectImages(projectFile);
    if (!videos.length && !images.length) return;

    const media = ensureMediaLayer($, entry);
    entry.attr('data-archive-media-auto', 'true');
    entry.attr('data-archive-video-auto', 'true'); // backwards-compatible marker

    // Clear stale media whenever the project no longer contains that media type.
    syncPoolAttrs(entry, 'data-archive-video', 'data-archive-videos', videos);
    syncPoolAttrs(entry, 'data-archive-image', 'data-archive-images', images);

    const image = media.find('img').first();
    if (images.length) image.attr('src', images[0]);
    else image.removeAttr('src');

    const video = media.find('video').first();
    video.removeAttr('src').removeAttr('data-src');
    entry.attr('data-archive-media-kind', videos.length ? 'video' : 'image');
    changed = true;
  });

  const runtime = $('script[data-archive-interactions]').first();
  if (runtime.length) {
    const current = runtime.attr('src') || 'assets/js/archive-interactions.js';
    const base = current.split(/[?#]/, 1)[0];
    runtime.attr('src', `${base}?v=${archiveRuntimeVersion}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(archiveFile, $.html());
    console.log(`Archive hover media synchronized: ${archiveFile}`);
  }
}
