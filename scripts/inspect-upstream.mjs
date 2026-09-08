const source='https://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303041283309040&KIND=9';
const root='https://www1.river.go.jp';
const fetchText=async u=>{const r=await fetch(u,{signal:AbortSignal.timeout(15000)});const buf=await r.arrayBuffer();return{status:r.status,type:r.headers.get('content-type'),text:new TextDecoder('euc-jp').decode(buf),bytes:buf.byteLength}};
const main=await fetchText(source);const link=[...main.text.matchAll(/href=["']([^"']+\.dat)["']/gi)][0]?.[1];if(!link)throw Error('DAT link absent');const url=new URL(link,root).href;const d=await fetchText(url);console.log('DAT',url,d.status,d.type,d.bytes);console.log('HEAD\n'+d.text.slice(0,6500));console.log('TAIL\n'+d.text.slice(-1200));console.log('LINES',d.text.split(/\r?\n/).length);
const frames=[...main.text.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)];for(const m of frames){const f=await fetchText(new URL(m[1],root).href);console.log('FRAME',f.status,f.bytes,f.text.slice(0,2200));}
