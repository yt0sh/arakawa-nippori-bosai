// Diagnostic only: fixed official sources, no credentials or arbitrary URLs.
const base='https://bosai.city.arakawa.tokyo.jp/hinan/';
const url=new URL('js/hinanjyo-ichiran.js',base).href;
const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
if(!r.ok)throw Error(`Official script HTTP ${r.status}`);
const js=await r.text();
console.log('SOURCE',url,'HTTP',r.status,'bytes',js.length);
console.log('SCRIPT_BEGIN\n'+js.slice(0,25000)+'\nSCRIPT_END');
