let pharmacies = 
[
  {
    id:'nahda', name:'صيدلية النهضة', doctor:'د. محمد علي',
    address:'شارع الجامعة، المعادي، القاهرة', distance:0.8, hours:'8 ص — 12 م',
    meds:320, rating:4.8, reviews:312, status:'open', phone:'02-25261234',
    tags:['مضادات حيوية','فيتامينات','مسكنات'],
    accent:'#2f8f5b', icon:'cross', photo:'../../assets/images/nahda.jpg'
  },
  {
    id:'shifa', name:'صيدلية الشفاء', doctor:'د. سارة أحمد',
    address:'ميدان الحرية، مدينة نصر، القاهرة', distance:1.2, hours:'9 ص — 11 م',
    meds:280, rating:4.6, reviews:198, status:'open', phone:'02-24021234',
    tags:['هضمي','نزلات برد','أطفال'],
    accent:'#3d7ec9', icon:'bottle', photo:'../../assets/images/shifa.jpg'
  },
  {
    id:'hayah', name:'صيدلية الحياة', doctor:'د. خالد محمود',
    address:'شارع 9، المعادي، القاهرة', distance:2.1, hours:'10 ص — 10 م',
    meds:210, rating:4.4, reviews:87, status:'closed', phone:'02-25253456',
    tags:['مكملات غذائية','أمراض مزمنة'],
    accent:'#b1793a', icon:'capsule', photo:'../../assets/images/hayah.jpg'
  },
  {
    id:'salama', name:'صيدلية السلامة', doctor:'د. نور إبراهيم',
    address:'شارع التحرير، الدقي، الجيزة', distance:3.5, hours:'8 ص — 2 ص',
    meds:400, rating:4.7, reviews:255, status:'open', phone:'02-33442211',
    tags:['فيتامينات','جلدية','مضادات حيوية'],
    accent:'#8a5fc9', icon:'mortar', photo:'../../assets/images/salama.jpg'
  },
  {
    id:'amal', name:'صيدلية الأمل', doctor:'د. أحمد يوسف',
    address:'شارع جسر السويس، مصر الجديدة', distance:4, hours:'9 ص — 9 م',
    meds:150, rating:4.2, reviews:64, status:'closed', phone:'02-24551234',
    tags:['عين','أنف وأذن','جهاز هضمي'],
    accent:'#c9527d', icon:'pill', photo:'../../assets/images/amal.jpg'
  },
  {
    id:'reaya', name:'صيدلية الرعاية', doctor:'د. ياسمين سعد',
    address:'شارع البحر الأعظم، الجيزة', distance:4.8, hours:'24 ساعة',
    meds:520, rating:4.9, reviews:420, status:'open', phone:'02-33215678',
    tags:[],
    accent:'#1a9c5c', icon:'shelf', photo:'../../assets/images/reaya.jpg'
  }
];

const icons = 
{
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  pill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.5 2.1L7.9 9.7a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2.1z"/></svg>'
};


const illustrationGlyphs = 
{
  cross:'<path d="M0 -22 h14 v14 h14 v14 h-14 v14 h-14 v-14 h-14 v-14 h14 z" />',
  bottle:'<path d="M-9 -24 h18 v8 l5 8 v28 a4 4 0 01-4 4 h-20 a4 4 0 01-4-4 v-28 l5-8 z" fill="none" stroke-width="3"/><rect x="-9" y="-24" width="18" height="8" rx="1"/><line x1="-13" y1="8" x2="13" y2="8" stroke-width="3"/>',
  capsule:'<rect x="-22" y="-9" width="44" height="18" rx="9" transform="rotate(-30)"/><line x1="-6" y1="-15" x2="6" y2="15" stroke-width="2.5" transform="rotate(-30)"/>',
  mortar:'<path d="M-20 0 a20 16 0 0040 0 z"/><ellipse cx="0" cy="0" rx="20" ry="6" fill-opacity="0.55"/><line x1="10" y1="-18" x2="-6" y2="4" stroke-width="4" stroke-linecap="round"/><circle cx="12" cy="-20" r="3.5"/>',
  pill:'<circle cx="0" cy="0" r="20"/><path d="M-20 0 a20 20 0 0140 0z" fill-opacity="0.55"/>',
  shelf:'<rect x="-24" y="-22" width="48" height="10" rx="1.5"/><rect x="-24" y="-6" width="48" height="10" rx="1.5"/><rect x="-24" y="10" width="48" height="10" rx="1.5"/><rect x="-19" y="-20" width="6" height="6" fill-opacity="0.5"/><rect x="-8" y="-20" width="6" height="6" fill-opacity="0.5"/><rect x="3" y="-20" width="6" height="6" fill-opacity="0.5"/>'
};

function pharmacyIllustration(p, big)
{
  const size = big ? 300 : 220;
  const strokeW = big ? 1.5 : 1.2;
  return `
    <svg class="illustration" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
      <defs>
        <linearGradient id="g-${p.id}${big?'-b':''}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${p.accent}" stop-opacity="0.16"/>
          <stop offset="1" stop-color="${p.accent}" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g-${p.id}${big?'-b':''})"/>
      <g transform="translate(${size/2} ${size/2})" fill="${p.accent}" fill-opacity="0.85" stroke="${p.accent}" stroke-opacity="0.85">
        ${illustrationGlyphs[p.icon]}
      </g>
    </svg>`;
}

let openOnly = false;
let sortKey = 'distance';
let selectedId = null;

function avgRating()
{
  const sum = pharmacies.reduce((a,p)=>a+p.rating,0);
  return (sum/pharmacies.length).toFixed(1);
}

function renderTopPanel()
{
  const topPanel = document.getElementById('topPanel');
  if(!selectedId)
    {
    topPanel.classList.remove('detail-panel');
    topPanel.innerHTML = `
      <div class="pin-icon">${icons.pin}</div>
      <p class="panel-title">اختر صيدلية</p>
      <p class="panel-sub">انقر على أي صيدلية لعرض التفاصيل</p>
      <div class="stat-row">
        <span class="value">${pharmacies.length}</span>
        <span class="label">إجمالي الصيدليات</span>
      </div>
      <div class="stat-row">
        <span class="value green">${pharmacies.filter(p=>p.status==='open').length}</span>
        <span class="label">المفتوحة الآن</span>
      </div>
      <div class="stat-row">
        <span class="value star">${avgRating()} ★</span>
        <span class="label">متوسط التقييم</span>
      </div>`;
    return;
  }
  const p = pharmacies.find(x=>x.id===selectedId);
  topPanel.classList.add('detail-panel');
  topPanel.innerHTML = `
    <div class="detail-photo"><img src="${p.photo}" alt="${p.name}"></div>
    <div class="detail-body">
      <p class="detail-name">${p.name}</p>
      <div class="detail-rating">${p.rating} ★ <span class="count">(${p.reviews} تقييم)</span></div>
      <div class="detail-row">${icons.pin}${p.address}</div>
      <div class="detail-row">${icons.clock}${p.hours}</div>
      <div class="detail-row">${icons.phone}${p.phone}</div>
      <div class="detail-row">${icons.pill}${p.meds} دواء متاح</div>
      <button class="detail-btn" id="BTN">ابحث عن دواء هنا</button>
    </div>`;
     // ***************************************************
    let BTN=document.getElementById("BTN")
    BTN.addEventListener("click",function(e){
      e.stopPropagation()
       window.location.href='medicines.html'
    })
    // ***************************************************
}

function renderOpenNowList()
{
  const wrap = document.getElementById('openNowList');
  const openList = pharmacies.filter(p=>p.status==='open');
  wrap.innerHTML = openList.map(p=>`
    <div class="open-item" data-id="${p.id}">
      <div>
        <div class="name">${p.name}</div>
        <div class="hours">${p.hours}</div>
      </div>
      <div class="dist">${p.distance} كم</div>
    </div>`).join('');
  wrap.querySelectorAll('.open-item').forEach(el=>{
    el.addEventListener('click', ()=> selectPharmacy(el.dataset.id));
  });
}

function getSorted(list)
{
  const arr = [...list];
  if(sortKey==='distance') arr.sort((a,b)=>a.distance-b.distance);
  if(sortKey==='rating') arr.sort((a,b)=>b.rating-a.rating);
  if(sortKey==='meds') arr.sort((a,b)=>b.meds-a.meds);
  return arr;
}

function renderList()
{
  const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
  let list = pharmacies.filter(p=>{
    if(openOnly && p.status!=='open') return false;
    if(searchTerm && !(p.name.toLowerCase().includes(searchTerm) || p.address.toLowerCase().includes(searchTerm))) return false;
    return true;
  });
  list = getSorted(list);

  document.getElementById('resultCount').textContent = `يُعرض ${list.length} صيدلية`;

  const container = document.getElementById('pharmacyList');
  container.innerHTML = list.map(p=>`
    <div class="card ${selectedId===p.id?'selected':''}" data-id="${p.id}">
      <div class="card-main">
        <div class="card-info">
          <span class="badge ${p.status==='open'?'open':'closed'}">
            ${p.status==='open'?icons.check:icons.close}
            ${p.status==='open'?'مفتوحة':'مغلقة'}
          </span>
          <h3 class="card-title">${p.name}</h3>
          <p class="card-doctor">${p.doctor}</p>
          <p class="card-address">${icons.pin}${p.address}</p>
          <div class="card-meta">
            <span class="item">${icons.pin}${p.distance} كم</span>
            <span class="item">${icons.clock}${p.hours}</span>
            <span class="item">${icons.pill}دواء</span>
            <span class="item rating">${p.meds}</span>
            <span class="item">(${p.reviews}) <span class="star">${p.rating} ★</span></span>
          </div>
        </div>
        <div class="card-photo"><img src="${p.photo}" alt="${p.name}"></div>
      </div>
      <div class="card-expand">
        <div class="tag-row">
          ${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}
          ${p.tags.length===0?'<a href="#" class="all-specialties" onclick="return false;">جميع التخصصات</a>':''}
        </div>
        <div class="action-row">
          <button class="search-med-btn" >ابحث عن دواء في هذه الصيدلية</button>
          <button class="call-btn">${icons.phone}${p.phone}</button>
        </div>
      </div>
    </div>`).join('');

  container.querySelectorAll('.card').forEach(el=>{
    el.addEventListener('click', ()=> selectPharmacy(el.dataset.id));
  });
  // ***********************************************************
  container.querySelectorAll(".search-med-btn").forEach(btn=>{
  btn.addEventListener("click",function(e){
    e.stopPropagation()
    window.location.href='medicines.html'
  })
})
  // ***********************************************************
}

function selectPharmacy(id)
{
  selectedId = id;
  renderTopPanel();
  renderList();
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if(card) card.scrollIntoView({behavior:'smooth', block:'nearest'});
}

const filterBtn = document.getElementById('filterBtn');
const openFilterRow = document.getElementById('openFilterRow');
filterBtn.addEventListener('click', ()=>
{
  filterBtn.classList.toggle('active');
  openFilterRow.classList.toggle('show');
});


const openSwitch = document.getElementById('openSwitch');
openSwitch.addEventListener('click', ()=>
{
  openOnly = !openOnly;
  openSwitch.classList.toggle('on', openOnly);
  renderList();
});


const sortBtn = document.getElementById('sortBtn');
const sortMenu = document.getElementById('sortMenu');
const sortLabel = document.getElementById('sortLabel');
sortBtn.addEventListener('click', (e)=>
{
  e.stopPropagation();
  sortMenu.classList.toggle('open');
});
sortMenu.querySelectorAll('.dropdown-item').forEach(item=>
{
  item.addEventListener('click', ()=>
  {
    sortKey = item.dataset.sort;
    sortLabel.textContent = item.textContent;
    sortMenu.querySelectorAll('.dropdown-item').forEach(i=>i.classList.remove('selected'));
    item.classList.add('selected');
    sortMenu.classList.remove('open');
    renderList();
  });
});
document.addEventListener('click', ()=> sortMenu.classList.remove('open'));

const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('input', renderList);
  
  // Check URL query params for pre-filled search
  const urlSearch = new URLSearchParams(window.location.search).get('search');
  if (urlSearch) {
    searchInputEl.value = urlSearch;
  }
}

async function syncLivePharmacies() {
  try {
    if (window.API && window.API.pharmacies) {
      const res = await window.API.pharmacies.getAll();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const livePharmacies = res.data.map((p, idx) => {
          const addr = p.address;
          const loc = typeof addr === 'string' ? addr : `${addr?.street || ''}، ${addr?.city || ''}، ${addr?.governorate || 'القاهرة'}`;
          const iconsList = ['cross', 'bottle', 'capsule', 'mortar', 'pill', 'shelf'];
          const colors = ['#2f8f5b', '#3d7ec9', '#b1793a', '#8a5fc9', '#c9527d', '#1a9c5c'];
          return {
            id: p._id || `pharm_${idx}`,
            name: p.name,
            doctor: p.ownerId?.name ? `د. ${p.ownerId.name}` : 'د. صيدلي معتمد',
            address: loc,
            distance: (0.8 + idx * 0.6).toFixed(1),
            hours: p.openingHours?.is24Hours ? '24 ساعة' : `${p.openingHours?.open || '8 ص'} — ${p.openingHours?.close || '12 م'}`,
            meds: p.meds || (200 + idx * 40),
            rating: p.rating || 4.8,
            reviews: p.reviewCount || (80 + idx * 30),
            status: 'open',
            phone: p.phone || '02-25261234',
            tags: ['أدوية عامة', 'طوارئ', 'توصيل منزلي'],
            accent: colors[idx % colors.length],
            icon: iconsList[idx % iconsList.length],
            photo: '../../assets/images/nahda.jpg'
          };
        });

        if (livePharmacies.length > 0) {
          pharmacies = livePharmacies;
          renderTopPanel();
          renderOpenNowList();
          renderList();
        }
      }
    }
  } catch (e) {
    console.log('[Pharmacies Live Sync Fallback]:', e.message);
  }
}

renderTopPanel();
renderOpenNowList();
renderList();
syncLivePharmacies();