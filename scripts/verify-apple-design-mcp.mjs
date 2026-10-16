// Read-only MCP smoke test. Does not modify the website or Codex configuration.
import { spawn } from 'node:child_process';
const entry = process.argv[2];
if (!entry) throw new Error('Pass the installed apple-design-mcp dist/cli.js path.');
const child = spawn(process.execPath, [entry, 'mcp'], { windowsHide: true, stdio: ['pipe','pipe','pipe'] });
let seq = 0, buffer = '';
const pending = new Map();
child.stdout.on('data', data => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0,end); buffer = buffer.slice(end+1);
    if (!line.trim()) continue;
    const result = JSON.parse(line);
    if (pending.has(result.id)) { pending.get(result.id)(result); pending.delete(result.id); }
  }
});
child.stderr.on('data', data => process.stderr.write(data));
function send(method, params, notify=false) {
  const id = ++seq;
  const response = notify ? Promise.resolve() : new Promise((resolve,reject) => {
    const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 55000);
    pending.set(id, value => { clearTimeout(timer); value.error ? reject(new Error(JSON.stringify(value.error))) : resolve(value.result); });
  });
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',...(!notify && {id}),method,params})+'\n');
  return response;
}
try {
  const init = await send('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'written-dearly-verification',version:'1.0'}});
  console.log('Initialized:',init.serverInfo);
  await send('notifications/initialized',{},true);
  const list = await send('tools/list',{});
  console.log('Tools:',list.tools.map(t=>t.name).join(', '));
  for (const query of ['typography','layout','navigation','accessibility']) {
    const search = await send('tools/call',{name:'hig_search',arguments:{query,limit:2}});
    if (search.isError) throw new Error(JSON.stringify(search));
    console.log('\nSEARCH',query,JSON.stringify(search.structuredContent));
    const hit = search.structuredContent?.hits?.[0];
    if (!hit) throw new Error(`No results: ${query}`);
    const page = await send('tools/call',{name:'hig_get',arguments:{topic:hit.slug}});
    if (page.isError) throw new Error(JSON.stringify(page));
    console.log('PAGE',JSON.stringify(page.structuredContent));
    console.log(page.content.filter(c=>c.type==='text').map(c=>c.text).join('\n').slice(0,5500));
  }
} finally { child.stdin.end(); child.kill(); }
