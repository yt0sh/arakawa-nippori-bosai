// Diagnostic only: fixed official sources, no credentials or arbitrary URLs.
const base='https://bosai.city.arakawa.tokyo.jp/';
for(const path of ['common/js/setting.js','common/js/renkei.js','common/js/common.js','common/js/general.js']){
 const url=new URL(path,base).href;
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
 const js=await r.text();
 console.log('\nSOURCE',url,'HTTP',r.status,'bytes',js.length);
 console.log('RELEVANT',js.split(/\r?\n/).filter(x=>/JSON_HINANZYO|Hinanzyo|HINANZYO|getJsonRenkeiData|__DATA_LIST|\.json|API_URL|api_url/i.test(x)).map(x=>x.slice(0,3000)).slice(0,35));
}
