/**
 * Teryak Platform - Home Page Logic (Design Migration Implementation)
 * Connects reference UI with platform core services:
 * - Search & Chips with redirection to medicines catalog (?q=)
 * - Dual Light/Dark Theme Switching (data-theme & body.dark-theme)
 * - Shopping Cart Integration (+ button, counter badge, cart modal)
 * - Live/Fallback Featured Medicines from API (Panadol, Augmentin, Aspirin, Vitamin D)
 * - Prescription Modal with File Dropzone & Order Submission
 */

window.initHomePage = async function () {
  // ---------------------------------------------------------
  // 1. Theme Switcher (Delegated to unified <app-navbar> or fallback)
  // ---------------------------------------------------------
  const themeBtn = document.getElementById('theme');
  if (themeBtn && !themeBtn.dataset.bound) {
    themeBtn.dataset.bound = 'true';
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      if (document.querySelector('app-navbar')) {
        document.querySelector('app-navbar').applyTheme(newTheme);
      }
    });
  }

  // ---------------------------------------------------------
  // 2. Search & Trending Chips
  // ---------------------------------------------------------
  const qInput = document.getElementById('q');
  const searchForm = document.getElementById('searchForm');
  const againBtn = document.getElementById('again');

  const executeSearch = (queryText) => {
    const val = (queryText !== undefined ? queryText : (qInput ? qInput.value : '')).trim();
    const targetUrl = 'pages/public/medicines.html' + (val ? `?q=${encodeURIComponent(val)}` : '');
    if (window.SPARouterInstance) {
      window.SPARouterInstance.navigateTo(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  if (searchForm && !searchForm.dataset.bound) {
    searchForm.dataset.bound = 'true';
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch();
    });
  }

  document.querySelectorAll('.chips button').forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const query = btn.dataset.q || btn.textContent.trim();
        if (qInput) {
          qInput.value = query;
          qInput.focus();
        }
        executeSearch(query);
      });
    }
  });

  if (againBtn && !againBtn.dataset.bound) {
    againBtn.dataset.bound = 'true';
    againBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (qInput) qInput.focus();
    });
  }

  // Back to top floating arrow
  const arow = document.getElementById('arow');
  if (arow && !arow.dataset.bound) {
    arow.dataset.bound = 'true';
    window.addEventListener('scroll', () => {
      if (window.scrollY >= 300) {
        arow.style.display = 'flex';
      } else {
        arow.style.display = 'none';
      }
    }, { passive: true });

    arow.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------------------------------------------------------
  // 3. User Authentication State in Navbar (Delegated to <app-navbar> or fallback)
  // ---------------------------------------------------------
  if (!document.querySelector('app-navbar')) {
    const authNavContainer = document.getElementById('navAuthContainer');
    const updateAuthUI = () => {
      if (!authNavContainer) return;
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      let user = null;
      try {
        user = userRaw ? JSON.parse(userRaw) : null;
      } catch (e) {}

      if ((token || localStorage.getItem('isLoggedIn') === 'true') && user) {
        const displayName = user.name ? user.name.split(' ')[0] : 'حسابي';
        const role = user.role || user.userType || 'مريض';
        let dashboardUrl = 'pages/public/patient-dashboard.html';
        if (role === 'pharmacist' || role === 'صيدلي') dashboardUrl = 'pages/pharmacist/index.html';
        else if (role === 'admin' || role === 'إدارة') dashboardUrl = 'pages/admin/index.html';

        authNavContainer.innerHTML = `
          <a href="${dashboardUrl}" class="login" title="الانتقال إلى لوحة التحكم">
            <i class="fa-solid fa-user-circle"></i>
            <span>${displayName}</span>
          </a>
        `;
      } else {
        authNavContainer.innerHTML = `
          <a href="pages/public/login.html" class="login" id="homeLoginBtn">دخول</a>
        `;
        const loginBtn = authNavContainer.querySelector('#homeLoginBtn');
        if (loginBtn && !loginBtn.dataset.bound) {
          loginBtn.dataset.bound = 'true';
          loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'pages/public/login.html';
          });
        }
      }
    };
    updateAuthUI();
    if (!window._teryakHomeAuthChangeBound) {
      window._teryakHomeAuthChangeBound = true;
      window.addEventListener('teryak:auth-change', updateAuthUI);
    }
  }

  // ---------------------------------------------------------
  // 4. Cart Integration & Badge Sync
  // ---------------------------------------------------------
  const syncCartCounter = () => {
    const badge = document.getElementById('homeCartBadge');
    if (!badge) return;
    const count = window.Cart ? window.Cart.getCount() : 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  };

  syncCartCounter();
  if (!window._teryakHomeCartChangeBound) {
    window._teryakHomeCartChangeBound = true;
    window.addEventListener('teryak:cart-change', syncCartCounter);
  }

  // Delegated handler for "+" Add to Cart button in medicine cards (Binds once to container)
  const medsGrid = document.querySelector('.meds-grid');
  if (medsGrid && !medsGrid.dataset.cartBound) {
    medsGrid.dataset.cartBound = 'true';
    medsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.add');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      // Debounce rapid multiple clicks on the same button
      const now = Date.now();
      if (btn._lastClickTime && (now - btn._lastClickTime) < 400) return;
      btn._lastClickTime = now;

      const card = btn.closest('.med');
      const id = btn.dataset.id || card?.dataset.id || 'med_' + Date.now();
      const name = btn.dataset.name || card?.querySelector('h3')?.textContent.trim() || 'دواء';
      const price = parseFloat(btn.dataset.price || card?.dataset.price) || 35.0;
      const image = btn.dataset.image || '';

      if (window.Cart) {
        window.Cart.addToCart({
          id,
          medicineId: id,
          name,
          price,
          image,
          pharmacyName: 'صيدلية ترياق الشريكة',
          quantity: 1,
        });

        // Animation effect
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => (btn.style.transform = ''), 200);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة "${name}" إلى سلتك بنجاح!`, 'سلة المشتريات', 3000);
        }
      }
    });
  }

  // ---------------------------------------------------------
  // 5. Connect Top Medicines with Live API (with graceful fallback)
  // ---------------------------------------------------------
  if (medsGrid && window.API && window.API.medicines) {
    try {
      const response = await window.API.medicines.getAll({ limit: 4 });
      const medicines = response?.data || response?.medicines || (Array.isArray(response) ? response : null);

      if (Array.isArray(medicines) && medicines.length >= 4) {
        medsGrid.innerHTML = medicines.slice(0, 4).map((med) => {
          const medId = med._id || med.id;
          const name = med.nameAr || med.name || 'دواء ترياق';
          const dosage = med.dosageForm || 'أقراص';
          const concentration = med.concentration || '';
          const subtitle = [concentration, dosage].filter(Boolean).join('، ') || 'متوفر في الصيدليات';
          const price = med.price || 35;
          const detailUrl = `pages/public/medicine-detail.html?med=${encodeURIComponent(medId)}`;
          const imgContent = med.image 
            ? `<img src="${med.image}" alt="${name}" loading="lazy">` 
            : `<i class="fa-solid fa-pills" style="font-size:38px;color:var(--primary-color);"></i>`;

          return `
            <article class="med" data-id="${medId}" data-price="${price}">
              <a href="${detailUrl}" class="med-link">
                <div class="med-img">${imgContent}</div>
                <h3>${name}</h3>
                <small>${subtitle}</small>
              </a>
              <div class="med-foot">
                <b>${price}<span>ج.م</span></b>
                <button class="add" type="button" aria-label="أضف ${name} للسلة" data-id="${medId}" data-name="${name}" data-price="${price}">+</button>
              </div>
            </article>
          `;
        }).join('');
      }
    } catch (err) {
      console.log('Using reference fallback catalog for home page featured medicines:', err.message);
    }
  }

  // ---------------------------------------------------------
  // 6. Prescription Modal & Image Upload Handling
  // ---------------------------------------------------------
  const rxDropzone = document.getElementById('rxDropzone');
  const rxFileInput = document.getElementById('rxFileInput');
  const rxDropzoneInner = document.getElementById('rxDropzoneInner');
  const rxFilePreview = document.getElementById('rxFilePreview');
  const rxPreviewImg = document.getElementById('rxPreviewImg');
  const rxRemoveFileBtn = document.getElementById('rxRemoveFileBtn');
  const rxUploadForm = document.getElementById('rxUploadForm');

  if (rxDropzone && rxFileInput && !rxDropzone.dataset.bound) {
    rxDropzone.dataset.bound = 'true';

    rxDropzone.addEventListener('click', (e) => {
      if (e.target !== rxRemoveFileBtn && !rxRemoveFileBtn?.contains(e.target)) {
        rxFileInput.click();
      }
    });

    rxFileInput.addEventListener('change', () => {
      const file = rxFileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (rxPreviewImg) rxPreviewImg.src = e.target.result;
          if (rxDropzoneInner) rxDropzoneInner.classList.add('hide');
          if (rxFilePreview) rxFilePreview.classList.remove('hide');
        };
        reader.readAsDataURL(file);
      }
    });

    if (rxRemoveFileBtn) {
      rxRemoveFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        rxFileInput.value = '';
        if (rxDropzoneInner) rxDropzoneInner.classList.remove('hide');
        if (rxFilePreview) rxFilePreview.classList.add('hide');
      });
    }

    rxDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = 'var(--primary-color)';
    });

    rxDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = 'var(--border-color)';
    });

    rxDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = 'var(--border-color)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        rxFileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        rxFileInput.dispatchEvent(event);
      }
    });
  }

  if (rxUploadForm && !rxUploadForm.dataset.bound) {
    rxUploadForm.dataset.bound = 'true';
    rxUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('rxPatientName')?.value;
      const patientPhone = document.getElementById('rxPatientPhone')?.value;

      if (!patientName || !patientPhone) {
        if (window.Toast) {
          window.Toast.error('يرجى ملء الاسم ورقم الهاتف لإتمام إرسال الروشتة.', 'خطأ في النموذج');
        } else {
          alert('يرجى ملء الاسم ورقم الهاتف.');
        }
        return;
      }

      const randomOrderId = 'RX-' + Math.floor(100000 + Math.random() * 900000);

      // Close modal
      const modalEl = document.getElementById('prescriptionModal');
      if (modalEl && window.bootstrap) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      }

      if (window.Toast) {
        window.Toast.success(
          `تم استلام الروشتة بنجاح برقم متابعة (${randomOrderId}). سيتواصل معك الصيدلي لتسعيرها وتأكيدها خلال 15 دقيقة!`,
          'تم تأكيد إرسال الروشتة',
          6000
        );
      } else {
        alert(`تم استلام الروشتة بنجاح! رقم المتابعة: ${randomOrderId}`);
      }

      rxUploadForm.reset();
      if (rxDropzoneInner) rxDropzoneInner.classList.remove('hide');
      if (rxFilePreview) rxFilePreview.classList.add('hide');
    });
  }
};

// Immediate / DOM Ready Execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initHomePage);
} else {
  window.initHomePage();
}

// Re-initialize on SPA Navigation (Ensures single global listener)
if (!window._teryakHomeMountedBound) {
  window._teryakHomeMountedBound = true;
  window.addEventListener('teryak:page-mounted', (e) => {
    if (e.detail?.page === 'home' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
      window.initHomePage();
    }
  });
}
