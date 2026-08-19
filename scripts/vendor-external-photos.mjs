import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const photos = [
  {
    url: 'https://www.piccoloteatro.org/sites/default/files/styles/show_hero_i/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_entre-chien-et-loup-1000x750_original_11.jpg?itok=x502vh4f',
    dest: 'assets/media/comedie/entre/official-01.jpg',
    referer: 'https://www.piccoloteatro.org/en/2021-2022/entre-chien-et-loup'
  },
  {
    url: 'https://www.piccoloteatro.org/sites/default/files/styles/galley_image/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_backstage-entre-chien-et-loup-01_original_3.jpg?itok=E4pOkmW3',
    dest: 'assets/media/comedie/entre/official-02.jpg',
    referer: 'https://www.piccoloteatro.org/en/2021-2022/entre-chien-et-loup'
  },
  {
    url: 'https://www.piccoloteatro.org/sites/default/files/styles/galley_image/public/imported-images/uploads/seasons/2021-2022/exhibitions/entre-chien-et-loup/it_entre-chien-et-loup-01_original_3.jpg?itok=29D2jKtS',
    dest: 'assets/media/comedie/entre/official-03.jpg',
    referer: 'https://www.piccoloteatro.org/en/2021-2022/entre-chien-et-loup'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVNek0zIiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--018c40d3bcfa95a4cdf2728f1670fa4e686c883144f2499d3b08cc14c4f2ecc1/4a41df1e38dc/les-emigrants-11-01-24-simon-gosselin-2-62.jpg',
    dest: 'assets/media/comedie/emigrants/official-01.jpg',
    referer: 'https://www.theatre-odeon.eu/en/les-emigrants'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVNems1IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--a09558672e73c5e550e27845c61ab53e02ecfc7065307e11c230bf25ec20b56f/bca32ae5b6d6/les-emigrants-11-01-24-simon-gosselin-2-54.jpg',
    dest: 'assets/media/comedie/emigrants/official-02.jpg',
    referer: 'https://www.theatre-odeon.eu/en/les-emigrants'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UZzVOREF3IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--b14b9a4c45162b50293407ba680a28476c069c80301eb0b85ee101d56a1dc486/b1a149f0cd2b/les-emigrants-11-01-24-simon-gosselin-1-32-1.jpg',
    dest: 'assets/media/comedie/emigrants/official-03.jpg',
    referer: 'https://www.theatre-odeon.eu/en/les-emigrants'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREU1IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--f5b0720c9af9ad0782dd8ee9de1fe10a750bc072040033880a73adfba2eb7ef6/754ce36543cc/190408-22022022_en_transit_comedie_magali_dougados_e8a5076-min.jpg',
    dest: 'assets/media/comedie/transit/official-01.jpg',
    referer: 'https://www.theatre-odeon.eu/fr/en-transit'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREl4IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--bf77427afcdd49ceffde99bfa63d1fdb3acf66c8bc4fa02c1415348f3c0040c5/c17632739dfa/190408-22022022_en_transit_comedie_magali_dougados_e8a5098-min.jpg',
    dest: 'assets/media/comedie/transit/official-02.jpg',
    referer: 'https://www.theatre-odeon.eu/fr/en-transit'
  },
  {
    url: 'https://cdn.artishoc.coop/e54aa670-7d3a-4933-82b0-fb79918de9b8/v1/medias/eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1UTTRNREl6IiwiZXhwIjpudWxsLCJwdXIiOiJtZWRpYS9tZWRpYV9pZCJ9fQ%3D%3D--b37b8fbc2f376424d336ca1aee67385440f9530d20cafb49d53e8fef2ba4a9f3/1c228908c1f7/190408-22022022_en_transit_comedie_magali_dougados_e8a5211-min.jpg',
    dest: 'assets/media/comedie/transit/official-03.jpg',
    referer: 'https://www.theatre-odeon.eu/fr/en-transit'
  }
];

const textExt = new Set(['.html','.js','.mjs','.css','.json','.md']);
const excludedDirs = new Set(['.git','node_modules']);
const ownHosts = new Set(['datac0re.is-a.dev','www.datac0re.is-a.dev','rzbck.github.io']);
const externalImageRe = /https?:\/\/[^\s"'<>]+?\.(?:avif|webp|png|jpe?g|gif)(?:\?[^\s"'<>]*)?/gi;

const listTextFiles = dir => {
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(excludedDirs.has(entry.name))continue;
    const abs=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...listTextFiles(abs));
    else if(textExt.has(path.extname(entry.name).toLowerCase()))out.push(abs);
  }
  return out;
};

const fetchPhoto = async photo => {
  const abs=path.join(root,photo.dest);
  if(fs.existsSync(abs) && fs.statSync(abs).size>20000){
    console.log(`Already local: ${photo.dest}`);
    return;
  }
  fs.mkdirSync(path.dirname(abs),{recursive:true});
  const response=await fetch(photo.url,{
    redirect:'follow',
    headers:{
      'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      'accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'referer':photo.referer
    }
  });
  if(!response.ok)throw new Error(`Failed ${response.status} ${photo.url}`);
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(type && !type.startsWith('image/'))throw new Error(`Not an image (${type}): ${photo.url}`);
  const buffer=Buffer.from(await response.arrayBuffer());
  if(buffer.length<20000)throw new Error(`Downloaded file suspiciously small (${buffer.length} bytes): ${photo.url}`);
  fs.writeFileSync(abs,buffer);
  console.log(`Vendored ${photo.url} -> ${photo.dest} (${buffer.length} bytes)`);
};

for(const photo of photos)await fetchPhoto(photo);

const replacements=new Map(photos.map(photo=>[photo.url,photo.dest]));
const files=listTextFiles(root);
for(const file of files){
  if(file.endsWith(path.join('scripts','vendor-external-photos.mjs')))continue;
  let text=fs.readFileSync(file,'utf8');
  let changed=false;
  for(const [url,dest] of replacements){
    if(text.includes(url)){text=text.split(url).join(dest);changed=true}
  }
  if(changed){
    text=text.replace(/\n?<link rel="preconnect" href="https:\/\/www\.piccoloteatro\.org"[^>]*>/g,'');
    text=text.replace(/\n?<link rel="preconnect" href="https:\/\/cdn\.artishoc\.coop"[^>]*>/g,'');
    fs.writeFileSync(file,text);
    console.log(`Updated ${path.relative(root,file)}`);
  }
}

const remaining=[];
for(const file of files){
  if(file.endsWith(path.join('scripts','vendor-external-photos.mjs')))continue;
  const text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(externalImageRe)){
    const url=match[0];
    let host='';
    try{host=new URL(url).hostname.toLowerCase()}catch{}
    if(host && !ownHosts.has(host))remaining.push(`${path.relative(root,file)} :: ${url}`);
  }
}

if(remaining.length){
  console.error('\nExternal image URLs still present:');
  [...new Set(remaining)].forEach(item=>console.error(`- ${item}`));
  process.exitCode=2;
}else{
  console.log('\nExternal image audit passed: all live photo assets are local/self-hosted.');
}
