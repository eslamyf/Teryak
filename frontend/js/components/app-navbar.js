/**
 * Teryak Platform - Reusable <app-navbar> Web Component
 */

class AppNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.updateAuthState();
    this.updateCartCount();

    // Listen to global events
    window.addEventListener('teryak:auth-change', () => this.updateAuthState());
    window.addEventListener('teryak:cart-change', () => this.updateCartCount());
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
        <div class="leftofHeader">
          <a href="${homeUrl}">
            <img class="logo" src="${logoImg}" alt="Teryak Logo">
            <h1>تـريـاق</h1>
          </a>
        </div>

        <nav class="centerofHeader">
          <ul>
            <li><a href="${homeUrl}" class="${isHome ? 'active' : ''}">الرئيسية</a></li>
            <li><a href="${medicinesUrl}" class="${isMedicines ? 'active' : ''}">الأدوية</a></li>
            <li><a href="${pharmaciesUrl}" class="${isPharmacies ? 'active' : ''}">الصيدليات</a></li>
            <li><a href="${donationUrl}" class="${isDonation ? 'active' : ''}">التبرع</a></li>
            <li><a href="${aboutUrl}" class="${isAbout ? 'active' : ''}">من نحن</a></li>
          </ul>
        </nav>

        <div class="rightofHeader">
          <!-- Logged-in User Controls -->
          <div class="auth-user-section hide" id="userAuthDisplay">
            <button class="btn btn-sm" id="Logout">تسجيل خروج</button>
            <i class="bi bi-person-circle" id="Icon" title="الملف الشخصي / لوحة التحكم"></i>
          </div>

          <!-- Guest Controls -->
          <div class="auth-guest-section d-flex align-items-center gap-2" id="guestAuthDisplay">
            <a href="${registerUrl}" class="btn-primary-action" id="SignUp">إنشاء حساب</a>
            <a href="${loginUrl}" class="span" id="SignIn">تسجيل الدخول</a>
          </div>

          <button class="btn2" id="langToggleBtn" title="تغيير اللغة">AR</button>
          <button class="btn2" id="themeToggleBtn" title="الوضع الليلي"><i class="bi bi-moon-stars"></i></button>

          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="bi bi-cart-plus icon"></i>
            <span id="count">0</span>
          </div>
        </div>
      </header>

      <!-- Mobile Responsive Header Bar -->
      <div class="btn-resp">
        <!-- Right (RTL Start): Brand Logo & Platform Title -->
        <div class="leftofHeaderRes">
          <a href="${homeUrl}">
            <img class="logo" src="${logoImg}" alt="Teryak Logo">
            <h1>تـريـاق</h1>
          </a>
        </div>

        <!-- Left (RTL End): Actions & Hamburger Menu -->
        <div class="rightofHeaderResp">
          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="bi bi-cart-plus icon"></i>
            <span id="counter">0</span>
          </div>
          <button class="btn2" id="mobileThemeToggleBtn" title="الوضع الليلي"><i class="bi bi-moon-stars"></i></button>
          <button class="btn2" id="mobileLangToggleBtn" title="تغيير اللغة">AR</button>
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
            <i class="bi bi-list"></i>
          </button>
        </div>
      </div>

      <!-- Offcanvas Mobile Drawer -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header d-flex justify-content-between align-items-center border-bottom pb-3">
          <h5 class="offcanvas-title font-bold text-success" id="offcanvasNavbarLabel">قائمة ترياق</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul>
            <a href="${homeUrl}"><li class="${isHome ? 'active' : ''}">الرئيسية</li></a>
            <a href="${medicinesUrl}"><li class="${isMedicines ? 'active' : ''}">الأدوية</li></a>
            <a href="${pharmaciesUrl}"><li class="${isPharmacies ? 'active' : ''}">الصيدليات</li></a>
            <a href="${donationUrl}"><li class="${isDonation ? 'active' : ''}">التبرع</li></a>
            <a href="${aboutUrl}"><li class="${isAbout ? 'active' : ''}">من نحن</li></a>
          </ul>

          <div class="bottom mt-auto">
            <div id="mobileGuestButtons" class="d-flex flex-column gap-2">
              <a href="${registerUrl}"><button class="btn btn-register">إنشاء حساب</button></a>
              <a href="${loginUrl}"><button class="btn btn-login">تسجيل الدخول</button></a>
            </div>
            <div id="mobileUserButtons" class="d-flex flex-column gap-2 hide">
              <button class="btn btn-success" id="mobileDashboardBtn"><i class="bi bi-speedometer2"></i> لوحة التحكم</button>
              <button class="btn btn-danger" id="mobileLogoutBtn"><i class="bi bi-box-arrow-right"></i> تسجيل خروج</button>
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
    const userIcon = this.querySelector('#Icon');
    const mobileDashBtn = this.querySelector('#mobileDashboardBtn');
    const themeToggleBtn = this.querySelector('#themeToggleBtn');
    const mobileThemeToggleBtn = this.querySelector('#mobileThemeToggleBtn');
    const langToggleBtn = this.querySelector('#langToggleBtn');
    const mobileLangToggleBtn = this.querySelector('#mobileLangToggleBtn');

    const handleDashboardNav = () => {
      const userType = window.Auth ? window.Auth.getUserType() : localStorage.getItem('userType');
      if (userType === 'صيدلي') {
        window.location.href = base + 'pages/pharmacist/index.html';
      } else if (userType === 'إدارة' || userType === 'admin') {
        window.location.href = base + 'pages/admin/index.html';
      } else {
        window.location.href = base + 'pages/public/patient-dashboard.html';
      }
    };

    const handleLogout = () => {
      if (window.Auth) {
        window.Auth.logout(base + 'index.html');
      } else {
        localStorage.clear();
        window.location.href = base + 'index.html';
      }
    };

    const handleThemeToggle = () => {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    if (userIcon) userIcon.addEventListener('click', handleDashboardNav);
    if (mobileDashBtn) mobileDashBtn.addEventListener('click', handleDashboardNav);
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);
    if (langToggleBtn) langToggleBtn.addEventListener('click', () => alert('اللغة الحالية: العربية'));
    if (mobileLangToggleBtn) mobileLangToggleBtn.addEventListener('click', () => alert('اللغة الحالية: العربية'));
  }

  updateAuthState() {
    const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('haveAcount') === 'true');
    const userAuthDisplay = this.querySelector('#userAuthDisplay');
    const guestAuthDisplay = this.querySelector('#guestAuthDisplay');
    const mobileGuestButtons = this.querySelector('#mobileGuestButtons');
    const mobileUserButtons = this.querySelector('#mobileUserButtons');

    if (isLoggedIn) {
      if (userAuthDisplay) userAuthDisplay.classList.remove('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.add('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.add('hide');
      if (mobileUserButtons) mobileUserButtons.classList.remove('hide');
    } else {
      if (userAuthDisplay) userAuthDisplay.classList.add('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.remove('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.remove('hide');
      if (mobileUserButtons) mobileUserButtons.classList.add('hide');
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
