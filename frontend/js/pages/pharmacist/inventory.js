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
  const wipeAllInventoryBtn = document.getElementById('wipeAllInventoryBtn');
  const quickWipeAllBtn = document.getElementById('quickWipeAllBtn');
  const loadSample25Btn = document.getElementById('loadSample25Btn');

  // Bulk Selection Bar Elements
  const bulkActionBar = document.getElementById('bulkActionBar');
  const selectedCountBadge = document.getElementById('selectedCountBadge');
  const selectedCountText = document.getElementById('selectedCountText');
  const selectAllMatchingBtn = document.getElementById('selectAllMatchingBtn');
  const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  const deleteSelectedBtnCount = document.getElementById('deleteSelectedBtnCount');

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
  let selectedItemIds = new Set();
  let currentPage = 1;
  let itemsPerPage = 15;
  let currentViewMode = 'table'; // 'table' | 'cards'

  // Curated 25 Real Egyptian Medicines with Photos & Full Data
  const sample25Medicines = [
    {
      _id: 'inv_s1',
      nameAr: 'بانادول إكسترا 500 مجم أقراص',
      nameEn: 'Panadol Extra Tablets',
      quantity: 45,
      customPrice: 45.00,
      costPrice: 35.00,
      expiryDate: '2027-12-31',
      shelfLocation: 'رف A1',
      activeIngredient: 'Paracetamol + Caffeine',
      dosageForm: 'أقراص',
      category: 'مسكنات وخافض حرارة',
      image: '../../assets/images/parst.jpg'
    },
    {
      _id: 'inv_s2',
      nameAr: 'أوجمنتين 1 جم أقراص مضاد حيوي',
      nameEn: 'Augmentin 1g Tablets',
      quantity: 28,
      customPrice: 110.00,
      costPrice: 88.00,
      expiryDate: '2026-11-15',
      shelfLocation: 'رف B2',
      activeIngredient: 'Amoxicillin + Clavulanate',
      dosageForm: 'أقراص',
      category: 'مضادات حيوية',
      image: '../../assets/images/amoc.jpg'
    },
    {
      _id: 'inv_s3',
      nameAr: 'كونجستال أقراص للبرد والإنفلونزا',
      nameEn: 'Congestal Tablets',
      quantity: 35,
      customPrice: 35.00,
      costPrice: 26.00,
      expiryDate: '2027-06-30',
      shelfLocation: 'رف C1',
      activeIngredient: 'Paracetamol + Pseudoephedrine',
      dosageForm: 'أقراص',
      category: 'أدوية البرد والإنفلونزا',
      image: '../../assets/images/congestal.jpg'
    },
    {
      _id: 'inv_s4',
      nameAr: 'ريفو 75 مجم أقراص أسبرين للسيولة',
      nameEn: 'Rivo 75mg Tablets',
      quantity: 60,
      customPrice: 20.00,
      costPrice: 14.00,
      expiryDate: '2028-01-10',
      shelfLocation: 'رف A2',
      activeIngredient: 'Acetylsalicylic Acid',
      dosageForm: 'أقراص',
      category: 'أدوية الضغط والقلب',
      image: '../../assets/images/aspirin.jpg'
    },
    {
      _id: 'inv_s5',
      nameAr: 'أوميجا 3 بلس كبسولات جيلاتينية',
      nameEn: 'Omega 3 Plus Capsules',
      quantity: 22,
      customPrice: 120.00,
      costPrice: 92.00,
      expiryDate: '2027-08-20',
      shelfLocation: 'رف A3',
      activeIngredient: 'Fish Oil + Wheat Germ Oil',
      dosageForm: 'كبسولات',
      category: 'فيتامينات ومكملات',
      image: '../../assets/images/omega.jpg'
    },
    {
      _id: 'inv_s6',
      nameAr: 'فيتامين د 1000 وحدة دولية نقط',
      nameEn: 'Vitamin D3 Drops',
      quantity: 4,
      customPrice: 85.00,
      costPrice: 65.00,
      expiryDate: '2026-12-05',
      shelfLocation: 'ثلاجة 1',
      activeIngredient: 'Cholecalciferol',
      dosageForm: 'نقط / قطرة',
      category: 'فيتامينات ومكملات',
      image: '../../assets/images/vitamine.jpg'
    },
    {
      _id: 'inv_s7',
      nameAr: 'كاتافلام 50 مجم مسكن ومضاد للالتهاب',
      nameEn: 'Cataflam 50mg Tablets',
      quantity: 30,
      customPrice: 52.00,
      costPrice: 40.00,
      expiryDate: '2027-09-15',
      shelfLocation: 'رف A1',
      activeIngredient: 'Diclofenac Potassium',
      dosageForm: 'أقراص',
      category: 'مسكنات وخافض حرارة',
      image: '../../assets/images/tablets.jpg'
    },
    {
      _id: 'inv_s8',
      nameAr: 'أنتينال 200 مجم كبسولات مطهر معوي',
      nameEn: 'Antinal 200mg Capsules',
      quantity: 18,
      customPrice: 30.00,
      costPrice: 22.00,
      expiryDate: '2027-04-10',
      shelfLocation: 'رف D2',
      activeIngredient: 'Nifuroxazide',
      dosageForm: 'كبسولات',
      category: 'جهاز هضمي ومعدة',
      image: '../../assets/images/capsules.jpg'
    },
    {
      _id: 'inv_s9',
      nameAr: 'بروفين 400 مجم أقراص مسكن وخافض حرارة',
      nameEn: 'Brufen 400mg Tablets',
      quantity: 50,
      customPrice: 38.00,
      costPrice: 29.00,
      expiryDate: '2027-11-20',
      shelfLocation: 'رف A2',
      activeIngredient: 'Ibuprofen',
      dosageForm: 'أقراص',
      category: 'مسكنات وخافض حرارة',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_s10',
      nameAr: 'سيتال شراب خافض حرارة للأطفال',
      nameEn: 'Cetal Syrup',
      quantity: 14,
      customPrice: 18.00,
      costPrice: 13.50,
      expiryDate: '2027-03-01',
      shelfLocation: 'رف S1',
      activeIngredient: 'Paracetamol',
      dosageForm: 'شراب',
      category: 'مسكنات وخافض حرارة',
      image: '../../assets/images/syrup.jpg'
    },
    {
      _id: 'inv_s11',
      nameAr: 'ألفينترن أقراص مضاد للتورم والارتشاح',
      nameEn: 'Alphintern Tablets',
      quantity: 2,
      customPrice: 45.00,
      costPrice: 34.00,
      expiryDate: '2026-10-30',
      shelfLocation: 'رف B1',
      activeIngredient: 'Chymotrypsin + Trypsin',
      dosageForm: 'أقراص',
      category: 'أدوية عامة',
      image: '../../assets/images/tablets.jpg'
    },
    {
      _id: 'inv_s12',
      nameAr: 'بانتوزول 40 مجم لعلاج قرحة وحموضة المعدة',
      nameEn: 'Pantozol 40mg Tablets',
      quantity: 12,
      customPrice: 95.00,
      costPrice: 72.00,
      expiryDate: '2028-02-15',
      shelfLocation: 'رف D1',
      activeIngredient: 'Pantoprazole',
      dosageForm: 'أقراص',
      category: 'جهاز هضمي ومعدة',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_s13',
      nameAr: 'أوتريفين بخاخ أنف للكبار لإزالة الاحتقان',
      nameEn: 'Otrivin Nasal Spray',
      quantity: 0,
      customPrice: 25.00,
      costPrice: 19.00,
      expiryDate: '2026-09-10',
      shelfLocation: 'رف N1',
      activeIngredient: 'Xylometazoline',
      dosageForm: 'بخاخ',
      category: 'حساسية وجهاز تنفسي',
      image: '../../assets/images/spray.jpg'
    },
    {
      _id: 'inv_s14',
      nameAr: 'ميبو مرهم لعلاج الحروق والجروح',
      nameEn: 'Mebo Ointment',
      quantity: 16,
      customPrice: 68.00,
      costPrice: 52.00,
      expiryDate: '2027-10-01',
      shelfLocation: 'رف M3',
      activeIngredient: 'B-Sitosterol',
      dosageForm: 'مرهم / كريم',
      category: 'جلدية وتجميل',
      image: '../../assets/images/ointment.jpg'
    },
    {
      _id: 'inv_s15',
      nameAr: 'كولونا أقراص لعلاج تقلصات القولون العصبي',
      nameEn: 'Colona Tablets',
      quantity: 25,
      customPrice: 42.00,
      costPrice: 32.00,
      expiryDate: '2027-07-25',
      shelfLocation: 'رف D2',
      activeIngredient: 'Mebeverine + Sulpiride',
      dosageForm: 'أقراص',
      category: 'جهاز هضمي ومعدة',
      image: '../../assets/images/tablets.jpg'
    },
    {
      _id: 'inv_s16',
      nameAr: 'فلاجيل 500 مجم أقراص مطهر ومضاد للطفيليات',
      nameEn: 'Flagyl 500mg Tablets',
      quantity: 40,
      customPrice: 26.00,
      costPrice: 19.50,
      expiryDate: '2027-05-15',
      shelfLocation: 'رف B3',
      activeIngredient: 'Metronidazole',
      dosageForm: 'أقراص',
      category: 'مضادات حيوية',
      image: '../../assets/images/2.jpg'
    },
    {
      _id: 'inv_s17',
      nameAr: 'فولتارين 75 مجم أمبول حقن مسكن قوي',
      nameEn: 'Voltaren 75mg Injection',
      quantity: 3,
      customPrice: 55.00,
      costPrice: 42.00,
      expiryDate: '2026-11-20',
      shelfLocation: 'درج الحقن',
      activeIngredient: 'Diclofenac Sodium',
      dosageForm: 'حقن',
      category: 'مسكنات وخافض حرارة',
      image: '../../assets/images/injection.jpg'
    },
    {
      _id: 'inv_s18',
      nameAr: 'جلوكوفاج 1000 مجم أقراص لتنظيم السكر',
      nameEn: 'Glucophage 1000mg Tablets',
      quantity: 35,
      customPrice: 60.00,
      costPrice: 46.00,
      expiryDate: '2028-03-30',
      shelfLocation: 'رف G1',
      activeIngredient: 'Metformin',
      dosageForm: 'أقراص',
      category: 'أدوية السكري',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_s19',
      nameAr: 'كونكور 5 مجم أقراص لعلاج ضغط الدم',
      nameEn: 'Concor 5mg Tablets',
      quantity: 20,
      customPrice: 58.00,
      costPrice: 44.00,
      expiryDate: '2027-12-10',
      shelfLocation: 'رف A2',
      activeIngredient: 'Bisoprolol',
      dosageForm: 'أقراص',
      category: 'أدوية الضغط والقلب',
      image: '../../assets/images/tablets.jpg'
    },
    {
      _id: 'inv_s20',
      nameAr: 'بريزولين قطرة معقمة للعين والحساسية',
      nameEn: 'Prisoline Eye Drops',
      quantity: 15,
      customPrice: 22.00,
      costPrice: 16.50,
      expiryDate: '2027-04-01',
      shelfLocation: 'ثلاجة 2',
      activeIngredient: 'Naphazoline + Chlorpheniramine',
      dosageForm: 'نقط / قطرة',
      category: 'حساسية وجهاز تنفسي',
      image: '../../assets/images/drops.jpg'
    },
    {
      _id: 'inv_s21',
      nameAr: 'كارباميد كريم مرطب ومجدد لخلايا الجلد',
      nameEn: 'Carbamide Cream',
      quantity: 30,
      customPrice: 20.00,
      costPrice: 15.00,
      expiryDate: '2027-08-15',
      shelfLocation: 'رف M1',
      activeIngredient: 'Urea 10%',
      dosageForm: 'مرهم / كريم',
      category: 'جلدية وتجميل',
      image: '../../assets/images/ointment.jpg'
    },
    {
      _id: 'inv_s22',
      nameAr: 'سيبتازول أقراص مضاد حيوي واسع المجال',
      nameEn: 'Septazole Tablets',
      quantity: 18,
      customPrice: 24.00,
      costPrice: 18.00,
      expiryDate: '2027-01-20',
      shelfLocation: 'رف B1',
      activeIngredient: 'Sulfamethoxazole + Trimethoprim',
      dosageForm: 'أقراص',
      category: 'مضادات حيوية',
      image: '../../assets/images/3.jpg'
    },
    {
      _id: 'inv_s23',
      nameAr: 'ميجاموكس 625 مجم أقراص مضاد حيوي',
      nameEn: 'Megamox 625mg Tablets',
      quantity: 1,
      customPrice: 85.00,
      costPrice: 65.00,
      expiryDate: '2026-10-15',
      shelfLocation: 'رف B2',
      activeIngredient: 'Amoxicillin + Clavulanate',
      dosageForm: 'أقراص',
      category: 'مضادات حيوية',
      image: '../../assets/images/amoc.jpg'
    },
    {
      _id: 'inv_s24',
      nameAr: 'جافيسكون شراب لعلاج الحموضة وحرقة المعدة',
      nameEn: 'Gaviscon Liquid',
      quantity: 10,
      customPrice: 65.00,
      costPrice: 50.00,
      expiryDate: '2027-06-15',
      shelfLocation: 'رف S2',
      activeIngredient: 'Sodium Alginate + Sodium Bicarbonate',
      dosageForm: 'شراب',
      category: 'جهاز هضمي ومعدة',
      image: '../../assets/images/syrup.jpg'
    },
    {
      _id: 'inv_s25',
      nameAr: 'ستربسلز أقراص استحلاب بنكهة العسل والليمون',
      nameEn: 'Strepsils Honey & Lemon',
      quantity: 50,
      customPrice: 75.00,
      costPrice: 57.00,
      expiryDate: '2028-06-30',
      shelfLocation: 'رف C2',
      activeIngredient: 'Dichlorobenzyl Alcohol',
      dosageForm: 'أقراص',
      category: 'أدوية البرد والإنفلونزا',
      image: '../../assets/images/4.jpg'
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

    // 1. Unicode replacement character (diamond question mark )
    if (name.includes('\uFFFD')) {
      return true;
    }

    // 2. Binary / ZIP / XML tokens from corrupted spreadsheet reading
    if (name.includes('xl/') || 
        name.includes('docProps') || 
        name.includes('[Content_Types]') || 
        name.includes('.xmlPK') || 
        name.includes('word/') || 
        name.includes('PK\x03\x04') ||
        name.includes('PK!') ||
        name.includes('PK')) {
      return true;
    }

    // 3. HTML injection remnants
    if (name.includes('class=') || name.includes('onerror=') || name.includes('<') || name.includes('>')) {
      return true;
    }

    // 4. Binary unprintable chars
    if (/[\x00-\x1F\x7F]/.test(name)) {
      return true;
    }

    // 5. Must contain valid Arabic or English letters (at least 3 letters)
    const arabicLetters = (name.match(/[\u0600-\u06FF]/g) || []).length;
    const englishLetters = (name.match(/[a-zA-Z]/g) || []).length;
    if (arabicLetters === 0 && englishLetters < 3) {
      return true;
    }

    // 6. Suspicious strings with weird non-letter characters and no Arabic
    if (arabicLetters === 0) {
      if (/[*#&^%$@!~`+=\\/{}\[\]|;?]/.test(name) || name.length <= 2) {
        return true;
      }
    }

    // 7. Long continuous strings without spaces
    if (name.length > 70 && !name.includes(' ')) {
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
    let loadedFromServer = false;
    let apiError = null;

    try {
      if (window.API && window.API.inventory) {
        const res = await window.API.inventory.getAll();
        if (res && Array.isArray(res.data)) {
          loadedFromServer = true;
          items = res.data.map(item => ({
            _id: item._id,
            medicineId: item.medicineId?._id || item.medicineId,
            nameAr: item.medicineId?.nameAr || item.medicineName || 'دواء',
            nameEn: item.medicineId?.nameEn || '',
            productType: item.medicineId?.productType || 'medicine',
            quantity: Number(item.quantity) || 0,
            customPrice: Number(item.customPrice || item.medicineId?.price || 25),
            costPrice: item.costPrice ? Number(item.costPrice) : undefined,
            shelfLocation: item.shelfLocation || '',
            batchNumber: item.batchNumber || '',
            activeIngredient: item.medicineId?.activeIngredient || '',
            category: item.medicineId?.category || 'أدوية عامة',
            dosageForm: item.medicineId?.dosageForm || 'أقراص',
            expiryDate: item.expiryDate ? String(item.expiryDate).split('T')[0] : '2027-01-01',
            image: item.medicineId?.image || item.image || ''
          }));
        }
      }
    } catch (e) {
      apiError = e;
      console.warn('[Inventory API Fallback]:', e.message);
    }

    if (!loadedFromServer) {
      try {
        const rawLocal = localStorage.getItem('pharmacist_inventory');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        }
      } catch (e) {}
    }

    if (!loadedFromServer && apiError && window.Toast) {
      window.Toast.warning('تعذر تحديث المخزون من الخادم؛ المعروض نسخة محفوظة محلياً وقد لا تعكس آخر التغييرات.', 'المخزون غير محدث');
    }

    currentInventory = items;
    if (loadedFromServer) saveLocalInventory();
    applyFilters();
    return loadedFromServer;
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

  // Selection Management Functions
  function updateSelectionUI() {
    const count = selectedItemIds.size;
    if (count > 0) {
      bulkActionBar?.classList.remove('d-none');
      if (selectedCountBadge) selectedCountBadge.textContent = count.toLocaleString('ar-EG');
      if (selectedCountText) selectedCountText.textContent = `أصناف محددة (${count} من أصل ${currentInventory.length})`;
      if (deleteSelectedBtnCount) deleteSelectedBtnCount.textContent = count.toLocaleString('ar-EG');
    } else {
      bulkActionBar?.classList.add('d-none');
    }

    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      const pageCheckboxes = document.querySelectorAll('.row-checkbox');
      const allChecked = pageCheckboxes.length > 0 && Array.from(pageCheckboxes).every(cb => cb.checked);
      const someChecked = Array.from(pageCheckboxes).some(cb => cb.checked);
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = !allChecked && someChecked;
    }
  }

  // 1) Modern Table View (Ultra-fast, dense, professional)
  function renderTableView(items) {
    let rowsHtml = '';

    items.forEach(item => {
      const isSelected = selectedItemIds.has(String(item._id));
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

      const img = escapeHtml(item.image || '');
      const name = escapeHtml(item.nameAr || 'دواء');
      const active = escapeHtml(item.productType === 'product' ? 'منتج صحي' : item.activeIngredient || item.dosageForm || '—');
      const category = escapeHtml(item.category || 'أدوية عامة');
      const shelf = escapeHtml(item.shelfLocation || '—');

      rowsHtml += `
        <tr data-id="${item._id}" class="${isSelected ? 'selected-row' : ''}">
          <td style="width: 44px; text-align: center;">
            <input type="checkbox" class="item-checkbox row-checkbox" data-id="${item._id}" ${isSelected ? 'checked' : ''} title="تحديد الصنف">
          </td>
          <td>
            <div class="med-cell">
              ${img ? `<img src="${img}" alt="${name}" class="med-thumb" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'med-thumb med-thumb-placeholder\\' aria-label=\\'لا توجد صورة\\'><i class=\\'fa-solid fa-box-open\\'></i></span>';">` : '<span class="med-thumb med-thumb-placeholder" aria-label="لا توجد صورة"><i class="fa-solid fa-box-open"></i></span>'}
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

    const isAllChecked = items.length > 0 && items.every(i => selectedItemIds.has(String(i._id)));

    inventoryContainer.innerHTML = `
      <div class="inventory-table-card">
        <div class="inventory-table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th style="width: 44px; text-align: center;">
                  <input type="checkbox" class="item-checkbox" id="selectAllCheckbox" ${isAllChecked ? 'checked' : ''} title="تحديد كل أصناف الصفحة">
                </th>
                <th style="min-width: 240px;">الدواء والتفاصيل</th>
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

    updateSelectionUI();
  }

  // 2) Modern Grid Cards View
  function renderCardsView(items) {
    let cardsHtml = '';

    items.forEach(item => {
      const isSelected = selectedItemIds.has(String(item._id));
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
      const img = escapeHtml(item.image || '');
      const name = escapeHtml(item.nameAr || 'دواء');
      const active = escapeHtml(item.productType === 'product' ? 'منتج صحي' : item.activeIngredient || item.dosageForm || '—');
      const shelf = escapeHtml(item.shelfLocation || '—');

      cardsHtml += `
        <div class="med-grid-card ${isSelected ? 'selected-row' : ''}" data-id="${item._id}">
          <div class="med-grid-header">
            <div class="d-flex align-items-center gap-2">
              <input type="checkbox" class="item-checkbox card-checkbox" data-id="${item._id}" ${isSelected ? 'checked' : ''} title="تحديد الصنف">
              ${img ? `<img src="${img}" alt="${name}" class="med-grid-thumb" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'med-grid-thumb med-thumb-placeholder\\' aria-label=\\'لا توجد صورة\\'><i class=\\'fa-solid fa-box-open\\'></i></span>';">` : '<span class="med-grid-thumb med-thumb-placeholder" aria-label="لا توجد صورة"><i class="fa-solid fa-box-open"></i></span>'}
            </div>
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

    updateSelectionUI();
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

      const previousQuantity = Number(item.quantity) || 0;
      if (btnPlus) {
        item.quantity = previousQuantity + 1;
      } else if (btnMinus) {
        if (previousQuantity > 0) item.quantity = previousQuantity - 1;
        else return;
      }

      if (item._id && item._id.length === 24) {
        try {
          if (!window.API || !window.API.inventory) throw new Error('تعذر الاتصال بالخادم.');
          await window.API.inventory.update(item._id, { quantity: item.quantity });
        } catch (err) {
          item.quantity = previousQuantity;
          if (window.Toast) window.Toast.error(err.message || 'تعذر تحديث الكمية.', 'فشل تحديث المخزون');
          return;
        }
      }

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
          if (itemId && itemId.length === 24) {
            if (!window.API || !window.API.inventory) throw new Error('تعذر الاتصال بالخادم.');
            await window.API.inventory.delete(itemId);
          }
        } catch (err) {
          console.error('Inventory delete failed:', err);
          if (window.Toast) window.Toast.error(err.message || 'تعذر حذف المنتج. لم يتم إجراء أي تغيير.', 'فشل الحذف');
          return;
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
  // ====================================================================
  // Wipe All Inventory Button Handler (تفريغ المخزون بالكامل)
  // ====================================================================
  if (wipeAllInventoryBtn) {
    wipeAllInventoryBtn.addEventListener('click', async () => {
      let confirmed = true;
      if (window.Toast && typeof window.Toast.confirm === 'function') {
        confirmed = await window.Toast.confirm({
          title: 'مسح المخزون بالكامل',
          message: 'هل أنت متأكد من رغبتك في حذف كافة بيانات المخزون وتفريغ الجدول تماماً؟',
          type: 'danger',
          confirmText: 'نعم، مسح كل المخزون',
          cancelText: 'إلغاء'
        });
      } else {
        confirmed = window.confirm('هل أنت متأكد من رغبتك في مسح كافة بيانات المخزون وتفريغ الجدول تماماً؟');
      }

      if (confirmed) {
        try {
          const savedItems = currentInventory.filter(item => item._id && item._id.length === 24);
          if (savedItems.length > 0) {
            if (!window.API || !window.API.inventory) throw new Error('تعذر الاتصال بالخادم.');
            await Promise.all(savedItems.map(item => window.API.inventory.delete(item._id)));
          }
          currentInventory = [];
          localStorage.removeItem('pharmacist_inventory');
          applyFilters();
          if (window.Toast) window.Toast.success('تم مسح وتفريغ كافة بيانات المخزون بنجاح.', 'تم تفريغ المخزون');
        } catch (err) {
          console.error('Inventory wipe failed:', err);
          await loadInventory();
          if (window.Toast) window.Toast.error(err.message || 'تعذر مسح المخزون بالكامل.', 'فشل المسح');
        }
      }
    });
  }

  // ====================================================================
  // Load 25 Sample Medicines with Photos Handler
  // ====================================================================
  if (loadSample25Btn) {
    loadSample25Btn.addEventListener('click', () => {
      currentInventory = JSON.parse(JSON.stringify(sample25Medicines));
      saveLocalInventory();
      applyFilters();
      if (window.Toast) {
        window.Toast.success('تمت تعبئة 25 دواء مصري مختلف مع الصور والأسعار والصلاحيات بنجاح!', 'تم تجهيز 25 صنفاً');
      }
    });
  }

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
        const cleaned = currentInventory.filter(item =>
          item && item._id && item._id.length === 24 ? true : !isCorruptedItem(item)
        );
        const removed = initialCount - cleaned.length;

        currentInventory = cleaned;
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
                  <h5 class="modal-title font-bold m-0" id="invModalTitle">إضافة منتج جديد للمخزون</h5>
                  <span class="modal-subtitle">أدخل الاسم والسعر والكمية، ويمكنك إضافة تفاصيل اختيارية</span>
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
                      <i class="fa-solid fa-image text-success me-1"></i> صورة المنتج (اختياري)
                    </label>
                    <div class="medicine-image-upload-card">
                      <div class="image-preview-wrapper" id="imagePreviewContainer">
                        <span id="imagePreviewPlaceholder" class="image-preview-placeholder"><i class="fa-solid fa-box-open"></i> لا توجد صورة</span>
                        <img id="modalMedImagePreview" class="d-none" alt="معاينة صورة المنتج" loading="lazy">
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
                      <label for="modalMedImageFile" class="btn btn-outline-success btn-sm w-100 mt-2">
                        <i class="fa-solid fa-upload me-1"></i> اختر صورة من جهازك
                      </label>
                      <div class="text-start mt-3">
                        <label for="modalMedImageUrl" class="form-label small fw-bold">أو رابط مباشر لصورة المنتج</label>
                        <input type="url" id="modalMedImageUrl" class="form-control form-control-sm" placeholder="https://example.com/product-image.jpg" inputmode="url">
                        <small class="text-muted d-block mt-1">أدخل رابط الصورة نفسها، وسيتم عرضها وحفظ الرابط بدل رفع ملف.</small>
                      </div>
                      <div id="modalImageUploadStatus" class="d-none text-success small mt-2" role="status" aria-live="polite">
                        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                        جاري رفع الصورة...
                      </div>

                    </div>
                  </div>

                  <!-- Name & Catalog Autocomplete Column -->
                  <div class="col-md-8 col-12">
                    <div class="mb-3 position-relative">
                      <label class="form-label font-bold text-dark">
                        نوع المنتج
                      </label>
                      <select id="modalProductType" class="form-select mb-3">
                        <option value="medicine">دواء</option>
                        <option value="product">منتج صحي (شامبو، عناية شخصية...)</option>
                      </select>
                      <label class="form-label font-bold text-dark">
                        اسم المنتج <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                        <input type="text" id="modalMedName" class="form-control" placeholder="مثال: شامبو، كريم، بانادول..." autocomplete="off" required>
                      </div>
                      <div id="catalogAutocompleteList" class="list-group position-absolute w-100 shadow-lg d-none" style="z-index: 1060; max-height: 240px; overflow-y: auto; top: 100%;"></div>
                    </div>

                    <div class="row g-2">
                      <div class="col-6 d-none">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">المادة الفعالة</label>
                        <input type="text" id="modalActiveIngredient" class="form-control form-control-sm" placeholder="مثال: Paracetamol">
                      </div>
                      <div class="col-6 d-none">
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
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">نوع المنتج أو تصنيفه</label>
                        <input id="modalCategory" class="form-control form-control-sm" list="productCategoryOptions" value="أدوية عامة" placeholder="اختر نوعًا أو اكتب نوعًا جديدًا">
                        <datalist id="productCategoryOptions">
                          <option value="أدوية عامة"></option>
                          <option value="مسكنات وخافض حرارة"></option>
                          <option value="مضادات حيوية"></option>
                          <option value="فيتامينات ومكملات"></option>
                          <option value="مستلزمات طبية"></option>
                          <option value="عناية شخصية"></option>
                          <option value="شامبو ومنتجات شعر"></option>
                          <option value="العناية بالبشرة"></option>
                          <option value="العناية بالفم والأسنان"></option>
                          <option value="مستحضرات تجميل"></option>
                          <option value="نظافة شخصية"></option>
                          <option value="منتجات الأطفال"></option>
                          <option value="حفاضات ومناديل"></option>
                          <option value="العناية بالمرأة"></option>
                          <option value="العناية بالرجال"></option>
                          <option value="أجهزة قياس ومتابعة"></option>
                          <option value="إسعافات أولية"></option>
                          <option value="أدوات طبية"></option>
                          <option value="منتجات تغذية"></option>
                          <option value="مستلزمات طبية"></option>
                          <option value="فيتامينات ومكملات"></option>
                        </datalist>
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="my-3 opacity-25">

                <!-- Section 2: Pricing & Stock Inventory -->
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-coins text-warning"></i> السعر والكمية
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">الكمية المتوفرة <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedQty" class="form-control" min="0" value="10" required>
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">سعر البيع (ج.م) <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedPrice" class="form-control" min="0.5" step="0.5" value="35.00" required>
                  </div>
                  <div class="col-md-3 col-6 d-none">
                    <label class="form-label font-bold text-dark">سعر التكلفة (ج.م)</label>
                    <input type="number" id="modalMedCost" class="form-control" min="0" step="0.5" placeholder="مثال: 25.00">
                  </div>
                  <div class="col-md-3 col-6 d-none">
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
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2 d-none">
                  <i class="fa-solid fa-calendar-check text-primary"></i> الصلاحية وموقع التخزين ورقم التشغيلة
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-4 col-12 d-none">
                    <label class="form-label font-bold text-dark">تاريخ انتهاء الصلاحية <span class="text-danger">*</span></label>
                    <input type="date" id="modalMedExpiry" class="form-control" value="2027-06-01">
                  </div>
                  <div class="col-md-4 col-6 d-none">
                    <label class="form-label font-bold text-dark">رقم التشغيلة (Batch No.)</label>
                    <div class="input-group">
                      <input type="text" id="modalMedBatch" class="form-control" placeholder="BATCH-1234">
                      <button type="button" class="btn btn-outline-secondary" id="btnGenBatch" title="توليد رقم تشغيلة تلقائي">
                        <i class="fa-solid fa-arrows-rotate"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4 col-6 d-none">
                    <label class="form-label font-bold text-dark">موقع الرف / المخزن</label>
                    <input type="text" id="modalMedShelf" class="form-control" placeholder="مثال: رف A3، ثلاجة 1">
                  </div>
                </div>

                <!-- Modal Footer Actions -->
                <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-4 flex-wrap gap-2">
                  <div class="form-check form-switch m-0 d-none">
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
      const productTypeSelect = modalEl.querySelector('#modalProductType');
      const priceInput = modalEl.querySelector('#modalMedPrice');
      const costInput = modalEl.querySelector('#modalMedCost');
      const dosageSelect = modalEl.querySelector('#modalDosageForm');
      const categorySelect = modalEl.querySelector('#modalCategory');
      const imgHidden = modalEl.querySelector('#modalMedImage');
      const imgPreview = modalEl.querySelector('#modalMedImagePreview');
      const imagePlaceholder = modalEl.querySelector('#imagePreviewPlaceholder');
      const fileInput = modalEl.querySelector('#modalMedImageFile');
      const imageUrlInput = modalEl.querySelector('#modalMedImageUrl');
      const imageUploadStatus = modalEl.querySelector('#modalImageUploadStatus');
      const clearImgBtn = modalEl.querySelector('#btnClearImage');
      const genBatchBtn = modalEl.querySelector('#btnGenBatch');
      const batchInput = modalEl.querySelector('#modalMedBatch');
      let previewObjectUrl = '';
      const setImagePreview = (src) => {
        if (src) {
          imgPreview.src = src;
          imgPreview.classList.remove('d-none');
          imagePlaceholder.classList.add('d-none');
        } else {
          imgPreview.removeAttribute('src');
          imgPreview.classList.add('d-none');
          imagePlaceholder.classList.remove('d-none');
        }
      };
      const releasePreviewObjectUrl = () => {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = '';
      };
      modalEl.addEventListener('hidden.bs.modal', () => {
        releasePreviewObjectUrl();
        fileInput.value = '';
        imageUploadStatus?.classList.add('d-none');
      });
      productTypeSelect?.addEventListener('change', () => {
        medIdInput.value = '';
        categorySelect.value = productTypeSelect.value === 'product' ? 'عناية شخصية' : 'أدوية عامة';
        if (!imgHidden.value && !imageUrlInput.value && !fileInput.files.length) {
          imgHidden.value = '';
          setImagePreview('');
        }
        autoList.classList.add('d-none');
      });

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
        if (!imgHidden.value && !imageUrlInput.value && !fileInput.files.length) setImagePreview('');
      });

      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && !file.type.startsWith('image/')) {
          fileInput.value = '';
          if (window.Toast) window.Toast.error('اختر ملف صورة صالحًا.', 'نوع ملف غير صالح');
          return;
        }
        if (file && file.size > 5 * 1024 * 1024) {
          fileInput.value = '';
          if (window.Toast) window.Toast.error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.', 'الصورة كبيرة');
          return;
        }
        if (file) {
          imageUrlInput.value = '';
          imgHidden.value = '';
          releasePreviewObjectUrl();
          previewObjectUrl = URL.createObjectURL(file);
          setImagePreview(previewObjectUrl);
          imageUploadStatus?.classList.remove('d-none');
          imageUploadStatus.lastChild.textContent = ' سيتم رفعها عند حفظ المنتج';
        }
      });

      imageUrlInput?.addEventListener('input', () => {
        const value = imageUrlInput.value.trim();
        fileInput.value = '';
        releasePreviewObjectUrl();
        if (!value) {
          imgHidden.value = '';
          setImagePreview('');
          return;
        }
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('رابط الصورة يجب أن يبدأ بـ http أو https');
          imgHidden.value = url.href;
          setImagePreview(url.href);
          imageUploadStatus?.classList.add('d-none');
        } catch {
          imgHidden.value = '';
          setImagePreview('');
        }
      });

      clearImgBtn?.addEventListener('click', () => {
        fileInput.value = '';
        imageUrlInput.value = '';
        releasePreviewObjectUrl();
        imageUploadStatus?.classList.add('d-none');
        modalEl.querySelector('#modalSubmitBtn').disabled = false;
        imgHidden.value = '';
        setImagePreview('');
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
          if (productTypeSelect.value === 'product') {
            medIdInput.value = '';
            autoList.classList.add('d-none');
            return;
          }
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
              const formImg = m.image || '';
              return `
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3" 
                  data-id="${m._id}" 
                  data-name="${escapeHtml(m.nameAr)}" 
                  data-price="${m.price || 25}"
                  data-active="${escapeHtml(m.activeIngredient || '')}"
                  data-dosage="${escapeHtml(m.dosageForm || 'أقراص')}"
                  data-category="${escapeHtml(m.category || 'أدوية عامة')}"
                  data-img="${escapeHtml(formImg)}">
                  <div class="d-flex align-items-center gap-2">
                    ${formImg ? `<img src="${escapeHtml(formImg)}" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" loading="lazy" onerror="this.remove()">` : '<span class="med-thumb-placeholder" style="width: 36px; height: 36px;"><i class="fa-solid fa-box-open"></i></span>'}
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
                productTypeSelect.value = 'medicine';
                nameInput.value = itemBtn.dataset.name;
                medIdInput.value = itemBtn.dataset.id;
                if (priceInput) priceInput.value = itemBtn.dataset.price;
                if (modalEl.querySelector('#modalActiveIngredient') && itemBtn.dataset.active) {
                  modalEl.querySelector('#modalActiveIngredient').value = itemBtn.dataset.active;
                }
                const dosage = itemBtn.dataset.dosage || 'أقراص';
                if (dosageSelect) dosageSelect.value = dosage;
                if (categorySelect && itemBtn.dataset.category) categorySelect.value = itemBtn.dataset.category;

                const formImg = itemBtn.dataset.img || '';
                imageUrlInput.value = /^https?:\/\//i.test(formImg) ? formImg : '';
                fileInput.value = '';
                releasePreviewObjectUrl();
                imgHidden.value = formImg;
                setImagePreview(formImg);

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
        const submitButton = document.getElementById('modalSubmitBtn');
        if (submitButton.disabled) return;
        const submitLabel = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> جاري حفظ المنتج...';
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
        const productType = productTypeSelect.value;
        let image = document.getElementById('modalMedImage')?.value || '';
        const active = document.getElementById('modalActiveIngredient')?.value || '';
        const dosage = document.getElementById('modalDosageForm')?.value || 'أقراص';
        const category = document.getElementById('modalCategory')?.value || 'أدوية عامة';

        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        try {
          if (!window.API || !window.API.inventory) {
            throw new Error('تعذر الاتصال بالخادم. لم يتم حفظ المنتج.');
          }

          const imageUrl = imageUrlInput.value.trim();
          if (imageUrl) {
            const parsedImageUrl = new URL(imageUrl);
            if (!['http:', 'https:'].includes(parsedImageUrl.protocol)) {
              throw new Error('رابط الصورة يجب أن يبدأ بـ http أو https.');
            }
            image = parsedImageUrl.href;
          } else if (fileInput.files[0]) {
            if (typeof window.API.upload !== 'function') {
              throw new Error('رفع الصور غير متاح حاليًا. استخدم رابط الصورة أو حاول لاحقًا.');
            }
            imageUploadStatus?.classList.remove('d-none');
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            const uploadResponse = await window.API.upload('/upload', formData);
            if (!uploadResponse?.data?.url) throw new Error('لم يؤكد الخادم رفع الصورة.');
            image = uploadResponse.data.url;
            imgHidden.value = image;
            imageUploadStatus?.classList.add('d-none');
          }

          if (itemId) {
            const res = await window.API.inventory.update(itemId, {
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image,
                nameAr: name,
                productType,
                category,
                activeIngredient: active,
                dosageForm: dosage,
                isAvailable: document.getElementById('modalMedAvailable').checked,
              });
            if (!res || !res.data) throw new Error('لم يؤكد الخادم حفظ التعديلات.');

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
              target.productType = productType;
            }
            if (window.Toast) window.Toast.success(`تم تحديث بيانات ومخزون (${name}) بنجاح`, 'تحديث المخزون');
          } else {
            const res = await window.API.inventory.add({
                medicineId: medicineId || undefined,
                medicineName: name,
                productType,
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image,
                isAvailable: document.getElementById('modalMedAvailable').checked,
                activeIngredient: active,
                dosageForm: dosage,
                category: category,
              });
            if (!res || !res.data || !res.data._id) throw new Error('لم يؤكد الخادم حفظ المنتج.');

            const saved = res.data;
            const savedMedicine = saved.medicineId && typeof saved.medicineId === 'object' ? saved.medicineId : {};
            const savedMedicineId = savedMedicine._id || saved.medicineId || medicineId || undefined;
            const savedItem = {
              _id: saved._id,
              medicineId: savedMedicineId,
              nameAr: savedMedicine.nameAr || name,
              nameEn: savedMedicine.nameEn || '',
              productType: savedMedicine.productType || productType,
              quantity: Number(saved.quantity),
              customPrice: Number(saved.customPrice || price),
              costPrice: saved.costPrice,
              shelfLocation: saved.shelfLocation || '',
              batchNumber: saved.batchNumber || '',
              expiryDate: saved.expiryDate || expiry,
              image: savedMedicine.image || image,
              dosageForm: savedMedicine.dosageForm || dosage,
              category: savedMedicine.category || category,
              activeIngredient: savedMedicine.activeIngredient || active,
            };
            const existing = currentInventory.find(item => String(item.medicineId) === String(savedMedicineId));
            if (existing) Object.assign(existing, savedItem);
            else currentInventory.unshift(savedItem);
            if (window.Toast) window.Toast.success(`تمت إضافة (${name}) بنجاح للمخزون`, 'إضافة منتج');
          }

          saveLocalInventory();
          applyFilters();
          if (modalInstance) modalInstance.hide();
        } catch (err) {
          console.error('Inventory save failed:', err);
          imageUploadStatus?.classList.add('d-none');
          if (window.Toast) window.Toast.error(err.message || 'تعذر حفظ المنتج. لم يتم إجراء أي تغيير.', 'فشل الحفظ');
        } finally {
          submitButton.disabled = false;
          submitButton.innerHTML = submitLabel;
        }
      });
    }
    return modalEl;
  }

  function openAddModal() {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = 'إضافة منتج جديد للمخزون';
    document.getElementById('modalItemId').value = '';
    document.getElementById('modalMedicineId').value = '';
    document.getElementById('modalMedName').value = '';
    document.getElementById('modalProductType').value = 'medicine';
    document.getElementById('modalActiveIngredient').value = '';
    document.getElementById('modalDosageForm').value = 'أقراص';
    document.getElementById('modalCategory').value = 'أدوية عامة';
    document.getElementById('modalMedQty').value = '10';
    document.getElementById('modalMedPrice').value = '35.00';
    document.getElementById('modalMedCost').value = '';
    document.getElementById('modalMedThreshold').value = '5';
    document.getElementById('modalMedExpiry').value = '2027-06-01';
    document.getElementById('modalMedBatch').value = `BCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('modalMedShelf').value = 'رف A1';
    document.getElementById('modalMedAvailable').checked = true;
    document.getElementById('modalMedImage').value = '';
    document.getElementById('modalMedImageUrl').value = '';
    document.getElementById('modalMedImageFile').value = '';
    document.getElementById('modalMedImagePreview').removeAttribute('src');
    document.getElementById('modalMedImagePreview').classList.add('d-none');
    document.getElementById('imagePreviewPlaceholder').classList.remove('d-none');
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
    document.getElementById('modalProductType').value = item.productType || 'medicine';
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
    
    const imgSrc = item.image || '';
    document.getElementById('modalMedImage').value = imgSrc;
    document.getElementById('modalMedImageUrl').value = /^https?:\/\//i.test(imgSrc) ? imgSrc : '';
    document.getElementById('modalMedImageFile').value = '';
    const preview = document.getElementById('modalMedImagePreview');
    const placeholder = document.getElementById('imagePreviewPlaceholder');
    if (imgSrc) {
      preview.src = imgSrc;
      preview.classList.remove('d-none');
      placeholder.classList.add('d-none');
    } else {
      preview.removeAttribute('src');
      preview.classList.add('d-none');
      placeholder.classList.remove('d-none');
    }

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
                  <strong class="d-block text-dark" style="font-size: 13.5px;"><i class="fa-solid fa-download text-primary me-1"></i> ملفات اختبار جاهزة بروابط الصور:</strong>
                  <small class="text-muted" style="font-size: 12px;">الصور مرتبطة بالمنتج نفسه من صفحة المصدر؛ يلزم الاتصال بالإنترنت لعرضها.</small>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <a href="../../assets/teryak_20_exact_products_test.xlsx" download="teryak_20_exact_products_test.xlsx" class="btn btn-success btn-sm font-bold" title="تحميل ملف اختبار يضم 20 منتجًا وروابط صور المنتجات نفسها">
                    <i class="fa-solid fa-file-excel me-1"></i> تحميل ملف اختبار 20 منتجًا (.xlsx)
                  </a>
                  <a href="../../assets/teryak_20_exact_products_test.csv" download="teryak_20_exact_products_test.csv" class="btn btn-outline-success btn-sm font-bold">
                    <i class="fa-solid fa-file-csv me-1"></i> نسخة CSV
                  </a>
                  <button type="button" class="btn btn-outline-primary btn-sm font-bold" id="downloadCsvTemplateBtn">
                    <i class="fa-solid fa-file-csv me-1"></i> قالب CSV فارغ
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
                        <th>الصورة</th>
                      </tr>
                    </thead>
                    <tbody id="bulkPreviewTableBody"></tbody>
                  </table>
                </div>

                <div class="mt-3 p-3 bg-light rounded border text-muted small">
                  سيتم دمج الصفوف المستوردة مع المخزون الحالي دون حذف أي منتج موجود. يمكن أن يحتوي عمود الصورة على رابط مباشر.
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
        const template = 'اسم المنتج,نوع المنتج,الكمية,سعر البيع,سعر التكلفة,تاريخ الصلاحية,الموقع,القسم,المادة الفعالة,الشكل الدوائي,رابط الصورة\nشامبو,product,10,50,35,2027-12-31,رف A1,عناية شخصية,,,https://example.com/exact-product-image.jpg';
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
      // Column Header Matching Logic
      function detectColumnIndices(headers) {
        const mapping = {
          name: 0, qty: -1, price: -1, cost: -1, expiry: -1, shelf: -1,
          image: -1, productType: -1, category: -1, activeIngredient: -1, dosageForm: -1,
        };

        headers.forEach((h, idx) => {
          const col = String(h || '').toLowerCase().trim();
          if (col.includes('اسم') || col.includes('صنف') || col.includes('دواء') || (col.includes('منتج') && !col.includes('نوع')) || col.includes('name') || col.includes('medicine')) {
            mapping.name = idx;
          } else if (col.includes('كمي') || col.includes('عدد') || col.includes('رصيد') || col.includes('qty') || col.includes('quantity') || col.includes('stock')) {
            mapping.qty = idx;
          } else if (col.includes('تكلف') || col.includes('شراء') || col.includes('cost')) {
            mapping.cost = idx;
          } else if (col.includes('سعر البيع') || col.includes('جمهور') || col.includes('selling') || (col.includes('سعر') && !col.includes('تكلف')) || col === 'price') {
            if (mapping.price === -1) mapping.price = idx;
          } else if (col.includes('صلاحي') || col.includes('انتهاء') || col.includes('تاريخ') || col.includes('expiry') || col.includes('exp')) {
            mapping.expiry = idx;
          } else if (col.includes('رف') || col.includes('موقع') || col.includes('مكان') || col.includes('مخزن') || col.includes('shelf') || col.includes('loc')) {
            mapping.shelf = idx;
          } else if (col.includes('image') || col.includes('img') || col.includes('صورة') || col.includes('صوره') || col.includes('رابط') || col.includes('photo') || col.includes('url') || col.includes('picture')) {
            mapping.image = idx;
          } else if (col.includes('نوع') || col.includes('type')) {
            mapping.productType = idx;
          } else if (col.includes('قسم') || col.includes('تصنيف') || col.includes('فئة') || col.includes('category')) {
            mapping.category = idx;
          } else if (col.includes('مادة') || col.includes('فعالة') || col.includes('ingredient') || col.includes('active')) {
            mapping.activeIngredient = idx;
          } else if (col.includes('شكل') || col.includes('دوائي') || col.includes('عبوة') || col.includes('dosage') || col.includes('form')) {
            mapping.dosageForm = idx;
          }
        });

        // Fallbacks if not detected by header name
        if (mapping.qty === -1) mapping.qty = 1;
        if (mapping.price === -1) mapping.price = 2;
        if (mapping.expiry === -1) mapping.expiry = 3;

        return mapping;
      }

      function parseNumericCell(value, fallback) {
        const normalized = String(value ?? '').replace(/[^\d.-]/g, '').trim();
        if (!normalized) return fallback;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
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

        const mapping = isHeader
          ? detectColumnIndices(firstRow)
          : { name: 0, qty: 1, price: 2, cost: 3, expiry: 4, shelf: 5, image: -1, productType: -1, category: -1, activeIngredient: -1, dosageForm: -1 };
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

          const rawQty = parseNumericCell(row[mapping.qty], 10);
          const rawPrice = parseNumericCell(row[mapping.price], 35.00);
          const rawCost = mapping.cost !== -1 && row[mapping.cost] ? Number(String(row[mapping.cost]).replace(/[^\d.]/g, '')) : undefined;
          const rawExpiry = mapping.expiry !== -1 && row[mapping.expiry] ? parseExcelDate(row[mapping.expiry]) : '2027-12-31';
          const rawShelf = mapping.shelf !== -1 && row[mapping.shelf] ? String(row[mapping.shelf]).trim() : '';
          const rawProductType = mapping.productType !== -1 ? String(row[mapping.productType] || '').trim().toLowerCase() : '';

          items.push({
            medicineName: rawName,
            quantity: rawQty,
            customPrice: rawPrice,
            costPrice: rawCost,
            expiryDate: rawExpiry,
            shelfLocation: rawShelf,
            imageUrl: mapping.image !== -1 ? String(row[mapping.image] || '').trim() : '',
            productType: rawProductType.includes('product') || rawProductType.includes('منتج') ? 'product' : 'medicine',
            category: mapping.category !== -1 ? String(row[mapping.category] || '').trim() : '',
            activeIngredient: mapping.activeIngredient !== -1 ? String(row[mapping.activeIngredient] || '').trim() : '',
            dosageForm: mapping.dosageForm !== -1 ? String(row[mapping.dosageForm] || '').trim() : '',
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

        const mapping = isHeader
          ? detectColumnIndices(headers)
          : { name: 0, qty: 1, price: 2, cost: 3, expiry: 4, shelf: 5, image: -1, productType: -1, category: -1, activeIngredient: -1, dosageForm: -1 };
        const startIndex = isHeader ? 1 : 0;
        const items = [];

        for (let i = startIndex; i < lines.length; i++) {
          const parts = parseLine(lines[i]);
          const name = parts[mapping.name] ? parts[mapping.name].trim() : '';
          if (!name) continue;

          // Reject binary remnants
          if (name.includes('xl/') || name.includes('docProps') || name.includes('[Content_Types]')) continue;

          const qty = parseNumericCell(parts[mapping.qty], 10);
          const price = parseNumericCell(parts[mapping.price], 35.00);
          const cost = mapping.cost !== -1 && parts[mapping.cost] ? Number(String(parts[mapping.cost]).replace(/[^\d.]/g, '')) : undefined;
          const expiry = mapping.expiry !== -1 && parts[mapping.expiry] ? parts[mapping.expiry].trim() : '2027-12-31';
          const shelf = mapping.shelf !== -1 && parts[mapping.shelf] ? parts[mapping.shelf].trim() : '';
          const rawProductType = mapping.productType !== -1 ? String(parts[mapping.productType] || '').trim().toLowerCase() : '';

          items.push({
            medicineName: name,
            quantity: qty,
            customPrice: price,
            costPrice: cost,
            expiryDate: expiry,
            shelfLocation: shelf,
            imageUrl: mapping.image !== -1 ? String(parts[mapping.image] || '').trim() : '',
            productType: rawProductType.includes('product') || rawProductType.includes('منتج') ? 'product' : 'medicine',
            category: mapping.category !== -1 ? String(parts[mapping.category] || '').trim() : '',
            activeIngredient: mapping.activeIngredient !== -1 ? String(parts[mapping.activeIngredient] || '').trim() : '',
            dosageForm: mapping.dosageForm !== -1 ? String(parts[mapping.dosageForm] || '').trim() : '',
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
            <td>
              ${item.imageUrl ? `
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <img src="${escapeHtml(item.imageUrl)}" alt="معاينة" style="width: 26px; height: 26px; object-fit: contain; border-radius: 4px; border: 1px solid #ced4da; background: #fff;" loading="lazy" onerror="this.style.display='none'">
                  <a href="${escapeHtml(item.imageUrl)}" target="_blank" rel="noopener noreferrer" class="badge bg-primary text-decoration-none" title="${escapeHtml(item.imageUrl)}" style="font-size: 11px;">
                    <i class="fa-solid fa-arrow-up-right-from-square me-1"></i>رابط
                  </a>
                </div>
              ` : '<span class="text-muted">—</span>'}
            </td>
          </tr>
        `).join('');

        if (items.length > 8) {
          previewBody.innerHTML += `<tr><td colspan="6" class="text-center text-muted font-bold py-2 bg-light">+ ${items.length - 8} أدوية أخرى في الملف...</td></tr>`;
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

        try {
          if (!window.API || !window.API.inventory) {
            throw new Error('تعذر الاتصال بالخادم. لم يتم استيراد المنتجات.');
          }
          const response = await window.API.inventory.bulkImport(itemsToImport);
          if (!response?.success || !response.data) throw new Error('لم يؤكد الخادم استيراد المنتجات.');
          const refreshed = await loadInventory();
          if (!refreshed) {
            throw new Error('أُرسل الاستيراد، لكن تعذر تحديث المخزون من الخادم. أعد تحميل الصفحة للتحقق.');
          }

          const importErrors = Array.isArray(response.data.errors) ? response.data.errors : [];
          if (importErrors.length) {
            window.Toast?.warning(
              `تم استيراد ${response.data.addedCount + response.data.updatedCount} منتج، وتعذر استيراد ${importErrors.length} صف.`,
              'اكتمل الاستيراد جزئيًا'
            );
            console.warn('Inventory import row errors:', importErrors);
          } else {
            window.Toast?.success(`تم استيراد ${response.data.totalProcessed} منتج إلى المخزون`, 'اكتمل الاستيراد');
          }

          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        } catch (err) {
          console.error('Bulk inventory import failed:', err);
          window.Toast?.error(err.message || 'تعذر استيراد المنتجات. لم يتم تعديل المخزون.', 'فشل الاستيراد');
        } finally {
          execBtn.disabled = false;
          execBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> استيراد وحفظ في المخزون';
        }
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
          ['اسم المنتج', 'نوع المنتج', 'الكمية', 'سعر البيع (ج.م)', 'سعر التكلفة', 'تاريخ الصلاحية', 'الموقع / الرف', 'القسم', 'رابط الصورة', 'الحالة']
        ];
        currentInventory.forEach(item => {
          const qty = Number(item.quantity) || 0;
          const status = qty === 0 ? 'نفد المخزون' : (qty <= 5 ? 'نواقص' : 'متوفر');
          rows.push([
            item.nameAr || 'دواء',
            item.productType || 'medicine',
            qty,
            Number(item.customPrice || 25),
            item.costPrice ? Number(item.costPrice) : '',
            item.expiryDate || '2027-01-01',
            item.shelfLocation || '',
            item.category || '',
            item.image || '',
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
        let csv = 'اسم المنتج,نوع المنتج,الكمية,سعر البيع,تاريخ الصلاحية,الموقع,القسم,رابط الصورة\n';
        currentInventory.forEach(item => {
          csv += `"${escapeHtml(item.nameAr)}","${escapeHtml(item.productType || 'medicine')}",${item.quantity},${item.customPrice || 25},"${item.expiryDate || '2027-01-01'}","${escapeHtml(item.shelfLocation || '')}","${escapeHtml(item.category || '')}","${escapeHtml(item.image || '')}"\n`;
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