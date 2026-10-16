import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed=new Set(['index.html','prototype.html','styles.css','review.js','app.mjs','model.mjs']);
createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(path)){res.writeHead(404);res.end('Not found');return;}
  try{const body=await readFile(new URL(path,import.meta.url));res.writeHead(200,{'Content-Type':path.endsWith('.html')?'text/html; charset=utf-8':path.endsWith('.css')?'text/css':'text/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(500);res.end('Could not load review asset');}
}).listen(4173,'127.0.0.1',()=>console.log('Review 01: http://127.0.0.1:4173'));
