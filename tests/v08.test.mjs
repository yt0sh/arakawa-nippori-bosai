import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {STATIONS,summarizeWater,normalizeObservations} from '../lib/water.mjs';
test('three requested river stations are configured with exact IDs and public links',()=>{
  assert.equal(STATIONS.iwabuchi.id,'303041283309040');assert.equal(STATIONS.chisuibashi.id,'303041283308060');assert.equal(STATIONS.kumagaya.id,'303041283308030');
  assert.equal(STATIONS.iwabuchi.name,'岩淵水門');
  assert.match(STATIONS.chisuibashi.cameraImage,/cam02\.jpg$/);assert.match(STATIONS.kumagaya.cameraImage,/cam23\.jpg$/);
  assert.match(STATIONS.iwabuchi.riverUrl,/obsCd=6/);assert.match(STATIONS.chisuibashi.riverUrl,/obsCd=9/);assert.match(STATIONS.kumagaya.riverUrl,/obsCd=7/)
});
test('station-specific thresholds and requested chart ranges remain distinct',()=>{
  assert.deepEqual(STATIONS.chisuibashi.thresholds,{standby:7,advisory:7.5,evacuation:12.8,danger:13.3,plan:14.6});
  assert.deepEqual(STATIONS.kumagaya.thresholds,{standby:3,advisory:3.5,evacuation:5,danger:5.5,plan:7.51});
  assert.equal(STATIONS.iwabuchi.chartMax,8);assert.equal(STATIONS.chisuibashi.chartMax,14);assert.equal(STATIONS.kumagaya.chartMax,6)
});
test('water summary returns selected station metadata and exact deltas',()=>{
  const rows=normalizeObservations([{date:'2026/09/10',time:'08:00',value:'2.00'},{date:'2026/09/10',time:'08:50',value:'2.20'},{date:'2026/09/10',time:'09:00',value:'2.30'}]);
  const now=Date.parse('2026-09-10T00:05:00Z'),d=summarizeWater(rows,STATIONS.kumagaya,now);
  assert.equal(d.station.key,'kumagaya');assert.equal(d.latest.value,2.3);assert.equal(d.delta10,.1);assert.equal(d.delta60,.3);assert.equal(d.chartMax,6)
});
test('v0.8 frontend uses requested links, defaults to five days, and orders stations upstream to downstream',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),css=readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
  assert.match(html,/bosai\/warning\/#area_type=class20s&amp;area_code=1311800/);
  assert.match(html,/pattern=default&amp;area_type=class20s&amp;area_code=1311800/);
  assert.match(html,/risk\/#zoom:12\/lat:35\.732021\/lon:139\.785919\/colordepth:normal\/elements:flood/);
  assert.match(html,/洪水キキクル/);
  assert.match(html,/表示期間切り替え/);assert.match(html,/data-range="120" class="active"/);
  assert.match(html,/arajo\/index\.html/);assert.match(html,/arage\/index\.html/);assert.match(html,/river\.go\.jp\/index\/twninfo/);
  assert.match(html,/国土地理院（グレースケール）/);
  assert.match(html,/keisei\.co\.jp\/traininfo\/index\.php/);assert.match(html,/kotsu\.metro\.tokyo\.jp\/subway\//);
  assert.ok(app.indexOf("key:'kumagaya'")<app.indexOf("key:'chisuibashi'")&&app.indexOf("key:'chisuibashi'")<app.indexOf("key:'iwabuchi'"));
  assert.match(app,/let chartHours=120/);assert.match(app,/radarZoom:10/);assert.match(app,/\/api\/radar-tile/);
  assert.match(css,/filter:grayscale\(1\)/);assert.match(css,/\.radar\{aspect-ratio:1\/1\}/);
  assert(!html.includes('id="shelters"'));assert(!html.includes('id="utilities"'))
});
