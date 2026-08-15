import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const taxonomy=JSON.parse(fs.readFileSync(path.join(ROOT,'data/project-taxonomy.json'),'utf8'));
const projectDir=path.join(ROOT,'fr','projects');
const failures=[];

const evidenceRules={
  touchdesigner:/\btouchdesigner\b/i,
  smode:/\bsmode\b/i,
  resolume:/\bresolume\b/i,
  glsl:/\bglsl\b/i,
  esp32:/\besp32\b/i,
  dmx:/\bdmx(?:512)?\b/i,
  'art-net':/\bart[-‐‑–— ]net\b/i,
  websocket:/\bwebsocket\b/i,
  json:/\bjson\b/i,
  led:/\bled\b/i,
  projection:/\bprojection(?:s)?\b/i,
  'mmwave-tracking':/\bmmwave\b/i,
  calibration:/\bcalibration\b/i,
  'audio-reactive':/audio[-‑– ]r[ée]actif|audio[-‑– ]reactive/i,
  'show-control':/\bshow control\b/i,
  'realtime-video':/vid[ée]o temps r[ée]el|realtime video/i,
  'small-file':/small[-‑– ]file/i,
  'low-bandwidth':/low[-‑– ]bandwidth|faible bande passante|bajo ancho de banda/i
};

function publicArticleText(html){
  const article=(html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)||[])[1]||html;
  const withoutNext=article.replace(/<nav\b[^>]*class=["'][^"']*project-next[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi,' ');
  return withoutNext
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/&nbsp;/g,' ')
    .replace(/&#(?:x[0-9a-f]+|\d+);/gi,' ')
    .replace(/\s+/g,' ');
}

const publicSlugs=fs.readdirSync(projectDir)
  .filter(name=>name.endsWith('.html'))
  .map(name=>name.replace(/\.html$/,''))
  .sort();
const taxonomySlugs=Object.keys(taxonomy.projects||{}).sort();

for(const slug of publicSlugs){
  if(!taxonomy.projects?.[slug])failures.push(`${slug}: public project has no taxonomy entry`);
}
for(const slug of taxonomySlugs){
  if(!publicSlugs.includes(slug))failures.push(`${slug}: taxonomy entry has no FR public project page`);
}

for(const [slug,tags] of Object.entries(taxonomy.projects||{})){
  if(!Array.isArray(tags)){failures.push(`${slug}: taxonomy tags must be an array`);continue;}
  const unknown=tags.filter(tag=>!taxonomy.tags?.[tag]);
  if(unknown.length)failures.push(`${slug}: unknown tag(s): ${unknown.join(', ')}`);
  if(new Set(tags).size!==tags.length)failures.push(`${slug}: duplicate tag assignment`);

  const file=path.join(projectDir,`${slug}.html`);
  if(!fs.existsSync(file))continue;
  const text=publicArticleText(fs.readFileSync(file,'utf8'));
  for(const [tag,pattern] of Object.entries(evidenceRules)){
    if(pattern.test(text)&&!tags.includes(tag))failures.push(`${slug}: page explicitly mentions ${tag} but taxonomy is missing it`);
  }
}

if(failures.length){
  console.error(`Project taxonomy audit failed with ${failures.length} issue(s):`);
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Project taxonomy audit passed: ${taxonomySlugs.length} projects, ${Object.keys(taxonomy.tags||{}).length} canonical tags.`);
