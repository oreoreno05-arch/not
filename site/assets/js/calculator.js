/** 消費税・源泉徴収税・経過措置の計算機 */
(function () {
  'use strict';
  const C = window.InvoiceCore;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ------------------------------------------------ 消費税・源泉徴収の計算機
  const taxCalc = (() => {
    const el = $('#taxCalc');
    if (!el) return null;

    const state = { amount: 100000, mode: 'exclusive', rate: 10, rounding: 'floor', withholding: false };

    function render() {
      const amount = C.toNumber(state.amount);
      let net, tax;
      if (state.mode === 'inclusive') {
        tax = C.applyRounding((amount * state.rate) / (100 + state.rate), state.rounding);
        net = Math.round(amount) - tax;
      } else {
        net = Math.round(amount);
        tax = C.applyRounding((net * state.rate) / 100, state.rounding);
      }
      const gross = net + tax;
      const wh = C.withholdingTax(net, state.withholding);
      const payable = gross - wh;

      const rows = [
        `<div class="result__row"><span>税抜金額</span><b>${C.yen(net)}</b></div>`,
        `<div class="result__row"><span>消費税（${state.rate}%）</span><b>${C.yen(tax)}</b></div>`,
        `<div class="result__row result__row--main"><span>税込金額</span><b>${C.yen(gross)}</b></div>`,
      ];
      if (state.withholding) {
        rows.push(`<div class="result__row"><span>源泉徴収税額（税抜対象）</span><b>-${C.yen(wh)}</b></div>`);
        rows.push(`<div class="result__row result__row--main"><span>手取り・振込額</span><b>${C.yen(payable)}</b></div>`);
      }
      $('#taxResult').innerHTML = rows.join('');
    }

    $('#calcAmount').addEventListener('input', (e) => {
      state.amount = e.target.value;
      render();
    });
    $$('#modeSeg .seg__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        $$('#modeSeg .seg__btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        render();
      });
    });
    $$('#rateSeg .seg__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.rate = Number(btn.dataset.rate);
        $$('#rateSeg .seg__btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        render();
      });
    });
    $('#calcRounding').addEventListener('change', (e) => {
      state.rounding = e.target.value;
      render();
    });
    $('#calcWithholding').addEventListener('change', (e) => {
      state.withholding = e.target.checked;
      render();
    });

    render();
    return { render };
  })();

  // ------------------------------------------------------- 経過措置の計算機
  (function () {
    const el = $('#transCalc');
    if (!el) return;

    const state = { amount: 110000, date: new Date().toISOString().slice(0, 10) };

    function render() {
      const gross = C.toNumber(state.amount);
      const info = C.transitionalRate(state.date);
      if (!info) return;
      // 税込額から消費税相当額を割り戻す（10%前提）
      const taxEquivalent = Math.floor((gross * 10) / 110);
      const deductible = Math.floor((taxEquivalent * info.rate) / 100);
      const burden = taxEquivalent - deductible;

      $('#transResult').innerHTML = [
        `<div class="result__row"><span>適用される控除割合</span><b>${info.rate}%</b></div>`,
        `<div class="result__row"><span>消費税相当額（10%として計算）</span><b>${C.yen(taxEquivalent)}</b></div>`,
        `<div class="result__row result__row--main"><span>控除できる金額</span><b>${C.yen(deductible)}</b></div>`,
        `<div class="result__row"><span>控除できず負担になる金額</span><b>${C.yen(burden)}</b></div>`,
        `<p class="result__note">${info.label}</p>`,
      ].join('');
    }

    $('#transAmount').addEventListener('input', (e) => {
      state.amount = e.target.value;
      render();
    });
    const dateEl = $('#transDate');
    dateEl.value = state.date;
    dateEl.addEventListener('change', (e) => {
      state.date = e.target.value;
      render();
    });
    render();
  })();

  // --------------------------------------------------- 登録番号チェッカー
  (function () {
    const input = $('#regCheck');
    if (!input) return;
    const out = $('#regResult');
    input.addEventListener('input', () => {
      const r = C.validateRegistrationNumber(input.value);
      if (r.state === 'empty') {
        out.innerHTML = '<p class="result__note">「T」から始まる13桁の登録番号を入力してください。</p>';
        return;
      }
      const cls = r.state === 'invalid' ? 'check__warn' : r.state === 'valid' ? 'check__ok' : 'result__note';
      out.innerHTML = `<p class="${cls}">${r.state === 'invalid' ? '⚠ ' : r.state === 'valid' ? '✓ ' : 'ℹ '}${r.message}</p>
        ${
          r.value && r.state !== 'invalid'
            ? `<p class="result__note">実在するかどうかは <a href="https://www.invoice-kohyo.nta.go.jp/" target="_blank" rel="noopener">国税庁 適格請求書発行事業者公表サイト</a> で確認してください。</p>`
            : ''
        }`;
    });
  })();
})();
