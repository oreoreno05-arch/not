/**
 * 請求書 / 見積書 / 納品書 / 領収書 エディタ
 * すべてブラウザ内で完結し、入力内容はサーバーに送信されない。
 */
(function () {
  'use strict';

  const C = window.InvoiceCore;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const DOC = window.DOC_TYPE || {
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

  const STORAGE_KEY = 'invoice-maker:' + DOC.key;
  const PROFILE_KEY = 'invoice-maker:profile';

  // --------------------------------------------------------------------- 状態
  const state = {
    docNumber: '',
    issueDate: today(),
    dueDate: '',
    clientName: '',
    clientHonorific: '御中',
    clientAddress: '',
    issuerName: '',
    issuerRegNo: '',
    issuerAddress: '',
    issuerTel: '',
    issuerEmail: '',
    title: '',
    note: '',
    bank: '',
    priceMode: 'exclusive',
    rounding: 'floor',
    withholding: false,
    withholdingOnNet: true,
    seal: '',
    items: [],
  };

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function blankItem() {
    return { name: '', qty: 1, unit: '', unitPrice: '', taxRate: 10, exempt: false };
  }

  function defaultNumber() {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${DOC.numberPrefix}-${ym}-001`;
  }

  // ------------------------------------------------------------------- 保存
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // 自社情報は書類種別をまたいで共有する
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          issuerName: state.issuerName,
          issuerRegNo: state.issuerRegNo,
          issuerAddress: state.issuerAddress,
          issuerTel: state.issuerTel,
          issuerEmail: state.issuerEmail,
          bank: state.bank,
          seal: state.seal,
          rounding: state.rounding,
          priceMode: state.priceMode,
        })
      );
    } catch (e) {
      /* プライベートモード等では黙って諦める */
    }
  }

  function load() {
    let loaded = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        Object.assign(state, JSON.parse(raw));
        loaded = true;
      } else {
        const prof = localStorage.getItem(PROFILE_KEY);
        if (prof) Object.assign(state, JSON.parse(prof));
      }
    } catch (e) {
      /* noop */
    }
    if (!state.items || !state.items.length) state.items = [blankItem(), blankItem(), blankItem()];
    if (!state.docNumber) state.docNumber = defaultNumber();
    if (!state.issueDate) state.issueDate = today();
    return loaded;
  }

  // ------------------------------------------------------------------- 描画
  function renderItems() {
    const tbody = $('#itemsBody');
    tbody.innerHTML = '';
    state.items.forEach((item, i) => {
      const tr = document.createElement('tr');
      tr.className = 'items__row';
      tr.innerHTML = `
        <td class="items__cell items__cell--handle">
          <button type="button" class="rowbtn rowbtn--up" data-act="up" data-i="${i}" aria-label="${i + 1}行目を上に移動">▲</button>
          <button type="button" class="rowbtn rowbtn--down" data-act="down" data-i="${i}" aria-label="${i + 1}行目を下に移動">▼</button>
        </td>
        <td class="items__cell" data-label="品目">
          <input class="cell cell--name" type="text" data-f="name" data-i="${i}" value="${escAttr(item.name)}" placeholder="品目・サービス名" aria-label="${i + 1}行目の品目">
        </td>
        <td class="items__cell" data-label="数量">
          <input class="cell cell--num" type="text" inputmode="decimal" data-f="qty" data-i="${i}" value="${escAttr(item.qty)}" aria-label="${i + 1}行目の数量">
        </td>
        <td class="items__cell" data-label="単位">
          <input class="cell cell--unit" type="text" data-f="unit" data-i="${i}" value="${escAttr(item.unit)}" placeholder="式" aria-label="${i + 1}行目の単位">
        </td>
        <td class="items__cell" data-label="単価">
          <input class="cell cell--num" type="text" inputmode="decimal" data-f="unitPrice" data-i="${i}" value="${escAttr(item.unitPrice)}" aria-label="${i + 1}行目の単価">
        </td>
        <td class="items__cell" data-label="税率">
          <select class="cell cell--rate" data-f="taxRate" data-i="${i}" aria-label="${i + 1}行目の税率">
            <option value="10"${!item.exempt && Number(item.taxRate) === 10 ? ' selected' : ''}>10%</option>
            <option value="8"${!item.exempt && Number(item.taxRate) === 8 ? ' selected' : ''}>8%(軽)</option>
            <option value="exempt"${item.exempt ? ' selected' : ''}>非課税</option>
          </select>
        </td>
        <td class="items__cell items__cell--amount" data-label="金額">
          <span class="amount" data-amount="${i}">${C.yen(C.toNumber(item.qty) * C.toNumber(item.unitPrice))}</span>
        </td>
        <td class="items__cell items__cell--del">
          <button type="button" class="rowbtn rowbtn--del" data-act="del" data-i="${i}" aria-label="${i + 1}行目を削除">✕</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  function recalc() {
    const result = C.calculate(state.items, { rounding: state.rounding, priceMode: state.priceMode });

    // 明細ごとの金額表示
    state.items.forEach((item, i) => {
      const el = $(`[data-amount="${i}"]`);
      if (el) el.textContent = C.yen(C.toNumber(item.qty) * C.toNumber(item.unitPrice));
    });

    // 源泉徴収
    const whBase = state.withholdingOnNet ? result.subtotal : result.total;
    const wh = C.withholdingTax(whBase, state.withholding);
    const payable = result.total - wh;

    renderSummary(result, wh, payable);
    renderPreview(result, wh, payable);
    save();
  }

  function renderSummary(r, wh, payable) {
    const rows = [];
    rows.push(`<div class="sum__row"><span>小計（税抜）</span><b>${C.yen(r.subtotal)}</b></div>`);
    for (const g of r.groups) {
      if (g.exempt) {
        rows.push(`<div class="sum__row sum__row--sub"><span>非課税・不課税</span><b>${C.yen(g.subtotal)}</b></div>`);
      } else {
        rows.push(
          `<div class="sum__row sum__row--sub"><span>${g.rate}%対象 ${C.yen(g.subtotal)} の消費税</span><b>${C.yen(g.tax)}</b></div>`
        );
      }
    }
    rows.push(`<div class="sum__row"><span>消費税合計</span><b>${C.yen(r.taxTotal)}</b></div>`);
    rows.push(`<div class="sum__row sum__row--total"><span>合計</span><b>${C.yen(r.total)}</b></div>`);
    if (state.withholding && wh > 0) {
      rows.push(`<div class="sum__row sum__row--minus"><span>源泉徴収税額</span><b>-${C.yen(wh)}</b></div>`);
      rows.push(`<div class="sum__row sum__row--total"><span>お支払金額</span><b>${C.yen(payable)}</b></div>`);
    }
    $('#summary').innerHTML = rows.join('');
  }

  function renderPreview(r, wh, payable) {
    const p = $('#preview');
    const honor = state.clientHonorific || '';
    const finalAmount = state.withholding && wh > 0 ? payable : r.total;

    const itemRows = state.items
      .filter((it) => !isBlank(it))
      .map((it) => {
        const amount = C.toNumber(it.qty) * C.toNumber(it.unitPrice);
        const mark = !it.exempt && Number(it.taxRate) === 8 ? '<span class="pv__mark">※</span>' : '';
        const rateLabel = it.exempt ? '—' : `${Number(it.taxRate)}%`;
        return `<tr>
          <td class="pv__td pv__td--name">${esc(it.name)}${mark}</td>
          <td class="pv__td pv__td--c">${esc(it.qty)}${esc(it.unit || '')}</td>
          <td class="pv__td pv__td--r">${C.num(it.unitPrice)}</td>
          <td class="pv__td pv__td--c">${rateLabel}</td>
          <td class="pv__td pv__td--r">${C.num(amount)}</td>
        </tr>`;
      })
      .join('');

    const taxRows = r.groups
      .map((g) =>
        g.exempt
          ? `<tr><th class="pv__th2">非課税・不課税</th><td class="pv__td2">${C.yen(g.subtotal)}</td></tr>`
          : `<tr><th class="pv__th2">${g.rate}%対象 計</th><td class="pv__td2">${C.yen(g.subtotal)}<span class="pv__tax">（消費税 ${C.yen(g.tax)}）</span></td></tr>`
      )
      .join('');

    const regState = C.validateRegistrationNumber(state.issuerRegNo);

    p.innerHTML = `
<article class="pv" id="printArea">
  <header class="pv__head">
    <h1 class="pv__title">${esc(state.title || DOC.title)}</h1>
    <div class="pv__meta">
      <div><span>${esc(DOC.numberLabel)}</span><b>${esc(state.docNumber)}</b></div>
      <div><span>${esc(DOC.dateLabel)}</span><b>${formatDate(state.issueDate)}</b></div>
      ${DOC.showDueDate && state.dueDate ? `<div><span>お支払期限</span><b>${formatDate(state.dueDate)}</b></div>` : ''}
    </div>
  </header>

  <div class="pv__parties">
    <div class="pv__client">
      <div class="pv__clientname">${esc(state.clientName || '株式会社〇〇')} <span class="pv__honor">${esc(honor)}</span></div>
      ${state.clientAddress ? `<div class="pv__clientaddr">${nl2br(esc(state.clientAddress))}</div>` : ''}
    </div>
    <div class="pv__issuer">
      <div class="pv__issuername">${esc(state.issuerName || '発行者名')}</div>
      ${
        regState.state !== 'empty'
          ? `<div class="pv__reg">登録番号：${esc(regState.value || state.issuerRegNo)}</div>`
          : '<div class="pv__reg pv__reg--none">登録番号：未入力</div>'
      }
      ${state.issuerAddress ? `<div class="pv__line">${nl2br(esc(state.issuerAddress))}</div>` : ''}
      ${state.issuerTel ? `<div class="pv__line">TEL: ${esc(state.issuerTel)}</div>` : ''}
      ${state.issuerEmail ? `<div class="pv__line">${esc(state.issuerEmail)}</div>` : ''}
      ${state.seal ? `<div class="pv__seal">${esc(state.seal.slice(0, 4))}</div>` : ''}
    </div>
  </div>

  ${
    DOC.showTotalBox
      ? `<div class="pv__totalbox">
    <span class="pv__totallabel">${esc(DOC.totalBoxLabel)}</span>
    <span class="pv__totalvalue">${C.yen(finalAmount)}</span>
    <span class="pv__totalnote">（税込）</span>
  </div>`
      : ''
  }

  <table class="pv__table">
    <thead>
      <tr>
        <th class="pv__th pv__th--name">品目</th>
        <th class="pv__th pv__th--qty">数量</th>
        <th class="pv__th pv__th--price">単価</th>
        <th class="pv__th pv__th--rate">税率</th>
        <th class="pv__th pv__th--amount">金額</th>
      </tr>
    </thead>
    <tbody>${itemRows || '<tr><td class="pv__td pv__empty" colspan="5">明細を入力してください</td></tr>'}</tbody>
  </table>

  <div class="pv__bottom">
    <div class="pv__left">
      ${r.hasReduced ? '<p class="pv__legend">※ は軽減税率（8%）対象品目</p>' : ''}
      ${state.note ? `<div class="pv__note"><b>備考</b>${nl2br(esc(state.note))}</div>` : ''}
      ${DOC.showBank && state.bank ? `<div class="pv__bank"><b>お振込先</b>${nl2br(esc(state.bank))}</div>` : ''}
    </div>
    <div class="pv__right">
      <table class="pv__sum">
        <tr><th class="pv__th2">小計</th><td class="pv__td2">${C.yen(r.subtotal)}</td></tr>
        ${taxRows}
        <tr><th class="pv__th2">消費税</th><td class="pv__td2">${C.yen(r.taxTotal)}</td></tr>
        <tr class="pv__sumtotal"><th class="pv__th2">合計</th><td class="pv__td2">${C.yen(r.total)}</td></tr>
        ${
          state.withholding && wh > 0
            ? `<tr><th class="pv__th2">源泉徴収税額</th><td class="pv__td2">-${C.yen(wh)}</td></tr>
               <tr class="pv__sumtotal"><th class="pv__th2">お支払金額</th><td class="pv__td2">${C.yen(payable)}</td></tr>`
            : ''
        }
      </table>
    </div>
  </div>
</article>`;

    updateChecklist(r, regState);
  }

  /** インボイス6要件のチェックリストを更新 */
  function updateChecklist(r, regState) {
    const el = $('#checklist');
    if (!el) return;
    const hasItems = state.items.some((it) => !isBlank(it));
    const checks = [
      {
        ok: !!state.issuerName && (regState.state === 'valid' || regState.state === 'warn'),
        label: '発行事業者の氏名・名称と登録番号',
        hint: '「T」＋13桁の登録番号が必要です',
      },
      { ok: !!state.issueDate, label: '取引年月日', hint: '取引を行った日付' },
      {
        ok: hasItems,
        label: '取引内容（軽減税率対象はその旨）',
        hint: '8%対象には ※ が自動で付きます',
      },
      {
        ok: r.groups.length > 0,
        label: '税率ごとに区分した対価の合計額と適用税率',
        hint: '10%／8%ごとに自動集計されます',
      },
      { ok: r.groups.length > 0, label: '税率ごとに区分した消費税額等', hint: '端数処理は税率ごとに1回' },
      { ok: !!state.clientName, label: '書類の交付を受ける事業者の氏名・名称', hint: '請求先の正式名称' },
    ];
    const done = checks.filter((c) => c.ok).length;
    el.innerHTML = `
      <div class="check__head">
        <b>適格請求書の記載事項</b>
        <span class="check__count ${done === checks.length ? 'is-done' : ''}">${done} / ${checks.length}</span>
      </div>
      <ul class="check__list">
        ${checks
          .map(
            (c) =>
              `<li class="check__item ${c.ok ? 'is-ok' : ''}"><span class="check__icon" aria-hidden="true">${
                c.ok ? '✓' : ''
              }</span><span class="check__text">${c.label}<em class="check__hint">${c.hint}</em></span></li>`
          )
          .join('')}
      </ul>
      ${
        regState.state === 'invalid'
          ? `<p class="check__warn">${regState.message}</p>`
          : regState.state === 'valid'
          ? `<p class="check__ok">${regState.message}</p>`
          : ''
      }`;
  }

  // -------------------------------------------------------------- ユーティリティ
  function isBlank(it) {
    return !String(it.name || '').trim() && !C.toNumber(it.qty) && !C.toNumber(it.unitPrice);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, '&quot;');
  }
  function nl2br(s) {
    return String(s).replace(/\n/g, '<br>');
  }
  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${y}年${Number(m)}月${Number(d)}日`;
  }

  // ------------------------------------------------------------------ イベント
  function bind() {
    // フォーム（明細以外）
    $$('[data-model]').forEach((el) => {
      const key = el.dataset.model;
      if (el.type === 'checkbox') el.checked = !!state[key];
      else if (state[key] !== undefined && state[key] !== null) el.value = state[key];

      const ev = el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        state[key] = el.type === 'checkbox' ? el.checked : el.value;
        if (key === 'withholding') toggleWithholdingOptions();
        recalc();
      });
    });
    toggleWithholdingOptions();

    // 明細テーブル
    const tbody = $('#itemsBody');
    tbody.addEventListener('input', (e) => {
      const t = e.target;
      if (!t.dataset.f) return;
      const i = Number(t.dataset.i);
      state.items[i][t.dataset.f] = t.value;
      recalc();
    });
    tbody.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.f !== 'taxRate') return;
      const i = Number(t.dataset.i);
      if (t.value === 'exempt') {
        state.items[i].exempt = true;
        state.items[i].taxRate = 0;
      } else {
        state.items[i].exempt = false;
        state.items[i].taxRate = Number(t.value);
      }
      recalc();
    });
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const i = Number(btn.dataset.i);
      const act = btn.dataset.act;
      if (act === 'del') {
        state.items.splice(i, 1);
        if (!state.items.length) state.items.push(blankItem());
      } else if (act === 'up' && i > 0) {
        [state.items[i - 1], state.items[i]] = [state.items[i], state.items[i - 1]];
      } else if (act === 'down' && i < state.items.length - 1) {
        [state.items[i + 1], state.items[i]] = [state.items[i], state.items[i + 1]];
      } else return;
      renderItems();
      recalc();
    });

    $('#addRow').addEventListener('click', () => {
      state.items.push(blankItem());
      renderItems();
      recalc();
      const inputs = $$('#itemsBody .cell--name');
      inputs[inputs.length - 1]?.focus();
    });

    $('#printBtn').addEventListener('click', () => window.print());

    $('#resetBtn').addEventListener('click', () => {
      if (!confirm('入力内容をすべて消去します。よろしいですか？（自社情報は残ります）')) return;
      const keep = {
        issuerName: state.issuerName,
        issuerRegNo: state.issuerRegNo,
        issuerAddress: state.issuerAddress,
        issuerTel: state.issuerTel,
        issuerEmail: state.issuerEmail,
        bank: state.bank,
        seal: state.seal,
        rounding: state.rounding,
        priceMode: state.priceMode,
      };
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      location.reload();
    });

    // JSON 保存 / 読込
    const saveBtn = $('#saveJson');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${DOC.key}-${state.docNumber || 'data'}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
    const loadInput = $('#loadJson');
    if (loadInput) {
      loadInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const data = JSON.parse(await file.text());
          Object.assign(state, data);
          renderItems();
          syncInputs();
          recalc();
        } catch (err) {
          alert('ファイルを読み込めませんでした。');
        }
        e.target.value = '';
      });
    }

    // 見本データ
    const sampleBtn = $('#sampleBtn');
    if (sampleBtn) sampleBtn.addEventListener('click', fillSample);
  }

  function toggleWithholdingOptions() {
    const box = $('#withholdingOptions');
    if (box) box.hidden = !state.withholding;
  }

  function syncInputs() {
    $$('[data-model]').forEach((el) => {
      const key = el.dataset.model;
      if (el.type === 'checkbox') el.checked = !!state[key];
      else if (state[key] !== undefined && state[key] !== null) el.value = state[key];
    });
    toggleWithholdingOptions();
  }

  function fillSample() {
    Object.assign(state, {
      docNumber: defaultNumber(),
      issueDate: today(),
      clientName: '株式会社サンプル商事',
      clientAddress: '東京都千代田区丸の内1-1-1',
      issuerName: '山田デザイン事務所　山田太郎',
      issuerRegNo: 'T7000012050002',
      issuerAddress: '東京都渋谷区渋谷2-2-2',
      issuerTel: '03-1234-5678',
      issuerEmail: 'info@example.com',
      note: 'お振込手数料は貴社にてご負担をお願いいたします。',
      bank: '〇〇銀行 渋谷支店 普通 1234567\nヤマダタロウ',
      items: [
        { name: 'Webサイト デザイン制作', qty: 1, unit: '式', unitPrice: 250000, taxRate: 10, exempt: false },
        { name: 'コーディング作業', qty: 12, unit: 'P', unitPrice: 15000, taxRate: 10, exempt: false },
        { name: '打ち合わせ時 弁当代（軽減税率）', qty: 4, unit: '個', unitPrice: 980, taxRate: 8, exempt: false },
      ],
    });
    // 支払期限は「翌月末日」を既定にする
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 2);
    d.setDate(0);
    state.dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    renderItems();
    syncInputs();
    recalc();
  }

  // -------------------------------------------------------------------- 起動
  function init() {
    if (!$('#itemsBody')) return;
    load();
    renderItems();
    syncInputs();
    bind();
    recalc();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
