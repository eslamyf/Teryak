/**
 * Teryak Platform - Medicine Details Logic (Connected to Backend API)
 * Integrated with Side-Sliding Toast Notifications & Dynamic Data
 */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const medKey = (params.get('med') || 'aspirin').toLowerCase();

  const medDatabase = {
    aspirin: {
      title: 'نتائج البحث عن: أسبيرين بروتكت',
      nameAr: 'أسبيرين بروتكت 100 مجم',
      activeIng: 'حمض أسيتيل ساليسيليك 100 مجم (Aspirin)',
      price: '28.00 ج.م',
      alternatives: [
        { name: 'إيكوسبرين 75 مجم', ing: 'أسبرين حماية للقلب', price: '22.00 ج.م', count: '15 صيدلية' },
        { name: 'أسبوسيد أطفال', ing: 'أسيتيل ساليسيليك 75 مجم', price: '18.00 ج.م', count: '24 صيدلية' }
      ]
    },
    paracetamol: {
      title: 'نتائج البحث عن: باراسيتامول',
      nameAr: 'بانادول إكسترا / بارامول',
      activeIng: 'باراسيتامول 500 مجم (Paracetamol)',
      price: '24.50 ج.م',
      alternatives: [
        { name: 'بانادول إكسترا', ing: 'باراسيتامول + كافيين', price: '35.00 ج.م', count: '18 صيدلية' },
        { name: 'بارامول 500', ing: 'باراسيتامول 500 مجم', price: '18.00 ج.م', count: '25 صيدلية' },
        { name: 'كاتافلام 50', ing: 'ديكلوفيناك بوتاسيوم', price: '45.00 ج.م', count: '12 صيدلية' }
      ]
    },
    amoxicillin: {
      title: 'نتائج البحث عن: أموكسيسيلين',
      nameAr: 'أموكسيل 500 مجم',
      activeIng: 'أموكسيسيلين 500 مجم (Amoxicillin)',
      price: '45.00 ج.م',
      alternatives: [
        { name: 'أوجمنتين 1 جم', ing: 'أموكسيسيلين + كلافولانات', price: '130.00 ج.م', count: '14 صيدلية' },
        { name: 'كيورام 1 جم', ing: 'أموكسيسيلين + كلافولانات', price: '105.00 ج.م', count: '20 صيدلية' }
      ]
    },
    omega3: {
      title: 'نتائج البحث عن: أوميجا 3',
      nameAr: 'أوميجا 3 بلس',
      activeIng: 'زيت السمك + زيت جنين القمح (Omega 3 - 1000mg)',
      price: '65.00 ج.م',
      alternatives: [
        { name: 'أوميجا 3 بلس', ing: 'زيت سمك + جنين القمح', price: '65.00 ج.م', count: '18 صيدلية' }
      ]
    },
    vitamind: {
      title: 'نتائج البحث عن: فيتامين د',
      nameAr: 'ديفارول إس فيتامين د3',
      activeIng: 'كوليكالسيفيرول (Vitamin D3 200,000 IU)',
      price: '25.00 ج.م',
      alternatives: [
        { name: 'ديفارول إس', ing: 'فيتامين د3', price: '25.00 ج.م', count: '30 صيدلية' }
      ]
    },
    congestal: {
      title: 'نتائج البحث عن: كونجستال',
      nameAr: 'كونجستال أقراص',
      activeIng: 'باراسيتامول + كلورفينيرامين + سودوإيفيدرين',
      price: '31.00 ج.م',
      alternatives: [
        { name: 'بانادول إكسترا', ing: 'مسكن ومخفض حرارة', price: '35.00 ج.م', count: '22 صيدلية' }
      ]
    }
  };

  let medData = medDatabase[medKey] || medDatabase.aspirin;

  // Try fetching live data from API
  if (window.API && window.API.medicines) {
    try {
      const response = await window.API.medicines.getById(medKey);
      if (response && response.data && response.data.medicine) {
        const m = response.data.medicine;
        medData = {
          title: `نتائج البحث عن: ${m.nameAr}`,
          nameAr: m.nameAr,
          activeIng: `${m.activeIngredient} ${m.concentration ? '(' + m.concentration + ')' : ''}`,
          price: `${m.price.toFixed(2)} ج.م`,
          alternatives: (response.data.alternatives && response.data.alternatives.length > 0)
            ? response.data.alternatives.map(alt => ({
                name: alt.nameAr || alt.nameEn,
                ing: alt.activeIngredient || 'بديل مكافئ',
                price: `${alt.price ? alt.price.toFixed(2) : '25.00'} ج.م`,
                count: 'صيدليات متعددة'
              }))
            : medData.alternatives
        };
      }
    } catch (e) {
      console.log('API detail load fallback to local presets:', e.message);
    }
  }

  const titleEl = document.getElementById('medicineDetailTitle');
  const activeIngEl = document.getElementById('medicineActiveIng');
  const price1El = document.getElementById('pharmacyPrice1');

  if (titleEl) titleEl.textContent = medData.title;
  if (activeIngEl) activeIngEl.innerHTML = `<b>${medData.activeIng}</b>`;
  if (price1El) price1El.textContent = medData.price;

  // Populate Alternatives Sidebar
  const altContainer = document.getElementById('hiddenDiv2');
  if (altContainer && medData.alternatives && medData.alternatives.length > 0) {
    let altHtml = '';
    medData.alternatives.forEach(alt => {
      altHtml += `
        <div class="alt-item">
          <div class="alt-top">
            <strong>${alt.name}</strong>
            <span class="alt-price">${alt.price}</span>
          </div>
          <small class="text-muted">${alt.ing}</small>
          <div class="alt-avail">
            <i class="fa-solid fa-check text-success"></i> متوفر في ${alt.count}
          </div>
        </div>
      `;
    });
    altContainer.innerHTML = altHtml;
  }

  // Interactive booking buttons with Side Toasts
  function handleBooking(btnId, doneId, pharmacyName, orderNum) {
    const btn = document.getElementById(btnId);
    const done = document.getElementById(doneId);
    if (btn && done) {
      btn.addEventListener('click', () => {
        btn.style.display = 'none';
        done.style.display = 'block';
        done.classList.remove('hide');

        if (window.Toast) {
          window.Toast.success(
            `تم حجز ${medData.nameAr || 'الدواء'} بنجاح في ${pharmacyName}! رقم الطلب: #${orderNum}`,
            'تأكيد الحجز الفوري',
            5000,
            {
              text: 'عرض الحجوزات',
              onClick: () => {
                window.location.href = '../public/patient-dashboard.html';
              }
            }
          );
        }
      });
    }
  }

  handleBooking('show', 'DONE', 'صيدلية النهضة الحديثة', 'TRK-8921');
  handleBooking('show2', 'DONE2', 'صيدلية الشفاء التخصصية', 'TRK-8922');
  handleBooking('show3', 'DONE3', 'صيدلية الحياة', 'TRK-8923');
});