import { editorMarkup, editorScripts } from '../layouts/parts.mjs';

export default function (site) {
  const doc = {
    key: 'estimate',
    title: '見積書',
    numberLabel: '見積番号',
    numberPrefix: 'EST',
    dateLabel: '発行日',
    showDueDate: true,
    showBank: false,
    showTotalBox: true,
    totalBoxLabel: 'お見積金額',
  };

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>見積書を無料で作成・PDF保存</h1>
    <p class="hero__lead">
      税率ごとの消費税額まで自動計算する見積書メーカー。会員登録不要で、そのままA4のPDFとして保存できます。
      入力内容は端末内に保存されるので、受注後は同じ内容で請求書に流用できます。
    </p>
    <div class="hero__badges">
      <span class="badge badge--accent">完全無料・登録不要</span>
      <span class="badge">軽減税率8%に対応</span>
      <span class="badge">有効期限つき</span>
    </div>
  </div>
</section>
${editorMarkup(site, doc)}`;

  return {
    path: '/estimate/',
    title: '見積書メーカー｜無料・登録不要でPDF作成',
    description:
      '消費税を税率ごとに自動計算する無料の見積書作成ツール。会員登録なしでA4のPDFとして保存でき、受注後はそのまま請求書にも流用できます。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: '見積書メーカー', path: '/estimate/' },
    ],
    body,
    scripts: editorScripts(site, doc),
  };
}
