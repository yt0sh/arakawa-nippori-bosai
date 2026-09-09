// View-only water chart. It never derives an evacuation order from a gauge.
(function(global){
'use strict';
const BANDS=[{min:0,max:3,key:'normal',name:'平常',color:'#77b6e5',bg:'#eaf5ff'}, {min:3,max:4.1,key:'standby',name:'水防団待機',color:'#7bc38f',bg:'#edf9ef'}, {min:4.1,max:6.5,key:'advisory',name:'氾濫注意',color:'#f1d97a',bg:'#fff8dc'}, {min:6.5,max:7.7,key:'evacuation',name:'避難判断',color:'#eb8c87',bg:'#fff1f0'}, {min:7.7,max:8,key:'danger',name:'氾濫危険',color:'#b993e6',bg:'#f4edff'}];
const YMIN=0,YMAX=8;
const valid=p=>p&&Number.isFinite(Date.parse(p.timestamp))&&typeof p.value==='number'&&Number.isFinite(p.value);
const clamp=v=>Math.max(YMIN,Math.min(YMAX,v));
const level=v=>v>=7.7?BANDS[4]:v>=6.5?BANDS[3]:v>=4.1?BANDS[2]:v>=3?BANDS[1]:BANDS[0];
const time=(t,opts)=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour12:false,...opts}).format(t);
function clean(data,hours){
 const end=Date.parse(data?.latest?.timestamp),start=end-hours*3600000;
 const points=Array.isArray(data?.history)?data.history.filter(valid).filter(p=>{const t=Date.parse(p.timestamp);return t>=start&&t<=end}).sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp)):[];
 return {start,end,points};
}
function el(tag,attrs={},text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=String(text);return n}
function drawChart(box,data,hours){
 box.replaceChildren();const {start,end,points}=clean(data,hours);
 if(!Number.isFinite(end)||!points.length){box.textContent='指定期間の観測データを確認できません。';return {count:0}}
 const w=640,h=300,p={l:44,r:19,t:18,b:38},pw=w-p.l-p.r,ph=h-p.t-p.b;
 const x=t=>p.l+(t-start)/(end-start)*pw,y=v=>p.t+(YMAX-v)/8*ph;
 const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':`${hours===120?'5日間':'12時間'}の水位。縦軸0から8メートル固定。`});
 svg.append(el('title',{},`岩淵水門（上）。観測値${points.length}件。縦軸0〜8m。8m超は上端で表示し、実測値を注記。`));
 for(const b of BANDS)svg.append(el('rect',{x:p.l,y:y(b.max),width:pw,height:y(b.min)-y(b.max),fill:b.bg}));
 for(let v=0;v<=8;v++){svg.append(el('line',{x1:p.l,x2:w-p.r,y1:y(v),y2:y(v),class:'grid'}),el('text',{x:p.l-7,y:y(v)+3,'text-anchor':'end',class:'axis'},String(v)))}
 for(const b of BANDS.slice(1)){svg.append(el('line',{x1:p.l,x2:w-p.r,y1:y(b.min),y2:y(b.min),stroke:b.color,'stroke-width':1.4,'stroke-dasharray':'4 4'}))}
 const ticks=hours===120?5:6;for(let i=0;i<=ticks;i++){const t=start+(end-start)*i/ticks;svg.append(el('text',{x:x(t),y:h-12,'text-anchor':i===0?'start':i===ticks?'end':'middle',class:'axis'},time(t,hours===120?{month:'numeric',day:'numeric'}:{hour:'2-digit',minute:'2-digit'})))}
 let seg=[],segments=[];for(const point of points){const t=Date.parse(point.timestamp);if(seg.length&&t-Date.parse(seg.at(-1).timestamp)>11*60000){segments.push(seg);seg=[]}seg.push(point)}if(seg.length)segments.push(seg);
 let overflow=false;
 for(const s of segments){let path='';for(let i=0;i<s.length;i++){const point=s[i],v=point.value;overflow ||= v<0||v>8;path+=(i?'L':'M')+x(Date.parse(point.timestamp)).toFixed(2)+' '+y(clamp(v)).toFixed(2)+' ';}if(s.length>1)svg.append(el('path',{d:path.trim(),class:'series'}));else svg.append(el('circle',{cx:x(Date.parse(s[0].timestamp)),cy:y(clamp(s[0].value)),r:2.5,fill:'#2f6fab'}))}
 const last=points.at(-1);svg.append(el('circle',{cx:x(Date.parse(last.timestamp)),cy:y(clamp(last.value)),r:4,class:'lastpoint'}));
 box.append(svg);return {count:points.length,first:points[0].timestamp,last:last.timestamp,overflow};
}
function setLevel(element,value){const b=level(value);element.textContent=b.name;element.className='trend '+b.key;return b}
function setGauge(marker,value){const pct=v=>clamp(v)/8*100;marker.style.left=pct(value)+'%';marker.title=`実測 ${value.toFixed(2)}m`}
function deltaText(v){return v==null||!Number.isFinite(v)?'比較観測値なし':(v>=0?'+':'')+v.toFixed(2)+'m'}
function renderCamera(box,meta){
 const url='/api/camera?at='+Math.floor(Date.now()/60000);const img=document.createElement('img');img.alt='岩淵水門（上）ライブカメラ。国土交通省提供';img.loading='lazy';img.decoding='async';img.src=url;
 img.onload=()=>{meta.textContent='画像取得 '+time(Date.now(),{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+' JST（撮影時刻は未確認）'};
 img.onerror=()=>{box.textContent='カメラ画像を取得できません。国交省の原典を確認してください。';meta.textContent='取得失敗'};
 box.replaceChildren(img);meta.textContent='画像取得中';
}
global.BosaiWater=Object.freeze({BANDS,level,clean,drawChart,setLevel,setGauge,deltaText,renderCamera});
})(window);
