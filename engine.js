/* Battle Engine + Soul + Bullet。UNDERTALE風の進行: 文字送り/ボックス拡縮/敵のセリフ/アイテム消費/EXP・G */
(function(g){
const bpos=(b,t)=>[b.x+b.vx*(t-b.t),b.y+b.vy*(t-b.t)],MB={x:24,y:132,w:432,h:84};
const heart=(c,x,y,s,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.7,y-s*.1,x-s*.8,y-s*1.2,x,y-s*.4);c.bezierCurveTo(x+s*.8,y-s*1.2,x+s*1.7,y-s*.1,x,y+s*.9);c.fill()};
class Battle{
 constructor(cv,proj){Assets.P=proj;this.cv=cv;this.c=cv.getContext('2d');this.p=proj;this.keys={};this.reset();this.last=0;
  const loop=ts=>{const dt=Math.min(.05,(ts-this.last)/1000||0);this.last=ts;this.update(dt);this.draw();this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop);
  addEventListener('keydown',e=>{const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'z',Z:'z',Enter:'z',x:'x',X:'x'}[e.key];if(m&&!this.dead){this.keys[m]=1;if(!e.repeat)this.press(m);if(e.key.startsWith('Arrow'))e.preventDefault()}});
  addEventListener('keyup',e=>{const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'z',Z:'z',Enter:'z'}[e.key];if(m)delete this.keys[m]});
  let d=null;cv.addEventListener('pointerdown',e=>{if(this.state==='gauge')this.gauge.press();d=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId)});
  cv.addEventListener('pointermove',e=>{if(!d||this.state!=='attack')return;const k=cv.width/cv.getBoundingClientRect().width;this.move((e.clientX-d[0])*k,(e.clientY-d[1])*k);d=[e.clientX,e.clientY]});
  cv.addEventListener('pointerup',()=>d=null);}
 destroy(){this.dead=1;cancelAnimationFrame(this.raf)}
 reset(){const P=this.p;this.hp=P.player.hp;this.en=P.enemies.map(e=>({...e,cur:e.hp,mercy:0,gone:0,turns:0,fade:0,shk:0}));this.items=(P.items||[]).map(i=>({...i}));
  this.state='menu';this.stage='top';this.cur=0;this.list=[];this.cols=1;this.top=0;this.t=0;this.iv=0;this.turn=0;this.after=null;this.fx=[];this.gauge=null;this.go=0;this.killed=new WeakSet();this.evs=[];this.ei=0;this.bx={...MB};
  this.soul={x:P.box.x+P.box.w/2,y:P.box.y+P.box.h/2};const e=this.en[0],f=e&&e.flavor&&e.flavor[0];this.msg=f||'* '+(e?e.name:'敵')+'が現れた!';this.ti=0}
 alive(){return this.en.filter(e=>!e.gone)}
 done(){return this.ti>=this.msg.length}
 say(m,next){this.msg=m;this.ti=0;this.state='dialog';this.after=next||null}
 wait(s,f){this.state='wait';this.wt=s;this.wf=f}
 menuText(){const a=this.alive(),e=a[this.turn%a.length],f=e&&e.flavor&&e.flavor.length?e.flavor[this.turn%e.flavor.length]:'* '+(e?e.name:'敵')+'が様子をうかがっている。';this.msg=f;this.ti=0}
 avail(){return this.items.filter(i=>typeof i.count!=='number'||i.count>0)}
 press(k){const s=this.state;
  if(s==='gauge'){if(k==='z'&&this.gauge)this.gauge.press();return}
  if(s==='gameover'){if(k==='z'&&this.go>1.8)this.reset();return}
  if(s==='talk'){if(k==='z'&&this.done())this.startAttack();if(k==='x')this.ti=this.msg.length;return}
  if(k==='x'&&(s==='dialog'||s==='menu'&&this.stage==='top')&&!this.done()){this.ti=this.msg.length;return}
  if(s==='dialog'){if(k==='z'&&this.done()){const a=this.after;this.after=null;a?a():this.endPlayerTurn()}return}
  if(s!=='menu')return;
  if(this.stage==='top'){if(k==='left')this.cur=(this.cur+3)%4;if(k==='right')this.cur=(this.cur+1)%4;
   if(k==='z'){this.top=this.cur;if(this.cur<2)this.open('target',this.alive().map(e=>e.name),1);else if(this.cur===2){if(this.avail().length)this.open('item',this.avail().map(i=>i.name),2)}else this.open('mercy',['見逃す','逃げる'],1)}return}
  const n=this.list.length||1,c=this.cols,r=this.cur;
  if(k==='up'&&r-c>=0)this.cur=r-c;if(k==='down'&&r+c<n)this.cur=r+c;if(c===2){if(k==='left'&&r%2)this.cur=r-1;if(k==='right'&&r%2===0&&r+1<n)this.cur=r+1}
  if(k==='x'){this.stage=this.stage==='act'?'target':'top';this.cur=this.stage==='top'?this.top:0;this.cols=1;this.list=this.stage==='target'?this.alive().map(e=>e.name):[];return}
  if(k!=='z')return;const st=this.stage,i=this.cur;
  if(st==='target'){const e=this.alive()[i];this.tgt=e;if(this.top===0)this.fight(e);else this.open('act',e.acts.map(a=>a.name),2)}
  else if(st==='act'){const a=this.tgt.acts[i];if(a.mercy)this.tgt.mercy=1;this.say(a.text||'* ...')}
  else if(st==='item'){const it=this.avail()[i];if(!it)return;const mx=this.p.player.hp,full=this.hp+it.heal>=mx;this.hp=Math.min(mx,this.hp+it.heal);if(typeof it.count==='number')it.count--;
   this.say('* '+it.name+'を使った。\n* '+(full?'HPが全回復した!':'HPが'+it.heal+'回復した!'))}
  else if(st==='mercy'){if(i===1){this.state='end';this.msg='* 逃げ出した…';this.ti=0;return}
   const sp=this.alive().filter(e=>e.mercy);sp.forEach(e=>e.gone=1);this.stage='top';this.list=[];this.wait(sp.length?.7:.2,()=>this.endPlayerTurn())}}
 open(s,l,c){this.stage=s;this.list=l;this.cols=c||1;this.cur=0}
 fight(e){const d=Math.max(1,this.p.player.atk-e.def+Math.floor(Math.random()*3)),G=this.p.gauge;
  if(G&&G.enabled){const g=this.gauge=new Gauge(G,n=>this.onSound&&this.onSound(n,G.sounds&&G.sounds[n]||''));this.state='gauge';
   g.onConfirm=r=>{if(!r.miss)this.fx.push({k:'slash',x:this.ex(e),t:0,life:.35})};g.start(r=>this.hitResult(e,d,r));return}
  this.dmg(e,d)}
 hitResult(e,base,r){const G=this.p.gauge;let d=r.miss?(G.miss.mode==='min'?Math.round(G.miss.min):0):Math.max(1,Math.round(base*r.mult));
  if(d<=0){this.fx.push({k:'txt',x:this.ex(e),text:'MISS',color:'#aaa',t:0,life:.9});this.wait(1,()=>this.endPlayerTurn())}else this.dmg(e,d)}
 dmg(e,d,label){const x=this.ex(e),from=e.cur;e.cur-=d;e.shk=1;this.fx.push({k:'txt',x,text:String(d),color:'#f44',t:0,life:1.2},{k:'hp',x,from,to:Math.max(0,e.cur),max:e.hp,t:0,life:1.4});
  if(this.onSound)this.onSound('hit','');if(e.cur<=0)e.gone=1;this.wait(1.2,()=>this.endPlayerTurn())}
 ex(e){return this.cv.width/(this.en.length+1)*(this.en.indexOf(e)+1)}
 endPlayerTurn(){this.stage='top';this.list=[];const al=this.alive();
  if(!al.length){const ex=this.en.reduce((a,e)=>a+(e.exp||0),0),gd=this.en.reduce((a,e)=>a+(e.gold||0),0);this.state='end';this.msg='* あなたの勝ち!\n* '+ex+' EXP と '+gd+' G を獲得した。';this.ti=0;return}
  this.spk=al[this.turn%al.length];this.turn++;this.soul={x:this.p.box.x+this.p.box.w/2,y:this.p.box.y+this.p.box.h/2};this.tt=0;const tk=this.spk.talks||[];
  if(tk.length){this.state='talk';this.msg=tk[this.spk.turns%tk.length];this.ti=0}else this.startAttack()}
 startAttack(){const e=this.spk,ids=e.patterns.length?e.patterns:[this.p.patterns[0].id];this.pat=this.p.patterns.find(p=>p.id===ids[e.turns++%ids.length])||this.p.patterns[0];this.t=0;this.state='attack';this.killed=new WeakSet();this.evs=[...(this.pat.events||[])].sort((a,b)=>a.t-b.t);this.ei=0;this.soul=Souls.make(this.soulCfg(this.pat.soul),this.soul.x,this.soul.y)}
 soulCfg(id){const L=this.p.souls||[];return L.find(s=>s.id===id)||L[0]||{type:'red'}}
 switchSoul(e){const cfg=this.soulCfg(e.soul),S=this.soul,b=this.p.box,ns=Souls.make(cfg,e.keep?S.x:(Number.isFinite(e.x)?e.x:b.x+b.w/2),e.keep?S.y:(Number.isFinite(e.y)?e.y:b.y+b.h/2),S);this.soul=ns;this.fx.push({k:'ring',x:ns.x,y:ns.y,color:ns.cfg.color,t:0,life:.4});if(this.onSound)this.onSound('soul',e.sound||'')}
 enemyHit(p){const e=this.spk;if(e&&e.cur>1){e.cur=Math.max(1,e.cur-p);e.shk=.5}}
 move(dx,dy){const ty=this.soul.type;if(ty&&ty!=='red'&&ty!=='yellow')return;const b=this.p.box;this.soul.x=Math.max(b.x+6,Math.min(b.x+b.w-6,this.soul.x+dx));this.soul.y=Math.max(b.y+6,Math.min(b.y+b.h-6,this.soul.y+dy))}
 update(dt){const st=this.state;for(const e of this.en){if(e.shk>0)e.shk=Math.max(0,e.shk-dt*1.5);if(e.gone)e.fade+=dt}
  this.fx=this.fx.filter(f=>(f.t+=dt)<f.life);const tg=st==='attack'||st==='talk'?this.p.box:MB,k=1-Math.exp(-dt*18);for(const q of['x','y','w','h'])this.bx[q]+=(tg[q]-this.bx[q])*k;
  if((st==='menu'||st==='dialog'||st==='talk'||st==='end')&&this.ti<this.msg.length){const o=Math.floor(this.ti);this.ti=Math.min(this.msg.length,this.ti+40*dt);if(Math.floor(this.ti)>o&&this.onSound)this.onSound('text','')}
  if(st==='talk'&&this.done()){this.tt+=dt;if(this.tt>1.2)this.startAttack()}
  if(st==='wait'){this.wt-=dt;if(this.wt<=0){const f=this.wf;this.wf=null;f&&f()}}
  if(st==='gameover')this.go+=dt;if(st==='gauge'&&this.gauge)this.gauge.update(dt);if(st!=='attack')return;
  this.t+=dt;while(this.ei<this.evs.length&&this.evs[this.ei].t<=this.t)this.switchSoul(this.evs[this.ei++]);
  Parts.target={x:this.soul.x,y:this.soul.y};const dm=Souls.tick(this.soul,dt,{box:this.p.box,pat:this.pat,t:this.t,keys:this.keys,killed:this.killed,onSound:this.onSound,enemyHit:p=>this.enemyHit(p)});this.iv=this.soul.iv;if(dm){this.hp-=dm;if(this.onSound)this.onSound('hurt','')}
  if(this.hp<=0){this.hp=0;this.state='gameover';this.go=0;return}
  if(this.t>=this.pat.dur){this.state='menu';this.stage='top';this.cur=0;this.menuText()}}
 lines(t,w){const c=this.c,o=[];for(const seg of t.split('\n')){let l='';for(const ch of seg){if(c.measureText(l+ch).width>w){o.push(l);l=''}l+=ch}o.push(l)}return o}
 drawFx(c){for(const f of this.fx){const p=f.t/f.life;c.textAlign='center';
  if(f.k==='slash'){c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();const L=50*Math.min(1,p*3);c.moveTo(f.x-L/2,28);c.lineTo(f.x+L/2,28+L*1.1);c.moveTo(f.x+L/2,28);c.lineTo(f.x-L/2,28+L*1.1);c.stroke()}
  else if(f.k==='ring'){c.globalAlpha=1-p;c.strokeStyle=f.color;c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,6+p*24,0,7);c.stroke();c.globalAlpha=1}
  else if(f.k==='hp'){const r=(f.from+(f.to-f.from)*Math.min(1,p*3))/f.max;c.globalAlpha=p>.8?(1-p)*5:1;c.fillStyle='#888';c.fillRect(f.x-35,62,70,9);c.fillStyle='#0f0';c.fillRect(f.x-35,62,70*Math.max(0,r),9);c.globalAlpha=1}
  else{c.globalAlpha=p>.6?1-(p-.6)*2.5:1;c.fillStyle=f.color;c.font='bold 18px monospace';c.fillText(f.text,f.x,50-Math.sin(Math.min(1,p*2)*Math.PI)*10);c.globalAlpha=1}}c.textAlign='left'}
 drawGO(c,W,H){const g=this.go,x=this.soul.x,y=this.soul.y;c.textAlign='center';
  if(g<.8)heart(c,x,y,6,this.soul.cfg?this.soul.cfg.color:'#f00');else if(g<1.6){const d=(g-.8)*70;c.fillStyle='#f00';for(let i=0;i<6;i++)c.fillRect(x+Math.cos(i*1.05)*d,y+Math.sin(i*1.05)*d+d*d/40,4,4)}
  else{c.globalAlpha=Math.min(1,(g-1.6)*2);c.fillStyle='#fff';c.font='bold 36px monospace';c.fillText('GAME OVER',W/2,H/2);if(g>2.2){c.font='13px monospace';c.fillText('決定キー / タップで やり直し',W/2,H/2+34)}c.globalAlpha=1}c.textAlign='left'}
 draw(){const c=this.c,P=this.p,W=this.cv.width,H=this.cv.height,st=this.state;c.fillStyle='#000';c.fillRect(0,0,W,H);if(st==='gameover'){this.drawGO(c,W,H);return}
  const n=this.en.length;this.en.forEach((e,i)=>{if(e.gone&&e.fade>.6)return;const x=W/(n+1)*(i+1)+Math.sin(e.shk*60)*e.shk*10;c.globalAlpha=e.gone?1-e.fade/.6:1;
   const im=Assets.get(e.costume);if(im){c.save();c.translate(x,49);Assets.draw(c,im,im.w*60/im.h,60);c.restore()}else{c.fillStyle=e.color;c.fillRect(x-20,24,40,50);c.fillStyle='#000';c.fillRect(x-11,38,6,6);c.fillRect(x+5,38,6,6)}c.globalAlpha=1});
  const b=this.bx;if(st!=='gauge'){c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(b.x,b.y,b.w,b.h)}c.textAlign='left';c.font='14px monospace';c.fillStyle='#fff';
  if(st==='attack'){for(const p of this.pat.platforms||[]){c.fillStyle='#0c0';c.fillRect(p.x,p.y,p.w,3)}for(const[q,T]of Parts.list(this.pat)){if(this.killed.has(q))continue;const s=T.state(q,this.t);if(s)T.draw(c,q,s,false)}Souls.drawPb(c,this.soul);if(!this.iv||Math.floor(this.t*10)%2)Souls.draw(c,this.soul)}
  else if(st==='talk'){heart(c,this.soul.x,this.soul.y,5.5,'#f00');this.drawBubble(c,W)}
  else if(st==='gauge'){if(this.gauge)this.gauge.draw(c)}
  else if(st==='menu'&&this.stage!=='top'){const cols=this.cols;this.list.forEach((s,i)=>{const row=cols===2?i>>1:i,x=b.x+34+(i%cols)*(b.w/2-6),y=b.y+26+row*20;
    c.fillStyle=this.stage==='mercy'&&i===0&&this.alive().some(e=>e.mercy)?'#ff0':'#fff';c.fillText('* '+s,x,y);if(i===this.cur)heart(c,x-16,y-5,5,'#f00');
    if(this.stage==='target'&&this.top===0){const e=this.alive()[i];c.fillStyle='#f00';c.fillRect(b.x+250,y-9,90,10);c.fillStyle='#0f0';c.fillRect(b.x+250,y-9,90*Math.max(0,e.cur)/e.hp,10)}})}
  else if(st==='menu'||st==='dialog'||st==='end'){c.fillStyle='#fff';this.lines(this.msg.slice(0,Math.floor(this.ti)),b.w-28).forEach((l,i)=>c.fillText(l,b.x+14,b.y+24+i*18))}
  this.drawFx(c);c.font='bold 13px monospace';c.fillStyle='#fff';c.fillText((P.player.name||'PLAYER')+'  LV '+(P.player.lv||1),14,H-30);c.fillText('HP',200,H-30);
  const mw=Math.min(150,P.player.hp*1.5);c.fillStyle='#f00';c.fillRect(224,H-40,mw,12);c.fillStyle='#ff0';c.fillRect(224,H-40,mw*Math.max(0,this.hp)/P.player.hp,12);c.fillStyle='#fff';c.fillText(this.hp+' / '+P.player.hp,224+mw+8,H-30);
  ['FIGHT','ACT','ITEM','MERCY'].forEach((s,i)=>{const x=14+i*118,sel=st==='menu'&&this.stage==='top'&&this.cur===i;c.strokeStyle=sel?'#ff0':'#f80';c.lineWidth=2;c.strokeRect(x,H-24,104,20);c.fillStyle=c.strokeStyle;c.textAlign='center';c.font='bold 12px monospace';c.fillText(s,x+58,H-9);c.textAlign='left';if(sel)heart(c,x+12,H-14,4.5,'#f00')})}
 drawBubble(c,W){const i=this.en.indexOf(this.spk),x=W/(this.en.length+1)*(i+1),bw=150,r=x+34+bw<W,bx=r?x+34:x-34-bw;c.font='12px monospace';const L=this.lines(this.msg.slice(0,Math.floor(this.ti)),bw-16),h=Math.max(1,L.length)*14+12;
  c.fillStyle='#fff';c.fillRect(bx,22,bw,h);c.beginPath();c.moveTo(r?bx:bx+bw,40);c.lineTo(r?bx-10:bx+bw+10,46);c.lineTo(r?bx:bx+bw,52);c.fill();c.fillStyle='#000';L.forEach((l,k)=>c.fillText(l,bx+8,38+k*14))}
}
Battle.bpos=bpos;g.Battle=Battle;})(window);
