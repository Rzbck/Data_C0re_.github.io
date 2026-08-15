import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const locales = ['en','fr','es'];
const routes = ['', 'archive.html', 'cv.html', 'contact.html'];
const viewports = [
  { name:'mobile-small', width:360, height:800 },
  { name:'mobile', width:390, height:844 },
  { name:'ipad-portrait', width:768, height:1024 },
  { name:'ipad-landscape', width:1024, height:768 },
  { name:'tablet-large', width:834, height:1194 },
  { name:'laptop', width:1366, height:768 },
  { name:'desktop', width:1920, height:1080 }
];

const failures = [];
const browser = await chromium.launch({ headless:true });

function fail(label, detail){ failures.push(`${label}: ${detail}`); }
function overlaps(a,b){
  return a && b && !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

for (const vp of viewports) {
  const context = await browser.newContext({ viewport:{width:vp.width,height:vp.height}, reducedMotion:'no-preference' });
  for (const lang of locales) {
    for (const route of routes) {
      const page = await context.newPage();
      const label = `${vp.name} ${lang}/${route || 'index'}`;
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(String(err.message || err)));
      await page.goto(`${base}/${lang}/${route}`, { waitUntil:'domcontentloaded', timeout:30000 });
      await page.waitForTimeout(250);

      const checks = await page.evaluate(() => {
        const q = s => document.querySelector(s);
        const qa = s => [...document.querySelectorAll(s)];
        const rect = el => el ? el.getBoundingClientRect().toJSON() : null;
        const html = document.documentElement;
        const body = document.body;
        const header = q('.site-header');
        const primary = qa('.site-header [data-v2-primary]');
        const langs = qa('.site-header .lang-switcher a[data-lang]');
        return {
          viewportMeta: !!q('meta[name="viewport"]'),
          horizontalOverflow: Math.max(html.scrollWidth, body?.scrollWidth || 0) - window.innerWidth,
          header: rect(header),
          primary: primary.map(el => ({text:el.textContent.trim(), rect:rect(el), visible:!!(el.offsetWidth||el.offsetHeight)})),
          langs: langs.map(el => ({text:el.textContent.trim(), rect:rect(el), visible:!!(el.offsetWidth||el.offsetHeight)})),
          motionToggle: !!q('.motion-toggle:not([style*="display:none"])'),
          contactLayout: rect(q('.contact-layout')),
          contactInputs: qa('.contact-field input,.contact-field textarea,.contact-field select').map(rect),
          archiveControls: rect(q('.archive-controls')),
          homePanels: qa('[data-home-panel]').map(rect)
        };
      });

      if (!checks.viewportMeta) fail(label,'missing viewport meta');
      if (checks.horizontalOverflow > 3) fail(label,`horizontal overflow ${checks.horizontalOverflow}px`);
      if (checks.motionToggle) fail(label,'motion toggle still present');
      if (checks.primary.length !== 4) fail(label,`expected 4 primary nav links, got ${checks.primary.length}`);
      if (checks.langs.length !== 3) fail(label,`expected 3 language links, got ${checks.langs.length}`);

      const allHeaderItems = [...checks.primary, ...checks.langs].filter(x => x.visible && x.rect);
      for (const item of allHeaderItems) {
        if (item.rect.left < -1 || item.rect.right > vp.width + 1) fail(label,`header item outside viewport: ${item.text}`);
      }
      for (let i=0;i<allHeaderItems.length;i++) {
        for (let j=i+1;j<allHeaderItems.length;j++) {
          if (overlaps(allHeaderItems[i].rect, allHeaderItems[j].rect)) fail(label,`header overlap: ${allHeaderItems[i].text} / ${allHeaderItems[j].text}`);
        }
      }

      if (route === 'contact.html') {
        for (const r of checks.contactInputs) {
          if (!r) continue;
          if (r.left < -1 || r.right > vp.width + 1) fail(label,'contact field outside viewport');
        }
      }
      if (route === 'archive.html' && checks.archiveControls) {
        if (checks.archiveControls.left < -1 || checks.archiveControls.right > vp.width + 1) fail(label,'archive controls outside viewport');
      }
      if (route === '' && vp.width <= 900) {
        for (const r of checks.homePanels) {
          if (!r) continue;
          if (r.left < -1 || r.right > vp.width + 1) fail(label,'home panel outside viewport');
        }
      }

      const relevantErrors = pageErrors.filter(msg => !/turnstile|cloudflare|Failed to fetch/i.test(msg));
      if (relevantErrors.length) fail(label,`page errors: ${relevantErrors.join(' | ')}`);
      await page.close();
    }
  }
  await context.close();
}

await browser.close();

if (failures.length) {
  console.error(`Responsive release audit failed with ${failures.length} issue(s):`);
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log(`Responsive release audit passed: ${viewports.length} viewports × ${locales.length} locales × ${routes.length} routes.`);
