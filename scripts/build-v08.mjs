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
app=app.replace("radarZoom:12","radarZoom:8");
writeFileSync(appPath,app);

const indexPath=path.join(out,'index.html');
let html=readFileSync(indexPath,'utf8');
if(!html.includes('https://www.ktr.mlit.go.jp/arage/index.html')){
  html=html.replace(
    '<a href="https://www.ktr.mlit.go.jp/arajo/index.html" target="_blank" rel="noopener noreferrer">荒川上流河川事務所</a>',
    '<a href="https://www.ktr.mlit.go.jp/arajo/index.html" target="_blank" rel="noopener noreferrer">荒川上流河川事務所</a>\n      <a href="https://www.ktr.mlit.go.jp/arage/index.html" target="_blank" rel="noopener noreferrer">荒川下流河川事務所</a>'
  );
}
html=html.replace(
  '地図：国土地理院／降水レイヤー：気象庁「雨雲の動き」',
  '地図：国土地理院（グレースケール・薄表示）／降水レイヤー：気象庁「雨雲の動き」（60%表示）'
);
html=html.replace(
  '<p>災害時に確認したい公的機関のX公式アカウント</p>',
  '<p>Xの埋め込み表示を試みます。表示されない場合も、各ヘッダーから公式アカウントを直接開けます。</p>'
);
const socialAccounts=[
  ['首相官邸（災害・危機管理情報）','Kantei_Saigai'],
  ['東京都防災','tokyo_bousai'],
  ['荒川区','arakawakukoho'],
  ['国土交通省 荒川下流河川事務所','mlit_arakawa_ka']
];
for(const [label,handle] of socialAccounts){
  html=html.replace(
    `<h3>${label}</h3>`,
    `<h3><a class="social-heading-link" href="https://x.com/${handle}" target="_blank" rel="noopener noreferrer">${label}</a></h3>`
  );
  html=html.replace(
    `\n        <a class="source-link" href="https://x.com/${handle}" target="_blank" rel="noopener noreferrer">Xで開く →</a>`,
    ''
  );
}
if(!html.includes('/card-icons.css')){
  html=html.replace('</head>','  <link rel="stylesheet" href="/card-icons.css?v=0.8.0">\n</head>');
}
if(!html.includes('/card-icons.js')){
  html=html.replace('</body>','<script src="/card-icons.js?v=0.8.0" defer></script>\n</body>');
}
if(!html.includes('https://platform.x.com/widgets.js')){
  html=html.replace('</body>','<script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>\n</body>');
}
writeFileSync(indexPath,html);

const stylePath=path.join(out,'style.css');
let css=readFileSync(stylePath,'utf8');
css+='\n/* Rainfall readability: fade the grayscale basemap while preserving rainfall colors. */\n.radar{aspect-ratio:1/1}\n.tile.base-tile{filter:grayscale(1) brightness(1.08) contrast(.92);opacity:.30}\n.tile.radar-tile{opacity:.60}\n.weather-grid.single{grid-template-columns:1fr}\n.dot.lv4{background:#8b4cc5;box-shadow:0 0 0 5px #f1e9fb}\n.dot.lv5{background:#151017;box-shadow:0 0 0 5px #eee9ef}\n.social-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}\n.social-card{min-width:0;overflow:hidden}\n.social-card h3{min-height:44px;font-size:13px;line-height:1.35}\n.social-heading-link{text-decoration:none}\n.social-heading-link:hover{text-decoration:underline}\n.social-card .twitter-timeline{display:block;min-height:430px;font-size:11px;color:var(--muted)}\n@media(max-width:1080px){.social-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:620px){.social-grid{grid-template-columns:1fr}}\n@media(max-width:440px){.radar{aspect-ratio:1/1}}\n';
writeFileSync(stylePath,css);

console.log('Built v0.8 frontend with resilient X embeds, linked SNS headings, live flood indicator, tuned rainfall map and card watermark icons.');
