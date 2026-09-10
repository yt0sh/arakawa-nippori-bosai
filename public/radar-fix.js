// v0.8 radar rendering correction.
// JMA high-resolution precipitation nowcast (hrpns) tiles are served through zoom 10.
// The previous z=12 requests returned transparent placeholder tiles around Arakawa-ku.
updateRadar = async function(r){
  const box=q('#radar'),err=q('#radarError');
  if(!r||r.state!=='ok'){
    err.style.display='flex';
    q('#radarLabel').textContent='降水レイヤーを取得できません';
    return;
  }

  const z=10;
  const p=tileXY(CONFIG.center.lat,CONFIG.center.lon,z);
  const cx=Math.floor(p.x),cy=Math.floor(p.y);
  const old=qa('#radar .tile'),added=[];
  let radarFail=0,baseFail=0;

  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const x=cx+dx,y=cy+dy;
    const base=tile(box,`https://cyberjapandata.gsi.go.jp/xyz/std/${z}/${x}/${y}.png`,dx,dy,'base-tile');
    const rain=tile(box,`/api/radar-tile?z=${z}&x=${x}&y=${y}&b=${r.basetime}&v=${r.validtime}`,dx,dy,'radar-tile');
    added.push([base,'base'],[rain,'radar']);
  }

  await Promise.all(added.map(([im,kind])=>new Promise(resolve=>{
    let done=false;
    const finish=ok=>{
      if(done)return;
      done=true;
      if(!ok){if(kind==='radar')radarFail++;else baseFail++;}
      resolve();
    };
    im.onload=()=>finish(true);
    im.onerror=()=>finish(false);
    setTimeout(()=>finish(!!im.naturalWidth),8000);
  })));

  old.forEach(x=>x.remove());
  err.style.display=radarFail===9?'flex':'none';
  q('#radarMarker').style.left=((1+p.x-cx)/3*100)+'%';
  q('#radarMarker').style.top=((1+p.y-cy)/3*100)+'%';
  q('#radarLabel').textContent='気象庁 降水レイヤー｜'+fmt(r.timestamp)+(radarFail?'｜一部取得失敗':'')+(baseFail?'｜地図 一部取得失敗':'');
};
