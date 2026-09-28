const CACHE='cs-jardinagem-app-v7';
const APP_PREFIX='/CS-Jardinagem-app/app/';
const CORE=['/CS-Jardinagem-app/app/','/CS-Jardinagem-app/app/index.html','/CS-Jardinagem-app/app.html','/CS-Jardinagem-app/logo_cs_jardinagem.jpg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  // O site público nunca deve cair no cache do aplicativo.
  if(!url.pathname.startsWith(APP_PREFIX) && !url.pathname.endsWith('/app.html')) return;

  event.respondWith(
    fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});
      }
      return response;
    }).catch(()=>caches.match(event.request))
  );
});