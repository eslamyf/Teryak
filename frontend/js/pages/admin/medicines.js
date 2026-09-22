/**
 * Teryak Platform - Admin Medicines Management Logic
 * Connected with Backend API (/api/medicines) & Live Catalog Operations
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // 1. Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar && sidebarOverlay) {
    const toggleMenu = () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    };
    sidebarToggle.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
  }

  // 2. DOM Elements
  const medSearchInput = document.getElementById('medicineSearchInput');
  const medList = document.getElementById('medicinesList');
  const openMedModalBtn = document.getElementById('openAddMedicineModalBtn');
  const closeMedModalBtn = document.getElementById('closeAddMedModalBtn');
  const cancelMedModalBtn = document.getElementById('cancelMedModalBtn');
  const medModal = document.getElementById('addMedicineModal');
  const addMedForm = document.getElementById('addMedicineForm');

  let currentMedicines = [];

  // 3. Fallback Initial Catalog
  const defaultMedicines = [
    {
      _id: 'med_1',
      nameAr: 'باراسيتامول 500 مجم',
      nameEn: 'Paracetamol',
      category: 'مسكنات',
      price: 24.50,
      status: 'active',
      pharmaciesCount: 48,
      image: '../../assets/images/parst.jpg',
    },
    {
      _id: 'med_2',
      nameAr: 'أموكسيسيلين 500 مجم',
      nameEn: 'Amoxicillin',
      category: 'مضادات حيوية',
      price: 45.00,
      status: 'active',
      pharmaciesCount: 32,
      image: '../../assets/images/amoc.jpg',
    },
    {
      _id: 'med_3',
      nameAr: 'فيتامين د 1000 وحدة',
      nameEn: 'Vitamin D3',
      category: 'فيتامينات',
      price: 25.00,
      status: 'active',
      pharmaciesCount: 55,
      image: '../../assets/images/vitamine.jpg',
    },
  ];

  // 4. Load Medicines from API
  async function loadMedicines() {
    let items = [];

    try {
      if (window.API && window.API.medicines) {
        const res = await window.API.medicines.getAll();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(m => ({
            _id: m._id,
            nameAr: m.nameAr,
            nameEn: m.nameEn || m.nameAr,
            category: m.category || 'أدوية عامة',
            price: m.price || 25,
            status: m.status || 'active',
            pharmaciesCount: m.pharmaciesCount || 12,
            image: m.image || '../../assets/images/parst.jpg',
          }));
        }
      }
    } catch (e) {
      console.warn('[Admin Medicines API Fallback]:', e.message);
    }

    if (items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('admin_medicines_catalog'));
        items = local && local.length > 0 ? local : defaultMedicines;
      } catch (e) {
        items = defaultMedicines;
      }
    }

    currentMedicines = items;
    saveLocalMedicines();
    renderMedicines(currentMedicines);
  }

  function saveLocalMedicines() {
    try {
      localStorage.setItem('admin_medicines_catalog', JSON.stringify(currentMedicines));
    } catch (e) {}
  }

  // 5. Render Medicines List
  function renderMedicines(items) {
    if (!medList) return;

    if (items.length === 0) {
      medList.innerHTML = `
        <div class="text-center py-5 text-muted bg-white border rounded">
          <i class="fa-solid fa-pills fs-2 mb-2 text-muted"></i>
          <p class="font-bold mb-0">لا توجد أدوية مطابقة للبحث</p>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(med => {
      const statusText = med.status === 'active' || med.status === 'نشط' ? 'نشط' : 'قيد المراجعة';
      const statusClass = med.status === 'active' || med.status === 'نشط' ? 'status-active' : 'status-pending';
      const img = med.image || '../../assets/images/parst.jpg';

      html += `
        <div class="medicine-card" data-id="${med._id}">
          <div class="medicine-right">
            <div class="medicine-img-box colorful">
              <img src="${img}" alt="${med.nameAr}" class="medicine-image" onerror="this.src='../../assets/images/parst.jpg'">
            </div>
            <div class="medicine-details">
              <h3 class="medicine-name">${med.nameAr}</h3>
              <div class="medicine-subtext">
                <span class="eng-name">${med.nameEn}</span>
                <span class="dot">•</span>
                <span class="category-name">${med.category}</span>
                <span class="dot">•</span>
                <span class="pharmacy-count">${med.pharmaciesCount || 10} صيدلية</span>
                <span class="dot">•</span>
                <span class="fw-bold text-success">${Number(med.price || 25).toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
          
          <div class="medicine-left">
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف" data-id="${med._id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <button class="action-btn view-btn" title="معاينة" data-id="${med._id}" data-name="${med.nameAr}">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    medList.innerHTML = html;
  }

  // 6. Search Filter
  if (medSearchInput) {
    medSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMedicines(currentMedicines);
        return;
      }
      const filtered = currentMedicines.filter(m => {
        return (
          m.nameAr.toLowerCase().includes(query) ||
          m.nameEn.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
        );
      });
      renderMedicines(filtered);
    });
  }

  // 7. Modal Handlers (Add Medicine)
  if (openMedModalBtn && medModal) {
    const openMedModal = () => medModal.classList.add('active');
    const closeMedModal = () => medModal.classList.remove('active');

    openMedModalBtn.addEventListener('click', openMedModal);
    if (closeMedModalBtn) closeMedModalBtn.addEventListener('click', closeMedModal);
    if (cancelMedModalBtn) cancelMedModalBtn.addEventListener('click', closeMedModal);

    if (addMedForm) {
      addMedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mName = document.getElementById('newMedName')?.value.trim();
        const engName = document.getElementById('newMedEngName')?.value.trim() || mName;
        const category = document.getElementById('newMedCategory')?.value || 'عام';
        const pCount = Number(document.getElementById('newMedPharmacyCount')?.value) || 1;
        const status = document.getElementById('newMedStatus')?.value || 'active';

        if (!mName) {
          if (window.Toast) window.Toast.warning('يرجى كتابة اسم الدواء بالعربية', 'حقل مطلوب');
          return;
        }

        let newId = `med_${Date.now()}`;

        // Send to Backend API
        try {
          if (window.API && window.API.medicines) {
            const res = await window.API.medicines.create({
              nameAr: mName,
              nameEn: engName,
              category,
              price: 35.0,
              status: status === 'قيد المراجعة' ? 'pending' : 'active',
            });
            if (res && res.data && res.data._id) {
              newId = res.data._id;
            }
          }
        } catch (err) {
          console.warn('API create medicine fallback:', err.message);
        }

        const newMed = {
          _id: newId,
          nameAr: mName,
          nameEn: engName,
          category,
          price: 35.0,
          status: status === 'قيد المراجعة' ? 'pending' : 'active',
          pharmaciesCount: pCount,
          image: '../../assets/images/parst.jpg',
        };

        currentMedicines.unshift(newMed);
        saveLocalMedicines();
        renderMedicines(currentMedicines);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة (${mName}) إلى قاعدة بيانات الأدوية بنجاح.`, 'إضافة دواء');
        }

        addMedForm.reset();
        closeMedModal();
      });
    }
  }

  // 8. Action Delegation (Delete & View)
  if (medList) {
    medList.addEventListener('click', async (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;

      const card = targetBtn.closest('.medicine-card');
      const medId = targetBtn.dataset.id || card?.dataset.id;
      const medItem = currentMedicines.find(m => m._id === medId);
      const medName = medItem ? medItem.nameAr : (card?.querySelector('.medicine-name')?.innerText || 'الدواء');

      if (targetBtn.classList.contains('delete-btn')) {
        let confirmed = true;
        if (window.Toast && window.Toast.confirm) {
          confirmed = await window.Toast.confirm({
            title: 'حذف الدواء',
            message: `هل أنت متأكد من رغبتك في حذف (${medName}) من قاعدة البيانات؟`,
            type: 'danger',
            confirmText: 'حذف نهائي',
            cancelText: 'إلغاء'
          });
        }

        if (confirmed) {
          try {
            if (window.API && window.API.medicines && medId && medId.length === 24) {
              await window.API.medicines.delete(medId);
            }
          } catch (err) {
            console.warn('API delete medicine fallback:', err.message);
          }

          currentMedicines = currentMedicines.filter(m => m._id !== medId);
          saveLocalMedicines();
          renderMedicines(currentMedicines);

          if (window.Toast) {
            window.Toast.success(`تم حذف (${medName}) بنجاح من المنصة.`, 'تم الحذف');
          }
        }
      } else if (targetBtn.classList.contains('view-btn')) {
        window.location.href = '../public/medicine-detail.html?med=' + encodeURIComponent(medName);
      }
    });
  }

  await loadMedicines();
});