const SB_URL='https://lttqucegcmzwfsnrtdyj.supabase.co';const SB_KEY='sb_publishable_HQCcSkAZ1NcL4feTlkLBpw_PrirZRhG';const headers={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};const form=document.getElementById('quoteForm');const files=document.getElementById('fotos');const preview=document.getElementById('preview');const savedOrder=document.getElementById('savedOrder');const savedOrderLink=document.getElementById('savedOrderLink');function trackingUrl(token){const u=new URL('pedido.html',location.href);u.searchParams.set('token',token);return u.href}function showSavedOrder(token){if(!savedOrder||!savedOrderLink||!token)return;savedOrderLink.href=trackingUrl(token);savedOrder.style.display='block'}const savedToken=localStorage.getItem('cs_orcamento_token');if(savedToken)showSavedOrder(savedToken);files?.addEventListener('change',()=>{preview.innerHTML='';[...files.files].slice(0,8).forEach(f=>{const i=document.createElement('img');i.src=URL.createObjectURL(f);preview.appendChild(i)})});async function rpc(name,body){const r=await fetch(SB_URL+'/rest/v1/rpc/'+name,{method:'POST',headers,body:JSON.stringify(body)});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||j?.hint||'Erro ao comunicar com o servidor.');return j}async function uploadPhoto(bucket,path,file){const r=await fetch(SB_URL+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(j?.message||j?.error||'Não foi possível enviar uma foto.');return SB_URL+'/storage/v1/object/public/'+bucket+'/'+path}form?.addEventListener('submit',async e=>{e.preventDefault();const msg=document.getElementById('formMsg');const btn=form.querySelector('button[type="submit"]');msg.textContent='Enviando seu pedido...';msg.style.color='#087f4b';btn.disabled=true;try{const data=await rpc('site_criar_orcamento',{p_nome:document.getElementById('nome').value.trim(),p_telefone:document.getElementById('telefone').value.trim(),p_email:document.getElementById('email').value.trim()||null,p_mensagem:document.getElementById('mensagem').value.trim()||null});const id=data.id;const selected=[...files.files].slice(0,8);let falhas=0;for(const f of selected){try{const safe=f.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=id+'/'+crypto.randomUUID()+'-'+safe;const publicUrl=await uploadPhoto('site-orcamentos',path,f);const r=await fetch(SB_URL+'/rest/v1/site_orcamento_arquivos',{method:'POST',headers:{...headers,'Prefer':'return=minimal'},body:JSON.stringify({orcamento_id:id,nome_arquivo:f.name,caminho:path,url:publicUrl})});if(!r.ok)throw new Error('Falha ao registrar foto')}catch(err){console.error('Foto:',err);falhas++}}// Aviso por e-mail (executado no servidor, sem expor a chave da Resend)
try{
  const nr=await fetch(SB_URL+'/functions/v1/send-orcamento-email',{
    method:'POST',
    headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({order_id:id})
  });
  if(!nr.ok) console.warn('Aviso de e-mail não enviado:',await nr.text());
}catch(emailErr){console.warn('Aviso de e-mail não enviado:',emailErr)}
const url=trackingUrl(data.access_token);localStorage.setItem('cs_orcamento_token',data.access_token);form.reset();preview.innerHTML='';showSavedOrder(data.access_token);msg.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:10px">✅ Pedido enviado com sucesso!</div>'+(falhas?'<div>O pedido foi recebido, mas '+falhas+' foto(s) não puderam ser anexadas.</div>':'')+'<a class="btn primary full" style="margin-top:12px" href="'+url+'">📋 Acompanhar meu pedido</a><div style="font-size:12px;margin-top:8px">Guarde este link para consultar seu pedido e conversar conosco.</div>';msg.style.color='#087f4b'}catch(err){console.error(err);msg.textContent='Não foi possível enviar o pedido agora. '+(err.message||'Verifique sua conexão e tente novamente.');msg.style.color='#b42318'}finally{btn.disabled=false}});

// Galeria real da CS Jardinagem — carregada do Supabase.
async function loadPublicGallery(){
  const grid=document.getElementById('galleryGrid'); if(!grid)return;
  try{
    const r=await fetch(SB_URL+'/rest/v1/site_galeria?select=id,titulo,url,ordem&ativo=eq.true&order=ordem.asc,criado_em.desc',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}});
    if(!r.ok)return; const rows=await r.json(); if(!rows.length)return;
    grid.innerHTML=rows.map((x,i)=>'<a class="g realGallery" href="'+String(x.url).replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" title="'+String(x.titulo||'Trabalho CS Jardinagem').replace(/"/g,'&quot;')+'"><img src="'+String(x.url).replace(/"/g,'&quot;')+'" alt="'+String(x.titulo||'Trabalho realizado pela CS Jardinagem').replace(/"/g,'&quot;')+'" loading="lazy"></a>').join('');
    const h=document.getElementById('galleryHint'); if(h)h.textContent='Alguns dos trabalhos realizados pela CS Jardinagem.';
  }catch(e){console.warn('Galeria:',e)}
}
loadPublicGallery();

async function loadSiteContent(){
 try{
  const r=await fetch(SB_URL+'/rest/v1/site_conteudo?select=chave,dados',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}});
  if(!r.ok)return; const rows=await r.json(); const cfg={}; rows.forEach(x=>cfg[x.chave]=x.dados||{});
  const h=cfg.hero||{}; const s=cfg.servicos||{}; const q=cfg.orcamento||{}; const a=cfg.sobre||{}; const ct=cfg.contato||{};
  const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.innerHTML=String(v).replace(/\n/g,'<br>')};
  set('heroEyebrow',h.eyebrow);set('heroTitle',h.titulo);set('heroDescription',h.descricao);set('heroPrimary',h.botao_principal);set('heroSecondary',h.botao_secundario);
  const hi=document.querySelector('.hero-img');if(hi&&h.hero_imagem)hi.style.backgroundImage="linear-gradient(90deg,#063b2b22,#063b2b00),url('"+String(h.hero_imagem).replace(/'/g,"%27")+"')";
  set('servicesEyebrow',s.titulo_pequeno);set('servicesTitle',s.titulo);
  const grid=document.getElementById('servicesGrid'); if(grid&&Array.isArray(s.itens)) grid.innerHTML=s.itens.map((x,i)=>'<article><div class="photo" style="background-image:url("'+String(x.imagem||'').replace(/"/g,'&quot;')+'")"></div><h3>'+String(x.titulo||'').replace(/[<>]/g,'')+'</h3><p>'+String(x.descricao||'').replace(/[<>]/g,'')+'</p></article>').join('');
  set('quoteEyebrow',q.eyebrow);set('quoteTitle',q.titulo);set('quoteDescription',q.descricao);
  const ql=document.getElementById('quoteList');if(ql&&Array.isArray(q.lista))ql.innerHTML=q.lista.map(x=>'<li>'+String(x).replace(/[<>]/g,'')+'</li>').join('');
  set('aboutEyebrow',a.eyebrow);set('aboutTitle',a.titulo);set('aboutDescription',a.descricao);
  if(ct.whatsapp){document.querySelectorAll('a.wa,footer a[href^="https://wa.me/"]').forEach(e=>e.href='https://wa.me/'+String(ct.whatsapp).replace(/\D/g,''))}
  if(ct.instagram){const e=document.querySelector('footer a[href*="instagram"]');if(e)e.href=ct.instagram}
  if(ct.google){const e=document.querySelector('footer a[href*="google.com/maps"]');if(e)e.href=ct.google}
 }catch(e){console.warn('Conteúdo do site:',e)}
}
loadSiteContent();
