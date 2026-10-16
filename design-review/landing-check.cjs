const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 require('node:fs').mkdirSync('design-review/landing-2026-10-15/screenshots',{recursive:true});
 for(const width of [1440,768,390,320]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://localhost:3000/',{waitUntil:'networkidle'});
 await page.screenshot({path:`design-review/landing-2026-10-15/screenshots/landing-${width}.png`,fullPage:true,caret:'initial'});
 const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,links:[...document.querySelectorAll('main a')].map(a=>a.getAttribute('href'))}));
 if(result.overflow) throw Error('Overflow '+width);
 console.log(width,JSON.stringify(result));
 }
 await page.keyboard.press('Tab'); console.log('First focus:',await page.locator(':focus').textContent());
 await page.keyboard.press('Enter'); console.log('Skip target:',await page.locator(':focus').getAttribute('id'));
 await page.emulateMedia({reducedMotion:'reduce'}); await page.reload({waitUntil:'networkidle'});
 console.log('Reduced motion opacity:',await page.locator('h1').evaluate(e=>getComputedStyle(e).opacity));
 if(errors.length) throw Error(errors.join('\n'));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
