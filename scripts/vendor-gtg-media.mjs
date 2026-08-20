import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const media = [
  {
    url: 'https://www.gtg.ch/wp-content/uploads/2023/11/Bolero__c_FilipVanRoe__DSC6028_1200.jpg',
    dest: 'assets/media/grand-theatre/bolero-filip-van-roe.jpg',
    referer: 'https://www.gtg.ch/saison-23-24/elements/'
  },
  {
    url: 'https://www.gtg.ch/wp-content/uploads/2023/09/don_carlos_trailer_1920x1080_02.jpg',
    dest: 'assets/media/grand-theatre/don-carlos-gtg.jpg',
    referer: 'https://www.gtg.ch/saison-23-24/don-carlos/'
  },
  {
    url: 'https://www.gtg.ch/wp-content/uploads/2025/12/2026a030_un_americain_a_paris_gp_20251206_gtg-gregory_batardon_141_high.jpg',
    dest: 'assets/media/grand-theatre/aaip-gregory-batardon.jpg',
    referer: 'https://www.gtg.ch/saison-25-26/un-americain-a-paris/'
  }
];

for (const item of media) {
  const target = path.join(root, item.dest);
  if (fs.existsSync(target) && fs.statSync(target).size > 20000) {
    console.log(`Already local: ${item.dest}`);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const response = await fetch(item.url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'referer': item.referer
    }
  });
  if (!response.ok) throw new Error(`Failed ${response.status} ${item.url}`);
  const type = (response.headers.get('content-type') || '').toLowerCase();
  if (type && !type.startsWith('image/')) throw new Error(`Not an image (${type}): ${item.url}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length < 20000) throw new Error(`Downloaded file suspiciously small (${data.length} bytes): ${item.url}`);
  fs.writeFileSync(target, data);
  console.log(`Vendored ${item.url} -> ${item.dest} (${data.length} bytes)`);
}
