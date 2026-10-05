import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'catalogue.json'),'utf8'));
const imageManifest=JSON.parse(fs.readFileSync(path.join(root,'src/image-manifest.json'),'utf8'));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const list=folder=>fs.readdirSync(path.join(root,folder),{withFileTypes:true}).flatMap(x=>x.isDirectory()?list(path.join(folder,x.name)):path.join(folder,x.name));
const pages=['index.html','404.html',...['products','categories','our-story','sitemap'].flatMap(list).filter(x=>x.endsWith('.html'))];
const canonical=new Set(),titles=new Set(),descriptions=new Set();
let products=0,breadcrumbs=0,faq=0,srcsets=0;
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
for(const file of pages){
 const html=read(file);
 const is404=file==='404.html';
 assert.equal([...html.matchAll(/<h1\b/g)].length,1,`One H1 required: ${file}`);
 const title=decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||'');
 assert.ok(title&&title.length<=95,`Title invalid: ${file}`);
 assert.ok(!titles.has(title),`Duplicate title: ${title}`);titles.add(title);
 const description=decode(html.match(/name="description" content="([^"]+)"/)?.[1]||'');
 assert.ok(description.length>30&&description.length<=170,`Description invalid: ${file}`);
 assert.ok(!descriptions.has(description),`Duplicate description: ${file}`);descriptions.add(description);
 assert.match(html,/<html lang="en-IN">/);
 assert.doesNotMatch(html,/fonts\.googleapis\.com|lorem ipsum|meta name="keywords"/i);
 assert.match(html,/\/assets\/brand\.css\?v=[a-f0-9]{12}/);
 assert.match(html,/<script src="\/assets\/site\.js\?v=[a-f0-9]{12}" defer>/);
 assert.match(html,/<noscript>/);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]||'null');
 assert.equal(graph['@context'],'https://schema.org');
 assert.ok(graph['@graph'].some(x=>x['@type']==='WebSite'));
 if(is404){assert.match(html,/name="robots" content="noindex, follow"/);assert.doesNotMatch(html,/rel="canonical"/);continue}
 const url=decode(html.match(/rel="canonical" href="([^"]+)"/)?.[1]||'');
 assert.equal(new URL(url).origin,site.url);
 assert.ok(url.endsWith('/')&&!url.includes('?'),`Canonical not clean: ${url}`);
 assert.ok(!canonical.has(url),`Duplicate canonical: ${url}`);canonical.add(url);
 assert.match(html,/name="robots" content="index, follow/);
 assert.ok(graph['@graph'].some(x=>x['@id']===url+'#webpage'));
 const crumb=graph['@graph'].find(x=>x['@type']==='BreadcrumbList');
 if(file!=='index.html'){assert.ok(crumb,`Missing breadcrumbs: ${file}`);breadcrumbs++;assert.equal(crumb.itemListElement.at(-1).item,url)}
 const product=graph['@graph'].find(x=>x['@type']==='Product');
 if(url===site.url+'/our-story/'){
  const about=graph['@graph'].find(x=>x['@type']==='AboutPage');
  assert.ok(about,'Our Story must have AboutPage structured data');
  assert.equal(about.about['@id'],site.url+'/#organization');
  assert.equal(about.mainEntity['@id'],about.about['@id']);
  assert.equal(crumb.itemListElement.at(-1).name,'Our story');
  assert.match(html,/href="\/our-story\/" class="active" aria-current="page"/);
  assert.match(html,/\/assets\/story\.css\?v=[a-f0-9]{12}/);
  for(const id of ['the-brand','familiar-flavours','our-range','product-information','where-to-buy','contact'])assert.ok(html.includes(`id="${id}"`));
 }
 if(product){
  products++;const record=catalogue.products.find(x=>x.url===url);assert.ok(record);
  assert.equal(product.size,record.packSize);assert.equal(product.brand.name,'TreeBites');
  assert.ok(decode(html).includes(product.sku),'Structured SKU must be visible');
  assert.ok(product.image.every(x=>fs.existsSync(path.join(root,new URL(x).pathname))));
  assert.ok(!product.offers&&!product.aggregateRating&&!product.review,'No unverified prices or reviews');
 }
 const questions=graph['@graph'].find(x=>x['@type']==='FAQPage');
 if(questions){faq=questions.mainEntity.length;assert.equal(faq,4);for(const q of questions.mainEntity)assert.ok(decode(html).includes(q.name))}
 for(const [,value] of html.matchAll(/\bsrcset="([^"]+)"/g)){
  srcsets++;for(const entry of value.split(',')){const asset=entry.trim().split(/\s+/)[0];assert.ok(fs.existsSync(path.join(root,asset)),`Missing responsive asset: ${asset}`)}
 }
}
const xml=read('sitemap.xml');
const sitemap=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>decode(x[1]));
assert.deepEqual(new Set(sitemap),canonical);
assert.equal(sitemap.length,30);assert.equal(products,20);assert.equal(breadcrumbs,29);
assert.ok(read('llms.txt').includes(site.url+'/our-story/'));
assert.ok(read('llms-full.txt').includes('About TreeBites'));
assert.ok(read('llms-full.txt').includes('GET IN TOUCH'));
assert.equal([...xml.matchAll(/<image:image>/g)].length,20);
const robots=read('robots.txt');
assert.match(robots,/User-agent: \*\s+Allow: \//);assert.doesNotMatch(robots,/^Disallow: \/\s*$/m);
assert.ok(robots.includes(`Sitemap: ${site.url}/sitemap.xml`));
for(const p of catalogue.products){assert.ok(read('llms.txt').includes(p.url));assert.ok(read('llms-full.txt').includes(p.description))}
for(const name of ['manrope','sora'])assert.equal(fs.readFileSync(path.join(root,`assets/fonts/${name}-latin.woff2`)).subarray(0,4).toString(),'wOF2');
for(const variants of Object.values(imageManifest))for(const variant of variants.sizes){const bytes=fs.readFileSync(path.join(root,variant.url));assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP')}
console.log(JSON.stringify({status:'passed',canonicalPages:canonical.size,productSchemas:products,breadcrumbSchemas:breadcrumbs,visibleFAQs:faq,responsiveImageUses:srcsets,xmlSitemapURLs:sitemap.length,localFonts:2,aiReadableProducts:catalogue.products.length},null,2));
