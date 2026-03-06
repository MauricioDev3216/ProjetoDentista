/* =============================================
   SORRISO PERFEITO — sw.js (Service Worker)
   Estratégia:
   - Assets estáticos → Cache First (offline funciona)
   - APIs externas    → Network First (tenta rede, fallback cache)
   ============================================= */

const CACHE_NAME    = 'sorrisoperfeito-v1';
const CACHE_STATIC  = 'sorrisoperfeito-static-v1';
const CACHE_API     = 'sorrisoperfeito-api-v1';

// Arquivos para cachear na instalação (shell do app)
const STATIC_ASSETS = [
  '/index.html',
  '/styles/style.css',
  '/scripts/script.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap',
];

// ============================================
// INSTALL — cria o cache e salva os assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Força o SW novo a assumir imediatamente
  self.skipWaiting();
});

// ============================================
// ACTIVATE — limpa caches antigos
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_API)
          .map((k) => {
            console.log('[SW] Deletando cache antigo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  // Controla todas as abas abertas imediatamente
  self.clients.claim();
});

// ============================================
// FETCH — intercepta todas as requisições
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;

  // --- APIs externas: Network First ---
  if (
    url.hostname.includes('viacep.com.br') ||
    url.hostname.includes('openweathermap.org')
  ) {
    event.respondWith(networkFirst(event.request, CACHE_API));
    return;
  }

  // --- Google Fonts: Cache First ---
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(event.request, CACHE_STATIC));
    return;
  }

  // --- Assets locais: Cache First ---
  event.respondWith(cacheFirst(event.request, CACHE_STATIC));
});

// ============================================
// ESTRATÉGIAS DE CACHE
// ============================================

/**
 * Cache First — serve do cache, busca na rede se não tiver
 * Ideal para: assets estáticos, fontes, ícones
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline e sem cache — retorna página offline
    return offlineFallback(request);
  }
}

/**
 * Network First — tenta a rede, usa cache como fallback
 * Ideal para: APIs que precisam de dados frescos
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

/**
 * Fallback offline — HTML inline quando não tem cache nem rede
 */
function offlineFallback(request) {
  if (request.headers.get('Accept')?.includes('text/html')) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>Sorriso Perfeito — Offline</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Lato,sans-serif;background:#0d1b26;color:#e2eff6;
               display:flex;align-items:center;justify-content:center;
               min-height:100vh;text-align:center;padding:24px}
          .box{max-width:400px}
          svg{margin:0 auto 24px}
          h1{font-family:Georgia,serif;font-size:1.8rem;margin-bottom:12px;color:#A9D6E5}
          p{color:#8db4c8;line-height:1.7;margin-bottom:24px}
          a{display:inline-block;padding:12px 28px;background:#3a86a8;color:#fff;
            border-radius:50px;font-weight:700;text-decoration:none}
        </style>
      </head>
      <body>
        <div class="box">
          <svg viewBox="0 0 60 60" width="80" height="80">
            <circle cx="30" cy="30" r="28" fill="#A9D6E5" opacity=".3"/>
            <path d="M14 26C14 20 20 16 26 18C28 14 32 14 34 18C40 16 46 20 46 26C46 36 38 44 30 47C22 44 14 36 14 26Z" fill="#A9D6E5"/>
            <path d="M22 34Q30 40 38 34" fill="none" stroke="#90BE6D" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <h1>Você está offline</h1>
          <p>Parece que você perdeu a conexão. Verifique sua internet e tente novamente para acessar o Sorriso Perfeito.</p>
          <a href="/">Tentar novamente</a>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
  return new Response('Offline', { status: 503 });
}