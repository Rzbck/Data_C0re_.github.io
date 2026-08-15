import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const locales = ['en','fr','es'];
const coreRoutes = ['', 'archive.html', 'cv.html', 'contact.html'];
const projectDir = lang => path.join(process.cwd(), lang, 'projects');
const projectFiles = fs.readdirSync(projectDir('en')).filter(name => name.endsWith('.html')).sort();
const routes = [...coreRoutes, ...projectFiles.map(name => `projects/${name}`)];
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
function fail(label, detail){ failures.push(`${label}: ${detail}`); }
function overlaps(a,b){
  return a && b && !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

for (const lang of locales) {
  const files = fs.readdirSync(projectDir(lang)).filter(name => name.endsWith('.html')).sort();
  if (JSON.stringify(files) !== JSON.stringify(projectFiles)) {
    fail(`locale ${lang}`, `project route mismatch; expected ${projectFiles.join(', ')}, got ${files.join(', ')}`);
  }
}

const browser = await chromium.launch({ headless:true });

for (const vp of viewports) {
  const context = await browser.newContext({ viewport:{width:vp.width,height:vp.height}, reducedMotion:'no-preference' });
  for (const lang of locales) {
    for (const route of routes) {
      const page = await context.newPage();
      const label = `${vp.name} ${lang}/${route || 'index'}`;
      const isProject = route.startsWith('projects/');
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(String(err.message || err)));
      await page.goto(`${base}/${lang}/${route}`, { waitUntil:'domcontentloaded', timeout:30000 });
      await page.waitForTimeout(route === 'archive.html' ? 260 : 150);

      const checks = await page.evaluate(async ({isProject}) => {
        const q = s => document.querySelector(s);
        const qa = s => [...document.querySelectorAll(s)];
        const rect = el => el ? el.getBoundingClientRect().toJSON() : null;
        const visible = el => {
          if (!el) return false;
          const style = getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        };
        const describe = el => {
          const id = el.id ? `#${el.id}` : '';
          const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().replace(/\s+/g,'.')}` : '';
          return `${el.tagName.toLowerCase()}${id}${cls}`;
        };
        const html = document.documentElement;
        const body = document.body;
        const primary = qa('.site-header [data-v2-primary]');
        const langs = qa('.site-header .lang-switcher a[data-lang]');

        const clippingSelectors = [
          '.signal-hero-system', '.signal-tech-grid', '.project-grid', '.stack-grid',
          '.route', '.system-flow', '.stats-grid', '.tech-tabs', '.project-next',
          '.project-facts', '.production-facts', '.stage-facts', '.pro-metrics',
          '.install-steps', '.pro-responsibilities', '.experience-motion-grid',
          '.fabrication-grid'
        ];
        const clippedContainers = clippingSelectors.flatMap(selector => qa(selector).map((el, index) => {
          const style = getComputedStyle(el);
          const overflowX = style.overflowX;
          const overflowY = style.overflowY;
          const clipsX = /hidden|clip/.test(overflowX) && el.scrollWidth > el.clientWidth + 3;
          const clipsY = /hidden|clip/.test(overflowY) && el.scrollHeight > el.clientHeight + 3;
          return {selector, index, clipsX, clipsY, scrollWidth:el.scrollWidth, clientWidth:el.clientWidth, scrollHeight:el.scrollHeight, clientHeight:el.clientHeight};
        })).filter(item => item.clipsX || item.clipsY);

        const overflowingElements = qa('body *').filter(el => {
          if (!visible(el)) return false;
          const r = el.getBoundingClientRect();
          return r.left < -3 || r.right > window.innerWidth + 3;
        }).map(el => {
          const r = el.getBoundingClientRect();
          return {name:describe(el), left:Math.round(r.left), right:Math.round(r.right), width:Math.round(r.width), scrollWidth:el.scrollWidth, clientWidth:el.clientWidth};
        }).sort((a,b) => Math.max(0,b.right-window.innerWidth,-b.left) - Math.max(0,a.right-window.innerWidth,-a.left)).slice(0,8);

        const projectBlocks = isProject ? qa('.project-hero,.project-section,.project-next').map((el, index) => ({index, rect:rect(el)})) : [];
        const projectTitle = isProject ? rect(q('.project-hero h1')) : null;
        const signalSystem = rect(q('.signal-hero-system'));
        const signalNodes = qa('.signal-node').map(el => ({rect:rect(el), visible:visible(el)}));
        const signalTech = qa('.signal-tech-grid article').map(el => ({rect:rect(el), visible:visible(el)}));

        const archiveTagMismatches=[];
        const archiveDatasetMismatches=[];
        const tagSelect=q('[data-archive-tag-filter]');
        const archiveEntries=qa('.archive-entry[data-archive-project]');
        if(tagSelect&&archiveEntries.length){
          try{
            const taxonomy=await fetch(new URL('data/project-taxonomy.json',document.baseURI),{credentials:'same-origin'}).then(r=>r.json());
            await new Promise(resolve=>setTimeout(resolve,80));
            const projects=taxonomy?.projects||{};
            for(const entry of archiveEntries){
              const slug=entry.dataset.archiveProject;
              const actual=(entry.dataset.archiveTags||'').split(/\s+/).filter(Boolean).sort();
              const expected=[...(projects[slug]||[])].sort();
              if(JSON.stringify(actual)!==JSON.stringify(expected))archiveDatasetMismatches.push(`${slug}: DOM=${actual.join(',')} taxonomy=${expected.join(',')}`);
            }
            for(const option of [...tagSelect.options].filter(option=>option.value&&option.value!=='all')){
              const tag=option.value;
              tagSelect.value=tag;
              tagSelect.dispatchEvent(new Event('change',{bubbles:true}));
              const actual=archiveEntries.filter(entry=>!entry.hidden).map(entry=>entry.dataset.archiveProject).sort();
              const expected=Object.entries(projects).filter(([,tags])=>Array.isArray(tags)&&tags.includes(tag)).map(([slug])=>slug).sort();
              if(JSON.stringify(actual)!==JSON.stringify(expected))archiveTagMismatches.push(`${tag}: visible=${actual.join(',')} expected=${expected.join(',')}`);
            }
            tagSelect.value='all';
            tagSelect.dispatchEvent(new Event('change',{bubbles:true}));
          }catch(error){
            archiveTagMismatches.push(`taxonomy fetch/check failed: ${String(error?.message||error)}`);
          }
        }

        return {
          viewportMeta: !!q('meta[name="viewport"]'),
          horizontalOverflow: Math.max(html.scrollWidth, body?.scrollWidth || 0) - window.innerWidth,
          overflowingElements,
          primary: primary.map(el => ({text:el.textContent.trim(), rect:rect(el), visible:visible(el)})),
          langs: langs.map(el => ({text:el.textContent.trim(), rect:rect(el), visible:visible(el)})),
          motionToggleVisible: qa('.motion-toggle').some(visible),
          contactInputs: qa('.contact-field input,.contact-field textarea,.contact-field select').map(rect),
          archiveControls: rect(q('.archive-controls')),
          archiveTagMismatches,
          archiveDatasetMismatches,
          homePanels: qa('[data-home-panel]').map(rect),
          projectBlocks,
          projectTitle,
          clippedContainers,
          signalSystem,
          signalNodes,
          signalTech
        };
      }, {isProject});

      if (!checks.viewportMeta) fail(label,'missing viewport meta');
      if (checks.horizontalOverflow > 3) {
        const offenders = checks.overflowingElements.map(x => `${x.name}[${x.left}..${x.right}]`).join(', ');
        fail(label,`horizontal overflow ${checks.horizontalOverflow}px${offenders ? `; offenders: ${offenders}` : ''}`);
      }
      if (checks.motionToggleVisible) fail(label,'motion toggle visible');
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
      if (route === 'archive.html') {
        if (checks.archiveControls && (checks.archiveControls.left < -1 || checks.archiveControls.right > vp.width + 1)) fail(label,'archive controls outside viewport');
        for(const mismatch of checks.archiveDatasetMismatches)fail(label,`archive taxonomy sync mismatch: ${mismatch}`);
        for(const mismatch of checks.archiveTagMismatches)fail(label,`archive tag filter mismatch: ${mismatch}`);
      }
      if (route === '' && vp.width <= 900) {
        for (const r of checks.homePanels) {
          if (!r) continue;
          if (r.left < -1 || r.right > vp.width + 1) fail(label,'home panel outside viewport');
        }
      }

      if (isProject) {
        if (!checks.projectTitle) fail(label,'missing project title');
        if (checks.projectTitle && (checks.projectTitle.left < -1 || checks.projectTitle.right > vp.width + 2)) {
          fail(label,'project title outside viewport');
        }
        for (const block of checks.projectBlocks) {
          const r = block.rect;
          if (!r) continue;
          if (r.left < -1 || r.right > vp.width + 2) fail(label,`project block ${block.index} outside viewport`);
        }
        for (const item of checks.clippedContainers) {
          fail(label,`${item.selector}[${item.index}] clips content (${item.scrollWidth}×${item.scrollHeight} inside ${item.clientWidth}×${item.clientHeight})`);
        }
      }

      if (route.endsWith('projects/signal.html') && vp.width <= 900) {
        if (!checks.signalSystem) fail(label,'missing SIGNAL pipeline');
        if (checks.signalNodes.length !== 5 || checks.signalNodes.some(node => !node.visible)) {
          fail(label,`SIGNAL pipeline expected 5 visible nodes, got ${checks.signalNodes.filter(node=>node.visible).length}`);
        }
        if (checks.signalSystem) {
          for (const [index,node] of checks.signalNodes.entries()) {
            if (!node.rect) continue;
            if (node.rect.bottom > checks.signalSystem.bottom + 2 || node.rect.top < checks.signalSystem.top - 2) {
              fail(label,`SIGNAL node ${index+1} clipped by pipeline container`);
            }
          }
        }
        if (checks.signalTech.length !== 5 || checks.signalTech.some(item => !item.visible)) {
          fail(label,`SIGNAL tech grid expected 5 visible cards, got ${checks.signalTech.filter(item=>item.visible).length}`);
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
console.log(`Responsive release audit passed: ${viewports.length} viewports × ${locales.length} locales × ${routes.length} routes (${projectFiles.length} project pages per locale), with canonical Archive tag-filter parity.`);
