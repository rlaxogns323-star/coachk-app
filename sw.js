/* COACH K 운동 기록 — 서비스 워커
   역할: ① 안드로이드 크롬이 '설치 가능한 앱'으로 알아보게 함 ② 인터넷이 끊겨도 마지막으로 본 화면을 보여 줌
   페이지 내용을 고친 뒤에는 아래 VERSION 숫자를 하나 올려 주세요. (그래야 폰에 새 내용이 반영됩니다) */
const VERSION = 'coachk-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 페이지 자체: 인터넷 먼저, 안 되면 저장해 둔 화면
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 같은 사이트의 아이콘 등: 저장본 먼저, 없으면 인터넷
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
