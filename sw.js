/* BlackLi Board 離線功能
   - 網頁、資料、樣式、程式（.html、.json、.css、.js）：先上網拿最新的，沒網路時才用手機裡存的版本。
   - 圖片：先用手機裡存的，背景再更新。
   - 只處理本站的檔案，外部網站（字型、出遊情報的資料來源）不經過這裡。
   改了這個檔案的快取規則時，把 VERSION 加 1。 */
const VERSION = 'bb-v1';
const PAGES = VERSION + '-pages';
const ASSETS = VERSION + '-assets';
const CORE = [
  './', './index.html', './news.html', './weekly.html', './mind.html', './fun.html', './tools.html',
  './about.html', './method.html', './offline.html', './site.css', './assets/site.js', './assets/logo.svg',
  './data/quiz.json', './manifest.webmanifest', './assets/icons/icon-192.png'
];
const MAX_PAGES = 80; // 最多留幾頁讀過的文章

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PAGES).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trim(name, max) {
  const c = await caches.open(name); const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

async function networkFirst(req) {
  const c = await caches.open(PAGES);
  try {
    const res = await fetch(req, {cache: 'no-cache'});
    if (res.ok) { c.put(req, res.clone()); trim(PAGES, MAX_PAGES + CORE.length); }
    return res;
  } catch (err) {
    const hit = await c.match(req, {ignoreSearch: true});
    if (hit) return hit;
    if (req.mode === 'navigate') return Response.redirect(new URL('./offline.html?from=' + encodeURIComponent(req.url), location).href, 302);
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const c = await caches.open(ASSETS);
  const hit = await c.match(req);
  const fresh = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || fresh;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('./', location).pathname)) return;
  const isPage = req.mode === 'navigate' || /\.(html|json|css|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  e.respondWith(isPage ? networkFirst(req) : staleWhileRevalidate(req));
});
