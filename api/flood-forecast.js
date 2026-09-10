import {response} from '../lib/arakawa.mjs';

const SOURCE='https://www.jma.go.jp/bosai/flood/data/r8/flood_xml.json';
const RIVER_CODE='8303040001';

async function getJson(url){
  const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'ArakawaFloodDashboard/0.8'},signal:AbortSignal.timeout(10000),cache:'no-store'});
  if(!r.ok)throw Error(`HTTP ${r.status}`);
  return r.json();
}

function stringsByKey(root,re){
  const out=[];
  const walk=v=>{
    if(!v||typeof v!=='object')return;
    if(Array.isArray(v)){for(const x of v)walk(x);return;}
    for(const [k,x] of Object.entries(v)){
      if(re.test(k)&&['string','number'].includes(typeof x))out.push(String(x));
      if(x&&typeof x==='object')walk(x);
    }
  };
  walk(root);return out;
}

function levelOf(report){
  const s=JSON.stringify(report);
  if(/レベル[５5]|氾濫特別警報|氾濫発生情報/.test(s))return 5;
  if(/レベル[４4]|氾濫危険警報|氾濫危険情報/.test(s))return 4;
  if(/レベル[３3]|氾濫警報|氾濫警戒情報/.test(s))return 3;
  if(/レベル[２2]|氾濫注意報|氾濫注意情報/.test(s))return 2;
  return null;
}

function summarize(report){
  const level=levelOf(report);
  const times=stringsByKey(report,/^(reportDatetime|reportDateTime|targetDatetime|targetDateTime|controlDatetime|dateTime)$/i);
  const offices=stringsByKey(report,/^(publishingOffice|editorialOffice)$/i);
  const headlines=stringsByKey(report,/^(headlineText|headline|title|text)$/i).filter(x=>x&&x.length<300);
  const label=level===5?'レベル5 氾濫特別警報':level===4?'レベル4 氾濫危険警報':level===3?'レベル3 氾濫警報':level===2?'レベル2 氾濫注意報':'指定河川洪水予報 発表中';
  return {state:'active',river:'荒川',riverCode:RIVER_CODE,level,label,headline:headlines.find(x=>/荒川|氾濫|洪水/.test(x))||headlines[0]||'',reportDatetime:times[0]||null,publishingOffice:offices[0]||'気象庁・国土交通省',source:SOURCE};
}

export default async function(req,res){
  if(req.method!=='GET')return response(res,405,{error:'Method not allowed'});
  try{
    const data=await getJson(SOURCE);
    const reports=(Array.isArray(data)?data:[]).filter(x=>JSON.stringify(x).includes(RIVER_CODE));
    if(!reports.length)return response(res,200,{state:'none',river:'荒川',riverCode:RIVER_CODE,label:'発表なし',headline:'荒川を対象とする指定河川洪水予報は現在の発表一覧にありません。',reportDatetime:null,publishingOffice:'気象庁・国土交通省',source:SOURCE,retrievedAt:new Date().toISOString()});
    const ranked=reports.map(summarize).sort((a,b)=>(b.level||0)-(a.level||0));
    return response(res,200,{...ranked[0],retrievedAt:new Date().toISOString()});
  }catch(e){
    return response(res,502,{state:'error',error:String(e.message||e),river:'荒川',riverCode:RIVER_CODE,source:SOURCE,retrievedAt:new Date().toISOString()});
  }
}
