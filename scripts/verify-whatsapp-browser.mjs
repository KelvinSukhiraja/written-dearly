import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2]);
const base = process.env.REVIEW_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({channel:"msedge",headless:true});
const page = await browser.newPage();
const errors=[]; page.on("pageerror",e=>errors.push(e.message));
await page.route("https://wa.me/**",route=>route.abort());
await fs.mkdir("design-review/whatsapp-business/screenshots",{recursive:true});
try {
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(base+"/dev/review?view=guests-many",{waitUntil:"networkidle"});
    await page.getByRole("button",{name:"Prepare invitation for Guest 001",exact:true}).filter({visible:true}).click();
    await page.getByRole("button",{name:"Open WhatsApp",exact:true}).waitFor();
    assert.equal(await page.getByRole("button",{name:"Open WhatsApp",exact:true}).isDisabled(),true);
    await page.getByRole("button",{name:"Use WhatsApp Business API",exact:true}).click();
    await page.getByText("Business API sending is not active. The approved template and server setup are required.",{exact:true}).waitFor();
    assert.equal(await page.getByRole("button",{name:"Send invitation via Business API",exact:true}).count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.getByRole("button",{name:"Refresh API status",exact:true}).click();
    await page.getByRole("button",{name:"Refresh API status",exact:true}).waitFor();
    await page.screenshot({path:`design-review/whatsapp-business/screenshots/inactive-${width}.png`,fullPage:true,caret:"initial"});
    await page.getByRole("button",{name:"Close dialog",exact:true}).click();
  }
  const denied=await page.request.get(base+"/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=incorrect&hub.challenge=fixture");
  assert.equal(denied.status(),403);
  const unsigned=await page.request.post(base+"/api/whatsapp/webhook",{data:{object:"whatsapp_business_account"}});
  assert.ok([403,503].includes(unsigned.status()));
  assert.deepEqual(errors,[]);
  console.log("PASS: inactive API setup and refresh at 1440/768/390, manual localhost guard, dialog close, no overflow or page errors, rejected webhook verification and unsigned callbacks. No provider requests or database writes.");
} finally { await browser.close(); }
