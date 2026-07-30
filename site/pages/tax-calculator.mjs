import { adSlot, faqBlock, transitionNotice } from '../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const faq = faqBlock([
    {
      q: '税込金額から消費税額を求める計算式は？',
      a: '<p>10%対象なら「税込金額 × 10 ÷ 110」、8%対象なら「税込金額 × 8 ÷ 108」で消費税額を求めます。1円未満の端数は、1つの請求書につき税率ごとに1回だけ処理します。</p>',
    },
    {
      q: '源泉徴収税額はいくらになりますか？',
      a: '<p>報酬・料金等の源泉徴収税額は、支払金額100万円以下の部分が10.21%、100万円を超える部分が20.42%です。請求書で消費税額を明確に区分している場合は、税抜金額を対象として計算して差し支えありません。</p>',
    },
    {
      q: '消費税の端数は切り捨て・切り上げどちらですか？',
      a: '<p>どちらでも構いません。切り捨て・切り上げ・四捨五入のいずれを選ぶかは事業者が任意に決められますが、1つの適格請求書の中では方法を統一し、端数処理は税率ごとに1回だけ行う必要があります。</p>',
    },
  ]);

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>消費税・源泉徴収税 計算機</h1>
    <p class="hero__lead">
      税抜⇄税込の変換、源泉徴収税額、免税事業者からの仕入れの経過措置まで、その場で計算できます。
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap" style="max-width:60rem">
    ${transitionNotice(site)}

    <!-- ============ 消費税・源泉徴収 ============ -->
    <div class="panel" id="taxCalc">
      <h2 class="panel__title">消費税・源泉徴収税の計算</h2>
      <div class="calc">
        <div>
          <div class="field">
            <label for="calcAmount">金額</label>
            <input type="text" id="calcAmount" inputmode="decimal" value="100000">
          </div>
          <div class="field">
            <span class="field__label">入力した金額は</span>
            <div class="seg" id="modeSeg">
              <button type="button" class="seg__btn is-active" data-mode="exclusive">税抜</button>
              <button type="button" class="seg__btn" data-mode="inclusive">税込</button>
            </div>
          </div>
          <div class="field">
            <span class="field__label">税率</span>
            <div class="seg" id="rateSeg">
              <button type="button" class="seg__btn is-active" data-rate="10">10%</button>
              <button type="button" class="seg__btn" data-rate="8">8%（軽減）</button>
            </div>
          </div>
          <div class="field">
            <label for="calcRounding">端数処理</label>
            <select id="calcRounding">
              <option value="floor">切り捨て</option>
              <option value="ceil">切り上げ</option>
              <option value="round">四捨五入</option>
            </select>
          </div>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" id="calcWithholding">
              <span>源泉徴収税額も計算する</span>
            </label>
          </div>
        </div>
        <div class="result" id="taxResult"></div>
      </div>
    </div>

    ${adSlot(site, 'inArticle')}

    <!-- ============ 経過措置 ============ -->
    <div class="panel" id="transCalc">
      <h2 class="panel__title">免税事業者からの仕入れ｜控除できる金額</h2>
      <p style="font-size:.9rem;color:var(--ink-soft);margin:0 0 1rem">
        インボイスの登録をしていない事業者から仕入れた場合、経過措置によって一定割合まで仕入税額控除ができます。
        取引日を入れると、その時点で適用される割合で計算します。
      </p>
      <div class="calc">
        <div>
          <div class="field">
            <label for="transAmount">仕入金額（税込・10%対象）</label>
            <input type="text" id="transAmount" inputmode="decimal" value="110000">
          </div>
          <div class="field">
            <label for="transDate">課税仕入れを行った日</label>
            <input type="date" id="transDate">
          </div>
        </div>
        <div class="result" id="transResult"></div>
      </div>
    </div>

    <!-- ============ 登録番号チェック ============ -->
    <div class="panel">
      <h2 class="panel__title">登録番号の形式チェック</h2>
      <div class="field">
        <label for="regCheck">適格請求書発行事業者の登録番号</label>
        <input type="text" id="regCheck" placeholder="T1234567890123" spellcheck="false">
      </div>
      <div id="regResult"><p class="result__note">「T」から始まる13桁の登録番号を入力してください。</p></div>
    </div>

    <div class="prose" style="margin-top:1.6rem">
      <h2>計算のルール</h2>
      <div class="tablewrap">
        <table class="table">
          <thead><tr><th>項目</th><th>計算式</th></tr></thead>
          <tbody>
            <tr><th>税抜→消費税（10%）</th><td>税抜金額 × 10%</td></tr>
            <tr><th>税込→消費税（10%）</th><td>税込金額 × 10 ÷ 110</td></tr>
            <tr><th>税込→消費税（8%）</th><td>税込金額 × 8 ÷ 108</td></tr>
            <tr><th>源泉徴収（100万円以下）</th><td>支払金額 × 10.21%</td></tr>
            <tr><th>源泉徴収（100万円超の部分）</th><td>1,000,000 × 10.21% ＋（支払金額 − 1,000,000）× 20.42%</td></tr>
          </tbody>
        </table>
      </div>
      <div class="callout callout--warn">
        <span class="callout__title">端数処理は「税率ごとに1回」</span>
        <p>適格請求書では、消費税額の1円未満の端数処理を、1つの請求書につき税率ごとに1回だけ行います。明細ごとに端数処理をして合計する方法は認められていません。</p>
      </div>
      <h2>よくある質問</h2>
      ${faq.html}
      <p><a class="btn btn--primary" href="${base}/">この計算のまま請求書を作る →</a></p>
    </div>
    ${adSlot(site, 'footer')}
  </div>
</section>`;

  return {
    path: '/tax-calculator/',
    title: '消費税・源泉徴収税 計算機｜税抜税込の変換と経過措置',
    description:
      '税抜⇄税込の変換、消費税の端数処理、報酬の源泉徴収税額（10.21%・20.42%）、免税事業者からの仕入れの経過措置による控除額を、その場で無料計算できます。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: '消費税・源泉徴収税 計算機', path: '/tax-calculator/' },
    ],
    jsonLd: [faq.jsonLd],
    body,
    scripts: `<script src="${base}/assets/js/invoice-core.js"></script>
<script src="${base}/assets/js/calculator.js"></script>`,
  };
}
