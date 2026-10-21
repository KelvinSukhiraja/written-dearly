// Run only against the temporary local server configured with documented dummy secrets.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
const base="http://127.0.0.1:3016/api/whatsapp/webhook";
const sign=raw=>"sha256="+createHmac("sha256","fixture-secret").update(raw).digest("hex");
const verify=await fetch(base+"?hub.mode=subscribe&hub.verify_token=fixture-verify&hub.challenge=fixture-challenge");
assert.equal(verify.status,200); assert.equal(await verify.text(),"fixture-challenge");
assert.equal((await fetch(base+"?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=fixture")).status,403);
const raw=JSON.stringify({object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value:{metadata:{phone_number_id:"123456"},messages:[{text:{body:"fictional incoming chat ignored"}}],statuses:[]}}]}]});
const post=(body,signature)=>fetch(base,{method:"POST",headers:{"Content-Type":"application/json",...(signature?{"x-hub-signature-256":signature}:{})},body});
assert.equal((await post(raw,sign(raw))).status,200);
assert.equal((await post(raw,null)).status,403);
assert.equal((await post(raw+" ",sign(raw))).status,403);
assert.equal((await post("{",sign("{"))).status,400);
const large="x".repeat(256*1024+1);
assert.equal((await post(large,sign(large))).status,413);
console.log("PASS: webhook challenge, wrong token, valid raw-body HMAC with ignored chat, absent/tampered signatures, invalid signed JSON and actual-body size limit. No receipt writes or provider calls.");
