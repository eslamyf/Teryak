document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const medicineId = params.get('med');
  const titleEl = document.getElementById('medicineDetailTitle');
  const activeIngredientEl = document.getElementById('medicineActiveIng');
  const pharmacyContainer = document.querySelector('.mainDIV');

  if (!pharmacyContainer) return;
  pharmacyContainer.innerHTML = `
    <p class="parg parg2">الصيدليات المسجل لديها المنتج</p>
    <div id="availablePharmaciesList" aria-live="polite">
      <div class="alert alert-info" role="status">جاري تحميل الصيدليات والمخزون...</div>
    </div>
  `;
  document.querySelector('.left')?.remove();

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (!address || typeof address !== 'object') return 'العنوان غير مسجل';
    return [address.street, address.city, address.governorate].filter(Boolean).join('، ') || 'العنوان غير مسجل';
  };

  const list = document.getElementById('availablePharmaciesList');
  const showMessage = (message, className = 'alert-warning') => {
    if (list) list.innerHTML = `<div class="alert ${className}" role="status">${escapeHtml(message)}</div>`;
  };

  if (!medicineId || !window.API?.medicines) {
    showMessage('تعذر تحديد المنتج أو الاتصال بالخادم.', 'alert-danger');
    return;
  }

  try {
    const response = await window.API.medicines.getById(medicineId);
    const medicine = response?.data?.medicine;
    if (!medicine) {
      showMessage('المنتج المطلوب غير موجود.', 'alert-warning');
      return;
    }

    if (titleEl) titleEl.textContent = `الصيدليات المتوفر لديها: ${medicine.nameAr}`;
    if (activeIngredientEl) {
      activeIngredientEl.textContent = medicine.productType === 'product'
        ? (medicine.category || 'منتج صحي')
        : (medicine.activeIngredient || medicine.concentration || 'غير مسجل');
      const infoLabel = activeIngredientEl.parentElement?.firstChild;
      if (infoLabel) infoLabel.textContent = medicine.productType === 'product' ? 'التصنيف: ' : 'المادة الفعالة: ';
    }

    const availablePharmacies = Array.isArray(response.data.availablePharmacies)
      ? response.data.availablePharmacies.filter((entry) =>
          entry?.pharmacy?._id && Number(entry.quantity) > 0
        )
      : [];

    if (availablePharmacies.length === 0) {
      showMessage('لا توجد صيدلية مسجلة لديها كمية متاحة من هذا المنتج حاليًا.');
      return;
    }

    list.innerHTML = availablePharmacies.map(({ pharmacy, quantity, price }, index) => {
      const hours = pharmacy.openingHours?.is24Hours
        ? 'مفتوحة 24 ساعة'
        : [pharmacy.openingHours?.open, pharmacy.openingHours?.close].filter(Boolean).join(' - ');
      return `
        <article class="DIV pharmacy-stock-card">
          <div class="d-flex1">
            <div class="pharmacy-name-box">
              <p class="parg">${escapeHtml(pharmacy.name || 'صيدلية')}</p>
              <small class="text-muted"><i class="fa-solid fa-location-dot text-success me-1"></i>${escapeHtml(formatAddress(pharmacy.address))}</small>
            </div>
            <p class="${Number(quantity) <= 5 ? 'limited' : 'available'}">
              <i class="fa-solid fa-circle-check me-1"></i>${Number(quantity) <= 5 ? 'كمية محدودة' : 'متوفر الآن'}
            </p>
          </div>
          <div class="mtop">
            ${hours ? `<span class="badge-status open"><i class="fa-solid fa-clock me-1"></i>${escapeHtml(hours)}</span>` : ''}
            ${pharmacy.deliveryAvailable ? '<span class="badge-dist"><i class="fa-solid fa-truck me-1"></i>التوصيل متاح</span>' : ''}
          </div>
          <div class="line"></div>
          <div class="d-flex2">
            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-lbl">السعر</span>
                <p class="stat-val text-success">${Number(price || medicine.price || 0).toFixed(2)} ج.م</p>
              </div>
              <div class="stat-box">
                <span class="stat-lbl">الكمية المتاحة</span>
                <p class="stat-val">${Number(quantity)} وحدة</p>
              </div>
              ${pharmacy.deliveryTimeMinutes ? `<div class="stat-box"><span class="stat-lbl">وقت التوصيل</span><p class="stat-val">${Number(pharmacy.deliveryTimeMinutes)} دقيقة</p></div>` : ''}
            </div>
            <div class="action-box">
              <button class="btn btn-booking" type="button" data-pharmacy-index="${index}">
                <i class="fa-solid fa-cart-plus me-1"></i> أضف للسلة من هذه الصيدلية
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('[data-pharmacy-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = availablePharmacies[Number(button.dataset.pharmacyIndex)];
        if (!window.Cart || typeof window.Cart.addItem !== 'function') {
          window.Toast?.error('تعذر فتح سلة المشتريات. أعد تحميل الصفحة وحاول مرة أخرى.', 'خطأ');
          return;
        }
        window.Cart.addItem({
          id: medicine._id,
          medicineId: medicine._id,
          name: medicine.nameAr,
          price: Number(selected.price || medicine.price),
          quantity: 1,
          image: medicine.image || '',
          pharmacy: selected.pharmacy.name,
          pharmacyId: selected.pharmacy._id,
          deliveryFee: selected.pharmacy.deliveryFee,
        });
        window.Toast?.success(`تمت إضافة ${medicine.nameAr} من ${selected.pharmacy.name} إلى السلة.`);
      });
    });
  } catch (error) {
    console.error('Failed to load product availability:', error);
    showMessage(error.message || 'تعذر تحميل بيانات المنتج والصيدليات.', 'alert-danger');
  }
});
