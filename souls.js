/* SOULシステム: 種類ごとに init/update/post/block/draw を持つ登録簿。新SOULは Souls.types[名前]={label,defaults,init,update,...} を足すだけ */
(function(g){
const rad=d=>d*Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const COMMON={color:'#ff0000',size:5.5,hit:3,speed:90,inv:1,margin:6,costume:''};
const LABELS={color:'色',size:'見た目の大きさ',hit:'当たり判定の半径',speed:'移動速度',inv:'無敵時間(秒)',margin:'移動範囲の余白(枠から)',costume:'画像(コスチューム)',gravity:'重力',jump:'ジャンプ力',maxFall:'落下速度の上限',airCtl:'空中の左右操作(0〜1)',jumpCut:'ジャンプ中断(1/0)',
 shieldR:'盾の半径',arc:'防御範囲(度)',rotSpeed:'盾の回転速度(度/秒)',startAngle:'盾の初期角度(度)',shootDir:'射撃方向(度)',bulletSpeed:'弾の速度',power:'威力(敵へのダメージ)',cooldown:'連射間隔(秒)',bulletSize:'弾の大きさ',bulletColor:'弾の色',maxShots:'最大射撃回数(0=無制限)',shootTime:'射撃できる時間(秒,0=無制限)',destroy:'敵弾を破壊(1/0)'};
const move=(S,c,dx,dy)=>{const b=c.box,m=S.cfg.margin;S.x=clamp(S.x+dx,b.x+m,b.x+b.w-m);S.y=clamp(S.y+dy,b.y+m,b.y+b.h-m)};
const walk=(S,dt,k,c)=>{const v=S.cfg.speed*dt;move(S,c,(k.right?v:0)-(k.left?v:0),(k.down?v:0)-(k.up?v:0))};
const heart=(c,x,y,s,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.7,y-s*.1,x-s*.8,y-s*1.2,x,y-s*.4);c.bezierCurveTo(x+s*.8,y-s*1.2,x+s*1.7,y-s*.1,x,y+s*.9);c.fill()};
const T={
 red:{label:'赤SOUL(通常移動)',defaults:{},update:walk},
 blue:{label:'青SOUL(重力・ジャンプ)',defaults:{color:'#2a6cff',gravity:420,jump:190,maxFall:260,airCtl:1,jumpCut:1,speed:80},
  update(S,dt,k,c){const f=S.cfg,b=c.box,m=f.margin,air=S.grounded?1:f.airCtl;
   S.x=clamp(S.x+((k.right?1:0)-(k.left?1:0))*f.speed*air*dt,b.x+m,b.x+b.w-m);
   if(S.grounded&&k.up){S.vy=-f.jump;S.grounded=false}if(f.jumpCut&&!k.up&&S.vy<-70)S.vy=-70;
   const py=S.y;S.vy=Math.min(f.maxFall,S.vy+f.gravity*dt);S.y+=S.vy*dt;S.grounded=false;const fl=b.y+b.h-m;
   if(S.y>=fl){S.y=fl;S.vy=0;S.grounded=true}if(S.y<b.y+m){S.y=b.y+m;if(S.vy<0)S.vy=0}
   if(S.vy>=0)for(const p of c.pat.platforms||[])if(S.x>=p.x-2&&S.x<=p.x+p.w+2&&py+5<=p.y&&S.y+5>=p.y){S.y=p.y-5;S.vy=0;S.grounded=true}}},
 green:{label:'緑SOUL(盾・防御)',defaults:{color:'#00c000',shieldR:22,arc:100,rotSpeed:1440,startAngle:-90},
  init(S,c){S.x=c.box.x+c.box.w/2;S.y=c.box.y+c.box.h/2;S.ang=S.tg=S.cfg.startAngle},
  update(S,dt,k){const f=S.cfg;if(k.up)S.tg=-90;else if(k.right)S.tg=0;else if(k.down)S.tg=90;else if(k.left)S.tg=180;
   let d=((S.tg-S.ang+540)%360)-180;const st=f.rotSpeed*dt;S.ang+=Math.abs(d)<=st?d:Math.sign(d)*st;S.ang=((S.ang+540)%360)-180},
  block(S,q,TT,s){if(q.block===0)return false;const f=S.cfg;for(let i=0;i<=6;i++){const a=rad(S.ang-f.arc/2+f.arc*i/6);if(TT.hit(q,s,S.x+Math.cos(a)*f.shieldR,S.y+Math.sin(a)*f.shieldR,2))return true}return false},
  draw(c,S){const f=S.cfg;c.strokeStyle=f.color;c.lineWidth=3;c.beginPath();c.arc(S.x,S.y,f.shieldR,rad(S.ang-f.arc/2),rad(S.ang+f.arc/2));c.stroke()}},
 yellow:{label:'黄SOUL(射撃)',defaults:{color:'#ffe600',shootDir:-90,bulletSpeed:260,power:0,cooldown:.25,bulletSize:3,bulletColor:'#ffe600',maxShots:0,shootTime:0,destroy:1},update:walk,
  post(S,dt,c){const f=S.cfg;S.cool-=dt;S.life+=dt;
   if(c.keys.z&&S.cool<=0&&(!f.maxShots||S.shots<f.maxShots)&&(!f.shootTime||S.life<=f.shootTime)){S.cool=f.cooldown;S.shots++;const a=rad(f.shootDir);S.pb.push({x:S.x,y:S.y,vx:Math.cos(a)*f.bulletSpeed,vy:Math.sin(a)*f.bulletSpeed,r:f.bulletSize,color:f.bulletColor});if(c.onSound)c.onSound('shoot','')}
   S.pb=S.pb.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<-20||p.x>500||p.y<-20||p.y>300)return false;
    if(f.power>0&&p.y<84&&c.enemyHit){c.enemyHit(f.power,p.x);return false}
    if(f.destroy)for(const[q,TT]of Parts.list(c.pat)){if(c.killed.has(q)||q.shoot===0||q.type==='blaster')continue;const s=TT.state(q,c.t);if(s&&TT.hit(q,s,p.x,p.y,p.r)){c.killed.add(q);return false}}return true})}}
};
const hurts=(S,q)=>!q.only||String(q.only).split(',').map(s=>s.trim()).includes(S.type);
const n=(v,d)=>Number.isFinite(+v)&&v!==''&&v!==null?+v:d;
g.Souls={types:T,COMMON,LABELS,
 defaultsOf(type){return Object.assign({},COMMON,(T[type]||T.red).defaults)},
 norm(s,i){s=s||{};const type=T[s.type]?s.type:'red',d=Souls.defaultsOf(type),o={id:String(s.id||'soul'+i),name:String(s.name||T[type].label),type};
  for(const k in d)o[k]=typeof d[k]==='number'?n(s[k],d[k]):(s[k]===undefined||s[k]===null?d[k]:String(s[k]));return o},
 defaultList(){return[['s_red','赤SOUL','red'],['s_blue','青SOUL','blue'],['s_green','緑SOUL','green'],['s_yellow','黄SOUL','yellow']].map(([id,name,type])=>Souls.norm({id,name,type}))},
 make(cfg,x,y,carry){const type=T[cfg.type]?cfg.type:'red',S={cfg:Object.assign(Souls.defaultsOf(type),cfg),type,x,y,vx:0,vy:0,iv:carry?carry.iv||0:0,pb:carry&&carry.pb?carry.pb:[],cool:0,shots:0,life:0,grounded:false};
  if(T[type].init)T[type].init(S,{box:{x:x-1,y:y-1,w:2,h:2}});return S},
 /* 1フレーム処理。受けたダメージ量を返す。ctx={box,pat,t,keys,killed,onSound,enemyHit} */
 tick(S,dt,c){const Ty=T[S.type];Ty.update(S,dt,c.keys,c);S.iv=Math.max(0,S.iv-dt);if(Ty.post)Ty.post(S,dt,c);let dmg=0;
  for(const[q,TT]of Parts.list(c.pat)){if(c.killed.has(q))continue;const s=TT.state(q,c.t);if(!s)continue;
   if(Ty.block&&Ty.block(S,q,TT,s,c)){if(!q.type||q.type==='bullet'){c.killed.add(q);if(c.onSound)c.onSound('block','')}continue}
   if(!S.iv&&!dmg&&hurts(S,q)&&TT.hit(q,s,S.x,S.y,S.cfg.hit)){dmg=q.dmg;S.iv=S.cfg.inv}}return dmg},
 draw(c,S){const f=S.cfg,im=Assets.get(f.costume);if(im){c.save();c.translate(S.x,S.y);Assets.draw(c,im,f.size*2.4,f.size*2.4);c.restore()}else heart(c,S.x,S.y,f.size,f.color);const Ty=T[S.type];if(Ty.draw)Ty.draw(c,S)},
 drawPb(c,S){for(const p of S.pb){c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill()}}};
})(window);
