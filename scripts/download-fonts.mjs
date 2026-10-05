import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'assets/fonts');
fs.mkdirSync(destination,{recursive:true});
const cssURL='https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Sora:wght@500..800&display=swap';
const response=await fetch(cssURL,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok)throw Error(`Fonts CSS: ${response.status}`);
const css=await response.text();
for(const family of ['Manrope','Sora']){
 const blocks=[...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[\s\S]*?\})/g)].map(x=>x[1]);
 const block=blocks.find(block=>block.includes(`'${family}'`));
 if(!block)throw Error(`Latin font face missing: ${family}`);
 const url=block.match(/url\(([^)]+)\)/)?.[1];
 if(!url)throw Error(`Font URL missing: ${family}`);
 const font=await fetch(url);
 if(!font.ok)throw Error(font.status);
 fs.writeFileSync(path.join(destination,`${family.toLowerCase()}-latin.woff2`),Buffer.from(await font.arrayBuffer()));
 const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family.toLowerCase()}/OFL.txt`);
 if(!license.ok)throw Error(`Font license unavailable: ${family}`);
 fs.writeFileSync(path.join(destination,`${family}-OFL.txt`),await license.text());
 console.log(`Downloaded ${family} and its license.`);
}
