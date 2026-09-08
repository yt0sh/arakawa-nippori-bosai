// Diagnostic only: fixed official sources, no arbitrary URL input or credentials.
const sources = {
  shelters: 'https://bosai.city.arakawa.tokyo.jp/hinan/hinanjyo-ichiran.html',
  camera: 'https://www.ktr.mlit.go.jp/arage/arage00563.html'
};
for (const [name,url] of Object.entries(sources)) {
  const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
  const html=await r.text();
  console.log('\nSOURCE',name,'HTTP',r.status,'bytes',html.length);
  console.log('SCRIPTS', [...html.matchAll(/<script\b[^>]*src=["']([^"']+)/gi)].map(x=>x[1]));
  console.log('IFRAMES', [...html.matchAll(/<iframe\b[^>]*src=["']([^"']+)/gi)].map(x=>x[1]));
  console.log('IMAGES', [...html.matchAll(/<img\b[^>]*>/gi)].map(x=>x[0]).filter(x=>/camera|live|岩淵|000761|000\d{6}|\.jpg|\.jpeg/i.test(x)).slice(-15));
  console.log('RELEVANT', html.split(/\r?\n/).filter(x=>/閉鎖中|ひぐらし|諏訪台|第六日暮里|避難所|hinanjyo|shelter|camera|ライブカメラ/.test(x)).map(x=>x.slice(0,1200)).slice(-30));
}
