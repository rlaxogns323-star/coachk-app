/* COACH K 운동 기록 — 서비스 워커
   역할: ① 안드로이드 크롬이 '설치 가능한 앱'으로 알아보게 함 ② 헬스장처럼 인터넷이 약한 곳에서도 앱이 열리게 함
   페이지 내용을 고친 뒤에는 아래 VERSION 숫자를 하나 올려 주세요. (그래야 폰에 새 내용이 반영됩니다)
   ※ 운동 기록 자체는 여기가 아니라 휴대폰 브라우저 저장소에 따로 저장되므로, 숫자를 올려도 기록은 지워지지 않습니다. */
const VERSION = 'coachk-v2';
const CORE = [
  './',
  './index.html',
  './app.html',
  './app.css',
  './app.js',
  './bodymap.js',
  './exercises.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 인터넷 먼저 시도하고, 안 되면 저장해 둔 것 사용 (항상 최신 내용 우선)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(url.origin + url.pathname, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) =>
          hit || (req.mode === 'navigate' ? caches.match('./app.html') : undefined)
        )
      )
  );
});
