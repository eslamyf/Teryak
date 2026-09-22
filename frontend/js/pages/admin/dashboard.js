/**
 * Teryak Platform - Admin Dashboard & Analytics Engine
 * Connected with Backend API (/api/admin/dashboard-stats)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // Sidebar Toggle
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

  // Load Dashboard Data from API
  async function loadAdminStats() {
    let stats = {
      counts: {
        totalUsers: 52430,
        totalPharmacies: 245,
        totalMedicines: 12800,
        totalOrders: 1243,
        totalRevenue: 45800,
      },
      charts: {
        days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        newUsers: [40, 65, 55, 80, 72, 30, 48],
        weeklyBookings: [75, 105, 90, 130, 125, 65, 85],
      },
    };

    try {
      if (window.API && window.API.admin) {
        const res = await window.API.admin.getDashboardStats();
        if (res && res.data) {
          stats = res.data;
        }
      }
    } catch (e) {
      console.warn('[Admin Stats API Fallback]:', e.message);
    }

    // Update KPI Card Numbers
    const kpiCards = document.querySelectorAll('.kpi-card');
    if (kpiCards.length >= 4) {
      const usersVal = kpiCards[0].querySelector('.kpi-value');
      const pharmaciesVal = kpiCards[1].querySelector('.kpi-value');
      const medicinesVal = kpiCards[2].querySelector('.kpi-value');
      const ordersVal = kpiCards[3].querySelector('.kpi-value');

      if (usersVal) usersVal.textContent = Number(stats.counts?.totalUsers || 0).toLocaleString();
      if (pharmaciesVal) pharmaciesVal.textContent = Number(stats.counts?.totalPharmacies || 0).toLocaleString();
      if (medicinesVal) medicinesVal.textContent = Number(stats.counts?.totalMedicines || 0).toLocaleString();
      if (ordersVal) ordersVal.textContent = Number(stats.counts?.totalOrders || 0).toLocaleString();
    }

    // Initialize Charts
    initCharts(stats.charts);
  }

  function initCharts(chartsData) {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'Tajawal', sans-serif";
    Chart.defaults.color = '#6b7280';

    const days = chartsData?.days || ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // 1. Line Chart: مستخدمون جدد (New Users)
    const newUsersCanvas = document.getElementById('newUsersChart');
    if (newUsersCanvas) {
      new Chart(newUsersCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            {
              label: 'مستخدمون جدد',
              data: chartsData?.newUsers || [40, 65, 55, 80, 72, 30, 48],
              borderColor: '#3b82f6',
              borderWidth: 2.5,
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#3b82f6',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
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
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Tajawal', size: 12 } },
            },
            y: {
              ticks: {
                font: { family: 'Tajawal', size: 11 },
              },
              grid: {
                color: '#e2e8f0',
                drawBorder: false,
              },
            },
          },
        },
      });
    }

    // 2. Bar Chart: الحجوزات الأسبوعية (Weekly Bookings)
    const weeklyBookingsCanvas = document.getElementById('weeklyBookingsChart');
    if (weeklyBookingsCanvas) {
      new Chart(weeklyBookingsCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: 'الحجوزات',
              data: chartsData?.weeklyBookings || [75, 105, 90, 130, 125, 65, 85],
              backgroundColor: '#059669',
              hoverBackgroundColor: '#047857',
              borderRadius: 6,
              borderSkipped: false,
              barPercentage: 0.6,
            },
          ],
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
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Tajawal', size: 12 } },
            },
            y: {
              ticks: {
                font: { family: 'Tajawal', size: 11 },
              },
              grid: {
                color: '#e2e8f0',
                drawBorder: false,
              },
            },
          },
        },
      });
    }
  }

  await loadAdminStats();
});
