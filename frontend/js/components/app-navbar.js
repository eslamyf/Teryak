/**
 * Teryak Platform - Unified <app-navbar> Web Component
 * Matches the exact design and structure of the Home Page Navbar
 * Features:
 * - Brand Logo & Name
 * - Clean Navigation Links
 * - Cart Icon with Badge
 * - Theme Switcher (Light / Dark)
 * - "دخول" Button that routes to register form if not registered, or login form if registered
 * - User Menu dropdown when logged in
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

    const isMedicines = current === 'medicines.html' || current === 'medicine.html' || current === 'medicine-detail.html';
    const isPharmacies = current === 'pharmacies.html';
    const isAbout = current === 'about.html';

    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const aboutUrl = base + 'pages/public/about.html';
    const pharmacistUrl = base + 'pages/public/register.html';
    const rxUrl = homeUrl + '#rx';
    const faqUrl = homeUrl + '#faq';
    const logoImg = base + 'assets/images/logo.png';

    this.innerHTML = `
      <header class="site-header">
        <div class="wrap" style="width:100%;">
          <nav aria-label="التنقل الرئيسي">
            <!-- Brand Logo & Name (Right side in RTL) -->
            <a href="${homeUrl}" class="logo" title="تِرياق - الصفحة الرئيسية">
              <img src="${logoImg}" alt="شعار ترياق">
              <span>تِرياق</span>
            </a>

            <!-- Navigation Links (Center in RTL) -->
            <div class="nav-links" id="navLinks">
              <a href="${medicinesUrl}" class="${isMedicines ? 'active on' : ''}">الأدوية</a>
              <a href="${pharmaciesUrl}" class="${isPharmacies ? 'active on' : ''}">الصيدليات</a>
              <a href="${rxUrl}" id="navRxLink">الروشتة</a>
              <a href="${faqUrl}">أسئلة</a>
              <a href="${aboutUrl}" class="${isAbout ? 'active on' : ''}">من نحن</a>
              <a href="${pharmacistUrl}">للصيادلة</a>
            </div>

            <!-- Nav End Controls (Left side in RTL) -->
            <div class="nav-end">
              <!-- Shopping Cart Trigger Button -->
              <div class="cart-btn-wrap">
                <button class="icon-btn" id="navCartBtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" aria-label="عرض سلة المشتريات" title="سلة المشتريات">
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span class="cart-counter-badge" id="count">0</span>
                </button>
              </div>

              <!-- Dark/Light Theme Toggle Button -->
              <button class="icon-btn" id="themeToggleBtn" type="button" aria-label="تبديل الوضع الفاتح والغامق" title="تبديل الوضع">
                <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
                </svg>
                <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
                </svg>
              </button>

              <!-- Login / User Auth Button -->
              <div id="navAuthContainer">
                <a href="#" class="login" id="navLoginBtn">دخول</a>
              </div>

              <!-- Mobile Hamburger Menu Button -->
              <button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" type="button" aria-label="فتح القائمة" aria-expanded="false">
                <svg class="i" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  bindEvents() {
    const themeToggleBtn = this.querySelector('#themeToggleBtn');
    const mobileMenuBtn = this.querySelector('#mobileMenuBtn');
    const navLinks = this.querySelector('#navLinks');
    const navRxLink = this.querySelector('#navRxLink');

    // Theme Toggle Listener
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isCurrentlyDark = document.body.classList.contains('dark-theme') || document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        this.applyTheme(newTheme, true);
        window.dispatchEvent(new CustomEvent('teryak:theme-change', { detail: { theme: newTheme } }));
      });
    }

    // Mobile Hamburger Menu Listener
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          navLinks.classList.remove('open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Prescription fast trigger modal if available
    if (navRxLink) {
      navRxLink.addEventListener('click', (e) => {
        const rxModalEl = document.getElementById('prescriptionModal');
        if (rxModalEl && window.bootstrap) {
          e.preventDefault();
          const modal = new window.bootstrap.Modal(rxModalEl);
          modal.show();
        }
      });
    }
  }

  handleDashboardNav() {
    const base = this.getBasePath();
    const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userType = currentUser ? (currentUser.role || currentUser.userType) : localStorage.getItem('userType');

    if (userType === 'صيدلي' || userType === 'pharmacist') {
      window.location.href = base + 'pages/pharmacist/index.html';
    } else if (userType === 'إدارة' || userType === 'admin') {
      window.location.href = base + 'pages/admin/index.html';
    } else {
      window.location.href = base + 'pages/public/patient-dashboard.html';
    }
  }

  handleAuthAction() {
    const base = this.getBasePath();
    // Check if user is registered (has account in localStorage)
    const isRegistered = localStorage.getItem('haveAcount') === 'true' || 
                         Boolean(localStorage.getItem('currentUser')) || 
                         Boolean(localStorage.getItem('token'));

    if (!isRegistered) {
      // Not registered -> go to registration form
      window.location.href = base + 'pages/public/register.html';
    } else {
      // Already registered -> go to login form
      window.location.href = base + 'pages/public/login.html';
    }
  }

  updateAuthState() {
    const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : (localStorage.getItem('isLoggedIn') === 'true');
    const container = this.querySelector('#navAuthContainer');
    if (!container) return;

    if (isLoggedIn) {
      const user = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userName = (user && (user.name || user.fullName || user.username)) || 'حسابي';
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

      container.innerHTML = `
        <div class="user-menu-wrap" style="position:relative;">
          <button type="button" class="login" id="userProfileBtn" title="خيارات الحساب">
            <i class="fa-solid fa-user-circle" style="color:var(--primary-color);"></i>
            <span id="navUserName">${userName}</span>
            <i class="fa-solid fa-chevron-down" style="font-size:11px;margin-inline-start:4px;color:var(--text-muted);"></i>
          </button>
          <div class="user-dropdown-card hide" id="userDropdownCard" style="display:none;position:absolute;top:calc(100% + 8px);inset-inline-end:0;min-width:210px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--border-radius-md);box-shadow:var(--shadow-md);padding:10px;z-index:1050;flex-direction:column;gap:6px;">
            <div style="padding:6px 10px;border-bottom:1px solid var(--border-color);margin-bottom:4px;">
              <strong id="dropdownMenuUserName" style="display:block;font-size:14px;color:var(--text-main);">${userName}</strong>
              <small id="dropdownMenuUserRole" style="color:var(--primary-color);font-size:12px;">${displayRole}</small>
            </div>
            <a href="#" id="navDashboardLink" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:var(--text-main);font-size:14px;text-decoration:none;"><i class="fa-solid fa-gauge-high" style="color:var(--primary-color);"></i> لوحة التحكم</a>
            <a href="${this.getBasePath()}pages/public/medicines.html" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:var(--text-main);font-size:14px;text-decoration:none;"><i class="fa-solid fa-bag-shopping" style="color:var(--primary-color);"></i> الأدوية</a>
            <button type="button" id="Logout" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--border-radius-sm);color:#ef4444;font-size:14px;border:none;background:none;width:100%;text-align:start;cursor:pointer;"><i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج</button>
          </div>
        </div>
      `;

      // Bind dropdown toggle
      const profileBtn = container.querySelector('#userProfileBtn');
      const dropdownCard = container.querySelector('#userDropdownCard');
      const logoutBtn = container.querySelector('#Logout');
      const dashLink = container.querySelector('#navDashboardLink');

      if (profileBtn && dropdownCard) {
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = dropdownCard.style.display === 'none' || dropdownCard.classList.contains('hide');
          dropdownCard.style.display = isHidden ? 'flex' : 'none';
          dropdownCard.classList.toggle('hide', !isHidden);
        });

        document.addEventListener('click', (e) => {
          if (!dropdownCard.contains(e.target) && !profileBtn.contains(e.target)) {
            dropdownCard.style.display = 'none';
            dropdownCard.classList.add('hide');
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.Auth) {
            window.Auth.logout(this.getBasePath() + 'index.html');
          } else {
            localStorage.clear();
            window.location.href = this.getBasePath() + 'index.html';
          }
        });
      }

      if (dashLink) {
        dashLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleDashboardNav();
        });
      }
    } else {
      // User is not logged in: display "دخول" button
      container.innerHTML = `
        <a href="#" class="login" id="navLoginBtn">دخول</a>
      `;

      const loginBtn = container.querySelector('#navLoginBtn');
      if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleAuthAction();
        });
      }
    }
  }

  updateCartCount() {
    const count = window.Cart ? window.Cart.getCount() : 0;
    const badge = this.querySelector('#count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
}

customElements.define('app-navbar', AppNavbar);
