/* FIGHTタイミングゲージ(独立モジュール)。入力: 設定オブジェクト。出力: 判定結果 {name,key,mult,miss,d,color}。
   効果音: emit(イベント名) を呼ぶだけ(start/confirm/perfect/great/good/miss)。再生は呼び出し側(将来のAudio Engine)が担当 */
(function(g){
const n=(v,d,lo,hi)=>{v=+v;return Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d},col=(v,d)=>/^#[0-9a-f]{6}$/i.test(v)?v:d;
const DJ=()=>[{name:'PERFECT',range:.1,mult:2,color:'#ffd23f'},{name:'GREAT',range:.3,mult:1.5,color:'#7cfc00'},{name:'GOOD',range:.6,mult:1,color:'#4fc3f7'}];
const D=()=>({enabled:1,w:420,h:70,x:240,y:174,color:'#2a2a2a',bg:'#000000',border:'#ffffff',borderW:3,cursorColor:'#ffffff',cursorW:6,speed:400,dir:'lr',timeout:4,introTime:.25,inputLock:.15,hold:.7,
 judges:DJ(),miss:{name:'MISS',mode:'zero',min:1,color:'#ff5555'},sounds:{start:'',confirm:'',perfect:'',great:'',good:'',miss:''}});
const ease=t=>1-(1-t)*(1-t);
class Gauge{
 static defaults(){return D()}
 static norm(c){const d=D();c=c&&typeof c==='object'?c:{};const o={enabled:c.enabled===undefined?1:(c.enabled?1:0),w:n(c.w,d.w,40,470),h:n(c.h,d.h,10,200),x:n(c.x,d.x,0,2000),y:n(c.y,d.y,0,2000),
  color:col(c.color,d.color),bg:col(c.bg,d.bg),border:col(c.border,d.border),borderW:n(c.borderW,d.borderW,0,20),cursorColor:col(c.cursorColor,d.cursorColor),cursorW:n(c.cursorW,d.cursorW,1,60),
  speed:n(c.speed,d.speed,30,3000),dir:['lr','rl','pingpong'].includes(c.dir)?c.dir:'lr',timeout:n(c.timeout,d.timeout,.5,30),introTime:n(c.introTime,d.introTime,0,2),inputLock:n(c.inputLock,d.inputLock,0,1),hold:n(c.hold,d.hold,0,3)};
  const js=Array.isArray(c.judges)&&c.judges.length?c.judges:d.judges,dj=d.judges;
  o.judges=js.slice(0,8).map((j,i)=>({name:String(j&&j.name||'判定'+(i+1)),range:n(j&&j.range,dj[i]?dj[i].range:.5,.005,1),mult:n(j&&j.mult,dj[i]?dj[i].mult:1,0,20),color:col(j&&j.color,'#ffffff')}));
  const m=c.miss||{};o.miss={name:String(m.name||'MISS'),mode:m.mode==='min'?'min':'zero',min:n(m.min,1,0,9999),color:col(m.color,d.miss.color)};
  o.sounds=Object.assign(d.sounds,c.sounds&&typeof c.sounds==='object'?c.sounds:{});return o}
 constructor(cfg,emit){this.c=Gauge.norm(cfg);this.emit=emit||(()=>{});this.ph='idle';this.t=0;this.u=0;this.res=null}
 get active(){return this.ph==='in'||this.ph==='run'||this.ph==='hit'}
 start(cb){const c=this.c;this.cb=cb;this.ph='in';this.t=0;this.res=null;this.u=c.dir==='rl'?1:0;this.v=c.dir==='rl'?-1:1;this.emit('start')}
 update(dt){const c=this.c;this.t+=dt;
  if(this.ph==='in'){if(this.t>=c.introTime){this.ph='run';this.t=0}}
  else if(this.ph==='run'){this.u+=this.v*c.speed/c.w*dt;
   if(c.dir==='pingpong'){if(this.u>1){this.u=2-this.u;this.v=-1}if(this.u<0){this.u=-this.u;this.v=1}}
   else if(this.u>=1||this.u<=0){this.u=Math.min(1,Math.max(0,this.u));this.confirm(true)}
   if(this.ph==='run'&&this.t>=c.timeout)this.confirm(true)}
  else if(this.ph==='hit'&&this.t>=c.hold){this.ph='done';const cb=this.cb;this.cb=null;cb&&cb(this.res)}}
 press(){if(this.ph!=='run'||this.t<this.c.inputLock)return false;this.confirm(false);return true} // 入力無効時間・確定後・演出中は無視
 judge(d,auto){const js=this.c.judges.map((j,i)=>({...j,i})).sort((a,b)=>a.range-b.range);
  if(!auto)for(const j of js)if(d<=j.range)return{name:j.name,key:['perfect','great','good'][j.i]||'judge'+j.i,mult:j.mult,color:j.color,miss:0,d};
  return{name:this.c.miss.name,key:'miss',mult:0,color:this.c.miss.color,miss:1,d}}
 confirm(auto){this.ph='hit';this.t=0;this.res=this.judge(Math.abs(this.u-.5)/.5,auto);this.emit('confirm');this.onConfirm&&this.onConfirm(this.res);this.emit(this.res.key)}
 draw(c){const k=this.c,p=this.ph==='in'?ease(Math.min(1,this.t/Math.max(.001,k.introTime))):1,h=k.h*p,w=k.w,x=k.x-w/2,y=k.y-h/2;if(this.ph==='idle'||this.ph==='done')return;
  c.save();c.globalAlpha=p;c.fillStyle=k.bg;c.fillRect(x,y,w,h);c.fillStyle=k.color;c.fillRect(x,y,w,h);
  [...k.judges].sort((a,b)=>b.range-a.range).forEach(j=>{c.globalAlpha=.4*p;c.fillStyle=j.color;c.fillRect(k.x-w*j.range/2,y,w*j.range,h)});
  c.globalAlpha=p;c.fillStyle='#fff';c.fillRect(k.x-1,y,2,h);if(k.borderW>0){c.strokeStyle=k.border;c.lineWidth=k.borderW;c.strokeRect(x,y,w,h)}
  if(p>=1){const cx=x+this.u*w,blink=this.ph==='hit'&&Math.floor(this.t/.08)%2;c.fillStyle=blink?'#ffd23f':k.cursorColor;c.fillRect(cx-k.cursorW/2,y-4,k.cursorW,h+8)}
  c.restore();c.textAlign='left'}
}
g.Gauge=Gauge;})(window);
