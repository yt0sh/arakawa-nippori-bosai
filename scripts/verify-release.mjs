import assert from 'node:assert/strict';
const origin='https://arakawa-nippori-bosai-iqlqthkb8-ss-4769.vercel.app';
async function get(path){const r=await fetch(origin+path,{signal:AbortSignal.timeout(25000),cache:'no-store'});assert.equal(r.status,200,`${path}: HTTP ${r.status}`);return r}
const html=await (await get('/')).text();assert.match(html,/v0\.7/);assert.match(html,/data-hours="12"/);assert.match(html,/data-hours="120"/);assert.match(html,/water-v07\.js/);console.log('PASS frontend v0.7');
const app=await (await get('/app.js?v=0.7.0')).text();assert.match(app,/BosaiWater\.drawChart/);assert.match(app,/train_info\/kanto\.aspx/);console.log('PASS generated app');
const cam=await get('/api/camera');assert.match(cam.headers.get('content-type')||'',/image\/jpeg/);const bytes=new Uint8Array(await cam.arrayBuffer());assert(bytes.length>1000&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255);console.log('PASS camera JPEG',bytes.length,'bytes');
const [s,w,e,u]=await Promise.all(['/api/shelters','/api/water','/api/evacuation','/api/utilities'].map(async p=>(await get(p)).json()));
assert.equal(s.state,'ok');assert.equal(s.shelters.length,5);assert.equal(s.coverage.matched,5);console.log('PASS shelters',JSON.stringify({statuses:s.shelters.map(x=>[x.name,x.status]),dataUpdatedAt:s.dataUpdatedAt}));
assert.equal(w.state,'ok');assert(Number.isFinite(w.latest.value));assert(w.history.length>=2);assert(w.history.every((p,i,a)=>i===0||Date.parse(a[i-1].timestamp)<Date.parse(p.timestamp)));
const latest=Date.parse(w.latest.timestamp),first=Date.parse(w.history[0].timestamp),cutoff=latest-120*3600000,span=(latest-first)/3600000;
assert(span>=120,'Five-day history unavailable: '+span+' hours');assert(w.history.some(p=>Date.parse(p.timestamp)<=cutoff+10*60000),'Five-day start missing');
assert(Number.isFinite(w.ageMinutes)&&w.ageMinutes>=-5&&w.ageMinutes<30,'Water observation is stale or future-dated');
console.log('PASS water',JSON.stringify({latest:w.latest,historyCount:w.history.length,spanHours:span,ageMinutes:w.ageMinutes,delta10:w.delta10,delta60:w.delta60,thresholds:w.thresholds}));
assert(['active','none','unknown'].includes(e.state)&&e.levels);console.log('PASS evacuation',JSON.stringify({state:e.state,highest:e.highest}));assert.equal(u.utilities.length,8);assert(u.utilities.find(x=>x.id==='jr').url.endsWith('/kanto.aspx'));console.log('PASS utilities',u.utilities.length);
console.log('RELEASE SMOKE PASS');
