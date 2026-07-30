/**
 * インボイス計算コア
 * ---------------------------------------------------------------
 * 適格請求書の要件に沿った計算を行う。重要なルール:
 *   - 消費税の端数処理は「1つの適格請求書につき、税率ごとに1回」
 *     （国税庁 消費税の仕入税額控除制度における適格請求書等保存方式に関するQ&A 問57）
 *   - 明細ごとの端数処理を積み上げる方式は認められない
 * ---------------------------------------------------------------
 */
(function (global) {
  'use strict';

  /** 端数処理: floor(切捨) / ceil(切上) / round(四捨五入) */
  function applyRounding(value, mode) {
    switch (mode) {
      case 'ceil':
        return Math.ceil(value - 1e-9);
      case 'round':
        // 一般的な「四捨五入」（0.5 は切り上げ）
        return Math.floor(value + 0.5 + 1e-9);
      case 'floor':
      default:
        return Math.floor(value + 1e-9);
    }
  }

  /**
   * 明細から税率区分ごとの集計を作る。
   * @param {Array} items - { qty, unitPrice, taxRate, taxIncluded, exempt }
   * @param {Object} opts - { rounding, priceMode: 'exclusive'|'inclusive' }
   */
  function calculate(items, opts) {
    const options = Object.assign({ rounding: 'floor', priceMode: 'exclusive' }, opts || {});
    const inclusive = options.priceMode === 'inclusive';

    // 税率ごとのバケット（税率キー: 10 / 8 / 0）
    const buckets = new Map();
    let hasReduced = false;

    for (const raw of items) {
      const qty = toNumber(raw.qty);
      const unitPrice = toNumber(raw.unitPrice);
      if (!raw || (!qty && !unitPrice)) continue;
      if (isBlankRow(raw)) continue;

      const amount = qty * unitPrice; // 明細金額（端数処理しない）
      const rate = raw.exempt ? 0 : toNumber(raw.taxRate);
      if (rate === 8) hasReduced = true;

      const key = raw.exempt ? 'exempt' : String(rate);
      if (!buckets.has(key)) {
        buckets.set(key, { key, rate, exempt: !!raw.exempt, base: 0, lines: 0 });
      }
      const b = buckets.get(key);
      b.base += amount;
      b.lines += 1;
    }

    // 税率ごとに1回だけ端数処理する
    const groups = [];
    for (const b of buckets.values()) {
      let netBase; // 税抜対価
      let tax; // 消費税額
      if (b.exempt || b.rate === 0) {
        netBase = applyRounding(b.base, options.rounding);
        tax = 0;
      } else if (inclusive) {
        // 税込入力: 合計税込額から割り戻して1回だけ端数処理
        const gross = b.base;
        tax = applyRounding((gross * b.rate) / (100 + b.rate), options.rounding);
        netBase = Math.round(gross) - tax;
      } else {
        netBase = applyRounding(b.base, options.rounding);
        tax = applyRounding((netBase * b.rate) / 100, options.rounding);
      }
      groups.push({
        key: b.key,
        rate: b.rate,
        exempt: b.exempt,
        label: b.exempt ? '非課税・不課税' : `${b.rate}%対象`,
        reduced: b.rate === 8,
        subtotal: netBase,
        tax: tax,
        total: netBase + tax,
      });
    }

    groups.sort((a, b) => b.rate - a.rate);

    const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
    const taxTotal = groups.reduce((s, g) => s + g.tax, 0);
    const total = subtotal + taxTotal;

    return { groups, subtotal, taxTotal, total, hasReduced };
  }

  /**
   * 源泉徴収税額（報酬・料金等）を計算する。
   * 原則: 支払金額 100万円以下 → 10.21%、超える部分 → 20.42%
   * 消費税額が明確に区分されている場合は税抜額を対象にできる。
   */
  function withholdingTax(base, enabled) {
    if (!enabled || base <= 0) return 0;
    const THRESHOLD = 1000000;
    if (base <= THRESHOLD) return Math.floor(base * 0.1021);
    return Math.floor(THRESHOLD * 0.1021 + (base - THRESHOLD) * 0.2042);
  }

  function isBlankRow(row) {
    const hasName = row.name && String(row.name).trim() !== '';
    const qty = toNumber(row.qty);
    const price = toNumber(row.unitPrice);
    return !hasName && qty === 0 && price === 0;
  }

  function toNumber(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v === null || v === undefined) return 0;
    const n = parseFloat(String(v).replace(/[,\s¥￥]/g, ''));
    return isFinite(n) ? n : 0;
  }

  /** 3桁区切り */
  function yen(n) {
    const v = Math.round(toNumber(n));
    return '¥' + v.toLocaleString('ja-JP');
  }

  function num(n) {
    return Math.round(toNumber(n)).toLocaleString('ja-JP');
  }

  /**
   * 適格請求書発行事業者の登録番号の形式チェック。
   * 形式: T + 13桁の数字。法人番号は検査数字を持つため追加検証する。
   */
  function validateRegistrationNumber(input) {
    const raw = String(input || '').trim().toUpperCase().replace(/[\s-‐-―ー]/g, '');
    if (!raw) return { state: 'empty', message: '' };
    const normalized = raw.replace(/^T/, '');
    if (!/^\d{13}$/.test(normalized)) {
      return { state: 'invalid', message: '登録番号は「T」＋13桁の数字で入力してください。', value: raw };
    }
    const value = 'T' + normalized;
    // 法人番号のチェックディジット検証（個人事業主の番号は該当しない場合がある）
    const digits = normalized.split('').map(Number);
    const check = digits[0];
    const body = digits.slice(1); // 12桁
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      // 下位の桁から数えて奇数番目は1、偶数番目は2を乗じる
      const posFromRight = 12 - i; // 1..12
      sum += body[i] * (posFromRight % 2 === 1 ? 1 : 2);
    }
    const expected = 9 - (sum % 9);
    if (check === expected) {
      return { state: 'valid', message: '形式チェックOK（法人番号の検査数字と一致）', value };
    }
    return {
      state: 'warn',
      message: '13桁の形式です。個人事業主の登録番号はこの形式で正しい場合があります。',
      value,
    };
  }

  /** 免税事業者からの仕入れに係る経過措置の控除割合を日付から判定する */
  function transitionalRate(dateStr) {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return null;
    const t = d.getTime();
    const at = (y, m, day) => new Date(y, m - 1, day).getTime();
    if (t < at(2023, 10, 1)) return { rate: 100, label: 'インボイス制度開始前' };
    if (t < at(2026, 10, 1)) return { rate: 80, label: '80%控除（2026年9月30日まで）' };
    if (t < at(2028, 10, 1)) return { rate: 70, label: '70%控除（2026年10月1日〜2028年9月30日）' };
    if (t < at(2030, 10, 1)) return { rate: 50, label: '50%控除（2028年10月1日〜2030年9月30日）' };
    if (t < at(2031, 10, 1)) return { rate: 30, label: '30%控除（2030年10月1日〜2031年9月30日）' };
    return { rate: 0, label: '控除不可（2031年10月1日以降）' };
  }

  const api = {
    calculate,
    applyRounding,
    withholdingTax,
    validateRegistrationNumber,
    transitionalRate,
    yen,
    num,
    toNumber,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.InvoiceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
