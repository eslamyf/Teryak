/**
 * Teryak Platform - Checkout & Shipping Details Logic
 * Integrated with Auth Protection, Real-Time Validation & Dynamic Cart Synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shippingForm');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const govSelect = document.getElementById('governorate');
  const cityInput = document.getElementById('city');
  const addressInput = document.getElementById('address');
  const addInfoInput = document.getElementById('addInfo');
  const submitBtn = document.getElementById('saveData');

  const authBanner = document.getElementById('authRequiredBanner');
  const greetingBanner = document.getElementById('userGreetingBadge');
  const greetingText = document.getElementById('greetingText');

  const itemsContainer = document.getElementById('checkoutItemsContainer');
  const countBadge = document.getElementById('summaryCountBadge');
  const subtotalDisplay = document.getElementById('subtotalPriceDisplay');
  const deliveryDisplay = document.getElementById('deliveryFeeDisplay');
  const finalTotalDisplay = document.getElementById('finalTotalPriceDisplay');

  // 1. Check Authentication Status
  const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : Boolean(localStorage.getItem('token') || localStorage.getItem('isLoggedIn') === 'true');
  const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!isLoggedIn) {
    if (authBanner) authBanner.classList.remove('d-none');
    if (greetingBanner) greetingBanner.classList.add('d-none');

    // Prompt user softly
    if (window.Toast) {
      window.Toast.warning('يرجى تسجيل الدخول بحسابك أولاً لإتمام طلب الشراء والمتابعة مع الصيدليات.', 'تسجيل الدخول مطلوب', 5000);
    }
  } else {
    if (authBanner) authBanner.classList.add('d-none');
    if (greetingBanner) {
      greetingBanner.classList.remove('d-none');
      if (greetingText) {
        greetingText.textContent = `طلبك مربوط بحساب: ${currentUser?.name || currentUser?.email || 'المستخدم'}`;
      }
    }

    // Auto-fill form fields from logged-in user profile
    if (currentUser) {
      if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
      if (currentUser.address) {
        if (typeof currentUser.address === 'object') {
          if (govSelect && currentUser.address.governorate) govSelect.value = currentUser.address.governorate;
          if (cityInput && currentUser.address.city) cityInput.value = currentUser.address.city;
          if (addressInput && !addressInput.value) addressInput.value = currentUser.address.street || '';
        } else if (typeof currentUser.address === 'string' && addressInput && !addressInput.value) {
          addressInput.value = currentUser.address;
        }
      }
    }
  }

  // 2. Render Dynamic Order Summary from Cart
  const deliveryFee = 15.00;

  function renderOrderSummary() {
    const cartItems = (window.Cart && typeof window.Cart.getItems === 'function') ? window.Cart.getItems() : [];
    const subtotal = (window.Cart && typeof window.Cart.getTotal === 'function') ? window.Cart.getTotal() : 0;
    const count = (window.Cart && typeof window.Cart.getCount === 'function') ? window.Cart.getCount() : cartItems.length;
    const finalTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

    if (countBadge) countBadge.textContent = `${count} أدوية`;
    if (subtotalDisplay) subtotalDisplay.textContent = `${subtotal.toFixed(2)} ج.م`;
    if (deliveryDisplay) deliveryDisplay.textContent = `${deliveryFee.toFixed(2)} ج.م`;
    if (finalTotalDisplay) finalTotalDisplay.textContent = `${finalTotal.toFixed(2)} ج.م`;

    if (!itemsContainer) return;

    if (cartItems.length === 0) {
      itemsContainer.innerHTML = `
        <div class="text-center py-4 px-2">
          <i class="fa-solid fa-cart-shopping text-muted fs-2 mb-2"></i>
          <p class="font-bold text-dark mb-1">سلة المشتريات فارغة</p>
          <small class="text-muted d-block mb-3">لم تقم بإضافة أي أدوية لسلة المشتريات بعد.</small>
          <a href="medicines.html" class="btn btn-outline-success btn-sm font-bold">
            <i class="fa-solid fa-pills me-1"></i> تصفح الأدوية المتوفرة
          </a>
        </div>
      `;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>سلة المشتريات فارغة</span>';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>متابعة: اختيار طريقة الدفع</span> <i class="fa-solid fa-arrow-left ms-2"></i>';
    }

    let itemsHtml = '';
    cartItems.forEach((item) => {
      const img = item.image || item.img || '../../assets/images/parst.jpg';
      const qty = Number(item.quantity) || 1;
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 25;
      const itemSubtotal = (price * qty).toFixed(2);
      const pharmacy = item.pharmacy || 'صيدلية النهضة';

      itemsHtml += `
        <div class="summary-item-row">
          <img src="${img}" alt="${item.name}" class="summary-item-img" onerror="this.src='../../assets/images/parst.jpg'">
          <div class="summary-item-info">
            <div class="summary-item-name" title="${item.name}">${item.name}</div>
            <div class="summary-item-meta d-flex justify-content-between align-items-center">
              <span>${pharmacy}</span>
              <span class="badge bg-light text-dark border">× ${qty}</span>
            </div>
          </div>
          <div class="summary-item-price">${itemSubtotal} ج.م</div>
        </div>
      `;
    });

    itemsContainer.innerHTML = itemsHtml;
  }

  // Initial render & listen for cart updates
  renderOrderSummary();
  window.addEventListener('teryak:cart-change', renderOrderSummary);

  // 3. Real-time validation for Egyptian Phone Number
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const val = phoneInput.value.trim();
      const egPhoneRegex = /^01[0125][0-9]{8}$/;
      if (val && !egPhoneRegex.test(val)) {
        if (window.TeryakValidator) {
          window.TeryakValidator.setError(phoneInput, 'رقم هاتف مصري غير صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)');
        }
      } else if (val) {
        if (window.TeryakValidator) {
          window.TeryakValidator.setValid(phoneInput);
        }
      }
    });
  }

  // 4. Handle Shipping Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Enforce Login Gate
      const currentLoggedIn = window.Auth ? window.Auth.isLoggedIn() : Boolean(localStorage.getItem('token') || localStorage.getItem('isLoggedIn') === 'true');
      if (!currentLoggedIn) {
        if (window.Toast) {
          window.Toast.error(
            'لا يمكن إتمام الطلب كزائر. يرجى تسجيل الدخول أولاً بحسابك لربط طلبيتك بالصيدلية.',
            'تسجيل الدخول مطلوب',
            6000,
            {
              text: 'تسجيل الدخول الآن',
              onClick: () => { window.location.href = 'login.html?redirect=checkout.html'; }
            }
          );
        }
        if (authBanner) {
          authBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          authBanner.classList.add('animate__animated', 'animate__shakeX');
        }
        return;
      }

      // Check if Cart has items
      const cartItems = (window.Cart && typeof window.Cart.getItems === 'function') ? window.Cart.getItems() : [];
      if (cartItems.length === 0) {
        if (window.Toast) {
          window.Toast.warning('سلة المشتريات فارغة. يرجى إضافة أدوية للطلب أولاً.', 'السلة فارغة');
        }
        return;
      }

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const governorate = govSelect ? govSelect.value : 'القاهرة';
      const city = cityInput ? cityInput.value.trim() : 'مدينة نصر';
      const address = addressInput ? addressInput.value.trim() : '';
      const addInfo = addInfoInput ? addInfoInput.value.trim() : '';

      // Validate inputs
      if (!name || name.length < 3) {
        if (window.TeryakValidator) window.TeryakValidator.setError(nameInput, 'يرجى إدخال اسم المستلم ثلاثي على الأقل');
        if (window.Toast) window.Toast.warning('اسم المستلم بالكامل مطلوب', 'بيانات الاستلام');
        nameInput?.focus();
        return;
      }

      const egPhoneRegex = /^01[0125][0-9]{8}$/;
      if (!phone || !egPhoneRegex.test(phone)) {
        if (window.TeryakValidator) window.TeryakValidator.setError(phoneInput, 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 01)');
        if (window.Toast) window.Toast.warning('رقم الهاتف غير صحيح. تأكد أنه 11 رقماً مصرياً.', 'رقم الهاتف');
        phoneInput?.focus();
        return;
      }

      if (!address || address.length < 5) {
        if (window.TeryakValidator) window.TeryakValidator.setError(addressInput, 'يرجى كتابة العنوان بالتفصيل (الشارع والعمارة)');
        if (window.Toast) window.Toast.warning('عنوان التوصيل بالتفصيل مطلوب لتسهيل عمل المندوب', 'عنوان التوصيل');
        addressInput?.focus();
        return;
      }

      const subtotal = window.Cart.getTotal();
      const finalTotal = subtotal + deliveryFee;

      // Save complete structured shipping info
      const shippingInfo = {
        fullName: name,
        phone,
        governorate,
        city,
        street: address,
        notes: addInfo,
        subtotal,
        deliveryFee,
        finalTotal,
        itemsCount: window.Cart.getCount()
      };

      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
      localStorage.setItem('name', name);
      localStorage.setItem('phone', phone);
      localStorage.setItem('address', `${governorate} - ${city} - ${address}`);
      localStorage.setItem('addInfo', addInfo);

      if (window.Toast) {
        window.Toast.success('تم حفظ بيانات الاستلام بنجاح، جاري نقلك لخيارات الدفع...', 'بيانات الشحن', 2500);
      }

      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 500);
    });
  }
});

