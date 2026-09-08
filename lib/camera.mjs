import {response} from './arakawa.mjs';
export const CAMERA_SOURCE='https://www.ktr.mlit.go.jp/arage/arage00563.html';
export const CAMERA_IMAGE='https://www.ktr.mlit.go.jp/arage/live-camera/iwabuchikami.jpg';
export async function cameraHandler(req,res){
  if(req.method!=='GET')return response(res,405,{error:'Method not allowed'});
  try{
    const r=await fetch(CAMERA_IMAGE,{signal:AbortSignal.timeout(10000),cache:'no-store'});
    if(!r.ok)throw Error(`上流 HTTP ${r.status}`);
    const type=r.headers.get('content-type')||'';
    const bytes=new Uint8Array(await r.arrayBuffer());
    if(!/image\/jpeg/i.test(type)||bytes.length<1000||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw Error('ライブカメラJPEGを確認できません');
    res.statusCode=200;
    res.setHeader('Content-Type','image/jpeg');
    res.setHeader('Cache-Control','public, s-maxage=60, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.end(Buffer.from(bytes));
  }catch(e){return response(res,502,{state:'error',error:String(e.message||e),source:CAMERA_SOURCE,retrievedAt:new Date().toISOString()})}
}
