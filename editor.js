/* UI Editor: 配置式弾幕エディタ・敵編集・プレイテスト */
(function(){
const $=s=>document.querySelector(s);let P=PM.load()||PM.def(),pat=P.patterns[0],selB=null,battle=null,pv=null,sel=new Set(),curLy=null,multi=0,tl=null;
const st=m=>{$('#st').textContent=m;setTimeout(()=>$('#st').textContent='',2500)};
const ed=$('#ed'),c=ed.getContext('2d');
const FIELDS={t:'bT',vx:'bVx',vy:'bVy',r:'bR',color:'bC',dmg:'bD',angle:'bA',len:'bL',w:'bW',wait:'bWait',beamDur:'bBeam',beamLen:'bBL',beamW:'bBW',ax:'bAx',ay:'bAy',mv:'bMv',amp:'bAmp',freq:'bFreq',phase:'bPh',grow:'bGrow',cx:'bCx',cy:'bCy',ex:'bEx',ey:'bEy',mdur:'bMdur',turn:'bTurn',spd:'bSpd',hLife:'bHl',face:'bFace',life:'bLife',hitPad:'bPad',size:'bSz',block:'bBlk',shoot:'bShot'};
const typeOf=q=>q.type||'bullet',all=()=>[...pat.bullets,...pat.parts],ord=()=>Parts.list(pat).map(e=>e[0]);
const lys=()=>{if(!pat.layers||!pat.layers.length)pat.layers=[{id:'L1',name:'レイヤー1',hide:0,lock:0}];return pat.layers},lyOf=q=>lys().find(l=>l.id===q.layer)||lys()[0];
function selClr(){selB=null;sel.clear();selInfo()}
function selInfo(){const e=$('#pSelInfo');if(e)e.textContent=sel.size?'選択 '+sel.size+'個'+(sel.size>1?'(値の変更は全てに反映)':''):''}
function selAdd(q){if(q.group)all().filter(x=>x.group===q.group).forEach(x=>sel.add(x));else sel.add(q)}
function selDel(q){if(q.group)all().filter(x=>x.group===q.group).forEach(x=>sel.delete(x));else sel.delete(q)}
$('#kind').innerHTML=Object.entries(Parts.types).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
function render(t){Assets.P=P;Parts.target={x:P.box.x+P.box.w/2,y:P.box.y+P.box.h/2};c.fillStyle='#000';c.fillRect(0,0,480,270);(pat.platforms||[]).forEach(p=>{c.fillStyle='#0c0';c.fillRect(p.x,p.y,p.w,3)});const b=P.box;c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(b.x,b.y,b.w,b.h);
 for(const q of ord()){if(t==null&&lyOf(q).hide)continue;const T=Parts.types[typeOf(q)];if(!T)continue;const st=T.state(q,t==null?q.t+T.editAt:t);if(!st)continue;T.draw(c,q,st,t==null);
  if(t==null&&q.mv&&q.mv!=='line'){const T0=Math.max(.5,Math.min(8,pat.dur-q.t,q.life>0?q.life:8)),pts=Parts.path(q,Parts.target,T0);c.strokeStyle=q.mv==='home'?'#f66':'#4c8';c.lineWidth=1;c.setLineDash([3,3]);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.setLineDash([])}
  if(t==null){c.strokeStyle=q===selB?'#ffd23f':sel.has(q)?'#ff9f43':q.group?'#4fc3f7':'#555';c.lineWidth=1;c.beginPath();c.arc(q.x,q.y,10,0,7);c.stroke();if((q.vx||q.vy)&&(!q.mv||q.mv==='line'||q.mv==='home')){c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x+q.vx*.3,q.y+q.vy*.3);c.stroke()}}}
 if(t==null&&selB&&selB.mv==='bezier'&&!lyOf(selB).hide){c.lineWidth=1;c.strokeStyle='#888';c.setLineDash([2,3]);c.beginPath();c.moveTo(selB.x,selB.y);c.lineTo(selB.cx,selB.cy);c.lineTo(selB.ex,selB.ey);c.stroke();c.setLineDash([]);
  for(const[px,py,col]of[[selB.cx,selB.cy,'#ffa500'],[selB.ex,selB.ey,'#00e5ff']]){c.fillStyle=col;c.beginPath();c.moveTo(px,py-7);c.lineTo(px+7,py);c.lineTo(px,py+7);c.lineTo(px-7,py);c.fill()}}}
function fillPat(){pat.parts=pat.parts||[];patExtra();$('#pSel').innerHTML=P.patterns.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');$('#pSel').value=pat.id;$('#pName').value=pat.name;$('#pDur').value=pat.dur;$('#tlPat').innerHTML=$('#pSel').innerHTML;$('#tlPat').value=pat.id;render();tl&&(tl.refresh(),tlForm())}
function bform(type){const T=Parts.types[type],o={t:+$('#bT').value||0};for(const k in T.defaults){const el=$('#'+FIELDS[k]);if(el)o[k]=(k==='color'||k==='mv')?el.value:(+el.value||0)}o.costume=$('#bCos').value;o.only=$('#bOnly').value;return o}
function mvShow(){const m=$('#bMv').value,ky=$('#kind').value,b=ky==='bone';document.querySelectorAll('[data-ty]').forEach(l=>{l.style.display=l.dataset.ty.split(' ').includes(ky)?'':'none'});document.querySelectorAll('[data-for]').forEach(l=>{const f=l.dataset.for.split(' ');l.style.display=f.includes('bone-only')?(b?'':'none'):(f.includes(m)?'':'none')})}
function toForm(q,defs){const T=Parts.types[typeOf(q)];$('#kind').value=typeOf(q);for(const k in FIELDS){const v=defs?(k==='t'?q.t:T.defaults[k]):q[k]??T.defaults[k];if(v!==undefined)$('#'+FIELDS[k]).value=v}$('#bCos').value=defs?'':(q.costume||'');$('#bOnly').value=defs?'':(q.only||'');mvShow()}
$('#bMv').addEventListener('input',mvShow);
document.querySelectorAll('.subtabs').forEach(b=>b.onclick=ev=>{const g=ev.target.dataset.pg;if(!g)return;b.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===ev.target));b.parentNode.querySelectorAll('.pg').forEach(p=>p.hidden=p.dataset.pg!==g)});
const tgs=()=>sel.size?[...sel]:selB?[selB]:[];
Object.entries(FIELDS).forEach(([k,i])=>$('#'+i).oninput=()=>{const el=$('#'+i),v=(k==='color'||k==='mv')?el.value:(+el.value||0);for(const q of tgs()){const T=Parts.types[typeOf(q)];if(k==='t'||(T&&k in T.defaults))q[k]=v}if(selB)render()});
$('#bOnly').oninput=()=>{tgs().forEach(q=>q.only=$('#bOnly').value)};
$('#bCos').onchange=()=>{if(selB){tgs().forEach(q=>q.costume=$('#bCos').value);render()}};
$('#kind').onchange=()=>{selClr();toForm({type:$('#kind').value,t:+$('#bT').value||0},1);render()};
const pt=e=>{const r=ed.getBoundingClientRect();return[(e.clientX-r.left)*480/r.width,(e.clientY-r.top)*270/r.height]};
let drag=null,hd=null;ed.onpointerdown=e=>{stopPv();const[x,y]=pt(e);if(selB&&selB.mv==='bezier'&&!lyOf(selB).lock&&!lyOf(selB).hide&&!(multi||e.shiftKey)){const hh=[['c',selB.cx,selB.cy],['e',selB.ex,selB.ey]].find(([k,a,b])=>Math.hypot(a-x,b-y)<11);if(hh){hd=hh[0];ed.setPointerCapture(e.pointerId);return}}const vis=ord().filter(q=>{const l=lyOf(q);return!l.hide&&!l.lock}).reverse();const h=vis.find(q=>Math.hypot(q.x-x,q.y-y)<Math.max(q.r||0,10)+4);const add=multi||e.shiftKey||e.ctrlKey||e.metaKey;
 if(h){if(add){if(sel.has(h)){selDel(h);if(!sel.has(selB))selB=[...sel][0]||null}else{selAdd(h);selB=h}}else if(!sel.has(h)){sel.clear();selAdd(h);selB=h}else selB=h;
  selInfo();if(selB)toForm(selB);if(sel.has(h)){drag={x0:x,y0:y,h,add,moved:0,o:[...sel].map(q=>[q,q.x,q.y])};ed.setPointerCapture(e.pointerId)}}
 else if(multi){selClr()}
 else{const ty=$('#kind').value,it={...bform(ty),x:Math.round(x),y:Math.round(y),layer:lyOf({layer:curLy}).id,group:''};
  if(ty==='bullet')pat.bullets.push(it);else{it.id=PM.uid();it.type=ty;pat.parts.push(it)}sel.clear();sel.add(it);selB=it;selInfo()}render()};
ed.onpointermove=e=>{if(hd&&selB){const[x,y]=pt(e),k=hd==='c'?['cx','cy']:['ex','ey'];selB[k[0]]=Math.round(x);selB[k[1]]=Math.round(y);toForm(selB);render();return}if(!drag)return;const[x,y]=pt(e),dx=x-drag.x0,dy=y-drag.y0;if(Math.hypot(dx,dy)>2)drag.moved=1;if(!drag.moved)return;for(const[q,qx,qy]of drag.o){q.x=Math.round(qx+dx);q.y=Math.round(qy+dy)}render()};
ed.onpointerup=()=>{hd=null;if(drag&&!drag.moved&&!drag.add&&sel.size>1){const h=drag.h;sel.clear();selAdd(h);selB=h;selInfo();render()}drag=null};
function stopPv(){if(pv){cancelAnimationFrame(pv);pv=null;render()}}
$('#pPlay').onclick=()=>{stopPv();const s=performance.now(),f=n=>{const t=(n-s)/1000;if(t>pat.dur){pv=null;render();return}render(t);pv=requestAnimationFrame(f)};pv=requestAnimationFrame(f)};
$('#pStop').onclick=stopPv;
$('#pDel').onclick=()=>{if(!sel.size)return;pat.bullets=pat.bullets.filter(q=>!sel.has(q));pat.parts=pat.parts.filter(q=>!sel.has(q));selClr();render()};
$('#pDup').onclick=()=>{if(!sel.size)return;const gm={},ns=[];for(const q of sel){const n={...q,x:q.x+12,y:q.y+12};if(n.id)n.id=PM.uid();if(q.group){gm[q.group]=gm[q.group]||PM.uid();n.group=gm[q.group]}(n.type?pat.parts:pat.bullets).push(n);ns.push(n)}sel.clear();ns.forEach(n=>sel.add(n));selB=ns[0];selInfo();render()};
$('#pMulti').onclick=()=>{multi=multi?0:1;$('#pMulti').textContent='複数選択: '+(multi?'ON':'OFF');$('#pMulti').classList.toggle('on',!!multi)};
$('#pAll').onclick=()=>{sel.clear();ord().filter(q=>{const l=lyOf(q);return!l.hide&&!l.lock}).forEach(q=>sel.add(q));selB=[...sel][0]||null;if(selB)toForm(selB);selInfo();render()};
$('#pGrp').onclick=()=>{if(sel.size<2){st('2つ以上選択してください');return}const g=PM.uid();sel.forEach(q=>q.group=g);selInfo();render();st('グループ化しました')};
$('#pUng').onclick=()=>{const gs=new Set([...sel].map(q=>q.group).filter(Boolean));if(!gs.size){st('選択中にグループがありません');return}all().forEach(q=>{if(gs.has(q.group))q.group=''});render();st('グループを解除しました')};
$('#pToLy').onclick=()=>{if(!sel.size){st('移動する弾・パーツを選択してください');return}const id=lyOf({layer:curLy}).id;sel.forEach(q=>q.layer=id);render();st('レイヤーを移動しました')};
$('#pSel').onchange=e=>{pat=P.patterns.find(p=>p.id===e.target.value);selClr();fillPat()};
$('#pAdd').onclick=()=>{pat={id:PM.uid(),name:'パターン'+(P.patterns.length+1),dur:5,bullets:[],parts:[],soul:P.souls[0].id,events:[],platforms:[],layers:[{id:'L1',name:'レイヤー1',hide:0,lock:0}]};P.patterns.push(pat);selClr();fillPat()};
$('#pName').oninput=e=>{pat.name=e.target.value;const o=$('#pSel').selectedOptions[0];if(o)o.textContent=pat.name};$('#pDur').oninput=e=>{pat.dur=Math.max(1,+e.target.value||5);tl&&tl.refresh()};
function enUI(){$('#enList').innerHTML=P.enemies.map((e,i)=>`<div class="en" data-i="${i}"><label>名前<input data-f="name" value="${e.name}"></label>
<div class="row"><label>HP<input data-f="hp" type="number" value="${e.hp}"></label><label>防御<input data-f="def" type="number" value="${e.def}"></label><label>色<input data-f="color" type="color" value="${e.color}"></label></div>
<label>攻撃パターン<select data-f="pat">${P.patterns.map(p=>`<option value="${p.id}" ${e.patterns[0]===p.id?'selected':''}>${p.name}</option>`).join('')}</select></label>
<label>コスチューム<select data-f="costume">${cosOpts(e.costume)}</select></label>
<label>敵のセリフ(1行1個・ターン順)<textarea data-f="talks">${(e.talks||[]).join('\n')}</textarea></label><label>メニューの文章(1行1個)<textarea data-f="flavor">${(e.flavor||[]).join('\n')}</textarea></label><div class="row"><label>EXP<input data-f="exp" type="number" value="${e.exp||0}"></label><label>G<input data-f="gold" type="number" value="${e.gold||0}"></label></div>
<label>ACT(1行1個: 名前|テキスト|見逃し可能にする=1)<textarea data-f="acts">${e.acts.map(a=>[a.name,a.text,a.mercy].join('|')).join('\n')}</textarea></label><button data-del="${i}">この敵を削除</button></div>`).join('');
 $('#plName').value=P.player.name||'';$('#plLv').value=P.player.lv||1;$('#plHp').value=P.player.hp;$('#plAtk').value=P.player.atk}
$('#enList').oninput=e=>{const d=e.target.closest('.en'),f=e.target.dataset.f;if(!d||!f)return;const en=P.enemies[d.dataset.i],v=e.target.value;
 if(f==='pat')en.patterns=[v];else if(f==='acts')en.acts=v.split('\n').filter(Boolean).map(l=>{const[a,b,m]=l.split('|');return{name:a||'ACT',text:b||'',mercy:+m?1:0}});else if(f==='talks'||f==='flavor')en[f]=v.split('\n').filter(Boolean);else en[f]=['hp','def','exp','gold'].includes(f)?+v||0:v};
$('#enList').onclick=e=>{const i=e.target.dataset.del;if(i!=null&&P.enemies.length>1){P.enemies.splice(i,1);enUI()}};
$('#enAdd').onclick=()=>{P.enemies.push({id:PM.uid(),name:'新しい敵',hp:20,atk:1,def:0,color:'#8cf',patterns:[P.patterns[0].id],acts:[{name:'確認',text:'* ...',mercy:0}]});enUI()};
$('#plHp').oninput=e=>P.player.hp=Math.max(1,+e.target.value||20);$('#plAtk').oninput=e=>P.player.atk=+e.target.value||1;
$('#plName').oninput=e=>P.player.name=e.target.value;$('#plLv').oninput=e=>P.player.lv=Math.max(1,+e.target.value||1);
function startPlay(){if(battle)battle.destroy();battle=new Battle($('#pl'),PM.validate(JSON.parse(JSON.stringify(P))))}
$('#plReset').onclick=startPlay;
document.querySelectorAll('#pad [data-k]').forEach(b=>{const k=b.dataset.k;b.onpointerdown=e=>{e.preventDefault();if(battle){battle.keys[k]=1;battle.press(k)}};['pointerup','pointerleave'].forEach(v=>b['on'+v]=()=>battle&&delete battle.keys[k])});
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b===e.target));
 document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!==t);stopPv();if(battle&&t!=='play'){battle.destroy();battle=null}if(t==='play')startPlay();if(t==='en')enUI();if(t==='as')asUI();if(t==='so'){soUI();if(!sv)soReset();if(!sloop)soLoop()}if(t==='pat'){patExtra();render();if(selB)toForm(selB)}if(t==='tl'){tl.refresh();tlForm()}else tl&&tl.stop();if(t==='gg')ggUI()};
const reload=p=>{P=p;pat=P.patterns[0];selClr();refreshCos();fillPat();enUI();hReset();if(Assets.missing(P).length)st('素材が見つからない参照があります')};
$('#bNew').onclick=()=>{if(confirm('現在のデータを破棄して新規作成しますか?'))reload(PM.def())};
$('#bSave').onclick=()=>st(PM.save(P)?'保存しました':'保存に失敗(容量不足の可能性)');
$('#bLoad').onclick=()=>{const p=PM.load();p?(reload(p),st('読み込みました')):st('保存データがありません')};
$('#bJson').onclick=()=>Exporter.download((P.meta.name||'battle')+'.json',PM.toJSON(P),'application/json');
$('#fJson').onchange=async e=>{try{reload(PM.fromJSON(await e.target.files[0].text()));st('読み込みました')}catch(x){alert('読み込み失敗: '+x.message)}e.target.value=''};
$('#bHtml').onclick=async()=>{try{Exporter.download((P.meta.name||'battle')+'.html',await Exporter.html(P),'text/html')}catch(x){alert('HTML出力に失敗しました。http(s)で配信した状態(GitHub Pages等)で実行してください。')}};
const TODO=[
['✅ 実装済み',[
 '戦闘: FIGHT/ACT/ITEM/MERCY、複数敵(個別管理)、ダメージ計算、敵のセリフ、EXP/G、勝敗・逃走',
 '攻撃パーツ共通データ(弾/骨/ガスターブラスター)と拡張可能な登録簿、配置式の弾幕エディタ(加速・寿命・当たり判定余白など)',
 '素材管理: PNG/SVG/WebP/JPG/GIF(1コマ)の一括読込、中心・拡大・回転、並べ替え・複製・削除、単独HTMLにも同梱',
 'コスチューム割当: 骨・ブラスター・弾・SOUL・敵へ割当(敵画像の表示もここで対応済み)',
 'SOUL(赤/青/緑/黄)・パターン途中の切り替え・足場・攻撃側の防御/射撃/対象指定・SOUL専用編集画面',
 'FIGHTタイミングゲージ(判定範囲/倍率/MISS設定/見た目/方向)',
 'JSON書出/読込・サイト内保存・データ検証と旧データ移行・単独HTML出力・タッチ操作',
 '【段階1】Undo/Redo(最大100手、Ctrl+Z / Ctrl+Y・ボタン)、レイヤー(追加/名前/順序/非表示/ロック/削除)、複数選択とグループ化(一括移動・複製・削除)',
 '【段階2】移動方式(弾・骨・ブラスター共通): 波(サイン)、円・渦巻き、2次ベジェ曲線(制御点/終点をドラッグ編集)、SOUL追尾(旋回速度・速さ・追尾秒数)、骨の進行方向への向き合わせ、編集画面での軌跡プレビュー、例パターン「追尾・曲線(例)」',
 '【段階3】タイムライン式の攻撃パーツ編集(新タブ): 時間軸バーのドラッグで出現時間、右端で寿命/ブラスター照射時間、◆でSOUL切替の時刻、ルーラーで再生位置、再生・ズーム・スナップ・横スクロール、再生位置への追加・複製・削除、選択値の編集。配置式と同じデータ・選択を共有',
 '【UI】全タブをスクロール不要のコンパクト配置に変更(1280×720 / 1366×768 / 1024×768 / 1180×820で確認)。配置式の入力欄は「パーツ/移動/パターン/レイヤー・足場」の小タブに分け、種類に関係ない項目は自動で非表示。ステージは画面の高さに合わせて自動で拡縮'
]],
['△ 制限付き(動くが未完成)',[
 'GIFは最初の1コマのみ(アニメ再生は段階5)',
 '効果音はIDを保存するだけで再生はしない(段階7)',
 '敵画像は1体につき1コスチューム・静止画のみ(状態別/アニメは段階5)',
 'SOUL: 操作キー変更・タッチ専用操作・登場/退場演出・SOUL別効果音は未実装',
 'レイヤーの非表示/ロックは編集画面のみ。ゲーム内では全て表示され、描画順だけレイヤー順が反映される',
 'Undo/Redoの対象は編集内容(素材の追加削除を含む)。サイト内保存・プレイテストの進行は対象外。新規作成/JSON読込で履歴は消える。Undo後も同じ番号のパーツは選択を保つ(追加/削除が絡む場合は選択がずれることがある)',
 '複数選択中の数値変更は選択した全てに反映(その種類に無い項目は無視)',
'追尾は現在のSOULを狙う。追尾中は加速(加速X/Y)を無視。ベジェは2次(制御点1つ)で、終点到達後は終点での向きのまま直進。ブラスターの「進行方向に向ける」は未対応(角度固定)',
 '幅820px以下の縦長画面では縦積みになりスクロールが必要。敵・コスチュームが多い場合は、その一覧の中だけスクロールする',
 'タイムライン式: SOUL切替の追加・削除・切替先の変更は配置式タブ側(◆は時刻の移動のみ)。バー左端のリサイズ、軌跡の表示、行の絞り込み/並べ替えは未対応',
 '単独HTML書出はhttp(s)配信(GitHub Pages等)でのみ動作(file://不可)'
]],
['⬜ 未実装(段階順に追加予定)',[
 '【段階4】ノード式編集・コードエディタ(隔離実行、エラー表示、実行/停止)',
 '【段階5】フレームアニメ・ボーンアニメ・キーフレーム/イージング、攻撃との同期、GIFアニメ再生、敵のアニメーション',
 '【段階6】枠(バトルボックス)エディタ、フォント編集(文字エディタ)',
 '【段階7】音声エディタ全般(素材管理・ミキサー・タイムライン・効果音の再生)',
 '【段階8】複数バトル管理、敵連携攻撃、素材管理の強化(未使用検出など)、素材ZIP出力'
]]];
$('#todoList').innerHTML=TODO.map(([a,b])=>`<h4>${a}</h4><ul>${b.map(x=>`<li>${x}</li>`).join('')}</ul>`).join('');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function cosOpts(sel){return '<option value="">(なし)</option>'+(P.costumes||[]).map(k=>`<option value="${k.id}" ${sel===k.id?'selected':''}>${esc(k.name)}</option>`).join('')}
function refreshCos(){const v=$('#bCos').value;$('#bCos').innerHTML=cosOpts(v)}
function asUI(){$('#asList').innerHTML=(P.costumes||[]).map((k,i)=>{const a=P.assets.find(x=>x.id===k.asset);return `<div class="en" data-i="${i}">${a?`<img class="th" src="${a.src}">`:'<b>素材ファイルが見つかりません</b>'}<label>名前<input data-f="name" value="${esc(k.name)}"></label>
<div class="row"><label>中心X(px)<input data-f="cx" type="number" value="${k.cx}"></label><label>中心Y(px)<input data-f="cy" type="number" value="${k.cy}"></label><label>拡大<input data-f="scale" type="number" step="0.1" value="${k.scale}"></label><label>回転(度)<input data-f="rot" type="number" value="${k.rot}"></label></div>
<div class="row"><button data-a="up">↑</button><button data-a="down">↓</button><button data-a="dup">複製</button><button data-a="del">削除</button></div></div>`}).join('')||'<p class="note">画像がありません</p>';
 const m=Assets.missing(P);$('#asWarn').textContent=m.length?'⚠ コスチュームが見つからない参照(標準描画で代替): '+m.join(' / '):'';refreshCos()}
$('#asFile').onchange=async e=>{const er=await Assets.add(P,[...e.target.files]);e.target.value='';asUI();if(er.length)alert('読み込めなかったファイル:\n'+er.join('\n'))};
$('#asList').oninput=e=>{const d=e.target.closest('.en'),f=e.target.dataset.f;if(!d||!f)return;const k=P.costumes[d.dataset.i];k[f]=f==='name'?e.target.value:(+e.target.value||(f==='scale'?1:0));refreshCos()};
$('#asList').onclick=e=>{const a=e.target.dataset.a,d=e.target.closest('.en');if(!a||!d)return;const i=+d.dataset.i,L=P.costumes;
 if(a==='up'&&i>0)[L[i-1],L[i]]=[L[i],L[i-1]];if(a==='down'&&i<L.length-1)[L[i+1],L[i]]=[L[i],L[i+1]];
 if(a==='dup')L.splice(i+1,0,{...L[i],id:'co'+PM.uid(),name:L[i].name+'のコピー'});
 if(a==='del'&&confirm('このコスチュームを削除しますか?(使用中の箇所は標準描画になります)')){const [k]=L.splice(i,1);if(!L.some(x=>x.asset===k.asset))P.assets=P.assets.filter(x=>x.id!==k.asset)}
 asUI()};
Assets.onload=()=>{if(!pv)render()};
const GF=[['enabled','FIGHTでゲージを使う','k'],['w','幅','n'],['h','高さ','n'],['x','表示位置X(中心)','n'],['y','表示位置Y(中心)','n'],['color','ゲージの色','c'],['bg','背景色','c'],['border','枠線の色','c'],['borderW','枠線の太さ','n'],
 ['cursorColor','カーソルの色','c'],['cursorW','カーソルの大きさ','n'],['speed','カーソル速度(px/秒)','n'],['dir','移動方向','s'],['timeout','制限時間(秒)','n'],['introTime','表示アニメ(秒)','n'],['inputLock','開始直後の入力無効(秒)','n'],['hold','結果表示(秒)','n']];
function ggUI(){const G=Gauge.norm(P.gauge);P.gauge=G;const f=GF.map(([k,l,t])=>t==='k'?`<label><span><input type="checkbox" data-g="${k}" ${G[k]?'checked':''}> ${l}</span></label>`:t==='s'?`<label>${l}<select data-g="${k}">${[['lr','左→右'],['rl','右→左'],['pingpong','往復']].map(([v,n])=>`<option value="${v}" ${G.dir===v?'selected':''}>${n}</option>`).join('')}</select></label>`:`<label>${l}<input data-g="${k}" type="${t==='c'?'color':'number'}" step="any" value="${G[k]}"></label>`).join('');
 const j=G.judges.map((q,i)=>`<div class="en"><b>判定${i+1}</b><label>名前<input data-j="${i}.name" value="${esc(q.name)}"></label><div class="row"><label>範囲(%)<input data-j="${i}.range" type="number" value="${Math.round(q.range*100)}"></label><label>ダメージ倍率<input data-j="${i}.mult" type="number" step="0.1" value="${q.mult}"></label><label>色<input data-j="${i}.color" type="color" value="${q.color}"></label></div></div>`).join('');
 const m=G.miss,ms=`<div class="en"><b>MISS(範囲外)</b><label>名前<input data-m="name" value="${esc(m.name)}"></label><label>効果<select data-m="mode"><option value="zero" ${m.mode==='zero'?'selected':''}>攻撃無効(ダメージ0)</option><option value="min" ${m.mode==='min'?'selected':''}>最低ダメージを与える</option></select></label><label>最低ダメージ<input data-m="min" type="number" value="${m.min}"></label><label>色<input data-m="color" type="color" value="${m.color}"></label></div>`;
 const sd=`<div class="en"><b>効果音ID(再生は音声エディタ実装後・未実装)</b>${Object.keys(G.sounds).map(k=>`<label>${k}<input data-s="${k}" value="${esc(G.sounds[k])}"></label>`).join('')}</div>`;
 $('#gForm').innerHTML=f+'<p class="note">範囲は「ゲージ中央〜端」を100%とした割合です。</p>'+j+ms+sd}
$('#gForm').oninput=e=>{const t=e.target,G=P.gauge,d=t.dataset;if(d.g){G[d.g]=t.type==='checkbox'?(t.checked?1:0):t.type==='number'?+t.value:t.value}
 else if(d.j){const[i,k]=d.j.split('.');G.judges[i][k]=k==='range'?(+t.value||1)/100:k==='mult'?+t.value:t.value}else if(d.m)G.miss[d.m]=d.m==='min'?+t.value:t.value;else if(d.s)G.sounds[d.s]=t.value};
let gp=null,gloop=0;const gc=$('#gcv').getContext('2d');
function gStart(){gp=new Gauge(P.gauge);gp.start(r=>{$('#gRes').textContent='判定: '+r.name+'(倍率×'+r.mult+(r.miss?'/MISS':'')+')'});$('#gRes').textContent='決定で停止…';if(!gloop)gtick()}
function gtick(){if($('#gg').hidden){gloop=0;return}gloop=1;gc.fillStyle='#000';gc.fillRect(0,0,480,270);if(gp){gp.update(1/60);gp.draw(gc)}requestAnimationFrame(gtick)}
$('#gStart').onclick=gStart;$('#gcv').onpointerdown=()=>gp&&gp.press();
addEventListener('keydown',e=>{if(!$('#gg').hidden&&(e.key==='z'||e.key==='Z'||e.key==='Enter')&&!e.repeat&&gp)gp.press()});
// ---- パターンのSOUL設定・切り替え・足場 ----
function patExtra(){lyUI();pat.events=pat.events||[];pat.platforms=pat.platforms||[];const so=P.souls,opt=v=>so.map(s=>`<option value="${s.id}" ${v===s.id?'selected':''}>${esc(s.name)}</option>`).join('');
 $('#pSoul').innerHTML=opt(pat.soul||so[0].id);
 $('#pEv').innerHTML=pat.events.map((e,i)=>`<div class="en" data-i="${i}"><div class="row"><label>時間(秒)<input data-e="t" type="number" step="0.1" value="${e.t}"></label><label>切替先<select data-e="soul">${opt(e.soul)}</select></label></div><div class="row"><label><span><input data-e="keep" type="checkbox" ${e.keep?'checked':''}> 位置を引き継ぐ</span></label><label>初期X<input data-e="x" type="number" value="${e.x??''}"></label><label>初期Y<input data-e="y" type="number" value="${e.y??''}"></label></div><button data-del-e="${i}">削除</button></div>`).join('');
 $('#pPl').innerHTML=pat.platforms.map((p,i)=>`<div class="en row" data-i="${i}"><label>X<input data-p="x" type="number" value="${p.x}"></label><label>Y<input data-p="y" type="number" value="${p.y}"></label><label>幅<input data-p="w" type="number" value="${p.w}"></label><button data-del-p="${i}">削除</button></div>`).join('')}
$('#pSoul').onchange=e=>pat.soul=e.target.value;
$('#pEvAdd').onclick=()=>{pat.events.push({t:1,soul:P.souls[0].id,keep:1,x:null,y:null});patExtra()};
$('#pPlAdd').onclick=()=>{pat.platforms.push({id:PM.uid(),x:P.box.x+40,y:P.box.y+P.box.h-40,w:60});patExtra();render()};
$('#pEv').oninput=e=>{const d=e.target.closest('.en'),k=e.target.dataset.e;if(!d||!k)return;const ev=pat.events[d.dataset.i],t=e.target;ev[k]=k==='keep'?(t.checked?1:0):k==='soul'?t.value:k==='t'?(+t.value||0):(t.value===''?null:+t.value)};
$('#pEv').onclick=e=>{const i=e.target.dataset.delE;if(i!=null){pat.events.splice(i,1);patExtra()}};
$('#pPl').oninput=e=>{const d=e.target.closest('.en'),k=e.target.dataset.p;if(!d||!k)return;pat.platforms[d.dataset.i][k]=+e.target.value||0;render()};
$('#pPl').onclick=e=>{const i=e.target.dataset.delP;if(i!=null){pat.platforms.splice(i,1);patExtra();render()}};
// ---- SOUL編集画面 ----
let selS=0,sv=null,sloop=0;const sk={},sc=$('#socv').getContext('2d'),KM={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'z',Z:'z'};
function soUI(){const L=P.souls;if(selS>=L.length)selS=0;const S=L[selS],keys=Object.keys(Souls.defaultsOf(S.type));
 $('#soSel').innerHTML=L.map((s,i)=>`<option value="${i}" ${i===selS?'selected':''}>${esc(s.name)}(${(Souls.types[s.type]||{}).label||s.type})</option>`).join('');
 $('#soForm').innerHTML=`<label>名前<input data-sf="name" value="${esc(S.name)}"></label><label>種類<select data-sf="type">${Object.entries(Souls.types).map(([k,v])=>`<option value="${k}" ${S.type===k?'selected':''}>${v.label}</option>`).join('')}</select></label>`+
  keys.map(k=>{const v=S[k],l=Souls.LABELS[k]||k;return k==='costume'?`<label>${l}<select data-sf="costume">${cosOpts(v)}</select></label>`:/color$/i.test(k)?`<label>${l}<input data-sf="${k}" type="color" value="${v}"></label>`:`<label>${l}<input data-sf="${k}" type="number" step="any" value="${v}"></label>`}).join('')+
  '<p class="note">未実装: 操作キーの変更、タッチ専用操作、登場/退場アニメ、SOUL別の効果音(切り替え時のイベント通知のみ)。見た目の大きさと当たり判定の半径は別々に設定できます。</p>'}
function soReset(){const b=P.box;sv={S:Souls.make(P.souls[selS],b.x+b.w/2,b.y+b.h/2),t:0,nx:.5,hit:0,killed:new WeakSet(),pat:{platforms:[{x:b.x+30,y:b.y+b.h-38,w:64},{x:b.x+b.w-94,y:b.y+b.h-72,w:64}],bullets:[],parts:[]}}}
function soLoop(){if($('#so').hidden){sloop=0;return}sloop=1;if(!sv)soReset();const dt=1/60,b=P.box,pat=sv.pat;sv.t+=dt;sv.nx-=dt;
 if(sv.nx<=0){sv.nx=.9;const a=Math.random()*4|0,x=a===0?b.x:a===1?b.x+b.w:b.x+30+Math.random()*(b.w-60),y=a===2?b.y:a===3?b.y+b.h:b.y+20+Math.random()*(b.h-40),cx=b.x+b.w/2,cy=b.y+b.h/2,d=Math.hypot(cx-x,cy-y)||1;
  pat.bullets.push({t:sv.t,x,y,vx:(cx-x)/d*70,vy:(cy-y)/d*70,r:5,color:'#ffffff',dmg:4,block:1,shoot:1,only:''})}
 pat.bullets=pat.bullets.filter(q=>sv.t-q.t<6&&!sv.killed.has(q));Parts.target={x:sv.S.x,y:sv.S.y};if(Souls.tick(sv.S,dt,{box:b,pat,t:sv.t,keys:sk,killed:sv.killed}))sv.hit++;
 sc.fillStyle='#000';sc.fillRect(0,0,480,270);sc.strokeStyle='#fff';sc.lineWidth=3;sc.strokeRect(b.x,b.y,b.w,b.h);pat.platforms.forEach(p=>{sc.fillStyle='#0c0';sc.fillRect(p.x,p.y,p.w,3)});
 const BT=Parts.types.bullet;pat.bullets.forEach(q=>BT.draw(sc,q,BT.state(q,sv.t)));Souls.drawPb(sc,sv.S);if(!sv.S.iv||Math.floor(sv.t*10)%2)Souls.draw(sc,sv.S);
 sc.fillStyle='#fff';sc.font='12px monospace';sc.fillText('被弾 '+sv.hit+'回',8,16);requestAnimationFrame(soLoop)}
$('#soSel').onchange=e=>{selS=+e.target.value;soUI();soReset()};$('#soRst').onclick=soReset;
$('#soForm').oninput=e=>{const k=e.target.dataset.sf;if(!k)return;const S=P.souls[selS];
 if(k==='type'){const o=Souls.norm({...S,type:e.target.value},selS);o.id=S.id;P.souls[selS]=o;soUI();soReset();return}
 S[k]=e.target.type==='number'?(+e.target.value||0):e.target.value;if(k==='name'||k==='color'||k==='costume'||e.target.type==='number')soReset()};
$('#soAdd').onclick=()=>{P.souls.push(Souls.norm({id:'soul_'+PM.uid(),name:'新しいSOUL',type:'red'},P.souls.length));selS=P.souls.length-1;soUI();soReset()};
$('#soDup').onclick=()=>{const s={...P.souls[selS],id:'soul_'+PM.uid()};s.name+='のコピー';P.souls.splice(selS+1,0,s);selS++;soUI();soReset()};
$('#soDel').onclick=()=>{if(P.souls.length<2){alert('SOULは最低1つ必要です');return}if(!confirm('このSOULを削除しますか?(使っているパターンは先頭のSOULになります)'))return;P.souls.splice(selS,1);selS=0;soUI();soReset()};
addEventListener('keydown',e=>{if(!$('#so').hidden&&KM[e.key]){sk[KM[e.key]]=1;if(e.key.startsWith('Arrow'))e.preventDefault()}});addEventListener('keyup',e=>{if(KM[e.key])delete sk[KM[e.key]]});
document.querySelectorAll('#spad [data-k]').forEach(b=>{const k=b.dataset.k;b.onpointerdown=ev=>{ev.preventDefault();sk[k]=1};['pointerup','pointerleave'].forEach(v=>b['on'+v]=()=>delete sk[k])});
// ---- レイヤーUI ----
function lyUI(){const L=lys();if(!L.some(l=>l.id===curLy))curLy=L[0].id;
 $('#pLy').innerHTML=L.map((l,i)=>`<div class="en row" data-i="${i}"><label><span><input type="radio" name="ly" data-l="cur" ${l.id===curLy?'checked':''}> 配置先</span></label><label>名前<input data-l="name" value="${esc(l.name)}"></label><label><span><input type="checkbox" data-l="hide" ${l.hide?'checked':''}> 非表示(編集のみ)</span></label><label><span><input type="checkbox" data-l="lock" ${l.lock?'checked':''}> ロック</span></label><button data-la="up">↑</button><button data-la="down">↓</button><button data-la="del">削除</button></div>`).join('')}
$('#pLy').oninput=e=>{const d=e.target.closest('.en'),k=e.target.dataset.l;if(!d||k!=='name')return;lys()[d.dataset.i].name=e.target.value};
$('#pLy').onchange=e=>{const d=e.target.closest('.en'),k=e.target.dataset.l;if(!d||!k||k==='name')return;const l=lys()[d.dataset.i];if(k==='cur')curLy=l.id;else{l[k]=e.target.checked?1:0;if(l[k]&&sel.size){[...sel].forEach(q=>{if(lyOf(q)===l)sel.delete(q)});if(!sel.has(selB))selB=[...sel][0]||null;selInfo()}}render()};
$('#pLy').onclick=e=>{const a=e.target.dataset.la,d=e.target.closest('.en');if(!a||!d)return;const i=+d.dataset.i,L=lys();
 if(a==='up'&&i>0)[L[i-1],L[i]]=[L[i],L[i-1]];if(a==='down'&&i<L.length-1)[L[i+1],L[i]]=[L[i],L[i+1]];
 if(a==='del'){if(L.length<2){alert('レイヤーは最低1つ必要です');return}if(!confirm('このレイヤーを削除しますか?(中の弾・パーツは先頭のレイヤーに移ります)'))return;const id=L[i].id;L.splice(i,1);all().forEach(q=>{if(q.layer===id)q.layer=''})}
 lyUI();render()};
$('#pLyAdd').onclick=()=>{const L=lys(),n={id:'L'+PM.uid(),name:'レイヤー'+(L.length+1),hide:0,lock:0};L.push(n);curLy=n.id;lyUI()};
// ---- タイムライン式(timeline.js)との連携 ----
const TLK=[['t','tlT'],['x','tlX'],['y','tlY'],['life','tlLife'],['wait','tlWait'],['beamDur','tlBeam'],['dmg','tlDmg']];
function tlForm(){const q=selB;$('#tlSelInfo').textContent=sel.size?('選択 '+sel.size+'個'):'パーツを選択してください';for(const[k,id]of TLK){const el=$('#'+id),ok=q&&(k==='t'||k==='x'||k==='y'||k in (Parts.types[typeOf(q)]||{defaults:{}}).defaults);el.disabled=!ok;el.value=ok?q[k]:''}}
tl=Timeline({rows:$('#tlRows'),ruler:$('#tlRuler'),stage:$('#tlStage'),timeEl:$('#tlTime'),scrollEl:$('#tlScroll'),zoomEl:$('#tlZoom'),sel,getP:()=>P,getPat:()=>pat,getSelB:()=>selB,layer:lyOf,multi:()=>multi,visible:()=>!$('#tl').hidden,
 pick(q,add,only){if(only){sel.clear();selAdd(q);selB=q}else if(add){if(sel.has(q)){selDel(q);if(!sel.has(selB))selB=[...sel][0]||null}else{selAdd(q);selB=q}}else if(!sel.has(q)){sel.clear();selAdd(q);selB=q}else selB=q;selInfo()},
 clear(){selClr()},change(){tlForm()}});
TLK.forEach(([k,id])=>$('#'+id).oninput=ev=>{const v=+ev.target.value;if(!Number.isFinite(v)||ev.target.value==='')return;for(const q of tgs()){const T=Parts.types[typeOf(q)];if(k==='t'||k==='x'||k==='y'||(T&&k in T.defaults))q[k]=(k==='t'?Math.max(0,v):v)}tl.refresh()});
$('#tlKind').innerHTML=$('#kind').innerHTML;
$('#tlPat').onchange=ev=>{pat=P.patterns.find(p=>p.id===ev.target.value)||pat;selClr();fillPat()};
$('#tlPlay').onclick=()=>tl.play();$('#tlStop').onclick=()=>tl.stop();$('#tlSnap').onchange=ev=>tl.setSnap(ev.target.value);$('#tlZoom').oninput=ev=>tl.setZoom(+ev.target.value);$('#tlScroll').oninput=ev=>tl.setOff(+ev.target.value/100);
$('#tlEdit').onclick=()=>document.querySelector('#tabs [data-t=pat]').click();
$('#tlAdd').onclick=()=>{tl.stop();const ty=$('#tlKind').value,T=Parts.types[ty],b=P.box,ov={type:ty,t:Math.round(tl.time()*100)/100,x:Math.round(b.x+b.w/2),y:ty==='blaster'?Math.round(b.y-30):Math.round(b.y+4)};if(ty==='bone')ov.vy=60;
 const it=Parts.norm(ov);it.layer=lyOf({layer:curLy}).id;it.group='';if(ty==='bullet'){delete it.type;delete it.id;pat.bullets.push(it)}else{it.id=PM.uid();pat.parts.push(it)}sel.clear();sel.add(it);selB=it;selInfo();tl.refresh();tlForm()};
$('#tlDup').onclick=()=>{if(!sel.size){st('複製するパーツを選択してください');return}tl.stop();const gm={},ns=[];for(const q of sel){const n={...q,t:Math.round((q.t+.5)*100)/100};if(n.id)n.id=PM.uid();if(q.group){gm[q.group]=gm[q.group]||PM.uid();n.group=gm[q.group]}(n.type?pat.parts:pat.bullets).push(n);ns.push(n)}sel.clear();ns.forEach(n=>sel.add(n));selB=ns[0];selInfo();tl.refresh();tlForm()};
$('#tlDel').onclick=()=>{if(!sel.size)return;tl.stop();$('#pDel').click();tl.refresh();tlForm()};
// ---- Undo / Redo(編集内容のスナップショット方式。素材本体は参照で保持して軽量化) ----
const H={u:[],r:[],cur:null,max:100};let ht=0;
const hCap=()=>({s:JSON.stringify(P,(k,v)=>k==='assets'?undefined:v),a:(P.assets||[]).slice()}),hSame=(a,b)=>a.s===b.s&&a.a.length===b.a.length&&a.a.every((x,i)=>x===b.a[i]);
function hBtn(){$('#bUndo').disabled=!H.u.length;$('#bRedo').disabled=!H.r.length}
function hReset(){H.u=[];H.r=[];H.cur=hCap();hBtn()}
function hCheck(){clearTimeout(ht);if(drag||hd||(tl&&tl.busy()))return;if(!H.cur){hReset();return}const n=hCap();if(hSame(n,H.cur))return;H.u.push(H.cur);if(H.u.length>H.max)H.u.shift();H.r=[];H.cur=n;hBtn()}
function hRestore(h){tl&&tl.stop();const pid=pat&&pat.id,keep=[...sel].map(q=>{let i=pat.bullets.indexOf(q);if(i>=0)return['b',i];i=pat.parts.indexOf(q);return i>=0?['p',i]:null}).filter(Boolean);P=JSON.parse(h.s);P.assets=h.a.slice();Assets.P=P;pat=P.patterns.find(p=>p.id===pid)||P.patterns[0];selClr();
 if(pat.id===pid)keep.forEach(([k,i])=>{const q=(k==='b'?pat.bullets:pat.parts)[i];if(q)sel.add(q)});selB=[...sel][0]||null;selInfo();if(selB)toForm(selB);refreshCos();fillPat();enUI();
 if(!$('#as').hidden)asUI();if(!$('#gg').hidden)ggUI();if(!$('#so').hidden){soUI();soReset()}}
function undo(){tl&&tl.stop();hCheck();if(!H.u.length){st('これ以上戻せません');return}if(pv)stopPv();H.r.push(H.cur);H.cur=H.u.pop();hRestore(H.cur);hBtn();st('元に戻しました')}
function redo(){hCheck();if(!H.r.length){st('やり直せる操作がありません');return}if(pv)stopPv();H.u.push(H.cur);H.cur=H.r.pop();hRestore(H.cur);hBtn();st('やり直しました')}
const hSched=d=>{clearTimeout(ht);ht=setTimeout(hCheck,d)};
document.addEventListener('input',()=>hSched(600));['change','click','pointerup','drop'].forEach(v=>document.addEventListener(v,()=>hSched(30)));
$('#bUndo').onclick=undo;$('#bRedo').onclick=redo;
addEventListener('keydown',e=>{const tg=e.target,tx=tg&&/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)&&!/^(checkbox|radio|button|color)$/.test(tg.type||'');
 if((e.ctrlKey||e.metaKey)&&!tx){const k=e.key.toLowerCase();if(k==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if(k==='y'){e.preventDefault();redo()}}
 else if(!tx&&!$('#pat').hidden&&(e.key==='Delete'||e.key==='Backspace')&&sel.size){e.preventDefault();$('#pDel').click()}});
refreshCos();mvShow();fillPat();hReset();tlForm();
})();
