import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

// Archive hover media is derived from the current project page at build time.
// Videos and a small representative image pool are both exposed to the runtime;
// one medium is selected per rollover and remains locked until pointer exit.
// Explicit data-archive-preview imagery always wins. Otherwise the archive favors
// landscape-oriented local images because the rollover band is extremely wide.
const archiveFiles = ['archive.html', 'en/archive.html', 'fr/archive.html', 'es/archive.html'];
const videoPattern = /\.(mp4|webm|m4v)(?:[?#].*)?$/i;
const imagePattern = /\.(avif|webp|png|jpe?g|gif)(?:[?#].*)?$/i;
const imageRejectPattern = /(?:favicon|(?:^|[\/_-])icon(?:[\/_-]|\.)|logo|og-cover|avatar|sprite|placeholder)/i;
const maxArchiveImages = 4;
const landscapeRatio = 1.15;
const archiveRuntimeVersion = '20260820-media4';

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

const representativeItems = items => {
  if (items.length <= maxArchiveImages) return items;
  const last = items.length - 1;
  const indices = [0, Math.round(last / 3), Math.round((last * 2) / 3), last];
  return [...new Set(indices.map(index => items[index]).filter(Boolean))].slice(0, maxArchiveImages);
};

const localImagePath = src => {
  const key = sourceKey(src);
  if (!key || /^(?:[a-z]+:)?\/\//i.test(key) || key.startsWith('data:')) return '';
  let decoded = key;
  try { decoded = decodeURIComponent(key); } catch {}
  decoded = decoded.replace(/^\/+/, '');
  const resolved = path.resolve(process.cwd(), decoded);
  const root = path.resolve(process.cwd());
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return '';
  return fs.existsSync(resolved) ? resolved : '';
};

const jpegDimensions = buffer => {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;
    const marker = buffer[offset++];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (sof.has(marker) && length >= 7) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return width && height ? { width, height } : null;
    }
    offset += length;
  }
  return null;
};

const webpDimensions = buffer => {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X' && buffer.length >= 30) {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  if (chunk === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return width && height ? { width, height } : null;
  }
  if (chunk === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
    const b1 = buffer[21];
    const b2 = buffer[22];
    const b3 = buffer[23];
    const b4 = buffer[24];
    const width = 1 + (((b2 & 0x3f) << 8) | b1);
    const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width, height };
  }
  return null;
};

const imageDimensions = src => {
  const file = localImagePath(src);
  if (!file) return null;
  try {
    const buffer = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return jpegDimensions(buffer);
    if (ext === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (ext === '.gif' && buffer.length >= 10 && /^GIF8[79]a$/.test(buffer.toString('ascii', 0, 6))) {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    if (ext === '.webp') return webpDimensions(buffer);
  } catch {}
  return null;
};

const preferredArchiveImages = items => {
  if (items.length <= maxArchiveImages) return items.map(item => item.src);

  const landscape = items.filter(item => item.ratio !== null && item.ratio >= landscapeRatio);
  if (landscape.length >= maxArchiveImages) return representativeItems(landscape).map(item => item.src);

  const squareish = items.filter(item => item.ratio !== null && item.ratio >= 0.95 && item.ratio < landscapeRatio);
  const unknown = items.filter(item => item.ratio === null);
  const portrait = items
    .filter(item => item.ratio !== null && item.ratio < 0.95)
    .sort((a, b) => (b.ratio - a.ratio) || (a.order - b.order));

  const selected = [...representativeItems(landscape)];
  for (const tier of [squareish, unknown, portrait]) {
    if (selected.length >= maxArchiveImages) break;
    for (const item of representativeItems(tier)) {
      if (selected.some(existing => existing.src === item.src)) continue;
      selected.push(item);
      if (selected.length >= maxArchiveImages) break;
    }
  }

  return selected
    .sort((a, b) => a.order - b.order)
    .slice(0, maxArchiveImages)
    .map(item => item.src);
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
      const dims = imageDimensions(src);
      found.push({
        src,
        order: found.length,
        ratio: dims?.width && dims?.height ? dims.width / dims.height : null
      });
      break;
    }
  };

  // Explicit authorial choice always wins, regardless of orientation.
  const explicit = $('main img[data-archive-preview], main [data-archive-preview] img').toArray();
  if (explicit.length) {
    explicit.forEach(addImageNode);
    return representativeItems(found).map(item => item.src);
  }

  // Otherwise keep only content imagery from the project itself, never global/header assets,
  // and favor landscape crops suited to the archive's ultra-wide rollover band.
  $('main .comedie-show-gallery img, main article figure img, main .project-section figure img, main figure img').each((_, element) => addImageNode(element));
  return preferredArchiveImages(found);
};

const ensureMediaLayer = ($, entry) => {
  let media = entry.children('.archive-entry-media').first();
  if (!media.length) {
    entry.prepend('<span class="archive-entry-media" aria-hidden="true"><img alt="" loading="lazy" decoding="async" fetchpriority="low"><video data-stagger-video muted loop playsinline preload="none"></video></span>');
    media = entry.children('.archive-entry-media').first();
  }
  if (!media.find('img').length) media.prepend('<img alt="" loading="lazy" decoding="async" fetchpriority="low">');
  if (!media.find('video').length) media.append('<video data-stagger-video muted loop playsinline preload="none"></video>');
  media.find('img').first().attr({ alt: '', loading: 'lazy', decoding: 'async', fetchpriority: 'low' });
  media.find('video').first().attr({ 'data-stagger-video': '', muted: '', loop: '', playsinline: '', preload: 'none' }).removeAttr('poster');
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

    // Keep canonical pools immutable at runtime; the rollover controller only reads them.
    syncPoolAttrs(entry, 'data-archive-video', 'data-archive-videos', videos);
    syncPoolAttrs(entry, 'data-archive-image', 'data-archive-images', images);

    const image = media.find('img').first();
    if (images.length) image.attr('src', images[0]);
    else image.removeAttr('src');

    const video = media.find('video').first();
    video.removeAttr('src').removeAttr('data-src').removeAttr('poster');
    entry.attr('data-archive-media-kind', videos.length && images.length ? 'mixed' : videos.length ? 'video' : 'image');
    changed = true;
  });

  const runtime = $('script[data-archive-interactions]').first();
  if (runtime.length) {
    const current = runtime.attr('src') || 'assets/js/archive-interactions.js';
    const base = current.split(/[?#]/, 1)[0];
    runtime.attr('src', `${base}?v=${archiveRuntimeVersion}`);
    changed = true;
  }

  // The rollover cycle is now integrated into archive-interactions.js.
  // Remove the temporary overlay script so one pointer event has one media controller.
  const cycle = $('script[data-archive-media-cycle]');
  if (cycle.length) {
    cycle.remove();
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(archiveFile, $.html());
    console.log(`Archive hover media synchronized: ${archiveFile}`);
  }
}
