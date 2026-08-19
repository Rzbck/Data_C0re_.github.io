import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const archivePath = path.join(ROOT, 'archive.html');
const canonical = '<link rel="canonical" href="https://datac0re.is-a.dev/archive.html">';
const targetRobots = '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';

if (!fs.existsSync(archivePath)) {
  throw new Error('Archive indexability guard: archive.html not found.');
}

const html = fs.readFileSync(archivePath, 'utf8');

if (!html.includes(canonical)) {
  throw new Error('Archive indexability guard: production canonical is missing or changed.');
}

const robotsMatches = html.match(/<meta name="robots" content="[^"]*">/gi) || [];
if (robotsMatches.length !== 1) {
  throw new Error(`Archive indexability guard: expected exactly one robots meta tag, found ${robotsMatches.length}.`);
}

const next = html.replace(/<meta name="robots" content="[^"]*">/i, targetRobots);
if (next !== html) fs.writeFileSync(archivePath, next, 'utf8');

console.log('Archive indexability guard: archive.html is indexable and canonical remains unchanged.');
