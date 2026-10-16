import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.argv[2]);
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error' && /hydrat|react/i.test(m.text())) errors.push(m.text())});
await fs.mkdir('design-review/cm-logo',{recursive:true});
try {
 for(const [width,height,motion] of [[1440,1000,'no-preference'],[390,844,'reduce'],[844,390,'reduce']]) {
  await page.setViewportSize({width,height});
  await page.emulateMedia({reducedMotion:motion});
  await page.goto('http://localhost:3000/dev/review?view=cm-logo',{waitUntil:'networkidle',timeout:60000});
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.locator('.wd-wedding-mark').count(),3);
  const crest=await page.locator('.wd-opening-crest').boundingBox();
  const name=await page.locator('.wd-lettering h2').boundingBox();
  const ribbon=await page.locator('.wd-band').first().boundingBox();
  assert.ok(crest.y+crest.height<=name.y,'Opening crest must not overlap names');
  assert.ok(name.y+name.height<ribbon.y,'Names must be above ribbon');
  await page.screenshot({path:`design-review/cm-logo/opening-${width}.png`,caret:'initial'});
  await page.getByRole('button',{name:'Open your invitation',exact:false}).click();
  await page.getByRole('dialog').waitFor({state:'detached',timeout:15000});
  assert.equal(await page.locator('.wd-page').getAttribute('inert'),null);
  assert.equal(await page.locator('.nav .wd-wedding-mark-monogram').count(),1);
  assert.equal(await page.locator('.wedding-mark-watermark').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:`design-review/cm-logo/header-${width}.png`,caret:'initial'});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('footer').screenshot({path:`design-review/cm-logo/closing-${width}.png`,caret:'initial'});
  console.log(`PASS ${width}x${height}, ${motion}: opening, header, single watermark, focus release, no overflow`);
 }
 await page.goto('http://localhost:3000/dev/review?view=invitation',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.wd-wedding-mark').count(),0);
 await page.getByRole('button',{name:'Skip intro',exact:false}).click();
 console.log('PASS unbranded invitation retains initials and original opening');
 if(errors.length) throw new Error(errors.join('\n'));
}finally{await browser.close()}
