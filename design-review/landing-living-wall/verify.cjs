const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
 const dir='design-review/landing-living-wall/screenshots';fs.mkdirSync(dir,{recursive:true});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://localhost:3000/',{waitUntil:'networkidle'});
  await page.locator('[data-motion]').waitFor();
  const geometry=await page.locator('[data-wall-story]').evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,travel:e.offsetHeight-e.firstElementChild.offsetHeight}));
  const transforms=[];
  for(const progress of [0,.5,1]){
   await page.evaluate(y=>scrollTo(0,y),progress===0?0:geometry.top+geometry.travel*progress);
   await page.waitForTimeout(150);
   transforms.push(await page.locator('[class*=photoPiece]').evaluate(e=>getComputedStyle(e).transform));
   await page.screenshot({path:`${dir}/${width}-${progress}.png`,caret:'initial'});
  }
  if(new Set(transforms).size!==3) throw Error('Motion did not progress '+width);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Overflow '+width);
  await page.locator('#designs').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${dir}/${width}-designs.png`,caret:'initial'});
  await page.locator('[class*=closing]').scrollIntoViewIfNeeded();
  if(!await page.getByRole('link',{name:'Let’s make it yours'}).isVisible())throw Error('Missing final action');
  console.log('Motion + layout + final action pass',width,JSON.stringify(transforms));
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
 const reduced=await page.locator('[data-wall-story]').evaluate(e=>({p:getComputedStyle(e).getPropertyValue('--progress'),height:e.offsetHeight,stage:e.firstElementChild.offsetHeight}));
 if(reduced.p.trim()!=='1'||reduced.height!==reduced.stage)throw Error('Reduced motion failed '+JSON.stringify(reduced));
 await page.reload({waitUntil:'networkidle'});await page.keyboard.press('Tab');
 if((await page.locator(':focus').textContent())!=='Skip to content')throw Error('Skip link');
 await page.keyboard.press('Enter');
 if((await page.locator(':focus').getAttribute('id'))!=='main')throw Error('Skip target');
 console.log('Reduced motion and keyboard passed');
 await page.setViewportSize({width:390,height:650});await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(150);
 if(await page.locator('[data-wall-stage]').evaluate(e=>getComputedStyle(e).position)==='sticky')throw Error('Short viewport pinned');
 console.log('Short viewport fallback passed');
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto('http://localhost:3000/');
 if(!await nojs.getByRole('link',{name:'Make it yours',exact:true}).isVisible())throw Error('No-JS CTA');
 console.log('No-JS content passed');
 if(errors.length)throw Error(errors.join('\n'));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
