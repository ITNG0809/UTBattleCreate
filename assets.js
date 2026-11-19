/* 素材管理: assets(画像本体dataURL)とcostumes(表示設定)。同じ素材を複数コスチューム/複数箇所で再利用可 */
(function(g){
const rad=d=>d*Math.PI/180,cache={},MAX=1024,LIM=3e6;
const A={P:null,onload:null,
 get(id){const P=A.P;if(!id||!P)return null;const k=(P.costumes||[]).find(x=>x.id===id),a=k&&(P.assets||[]).find(x=>x.id===k.asset);if(!a)return null;
  let e=cache[a.id];if(!e||e.src!==a.src){e=cache[a.id]={src:a.src,st:0,img:new Image()};e.img.onload=()=>{e.st=1;A.onload&&A.onload()};e.img.onerror=()=>e.st=2;e.img.src=a.src}
  return e.st===1&&e.img.naturalWidth?{img:e.img,w:e.img.naturalWidth,h:e.img.naturalHeight,cos:k}:null},
 draw(c,im,tw,th){const k=im.cos,sx=tw/im.w*(k.scale||1),sy=th/im.h*(k.scale||1);c.save();c.rotate(rad(k.rot||0));c.drawImage(im.img,-k.cx*sx,-k.cy*sy,im.w*sx,im.h*sy);c.restore()},
 async add(P,files){const errs=[];P.assets=P.assets||[];P.costumes=P.costumes||[];
  for(const f of files){try{if(!/\.(png|svg|gif|webp|jpe?g)$/i.test(f.name)&&!/^image\//.test(f.type))throw new Error('対応していない形式です');
   if(f.size>LIM)throw new Error('3MBを超えています');
   let src=await new Promise((o,r)=>{const fr=new FileReader();fr.onload=()=>o(fr.result);fr.onerror=()=>r(new Error('読み込めません'));fr.readAsDataURL(f)});
   const im=await new Promise((o,r)=>{const i=new Image();i.onload=()=>o(i);i.onerror=()=>r(new Error('画像として開けません(破損?)'));i.src=src});
   let w=im.naturalWidth||100,h=im.naturalHeight||100;
   if(/\.(png|webp|jpe?g)$/i.test(f.name)&&Math.max(w,h)>MAX){const s=MAX/Math.max(w,h),cv=document.createElement('canvas');cv.width=w=Math.round(w*s);cv.height=h=Math.round(h*s);cv.getContext('2d').drawImage(im,0,0,w,h);src=cv.toDataURL('image/png')}
   const id='as'+Math.random().toString(36).slice(2,8),n=f.name.replace(/\.[^.]+$/,'');
   P.assets.push({id,name:f.name,src,w,h,type:f.type||''});P.costumes.push({id:'co'+id,name:n,asset:id,cx:w/2,cy:h/2,scale:1,rot:0})}
  catch(x){errs.push(f.name+': '+x.message)}}return errs},
 missing(P){const ok=new Set((P.costumes||[]).filter(k=>(P.assets||[]).some(a=>a.id===k.asset)).map(k=>k.id)),m=new Set();
  for(const p of P.patterns)for(const q of[...(p.bullets||[]),...(p.parts||[])])if(q.costume&&!ok.has(q.costume))m.add('パターン「'+p.name+'」の攻撃パーツ');
  for(const e of P.enemies)if(e.costume&&!ok.has(e.costume))m.add('敵「'+e.name+'」');return[...m]}};
g.Assets=A;})(window);
