/**
 * Teryak Platform - Admin Medicines Management Logic
 * Connected with Backend API (/api/medicines) & Bulk Import/Export
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // 1. Mobile Sidebar Toggle
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

  // 2. DOM Elements
  const medSearchInput = document.getElementById('medicineSearchInput');
  const medList = document.getElementById('medicinesList');
  const openMedModalBtn = document.getElementById('openAddMedicineModalBtn');
  const closeMedModalBtn = document.getElementById('closeAddMedModalBtn');
  const cancelMedModalBtn = document.getElementById('cancelMedModalBtn');
  const medModal = document.getElementById('addMedicineModal');
  const addMedForm = document.getElementById('addMedicineForm');

  const openBulkBtn = document.getElementById('openBulkImportModalBtn');
  const exportBtn = document.getElementById('exportMedicinesBtn');

  let currentMedicines = [];

  // 3. Fallback Initial Catalog
  const defaultMedicines = [
    {
      _id: 'med_1',
      nameAr: 'باراسيتامول 500 مجم',
      nameEn: 'Paracetamol',
      category: 'مسكنات',
      price: 24.50,
      status: 'active',
      pharmaciesCount: 48,
      image: '../../assets/images/parst.jpg',
    },
    {
      _id: 'med_2',
      nameAr: 'أموكسيسيلين 500 مجم',
      nameEn: 'Amoxicillin',
      category: 'مضادات حيوية',
      price: 45.00,
      status: 'active',
      pharmaciesCount: 32,
      image: '../../assets/images/amoc.jpg',
    },
    {
      _id: 'med_3',
      nameAr: 'فيتامين د 1000 وحدة',
      nameEn: 'Vitamin D3',
      category: 'فيتامينات',
      price: 25.00,
      status: 'active',
      pharmaciesCount: 55,
      image: '../../assets/images/vitamine.jpg',
    },
  ];

  // 4. Load Medicines from API
  async function loadMedicines() {
    let items = [];

    try {
      if (window.API && window.API.medicines) {
        const res = await window.API.medicines.getAll({ limit: 100 });
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(m => ({
            _id: m._id,
            nameAr: m.nameAr,
            nameEn: m.nameEn || m.nameAr,
            category: m.category || 'أدوية عامة',
            price: m.price || 25,
            status: m.status || 'active',
            pharmaciesCount: m.pharmaciesCount || 12,
            image: m.image || '../../assets/images/parst.jpg',
          }));
        }
      }
    } catch (e) {
      console.warn('[Admin Medicines API Fallback]:', e.message);
    }

    if (items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('admin_medicines_catalog'));
        items = local && local.length > 0 ? local : defaultMedicines;
      } catch (e) {
        items = defaultMedicines;
      }
    }

    currentMedicines = items;
    saveLocalMedicines();
    renderMedicines(currentMedicines);
  }

  function saveLocalMedicines() {
    try {
      localStorage.setItem('admin_medicines_catalog', JSON.stringify(currentMedicines));
    } catch (e) {}
  }

  // 5. Render Medicines List
  function renderMedicines(items) {
    if (!medList) return;

    if (items.length === 0) {
      medList.innerHTML = `
        <div class="text-center py-5 text-muted bg-white border rounded">
          <i class="fa-solid fa-pills fs-2 mb-2 text-muted"></i>
          <p class="font-bold mb-0">لا توجد أدوية مطابقة للبحث</p>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(med => {
      const statusText = med.status === 'active' || med.status === 'نشط' ? 'نشط' : 'قيد المراجعة';
      const statusClass = med.status === 'active' || med.status === 'نشط' ? 'status-active' : 'status-pending';
      const img = med.image || '../../assets/images/parst.jpg';

      html += `
        <div class="medicine-card" data-id="${med._id}">
          <div class="medicine-right">
            <div class="medicine-img-box colorful">
              <img src="${img}" alt="${med.nameAr}" class="medicine-image" onerror="this.src='../../assets/images/parst.jpg'">
            </div>
            <div class="medicine-details">
              <h3 class="medicine-name">${med.nameAr}</h3>
              <div class="medicine-subtext">
                <span class="eng-name">${med.nameEn}</span>
                <span class="dot">•</span>
                <span class="category-name">${med.category}</span>
                <span class="dot">•</span>
                <span class="pharmacy-count">${med.pharmaciesCount || 10} صيدلية</span>
                <span class="dot">•</span>
                <span class="fw-bold text-success">${Number(med.price || 25).toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
          
          <div class="medicine-left">
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف" data-id="${med._id}" data-name="${med.nameAr}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <a href="../public/medicine-detail.html?id=${med._id}" class="action-btn view-btn" title="معاينة الدواء">
                <i class="fa-solid fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    });

    medList.innerHTML = html;
    bindDeleteActions();
  }

  // Bind Delete Actions
  function bindDeleteActions() {
    medList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const medId = btn.dataset.id;
        const name = btn.dataset.name || 'الدواء';

        let confirmed = true;
        if (window.Toast && window.Toast.confirm) {
          confirmed = await window.Toast.confirm({
            title: 'حذف الدواء',
            message: `هل أنت متأكد من رغبتك في حذف (${name}) من الكتالوج العام نهائياً؟`,
            type: 'danger',
            confirmText: 'حذف',
            cancelText: 'إلغاء'
          });
        }

        if (confirmed) {
          try {
            if (window.API && window.API.medicines && medId && medId.length === 24) {
              await window.API.medicines.delete(medId);
            }
          } catch (err) {
            console.warn('API delete medicine fallback:', err.message);
          }

          currentMedicines = currentMedicines.filter(m => m._id !== medId);
          saveLocalMedicines();
          renderMedicines(currentMedicines);

          if (window.Toast) {
            window.Toast.success(`تم حذف (${name}) من الكتالوج بنجاح`, 'تم الحذف');
          }
        }
      });
    });
  }

  // 6. Search Filter
  if (medSearchInput) {
    medSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMedicines(currentMedicines);
        return;
      }
      const filtered = currentMedicines.filter(m => {
        return (
          m.nameAr.toLowerCase().includes(query) ||
          m.nameEn.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
        );
      });
      renderMedicines(filtered);
    });
  }

  // 7. Modal Handlers (Add Medicine)
  if (openMedModalBtn && medModal) {
    const openMedModal = () => {
      medModal.style.display = 'flex';
      medModal.classList.add('active');
    };
    const closeMedModal = () => {
      medModal.style.display = 'none';
      medModal.classList.remove('active');
    };

    openMedModalBtn.addEventListener('click', openMedModal);
    if (closeMedModalBtn) closeMedModalBtn.addEventListener('click', closeMedModal);
    if (cancelMedModalBtn) cancelMedModalBtn.addEventListener('click', closeMedModal);

    if (addMedForm) {
      addMedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mName = document.getElementById('newMedName')?.value.trim();
        const engName = document.getElementById('newMedEngName')?.value.trim() || mName;
        const category = document.getElementById('newMedCategory')?.value || 'عام';
        const price = Number(document.getElementById('newMedPrice')?.value) || 35.0;
        const dosageForm = document.getElementById('newMedDosageForm')?.value || 'أقراص';
        const status = document.getElementById('newMedStatus')?.value || 'active';

        if (!mName) {
          if (window.Toast) window.Toast.warning('يرجى كتابة اسم الدواء بالعربية', 'حقل مطلوب');
          return;
        }

        let newId = `med_${Date.now()}`;

        try {
          if (window.API && window.API.medicines) {
            const res = await window.API.medicines.create({
              nameAr: mName,
              nameEn: engName,
              category,
              price: price,
              dosageForm,
              status: status === 'قيد المراجعة' ? 'pending' : 'active',
            });
            if (res && res.data && res.data._id) {
              newId = res.data._id;
            }
          }
        } catch (err) {
          console.warn('API create medicine fallback:', err.message);
        }

        const newMed = {
          _id: newId,
          nameAr: mName,
          nameEn: engName,
          category,
          price: price,
          status: status === 'قيد المراجعة' ? 'pending' : 'active',
          pharmaciesCount: 1,
          image: '../../assets/images/parst.jpg',
        };

        currentMedicines.unshift(newMed);
        saveLocalMedicines();
        renderMedicines(currentMedicines);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة دواء (${mName}) للكتالوج بنجاح`, 'تمت الإضافة');
        }

        addMedForm.reset();
        closeMedModal();
      });
    }
  }

  // 8. Bulk Import System (Admin)
  if (openBulkBtn) {
    openBulkBtn.addEventListener('click', () => {
      const modalEl = document.getElementById('adminBulkImportModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    });

    let parsedAdminMeds = [];

    const dlTemplateBtn = document.getElementById('adminDownloadTemplateBtn');
    if (dlTemplateBtn) {
      dlTemplateBtn.addEventListener('click', () => {
        if (typeof XLSX !== 'undefined') {
          const data = [
            ['اسم الدواء / المنتج', 'الاسم الإنجليزي', 'نوع المنتج', 'الفئة', 'المادة الفعالة', 'السعر', 'رابط الصورة'],
            ['بانادول إكسترا أقراص', 'Panadol Extra', 'medicine', 'مسكنات', 'باراسيتامول + كافيين', 45.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
            ['أوجمنتين 1 جم أقراص', 'Augmentin 1g', 'medicine', 'مضادات حيوية', 'أموكسيسيلين + كلافولانات', 110.00, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'],
            ['سيروم سيرافي بحمض الهيالورونيك', 'CeraVe Hyaluronic Acid Serum', 'product', 'عناية بالبشرة', 'حمض الهيالورونيك + سيراميد', 380.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'],
            ['واقي شمس فيشي SPF50+', 'Vichy Capital Soleil SPF50+', 'product', 'واقي شمس وحماية', 'فلاتر حماية واسعة المدى', 420.00, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80']
          ];
          const ws = XLSX.utils.aoa_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'الكتالوج');
          XLSX.writeFile(wb, 'قالب_كتالوج_أدوية_ومنتجات_ترياق.xlsx');
        } else {
          const templateContent = 'اسم الدواء / المنتج,الاسم الإنجليزي,نوع المنتج,الفئة,المادة الفعالة,السعر,رابط الصورة\nبانادول إكسترا أقراص,Panadol Extra,medicine,مسكنات,باراسيتامول + كافيين,45.00,https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80\nسيروم سيرافي بحمض الهيالورونيك,CeraVe Hyaluronic Serum,product,عناية بالبشرة,حمض الهيالورونيك,380.00,https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
          const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'قالب_كتالوج_أدوية_ترياق.csv';
          link.click();
        }
      });
    }

    const adminFileInput = document.getElementById('adminCsvFileInput');
    const adminDropZone = document.getElementById('adminCsvDropZone');
    const adminDropZoneBrowse = document.getElementById('adminDropZoneBrowse');
    const adminDropZoneFileName = document.getElementById('adminDropZoneFileName');
    const adminTextInput = document.getElementById('adminCsvTextInput');
    const adminExecBtn = document.getElementById('adminExecuteImportBtn');

    function detectAdminColumns(headers) {
      const map = { nameAr: 0, nameEn: 1, productType: -1, category: 2, active: -1, price: 3, image: -1 };
      headers.forEach((h, idx) => {
        const c = String(h || '').toLowerCase().trim();
        if (c.includes('إنجليز') || c.includes('english') || c === 'nameen') map.nameEn = idx;
        else if (c.includes('اسم') || c.includes('دواء') || (c.includes('منتج') && !c.includes('نوع')) || c === 'name' || c === 'namear') map.nameAr = idx;
        else if (c.includes('نوع') || c.includes('type')) map.productType = idx;
        else if (c.includes('فئة') || c.includes('قسم') || c.includes('تصنيف') || c.includes('category')) map.category = idx;
        else if (c.includes('مادة') || c.includes('فعالة') || c.includes('active') || c.includes('ingredient')) map.active = idx;
        else if (c.includes('سعر') || c.includes('price')) map.price = idx;
        else if (c.includes('صورة') || c.includes('صوره') || c.includes('رابط') || c.includes('image') || c.includes('img') || c.includes('url')) map.image = idx;
      });
      return map;
    }

    function processAdminFile(file) {
      if (!file) return;
      const maxSize = 8 * 1024 * 1024;
      if (file.size > maxSize) {
        if (window.Toast) window.Toast.error('حجم الملف يتجاوز 8 ميجابايت', 'ملف كبير جداً');
        return;
      }
      if (adminDropZoneFileName) {
        adminDropZoneFileName.textContent = `✓ تم اختيار: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        adminDropZoneFileName.style.display = 'block';
      }
      if (adminDropZone) {
        adminDropZone.style.borderColor = '#198754';
        adminDropZone.style.background = '#f0fff4';
      }

      const ext = file.name.split('.').pop().toLowerCase();
      const isExcel = ext === 'xlsx' || ext === 'xls';

      if (isExcel) {
        if (typeof XLSX === 'undefined') {
          if (window.Toast) window.Toast.error('مكتبة Excel غير محملة، يرجى استخدام ملف CSV', 'خطأ');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (!rows || rows.length === 0) return;
            const firstRow = rows[0] || [];
            const isHeader = firstRow.some(c => String(c).includes('اسم') || String(c).toLowerCase().includes('name'));
            const colMap = isHeader ? detectAdminColumns(firstRow) : { nameAr: 0, nameEn: 1, productType: -1, category: 2, active: -1, price: 3, image: -1 };
            const startIdx = isHeader ? 1 : 0;

            parsedAdminMeds = [];
            const previewLines = [];

            for (let i = startIdx; i < rows.length; i++) {
              const row = rows[i];
              const nameAr = String(row[colMap.nameAr] || '').trim();
              if (!nameAr) continue;

              const nameEn = colMap.nameEn !== -1 ? String(row[colMap.nameEn] || '').trim() : '';
              const cat = colMap.category !== -1 ? String(row[colMap.category] || '').trim() : 'أدوية عامة';
              const rawType = colMap.productType !== -1 ? String(row[colMap.productType] || '').trim().toLowerCase() : '';
              const productType = rawType.includes('product') || rawType.includes('منتج') || cat.includes('تجميل') || cat.includes('عناية') ? 'product' : 'medicine';
              const active = colMap.active !== -1 ? String(row[colMap.active] || '').trim() : '';
              const price = Number(String(row[colMap.price] || '').replace(/[^\d.]/g, '')) || 35.0;
              const image = colMap.image !== -1 ? String(row[colMap.image] || '').trim() : '';

              parsedAdminMeds.push({
                nameAr,
                nameEn: nameEn || nameAr,
                productType,
                category: cat,
                activeIngredient: active,
                price,
                image
              });

              previewLines.push(`${nameAr},${nameEn || nameAr},${cat},${price}${image ? ',' + image : ''}`);
            }

            if (adminTextInput) adminTextInput.value = previewLines.join('\n');
            if (window.Toast) window.Toast.success(`تم استخراج ${parsedAdminMeds.length} صنف من شيت Excel بنجاح`, 'تم تحليل الملف');
          } catch (err) {
            console.error('Admin Excel parse error:', err);
            if (window.Toast) window.Toast.error('تعذر قراءة ملف Excel: ' + err.message, 'خطأ في القراءة');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // CSV
        const reader = new FileReader();
        reader.onload = (event) => {
          if (adminTextInput) adminTextInput.value = event.target.result;
          parsedAdminMeds = [];
          if (window.Toast) {
            const lines = event.target.result.split(/\r?\n/).filter(l => l.trim() && !l.includes('اسم') && !l.toLowerCase().includes('name'));
            window.Toast.success(`تم قراءة الملف: حوالي ${lines.length} صنف`, 'تم التحميل');
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
    }

    if (adminFileInput && adminDropZone) {
      adminDropZone.addEventListener('click', () => adminFileInput.click());
      if (adminDropZoneBrowse) {
        adminDropZoneBrowse.addEventListener('click', (e) => {
          e.stopPropagation();
          adminFileInput.click();
        });
      }
      adminFileInput.addEventListener('change', (e) => {
        processAdminFile(e.target.files[0]);
      });
      adminDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        adminDropZone.style.background = '#dbeaff';
        adminDropZone.style.borderColor = '#0d6efd';
      });
      adminDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!adminDropZoneFileName || !adminDropZoneFileName.textContent) {
          adminDropZone.style.background = '#f0fff4';
          adminDropZone.style.borderColor = '#198754';
        }
      });
      adminDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) processAdminFile(file);
      });
    }

    if (adminExecBtn && adminTextInput) {
      adminExecBtn.addEventListener('click', async () => {
        let medsToImport = [];

        if (parsedAdminMeds.length > 0) {
          medsToImport = parsedAdminMeds;
        } else {
          const raw = adminTextInput.value.trim();
          if (!raw) {
            if (window.Toast) window.Toast.warning('يرجى اختيار ملف أو لصق بيانات الكتالوج', 'لا توجد بيانات');
            return;
          }
          const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
          const startIndex = (lines[0] && (lines[0].includes('اسم') || lines[0].toLowerCase().includes('name'))) ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
            const p = lines[i].split(',').map(x => x.trim());
            if (p[0]) {
              const cat = p[2] || 'أدوية عامة';
              const isProd = cat.includes('تجميل') || cat.includes('عناية') || cat.includes('بشرة') || cat.includes('شعر');
              medsToImport.push({
                nameAr: p[0],
                nameEn: p[1] || p[0],
                category: cat,
                productType: isProd ? 'product' : 'medicine',
                price: Number(p[3]) || 35.0,
                image: p[4] || ''
              });
            }
          }
        }

        if (medsToImport.length === 0) {
          if (window.Toast) window.Toast.warning('لم يتم العثور على أدوية أو منتجات صالحة', 'خطأ في التنسيق');
          return;
        }

        adminExecBtn.disabled = true;
        adminExecBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري استيراد المنتجات...';

        try {
          if (window.API && window.API.medicines) {
            await window.API.medicines.bulkImport(medsToImport);
          }
        } catch (err) {
          console.warn('Admin Bulk import API fallback:', err.message);
        }

        medsToImport.forEach(item => {
          const existing = currentMedicines.find(m => m.nameAr === item.nameAr);
          if (existing) {
            existing.price = item.price;
            existing.category = item.category;
            if (item.image) existing.image = item.image;
            if (item.productType) existing.productType = item.productType;
          } else {
            currentMedicines.unshift({
              _id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              nameAr: item.nameAr,
              nameEn: item.nameEn,
              category: item.category,
              productType: item.productType || 'medicine',
              price: item.price,
              status: 'active',
              pharmaciesCount: 5,
              image: item.image || '../../assets/images/tablets.jpg',
            });
          }
        });

        saveLocalMedicines();
        renderMedicines(currentMedicines);

        const modalEl = document.getElementById('adminBulkImportModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (window.Toast) {
          window.Toast.success(`تم استيراد ${medsToImport.length} صنف إلى الكتالوج بنجاح!`, 'تم الاستيراد');
        }

        adminExecBtn.disabled = false;
        adminExecBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> بدء الاستيراد للكتالوج';
      });
    }
  }

  // 9. Export Catalog
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!currentMedicines || currentMedicines.length === 0) {
        if (window.Toast) window.Toast.warning('الكتالوج فارغ حالياً لتصديره', 'تنبيه');
        return;
      }

      let csv = 'الاسم العربي,الاسم الإنجليزي,الفئة,السعر,الحالة\n';
      currentMedicines.forEach(m => {
        csv += `"${m.nameAr}","${m.nameEn || ''}","${m.category || ''}",${m.price || 25},"${m.status || 'active'}"\n`;
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `كتالوج_أدوية_ترياق_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      if (window.Toast) window.Toast.success('تم تصدير كتالوج الأدوية بصيغة CSV بنجاح', 'تصدير الكتالوج');
    });
  }

  // Load initial data
  loadMedicines();
});