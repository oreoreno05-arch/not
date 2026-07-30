#!/usr/bin/env node
/** invoice-core.js の計算ロジックを検証する（依存ゼロの簡易テストランナー） */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const src = await readFile(path.join(ROOT, 'site/assets/js/invoice-core.js'), 'utf8');
const sandbox = { module: { exports: {} }, console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const C = sandbox.InvoiceCore;

let pass = 0;
const failures = [];
function eq(actual, expected, name) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++;
  else failures.push(`${name}\n    期待: ${JSON.stringify(expected)}\n    実際: ${JSON.stringify(actual)}`);
}

// ---------------------------------------------------------------------------
// 1. 端数処理は「税率ごとに1回」（国税庁 Q&A 問57 の設例）
//    10%対象 60,000円(税込) → 60,000 × 10/110 = 5,454.54... → 5,454円
//    8%対象  40,000円(税込) → 40,000 × 8/108  = 2,962.96... → 2,962円
// ---------------------------------------------------------------------------
{
  const items = [
    { name: 'A', qty: 1, unitPrice: 60000, taxRate: 10 },
    { name: 'B', qty: 1, unitPrice: 40000, taxRate: 8 },
  ];
  const r = C.calculate(items, { rounding: 'floor', priceMode: 'inclusive' });
  const t10 = r.groups.find((g) => g.rate === 10);
  const t8 = r.groups.find((g) => g.rate === 8);
  eq(t10.tax, 5454, '国税庁Q&A問57: 10%対象60,000円(税込)の消費税額');
  eq(t8.tax, 2962, '国税庁Q&A問57: 8%対象40,000円(税込)の消費税額');
  eq(r.total, 100000, '税込入力時の合計は入力額と一致する');
}

// ---------------------------------------------------------------------------
// 2. 明細ごとに端数処理した「積み上げ」との差が出ることを確認
//    税抜 1,111円 × 3明細, 10% → 正: (3333)×0.1 = 333.3 → 333円
//    誤（明細ごと切捨の積み上げ）: 111 × 3 = 333 … 同値になるので別の値で検証
// ---------------------------------------------------------------------------
{
  const items = [
    { name: 'A', qty: 1, unitPrice: 1115, taxRate: 10 },
    { name: 'B', qty: 1, unitPrice: 1115, taxRate: 10 },
    { name: 'C', qty: 1, unitPrice: 1115, taxRate: 10 },
  ];
  const r = C.calculate(items, { rounding: 'floor', priceMode: 'exclusive' });
  // 正: 3345 × 0.1 = 334.5 → 334円 / 誤（明細ごと）: 111×3 = 333円
  eq(r.groups[0].tax, 334, '税率ごとに1回の端数処理（明細ごと積み上げの333円ではない）');
  eq(r.subtotal, 3345, '税抜合計');
  eq(r.total, 3679, '合計（税込）');
}

// ---------------------------------------------------------------------------
// 3. 端数処理モード
// ---------------------------------------------------------------------------
{
  const items = [{ name: 'A', qty: 1, unitPrice: 1005, taxRate: 10 }]; // 100.5
  eq(C.calculate(items, { rounding: 'floor' }).taxTotal, 100, '切捨');
  eq(C.calculate(items, { rounding: 'ceil' }).taxTotal, 101, '切上');
  eq(C.calculate(items, { rounding: 'round' }).taxTotal, 101, '四捨五入');
}

// ---------------------------------------------------------------------------
// 4. 軽減税率の混在・非課税
// ---------------------------------------------------------------------------
{
  const items = [
    { name: '事務用品', qty: 10, unitPrice: 1000, taxRate: 10 },
    { name: 'お弁当', qty: 5, unitPrice: 500, taxRate: 8 },
    { name: '印紙', qty: 1, unitPrice: 200, exempt: true },
  ];
  const r = C.calculate(items, { rounding: 'floor', priceMode: 'exclusive' });
  eq(r.groups.length, 3, '税率区分が3つに分かれる');
  eq(r.hasReduced, true, '軽減税率対象を検知');
  eq(r.groups.find((g) => g.rate === 10).tax, 1000, '10%対象10,000円の消費税');
  eq(r.groups.find((g) => g.rate === 8 && !g.exempt).tax, 200, '8%対象2,500円の消費税');
  eq(r.groups.find((g) => g.exempt).tax, 0, '非課税は消費税0円');
  // 税抜合計 10,000 + 2,500 + 200(非課税) = 12,700 / 消費税 1,000 + 200 = 1,200
  eq(r.subtotal, 12700, '税抜合計（非課税分を含む）');
  eq(r.total, 13900, '合計');
}

// ---------------------------------------------------------------------------
// 5. 源泉徴収税額（10.21% / 100万円超の部分は20.42%）
// ---------------------------------------------------------------------------
{
  eq(C.withholdingTax(100000, true), 10210, '10万円の源泉徴収税額');
  eq(C.withholdingTax(1000000, true), 102100, '100万円ちょうど');
  // 150万円: 1,000,000×10.21% + 500,000×20.42% = 102,100 + 102,100 = 204,200
  eq(C.withholdingTax(1500000, true), 204200, '150万円（超過分は20.42%）');
  eq(C.withholdingTax(100000, false), 0, '無効時は0');
}

// ---------------------------------------------------------------------------
// 6. 登録番号のバリデーション
// ---------------------------------------------------------------------------
{
  eq(C.validateRegistrationNumber('').state, 'empty', '空欄');
  eq(C.validateRegistrationNumber('T123').state, 'invalid', '桁数不足');
  eq(C.validateRegistrationNumber('1234567890123').state !== 'invalid', true, 'T省略でも13桁なら受理');
  // 実在形式の法人番号（検査数字が一致する例）
  const ok = C.validateRegistrationNumber('T7000012050002');
  eq(['valid', 'warn'].includes(ok.state), true, '13桁は valid か warn');
  eq(C.validateRegistrationNumber('t7000012050002').value, 'T7000012050002', '小文字tを正規化');
}

// ---------------------------------------------------------------------------
// 7. 経過措置の控除割合（令和8年度税制改正後のスケジュール）
// ---------------------------------------------------------------------------
{
  eq(C.transitionalRate('2026-09-30').rate, 80, '2026年9月30日は80%');
  eq(C.transitionalRate('2026-10-01').rate, 70, '2026年10月1日から70%');
  eq(C.transitionalRate('2028-10-01').rate, 50, '2028年10月1日から50%');
  eq(C.transitionalRate('2030-10-01').rate, 30, '2030年10月1日から30%');
  eq(C.transitionalRate('2031-10-01').rate, 0, '2031年10月1日以降は控除不可');
}

// ---------------------------------------------------------------------------
// 8. 入力の正規化
// ---------------------------------------------------------------------------
{
  eq(C.toNumber('1,234'), 1234, 'カンマ入り');
  eq(C.toNumber('¥5,000'), 5000, '通貨記号');
  eq(C.toNumber(''), 0, '空文字');
  eq(C.toNumber('abc'), 0, '数値以外');
  eq(C.yen(1234567), '¥1,234,567', '通貨表記');
  const blank = C.calculate([{ name: '', qty: '', unitPrice: '', taxRate: 10 }], {});
  eq(blank.total, 0, '空行は無視される');
}

// ---------------------------------------------------------------------------
console.log(`\n${failures.length ? '✗' : '✓'} テスト: ${pass} 件成功 / ${failures.length} 件失敗`);
if (failures.length) {
  console.error('\n失敗:\n  - ' + failures.join('\n  - ') + '\n');
  process.exit(1);
}
