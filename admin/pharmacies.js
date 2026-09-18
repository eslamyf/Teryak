document.addEventListener('DOMContentLoaded', () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

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
          plugins: {
            legend: { display: false },
            tooltip: {
              rtl: true,
              titleFont: { family: 'Tajawal', weight: 'bold' },
              bodyFont: { family: 'Tajawal' },
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Tajawal', size: 12 } }
            },
            y: {
              min: 0,
              max: 80,
              ticks: { stepSize: 20, font: { family: 'Tajawal', size: 11 } },
              grid: { color: '#e2e8f0', drawBorder: false }
            }
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
            hoverBackgroundColor: '#047857',
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              rtl: true,
              titleFont: { family: 'Tajawal', weight: 'bold' },
              bodyFont: { family: 'Tajawal' },
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Tajawal', size: 12 } }
            },
            y: {
              min: 0,
              max: 140,
              ticks: { stepSize: 35, font: { family: 'Tajawal', size: 11 } },
              grid: { color: '#e2e8f0', drawBorder: false }
            }
          }
        }
      });
    }
  }
  // 2. Mobile Sidebar Toggle Handler
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
  // 3. Pharmacies Table Logic (Search, Modal, Actions)
  const searchInput = document.getElementById('pharmacySearchInput');
  const tableBody = document.getElementById('pharmaciesTableBody');
  if (searchInput && tableBody) {
    // Search Filtering
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  // Modal Handlers
  const openModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeAddModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const modal = document.getElementById('addPharmacyModal');
  const addForm = document.getElementById('addPharmacyForm');
  if (openModalBtn && modal) {
    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    if (addForm && tableBody) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pName = document.getElementById('newPharmacyName').value;
        const dName = document.getElementById('newDoctorName').value;
        const location = document.getElementById('newLocation').value;
        const count = document.getElementById('newMedicineCount').value || '0';
        const status = document.getElementById('newStatus').value;
        const today = new Date().toISOString().split('T')[0];
        let statusClass = 'status-active';
        if (status === 'قيد المراجعة') statusClass = 'status-pending';
        if (status === 'موقوف') statusClass = 'status-suspended';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="pharmacy-info">
              <span class="pharmacy-name">${pName}</span>
              <span class="doctor-name">${dName}</span>
            </div>
          </td>
          <td>${location}</td>
          <td class="bold-text">${count}</td>
          <td class="date-text">${today}</td>
          <td>
            <span class="status-badge ${statusClass}">${status}</span>
          </td>
          <td>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button class="action-btn block-btn" title="حظر / إيقاف">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
              <button class="action-btn view-btn" title="معاينة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </td>
        `;
        tableBody.prepend(tr);
        addForm.reset();
        closeModal();
      });
    }
  }
  // Event delegation for table action buttons
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;
      const row = targetBtn.closest('tr');
      const pharmacyName = row.querySelector('.pharmacy-name')?.innerText || 'الصيدلية';
      if (targetBtn.classList.contains('delete-btn')) {
        if (confirm(`هل أنت تأكد من رغبتك في حذف ${pharmacyName}؟`)) {
          row.style.opacity = '0';
          row.style.transform = 'scale(0.95)';
          row.style.transition = 'all 0.2s ease';
          setTimeout(() => row.remove(), 200);
        }
      } else if (targetBtn.classList.contains('block-btn')) {
        const badge = row.querySelector('.status-badge');
        if (badge) {
          if (badge.classList.contains('status-suspended')) {
            badge.className = 'status-badge status-active';
            badge.innerText = 'نشط';
          } else {
            badge.className = 'status-badge status-suspended';
            badge.innerText = 'موقوف';
          }
        }
      } else if (targetBtn.classList.contains('view-btn')) {
        window.location.href = 'pharmacy-details.html?name=' + encodeURIComponent(pharmacyName);
      }
    });
  }
});
