/**
 * Teryak Platform - Unified <app-navbar> Web Component
 * Based on site.js, site.css, and PAGES-MIGRATION.md specifications
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
      <header class="hd">
        <div class="wrap hd-in">
          <!-- Logo & Tagline -->
          <a href="${homeUrl}" class="logo" title="تِرياق - صيدليتك الذكية">
            <img src="${logoImg}" alt="شعار تِرياق" style="height:36px;width:auto;object-fit:contain;">
            <div>
              <span>تِرياق</span>
              <small>صيدليتك الذكية</small>
            </div>
          </a>

          <!-- Navigation Links (5 links as specified in site.js) -->
          <nav class="links" id="links" aria-label="التنقل الرئيسي">
            <a href="${homeUrl}" class="${isHome ? 'on active' : ''}" ${isHome ? 'aria-current="page"' : ''}>الرئيسية</a>
            <a href="${medicinesUrl}" class="${isMedicines ? 'on active' : ''}" ${isMedicines ? 'aria-current="page"' : ''}>الأدوية</a>
            <a href="${pharmaciesUrl}" class="${isPharmacies ? 'on active' : ''}" ${isPharmacies ? 'aria-current="page"' : ''}>الصيدليات</a>
            <a href="${donationUrl}" class="${isDonation ? 'on active' : ''}" ${isDonation ? 'aria-current="page"' : ''}>التبرع والبدائل</a>
            <a href="${aboutUrl}" class="${isAbout ? 'on active' : ''}" ${isAbout ? 'aria-current="page"' : ''}>من نحن</a>
          </nav>

          <!-- Header Controls -->
          <div class="hd-end">
            <!-- Shopping Cart Trigger Button -->
            <button class="icon-btn" id="cartBtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" aria-label="السلة" title="سلة الطلبات">
              <svg class="i" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
                <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/>
              </svg>
              <i class="badge" id="count">0</i>
            </button>

            <!-- Theme Switcher (Dark / Light) -->
            <button class="icon-btn" id="themeToggleBtn" type="button" aria-label="تبديل الوضع الفاتح والغامق" title="تبديل الوضع">
              <svg class="i moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              <svg class="i sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            </button>

            <!-- Language Switcher -->
            <button class="icon-btn hide-sm" id="langToggleBtn" type="button" aria-label="اللغة" title="اللغة">AR</button>

            <!-- Upload Prescription Button -->
            <button class="btn btn-line hide-sm" id="navPrescriptionBtn" type="button">ارفع روشتة</button>

            <!-- Logged-in User Section with Dropdown -->
            <div class="user-auth-wrap" id="userAuthDisplay" style="display:none;position:relative;">
              <button class="user" id="userProfileBtn" type="button" title="خيارات الحساب">
                <div>
                  <span id="navUserName">المستخدم</span>
                  <small id="navUserRole">مريض</small>
                </div>
                <i>
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
                  </svg>
                </i>
              </button>

              <!-- Dropdown Card -->
              <div class="user-dropdown-card hide" id="userDropdownCard" style="position:absolute;top:calc(100% + 8px);inset-inline-end:0;min-width:210px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--border-radius-md);box-shadow:var(--shadow-md);padding:10px;z-index:1050;display:none;flex-direction:column;gap:6px;">
                <div style="padding:6px 10px;border-bottom:1px solid var(--border-color);margin-bottom:4px;">
                  <strong id="dropdownMenuUserName" style="display:block;font-size:14px;color:var(--text-main);">حسابي</strong>
                  <small id="dropdownMenuUserEmail" style="color:var(--text-muted);font-size:12px;">مستخدم ترياق</small>
                </div>
                <a href="#" id="navDashboardLink" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:var(--text-main);font-size:14px;text-decoration:none;"><i class="fa-solid fa-gauge-high" style="color:var(--primary-color);"></i> لوحة التحكم</a>
                <a href="${medicinesUrl}" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:var(--text-main);font-size:14px;text-decoration:none;"><i class="fa-solid fa-bag-shopping" style="color:var(--primary-color);"></i> حجز أدوية جديدة</a>
                <button type="button" id="Logout" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:#ef4444;font-size:14px;border:none;background:none;width:100%;text-align:start;cursor:pointer;"><i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج</button>
              </div>
            </div>

            <!-- Guest Section (Sign in / Sign up) -->
            <div class="guest-auth-wrap" id="guestAuthDisplay" style="display:flex;gap:8px;align-items:center;">
              <a href="${loginUrl}" class="btn btn-line" style="padding:8px 16px;font-size:14px;" id="SignIn">دخول</a>
              <a href="${registerUrl}" class="btn btn-brand hide-sm" style="padding:8px 16px;font-size:14px;" id="SignUp">حساب جديد</a>
            </div>

            <!-- Mobile Hamburger Menu Button -->
            <button class="icon-btn menu" id="menu" type="button" aria-label="القائمة" aria-expanded="false">
              <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  bindEvents() {
    const base = this.getBasePath();
    const logoutBtn = this.querySelector('#Logout');
    const userProfileBtn = this.querySelector('#userProfileBtn');
    const userDropdownCard = this.querySelector('#userDropdownCard');
    const navDashboardLink = this.querySelector('#navDashboardLink');
    const themeToggleBtn = this.querySelector('#themeToggleBtn');
    const langToggleBtn = this.querySelector('#langToggleBtn');
    const navPrescriptionBtn = this.querySelector('#navPrescriptionBtn');
    const menuBtn = this.querySelector('#menu');
    const linksNav = this.querySelector('#links');

    // Mobile Hamburger Menu Toggle
    if (menuBtn && linksNav) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = linksNav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!linksNav.contains(e.target) && !menuBtn.contains(e.target)) {
          linksNav.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

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
        const isHidden = userDropdownCard.style.display === 'none' || userDropdownCard.classList.contains('hide');
        userDropdownCard.style.display = isHidden ? 'flex' : 'none';
        userDropdownCard.classList.toggle('hide', !isHidden);
      });

      document.addEventListener('click', (e) => {
        if (!userDropdownCard.contains(e.target) && !userProfileBtn.contains(e.target)) {
          userDropdownCard.style.display = 'none';
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
      } else {
        window.location.href = base + 'index.html#prescriptionSection';
      }
    };

    if (navPrescriptionBtn) navPrescriptionBtn.addEventListener('click', openPrescriptionModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (navDashboardLink) navDashboardLink.addEventListener('click', handleDashboardNav);
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);
    if (langToggleBtn) langToggleBtn.addEventListener('click', handleLangToggle);
  }

  updateAuthState() {
    const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('haveAcount') === 'true');
    const userAuthDisplay = this.querySelector('#userAuthDisplay');
    const guestAuthDisplay = this.querySelector('#guestAuthDisplay');

    if (isLoggedIn) {
      if (userAuthDisplay) userAuthDisplay.style.display = 'block';
      if (guestAuthDisplay) guestAuthDisplay.style.display = 'none';

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

      if (navUserNameEl) navUserNameEl.textContent = userName;
      if (navUserRoleEl) navUserRoleEl.textContent = displayRole;
      if (menuUserNameEl) menuUserNameEl.textContent = userName;
      if (menuUserEmailEl) menuUserEmailEl.textContent = userEmail;
    } else {
      if (userAuthDisplay) userAuthDisplay.style.display = 'none';
      if (guestAuthDisplay) guestAuthDisplay.style.display = 'flex';
    }
  }

  updateCartCount() {
    const count = window.Cart ? window.Cart.getCount() : 0;
    const countEl = this.querySelector('#count');
    if (countEl) countEl.textContent = count;
  }
}

customElements.define('app-navbar', AppNavbar);
