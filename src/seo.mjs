import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const plain=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());

export function createSEO({root,products,categories,site}) {
 const origin=new URL(site.url);
 if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash)throw Error('site.config.json url must be an HTTPS origin without a path.');
 const absolute=relative=>new URL(relative,origin).href;
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/image-manifest.json'),'utf8'));
 const pages=[];
 const imageURL=src=>manifest[src]?.sizes.at(-1).url||src;
 const imageSet=src=>manifest[src]?.sizes.map(x=>`${x.url} ${x.width}w`).join(', ');
 const organization={'@type':'Organization','@id':absolute('/#organization'),name:site.name,url:absolute('/'),logo:absolute('/assets/Treebites_logo.png'),email:site.email,sameAs:[site.instagram,site.facebook].filter(Boolean)};
 const website={'@type':'WebSite','@id':absolute('/#website'),name:site.name,url:absolute('/'),inLanguage:site.language,publisher:{'@id':organization['@id']}};

 function responsiveImages(html){
  html=html.replace(/<img\b[^>]*>/g,tag=>{
   const src=tag.match(/\bsrc="([^"]+)"/)?.[1];
   if(!manifest[src])return tag;
   const thumb=/width="80"/.test(tag);
   const main=/fetchpriority="high"/.test(tag);
   const sizes=thumb?'80px':main?'(max-width: 800px) 92vw, 48vw':'(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 22vw';
   const target=thumb?manifest[src].sizes[0].url:imageURL(src);
   return tag.replace(`src="${src}"`,`src="${target}" srcset="${imageSet(src)}" sizes="${sizes}"`).replace(/\sdecoding="[^"]*"/,'').replace('>',' decoding="async">');
  });
  return html.replace(/data-image="([^"]+)"/g,(all,src)=>manifest[src]?`data-image="${imageURL(src)}" data-srcset="${imageSet(src)}"`:all);
 }

 function decorate(html,route,{notFound=false}={}) {
  const url=absolute(route);
  const product=products.find(p=>route===`/products/${p.slug}/`);
  const category=categories.find(c=>route===`/categories/${c.slug}/`);
  const title=product?`${product.name} ${product.name.includes(product.size)?'':product.size} | TreeBites`.replace(/\s+/g,' ').trim():route==='/'?'TreeBites | Seeds, Nolen Gur, Ghee & Everyday Goodness':plain(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'TreeBites');
  const fullDescription=product?`${product.name}, ${product.size}, by TreeBites. ${product.description}`:decode(html.match(/name="description" content="([^"]*)"/)?.[1]||'Explore TreeBites.');
  const description=fullDescription.length>160?fullDescription.slice(0,157).replace(/\s+\S*$/,'')+'…':fullDescription;
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(description)}">`).replace('<html lang="en">','<html lang="en-IN">').replace('content="#203c2a"','content="#153e2d"');
  const breadcrumbs=[{name:'Home',url:absolute('/')}];
  if(product)breadcrumbs.push({name:product.category.name,url:absolute(`/categories/${product.category.slug}/`)},{name:product.name,url});
  else if(category)breadcrumbs.push({name:'Categories',url:absolute('/categories/')},{name:category.name,url});
  else if(route!=='/')breadcrumbs.push({name:route==='/products/'?'All products':route==='/categories/'?'Categories':route==='/our-story/'?'Our story':'Sitemap',url});
  const graph=[organization,website];
  const page={'@type':product?'ItemPage':route==='/our-story/'?'AboutPage':route==='/'?'WebPage':'CollectionPage','@id':`${url}#webpage`,url,name:title,description,inLanguage:site.language,isPartOf:{'@id':website['@id']}};
  if(route==='/our-story/'){
   page.about={'@id':organization['@id']};
   page.mainEntity={'@id':organization['@id']};
  }
  if(!notFound){
   graph.push(page);
   if(route!=='/'){
    graph.push({'@type':'BreadcrumbList','@id':`${url}#breadcrumbs`,itemListElement:breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.url}))});
    page.breadcrumb={'@id':`${url}#breadcrumbs`};
   }
   if(product){
    const entity={'@type':'Product','@id':`${url}#product`,name:`TreeBites ${product.name}`,description:product.description,url,image:[absolute(imageURL(product.image))],brand:{'@type':'Brand',name:'TreeBites'},category:product.category.name,size:product.size,sku:product.fashinoworld.sku||product.id,additionalProperty:[{'@type':'PropertyValue',name:'Pack size',value:product.size}],sameAs:[product.fashinoworld.variantUrl||product.fashinoworld.url,...(product.amazonURL?[product.amazonURL]:[])]};
    graph.push(entity);page.mainEntity={'@id':entity['@id']};
   } else if(route==='/categories/'){
    const list={'@type':'ItemList','@id':`${url}#categories`,name:'TreeBites categories',numberOfItems:categories.length,itemListElement:categories.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,url:absolute(`/categories/${c.slug}/`)}))};
    graph.push(list);page.mainEntity={'@id':list['@id']};
   } else if(route==='/products/'||category){
    const items=category?products.filter(p=>p.category.slug===category.slug):products;
    const list={'@type':'ItemList','@id':`${url}#products`,name:category?.name||'TreeBites products',numberOfItems:items.length,itemListElement:items.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:absolute(`/products/${p.slug}/`)}))};
    graph.push(list);page.mainEntity={'@id':list['@id']};
   }
   if(route==='/'){
    const faq=html.match(/<section[^>]+id="questions"[\s\S]*?<\/section>/)?.[0];
    const questions=[...(faq||'').matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
    if(questions.length)graph.push({'@type':'FAQPage','@id':`${url}#questions`,mainEntity:questions.map(q=>({'@type':'Question',name:plain(q[1]),acceptedAnswer:{'@type':'Answer',text:plain(q[2])}}))});
   }
   pages.push({route,url,title,description,product,...(route==='/our-story/'?{text:plain(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'')}:{})});
  }
  const metadata=`
<meta name="robots" content="${notFound?'noindex, follow':'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
${notFound?'':`<link rel="canonical" href="${escape(url)}">`}
<meta property="og:site_name" content="TreeBites">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
${notFound?'':`<meta property="og:url" content="${escape(url)}">`}
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<link rel="preload" href="/assets/fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/catalogue.json" title="TreeBites product catalogue">
<script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script>
`;
  html=responsiveImages(html.replace('</head>',metadata+'</head>'));
  for(const file of ['style.css','pages.css','brand.css','motion.css','story.css','collections.css','site.js','Treebites_logo.png','Treebites_favicon.png']){
   const hash=createHash('sha256').update(fs.readFileSync(path.join(root,'assets',file))).digest('hex').slice(0,12);
   html=html.replaceAll(`/assets/${file}"`,`/assets/${file}?v=${hash}"`);
  }
  return html;
 }

 function writeDiscoveryFiles(){
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${pages.map(p=>`  <url><loc>${escape(p.url)}</loc>${p.product?`<image:image><image:loc>${escape(absolute(imageURL(p.product.image)))}</image:loc></image:image>`:''}</url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(root,'sitemap.xml'),xml);
  const redirects=pages.flatMap(p=>[`${p.route}index.html ${p.route} 301`,...(p.route==='/'?[]:[`${p.route.slice(0,-1)} ${p.route} 301`])]);
  fs.writeFileSync(path.join(root,'_redirects'),'# Clean canonical URLs; compatible with Netlify/Cloudflare Pages.\n'+redirects.join('\n')+'\n');
  const robots=`# TreeBites public pages are open to search engines and AI crawlers.\n# The wildcard includes Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User,\n# GPTBot, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,\n# Perplexity-User, Applebot, Google-Extended and other compliant crawlers.\nUser-agent: *\nAllow: /\nDisallow: /src/\nDisallow: /scripts/\nDisallow: /node_modules/\nDisallow: /dist/\nDisallow: /outputs/\nDisallow: /work/\nDisallow: /.git/\nDisallow: /.openai/\nDisallow: /.cache/\n\nSitemap: ${absolute('/sitemap.xml')}\n`;
  fs.writeFileSync(path.join(root,'robots.txt'),robots);
  const catalogue={brand:'TreeBites',website:absolute('/'),language:site.language,ordering:'This website is a product catalogue. Retailers handle prices, availability, payment, shipping and returns.',products:products.map(p=>({name:p.name,brand:'TreeBites',url:absolute(`/products/${p.slug}/`),category:p.category.name,packSize:p.size,description:p.description,usage:p.use,image:absolute(imageURL(p.image)),retailers:{fashinoworld:p.fashinoworld.variantUrl||p.fashinoworld.url,amazon:p.amazonURL||null},amazonLinkStatus:p.amazonURL?'linked':'Exact product or pack link awaiting confirmation'}))};
  fs.writeFileSync(path.join(root,'catalogue.json'),JSON.stringify(catalogue,null,2));
  const intro=`# TreeBites\n\n> TreeBites food and nutrition catalogue: seeds and seed mixes, kitchen staples, juices and beverages, breakfast and drink mixes, supplements and fibre.\n\nWebsite: ${absolute('/')}\n\nThis is a brand portfolio and product catalogue. Orders are completed on Amazon or Fashinoworld. Current prices, stock, shipping and returns are determined by the retailer. Product pack sizes are stated on each product page; some Amazon links remain unavailable until the exact pack is confirmed.\n\n## Main pages\n\n- [Home](${absolute('/')})\n- [Our story and about TreeBites](${absolute('/our-story/')})\n- [All products](${absolute('/products/')})\n- [Categories](${absolute('/categories/')})\n- [HTML sitemap](${absolute('/sitemap/')})\n- [Structured product catalogue](${absolute('/catalogue.json')})\n- [Complete readable catalogue](${absolute('/llms-full.txt')})\n\n## Categories\n\n${categories.map(c=>`- [${c.name}](${absolute(`/categories/${c.slug}/`)}): ${c.description}`).join('\n')}\n\n## Products\n\n${products.map(p=>`- [${p.name} — ${p.size}](${absolute(`/products/${p.slug}/`)}): ${p.description}`).join('\n')}\n\n## Brand contact\n\n- Email: ${site.email}\n- Instagram: ${site.instagram}\n- Location: Kolkata, India\n\nProduct labels and retailer pages provide complete ingredients, allergens, nutrition, preparation and storage details. This catalogue does not provide medical advice or certify health outcomes.\n`;
  fs.writeFileSync(path.join(root,'llms.txt'),intro);
  const brandText = '\n## About TreeBites\n\n' + (pages.find(p=>p.route==='/our-story/')?.text||'') + '\n';
  fs.writeFileSync(path.join(root,'llms-full.txt'),intro+brandText+'\n## Product details\n\n'+products.map(p=>`### ${p.name}\n\nPage: ${absolute(`/products/${p.slug}/`)}\nCategory: ${p.category.name}\nPack size: ${p.size}\n\n${p.description}\n\nDirections: ${p.use}\n\nFashinoworld: ${p.fashinoworld.variantUrl||p.fashinoworld.url}\nAmazon: ${p.amazonURL||'Exact product or pack link awaiting confirmation.'}\n`).join('\n'));
  fs.writeFileSync(path.join(root,'_headers'),`/assets/*\n  Cache-Control: public, max-age=604800\n  X-Content-Type-Options: nosniff\n/*.html\n  Cache-Control: public, max-age=0, must-revalidate\n/catalogue.json\n  Content-Type: application/json; charset=utf-8\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n/llms-full.txt\n  Content-Type: text/plain; charset=utf-8\n/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n/404.html\n  X-Robots-Tag: noindex\n`);
  return {pages:pages.length,origin:origin.origin};
 }
 return {decorate,writeDiscoveryFiles,imageURL,absolute,pages};
}
