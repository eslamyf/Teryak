/**
 * Teryak Platform - Dynamic Medicines Catalog Engine
 * Fetches Live Data from Backend API (MongoDB Atlas) & Supports Multi-Criteria Filtering
 */

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

  // Fallback Catalog Preset
  const DEFAULT_CATALOG = [
    {
      id: 'panadol',
      nameAr: 'بانادول إكسترا',
      nameEn: 'Panadol Extra',
      category: 'مسكنات',
      activeIngredient: 'باراسيتامول + كافيين',
      price: 35.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 48,
      image: '../../assets/images/tablets.jpg',
      slug: 'paracetamol',
    },
    {
      id: 'paramol',
      nameAr: 'بارامول 500 مجم',
      nameEn: 'Paramol 500mg',
      category: 'مسكنات',
      activeIngredient: 'باراسيتامول',
      price: 18.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 32,
      image: '../../assets/images/tablets.jpg',
      slug: 'paracetamol',
    },
    {
      id: 'cataflam',
      nameAr: 'كاتافلام 50 مجم',
      nameEn: 'Cataflam 50mg',
      category: 'مسكنات',
      activeIngredient: 'ديكلوفيناك بوتاسيوم',
      price: 45.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 26,
      image: '../../assets/images/tablets.jpg',
      slug: 'cataflam',
    },
    {
      id: 'augmentin',
      nameAr: 'أوجمنتين 1 جم أقراص',
      nameEn: 'Augmentin 1g',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      price: 130.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 30,
      image: '../../assets/images/tablets.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'amoxil',
      nameAr: 'أموكسيل 500 مجم',
      nameEn: 'Amoxil 500mg',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين',
      price: 45.0,
      rating: 4.5,
      status: 'limited',
      pharmaciesCount: 12,
      image: '../../assets/images/capsules.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'curam',
      nameAr: 'كيورام 1 جم',
      nameEn: 'Curam 1g',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      price: 105.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 18,
      image: '../../assets/images/tablets.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'aspirin',
      nameAr: 'أسبيرين بروتكت 100 مجم',
      nameEn: 'Aspirin Protect 100mg',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 28.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 42,
      image: '../../assets/images/tablets.jpg',
      slug: 'aspirin',
    },
    {
      id: 'ecosprin',
      nameAr: 'إيكوسبرين 75 مجم',
      nameEn: 'Ecosprin 75mg',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 22.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 25,
      image: '../../assets/images/tablets.jpg',
      slug: 'aspirin',
    },
    {
      id: 'aspocid',
      nameAr: 'أسبوسيد أطفال 75 مجم',
      nameEn: 'Aspocid 75mg Chewable',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 18.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 38,
      image: '../../assets/images/tablets.jpg',
      slug: 'aspirin',
    },
    {
      id: 'omega3',
      nameAr: 'أوميجا 3 بلس كبسولات',
      nameEn: 'Omega 3 Plus',
      category: 'مكملات غذائية',
      activeIngredient: 'زيت السمك + جنين القمح',
      price: 65.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 35,
      image: '../../assets/images/capsules.jpg',
      slug: 'omega3',
    },
    {
      id: 'vitamind',
      nameAr: 'ديفارول إس فيتامين د3',
      nameEn: 'Devarol S Vitamin D3',
      category: 'فيتامينات',
      activeIngredient: 'كوليكالسيفيرول',
      price: 25.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 40,
      image: '../../assets/images/injection.jpg',
      slug: 'vitamind',
    },
    {
      id: 'congestal',
      nameAr: 'كونجستال أقراص للبرد',
      nameEn: 'Congestal',
      category: 'نزلات برد',
      activeIngredient: 'باراسيتامول + سودوإيفيدرين + كلورفينيرامين',
      price: 31.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 60,
      image: '../../assets/images/tablets.jpg',
      slug: 'congestal',
    },
    {
      id: 'antinal',
      nameAr: 'أنتينال 200 مجم',
      nameEn: 'Antinal 200mg',
      category: 'هضمي',
      activeIngredient: 'نيفوروكسازيد',
      price: 32.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 50,
      image: '../../assets/images/capsules.jpg',
      slug: 'antinal',
    },
  ];

  // Instant Cache Initialization (Loads in 0ms)
  let rawMedicinesList = [];
  try {
    const cachedData = localStorage.getItem('teryak_medicines_cache_v2');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawMedicinesList = parsed;
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
        const res = await window.API.medicines.getAll({ limit: 50 });
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          rawMedicinesList = res.data.map((m) => {
            let cat = m.category || 'منتجات صحية';
            const cLower = (m.category || '').toLowerCase();
            if (m.productType !== 'product') {
              if (cLower.includes('مضاد') || cLower.includes('antibiotic')) cat = 'مضادات حيوية';
              else if (cLower.includes('فيتامين') || cLower.includes('vitamin')) cat = 'فيتامينات';
              else if (cLower.includes('مكمل') || cLower.includes('omega')) cat = 'مكملات غذائية';
              else if (cLower.includes('برد') || cLower.includes('cold')) cat = 'نزلات برد';
              else if (cLower.includes('هضم') || cLower.includes('معدة')) cat = 'هضمي';
              else if (cLower.includes('مسكن') || cLower.includes('سيولة') || cLower.includes('قلب')) cat = 'مسكنات';
            }

            const firstWord = (m.nameEn || m.nameAr || 'medicine').split(' ')[0].toLowerCase();

            return {
              id: m._id,
              nameAr: m.nameAr,
              nameEn: m.nameEn || m.nameAr,
              category: cat,
              productType: m.productType || 'medicine',
              activeIngredient: m.activeIngredient || '',
              price: Number(m.price) || 25.0,
              rating: 4.8,
              status: Number(m.pharmaciesCount) > 0 ? 'available' : 'unavailable',
              pharmaciesCount: Number(m.pharmaciesCount) || 0,
              image: m.image || '',
              slug: firstWord,
            };
          });

          try {
            localStorage.setItem('teryak_medicines_cache_v2', JSON.stringify(rawMedicinesList));
          } catch (e) {}
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
    itemsPerPage: 6, // 3 columns x 2 rows = 6 items per page for clean compact viewing
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
        'under30': 'أقل من 30 ج.م',
        '30to60': '30 - 60 ج.م',
        'over60': 'أكثر من 60 ج.م',
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
      article.dataset.nameEn = med.nameEn;
      article.dataset.activeIng = med.activeIngredient;

      const statusBadge =
        med.status === 'available'
          ? '<span class="tag">متوفر</span>'
          : med.status === 'limited'
          ? '<span class="tag" style="background:#eab308;">كمية محدودة</span>'
          : '<span class="tag" style="background:#ef4444;">غير متوفر</span>';

      const detailUrl = `medicine-detail.html?med=${encodeURIComponent(med.id || med.slug || med.nameEn || med.nameAr)}`;
      const safeName = escapeHTML(med.nameAr);
      const safeCategory = escapeHTML(med.category);
      const rawIngredient = med.productType === 'product' ? '' : (med.activeIngredient || med.nameEn || '');
      const safeIngredient = (rawIngredient && rawIngredient !== med.category) ? escapeHTML(rawIngredient) : '';
      const safeImage = escapeHTML(med.image || '');
      const safeId = escapeHTML(med.id);

      const imageContent = safeImage
        ? `<img class="med-thumb-img" src="${safeImage}" alt="${safeName}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<i class=\\'fa-solid fa-pills\\' style=\\'font-size:42px;color:var(--primary-color);\\'></i>';">`
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
    
    // Smart Pagination Windowing (prevents overflow on mobile)
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
        matchesPrice = med.price < 30;
      } else if (state.priceRange === '30to60') {
        matchesPrice = med.price >= 30 && med.price <= 60;
      } else if (state.priceRange === 'over60') {
        matchesPrice = med.price > 60;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
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

    quickCategoryButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.category === 'all'));
    statusButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === 'all'));
    priceButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.priceRange === 'all'));

    applyFilters(true);

    if (window.Toast) {
      window.Toast.info('تمت إعادة تعيين كافة الفلاتر بنجاح وعرض جميع الأدوية.', 'إعادة ضبط');
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
