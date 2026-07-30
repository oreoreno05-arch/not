import { adSlot, esc } from '../layouts/parts.mjs';

export default function (site) {
  const base = site.basePath || '';

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>インボイス制度の解説</h1>
    <p class="hero__lead">
      請求書を作るときに迷いやすいポイントを、実務の順番にそって解説しています。
      制度改正の内容も反映しながら更新しています。
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${adSlot(site, 'header')}
    <div class="cards">
      ${(site.guides || [])
        .map(
          (g) => `<a class="card" href="${base}${g.path}">
        ${g.tag ? `<span class="card__tag">${esc(g.tag)}</span>` : ''}
        <h2 class="card__title">${esc(g.linkTitle || g.title)}</h2>
        <p class="card__text">${esc(g.summary || '')}</p>
        <p class="card__text" style="margin-top:.5rem;font-size:.75rem;color:var(--ink-mute)">更新: ${esc(g.updated || g.date || '')}</p>
      </a>`
        )
        .join('\n      ')}
    </div>

    <div style="margin-top:2.4rem;text-align:center">
      <h2 class="section__title">まずは請求書を作ってみる</h2>
      <p class="section__lead">解説を読みながら、実際の書類で確認するのがいちばん早道です。</p>
      <a class="btn btn--primary btn--lg" href="${base}/">無料で請求書を作成する →</a>
    </div>
    ${adSlot(site, 'footer')}
  </div>
</section>`;

  return {
    path: '/guide/',
    title: 'インボイス制度の解説記事一覧',
    description:
      'インボイス制度（適格請求書等保存方式）の記載事項、端数処理、2026年10月の改正、電子帳簿保存法への対応まで、実務目線でまとめた解説記事の一覧です。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: 'インボイス解説', path: '/guide/' },
    ],
    body,
  };
}
