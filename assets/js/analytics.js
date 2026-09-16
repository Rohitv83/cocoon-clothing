(function(){
  const sidKey='cocoon_session_id';
  const now=()=>new Date().toISOString();
  const uid=()=>{let u=localStorage.getItem('cocoon_visitor_id');if(!u){u='v_'+Math.random().toString(36).slice(2)+Date.now();localStorage.setItem('cocoon_visitor_id',u)}return u};
  const sid=()=>{let s=sessionStorage.getItem(sidKey);if(!s){s='s_'+Math.random().toString(36).slice(2)+Date.now();sessionStorage.setItem(sidKey,s)}return s};
  function send(payload){try{fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{})}catch(e){}}
  function track(type,data){send(Object.assign({type,visitor_id:uid(),session_id:sid(),page:location.pathname.split('/').pop()||'index.html',url:location.href,referrer:document.referrer||'',timestamp:now(),screen_width:screen.width,screen_height:screen.height},data||{}));}
  window.CocoonAnalytics={track};
  document.addEventListener('DOMContentLoaded',function(){
    track('pageview');
    document.addEventListener('click',function(e){const el=e.target.closest('a,button');if(!el||el.closest('#analyticsLogin'))return;const label=(el.innerText||el.getAttribute('aria-label')||el.getAttribute('data-whatsapp')||'').trim().slice(0,100);if(label&&!el.closest('form'))track('click',{element:el.tagName.toLowerCase(),label});},{passive:true});
    const form=document.querySelector('#quoteForm');
    if(form)form.addEventListener('submit',function(){track('form_submit',{form:'quoteForm',product:form.querySelector('#product')?.value||''});});
  });
})();
