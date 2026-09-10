import {cpSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'public');
const out=path.join(root,'dist');

rmSync(out,{recursive:true,force:true});
mkdirSync(out,{recursive:true});
cpSync(src,out,{recursive:true});

const appPath=path.join(out,'app.js');
let app=readFileSync(appPath,'utf8');
app=app.replace("radarZoom:12","radarZoom:10");
writeFileSync(appPath,app);

const indexPath=path.join(out,'index.html');
let html=readFileSync(indexPath,'utf8');
html=html.replace(
  '<a href="https://www.ktr.mlit.go.jp/arajo/index.html" target="_blank" rel="noopener noreferrer">荒川上流河川事務所</a>',
  '<a href="https://www.ktr.mlit.go.jp/arajo/index.html" target="_blank" rel="noopener noreferrer">荒川上流河川事務所</a>\n      <a href="https://www.ktr.mlit.go.jp/arage/index.html" target="_blank" rel="noopener noreferrer">荒川下流河川事務所</a>'
);
html=html.replace(
  '地図：国土地理院／降水レイヤー：気象庁「雨雲の動き」',
  '地図：国土地理院（グレースケール）／降水レイヤー：気象庁「雨雲の動き」'
);
writeFileSync(indexPath,html);

const stylePath=path.join(out,'style.css');
let css=readFileSync(stylePath,'utf8');
css+='\n/* Rainfall readability: keep the precipitation color scale distinct from the base map. */\n.radar{aspect-ratio:1/1}\n.tile.base-tile{filter:grayscale(1) brightness(1.08) contrast(.92)}\n@media(max-width:440px){.radar{aspect-ratio:1/1}}\n';
writeFileSync(stylePath,css);

console.log('Built v0.8 frontend with JMA radar zoom 10, grayscale base map and upstream/downstream links.');
