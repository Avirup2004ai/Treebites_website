import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=5187;
const child=spawn(process.execPath,['serve.mjs','--port',String(port)],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
const origin=`http://127.0.0.1:${port}`;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server did not become ready')),10000);child.stdout.on('data',data=>{if(data.toString().includes('local preview')){clearTimeout(timer);resolve()}});child.once('error',reject);child.stderr.on('data',data=>reject(Error(data.toString())));child.once('exit',code=>{if(code)reject(Error(`Server exited ${code}`))})});
 let checked=0;
 for(const [route,type] of [['/','text/html'],['/our-story/','text/html'],['/categories/','text/html'],['/assets/story.css','text/css'],['/assets/collections.css','text/css'],['/products/','text/html'],['/products/healthy-mix/','text/html'],['/categories/seeds-and-mixes/','text/html'],['/sitemap/','text/html'],['/sitemap.xml','application/xml'],['/robots.txt','text/plain'],['/llms.txt','text/plain'],['/llms-full.txt','text/plain'],['/catalogue.json','application/json'],['/assets/fonts/sora-latin.woff2','font/woff2']]){
  const response=await fetch(origin+route);assert.equal(response.status,200,route);assert.ok(response.headers.get('content-type').startsWith(type));await response.arrayBuffer();checked++;
 }
 for(const route of ['/missing-product/','/src/research.json','/.openai/hosting.json','/404.html']){const response=await fetch(origin+route);assert.equal(response.status,404,route);assert.equal(response.headers.get('x-robots-tag'),'noindex');await response.text();checked++}
 for(const [route,destination] of [['/products','/products/'],['/products/index.html','/products/'],['/our-story','/our-story/'],['/our-story/index.html','/our-story/'],['/index.html','/']]){const response=await fetch(origin+route,{redirect:'manual'});assert.equal(response.status,308);assert.equal(response.headers.get('location'),destination);checked++}
 const head=await fetch(origin+'/sitemap.xml',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 const response=await fetch(origin+'/assets/site.js');const etag=response.headers.get('etag');await response.text();assert.equal((await fetch(origin+'/assets/site.js',{headers:{'If-None-Match':etag}})).status,304);
 console.log(JSON.stringify({status:'passed',httpRoutes:checked,headResponses:true,conditionalCaching:true,cleanURLRedirects:true,privateSourceBlocked:true}));
}finally{child.kill()}
