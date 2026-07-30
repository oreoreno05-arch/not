import { articleSide, adSlot, faqBlock, toc } from '../../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const faq = faqBlock([
    {
      q: 'メールでPDFの請求書を受け取ったら、印刷して保存すればいいですか？',
      a: '<p>いいえ。電子取引で受け取ったデータは、電子データのまま保存する必要があります。紙に印刷したものだけを保存する方法は、原則として認められていません。</p>',
    },
    {
      q: '専用のシステムを買わないと対応できませんか？',
      a: '<p>必ずしも必要ありません。ファイル名に「日付_取引先_金額」を入れて規則的に保存し、事務処理規程を備え付ける方法でも要件を満たせます。</p>',
    },
    {
      q: '自分が発行した請求書の控えも保存が必要ですか？',
      a: '<p>必要です。適格請求書発行事業者は、交付した適格請求書の写しを保存する義務があります。PDFで発行した場合は、そのPDFを電子データとして保存します。</p>',
    },
  ]);

  const items = [
    { id: 'what', label: '電子取引のデータ保存とは' },
    { id: 'req', label: '満たすべき2つの要件' },
    { id: 'filename', label: 'ファイル名で対応する方法' },
    { id: 'invoice', label: 'インボイスとの関係' },
    { id: 'faq', label: 'よくある質問' },
  ];

  const body = `
<section class="article">
  <div class="wrap article__grid">
    <article class="prose">
      <h1>PDFの請求書はどう保存する？電子帳簿保存法の実務対応</h1>
      <div class="article__meta"><span>公開日: 2026-07-20</span><span>更新日: 2026-07-31</span></div>
      <p class="lead">
        請求書をPDFでやり取りするようになった今、避けて通れないのが電子帳簿保存法への対応です。
        「メールで受け取ったPDFを印刷して紙で保管」は原則として認められません。
        ただし高価なシステムがなくても、ファイル名の付け方と規程の備え付けで対応できます。
      </p>

      ${toc(items)}

      <h2 id="what">電子取引のデータ保存とは</h2>
      <p>
        メール添付・Webからのダウンロード・クラウドサービス経由など、
        <strong>電子的に授受した取引情報は、電子データのまま保存する</strong>ことが必要です。
        紙でやり取りした請求書はこれまでどおり紙で保存できますが、PDFで受け取ったものを印刷して紙だけ残す運用はできません。
      </p>

      <h2 id="req">満たすべき2つの要件</h2>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>要件</th><th>内容</th><th>実務での対応例</th></tr></thead>
          <tbody>
            <tr>
              <th>真実性の確保</th>
              <td>データが改ざんされていないこと</td>
              <td>訂正・削除の防止に関する事務処理規程を定めて運用する／タイムスタンプを付与する</td>
            </tr>
            <tr>
              <th>可視性の確保</th>
              <td>必要なときにすぐ検索・表示できること</td>
              <td>取引年月日・取引先・金額で検索できるようにする</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${adSlot(site, 'inArticle')}

      <h2 id="filename">ファイル名で対応する方法</h2>
      <p>
        専用システムを導入しなくても、ファイル名を規則的に付けることで検索要件を満たせます。
      </p>
      <div class="callout">
        <span class="callout__title">ファイル名の付け方の例</span>
        <p>
          <code>20260731_株式会社サンプル商事_330000.pdf</code><br>
          （取引年月日＿取引先名＿税込金額）
        </p>
      </div>
      <p>
        あわせて、年度ごと・月ごとのフォルダに整理し、「訂正削除の防止に関する事務処理規程」を作成して備え付けます。
        規程のひな形は国税庁のサイトで公開されています。
      </p>
      <ul>
        <li>フォルダ構成の例: <code>2026年度 / 07月 / 受領した請求書</code></li>
        <li>発行した請求書の控えも同じルールで保存する</li>
        <li>バックアップを別の場所にも取っておく</li>
      </ul>

      <h2 id="invoice">インボイスとの関係</h2>
      <p>
        PDFで交付した適格請求書は「電子インボイス」にあたります。
        インボイス制度上の保存義務と、電子帳簿保存法上の保存要件の<strong>両方</strong>を満たす必要があります。
      </p>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>制度</th><th>何を保存するか</th><th>期間</th></tr></thead>
          <tbody>
            <tr><th>インボイス制度</th><td>交付した適格請求書の写し／受領した適格請求書</td><td>原則7年間</td></tr>
            <tr><th>電子帳簿保存法</th><td>電子取引で授受したデータ（電子のまま）</td><td>同上</td></tr>
          </tbody>
        </table>
      </div>
      <div class="callout callout--ok">
        <span class="callout__title">当サイトで作成した請求書の場合</span>
        <p><a href="${base}/">請求書メーカー</a>で作成したPDFをメールで送付した場合、そのPDFが電子インボイスになります。送付したPDFを上記のルールで保存すれば、写しの保存義務も同時に果たせます。</p>
      </div>

      <h2 id="faq">よくある質問</h2>
      ${faq.html}

      <div class="callout">
        <span class="callout__title">この記事について</span>
        <p>本記事は一般的な情報提供を目的とした解説です。個別の判断は、国税庁の公式情報または税理士等の専門家にご確認ください。</p>
      </div>

      <p style="text-align:center;margin-top:2rem">
        <a class="btn btn--primary btn--lg" href="${base}/">PDFで保存できる請求書を作る →</a>
      </p>
      ${adSlot(site, 'footer')}
    </article>
    ${articleSide(site, '/guide/denshi-chobo/')}
  </div>
</section>`;

  return {
    path: '/guide/denshi-chobo/',
    collection: 'guide',
    tag: '実務',
    date: '2026-07-20',
    updated: '2026-07-31',
    linkTitle: 'PDF請求書の保存｜電子帳簿保存法の実務',
    summary: 'メールで受け取ったPDFは印刷保存では不可。お金をかけずに要件を満たす方法を解説。',
    title: 'PDFの請求書はどう保存する？電子帳簿保存法の実務対応',
    description:
      'メールで受け取ったPDFの請求書は電子データのまま保存が必要です。真実性・可視性の2要件を、専用システムなしでファイル名と事務処理規程で満たす方法を解説します。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
      { name: '電子帳簿保存法', path: '/guide/denshi-chobo/' },
    ],
    jsonLd: [
      faq.jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'PDFの請求書はどう保存する？電子帳簿保存法の実務対応',
        datePublished: '2026-07-20',
        dateModified: '2026-07-31',
        author: { '@type': 'Organization', name: site.name },
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: site.baseUrl + '/guide/denshi-chobo/',
        inLanguage: 'ja',
      },
    ],
    body,
  };
}
