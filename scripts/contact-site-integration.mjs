import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const configFile = path.join(ROOT, 'assets/js/contact-config.js');
const configSource = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf8') : '';
const enabled = /enabled\s*:\s*true\b/.test(configSource);

const languageFor = rel => rel.startsWith('fr/') ? 'fr' : rel.startsWith('es/') ? 'es' : rel.startsWith('en/') ? 'en' : 'en';
const contactHrefFor = rel => rel.startsWith('fr/') ? 'fr/contact.html' : rel.startsWith('es/') ? 'es/contact.html' : rel.startsWith('en/') ? 'en/contact.html' : 'contact.html';
const contactLabelFor = rel => languageFor(rel) === 'es' ? 'Contacto' : 'Contact';

function htmlFiles() {
  const files = [];
  const roots = ['', 'projects', 'en', 'en/projects', 'fr', 'fr/projects', 'es', 'es/projects'];
  for (const dir of roots) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (!name.endsWith('.html')) continue;
      files.push(path.posix.join(dir, name).replace(/^\//, ''));
    }
  }
  return files;
}

function writeIfChanged(file, before, after) {
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}

function updateNavigation(rel) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let html = before
    .replace(/<a\b[^>]*data-contact-nav(?:="[^"]*")?[^>]*>[^<]*<\/a>/gi, '')
    .replace(/<a\b[^>]*data-contact-direct(?:="[^"]*")?[^>]*>[^<]*<\/a>/gi, '');

  if (enabled && !rel.endsWith('404.html')) {
    const href = contactHrefFor(rel);
    const label = contactLabelFor(rel);
    html = html.replace(/(<div class="menu-links">)([\s\S]*?)(<\/div>)/i, (match, open, links, close) => {
      if (/data-contact-nav/i.test(links)) return match;
      return `${open}${links}<a href="${href}" data-contact-nav="1">${label}</a>${close}`;
    });
    html = html.replace(/(<button class="menu-toggle"[^>]*data-menu-toggle[^>]*>)/i, `<a class="nav-text contact-direct" style="display:inline-flex" href="${href}" data-contact-direct="1">${label}</a>$1`);
  }

  writeIfChanged(file, before, html);
}

function setRobots(html, content) {
  if (/<meta\s+name="robots"[^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="${content}">`);
  }
  return html.replace('</head>', `<meta name="robots" content="${content}">\n</head>`);
}

function setTitle(html, value) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);
}

function setMeta(html, attr, key, value) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\s+${attr}="${escaped}"[^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${value.replace(/"/g, '&quot;')}">`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}\n</head>`);
}

const localized = {
  fr: {
    title: 'Contact — projets, TouchDesigner & vidéo — DATA C0RE',
    description: 'Contacter DATA C0RE pour projets artistiques, TouchDesigner, systèmes vidéo temps réel, projection, théâtre, opéra, live AV et installations.',
    replacements: [
      ['Skip to contact form', 'Aller au formulaire de contact'],
      ['Contact / projects / production', 'Contact / projets / production'],
      ["LET'S<br>TALK.", 'PARLONS<br>PROJET.'],
      ['For artistic projects, TouchDesigner development, realtime video systems, projection, theatre / opera, live AV, installations and technical collaborations.', 'Pour les projets artistiques, le développement TouchDesigner, les systèmes vidéo temps réel, la projection, le théâtre / opéra, le live AV, les installations et les collaborations techniques.'],
      ['Annecy / Geneva / France / Switzerland / Europe / international', 'Annecy / Genève / France / Suisse / Europe / international'],
      ['Message / 01', 'Message / 01'],
      ['Name *', 'Nom *'],
      ['Name', 'Nom'],
      ['Organisation', 'Organisation'],
      ['Studio / theatre / festival / company', 'Studio / théâtre / festival / structure'],
      ['Email *', 'E-mail *'],
      ['Subject *', 'Objet *'],
      ['Project / role / collaboration', 'Projet / poste / collaboration'],
      ['Message *', 'Message *'],
      ['Context, location, dates and what you would like to discuss.', 'Contexte, lieu, dates et ce que vous souhaitez envisager.'],
      ['Send message', 'Envoyer'],
      ['Secure contact is being configured.', 'Le contact sécurisé est en cours de configuration.'],
      ['Your details are used only to answer your enquiry. No mailing list and no public email address. Automated abuse protection is provided by Cloudflare Turnstile.', 'Vos informations servent uniquement à répondre à votre demande. Aucune liste de diffusion et aucune adresse e-mail publique. La protection automatisée contre les abus est assurée par Cloudflare Turnstile.'],
      ['Work', 'Travail'],
      ['Services', 'Services'],
      ['About', 'À propos']
    ]
  },
  es: {
    title: 'Contacto — proyectos, TouchDesigner y vídeo — DATA C0RE',
    description: 'Contactar con DATA C0RE para proyectos artísticos, TouchDesigner, sistemas de vídeo en tiempo real, proyección, teatro, ópera, live AV e instalaciones.',
    replacements: [
      ['Skip to contact form', 'Ir al formulario de contacto'],
      ['Contact / projects / production', 'Contacto / proyectos / producción'],
      ["LET'S<br>TALK.", 'HABLEMOS<br>DE PROYECTO.'],
      ['For artistic projects, TouchDesigner development, realtime video systems, projection, theatre / opera, live AV, installations and technical collaborations.', 'Para proyectos artísticos, desarrollo TouchDesigner, sistemas de vídeo en tiempo real, proyección, teatro / ópera, live AV, instalaciones y colaboraciones técnicas.'],
      ['Annecy / Geneva / France / Switzerland / Europe / international', 'Annecy / Ginebra / Francia / Suiza / Europa / internacional'],
      ['Message / 01', 'Mensaje / 01'],
      ['Name *', 'Nombre *'],
      ['Name', 'Nombre'],
      ['Organisation', 'Organización'],
      ['Studio / theatre / festival / company', 'Estudio / teatro / festival / organización'],
      ['Email *', 'Email *'],
      ['Subject *', 'Asunto *'],
      ['Project / role / collaboration', 'Proyecto / puesto / colaboración'],
      ['Message *', 'Mensaje *'],
      ['Context, location, dates and what you would like to discuss.', 'Contexto, lugar, fechas y lo que te gustaría plantear.'],
      ['Send message', 'Enviar'],
      ['Secure contact is being configured.', 'El contacto seguro está en proceso de configuración.'],
      ['Your details are used only to answer your enquiry. No mailing list and no public email address. Automated abuse protection is provided by Cloudflare Turnstile.', 'Tus datos se utilizan únicamente para responder a tu consulta. Sin lista de correo y sin dirección de email pública. La protección automatizada contra abusos utiliza Cloudflare Turnstile.'],
      ['Work', 'Trabajos'],
      ['Services', 'Servicios'],
      ['About', 'Acerca de']
    ]
  }
};

function localizeContact(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  const lang = languageFor(rel);
  const liveRobots = enabled ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow,noarchive';
  html = setRobots(html, liveRobots);

  if (localized[lang]) {
    const locale = localized[lang];
    html = setTitle(html, locale.title);
    html = setMeta(html, 'name', 'description', locale.description);
    html = setMeta(html, 'property', 'og:title', locale.title);
    html = setMeta(html, 'property', 'og:description', locale.description);
    html = setMeta(html, 'name', 'twitter:title', locale.title);
    html = setMeta(html, 'name', 'twitter:description', locale.description);
    for (const [from, to] of locale.replacements) html = html.split(from).join(to);
  }

  writeIfChanged(file, before, html);
}

for (const rel of htmlFiles()) updateNavigation(rel);
for (const rel of ['contact.html', 'en/contact.html', 'fr/contact.html', 'es/contact.html']) localizeContact(rel);

const sitemapFile = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapFile) && !enabled) {
  const before = fs.readFileSync(sitemapFile, 'utf8');
  const after = before.replace(/<url>[\s\S]*?<\/url>/g, block => block.includes('/contact.html') ? '' : block);
  writeIfChanged(sitemapFile, before, after);
}

console.log(`Contact integration: ${enabled ? 'LIVE' : 'STAGED'}.`);
