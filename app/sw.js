const CACHE='cs-jardinagem-app-v25-offline-shell';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./site-icon.svg','../logo_cs_jardinagem.jpg'];
const EXTERNAL=['https://esm.sh/@supabase/supabase-js@2'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(async c=>{await c.addAll(CORE);for(const u of EXTERNAL){try{const r=await fetch(u,{cache:'no-store'});if(r.ok)await c.put(u,r);}catch(_){}}}).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 const isApp=u.pathname.includes('/CS-Jardinagem-app/app/');
 const isEsm=u.hostname==='esm.sh';
 if(!isApp&&!isEsm)return;
 e.respondWith(
  caches.match(e.request).then(cached=>{
   const network=fetch(e.request).then(r=>{
    if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});}
    return r;
   }).catch(()=>null);
   return network.then(r=>r||cached).then(r=>r||new Response('',{status:503}));
  })
 );
});