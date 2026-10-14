/**
 * Teryak Platform - Unified <app-navbar> Web Component
 * Exactly identical to Home Page Navbar with zero extra elements
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

    // Explicitly guarantee moon/sun icon exclusivity
    const moon = this.querySelector('.moon');
    const sun = this.querySelector('.sun');
    if (moon) moon.style.display = isDark ? 'none' : 'block';
    if (sun) sun.style.display = isDark ? 'block' : 'none';

    if (save) {
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  render() {
    const base = this.getBasePath();
    const current = this.getCurrentPage();

    const isMedicines = current === 'medicines.html' || current === 'medicine.html' || current === 'medicine-detail.html';

    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmacistUrl = base + 'pages/public/register.html';
    const rxUrl = homeUrl + '#rx';
    const faqUrl = homeUrl + '#faq';
    const logoImg = base + 'assets/images/logo.png';

    this.innerHTML = `
      <header class="site-header">
        <div class="wrap" style="width:100%">
          <nav aria-label="التنقل الرئيسي">
            <!-- Brand Logo & Name (Right side in RTL) -->
            <a href="${homeUrl}" class="logo">
              <img src="${logoImg}" alt="شعار ترياق">
              <span>تِرياق</span>
            </a>

            <!-- Exactly 4 Nav Links identical to Home Page -->
            <div class="nav-links">
              <a href="${medicinesUrl}" class="${isMedicines ? 'active' : ''}">الأدوية</a>
              <a href="${rxUrl}">الروشتة</a>
              <a href="${faqUrl}">أسئلة</a>
              <a href="${pharmacistUrl}">للصيادلة</a>
            </div>

            <!-- Nav End (Cart, Theme, Auth) with zero extra buttons -->
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

              <!-- Login / Auth State Button -->
              <div id="navAuthContainer">
                <a href="#" class="login" id="navLoginBtn">دخول</a>
              </div>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  bindEvents() {
    const themeToggleBtn = this.querySelector('#themeToggleBtn');

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
  }

  updateAuthState() {
    const base = this.getBasePath();
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {}

    const isLoggedIn = (window.Auth && window.Auth.isLoggedIn()) || Boolean(token) || localStorage.getItem('isLoggedIn') === 'true';
    const container = this.querySelector('#navAuthContainer');
    if (!container) return;

    if (isLoggedIn && user) {
      const displayName = user.name ? user.name.split(' ')[0] : 'حسابي';
      const fullName = user.name || user.fullName || displayName;
      const role = user.role || user.userType || 'مريض';
      const roleLabel = (role === 'pharmacist' || role === 'صيدلي') ? 'صيدلي' : (role === 'admin' || role === 'إدارة') ? 'مسؤول' : 'مريض';
      let dashboardUrl = base + 'pages/public/patient-dashboard.html';
      if (role === 'pharmacist' || role === 'صيدلي') dashboardUrl = base + 'pages/pharmacist/index.html';
      else if (role === 'admin' || role === 'إدارة') dashboardUrl = base + 'pages/admin/index.html';

      container.innerHTML = `
        <div class="user-menu-wrap" id="userMenuWrap">
          <button type="button" class="user-menu-btn" id="userMenuBtn" aria-expanded="false" title="خيارات الحساب">
            <i class="fa-solid fa-user-circle user-icon"></i>
            <span>${displayName}</span>
            <i class="fa-solid fa-chevron-down chevron-icon"></i>
          </button>
          <div class="user-dropdown-card" id="userDropdownCard">
            <div class="user-dropdown-header">
              <strong>${fullName}</strong>
              <small>${roleLabel}</small>
            </div>
            <a href="${dashboardUrl}" class="user-dropdown-item">
              <i class="fa-solid fa-gauge-high" style="color:var(--primary-color);"></i>
              <span>لوحة التحكم</span>
            </a>
            <button type="button" class="user-dropdown-item logout-item" id="navLogoutBtn">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      `;

      const userMenuWrap = container.querySelector('#userMenuWrap');
      const userMenuBtn = container.querySelector('#userMenuBtn');
      const navLogoutBtn = container.querySelector('#navLogoutBtn');

      if (userMenuBtn && userMenuWrap) {
        userMenuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = userMenuWrap.classList.toggle('open');
          userMenuBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
          if (!userMenuWrap.contains(e.target)) {
            userMenuWrap.classList.remove('open');
            userMenuBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.Auth && typeof window.Auth.logout === 'function') {
            window.Auth.logout(base + 'index.html');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user');
            localStorage.setItem('isLoggedIn', 'false');
            window.dispatchEvent(new CustomEvent('teryak:auth-change'));
            window.location.href = base + 'index.html';
          }
        });
      }
    } else {
      container.innerHTML = `
        <a href="#" class="login" id="navLoginBtn">دخول</a>
      `;

      const loginBtn = container.querySelector('#navLoginBtn');
      if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isRegistered = localStorage.getItem('haveAcount') === 'true' || 
                               Boolean(localStorage.getItem('currentUser')) || 
                               Boolean(localStorage.getItem('user')) || 
                               Boolean(localStorage.getItem('token'));
          if (!isRegistered) {
            window.location.href = base + 'pages/public/register.html';
          } else {
            window.location.href = base + 'pages/public/login.html';
          }
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
