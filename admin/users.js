document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Charts only if element exists (on index.html)
  const newUsersElem = document.getElementById('newUsersChart');
  const weeklyBookingsElem = document.getElementById('weeklyBookingsChart');

  if (typeof Chart !== 'undefined' && (newUsersElem || weeklyBookingsElem)) {
    Chart.defaults.font.family = "'Tajawal', sans-serif";
    Chart.defaults.color = '#6b7280';
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    if (newUsersElem) {
      new Chart(newUsersElem.getContext('2d'), {
        type: 'line',
        data: {
          labels: arabicDays,
          datasets: [{
            label: 'مستخدمون جدد',
            data: [40, 65, 55, 80, 72, 30, 48],
            borderColor: '#3b82f6',
            borderWidth: 2.5,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 0, max: 80, ticks: { stepSize: 20 } }
          }
        }
      });
    }

    if (weeklyBookingsElem) {
      new Chart(weeklyBookingsElem.getContext('2d'), {
        type: 'bar',
        data: {
          labels: arabicDays,
          datasets: [{
            label: 'الحجوزات',
            data: [75, 105, 90, 130, 125, 65, 85],
            backgroundColor: '#059669',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { min: 0, max: 140, ticks: { stepSize: 35 } }
          }
        }
      });
    }
  }

  // 2. Mobile Sidebar Toggle
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

  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'center'
    });
  }

  // 3. Search Filter Logic
  const searchInput = document.getElementById('pharmacySearchInput') || document.getElementById('userSearchInput');
  const tableBody = document.getElementById('pharmaciesTableBody') || document.getElementById('usersTableBody');

  if (searchInput && tableBody) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // 4. Modal Logic (Add Pharmacy)
  const openModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeAddModalBtn');
  const modal = document.getElementById('addPharmacyModal');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => modal.classList.add('active'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  // 5. Actions Delegation (Delete / Block / View)
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;

      const row = targetBtn.closest('tr');
      const name = row.querySelector('.pharmacy-name')?.innerText || 'العنصر';

      if (targetBtn.classList.contains('delete-btn')) {
        if (confirm(`هل أنت تأكد من رغبتك في حذف ${name}؟`)) {
          row.remove();
        }
      } else if (targetBtn.classList.contains('block-btn')) {
        const badge = row.querySelector('.status-badge');
        if (badge) {
          if (badge.classList.contains('status-suspended') || badge.classList.contains('status-inactive')) {
            badge.className = 'status-badge status-active';
            badge.innerText = 'نشط';
          } else {
            badge.className = 'status-badge status-suspended';
            badge.innerText = 'موقوف';
          }
        }
      } else if (targetBtn.classList.contains('view-btn')) {
        window.location.href = 'pharmacy-details.html?name=' + encodeURIComponent(name);
      }
    });
  }
});