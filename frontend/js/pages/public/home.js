/**
 * Teryak Platform - High-Performance Home Page Logic & Interactive Features
 * Features:
 * - Smart Search with Live Autocomplete Suggestions
 * - Quick Trending Tag Search
 * - Featured Medicines Category Filtering
 * - Real-time "Add to Cart" synchronization with Cart Engine
 * - Interactive Medicine Alternatives Showcase Sandbox
 * - Prescription Fast Upload Modal & Drag-and-Drop Image Preview
 * - Back to Top Scroll Behavior
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // 1. Back to Top Arrow
  // ---------------------------------------------------------
  const arow = document.getElementById('arow');
  if (arow) {
    window.addEventListener('scroll', () => {
      if (window.scrollY >= 300) {
        arow.style.display = 'flex';
      } else {
        arow.style.display = 'none';
      }
    });

    arow.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ---------------------------------------------------------
  // 2. Hero Search & Autocomplete
  // ---------------------------------------------------------
  const searchInput = document.getElementById('heroSearchInput');
  const searchBtn = document.getElementById('heroSearchBtn');
  const suggestionsBox = document.getElementById('heroSuggestions');
  const suggestionsList = document.getElementById('suggestionsList');

  const popularMedicinesData = [
    { name: 'بانادول إكسترا أقراص', query: 'panadol', cat: 'مسكنات' },
    { name: 'أوجمنتين 1 جم أقراص', query: 'augmentin', cat: 'مضاد حيوي' },
    { name: 'كونجستال أقراص للبرد', query: 'congestal', cat: 'نزلات برد' },
    { name: 'فيتامين د3 كبسولات', query: 'vitamind', cat: 'فيتامينات' },
    { name: 'أوميجا 3 بلس كبسولات', query: 'omega3', cat: 'مكمل غذائي' },
    { name: 'كيتوفان 50 مجم مسكن', query: 'ketofan', cat: 'مسكنات' },
    { name: 'أسبرين بروتكت 100 مجم', query: 'aspirin', cat: 'صحة القلب' },
    { name: 'باراسيتامول 500 مجم', query: 'paracetamol', cat: 'خافض حرارة' },
    { name: 'هايبوتك 1 جم أقراص', query: 'hibiotic', cat: 'مضاد حيوي' },
    { name: 'أوميبرازول 20 مجم', query: 'omeprazole', cat: 'معدة وحموضة' }
  ];

  const executeSearch = (customQuery) => {
    const query = typeof customQuery === 'string' ? customQuery : (searchInput ? searchInput.value.trim() : '');
    if (query) {
      window.location.href = `pages/public/medicines.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `pages/public/medicines.html`;
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', () => executeSearch());
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSearch();
      }
    });

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim().toLowerCase();
      if (!val || val.length < 2) {
        if (suggestionsBox) suggestionsBox.classList.add('hide');
        return;
      }

      const matches = popularMedicinesData.filter(m => 
        m.name.toLowerCase().includes(val) || m.query.includes(val) || m.cat.includes(val)
      );

      if (matches.length > 0 && suggestionsList && suggestionsBox) {
        suggestionsList.innerHTML = matches.map(m => `
          <div class="suggestion-item" data-query="${m.name}">
            <span><i class="fa-solid fa-pills text-success me-2"></i> ${m.name}</span>
            <small class="badge bg-light text-muted">${m.cat}</small>
          </div>
        `).join('');

        suggestionsBox.classList.remove('hide');

        suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const q = item.getAttribute('data-query');
            searchInput.value = q;
            suggestionsBox.classList.add('hide');
            executeSearch(q);
          });
        });
      } else if (suggestionsBox) {
        suggestionsBox.classList.add('hide');
      }
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (suggestionsBox && !suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.classList.add('hide');
      }
    });
  }

  // ---------------------------------------------------------
  // 3. Trending Tags Click
  // ---------------------------------------------------------
  document.querySelectorAll('.trend-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (searchInput) searchInput.value = q;
      executeSearch(q);
    });
  });

  // ---------------------------------------------------------
  // 4. Featured Medicines Filter Tabs
  // ---------------------------------------------------------
  const filterTabs = document.querySelectorAll('#medFilterTabs .tab-btn');
  const medCards = document.querySelectorAll('#featuredMedicinesGrid .med-product-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCat = tab.getAttribute('data-category');
      medCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (targetCat === 'all' || cardCat === targetCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---------------------------------------------------------
  // 5. Quick Add to Cart
  // ---------------------------------------------------------
  document.querySelectorAll('.add-to-cart-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price')) || 0;
      const pharmacy = btn.getAttribute('data-pharmacy') || 'صيدلية ترياق الشريكة';

      if (window.Cart) {
        window.Cart.addToCart({
          id,
          medicineId: id,
          name,
          price,
          pharmacyName: pharmacy,
          quantity: 1
        });

        // Add bounce feedback to button
        btn.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => btn.classList.remove('animate__rubberBand'), 1000);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة "${name}" إلى سلتك بنجاح!`, 'سلة المشتريات', 3000);
        }
      } else {
        alert(`تمت إضافة ${name} إلى السلة!`);
      }
    });
  });

  // ---------------------------------------------------------
  // 6. Interactive Alternatives Engine Sandbox
  // ---------------------------------------------------------
  const altSelect = document.getElementById('altMedicineSelect');
  const origMedNameEl = document.getElementById('origMedName');
  const origMedActiveEl = document.getElementById('origMedActive');
  const altItemsListEl = document.getElementById('altItemsList');

  const alternativesDB = {
    augmentin: {
      name: 'أوجمنتين 1 جم أقراص (Augmentin)',
      active: 'أموكسيسيلين + حمض كلافولانيك (Amoxicillin + Clavulanic Acid)',
      origPrice: '99.00 ج.م',
      items: [
        { name: 'هايبوتك 1 جم (Hibiotic 1g)', price: '75.00 ج.م', save: 'توفير 24 ج.م', count: '9 صيدليات', medQuery: 'hibiotic' },
        { name: 'كلاموكس 1 جم (Klamox 1g)', price: '78.00 ج.م', save: 'توفير 21 ج.م', count: '6 صيدليات', medQuery: 'klamox' },
        { name: 'ميجاموكس 1 جم (Megamox 1g)', price: '80.00 ج.م', save: 'توفير 19 ج.م', count: '8 صيدليات', medQuery: 'megamox' }
      ]
    },
    panadol: {
      name: 'بانادول إكسترا أقراص (Panadol Extra)',
      active: 'باراسيتامول 500 مجم + كافيين 65 مجم',
      origPrice: '34.00 ج.م',
      items: [
        { name: 'بارامول إكسترا أقراص', price: '20.00 ج.م', save: 'توفير 14 ج.م', count: '14 صيدلية', medQuery: 'paramol' },
        { name: 'سيتال إكسترا أقراص', price: '22.00 ج.م', save: 'توفير 12 ج.م', count: '10 صيدليات', medQuery: 'cetal' },
        { name: 'أدول إكسترا 500 مجم', price: '26.00 ج.م', save: 'توفير 8 ج.م', count: '11 صيدلية', medQuery: 'adol' }
      ]
    },
    congestal: {
      name: 'كونجستال لنزلات البرد (Congestal)',
      active: 'باراسيتامول + كلورفينيرامين + سودوإيفيدرين',
      origPrice: '31.00 ج.م',
      items: [
        { name: '123 أقراص للبرد (One Two Three)', price: '24.00 ج.م', save: 'توفير 7 ج.م', count: '12 صيدلية', medQuery: '123' },
        { name: 'فلوستوب أقراص (Flustop)', price: '22.00 ج.م', save: 'توفير 9 ج.م', count: '8 صيدليات', medQuery: 'flustop' },
        { name: 'كومتركس أقراص (Comtrex)', price: '30.00 ج.م', save: 'توفير 1 ج.م', count: '9 صيدليات', medQuery: 'comtrex' }
      ]
    },
    ketofan: {
      name: 'كيتوفان 50 مجم كبسولات (Ketofan)',
      active: 'كيتوبروفين 50 مجم (Ketoprofen 50mg)',
      origPrice: '36.00 ج.م',
      items: [
        { name: 'توبفين 50 مجم (Topfen 50mg)', price: '22.00 ج.م', save: 'توفير 14 ج.م', count: '7 صيدليات', medQuery: 'topfen' },
        { name: 'بروفينيد 50 مجم (Profenid 50mg)', price: '28.00 ج.م', save: 'توفير 8 ج.م', count: '9 صيدليات', medQuery: 'profenid' },
        { name: 'كيتيور مسكن 50 مجم', price: '20.00 ج.م', save: 'توفير 16 ج.م', count: '6 صيدليات', medQuery: 'ketofan' }
      ]
    }
  };

  const updateAlternativesDisplay = (key) => {
    const data = alternativesDB[key];
    if (!data) return;

    if (origMedNameEl) origMedNameEl.textContent = data.name;
    if (origMedActiveEl) origMedActiveEl.innerHTML = `<i class="fa-solid fa-flask"></i> المادة الفعالة: ${data.active}`;

    const origPriceEl = document.querySelector('.alt-comparison-card .price-strike');
    if (origPriceEl) origPriceEl.textContent = data.origPrice;

    if (altItemsListEl) {
      altItemsListEl.innerHTML = data.items.map(item => `
        <div class="alt-item-row animate__animated animate__fadeIn">
          <div class="alt-item-info">
            <strong>${item.name}</strong>
            <span class="alt-match-badge"><i class="fa-solid fa-check-double"></i> 100% تطابق دوائي</span>
            <small class="text-muted d-block">متوفر في ${item.count} محيطة</small>
          </div>
          <div class="alt-item-pricing">
            <span class="alt-price">${item.price}</span>
            <span class="save-badge">${item.save}</span>
          </div>
          <a href="pages/public/medicine-detail.html?med=${item.medQuery}" class="btn btn-sm btn-outline-success font-bold">احجز البديل</a>
        </div>
      `).join('');
    }
  };

  if (altSelect) {
    altSelect.addEventListener('change', (e) => {
      updateAlternativesDisplay(e.target.value);
    });
  }

  // ---------------------------------------------------------
  // 7. Prescription Modal & Image Upload Handling
  // ---------------------------------------------------------
  const rxDropzone = document.getElementById('rxDropzone');
  const rxFileInput = document.getElementById('rxFileInput');
  const rxDropzoneInner = document.getElementById('rxDropzoneInner');
  const rxFilePreview = document.getElementById('rxFilePreview');
  const rxPreviewImg = document.getElementById('rxPreviewImg');
  const rxRemoveFileBtn = document.getElementById('rxRemoveFileBtn');
  const rxUploadForm = document.getElementById('rxUploadForm');

  if (rxDropzone && rxFileInput) {
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

    // Drag and drop handlers
    rxDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = '#008b5e';
    });

    rxDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = '#cbd5e1';
    });

    rxDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      rxDropzone.style.borderColor = '#cbd5e1';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        rxFileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        rxFileInput.dispatchEvent(event);
      }
    });
  }

  // Prescription Form Submit
  if (rxUploadForm) {
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

      // Success feedback
      if (window.Toast) {
        window.Toast.success(
          `تم استلام الروشتة بنجاح برقم متابعة (${randomOrderId}). سيتواصل معك الصيدلي لتأكيد الطلب خلال 10 دقائق!`,
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
});
