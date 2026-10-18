/**
 * Teryak Platform - Unified <app-navbar> Web Component
 * Features:
 * - Desktop horizontal navigation matching brand aesthetic
 * - Responsive 3-bars hamburger menu button for mobile/tablets
 * - Smooth, high-performance slide-in sidebar drawer (القائمة الجانبية)
 * - Dynamic authentication awareness for both navbar & drawer
 * - Real-time Cart badge counter & theme toggler synchronization
 * - Backdrop blur, accessibility attributes, body scroll lock & touch-friendly interactions
 */

class AppNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.ensureFavicon();
    this.initTheme();
    this.bindEvents();
    this.updateAuthState();
    this.updateCartCount();

    // Scroll listener for sticky / fixed header state
    this._scrollListener = () => this.handleScroll();
    window.addEventListener('scroll', this._scrollListener, { passive: true });
    this.handleScroll();

    // Listen to global platform events
    this._authListener = () => this.updateAuthState();
    this._cartListener = () => this.updateCartCount();
    this._themeListener = (e) => this.applyTheme(e.detail?.theme, false);
    this._keyListener = (e) => {
      if (e.key === 'Escape') this.closeDrawer();
    };

    window.addEventListener('teryak:auth-change', this._authListener);
    window.addEventListener('teryak:cart-change', this._cartListener);
    window.addEventListener('teryak:theme-change', this._themeListener);
    window.addEventListener('keydown', this._keyListener);
  }

  disconnectedCallback() {
    if (this._scrollListener) window.removeEventListener('scroll', this._scrollListener);
    if (this._authListener) window.removeEventListener('teryak:auth-change', this._authListener);
    if (this._cartListener) window.removeEventListener('teryak:cart-change', this._cartListener);
    if (this._themeListener) window.removeEventListener('teryak:theme-change', this._themeListener);
    if (this._keyListener) window.removeEventListener('keydown', this._keyListener);
    document.body.classList.remove('drawer-open');
  }

  handleScroll() {
    const header = this.querySelector('.site-header');
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
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

  ensureFavicon() {
    try {
      const base = this.getBasePath();
      const logoUrl = base + 'assets/images/logo.png';
      let iconLink = document.querySelector('link[rel~="icon"]');
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        iconLink.type = 'image/png';
        document.head.appendChild(iconLink);
      }
      iconLink.href = logoUrl;
    } catch (e) { }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('teryak_theme') || localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(savedTheme, false);
  }

  applyTheme(theme, save = true) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark-theme');
      document.documentElement.style.backgroundColor = '#0b1120';
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark-theme');
      if (document.body) {
        document.body.style.backgroundColor = '#0b1120';
        document.body.style.colorScheme = 'dark';
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark-theme');
      if (document.body) {
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.colorScheme = 'light';
      }
    }

    if (save) {
      try {
        localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) { }
    }

    // Explicitly guarantee moon/sun icon exclusivity in top navbar
    const moon = this.querySelector('.moon');
    const sun = this.querySelector('.sun');
    if (moon) moon.style.display = isDark ? 'none' : 'block';
    if (sun) sun.style.display = isDark ? 'block' : 'none';

    // Synchronize drawer theme widgets
    const drawerMoon = this.querySelector('.drawer-moon');
    const drawerSun = this.querySelector('.drawer-sun');
    const drawerText = this.querySelector('.drawer-theme-text');
    if (drawerMoon) drawerMoon.style.display = isDark ? 'none' : 'inline-block';
    if (drawerSun) drawerSun.style.display = isDark ? 'inline-block' : 'none';
    if (drawerText) drawerText.textContent = isDark ? 'الوضع الفاتح' : 'الوضع الليلي';

    if (save) {
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  openDrawer() {
    const drawer = this.querySelector('#mobileDrawer');
    const backdrop = this.querySelector('#sidebarBackdrop');
    const hamburger = this.querySelector('#navHamburgerBtn');
    if (drawer && backdrop) {
      drawer.classList.add('is-active');
      backdrop.classList.add('is-active');
      document.body.classList.add('drawer-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    }
  }

  closeDrawer() {
    const drawer = this.querySelector('#mobileDrawer');
    const backdrop = this.querySelector('#sidebarBackdrop');
    const hamburger = this.querySelector('#navHamburgerBtn');
    if (drawer && backdrop) {
      drawer.classList.remove('is-active');
      backdrop.classList.remove('is-active');
      document.body.classList.remove('drawer-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  render() {
    const base = this.getBasePath();
    const current = this.getCurrentPage();
    const path = window.location.pathname.replace(/\\/g, '/');

    const isRoot = !path.includes('/pages/');
    const isHome = isRoot && (current === 'index.html' || current === '' || current === '/');
    const isMedicines = current === 'medicines.html' || current === 'medicine.html' || current === 'medicine-detail.html';
    const isPharmacies = current === 'pharmacies.html';
    const isDonation = current === 'donation.html';
    const isAbout = current === 'about.html';
    const isPharmacist = path.includes('/pages/pharmacist/');
    const isRx = current === 'prescription.html' || current === 'rx.html';

    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const donationUrl = base + 'pages/public/donation.html';
    const aboutUrl = base + 'pages/public/about.html';
    const pharmacistUrl = base + 'pages/pharmacist/index.html';
    const loginUrl = base + 'pages/public/login.html';
    const rxUrl = base + 'pages/public/prescription.html';
    const faqUrl = isHome ? '#faq' : homeUrl + '#faq';
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

            <!-- Exactly 4 Nav Links identical to Home Page (Desktop) -->
            <div class="nav-links">
              <a href="${medicinesUrl}" class="${isMedicines ? 'active' : ''}">الأدوية</a>
              <a href="${rxUrl}" class="${isRx ? 'active' : ''}">الروشتة</a>
              <a href="${faqUrl}">أسئلة</a>
              <a href="${pharmacistUrl}" class="${isPharmacist ? 'active' : ''}">للصيادلة</a>
            </div>

            <!-- Nav End (Cart, Theme, Auth, Hamburger Menu) -->
            <div class="nav-end">
              <!-- Shopping Cart Trigger Button -->
              <div class="cart-btn-wrap">
                <button class="icon-btn" id="navCartBtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" aria-label="عرض سلة المشتريات" title="سلة المشتريات">
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span class="cart-counter-badge" id="count">0</span>
                </button>
              </div>

              <!-- Dark/Light Theme Toggle Button -->
              <button class="icon-btn" id="theme" type="button" aria-label="تبديل الوضع الفاتح والغامق" title="تبديل الوضع">
                <i class="fa-solid fa-moon moon"></i>
                <i class="fa-solid fa-sun sun"></i>
              </button>

              <!-- Login / Auth State Button (Desktop) -->
              <div id="navAuthContainer">
                <a href="${loginUrl}" class="login" id="navLoginBtn">دخول</a>
              </div>

              <!-- Hamburger 3-Bars Menu Button (Mobile & Tablet) -->
              <button class="icon-btn hamburger-btn" id="navHamburgerBtn" type="button" aria-label="فتح القائمة الجانبية" aria-expanded="false" aria-controls="mobileDrawer" title="القائمة الرئيسية">
                <i class="fa-solid fa-bars"></i>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <!-- Mobile Sidebar Backdrop Overlay -->
      <div class="sidebar-backdrop" id="sidebarBackdrop" aria-hidden="true"></div>

      <!-- Mobile Sidebar Drawer (القائمة الجانبية) -->
      <aside class="mobile-drawer" id="mobileDrawer" role="dialog" aria-modal="true" aria-label="القائمة الجانبية الرئيسية">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <a href="${homeUrl}" class="logo drawer-logo drawer-close-on-click">
            <img src="${logoImg}" alt="شعار ترياق">
            <span>تِرياق</span>
          </a>
          <button class="icon-btn drawer-close-btn" id="drawerCloseBtn" type="button" aria-label="إغلاق القائمة">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- User Authentication Section in Drawer -->
        <div class="drawer-user-section" id="drawerUserSection">
          <!-- Populated dynamically via updateAuthState() -->
        </div>

        <!-- Drawer Navigation Body -->
        <div class="drawer-body">
          <div class="drawer-section-title">التنقل السريع</div>
          <ul class="drawer-nav-list">
            <li>
              <a href="${homeUrl}" class="drawer-link ${isHome ? 'active' : ''}">
                <i class="fa-solid fa-house"></i>
                <span>الرئيسية</span>
              </a>
            </li>
            <li>
              <a href="${medicinesUrl}" class="drawer-link ${isMedicines ? 'active' : ''}">
                <i class="fa-solid fa-pills"></i>
                <span>دليل الأدوية</span>
              </a>
            </li>
            <li>
              <a href="${rxUrl}" class="drawer-link">
                <i class="fa-solid fa-file-prescription"></i>
                <span>طلب روشتة</span>
              </a>
            </li>
            <li>
              <a href="${pharmaciesUrl}" class="drawer-link ${isPharmacies ? 'active' : ''}">
                <i class="fa-solid fa-notes-medical"></i>
                <span>الصيدليات المعتمدة</span>
              </a>
            </li>
            <li>
              <a href="${donationUrl}" class="drawer-link ${isDonation ? 'active' : ''}">
                <i class="fa-solid fa-hand-holding-heart"></i>
                <span>التبرع بالأدوية</span>
              </a>
            </li>
            <li>
              <a href="${faqUrl}" class="drawer-link">
                <i class="fa-solid fa-circle-question"></i>
                <span>الأسئلة الشائعة</span>
              </a>
            </li>
            <li>
              <a href="${aboutUrl}" class="drawer-link ${isAbout ? 'active' : ''}">
                <i class="fa-solid fa-circle-info"></i>
                <span>عن منصة تِرياق</span>
              </a>
            </li>
          </ul>

          <div class="drawer-divider"></div>

          <div class="drawer-section-title">للشركاء والصيادلة</div>
          <ul class="drawer-nav-list">
            <li>
              <a href="${pharmacistUrl}" class="drawer-link partner-link ${isPharmacist ? 'active' : ''}">
                <i class="fa-solid fa-prescription-bottle-medical"></i>
                <span>بوابة الصيادلة ولوحة التحكم</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Drawer Footer with Theme & Quick Actions -->
        <div class="drawer-footer">
          <div class="drawer-actions">
            <!-- Theme Toggle Inside Drawer -->
            <button class="drawer-action-btn" id="drawerThemeBtn" type="button" aria-label="تبديل الوضع">
              <i class="fa-solid fa-moon drawer-moon"></i>
              <i class="fa-solid fa-sun drawer-sun"></i>
              <span class="drawer-theme-text">الوضع الليلي</span>
            </button>

            <!-- Cart Trigger Inside Drawer -->
            <button class="drawer-action-btn" id="drawerCartBtn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" aria-label="عرض السلة">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>السلة (<span class="drawer-cart-count">0</span>)</span>
            </button>
          </div>

          <!-- Logout Container for Logged In User -->
          <div id="drawerLogoutContainer"></div>
        </div>
      </aside>
    `;
  }

  bindEvents() {
    const themeBtn = this.querySelector('#theme');
    const drawerThemeBtn = this.querySelector('#drawerThemeBtn');
    const hamburgerBtn = this.querySelector('#navHamburgerBtn');
    const closeBtn = this.querySelector('#drawerCloseBtn');
    const backdrop = this.querySelector('#sidebarBackdrop');
    const drawerCartBtn = this.querySelector('#drawerCartBtn');

    // Theme Toggle Listeners (Desktop & Drawer)
    const toggleTheme = (e) => {
      e?.preventDefault();
      const isCurrentlyDark = document.body.classList.contains('dark-theme') || document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      this.applyTheme(newTheme, true);
      window.dispatchEvent(new CustomEvent('teryak:theme-change', { detail: { theme: newTheme } }));
    };

    if (themeBtn && !themeBtn.dataset.bound) {
      themeBtn.dataset.bound = 'true';
      themeBtn.addEventListener('click', toggleTheme);
    }

    if (drawerThemeBtn && !drawerThemeBtn.dataset.bound) {
      drawerThemeBtn.dataset.bound = 'true';
      drawerThemeBtn.addEventListener('click', toggleTheme);
    }

    // Drawer Open / Close Listeners
    if (hamburgerBtn && !hamburgerBtn.dataset.bound) {
      hamburgerBtn.dataset.bound = 'true';
      hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    }

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = 'true';
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDrawer();
      });
    }

    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = 'true';
      backdrop.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Close drawer when clicking cart button to reveal modal smoothly
    if (drawerCartBtn && !drawerCartBtn.dataset.bound) {
      drawerCartBtn.dataset.bound = 'true';
      drawerCartBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Auto-close drawer when clicking any navigation link
    const drawerLinks = this.querySelectorAll('.drawer-link, .drawer-close-on-click');
    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeDrawer();
      });
    });

    // Logo Click Behavior: Navigate to home page or smooth scroll to top if already at home
    const base = this.getBasePath();
    const homeUrl = base + 'index.html';
    const logoLinks = this.querySelectorAll('.logo');
    logoLinks.forEach((logoLink) => {
      if (logoLink.dataset.bound) return;
      logoLink.dataset.bound = 'true';
      logoLink.setAttribute('href', homeUrl);
      logoLink.setAttribute('title', 'الذهاب للصفحة الرئيسية');
      logoLink.addEventListener('click', (e) => {
        // If holding Cmd/Ctrl/Shift or middle click, allow native browser tab open
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

        const currentPath = window.location.pathname.replace(/\\/g, '/');
        const currentPage = this.getCurrentPage();
        const isRootPage = !currentPath.includes('/pages/') && (currentPage === 'index.html' || currentPage === '' || currentPage === '/');

        if (isRootPage) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Ensure navigation occurs immediately across all browser contexts
          window.location.href = homeUrl;
        }
      });
    });
  }

  updateAuthState() {
    const base = this.getBasePath();
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('currentUser') || localStorage.getItem('user');
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) { }

    const isLoggedIn = (window.Auth && window.Auth.isLoggedIn()) || Boolean(token) || localStorage.getItem('isLoggedIn') === 'true';
    const container = this.querySelector('#navAuthContainer');
    const drawerUserSection = this.querySelector('#drawerUserSection');
    const drawerLogoutContainer = this.querySelector('#drawerLogoutContainer');

    if (isLoggedIn && user) {
      const displayName = user.name ? user.name.split(' ')[0] : 'حسابي';
      const fullName = user.name || 'مستخدم تِرياق';
      const role = user.role || user.userType || 'مريض';
      let roleLabel = 'مريض / عميل';
      let dashboardUrl = base + 'pages/public/patient-dashboard.html';

      if (role === 'pharmacist' || role === 'صيدلي') {
        roleLabel = 'صيدلي معتمد';
        dashboardUrl = base + 'pages/pharmacist/index.html';
      } else if (role === 'admin' || role === 'إدارة') {
        roleLabel = 'مسؤول المنصة';
        dashboardUrl = base + 'pages/admin/index.html';
      }

      // Update Desktop Navbar
      if (container) {
        container.innerHTML = `
          <a href="${dashboardUrl}" class="login" title="الانتقال إلى لوحة التحكم">
            <i class="fa-solid fa-user-circle"></i>
            <span>${displayName}</span>
          </a>
        `;
      }

      // Update Drawer User Section
      if (drawerUserSection) {
        drawerUserSection.innerHTML = `
          <div class="drawer-user-card logged-in">
            <div class="drawer-user-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="drawer-user-info">
              <div class="drawer-user-name">${fullName}</div>
              <div class="drawer-user-role">${roleLabel}</div>
            </div>
            <a href="${dashboardUrl}" class="btn btn-brand btn-sm drawer-dash-link drawer-close-on-click">
              لوحتي
            </a>
          </div>
        `;
      }

      // Update Drawer Logout Button
      if (drawerLogoutContainer) {
        drawerLogoutContainer.innerHTML = `
          <button class="drawer-logout-btn" id="drawerLogoutBtn" type="button">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>تسجيل الخروج</span>
          </button>
        `;

        const logoutBtn = drawerLogoutContainer.querySelector('#drawerLogoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeDrawer();
            if (window.Auth && typeof window.Auth.logout === 'function') {
              window.Auth.logout(base + 'index.html');
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('isLoggedIn');
              window.location.href = base + 'index.html';
            }
          });
        }
      }
    } else {
      const loginUrl = base + 'pages/public/login.html';
      const registerUrl = base + 'pages/public/register.html';

      // Update Desktop Navbar
      if (container) {
        container.innerHTML = `
          <a href="${loginUrl}" class="login" id="navLoginBtn">دخول</a>
        `;

        const loginBtn = container.querySelector('#navLoginBtn');
        if (loginBtn) {
          loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = loginUrl;
            if (window.SPARouterInstance) {
              window.SPARouterInstance.navigateTo(targetUrl);
            } else {
              window.location.href = targetUrl;
            }
          });
        }
      }

      // Update Drawer User Section for Guest
      if (drawerUserSection) {
        drawerUserSection.innerHTML = `
          <div class="drawer-user-card guest">
            <div class="drawer-guest-pitch">
              <strong>أهلاً بك في تِرياق</strong>
              <span>سجّل دخولك لمتابعة أدويتك وحجوزاتك بكل سهولة</span>
            </div>
            <div class="drawer-guest-actions">
              <a href="${loginUrl}" class="btn btn-brand btn-sm drawer-close-on-click">تسجيل الدخول</a>
              <a href="${registerUrl}" class="btn btn-line btn-sm drawer-close-on-click">إنشاء حساب</a>
            </div>
          </div>
        `;
      }

      if (drawerLogoutContainer) {
        drawerLogoutContainer.innerHTML = '';
      }
    }
  }

  updateCartCount() {
    const count = window.Cart ? window.Cart.getCount() : 0;
    const badge = this.querySelector('.cart-counter-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    const drawerCount = this.querySelector('.drawer-cart-count');
    if (drawerCount) {
      drawerCount.textContent = count;
    }
  }
}

if (!customElements.get('app-navbar')) {
  customElements.define('app-navbar', AppNavbar);
}
