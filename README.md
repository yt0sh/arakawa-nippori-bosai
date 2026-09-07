# 荒川区・日暮里 防災ダッシュボード

荒川区・日暮里周辺の公式防災情報を一画面に集約するダッシュボードです。既存のGoogle Sitesを入口として、Vercel上の本アプリを埋め込んで利用する想定です。

## v0.6

- 気象庁の荒川区中心の警報地図へ直接リンク
- 荒川区の警戒レベル3・4・5を個別判定し、「対象地区なし」と取得不能を区別
- 避難情報・避難所・交通ライフラインを別APIに分離
- 岩淵水門（上）の現在水位、10分・1時間変化、6時間・24時間推移を表示
- 西日暮里周辺5施設の水害時避難場所を表示
- 交通・ライフラインは「区の掲載情報」と事業者公式リンクを統合表示
- JR東日本は関東エリア運行情報へ直接リンク
- 公開Xリスト `2096589731018727819` を埋め込み
- 取得失敗を正常状態として表示しない fail-safe 設計

## 構成

```text
public/                 フロントエンド
api/                    Vercel Functions
lib/                    取得・判定ロジック
scripts/check-live.mjs  デプロイ後の疎通検査
tests/                  自動テスト
vercel.json             Vercel設定
```

Node.js 20以上。依存パッケージはありません。

```sh
npm test
npm run check
```

## Vercel

既存Vercelプロジェクト `ss-4769/arakawa-nippori-bosai` にこのGitHubリポジトリを接続し、`main` をProduction Branchとして利用します。Framework PresetはOther、Build Commandは空、Output Directoryは `public` です。

デプロイ後は以下でAPIを検査します。

```sh
node scripts/check-live.mjs https://<deployment-url>
```

## 注意

このサイトは公式情報の再表示・集約を目的とした補助サイトです。避難判断は必ず荒川区・気象庁・国土交通省などの公式発表で最終確認してください。取得元HTMLの変更や通信障害が起こり得るため、取得不能を「異常なし」と扱わない設計にしています。
