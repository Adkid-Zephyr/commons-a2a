// Separate loopback preview, with same-origin API proxy to the existing backend.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public/spider');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 try{
  const host=req.headers.host;
  if(!['127.0.0.1:3403','localhost:3403'].includes(host)){res.writeHead(403);res.end('Local preview only');return;}
  const url=new URL(req.url,`http://${host}`);
  if(url.pathname==='/api'){
   if(!['GET','POST'].includes(req.method)){res.writeHead(405);res.end();return;}
   if(req.method==='POST'&&req.headers.origin!==`http://${host}`){res.writeHead(403);res.end('Same-origin only');return;}
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>100000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
   const upstream=await fetch(`http://127.0.0.1:3402/api${url.search}`,{method:req.method,redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:3402'},...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
   res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(await upstream.text());return;
  }
  if(req.method!=='GET'){res.writeHead(405);res.end();return;}
  const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.code==='ENOENT'?'Not found':'Preview cannot reach the backend. Start Commons on port 3402.'}));}
}).listen(3403,'127.0.0.1',()=>console.log('Spider alternative: http://127.0.0.1:3403'));
