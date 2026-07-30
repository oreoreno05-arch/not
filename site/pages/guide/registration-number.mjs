import { articleSide, adSlot, faqBlock, toc } from '../../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const faq = faqBlock([
    {
      q: '個人事業主の登録番号は法人番号と同じですか？',
      a: '<p>異なります。法人は「T＋既存の法人番号13桁」ですが、個人事業主には新しく13桁の番号が付番されます。そのため個人の番号は、法人番号の検査数字のルールに当てはまらない場合があります。</p>',
    },
    {
      q: '取引先の登録番号は毎回確認すべきですか？',
      a: '<p>継続的な取引先については、定期的な確認で足りることが多いです。ただし登録が取り消された場合や新規取引の場合は、公表サイトで確認しておくと安心です。</p>',
    },
    {
      q: '請求書の登録番号が間違っていたら控除できませんか？',
      a: '<p>単なる誤記であっても、正しい適格請求書とは言えません。発行者に修正した請求書の交付を求めてください。受け取った側が勝手に修正することは認められていません。</p>',
    },
  ]);

  const items = [
    { id: 'what', label: '登録番号とは' },
    { id: 'format', label: '番号の形式と見分け方' },
    { id: 'check', label: '取引先の番号を確認する方法' },
    { id: 'apply', label: '登録申請の手順' },
    { id: 'faq', label: 'よくある質問' },
  ];

  const body = `
<section class="article">
  <div class="wrap article__grid">
    <article class="prose">
      <h1>インボイスの登録番号｜形式・確認方法・申請の手順</h1>
      <div class="article__meta"><span>公開日: 2026-07-22</span><span>更新日: 2026-07-31</span></div>
      <p class="lead">
        適格請求書に必ず書かなければならないのが登録番号です。「T」から始まる13桁というルールは知られていますが、
        法人と個人事業主で番号の成り立ちが違うこと、取引先の番号をどう確認するかは意外と知られていません。
        ここを押さえておくと、請求書の不備と修正依頼の往復を減らせます。
      </p>

      ${toc(items)}

      <h2 id="what">登録番号とは</h2>
      <p>
        登録番号は、税務署に申請して<strong>適格請求書発行事業者</strong>として登録を受けた事業者に交付される番号です。
        この番号を記載した請求書だけが適格請求書となり、受け取った側が仕入税額控除を受けられます。
        登録できるのは消費税の課税事業者のみで、免税事業者のままでは登録できません。
      </p>

      <h2 id="format">番号の形式と見分け方</h2>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>区分</th><th>形式</th><th>特徴</th></tr></thead>
          <tbody>
            <tr><th>法人</th><td>T ＋ 法人番号（13桁）</td><td>既存の法人番号がそのまま使われる</td></tr>
            <tr><th>個人事業主</th><td>T ＋ 13桁の数字</td><td>マイナンバーとは無関係の新しい番号</td></tr>
          </tbody>
        </table>
      </div>
      <div class="callout">
        <span class="callout__title">形式チェックができます</span>
        <p><a href="${base}/tax-calculator/">登録番号の形式チェッカー</a>で、桁数と法人番号の検査数字を確認できます。実在するかどうかは国税庁の公表サイトで確認してください。</p>
      </div>

      ${adSlot(site, 'inArticle')}

      <h2 id="check">取引先の番号を確認する方法</h2>
      <p>
        国税庁の<a href="https://www.invoice-kohyo.nta.go.jp/" target="_blank" rel="noopener">適格請求書発行事業者公表サイト</a>で、
        登録番号を入力すると、その番号が有効かどうかと登録された名称を確認できます。
      </p>
      <ol>
        <li>公表サイトを開く</li>
        <li>請求書に書かれた登録番号（T以下13桁）を入力する</li>
        <li>表示された名称が、請求書の発行者名と一致するか確認する</li>
      </ol>
      <div class="callout callout--warn">
        <span class="callout__title">名称の不一致に注意</span>
        <p>屋号で請求書が発行されている場合、公表サイトには本名が表示されることがあります。名称が違うだけで無効と判断せず、発行者に確認しましょう。</p>
      </div>

      <h2 id="apply">登録申請の手順</h2>
      <ol>
        <li>「適格請求書発行事業者の登録申請書」を作成する</li>
        <li>e-Tax（電子申請）または郵送で、納税地の所轄税務署に提出する</li>
        <li>審査を経て登録通知を受け取る（e-Taxのほうが早い傾向）</li>
        <li>受け取った登録番号を請求書のテンプレートに反映する</li>
      </ol>
      <p>
        課税売上高が5,000万円以下であれば、<strong>簡易課税制度</strong>も選択できます。
        適用を受けるには「消費税簡易課税制度選択届出書」を提出する必要があるため、登録申請とあわせて検討しましょう。
      </p>
      <p>
        登録後に必要になる請求書のフォーマットは、<a href="${base}/">当サイトの請求書メーカー</a>で用意できます。
        登録番号を一度入力すれば端末に保存され、次回以降は自動で反映されます。
      </p>

      <h2 id="faq">よくある質問</h2>
      ${faq.html}

      <div class="callout">
        <span class="callout__title">この記事について</span>
        <p>本記事は一般的な情報提供を目的とした解説です。申請手続の詳細や最新の取扱いは、国税庁の公式情報をご確認ください。</p>
      </div>

      <p style="text-align:center;margin-top:2rem">
        <a class="btn btn--primary btn--lg" href="${base}/">登録番号入りの請求書を作る →</a>
      </p>
      ${adSlot(site, 'footer')}
    </article>
    ${articleSide(site, '/guide/registration-number/')}
  </div>
</section>`;

  return {
    path: '/guide/registration-number/',
    collection: 'guide',
    tag: '基本',
    date: '2026-07-22',
    updated: '2026-07-31',
    linkTitle: '登録番号の形式・確認方法・申請手順',
    summary: 'T＋13桁の意味、取引先の番号の調べ方、申請の流れをまとめました。',
    title: 'インボイスの登録番号｜形式・確認方法・申請の手順',
    description:
      '適格請求書発行事業者の登録番号（T＋13桁）の形式、法人と個人事業主の違い、国税庁の公表サイトでの確認方法、登録申請の手順をわかりやすく解説します。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
      { name: '登録番号', path: '/guide/registration-number/' },
    ],
    jsonLd: [
      faq.jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'インボイスの登録番号｜形式・確認方法・申請の手順',
        datePublished: '2026-07-22',
        dateModified: '2026-07-31',
        author: { '@type': 'Organization', name: site.name },
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: site.baseUrl + '/guide/registration-number/',
        inLanguage: 'ja',
      },
    ],
    body,
  };
}
