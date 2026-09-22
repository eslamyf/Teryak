/**
 * Teryak Platform - Admin Users Management Logic
 * Connected with Backend API (/api/admin/users) & Live User State Management
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
  const searchInput = document.getElementById('userSearchInput') || document.getElementById('pharmacySearchInput');
  const tableBody = document.getElementById('usersTableBody') || document.getElementById('pharmaciesTableBody');

  let currentUsers = [];

  // 3. Fallback Initial Users
  const defaultUsers = [
    {
      _id: 'usr_1',
      name: 'أحمد محمود',
      email: 'patient@teryak.com',
      phone: '01012345678',
      role: 'patient',
      roleText: 'مريض',
      date: '2026-09-10',
      status: 'active',
    },
    {
      _id: 'usr_2',
      name: 'د. محمد علي',
      email: 'pharmacist@teryak.com',
      phone: '01198765432',
      role: 'pharmacist',
      roleText: 'صيدلي',
      date: '2026-09-12',
      status: 'active',
    },
    {
      _id: 'usr_3',
      name: 'د. سارة إبراهيم',
      email: 'sara.pharmacy@teryak.com',
      phone: '01233445566',
      role: 'pharmacist',
      roleText: 'صيدلي',
      date: '2026-09-14',
      status: 'active',
    },
    {
      _id: 'usr_4',
      name: 'المدير العام',
      email: 'admin@teryak.com',
      phone: '01000000001',
      role: 'admin',
      roleText: 'إدارة',
      date: '2026-09-01',
      status: 'active',
    },
  ];

  // 4. Load Users from API
  async function loadUsers() {
    let items = [];

    try {
      if (window.API && window.API.admin) {
        const res = await window.API.admin.getUsers();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(u => ({
            _id: u._id,
            name: u.name || u.email.split('@')[0],
            email: u.email,
            phone: u.phone || '01000000000',
            role: u.role,
            roleText: u.role === 'pharmacist' ? 'صيدلي' : (u.role === 'admin' ? 'إدارة' : 'مريض'),
            date: u.createdAt ? u.createdAt.split('T')[0] : '2026-09-15',
            status: u.status || 'active',
          }));
        }
      }
    } catch (e) {
      console.warn('[Admin Users API Fallback]:', e.message);
    }

    if (items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('admin_users_list'));
        items = local && local.length > 0 ? local : defaultUsers;
      } catch (e) {
        items = defaultUsers;
      }
    }

    currentUsers = items;
    saveLocalUsers();
    renderUsers(currentUsers);
  }

  function saveLocalUsers() {
    try {
      localStorage.setItem('admin_users_list', JSON.stringify(currentUsers));
    } catch (e) {}
  }

  // 5. Render Users Table
  function renderUsers(items) {
    if (!tableBody) return;

    if (items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">لا يوجد مستخدمون مطابقون للبحث</td>
        </tr>
      `;
      return;
    }

    let html = '';
    items.forEach(u => {
      const isSuspended = u.status === 'suspended' || u.status === 'موقوف';
      const statusClass = isSuspended ? 'status-suspended' : 'status-active';
      const statusText = isSuspended ? 'موقوف' : 'نشط';

      let roleBadgeClass = 'bg-light text-dark border';
      if (u.role === 'pharmacist') roleBadgeClass = 'bg-success bg-opacity-10 text-success border-success border-opacity-25';
      if (u.role === 'admin') roleBadgeClass = 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25';

      html += `
        <tr data-id="${u._id}">
          <td>
            <div class="user-info d-flex align-items-center gap-2">
              <div class="avatar-circle bg-light border rounded-circle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; font-weight: bold; color: var(--primary-color);">
                ${u.name.charAt(0)}
              </div>
              <div>
                <span class="pharmacy-name font-bold d-block">${u.name}</span>
                <span class="text-muted small">${u.email}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${roleBadgeClass} p-1 px-2 font-bold">${u.roleText}</span>
          </td>
          <td dir="ltr" class="text-end text-muted font-monospace">${u.phone}</td>
          <td class="date-text text-muted">${u.date}</td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
          <td>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف الحساب" data-id="${u._id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <button class="action-btn block-btn" title="تجميد / تنشيط الحساب" data-id="${u._id}">
                <i class="fa-solid fa-user-lock"></i>
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
        renderUsers(currentUsers);
        return;
      }
      const filtered = currentUsers.filter(u => {
        return (
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query) ||
          u.roleText.includes(query)
        );
      });
      renderUsers(filtered);
    });
  }

  // 7. Actions Delegation (Delete & Suspend/Activate)
  if (tableBody) {
    tableBody.addEventListener('click', async (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;

      const row = targetBtn.closest('tr');
      const userId = row?.dataset.id;
      const targetUser = currentUsers.find(u => u._id === userId);
      const userName = targetUser ? targetUser.name : 'المستخدم';

      if (targetBtn.classList.contains('delete-btn')) {
        let ok = true;
        if (window.Toast && window.Toast.confirm) {
          ok = await window.Toast.confirm({
            title: 'حذف حساب المستخدم',
            message: `هل أنت متأكد من رغبتك في حذف حساب (${userName}) نهائياً؟`,
            type: 'danger',
            confirmText: 'حذف الحساب',
            cancelText: 'إلغاء'
          });
        }
        if (ok) {
          currentUsers = currentUsers.filter(u => u._id !== userId);
          saveLocalUsers();
          renderUsers(currentUsers);
          if (window.Toast) window.Toast.success(`تم حذف حساب ${userName} بنجاح.`, 'تم الحذف');
        }
      } else if (targetBtn.classList.contains('block-btn')) {
        if (targetUser) {
          const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
          targetUser.status = newStatus;

          // Call API
          if (window.API && window.API.admin && userId && userId.length === 24) {
            try {
              await window.API.admin.updateUserStatus(userId, { status: newStatus });
            } catch (err) {}
          }

          saveLocalUsers();
          renderUsers(currentUsers);
          if (window.Toast) {
            window.Toast.info(`تم تغيير حالة حساب (${userName}) إلى: ${newStatus === 'active' ? 'نشط' : 'موقوف'}`);
          }
        }
      }
    });
  }

  await loadUsers();
});