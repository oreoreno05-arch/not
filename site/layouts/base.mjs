/** 共通レイアウト。SEO メタ / 構造化データ / 広告枠を一元管理する。 */

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 広告枠。site.json で enabled=true にすると実タグを出力する。 */
export function adSlot(site, slotName, { label = 'スポンサーリンク', className = '' } = {}) {
  const ads = site.monetization?.adsense;
  if (!ads?.enabled || !ads.publisherId) return '';
  const slotId = ads.slots?.[slotName] || '';
  return `<aside class="ad ${className}" aria-label="広告">
  <span class="ad__label">${esc(label)}</span>
  <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ads.publisherId)}"${
    slotId ? ` data-ad-slot="${esc(slotId)}"` : ''
  } data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</aside>`;
}

/** アフィリエイトのおすすめ枠 */
export function affiliateBox(site, { title = 'おすすめの会計・請求書サービス' } = {}) {
  const aff = site.monetization?.affiliate;
  if (!aff?.enabled || !aff.items?.length) return '';
  const items = aff.items
    .map(
      (it) => `    <li class="promo__item">
      <a class="promo__link" href="${esc(it.url)}" target="_blank" rel="sponsored noopener">
        <span class="promo__name">${esc(it.name)}</span>
        <span class="promo__desc">${esc(it.description || '')}</span>
      </a>
    </li>`
    )
    .join('\n');
  return `<section class="promo" aria-label="PR">
  <h2 class="promo__title">${esc(title)}<span class="promo__pr">PR</span></h2>
  <ul class="promo__list">
${items}
  </ul>
</section>`;
}

function nav(site, page) {
  const base = site.basePath || '';
  const links = [
    { href: `${base}/`, label: '請求書を作る' },
    { href: `${base}/estimate/`, label: '見積書' },
    { href: `${base}/tax-calculator/`, label: '消費税計算' },
    { href: `${base}/guide/`, label: 'インボイス解説' },
  ];
  return links
    .map((l) => {
      const active = page.path === l.href.replace(base, '') || (l.href === `${base}/` && page.path === '/');
      return `<a class="nav__link${active ? ' is-active' : ''}" href="${esc(l.href)}">${esc(l.label)}</a>`;
    })
    .join('');
}

function breadcrumbJsonLd(site, page) {
  if (!page.breadcrumb?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: page.breadcrumb.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: site.baseUrl + b.path,
    })),
  };
}

function breadcrumbHtml(site, page) {
  if (!page.breadcrumb?.length) return '';
  const base = site.basePath || '';
  const parts = page.breadcrumb
    .map((b, i, arr) =>
      i === arr.length - 1
        ? `<span aria-current="page">${esc(b.name)}</span>`
        : `<a href="${esc(base + b.path)}">${esc(b.name)}</a>`
    )
    .join('<span class="crumb__sep" aria-hidden="true">/</span>');
  return `<nav class="crumb" aria-label="パンくずリスト">${parts}</nav>`;
}

export function render({ site, page }) {
  const base = site.basePath || '';
  const url = site.baseUrl + (page.path === '/' ? '/' : page.path);
  const title = page.path === '/' ? page.title : `${page.title} | ${site.name}`;
  const desc = page.description || site.description;
  const ogImage = `${site.baseUrl}/assets/img/ogp.png`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: site.baseUrl + '/',
      inLanguage: 'ja',
      description: site.description,
    },
    breadcrumbJsonLd(site, page),
    ...(page.jsonLd || []),
  ].filter(Boolean);

  const ads = site.monetization?.adsense;
  const adsenseHead =
    ads?.enabled && ads.publisherId
      ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(
          ads.publisherId
        )}" crossorigin="anonymous"></script>`
      : `<!-- AdSense: site/data/site.json の monetization.adsense.enabled を true にすると有効化されます -->`;

  return `<!doctype html>
<html lang="ja">
<head>
<meta name="google-site-verification" content="1pu4mEhubu3DAwIO3UlDS6hXUp0MvVRNGr8GxdhcD18" />
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${page.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${page.collection === 'guide' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${esc(site.themeColor)}">
<link rel="icon" href="${base}/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${base}/assets/img/icon-180.png">
<link rel="manifest" href="${base}/assets/manifest.webmanifest">
<link rel="stylesheet" href="${base}/assets/css/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${adsenseHead}
</head>
<body${page.bodyClass ? ` class="${esc(page.bodyClass)}"` : ''}>
<a class="skip" href="#main">本文へスキップ</a>
<header class="header">
  <div class="wrap header__inner">
    <a class="brand" href="${base}/">
      <svg class="brand__mark" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 2h9l5 5v15a0 0 0 0 1 0 0H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" opacity=".18"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5.5 2.9h8.2l4.8 4.8v13.4H5.5z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M8.4 11.4h7.2M8.4 14.6h7.2M8.4 17.6h4.4"/></svg>
      <span class="brand__text">${esc(site.shortName)}</span>
    </a>
    <nav class="nav" aria-label="メインナビゲーション">${nav(site, page)}</nav>
  </div>
</header>
${breadcrumbHtml(site, page) ? `<div class="wrap">${breadcrumbHtml(site, page)}</div>` : ''}
<main id="main">
${page.body}
</main>
<footer class="footer">
  <div class="wrap footer__inner">
    <div class="footer__brand">
      <strong>${esc(site.name)}</strong>
      <p class="footer__note">${esc(site.tagline)}</p>
    </div>
    <nav class="footer__nav" aria-label="フッターナビゲーション">
      <a href="${base}/">請求書作成</a>
      <a href="${base}/estimate/">見積書作成</a>
      <a href="${base}/delivery-note/">納品書作成</a>
      <a href="${base}/receipt/">領収書作成</a>
      <a href="${base}/tax-calculator/">消費税・源泉税計算</a>
      <a href="${base}/guide/">インボイス解説</a>
      <a href="${base}/privacy/">プライバシーポリシー</a>
      <a href="${base}/terms/">利用規約</a>
      <a href="${base}/about/">このサイトについて</a>
    </nav>
    <p class="footer__legal">
      本サイトは一般的な情報提供を目的としたものであり、税務相談ではありません。個別の判断は税理士等の専門家、または国税庁の公式情報をご確認ください。<br>
      &copy; ${new Date().getFullYear()} ${esc(site.name)}
    </p>
  </div>
</footer>
${page.scripts || ''}
</body>
</html>
`;
}

export { esc };
