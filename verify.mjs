import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'src/catalogue.json'),'utf8'));
const origin=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8')).url;
const socialConfig=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(folder,x.name)):path.join(folder,x.name))}
const pages=[path.join(root,'index.html'),path.join(root,'404.html'),...['products','categories','our-story','sitemap'].flatMap(folder=>walk(path.join(root,folder))).filter(x=>x.endsWith('.html'))];
const usedAssets=new Set();
let references=0;
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 const pageURL=new URL(path.relative(root,file).split(path.sep).join('/'),origin+'/');
 assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/name="description"/);assert.match(html,/name="viewport"/);assert.match(html,/id="main"/);
 assert.match(html,/\/assets\/brand.css/);assert.doesNotMatch(html,/href="#"|lorem ipsum|add to cart|proceed to checkout/i);
 assert.match(html,/\/assets\/motion\.css\?v=[a-f0-9]{12}/);
 assert.equal([...html.matchAll(/id="page-progress"/g)].length,1,`One shared loading indicator required: ${file}`);
 assert.match(html,/id="page-progress"[^>]+role="progressbar"[^>]+hidden/);
 assert.ok(html.includes('href="/our-story/"'),`Story navigation missing: ${file}`);
 assert.doesNotMatch(html,/href="\/#our-story"/);
 const socials=html.match(/<div class="footer-socials"[\s\S]*?<\/div>/)?.[0]||'';
 assert.equal([...socials.matchAll(/<svg\b/g)].length,2,`Two social icons required: ${file}`);
 assert.match(socials,/Instagram/);assert.match(socials,/Facebook/);
 assert.ok(socials.includes(`href="${socialConfig.instagram}"`),`Official Instagram link missing: ${file}`);
 if(socialConfig.facebook)assert.ok(socials.includes(`href="${socialConfig.facebook}"`));
 else {assert.match(socials,/Link unavailable/);assert.doesNotMatch(socials,/href="https?:\/\/(?:www\.)?facebook\.com/)}
 for(const [,kind,value] of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(value))continue;
  const url=new URL(value,pageURL);
  const href=decodeURIComponent(url.pathname);
  let resolved=path.join(root,href);
  assert.ok(fs.existsSync(resolved),`Broken ${kind}: ${value} in ${file}`);
  if(fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');
  assert.ok(fs.existsSync(resolved),`Missing index: ${value}`);
  if(url.hash)assert.ok(fs.readFileSync(resolved,'utf8').includes(`id="${url.hash.slice(1)}"`),`Missing ${url.hash}`);
  if(resolved.includes(`${path.sep}assets${path.sep}`))usedAssets.add(resolved);
  references++;
 }
 for(const a of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))assert.match(a[0],/rel="noopener noreferrer"/);
 const exported=path.join(root,'dist',path.relative(root,file));
 assert.equal(fs.readFileSync(exported,'utf8'),html,`Hosting copy out of date: ${file}`);
}
assert.equal(catalogue.length,20);
const amazon=[];
for(const p of catalogue){
 const html=fs.readFileSync(path.join(root,'products',p.slug,'index.html'),'utf8');
 assert.ok(html.includes(p.website.replaceAll('&','&amp;')),`Missing exact website variant: ${p.name}`);
 assert.match(html,/Order on Amazon/);assert.match(html,/Order on Website/);
 if(p.amazon){assert.ok(html.includes(p.amazon),`Missing Amazon link: ${p.name}`);assert.ok(new URL(p.amazon).pathname.startsWith('/dp/'));amazon.push(p.amazon)}
 else{assert.match(html,/<button class="button amazon" disabled/);assert.match(html,/id="amazon-note"/)}
 assert.ok(!html.includes('₹'),'Unexpected stale price');
}
assert.equal(new Set(amazon).size,13);assert.equal(pages.length,31);
const categoryPage=fs.readFileSync(path.join(root,'categories/index.html'),'utf8');
assert.match(categoryPage,/\/assets\/collections\.css\?v=[a-f0-9]{12}/);
assert.equal([...categoryPage.matchAll(/class="category-row"/g)].length,5);
const images=[...usedAssets].filter(x=>/\.(png|webp)$/.test(x));
for(const img of images){
 const bytes=fs.readFileSync(img);
 if(img.endsWith('.webp')){assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP')}
 else assert.equal(bytes.subarray(1,4).toString(),'PNG');
}
console.log(JSON.stringify({pages:pages.length,products:catalogue.length,categories:5,checkedLocalReferences:references,images:images.length,websiteLinks:20,enabledAmazonLinks:13,heldAmazonLinks:7,status:'passed'},null,2));
