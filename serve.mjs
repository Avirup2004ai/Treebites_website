import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const portArgument=process.argv.indexOf('--port');
const port=portArgument>=0?Number(process.argv[portArgument+1]):5173;
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Specify a valid port with --port.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const publicFiles=new Set(['','index.html','404.html','robots.txt','sitemap.xml','llms.txt','llms-full.txt','catalogue.json']);
function notFound(req,res){
 res.writeHead(404,{'Content-Type':types['.html'],'X-Robots-Tag':'noindex','Cache-Control':'no-store'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(root,'404.html')).pipe(res);
}
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return}
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end('Bad request');return}
 const filePath=path.resolve(root,'.'+pathname);
 if(!filePath.startsWith(root+path.sep)&&filePath!==root){res.writeHead(403).end('Forbidden');return}
 const relative=path.relative(root,filePath).split(path.sep).join('/');
 if(!publicFiles.has(relative)&&!/^(assets|products|categories|our-story|sitemap)(\/|$)/.test(relative)){notFound(req,res);return}
 if(pathname.endsWith('/index.html')){res.writeHead(308,{Location:pathname.slice(0,-10)}).end();return}
 let file=filePath;
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
  if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'}).end();return}
  file=path.join(file,'index.html');
 }
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()||relative==='404.html'){notFound(req,res);return}
 const stat=fs.statSync(file);
 const etag=`W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
 const extension=path.extname(file);
 const headers={'Content-Type':types[extension]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':extension==='.html'?'no-cache':'public, max-age=3600',ETag:etag,'Last-Modified':stat.mtime.toUTCString()};
 if(req.headers['if-none-match']===etag){res.writeHead(304,headers).end();return}
 res.writeHead(200,{...headers,'Content-Length':stat.size});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.listen(port,'127.0.0.1',()=>console.log(`TreeBites local preview: http://127.0.0.1:${port}/`));
