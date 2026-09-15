export default async function handler(req,res){
  const url='https://upload.wikimedia.org/wikipedia/commons/b/b3/Safety_evacuation_area.svg';
  try{
    const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}});
    const text=await r.text();
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.status(r.status).send(text);
  }catch(e){res.status(500).send(String(e?.stack||e))}
}
