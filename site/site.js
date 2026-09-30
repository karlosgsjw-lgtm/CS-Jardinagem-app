const SB_URL='https://lttqucegcmzwfsnrtdyj.supabase.co';const SB_KEY='sb_publishable_HQCcSkAZ1NcL4feTlkLBpw_PrirZRhG';const headers={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};const form=document.getElementById('quoteForm');const files=document.getElementById('fotos');const preview=document.getElementById('preview');const savedOrder=document.getElementById('savedOrder');const savedOrderLink=document.getElementById('savedOrderLink');function trackingUrl(token){const u=new URL('pedido.html',location.href);u.searchParams.set('token',token);return u.href}function showSavedOrder(token){if(!savedOrder||!savedOrderLink||!token)return;savedOrderLink.href=trackingUrl(token);savedOrder.style.display='block'}const savedToken=localStorage.getItem('cs_orcamento_token');if(savedToken)showSavedOrder(savedToken);files?.addEventListener('change',()=>{preview.innerHTML='';[...files.files].slice(0,8).forEach(f=>{const i=document.createElement('img');i.src=URL.createObjectURL(f);preview.appendChild(i)})});async function rpc(name,body){const r=await fetch(SB_URL+'/rest/v1/rpc/'+name,{method:'POST',headers,body:JSON.stringify(body)});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||j?.hint||'Erro ao comunicar com o servidor.');return j}async function uploadPhoto(bucket,path,file){const r=await fetch(SB_URL+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||j?.error||'Não foi possível enviar uma foto.');return SB_URL+'/storage/v1/object/public/'+bucket+'/'+path}form?.addEventListener('submit',async e=>{e.preventDefault();const msg=document.getElementById('formMsg');const btn=form.querySelector('button[type="submit"]');msg.textContent='Enviando seu pedido...';msg.style.color='#087f4b';btn.disabled=true;try{const data=await rpc('site_criar_orcamento',{p_nome:document.getElementById('nome').value.trim(),p_telefone:document.getElementById('telefone').value.trim(),p_email:document.getElementById('email').value.trim()||null,p_mensagem:document.getElementById('mensagem').value.trim()||null});const id=data.id;const selected=[...files.files].slice(0,8);let falhas=0;for(const f of selected){try{const safe=f.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=id+'/'+crypto.randomUUID()+'-'+safe;const publicUrl=await uploadPhoto('site-orcamentos',path,f);const r=await fetch(SB_URL+'/rest/v1/site_orcamento_arquivos',{method:'POST',headers:{...headers,'Prefer':'return=minimal'},body:JSON.stringify({orcamento_id:id,nome_arquivo:f.name,caminho:path,url:publicUrl})});if(!r.ok)throw new Error('Falha ao registrar foto')}catch(err){console.error('Foto:',err);falhas++}}try{const nr=await fetch(SB_URL+'/functions/v1/send-orcamento-email',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({order_id:id,access_token:data.access_token})});if(!nr.ok){const erroEmail=await nr.text();console.error('Aviso de e-mail não enviado:',erroEmail);throw new Error('O orçamento foi salvo, mas o aviso por e-mail falhou: '+erroEmail)}}catch(emailErr){console.warn('Aviso de e-mail não enviado:',emailErr);throw emailErr}const url=trackingUrl(data.access_token);localStorage.setItem('cs_orcamento_token',data.access_token);form.reset();preview.innerHTML='';showSavedOrder(data.access_token);msg.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:10px">✅ Pedido enviado com sucesso!</div>'+(falhas?'<div>O pedido foi recebido, mas '+falhas+' foto(s) não puderam ser anexadas.</div>':'')+'<a class="btn primary full" style="margin-top:12px" href="'+url+'">📋 Acompanhar meu pedido</a><div style="font-size:12px;margin-top:8px">Guarde este link para consultar seu pedido e conversar conosco.</div>';msg.style.color='#087f4b'}catch(err){console.error(err);msg.textContent='Não foi possível enviar o pedido agora. '+(err.message||'Verifique sua conexão e tente novamente.');msg.style.color='#b42318'}finally{btn.disabled=false}});
async function loadSiteContent(){const defaultItems=[{titulo:'Manutenção de jardins',descricao:'Corte de grama, limpeza e cuidados gerais.',imagens:['https://images.unsplash.com/photo-1599685315640-7c1a9b3f2e3c?auto=format&fit=crop&w=900&q=85']},{titulo:'Poda de plantas e árvores',descricao:'Podas para manter plantas saudáveis e bem cuidadas.',imagens:['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=85']},{titulo:'Paisagismo',descricao:'Projetos que valorizam e transformam o seu espaço.',imagens:['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=85']},{titulo:'Limpeza de terrenos',descricao:'Remoção de folhas, galhos e entulho verde.',imagens:['https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=900&q=85']},{titulo:'Jardins residenciais e comerciais',descricao:'Soluções para casas, condomínios e empresas.',imagens:['https://images.unsplash.com/photo-1558521958-0a228e77e984?auto=format&fit=crop&w=900&q=85']}];renderServiceCarousel(defaultItems);try{const r=await fetch(SB_URL+'/rest/v1/site_conteudo?select=chave,dados',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}});if(!r.ok)return;const rows=await r.json();const cfg={};rows.forEach(x=>cfg[x.chave]=x.dados||{});const h=cfg.hero||{};const s=cfg.servicos||{};const q=cfg.orcamento||{};const a=cfg.sobre||{};const ct=cfg.contato||{};const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.innerHTML=String(v).replace(/\n/g,'<br>')};set('heroEyebrow',h.eyebrow);set('heroTitle',h.titulo);set('heroDescription',h.descricao);set('heroPrimary',h.botao_principal);set('heroSecondary',h.botao_secundario);const hi=document.querySelector('.hero-img');if(hi&&h.hero_imagem)hi.style.backgroundImage="linear-gradient(90deg,#063b2b22,#063b2b00),url('"+String(h.hero_imagem).replace(/'/g,"%27")+"')";set('servicesEyebrow',s.titulo_pequeno);set('servicesTitle',s.titulo);renderServiceCarousel(s.itens||[]);set('quoteEyebrow',q.eyebrow);set('quoteTitle',q.titulo);set('quoteDescription',q.descricao);const ql=document.getElementById('quoteList');if(ql&&Array.isArray(q.lista))ql.innerHTML=q.lista.map(x=>'<li>'+String(x).replace(/[<>]/g,'')+'</li>').join('');set('aboutEyebrow',a.eyebrow);set('aboutTitle',a.titulo);set('aboutDescription',a.descricao);document.querySelectorAll('a.wa,footer a[href^="https://wa.me/"]').forEach(e=>e.href='https://wa.me/5511970353629');if(ct.instagram){const e=document.querySelector('footer a[href*="instagram"]');if(e)e.href=ct.instagram}if(ct.google){const e=document.querySelector('footer a[href*="google.com/maps"]');if(e)e.href=ct.google}}catch(e){console.warn('Conteúdo do site:',e)}}
let serviceItems=[];let activeService=0;let servicePhotoIndexes=[];let serviceTimer=null;let lightboxTimer=null;let lightboxService=0;let lightboxPhotoIndex=0;let savedScrollY=0;let lightboxHistory=false;
function optimizeImageUrl(url,width=900,quality=72){try{const u=new URL(url,location.href);if(u.hostname.endsWith('.supabase.co')&&u.pathname.includes('/storage/v1/object/public/')){u.pathname=u.pathname.replace('/storage/v1/object/public/','/storage/v1/render/image/public/');u.searchParams.set('width',String(width));u.searchParams.set('quality',String(quality));u.searchParams.set('resize','contain');return u.toString()}if(u.hostname.includes('images.unsplash.com')){u.searchParams.set('w',String(width));u.searchParams.set('q',String(quality));u.searchParams.set('auto','format');return u.toString()}return url}catch{return url}}
function serviceImages(x){const arr=Array.isArray(x?.imagens)&&x.imagens.length?x.imagens:(x?.imagem?[x.imagem]:[]);return arr.map(v=>optimizeImageUrl(v,900,72))}
function loadServiceCardImage(i){const card=document.querySelector('.serviceCard[data-service-index="'+i+'"]');if(!card)return;const imgs=serviceImages(serviceItems[i]);if(!imgs.length)return;const p=card.querySelector('.servicePhoto');if(p&&!p.dataset.loaded){p.style.backgroundImage='url("'+String(imgs[servicePhotoIndexes[i]||0]).replace(/"/g,'&quot;')+'")';p.dataset.loaded='1'}}
function renderServiceCarousel(items){serviceItems=Array.isArray(items)?items:[];activeService=0;servicePhotoIndexes=serviceItems.map(()=>0);const viewport=document.getElementById('servicesViewport');const dots=document.getElementById('servicesDots');if(!viewport)return;if(!serviceItems.length){viewport.innerHTML='<p style="color:#71817a">Serviços em breve.</p>';if(dots)dots.innerHTML='';return}viewport.innerHTML=serviceItems.map((x,i)=>{const imgs=serviceImages(x);const first=i===0?imgs[0]||'':'';return '<article class="serviceCard" data-service-index="'+i+'"><div class="servicePhotoWrap"><div class="photo servicePhoto" style="background-image:url("'+String(first).replace(/"/g,'&quot;')+'")"></div>'+(imgs.length>1?'<button type="button" class="serviceNav servicePrev" aria-label="Foto anterior" onclick="event.stopPropagation();servicePhotoPrev('+i+')">‹</button><button type="button" class="serviceNav serviceNext" aria-label="Próxima foto" onclick="event.stopPropagation();servicePhotoNext('+i+')">›</button><span class="servicePhotoCount">1/'+imgs.length+'</span>':'')+'</div><h3>'+String(x.titulo||'').replace(/[<>]/g,'')+'</h3><p>'+String(x.descricao||'').replace(/[<>]/g,'')+'</p></article>'}).join('');viewport.querySelectorAll('.servicePhotoWrap').forEach((wrap,i)=>wrap.addEventListener('click',e=>{if(e.target.closest('button'))return;openServiceLightbox(i)}));if(dots)dots.innerHTML=serviceItems.map((x,i)=>'<button type="button" aria-label="Ir para '+(i+1)+'º serviço" onclick="serviceCardGo('+i+')"></button>').join('');updateServiceCarousel();startServiceAuto()}
function updateServiceCarousel(){const cards=[...document.querySelectorAll('.serviceCard')];const n=cards.length;if(!n)return;cards.forEach((card,i)=>{card.className='serviceCard';let d=(i-activeService+n)%n;if(d>n/2)d-=n;if(d===0)card.classList.add('is-active');else if(d===-1)card.classList.add('is-prev');else if(d===1)card.classList.add('is-next');else if(d===-2)card.classList.add('is-prev2');else if(d===2)card.classList.add('is-next2');else card.classList.add('is-hidden')});for(let off=-2;off<=2;off++){const i=(activeService+off+n)%n;loadServiceCardImage(i)}document.querySelectorAll('.servicesDots button').forEach((b,i)=>b.classList.toggle('active',i===activeService))}
function serviceCardGo(i){if(!serviceItems.length)return;activeService=(i+serviceItems.length)%serviceItems.length;servicePhotoIndexes[activeService]=0;updateServiceCarousel();startServiceAuto()}
function serviceCardNext(){serviceCardGo(activeService+1)}
function serviceCardPrev(){serviceCardGo(activeService-1)}
function serviceAutoStep(){if(!serviceItems.length)return;const imgs=serviceImages(serviceItems[activeService]);if(imgs.length>1&&servicePhotoIndexes[activeService]<imgs.length-1){servicePhotoNext(activeService,false)}else{serviceCardNext()}}
function startServiceAuto(){clearInterval(serviceTimer);serviceTimer=setInterval(serviceAutoStep,3200)}
function resetServiceAuto(){startServiceAuto()}
function setServicePhoto(i,index,manual=true){const card=document.querySelector('.serviceCard[data-service-index="'+i+'"]');if(!card)return;const imgs=serviceImages(serviceItems[i]);if(!imgs.length)return;index=(index+imgs.length)%imgs.length;servicePhotoIndexes[i]=index;const p=card.querySelector('.servicePhoto');if(!p)return;p.classList.add('fadeOut');setTimeout(()=>{p.style.backgroundImage='url("'+String(imgs[index]).replace(/"/g,'&quot;')+'")';p.dataset.loaded='1';p.classList.remove('fadeOut')},260);const count=card.querySelector('.servicePhotoCount');if(count)count.textContent=(index+1)+'/'+imgs.length;if(manual)resetServiceAuto()}
function servicePhotoNext(i,manual=true){const imgs=serviceImages(serviceItems[i]);if(imgs.length>1)setServicePhoto(i,servicePhotoIndexes[i]+1,manual)}
function servicePhotoPrev(i){const imgs=serviceImages(serviceItems[i]);if(imgs.length>1)setServicePhoto(i,servicePhotoIndexes[i]-1,true)}
function openServiceLightbox(i){if(!serviceItems[i])return;lightboxService=i;lightboxPhotoIndex=servicePhotoIndexes[i]||0;savedScrollY=window.scrollY;document.body.classList.add('lightbox-open');const lb=document.getElementById('serviceLightbox');lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.getElementById('lightboxTitle').textContent=serviceItems[i].titulo||'';if(!lightboxHistory){history.pushState({csServiceLightbox:true},'',location.href);lightboxHistory=true}renderLightboxPhoto();startLightboxAuto();const close=document.querySelector('.lightboxClose');close?.focus()}
function renderLightboxPhoto(){const imgs=serviceImages(serviceItems[lightboxService]);if(!imgs.length)return;const p=document.getElementById('lightboxPhoto');p.classList.add('fadeOut');setTimeout(()=>{p.style.backgroundImage='url("'+String(imgs[lightboxPhotoIndex]).replace(/"/g,'&quot;')+'")';p.classList.remove('fadeOut')},160);document.getElementById('lightboxCount').textContent=(lightboxPhotoIndex+1)+' / '+imgs.length}
function lightboxNext(){const imgs=serviceImages(serviceItems[lightboxService]);if(!imgs.length)return;lightboxPhotoIndex=(lightboxPhotoIndex+1)%imgs.length;renderLightboxPhoto();startLightboxAuto()}
function lightboxPrev(){const imgs=serviceImages(serviceItems[lightboxService]);if(!imgs.length)return;lightboxPhotoIndex=(lightboxPhotoIndex-1+imgs.length)%imgs.length;renderLightboxPhoto();startLightboxAuto()}
function startLightboxAuto(){clearInterval(lightboxTimer);const imgs=serviceImages(serviceItems[lightboxService]);if(imgs.length>1)lightboxTimer=setInterval(lightboxNext,3200)}
function closeServiceLightbox(fromPop=false){const lb=document.getElementById('serviceLightbox');if(!lb.classList.contains('open'))return;clearInterval(lightboxTimer);lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');if(!fromPop&&lightboxHistory){lightboxHistory=false;history.back()}else lightboxHistory=false;setTimeout(()=>window.scrollTo(0,savedScrollY),20)}
document.querySelector('.lightboxClose')?.addEventListener('click',()=>closeServiceLightbox());document.querySelector('.serviceLightboxBackdrop')?.addEventListener('click',()=>closeServiceLightbox());document.querySelector('.lightboxNext')?.addEventListener('click',lightboxNext);document.querySelector('.lightboxPrev')?.addEventListener('click',lightboxPrev);window.addEventListener('keydown',e=>{const lb=document.getElementById('serviceLightbox');if(!lb?.classList.contains('open'))return;if(e.key==='Escape')closeServiceLightbox();if(e.key==='ArrowRight')lightboxNext();if(e.key==='ArrowLeft')lightboxPrev()});window.addEventListener('popstate',()=>{if(lightboxHistory){lightboxHistory=false;closeServiceLightbox(true)}});
loadSiteContent();
/* Popup de orçamento: ativo somente enquanto a seção de orçamento estiver visível */
(function(){
  const popup=document.getElementById('budgetPopup');
  const quote=document.getElementById('orcamento');
  if(!popup||!quote)return;

  let visibleTimer=null;
  let restartTimer=null;
  let active=false;
  let closedByUser=false;

  function show(){
    if(!active)return;
    clearTimeout(visibleTimer);
    clearTimeout(restartTimer);
    popup.classList.add('show');
    popup.setAttribute('aria-hidden','false');
    visibleTimer=setTimeout(hide,10000);
  }

  function hide(){
    clearTimeout(visibleTimer);
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden','true');
    if(active) restartTimer=setTimeout(show,2000);
  }

  const observer=new IntersectionObserver(entries=>{
    const visible=entries[0].isIntersecting;

    if(visible){
      active=true;
      if(!closedByUser && !popup.classList.contains('show')) show();
    }else{
      active=false;
      clearTimeout(visibleTimer);
      clearTimeout(restartTimer);
      popup.classList.remove('show');
      popup.setAttribute('aria-hidden','true');
    }
  },{
    threshold:0.03
  });

  observer.observe(quote);

  popup.querySelector('.budgetPopupClose')?.addEventListener('click',()=>{
    closedByUser=true;
    clearTimeout(visibleTimer);
    clearTimeout(restartTimer);
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden','true');
  });

  popup.querySelector('.budgetPopupBtn')?.addEventListener('click',()=>{
    clearTimeout(visibleTimer);
    clearTimeout(restartTimer);
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden','true');
  });
})();
/* Analytics simples do site público */
(function(){
  try{
    const KEY='cs_site_analytics_session';
    let sid=localStorage.getItem(KEY);
    if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(KEY,sid)}
    const send=(type,element,metadata={})=>{
      const body={p_event_type:type,p_session_id:sid,p_path:location.pathname,p_element:element||null,p_metadata:metadata};
      fetch(SB_URL+'/rest/v1/rpc/site_registrar_analytics',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});
    };
    (async()=>{try{let geo=null;try{const gr=await fetch('https://ipapi.co/json/');if(gr.ok)geo=await gr.json()}catch(_){}const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||null;const ua=navigator.userAgent||'';const device=/Mobi|Android|iPhone|iPad/i.test(ua)?'Celular/tablet':'Computador';const browser=/Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)&&!/Chrome\//.test(ua)?'Safari':'Outro';send('page_view','page_view',{referrer:document.referrer||null,screen:innerWidth+'x'+innerHeight,language:navigator.language||null,timezone:tz,device,browser,city:geo?.city||null,region:geo?.region||null,country:geo?.country_name||null,country_code:geo?.country_code||null,org:geo?.org||null})}catch(_){send('page_view','page_view',{referrer:document.referrer||null,screen:innerWidth+'x'+innerHeight})}})();
    document.addEventListener('click',e=>{
      const el=e.target.closest('a,button');
      if(!el)return;
      const label=(el.innerText||el.getAttribute('aria-label')||el.title||'').trim().slice(0,100);
      const href=el.getAttribute('href')||'';
      send('click',label||'button',{href});
    },{passive:true});
  }catch(_){}
})();
