/**
 * Teryak Platform - Admin Pharmacies Management Logic
 * Connected with Backend API (/api/pharmacies & /api/admin/pharmacies)
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
      sidebarToggle.classList.toggle('menu-open', sidebar.classList.contains('active'));
    };
    sidebarToggle.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
  }

  // 2. DOM Elements
  const searchInput = document.getElementById('pharmacySearchInput');
  const tableBody = document.getElementById('pharmaciesTableBody');
  const openModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeAddModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const modal = document.getElementById('addPharmacyModal');
  const addForm = document.getElementById('addPharmacyForm');

  let currentPharmacies = [];

  // 3. Fallback Initial Pharmacies
  const defaultPharmacies = [
    {
      _id: 'pharm_1',
      name: 'صيدلية النهضة الحديثة',
      doctor: 'د. محمد علي',
      location: 'شارع الجامعة، المعادي',
      medCount: 320,
      date: '2026-09-15',
      status: 'active',
      isApproved: true,
    },
    {
      _id: 'pharm_2',
      name: 'صيدلية الشفاء التخصصية',
      doctor: 'د. سارة أحمد',
      location: 'ميدان الحرية، مدينة نصر',
      medCount: 280,
      date: '2026-09-18',
      status: 'active',
      isApproved: true,
    },
    {
      _id: 'pharm_3',
      name: 'صيدلية الحياة',
      doctor: 'د. خالد محمود',
      location: 'شارع 9، المعادي',
      medCount: 210,
      date: '2026-09-20',
      status: 'pending',
      isApproved: false,
    },
  ];

  // 4. Load Pharmacies from API
  async function loadPharmacies() {
    let items = [];

    try {
      if (window.API && window.API.pharmacies) {
        const res = await window.API.pharmacies.getAll();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(p => {
            const addr = p.address;
            const loc = typeof addr === 'string' ? addr : `${addr?.governorate || ''} - ${addr?.city || ''} ${addr?.street || ''}`;
            return {
              _id: p._id,
              name: p.name,
              doctor: p.ownerId?.name ? `د. ${p.ownerId.name}` : 'د. صيدلي معتمد',
              location: loc || 'القاهرة',
              medCount: p.meds || 250,
              date: p.createdAt ? p.createdAt.split('T')[0] : '2026-09-20',
              status: p.isApproved ? 'active' : 'pending',
              isApproved: p.isApproved,
            };
          });
        }
      }
    } catch (e) {
      console.warn('[Admin Pharmacies API Fallback]:', e.message);
    }

    if (items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('admin_pharmacies_list'));
        items = local && local.length > 0 ? local : defaultPharmacies;
      } catch (e) {
        items = defaultPharmacies;
      }
    }

    currentPharmacies = items;
    saveLocalPharmacies();
    renderPharmacies(currentPharmacies);
  }

  function saveLocalPharmacies() {
    try {
      localStorage.setItem('admin_pharmacies_list', JSON.stringify(currentPharmacies));
    } catch (e) {}
  }

  // 5. Render Table Rows
  function renderPharmacies(items) {
    if (!tableBody) return;

    if (items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">لا توجد صيدليات مطابقة للبحث</td>
        </tr>
      `;
      return;
    }

    let html = '';
    items.forEach(pharm => {
      let statusClass = 'status-active';
      let statusText = 'نشط';

      if (pharm.status === 'pending' || pharm.status === 'قيد المراجعة' || !pharm.isApproved) {
        statusClass = 'status-pending';
        statusText = 'قيد المراجعة';
      } else if (pharm.status === 'suspended' || pharm.status === 'موقوف') {
        statusClass = 'status-suspended';
        statusText = 'موقوف';
      }

      html += `
        <tr data-id="${pharm._id}">
          <td>
            <div class="pharmacy-info">
              <span class="pharmacy-name font-bold">${pharm.name}</span>
              <span class="doctor-name text-muted small">${pharm.doctor}</span>
            </div>
          </td>
          <td>${pharm.location}</td>
          <td class="bold-text">${pharm.medCount || 0}</td>
          <td class="date-text">${pharm.date || '2026-09-20'}</td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
          <td>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف" data-id="${pharm._id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <button class="action-btn block-btn" title="تغيير الحالة / إيقاف" data-id="${pharm._id}">
                <i class="fa-solid fa-ban"></i>
              </button>
              <button class="action-btn view-btn" title="معاينة في الدليل" data-name="${pharm.name}">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  // 6. Search Filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderPharmacies(currentPharmacies);
        return;
      }
      const filtered = currentPharmacies.filter(p => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.doctor.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      });
      renderPharmacies(filtered);
    });
  }

  // 7. Modal Handlers (Add Pharmacy)
  if (openModalBtn && modal) {
    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pName = document.getElementById('newPharmacyName')?.value.trim();
        const dName = document.getElementById('newDoctorName')?.value.trim();
        const location = document.getElementById('newLocation')?.value.trim();
        const count = Number(document.getElementById('newMedicineCount')?.value) || 0;
        const status = document.getElementById('newStatus')?.value || 'نشط';
        const today = new Date().toISOString().split('T')[0];

        if (!pName) {
          if (window.Toast) window.Toast.warning('اسم الصيدلية مطلوب', 'حقل مطلوب');
          return;
        }

        const newPharm = {
          _id: `pharm_${Date.now()}`,
          name: pName,
          doctor: dName || 'د. صيدلي معتمد',
          location: location || 'القاهرة',
          medCount: count,
          date: today,
          status: status === 'قيد المراجعة' ? 'pending' : (status === 'موقوف' ? 'suspended' : 'active'),
          isApproved: status === 'نشط',
        };

        currentPharmacies.unshift(newPharm);
        saveLocalPharmacies();
        renderPharmacies(currentPharmacies);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة صيدلية (${pName}) بنجاح.`, 'إضافة صيدلية');
        }

        addForm.reset();
        closeModal();
      });
    }
  }

  // 8. Event Delegation for Action Buttons
  if (tableBody) {
    tableBody.addEventListener('click', async (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;

      const row = targetBtn.closest('tr');
      const pharmId = row?.dataset.id;
      const targetItem = currentPharmacies.find(p => p._id === pharmId);
      const pharmacyName = targetItem ? targetItem.name : (row?.querySelector('.pharmacy-name')?.innerText || 'الصيدلية');

      if (targetBtn.classList.contains('delete-btn')) {
        let ok = true;
        if (window.Toast && window.Toast.confirm) {
          ok = await window.Toast.confirm({
            title: 'حذف الصيدلية',
            message: `هل أنت متأكد من رغبتك في حذف بيانات ${pharmacyName}؟`,
            type: 'danger',
            confirmText: 'حذف نهائي',
            cancelText: 'إلغاء'
          });
        }
        if (ok) {
          currentPharmacies = currentPharmacies.filter(p => p._id !== pharmId);
          saveLocalPharmacies();
          renderPharmacies(currentPharmacies);
          if (window.Toast) window.Toast.success(`تم حذف ${pharmacyName} بنجاح.`, 'تم الحذف');
        }
      } else if (targetBtn.classList.contains('block-btn')) {
        if (targetItem) {
          const newStatus = targetItem.status === 'suspended' ? 'active' : 'suspended';
          targetItem.status = newStatus;

          // Call API if server is connected
          if (window.API && window.API.admin && pharmId && pharmId.length === 24) {
            try {
              await window.API.admin.approvePharmacy(pharmId, newStatus === 'active');
            } catch (err) {}
          }

          saveLocalPharmacies();
          renderPharmacies(currentPharmacies);
          if (window.Toast) {
            window.Toast.info(`تم تغيير حالة (${pharmacyName}) إلى: ${newStatus === 'active' ? 'نشط' : 'موقوف'}`);
          }
        }
      } else if (targetBtn.classList.contains('view-btn')) {
        window.location.href = '../public/pharmacies.html?search=' + encodeURIComponent(pharmacyName);
      }
    });
  }

  await loadPharmacies();
});
