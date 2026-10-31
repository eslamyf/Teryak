/**
 * Teryak Platform - Prescription Page Logic
 * Features:
 * - Drag & Drop Prescription Upload with instant file preview
 * - Auto-fill user profile info if authenticated
 * - Order submission handling with tracking ID generation
 * - Toast notification and graceful UX
 */

window.initPrescriptionPage = function () {
  // Dynamically load approved partner pharmacies
  const pharmacySelect = document.getElementById('pageRxPharmacy');
  if (pharmacySelect && window.API && window.API.pharmacies) {
    window.API.pharmacies.getAll().then(res => {
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        let optionsHtml = '<option value="">أقرب صيدلية معتمدة لموقعي تلقائياً (موصى به)</option>';
        list.forEach(p => {
          const name = p.name || 'صيدلية معتمدة';
          const doc = p.doctor || p.pharmacistName ? ` - ${p.doctor || p.pharmacistName}` : '';
          const address = typeof p.address === 'string' ? p.address : (p.address?.city || '');
          const addrText = address ? ` (${address})` : '';
          optionsHtml += `<option value="${name}">${name}${doc}${addrText}</option>`;
        });
        pharmacySelect.innerHTML = optionsHtml;
      }
    }).catch(() => {});
  }

  const dropzone = document.getElementById('pageRxDropzone');
  const fileInput = document.getElementById('pageRxFileInput');
  const dropzoneContent = document.getElementById('pageRxDropzoneContent');
  const previewContainer = document.getElementById('pageRxPreviewContainer');
  const previewImg = document.getElementById('pageRxPreviewImg');
  const removeBtn = document.getElementById('pageRxRemoveBtn');
  const form = document.getElementById('pageRxForm');

  // Pre-fill user data if logged in
  try {
    const userRaw = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const nameInput = document.getElementById('pageRxName');
      const phoneInput = document.getElementById('pageRxPhone');
      if (nameInput && user.name && !nameInput.value) nameInput.value = user.name;
      if (phoneInput && user.phone && !phoneInput.value) phoneInput.value = user.phone;
    }
  } catch (e) {}

  // File Upload Handling
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== removeBtn && !removeBtn?.contains(e.target)) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (previewImg) previewImg.src = e.target.result;
            if (dropzoneContent) dropzoneContent.style.display = 'none';
            if (previewContainer) previewContainer.classList.add('is-active');
          };
          reader.readAsDataURL(file);
        } else {
          // PDF or document fallback
          if (dropzoneContent) dropzoneContent.style.display = 'none';
          if (previewContainer) {
            previewContainer.classList.add('is-active');
            if (previewImg) previewImg.src = '../../assets/images/logo.png';
          }
        }
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        if (dropzoneContent) dropzoneContent.style.display = 'block';
        if (previewContainer) previewContainer.classList.remove('is-active');
      });
    }

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        fileInput.dispatchEvent(event);
      }
    });
  }

  // Delivery options pill interaction
  const optionPills = document.querySelectorAll('.rx-option-pill');
  optionPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      optionPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const consentCheck = document.getElementById('pageRxConsent');
      if (consentCheck && !consentCheck.checked) {
        if (window.Toast) window.Toast.error('يرجى الموافقة على سياسة الخصوصية للمتابعة', 'موافقة مطلوبة');
        consentCheck.focus();
        return;
      }

      const phoneVal = (document.getElementById('pageRxPhone')?.value || '').trim();
      if (!/^01[0125][0-9]{8}$/.test(phoneVal)) {
        if (window.Toast) window.Toast.error('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً (مثال: 01012345678)', 'رقم غير صحيح');
        document.getElementById('pageRxPhone')?.focus();
        return;
      }

      const name = document.getElementById('pageRxName')?.value?.trim();
      const phone = document.getElementById('pageRxPhone')?.value?.trim();
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      if (!hasFile) {
        if (window.Toast) {
          window.Toast.warning('يرجى التقاط صورة الروشتة أو اختيار ملف لرفعه أولاً.', 'صورة الروشتة مطلوبة');
        } else {
          alert('يرجى اختيار صورة الروشتة أولاً.');
        }
        return;
      }

      if (!name || !phone) {
        if (window.Toast) {
          window.Toast.error('يرجى إدخال اسم المريض ورقم الهاتف للتواصل.', 'بيانات ناقصة');
        } else {
          alert('يرجى إدخال الاسم ورقم الهاتف.');
        }
        return;
      }

      const submitBtn = document.getElementById('pageRxSubmitBtn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري إرسال الروشتة...';
      }

      // Simulate sending to pharmacist review queue
      setTimeout(() => {
        const trackingNum = 'RX-' + Math.floor(100000 + Math.random() * 900000);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        form.reset();
        if (dropzoneContent) dropzoneContent.style.display = 'block';
        if (previewContainer) previewContainer.classList.remove('is-active');

        if (window.Toast) {
          window.Toast.success(
            `تم استلام الروشتة بنجاح برقم (${trackingNum}). سيتواصل معك صيدلي معتمد لتأكيد وتجهيز الأدوية المطلوبة خلال دقائق!`,
            'تم إرسال طلبك بنجاح',
            8000
          );
        } else {
          alert(`تم استلام الروشتة بنجاح! رقم المتابعة: ${trackingNum}`);
        }
      }, 900);
    });
  }
};

// Immediate & DOM Ready Execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initPrescriptionPage);
} else {
  window.initPrescriptionPage();
}

// Re-init on SPA mount
window.addEventListener('teryak:page-mounted', (e) => {
  if (e.detail?.page === 'prescription' || window.location.pathname.includes('prescription.html')) {
    window.initPrescriptionPage();
  }
});
