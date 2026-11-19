/* Project Manager: データ形式・検証・保存。全エディタ/エンジンが同じJSONを扱う */
(function(g){
const KEY='utbc.project.v1';
const raw=()=>({format:'utbc',version:2,souls:Souls.defaultList(),meta:{name:'新しいバトル',w:480,h:270},
 gauge:Gauge.defaults(),box:{x:150,y:120,w:180,h:130},player:{name:'PLAYER',lv:1,hp:20,atk:10},items:[{name:'パイ',heal:10,count:3}],
 patterns:[{id:'p1',name:'落下弾',dur:6,parts:[],bullets:[10,30,50,70,90,110,130,150].map((x,i)=>({t:i*0.5,x:160+x*0.9,y:110,vx:0,vy:70,r:5,color:'#ffffff',dmg:4}))},{id:'p2',name:'骨とブラスター(例)',dur:5,bullets:[],parts:[
  {id:'a1',type:'bone',t:.2,x:140,y:185,angle:90,len:90,w:8,vx:60,vy:0,dmg:4,color:'#ffffff'},
  {id:'a2',type:'bone',t:.2,x:340,y:185,angle:90,len:90,w:8,vx:-60,vy:0,dmg:4,color:'#ffffff'},
  {id:'a3',type:'blaster',t:1.6,x:240,y:30,angle:90,size:1.2,wait:.8,beamDur:.7,beamLen:300,beamW:36,dmg:6,color:'#ffffff'},
  {id:'a4',type:'blaster',t:2.6,x:100,y:190,angle:0,size:1.2,wait:.8,beamDur:.7,beamLen:300,beamW:36,dmg:6,color:'#ffffff'}]},{id:'p4',name:'追尾・曲線(例)',dur:8,bullets:[],parts:[
  {id:'m1',type:'bullet',t:.3,x:240,y:125,vx:0,vy:70,r:6,color:'#ff6666',mv:'home',turn:80,spd:70,hLife:3.5,life:6},
  {id:'m2',type:'bullet',t:1.5,x:170,y:125,vx:0,vy:60,r:5,mv:'sine',amp:22,freq:1.2},
  {id:'m3',type:'bullet',t:1.7,x:310,y:125,vx:0,vy:60,r:5,mv:'sine',amp:22,freq:1.2,phase:180},
  {id:'m4',type:'bone',t:3.2,x:150,y:185,angle:0,len:40,w:8,mv:'circle',amp:30,freq:.6,vx:40,vy:0,face:0,life:4},
  {id:'m5',type:'bone',t:4.5,x:150,y:122,len:46,w:8,mv:'bezier',cx:330,cy:110,ex:330,ey:250,mdur:2.2,face:1,life:5},
  {id:'m6',type:'blaster',t:5.2,x:60,y:60,angle:0,size:1,wait:.7,beamDur:.6,beamLen:300,beamW:30,dmg:6,mv:'bezier',cx:60,cy:200,ex:60,ey:215,mdur:1}]},{id:'p3',name:'SOUL切り替え(例)',dur:8,soul:'s_red',
  events:[{t:2,soul:'s_blue',keep:0,x:null,y:null},{t:4,soul:'s_green',keep:0,x:null,y:null},{t:6,soul:'s_yellow',keep:1,x:null,y:null}],
  platforms:[{id:'pl1',x:170,y:208,w:60},{id:'pl2',x:260,y:180,w:60}],bullets:[],
  parts:[{id:'c1',type:'bullet',t:.3,x:190,y:125,vx:0,vy:80,r:5},{id:'c2',type:'bullet',t:.9,x:240,y:125,vx:0,vy:80,r:5},{id:'c3',type:'bullet',t:1.4,x:290,y:125,vx:0,vy:80,r:5},
  {id:'c4',type:'bone',t:2.3,x:335,y:238,angle:90,len:26,w:8,vx:-85,vy:0,dmg:4},{id:'c5',type:'bone',t:3.1,x:335,y:238,angle:90,len:26,w:8,vx:-85,vy:0,dmg:4},
  {id:'c6',type:'bullet',t:4.2,x:150,y:185,vx:70,vy:0,r:5},{id:'c7',type:'bullet',t:4.8,x:240,y:125,vx:0,vy:70,r:5},{id:'c8',type:'bullet',t:5.4,x:330,y:185,vx:-70,vy:0,r:5,block:0},
  {id:'c9',type:'bullet',t:6.2,x:200,y:125,vx:0,vy:60,r:6},{id:'c10',type:'bullet',t:6.8,x:240,y:125,vx:0,vy:60,r:6},{id:'c11',type:'bullet',t:7.3,x:280,y:125,vx:0,vy:60,r:6}]}],
 enemies:[{id:'e1',name:'ナゾノテキ',hp:30,atk:2,def:0,color:'#ffd23f',exp:5,gold:3,talks:['* ふふふ…','* まだ続けるのか?'],flavor:['* ナゾノテキが立ちはだかる。','* 空気が張りつめている。'],patterns:['p1','p2'],
  acts:[{name:'確認',text:'* ナゾノテキ。HP30。',mercy:0},{name:'話す',text:'* 敵は落ち着いた。',mercy:1}]}]});
const sa=a=>Array.isArray(a)?a.map(String).filter(Boolean):[];
const num=(v,d)=>Number.isFinite(+v)?+v:d;
function normLayers(a){const L=(Array.isArray(a)?a:[]).filter(l=>l&&l.id).map(l=>({id:String(l.id),name:String(l.name||'レイヤー'),hide:l.hide?1:0,lock:l.lock?1:0}));return L.length?L:[{id:'L1',name:'レイヤー1',hide:0,lock:0}]}
function validate(p){ // データ破損対策: 欠損・型不正を補正
 const d=raw();if(!p||p.format!=='utbc')throw new Error('このファイルはバトルデータではありません');
 p.meta=Object.assign(d.meta,p.meta);p.box=Object.assign(d.box,p.box);p.player=Object.assign(d.player,p.player);
 p.assets=(Array.isArray(p.assets)?p.assets:[]).filter(a=>a&&typeof a.src==='string').map((a,i)=>({id:a.id||'as'+i,name:a.name||'素材',src:a.src,w:num(a.w,0),h:num(a.h,0),type:a.type||''}));
 p.costumes=(Array.isArray(p.costumes)?p.costumes:[]).map((k,i)=>{const a=p.assets.find(x=>x.id===k.asset);return{id:k.id||'co'+i,name:k.name||'コスチューム',asset:k.asset||'',cx:num(k.cx,a?a.w/2:0),cy:num(k.cy,a?a.h/2:0),scale:num(k.scale,1)||1,rot:num(k.rot,0)}});
 p.gauge=Gauge.norm(p.gauge);p.version=2; // v1→v2: souls追加(無ければ従来どおり赤SOUL)
 p.souls=Array.isArray(p.souls)&&p.souls.length?p.souls.map((s,i)=>Souls.norm(s,i)):Souls.defaultList();
 p.items=Array.isArray(p.items)?p.items:[];p.patterns=(p.patterns||[]).map((q,i)=>({id:q.id||'p'+i,name:q.name||'無題',dur:num(q.dur,5),soul:q.soul||'',events:(Array.isArray(q.events)?q.events:[]).map(e=>({t:num(e.t,0),soul:String(e.soul||''),keep:e.keep?1:0,x:e.x===null||e.x===''||!Number.isFinite(+e.x)?null:+e.x,y:e.y===null||e.y===''||!Number.isFinite(+e.y)?null:+e.y})),layers:normLayers(q.layers),platforms:(Array.isArray(q.platforms)?q.platforms:[]).map((p,k)=>({id:p.id||'pl'+k,x:num(p.x,0),y:num(p.y,0),w:num(p.w,60)})),
  parts:(Array.isArray(q.parts)?q.parts:[]).map((x,i)=>Object.assign({id:'a'+i},window.Parts?Parts.norm(x):x)),
  bullets:(q.bullets||[]).map(b=>{const n=Parts.norm(Object.assign({},b,{type:'bullet'}));delete n.type;delete n.id;return n})}));
 p.enemies=(p.enemies||[]).map((e,i)=>({id:e.id||'e'+i,name:e.name||'敵',hp:num(e.hp,10),atk:num(e.atk,1),def:num(e.def,0),color:e.color||'#fff',costume:e.costume||'',exp:num(e.exp,0),gold:num(e.gold,0),talks:sa(e.talks),flavor:sa(e.flavor),
  patterns:Array.isArray(e.patterns)?e.patterns:[],acts:Array.isArray(e.acts)?e.acts:[]}));
 if(!p.patterns.length)p.patterns=d.patterns;return p;}
const def=()=>validate(raw());
const PM={def,validate,
 save(p){try{localStorage.setItem(KEY,JSON.stringify(p));return true}catch(e){return false}},
 load(){try{const s=localStorage.getItem(KEY);return s?validate(JSON.parse(s)):null}catch(e){return null}},
 toJSON:p=>JSON.stringify(p,null,1),fromJSON:s=>validate(JSON.parse(s)),uid:()=>Math.random().toString(36).slice(2,8)};
g.PM=PM;})(window);
