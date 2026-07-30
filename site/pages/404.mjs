export default function (site) {
  const base = site.basePath || '';

  const body = `
<section class="section">
  <div class="wrap" style="max-width:36rem;text-align:center">
    <h1 style="font-size:3rem;margin:2rem 0 .5rem;color:var(--brand)">404</h1>
    <p style="font-size:1.05rem;margin-bottom:2rem">お探しのページは見つかりませんでした。</p>
    <div class="cards">
      <a class="card" href="${base}/">
        <span class="card__icon" aria-hidden="true">🧾</span>
        <h2 class="card__title">請求書メーカー</h2>
        <p class="card__text">インボイス対応の請求書を無料で作成</p>
      </a>
      <a class="card" href="${base}/guide/">
        <span class="card__icon" aria-hidden="true">📘</span>
        <h2 class="card__title">インボイス解説</h2>
        <p class="card__text">制度の疑問を実務目線で解説</p>
      </a>
    </div>
  </div>
</section>`;

  return {
    path: '/404/',
    title: 'ページが見つかりません',
    description: 'お探しのページは見つかりませんでした。',
    noindex: true,
    body,
  };
}
