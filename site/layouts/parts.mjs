/** ページ間で共有する UI パーツ */
import { adSlot, affiliateBox, esc } from './base.mjs';

export { adSlot, affiliateBox, esc };

/** 2026年10月の制度変更に関するお知らせ（サイト全体で使い回す） */
export function transitionNotice(site) {
  const base = site.basePath || '';
  return `<div class="notice" role="note">
  <span class="notice__icon" aria-hidden="true">📌</span>
  <div>
    <b>2026年10月1日から、免税事業者からの仕入れの控除割合が 80% → 70% に変わります</b>
    <p>あわせて「2割特例」も2026年9月30日で終了予定です（個人事業者は3割特例へ移行）。<a href="${base}/guide/2026-10-change/">2026年10月の変更点をまとめて読む →</a></p>
  </div>
</div>`;
}

/** 帳票エディタの共通 HTML を生成する */
export function editorMarkup(site, doc) {
  const base = site.basePath || '';
  return `
<section class="editor">
  <div class="wrap">
    ${transitionNotice(site)}
    ${adSlot(site, 'header', { className: 'ad--header' })}
    <div class="editor__grid">
      <!-- ============================ 入力 ============================ -->
      <div class="editor__form">
        <div class="panel">
          <h2 class="panel__title"><span class="panel__step">1</span>あなた（発行者）の情報</h2>
          <div class="field">
            <label for="issuerName">氏名・屋号・会社名</label>
            <input type="text" id="issuerName" data-model="issuerName" placeholder="山田デザイン事務所　山田太郎" autocomplete="organization">
          </div>
          <div class="field">
            <label for="issuerRegNo">適格請求書発行事業者の登録番号</label>
            <input type="text" id="issuerRegNo" data-model="issuerRegNo" placeholder="T1234567890123" spellcheck="false">
            <span class="field__hint">「T」＋13桁。形式を自動チェックします。<a href="https://www.invoice-kohyo.nta.go.jp/" target="_blank" rel="noopener">国税庁の公表サイトで確認</a></span>
          </div>
          <div class="field">
            <label for="issuerAddress">住所</label>
            <textarea id="issuerAddress" data-model="issuerAddress" rows="2" placeholder="東京都渋谷区渋谷2-2-2"></textarea>
          </div>
          <div class="grid2">
            <div class="field">
              <label for="issuerTel">電話番号</label>
              <input type="tel" id="issuerTel" data-model="issuerTel" placeholder="03-1234-5678">
            </div>
            <div class="field">
              <label for="issuerEmail">メールアドレス</label>
              <input type="email" id="issuerEmail" data-model="issuerEmail" placeholder="info@example.com">
            </div>
          </div>
          <div class="field">
            <label for="seal">電子印鑑（最大4文字）</label>
            <input type="text" id="seal" data-model="seal" maxlength="4" placeholder="山田">
            <span class="field__hint">入力すると赤い丸印がプレビューに表示されます（空欄なら非表示）</span>
          </div>
        </div>

        <div class="panel">
          <h2 class="panel__title"><span class="panel__step">2</span>宛先と${esc(doc.title)}の基本情報</h2>
          <div class="grid2">
            <div class="field">
              <label for="clientName">請求先の名称</label>
              <input type="text" id="clientName" data-model="clientName" placeholder="株式会社サンプル商事">
            </div>
            <div class="field">
              <label for="clientHonorific">敬称</label>
              <select id="clientHonorific" data-model="clientHonorific">
                <option value="御中">御中</option>
                <option value="様">様</option>
                <option value="">（なし）</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="clientAddress">請求先の住所（任意）</label>
            <textarea id="clientAddress" data-model="clientAddress" rows="2" placeholder="東京都千代田区丸の内1-1-1"></textarea>
          </div>
          <div class="grid3">
            <div class="field">
              <label for="docNumber">${esc(doc.numberLabel)}</label>
              <input type="text" id="docNumber" data-model="docNumber">
            </div>
            <div class="field">
              <label for="issueDate">${esc(doc.dateLabel)}</label>
              <input type="date" id="issueDate" data-model="issueDate">
            </div>
            ${
              doc.showDueDate
                ? `<div class="field">
              <label for="dueDate">お支払期限</label>
              <input type="date" id="dueDate" data-model="dueDate">
            </div>`
                : ''
            }
          </div>
          <div class="field">
            <label for="title">タイトル</label>
            <input type="text" id="title" data-model="title" placeholder="${esc(doc.title)}">
          </div>
        </div>

        <div class="panel">
          <h2 class="panel__title"><span class="panel__step">3</span>明細</h2>
          <div class="field">
            <span class="field__label">単価の入力方法</span>
            <div class="grid2">
              <select data-model="priceMode" aria-label="単価の税抜・税込">
                <option value="exclusive">単価は税抜で入力</option>
                <option value="inclusive">単価は税込で入力</option>
              </select>
              <select data-model="rounding" aria-label="消費税の端数処理">
                <option value="floor">端数は切り捨て</option>
                <option value="ceil">端数は切り上げ</option>
                <option value="round">端数は四捨五入</option>
              </select>
            </div>
            <span class="field__hint">端数処理は「1つの適格請求書につき税率ごとに1回」のルールで自動計算します。</span>
          </div>

          <table class="items">
            <colgroup>
              <col class="c-handle"><col><col class="c-qty"><col class="c-unit">
              <col class="c-price"><col class="c-rate"><col class="c-amount"><col class="c-del">
            </colgroup>
            <thead>
              <tr>
                <th></th><th>品目・内容</th><th>数量</th><th>単位</th><th>単価</th><th>税率</th><th>金額</th><th></th>
              </tr>
            </thead>
            <tbody id="itemsBody"></tbody>
          </table>

          <div class="btnrow">
            <button type="button" class="btn btn--ghost" id="addRow">＋ 明細を追加</button>
            <button type="button" class="btn" id="sampleBtn">見本データを入れる</button>
          </div>

          <div class="sum" id="summary"></div>
        </div>

        <div class="panel">
          <h2 class="panel__title"><span class="panel__step">4</span>源泉徴収・備考${doc.showBank ? '・振込先' : ''}</h2>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" data-model="withholding">
              <span>源泉徴収税額を差し引く（デザイン料・原稿料・講演料など）</span>
            </label>
          </div>
          <div class="field" id="withholdingOptions" hidden>
            <label for="whBase">源泉徴収の計算対象</label>
            <select id="whBase" data-model="withholdingOnNet">
              <option value="true">税抜金額を対象にする（消費税を区分している場合）</option>
              <option value="false">税込金額を対象にする</option>
            </select>
            <span class="field__hint">100万円までは10.21%、超える部分は20.42%で自動計算します。</span>
          </div>
          <div class="field">
            <label for="note">備考</label>
            <textarea id="note" data-model="note" rows="2" placeholder="お振込手数料は貴社にてご負担をお願いいたします。"></textarea>
          </div>
          ${
            doc.showBank
              ? `<div class="field">
            <label for="bank">お振込先</label>
            <textarea id="bank" data-model="bank" rows="2" placeholder="〇〇銀行 渋谷支店 普通 1234567&#10;ヤマダタロウ"></textarea>
          </div>`
              : ''
          }
        </div>

        <div class="panel" id="checklistPanel">
          <div class="check" id="checklist"></div>
        </div>

        ${affiliateBox(site)}
      </div>

      <!-- ============================ プレビュー ============================ -->
      <div class="preview-col">
        <div class="preview-head">
          <h2>プレビュー（A4）</h2>
          <div class="btnrow" style="margin:0">
            <button type="button" class="btn btn--primary" id="printBtn">🖨 PDF保存・印刷</button>
            <button type="button" class="btn" id="saveJson" title="入力内容をファイルに保存">保存</button>
            <label class="btn btn--file">読込<input type="file" id="loadJson" accept="application/json"></label>
            <button type="button" class="btn" id="resetBtn">クリア</button>
          </div>
        </div>
        <div class="preview-scroll">
          <div id="preview"></div>
        </div>
        <p class="field__hint no-print" style="margin-top:.6rem">
          「PDF保存・印刷」を押して、印刷先に <b>「PDFに保存」</b> を選ぶとPDFになります。入力内容はブラウザ内に保存され、サーバーには送信されません。
        </p>
        ${adSlot(site, 'belowTool', { className: 'ad--tool' })}
      </div>
    </div>
  </div>
</section>`;
}

export function editorScripts(site, doc) {
  const base = site.basePath || '';
  return `<script>window.DOC_TYPE=${JSON.stringify(doc)};</script>
<script src="${base}/assets/js/invoice-core.js"></script>
<script src="${base}/assets/js/editor.js"></script>`;
}

/** 記事ページのサイドバー */
export function articleSide(site, currentPath) {
  const base = site.basePath || '';
  const guides = (site.guides || []).filter((g) => g.path !== currentPath).slice(0, 6);
  return `<aside class="side">
  <div class="side__card side__cta">
    <h2 class="side__title">無料ツール</h2>
    <p>インボイス対応の請求書を、登録なしで今すぐ作成できます。</p>
    <a class="btn btn--primary" href="${base}/">請求書を作成する</a>
  </div>
  ${adSlot(site, 'inArticle')}
  <div class="side__card">
    <h2 class="side__title">よく読まれている解説</h2>
    <ul class="side__list">
      ${guides.map((g) => `<li><a href="${base}${g.path}">${esc(g.linkTitle || g.title)}</a></li>`).join('\n      ')}
    </ul>
  </div>
  <div class="side__card">
    <h2 class="side__title">ほかのツール</h2>
    <ul class="side__list">
      <li><a href="${base}/estimate/">見積書メーカー</a></li>
      <li><a href="${base}/delivery-note/">納品書メーカー</a></li>
      <li><a href="${base}/receipt/">領収書メーカー</a></li>
      <li><a href="${base}/tax-calculator/">消費税・源泉徴収税 計算機</a></li>
    </ul>
  </div>
  ${affiliateBox(site, { title: 'あわせて検討したいサービス' })}
</aside>`;
}

/** FAQ を HTML と JSON-LD の両方で出力する */
export function faqBlock(items) {
  const html = `<div class="faq">
${items
  .map(
    (f) => `  <details class="faq__item">
    <summary class="faq__q">${esc(f.q)}</summary>
    <div class="faq__a">${f.a}</div>
  </details>`
  )
  .join('\n')}
</div>`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
    })),
  };
  return { html, jsonLd };
}

/** 目次 */
export function toc(items) {
  return `<nav class="toc" aria-label="目次">
  <p class="toc__title">この記事の内容</p>
  <ol>
${items.map((i) => `    <li><a href="#${i.id}">${esc(i.label)}</a></li>`).join('\n')}
  </ol>
</nav>`;
}
