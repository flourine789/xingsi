// 行思 · Xing-Si — Service Worker
// 改动了 app 文件后请把 CACHE_VERSION 加 1，强制更新

const CACHE_VERSION = 'xingsi-v5';
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
  if (isApi) return; // 不拦截，浏览器默认走网络

  // 静态资源：cache-first，后台静默更新
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
