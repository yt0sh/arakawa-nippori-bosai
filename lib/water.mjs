import {plain,response,fetchText} from './arakawa.mjs';

export const STATIONS=Object.freeze({
  iwabuchi:Object.freeze({
    key:'iwabuchi',name:'岩淵水門（上）',id:'303041283309040',
    waterSource:'https://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303041283309040&KIND=9',
    stationSource:'https://www1.river.go.jp/cgi-bin/SiteInfoDetail.exe?ID=303041283309040',
    riverUrl:'https://www.river.go.jp/kawabou/pcfull/tm?itmkndCd=4&ofcCd=21281&obsCd=6&isCurrent=true&fld=0',
    cameraSource:'https://www.ktr.mlit.go.jp/arage/arage00563.html',
    cameraImage:'https://www.ktr.mlit.go.jp/arage/live-camera/iwabuchikami.jpg',
    thresholds:Object.freeze({standby:3.00,advisory:4.10,evacuation:6.50,danger:7.70,plan:8.57}),chartMax:8
  }),
  chisuibashi:Object.freeze({
    key:'chisuibashi',name:'治水橋',id:'303041283308060',
    waterSource:'https://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303041283308060&KIND=9',
    stationSource:'https://www1.river.go.jp/cgi-bin/SiteInfoDetail.exe?ID=303041283308060',
    riverUrl:'https://www.river.go.jp/kawabou/pcfull/tm?itmkndCd=4&ofcCd=21280&obsCd=9&isCurrent=true&fld=0',
    cameraSource:'https://www.ktr.mlit.go.jp/arajo/live/camera02.html',
    cameraImage:'https://www.ktr.mlit.go.jp/arajo/realtime/cam/cam02.jpg',
    thresholds:Object.freeze({standby:7.00,advisory:7.50,evacuation:12.80,danger:13.30,plan:14.60}),chartMax:15
  }),
  kumagaya:Object.freeze({
    key:'kumagaya',name:'熊谷',id:'303041283308030',
    waterSource:'https://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303041283308030&KIND=9',
    stationSource:'https://www1.river.go.jp/cgi-bin/SiteInfoDetail.exe?ID=303041283308030',
    riverUrl:'https://www.river.go.jp/kawabou/pcfull/tm?itmkndCd=4&ofcCd=21280&obsCd=7&isCurrent=true&fld=0',
    cameraSource:'https://www.ktr.mlit.go.jp/arajo/live/camera23.html',
    cameraImage:'https://www.ktr.mlit.go.jp/arajo/realtime/cam/cam23.jpg',
    thresholds:Object.freeze({standby:3.00,advisory:3.50,evacuation:5.00,danger:5.50,plan:7.51}),chartMax:8
  })
});
export const THRESHOLDS=STATIONS.iwabuchi.thresholds;

const dateRe=/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/;
const timeRe=/^(\d{1,2}):(\d{2})(?::\d{2})?$/;
export function instant(date,time){const d=String(date).trim().replace(/[年月]/g,'/').replace(/日/g,''),m=dateRe.exec(d),t=timeRe.exec(String(time).trim());if(!m||!t)return null;const[y,mo,day,h,mi]=[+m[1],+m[2],+m[3],+t[1],+t[2]];if(mo<1||mo>12||day<1||day>31||h>24||mi>59||(h===24&&mi!==0))return null;const check=new Date(Date.UTC(y,mo-1,day));if(check.getUTCFullYear()!==y||check.getUTCMonth()!==mo-1||check.getUTCDate()!==day)return null;return new Date(Date.UTC(y,mo-1,day,h,mi)-9*3600000)}
function numeric(s){const v=String(s??'').trim();if(!/^[+-]?\d+(?:\.\d+)?$/.test(v))return null;const n=Number(v);return Number.isFinite(n)?n:null}
export function normalizeObservations(rows){const map=new Map();for(const x of rows){const d=instant(x.date,x.time),v=numeric(x.value);if(!d||v===null||v < -20||v > 100)continue;const iso=d.toISOString();map.set(iso,{timestamp:iso,date:x.date,time:x.time,value:v})}return[...map.values()].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp))}
function splitRow(s){return s.trim().split(/\s*,\s*|\s*\t\s*|\s{2,}/).map(x=>x.trim()).filter(Boolean)}
export function parseWaterText(input){const s=plain(input);let out=[];const rx=/(20\d{2}[\/-]\d{1,2}[\/-]\d{1,2})\s+(\d{1,2}:\d{2})\s+([+-]?\d+(?:\.\d+)?)(?=\s|$)/g;for(const m of s.matchAll(rx))out.push({date:m[1],time:m[2],value:m[3]});if(!out.length){for(const line of s.split('\n')){const c=splitRow(line);if(c.length>=3&&dateRe.test(c[0])&&timeRe.test(c[1]))out.push({date:c[0],time:c[1],value:c[2]});else if(c.length>=5&&/^\d{4}$/.test(c[0])&&/^\d{1,2}$/.test(c[1])&&/^\d{1,2}$/.test(c[2])&&timeRe.test(c[3]))out.push({date:`${c[0]}/${c[1]}/${c[2]}`,time:c[3],value:c[4]})}}return normalizeObservations(out)}
function getRows(h){return[...h.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]\s*>/gi)].map(x=>plain(x[1]).replace(/\n/g,' ').trim()))}
export function parseWaterHtml(html){let out=[];for(const row of getRows(html)){if(row.length<3)continue;const d=row.findIndex(x=>dateRe.test(x));if(d>=0&&timeRe.test(row[d+1]||''))out.push({date:row[d],time:row[d+1],value:row[d+2]})}return normalizeObservations(out.length?out:parseWaterText(html))}
export function summarizeWater(data,station=STATIONS.iwabuchi,now=Date.now()){if(!data.length)throw Error('有効な水位観測値がありません');const history=[...data].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));const latest=history.at(-1),t=Date.parse(latest.timestamp);if(t>now+5*60000)throw Error('観測時刻が未来です');const at=minutes=>history.find(x=>Date.parse(x.timestamp)===t-minutes*60000),delta=minutes=>{const old=at(minutes);return old?Number((latest.value-old.value).toFixed(3)):null};return{state:'ok',station:{key:station.key,name:station.name,id:station.id,riverUrl:station.riverUrl,stationSource:station.stationSource},latest,history,delta10:delta(10),delta60:delta(60),ageMinutes:Math.max(0,Math.round((now-t)/60000)),thresholds:station.thresholds,chartMax:station.chartMax,source:station.waterSource}}
function candidates(html,base){const urls=[];for(const m of html.matchAll(/<(?:iframe|frame)\b[^>]+src\s*=\s*["']([^"']+)["']/gi)){try{const u=new URL(m[1],base);if(u.protocol==='https:'&&u.hostname==='www1.river.go.jp'&&u.pathname.startsWith('/html/frm/'))urls.push(u.href)}catch{}}return urls}
export async function fetchWater(stationKey='iwabuchi'){const station=STATIONS[stationKey];if(!station)throw Error('未知の観測所です');const h=await fetchText(station.waterSource);let data=parseWaterHtml(h);if(!data.length){const urls=candidates(h,station.waterSource);if(!urls.length)throw Error('10分水位のデータ表を確認できません');for(const url of urls){const child=await fetchText(url);data=parseWaterHtml(child);if(data.length)break}}return{...summarizeWater(data,station),retrievedAt:new Date().toISOString()}}
export async function waterHandler(req,res){if(req.method!=='GET')return response(res,405,{error:'Method not allowed'});const stationKey=new URL(req.url||'/?station=iwabuchi','http://localhost').searchParams.get('station')||'iwabuchi';if(!STATIONS[stationKey])return response(res,400,{state:'error',error:'Unknown station',available:Object.keys(STATIONS)});try{return response(res,200,await fetchWater(stationKey))}catch(e){const station=STATIONS[stationKey];return response(res,502,{state:'error',error:String(e.message||e),station:{key:station.key,name:station.name,id:station.id},source:station.waterSource,retrievedAt:new Date().toISOString()})}}
