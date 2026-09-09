import {readFileSync,writeFileSync,cpSync,rmSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'public'),out=path.join(root,'dist');
// Explicit source anchors make changes fail closed rather than silently ship old behavior.
function between(s,start,end,replacement){const a=s.indexOf(start),b=s.indexOf(end,a+start.length);if(a<0||b<0||s.indexOf(start,a+1)>=0)throw Error('Source anchor changed: '+start);return s.slice(0,a)+replacement+'\n'+s.slice(b)}
function once(s,old,newText){if(!s.includes(old)||s.indexOf(old)!==s.lastIndexOf(old))throw Error('Expected exactly one source match: '+old.slice(0,90));return s.replace(old,newText)}
let app=readFileSync(path.join(src,'app.js'),'utf8');
const expected='4a569dd91fd08eca49f40e74abe503820e0ef4c3';
// The upstream v0.6 app is deliberately retained as an immutable source dependency.
// Git's blob hash is checked so future edits cannot be silently overwritten by this release transform.
const blob=Buffer.from(`blob ${Buffer.byteLength(app)}\0${app}`);
if(createHash('sha1').update(blob).digest('hex')!==expected)throw Error('v0.6 app.js changed; review and integrate v0.7 explicitly');
app=between(app,'async function loadShelters(){','async function loadUtilities(){',`async function loadShelters(){
 try{
  const d=await jsonFetch('/api/shelters');if(d.state!=='ok'||!Array.isArray(d.shelters))throw Error('Invalid shelter response');
  for(const el of qa('[data-shelter]')){
   const s=d.shelters.find(x=>x.name===el.dataset.shelter),p=el.querySelector('.pill');
   p.className='pill '+(s?.state||'unknown');p.textContent='開設状況：'+(s?.status||'未確認');
   let meta=el.querySelector('.shelter-meta');if(!meta){meta=document.createElement('div');meta.className='shelter-meta';el.append(meta)}
   meta.textContent=s?.recordUpdatedAt?'施設情報更新 '+s.recordUpdatedAt:'施設の更新時刻：未確認';
  }
  const note=q('#shelterUpdate');if(note)note.textContent='区データ更新：'+(d.dataUpdatedAt||'未確認')+'｜取得試行：'+fmt(d.retrievedAt);
 }catch{
  qa('[data-shelter] .pill').forEach(p=>{p.textContent='開設状況：取得できません';p.className='pill unknown'});
  const note=q('#shelterUpdate');if(note)note.textContent='区の開設状況を取得できません。公式一覧を確認してください。';
 }
}`);
app=between(app,'let waterData=null,chartHours=6;','function initChart(){',`let waterData=null,chartHours=12;
function deltaText(v){return BosaiWater.deltaText(v)}
async function loadWater(){
 try{
  const d=await jsonFetch('/api/water',15000);
  if(d.state!=='ok'||!d.latest||!Number.isFinite(d.latest.value))throw Error('水位値なし');
  waterData=d;const v=d.latest.value,stale=d.ageMinutes===null||d.ageMinutes>30;
  q('#waterValue').textContent=v.toFixed(2);
  q('#waterTime').textContent=fmt(d.latest.timestamp)+' 観測'+(stale?'｜更新遅延の可能性':'');
  BosaiWater.setGauge(q('#gaugeMarker'),v);
  BosaiWater.setLevel(q('#waterTrend'),v);
  if(stale)q('#waterTrend').textContent+='（更新時刻に注意）';
  q('#waterDelta').textContent='10分変化 '+deltaText(d.delta10)+' / 1時間変化 '+deltaText(d.delta60);
  drawWaterChart();
 }catch{
  waterData=null;q('#waterValue').textContent='--';q('#waterTime').textContent='水位を取得できません。国交省の原典をご確認ください。';
  q('#waterTrend').textContent='取得不能';q('#waterTrend').className='trend unknown';q('#waterDelta').textContent='';
  q('#waterChart').textContent='観測データを取得できません。公式の水位一覧をご確認ください。';
  q('#waterChartNote').textContent='取得失敗をゼロ水位として表示しません。';
 }
}
function drawWaterChart(){
 const box=q('#waterChart');if(!waterData){box.textContent='水位を取得中';return}
 const result=BosaiWater.drawChart(box,waterData,chartHours);
 const note=q('#waterChartNote');
 note.textContent=result.count?'表示 '+fmt(result.first)+'〜'+fmt(result.last)+'｜'+result.count+'観測値。11分超の欠測は線を切断。縦軸0〜8m固定。':'指定期間の観測データがありません。';
 if(result.overflow)note.textContent+=' 0〜8mの範囲外の値は端に表示しています。実測値は上の数値・公式原典を確認してください。';
 if(waterData.ageMinutes>30)note.textContent+=' 最新観測値の更新遅延に注意。';
}
async function loadCamera(){BosaiWater.renderCamera(q('#cameraBox'),q('#cameraMeta'))}
`);
app=once(app,"${new Date(ps.timeDefines[i]).getHours()}時 ${x}%","${new Intl.DateTimeFormat('ja-JP',{hour:'2-digit',hour12:false,timeZone:'Asia/Tokyo'}).format(new Date(ps.timeDefines[i]))}時 ${x}%");
app=once(app,'loadWater(),loadForecast(),loadRadar()','loadWater(),loadForecast(),loadRadar(),loadCamera()');
let html=readFileSync(path.join(src,'index.html'),'utf8');
html=html.replaceAll('?v=0.6.0','?v=0.7.0').replaceAll('v0.6','v0.7').replace('2026-09-07','2026-09-09');
html=once(html,'<link rel="stylesheet" href="/style.css?v=0.7.0">','<link rel="stylesheet" href="/style.css?v=0.7.0"><link rel="stylesheet" href="/water-v07.css?v=0.7.0">');
html=once(html,'<article class="card"><h3>荒川｜岩淵水門（上）','<article class="card water-card"><h3>荒川｜岩淵水門（上）');
html=once(html,'<div class="gauge"><span id="gaugeMarker"', '<div class="water-status" aria-label="水位区分"><span class="normal">平常</span><span class="standby">水防団待機</span><span class="advisory">氾濫注意</span><span class="evacuation">避難判断</span><span class="danger">氾濫危険</span></div><div class="gauge"><span id="gaugeMarker"');
html=once(html,'<button type="button" data-hours="6" class="active">6時間</button><button type="button" data-hours="24">24時間</button>','<button type="button" data-hours="12" class="active">12時間</button><button type="button" data-hours="120">5日間</button>');
html=once(html,'<div id="waterChartNote" class="micro">観測値のみ。欠測時は線をつなぎません。</div>','<div id="waterChartNote" class="micro">縦軸0〜8m固定。観測値のみ。欠測時は線をつなぎません。</div><div class="camera-panel"><div class="camera-head"><b>ライブカメラ</b><small id="cameraMeta">画像取得中</small></div><div id="cameraBox" class="camera-box">画像取得中</div><div class="camera-note">国土交通省提供。約1分間隔で更新される静止画像です。撮影時刻は未確認。工事等で配信が停止する場合があります。</div><a class="source-link" href="https://www.ktr.mlit.go.jp/arage/arage00563.html" target="_blank" rel="noopener noreferrer">ライブカメラ原典 →</a></div>');
html=once(html,'<div class="shelters" id="shelters"></div>','<div id="shelterUpdate" class="micro">開設状況を取得中</div><div class="shelters" id="shelters"></div>');
html=once(html,'<script src="/app.js?v=0.7.0" defer></script>','<script src="/water-v07.js?v=0.7.0" defer></script><script src="/app.js?v=0.7.0" defer></script>');
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});cpSync(src,out,{recursive:true});
writeFileSync(path.join(out,'app.js'),app);writeFileSync(path.join(out,'index.html'),html);
console.log('Built v0.7 frontend; source hash verified.');
