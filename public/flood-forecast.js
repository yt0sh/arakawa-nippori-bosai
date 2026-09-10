(()=>{
  const q=s=>document.querySelector(s);
  const fmt=t=>{const d=new Date(t);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Tokyo'}).format(d):''};
  function setDot(kind=''){const d=q('#floodDot');if(d)d.className='dot '+kind}
  async function load(){
    const status=q('#floodStatus'),detail=q('#floodDetail'),time=q('#floodTime');
    if(!status||!detail||!time)return;
    try{
      const r=await fetch('/api/flood-forecast',{cache:'no-store'});
      const d=await r.json();
      if(!r.ok||d.state==='error')throw Error(d.error||'取得失敗');
      if(d.state==='none'){
        status.textContent='発表なし';
        detail.textContent='荒川を対象とする指定河川洪水予報は現在発表されていません。';
        time.textContent=d.retrievedAt?'気象庁確認 '+fmt(d.retrievedAt):'';
        setDot('ok');
        return;
      }
      status.textContent=d.label||'指定河川洪水予報 発表中';
      detail.textContent=d.headline||'荒川の指定河川洪水予報が発表されています。公式情報を確認してください。';
      time.textContent=(d.reportDatetime?'発表 '+fmt(d.reportDatetime):'')+(d.publishingOffice?'｜'+d.publishingOffice:'');
      setDot(d.level>=5?'lv5':d.level>=4?'lv4':d.level>=3?'warn':'adv');
    }catch{
      status.textContent='取得できません';
      detail.textContent='気象庁の指定河川洪水予報を直接確認してください。';
      time.textContent='';
      setDot('');
    }
  }
  load();setInterval(load,300000);
})();
