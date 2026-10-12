/**
 * Teryak Platform - Pharmacist Inventory Management Engine
 * Features:
 * - High-Performance Table & Cards View (Zero-Lag with Client Pagination)
 * - Automatic Corrupted Data Cleanser & XSS Protection
 * - Full KPI Stats Dashboard Bar
 * - Smart Excel (.xlsx, .xls) & CSV Bulk Importer with Column Auto-Detection
 * - Quick Quantity Stepper (+/- inline)
 * - Add & Edit Modal with Catalog Autocomplete & Profit Calculator
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Sidebar & Overlay Handlers
  const menuBtn = document.getElementById('menuBtn') || document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
  const overlay = document.getElementById('overlay') || document.querySelector('.overlay');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('show');
    });
  }

  // 2. DOM Elements
  const inventoryContainer = document.getElementById('inventoryContainer');
  const searchInput = document.getElementById('inventorySearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterStatus = document.getElementById('filterStatus');
  const filterCategory = document.getElementById('filterCategory');
  const filterSort = document.getElementById('filterSort');
  const viewModeTableBtn = document.getElementById('viewModeTableBtn');
  const viewModeCardsBtn = document.getElementById('viewModeCardsBtn');
  const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
  const paginationSummary = document.getElementById('paginationSummary');
  const inventoryPagination = document.getElementById('inventoryPagination');

  const addMedBtn = document.getElementById('addMedBtn');
  const bottomAddMedBtn = document.getElementById('bottomAddMedBtn');
  const bulkImportBtn = document.getElementById('bulkImportBtn');
  const exportInventoryBtn = document.getElementById('exportInventoryBtn');
  const cleanCorruptedBtn = document.getElementById('cleanCorruptedBtn');

  // KPI Stats Elements
  const statTotalItems = document.getElementById('statTotalItems');
  const statTotalQty = document.getElementById('statTotalQty');
  const statAvailable = document.getElementById('statAvailable');
  const statAvailablePct = document.getElementById('statAvailablePct');
  const statLowStock = document.getElementById('statLowStock');
  const statOutOfStock = document.getElementById('statOutOfStock');

  // State
  let currentInventory = [];
  let filteredInventory = [];
  let catalogMedicines = [];
  let currentPage = 1;
  let itemsPerPage = 15;
  let currentViewMode = 'table'; // 'table' | 'cards'

  // Clean Default Mock Inventory
  const defaultInventory = [
    {
      _id: 'inv_1',
      nameAr: 'باراسيتامول 500 مجم أقراص',
      nameEn: 'Paracetamol 500mg',
      activeIngredient: 'Paracetamol',
      category: 'مسكنات وخافض حرارة',
      dosageForm: 'أقراص',
      quantity: 45,
      customPrice: 24.50,
      costPrice: 18.00,
      shelfLocation: 'رف A1',
      batchNumber: 'BCH-2026-101',
      expiryDate: '2027-03-01',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_2',
      nameAr: 'أموكسيسيلين 500 مجم كبسولات',
      nameEn: 'Amoxicillin 500mg',
      activeIngredient: 'Amoxicillin',
      category: 'مضادات حيوية',
      dosageForm: 'كبسولات',
      quantity: 4,
      customPrice: 78.00,
      costPrice: 58.00,
      shelfLocation: 'رف B2',
      batchNumber: 'BCH-2026-102',
      expiryDate: '2026-11-01',
      image: '../../assets/images/3.jpg'
    },
    {
      _id: 'inv_3',
      nameAr: 'فيتامين د 1000 وحدة دولية',
      nameEn: 'Vitamin D3 1000 IU',
      activeIngredient: 'Cholecalciferol',
      category: 'فيتامينات ومكملات',
      dosageForm: 'نقط / قطرة',
      quantity: 0,
      customPrice: 85.00,
      costPrice: 65.00,
      shelfLocation: 'ثلاجة 1',
      batchNumber: 'BCH-2026-103',
      expiryDate: '2027-06-01',
      image: '../../assets/images/6.jpg'
    },
    {
      _id: 'inv_4',
      nameAr: 'أوميجا 3 بلس كبسولات',
      nameEn: 'Omega 3 Plus',
      activeIngredient: 'Fish Oil + Vitamin E',
      category: 'فيتامينات ومكملات',
      dosageForm: 'كبسولات',
      quantity: 20,
      customPrice: 120.00,
      costPrice: 90.00,
      shelfLocation: 'رف A3',
      batchNumber: 'BCH-2026-104',
      expiryDate: '2026-09-01',
      image: '../../assets/images/3.jpg'
    },
    {
      _id: 'inv_5',
      nameAr: 'كونجستال أقراص للبرد والإنفلونزا',
      nameEn: 'Congestal Tablets',
      activeIngredient: 'Paracetamol + Pseudoephedrine',
      category: 'أدوية البرد والإنفلونزا',
      dosageForm: 'أقراص',
      quantity: 8,
      customPrice: 35.00,
      costPrice: 26.00,
      shelfLocation: 'رف C1',
      batchNumber: 'BCH-2026-105',
      expiryDate: '2026-12-01',
      image: '../../assets/images/5.jpg'
    }
  ];

  // ====================================================================
  // Helper: XSS & HTML Injection Protection
  // ====================================================================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ====================================================================
  // Helper: Check & Purge Corrupted Binary / Zip / Raw HTML Items
  // ====================================================================
  function isCorruptedItem(item) {
    if (!item) return true;
    const name = String(item.nameAr || item.medicineName || '').trim();
    if (!name) return true;

    // Check for ZIP/XLSX binary file headers that got read as plain text
    if (name.includes('xl/') || 
        name.includes('docProps') || 
        name.includes('[Content_Types]') || 
        name.includes('.xmlPK') || 
        name.includes('word/') || 
        name.includes('PK\x03\x04') ||
        name.includes('PK!')) {
      return true;
    }

    // Check for broken HTML injection markers
    if (name.includes('class=') || name.includes('onerror=') || name.includes('<') || name.includes('>')) {
      return true;
    }

    // Check for unprintable binary control characters
    if (/[\x00-\x08\x0E-\x1F\x7F]/.test(name)) {
      return true;
    }

    // Name abnormally long without standard spaces (binary chunks)
    if (name.length > 180 && !name.includes(' ')) {
      return true;
    }

    return false;
  }

  function sanitizeInventoryList(items) {
    if (!Array.isArray(items)) return [];
    const valid = items.filter(item => !isCorruptedItem(item));
    return valid;
  }

  // Save to LocalStorage safely
  function saveLocalInventory() {
    try {
      localStorage.setItem('pharmacist_inventory', JSON.stringify(currentInventory));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // 3. Load Master Catalog for Autocomplete
  async function loadCatalog() {
    try {
      if (window.API && window.API.medicines) {
        const res = await window.API.medicines.getAll({ limit: 100 });
        if (res && res.data && Array.isArray(res.data)) {
          catalogMedicines = res.data;
        }
      }
    } catch (e) {
      console.warn('[Catalog Preload Warning]:', e.message);
    }
  }
  loadCatalog();

  // 4. Load Inventory from Server / Cache
  async function loadInventory() {
    let items = [];

    try {
      if (window.API && window.API.inventory) {
        const res = await window.API.inventory.getAll();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(item => ({
            _id: item._id,
            medicineId: item.medicineId?._id || item.medicineId,
            nameAr: item.medicineId?.nameAr || item.medicineName || 'دواء',
            nameEn: item.medicineId?.nameEn || '',
            quantity: Number(item.quantity) || 0,
            customPrice: Number(item.customPrice || item.medicineId?.price || 25),
            costPrice: item.costPrice ? Number(item.costPrice) : undefined,
            shelfLocation: item.shelfLocation || '',
            batchNumber: item.batchNumber || '',
            activeIngredient: item.medicineId?.activeIngredient || '',
            category: item.medicineId?.category || 'أدوية عامة',
            dosageForm: item.medicineId?.dosageForm || 'أقراص',
            expiryDate: item.expiryDate ? String(item.expiryDate).split('T')[0] : '2027-01-01',
            image: item.medicineId?.image || item.image || '../../assets/images/1.jpg'
          }));
        }
      }
    } catch (e) {
      console.warn('[Inventory API Fallback]:', e.message);
    }

    if (!items || items.length === 0) {
      try {
        const rawLocal = localStorage.getItem('pharmacist_inventory');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        }
      } catch (e) {
        items = defaultInventory;
      }
    }

    // Auto-Sanitize corrupted data
    const initialCount = items.length;
    const cleanItems = sanitizeInventoryList(items);

    if (cleanItems.length < initialCount) {
      console.warn(`[Auto-Clean]: Removed ${initialCount - cleanItems.length} corrupted entries.`);
      if (window.Toast) {
        window.Toast.info(`تم تطهير المخزون تلقائياً وإزالة ${initialCount - cleanItems.length} عنصر تالف.`, 'تنظيف تلقائي');
      }
    }

    currentInventory = cleanItems.length > 0 ? cleanItems : [...defaultInventory];
    saveLocalInventory();

    applyFilters();
  }

  // ====================================================================
  // KPI Stats Recalculator
  // ====================================================================
  function updateKPIStats() {
    const totalItems = currentInventory.length;
    let totalUnits = 0;
    let availableCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    currentInventory.forEach(item => {
      const q = Number(item.quantity) || 0;
      totalUnits += q;
      if (q === 0) outOfStockCount++;
      else if (q <= 5) lowStockCount++;
      else availableCount++;
    });

    if (statTotalItems) statTotalItems.textContent = totalItems.toLocaleString('ar-EG');
    if (statTotalQty) statTotalQty.textContent = `${totalUnits.toLocaleString('ar-EG')} علبة بالمخزن`;
    if (statAvailable) statAvailable.textContent = availableCount.toLocaleString('ar-EG');
    if (statAvailablePct) {
      const pct = totalItems > 0 ? Math.round((availableCount / totalItems) * 100) : 0;
      statAvailablePct.textContent = `${pct}% من المخزون`;
    }
    if (statLowStock) statLowStock.textContent = lowStockCount.toLocaleString('ar-EG');
    if (statOutOfStock) statOutOfStock.textContent = outOfStockCount.toLocaleString('ar-EG');
  }

  // ====================================================================
  // Filtering, Searching & Sorting Engine
  // ====================================================================
  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const st = filterStatus?.value || 'all';
    const cat = filterCategory?.value || 'all';
    const sort = filterSort?.value || 'newest';

    filteredInventory = currentInventory.filter(item => {
      // 1. Text Search
      if (q) {
        const nameAr = (item.nameAr || '').toLowerCase();
        const nameEn = (item.nameEn || '').toLowerCase();
        const active = (item.activeIngredient || '').toLowerCase();
        const shelf = (item.shelfLocation || '').toLowerCase();
        const batch = (item.batchNumber || '').toLowerCase();

        const match = nameAr.includes(q) || nameEn.includes(q) || active.includes(q) || shelf.includes(q) || batch.includes(q);
        if (!match) return false;
      }

      // 2. Status Filter
      const qty = Number(item.quantity) || 0;
      if (st === 'available' && qty <= 5) return false;
      if (st === 'low' && (qty === 0 || qty > 5)) return false;
      if (st === 'out' && qty > 0) return false;

      // 3. Category Filter
      if (cat !== 'all') {
        const itemCat = item.category || 'أدوية عامة';
        if (!itemCat.includes(cat) && !cat.includes(itemCat)) return false;
      }

      return true;
    });

    // 4. Sorting
    filteredInventory.sort((a, b) => {
      if (sort === 'name_asc') return (a.nameAr || '').localeCompare(b.nameAr || '', 'ar');
      if (sort === 'qty_asc') return (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
      if (sort === 'qty_desc') return (Number(b.quantity) || 0) - (Number(a.quantity) || 0);
      if (sort === 'price_desc') return (Number(b.customPrice) || 0) - (Number(a.customPrice) || 0);
      if (sort === 'price_asc') return (Number(a.customPrice) || 0) - (Number(b.customPrice) || 0);
      if (sort === 'expiry_asc') return new Date(a.expiryDate || '2099-01-01') - new Date(b.expiryDate || '2099-01-01');
      return 0; // 'newest' keeps original order
    });

    currentPage = 1;
    updateKPIStats();
    renderCurrentPage();
    renderPagination();
  }

  // ====================================================================
  // Render Current Page (Table vs Cards Grid)
  // ====================================================================
  function renderCurrentPage() {
    if (!inventoryContainer) return;

    if (filteredInventory.length === 0) {
      inventoryContainer.innerHTML = `
        <div class="card p-5 text-center bg-white border-0 shadow-sm rounded-4">
          <div class="mb-3 text-muted" style="font-size: 3rem;">
            <i class="fa-solid fa-box-open text-success opacity-75"></i>
          </div>
          <h4 class="font-bold text-dark mb-1">لا توجد أدوية مطابقة لبحثك</h4>
          <p class="text-muted mb-3" style="font-size: 14px;">جرّب تعديل خيارات الفلترة أو ابحث باسم آخر، أو أضف دواءً جديداً للمخزون.</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="resetFiltersBtn">
              <i class="fa-solid fa-rotate-left me-1"></i> إعادة ضبط الفلاتر
            </button>
            <button class="btn btn-success btn-sm font-bold" onclick="document.getElementById('addMedBtn').click()">
              <i class="fa-solid fa-plus me-1"></i> إضافة دواء للمخزون
            </button>
          </div>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (filterStatus) filterStatus.value = 'all';
        if (filterCategory) filterCategory.value = 'all';
        if (filterSort) filterSort.value = 'newest';
        applyFilters();
      });
      return;
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageItems = filteredInventory.slice(startIdx, endIdx);

    if (currentViewMode === 'table') {
      renderTableView(pageItems);
    } else {
      renderCardsView(pageItems);
    }
  }

  // 1) Modern Table View (Ultra-fast, dense, professional)
  function renderTableView(items) {
    let rowsHtml = '';

    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      let statusClass = 'available';
      let statusText = 'متوفر';
      if (qty === 0) {
        statusClass = 'out';
        statusText = 'نفد المخزون';
      } else if (qty <= 5) {
        statusClass = 'low';
        statusText = 'نواقص';
      }

      const price = (Number(item.customPrice) || 25).toFixed(2);
      const cost = item.costPrice ? (Number(item.costPrice)).toFixed(2) + ' ج.م' : '—';
      const expiry = item.expiryDate || '2027-06-01';

      // Expiry urgent warning check (< 3 months)
      let expiryClass = 'normal';
      try {
        const expDate = new Date(expiry);
        const diffMonths = (expDate - new Date()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths <= 3) expiryClass = 'urgent';
      } catch (e) {}

      const img = escapeHtml(item.image || '../../assets/images/1.jpg');
      const name = escapeHtml(item.nameAr || 'دواء');
      const active = escapeHtml(item.activeIngredient || item.dosageForm || '—');
      const category = escapeHtml(item.category || 'أدوية عامة');
      const shelf = escapeHtml(item.shelfLocation || '—');

      rowsHtml += `
        <tr data-id="${item._id}">
          <td>
            <div class="med-cell">
              <img src="${img}" alt="${name}" class="med-thumb" onerror="this.src='../../assets/images/1.jpg'">
              <div class="med-info-box">
                <span class="med-title">${name}</span>
                <span class="med-meta">${active} • <span class="badge bg-light text-secondary border py-0 px-1" style="font-size: 11px;">${category}</span></span>
              </div>
            </div>
          </td>
          <td>
            <div class="qty-stepper" data-id="${item._id}">
              <button type="button" class="qty-step-btn btn-qty-minus" title="إنقاص علبة واحدة"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-step-val">${qty}</span>
              <button type="button" class="qty-step-btn btn-qty-plus" title="زيادة علبة واحدة"><i class="fa-solid fa-plus"></i></button>
            </div>
          </td>
          <td>
            <strong class="text-success font-bold" style="font-size: 15px;">${price} ج.م</strong>
          </td>
          <td>
            <span class="text-muted" style="font-size: 13px;">${cost}</span>
          </td>
          <td>
            <span class="expiry-tag ${expiryClass}">
              <i class="fa-regular fa-calendar-check me-1"></i> ${expiry}
            </span>
          </td>
          <td>
            <span class="shelf-tag"><i class="fa-solid fa-location-dot text-success"></i> ${shelf}</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="status-dot"></span>
              ${statusText}
            </span>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1 justify-content-end">
              <button type="button" class="action-btn btn-edit-item" data-id="${item._id}" title="تعديل التفاصيل والتسعير">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="action-btn btn-delete-item" data-id="${item._id}" title="حذف من المخزون">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    inventoryContainer.innerHTML = `
      <div class="inventory-table-card">
        <div class="inventory-table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th style="min-width: 250px;">الدواء والتفاصيل</th>
                <th style="min-width: 130px;">الكمية (علبة)</th>
                <th style="min-width: 100px;">سعر البيع</th>
                <th style="min-width: 90px;">التكلفة</th>
                <th style="min-width: 130px;">الصلاحية</th>
                <th style="min-width: 110px;">الموقع / الرف</th>
                <th style="min-width: 120px;">الحالة</th>
                <th style="min-width: 90px; text-align: left;">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 2) Modern Grid Cards View
  function renderCardsView(items) {
    let cardsHtml = '';

    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      let statusClass = 'available';
      let statusText = 'متوفر';
      if (qty === 0) {
        statusClass = 'out';
        statusText = 'غير متوفر';
      } else if (qty <= 5) {
        statusClass = 'low';
        statusText = 'نواقص';
      }

      const price = (Number(item.customPrice) || 25).toFixed(2);
      const expiry = item.expiryDate || '2027-06-01';
      const img = escapeHtml(item.image || '../../assets/images/1.jpg');
      const name = escapeHtml(item.nameAr || 'دواء');
      const active = escapeHtml(item.activeIngredient || item.dosageForm || '—');
      const shelf = escapeHtml(item.shelfLocation || '—');

      cardsHtml += `
        <div class="med-grid-card" data-id="${item._id}">
          <div class="med-grid-header">
            <img src="${img}" alt="${name}" class="med-grid-thumb" onerror="this.src='../../assets/images/1.jpg'">
            <span class="status-pill ${statusClass}">
              <span class="status-dot"></span>
              ${statusText}
            </span>
          </div>
          <div class="med-grid-body">
            <h4>${name}</h4>
            <small class="text-muted">${active}</small>
            
            <div class="med-grid-info-row mt-2">
              <span>الرصيد:</span>
              <div class="qty-stepper" data-id="${item._id}">
                <button type="button" class="qty-step-btn btn-qty-minus"><i class="fa-solid fa-minus"></i></button>
                <span class="qty-step-val">${qty}</span>
                <button type="button" class="qty-step-btn btn-qty-plus"><i class="fa-solid fa-plus"></i></button>
              </div>
            </div>

            <div class="med-grid-info-row">
              <span>سعر البيع:</span>
              <strong class="text-success">${price} ج.م</strong>
            </div>

            <div class="med-grid-info-row">
              <span>الصلاحية:</span>
              <span class="text-dark font-bold">${expiry}</span>
            </div>

            <div class="med-grid-info-row">
              <span>المكان:</span>
              <span class="shelf-tag"><i class="fa-solid fa-location-dot text-success"></i> ${shelf}</span>
            </div>
          </div>

          <div class="med-grid-footer">
            <span class="text-muted" style="font-size: 12px;">ID: ${escapeHtml(item._id.slice(-6))}</span>
            <div class="d-flex gap-1">
              <button type="button" class="action-btn btn-edit-item" data-id="${item._id}" title="تعديل">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="action-btn btn-delete-item" data-id="${item._id}" title="حذف">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    inventoryContainer.innerHTML = `
      <div class="inventory-cards-grid">
        ${cardsHtml}
      </div>
    `;
  }

  // ====================================================================
  // Pagination Renderer
  // ====================================================================
  function renderPagination() {
    if (!inventoryPagination || !paginationSummary) return;

    const total = filteredInventory.length;
    if (total === 0) {
      paginationSummary.textContent = 'عرض 0 من 0 دواء';
      inventoryPagination.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(total / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, total);

    paginationSummary.textContent = `عرض ${startItem.toLocaleString('ar-EG')} إلى ${endItem.toLocaleString('ar-EG')} من أصل ${total.toLocaleString('ar-EG')} دواء`;

    let pagesHtml = '';

    // Prev Button
    pagesHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="السابق">
          <i class="fa-solid fa-chevron-right"></i>
        </a>
      </li>
    `;

    // Page numbers logic (max 5 buttons)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let p = startPage; p <= endPage; p++) {
      pagesHtml += `
        <li class="page-item ${p === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${p}">${p.toLocaleString('ar-EG')}</a>
        </li>
      `;
    }

    // Next Button
    pagesHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="التالي">
          <i class="fa-solid fa-chevron-left"></i>
        </a>
      </li>
    `;

    inventoryPagination.innerHTML = pagesHtml;
  }

  // Pagination Click Handler
  inventoryPagination?.addEventListener('click', (e) => {
    e.preventDefault();
    const link = e.target.closest('.page-link');
    if (!link) return;
    const targetPage = Number(link.dataset.page);
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
      currentPage = targetPage;
      renderCurrentPage();
      renderPagination();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  // Items per page change
  itemsPerPageSelect?.addEventListener('change', (e) => {
    itemsPerPage = Number(e.target.value) || 15;
    currentPage = 1;
    renderCurrentPage();
    renderPagination();
  });

  // View Mode Toggles
  viewModeTableBtn?.addEventListener('click', () => {
    if (currentViewMode === 'table') return;
    currentViewMode = 'table';
    viewModeTableBtn.classList.add('active');
    viewModeCardsBtn.classList.remove('active');
    renderCurrentPage();
  });

  viewModeCardsBtn?.addEventListener('click', () => {
    if (currentViewMode === 'cards') return;
    currentViewMode = 'cards';
    viewModeCardsBtn.classList.add('active');
    viewModeTableBtn.classList.remove('active');
    renderCurrentPage();
  });

  // Filters Event Listeners (Debounced Search)
  let searchTimer = null;
  searchInput?.addEventListener('input', (e) => {
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle('d-none', !e.target.value.trim());
    }
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      applyFilters();
    }, 200);
  });

  clearSearchBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearSearchBtn.classList.add('d-none');
    applyFilters();
  });

  filterStatus?.addEventListener('change', applyFilters);
  filterCategory?.addEventListener('change', applyFilters);
  filterSort?.addEventListener('change', applyFilters);

  // ====================================================================
  // Inline Quantity Stepper Handler (+ / - Buttons)
  // ====================================================================
  document.addEventListener('click', async (e) => {
    const btnPlus = e.target.closest('.btn-qty-plus');
    const btnMinus = e.target.closest('.btn-qty-minus');

    if (btnPlus || btnMinus) {
      e.preventDefault();
      e.stopPropagation();
      const stepper = (btnPlus || btnMinus).closest('.qty-stepper');
      const itemId = stepper?.dataset.id;
      const item = currentInventory.find(i => String(i._id) === String(itemId));
      if (!item) return;

      if (btnPlus) {
        item.quantity = (Number(item.quantity) || 0) + 1;
      } else if (btnMinus) {
        const q = Number(item.quantity) || 0;
        if (q > 0) item.quantity = q - 1;
        else return;
      }

      // Sync to API in background
      try {
        if (window.API && window.API.inventory && item._id && item._id.length === 24) {
          window.API.inventory.update(item._id, { quantity: item.quantity }).catch(() => {});
        }
      } catch (err) {}

      saveLocalInventory();
      updateKPIStats();
      renderCurrentPage();
      return;
    }

    // Edit action
    const editBtn = e.target.closest('.btn-edit-item');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const itemId = editBtn.dataset.id || editBtn.closest('[data-id]')?.dataset.id;
      const item = currentInventory.find(i => String(i._id) === String(itemId));
      if (item) {
        openEditModal(item);
      }
      return;
    }

    // Delete action
    const deleteBtn = e.target.closest('.btn-delete-item');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const itemId = deleteBtn.dataset.id || deleteBtn.closest('[data-id]')?.dataset.id;
      const item = currentInventory.find(i => String(i._id) === String(itemId));
      const name = item ? item.nameAr : 'الدواء';

      let confirmed = true;
      if (window.Toast && typeof window.Toast.confirm === 'function') {
        confirmed = await window.Toast.confirm({
          title: 'حذف من المخزون',
          message: `هل أنت متأكد من رغبتك في إزالة (${name}) من مخزون صيدليتك؟`,
          type: 'danger',
          confirmText: 'حذف الدواء',
          cancelText: 'إلغاء'
        });
      } else {
        confirmed = window.confirm(`هل أنت متأكد من رغبتك في حذف (${name}) من المخزون؟`);
      }

      if (confirmed) {
        try {
          if (window.API && window.API.inventory && itemId && itemId.length === 24) {
            await window.API.inventory.delete(itemId);
          }
        } catch (err) {
          console.warn('API delete fallback:', err.message);
        }

        currentInventory = currentInventory.filter(i => String(i._id) !== String(itemId));
        saveLocalInventory();
        applyFilters();

        if (window.Toast) {
          window.Toast.success(`تم حذف (${name}) من المخزون بنجاح.`, 'تم الحذف');
        }
      }
      return;
    }
  });

  // ====================================================================
  // Clean Corrupted Data Button Handler
  // ====================================================================
  if (cleanCorruptedBtn) {
    cleanCorruptedBtn.addEventListener('click', async () => {
      let confirmed = true;
      if (window.Toast && typeof window.Toast.confirm === 'function') {
        confirmed = await window.Toast.confirm({
          title: 'فحص وتنظيف المخزون',
          message: 'سيتم فحص المخزون وإزالة أي أدوية تالفة أو غير صالحة ناتجة عن استيراد ملفات سابقة. هل تود المتابعة؟',
          type: 'warning',
          confirmText: 'تنظيف الآن',
          cancelText: 'إلغاء'
        });
      } else {
        confirmed = window.confirm('هل تود تنظيف المخزون من أي بيانات تالفة؟');
      }

      if (confirmed) {
        const initialCount = currentInventory.length;
        const cleaned = sanitizeInventoryList(currentInventory);
        const removed = initialCount - cleaned.length;

        currentInventory = cleaned.length > 0 ? cleaned : [...defaultInventory];
        saveLocalInventory();
        applyFilters();

        if (window.Toast) {
          if (removed > 0) {
            window.Toast.success(`تمت إزالة ${removed} عنصر تالف بنجاح وتمت استعادة المخزون السليم.`, 'تم التنظيف');
          } else {
            window.Toast.info('جميع بيانات المخزون سليمة تماماً ولا توجد عناصر تالفة.', 'المخزون سليم');
          }
        }
      }
    });
  }

  // ====================================================================
  // Add & Edit Modal System with Profit Calculator & Image Presets
  // ====================================================================
  function ensureInventoryModal() {
    let modalEl = document.getElementById('inventoryActionModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'inventoryActionModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content inventory-modal-box">
            <div class="modal-header">
              <div class="d-flex align-items-center gap-2">
                <div class="modal-header-icon"><i class="fa-solid fa-boxes-stacked"></i></div>
                <div>
                  <h5 class="modal-title font-bold m-0" id="invModalTitle">إضافة دواء جديد للمخزون</h5>
                  <span class="modal-subtitle">إدارة المخزون الذكي، التسعير، الصلاحية، والصورة</span>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="invModalForm">
                <input type="hidden" id="modalItemId" value="">
                <input type="hidden" id="modalMedicineId" value="">
                <input type="hidden" id="modalMedImage" value="../../assets/images/1.jpg">
                
                <!-- Section 1: Medicine Image + Name/Autocomplete -->
                <div class="row g-3 mb-3 align-items-start">
                  <!-- Image Upload / Preview Column -->
                  <div class="col-md-4 col-12 text-center">
                    <label class="form-label font-bold text-dark d-block text-start mb-2">
                      <i class="fa-solid fa-image text-success me-1"></i> صورة الدواء
                    </label>
                    <div class="medicine-image-upload-card">
                      <div class="image-preview-wrapper" id="imagePreviewContainer">
                        <img id="modalMedImagePreview" src="../../assets/images/1.jpg" alt="معاينة صورة الدواء" onerror="this.src='../../assets/images/1.jpg'">
                        <div class="image-overlay-actions">
                          <label for="modalMedImageFile" class="btn-upload-overlay" title="رفع صورة من جهازك">
                            <i class="fa-solid fa-camera"></i>
                          </label>
                          <button type="button" class="btn-clear-image" id="btnClearImage" title="استعادة الصورة الافتراضية">
                            <i class="fa-solid fa-rotate-left"></i>
                          </button>
                        </div>
                      </div>
                      <input type="file" id="modalMedImageFile" class="d-none" accept="image/*">
                      <small class="text-muted d-block mt-2" style="font-size: 11px;">اختر قالباً سريعاً للشكل الدوائي:</small>

                      <!-- Quick Presets -->
                      <div class="image-presets-row mt-2" id="imagePresetsRow">
                        <button type="button" class="preset-btn active" data-dosage="أقراص" data-img="../../assets/images/1.jpg" title="أقراص">💊 أقراص</button>
                        <button type="button" class="preset-btn" data-dosage="شراب" data-img="../../assets/images/2.jpg" title="شراب">🧴 شراب</button>
                        <button type="button" class="preset-btn" data-dosage="كبسولات" data-img="../../assets/images/3.jpg" title="كبسول">💊 كبسول</button>
                        <button type="button" class="preset-btn" data-dosage="حقن" data-img="../../assets/images/4.jpg" title="حقن">💉 حقن</button>
                        <button type="button" class="preset-btn" data-dosage="مرهم / كريم" data-img="../../assets/images/5.jpg" title="مرهم">🧴 مرهم</button>
                        <button type="button" class="preset-btn" data-dosage="نقط / قطرة" data-img="../../assets/images/6.jpg" title="قطرة">💧 قطرة</button>
                        <button type="button" class="preset-btn" data-dosage="بخاخ" data-img="../../assets/images/7.jpg" title="بخاخ">💨 بخاخ</button>
                      </div>
                    </div>
                  </div>

                  <!-- Name & Catalog Autocomplete Column -->
                  <div class="col-md-8 col-12">
                    <div class="mb-3 position-relative">
                      <label class="form-label font-bold text-dark">
                        اسم الدواء أو المادة الفعالة <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                        <input type="text" id="modalMedName" class="form-control" placeholder="ابحث في دليل الأدوية (مثال: بانادول، بروفين، أوجمنتين...)" autocomplete="off" required>
                      </div>
                      <div id="catalogAutocompleteList" class="list-group position-absolute w-100 shadow-lg d-none" style="z-index: 1060; max-height: 240px; overflow-y: auto; top: 100%;"></div>
                      <small class="text-muted d-block mt-1" style="font-size: 12px;">
                        💡 <span class="text-success font-bold">ميزة ذكية:</span> البحث متصل بالدليل المصري وقاعدة الأدوية ويملأ السعر والتصنيف تلقائياً.
                      </small>
                    </div>

                    <div class="row g-2">
                      <div class="col-6">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">المادة الفعالة</label>
                        <input type="text" id="modalActiveIngredient" class="form-control form-control-sm" placeholder="مثال: Paracetamol">
                      </div>
                      <div class="col-6">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">الشكل الدوائي</label>
                        <select id="modalDosageForm" class="form-select form-select-sm">
                          <option value="أقراص">أقراص (Tablets)</option>
                          <option value="كبسولات">كبسولات (Capsules)</option>
                          <option value="شراب">شراب (Syrup)</option>
                          <option value="حقن">حقن / أمبول (Injection)</option>
                          <option value="نقط / قطرة">نقط / قطرة (Drops)</option>
                          <option value="مرهم / كريم">مرهم / كريم (Ointment)</option>
                          <option value="فوار">فوار (Effervescent)</option>
                          <option value="بخاخ">بخاخ (Spray)</option>
                        </select>
                      </div>
                      <div class="col-12 mt-2">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">التصنيف الدوائي</label>
                        <select id="modalCategory" class="form-select form-select-sm">
                          <option value="مسكنات وخافض حرارة">مسكنات وخافض حرارة</option>
                          <option value="مضادات حيوية">مضادات حيوية</option>
                          <option value="أدوية البرد والإنفلونزا">أدوية البرد والإنفلونزا</option>
                          <option value="فيتامينات ومكملات">فيتامينات ومكملات غذائية</option>
                          <option value="أدوية الضغط والقلب">أدوية الضغط والقلب</option>
                          <option value="أدوية السكري">أدوية السكري</option>
                          <option value="جهاز هضمي ومعدة">جهاز هضمي ومعدة</option>
                          <option value="حساسية وجهاز تنفسي">حساسية وجهاز تنفسي</option>
                          <option value="جلدية وتجميل">جلدية وعناية</option>
                          <option value="أدوية عامة">أدوية عامة أخرى</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="my-3 opacity-25">

                <!-- Section 2: Pricing & Stock Inventory -->
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-coins text-warning"></i> التسعير، الأرباح، والكميات المتوفرة
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">الكمية المتوفرة (علبة) <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedQty" class="form-control" min="0" value="10" required>
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">سعر البيع (ج.م) <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedPrice" class="form-control" min="0.5" step="0.5" value="35.00" required>
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">سعر التكلفة (ج.م)</label>
                    <input type="number" id="modalMedCost" class="form-control" min="0" step="0.5" placeholder="مثال: 25.00">
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">حد النواقص (علبة)</label>
                    <input type="number" id="modalMedThreshold" class="form-control" min="1" value="5">
                  </div>
                </div>

                <!-- Profit Margin Widget -->
                <div id="profitMarginWidget" class="profit-margin-bar profit-positive d-flex justify-content-between align-items-center py-2 px-3 rounded mb-3 d-none">
                  <span class="font-bold" style="font-size: 13px;" id="profitMarginText">
                    <i class="fa-solid fa-chart-line me-1"></i> هامش الربح المتوقع: <strong>--</strong>
                  </span>
                  <span class="badge" id="profitPerUnitBadge">-- ج.م / علبة</span>
                </div>

                <hr class="my-3 opacity-25">

                <!-- Section 3: Storage, Expiry & Batch Details -->
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-calendar-check text-primary"></i> الصلاحية وموقع التخزين ورقم التشغيلة
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-4 col-12">
                    <label class="form-label font-bold text-dark">تاريخ انتهاء الصلاحية <span class="text-danger">*</span></label>
                    <input type="date" id="modalMedExpiry" class="form-control" value="2027-06-01" required>
                  </div>
                  <div class="col-md-4 col-6">
                    <label class="form-label font-bold text-dark">رقم التشغيلة (Batch No.)</label>
                    <div class="input-group">
                      <input type="text" id="modalMedBatch" class="form-control" placeholder="BATCH-1234">
                      <button type="button" class="btn btn-outline-secondary" id="btnGenBatch" title="توليد رقم تشغيلة تلقائي">
                        <i class="fa-solid fa-arrows-rotate"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4 col-6">
                    <label class="form-label font-bold text-dark">موقع الرف / المخزن</label>
                    <input type="text" id="modalMedShelf" class="form-control" placeholder="مثال: رف A3، ثلاجة 1">
                  </div>
                </div>

                <!-- Modal Footer Actions -->
                <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-4 flex-wrap gap-2">
                  <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" id="modalMedAvailable" checked>
                    <label class="form-check-label font-bold text-muted" for="modalMedAvailable" style="font-size: 13px;">متاح للطلب المباشر</label>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-light px-3" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-success px-4 font-bold" id="modalSubmitBtn">
                      <i class="fa-solid fa-check me-1"></i> حفظ الدواء بالمخزون
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      // Setup Modal Controls
      const nameInput = modalEl.querySelector('#modalMedName');
      const autoList = modalEl.querySelector('#catalogAutocompleteList');
      const medIdInput = modalEl.querySelector('#modalMedicineId');
      const priceInput = modalEl.querySelector('#modalMedPrice');
      const costInput = modalEl.querySelector('#modalMedCost');
      const dosageSelect = modalEl.querySelector('#modalDosageForm');
      const categorySelect = modalEl.querySelector('#modalCategory');
      const imgHidden = modalEl.querySelector('#modalMedImage');
      const imgPreview = modalEl.querySelector('#modalMedImagePreview');
      const fileInput = modalEl.querySelector('#modalMedImageFile');
      const clearImgBtn = modalEl.querySelector('#btnClearImage');
      const presetsRow = modalEl.querySelector('#imagePresetsRow');
      const genBatchBtn = modalEl.querySelector('#btnGenBatch');
      const batchInput = modalEl.querySelector('#modalMedBatch');

      function resolveDosageImage(dosage) {
        const d = (dosage || '').toLowerCase();
        if (d.includes('شراب') || d.includes('syrup')) return '../../assets/images/2.jpg';
        if (d.includes('كبسول') || d.includes('capsule')) return '../../assets/images/3.jpg';
        if (d.includes('حقن') || d.includes('injection')) return '../../assets/images/4.jpg';
        if (d.includes('مرهم') || d.includes('كريم') || d.includes('ointment')) return '../../assets/images/5.jpg';
        if (d.includes('نقط') || d.includes('قطرة') || d.includes('drops')) return '../../assets/images/6.jpg';
        if (d.includes('بخاخ') || d.includes('spray')) return '../../assets/images/7.jpg';
        return '../../assets/images/1.jpg';
      }

      function updateSelectedPreset(imageSrc) {
        presetsRow?.querySelectorAll('.preset-btn').forEach(b => {
          if (b.dataset.img === imageSrc) b.classList.add('active');
          else b.classList.remove('active');
        });
      }

      function updateProfitWidget() {
        const selling = Number(priceInput?.value) || 0;
        const cost = Number(costInput?.value) || 0;
        const profitText = modalEl.querySelector('#profitMarginText');
        const profitBadge = modalEl.querySelector('#profitPerUnitBadge');
        const widget = modalEl.querySelector('#profitMarginWidget');

        if (cost > 0 && selling > 0 && widget) {
          const profit = selling - cost;
          const margin = ((profit / selling) * 100).toFixed(1);
          if (profit >= 0) {
            widget.className = 'profit-margin-bar profit-positive d-flex justify-content-between align-items-center py-2 px-3 rounded mb-3';
            profitText.className = 'text-success font-bold';
            profitText.innerHTML = `<i class="fa-solid fa-arrow-trend-up me-1"></i> هامش الربح المتوقع: <strong>${margin}%</strong>`;
            profitBadge.className = 'badge bg-success';
            profitBadge.textContent = `+${profit.toFixed(2)} ج.م / علبة`;
          } else {
            widget.className = 'profit-margin-bar profit-negative d-flex justify-content-between align-items-center py-2 px-3 rounded mb-3';
            profitText.className = 'text-danger font-bold';
            profitText.innerHTML = `<i class="fa-solid fa-arrow-trend-down me-1"></i> تحذير: سعر البيع أقل من التكلفة بنسبة <strong>${Math.abs(margin)}%</strong>`;
            profitBadge.className = 'badge bg-danger';
            profitBadge.textContent = `${profit.toFixed(2)} ج.م خسارة`;
          }
          widget.classList.remove('d-none');
        } else if (widget) {
          widget.classList.add('d-none');
        }
      }

      priceInput?.addEventListener('input', updateProfitWidget);
      costInput?.addEventListener('input', updateProfitWidget);

      dosageSelect?.addEventListener('change', (e) => {
        const matchingImg = resolveDosageImage(e.target.value);
        imgPreview.src = matchingImg;
        imgHidden.value = matchingImg;
        updateSelectedPreset(matchingImg);
      });

      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            imgPreview.src = evt.target.result;
            imgHidden.value = evt.target.result;
            presetsRow?.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          };
          reader.readAsDataURL(file);
        }
      });

      clearImgBtn?.addEventListener('click', () => {
        const currentDosage = dosageSelect?.value || 'أقراص';
        const defaultImg = resolveDosageImage(currentDosage);
        imgPreview.src = defaultImg;
        imgHidden.value = defaultImg;
        updateSelectedPreset(defaultImg);
      });

      presetsRow?.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const imgPath = btn.dataset.img;
          imgPreview.src = imgPath;
          imgHidden.value = imgPath;
          presetsRow.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      genBatchBtn?.addEventListener('click', () => {
        if (batchInput) {
          batchInput.value = `BCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      });

      // Autocomplete Handler
      let searchDebounceTimer = null;
      if (nameInput && autoList) {
        nameInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase().trim();
          if (!q || q.length < 2) {
            autoList.classList.add('d-none');
            return;
          }

          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(async () => {
            let matches = catalogMedicines.filter(m => 
              (m.nameAr && m.nameAr.toLowerCase().includes(q)) ||
              (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
              (m.activeIngredient && m.activeIngredient.toLowerCase().includes(q))
            ).slice(0, 5);

            if (matches.length === 0) {
              autoList.classList.add('d-none');
              return;
            }

            autoList.innerHTML = matches.map(m => {
              const formImg = m.image || resolveDosageImage(m.dosageForm);
              return `
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3" 
                  data-id="${m._id}" 
                  data-name="${escapeHtml(m.nameAr)}" 
                  data-price="${m.price || 25}"
                  data-active="${escapeHtml(m.activeIngredient || '')}"
                  data-dosage="${escapeHtml(m.dosageForm || 'أقراص')}"
                  data-category="${escapeHtml(m.category || 'أدوية عامة')}"
                  data-img="${formImg}">
                  <div class="d-flex align-items-center gap-2">
                    <img src="${formImg}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 8px;" onerror="this.src='../../assets/images/1.jpg'">
                    <div>
                      <strong class="d-block text-dark" style="font-size: 13.5px;">${escapeHtml(m.nameAr)}</strong>
                      <small class="text-muted" style="font-size: 11.5px;">${escapeHtml(m.nameEn || '')} • ${escapeHtml(m.activeIngredient || '')}</small>
                    </div>
                  </div>
                  <span class="badge bg-success">${m.price || 25} ج.م</span>
                </button>
              `;
            }).join('');

            autoList.classList.remove('d-none');

            autoList.querySelectorAll('button').forEach(itemBtn => {
              itemBtn.addEventListener('click', () => {
                nameInput.value = itemBtn.dataset.name;
                medIdInput.value = itemBtn.dataset.id;
                if (priceInput) priceInput.value = itemBtn.dataset.price;
                if (modalEl.querySelector('#modalActiveIngredient') && itemBtn.dataset.active) {
                  modalEl.querySelector('#modalActiveIngredient').value = itemBtn.dataset.active;
                }
                const dosage = itemBtn.dataset.dosage || 'أقراص';
                if (dosageSelect) dosageSelect.value = dosage;
                if (categorySelect && itemBtn.dataset.category) categorySelect.value = itemBtn.dataset.category;

                const formImg = itemBtn.dataset.img || resolveDosageImage(dosage);
                imgHidden.value = formImg;
                imgPreview.src = formImg;
                updateSelectedPreset(formImg);

                updateProfitWidget();
                autoList.classList.add('d-none');
              });
            });
          }, 200);
        });

        document.addEventListener('click', (e) => {
          if (!nameInput.contains(e.target) && !autoList.contains(e.target)) {
            autoList.classList.add('d-none');
          }
        });
      }

      // Form Submit Handler
      const form = modalEl.querySelector('#invModalForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemId = document.getElementById('modalItemId').value;
        const medicineId = document.getElementById('modalMedicineId').value;
        const name = document.getElementById('modalMedName').value.trim();
        const qty = Number(document.getElementById('modalMedQty').value) || 0;
        const price = Number(document.getElementById('modalMedPrice').value) || 25;
        const cost = Number(document.getElementById('modalMedCost').value) || undefined;
        const expiry = document.getElementById('modalMedExpiry').value || '2027-06-01';
        const threshold = Number(document.getElementById('modalMedThreshold')?.value) || 5;
        const batch = document.getElementById('modalMedBatch')?.value || '';
        const shelf = document.getElementById('modalMedShelf')?.value || '';
        const image = document.getElementById('modalMedImage')?.value || '../../assets/images/1.jpg';
        const active = document.getElementById('modalActiveIngredient')?.value || '';
        const dosage = document.getElementById('modalDosageForm')?.value || 'أقراص';
        const category = document.getElementById('modalCategory')?.value || 'أدوية عامة';

        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        if (itemId) {
          // Update
          try {
            if (window.API && window.API.inventory && itemId.length === 24) {
              await window.API.inventory.update(itemId, {
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image
              });
            }
          } catch (err) {
            console.warn('API update fallback:', err.message);
          }

          const target = currentInventory.find(i => String(i._id) === String(itemId));
          if (target) {
            target.nameAr = name;
            target.quantity = qty;
            target.customPrice = price;
            target.costPrice = cost;
            target.shelfLocation = shelf;
            target.batchNumber = batch;
            target.expiryDate = expiry;
            target.image = image;
            target.dosageForm = dosage;
            target.category = category;
            target.activeIngredient = active;
          }
          if (window.Toast) window.Toast.success(`تم تحديث بيانات ومخزون (${name}) بنجاح`, 'تحديث المخزون');
        } else {
          // Add new
          let createdId = `inv_${Date.now()}`;
          try {
            if (window.API && window.API.inventory) {
              const res = await window.API.inventory.add({
                medicineId: medicineId || undefined,
                medicineName: name,
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image,
                activeIngredient: active,
                dosageForm: dosage,
                category: category,
              });
              if (res && res.data && res.data._id) {
                createdId = res.data._id;
              }
            }
          } catch (err) {
            console.warn('API add fallback:', err.message);
          }

          currentInventory.unshift({
            _id: createdId,
            medicineId: medicineId || undefined,
            nameAr: name,
            quantity: qty,
            customPrice: price,
            costPrice: cost,
            shelfLocation: shelf,
            batchNumber: batch,
            expiryDate: expiry,
            image: image,
            dosageForm: dosage,
            category: category,
            activeIngredient: active
          });
          if (window.Toast) window.Toast.success(`تمت إضافة (${name}) بنجاح للمخزون`, 'إضافة دواء');
        }

        saveLocalInventory();
        applyFilters();
        if (modalInstance) modalInstance.hide();
      });
    }
    return modalEl;
  }

  function openAddModal() {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = 'إضافة دواء جديد للمخزون';
    document.getElementById('modalItemId').value = '';
    document.getElementById('modalMedicineId').value = '';
    document.getElementById('modalMedName').value = '';
    document.getElementById('modalActiveIngredient').value = '';
    document.getElementById('modalDosageForm').value = 'أقراص';
    document.getElementById('modalCategory').value = 'مسكنات وخافض حرارة';
    document.getElementById('modalMedQty').value = '10';
    document.getElementById('modalMedPrice').value = '35.00';
    document.getElementById('modalMedCost').value = '25.00';
    document.getElementById('modalMedThreshold').value = '5';
    document.getElementById('modalMedExpiry').value = '2027-06-01';
    document.getElementById('modalMedBatch').value = `BCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('modalMedShelf').value = 'رف A1';
    document.getElementById('modalMedImage').value = '../../assets/images/1.jpg';
    document.getElementById('modalMedImagePreview').src = '../../assets/images/1.jpg';
    document.getElementById('modalSubmitBtn').innerHTML = '<i class="fa-solid fa-plus me-1"></i> إضافة للمخزون';

    const priceInput = modalEl.querySelector('#modalMedPrice');
    priceInput?.dispatchEvent(new Event('input'));

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  function openEditModal(item) {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = `تعديل مخزون: ${item.nameAr}`;
    document.getElementById('modalItemId').value = item._id;
    document.getElementById('modalMedicineId').value = item.medicineId || '';
    document.getElementById('modalMedName').value = item.nameAr;
    document.getElementById('modalActiveIngredient').value = item.activeIngredient || '';
    document.getElementById('modalDosageForm').value = item.dosageForm || 'أقراص';
    document.getElementById('modalCategory').value = item.category || 'أدوية عامة';
    document.getElementById('modalMedQty').value = item.quantity;
    document.getElementById('modalMedPrice').value = item.customPrice;
    document.getElementById('modalMedCost').value = item.costPrice || '';
    document.getElementById('modalMedThreshold').value = item.lowStockThreshold || '5';
    document.getElementById('modalMedExpiry').value = item.expiryDate ? item.expiryDate.split('T')[0] : '2027-06-01';
    document.getElementById('modalMedBatch').value = item.batchNumber || `BCH-${new Date().getFullYear()}-1024`;
    document.getElementById('modalMedShelf').value = item.shelfLocation || '';
    
    const imgSrc = item.image || '../../assets/images/1.jpg';
    document.getElementById('modalMedImage').value = imgSrc;
    document.getElementById('modalMedImagePreview').src = imgSrc;

    document.getElementById('modalSubmitBtn').innerHTML = '<i class="fa-solid fa-save me-1"></i> حفظ التعديلات';

    const priceInput = modalEl.querySelector('#modalMedPrice');
    priceInput?.dispatchEvent(new Event('input'));

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  if (addMedBtn) addMedBtn.addEventListener('click', openAddModal);
  if (bottomAddMedBtn) bottomAddMedBtn.addEventListener('click', openAddModal);

  // ====================================================================
  // Advanced Bulk Import System (Excel & CSV with Auto Column Mapping)
  // ====================================================================
  function ensureBulkImportModal() {
    let modalEl = document.getElementById('bulkImportModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'bulkImportModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content" style="border-radius: 18px; overflow: hidden; border: none; box-shadow: 0 25px 60px rgba(0,0,0,0.2);">
            <div class="modal-header bg-primary text-white py-3 px-4">
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-file-import fs-4"></i>
                <div>
                  <h5 class="modal-title font-bold m-0">استيراد أدوية مجمعة (Excel / CSV)</h5>
                  <span style="font-size: 12px; opacity: 0.9;">استورد شيتات الإكسل بدقة وسرعة مع مطابقة تلقائية للأعمدة</span>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Templates Bar -->
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 mb-3 bg-light rounded-3 border">
                <div>
                  <strong class="d-block text-dark" style="font-size: 13.5px;"><i class="fa-solid fa-download text-primary me-1"></i> قوالب جاهزة لتسهيل التعبئة:</strong>
                  <small class="text-muted" style="font-size: 12px;">يمكنك تحميل نموذج إكسل أو CSV وتعبئة أدويتك عليه مباشرة.</small>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-success btn-sm font-bold" id="downloadExcelTemplateBtn">
                    <i class="fa-solid fa-file-excel me-1"></i> قالب Excel (.xlsx)
                  </button>
                  <button type="button" class="btn btn-outline-primary btn-sm font-bold" id="downloadCsvTemplateBtn">
                    <i class="fa-solid fa-file-csv me-1"></i> قالب CSV
                  </button>
                </div>
              </div>

              <!-- Upload Tabs -->
              <ul class="nav nav-pills mb-3" id="importTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active font-bold" id="fileTabBtn" data-bs-toggle="pill" data-bs-target="#fileUploadTab" type="button" role="tab">
                    <i class="fa-solid fa-cloud-arrow-up me-1"></i> رفع ملف (Excel / CSV)
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link font-bold" id="textTabBtn" data-bs-toggle="pill" data-bs-target="#textPasteTab" type="button" role="tab">
                    <i class="fa-solid fa-paste me-1"></i> لصق بيانات نصية
                  </button>
                </li>
              </ul>

              <div class="tab-content" id="importTabContent">
                <!-- Tab 1: File Upload -->
                <div class="tab-pane fade show active" id="fileUploadTab" role="tabpanel">
                  <input type="file" id="csvFileInput" accept=".xlsx,.xls,.csv,.txt" style="display:none;">
                  <div id="csvDropZone" style="
                    border: 2.5px dashed #0d6efd;
                    border-radius: 14px;
                    padding: 32px 20px;
                    text-align: center;
                    cursor: pointer;
                    background: #f0f6ff;
                    transition: all 0.2s;
                  ">
                    <div id="dropZoneIcon" style="font-size: 2.8rem; color: #0d6efd; margin-bottom: 8px;">
                      <i class="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div id="dropZoneText" style="font-size: 1.05rem; color: #1e293b; font-weight: 700;">
                      اسحب شيت الإكسل أو CSV وأفلته هنا أو
                      <span style="color: #0d6efd; text-decoration: underline; cursor: pointer;" id="dropZoneBrowse">اختر ملفاً من جهازك</span>
                    </div>
                    <div id="dropZoneFileName" style="margin-top: 10px; font-size: 0.95rem; color: #198754; font-weight: 700; display: none;"></div>
                    <div style="margin-top: 8px; font-size: 0.8rem; color: #64748b;">يدعم ملفات: .XLSX, .XLS, .CSV — قراءة تلقائية للأعمدة</div>
                  </div>
                </div>

                <!-- Tab 2: Text Paste -->
                <div class="tab-pane fade" id="textPasteTab" role="tabpanel">
                  <label class="form-label font-bold text-dark">الصق أسطر CSV (اسم الدواء, الكمية, السعر, تاريخ الصلاحية):</label>
                  <textarea id="csvTextInput" class="form-control" rows="6" placeholder="اسم الدواء,الكمية,السعر,تاريخ الصلاحية
بانادول إكسترا أقراص,50,45.00,2027-12-31
أوجمنتين 1 جم أقراص,30,110.00,2026-10-15
أوميجا 3 بلس كبسولات,25,120.00,2027-08-01"></textarea>
                  <small class="text-muted mt-1 d-block" style="font-size: 11.5px;">تنبيه: لا تقم بلصق ملف إكسل ثنائي كـ نص! استخدم تبويب رفع الملف للأكسل.</small>
                </div>
              </div>

              <!-- Preview Area -->
              <div id="bulkPreviewArea" class="d-none mt-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="font-bold text-dark m-0">
                    <i class="fa-solid fa-list-check text-success me-1"></i> تم استخراج <span id="parsedCount" class="badge bg-success">0</span> دواء جاهز للاستيراد:
                  </h6>
                  <span class="text-muted small" id="detectedColumnsBadge">أعمدة مكتشفة تلقائياً</span>
                </div>
                <div class="table-responsive border rounded" style="max-height: 200px; overflow-y: auto;">
                  <table class="table table-sm table-striped mb-0 text-center" style="font-size: 13px;">
                    <thead class="table-light sticky-top">
                      <tr>
                        <th style="text-align: right;">اسم الدواء</th>
                        <th>الكمية</th>
                        <th>سعر البيع</th>
                        <th>الصلاحية</th>
                        <th>الموقع</th>
                      </tr>
                    </thead>
                    <tbody id="bulkPreviewTableBody"></tbody>
                  </table>
                </div>

                <!-- Import Mode Selection -->
                <div class="mt-3 p-3 bg-light rounded border">
                  <label class="form-label font-bold text-dark mb-2">طريقة الاستيراد:</label>
                  <div class="d-flex gap-4">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="importMode" id="importModeMerge" value="merge" checked>
                      <label class="form-check-label font-bold text-dark" for="importModeMerge">
                        دمج مع المخزون الحالي (إضافة وتحديث الكميات)
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="importMode" id="importModeReplace" value="replace">
                      <label class="form-check-label text-danger font-bold" for="importModeReplace">
                        استبدال المخزون الحالي بالكامل
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">إلغاء</button>
                <button type="button" class="btn btn-primary px-4 font-bold" id="executeBulkImportBtn" disabled>
                  <i class="fa-solid fa-cloud-arrow-up me-1"></i> استيراد وحفظ في المخزون
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      // Elements
      const fileInput = modalEl.querySelector('#csvFileInput');
      const dropZone = modalEl.querySelector('#csvDropZone');
      const dropZoneBrowse = modalEl.querySelector('#dropZoneBrowse');
      const dropZoneFileName = modalEl.querySelector('#dropZoneFileName');
      const textInput = modalEl.querySelector('#csvTextInput');
      const previewArea = modalEl.querySelector('#bulkPreviewArea');
      const previewBody = modalEl.querySelector('#bulkPreviewTableBody');
      const countEl = modalEl.querySelector('#parsedCount');
      const execBtn = modalEl.querySelector('#executeBulkImportBtn');
      const dlCsvBtn = modalEl.querySelector('#downloadCsvTemplateBtn');
      const dlXlsxBtn = modalEl.querySelector('#downloadExcelTemplateBtn');

      let parsedItems = [];

      // Download CSV Template
      dlCsvBtn?.addEventListener('click', () => {
        const template = 'اسم الدواء,الكمية,سعر البيع,سعر التكلفة,تاريخ الصلاحية,الموقع\nبانادول إكسترا أقراص,50,45.00,35.00,2027-12-31,رف A1\nأوجمنتين 1 جم أقراص,30,110.00,85.00,2026-10-15,رف B2\nكونجستال أقراص,40,35.00,26.00,2027-06-30,رف C1\nأوميجا 3 بلس كبسولات,25,120.00,90.00,2027-08-01,رف A3';
        const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'قالب_استيراد_مخزون_ترياق.csv';
        link.click();
      });

      // Download Excel Template
      dlXlsxBtn?.addEventListener('click', () => {
        if (typeof XLSX === 'undefined') {
          dlCsvBtn.click();
          return;
        }
        const data = [
          ['اسم الدواء', 'الكمية', 'سعر البيع', 'سعر التكلفة', 'تاريخ الصلاحية', 'الموقع'],
          ['بانادول إكسترا أقراص', 50, 45.00, 35.00, '2027-12-31', 'رف A1'],
          ['أوجمنتين 1 جم أقراص', 30, 110.00, 85.00, '2026-10-15', 'رف B2'],
          ['كونجستال أقراص', 40, 35.00, 26.00, '2027-06-30', 'رف C1'],
          ['أوميجا 3 بلس كبسولات', 25, 120.00, 90.00, '2027-08-01', 'رف A3']
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'المخزون');
        XLSX.writeFile(wb, 'قالب_استيراد_مخزون_ترياق.xlsx');
      });

      // Smart Excel Date Converter
      function parseExcelDate(val) {
        if (!val) return '2027-12-31';
        if (typeof val === 'number') {
          // Excel serial date to JS Date
          const date = new Date(Math.round((val - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
        }
        if (val instanceof Date) {
          return val.toISOString().split('T')[0];
        }
        const str = String(val).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        // DD/MM/YYYY or DD-MM-YYYY
        const parts = str.split(/[/.-]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return '2027-12-31';
      }

      // Column Header Matching Logic
      function detectColumnIndices(headers) {
        const mapping = { name: 0, qty: -1, price: -1, cost: -1, expiry: -1, shelf: -1 };

        headers.forEach((h, idx) => {
          const col = String(h || '').toLowerCase().trim();
          if (col.includes('اسم') || col.includes('صنف') || col.includes('دواء') || col.includes('name') || col.includes('medicine')) {
            mapping.name = idx;
          } else if (col.includes('كمي') || col.includes('عدد') || col.includes('رصيد') || col.includes('qty') || col.includes('quantity') || col.includes('stock')) {
            mapping.qty = idx;
          } else if (col.includes('سعر البيع') || col.includes('سعر') || col.includes('جمهور') || col.includes('price') || col.includes('selling')) {
            if (mapping.price === -1) mapping.price = idx;
          } else if (col.includes('تكلف') || col.includes('شراء') || col.includes('cost')) {
            mapping.cost = idx;
          } else if (col.includes('صلاحي') || col.includes('انتهاء') || col.includes('تاريخ') || col.includes('expiry') || col.includes('exp')) {
            mapping.expiry = idx;
          } else if (col.includes('رف') || col.includes('مكان') || col.includes('مخزن') || col.includes('shelf') || col.includes('loc')) {
            mapping.shelf = idx;
          }
        });

        // Fallbacks if not detected by header name
        if (mapping.qty === -1) mapping.qty = 1;
        if (mapping.price === -1) mapping.price = 2;
        if (mapping.expiry === -1) mapping.expiry = 3;

        return mapping;
      }

      // Process Excel Workbook via SheetJS
      function processExcelWorkbook(workbook) {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

        if (!rows || rows.length === 0) {
          if (window.Toast) window.Toast.warning('الملف فارغ أو لا يحتوي على صفوف صالحة', 'ملف فارغ');
          return;
        }

        const firstRow = rows[0] || [];
        const isHeader = firstRow.some(c => {
          const s = String(c).toLowerCase();
          return s.includes('اسم') || s.includes('دواء') || s.includes('name') || s.includes('كمي') || s.includes('qty');
        });

        const mapping = isHeader ? detectColumnIndices(firstRow) : { name: 0, qty: 1, price: 2, cost: 3, expiry: 4, shelf: 5 };
        const startIndex = isHeader ? 1 : 0;
        const items = [];

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          let rawName = String(row[mapping.name] || '').trim();
          if (!rawName) continue;

          // Reject raw binary / zip artifacts
          if (rawName.includes('xl/') || rawName.includes('docProps') || rawName.includes('[Content_Types]') || rawName.includes('.xmlPK')) {
            continue;
          }

          const rawQty = Number(String(row[mapping.qty] || '').replace(/[^\d.]/g, '')) || 10;
          const rawPrice = Number(String(row[mapping.price] || '').replace(/[^\d.]/g, '')) || 35.00;
          const rawCost = mapping.cost !== -1 && row[mapping.cost] ? Number(String(row[mapping.cost]).replace(/[^\d.]/g, '')) : undefined;
          const rawExpiry = mapping.expiry !== -1 && row[mapping.expiry] ? parseExcelDate(row[mapping.expiry]) : '2027-12-31';
          const rawShelf = mapping.shelf !== -1 && row[mapping.shelf] ? String(row[mapping.shelf]).trim() : '';

          items.push({
            medicineName: rawName,
            quantity: rawQty,
            customPrice: rawPrice,
            costPrice: rawCost,
            expiryDate: rawExpiry,
            shelfLocation: rawShelf
          });
        }

        updatePreview(items);
        if (items.length > 0 && window.Toast) {
          window.Toast.success(`تم بنجاح تحليل شيت الإكسل: ${items.length} صنف جاهز`, 'تمت قراءة Excel');
        }
      }

      // Robust CSV Parser (Supports Comma, Semicolon, Tab Delimiters & Quotes)
      function parseCsvString(csvText) {
        if (!csvText || !csvText.trim()) return [];

        // Check if user accidentally pasted raw binary content
        if (csvText.includes('PK\x03\x04') || csvText.includes('[Content_Types]') || csvText.includes('xl/media')) {
          if (window.Toast) {
            window.Toast.error('النص المنسوخ يحتوي على محتوى ملف ثنائي! يرجى رفع ملف الإكسل عبر زر رفع الملف بدلاً من نسخه كنص.', 'خطأ في المحتوى');
          }
          return [];
        }

        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        // Detect delimiter: semicolon (Excel Arabic/Europe), comma, or tab
        const firstLine = lines[0];
        let delimiter = ',';
        const commas = (firstLine.match(/,/g) || []).length;
        const semis = (firstLine.match(/;/g) || []).length;
        const tabs = (firstLine.match(/\t/g) || []).length;

        if (semis > commas && semis > tabs) delimiter = ';';
        else if (tabs > commas && tabs > semis) delimiter = '\t';

        const parseLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current.trim().replace(/^"|"$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^"|"$/g, ''));
          return result;
        };

        const headers = parseLine(lines[0]);
        const isHeader = headers.some(h => {
          const s = h.toLowerCase();
          return s.includes('اسم') || s.includes('دواء') || s.includes('name') || s.includes('كمي') || s.includes('qty');
        });

        const mapping = isHeader ? detectColumnIndices(headers) : { name: 0, qty: 1, price: 2, cost: 3, expiry: 4, shelf: 5 };
        const startIndex = isHeader ? 1 : 0;
        const items = [];

        for (let i = startIndex; i < lines.length; i++) {
          const parts = parseLine(lines[i]);
          const name = parts[mapping.name] ? parts[mapping.name].trim() : '';
          if (!name) continue;

          // Reject binary remnants
          if (name.includes('xl/') || name.includes('docProps') || name.includes('[Content_Types]')) continue;

          const qty = Number(String(parts[mapping.qty] || '').replace(/[^\d.]/g, '')) || 10;
          const price = Number(String(parts[mapping.price] || '').replace(/[^\d.]/g, '')) || 35.00;
          const cost = mapping.cost !== -1 && parts[mapping.cost] ? Number(String(parts[mapping.cost]).replace(/[^\d.]/g, '')) : undefined;
          const expiry = mapping.expiry !== -1 && parts[mapping.expiry] ? parts[mapping.expiry].trim() : '2027-12-31';
          const shelf = mapping.shelf !== -1 && parts[mapping.shelf] ? parts[mapping.shelf].trim() : '';

          items.push({
            medicineName: name,
            quantity: qty,
            customPrice: price,
            costPrice: cost,
            expiryDate: expiry,
            shelfLocation: shelf
          });
        }

        return items;
      }

      function updatePreview(items) {
        parsedItems = items;
        if (!items || items.length === 0) {
          previewArea.classList.add('d-none');
          execBtn.disabled = true;
          return;
        }

        countEl.textContent = items.length.toLocaleString('ar-EG');
        previewBody.innerHTML = items.slice(0, 8).map(item => `
          <tr>
            <td style="text-align: right;" class="font-bold text-dark">${escapeHtml(item.medicineName)}</td>
            <td><span class="badge bg-light text-dark border">${item.quantity}</span></td>
            <td><strong class="text-success">${item.customPrice.toFixed(2)} ج.م</strong></td>
            <td><small class="text-muted">${escapeHtml(item.expiryDate)}</small></td>
            <td><small class="shelf-tag">${escapeHtml(item.shelfLocation || '—')}</small></td>
          </tr>
        `).join('');

        if (items.length > 8) {
          previewBody.innerHTML += `<tr><td colspan="5" class="text-center text-muted font-bold py-2 bg-light">+ ${items.length - 8} أدوية أخرى في الملف...</td></tr>`;
        }

        previewArea.classList.remove('d-none');
        execBtn.disabled = false;
      }

      function processFile(file) {
        if (!file) return;
        const maxSize = 8 * 1024 * 1024;
        if (file.size > maxSize) {
          if (window.Toast) window.Toast.error('حجم الملف يتجاوز 8 ميجابايت', 'ملف كبير');
          return;
        }

        dropZoneFileName.textContent = `✓ تم اختيار: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        dropZoneFileName.style.display = 'block';
        dropZone.style.borderColor = '#198754';
        dropZone.style.background = '#f0fff4';

        const ext = file.name.split('.').pop().toLowerCase();
        const isExcel = ext === 'xlsx' || ext === 'xls';

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const buffer = event.target.result;
            // Check magic bytes: PK\x03\x04 (0x50, 0x4B) indicates a ZIP (XLSX) file
            const uint = new Uint8Array(buffer.slice(0, 4));
            const isZipMagic = uint[0] === 0x50 && uint[1] === 0x4B;

            if (isExcel || isZipMagic) {
              if (typeof XLSX === 'undefined') {
                if (window.Toast) window.Toast.error('مكتبة Excel غير جاهزة، جرب ملف CSV', 'تنبيه');
                return;
              }
              const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
              processExcelWorkbook(workbook);
            } else {
              // CSV text
              const text = new TextDecoder('utf-8').decode(buffer);
              textInput.value = text;
              const items = parseCsvString(text);
              updatePreview(items);
              if (items.length > 0 && window.Toast) {
                window.Toast.success(`تم قراءة ملف CSV: ${items.length} صنف`, 'تم التحميل');
              }
            }
          } catch (err) {
            console.error('File parsing error:', err);
            if (window.Toast) window.Toast.error('تعذر استخراج البيانات من الملف. تأكد من سلامة الملف وصيغته.', 'خطأ في القراءة');
          }
        };

        reader.readAsArrayBuffer(file);
      }

      // Drag & Drop Handlers
      dropZone.addEventListener('click', () => fileInput.click());
      if (dropZoneBrowse) {
        dropZoneBrowse.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });
      }
      fileInput.addEventListener('change', (e) => processFile(e.target.files[0]));

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.background = '#dbeaff';
        dropZone.style.borderColor = '#0d6efd';
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dropZoneFileName.textContent) {
          dropZone.style.background = '#f0f6ff';
        }
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      });

      textInput?.addEventListener('input', () => {
        const items = parseCsvString(textInput.value);
        updatePreview(items);
      });

      // Execute Bulk Import
      execBtn.addEventListener('click', async () => {
        const itemsToImport = parsedItems.length > 0 ? parsedItems : parseCsvString(textInput.value);
        if (itemsToImport.length === 0) {
          if (window.Toast) window.Toast.warning('يرجى اختيار ملف أو إدخال أدوية صالحة للاستيراد', 'لا توجد بيانات');
          return;
        }

        execBtn.disabled = true;
        execBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري استيراد وحفظ الأدوية...';

        const importMode = modalEl.querySelector('input[name="importMode"]:checked')?.value || 'merge';

        // 1. Sync with Backend API
        try {
          if (window.API && window.API.inventory) {
            await window.API.inventory.bulkImport(itemsToImport);
          }
        } catch (err) {
          console.warn('Bulk import API fallback:', err.message);
        }

        // 2. Local State Processing
        if (importMode === 'replace') {
          currentInventory = itemsToImport.map((item, idx) => ({
            _id: `inv_imp_${Date.now()}_${idx}`,
            nameAr: item.medicineName,
            quantity: item.quantity,
            customPrice: item.customPrice,
            costPrice: item.costPrice,
            expiryDate: item.expiryDate,
            shelfLocation: item.shelfLocation || 'رف A1',
            image: '../../assets/images/1.jpg'
          }));
        } else {
          // Merge
          itemsToImport.forEach(item => {
            const existing = currentInventory.find(i => i.nameAr === item.medicineName);
            if (existing) {
              existing.quantity += item.quantity;
              existing.customPrice = item.customPrice;
              if (item.costPrice) existing.costPrice = item.costPrice;
              if (item.expiryDate) existing.expiryDate = item.expiryDate;
              if (item.shelfLocation) existing.shelfLocation = item.shelfLocation;
            } else {
              currentInventory.unshift({
                _id: `inv_imp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                nameAr: item.medicineName,
                quantity: item.quantity,
                customPrice: item.customPrice,
                costPrice: item.costPrice,
                expiryDate: item.expiryDate,
                shelfLocation: item.shelfLocation || 'رف A1',
                image: '../../assets/images/1.jpg'
              });
            }
          });
        }

        // Sanitize final list to guarantee zero corruption
        currentInventory = sanitizeInventoryList(currentInventory);
        saveLocalInventory();
        applyFilters();

        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (window.Toast) {
          window.Toast.success(`تم استيراد ${itemsToImport.length} دواء إلى مخزون الصيدلية بنجاح!`, 'تم الاستيراد بنجاح');
        }

        execBtn.disabled = false;
        execBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> استيراد وحفظ في المخزون';
      });
    }
    return modalEl;
  }

  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', () => {
      const modalEl = ensureBulkImportModal();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
  }

  // ====================================================================
  // Export Inventory to Excel & CSV
  // ====================================================================
  if (exportInventoryBtn) {
    exportInventoryBtn.addEventListener('click', () => {
      if (!currentInventory || currentInventory.length === 0) {
        if (window.Toast) window.Toast.warning('المخزون فارغ حالياً لتصديره', 'تنبيه');
        return;
      }

      if (typeof XLSX !== 'undefined') {
        const rows = [
          ['اسم الدواء', 'الكمية', 'سعر البيع (ج.م)', 'سعر التكلفة', 'تاريخ الصلاحية', 'الموقع / الرف', 'الحالة']
        ];
        currentInventory.forEach(item => {
          const qty = Number(item.quantity) || 0;
          const status = qty === 0 ? 'نفد المخزون' : (qty <= 5 ? 'نواقص' : 'متوفر');
          rows.push([
            item.nameAr || 'دواء',
            qty,
            Number(item.customPrice || 25),
            item.costPrice ? Number(item.costPrice) : '',
            item.expiryDate || '2027-01-01',
            item.shelfLocation || '',
            status
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'مخزون الصيدلية');
        XLSX.writeFile(wb, `مخزون_صيدلية_ترياق_${new Date().toISOString().split('T')[0]}.xlsx`);

        if (window.Toast) window.Toast.success('تم تصدير ملف المخزون كـ Excel بنجاح', 'تصدير المخزون');
      } else {
        // Fallback to CSV
        let csv = 'اسم الدواء,الكمية,سعر البيع,تاريخ الصلاحية,الموقع\n';
        currentInventory.forEach(item => {
          csv += `"${escapeHtml(item.nameAr)}",${item.quantity},${item.customPrice || 25},"${item.expiryDate || '2027-01-01'}","${escapeHtml(item.shelfLocation || '')}"\n`;
        });
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `مخزون_صيدلية_ترياق_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        if (window.Toast) window.Toast.success('تم تصدير ملف المخزون كـ CSV بنجاح', 'تصدير المخزون');
      }
    });
  }

  // Initial Load
  loadInventory();
});