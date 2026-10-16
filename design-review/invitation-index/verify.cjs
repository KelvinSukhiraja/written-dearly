const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const dir='design-review/invitation-index/screenshots';fs.mkdirSync(dir,{recursive:true});
 for(const width of [1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:1000});
  await page.goto('http://localhost:3000/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
  console.log(width,await page.locator('[class*=wordmarkFrame]').evaluate(e=>({wordWidth:e.firstElementChild.scrollWidth,view:innerWidth,doc:document.documentElement.scrollWidth})));
  if(await page.locator('[class*=wordmarkFrame]').evaluate(e=>[...e.firstElementChild.children].some(c=>c.getBoundingClientRect().left<0||c.getBoundingClientRect().right>innerWidth)))throw Error('Clipped wordmark '+width); if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+width);
  await page.locator('[data-index-story]').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100); await page.screenshot({path:`${dir}/home-${width}.png`,fullPage:true,caret:'initial'});
 }
 const next=page.getByRole('button',{name:'Next gallery image',exact:true});
 await next.click();await page.waitForTimeout(1100);
 if(await page.getByRole('button',{pressed:true}).getAttribute('aria-label')!=='Show image 2: White cosmos flowers')throw Error('Next');
 await page.getByRole('button',{pressed:true}).focus();await page.keyboard.press('ArrowLeft');
 if(!(await page.getByRole('button',{pressed:true}).getAttribute('aria-label')).startsWith('Show image 1:'))throw Error('Keyboard');
 await page.keyboard.press('ArrowLeft');
 if(!(await page.getByRole('button',{pressed:true}).getAttribute('aria-label')).startsWith('Show image 9:'))throw Error('Wrap');
 const g=page.locator('[class*=gallery]').first();
 await g.dispatchEvent('touchstart',{touches:[{identifier:0,clientX:200,clientY:300}]});await g.dispatchEvent('touchend',{changedTouches:[{identifier:0,clientX:110,clientY:305}]});
 if(!(await page.getByRole('button',{pressed:true}).getAttribute('aria-label')).startsWith('Show image 1:'))throw Error('Swipe');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 if(await page.getByRole('button',{pressed:true}).evaluate(e=>getComputedStyle(e).transitionDuration)!=='0s')throw Error('Reduced motion');
 await page.reload({waitUntil:'networkidle'});await page.keyboard.press('Tab');if(await page.locator(':focus').textContent()!=='Skip to content')throw Error('Skip');
 await page.keyboard.press('Enter');if(await page.locator(':focus').getAttribute('id')!=='main')throw Error('Skip target');
 console.log('Selection, arrows, wrap, touch, reduced motion and skip link passed');
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto('http://localhost:3000/');
 if(!await nojs.getByRole('heading',{name:'An invitation to remember.'}).isVisible())throw Error('NoJS');
 console.log('No-JS content passed');
 if(errors.length)throw Error(errors.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


