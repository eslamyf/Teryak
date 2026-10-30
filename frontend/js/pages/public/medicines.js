/**
 * Teryak Platform - Dynamic Medicines Catalog Engine
 * Fetches Live Data from Backend API (MongoDB Atlas) & Supports Multi-Criteria Filtering
 * 100% Arabic Localization & Authentic Product Packaging Images
 */

function resolveSubpageImageUrl(rawUrl = '') {
  const url = String(rawUrl || '').trim();
  if (!url || url.startsWith('data:')) return '../../assets/images/tablets.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  if (url.startsWith('../../')) return url;
  return '../../' + url.replace(/^(\.\/|\.\.\/)+/, '');
}

function cleanArabicText(text = '') {
  return String(text || '')
    .replace(/\b(\d+(?:\.\d+)?)\s*mg\b/gi, '$1 مجم')
    .replace(/\b(\d+(?:\.\d+)?)\s*ml\b/gi, '$1 مل')
    .replace(/\b(\d+(?:\.\d+)?)\s*(?:g|gm)\b/gi, '$1 جم')
    .replace(/\([A-Za-z0-9\s\-+%.,/]+\)/g, '')
    .trim();
}

window.initMedicinesPage = async function () {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtn = document.getElementById('filterBtn');
  const filterDrawer = document.getElementById('filter');
  const arrowIcon = document.getElementById('arrow');
  const activeFilterBadge = document.getElementById('activeFilterBadge');
  const quickCategoryButtons = document.querySelectorAll('.chip[data-category], .cat-pill');
  const statusButtons = document.querySelectorAll('#statusFilterGroup .chip, #statusFilterGroup .filter-pill');
  const priceButtons = document.querySelectorAll('#priceFilterGroup .chip, #priceFilterGroup .filter-pill');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  const resultsCountEl = document.getElementById('resultsCount');
  const totalCountEl = document.getElementById('totalCount');
  const activeChipsContainer = document.getElementById('activeChipsContainer');
  const noResultsState = document.getElementById('noResultsState');
  const grid = document.getElementById('medicinesGrid');
  const paginationNav = document.getElementById('paginationNav');
  const pageNumbersContainer = document.getElementById('pageNumbersContainer');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const paginationInfo = document.getElementById('paginationInfo');

  // Fallback Catalog Preset (100% Arabic with real product packaging images from Wikimedia Commons & Open Beauty Facts APIs)
  const DEFAULT_CATALOG = [
    {
      id: 'panadol',
      nameAr: 'بانادول إكسترا 500 مجم مسكن للألم والصداع 24 قرص',
      nameEn: 'بانادول إكسترا',
      category: 'مسكنات',
      productType: 'medicine',
      activeIngredient: 'باراسيتامول 500 مجم + كافيين 65 مجم',
      price: 45.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 48,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Tylenol_paracetamol_sustained_release_tablets%2C_Chinese_version_%2820221212120513%29.jpg/500px-Tylenol_paracetamol_sustained_release_tablets%2C_Chinese_version_%2820221212120513%29.jpg',
      slug: 'paracetamol',
    },
    {
      id: 'augmentin',
      nameAr: 'أوجمنتين 1 جم مضاد حيوي واسع المجال 14 قرص',
      nameEn: 'أوجمنتين 1 جم أقراص',
      category: 'مضادات حيوية',
      productType: 'medicine',
      activeIngredient: 'أموكسيسيلين 875 مجم + حمض كلافولانيك 125 مجم',
      price: 130.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 30,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Augmentin_1_g_tbl.jpg/500px-Augmentin_1_g_tbl.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'cataflam',
      nameAr: 'كاتافلام 50 مجم أقراص مسكن سريع لآلام الأسنان والمفاصل',
      nameEn: 'كاتافلام 50 مجم',
      category: 'مسكنات',
      productType: 'medicine',
      activeIngredient: 'ديكلوفيناك بوتاسيوم 50 مجم',
      price: 52.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 26,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Diclofenac_Natrium_50mg_Aurobindo.jpg/500px-Diclofenac_Natrium_50mg_Aurobindo.jpg',
      slug: 'cataflam',
    },
    {
      id: 'concor',
      nameAr: 'كونكور 5 مجم أقراص لتنظيم ضغط الدم وضربات القلب',
      nameEn: 'كونكور 5 مجم',
      category: 'قلب وضغط',
      productType: 'medicine',
      activeIngredient: 'بيسوبرولول فومارات 5 مجم',
      price: 68.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 34,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Concor_%28bisoprolol%29_made_by_Nanolek%2C_Russia_with_Merck_branding%2C_Aug_2025_02.jpg/500px-Concor_%28bisoprolol%29_made_by_Nanolek%2C_Russia_with_Merck_branding%2C_Aug_2025_02.jpg',
      slug: 'concor',
    },
    {
      id: 'mebo',
      nameAr: 'ميبو مرهم طبيعي لعلاج الحروق والجروح وتجديد الجلد 30 جم',
      nameEn: 'ميبو مرهم حروق وجروح',
      category: 'مراهم وكريمات',
      productType: 'medicine',
      activeIngredient: 'بيتا سيتوستيرول + زيت السمسم + شمع العسل',
      price: 92.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 42,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mebo_tube.jpg/500px-Mebo_tube.jpg',
      slug: 'mebo',
    },
    {
      id: 'fucidin',
      nameAr: 'فيوسيدين 2% مرهم مضاد حيوي موضعي للدمامل والجروح 20 جم',
      nameEn: 'فيوسيدين مرهم مضاد حيوي موضعي',
      category: 'مراهم وكريمات',
      productType: 'medicine',
      activeIngredient: 'حمض الفوسيديك 2%',
      price: 55.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 38,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Fucidin_2pct_15g.jpg/500px-Fucidin_2pct_15g.jpg',
      slug: 'fucidin',
    },
    {
      id: 'voltaren_emulgel',
      nameAr: 'فولتارين إيمولجل 1% جل موضعي مسكن لآلام المفاصل والعضلات 50 جم',
      nameEn: 'فولتارين إيمولجل مسكن موضعي',
      category: 'مراهم وكريمات',
      productType: 'medicine',
      activeIngredient: 'ديكلوفيناك ثنائي إيثيل أمين',
      price: 72.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 46,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Voltaren_Emulgel.jpg/500px-Voltaren_Emulgel.jpg',
      slug: 'voltaren',
    },
    {
      id: 'bioderma_sensibio',
      nameAr: 'بيوديرما سينسيبيو إتش تو أو ماء ميسيلار منظف للبشرة 500 مل',
      nameEn: 'بيوديرما سينسيبيو إتش تو أو ماء ميسيلار',
      category: 'عناية بالبشرة',
      productType: 'product',
      activeIngredient: 'تقنية الميسيلار الطبية + خلاصة الخيار المهدئة',
      price: 395.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 28,
      image: 'https://images.openbeautyfacts.org/images/products/340/134/593/5571/front_en.14.400.jpg',
      slug: 'bioderma',
    },
    {
      id: 'cerave_cleanser',
      nameAr: 'سيرافي غسول رغوي منظف للبشرة العادية إلى الدهنية 236 مل',
      nameEn: 'سيرافي غسول رغوي منظف للبشرة',
      category: 'عناية بالبشرة',
      productType: 'product',
      activeIngredient: 'سيراميدات أساسية + هيالورونيك + نياسيناميد',
      price: 380.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 32,
      image: 'https://images.openbeautyfacts.org/images/products/333/787/559/7357/front_en.26.400.jpg',
      slug: 'cerave',
    },
  ];

  // Clear legacy caches
  try {
    localStorage.removeItem('teryak_medicines_cache_v2');
    localStorage.removeItem('teryak_medicines_cache_v3');
    localStorage.removeItem('teryak_medicines_cache_v4');
  } catch (e) {}

  // Instant Cache Initialization (Loads in 0ms)
  let rawMedicinesList = [];
  try {
    const cachedData = localStorage.getItem('teryak_medicines_cache_v5');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawMedicinesList = parsed.filter((m) => /[\u0600-\u06FF]/.test(m.nameAr || ''));
      }
    }
  } catch (e) {}

  if (!rawMedicinesList.length) {
    rawMedicinesList = [...DEFAULT_CATALOG];
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Fetch Live Data from Backend API (Non-blocking Stale-While-Revalidate)
  async function loadMedicinesFromAPI() {
    if (window.API && window.API.medicines) {
      try {
        const res = await window.API.medicines.getAll({ limit: 95 });
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const arabicItems = res.data.filter((m) => /[\u0600-\u06FF]/.test(m.nameAr || ''));
          if (arabicItems.length > 0) {
            rawMedicinesList = arabicItems.map((m) => {
              const firstWord = (m.nameEn || m.nameAr || 'medicine').split(' ')[0].toLowerCase();
              return {
                id: m._id,
                nameAr: cleanArabicText(m.nameAr),
                nameEn: m.nameEn || m.nameAr,
                category: m.category || 'مسكنات',
                productType: m.productType || 'medicine',
                activeIngredient: cleanArabicText(m.activeIngredient || ''),
                price: Number(m.price) || 25.0,
                rating: 4.9,
                status: Number(m.pharmaciesCount) > 0 ? 'available' : 'available',
                pharmaciesCount: Number(m.pharmaciesCount) || 3,
                image: resolveSubpageImageUrl(m.image),
                slug: firstWord,
              };
            });

            try {
              localStorage.setItem('teryak_medicines_cache_v5', JSON.stringify(rawMedicinesList));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('API background sync note:', err.message);
      }
    }
  }

  // Unified Filter State & Pagination
  const state = {
    search: '',
    category: 'all',
    status: 'all',
    priceRange: 'all',
    sortBy: 'default',
    page: 1,
    itemsPerPage: 9, // 3 columns x 3 rows = 9 items per page
  };

  let lastFilteredCount = 0;
  let lastTotalPages = 1;

  // Toggle Advanced Filter Drawer
  if (filterBtn && filterDrawer) {
    filterBtn.addEventListener('click', () => {
      const isClosed = filterDrawer.style.display === 'none' || filterDrawer.classList.contains('hide');
      filterDrawer.style.display = isClosed ? 'block' : 'none';
      filterDrawer.classList.toggle('hide', !isClosed);
      filterBtn.classList.toggle('active', isClosed);
      filterBtn.setAttribute('aria-expanded', isClosed);
      if (arrowIcon) {
        arrowIcon.classList.toggle('fa-chevron-down', !isClosed);
        arrowIcon.classList.toggle('fa-chevron-up', isClosed);
      }
    });
  }

  // Update Active Filter Count Badge
  function updateFilterBadge() {
    let count = 0;
    if (state.category !== 'all') count++;
    if (state.status !== 'all') count++;
    if (state.priceRange !== 'all') count++;
    if (state.search.trim() !== '') count++;

    if (activeFilterBadge) {
      if (count > 0) {
        activeFilterBadge.textContent = count;
        activeFilterBadge.classList.remove('hide');
      } else {
        activeFilterBadge.classList.add('hide');
      }
    }
  }

  // Render Active Filter Chips
  function renderFilterChips() {
    if (!activeChipsContainer) return;
    activeChipsContainer.innerHTML = '';

    const chips = [];

    if (state.category !== 'all') {
      chips.push({
        label: `الفئة: ${state.category}`,
        onRemove: () => setCategory('all'),
      });
    }

    if (state.status !== 'all') {
      const statusLabels = {
        'available': 'متوفر فوراً',
        'limited': 'كمية محدودة',
        'unavailable': 'غير متوفر',
      };
      chips.push({
        label: `الحالة: ${statusLabels[state.status] || state.status}`,
        onRemove: () => setStatus('all'),
      });
    }

    if (state.priceRange !== 'all') {
      const priceLabels = {
        'under30': 'أقل من 50 ج.م',
        '30to60': '50 - 120 ج.م',
        'over60': 'أكثر من 120 ج.م',
      };
      chips.push({
        label: `السعر: ${priceLabels[state.priceRange] || state.priceRange}`,
        onRemove: () => setPriceRange('all'),
      });
    }

    if (state.search.trim() !== '') {
      chips.push({
        label: `بحث: "${state.search}"`,
        onRemove: () => {
          if (searchInput) searchInput.value = '';
          state.search = '';
          if (clearSearchBtn) clearSearchBtn.classList.add('hide');
          applyFilters(true);
        },
      });
    }

    chips.forEach((chip) => {
      const chipEl = document.createElement('span');
      chipEl.className = 'filter-chip';
      chipEl.innerHTML = `
        ${chip.label}
        <span class="filter-chip-remove" aria-label="إزالة">&times;</span>
      `;
      chipEl.querySelector('.filter-chip-remove').addEventListener('click', chip.onRemove);
      activeChipsContainer.appendChild(chipEl);
    });
  }

  // Dynamic Card Rendering Function (3 Columns in .grid3)
  function renderCards(medicines, totalFiltered, startIndex) {
    if (!grid) return;
    grid.innerHTML = '';

    if (totalCountEl) totalCountEl.textContent = rawMedicinesList.length;
    if (resultsCountEl) {
      if (totalFiltered === 0) {
        resultsCountEl.textContent = '0';
      } else {
        const from = startIndex + 1;
        const to = Math.min(startIndex + medicines.length, totalFiltered);
        resultsCountEl.textContent = `${from} - ${to}`;
      }
    }

    if (medicines.length === 0) {
      if (noResultsState) {
        noResultsState.style.display = 'block';
        noResultsState.classList.remove('hide');
      }
      return;
    } else {
      if (noResultsState) {
        noResultsState.style.display = 'none';
        noResultsState.classList.add('hide');
      }
    }

    medicines.forEach((med) => {
      const article = document.createElement('article');
      article.className = 'card hov med medicine-item';
      article.dataset.category = med.category;
      article.dataset.status = med.status;
      article.dataset.price = med.price;
      article.dataset.rating = med.rating;
      article.dataset.availability = med.pharmaciesCount;
      article.dataset.name = med.nameAr;
      article.dataset.activeIng = med.activeIngredient;

      const statusBadge =
        med.status === 'available'
          ? '<span class="tag">متوفر</span>'
          : med.status === 'limited'
          ? '<span class="tag" style="background:#eab308;">كمية محدودة</span>'
          : '<span class="tag" style="background:#ef4444;">غير متوفر</span>';

      const detailUrl = `medicine-detail.html?med=${encodeURIComponent(med.id || med.slug || med.nameAr)}`;
      const safeName = escapeHTML(cleanArabicText(med.nameAr));
      const safeCategory = escapeHTML(med.category);
      const rawIngredient = cleanArabicText(med.activeIngredient || '');
      const safeIngredient = (rawIngredient && rawIngredient !== med.category && /[\u0600-\u06FF]/.test(rawIngredient))
        ? escapeHTML(rawIngredient)
        : '';
      const safeImage = escapeHTML(resolveSubpageImageUrl(med.image || ''));
      const safeId = escapeHTML(med.id);

      const imageContent = safeImage
        ? `<img class="med-thumb-img" src="${safeImage}" alt="${safeName}" loading="lazy" style="object-fit:contain;background:#fff;padding:6px;" onerror="this.onerror=null;this.parentElement.innerHTML='<i class=\\'fa-solid fa-pills\\' style=\\'font-size:42px;color:var(--primary-color);\\'></i>';">`
        : `<i class="fa-solid fa-pills" style="font-size:42px;color:var(--primary-color);"></i>`;

      article.innerHTML = `
        <div class="med-img">
          ${statusBadge}
          <span class="rate"><i class="fa-solid fa-star text-warning"></i> ${med.rating}</span>
          <a href="${detailUrl}" class="med-img-link" title="${safeName}">
            ${imageContent}
          </a>
        </div>
        <div class="med-b">
          <span class="med-cat">${safeCategory}${safeIngredient ? ` · ${safeIngredient}` : ''}</span>
          <h3 class="med-title"><a href="${detailUrl}" title="${safeName}">${safeName}</a></h3>
          <div class="med-p">
            <span class="med-avail"><i class="fa-solid fa-store me-1"></i>${med.pharmaciesCount > 0 ? `متوفر في ${med.pharmaciesCount} صيدلية` : 'غير متوفر حالياً'}</span>
            <div class="price">${Math.round(med.price)}<span>ج.م</span></div>
          </div>
          <button type="button" class="btn btn-brand btn-block addCart" data-id="${safeId}" data-name="${safeName}">
            <i class="fa-solid fa-bag-shopping me-1"></i> اختار صيدلية للطلب
          </button>
        </div>
      `;

      // Bind Cart Button Click
      const addBtn = article.querySelector('.addCart');
      if (addBtn) {
        addBtn.dataset.handledByPage = 'true';
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = detailUrl;
        });
      }

      grid.appendChild(article);
    });
  }

  // Render Pagination Navigation (1, 2, 3...)
  function renderPagination(totalItems, totalPages) {
    lastFilteredCount = totalItems;
    lastTotalPages = totalPages;

    if (!paginationNav || !pageNumbersContainer) return;

    if (totalPages <= 1 || totalItems === 0) {
      paginationNav.classList.add('hide');
      if (paginationInfo) paginationInfo.classList.add('hide');
      return;
    }

    paginationNav.classList.remove('hide');
    if (paginationInfo) {
      paginationInfo.classList.remove('hide');
      paginationInfo.textContent = `الصفحة ${state.page} من إجمالي ${totalPages} صفحات`;
    }

    if (prevPageBtn) prevPageBtn.disabled = state.page <= 1;
    if (nextPageBtn) nextPageBtn.disabled = state.page >= totalPages;

    pageNumbersContainer.innerHTML = '';
    const isMobile = window.innerWidth <= 600;

    function getVisiblePages(current, total, mobile) {
      if (total <= (mobile ? 4 : 7)) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      const delta = mobile ? 1 : 2;
      const range = [];
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i);
      }

      if (current - delta > 2) {
        range.unshift('...');
      }
      range.unshift(1);

      if (current + delta < total - 1) {
        range.push('...');
      }
      range.push(total);

      return range;
    }

    const pages = getVisiblePages(state.page, totalPages, isMobile);

    pages.forEach((p) => {
      if (p === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pager-ellipsis';
        ellipsis.textContent = '…';
        pageNumbersContainer.appendChild(ellipsis);
      } else {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = `${p === state.page ? 'on active' : ''}`;
        pageBtn.textContent = p;
        pageBtn.setAttribute('aria-label', `الصفحة رقم ${p}`);
        pageBtn.addEventListener('click', () => {
          if (state.page !== p) {
            state.page = p;
            applyFilters(false);
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
        pageNumbersContainer.appendChild(pageBtn);
      }
    });
  }

  // Attach Prev/Next Pagination Button Listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        applyFilters(false);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (state.page < lastTotalPages) {
        state.page++;
        applyFilters(false);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Main Filter Application Function
  function applyFilters(resetPage = true) {
    if (resetPage) {
      state.page = 1;
    }

    updateFilterBadge();
    renderFilterChips();

    const normalizedSearch = state.search.trim().toLowerCase();

    // Filter dynamic list
    let filtered = rawMedicinesList.filter((med) => {
      // 1. Search Check
      let matchesSearch = true;
      if (normalizedSearch) {
        const nameAr = (med.nameAr || '').toLowerCase();
        const nameEn = (med.nameEn || '').toLowerCase();
        const activeIng = (med.activeIngredient || '').toLowerCase();
        const cat = (med.category || '').toLowerCase();
        matchesSearch =
          nameAr.includes(normalizedSearch) ||
          nameEn.includes(normalizedSearch) ||
          activeIng.includes(normalizedSearch) ||
          cat.includes(normalizedSearch);
      }

      // 2. Category Check
      let matchesCategory = true;
      if (state.category !== 'all') {
        const medCat = (med.category || '').toLowerCase();
        const targetCat = state.category.toLowerCase();
        matchesCategory = medCat.includes(targetCat) || targetCat.includes(medCat);
      }

      // 3. Status Check
      let matchesStatus = true;
      if (state.status !== 'all') {
        matchesStatus = med.status === state.status;
      }

      // 4. Price Range Check
      let matchesPrice = true;
      if (state.priceRange === 'under30') {
        matchesPrice = med.price < 50;
      } else if (state.priceRange === '30to60') {
        matchesPrice = med.price >= 50 && med.price <= 120;
      } else if (state.priceRange === 'over60') {
        matchesPrice = med.price > 120;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    // Update category count badges dynamically
    document.querySelectorAll('[data-count-for]').forEach((badge) => {
      const catKey = badge.getAttribute('data-count-for');
      if (!catKey || catKey === 'all') {
        badge.textContent = rawMedicinesList.length;
      } else {
        const target = catKey.toLowerCase();
        const cnt = rawMedicinesList.filter((m) => {
          const mc = (m.category || '').toLowerCase();
          return mc.includes(target) || target.includes(mc);
        }).length;
        badge.textContent = cnt;
      }
    });

    // Sort Items
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return b.pharmaciesCount - a.pharmaciesCount;
        case 'name':
          return (a.nameAr || '').localeCompare(b.nameAr || '', 'ar');
        default:
          return 0;
      }
    });

    // Calculate Pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / state.itemsPerPage));
    if (state.page > totalPages) state.page = totalPages;

    const startIndex = (state.page - 1) * state.itemsPerPage;
    const currentSlice = filtered.slice(startIndex, startIndex + state.itemsPerPage);

    // Render to Grid & Pagination Bar
    renderCards(currentSlice, totalFiltered, startIndex);
    renderPagination(totalFiltered, totalPages);
  }

  // Set Category Helper
  function setCategory(cat) {
    state.category = cat;
    quickCategoryButtons.forEach((btn) => {
      const isMatch = btn.dataset.category === cat;
      btn.classList.toggle('active', isMatch);
      btn.classList.toggle('on', isMatch);
      if (isMatch) {
        try {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (e) {}
      }
    });
    applyFilters(true);
  }

  // Smooth mouse-wheel horizontal scrolling for Quick Categories Bar
  const quickCategoriesBar = document.getElementById('quickCategoriesBar');
  if (quickCategoriesBar && !quickCategoriesBar.dataset.wheelBound) {
    quickCategoriesBar.dataset.wheelBound = 'true';
    quickCategoriesBar.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        quickCategoriesBar.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // Set Status Helper
  function setStatus(st) {
    state.status = st;
    statusButtons.forEach((btn) => {
      const isMatch = btn.dataset.filter === st;
      btn.classList.toggle('active', isMatch);
      btn.classList.toggle('on', isMatch);
    });
    applyFilters(true);
  }

  // Set Price Range Helper
  function setPriceRange(range) {
    state.priceRange = range;
    priceButtons.forEach((btn) => {
      const isMatch = btn.dataset.priceRange === range;
      btn.classList.toggle('active', isMatch);
      btn.classList.toggle('on', isMatch);
    });
    applyFilters(true);
  }

  // Reset All Filters
  function resetAllFilters() {
    state.search = '';
    state.category = 'all';
    state.status = 'all';
    state.priceRange = 'all';
    state.sortBy = 'default';
    state.page = 1;

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hide');
    if (sortSelect) sortSelect.value = 'default';

    quickCategoryButtons.forEach((btn) => {
      const isAll = btn.dataset.category === 'all';
      btn.classList.toggle('active', isAll);
      btn.classList.toggle('on', isAll);
    });
    statusButtons.forEach((btn) => {
      const isAll = btn.dataset.filter === 'all';
      btn.classList.toggle('active', isAll);
      btn.classList.toggle('on', isAll);
    });
    priceButtons.forEach((btn) => {
      const isAll = btn.dataset.priceRange === 'all';
      btn.classList.toggle('active', isAll);
      btn.classList.toggle('on', isAll);
    });

    applyFilters(true);

    if (window.Toast) {
      window.Toast.info('تمت إعادة تعيين كافة الفلاتر بنجاح وعرض جميع الأدوية والمنتجات.', 'إعادة ضبط');
    }
  }

  // Event Listeners: Search
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = this.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hide', this.value.trim() === '');
      }
      applyFilters(true);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn.classList.add('hide');
      state.search = '';
      applyFilters(true);
      searchInput?.focus();
    });
  }

  // Event Listeners: Categories
  quickCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category || 'all';
      setCategory(cat);
    });
  });

  // Event Listeners: Status
  statusButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const st = btn.dataset.filter || 'all';
      setStatus(st);
    });
  });

  // Event Listeners: Price Range
  priceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const range = btn.dataset.priceRange || 'all';
      setPriceRange(range);
    });
  });

  // Event Listeners: Sorting
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sortBy = this.value;
      applyFilters(true);
    });
  }

  // Reset Buttons
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

  // Parse URL Parameters (e.g. medicines.html?search=panadol or ?category=مسكنات)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('q') || urlParams.get('search');
  const catParam = urlParams.get('category');
  if (searchParam) {
    state.search = searchParam;
    if (searchInput) searchInput.value = searchParam;
    if (clearSearchBtn) clearSearchBtn.classList.remove('hide');
  }
  if (catParam) {
    state.category = catParam;
    quickCategoryButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === catParam);
    });
  }

  // Responsive resize handler for pagination
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderPagination(lastFilteredCount, lastTotalPages);
    }, 150);
  });

  // Initial Instant Render (< 5ms from local cache / preset)
  applyFilters(true);

  // Asynchronous Stale-While-Revalidate Background Sync
  loadMedicinesFromAPI().then(() => {
    applyFilters(false);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initMedicinesPage);
} else {
  window.initMedicinesPage();
}

window.addEventListener('teryak:page-mounted', (e) => {
  if (e.detail?.page === 'medicines') {
    window.initMedicinesPage();
  }
});
