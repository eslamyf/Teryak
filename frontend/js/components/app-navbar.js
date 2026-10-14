/**
 * Teryak Platform - Premium Reusable <app-navbar> Web Component
 * Features:
 * - Glassmorphic floating/sticky header with blur
 * - Live Authentication State & User Dropdown Menu with Role Badges
 * - Real-time Cart Badge Synchronization
 * - Theme Switcher (Dark/Light with smooth animations)
 * - Language Switcher
 * - Modern Mobile Offcanvas Drawer with User Dashboard shortcuts
 */

class AppNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initTheme();
    this.bindEvents();
    this.updateAuthState();
    this.updateCartCount();

    // Listen to global platform events
    window.addEventListener('teryak:auth-change', () => this.updateAuthState());
    window.addEventListener('teryak:cart-change', () => this.updateCartCount());
    window.addEventListener('teryak:theme-change', (e) => this.applyTheme(e.detail?.theme));
  }

  // Calculate relative root path dynamically based on page location
  getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/public/') || path.includes('/pages/pharmacist/') || path.includes('/pages/admin/')) {
      return '../../';
    } else if (path.includes('/pages/')) {
      return '../';
    } else {
      return './';
    }
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const segment = path.split('/').pop() || 'index.html';
    return segment;
  }

  initTheme() {
    const savedTheme = localStorage.getItem('teryak_theme') || localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(savedTheme, false);
  }

  applyTheme(theme, save = true) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }

    if (save) {
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Update icons
    const themeBtns = this.querySelectorAll('#themeToggleBtn, #mobileThemeToggleBtn');
    themeBtns.forEach((btn) => {
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun text-warning"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      btn.title = isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي';
    });
  }

  render() {
    const base = this.getBasePath();
    const current = this.getCurrentPage();

    const isHome = current === 'index.html' || current === 'home.html' || current === '';
    const isMedicines = current === 'medicines.html' || current === 'medicine.html' || current === 'medicine-detail.html';
    const isPharmacies = current === 'pharmacies.html';
    const isDonation = current === 'donation.html';
    const isAbout = current === 'about.html';

    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const donationUrl = base + 'pages/public/donation.html';
    const aboutUrl = base + 'pages/public/about.html';
    const loginUrl = base + 'pages/public/login.html';
    const registerUrl = base + 'pages/public/register.html';
    const logoImg = base + 'assets/images/logo.png';

    this.innerHTML = `
      <!-- Desktop Header -->
      <header class="header">
        <!-- Logo & Brand (Right side in RTL) -->
        <div class="leftofHeader">
          <a href="${homeUrl}" class="brand-link" title="منصة ترياق الطبية">
            <div class="logo-wrapper">
              <img class="logo" src="${logoImg}" alt="Teryak Logo">
            </div>
            <div class="brand-info">
              <h1 class="brand-title">تِـرْيَـاق</h1>
              <span class="brand-tagline">صيدليتك الذكية</span>
            </div>
          </a>
        </div>

        <!-- Navigation Links (Center in RTL) -->
        <nav class="centerofHeader">
          <ul class="nav-links-list">
            <li>
              <a href="${homeUrl}" class="nav-link-item ${isHome ? 'active' : ''}">
                <i class="fa-solid fa-house-medical nav-icon"></i>
                <span>الرئيسية</span>
              </a>
            </li>
            <li>
              <a href="${medicinesUrl}" class="nav-link-item ${isMedicines ? 'active' : ''}">
                <i class="fa-solid fa-pills nav-icon"></i>
                <span>الأدوية</span>
              </a>
            </li>
            <li>
              <a href="${pharmaciesUrl}" class="nav-link-item ${isPharmacies ? 'active' : ''}">
                <i class="fa-solid fa-hospital nav-icon"></i>
                <span>الصيدليات</span>
              </a>
            </li>
            <li>
              <a href="${donationUrl}" class="nav-link-item ${isDonation ? 'active' : ''}">
                <i class="fa-solid fa-hand-holding-heart nav-icon"></i>
                <span>التبرع والبدائل</span>
              </a>
            </li>
            <li>
              <a href="${aboutUrl}" class="nav-link-item ${isAbout ? 'active' : ''}">
                <i class="fa-solid fa-circle-info nav-icon"></i>
                <span>من نحن</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User & Utility Controls (Left side in RTL) -->
        <div class="rightofHeader">
          <!-- Prescription Fast Upload Trigger -->
          <button type="button" class="nav-rx-btn" id="navPrescriptionBtn" title="ارفع روشتتك الطبية فوراً">
            <i class="fa-solid fa-camera"></i>
            <span class="d-none d-xl-inline">ارفع روشتة</span>
          </button>

          <!-- Shopping Cart Pill Button -->
          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="fa-solid fa-cart-shopping icon"></i>
            <span id="count" class="cart-badge-pulse">0</span>
          </div>

          <!-- Utility Pill Buttons -->
          <button type="button" class="btn2 theme-toggle-btn" id="themeToggleBtn" title="تفعيل الوضع الليلي">
            <i class="fa-solid fa-moon"></i>
          </button>
          <button type="button" class="btn2 lang-toggle-btn" id="langToggleBtn" title="تغيير اللغة">AR</button>

          <!-- Logged-in User Section with Modern Dropdown -->
          <div class="auth-user-section hide" id="userAuthDisplay">
            <div class="user-dropdown-container" id="userDropdownContainer">
              <button class="user-profile-pill" id="userProfileBtn" type="button" title="خيارات الحساب">
                <div class="user-avatar-badge" id="IconWrapper">
                  <i class="fa-solid fa-user" id="Icon"></i>
                  <span class="online-indicator"></span>
                </div>
                <div class="user-details-mini d-none d-lg-flex">
                  <span class="nav-user-name" id="navUserName">المستخدم</span>
                  <span class="nav-user-role" id="navUserRole">مريض</span>
                </div>
                <i class="fa-solid fa-chevron-down dropdown-arrow-icon"></i>
              </button>

              <!-- Dropdown Menu -->
              <div class="user-dropdown-card hide" id="userDropdownCard">
                <div class="dropdown-user-header">
                  <div class="dropdown-avatar">
                    <i class="fa-solid fa-user-circle"></i>
                  </div>
                  <div class="dropdown-user-info">
                    <strong id="dropdownMenuUserName">حسابي</strong>
                    <small id="dropdownMenuUserEmail" class="text-muted">مستخدم ترياق</small>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-action-item" id="navDashboardLink">
                  <i class="fa-solid fa-gauge-high text-success"></i>
                  <span>لوحة التحكم الرئيسية</span>
                </a>
                <a href="${medicinesUrl}" class="dropdown-action-item">
                  <i class="fa-solid fa-bag-shopping text-primary"></i>
                  <span>حجز أدوية جديدة</span>
                </a>
                <a href="${donationUrl}" class="dropdown-action-item">
                  <i class="fa-solid fa-hand-holding-heart text-warning"></i>
                  <span>سجل التبرعات والاستبدال</span>
                </a>
                <div class="dropdown-divider"></div>
                <button type="button" class="dropdown-action-item text-danger logout-btn-item" id="Logout">
                  <i class="fa-solid fa-right-from-bracket"></i>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Guest Controls (When Not Logged In) -->
          <div class="auth-guest-section d-flex align-items-center gap-2" id="guestAuthDisplay">
            <a href="${loginUrl}" class="nav-signin-link" id="SignIn">
              <i class="fa-solid fa-arrow-right-to-bracket me-1"></i>
              <span>دخول</span>
            </a>
            <a href="${registerUrl}" class="btn-primary-action" id="SignUp">
              <i class="fa-solid fa-user-plus me-1"></i>
              <span>حساب جديد</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Mobile Responsive Header Bar -->
      <div class="btn-resp">
        <!-- Right (RTL Start): Brand Logo & Platform Title -->
        <div class="leftofHeaderRes">
          <a href="${homeUrl}" class="d-flex align-items-center gap-2 text-decoration-none">
            <img class="logo" src="${logoImg}" alt="Teryak Logo">
            <div class="d-flex flex-column">
              <h1 class="m-0 brand-title-mobile">تِـرْيَـاق</h1>
              <span class="brand-tagline-mobile">صيدليتك الذكية</span>
            </div>
          </a>
        </div>

        <!-- Left (RTL End): Actions & Hamburger Menu -->
        <div class="rightofHeaderResp">
          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="fa-solid fa-cart-shopping icon"></i>
            <span id="counter" class="cart-badge-pulse">0</span>
          </div>
          <button type="button" class="btn2 theme-toggle-btn" id="mobileThemeToggleBtn" title="الوضع الليلي">
            <i class="fa-solid fa-moon"></i>
          </button>
          <button type="button" class="btn2 lang-toggle-btn" id="mobileLangToggleBtn" title="تغيير اللغة">AR</button>
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="فتح القائمة">
            <i class="fa-solid fa-bars-staggered"></i>
          </button>
        </div>
      </div>

      <!-- Offcanvas Mobile Drawer -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header d-flex justify-content-between align-items-center border-bottom pb-3">
          <div class="d-flex align-items-center gap-2">
            <img src="${logoImg}" alt="Logo" style="height: 32px; width: auto;">
            <div>
              <h5 class="offcanvas-title font-bold text-success m-0" id="offcanvasNavbarLabel">تِـرْيَـاق</h5>
              <small class="text-muted">الرعاية الدوائية المتكاملة</small>
            </div>
          </div>
          <button type="button" class="btn-drawer-close" data-bs-dismiss="offcanvas" aria-label="إغلاق">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="offcanvas-body">
          <!-- Mobile User Profile Card if logged in -->
          <div id="mobileUserCard" class="mobile-user-card hide mb-3 p-3 rounded-3">
            <div class="d-flex align-items-center gap-3">
              <div class="mobile-avatar">
                <i class="fa-solid fa-user-circle fa-2x text-success"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="m-0 font-bold" id="mobileCardUserName">المستخدم</h6>
                <small class="badge bg-success-subtle text-success" id="mobileCardUserRole">مريض</small>
              </div>
            </div>
          </div>

          <ul class="list-unstyled d-flex flex-column gap-2 mb-4">
            <a href="${homeUrl}"><li class="${isHome ? 'active' : ''} p-2 rounded"><i class="fa-solid fa-house-medical me-2"></i> الرئيسية</li></a>
            <a href="${medicinesUrl}"><li class="${isMedicines ? 'active' : ''} p-2 rounded"><i class="fa-solid fa-pills me-2"></i> دليل الأدوية والبدائل</li></a>
            <a href="${pharmaciesUrl}"><li class="${isPharmacies ? 'active' : ''} p-2 rounded"><i class="fa-solid fa-hospital me-2"></i> الصيدليات المعتمدة</li></a>
            <a href="${donationUrl}"><li class="${isDonation ? 'active' : ''} p-2 rounded"><i class="fa-solid fa-hand-holding-heart me-2"></i> التبرع واستبدال الأدوية</li></a>
            <a href="${aboutUrl}"><li class="${isAbout ? 'active' : ''} p-2 rounded"><i class="fa-solid fa-circle-info me-2"></i> من نحن</li></a>
          </ul>

          <!-- Mobile Prescription CTA -->
          <div class="mobile-rx-box mb-4 p-3 rounded-3">
            <div class="d-flex align-items-center gap-2 mb-2 text-success font-bold">
              <i class="fa-solid fa-camera"></i>
              <span>ارفع روشتتك الطبية</span>
            </div>
            <p class="small text-muted mb-2">صوّر الروشتة وصيدليتنا هتجهزلك طلبك والبدائل فوراً.</p>
            <button class="btn btn-sm btn-outline-success w-100" id="mobilePrescriptionBtn">رفع الروشتة الآن</button>
          </div>

          <div class="bottom mt-auto">
            <div id="mobileGuestButtons" class="d-flex flex-column gap-2">
              <a href="${registerUrl}"><button class="btn btn-register w-100 font-bold"><i class="fa-solid fa-user-plus me-2"></i> إنشاء حساب جديد</button></a>
              <a href="${loginUrl}"><button class="btn btn-login w-100 font-bold"><i class="fa-solid fa-arrow-right-to-bracket me-2"></i> تسجيل الدخول</button></a>
            </div>
            <div id="mobileUserButtons" class="d-flex flex-column gap-2 hide">
              <button class="btn btn-success w-100 font-bold" id="mobileDashboardBtn"><i class="fa-solid fa-gauge-high me-2"></i> لوحة التحكم</button>
              <button class="btn btn-outline-danger w-100 font-bold" id="mobileLogoutBtn"><i class="fa-solid fa-right-from-bracket me-2"></i> تسجيل خروج</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const base = this.getBasePath();
    const logoutBtn = this.querySelector('#Logout');
    const mobileLogoutBtn = this.querySelector('#mobileLogoutBtn');
    const userProfileBtn = this.querySelector('#userProfileBtn');
    const userDropdownCard = this.querySelector('#userDropdownCard');
    const navDashboardLink = this.querySelector('#navDashboardLink');
    const mobileDashBtn = this.querySelector('#mobileDashboardBtn');
    const themeToggleBtn = this.querySelector('#themeToggleBtn');
    const mobileThemeToggleBtn = this.querySelector('#mobileThemeToggleBtn');
    const langToggleBtn = this.querySelector('#langToggleBtn');
    const mobileLangToggleBtn = this.querySelector('#mobileLangToggleBtn');
    const navPrescriptionBtn = this.querySelector('#navPrescriptionBtn');
    const mobilePrescriptionBtn = this.querySelector('#mobilePrescriptionBtn');

    const handleDashboardNav = (e) => {
      if (e) e.preventDefault();
      const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
      const userType = currentUser ? (currentUser.role || currentUser.userType) : localStorage.getItem('userType');

      if (userType === 'صيدلي' || userType === 'pharmacist') {
        window.location.href = base + 'pages/pharmacist/index.html';
      } else if (userType === 'إدارة' || userType === 'admin') {
        window.location.href = base + 'pages/admin/index.html';
      } else {
        window.location.href = base + 'pages/public/patient-dashboard.html';
      }
    };

    const handleLogout = (e) => {
      if (e) e.preventDefault();
      if (window.Auth) {
        window.Auth.logout(base + 'index.html');
      } else {
        localStorage.clear();
        window.location.href = base + 'index.html';
      }
    };

    const handleThemeToggle = (e) => {
      if (e) e.preventDefault();
      const isCurrentlyDark = document.body.classList.contains('dark-theme') || document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      this.applyTheme(newTheme, true);
      window.dispatchEvent(new CustomEvent('teryak:theme-change', { detail: { theme: newTheme } }));
    };

    const handleLangToggle = (e) => {
      if (e) e.preventDefault();
      if (window.Toast) {
        window.Toast.info('اللغة الحالية هي العربية (الافتراضية). دعم اللغات الإضافية قريباً!', 'لغة الواجهة', 3000);
      }
    };

    // Toggle user dropdown card
    if (userProfileBtn && userDropdownCard) {
      userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownCard.classList.toggle('hide');
      });

      document.addEventListener('click', (e) => {
        if (!userDropdownCard.contains(e.target) && !userProfileBtn.contains(e.target)) {
          userDropdownCard.classList.add('hide');
        }
      });
    }

    // Prescription fast trigger modal
    const openPrescriptionModal = (e) => {
      if (e) e.preventDefault();
      const rxModalEl = document.getElementById('prescriptionModal');
      if (rxModalEl && window.bootstrap) {
        const modal = new window.bootstrap.Modal(rxModalEl);
        modal.show();
      } else if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        const target = document.getElementById('prescriptionSection');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        window.location.href = base + 'index.html#prescriptionSection';
      }
    };

    if (navPrescriptionBtn) navPrescriptionBtn.addEventListener('click', openPrescriptionModal);
    if (mobilePrescriptionBtn) mobilePrescriptionBtn.addEventListener('click', openPrescriptionModal);

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    if (navDashboardLink) navDashboardLink.addEventListener('click', handleDashboardNav);
    if (mobileDashBtn) mobileDashBtn.addEventListener('click', handleDashboardNav);
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);
    if (langToggleBtn) langToggleBtn.addEventListener('click', handleLangToggle);
    if (mobileLangToggleBtn) mobileLangToggleBtn.addEventListener('click', handleLangToggle);
  }

  updateAuthState() {
    const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('haveAcount') === 'true');
    const userAuthDisplay = this.querySelector('#userAuthDisplay');
    const guestAuthDisplay = this.querySelector('#guestAuthDisplay');
    const mobileGuestButtons = this.querySelector('#mobileGuestButtons');
    const mobileUserButtons = this.querySelector('#mobileUserButtons');
    const mobileUserCard = this.querySelector('#mobileUserCard');

    if (isLoggedIn) {
      if (userAuthDisplay) userAuthDisplay.classList.remove('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.add('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.add('hide');
      if (mobileUserButtons) mobileUserButtons.classList.remove('hide');
      if (mobileUserCard) mobileUserCard.classList.remove('hide');

      // Populate user info
      const user = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userName = (user && (user.name || user.fullName || user.username)) || 'مستخدم ترياق';
      const userEmail = (user && user.email) || 'user@teryak.com';
      const role = (user && (user.role || user.userType)) || localStorage.getItem('userType') || 'مريض';

      const roleLabels = {
        'patient': 'مريض',
        'مريض': 'مريض',
        'pharmacist': 'صيدلي',
        'صيدلي': 'صيدلي',
        'admin': 'مسؤول',
        'إدارة': 'مسؤول'
      };
      const displayRole = roleLabels[role] || role;

      const navUserNameEl = this.querySelector('#navUserName');
      const navUserRoleEl = this.querySelector('#navUserRole');
      const menuUserNameEl = this.querySelector('#dropdownMenuUserName');
      const menuUserEmailEl = this.querySelector('#dropdownMenuUserEmail');
      const mobileCardUserNameEl = this.querySelector('#mobileCardUserName');
      const mobileCardUserRoleEl = this.querySelector('#mobileCardUserRole');

      if (navUserNameEl) navUserNameEl.textContent = userName;
      if (navUserRoleEl) navUserRoleEl.textContent = displayRole;
      if (menuUserNameEl) menuUserNameEl.textContent = userName;
      if (menuUserEmailEl) menuUserEmailEl.textContent = userEmail;
      if (mobileCardUserNameEl) mobileCardUserNameEl.textContent = userName;
      if (mobileCardUserRoleEl) mobileCardUserRoleEl.textContent = displayRole;
    } else {
      if (userAuthDisplay) userAuthDisplay.classList.add('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.remove('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.remove('hide');
      if (mobileUserButtons) mobileUserButtons.classList.add('hide');
      if (mobileUserCard) mobileUserCard.classList.add('hide');
    }
  }

  updateCartCount() {
    const count = window.Cart ? window.Cart.getCount() : 0;
    const countEl = this.querySelector('#count');
    const counterEl = this.querySelector('#counter');
    if (countEl) countEl.textContent = count;
    if (counterEl) counterEl.textContent = count;
  }
}

customElements.define('app-navbar', AppNavbar);
