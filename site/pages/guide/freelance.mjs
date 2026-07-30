import { articleSide, adSlot, faqBlock, toc } from '../../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const faq = faqBlock([
    {
      q: '登録しないと仕事がなくなりますか？',
      a: '<p>取引先が課税事業者中心の場合、買い手の負担が増えるため交渉になる可能性はあります。ただし登録していないことだけを理由に一方的に取引を打ち切ったり報酬を減額したりすることは、独占禁止法や下請法上の問題となるおそれがあります。まずは影響額を共有して話し合いましょう。</p>',
    },
    {
      q: '消費者向けの仕事しかしていない場合は？',
      a: '<p>個人のお客様は仕入税額控除を行わないため、インボイスを求められる場面はほとんどありません。登録の必要性は低いと考えられます。</p>',
    },
    {
      q: '源泉徴収と消費税、どちらを先に計算しますか？',
      a: '<p>報酬額に消費税を加えて請求し、源泉徴収税額を差し引いて振り込まれるのが一般的です。請求書で消費税額を明確に区分していれば、税抜金額を源泉徴収の対象にできます。</p>',
    },
    {
      q: '登録したら請求書の書き方は変わりますか？',
      a: '<p>登録番号の記載と、税率ごとの対価・消費税額の記載が必要になります。<a href="' + base + '/">当サイトの請求書メーカー</a>なら、登録番号を一度入力しておくだけで以降は自動で反映されます。</p>',
    },
  ]);

  const items = [
    { id: 'judge', label: 'まず「登録すべきか」を判断する' },
    { id: 'money', label: '手取りはいくら変わるのか' },
    { id: 'notregister', label: '登録しない場合にできること' },
    { id: 'howto', label: '請求書に書くべきこと' },
    { id: 'withholding', label: '源泉徴収がある場合の書き方' },
    { id: 'faq', label: 'よくある質問' },
  ];

  const body = `
<section class="article">
  <div class="wrap article__grid">
    <article class="prose">
      <h1>フリーランスのインボイス対応｜登録すべきか、請求書はどう書くか</h1>
      <div class="article__meta"><span>公開日: 2026-07-24</span><span>更新日: 2026-07-31</span></div>
      <p class="lead">
        インボイス制度でいちばん悩ましいのは、「そもそも登録すべきなのか」という判断です。
        答えは取引先の構成によって変わります。この記事では判断の軸を示したうえで、
        登録した場合・しない場合それぞれの請求書の書き方まで具体的に説明します。
      </p>

      ${toc(items)}

      <h2 id="judge">まず「登録すべきか」を判断する</h2>
      <p>判断の軸はシンプルで、<strong>取引先が仕入税額控除を必要としているか</strong>の一点です。</p>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>あなたの取引先</th><th>登録の必要性</th><th>理由</th></tr></thead>
          <tbody>
            <tr><td>企業（課税事業者）が中心</td><td><strong>高い</strong></td><td>取引先が控除できず負担が増えるため、登録を求められやすい</td></tr>
            <tr><td>一般消費者が中心</td><td>低い</td><td>消費者は仕入税額控除を行わない</td></tr>
            <tr><td>免税事業者・簡易課税の事業者が中心</td><td>低い</td><td>取引先が適格請求書を必要としない</td></tr>
            <tr><td>混在している</td><td>要検討</td><td>課税事業者向けの売上比率で判断する</td></tr>
          </tbody>
        </table>
      </div>

      <div class="callout callout--warn">
        <span class="callout__title">2026年10月からは判断材料が変わります</span>
        <p>買い手が控除できる割合が80%から70%に下がるため、免税事業者と取引する側の負担はこれまでより大きくなります。詳しくは<a href="${base}/guide/2026-10-change/">2026年10月の変更点</a>をご覧ください。</p>
      </div>

      ${adSlot(site, 'inArticle')}

      <h2 id="money">手取りはいくら変わるのか</h2>
      <p>
        年間の売上が税込550万円（税抜500万円）のフリーランスが登録した場合の目安です。
      </p>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>ケース</th><th class="num">納める消費税</th><th>備考</th></tr></thead>
          <tbody>
            <tr><td>免税事業者のまま</td><td class="num">0円</td><td>受け取った消費税は手元に残る</td></tr>
            <tr><td>登録＋2割特例（2026年9月まで）</td><td class="num">100,000円</td><td>売上税額50万円 × 20%</td></tr>
            <tr class="is-now"><td>登録＋3割特例（個人・2026年10月〜）</td><td class="num">150,000円</td><td>売上税額50万円 × 30%</td></tr>
            <tr><td>登録＋簡易課税（第5種）</td><td class="num">250,000円</td><td>売上税額50万円 × (1 − 50%)</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        サービス業（第5種）のフリーランスの場合、3割特例のほうが簡易課税より有利になるケースが多くなります。
        ただし業種区分によって結果は変わるため、自分のみなし仕入率を確認してください。
      </p>

      <h2 id="notregister">登録しない場合にできること</h2>
      <p>
        免税事業者のままでいる選択も、もちろん有効です。その場合でも、取引先の事務負担を減らす配慮をしておくと関係を保ちやすくなります。
      </p>
      <ul>
        <li>請求書に<strong>取引内容と税率区分を明記</strong>する（登録番号がなくても書ける）</li>
        <li>免税事業者である旨を事前に伝えておく</li>
        <li>取引先が経過措置を適用できるよう、請求書を確実に保存・交付する</li>
      </ul>
      <p>
        経過措置により、2026年10月以降も買い手は70%まで控除できます。「まったく控除できない」わけではない点は、
        交渉のときに共有しておくとよいでしょう。
      </p>

      <h2 id="howto">請求書に書くべきこと</h2>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>項目</th><th>登録した場合</th><th>登録しない場合</th></tr></thead>
          <tbody>
            <tr><th>登録番号</th><td>必須（T＋13桁）</td><td>記載しない</td></tr>
            <tr><th>取引年月日</th><td>必要</td><td>記載が望ましい</td></tr>
            <tr><th>取引内容</th><td>必要</td><td>記載が望ましい</td></tr>
            <tr><th>税率ごとの対価と適用税率</th><td>必須</td><td>記載が望ましい</td></tr>
            <tr><th>税率ごとの消費税額</th><td>必須</td><td>記載してもよい</td></tr>
            <tr><th>宛名</th><td>必須</td><td>記載が望ましい</td></tr>
          </tbody>
        </table>
      </div>

      ${adSlot(site, 'inArticle')}

      <h2 id="withholding">源泉徴収がある場合の書き方</h2>
      <p>
        デザイン料・原稿料・講演料・翻訳料などは源泉徴収の対象です。税率は支払金額100万円以下の部分が
        <strong>10.21%</strong>、100万円を超える部分が<strong>20.42%</strong>です。
      </p>
      <div class="callout">
        <span class="callout__title">請求書の書き方の例（税抜30万円のデザイン料）</span>
        <p>
          小計 300,000円<br>
          消費税(10%) 30,000円<br>
          合計 330,000円<br>
          源泉徴収税額 −30,630円<br>
          <strong>お支払金額 299,370円</strong>
        </p>
      </div>
      <p>
        請求書で消費税額を明確に区分している場合、源泉徴収の対象は税抜金額（300,000円）としてよいことになっています。
        税込金額を対象にすると源泉徴収額が増え、手取りが一時的に減るため、区分表示しておくのがおすすめです。
      </p>
      <p>
        <a href="${base}/">請求書メーカー</a>では「源泉徴収税額を差し引く」にチェックを入れるだけで、
        この計算と表示を自動で行います。金額だけ確認したい場合は<a href="${base}/tax-calculator/">計算機</a>もどうぞ。
      </p>

      <h2 id="faq">よくある質問</h2>
      ${faq.html}

      <div class="callout">
        <span class="callout__title">この記事について</span>
        <p>本記事は一般的な情報提供を目的とした解説であり、税務相談ではありません。金額の試算は概算です。個別の判断は税理士等の専門家にご相談ください。</p>
      </div>

      <p style="text-align:center;margin-top:2rem">
        <a class="btn btn--primary btn--lg" href="${base}/">源泉徴収に対応した請求書を作る →</a>
      </p>
      ${adSlot(site, 'footer')}
    </article>
    ${articleSide(site, '/guide/freelance/')}
  </div>
</section>`;

  return {
    path: '/guide/freelance/',
    collection: 'guide',
    tag: 'フリーランス',
    date: '2026-07-24',
    updated: '2026-07-31',
    linkTitle: 'フリーランスは登録すべき？判断と請求書の書き方',
    summary: '取引先の構成から登録の要否を判断。手取りの変化と源泉徴収の書き方まで解説します。',
    title: 'フリーランスのインボイス対応｜登録すべきか、請求書はどう書くか',
    description:
      'フリーランス・個人事業主がインボイス登録すべきかを取引先の構成から判断する方法、登録した場合の手取りの変化、源泉徴収がある場合の請求書の書き方を具体例で解説します。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
      { name: 'フリーランスのインボイス対応', path: '/guide/freelance/' },
    ],
    jsonLd: [
      faq.jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'フリーランスのインボイス対応｜登録すべきか、請求書はどう書くか',
        datePublished: '2026-07-24',
        dateModified: '2026-07-31',
        author: { '@type': 'Organization', name: site.name },
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: site.baseUrl + '/guide/freelance/',
        inLanguage: 'ja',
      },
    ],
    body,
  };
}
