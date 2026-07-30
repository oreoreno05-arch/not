#!/usr/bin/env node
/** dist/ をローカルで配信する開発用サーバー（basePath 付きで本番と同じパスを再現する） */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const site = JSON.parse(await readFile(path.join(ROOT, 'site/data/site.json'), 'utf8'));
const BASE = site.basePath || '';
const PORT = process.env.PORT || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (BASE && urlPath.startsWith(BASE)) urlPath = urlPath.slice(BASE.length) || '/';
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  let file = path.join(DIST, urlPath);
  if (existsSync(file) && (await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  if (!existsSync(file) && existsSync(file + '/index.html')) file += '/index.html';
  if (!existsSync(file)) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end(existsSync(nf) ? await readFile(nf) : 'Not Found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`▸ http://localhost:${PORT}${BASE}/ で確認できます（Ctrl+C で終了）`);
});
