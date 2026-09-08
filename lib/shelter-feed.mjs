import {SOURCES,SHELTERS,norm,response,fetchText} from './arakawa.mjs';

// Official feed used by the ward's hinanjyo-ichiran.js.
export const SHELTER_FEED='https://bosai.city.arakawa.tokyo.jp/apps/get_json.php?file=renkei_1_hinanzyo.js';
export const SHELTER_CODES=Object.freeze({
  'ひぐらし小学校':'hn100240',
  '諏訪台中学校':'hn100340',
  '諏訪台ひろば館':'hn200100',
  '西日暮里ふれあい館':'hn200160',
  '第六日暮里小学校':'hn100230'
});
export function statusState(value){
  const s=norm(value);
  if(/閉鎖|未開設|開設していません/.test(s))return 'closed';
  if(/満員|受入停止/.test(s))return 'full';
  if(/混雑/.test(s))return 'crowded';
  if(/開設準備|準備中/.test(s))return 'preparing';
  if(/開設中|開設済|開設しています|受入中|受け入れ中/.test(s)||s==='開設')return 'open';
  return 'unknown';
}
export function parseShelterFeed(input){
  const doc=typeof input==='string'?JSON.parse(input):input;
  if(!Array.isArray(doc?.Hinanzyo?.features))throw Error('避難所JSONの施設一覧を確認できません');
  const rows=doc.Hinanzyo.features.map(f=>f?.properties?.attr).filter(a=>a&&typeof a==='object');
  const shelters=SHELTERS.map(target=>{
    const code=SHELTER_CODES[target.name];
    const matches=rows.filter(a=>a.code===code || (norm(a.name)===norm(target.name)&&norm(a.address)===norm(target.address)));
    const exact=matches.filter(a=>norm(a.name)===norm(target.name)&&norm(a.address)===norm(target.address));
    const a=matches.length===1&&exact.length===1?exact[0]:null;
    const raw=typeof a?.status==='string'?a.status.trim():'';
    return {...target,code,state:statusState(raw),status:raw||'開設状況を確認できません',recordUpdatedAt:a?.update_at||null,source:SHELTER_FEED};
  });
  return {state:'ok',shelters,source:SHELTER_FEED,publicSource:SOURCES.shelters,dataUpdatedAt:doc.Update_At||null,coverage:{matched:shelters.filter(s=>s.state!=='unknown').length,total:shelters.length}};
}
export async function shelterHandler(req,res){
  if(req.method!=='GET')return response(res,405,{error:'Method not allowed'});
  try{return response(res,200,{...parseShelterFeed(await fetchText(SHELTER_FEED)),retrievedAt:new Date().toISOString()})}
  catch(e){return response(res,502,{state:'error',error:String(e.message||e),source:SHELTER_FEED,retrievedAt:new Date().toISOString()})}
}
