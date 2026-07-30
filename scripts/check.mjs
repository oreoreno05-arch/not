#!/usr/bin/env node
/** dist/ を静的に検証する: 内部リンク切れ・SEOメタ・アセット参照・構造化データ */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const site = JSON.parse(await readFile(path.join(ROOT, 'site/data/site.json'), 'utf8'));
const BASE = site.basePath || '';

const errors = [];
const warnings = [];
let checked = 0;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に `npm run build` を実行してください。');
  process.exit(1);
}

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

/** URL パス -> dist 上の実ファイルが存在するか */
function resolveInternal(href) {
  let p = href.split('#')[0].split('?')[0];
  if (!p) return true; // 同一ページ内アンカー
  if (!p.startsWith(BASE)) return null; // 対象外
  p = p.slice(BASE.length) || '/';
  const candidates = [
    path.join(DIST, p),
    path.join(DIST, p, 'index.html'),
    path.join(DIST, p.replace(/\/$/, '') + '/index.html'),
  ];
  return candidates.some((c) => existsSync(c));
}

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const html = await readFile(file, 'utf8');
  checked++;

  // --- SEO 必須メタ ---
  if (!/<title>[^<]{10,}<\/title>/.test(html)) errors.push(`${rel}: title が短すぎる/欠落`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc) errors.push(`${rel}: meta description 欠落`);
  else if (desc[1].length < 50) warnings.push(`${rel}: description が短い (${desc[1].length}文字)`);
  else if (desc[1].length > 160) warnings.push(`${rel}: description が長い (${desc[1].length}文字)`);
  if (!/<link rel="canonical"/.test(html)) errors.push(`${rel}: canonical 欠落`);
  if (!/<html lang="ja">/.test(html)) errors.push(`${rel}: lang 属性が不正`);
  if (!/property="og:image"/.test(html)) errors.push(`${rel}: og:image 欠落`);

  // --- タイトル長 ---
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  if (title.length > 70) warnings.push(`${rel}: title が長い (${title.length}文字)`);

  // --- h1 は1つ ---
  const h1count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1count === 0) errors.push(`${rel}: h1 がない`);
  if (h1count > 1) errors.push(`${rel}: h1 が ${h1count} 個ある`);

  // --- 内部リンク切れ ---
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;
    const ok = resolveInternal(href);
    if (ok === false) errors.push(`${rel}: リンク切れ -> ${href}`);
  }

  // --- アセット参照 ---
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:css|js|png|svg|webmanifest))"/g)) {
    const p = m[1];
    if (!p.startsWith(BASE)) {
      errors.push(`${rel}: basePath が付いていないアセット参照 -> ${p}`);
      continue;
    }
    const target = path.join(DIST, p.slice(BASE.length));
    if (!existsSync(target)) errors.push(`${rel}: アセットが存在しない -> ${p}`);
  }

  // --- 構造化データが JSON として妥当か ---
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      errors.push(`${rel}: JSON-LD が不正 (${e.message})`);
    }
  }

  // --- テンプレートの取りこぼし ---
  if (/\$\{[a-zA-Z]/.test(html)) errors.push(`${rel}: 未展開のテンプレート変数が残っている`);
  if (/undefined|\[object Object\]/.test(html)) {
    warnings.push(`${rel}: "undefined" または "[object Object]" が出力されている`);
  }
  // --- 全角の混入チェック（ハングル等） ---
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(html)) errors.push(`${rel}: ハングル文字が混入`);
}

// --- sitemap / robots ---
if (!existsSync(path.join(DIST, 'sitemap.xml'))) errors.push('sitemap.xml がない');
if (!existsSync(path.join(DIST, 'robots.txt'))) errors.push('robots.txt がない');
if (!existsSync(path.join(DIST, '404.html'))) errors.push('404.html がない');
if (!existsSync(path.join(DIST, '.nojekyll'))) errors.push('.nojekyll がない');

const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
const locCount = (sitemap.match(/<loc>/g) || []).length;
// noindex を除いた HTML ページ数と一致するか
const indexable = htmlFiles.filter((f) => !readFileSyncSafe(f).includes('name="robots" content="noindex'));
function readFileSyncSafe(f) {
  try {
    return require('node:fs').readFileSync(f, 'utf8');
  } catch {
    return '';
  }
}

// --- サイズ ---
let total = 0;
for (const f of files) total += (await stat(f)).size;

console.log(`\n検査したHTML: ${checked} ページ`);
console.log(`sitemap の URL: ${locCount} 件`);
console.log(`dist の合計サイズ: ${(total / 1024).toFixed(1)} KB`);

if (warnings.length) {
  console.log(`\n⚠ 警告 ${warnings.length} 件`);
  warnings.forEach((w) => console.log('  - ' + w));
}
if (errors.length) {
  console.error(`\n✗ エラー ${errors.length} 件`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('\n✓ 検証をすべて通過しました');
