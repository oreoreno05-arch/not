import { editorMarkup, editorScripts } from '../layouts/parts.mjs';

export default function (site) {
  const doc = {
    key: 'receipt',
    title: '領収書',
    numberLabel: '領収書番号',
    numberPrefix: 'RC',
    dateLabel: '発行日',
    showDueDate: false,
    showBank: false,
    showTotalBox: true,
    totalBoxLabel: '領収金額',
  };

  const body = `
<section class="hero">
  <div class="wrap hero__inner">
    <h1>領収書を無料で作成・PDF保存</h1>
    <p class="hero__lead">
      登録番号と税率ごとの消費税額を記載した領収書を、無料で作成できます。
      小売業・飲食店・タクシー業などで認められる「適格簡易請求書」の形式にも使えます。
    </p>
    <div class="hero__badges">
      <span class="badge badge--accent">完全無料・登録不要</span>
      <span class="badge">適格簡易請求書にも対応</span>
      <span class="badge">軽減税率8%に対応</span>
    </div>
  </div>
</section>
${editorMarkup(site, doc)}`;

  return {
    path: '/receipt/',
    title: '領収書メーカー｜無料・登録不要でPDF作成',
    description:
      'インボイス制度に対応した無料の領収書作成ツール。登録番号・税率ごとの消費税額を記載でき、適格簡易請求書の形式にも対応。A4のPDFとして保存できます。',
    breadcrumb: [
      { name: 'ホーム', path: '/' },
      { name: '領収書メーカー', path: '/receipt/' },
    ],
    body,
    scripts: editorScripts(site, doc),
  };
}
