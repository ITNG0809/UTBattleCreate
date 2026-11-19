# 設計メモ
- 単一の真実: `project JSON`(format:utbc, version:1)。meta / box / player / items / patterns[bullets] / enemies[acts,patterns]
- js/project.js = Project Manager(既定値・検証・保存) / js/engine.js = Battle+Soul+Bullet / js/editor.js = UI Editor / js/export.js = Export
- 拡張予定: animation.js, audio.js, nodes.js(ノード→patternへコンパイル), code.js(Worker+sandbox iframeで隔離実行), timeline.js(bullets.tを編集)
- 3方式の弾幕は全て `pattern.bullets` へ書き込む/から生成する(ノード・コードは生成器として追加)
- 課題: ZIP出力はJSZip(無料)導入、コード隔離はWorker、音声はWeb Audio API、フォントはFontFace API

## 段階的拡張ロードマップ(未実装一覧タブと同期)
- 段階1 ✅ Undo/Redo(editor.js: スナップショット方式、素材は参照保持) / レイヤー(pattern.layers, 各パーツの layer) / グループ(各パーツの group)
- 段階2 ✅ 移動方式 mv(line/sine/circle/bezier/home)。parts.js の motion() が位置と進行方向を返す。追尾は弾ごとの実行時状態(WeakMap)を時間積分し、Parts.target(現在のSOUL位置)を狙う
- 段階3 ✅ タイムライン式(js/timeline.js)。配置式と同じデータ・選択(editor.jsのselを共有)を編集するだけでデータ形式の変更なし。バー=出現t〜寿命(ブラスターは待機+照射)
- 段階3(済) / 段階4 ノード式・コードエディタ / 段階5 アニメーション・同期
- 段階6 枠・フォントエディタ / 段階7 音声エディタ / 段階8 複数バトル・敵連携・ZIP出力
- データ形式: pattern.layers[{id,name,hide,lock}] とパーツの layer/group は旧データに無くても validate で補完(後方互換)

## UI方針
- 全タブを1画面に収める(body=100dvh固定、main内で各タブをflex/gridで配置)。ステージ幅は min(52vw, (100dvh-190px)*16/9, 720px)。入力欄は .grid(auto-fill 104px)で複数列、配置式は .subtabs/.pg で小タブ化。
