# インボイス請求書メーカー

インボイス制度（適格請求書等保存方式）に対応した請求書・見積書・納品書・領収書を、
**会員登録なし・完全無料**で作成できる静的サイトです。広告収益で運営することを想定しています。

- 公開URL: https://oreoreno05-arch.github.io/not/
- 収益化の手順: [MONETIZATION.md](./MONETIZATION.md)

---

## 特徴

### 利用者にとって

| 機能 | 内容 |
|---|---|
| 適格請求書の6要件チェック | 入力しながら記載事項の充足状況をリアルタイム表示 |
| 正しい端数処理 | **1つの請求書につき税率ごとに1回**（明細ごとの積み上げは不可） |
| 軽減税率8%の自動区分 | 8%対象に「※」を自動付与し、税率ごとに集計 |
| 源泉徴収の自動計算 | 100万円以下 10.21% / 超過分 20.42% |
| 登録番号の形式チェック | T+13桁の検証（法人番号の検査数字も照合） |
| PDF保存 | ブラウザの印刷機能でA4のPDFに出力 |
| データを預からない | 計算も描画も全てブラウザ内。サーバー送信は一切なし |

### 運営者にとって

- **依存パッケージゼロ**。Node.js 標準機能だけでビルドできる
- 広告・アフィリエイトは `site/data/site.json` の書き換えだけで有効化
- 記事ファイルを追加するだけで、一覧・サイドバー・sitemap・構造化データに自動反映
- push すると GitHub Actions がテスト → 検証 → デプロイまで自動実行

---

## 使い方

```bash
npm run build     # dist/ に静的サイトを生成
npm run dev       # ビルドしてローカルサーバーを起動（http://localhost:4173/not/）
npm test          # 計算ロジックのテスト（36件）
npm run verify    # テスト + 生成物の検証 + ブラウザ相当のE2E（全70件）
```

外部パッケージのインストールは不要です（E2Eのみ任意で `jsdom` を使用）。

---

## ディレクトリ構成

```
site/
├── data/site.json        # サイト設定・収益化の設定（ここを触れば大体足りる）
├── layouts/
│   ├── base.mjs          # 共通HTML・SEOメタ・構造化データ・広告タグ
│   └── parts.mjs         # エディタ・サイドバー・FAQ などの共通パーツ
├── pages/                # 1ファイル = 1ページ
│   ├── index.mjs         # 請求書メーカー（トップ）
│   ├── estimate.mjs      # 見積書
│   ├── delivery-note.mjs # 納品書
│   ├── receipt.mjs       # 領収書
│   ├── tax-calculator.mjs# 消費税・源泉徴収税の計算機
│   └── guide/            # 解説記事（ここに追加すると自動で一覧に載る）
└── assets/
    ├── css/style.css     # 画面用 + 印刷用（A4）のスタイル
    └── js/
        ├── invoice-core.js  # 計算コア（テスト対象）
        ├── editor.js        # 帳票エディタのUI
        └── calculator.js    # 計算機ページ

scripts/
├── build.mjs   # 静的サイトジェネレーター
├── test.mjs    # 計算ロジックのテスト
├── check.mjs   # リンク切れ・SEOメタ・JSON-LD の検証
├── e2e.mjs     # jsdom で実際に操作して検証
└── serve.mjs   # 開発用サーバー
```

---

## 記事を追加する

`site/pages/guide/` に `.mjs` を1つ置くだけです。

```js
import { articleSide, adSlot, faqBlock, toc } from '../../layouts/parts.mjs';

export default function (site) {
  return {
    path: '/guide/your-slug/',
    collection: 'guide',        // ← これで記事として扱われる
    tag: '実務',
    date: '2026-08-01',
    updated: '2026-08-01',
    linkTitle: '一覧に出す短いタイトル',
    summary: '一覧に出す要約',
    title: '<title> と h1 に使うタイトル',
    description: 'meta description（50〜160字）',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
      { name: 'この記事', path: '/guide/your-slug/' },
    ],
    body: `...HTML...`,
  };
}
```

一覧ページ・サイドバーの関連記事・`sitemap.xml`・パンくずの構造化データには自動で載ります。

---

## 品質の担保

| 検証 | 内容 | 件数 |
|---|---|---|
| `npm test` | 計算ロジック。**国税庁Q&A問57の設例と一致することを確認** | 36 |
| `node scripts/check.mjs` | 内部リンク切れ、title/description、canonical、h1、JSON-LDの妥当性 | 17ページ |
| `node scripts/e2e.mjs` | jsdomで実操作。計算・プレビュー・保存・**XSS対策**まで確認 | 34 |

これらは GitHub Actions でも push のたびに実行され、失敗するとデプロイされません。

---

## デプロイ

`main` への push で GitHub Actions が自動デプロイします。
初回のみ、リポジトリの **Settings → Pages → Source** を **GitHub Actions** に設定してください。

---

## 免責

本サイトの内容は一般的な情報提供を目的としたものであり、税務相談ではありません。
掲載情報は2026年7月時点の公表内容（令和8年度税制改正を含む）に基づいています。
個別の判断は、国税庁の公式情報または税理士等の専門家にご確認ください。

## ライセンス

MIT
