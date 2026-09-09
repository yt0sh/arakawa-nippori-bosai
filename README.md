# 荒川区・日暮里 防災ダッシュボード

荒川区・日暮里周辺の公式防災情報を集約する補助サイトです。既存Google Sitesを入口とし、Vercel上のWebアプリを埋め込む構成です。

## v0.7（2026-09-09）

岩淵水門（上）の水位カードを改善しました。平常＝青、水防団待機＝緑、氾濫注意＝黄、避難判断＝赤、氾濫危険＝紫のパステル調で表示します。グラフは縦軸0〜8m固定、横軸12時間／5日間切替です。8m超の観測値はグラフ上端で示し、実測値は変更しません。観測欠損を補完せず、11分超の空白では線を切ります。

国土交通省の岩淵水門（上）ライブカメラをJPEG画像としてカード内に表示します。画像は約1分間隔で更新されますが、撮影時刻は確認できないため、取得時刻と区別します。取得失敗時は原典リンクへ誘導します。

避難場所5施設は、荒川区公式ページと同じJSONフィードを直接取得します。施設コード・名称・住所を照合し、閉鎖中／準備中／開設中／混雑／満員を区別します。対応できない状態、欠落、重複、取得失敗を勝手に閉鎖中や正常とみなしません。データ全体の更新時刻と各施設の更新時刻を表示します。

v0.6の交通・ライフラインのリンク統合、JR東日本の関東運行情報、避難情報の独立取得、雨雲、公式Xリストなどは維持しています。

## 構成とデプロイ

`public/` はv0.6の元ソースとv0.7の追加画面部品です。`scripts/build-v07.mjs` が元ソースのGit blob SHAを確認し、変更箇所を適用して `dist/` を生成します。元のapp.jsを変更した場合は、変換処理を明示的に見直してください。

`api/` はVercel Functions、`lib/` は取得・判定ロジック、`tests/` は回帰テストです。Node.js 20以上、追加npm依存なしです。

```sh
npm test
npm run check
npm run build
```

既存Vercelプロジェクト `ss-4769/arakawa-nippori-bosai` にGitHubリポジトリを接続済みです。Production Branchは `main`、Framework PresetはOther、Build Commandは `npm run build`、Output Directoryは `dist` です。`vercel.json` に設定しています。通常は検証ブランチを作成し、プレビューで実データ・画面・回帰テストを確認してからmainへ反映します。ローカルPCでのデプロイ操作は不要です。

## 公式データソース

- 水位：`https://www1.river.go.jp/cgi-bin/DspWaterData.exe?ID=303041283309040&KIND=9`
- 観測所情報：`https://www1.river.go.jp/cgi-bin/SiteInfoDetail.exe?ID=303041283309040`
- カメラ原典：`https://www.ktr.mlit.go.jp/arage/arage00563.html`
- カメラJPEG：`https://www.ktr.mlit.go.jp/arage/live-camera/iwabuchikami.jpg`
- 避難所一覧：`https://bosai.city.arakawa.tokyo.jp/hinan/hinanjyo-ichiran.html`
- 避難所JSON：`https://bosai.city.arakawa.tokyo.jp/apps/get_json.php?file=renkei_1_hinanzyo.js`
- 避難情報：`https://bosai.city.arakawa.tokyo.jp/hinan/hinan-siji.html`
- 交通・ライフライン：`https://bosai.city.arakawa.tokyo.jp/koukyou/koukyou-jouhou.html`

避難所JSONの実データは2026-09-09に62施設・対象5施設すべて閉鎖中を確認しました。区データ更新時刻は2026/09/07 08:34、各施設の記録更新日は2025/12/12でした。これらは検査時点の事実であり、固定の状態として埋め込んでいません。

水位の10分値は公式ページから取得します。固定DAT URLが継続更新されることは未確認のため、現在値の取得元にはしていません。5日間表示は取得元から必要な履歴が得られる場合に表示し、不足時は観測範囲と欠損を明示します。永続的な履歴保存は未実装です。

## 検証と制約

2026-09-09のv0.7検証では、GitHub Actionsの単体テスト・構文チェック・実API検査が成功しました。水位1069件・178時間分、カメラJPEG、避難所5件、避難情報、交通・ライフラインを確認しています。画面は1280pxと390pxで、12時間／5日間切替、避難所表示、カメラ画像、横スクロールなしをモックデータで確認しました。最新の実データはサイトで確認してください。

気象庁の警報コード体系の変更、上流HTMLの構造変更、通信障害などで情報取得に失敗する可能性があります。指定河川洪水予報の自動判定は未実装です。区の掲載情報なしは運行・供給が正常であることを保証しません。水位の基準到達と避難情報の発令を混同しないでください。避難判断は必ず荒川区・気象庁・国土交通省の公式発表で最終確認してください。

Google Sitesの埋め込み更新は、Vercel本番の動作確認後に行ってください。
