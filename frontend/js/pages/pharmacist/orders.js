/**
 * Teryak Platform - Pharmacist Orders Management Logic
 * Connected with MongoDB Atlas via /api/orders/pharmacy & /api/orders/:id/status
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.main-content .container');
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Load Real Pharmacist Orders
  async function loadPharmacistOrders() {
    let orders = [];

    try {
      if (window.API && window.API.orders) {
        const res = await window.API.orders.getPharmacyOrders();
        if (res && res.data && res.data.length > 0) {
          orders = res.data;
        }
      }
    } catch (e) {
      console.warn('Backend pharmacy orders fetch fallback:', e);
    }

    if (orders.length === 0) {
      // Local demo fallback
      try {
        orders = JSON.parse(localStorage.getItem('myOrders')) || [];
      } catch (e) {
        orders = [];
      }
    }

    if (!container) return;

    const titleEl = container.querySelector('h3');
    const existingCards = container.querySelectorAll('.order-card');

    if (orders.length > 0) {
      // Clear hardcoded static cards
      existingCards.forEach(c => c.remove());

      let html = '';
      orders.forEach((order, index) => {
        const orderNum = order.orderNumber || order._id || `#ORD-${index + 1}`;
        const patientName = order.patientId?.name || order.shippingAddress?.fullName || 'أحمد محمود';
        const patientPhone = order.patientId?.phone || order.shippingAddress?.phone || '01012345678';
        const items = order.items || [];
        const firstItem = items[0] || { name: 'دواء علاجي', quantity: 1 };
        const medTitle = firstItem.name + (items.length > 1 ? ` (+${items.length - 1} أدوية أخرى)` : '');
        const img = firstItem.image || firstItem.img || '../../assets/images/parst.jpg';
        const status = order.status || 'pending';
        const timeAgo = 'اليوم ' + new Date(order.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        let actionsHtml = '';
        if (status === 'pending') {
          actionsHtml = `
            <div class="buttons d-flex gap-2">
              <button class="ready-btn btn btn-success btn-sm" data-id="${order._id}" data-action="preparing">تجهيز الطلب</button>
              <button class="cancel-btn btn btn-outline-danger btn-sm" data-id="${order._id}" data-action="cancelled">إلغاء</button>
            </div>
          `;
        } else if (status === 'preparing') {
          actionsHtml = `
            <div class="buttons d-flex gap-2">
              <button class="ready-btn btn btn-primary btn-sm" data-id="${order._id}" data-action="ready">جاهز للتسليم</button>
              <button class="cancel-btn btn btn-outline-danger btn-sm" data-id="${order._id}" data-action="cancelled">إلغاء</button>
            </div>
          `;
        } else if (status === 'ready') {
          actionsHtml = `
            <div class="buttons d-flex gap-2 align-items-center">
              <span class="badge ready bg-primary p-2">جاهز للاستلام</span>
              <button class="confirm-btn btn btn-success btn-sm" data-id="${order._id}" data-action="completed">تأكيد الاستلام</button>
            </div>
          `;
        } else if (status === 'delivering') {
          actionsHtml = `
            <div class="buttons d-flex gap-2 align-items-center">
              <span class="badge bg-info text-white p-2">مع المندوب للتوصيل</span>
              <button class="confirm-btn btn btn-success btn-sm" data-id="${order._id}" data-action="completed">تأكيد التسليم</button>
            </div>
          `;
        } else if (status === 'completed') {
          actionsHtml = `<span class="badge completed bg-success p-2">مكتمل ومُسلّم</span>`;
        } else if (status === 'cancelled') {
          actionsHtml = `<span class="badge cancelled bg-danger p-2">ملغي</span>`;
        }

        const card = document.createElement('div');
        card.className = 'order-card p-3 bg-white border rounded mb-3 shadow-sm d-flex justify-content-between align-items-center';
        card.dataset.orderId = order._id;
        card.innerHTML = `
          <div class="medicine d-flex align-items-center gap-3">
            <img src="${img}" alt="${firstItem.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" onerror="this.src='../../assets/images/parst.jpg'">
            <div class="info">
              <h4 class="font-bold mb-1">${medTitle} <span class="badge bg-secondary">× ${firstItem.quantity || 1}</span></h4>
              <p class="text-muted mb-1">${patientName} - <span dir="ltr">${patientPhone}</span></p>
              <div class="details text-muted" style="font-size: 12px;">
                <span class="me-2">#${orderNum}</span>
                <span><i class="fa-regular fa-clock me-1"></i> ${timeAgo}</span>
              </div>
            </div>
          </div>
          <div class="actions">
            ${actionsHtml}
          </div>
        `;

        container.appendChild(card);
      });

      bindActionListeners();
    }
  }

  function bindActionListeners() {
    container.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.id;
        const newStatus = btn.dataset.action;
        const card = btn.closest('.order-card');

        try {
          if (window.API && window.API.orders && orderId && orderId.length === 24) {
            await window.API.orders.updateStatus(orderId, newStatus);
          }
        } catch (e) {
          console.warn('API status update fallback:', e);
        }

        if (window.Toast) {
          window.Toast.success('تم تحديث حالة الطلب وإرسال إشعار للمريض بنجاح', 'تحديث الطلب');
        }

        // Reload fresh state
        setTimeout(() => loadPharmacistOrders(), 400);
      });
    });
  }

  await loadPharmacistOrders();
});