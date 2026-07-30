#!/usr/bin/env node
/**
 * 依存ゼロの静的サイトジェネレーター。
 * site/pages/**\/*.mjs を読み込み、layouts/base.mjs で包んで dist/ に書き出す。
 */
import { readFile, writeFile, mkdir, readdir, copyFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const DIST = path.join(ROOT, 'dist');

const site = JSON.parse(await readFile(path.join(SITE, 'data', 'site.json'), 'utf8'));
site.baseUrl = site.origin.replace(/\/$/, '') + (site.basePath || '');
site.buildDate = new Date().toISOString();

const { render } = await import(pathToFileURL(path.join(SITE, 'layouts', 'base.mjs')).href);

/** ディレクトリを再帰的に走査してファイル一覧を返す */
async function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function copyDir(src, dest) {
  for (const file of await walk(src)) {
    const rel = path.relative(src, file);
    const target = path.join(dest, rel);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(file, target);
  }
}

/** /guide/foo/ -> dist/guide/foo/index.html */
function outputPathFor(routePath) {
  const clean = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
  return clean ? path.join(DIST, clean, 'index.html') : path.join(DIST, 'index.html');
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // ---- ページ収集 --------------------------------------------------------
  const pageFiles = (await walk(path.join(SITE, 'pages'))).filter((f) => f.endsWith('.mjs')).sort();
  const pages = [];
  for (const file of pageFiles) {
    const mod = await import(pathToFileURL(file).href);
    const page = typeof mod.default === 'function' ? await mod.default(site) : mod.default;
    if (!page || !page.path) throw new Error(`ページ定義が不正です: ${file}`);
    pages.push(page);
  }

  // ガイド記事の一覧をグローバルに共有（一覧ページ・関連記事で使用）
  const guides = pages
    .filter((p) => p.collection === 'guide')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  site.guides = guides;

  // ---- 出力 --------------------------------------------------------------
  for (const page of pages) {
    const html = render({ site, page, pages });
    const out = outputPathFor(page.path);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html, 'utf8');
  }

  // ---- 静的ファイル ------------------------------------------------------
  await copyDir(path.join(SITE, 'assets'), path.join(DIST, 'assets'));

  // GitHub Pages で _ 始まりのパスを潰されないように
  await writeFile(path.join(DIST, '.nojekyll'), '', 'utf8');

  // sitemap.xml
  const urls = pages
    .filter((p) => !p.noindex)
    .map((p) => {
      const loc = site.baseUrl + (p.path === '/' ? '/' : p.path);
      const lastmod = (p.updated || p.date || site.buildDate).slice(0, 10);
      const priority = p.path === '/' ? '1.0' : p.collection === 'guide' ? '0.8' : '0.5';
      const changefreq = p.path === '/' ? 'weekly' : 'monthly';
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');
  await writeFile(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8'
  );

  // robots.txt
  await writeFile(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`,
    'utf8'
  );

  // ads.txt（AdSense を有効化したときだけ意味のある内容を書き出す）
  const pub = site.monetization?.adsense?.publisherId?.replace(/^ca-/, '');
  if (site.monetization?.adsense?.enabled && pub) {
    await writeFile(path.join(DIST, 'ads.txt'), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, 'utf8');
  }

  // 404
  const notFound = pages.find((p) => p.path === '/404/');
  if (notFound) {
    await copyFile(outputPathFor('/404/'), path.join(DIST, '404.html'));
  }

  // ---- サマリ ------------------------------------------------------------
  let bytes = 0;
  for (const f of await walk(DIST)) bytes += (await stat(f)).size;
  console.log(`✓ ${pages.length} ページ / ${guides.length} 記事を生成`);
  console.log(`✓ 出力: dist/ (${(bytes / 1024).toFixed(1)} KB)`);
  console.log(`✓ ベースURL: ${site.baseUrl}`);
  if (!site.monetization?.adsense?.enabled) {
    console.log('ℹ 広告は未有効（site/data/site.json の monetization.adsense を設定すると配信されます）');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
