// One-off, read-only diagnostic against fixed public official sources.
const origin='https://bosai.city.arakawa.tokyo.jp';
const urls=[origin+'/apps/get_json.php?file=renkei_1_hinanzyo.js',origin+'/hinan/js/hinanjyo-ichiran.js',origin+'/js/common.js',origin+'/hinan/hinanjyo-ichiran.html'];
for(const url of urls){
  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{Accept:'application/json, text/javascript, text/html, */*'}});
    const text=await r.text();
    console.log('\nSOURCE',url,'HTTP',r.status,'TYPE',r.headers.get('content-type'),'BYTES',text.length);
    if(url.includes('get_json.php')){
      console.log('HEAD',text.slice(0,200));
      let data;try{data=JSON.parse(text)}catch{console.log('JSON parse failed');continue}
      console.log('TOP_KEYS',Object.keys(data));
      console.log('DATA_TIME',data.Update_At||data.update_at||null);
      const rows=data.Hinanzyo?.features;
      console.log('FEATURE_COUNT',rows?.length);
      console.log('MATCHES',JSON.stringify(rows?.map(f=>f?.properties?.attr).filter(a=>a&&/ひぐらし|諏訪台|西日暮里ふれあい|第六日暮里/.test(a.name||'')).map(a=>({code:a.code,name:a.name,address:a.address,status:a.status,update_at:a.update_at})),null,2));
    }else{
      console.log('REFERENCES',text.split(/\r?\n/).filter(s=>/__JSON_HINANZYO|renkei_1_hinanzyo|getJsonRenkeiData|\.js["']/.test(s)).map(s=>s.slice(0,500)).slice(0,25));
    }
  }catch(e){console.log('FETCH_ERROR',e.message)}
}
