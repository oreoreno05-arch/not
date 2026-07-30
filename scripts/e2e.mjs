#!/usr/bin/env node
/**
 * jsdom でエディタを実際に動かし、入力→計算→プレビュー描画までを検証する。
 * jsdom は devDependency ではなく検証時のみ使うため、無い場合はスキップする。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, process.env.OUT_DIR || 'docs');

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.log('ℹ jsdom が無いため E2E 検証をスキップします（npm i -D jsdom で有効化）');
  process.exit(0);
}

let pass = 0;
const failures = [];
function ok(cond, name, extra = '') {
  if (cond) pass++;
  else failures.push(name + (extra ? `\n      ${extra}` : ''));
}

const html = await readFile(path.join(DIST, 'index.html'), 'utf8');
const core = await readFile(path.join(ROOT, 'site/assets/js/invoice-core.js'), 'utf8');
const editor = await readFile(path.join(ROOT, 'site/assets/js/editor.js'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.com/not/', pretendToBeVisual: true });
const { window } = dom;

// localStorage のスタブ（jsdom の実装が無い環境向け）
if (!window.localStorage) {
  const store = new Map();
  window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}
window.print = () => {};
window.confirm = () => true;
window.alert = () => {};

// DOC_TYPE はページ内のインラインスクリプトで定義されるので、同じ内容を注入
const docTypeMatch = html.match(/window\.DOC_TYPE=(\{[\s\S]*?\});/);
window.eval(`window.DOC_TYPE=${docTypeMatch ? docTypeMatch[1] : '{}'};`);
window.eval(core);
window.eval(editor);

// jsdom は runScripts:'outside-only' だと readyState が 'loading' のままなので、
// エディタの初期化トリガーである DOMContentLoaded を明示的に発火させる。
if (window.document.readyState === 'loading') {
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
}

const doc = window.document;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => Array.from(doc.querySelectorAll(s));

function fire(el, type) {
  el.dispatchEvent(new window.Event(type, { bubbles: true }));
}
function setInput(el, value) {
  el.value = value;
  fire(el, 'input');
}

// ---------------------------------------------------------------- 初期表示
ok($('#itemsBody').children.length >= 3, '初期状態で明細行が3行描画される');
ok($('#preview').innerHTML.includes('請求書'), 'プレビューが描画されている');
ok($('#checklist').innerHTML.includes('0 / 6') || $('#checklist').innerHTML.includes('/ 6'), 'チェックリストが描画されている');

// ------------------------------------------------------------ 明細を入力する
const nameInputs = $$('#itemsBody .cell--name');
const qtyInputs = $$('#itemsBody [data-f="qty"]');
const priceInputs = $$('#itemsBody [data-f="unitPrice"]');

setInput(nameInputs[0], 'Webサイト制作');
setInput(qtyInputs[0], '1');
setInput(priceInputs[0], '250000');

ok($('#summary').textContent.includes('250,000'), '小計に金額が反映される', $('#summary').textContent.trim());
ok($('#summary').textContent.includes('25,000'), '消費税10%が計算される');
ok($('#summary').textContent.includes('275,000'), '合計が計算される');
ok($('#preview').textContent.includes('Webサイト制作'), 'プレビューに品目が反映される');

// -------------------------------------------------- 軽減税率を混ぜて区分される
setInput(nameInputs[1], '弁当代');
setInput(qtyInputs[1], '4');
setInput(priceInputs[1], '1000');
const rateSel = $$('#itemsBody [data-f="taxRate"]')[1];
rateSel.value = '8';
fire(rateSel, 'change');

ok($('#summary').textContent.includes('8%対象'), '8%の区分が集計に現れる');
ok($('#preview').textContent.includes('※'), '軽減税率対象に ※ が付く');
ok($('#preview').textContent.includes('軽減税率'), '軽減税率の凡例が表示される');
// 10%: 250,000 -> 25,000 / 8%: 4,000 -> 320 / 合計 279,320
ok($('#preview').textContent.includes('279,320'), '税率混在時の合計が正しい', $('#summary').textContent.trim());

// --------------------------------------------------------------- 発行者情報
setInput($('#issuerName'), '山田デザイン事務所');
setInput($('#issuerRegNo'), 'T7000012050002');
setInput($('#clientName'), '株式会社サンプル商事');

ok($('#preview').textContent.includes('T7000012050002'), '登録番号がプレビューに出る');
ok($('#preview').textContent.includes('株式会社サンプル商事'), '宛名がプレビューに出る');
ok($('#preview').textContent.includes('御中'), '敬称が表示される');
ok($('#checklist').innerHTML.includes('6 / 6'), '6要件がすべて満たされる', $('#checklist').textContent.replace(/\s+/g, ' ').slice(0, 200));

// ------------------------------------------------------------------ 源泉徴収
const wh = $('[data-model="withholding"]');
wh.checked = true;
fire(wh, 'change');
// 税抜 254,000 -> 源泉 25,933
ok($('#summary').textContent.includes('源泉徴収'), '源泉徴収の行が表示される');
ok($('#summary').textContent.includes('25,933'), '源泉徴収税額が正しい (254,000 x 10.21%)', $('#summary').textContent.trim());
ok($('#preview').textContent.includes('お支払金額'), 'プレビューにお支払金額が出る');
ok($('#withholdingOptions').hidden === false, '源泉徴収のオプションが開く');

// ------------------------------------------------------------------ 行の追加
const before = $('#itemsBody').children.length;
$('#addRow').dispatchEvent(new window.Event('click', { bubbles: true }));
ok($('#itemsBody').children.length === before + 1, '明細行を追加できる');

// ------------------------------------------------------------------ 行の削除
const delBtn = $('#itemsBody [data-act="del"]');
delBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
ok($('#itemsBody').children.length === before, '明細行を削除できる');

// ------------------------------------------------------------ 見本データ投入
$('#sampleBtn').dispatchEvent(new window.Event('click', { bubbles: true }));
ok($('#preview').textContent.includes('株式会社サンプル商事'), '見本データが反映される');
ok($('#itemsBody').children.length === 3, '見本データで明細が3行になる');

// -------------------------------------------------------------- 税込入力モード
const priceMode = $('[data-model="priceMode"]');
priceMode.value = 'inclusive';
fire(priceMode, 'change');
ok($('#summary').textContent.length > 0, '税込モードでも集計が壊れない');

// ------------------------------------------------------------------ 永続化
ok(window.localStorage.getItem('invoice-maker:invoice') !== null, '入力内容が localStorage に保存される');
const saved = JSON.parse(window.localStorage.getItem('invoice-maker:invoice'));
ok(saved.issuerRegNo === 'T7000012050002', '保存内容に登録番号が含まれる');
ok(window.localStorage.getItem('invoice-maker:profile') !== null, '自社プロフィールが別途保存される');

// ----------------------------------------------------------- XSS が起きないこと
setInput($('#clientName'), '<img src=x onerror=alert(1)>テスト社');
ok(!$('#preview').innerHTML.includes('<img src=x'), 'HTMLがエスケープされる（XSS対策）');
ok($('#preview').textContent.includes('テスト社'), 'エスケープ後もテキストは表示される');

// ------------------------------------------------------------------- 計算機ページ
{
  const calcHtml = await readFile(path.join(DIST, 'tax-calculator/index.html'), 'utf8');
  const calcJs = await readFile(path.join(ROOT, 'site/assets/js/calculator.js'), 'utf8');
  const d2 = new JSDOM(calcHtml, { runScripts: 'outside-only', url: 'https://example.com/not/tax-calculator/' });
  const w2 = d2.window;
  w2.eval(core);
  w2.eval(calcJs);
  const doc2 = w2.document;
  ok(doc2.querySelector('#taxResult').textContent.includes('100,000'), '計算機: 税抜10万円が表示される');
  ok(doc2.querySelector('#taxResult').textContent.includes('110,000'), '計算機: 税込11万円が計算される');
  ok(doc2.querySelector('#transResult').textContent.includes('%'), '計算機: 経過措置の割合が出る');

  const amt = doc2.querySelector('#calcAmount');
  amt.value = '1000000';
  amt.dispatchEvent(new w2.Event('input', { bubbles: true }));
  ok(doc2.querySelector('#taxResult').textContent.includes('1,100,000'), '計算機: 入力変更が反映される');

  const reg = doc2.querySelector('#regCheck');
  reg.value = 'T123';
  reg.dispatchEvent(new w2.Event('input', { bubbles: true }));
  ok(doc2.querySelector('#regResult').textContent.includes('13桁'), '計算機: 不正な登録番号を検出する');
}

console.log(`\n${failures.length ? '✗' : '✓'} E2E: ${pass} 件成功 / ${failures.length} 件失敗`);
if (failures.length) {
  console.error('\n失敗:\n  - ' + failures.join('\n  - ') + '\n');
  process.exit(1);
}
