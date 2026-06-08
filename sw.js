// 行思 · Xing-Si — Service Worker
// 版本号由 index.html 的 <meta name="app-build"> 注入到 sw.js?v= 查询参数
// 更新发版时只需改 index.html 那一行 meta，浏览器会把"新 URL"视为新 SW

const BUILD = new URL(self.serviceWorker.scriptURL).searchParams.get('v') || 'dev';
const CACHE_VERSION = `xingsi-${BUILD}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './src/styles.css',
  './src/data.jsx',
  './src/shared.jsx',
  './src/tweaks-panel.jsx',
  './src/intro-card.jsx',
  './src/music-profile-panel.jsx',
  './src/screen-home.jsx',
  './src/screen-write.jsx',
  './src/screen-matching.jsx',
  './src/screen-echoes.jsx',
  './src/screen-dialogue.jsx',
  './src/screen-cards.jsx',
  './src/screen-song.jsx',
  './src/app.jsx',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // 单个失败不应阻塞整体安装
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // LLM/音乐 API 等动态请求：直接走网络，不缓存
  const isApi =
    url.hostname.includes('volces.com') ||
    url.hostname.includes('deepseek.com') ||
    url.hostname.includes('minimax') ||
    url.hostname.includes('openai.com') ||
    url.hostname.includes('anthropic.com');
  if (isApi) return;

  // 导航请求 / index.html：network-first
  // 在线时永远拿到最新 meta（含 app-build），离线时回落到缓存
  const isNavigation =
    req.mode === 'navigate' ||
    (url.origin === self.location.origin &&
      (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));

  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // 其余静态资源：cache-first，后台静默更新
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchAndUpdate = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchAndUpdate;
    })
  );
});
