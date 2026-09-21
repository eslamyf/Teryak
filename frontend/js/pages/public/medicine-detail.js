/**
 * Teryak Platform - Medicine Details Logic (Connected to Backend API)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const medKey = (params.get('med') || 'paracetamol').toLowerCase();

  const medDatabase = {
    paracetamol: {
      title: 'نتائج البحث عن: باراسيتامول',
      activeIng: 'باراسيتامول 500 مجم (Paracetamol)',
      price: '24.50 ج.م',
      alternatives: [
        { name: 'بانادول أزرق', ing: 'باراسيتامول 500 مجم', price: '20-28 ج.م', count: '12 صيدلية' },
        { name: 'أدول 500', ing: 'باراسيتامول 500 مجم', price: '18-25 ج.م', count: '8 صيدليات' },
        { name: 'سيتال أقراص', ing: 'باراسيتامول 500 مجم', price: '15-22 ج.م', count: '15 صيدلية' }
      ]
    },
    amoxicillin: {
      title: 'نتائج البحث عن: أموكسيسيلين',
      activeIng: 'أموكسيسيلين 500 مجم (Amoxicillin)',
      price: '45.00 ج.م',
      alternatives: [
        { name: 'إيموكس 500', ing: 'أموكسيسيلين', price: '38-44 ج.م', count: '9 صيدليات' },
        { name: 'أموكسيل كبسول', ing: 'أموكسيسيلين', price: '42-48 ج.م', count: '14 صيدلية' },
        { name: 'هاي بيوتك 1 جم', ing: 'أموكسيسيلين + كلافولانيك', price: '85-95 ج.م', count: '20 صيدلية' }
      ]
    },
    omega3: {
      title: 'نتائج البحث عن: أوميجا 3',
      activeIng: 'زيت السمك وأحماض أوميجا 3 (Omega 3 - 1000mg)',
      price: '85.00 ج.م',
      alternatives: [
        { name: 'أوميجا 3 بلس', ing: 'زيت سمك + جنين القمح', price: '75-90 ج.م', count: '16 صيدلية' },
        { name: 'سوبر أوميجا', ing: 'أوميجا 3 نقي', price: '95-120 ج.م', count: '10 صيدليات' }
      ]
    },
    vitamind: {
      title: 'نتائج البحث عن: فيتامين د',
      activeIng: 'كوليكالسيفيرول (Vitamin D3 50,000 IU)',
      price: '60.00 ج.م',
      alternatives: [
        { name: 'فيدروب نقط', ing: 'فيتامين د3', price: '18-22 ج.م', count: '30 صيدلية' },
        { name: 'ديكال ب12', ing: 'كالسيوم + فيتامين د', price: '25-32 ج.م', count: '22 صيدلية' }
      ]
    },
    congestal: {
      title: 'نتائج البحث عن: كونجستال',
      activeIng: 'باراسيتامول + كلورفينيرامين + سودوإيفيدرين',
      price: '31.00 ج.م',
      alternatives: [
        { name: '123 أقراص للبرد', ing: 'مسكن ومضاد حساسية', price: '28-35 ج.م', count: '18 صيدلية' },
        { name: 'كومتركس', ing: 'علاج أعراض البرد', price: '35-42 ج.م', count: '15 صيدلية' }
      ]
    },
    aspirin: {
      title: 'نتائج البحث عن: أسبيرين بروتكت',
      activeIng: 'حمض أسيتيل ساليسيليك 100 مجم (Aspirin)',
      price: '28.00 ج.م',
      alternatives: [
        { name: 'إيكوسبرين 75 مجم', ing: 'أسبرين حماية', price: '20-25 ج.م', count: '25 صيدلية' },
        { name: 'أسبوسيد أطفال', ing: 'أسيتيل ساليسيليك 75 مجم', price: '15-20 ج.م', count: '40 صيدلية' }
      ]
    }
  };

  let medData = medDatabase[medKey] || medDatabase.paracetamol;

  // Try fetching live data from API
  if (window.API && window.API.medicines) {
    try {
      const response = await window.API.medicines.getById(medKey);
      if (response && response.data && response.data.medicine) {
        const m = response.data.medicine;
        medData = {
          title: `نتائج البحث عن: ${m.nameAr}`,
          activeIng: `${m.activeIngredient} (${m.concentration || ''})`,
          price: `${m.price.toFixed(2)} ج.م`,
          alternatives: (response.data.alternatives || []).map(alt => ({
            name: alt.nameAr || alt.nameEn,
            ing: alt.activeIngredient,
            price: `${alt.price} ج.م`,
            count: 'عدة صيدليات'
          }))
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
  if (activeIngEl) activeIngEl.textContent = medData.activeIng;
  if (price1El) price1El.textContent = medData.price;

  // Populate Alternatives
  const altContainer = document.getElementById('hiddenDiv2');
  if (altContainer && medData.alternatives && medData.alternatives.length > 0) {
    let altHtml = '';
    medData.alternatives.forEach(alt => {
      altHtml += `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
          <p style="font-weight: bold; margin-bottom: 4px;">${alt.name}</p>
          <small style="color: gray;">${alt.ing}</small>
          <p class="d-flex justify-content-between mt-1">
            <small style="font-weight: 500; color: #333;">${alt.price}</small>
            <small style="color: #008b5e; font-weight: 500;">متوفر في ${alt.count}</small>
          </p>
        </div>
      `;
    });
    altContainer.innerHTML = altHtml;
  }

  // Interactive booking buttons
  const btnShow = document.getElementById('show');
  const doneEl = document.getElementById('DONE');
  if (btnShow && doneEl) {
    btnShow.addEventListener('click', () => {
      btnShow.style.display = 'none';
      doneEl.style.display = 'inline-block';
      alert('تم حجز الدواء بنجاح في صيدلية النهضة! ستصلك رسالة تأكيد.');
    });
  }

  const btnShow2 = document.getElementById('show2');
  const doneEl2 = document.getElementById('DONE2');
  if (btnShow2 && doneEl2) {
    btnShow2.addEventListener('click', () => {
      btnShow2.style.display = 'none';
      doneEl2.style.display = 'inline-block';
      alert('تم حجز الدواء بنجاح في صيدلية الشفاء! ستصلك رسالة تأكيد.');
    });
  }

  const btnShow3 = document.getElementById('show3');
  const doneEl3 = document.getElementById('DONE3');
  if (btnShow3 && doneEl3) {
    btnShow3.addEventListener('click', () => {
      btnShow3.style.display = 'none';
      doneEl3.style.display = 'inline-block';
      alert('تم حجز الدواء بنجاح في صيدلية الحياة! ستصلك رسالة تأكيد.');
    });
  }
});