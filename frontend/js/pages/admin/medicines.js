document.addEventListener('DOMContentLoaded', () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // 1. Initialize Charts (for index.html)
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
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
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
        options: { responsive: true, maintainAspectRatio: false }
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
    };
    sidebarToggle.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
  }

  // 3. Search Filter Logic for Medicines Cards
  const medSearchInput = document.getElementById('medicineSearchInput');
  const medList = document.getElementById('medicinesList');

  if (medSearchInput && medList) {
    medSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = medList.querySelectorAll('.medicine-card');

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // 4. Modal Logic (Add Medicine)
  const openMedModalBtn = document.getElementById('openAddMedicineModalBtn');
  const closeMedModalBtn = document.getElementById('closeAddMedModalBtn');
  const cancelMedModalBtn = document.getElementById('cancelMedModalBtn');
  const medModal = document.getElementById('addMedicineModal');
  const addMedForm = document.getElementById('addMedicineForm');

  if (openMedModalBtn && medModal) {
    const openMedModal = () => medModal.classList.add('active');
    const closeMedModal = () => medModal.classList.remove('active');

    openMedModalBtn.addEventListener('click', openMedModal);
    if (closeMedModalBtn) closeMedModalBtn.addEventListener('click', closeMedModal);
    if (cancelMedModalBtn) cancelMedModalBtn.addEventListener('click', closeMedModal);

    if (addMedForm && medList) {
      addMedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mName = document.getElementById('newMedName').value;
        const engName = document.getElementById('newMedEngName').value || 'Medicine';
        const category = document.getElementById('newMedCategory').value || 'عام';
        const pCount = document.getElementById('newMedPharmacyCount').value || '0';
        const status = document.getElementById('newMedStatus').value;

        let statusClass = status === 'قيد المراجعة' ? 'status-pending' : 'status-active';

        const card = document.createElement('div');
        card.className = 'medicine-card';
        card.innerHTML = `
          <div class="medicine-right">
            <div class="medicine-img-box blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"></path><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line></svg>
            </div>
            <div class="medicine-details">
              <h3 class="medicine-name">${mName}</h3>
              <div class="medicine-subtext">
                <span>${engName}</span><span class="dot">•</span><span>${category}</span><span class="dot">•</span><span>${pCount} صيدلية</span>
              </div>
            </div>
          </div>
          <div class="medicine-left">
            <span class="status-badge ${statusClass}">${status}</span>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              <button class="action-btn view-btn" title="معاينة"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
            </div>
          </div>
        `;

        medList.prepend(card);
        addMedForm.reset();
        closeMedModal();
      });
    }
  }

  // 5. Action Delegation for Medicine Cards List
  if (medList) {
    medList.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.action-btn');
      if (!targetBtn) return;

      const card = targetBtn.closest('.medicine-card');
      const medName = card.querySelector('.medicine-name')?.innerText || 'الدواء';

      if (targetBtn.classList.contains('delete-btn')) {
        const proceedDelete = async () => {
          let ok = true;
          if (window.Toast && window.Toast.confirm) {
            ok = await window.Toast.confirm({
              title: 'حذف الدواء',
              message: `هل أنت متأكد من رغبتك في حذف ${medName} من قاعدة البيانات؟`,
              type: 'danger',
              confirmText: 'حذف نهائي',
              cancelText: 'إلغاء'
            });
          }
          if (ok) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.transition = 'all 0.2s ease';
            setTimeout(() => card.remove(), 200);
            if (window.Toast) window.Toast.success(`تم حذف ${medName} بنجاح.`, 'تم الحذف');
          }
        };
        proceedDelete();
      } else if (targetBtn.classList.contains('view-btn')) {
        window.location.href = '../public/medicine-detail.html?med=' + encodeURIComponent(medName);
      }
    });
  }
});