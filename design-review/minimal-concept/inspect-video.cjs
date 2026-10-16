const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true}); const p=await b.newPage({viewport:{width:1200,height:800}});
 await p.goto('file:///C:/Users/USER/Videos/small-verostudio-1784471968039-31915.mp4');
 const v=p.locator('video');await v.waitFor();
 await p.waitForFunction(()=>document.querySelector('video').readyState>=2);
 const meta=await v.evaluate(e=>({duration:e.duration,width:e.videoWidth,height:e.videoHeight})); console.log(meta);
 await v.evaluate(e=>{e.pause();e.style.width='1000px';e.style.height='auto';});
 for(let i=0;i<9;i++){
 const t=meta.duration*i/9;
 await v.evaluate((e,t)=>new Promise(r=>{if(Math.abs(e.currentTime-t)<.01)return r();e.addEventListener('seeked',r,{once:true});e.currentTime=t}),t);
 await v.screenshot({path:`design-review/minimal-concept/video-${i}.png`});console.log(i,t.toFixed(2));
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
