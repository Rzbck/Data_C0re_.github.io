import fs from 'node:fs';
import * as cheerio from 'cheerio';

const archiveFiles = ['archive.html', 'en/archive.html', 'fr/archive.html', 'es/archive.html'];
const videoPattern = /\.(mp4|webm|m4v)(?:[?#].*)?$/i;

const cleanSource = value => (value || '').trim();

const projectFileFor = (archiveFile, slug) => {
  const locale = archiveFile.includes('/') ? archiveFile.split('/')[0] : '';
  return locale ? `${locale}/projects/${slug}.html` : `projects/${slug}.html`;
};

const collectVideos = projectFile => {
  if (!fs.existsSync(projectFile)) return [];
  const html = fs.readFileSync(projectFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const found = [];

  $('video, video source').each((_, element) => {
    const node = $(element);
    const candidates = [node.attr('src'), node.attr('data-src')]
      .map(cleanSource)
      .filter(Boolean)
      .filter(src => videoPattern.test(src));
    for (const src of candidates) if (!found.includes(src)) found.push(src);
  });

  return found;
};

const ensureMediaLayer = ($, entry) => {
  let media = entry.children('.archive-entry-media').first();
  if (!media.length) {
    entry.prepend('<span class="archive-entry-media" aria-hidden="true"><video muted loop playsinline preload="none"></video></span>');
    media = entry.children('.archive-entry-media').first();
  }
  if (!media.find('video').length) media.append('<video muted loop playsinline preload="none"></video>');
};

for (const archiveFile of archiveFiles) {
  if (!fs.existsSync(archiveFile)) continue;
  const html = fs.readFileSync(archiveFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false }, false);
  let changed = false;

  $('.archive-entry[data-archive-project]').each((_, element) => {
    const entry = $(element);
    const slug = (entry.attr('data-archive-project') || '').trim();
    if (!slug || slug === 'last-low-bandwidth-message') return;

    const videos = collectVideos(projectFileFor(archiveFile, slug));
    if (!videos.length) return;

    ensureMediaLayer($, entry);
    entry.attr('data-archive-video-auto', 'true');

    if (videos.length === 1) {
      entry.attr('data-archive-video', videos[0]);
      entry.removeAttr('data-archive-videos');
    } else {
      entry.attr('data-archive-videos', JSON.stringify(videos));
      entry.attr('data-archive-video', videos[0]);
    }
    changed = true;
  });

  if (changed) {
    fs.writeFileSync(archiveFile, $.html());
    console.log(`Archive hover media synchronized: ${archiveFile}`);
  }
}
