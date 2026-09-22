/**
 * Teryak Platform - Pharmacist Inventory Management Engine
 * Connected with Backend API (/api/inventory) & Real-time State Synchronization
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
  const inventoryList = document.getElementById('inventoryList');
  const searchInput = document.getElementById('inventorySearchInput');
  const addMedBtn = document.getElementById('addMedBtn');
  const addNewCardBtn = document.querySelector('.add-new-card');

  let currentInventory = [];

  // 3. Fallback Mock Data (when offline)
  const defaultInventory = [
    {
      _id: 'inv_1',
      nameAr: 'باراسيتامول 500 مجم',
      quantity: 45,
      customPrice: 24.50,
      expiryDate: '2027-03-01',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_2',
      nameAr: 'أموكسيسيلين 500 مجم',
      quantity: 3,
      customPrice: 78.00,
      expiryDate: '2026-11-01',
      image: '../../assets/images/2.jpg'
    },
    {
      _id: 'inv_3',
      nameAr: 'فيتامين د 1000',
      quantity: 0,
      customPrice: 85.00,
      expiryDate: '2027-06-01',
      image: '../../assets/images/4.jpg'
    },
    {
      _id: 'inv_4',
      nameAr: 'أوميجا 3 بلس',
      quantity: 20,
      customPrice: 120.00,
      expiryDate: '2026-09-01',
      image: '../../assets/images/3.jpg'
    },
    {
      _id: 'inv_5',
      nameAr: 'كونجستال أقراص',
      quantity: 8,
      customPrice: 35.00,
      expiryDate: '2026-12-01',
      image: '../../assets/images/5.jpg'
    }
  ];

  // 4. Load Inventory from Server / Cache
  async function loadInventory() {
    let items = [];

    try {
      if (window.API && window.API.inventory) {
        const res = await window.API.inventory.getAll();
        if (res && res.data && Array.isArray(res.data)) {
          items = res.data.map(item => ({
            _id: item._id,
            medicineId: item.medicineId?._id || item.medicineId,
            nameAr: item.medicineId?.nameAr || item.medicineName || 'دواء',
            nameEn: item.medicineId?.nameEn || '',
            quantity: Number(item.quantity) || 0,
            customPrice: Number(item.customPrice || item.medicineId?.price || 25),
            expiryDate: item.expiryDate ? String(item.expiryDate).split('T')[0] : '2027-01-01',
            image: item.medicineId?.image || '../../assets/images/1.jpg'
          }));
        }
      }
    } catch (e) {
      console.warn('[Inventory API Fallback]:', e.message);
    }

    if (!items || items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('pharmacist_inventory'));
        items = local && local.length > 0 ? local : defaultInventory;
      } catch (e) {
        items = defaultInventory;
      }
    }

    currentInventory = items;
    saveLocalInventory();
    renderInventory(currentInventory);
  }

  function saveLocalInventory() {
    try {
      localStorage.setItem('pharmacist_inventory', JSON.stringify(currentInventory));
    } catch (e) {}
  }

  // 5. Render Inventory Grid
  function renderInventory(items) {
    if (!inventoryList) return;

    if (items.length === 0) {
      inventoryList.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <i class="fa-solid fa-box-open fs-1 mb-2"></i>
          <p class="font-bold mb-1">لا توجد أدوية مطابقة في المخزون</p>
          <small>يمكنك إضافة أدوية جديدة للمخزون بالضغط على الزر أعلاه</small>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      let badgeClass = 'available';
      let badgeText = 'متوفر';

      if (qty === 0) {
        badgeClass = 'unavailable';
        badgeText = 'غير متوفر';
      } else if (qty <= 5) {
        badgeClass = 'limited';
        badgeText = 'محدود';
      }

      const price = (Number(item.customPrice) || 25).toFixed(2);
      const expiry = item.expiryDate || '06-2027';
      const img = item.image || '../../assets/images/1.jpg';

      html += `
        <div class="medicine-card" data-id="${item._id}">
          <div class="actions">
            <i class="fa-regular fa-pen-to-square edit btn-edit-item" title="تعديل المخزون" data-id="${item._id}"></i>
            <i class="fa-regular fa-trash-can delete btn-delete-item" title="حذف من المخزون" data-id="${item._id}"></i>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <img src="${img}" alt="${item.nameAr}" class="medicine-image" onerror="this.src='../../assets/images/1.jpg'">
          <div class="details">
            <h3>${item.nameAr}</h3>
            <p>المخزون: <b>${qty} علبة</b> | السعر: <b>${price} ج.م</b> | الصلاحية: ${expiry}</p>
          </div>
        </div>
      `;
    });

    inventoryList.innerHTML = html;
    bindItemActions();
  }

  // 6. Action Listeners (Edit & Delete)
  function bindItemActions() {
    // Delete action
    inventoryList.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        const item = currentInventory.find(i => i._id === itemId);
        const name = item ? item.nameAr : 'الدواء';

        let confirmed = true;
        if (window.Toast && window.Toast.confirm) {
          confirmed = await window.Toast.confirm({
            title: 'حذف من المخزون',
            message: `هل أنت متأكد من رغبتك في إزالة (${name}) من مخزون صيدليتك؟`,
            type: 'danger',
            confirmText: 'حذف',
            cancelText: 'إلغاء'
          });
        }

        if (confirmed) {
          try {
            if (window.API && window.API.inventory && itemId && itemId.length === 24) {
              await window.API.inventory.delete(itemId);
            }
          } catch (err) {
            console.warn('API delete fallback:', err.message);
          }

          currentInventory = currentInventory.filter(i => i._id !== itemId);
          saveLocalInventory();
          renderInventory(currentInventory);

          if (window.Toast) {
            window.Toast.success(`تم حذف (${name}) من المخزون بنجاح.`, 'تم الحذف');
          }
        }
      });
    });

    // Edit action
    inventoryList.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        const item = currentInventory.find(i => i._id === itemId);
        if (item) {
          openEditModal(item);
        }
      });
    });
  }

  // 7. Search Filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderInventory(currentInventory);
        return;
      }
      const filtered = currentInventory.filter(item => {
        return (
          (item.nameAr && item.nameAr.toLowerCase().includes(query)) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(query))
        );
      });
      renderInventory(filtered);
    });
  }

  // 8. Add & Edit Modal System
  function ensureInventoryModal() {
    let modalEl = document.getElementById('inventoryActionModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'inventoryActionModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" style="border-radius: 14px; overflow: hidden; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
            <div class="modal-header bg-success text-white py-3 px-4">
              <h5 class="modal-title font-bold" id="invModalTitle">إضافة دواء للمخزون</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="invModalForm">
                <input type="hidden" id="modalItemId" value="">
                <div class="mb-3">
                  <label class="form-label font-bold text-dark">اسم الدواء</label>
                  <input type="text" id="modalMedName" class="form-control" placeholder="مثال: بانادول إكسترا أقراص" required>
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label font-bold text-dark">الكمية المتوفرة</label>
                    <input type="number" id="modalMedQty" class="form-control" min="0" value="10" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label font-bold text-dark">سعر البيع (ج.م)</label>
                    <input type="number" id="modalMedPrice" class="form-control" min="1" step="0.5" value="35.00" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label font-bold text-dark">تاريخ الصلاحية</label>
                  <input type="date" id="modalMedExpiry" class="form-control" value="2027-06-01">
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" data-bs-dismiss="modal">إلغاء</button>
                  <button type="submit" class="btn btn-success px-4 font-bold" id="modalSubmitBtn">حفظ الدواء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      const form = modalEl.querySelector('#invModalForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemId = document.getElementById('modalItemId').value;
        const name = document.getElementById('modalMedName').value.trim();
        const qty = Number(document.getElementById('modalMedQty').value) || 0;
        const price = Number(document.getElementById('modalMedPrice').value) || 25;
        const expiry = document.getElementById('modalMedExpiry').value || '2027-06-01';

        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        if (itemId) {
          // Update existing
          try {
            if (window.API && window.API.inventory && itemId.length === 24) {
              await window.API.inventory.update(itemId, {
                quantity: qty,
                customPrice: price,
                expiryDate: expiry
              });
            }
          } catch (err) {
            console.warn('API update fallback:', err.message);
          }

          const target = currentInventory.find(i => i._id === itemId);
          if (target) {
            target.nameAr = name;
            target.quantity = qty;
            target.customPrice = price;
            target.expiryDate = expiry;
          }
          if (window.Toast) window.Toast.success(`تم تحديث بيانات (${name}) بنجاح`, 'تحديث المخزون');
        } else {
          // Add new
          let createdId = `inv_${Date.now()}`;
          try {
            if (window.API && window.API.inventory) {
              const res = await window.API.inventory.add({
                medicineName: name,
                quantity: qty,
                customPrice: price,
                expiryDate: expiry
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
            nameAr: name,
            quantity: qty,
            customPrice: price,
            expiryDate: expiry,
            image: '../../assets/images/1.jpg'
          });
          if (window.Toast) window.Toast.success(`تمت إضافة (${name}) إلى مخزون الصيدلية`, 'إضافة دواء');
        }

        saveLocalInventory();
        renderInventory(currentInventory);
        if (modalInstance) modalInstance.hide();
      });
    }
    return modalEl;
  }

  function openAddModal() {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = 'إضافة دواء جديد للمخزون';
    document.getElementById('modalItemId').value = '';
    document.getElementById('modalMedName').value = '';
    document.getElementById('modalMedName').disabled = false;
    document.getElementById('modalMedQty').value = '10';
    document.getElementById('modalMedPrice').value = '35.00';
    document.getElementById('modalMedExpiry').value = '2027-06-01';

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  function openEditModal(item) {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = `تعديل مخزون: ${item.nameAr}`;
    document.getElementById('modalItemId').value = item._id;
    document.getElementById('modalMedName').value = item.nameAr;
    document.getElementById('modalMedName').disabled = true;
    document.getElementById('modalMedQty').value = item.quantity;
    document.getElementById('modalMedPrice').value = item.customPrice;
    document.getElementById('modalMedExpiry').value = item.expiryDate || '2027-06-01';

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  if (addMedBtn) addMedBtn.addEventListener('click', openAddModal);
  if (addNewCardBtn) addNewCardBtn.addEventListener('click', openAddModal);

  // Initial Load
  await loadInventory();
});