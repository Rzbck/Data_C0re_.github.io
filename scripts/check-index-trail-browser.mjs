import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const locales=['en','fr','es'];
const expectedTitles={
  en:['Archive','CV','Contact'],
  fr:['Archives','CV','Contact'],
  es:['Archivo','CV','Contacto']
};
const failures=[];
const fail=(label,detail)=>failures.push(`${label}: ${detail}`);

const browser=await chromium.launch({headless:true});

for(const lang of locales){
  const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'no-preference'});
  const page=await context.newPage();
  const label=`desktop ${lang}`;
  await page.goto(`${base}/${lang}/`,{waitUntil:'domcontentloaded',timeout:30000});

  try{
    await page.waitForFunction(()=>document.querySelectorAll('.site-menu .menu-card-title--trail').length===3,null,{timeout:5000});
  }catch{
    fail(label,'INDEX trail titles were not prepared');
  }

  const structure=await page.evaluate(()=>[...document.querySelectorAll('.site-menu .menu-card')].map(card=>({
    title:card.querySelector('.home-gate-title__front')?.textContent?.trim()||'',
    echoes:card.querySelectorAll('.home-gate-title__echo').length
  })));
  if(structure.length!==3)fail(label,`expected 3 INDEX cards, got ${structure.length}`);
  if(JSON.stringify(structure.map(item=>item.title))!==JSON.stringify(expectedTitles[lang]))fail(label,`localized INDEX titles differ: ${JSON.stringify(structure.map(item=>item.title))}`);
  structure.forEach((item,index)=>{if(item.echoes!==6)fail(label,`card ${index+1} expected 6 trail echoes, got ${item.echoes}`)});

  await page.click('[data-menu-toggle]');
  await page.waitForSelector('.site-menu.open');
  const cards=page.locator('.site-menu .menu-card');
  for(let i=0;i<await cards.count();i++){
    const card=cards.nth(i);
    const box=await card.boundingBox();
    if(!box){fail(label,`card ${i+1} has no bounding box`);continue;}
    await page.mouse.move(box.x+box.width*.78,box.y+box.height*.42);
    await page.waitForTimeout(180);
    const state=await card.evaluate(el=>({
      trailing:el.classList.contains('is-gate-trailing'),
      opacity:getComputedStyle(el.querySelector('.home-gate-title__echo--1')).opacity,
      magnetX:getComputedStyle(el).getPropertyValue('--menu-magnet-x').trim()
    }));
    if(!state.trailing)fail(label,`card ${i+1} did not activate directional trail`);
    if(Number(state.opacity)<.75)fail(label,`card ${i+1} first echo did not visibly resolve, opacity ${state.opacity}`);
    if(!state.magnetX||state.magnetX==='0px')fail(label,`card ${i+1} magnetic title displacement did not update`);
  }
  await context.close();

  const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
  const touchPage=await touchContext.newPage();
  const touchLabel=`touch ${lang}`;
  await touchPage.goto(`${base}/${lang}/`,{waitUntil:'domcontentloaded',timeout:30000});
  try{
    await touchPage.waitForFunction(()=>document.querySelectorAll('.site-menu .menu-card-title--trail').length===3,null,{timeout:5000});
    const displays=await touchPage.evaluate(()=>[...document.querySelectorAll('.site-menu .home-gate-title__echo')].map(el=>getComputedStyle(el).display));
    if(displays.some(display=>display!=='none'))fail(touchLabel,'trail echoes must stay hidden on touch/mobile');
  }catch{
    fail(touchLabel,'INDEX trail preparation missing on localized mobile DOM');
  }
  await touchContext.close();
}

await browser.close();

if(failures.length){
  console.error(`INDEX directional trail audit failed with ${failures.length} issue(s):`);
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}

console.log('INDEX directional trail OK: EN / FR / ES desktop interaction matches Home gates and touch/mobile stays static.');
