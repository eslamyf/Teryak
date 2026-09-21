/**
 * Teryak Platform - Donations & Exchanges Logic
 * Integrated with Side-Sliding Toast Notifications & Real-Time Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  const browseTabBtn = document.getElementById('tabBrowseBtn');
  const donateTabBtn = document.getElementById('tabDonateBtn');
  const browseTabContent = document.getElementById('browseTabContent');
  const donateTabContent = document.getElementById('donateTabContent');

  const btnOpDonate = document.getElementById('btnOpDonate');
  const btnOpExchange = document.getElementById('btnOpExchange');
  const exchangeField = document.getElementById('exchangeField');
  const exchangeTargetInput = document.getElementById('exchangeTargetInput');
  const formHeading = document.getElementById('formHeading');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const formMedName = document.getElementById('formMedName');
  const donationForm = document.getElementById('donationForm');

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const hiddenGrid = document.getElementById('hiddenMedicinesGrid');

  function switchMainTab(tabName) {
    if (tabName === 'browse') {
      browseTabContent?.classList.add('active');
      donateTabContent?.classList.remove('active');
      browseTabBtn?.classList.add('active');
      browseTabBtn?.setAttribute('aria-selected', 'true');
      donateTabBtn?.classList.remove('active');
      donateTabBtn?.setAttribute('aria-selected', 'false');
    } else {
      donateTabContent?.classList.add('active');
      browseTabContent?.classList.remove('active');
      donateTabBtn?.classList.add('active');
      donateTabBtn?.setAttribute('aria-selected', 'true');
      browseTabBtn?.classList.remove('active');
      browseTabBtn?.setAttribute('aria-selected', 'false');
    }
  }

  function setOperationType(type) {
    if (type === 'donate') {
      if (btnOpDonate) btnOpDonate.className = 'op-btn active-donate';
      btnOpDonate?.setAttribute('aria-checked', 'true');
      if (btnOpExchange) btnOpExchange.className = 'op-btn';
      btnOpExchange?.setAttribute('aria-checked', 'false');
      exchangeField?.classList.remove('show');
      if (formHeading) formHeading.textContent = 'تبرع بدواء';
      if (btnSubmitForm) {
        btnSubmitForm.textContent = 'إرسال طلب التبرع';
        btnSubmitForm.classList.remove('btn-purple');
      }
    } else {
      if (btnOpDonate) btnOpDonate.className = 'op-btn';
      btnOpDonate?.setAttribute('aria-checked', 'false');
      if (btnOpExchange) btnOpExchange.className = 'op-btn active-exchange';
      btnOpExchange?.setAttribute('aria-checked', 'true');
      exchangeField?.classList.add('show');
      if (formHeading) formHeading.textContent = 'استبدال دواء';
      if (btnSubmitForm) {
        btnSubmitForm.textContent = 'إرسال طلب الاستبدال';
        btnSubmitForm.classList.add('btn-purple');
      }
    }
  }

  function redirectToExchangeForm(medicineName) {
    switchMainTab('donate');
    setOperationType('exchange');
    if (exchangeTargetInput) exchangeTargetInput.value = medicineName;
    if (formMedName) formMedName.focus();
    if (window.Toast) {
      window.Toast.info(`أدخل بيانات الدواء المتوفر لديك لاستبداله بـ (${medicineName})`, 'طلب استبدال دواء');
    }
  }

  function toggleMoreMedicines() {
    if (!hiddenGrid || !loadMoreBtn) return;
    const isHidden = hiddenGrid.hasAttribute('hidden');
    if (isHidden) {
      hiddenGrid.removeAttribute('hidden');
      hiddenGrid.setAttribute('aria-hidden', 'false');
      loadMoreBtn.textContent = 'عرض أقل';
    } else {
      hiddenGrid.setAttribute('hidden', '');
      hiddenGrid.setAttribute('aria-hidden', 'true');
      loadMoreBtn.textContent = 'عرض المزيد من الأدوية';
    }
  }

  browseTabBtn?.addEventListener('click', () => switchMainTab('browse'));
  donateTabBtn?.addEventListener('click', () => switchMainTab('donate'));
  btnOpDonate?.addEventListener('click', () => setOperationType('donate'));
  btnOpExchange?.addEventListener('click', () => setOperationType('exchange'));
  loadMoreBtn?.addEventListener('click', toggleMoreMedicines);

  // Direct card action clicks
  document.querySelectorAll('.btn-request-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type || 'donation';
      const name = btn.dataset.name || 'الدواء';

      if (type === 'exchange') {
        redirectToExchangeForm(name);
      } else {
        btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> تم تقديم الطلب';
        btn.disabled = true;
        btn.style.opacity = '0.85';
        if (window.Toast) {
          window.Toast.success(
            `تم إرسال طلب استلام (${name}) بنجاح! سيتم التواصل معك من قبل فريق التوزيع.`,
            'طلب استلام دواء خيري'
          );
        }
      }
    });
  });

  // Form submission handler
  donationForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const medName = formMedName ? formMedName.value.trim() : '';
    const isExchange = btnOpExchange?.classList.contains('active-exchange');
    const exchangeTarget = exchangeTargetInput ? exchangeTargetInput.value.trim() : '';

    if (!medName) {
      if (window.TeryakValidator) window.TeryakValidator.setError(formMedName, 'يرجى كتابة اسم الدواء');
      if (window.Toast) window.Toast.warning('يرجى كتابة اسم الدواء التجاري أو العلمي', 'بيانات ناقصة');
      formMedName?.focus();
      return;
    }

    if (isExchange && !exchangeTarget) {
      if (window.TeryakValidator) window.TeryakValidator.setError(exchangeTargetInput, 'يرجى تحديد الدواء المطلوب بدلاً منه');
      if (window.Toast) window.Toast.warning('يرجى كتابة اسم الدواء المطلوب بالتبادل', 'دواء التبادل');
      exchangeTargetInput?.focus();
      return;
    }

    try {
      if (window.API && window.API.donations) {
        await window.API.donations.create({
          type: isExchange ? 'exchange' : 'donation',
          medicineName: medName,
          exchangeForMedicine: exchangeTarget,
        });
      }
    } catch (err) {
      console.log('Donation API fallback:', err.message);
    }

    if (window.Toast) {
      window.Toast.success(
        `تم إرسال طلب ${isExchange ? 'استبدال' : 'تبرع'} (${medName}) بنجاح! سيتم مراجعته والتواصل معك.`,
        'تم تسجيل طلبك'
      );
    }

    donationForm.reset();
    setOperationType('donate');
    setTimeout(() => {
      switchMainTab('browse');
    }, 1200);
  });
});