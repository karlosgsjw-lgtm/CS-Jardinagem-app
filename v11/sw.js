const CACHE='cs-jardinagem-v11';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','../logo_cs_jardinagem.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(!u.pathname.includes('/CS-Jardinagem-app/v11/'))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request)));});