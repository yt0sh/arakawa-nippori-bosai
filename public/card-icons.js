const LOGOS={
  'jreast.co.jp':{cls:'mark-jr',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/JR_East_logo.svg',alt:'JR東日本'},
  'tokyometro.jp':{cls:'mark-metro',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tokyo_Metro_logo.svg',alt:'東京メトロ'},
  'keisei.co.jp':{cls:'mark-keisei',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Keisei_Electric_Railway_logo.svg',alt:'京成電鉄'},
  'kotsu.metro.tokyo.jp':{cls:'mark-toei',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Toei_Transportation_combined_logo.svg',alt:'都営交通'}
};

const ICONS={
  'teideninfo.tepco.co.jp':{cls:'mark-electric',label:'電気',svg:`<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M54 7 25 52h21l-5 37 30-47H50z" fill="currentColor"/></svg>`},
  'fmap.tokyo-gas.co.jp':{cls:'mark-gas',label:'ガス',svg:`<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M49 8c4 17-13 20-13 35 0 6 3 11 8 14-1-12 7-18 12-25 2 11 13 17 13 32 0 16-10 25-22 25S26 80 26 65c0-19 13-29 23-57Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M50 53c0 8-9 11-9 20 0 7 4 12 10 12 7 0 12-5 12-13 0-8-5-13-13-19Z" fill="currentColor"/></svg>`},
  'waterworks.metro.tokyo.lg.jp':{cls:'mark-water',label:'水道',svg:`<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M19 38h47c7 0 12 5 12 12v5H63v-4H19z" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 38V27h24v11M48 27V17M38 17h20" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M70 63c0 0-10 11-10 18a10 10 0 0 0 20 0c0-7-10-18-10-18Z" fill="currentColor"/></svg>`},
  'gesui.metro.tokyo.lg.jp':{cls:'mark-sewer',label:'下水道',svg:`<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M15 29c8-7 16 7 24 0s16 7 24 0 14 5 18 1" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><rect x="15" y="42" width="66" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="5"/><path d="M27 45v12M39 45v12M51 45v12M63 45v12M75 45v12M38 69v14m0 0-6-7m6 7 6-7M59 69v14m0 0-6-7m6 7 6-7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
};

function hostOf(link){try{return new URL(link.href).hostname.replace(/^www\./,'')}catch{return''}}
function addBrandMark(link,cfg){
  link.classList.add('icon-link-card',cfg.cls);
  const mark=document.createElement('span');mark.className='card-mark brand-mark';mark.setAttribute('aria-hidden','true');
  const img=document.createElement('img');img.src=cfg.src;img.alt='';img.loading='lazy';img.decoding='async';mark.append(img);link.prepend(mark);
}
function addUtilityMark(link,cfg){
  link.classList.add('icon-link-card',cfg.cls);
  const mark=document.createElement('span');mark.className='card-mark utility-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML=cfg.svg;link.prepend(mark);
}

for(const link of document.querySelectorAll('.link-grid.four a')){
  const host=hostOf(link);
  if(LOGOS[host])addBrandMark(link,LOGOS[host]);
  else if(ICONS[host])addUtilityMark(link,ICONS[host]);
}
