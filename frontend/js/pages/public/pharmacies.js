let pharmacies = [
  {
    id: 'nahda',
    name: 'صيدلية النهضة الحديثة',
    doctor: 'د. محمد علي',
    address: 'شارع النزهة، ميدان تريومف، مصر الجديدة',
    distance: 0.8,
    hours: '08:00 ص — 02:00 ص',
    meds: 320,
    rating: 4.9,
    reviews: 142,
    status: 'open',
    phone: '01198765432',
    tags: ['أدوية عامة', 'طوارئ', 'توصيل منزلي'],
    photo: '../../assets/images/nahda.jpg'
  },
  {
    id: 'shifa',
    name: 'صيدلية الشفاء التخصصية',
    doctor: 'د. سارة أحمد',
    address: 'شارع مصدق، أمام برج الأطباء، الدقي',
    distance: 2.0,
    hours: '24 ساعة',
    meds: 280,
    rating: 4.8,
    reviews: 98,
    status: 'open',
    phone: '01233445566',
    tags: ['عناية مركزة', 'مستلزمات طبية', '24 ساعة'],
    photo: '../../assets/images/shifa.jpg'
  },
  {
    id: 'eslam',
    name: 'صيدلية إسلام',
    doctor: 'د. إسلام ياسر',
    address: 'مدينة نصر، القاهرة',
    distance: 1.4,
    hours: '08:00 ص — 12:00 م',
    meds: 240,
    rating: 4.8,
    reviews: 120,
    status: 'open',
    phone: '01028103634',
    tags: ['استشارات دوائية', 'فيتامينات', 'توصيل سريع'],
    photo: '../../assets/images/hayah.jpg'
  },
  {
    id: 'salama',
    name: 'صيدلية السلامة',
    doctor: 'د. نور إبراهيم',
    address: 'شارع التحرير، الدقي، الجيزة',
    distance: 3.5,
    hours: '08:00 ص — 02:00 ص',
    meds: 400,
    rating: 4.7,
    reviews: 255,
    status: 'open',
    phone: '02-33442211',
    tags: ['فيتامينات', 'جلدية', 'مضادات حيوية'],
    photo: '../../assets/images/salama.jpg'
  },
  {
    id: 'amal',
    name: 'صيدلية الأمل',
    doctor: 'د. أحمد يوسف',
    address: 'شارع جسر السويس، مصر الجديدة',
    distance: 4.0,
    hours: '09:00 ص — 09:00 م',
    meds: 150,
    rating: 4.2,
    reviews: 64,
    status: 'closed',
    phone: '02-24551234',
    tags: ['أنف وأذن', 'جهاز هضمي'],
    photo: '../../assets/images/amal.jpg'
  },
  {
    id: 'reaya',
    name: 'صيدلية الرعاية',
    doctor: 'د. ياسمين سعد',
    address: 'شارع البحر الأعظم، الجيزة',
    distance: 4.8,
    hours: '24 ساعة',
    meds: 520,
    rating: 4.9,
    reviews: 420,
    status: 'open',
    phone: '02-33215678',
    tags: ['24 ساعة', 'خدمة طوارئ', 'توصيل منزلي'],
    photo: '../../assets/images/reaya.jpg'
  }
];

let openOnly = false;
let sortKey = 'distance';
let selectedId = null;

function avgRating() {
  const sum = pharmacies.reduce((a, p) => a + p.rating, 0);
  return (sum / pharmacies.length).toFixed(1);
}

function renderTopPanel() {
  const topPanel = document.getElementById('topPanel');
  if (!topPanel) return;

  if (!selectedId) {
    topPanel.innerHTML = `
      <h3>الصيدليات دلوقتي</h3>
      <div class="srow"><span>إجمالي الصيدليات</span><b>${pharmacies.length}</b></div>
      <div class="srow"><span>المفتوحة الآن</span><b>${pharmacies.filter((p) => p.status === 'open').length}</b></div>
      <div class="srow"><span>متوسط التقييم</span><b>★ ${avgRating()}</b></div>
    `;
    return;
  }

  const p = pharmacies.find((x) => x.id === selectedId);
  if (!p) return;

  topPanel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <h3 style="font-size:18px;margin-bottom:0;">تفاصيل الصيدلية</h3>
      <button type="button" id="closeDetailBtn" style="font-size:13px;color:var(--primary-color);cursor:pointer;border:none;background:none;font-weight:700;">إلغاء التحديد ×</button>
    </div>
    <div style="height:120px;border-radius:var(--border-radius-md);overflow:hidden;margin-bottom:12px;background:var(--bg-muted);border:1px solid var(--border-color);">
      <img src="${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.innerHTML='<div style=\\'display:grid;place-items:center;height:100%;color:var(--primary-color);\\'><i class=\\'fa-solid fa-hospital\\' style=\\'font-size:38px;\\'></i></div>';">
    </div>
    <h4 style="font-size:17px;font-weight:700;margin-bottom:6px;color:var(--text-main);">${p.name}</h4>
    <div class="srow"><span>التقييم</span><b><i class="fa-solid fa-star text-warning me-1"></i> ${p.rating} (${p.reviews})</b></div>
    <div class="srow"><span>العنوان</span><small>${p.address}</small></div>
    <div class="srow"><span>المواعيد</span><small>${p.hours}</small></div>
    <div class="srow"><span>الأدوية المتاحة</span><b>${p.meds} دوا</b></div>
    <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
      <a href="tel:${p.phone}" class="btn btn-line btn-block" style="font-size:14px;padding:8px;">
        <i class="fa-solid fa-phone me-1"></i> ${p.phone}
      </a>
      <a href="medicines.html" class="btn btn-brand btn-block" style="font-size:14px;padding:8px;">
        دوّر على دوا في الصيدلية دي
      </a>
    </div>
  `;

  const closeBtn = document.getElementById('closeDetailBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      selectedId = null;
      renderTopPanel();
      renderList();
    };
  }
}

function renderOpenNowList() {
  const wrap = document.getElementById('openNowList');
  if (!wrap) return;

  const openList = pharmacies.filter((p) => p.status === 'open');
  wrap.innerHTML = openList
    .map(
      (p) => `
    <div class="srow open-item" data-id="${p.id}" style="cursor:pointer;padding-block:10px;">
      <div>
        <div style="font-weight:700;font-size:15px;color:var(--text-main);">${p.name}</div>
        <small style="color:var(--text-muted);font-size:13px;">${p.hours}</small>
      </div>
      <b>${p.distance} كم</b>
    </div>`
    )
    .join('');

  wrap.querySelectorAll('.open-item').forEach((el) => {
    el.addEventListener('click', () => selectPharmacy(el.dataset.id));
  });
}

function getSorted(list) {
  const arr = [...list];
  if (sortKey === 'distance') arr.sort((a, b) => a.distance - b.distance);
  if (sortKey === 'rating') arr.sort((a, b) => b.rating - a.rating);
  if (sortKey === 'meds') arr.sort((a, b) => b.meds - a.meds);
  return arr;
}

function renderList() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = pharmacies.filter((p) => {
    if (openOnly && p.status !== 'open') return false;
    if (searchTerm && !(p.name.toLowerCase().includes(searchTerm) || p.address.toLowerCase().includes(searchTerm))) return false;
    return true;
  });

  list = getSorted(list);

  const resultCountEl = document.getElementById('resultCount');
  if (resultCountEl) {
    resultCountEl.innerHTML = `بنعرض <b>${list.length}</b> صيدليات`;
  }

  const container = document.getElementById('pharmacyList');
  if (!container) return;

  container.innerHTML = list
    .map(
      (p) => `
    <article class="card hov ph-card ${selectedId === p.id ? 'selected' : ''}" data-id="${p.id}" style="${selectedId === p.id ? 'border-color:var(--primary-color);box-shadow:var(--shadow-md);' : ''}">
      <div class="ph-img">
        ${
          p.photo
            ? `<img src="${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.onerror=null;this.parentElement.innerHTML='<div style=\\'display:grid;place-items:center;height:100%;color:var(--primary-color);\\'><i class=\\'fa-solid fa-hospital\\' style=\\'font-size:42px;\\'></i></div>';">`
            : `<div style="display:grid;place-items:center;height:100%;color:var(--primary-color);"><i class="fa-solid fa-hospital" style="font-size:42px;"></i></div>`
        }
      </div>
      <div>
        <span class="open" style="${p.status === 'open' ? 'color:var(--primary-color);' : 'color:#ef4444;'}">
          ● ${p.status === 'open' ? 'مفتوحة الآن' : 'مغلقة'}
        </span>
        <h3 style="margin-top:4px;">${p.name}</h3>
        <div class="meta">
          <span><i class="fa-solid fa-location-dot me-1 text-primary"></i> ${p.address}</span>
        </div>
        <div class="meta">
          <span><i class="fa-solid fa-route me-1 text-muted"></i> ${p.distance} كم</span>
          <span><i class="fa-solid fa-clock me-1 text-muted"></i> ${p.hours}</span>
          <span><i class="fa-solid fa-star text-warning me-1"></i> <b>${p.rating}</b> (${p.reviews})</span>
          <span><i class="fa-solid fa-pills me-1 text-success"></i> <b>${p.meds}</b> دوا</span>
        </div>
        <div class="tags">
          ${p.tags && p.tags.length > 0 ? p.tags.map((t) => `<span>${t}</span>`).join('') : '<span>أدوية عامة</span><span>طوارئ</span><span>توصيل منزلي</span>'}
        </div>
        <div class="ph-act">
          <a href="tel:${p.phone}" class="btn btn-line call-btn" onclick="event.stopPropagation()">
            <i class="fa-solid fa-phone me-1"></i> ${p.phone}
          </a>
          <a href="medicines.html" class="btn btn-brand search-med-btn" onclick="event.stopPropagation()">
            دوّر على دوا في الصيدلية دي
          </a>
        </div>
      </div>
    </article>`
    )
    .join('');

  container.querySelectorAll('.ph-card').forEach((el) => {
    el.addEventListener('click', () => selectPharmacy(el.dataset.id));
  });
}

function selectPharmacy(id) {
  selectedId = id;
  renderTopPanel();
  renderList();
  const card = document.querySelector(`.ph-card[data-id="${id}"]`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Bind Filter Toggle Button
const filterBtn = document.getElementById('filterBtn');
if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    openOnly = !openOnly;
    filterBtn.classList.toggle('on', openOnly);
    filterBtn.classList.toggle('active', openOnly);
    renderList();
  });
}

// Bind Sort Select
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
  sortSelect.addEventListener('change', (e) => {
    sortKey = e.target.value;
    renderList();
  });
}

// Bind Search Input
const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('input', renderList);

  // Check URL query params for pre-filled search
  const urlSearch = new URLSearchParams(window.location.search).get('search') || new URLSearchParams(window.location.search).get('q');
  if (urlSearch) {
    searchInputEl.value = urlSearch;
  }
}

// Optional live data sync from API
async function syncLivePharmacies() {
  try {
    if (window.API && window.API.pharmacies) {
      const res = await window.API.pharmacies.getAll();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const livePharmacies = res.data.map((p, idx) => {
          const addr = p.address;
          const loc = typeof addr === 'string' ? addr : `${addr?.street || ''}، ${addr?.city || ''}، ${addr?.governorate || 'القاهرة'}`;
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

// Initial Calls
renderTopPanel();
renderOpenNowList();
renderList();
syncLivePharmacies();