import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const sourceFile = path.join(ROOT, 'services.html');

function replaceAllLiteral(input, from, to) {
  return input.includes(from) ? input.split(from).join(to) : input;
}

function patchSource() {
  if (!fs.existsSync(sourceFile)) return;
  let html = fs.readFileSync(sourceFile, 'utf8');

  const replacements = [
    ['TouchDesigner & Video Systems — Annecy / Geneva / Lyon — DATA C0RE', 'TouchDesigner & Video Systems — Annecy / Geneva / International — DATA C0RE'],
    ['TouchDesigner programming, video systems, projection, SMODE, LED/DMX and interactive media for theatre, opera, festivals and installations. Based in Annecy, active in Geneva, mobile across Lyon, Grenoble, Paris, France, Switzerland and Europe.', 'TouchDesigner programming, video systems, projection, SMODE, LED/DMX and interactive media for theatre, opera, festivals and installations. Based in Annecy, active in Geneva, mobile across Lyon, Grenoble, Paris, France, Switzerland, Europe and international touring including Brazil.'],
    ['TouchDesigner programming, video systems, projection, SMODE, LED/DMX and interactive media for theatre, opera, festivals and installations across France, Switzerland and Europe.', 'TouchDesigner programming, video systems, projection, SMODE, LED/DMX and interactive media for theatre, opera, festivals and installations across France, Switzerland, Europe and international touring contexts including Brazil.'],
    ['<meta name="twitter:title" content="TouchDesigner & Video Systems — DATA C0RE">', '<meta name="twitter:title" content="TouchDesigner & Video Systems — International — DATA C0RE">'],
    ['<meta name="twitter:description" content="Realtime video, projection, interactive media and stage systems — Annecy / Geneva / Europe.">', '<meta name="twitter:description" content="Realtime video, projection, interactive media and stage systems — Annecy / Geneva / Europe / international touring.">'],
    ['TouchDesigner programming, realtime video systems, projection integration, interactive media, LED and stage media services across France, Switzerland and Europe.', 'TouchDesigner programming, realtime video systems, projection integration, interactive media, LED and stage media services across France, Switzerland, Europe and international touring contexts including Brazil.'],
    ['{"@type":"AdministrativeArea","name":"Europe"}]}', '{"@type":"AdministrativeArea","name":"Europe"},{"@type":"Country","name":"Brazil"},{"@type":"Place","name":"International"}]}'],
    ['<span>France / Switzerland / Europe</span>', '<span>France / Switzerland / Europe / international</span>'],
    ['Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, and for touring, festival and institutional projects throughout Europe.', 'Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, throughout Europe and internationally. International touring includes Comédie de Genève / Christiane Jatahy’s Entre chien et loup, including São Paulo, Brazil.'],
    ['<span>France</span><span>Switzerland</span><span>Europe</span>', '<span>France</span><span>Switzerland</span><span>Europe</span><span>Brazil</span><span>International</span>'],
    ['The location list describes real mobility and production availability. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique.', 'The location list describes real mobility and production availability rather than fictional local offices. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique; international touring through Entre chien et loup, including São Paulo, Brazil.'],
    ['<a href="./projects/comedie.html"><span>Geneva / touring</span><strong>Comédie de Genève</strong><small>video systems / touring / handover ↗</small></a>', '<a href="./projects/comedie.html"><span>Geneva / international</span><strong>Comédie de Genève / Entre chien et loup</strong><small>video systems / touring / São Paulo, Brazil ↗</small></a>']
  ];

  for (const [from, to] of replacements) html = replaceAllLiteral(html, from, to);
  fs.writeFileSync(sourceFile, html);
}

function setMeta(html, kind, key, value) {
  const attr = kind === 'property' ? 'property' : 'name';
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<meta\\s+${attr}=["']${escaped}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

function patchLocalized(lang, seo, replacements) {
  const file = path.join(ROOT, lang, 'services.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.title}</title>`);
  html = setMeta(html, 'name', 'description', seo.description);
  html = setMeta(html, 'property', 'og:title', seo.title);
  html = setMeta(html, 'property', 'og:description', seo.description);
  html = setMeta(html, 'name', 'twitter:title', seo.title);
  html = setMeta(html, 'name', 'twitter:description', seo.description);
  for (const [from, to] of replacements) html = replaceAllLiteral(html, from, to);
  fs.writeFileSync(file, html);
}

patchSource();

patchLocalized('fr', {
  title: 'TouchDesigner & technicien vidéo — Annecy / Genève / international — DATA C0RE',
  description: 'Programmation TouchDesigner, régie et systèmes vidéo, SMODE, projection, mapping, LED/DMX et média interactif pour théâtre, opéra, festivals et installations. Basé à Annecy, actif à Genève, mobile en France, Suisse, Europe et à l’international, avec expérience de tournée au Brésil.'
}, [
  ['France / Switzerland / Europe / international', 'France / Suisse / Europe / international'],
  ['Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, throughout Europe and internationally. International touring includes Comédie de Genève / Christiane Jatahy’s Entre chien et loup, including São Paulo, Brazil.', 'Basé à Annecy, avec une expérience de production importante à Genève. Disponible sur site à Lyon, Grenoble et Paris, partout en France et en Suisse, en Europe et à l’international. La tournée internationale comprend Entre chien et loup de la Comédie de Genève / Christiane Jatahy, notamment à São Paulo, au Brésil.'],
  ['<span>Switzerland</span>', '<span>Suisse</span>'],
  ['<span>Brazil</span>', '<span>Brésil</span>'],
  ['<span>International</span>', '<span>International</span>'],
  ['The location list describes real mobility and production availability rather than fictional local offices. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique; international touring through Entre chien et loup, including São Paulo, Brazil.', 'La liste géographique décrit une mobilité et une disponibilité réelles, pas des bureaux locaux fictifs. Les pages projets servent de preuves : Genève est documentée par Geneva Lux, le Grand Théâtre de Genève et la Comédie de Genève ; Grenoble par Hardwinner / La Belle Électrique ; la tournée internationale par Entre chien et loup, notamment à São Paulo, au Brésil.'],
  ['<span>Geneva / international</span><strong>Comédie de Genève / Entre chien et loup</strong><small>video systems / touring / São Paulo, Brazil ↗</small>', '<span>Genève / international</span><strong>Comédie de Genève / Entre chien et loup</strong><small>systèmes vidéo / tournée / São Paulo, Brésil ↗</small>']
]);

patchLocalized('es', {
  title: 'TouchDesigner y sistemas de vídeo — Annecy / Ginebra / internacional — DATA C0RE',
  description: 'Programación TouchDesigner, sistemas de vídeo, SMODE, proyección, mapping, LED/DMX y medios interactivos para teatro, ópera, festivales e instalaciones. Base en Annecy, actividad en Ginebra y movilidad internacional, incluida experiencia de gira en Brasil.'
}, [
  ['France / Switzerland / Europe / international', 'Francia / Suiza / Europa / internacional'],
  ['Based in Annecy, with substantial production experience in Geneva. Available for on-site work in Lyon, Grenoble and Paris, across France and Switzerland, throughout Europe and internationally. International touring includes Comédie de Genève / Christiane Jatahy’s Entre chien et loup, including São Paulo, Brazil.', 'Con base en Annecy y una amplia experiencia de producción en Ginebra. Disponible para trabajo in situ en Lyon, Grenoble y París, en Francia y Suiza, por toda Europa y a nivel internacional. La gira internacional incluye Entre chien et loup de la Comédie de Genève / Christiane Jatahy, también en São Paulo, Brasil.'],
  ['<span>Switzerland</span>', '<span>Suiza</span>'],
  ['<span>Brazil</span>', '<span>Brasil</span>'],
  ['<span>International</span>', '<span>Internacional</span>'],
  ['The location list describes real mobility and production availability rather than fictional local offices. Project pages remain the evidence layer: Geneva work is documented through Geneva Lux, Grand Théâtre de Genève and Comédie de Genève; Grenoble through Hardwinner / La Belle Électrique; international touring through Entre chien et loup, including São Paulo, Brazil.', 'La lista geográfica describe movilidad y disponibilidad reales, no oficinas locales ficticias. Las páginas de proyectos sirven como prueba: Ginebra está documentada por Geneva Lux, Grand Théâtre de Genève y Comédie de Genève; Grenoble por Hardwinner / La Belle Électrique; la gira internacional por Entre chien et loup, también en São Paulo, Brasil.'],
  ['<span>Geneva / international</span><strong>Comédie de Genève / Entre chien et loup</strong><small>video systems / touring / São Paulo, Brazil ↗</small>', '<span>Ginebra / internacional</span><strong>Comédie de Genève / Entre chien et loup</strong><small>sistemas de vídeo / gira / São Paulo, Brasil ↗</small>']
]);

console.log('Applied international service-area SEO and localized Brazil touring proof.');
