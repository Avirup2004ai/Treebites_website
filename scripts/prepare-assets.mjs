import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=path.join(root,'assets');
const destination=path.join(assets,'images');
fs.mkdirSync(destination,{recursive:true});
const files=fs.readdirSync(assets).filter(name=>/^TB-\d{2}-(pack|detail)\.png$/.test(name));
const manifest={};
let originalBytes=0,optimizedBytes=0;
for(const file of files){
 const input=path.join(assets,file);
 const metadata=await sharp(input).metadata();
 const basename=file.replace(/\.png$/,'');
 const sizes=[];
 for(const width of [360,640,1000]){
  const actualWidth=Math.min(width,metadata.width);
  if(sizes.some(item=>item.width===actualWidth))continue;
  const filename=`${basename}-${actualWidth}.webp`;
  await sharp(input).resize({width:actualWidth,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(path.join(destination,filename));
  sizes.push({width:actualWidth,url:`/assets/images/${filename}`});
 }
 originalBytes+=fs.statSync(input).size;
 optimizedBytes+=fs.statSync(path.join(root,sizes.at(-1).url)).size;
 manifest[`/assets/${file}`]={width:metadata.width,height:metadata.height,sizes};
}
fs.writeFileSync(path.join(root,'src/image-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({images:files.length,originalBytes,optimizedBytes,reductionPercent:Math.round((1-optimizedBytes/originalBytes)*100)}));
