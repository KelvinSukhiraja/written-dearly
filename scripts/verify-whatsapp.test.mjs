import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readConfig, sendTemplate, validSignature, statusReceipts, templateParameters, renderTemplate } from "../src/lib/whatsapp/core.ts";

const env = { WHATSAPP_ENABLED:"true", WHATSAPP_TEMPLATE_APPROVED:"true", WHATSAPP_ACCESS_TOKEN:"fixture-secret", WHATSAPP_PHONE_NUMBER_ID:"123456",
  WHATSAPP_API_VERSION:"v99.0", WHATSAPP_TEMPLATE_NAME:"wedding_invitation", WHATSAPP_TEMPLATE_LANGUAGE:"en_US", APP_URL:"https://wedding.example", WHATSAPP_APP_SECRET:"secret", WHATSAPP_WEBHOOK_VERIFY_TOKEN:"verify" };
const config = readConfig(env);
const params = templateParameters({name:"Alex & Jamie",invited_count:3,public_token:"a".repeat(64)},"Amelia & James","our-wedding",config.origin);
test("API configuration fails closed for disabled, pending and malformed setup", () => {
  assert.ok(config);
  for (const replacement of [{WHATSAPP_ENABLED:"false"},{WHATSAPP_TEMPLATE_APPROVED:"false"},{APP_URL:"http://localhost:3000"},{APP_URL:"not a URL"},{APP_URL:"https://user:pass@wedding.example"},{APP_URL:"https://wedding.example/path"},{WHATSAPP_PHONE_NUMBER_ID:"../bad"},{WHATSAPP_API_VERSION:"latest"},{WHATSAPP_ACCESS_TOKEN:""}]) assert.equal(readConfig({...env,...replacement}),null);
});
test("reviewed body and provider parameters include the same personal link and seat allowance", () => {
  assert.match(renderTemplate(params),/reserved 3 places/);
  assert.match(params[3],/\/i\/our-wedding\?guest=a{64}$/);
  assert.ok(renderTemplate(params).includes("Alex & Jamie"));
  assert.equal(templateParameters({name:"Alex",invited_count:1,public_token:"a"},"Amelia & James","wedding",config.origin)[2],"1 place");
});
test("Cloud API request uses server auth, approved template, international recipient and attempt correlation", async () => {
  const result = await sendTemplate(config,"+62 812-3456-7890",params,"attempt-id",async (url,options) => {
    assert.equal(url,"https://graph.facebook.com/v99.0/123456/messages");
    assert.equal(options.headers.Authorization,"Bearer fixture-secret");
    assert.equal(options.redirect,"error");
    const payload = JSON.parse(options.body);
    assert.equal(payload.to,"6281234567890");
    assert.equal(payload.biz_opaque_callback_data,"attempt-id");
    assert.equal(payload.type,"template");
    assert.deepEqual(payload.template.components[0].parameters.map(p => p.text),params);
    return Response.json({messages:[{id:"wamid.fixture"}]});
  });
  assert.deepEqual(result,{status:"accepted",providerId:"wamid.fixture"});
});
test("network, malformed success and server errors are unknown; only explicit rejection is failed", async () => {
  for (const transport of [async()=>{throw new Error("timeout")},async()=>Response.json({}),async()=>Response.json({error:{code:1}},{status:500})])
    assert.equal((await sendTemplate(config,"+447700900123",params,"attempt",transport)).status,"unknown");
  assert.deepEqual(await sendTemplate(config,"+447700900123",params,"attempt",async()=>Response.json({error:{code:132001,message:"sensitive raw error"}},{status:400})),{status:"failed",code:"132001"});
});
test("invalid phone or template parameters never contact provider", async () => {
  const never = async()=>{assert.fail("Unexpected provider call")};
  assert.equal((await sendTemplate(config,"08123456789",params,"attempt",never)).status,"failed");
  assert.equal((await sendTemplate(config,"+447700900123",["bad\nname",...params.slice(1)],"attempt",never)).status,"failed");
});
test("signature validates exact raw bytes and rejects tampering or malformed hashes", () => {
  const raw = Buffer.from('{"example":true}');
  const sig = "sha256="+createHmac("sha256","secret").update(raw).digest("hex");
  assert.equal(validSignature(raw,sig,"secret"),true);
  for (const signature of [null,"sha256=00","bad",sig.replace(/.$/,sig.endsWith("0")?"1":"0")]) assert.equal(validSignature(raw,signature,"secret"),false);
  assert.equal(validSignature(Buffer.from('{ "example":true}'),sig,"secret"),false);
});
test("receipts scope the sender, ignore chat content, and accept batches with optional callback", () => {
  const value = {metadata:{phone_number_id:"123456"},messages:[{text:{body:"private message"}}],statuses:[{id:"wamid.1",recipient_id:"447700900123",status:"delivered",biz_opaque_callback_data:"00000000-0000-4000-8000-000000000001"},{id:"wamid.2",recipient_id:"447700900123",status:"read"}]};
  const body={object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value}]}]};
  assert.equal(statusReceipts(body,"different-number").length,0);
  const receipts=statusReceipts(body,"123456");
  assert.equal(receipts.length,2); assert.equal(receipts[1].attempt,null);
  assert.ok(!JSON.stringify(receipts).includes("private message"));
  for(const bad of [null,{},[],{object:"whatsapp_business_account",entry:[null]}]) assert.deepEqual(statusReceipts(bad,"123456"),[]);
});
