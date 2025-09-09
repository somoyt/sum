
(function(){
  const API = window.API_URL || "";
  const qs = s => document.querySelector(s);
  function timeago(ts){
    if(!ts) return "";
    const diff = Date.now() - ts;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return m + " মিনিট আগে";
    if (h < 24) return h + " ঘন্টা আগে";
    if (d === 1) return "গতকাল";
    return new Date(ts).toLocaleString("bn-BD");
  }
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  fetch(API + (id? ("?id="+encodeURIComponent(id)) : ""))
    .then(r=>r.json())
    .then(d=>{
      const n = Array.isArray(d)? d[0] : d;
      if(!n || !n.title){ qs("#title").textContent="পাওয়া যায়নি"; return; }
      qs("#title").textContent = n.title;
      qs("#cat").textContent = n.category || "";
      qs("#time").textContent = timeago(n.timestamp||null);
      if(qs("#time").setAttribute) qs("#time").setAttribute("datetime", new Date(n.timestamp||Date.now()).toISOString());
      qs("#author").textContent = n.author || "";
      if(n.image){ const img=qs("#hero"); img.src=n.image; img.alt=n.title; }
      qs("#summary").textContent = n.summary || "";
      qs("#body").innerHTML = (n.body||"").replace(/\n/g,"<br>");
      // Schema extras
      const art = qs("#article");
      art.setAttribute("itemid", location.href);
      // Optional: could inject meta tags for SEO here if needed
    })
    .catch(_=>{ qs("#title").textContent="লোড করতে সমস্যা হয়েছে"; });

  const themeBtn = document.getElementById("toggleTheme");
  if(localStorage.getItem("somoy-theme")==="dark") document.body.classList.add("dark");
  themeBtn && themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("somoy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
})();


// ===== Reading Mode Toggle =====
(function(){
  const btn = document.createElement('button'); btn.id='readingModeBtn'; btn.textContent='Reading Mode';
  const art = document.querySelector('article'); if(art){ art.parentNode.insertBefore(btn, art); }
  btn.addEventListener('click',()=>{ document.body.classList.toggle('reading-mode'); });
})();
// ===== Continue Reading (save scroll) =====
(function(){
  const key='readpos:'+location.search;
  window.addEventListener('beforeunload',()=>{ localStorage.setItem(key, window.scrollY); });
  window.addEventListener('load',()=>{
    const y = +localStorage.getItem(key)||0;
    if(y>0) setTimeout(()=>window.scrollTo(0,y), 100);
  });
})();
// ===== Sticky Share responsive =====
(function(){
  const bar=document.createElement('div'); bar.className='sticky-share';
  bar.innerHTML=`<button data-s='fb'>f</button><button data-s='tw'>x</button><button data-s='wa'>wa</button><button data-s='cp'>⧉</button><button id='bmBtn'>★</button>`;
  document.body.appendChild(bar);
  bar.addEventListener('click',(e)=>{
    const b=e.target.closest('button'); if(!b) return;
    const u=location.href;
    if(b.dataset.s==='fb') window.open('https://facebook.com/sharer/sharer.php?u='+u,'_blank');
    if(b.dataset.s==='tw') window.open('https://twitter.com/intent/tweet?url='+u,'_blank');
    if(b.dataset.s==='wa') window.open('https://wa.me/?text='+u,'_blank');
    if(b.dataset.s==='cp'){ navigator.clipboard.writeText(u); toast('Link copied'); }
  });
  // Bookmark current
  const bmBtn = bar.querySelector('#bmBtn');
  bmBtn.addEventListener('click',()=>{
    const title=document.querySelector('h1, .title')?.textContent||document.title;
    const id=new URLSearchParams(location.search).get('id')||location.href;
    addBookmark({id, title, url:location.href});
  });
})();
// ===== TOC Collapse Mobile =====
(function(){
  const toc=document.getElementById('toc'); if(!toc) return;
  const btn=document.createElement('button'); btn.textContent='TOC'; btn.className='toc-toggle';
  toc.parentNode.insertBefore(btn, toc);
  function update(){
    if(window.innerWidth<700){ toc.style.display='none'; btn.style.display='inline-block'; }
    else { toc.style.display='block'; btn.style.display='none'; }
  }
  btn.addEventListener('click',()=>{ toc.style.display = (toc.style.display==='none'?'block':'none'); });
  window.addEventListener('resize',update); update();
})();


// Floating share actions & bookmark
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.floating-share button[data-share]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const u=location.href;
      if(b.dataset.share==='fb') window.open('https://facebook.com/sharer/sharer.php?u='+u,'_blank');
      if(b.dataset.share==='tw') window.open('https://twitter.com/intent/tweet?url='+u,'_blank');
      if(b.dataset.share==='wa') window.open('https://wa.me/?text='+u,'_blank');
    });
  });
  const bm = document.getElementById('bookmarkBtn');
  if(bm){
    bm.addEventListener('click', ()=>{
      const title=document.querySelector('h1')?.innerText || document.title;
      const id=new URLSearchParams(location.search).get('id') || location.href;
      addBookmark({id, title, url:location.href});
      toast('Saved to bookmarks');
    });
  }
});
// Smooth reveal animations for cards
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.latest-item, .card').forEach((el,i)=>{
    el.style.opacity=0; el.style.transform='translateY(6px)';
    setTimeout(()=>{ el.style.transition='opacity .4s ease, transform .4s ease'; el.style.opacity=1; el.style.transform='translateY(0)'; }, 80*i);
  });
});
