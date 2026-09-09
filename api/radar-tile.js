export default async function(req,res){
  if(req.method!=='GET'){res.statusCode=405;return res.end('Method not allowed')}
  const u=new URL(req.url||'/','http://localhost'),z=Number(u.searchParams.get('z')),x=Number(u.searchParams.get('x')),y=Number(u.searchParams.get('y')),b=u.searchParams.get('b')||'',v=u.searchParams.get('v')||'';
  const n=2**z;
  if(!Number.isInteger(z)||z<8||z>14||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=n||y>=n||!/^\d{14}$/.test(b)||!/^\d{14}$/.test(v)){res.statusCode=400;return res.end('Bad tile request')}
  const src=`https://www.jma.go.jp/bosai/jmatile/data/nowc/${b}/none/${v}/surf/hrpns/${z}/${x}/${y}.png`;
  try{const r=await fetch(src,{signal:AbortSignal.timeout(10000),cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const type=r.headers.get('content-type')||'',bytes=new Uint8Array(await r.arrayBuffer());if(!/image\/png/i.test(type)||bytes.length<50||bytes.length>2000000)throw Error('Invalid PNG');res.statusCode=200;res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, s-maxage=3600, max-age=300, stale-while-revalidate=86400');res.setHeader('X-Content-Type-Options','nosniff');res.end(Buffer.from(bytes))}catch(e){res.statusCode=502;res.setHeader('Cache-Control','no-store');res.end('Radar tile unavailable')}
}
