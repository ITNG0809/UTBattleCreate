/* Export System: 単独HTML出力(必要なJSをfetchして埋め込む。file://では不可) */
(function(g){
const FILES=['js/assets.js','js/gauge.js','js/parts.js','js/souls.js','js/project.js','js/engine.js'];
g.Exporter={async html(p){const src=await Promise.all(FILES.map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.text()})));
 const j=JSON.stringify(p).replace(/</g,'\\u003c');
 return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.meta.name}</title><body style="margin:0;background:#000;display:grid;place-items:center;height:100vh"><canvas id="c" width="${p.meta.w}" height="${p.meta.h}" style="max-width:100%;touch-action:none"></canvas>`+
  src.map(s=>'<script>'+s.replace(/<\/script/g,'<\\/script')+'<\/script>').join('')+`<script>new Battle(document.getElementById('c'),PM.validate(${j}))<\/script>`},
 download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)}};})(window);
