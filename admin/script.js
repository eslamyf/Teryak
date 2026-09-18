document.addEventListener('DOMContentLoaded', () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // Chart Global Settings for Tajawal Font
  if (typeof Chart !== 'undefined' && document.getElementById('newUsersChart') && document.getElementById('weeklyBookingsChart')) {
    Chart.defaults.font.family = "'Tajawal', sans-serif";
    Chart.defaults.color = '#6b7280';
  // Days of week in Arabic
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  // 1. Line Chart: مستخدمون جدد (New Users)
  const newUsersCtx = document.getElementById('newUsersChart').getContext('2d');
  new Chart(newUsersCtx, {
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
        tension: 0.4, // Smooth curve
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
          ticks: {
            stepSize: 20,
            font: { family: 'Tajawal', size: 11 }
          },
          grid: {
            color: '#e2e8f0',
            drawBorder: false
          }
        }
      }
    }
  });
  // 2. Bar Chart: الحجوزات الأسبوعية (Weekly Bookings)
  const weeklyBookingsCtx = document.getElementById('weeklyBookingsChart').getContext('2d');
  new Chart(weeklyBookingsCtx, {
    type: 'bar',
    data: {
      labels: arabicDays,
      datasets: [{
        label: 'الحجوزات',
        data: [75, 105, 90, 130, 125, 65, 85],
        backgroundColor: '#059669', // Emerald Green
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
          ticks: {
            stepSize: 35,
            font: { family: 'Tajawal', size: 11 }
          },
          grid: {
            color: '#e2e8f0',
            drawBorder: false
          }
        }
      }
    }
  });
  }
  // Mobile Sidebar Toggle Handler
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
});
