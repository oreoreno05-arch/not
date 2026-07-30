import { editorMarkup, editorScripts } from '../layouts/parts.mjs';

export default function (site) {
  const doc = {
    key: 'delivery',
    title: '納品書',
    numberLabel: '納品書番号',
    numberPrefix: 'DN',
    dateLabel: '納品日',
    showDueDate: false,
    showBank: false,
    showTotalBox: true,
    totalBoxLabel: '納品金額',
  };

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>納品書を無料で作成・PDF保存</h1>
    <p class="hero__lead">
      納品内容と金額を明記した納品書を、登録不要で作成できます。登録番号や税率ごとの消費税額を記載すれば、
      請求書と組み合わせて適格請求書の記載事項を満たすこともできます。
    </p>
    <div class="hero__badges">
      <span class="badge badge--accent">完全無料・登録不要</span>
      <span class="badge">登録番号の記載に対応</span>
      <span class="badge">軽減税率8%に対応</span>
    </div>
  </div>
</section>
${editorMarkup(site, doc)}`;

  return {
    path: '/delivery-note/',
    title: '納品書メーカー｜無料・登録不要でPDF作成',
    description:
      'インボイス制度に対応した無料の納品書作成ツール。登録番号や税率ごとの消費税額を記載でき、A4のPDFとして保存できます。会員登録は不要です。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: '納品書メーカー', path: '/delivery-note/' },
    ],
    body,
    scripts: editorScripts(site, doc),
  };
}
