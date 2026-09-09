import {response} from './arakawa.mjs';
import {STATIONS} from './water.mjs';
export async function cameraHandler(req,res){
  if(req.method!=='GET')return response(res,405,{error:'Method not allowed'});
  const stationKey=new URL(req.url||'/?station=iwabuchi','http://localhost').searchParams.get('station')||'iwabuchi',station=STATIONS[stationKey];
  if(!station)return response(res,400,{state:'error',error:'Unknown station',available:Object.keys(STATIONS)});
  try{
    const r=await fetch(station.cameraImage,{signal:AbortSignal.timeout(10000),cache:'no-store'});
    if(!r.ok)throw Error(`上流 HTTP ${r.status}`);
    const type=r.headers.get('content-type')||'',bytes=new Uint8Array(await r.arrayBuffer());
    if(!/image\/jpeg/i.test(type)||bytes.length<1000||bytes.length>4000000||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw Error('ライブカメラJPEGを確認できません');
    res.statusCode=200;res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','public, s-maxage=60, max-age=0, must-revalidate');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Camera-Station',station.key);res.end(Buffer.from(bytes))
  }catch(e){return response(res,502,{state:'error',error:String(e.message||e),station:{key:station.key,name:station.name},source:station.cameraSource,retrievedAt:new Date().toISOString()})}
}
