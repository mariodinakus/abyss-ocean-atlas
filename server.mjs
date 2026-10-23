import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon','.png':'image/png','.jpg':'image/jpeg'};
createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url||'/',`http://127.0.0.1:${port}`).pathname);
  const wanted=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!wanted.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  try{if(!(await stat(wanted)).isFile())throw Error('Not file');const data=await readFile(wanted);res.writeHead(200,{'content-type':mime[path.extname(wanted)]||'application/octet-stream','cache-control':'no-cache','x-content-type-options':'nosniff'});res.end(data);}catch{res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`ABYSS dev server: http://localhost:${port}`));