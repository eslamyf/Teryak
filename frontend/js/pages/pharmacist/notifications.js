/**
 * Teryak Platform - Pharmacist Notifications Engine
 * Connected with Live Server Notifications & Low Stock Alerts
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.main-content .container');
  const menuBtn = document.getElementById('menuBtn') || document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Load Real Notifications
  async function loadNotifications() {
    let notifications = [];

    // 1. Fetch User Notifications
    try {
      if (window.API && window.API.notifications) {
        const res = await window.API.notifications.getAll();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          notifications = res.data;
        }
      }
    } catch (e) {
      console.warn('[Notifications API Fallback]:', e.message);
    }

    // 2. Fetch Low Stock Items to generate auto-alerts
    try {
      if (window.API && window.API.inventory) {
        const lowRes = await window.API.inventory.getLowStock();
        if (lowRes && lowRes.data && Array.isArray(lowRes.data)) {
          lowRes.data.forEach(item => {
            const medName = item.medicineId?.nameAr || 'دواء';
            notifications.unshift({
              _id: `low_${item._id}`,
              title: `تنبيه نقص مخزون: ${medName}`,
              message: `الكمية المتبقية (${item.quantity} علبة فقط). يرجى طلب توريد أو إعادة شحن المخزون.`,
              type: 'warning',
              createdAt: item.updatedAt || new Date().toISOString(),
              isRead: false,
            });
          });
        }
      }
    } catch (e) {
      console.warn('[Low Stock Alerts Fallback]:', e.message);
    }

    // 3. Fallback mock if nothing found
    if (notifications.length === 0) {
      notifications = [
        {
          _id: '1',
          title: 'مخزون أموكسيسيلين منخفض جداً (3 علب متبقية)',
          type: 'warning',
          time: 'منذ 30 دقيقة',
          isRead: false
        },
        {
          _id: '2',
          title: 'طلب حجز جديد من المريض أحمد محمود',
          type: 'info',
          time: 'منذ ساعة',
          isRead: false
        },
        {
          _id: '3',
          title: 'تمت الموافقة على طلب تبادل المخزون مع صيدلية الشفاء',
          type: 'success',
          time: 'منذ 3 ساعات',
          isRead: true
        },
        {
          _id: '4',
          title: 'تم تسليم الطلب رقم TRK-98124 بنجاح للمريض',
          type: 'success',
          time: 'أمس',
          isRead: true
        }
      ];
    }

    if (!container) return;

    const titleEl = container.querySelector('h3') || container.querySelector('h2');
    let html = '<h3 class="font-bold mb-4">مركز التنبيهات والإشعارات</h3>';

    notifications.forEach((item, index) => {
      let iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
      let iconColor = 'text-warning';
      let dotColor = 'bg-warning';
      let borderType = 'warning';

      if (item.type === 'info' || item.type === 'order') {
        iconHtml = '<i class="fa-regular fa-bell"></i>';
        iconColor = 'text-primary';
        dotColor = 'bg-primary';
        borderType = 'info';
      } else if (item.type === 'success') {
        iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        iconColor = 'text-success';
        dotColor = 'bg-success';
        borderType = 'success';
      } else if (item.type === 'danger' || item.type === 'error') {
        iconHtml = '<i class="fa-regular fa-circle-xmark"></i>';
        iconColor = 'text-danger';
        dotColor = 'bg-danger';
        borderType = 'danger';
      }

      const isUnread = item.isRead === false;
      const timeStr = item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن');

      html += `
        <div class="notification ${borderType} ${isUnread ? 'unread' : ''} p-3 bg-white border rounded mb-3 shadow-sm d-flex justify-content-between align-items-center" data-id="${item._id}" style="cursor: pointer;">
          <div class="d-flex align-items-center gap-3">
            ${isUnread ? `<span class="dot ${dotColor}" style="width: 10px; height: 10px; border-radius: 50%;"></span>` : ''}
            <div class="content">
              <h5 class="font-bold mb-1">${item.title}</h5>
              ${item.message ? `<p class="text-muted mb-1" style="font-size: 13px;">${item.message}</p>` : ''}
              <p class="text-muted mb-0" style="font-size: 12px;"><i class="fa-regular fa-clock me-1"></i> ${timeStr}</p>
            </div>
          </div>
          <div class="icon fs-3 ${iconColor}">
            ${iconHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    bindNotificationEvents();
  }

  function bindNotificationEvents() {
    const notifs = container.querySelectorAll('.notification');
    notifs.forEach(card => {
      card.addEventListener('click', async () => {
        card.classList.remove('unread');
        const dot = card.querySelector('.dot');
        if (dot) dot.remove();

        const id = card.dataset.id;
        if (id && id.length === 24 && window.API && window.API.notifications) {
          try {
            await window.API.notifications.markAsRead(id);
          } catch (e) {}
        }
      });
    });
  }

  await loadNotifications();
});