/* Timeline Editor: 時間軸で攻撃パーツ(弾/骨/ブラスター)とSOUL切り替えを編集する。
   データ形式は配置式と共通(pattern.bullets / pattern.parts / pattern.events)。選択状態も配置式エディタと共有する。 */
(function(g){
const LW=110,RH=24,W=960,COL={bullet:'#4fc3f7',bone:'#e8e8e8',blaster:'#ffb74d'},BG='#14101c',clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rd=v=>Math.round(v*1000)/1000;
g.Timeline=function(o){
 const rc=o.rows,uc=o.ruler,sc=o.stage,r=rc.getContext('2d'),u=uc.getContext('2d'),s=sc.getContext('2d');
 let Z=80,off=0,tc=0,snap=.1,rows=[],drag=null,playing=0,raf=0;
 const pat=()=>o.getPat(),tx=t=>LW+(t-off)*Z,xt=x=>(x-LW)/Z+off,sn=t=>snap>0?Math.round(t/snap)*snap:t;
 const maxOff=()=>Math.max(0,pat().dur-(W-LW-30)/Z+.5);
 const typ=q=>q.type||'bullet';
 function span(q){if(typ(q)==='blaster')return{len:.3+q.wait+q.beamDur+.25,open:0};return q.life>0?{len:q.life,open:0}:{len:Math.max(.2,pat().dur-q.t),open:1}}
 const pos=(cv,e)=>{const b=cv.getBoundingClientRect();return[(e.clientX-b.left)*cv.width/b.width,(e.clientY-b.top)*cv.height/b.height]};
 const usable=q=>{const l=o.layer(q);return!(l.hide||l.lock)};
 function buildRows(){const cnt={};rows=Parts.list(pat()).map(([q,T])=>{const k=typ(q);cnt[k]=(cnt[k]||0)+1;return{q,label:({bullet:'弾',bone:'骨',blaster:'ブラスター'}[k]||T.label)+cnt[k]}})}
 function step(){const c=[.1,.25,.5,1,2,5,10];return c.find(v=>v*Z>=56)||10}
 function drawRuler(){u.fillStyle=BG;u.fillRect(0,0,W,44);u.fillStyle='#2a2140';u.fillRect(0,0,LW,44);u.fillStyle='#efe9ff';u.font='11px sans-serif';u.fillText('時間(秒)',6,15);u.fillText('SOUL切替',6,37);
  u.save();u.beginPath();u.rect(LW,0,W-LW,44);u.clip();const st=step();u.strokeStyle='#4a3d6b';u.fillStyle='#bdb2d8';
  for(let t=Math.ceil(off/st)*st;tx(t)<W;t=rd(t+st)){const x=Math.round(tx(t))+.5;u.beginPath();u.moveTo(x,10);u.lineTo(x,22);u.stroke();u.fillText(String(rd(t)),x+3,17)}
  u.strokeStyle='#4a3d6b';u.beginPath();u.moveTo(LW,22.5);u.lineTo(W,22.5);u.stroke();
  const pt=pat();(pt.events||[]).forEach(ev=>{const x=tx(ev.t);if(x<LW-8||x>W)return;u.fillStyle='#ffd23f';u.beginPath();u.moveTo(x,26);u.lineTo(x+7,33);u.lineTo(x,40);u.lineTo(x-7,33);u.fill();
   const sl=(o.getP().souls||[]).find(q=>q.id===ev.soul);u.fillStyle='#efe9ff';u.fillText((sl?sl.name:'?').slice(0,6),x+9,37)});
  const ex=tx(pt.dur);u.strokeStyle='#888';u.setLineDash([3,3]);u.beginPath();u.moveTo(ex,0);u.lineTo(ex,44);u.stroke();u.setLineDash([]);
  const px=tx(tc);u.strokeStyle='#ff4d4d';u.fillStyle='#ff4d4d';u.beginPath();u.moveTo(px,0);u.lineTo(px,44);u.stroke();u.beginPath();u.moveTo(px-5,0);u.lineTo(px+5,0);u.lineTo(px,7);u.fill();u.restore()}
 function drawRows(){rc.height=Math.max(60,rows.length*RH+6);r.fillStyle=BG;r.fillRect(0,0,W,rc.height);const st=step(),pt=pat();
  r.save();r.beginPath();r.rect(LW,0,W-LW,rc.height);r.clip();r.strokeStyle='#2a2140';for(let t=Math.ceil(off/st)*st;tx(t)<W;t=rd(t+st)){const x=Math.round(tx(t))+.5;r.beginPath();r.moveTo(x,0);r.lineTo(x,rc.height);r.stroke()}
  rows.forEach(({q},i)=>{const y=i*RH,l=o.layer(q),sp=span(q),x0=tx(q.t),x1=tx(q.t+sp.len),on=o.sel.has(q);r.globalAlpha=(l.hide||l.lock)?.35:1;
   if(i%2){r.fillStyle='rgba(255,255,255,.04)';r.fillRect(LW,y,W-LW,RH)}
   const c=COL[typ(q)]||'#aaa';r.fillStyle=c;if(sp.open){r.globalAlpha*=.55}r.fillRect(x0,y+4,Math.max(3,x1-x0),RH-8);r.globalAlpha=(l.hide||l.lock)?.35:1;
   if(typ(q)==='blaster'){const a=tx(q.t+.3+q.wait),b=tx(q.t+.3+q.wait+q.beamDur);r.fillStyle='#ff7043';r.fillRect(a,y+4,Math.max(2,b-a),RH-8)}
   if(q.mv&&q.mv!=='line'){r.fillStyle='#000';r.font='10px sans-serif';r.fillText({sine:'~',circle:'○',bezier:'⌒',home:'◎'}[q.mv]||'',x0+3,y+16)}
   if(on){r.strokeStyle=q===o.getSelB()?'#ffffff':'#ffd23f';r.lineWidth=2;r.strokeRect(x0-1,y+3,Math.max(5,x1-x0)+2,RH-6);r.lineWidth=1;r.fillStyle='#ffd23f';r.fillRect(x1-3,y+6,4,RH-12)}
   if(x1-x0>46){r.fillStyle='#000';r.font='10px monospace';r.fillText(rd(q.t)+'s',x0+(q.mv&&q.mv!=='line'?14:4),y+16)}r.globalAlpha=1});
  const ex=tx(pt.dur);r.strokeStyle='#888';r.setLineDash([3,3]);r.beginPath();r.moveTo(ex,0);r.lineTo(ex,rc.height);r.stroke();r.setLineDash([]);
  const px=tx(tc);r.strokeStyle='#ff4d4d';r.beginPath();r.moveTo(px,0);r.lineTo(px,rc.height);r.stroke();r.restore();
  rows.forEach(({q,label},i)=>{const y=i*RH,l=o.layer(q);r.fillStyle=o.sel.has(q)?'#3a2d5c':'#2a2140';r.fillRect(0,y,LW,RH);r.fillStyle='#4a3d6b';r.fillRect(0,y+RH-1,LW,1);r.fillStyle=COL[typ(q)]||'#aaa';r.fillRect(0,y,4,RH-1);
   r.fillStyle='#efe9ff';r.font='12px sans-serif';r.fillText(label+(q.group?' ⛓':'')+(l.lock?' 🔒':'')+(l.hide?' ×':''),9,y+16)});
  if(!rows.length){r.fillStyle='#bdb2d8';r.font='12px sans-serif';r.fillText('パーツがありません。「再生位置に追加」で追加できます。',LW+10,22)}}
 function drawStage(){const P=o.getP(),pt=pat(),b=P.box;Assets.P=P;Parts.target={x:b.x+b.w/2,y:b.y+b.h/2};s.fillStyle='#000';s.fillRect(0,0,480,270);(pt.platforms||[]).forEach(p=>{s.fillStyle='#0c0';s.fillRect(p.x,p.y,p.w,3)});s.strokeStyle='#fff';s.lineWidth=3;s.strokeRect(b.x,b.y,b.w,b.h);
  for(const[q,T]of Parts.list(pt)){if(o.layer(q).hide)continue;const st=T.state(q,tc);if(!st)continue;T.draw(s,q,st,false);if(o.sel.has(q)){s.strokeStyle='#ffd23f';s.lineWidth=1;s.beginPath();s.arc(st.x,st.y,12,0,7);s.stroke()}}
  s.fillStyle='#fff';s.font='11px monospace';s.fillText(tc.toFixed(2)+'s',6,14);if(o.timeEl)o.timeEl.textContent=tc.toFixed(2)+' / '+pt.dur+' 秒'}
 function draw(){if(!o.visible())return;off=clamp(off,0,maxOff());drawRuler();drawRows();drawStage();if(o.scrollEl){o.scrollEl.max=Math.round(maxOff()*100);o.scrollEl.value=Math.round(off*100)}}
 function refresh(){if(!o.visible())return;tc=clamp(tc,0,pat().dur);buildRows();draw()}
 // ---- 行の操作 ----
 rc.onpointerdown=e=>{stopPlay();const[x,y]=pos(rc,e),row=rows[Math.floor(y/RH)],add=e.shiftKey||e.ctrlKey||e.metaKey||o.multi();rc.setPointerCapture(e.pointerId);
  if(row&&usable(row.q)){const q=row.q,sp=span(q),x0=tx(q.t),x1=tx(q.t+sp.len);
   if(x<LW){o.pick(q,add,0);o.change();refresh();drag=null;return}
   if(x>=x0-5&&x<=x1+5){const rs=Math.abs(x-x1)<=11&&x1-x0>16&&!add;o.pick(q,add,0);
    drag=rs?{mode:'resize',q,x0:x,moved:0}:{mode:'move',x0:x,h:q,add,moved:0,o:[...o.sel].map(k=>[k,k.t])};o.change();refresh();return}}
  drag={mode:'pan',x0:x,off0:off,add,moved:0}};
 rc.onpointermove=e=>{if(!drag)return;const[x]=pos(rc,e),dx=x-drag.x0;if(Math.abs(dx)>3)drag.moved=1;if(!drag.moved)return;
  if(drag.mode==='pan'){off=drag.off0-dx/Z}
  else if(drag.mode==='move'){const a=drag.o.find(k=>k[0]===drag.h)||drag.o[0],nt=Math.max(0,rd(sn(a[1]+dx/Z))),d=nt-a[1];for(const[k,t0]of drag.o)k.t=Math.max(0,rd(t0+d))}
  else{const q=drag.q,e2=Math.max(q.t+.1,sn(xt(x)));if(typ(q)==='blaster')q.beamDur=Math.max(.1,rd(e2-q.t-.3-q.wait-.25));else q.life=e2>=pat().dur-.001?0:rd(e2-q.t)}
  o.change();draw()};
 rc.onpointerup=()=>{if(drag){if(!drag.moved&&drag.mode==='pan'&&!drag.add){o.clear();o.change()}
  else if(!drag.moved&&drag.mode==='move'&&!drag.add&&o.sel.size>1)o.pick(drag.h,0,1);if(drag.moved)o.change()}drag=null;refresh()};
 // ---- ルーラー: 再生位置の移動 / SOUL切り替えの移動 ----
 uc.onpointerdown=e=>{stopPlay();const[x,y]=pos(uc,e);uc.setPointerCapture(e.pointerId);
  if(y>=22){const ev=(pat().events||[]).find(v=>Math.abs(tx(v.t)-x)<=10&&x>=LW);if(ev){drag={mode:'ev',ev,x0:x,t0:ev.t,moved:0};return}}
  if(x>=LW){drag={mode:'head'};tc=clamp(xt(x),0,pat().dur);draw()}else drag=null};
 uc.onpointermove=e=>{if(!drag)return;const[x]=pos(uc,e);if(drag.mode==='head'){tc=clamp(xt(x),0,pat().dur);draw()}
  else if(drag.mode==='ev'){drag.moved=1;drag.ev.t=clamp(rd(sn(drag.t0+(x-drag.x0)/Z)),0,pat().dur);draw()}};
 uc.onpointerup=()=>{drag=null;refresh()};
 const wheel=e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();setZoom(Z*(e.deltaY<0?1.15:1/1.15))}else if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();off+=(e.deltaX||e.deltaY)/Z;draw()}};
 rc.addEventListener('wheel',wheel,{passive:false});uc.addEventListener('wheel',wheel,{passive:false});
 function setZoom(z){const t=xt(LW+(W-LW)/2);Z=clamp(z,20,300);off=t-(W-LW)/2/Z;if(o.zoomEl)o.zoomEl.value=Math.round(Z);draw()}
 // ---- 再生 ----
 function stopPlay(){if(playing){playing=0;cancelAnimationFrame(raf)}}
 function play(){stopPlay();if(tc>=pat().dur-.01)tc=0;playing=1;let last=performance.now();const f=n=>{if(!playing)return;tc+=(n-last)/1000;last=n;if(tc>=pat().dur){tc=pat().dur;playing=0;draw();return}
   if(tx(tc)>W-20||tx(tc)<LW)off=Math.max(0,tc-.5);draw();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
 return{refresh,draw,play,stop:stopPlay,busy:()=>!!drag,time:()=>tc,setTime(t){tc=clamp(t,0,pat().dur);draw()},setZoom,setSnap(v){snap=+v||0},setOff(v){off=v;draw()},playing:()=>playing}};
})(window);
