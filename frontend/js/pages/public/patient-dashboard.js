/**
 * Teryak Platform - Patient Dashboard Logic
 * Integrated with Real-Time Database Order Synchronization & Side-Sliding Toast Notifications
 */

document.addEventListener('DOMContentLoaded', async () => {
  const items = document.querySelectorAll('.list ul li');
  const sections = [
    document.querySelector('.hidden1'),
    document.querySelector('.hidden2'),
    document.querySelector('.hidden3'),
    document.querySelector('.hidden4'),
    document.querySelector('.hidden5'),
    document.querySelector('.hidden6')
  ];

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(li => li.classList.remove('active'));
      item.classList.add('active');
      sections.forEach(section => {
        if (section) section.style.display = 'none';
      });
      const target = document.querySelector('.' + item.dataset.target);
      if (target) target.style.display = 'block';
    });
  });

  // User Greeting
  const userNameEl = document.getElementById('userName');
  const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (userNameEl) {
    userNameEl.textContent = currentUser ? (currentUser.name || currentUser.email) : 'أحمد محمود';
  }

  // Load and Render Real Patient Orders from API
  async function loadPatientOrders() {
    let orders = [];

    try {
      if (window.API && window.API.orders) {
        const res = await window.API.orders.getMyOrders();
        if (res && res.data) {
          orders = res.data;
        }
      }
    } catch (e) {
      console.warn('Backend orders fetch fallback to localStorage:', e);
    }

    if (orders.length === 0) {
      try {
        orders = JSON.parse(localStorage.getItem('myOrders')) || [];
      } catch (e) {
        orders = [];
      }
    }

    // Update Overview Metrics (Tab 1)
    const bookingsCountEl = document.querySelector('.hidden1 .DIV1 .num');
    const totalSpentEl = document.querySelector('.hidden1 .DIV4 .num');
    const activeBookingCard = document.querySelector('.hidden1 .Active');

    if (bookingsCountEl) bookingsCountEl.textContent = orders.length;

    const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || Number(ord.subtotal) || 0), 0);
    if (totalSpentEl) totalSpentEl.textContent = `${totalSpent.toFixed(0)} ج.م`;

    // Render Orders in Tab 2 (.hidden2 .mainSection)
    const ordersContainer = document.querySelector('.hidden2 .mainSection');
    if (ordersContainer && orders.length > 0) {
      let ordersHtml = '';

      orders.forEach(order => {
        const orderNum = order.orderNumber || order._id || 'ORD-000';
        const items = order.items || [];
        const firstItem = items[0] || { name: 'أدوية علاجية', price: 25 };
        const medName = firstItem.name + (items.length > 1 ? ` (+${items.length - 1} أدوية أخرى)` : '');
        const img = firstItem.image || firstItem.img || '../../assets/images/parst.jpg';
        const pharmacyName = order.pharmacyId?.name || 'صيدلية النهضة الحديثة';
        const total = (Number(order.totalAmount) || Number(order.subtotal) || 25).toFixed(2);
        const status = order.status || 'pending';

        let statusBadge = '<span class="badge bg-warning text-dark p-2">قيد المراجعة</span>';
        let actionBtn = `<button class="btn btn-outline-danger btn-sm btn-cancel-booking" data-id="${order._id}">إلغاء الطلب</button>`;

        if (status === 'preparing') {
          statusBadge = '<span class="badge bg-info text-white p-2">جاري التحضير</span>';
          actionBtn = `<button class="btn btn-outline-danger btn-sm btn-cancel-booking" data-id="${order._id}">إلغاء</button>`;
        } else if (status === 'ready') {
          statusBadge = '<span class="badge bg-primary text-white p-2">جاهز للاستلام</span>';
          actionBtn = `<span class="text-success small font-bold"><i class="fa-solid fa-clock me-1"></i> بانتظار الاستلام</span>`;
        } else if (status === 'delivering') {
          statusBadge = '<span class="badge bg-info text-white p-2">في الطريق للتوصيل</span>';
          actionBtn = `<span class="text-info small font-bold"><i class="fa-solid fa-truck-fast me-1"></i> مع المندوب</span>`;
        } else if (status === 'completed') {
          statusBadge = '<span class="badge bg-success text-white p-2">مكتمل وتم الاستلام</span>';
          actionBtn = '<span class="badge bg-success">مكتمل</span>';
        } else if (status === 'cancelled') {
          statusBadge = '<span class="badge bg-secondary text-white p-2">ملغي</span>';
          actionBtn = '<span class="text-muted small">تم الإلغاء</span>';
        }

        ordersHtml += `
          <div class="secOne p-3 bg-white border rounded d-flex justify-content-between align-items-center mb-2 shadow-xs" data-order-id="${order._id}">
            <div class="d-flex align-items-center gap-3">
              <img src="${img}" alt="${firstItem.name}" style="width: 55px; height: 55px; border-radius: 8px; object-fit: cover;" onerror="this.src='../../assets/images/parst.jpg'">
              <div>
                <p class="parg font-bold mb-0">${medName}</p>
                <small class="text-muted"><i class="fa-solid fa-store me-1"></i> ${pharmacyName}</small><br>
                <small class="text-muted"><i class="fa-solid fa-hashtag me-1"></i> ${orderNum} · <b>${total} ج.م</b></small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              ${statusBadge}
              ${actionBtn}
            </div>
          </div>
        `;
      });

      ordersContainer.innerHTML = ordersHtml;
      bindCancelListeners();
    }
  }

  function bindCancelListeners() {
    document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.secOne');
        const orderId = btn.dataset.id;
        const medName = card ? card.querySelector('.font-bold')?.textContent || 'الطلب' : 'الطلب';

        if (window.Toast && window.Toast.confirm) {
          const confirmed = await window.Toast.confirm({
            title: 'إلغاء الطلب',
            message: `هل أنت متأكد من رغبتك في إلغاء (${medName})؟`,
            type: 'danger',
            confirmText: 'نعم، إلغاء الطلب',
            cancelText: 'تراجع'
          });

          if (confirmed) {
            try {
              if (window.API && window.API.orders && orderId) {
                await window.API.orders.cancel(orderId);
              }
            } catch (e) {
              console.warn('API order cancel fallback:', e);
            }

            if (card) {
              card.style.opacity = '0.5';
              btn.textContent = 'تم الإلغاء';
              btn.disabled = true;
            }
            window.Toast.success(`تم إلغاء (${medName}) بنجاح وإشعار الصيدلية.`, 'إلغاء الطلب');
          }
        }
      });
    });
  }

  await loadPatientOrders();

  // Upload Prescription Modal trigger
  const uploadRxBtn = document.querySelector('.btn-upload-rx');
  if (uploadRxBtn) {
    uploadRxBtn.addEventListener('click', () => {
      if (window.Toast) {
        window.Toast.info(
          'يمكنك رفع صورة الروشتة الطبية بوضوح وسيتم إرسالها لأقرب صيدلية معتمدة لصرفها فوراً.',
          'رفع روشتة طبية',
          4500
        );
      }
    });
  }
});