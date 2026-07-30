import { articleSide, adSlot, faqBlock, toc } from '../../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const faq = faqBlock([
    {
      q: '切り捨てと切り上げ、どちらを選ぶべきですか？',
      a: '<p>どちらでも構いません。事業者が任意に選べます。ただし1つの請求書の中では方法を統一する必要があります。売り手側は切り捨てを選ぶと請求額がわずかに小さくなり、取引先にとって親切な印象になります。</p>',
    },
    {
      q: '自分で計算した税額と請求書の税額が1円違います。どうすればいいですか？',
      a: '<p>仕入税額控除を行う際は、原則として請求書に記載された消費税額を使います。会計ソフトの自動計算と1円ずれる場合は、手入力で請求書の金額に合わせてください。</p>',
    },
    {
      q: '納品書ごとに消費税額を書いてもいいですか？',
      a: '<p>納品書に「税率ごとに区分した消費税額等」を記載する形にすれば、納品書ごとに1回ずつ端数処理を行うことになります。この場合は請求書側に消費税額を書かず、納品書と請求書を合わせて適格請求書とします。</p>',
    },
  ]);

  const items = [
    { id: 'rule', label: '原則は「1請求書につき税率ごとに1回」' },
    { id: 'ng', label: '認められない計算方法' },
    { id: 'example', label: '国税庁の設例で確認する' },
    { id: 'diff', label: '積み上げ計算との差が出るケース' },
    { id: 'multi', label: '納品書と請求書に分ける場合' },
    { id: 'faq', label: 'よくある質問' },
  ];

  const body = `
<section class="article">
  <div class="wrap article__grid">
    <article class="prose">
      <h1>インボイスの端数処理｜「税率ごとに1回」のルールを計算例で理解する</h1>
      <div class="article__meta"><span>公開日: 2026-07-26</span><span>更新日: 2026-07-31</span></div>
      <p class="lead">
        インボイス制度で新しく明確化されたルールのなかで、実務上いちばんミスが起きやすいのが<strong>消費税の端数処理</strong>です。
        「明細ごとに消費税を計算して合計する」という、これまで多くの現場で使われてきた方法は認められていません。
        なぜダメなのか、どう計算するのが正しいのかを、具体的な数字で確認します。
      </p>

      ${toc(items)}

      <h2 id="rule">原則は「1請求書につき税率ごとに1回」</h2>
      <p>
        適格請求書に記載する消費税額の1円未満の端数処理は、
        <strong>1つの適格請求書につき、税率ごとに1回だけ</strong>行います。
        切り捨て・切り上げ・四捨五入のどれを選ぶかは事業者の任意ですが、1枚の請求書のなかでは統一する必要があります。
      </p>
      <div class="callout">
        <span class="callout__title">正しい手順</span>
        <p>① 税率ごとに対価の額を合計する → ② その合計額に税率を掛ける → ③ 出てきた端数を1回だけ処理する</p>
      </div>

      <h2 id="ng">認められない計算方法</h2>
      <p>
        次の方法は、適格請求書の要件としては認められません。
      </p>
      <ul>
        <li><strong>明細ごとに消費税額を計算し、端数処理してから合計する</strong>（積み上げ計算）</li>
        <li>1枚の請求書のなかで、切り捨てと四捨五入を混在させる</li>
        <li>税率を区分せず、全体の合計額に対して1回だけ計算する</li>
      </ul>
      <p>
        明細ごとの端数処理を認めると、同じ取引でも売り手と買い手で消費税額が食い違ってしまうため、
        1枚あたり税率ごとに1回というルールに統一されています。
      </p>

      ${adSlot(site, 'inArticle')}

      <h2 id="example">国税庁の設例で確認する</h2>
      <p>税込金額で 10%対象 60,000円、8%対象 40,000円の請求書を作る場合を考えます。</p>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>税率区分</th><th>計算式</th><th class="num">消費税額</th></tr></thead>
          <tbody>
            <tr><td>10%対象</td><td>60,000円 × 10 ÷ 110 = 5,454.54…</td><td class="num">5,454円</td></tr>
            <tr><td>8%対象</td><td>40,000円 × 8 ÷ 108 = 2,962.96…</td><td class="num">2,962円</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        このように、税率区分ごとに1回ずつ端数処理を行います（切り捨ての場合）。
        商品ごとに端数処理を行うことは認められません。
      </p>

      <h2 id="diff">積み上げ計算との差が出るケース</h2>
      <p>税抜1,115円の品目が3行ある請求書（すべて10%対象）で比べてみます。</p>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>計算方法</th><th>計算過程</th><th class="num">消費税額</th><th>判定</th></tr></thead>
          <tbody>
            <tr class="is-now">
              <td>税率ごとに1回（正）</td>
              <td>(1,115 × 3) × 10% = 334.5 → 切り捨て</td>
              <td class="num">334円</td>
              <td>◯</td>
            </tr>
            <tr>
              <td>明細ごとの積み上げ（誤）</td>
              <td>111.5 → 111円 を 3行分合計</td>
              <td class="num">333円</td>
              <td>×</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        たった1円ですが、こうしたズレが積み重なると、買い手側の帳簿と請求書が合わなくなります。
        <a href="${base}/">当サイトの請求書メーカー</a>は、この「税率ごとに1回」のルールで自動計算しているため、
        意識しなくても正しい税額が表示されます。
      </p>

      <h2 id="multi">納品書と請求書に分ける場合</h2>
      <p>
        納品の都度、納品書を交付している場合は、納品書側に「税率ごとに区分した消費税額等」を記載する方法もあります。
        この場合は<strong>納品書ごとに税率ごとに1回</strong>の端数処理を行い、請求書には登録番号などを記載して、
        両方を合わせて適格請求書の記載事項を満たす形にします。
      </p>
      <div class="callout callout--warn">
        <span class="callout__title">両方に消費税額を書かない</span>
        <p>納品書と請求書の両方に消費税額を記載すると、どちらが正しいのか分からなくなります。どちらか一方に統一しましょう。</p>
      </div>

      <h2 id="faq">よくある質問</h2>
      ${faq.html}

      <div class="callout">
        <span class="callout__title">この記事について</span>
        <p>本記事は一般的な情報提供を目的とした解説です。個別の判断は、国税庁の公式情報または税理士等の専門家にご確認ください。</p>
      </div>

      <p style="text-align:center;margin-top:2rem">
        <a class="btn btn--primary btn--lg" href="${base}/">端数処理を自動化した請求書を作る →</a>
      </p>
      ${adSlot(site, 'footer')}
    </article>
    ${articleSide(site, '/guide/rounding/')}
  </div>
</section>`;

  return {
    path: '/guide/rounding/',
    collection: 'guide',
    tag: '実務',
    date: '2026-07-26',
    updated: '2026-07-31',
    linkTitle: '消費税の端数処理｜税率ごとに1回のルール',
    summary: '明細ごとの積み上げ計算はNG。正しい計算手順を具体的な数字で確認します。',
    title: 'インボイスの端数処理｜「税率ごとに1回」のルールを計算例で解説',
    description:
      '適格請求書の消費税の端数処理は、1つの請求書につき税率ごとに1回だけ。明細ごとの積み上げ計算が認められない理由と、正しい計算手順を具体的な数字で解説します。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
      { name: '消費税の端数処理', path: '/guide/rounding/' },
    ],
    jsonLd: [
      faq.jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'インボイスの端数処理｜「税率ごとに1回」のルールを計算例で解説',
        datePublished: '2026-07-26',
        dateModified: '2026-07-31',
        author: { '@type': 'Organization', name: site.name },
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: site.baseUrl + '/guide/rounding/',
        inLanguage: 'ja',
      },
    ],
    body,
  };
}
