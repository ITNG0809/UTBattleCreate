/* Attack Parts: 攻撃パーツ登録簿。新しい種類は Parts.types[名前]={label,defaults,editAt,state,draw,hit} を追加するだけ */
(function(g){
const rad=d=>d*Math.PI/180,TAU=Math.PI*2;
/* 移動方式(mv): line=直線(+加速) / sine=波 / circle=円・渦巻き / bezier=2次ベジェ曲線 / home=SOUL追尾 */
const MV={mv:'line',amp:30,freq:1,phase:0,grow:0,cx:240,cy:60,ex:240,ey:200,mdur:2,turn:90,spd:0,hLife:0};
const lin=(p,s)=>[p.x+(p.vx||0)*s+.5*(p.ax||0)*s*s,p.y+(p.vy||0)*s+.5*(p.ay||0)*s*s];
function pos(p,s){const m=p.mv,[x,y]=lin(p,s);if(!m||m==='line'||m==='home')return[x,y];
 if(m==='sine'){const vx=(p.vx||0)+(p.ax||0)*s,vy=(p.vy||0)+(p.ay||0)*s,L=Math.hypot(vx,vy),nx=L?-vy/L:0,ny=L?vx/L:1,o=p.amp*Math.sin(TAU*p.freq*s+rad(p.phase));return[x+nx*o,y+ny*o]}
 if(m==='circle'){const w=TAU*p.freq*s+rad(p.phase),r=p.amp+(p.grow||0)*s;return[x+r*Math.cos(w)-p.amp*Math.cos(rad(p.phase)),y+r*Math.sin(w)-p.amp*Math.sin(rad(p.phase))]}
 if(m==='bezier'){const d=Math.max(.05,p.mdur),u=s/d;if(u<=1){const k=1-u;return[k*k*p.x+2*k*u*p.cx+u*u*p.ex,k*k*p.y+2*k*u*p.cy+u*u*p.ey]}return[p.ex+(p.ex-p.cx)*2*(u-1),p.ey+(p.ey-p.cy)*2*(u-1)]}
 return[x,y]}
/* 追尾: 時間で積分する必要があるため弾ごとに実行時状態を持つ(巻き戻り/再開始/値の編集で初期化) */
const RT=new WeakMap();
function homeInit(p){const sp=p.spd>0?p.spd:(Math.hypot(p.vx||0,p.vy||0)||80),a=(p.vx||p.vy)?Math.atan2(p.vy,p.vx):Math.PI/2;return{t:p.t,x:p.x,y:p.y,a,sp,sig:[p.t,p.x,p.y,p.vx,p.vy,p.spd,p.turn,p.hLife].join()}}
function homeStep(r,p,tg,d){if(!(p.hLife>0&&r.t-p.t>=p.hLife)){let da=Math.atan2(tg.y-r.y,tg.x-r.x)-r.a;da=Math.atan2(Math.sin(da),Math.cos(da));const m=rad(p.turn)*d;r.a+=Math.max(-m,Math.min(m,da))}r.x+=Math.cos(r.a)*r.sp*d;r.y+=Math.sin(r.a)*r.sp*d;r.t+=d}
function homePos(p,t){const sig=[p.t,p.x,p.y,p.vx,p.vy,p.spd,p.turn,p.hLife].join();let r=RT.get(p);if(!r||t<r.t-1e-6||r.sig!==sig){r=homeInit(p);RT.set(p,r)}
 const tg=g.Parts&&g.Parts.target||{x:240,y:135};while(r.t<t-1e-9)homeStep(r,p,tg,Math.min(1/120,t-r.t));return[r.x,r.y,r.a*180/Math.PI]}
/* 位置と進行方向(度)を返す */
function motion(p,s,t){if(p.mv==='home'){const[x,y,h]=homePos(p,t);return{x,y,h}}const[x,y]=pos(p,s);if(!p.face)return{x,y};const[x1,y1]=pos(p,s+.02),[x0,y0]=pos(p,Math.max(0,s-.02));return{x,y,h:(x1===x0&&y1===y0)?null:Math.atan2(y1-y0,x1-x0)*180/Math.PI}}
const ang=(p,st)=>p.face&&st.h!=null?st.h:(p.angle||0);
const local=(p,st,sx,sy)=>{const a=rad(ang(p,st)),dx=sx-st.x,dy=sy-st.y;return[dx*Math.cos(a)+dy*Math.sin(a),-dx*Math.sin(a)+dy*Math.cos(a)]};
const base=(p,t)=>{const s=t-p.t;if(s<0||(p.life>0&&s>p.life))return null;const m=motion(p,s,t);return{x:m.x,y:m.y,s,h:m.h}};
const T={
 bullet:{label:'弾',editAt:0,defaults:{r:5,color:'#ffffff',dmg:4,vx:0,vy:60,ax:0,ay:0,life:0,hitPad:0,block:1,shoot:1,only:'',...MV},state:base,
  draw(c,p,st){const im=Assets.get(p.costume);if(im){c.save();c.translate(st.x,st.y);Assets.draw(c,im,p.r*2,p.r*2);c.restore();return}c.fillStyle=p.color;c.beginPath();c.arc(st.x,st.y,p.r,0,7);c.fill()},
  hit:(p,st,sx,sy,rr)=>Math.hypot(st.x-sx,st.y-sy)<p.r+(rr??3)+(p.hitPad||0)},
 bone:{label:'骨',editAt:0,defaults:{len:80,w:8,angle:0,color:'#ffffff',dmg:4,vx:0,vy:0,ax:0,ay:0,life:0,hitPad:0,block:1,shoot:1,only:'',face:0,...MV},state:base,
  draw(c,p,st){c.save();c.translate(st.x,st.y);c.rotate(rad(ang(p,st)));const im=Assets.get(p.costume);if(im)Assets.draw(c,im,p.len,p.w);else{c.fillStyle=p.color;c.fillRect(-p.len/2,-p.w/2,p.len,p.w);
   for(const e of[-1,1])for(const d of[-1,1]){c.beginPath();c.arc(e*p.len/2,d*p.w*.45,p.w*.6,0,7);c.fill()}}c.restore()},
  hit(p,st,sx,sy,rr){const[lx,ly]=local(p,st,sx,sy),r=rr??3;return Math.abs(lx)<p.len/2+r+(p.hitPad||0)&&Math.abs(ly)<p.w/2+r+(p.hitPad||0)}},
 blaster:{label:'ガスターブラスター',editAt:.3,defaults:{size:1,angle:90,wait:.8,beamDur:.6,beamLen:400,beamW:30,color:'#ffffff',dmg:6,vx:0,vy:0,ax:0,ay:0,hitPad:0,block:1,shoot:1,only:'',...MV},
  state(p,t){const s=t-p.t;if(s<0)return null;const I=.3,O=.25,F=I+p.wait,E=F+p.beamDur;if(s>E+O)return null;const mo=motion(p,s,t),x=mo.x,y=mo.y;
   const ph=s<I?'in':s<F?'charge':s<E?'fire':'out';return{x,y,s,ph,k:ph==='in'?.4+.6*s/I:1,a:ph==='out'?1-(s-E)/O:ph==='in'?s/I:1,bk:ph==='fire'?Math.max(0,Math.min(1,(s-F)/.08,(E-s)/.08)):0}},
  draw(c,p,st,edit){const k=p.size*st.k;c.save();c.translate(st.x,st.y);c.rotate(rad(p.angle));c.globalAlpha=st.a;c.fillStyle=p.color;
   const im=Assets.get(p.costume);if(im)Assets.draw(c,im,44*k,32*k);else{c.fillRect(-16*k,-10*k,24*k,20*k);c.beginPath();c.moveTo(8*k,-8*k);c.lineTo(20*k,-5*k);c.lineTo(20*k,5*k);c.lineTo(8*k,8*k);c.fill();
   c.fillStyle='#000';c.fillRect(-9*k,-6*k,4*k,4*k);c.fillRect(-9*k,2*k,4*k,4*k);const open=st.ph==='fire'||st.ph==='charge'&&st.s>.3+p.wait*.5;if(open)c.fillRect(12*k,-2*k,8*k,4*k);}
   if(st.bk>0){const hw=p.beamW*st.bk/2;c.globalAlpha=st.a*.35;c.fillStyle=p.color;c.fillRect(20*k,-hw*1.3,p.beamLen,hw*2.6);c.globalAlpha=st.a;c.fillRect(20*k,-hw,p.beamLen,hw*2)}
   if(edit){c.globalAlpha=.4;c.strokeStyle='#ffd23f';c.setLineDash([4,4]);c.strokeRect(20*k,-p.beamW/2,p.beamLen,p.beamW)}c.restore()},
  hit(p,st,sx,sy,rr){if(st.ph!=='fire'||st.bk<.3)return false;const[lx,ly]=local(p,st,sx,sy);return lx>0&&lx<20*p.size+p.beamLen&&Math.abs(ly)<p.beamW*st.bk/2+(rr??3)+(p.hitPad||0)}}
};
g.Parts={types:T,target:null,pos,motion,
 path(p,tg,T){const o=[],n=Math.max(2,Math.min(400,Math.round(T/.05)));if(p.mv==='home'){const r=homeInit(p),d=1/60;let k=0;for(let t=0;t<T;t+=d){homeStep(r,p,tg,d);if(k++%3===0)o.push([r.x,r.y])}return o}
  for(let i=0;i<=n;i++){const q=pos(p,T*i/n);o.push(q)}return o},
 list(pat){const o=[];for(const b of pat.bullets||[])o.push([b,T.bullet]);for(const p of pat.parts||[]){const t=T[p.type];if(t)o.push([p,t])}
  const L=pat.layers||[];if(L.length<2)return o;const ix=q=>{const i=L.findIndex(l=>l.id===q.layer);return i<0?0:i};return o.map((e,i)=>[e,i]).sort((a,b)=>ix(a[0][0])-ix(b[0][0])||a[1]-b[1]).map(e=>e[0])},
 norm(p){const t=T[p.type];if(!t)return p;const o={id:p.id,type:p.type,t:+p.t||0,x:+p.x||0,y:+p.y||0};o.costume=p.costume||'';o.layer=p.layer||'';o.group=p.group||'';for(const k in t.defaults)o[k]=typeof t.defaults[k]==='number'?(Number.isFinite(+p[k])?+p[k]:t.defaults[k]):(p[k]||t.defaults[k]);return o}};
})(window);
