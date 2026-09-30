self.addEventListener('push',event=>{
 let data={title:'CS Jardinagem',body:'Nova atividade no site.'};
 try{if(event.data)data=event.data.json()}catch(e){}
 event.waitUntil(self.registration.showNotification(data.title||'CS Jardinagem',{body:data.body||'',tag:data.tag||'cs-jardinagem',icon:'/CS-Jardinagem-app/logo_cs_jardinagem.jpg',badge:'/CS-Jardinagem-app/app/icon.svg',vibrate:[200,100,200],data:{url:'/CS-Jardinagem-app/site/admin.html'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  for(const c of list){if('focus' in c)return c.focus();}
  return clients.openWindow(event.notification.data?.url||'/CS-Jardinagem-app/site/admin.html');
 }));
});