
(function(){
  const API = window.API_URL || "";
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Font + Dark
  const root = document.documentElement;
  function setFS(delta){
    const now = parseFloat(getComputedStyle(root).getPropertyValue("--fs"));
    root.style.setProperty("--fs", Math.min(22, Math.max(14, now + delta)) + "px");
  }
  const fMinus = qs("#fontMinus"), fPlus = qs("#fontPlus");
  fMinus && fMinus.addEventListener("click", ()=>setFS(-1));
  fPlus && fPlus.addEventListener("click", ()=>setFS(+1));
  const themeBtn = qs("#toggleTheme");
  if(localStorage.getItem("somoy-theme")==="dark") document.body.classList.add("dark");
  themeBtn && themeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("somoy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  function timeago(ts){
    if(!ts) return "";
    const diff = Date.now()-ts;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return m + " মিনিট আগে";
    if (h < 24) return h + " ঘন্টা আগে";
    if (d === 1) return "গতকাল";
    return new Date(ts).toLocaleString("bn-BD");
  }
  function imgTag(n, w, h){
    const src = n.image ? n.image : "";
    const alt = n.title || "";
    const attrs = ['loading="lazy"'];
    if(w&&h) attrs.push(`width="${w}" height="${h}"`);
    return src ? `<img src="${src}" alt="${alt}" ${attrs.join(" ")}>` : "";
  }

  function rowItem(n){
    return `<a class="row" href="news.html?id=${n.id}">${imgTag(n,160,100)}<div><div class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</div><h4>${n.title}</h4><div class="meta">${n.summary||""}</div></div></a>`;
  }
  function plainItem(n){
    return `<a href="news.html?id=${n.id}"><span class="meta"><span class="badge">${n.category||""}</span> · ${timeago(n.timestamp)}</span><br>${n.title}</a>`;
  }

  async function fetchList(limit=60){
    const res = await fetch(API + "?limit=" + limit);
    return await res.json();
  }

  function buildTicker(list){
    const track = list.slice(0,8).map(n=>`<span>• ${n.title}</span>`).join("");
    const ticker = qs("#breaking");
    if(ticker) ticker.innerHTML = `<span class="track">${track}&nbsp;&nbsp;&nbsp;${track}</span>`;
  }

  function buildHero(list){
    const big = qs("#heroBig");
    const small = qs("#heroList");
    if(!big || !small) return;
    const top = list[0];
    const next4 = list.slice(1,5);
    if(top){
      big.innerHTML = `<a href="news.html?id=${top.id}">${imgTag(top)}<h2 class="item-title">${top.title}</h2><div class="meta">${top.summary||""}</div></a>`;
    }
    if(next4.length){
      small.innerHTML = `<div class="mini">` + next4.map(n=>`<a href="news.html?id=${n.id}">${imgTag(n,120,70)}<div><div class="meta">${timeago(n.timestamp)}</div><strong>${n.title}</strong></div></a>`).join("") + `</div>`;
    }
  }

  function buildTrending(list){
    const el = qs("#trending");
    if(!el) return;
    el.innerHTML = list.slice(0,8).map(plainItem).join("");
  }

  function buildCategories(list){
    const wrap = qs("#categories");
    if(!wrap) return;
    const cats = ["জাতীয়","আন্তর্জাতিক","খেলা","অর্থনীতি","বিনোদন","মতামত","প্রযুক্তি"];
    wrap.innerHTML = "";
    cats.forEach(cat=>{
      const items = list.filter(n=>(n.category||"").trim()===cat).slice(0,6);
      if(!items.length) return;
      const html = `<section><h2 class="section-title">${cat}</h2><div class="list-rows">`+items.map(rowItem).join("")+`</div></section>`;
      wrap.insertAdjacentHTML("beforeend", html);
    });
  }

  async function init(){
    let list = await fetchList(80);
    if(!Array.isArray(list)) list = [];
    buildTicker(list);
    buildHero(list);
    buildTrending(list);

    // Latest with pagination
    const latest = qs("#latest");
    let page = 1, per = 10;
    const render = ()=>{
      const slice = list.slice((page-1)*per, page*per);
      latest.insertAdjacentHTML("beforeend", slice.map(rowItem).join(""));
    };
    render();
    const btn = qs("#infiniteLoader");
    btn && btn.addEventListener("click", ()=>{ page++; render(); if(page*per >= list.length) btn.remove(); });

    buildCategories(list);

    // Search
    const si = qs("#searchInput");
    if(si){
      si.addEventListener("input", ()=>{
        const q = si.value.trim().toLowerCase();
        const filtered = list.filter(n =>
          (n.title||"").toLowerCase().includes(q) ||
          (n.summary||"").toLowerCase().includes(q) ||
          (n.body||"").toLowerCase().includes(q));
        latest.innerHTML = filtered.slice(0,30).map(rowItem).join("");
      });
    }

    // Category filter from header
    qsa(".nav a[data-cat]").forEach(a=>{
      a.addEventListener("click",(e)=>{
        e.preventDefault();
        qsa(".nav a").forEach(x=>x.classList.remove("active"));
        a.classList.add("active");
        const cat = a.dataset.cat;
        let filtered = list;
        if(cat && cat!=="all") filtered = list.filter(n => (n.category||"").trim()===cat);
        latest.innerHTML = filtered.slice(0,20).map(rowItem).join("");
      });
    });
  }
  init();
})();

// Animate brand logo watch hands
function animateBrandWatch(){
  const h=document.querySelector('.hand.hour'),m=document.querySelector('.hand.minute'),s=document.querySelector('.hand.second');
  if(!h||!m||!s) return;
  function tick(){
    const now=new Date();const sec=now.getSeconds();const min=now.getMinutes()+sec/60;const hr=(now.getHours()%12)+min/60;
    h.style.transform=`translate(-50%,-100%) rotate(${hr*30}deg)`;
    m.style.transform=`translate(-50%,-100%) rotate(${min*6}deg)`;
    s.style.transform=`translate(-50%,-100%) rotate(${sec*6}deg)`;
  }
  tick();setInterval(tick,1000);
}
animateBrandWatch();


// News Load
async function loadNews(){
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxkMGLm--5BQgQCFvG40Qs5d2NShHtc9N6LXQuB7o1IVBFZlllNqvjxcXijusWfpVQw/exec?limit=20");
    const data = await res.json();
    const container = document.getElementById("news-list");
    if(container && data && data.length){
      container.innerHTML = data.map(n=>`
        <article class="news-item">
          ${n.image ? `<img src="${n.image}" alt="">` : ""}
          <h2>${n.title}</h2>
          <p>${n.summary}</p>
          <small>${n.category} • ${new Date(n.timestamp).toLocaleString()}</small>
        </article>
      `).join("");
    }
  } catch(err){
    console.error("News load failed", err);
  }
}
document.addEventListener("DOMContentLoaded", loadNews);


// Render Hero Section
function renderHero(articles){
  const hero = document.getElementById("hero-container");
  if(!hero) return;
  hero.innerHTML = "";
  if(!articles.length) return;
  if(articles[0].image){
    // 1 big + 4 small
    const big = articles[0];
    hero.innerHTML += `<div class="big"><img src="${big.image}" alt=""><h2>${big.title}</h2><span class="badge">${big.category}</span><span class="timeago" data-time="${big.time}"></span></div>`;
    articles.slice(1,5).forEach(a => {
      hero.innerHTML += `<div><img src="${a.image}" alt=""><h3>${a.title}</h3><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
  } else {
    // 2 big text only + row list
    articles.slice(0,2).forEach(a => {
      hero.innerHTML += `<div class="big"><h2>${a.title}</h2><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
    const rest = articles.slice(2,6);
    rest.forEach(a => {
      hero.innerHTML += `<div><h3>${a.title}</h3><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
    });
  }
}

// Render Latest News
function renderLatest(articles){
  const latest = document.getElementById("latest-list");
  if(!latest) return;
  latest.innerHTML = "";
  articles.forEach(a => {
    latest.innerHTML += `<div class="news-item"><h4>${a.title}</h4><span class="badge">${a.category}</span><span class="timeago" data-time="${a.time}"></span></div>`;
  });
}

// Simple timeago
function updateTimeago(){
  document.querySelectorAll(".timeago").forEach(el => {
    const t = new Date(el.dataset.time);
    const diff = Math.floor((Date.now()-t)/60000);
    if(diff<1) el.innerText = "Just now";
    else if(diff<60) el.innerText = diff+" min ago";
    else el.innerText = Math.floor(diff/60)+"h ago";
  });
}
setInterval(updateTimeago,60000);

// Breaking ticker slow
const ticker = document.querySelector(".breaking-ticker");
if(ticker){
  let i=0;
  setInterval(()=>{
    const items = ticker.querySelectorAll("li");
    items.forEach((el,idx)=>el.style.display=(idx===i?"inline":"none"));
    i=(i+1)%items.length;
  },80000); // 80s
}


// Search box direct redirect
const searchInput = document.getElementById("searchInput");
if(searchInput){
  searchInput.addEventListener("keydown", async (e)=>{
    if(e.key==="Enter"){
      const q = searchInput.value.trim().toLowerCase();
      if(!q) return;
      try{
        let res = await fetch(API_URL);
        let data = await res.json();
        let found = data.find(n=>n.title.toLowerCase().includes(q));
        if(found){
          window.location.href = `news.html?id=${found.id}`;
        } else {
          alert("খবর পাওয়া যায়নি!");
        }
      }catch(err){console.error(err)}
    }
  });
}

// Smooth scroll for header category links
document.querySelectorAll('header nav a[href^="#"]').forEach(link=>{
  link.addEventListener("click", e=>{
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if(target){
      target.scrollIntoView({behavior:"smooth"});
    }
  });
});


// Update badge demo
function showUpdateBadge(news){
  if(news.lastUpdated){
    document.getElementById("updateBadge").innerText = "Updated • " + news.lastUpdated;
  }
}

// Build TOC
function buildTOC(){
  const content=document.getElementById("newsContent");
  const headers=content.querySelectorAll("h2");
  const toc=document.getElementById("toc");
  toc.innerHTML="";
  headers.forEach(h=>{
    const a=document.createElement("a");
    a.textContent=h.innerText;
    a.href="#"+h.id;
    a.onclick=e=>{e.preventDefault();h.scrollIntoView({behavior:"smooth"})};
    toc.appendChild(a);
    toc.appendChild(document.createElement("br"));
  });
}

// Summary (simple extractive demo)
document.getElementById("summaryBtn").addEventListener("click",()=>{
  const text=document.getElementById("newsContent").innerText;
  const parts=text.split(/[.?!]/).filter(s=>s.trim().length>30).slice(0,3);
  document.getElementById("summaryBox").innerHTML="<ul>"+parts.map(p=>"<li>"+p.trim()+"</li>").join("")+"</ul>";
});

// Poll demo
let votes={yes:0,no:0};
document.querySelectorAll(".poll-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    votes[btn.dataset.vote]++;
    document.getElementById("pollResult").innerText="Yes: "+votes.yes+" | No: "+votes.no;
  });
});

// Related carousel demo (reuse related)
function buildRelatedCarousel(related){
  const box=document.getElementById("relatedCarousel");
  box.innerHTML=related.map(r=>cardTemplate(r)).join("");
}

// TTS
document.getElementById("ttsBtn").addEventListener("click",()=>{
  const text=document.getElementById("newsContent").innerText;
  const utter=new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utter);
});

// Comments with localStorage
let comments=JSON.parse(localStorage.getItem("comments")||"[]");
function renderComments(){
  const list=document.getElementById("cList");
  list.innerHTML=comments.map(c=>"<div class='comment-item'><b>"+c.name+"</b>: "+c.text+"</div>").join("");
}
document.getElementById("cPost").addEventListener("click",()=>{
  const name=document.getElementById("cName").value;
  const text=document.getElementById("cText").value;
  if(name&&text){
    comments.push({name,text});
    localStorage.setItem("comments",JSON.stringify(comments));
    renderComments();
  }
});
renderComments();


// ===== Enhanced Search Suggestions =====
(function(){
  const input = document.getElementById('searchInput');
  if(!input) return;
  const box = document.createElement('div');
  box.id = 'searchSuggest';
  box.setAttribute('role','listbox');
  box.style.position='absolute'; box.style.background='#fff'; box.style.border='1px solid #ddd'; box.style.width=input.offsetWidth+'px'; box.style.maxHeight='260px'; box.style.overflowY='auto'; box.style.zIndex='9999'; box.style.display='none';
  input.parentElement.style.position='relative';
  input.parentElement.appendChild(box);
  let cache=[]; let sel=-1;
  async function ensureData(){
    if(cache.length) return cache;
    const res = await fetch(window.API_URL); cache = await res.json(); return cache;
  }
  function render(items){
    if(!items.length){ box.style.display='none'; return; }
    box.innerHTML = items.slice(0,8).map((n,i)=>`<div class="sg-item" role="option" data-id="${n.id}" style="padding:6px 8px;cursor:pointer;${i===sel?'background:#f7f7f7':''}">${n.title}</div>`).join('');
    box.style.display='block';
  }
  input.addEventListener('input', async ()=>{
    const q=input.value.trim().toLowerCase(); sel=-1;
    if(!q){ box.style.display='none'; return; }
    const data = await ensureData();
    const items = data.filter(n => (n.title||'').toLowerCase().includes(q));
    render(items);
  });
  input.addEventListener('keydown', e=>{
    const items = Array.from(box.querySelectorAll('.sg-item'));
    if(e.key==='ArrowDown'){ sel=Math.min(items.length-1, sel+1); e.preventDefault(); render(items.map((it,i)=>({id:it.dataset.id,title:it.textContent}))); }
    if(e.key==='ArrowUp'){ sel=Math.max(0, sel-1); e.preventDefault(); render(items.map((it,i)=>({id:it.dataset.id,title:it.textContent}))); }
    if(e.key==='Enter'){
      if(sel>=0 && items[sel]){ window.location.href=`news.html?id=${items[sel].dataset.id}`; }
    }
  });
  box.addEventListener('click', e=>{
    const el = e.target.closest('.sg-item'); if(!el) return;
    window.location.href = `news.html?id=${el.dataset.id}`;
  });
})();
// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e)=>{
  if(e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA') return;
  if(e.key==='/'){ const i=document.getElementById('searchInput'); if(i){ i.focus(); e.preventDefault(); } }
  if(e.key==='g'){ window.scrollTo({top:0,behavior:'smooth'}); }
  if(e.key==='j'){ window.scrollBy({top:400,behavior:'smooth'}); }
  if(e.key==='k'){ window.scrollBy({top:-400,behavior:'smooth'}); }
});


// ===== Skeleton Loader =====
function showSkeleton(container, count=5, type='row'){
  const html = Array.from({length:count}).map(()=>`<div class="skeleton ${type}"></div>`).join('');
  container.innerHTML = html;
}
// ===== Image fallback =====
function safeImg(src, alt=''){
  if(!src) return '';
  return `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.parentNode.classList.add('text-only'); this.remove();">`;
}
// ===== Bookmarks (Read Later) =====
const BM_KEY='somoy_bookmarks';
function getBookmarks(){ try{return JSON.parse(localStorage.getItem(BM_KEY)||'[]')}catch(e){return[]} }
function addBookmark(item){ const b=getBookmarks(); if(!b.find(x=>x.id===item.id)){ b.push(item); localStorage.setItem(BM_KEY, JSON.stringify(b)); toast('Saved for later'); } }
function removeBookmark(id){ const b=getBookmarks().filter(x=>x.id!==id); localStorage.setItem(BM_KEY, JSON.stringify(b)); toast('Removed'); }
function toast(msg){ let t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); } t.textContent=msg; t.className='show'; setTimeout(()=>t.className='', 2000); }


// ===== RSS Export =====
(function(){
  const btn=document.getElementById('rssExportBtn'); if(!btn) return;
  btn.addEventListener('click', async ()=>{
    const res=await fetch(window.API_URL); const data=await res.json();
    const items = data.slice(0,50).map(n=>`
      <item>
        <title>${(n.title||'').replace(/&/g,'&amp;')}</title>
        <link>${location.origin + location.pathname.replace('index.html','news.html') + '?id=' + n.id}</link>
        <description><![CDATA[${n.summary||''}]]></description>
        <pubDate>${new Date(n.timestamp||Date.now()).toUTCString()}</pubDate>
        <guid>${n.id}</guid>
      </item>`).join('');
    const rss = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>SomoyTime</title><link>${location.href}</link><description>Latest news</description>${items}</channel></rss>`;
    const blob = new Blob([rss],{type:'application/rss+xml'});
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='somoytime.xml'; a.click(); URL.revokeObjectURL(url);
  });
})();


// ===== ScrollSpy for Header Categories =====
(function(){
  const links = document.querySelectorAll('header nav a[href^="#"]');
  const sections = Array.from(links).map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    let pos = window.scrollY+100;
    sections.forEach((sec,i)=>{
      if(sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos){
        links.forEach(l=>l.classList.remove('active'));
        links[i].classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
})();


// ===== Sticky Shrink Header =====
(function(){
  const header = document.querySelector('header');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 60){
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });
})();

// ===== Live Search Suggestions =====
(function(){
  const searchInput = document.querySelector('header input[type="search"], header input[type="text"]');
  if(!searchInput) return;
  const suggestionBox = document.createElement('div');
  suggestionBox.className = 'search-suggestions';
  searchInput.parentNode.appendChild(suggestionBox);
  let timer;
  searchInput.addEventListener('input', ()=>{
    clearTimeout(timer);
    const q = searchInput.value.trim();
    if(q.length < 2){ suggestionBox.style.display='none'; return; }
    timer = setTimeout(()=>{
      fetch(API_URL)
        .then(r=>r.json())
        .then(data=>{
          suggestionBox.innerHTML = '';
          let shown = 0;
          data.forEach(item=>{
            if(item.title.toLowerCase().includes(q.toLowerCase()) && shown < 5){
              const div = document.createElement('div');
              div.textContent = item.title;
              div.addEventListener('click', ()=>{
                window.location.href = 'news.html?id='+item.id;
              });
              suggestionBox.appendChild(div);
              shown++;
            }
          });
          suggestionBox.style.display = shown ? 'block':'none';
        });
    }, 300);
  });
  document.addEventListener('click', e=>{
    if(!suggestionBox.contains(e.target) && e.target!==searchInput){
      suggestionBox.style.display='none';
    }
  });
})();


/* FINAL PRO FEATURES */
// Estimated reading time & QuickFacts populate (on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function(){
  // Reading time
  const article = document.querySelector('article');
  if(article){
    const text = article.innerText || '';
    const words = text.trim().split(/\s+/).length || 0;
    const mins = Math.max(1, Math.round(words / 200));
    const rt = document.getElementById('readingTime');
    if(rt) rt.textContent = '⏱ ' + mins + ' min read';

    // QuickFacts: try to load from element with data-quickfacts attribute (if news renderer sets it)
    const qf = article.getAttribute('data-quickfacts') || '';
    if(qf && qf.trim()){
      const qfe = document.getElementById('quickFacts');
      qfe.style.display = 'block';
      qfe.innerHTML = '<strong>Quick facts:</strong><ul>' + qf.split('|').map(s=>'<li>'+s.trim()+'</li>').join('') + '</ul>';
    }
  }

  // Next/Prev preview: look for window.NEXT_PREV provided by renderer
  const np = window.NEXT_PREV || {};
  const npEl = document.getElementById('nextPrevPreview');
  if(npEl && (np.prev || np.next)){
    npEl.innerHTML = (np.prev?'<div class="preview"><a href="news.html?id='+np.prev.id+'"><img src="'+(np.prev.image||'assets/img/og.png')+'"><div>'+np.prev.title+'</div></a></div>':'') +
                     (np.next?'<div class="preview"><a href="news.html?id='+np.next.id+'"><img src="'+(np.next.image||'assets/img/og.png')+'"><div>'+np.next.title+'</div></a></div>':'');
  }

  // Load reaction counts and render
  const id = new URLSearchParams(location.search).get('id') || location.pathname;
  const key = 'reacts:'+id;
  const stored = JSON.parse(localStorage.getItem(key) || '{"like":0,"love":0,"angry":0,"sad":0}');
  document.querySelectorAll('.reactions .react').forEach(btn=>{
    const type = btn.dataset.react;
    btn.querySelector('.count').textContent = stored[type] || 0;
    btn.addEventListener('click', ()=>{
      stored[type] = (stored[type]||0) + 1;
      localStorage.setItem(key, JSON.stringify(stored));
      btn.querySelector('.count').textContent = stored[type];
      toast('Thanks for your reaction');
    });
  });
});

// Toast util (idempotent)
function toast(msg){ let t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t);} t.textContent=msg; t.className='show'; setTimeout(()=>t.className='',2000); }

// Text-to-Speech controls
let synthUtter=null;
document.getElementById && document.getElementById('ttsPlay') && (function(){
  const play = document.getElementById('ttsPlay');
  const pause = document.getElementById('ttsPause');
  const speed = document.getElementById('ttsSpeed');
  play.addEventListener('click', ()=>{
    if(speechSynthesis.speaking) speechSynthesis.cancel();
    const content = document.querySelector('article').innerText || document.body.innerText;
    synthUtter = new SpeechSynthesisUtterance(content);
    synthUtter.rate = parseFloat(speed.value || 1);
    speechSynthesis.speak(synthUtter);
  });
  pause.addEventListener('click', ()=>{ if(speechSynthesis.speaking) speechSynthesis.pause(); });
  speed.addEventListener('input', ()=>{ if(synthUtter) synthUtter.rate = parseFloat(speed.value); });
})();

// Voice Search (Web Speech API) - header
(function(){
  const vbtn = document.getElementById('voiceSearchBtn');
  const input = document.getElementById('searchInput');
  if(!vbtn || !input) return;
  let recognition=null;
  try{
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }catch(e){ recognition = null; vbtn.style.display='none'; }
  if(!recognition) return;
  vbtn.addEventListener('click', ()=>{
    recognition.start();
    vbtn.textContent = '🎙️...';
  });
  recognition.onresult = (e)=>{
    const text = e.results[0][0].transcript || '';
    input.value = text;
    input.dispatchEvent(new Event('input'));
    vbtn.textContent = '🎤';
    // Auto search & go to article if match
    setTimeout(async ()=>{
      try{
        const res = await fetch(window.API_URL);
        const data = await res.json();
        const found = data.find(n=> (n.title||'').toLowerCase().includes(text.toLowerCase()));
        if(found) window.location.href = 'news.html?id='+found.id;
      }catch(err){console.error(err)}
    }, 400);
  };
  recognition.onerror = ()=>{ vbtn.textContent='🎤'; };
})();


// ===== Infinite Scroll Loader =====
(function(){
  const listEl = document.getElementById('latest');
  if(!listEl) return;
  let page = 0, per = 15, items = [];
  async function fetchAll(){
    try{
      const res = await fetch(window.API_URL + '?limit=200');
      items = await res.json();
      render();
    }catch(e){ console.error(e); }
  }
  function render(){
    const slice = items.slice(0, (page+1)*per);
    listEl.innerHTML = slice.map(n=>{
      const img = n.image ? `<img src="${n.image}" alt="">` : '';
      const textOnly = n.image ? '' : 'text-only';
      return `<a class="latest-item ${textOnly}" href="news.html?id=${n.id}">${img}<div><div class="card-title">${n.title}</div><div class="card-meta">${n.category} · ${new Date(n.timestamp).toLocaleString()}</div><p>${n.summary||''}</p></div></a>`;
    }).join('');
    if((page+1)*per >= items.length){ observer.disconnect(); }
  }
  const sentinel = document.createElement('div'); sentinel.id='infiniteLoader';
  listEl.parentNode.appendChild(sentinel);
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ page++; render(); } });
  }, {rootMargin:'200px'});
  observer.observe(sentinel);
  fetchAll();
})();
