import { editorMarkup, editorScripts, faqBlock, adSlot, esc } from '../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';
  const doc = {
    key: 'invoice',
    title: '請求書',
    numberLabel: '請求書番号',
    numberPrefix: 'INV',
    dateLabel: '請求日',
    showDueDate: true,
    showBank: true,
    showTotalBox: true,
    totalBoxLabel: 'ご請求金額',
  };

  const faq = faqBlock([
    {
      q: '本当に無料ですか？会員登録は必要ですか？',
      a: '<p>完全無料で、会員登録もメールアドレスの入力も不要です。作成枚数の制限もありません。運営費は広告でまかなっています。</p>',
    },
    {
      q: '入力した取引先の情報は送信されますか？',
      a: '<p>いいえ。計算も書類の組み立てもすべてお使いのブラウザの中で行われ、入力内容がサーバーに送信されることはありません。データは端末内（localStorage）にのみ保存されます。</p>',
    },
    {
      q: 'PDFで保存するにはどうすればいいですか？',
      a: '<p>「PDF保存・印刷」ボタンを押し、印刷ダイアログの送信先で「PDFに保存」を選んでください。Windows は「Microsoft Print to PDF」、Mac は左下の「PDF」メニューから保存できます。</p>',
    },
    {
      q: '消費税の端数はどのように計算されますか？',
      a: '<p>適格請求書のルールに従い、<strong>1つの請求書につき税率ごとに1回だけ</strong>端数処理を行います。明細ごとに端数処理を行って合算する方法は認められていないため、本ツールでは採用していません。切り捨て・切り上げ・四捨五入は選択できます。</p>',
    },
    {
      q: '登録番号がなくても請求書は作れますか？',
      a: '<p>作れます。免税事業者の方は登録番号欄を空欄のままご利用ください。ただしその請求書は適格請求書には該当せず、取引先は原則として仕入税額控除ができません（2026年10月からは経過措置により70%まで控除可能です）。</p>',
    },
    {
      q: '軽減税率（8%）の商品が混ざっていても大丈夫ですか？',
      a: '<p>はい。明細ごとに税率を選ぶだけで、8%対象の品目に自動で「※」が付き、「※は軽減税率対象」の凡例と税率ごとの集計欄が表示されます。</p>',
    },
  ]);

  const jsonLd = [
    faq.jsonLd,
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: site.name,
      url: site.baseUrl + '/',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: site.description,
      inLanguage: 'ja',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      featureList: [
        '適格請求書（インボイス）の記載事項に対応',
        '税率ごとに1回の端数処理',
        '軽減税率8%の自動区分',
        '源泉徴収税額の自動計算',
        'PDF保存・印刷',
        '会員登録不要・データは端末内で処理',
      ],
    },
  ];

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>インボイス制度対応の請求書を<br>無料で作成・PDF保存</h1>
    <p class="hero__lead">
      登録番号・税率ごとの端数処理・軽減税率の区分まで自動対応。会員登録もインストールも不要、
      入力した内容はサーバーに送信されません。フリーランス・個人事業主・小規模法人のための請求書メーカーです。
    </p>
    <div class="hero__badges">
      <span class="badge badge--accent">完全無料・登録不要</span>
      <span class="badge">適格請求書の6要件チェック付き</span>
      <span class="badge">端数処理は税率ごとに1回</span>
      <span class="badge">源泉徴収も自動計算</span>
      <span class="badge">データは端末内で処理</span>
    </div>
  </div>
</section>

${editorMarkup(site, doc)}

<section class="section section--alt">
  <div class="wrap">
    <h2 class="section__title">3ステップで、そのまま送れる請求書に</h2>
    <p class="section__lead">面倒な体裁づくりや税額計算はツールに任せて、内容の確認だけに集中できます。</p>
    <div class="steps">
      <div class="step">
        <h3>自分の情報を入れる</h3>
        <p>氏名・登録番号・振込先は端末内に記憶されるので、2回目からは入力不要です。</p>
      </div>
      <div class="step">
        <h3>明細を入力する</h3>
        <p>税率を選ぶだけで、10%・8%の区分と消費税額を正しく自動集計します。</p>
      </div>
      <div class="step">
        <h3>PDFで保存して送る</h3>
        <p>A4サイズで印刷・PDF保存。そのままメール添付で送付できます。</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="section__title">ほかの書類・計算ツール</h2>
    <p class="section__lead">同じ入力内容のまま、必要な書類を切り替えて作成できます。</p>
    <div class="cards">
      <a class="card" href="${base}/estimate/">
        <span class="card__icon" aria-hidden="true">📄</span>
        <h3 class="card__title">見積書メーカー</h3>
        <p class="card__text">有効期限つきの見積書を作成。そのまま請求書に転記できます。</p>
      </a>
      <a class="card" href="${base}/delivery-note/">
        <span class="card__icon" aria-hidden="true">📦</span>
        <h3 class="card__title">納品書メーカー</h3>
        <p class="card__text">納品内容を明記した納品書を作成。請求書と組み合わせて使えます。</p>
      </a>
      <a class="card" href="${base}/receipt/">
        <span class="card__icon" aria-hidden="true">🧾</span>
        <h3 class="card__title">領収書メーカー</h3>
        <p class="card__text">適格簡易請求書の形式にも対応した領収書を作成できます。</p>
      </a>
      <a class="card" href="${base}/tax-calculator/">
        <span class="card__icon" aria-hidden="true">🧮</span>
        <h3 class="card__title">消費税・源泉徴収税 計算機</h3>
        <p class="card__text">税抜・税込の変換と源泉徴収税額をまとめて計算します。</p>
      </a>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="wrap">
    <h2 class="section__title">インボイス制度の疑問を解決</h2>
    <p class="section__lead">請求書を書くときに迷いやすいポイントを、実務目線で解説しています。</p>
    <div class="cards">
      ${(site.guides || [])
        .slice(0, 6)
        .map(
          (g) => `<a class="card" href="${base}${g.path}">
        ${g.tag ? `<span class="card__tag">${esc(g.tag)}</span>` : ''}
        <h3 class="card__title">${esc(g.linkTitle || g.title)}</h3>
        <p class="card__text">${esc(g.summary || '')}</p>
      </a>`
        )
        .join('\n      ')}
    </div>
    <p style="text-align:center;margin-top:1.4rem">
      <a class="btn" href="${base}/guide/">解説記事の一覧を見る →</a>
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap" style="max-width:44rem">
    <h2 class="section__title">よくある質問</h2>
    <div style="margin-top:1.2rem">${faq.html}</div>
    ${adSlot(site, 'footer')}
  </div>
</section>`;

  return {
    path: '/',
    title: 'インボイス対応の請求書を無料作成｜登録不要・PDF保存 | ' + site.name,
    description:
      '適格請求書（インボイス）の記載要件に対応した無料の請求書作成ツール。登録番号・軽減税率8%・税率ごとの端数処理・源泉徴収まで自動計算し、A4のPDFで保存できます。会員登録不要、入力内容は送信されません。',
    jsonLd,
    body,
    scripts: editorScripts(site, doc),
  };
}
