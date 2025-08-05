import { precacheAndRoute } from 'workbox-precaching';

// 缓存所有静态资源
precacheAndRoute(self.__WB_MANIFEST);

// 缓存API请求
self.addEventListener('fetch', (event) => {
  // 对于图片请求，尝试网络优先，失败则返回缓存
  if (event.request.url.includes('gen_image')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // 更新缓存
          caches.open('images-cache').then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          // 网络失败，返回缓存或占位符
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 返回离线占位符图片
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f5f5f5"/><text x="50" y="50" text-anchor="middle" fill="#cccccc" font-family="Arial" font-size="12">离线</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        })
    );
  }
});

// 监听安装事件
self.addEventListener('install', () => {
  self.skipWaiting();
});

// 监听激活事件
self.addEventListener('activate', () => {
  self.clients.claim();
});