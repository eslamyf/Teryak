/* الوضع المحفوظ قبل الرسم (مفيش وميض) */
(function(){
  try {
    var t = localStorage.getItem('teryak_theme') || localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (document.body) document.body.classList.add('dark-theme');
      else document.addEventListener('DOMContentLoaded', function(){ document.body.classList.add('dark-theme'); });
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch(e) {}
})();

const P = {
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  gauge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  pill: '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M10.5 7.5l5 7"/>',
  bottle: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 6h6v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18M12 8c-2-4-6-4-6-1s3 1 6 1zM12 8c2-4 6-4 6-1s-3 1-6 1z"/>',
  phone: '<path d="M22 17v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'
};

const ic = (n, c='') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const hd = document.getElementById('hd');
  const ft = document.getElementById('ft');

  // Check auth state
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('currentUser') || localStorage.getItem('user');
  let user = null;
  try { user = userRaw ? JSON.parse(userRaw) : null; } catch(e) {}
  const isLoggedIn = (window.Auth && window.Auth.isLoggedIn()) || Boolean(token) || localStorage.getItem('isLoggedIn') === 'true';

  let authBtnHtml = '<a href="#" class="login" id="navLoginBtn">دخول</a>';
  if (isLoggedIn && user) {
    const displayName = user.name ? user.name.split(' ')[0] : 'حسابي';
    const fullName = user.name || user.fullName || displayName;
    const role = user.role || user.userType || 'مريض';
    const roleLabel = (role === 'pharmacist' || role === 'صيدلي') ? 'صيدلي' : (role === 'admin' || role === 'إدارة') ? 'مسؤول' : 'مريض';
    let dashUrl = 'index.html';
    if (role === 'pharmacist' || role === 'صيدلي') dashUrl = 'frontend/pages/pharmacist/index.html';
    else if (role === 'admin' || role === 'إدارة') dashUrl = 'frontend/pages/admin/index.html';
    else dashUrl = 'frontend/pages/public/patient-dashboard.html';

    authBtnHtml = `
      <div class="user-menu-wrap" id="userMenuWrap">
        <button type="button" class="user-menu-btn" id="userMenuBtn" aria-expanded="false" title="خيارات الحساب">
          ${ic('user', 'user-icon')}
          <span>${displayName}</span>
          ${ic('chevron', 'chevron-icon')}
        </button>
        <div class="user-dropdown-card" id="userDropdown">
          <div class="user-dropdown-header">
            <strong>${fullName}</strong>
            <small>${roleLabel}</small>
          </div>
          <a href="${dashUrl}" class="user-dropdown-item">
            ${ic('gauge', '')}
            <span>لوحة التحكم</span>
          </a>
          <button type="button" class="user-dropdown-item logout-item" id="siteLogoutBtn">
            ${ic('logout', '')}
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    `;
  }

  if (hd) {
    hd.outerHTML = `
      <header class="hd">
        <div class="wrap hd-in">
          <nav class="site-nav" style="display:flex;align-items:center;justify-content:space-between;width:100%" aria-label="التنقل الرئيسي">
            <a href="index.html" class="logo">
              <img src="assets/images/logo.png" alt="شعار ترياق" onerror="this.style.display='none'">
              <span>تِرياق</span>
            </a>

            <!-- بالضبط نفس روابط الصفحة الأساسية بدون أي روابط إضافية -->
            <div class="nav-links">
              <a href="medicines.html" class="${page === 'medicines' ? 'active on' : ''}">الأدوية</a>
              <a href="index.html#rx">الروشتة</a>
              <a href="index.html#faq">أسئلة</a>
              <a href="register.html">للصيادلة</a>
            </div>

            <!-- عناصر نهاية النافبار بدون أي أزرار إضافية -->
            <div class="nav-end">
              <div class="cart-btn-wrap">
                <button class="icon-btn" id="cartBtn" type="button" aria-label="عرض سلة المشتريات" title="سلة المشتريات">
                  ${ic('cart')}
                  <span class="cart-counter-badge" id="count">0</span>
                </button>
              </div>

              <button class="icon-btn" id="theme" type="button" aria-label="تبديل الوضع الفاتح والغامق" title="تبديل الوضع">
                <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P.moon}</svg>
                <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P.sun}</svg>
              </button>

              <div id="navAuthContainer">
                ${authBtnHtml}
              </div>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  if (ft) {
    ft.outerHTML = `
      <footer class="ft">
        <div class="wrap">
          <div class="ft-in">
            <div>
              <a href="index.html" class="logo">
                <img src="assets/images/logo.png" alt="شعار ترياق" onerror="this.style.display='none'" style="height:32px;width:auto;">
                <span>تِرياق</span>
              </a>
              <p>بتوصلك لأقرب صيدلية فيها دواك، وتحجزه قبل ما تروح.</p>
            </div>
            <div class="ft-col">
              <h4>روابط سريعة</h4>
              <a href="medicines.html">الأدوية</a>
              <a href="pharmacies.html">الصيدليات</a>
              <a href="about.html">من نحن</a>
            </div>
            <div class="ft-col">
              <h4>تواصل معانا</h4>
              <a href="tel:+201234567890" dir="ltr">+20 123 456 7890</a>
              <a href="mailto:info@teryak.com">info@teryak.com</a>
            </div>
          </div>
          <div class="ft-base">
            <span>© 2026 تِرياق. كل الحقوق محفوظة.</span>
            <span><a href="#">الخصوصية</a> · <a href="#">الشروط والأحكام</a></span>
          </div>
        </div>
      </footer>
    `;
  }

  // تطبيق الوضع وتحديث ظهور الأيقونات بشكل قاطع لمنع أي تداخل
  const applyTheme = (theme, save = true) => {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }
    const moon = document.querySelector('#theme .moon');
    const sun = document.querySelector('#theme .sun');
    if (moon) moon.style.display = isDark ? 'none' : 'block';
    if (sun) sun.style.display = isDark ? 'block' : 'none';
    if (save) {
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  };

  // المزامنة الفورية عند تحميل الصفحة
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  applyTheme(currentTheme, false);

  const themeBtn = document.getElementById('theme');
  if (themeBtn) {
    themeBtn.onclick = (e) => {
      e.preventDefault();
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme');
      applyTheme(isDark ? 'light' : 'dark', true);
    };
  }

  // عند الضغط على "دخول": التوجيه لصفحة التسجيل لو مش مسجل، أو الدخول لو مسجل
  const loginBtn = document.getElementById('navLoginBtn');
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      const isRegistered = localStorage.getItem('haveAcount') === 'true' || 
                           Boolean(localStorage.getItem('currentUser')) || 
                           Boolean(localStorage.getItem('user')) || 
                           Boolean(localStorage.getItem('token'));
      if (!isRegistered) {
        window.location.href = 'register.html';
      } else {
        window.location.href = 'login.html';
      }
    };
  }

  // قائمة المستخدم المنسدلة وزر تسجيل الخروج
  const userMenuWrap = document.getElementById('userMenuWrap');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const siteLogoutBtn = document.getElementById('siteLogoutBtn');

  if (userMenuBtn && userMenuWrap) {
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userMenuWrap.classList.toggle('open');
    };
    document.addEventListener('click', (e) => {
      if (!userMenuWrap.contains(e.target)) {
        userMenuWrap.classList.remove('open');
      }
    });
  }

  if (siteLogoutBtn) {
    siteLogoutBtn.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      localStorage.setItem('isLoggedIn', 'false');
      window.dispatchEvent(new CustomEvent('teryak:auth-change'));
      window.location.href = 'index.html';
    };
  }

  // لو المستخدم مسجل دخوله بالفعل وهو في صفحة login.html
  if (page === 'login' && isLoggedIn && user) {
    const authBox = document.querySelector('.auth-box');
    const phHeader = document.querySelector('.ph.center, .ph');
    if (phHeader) {
      phHeader.innerHTML = `
        <h1>أنت مسجّل دخولك بالفعل</h1>
        <p>مرحباً بك يا <strong>${user.name || 'مستخدم ترياق'}</strong> في حسابك الحالي.</p>
      `;
    }
    if (authBox) {
      const role = user.role || user.userType || 'مريض';
      const roleLabel = (role === 'pharmacist' || role === 'صيدلي') ? 'صيدلي' : (role === 'admin' || role === 'إدارة') ? 'مسؤول' : 'مريض';
      let dashUrl = 'index.html';
      if (role === 'pharmacist' || role === 'صيدلي') dashUrl = 'frontend/pages/pharmacist/index.html';
      else if (role === 'admin' || role === 'إدارة') dashUrl = 'frontend/pages/admin/index.html';
      else dashUrl = 'frontend/pages/public/patient-dashboard.html';

      authBox.innerHTML = `
        <div style="text-align:center; padding:16px 0;">
          <div style="width:72px; height:72px; border-radius:50%; background:var(--primary-light); color:var(--primary-color); display:grid; place-items:center; margin:0 auto 16px; font-size:32px;">
            ${ic('check')}
          </div>
          <h3 style="font-size:21px; font-weight:700; margin-bottom:6px; color:var(--text-main);">${user.name || 'حسابك النشط'}</h3>
          <span style="display:inline-block; padding:4px 16px; border-radius:99px; background:var(--bg-muted); color:var(--primary-color); font-weight:700; font-size:13px; margin-bottom:24px;">${roleLabel}</span>
          
          <div style="display:flex; flex-direction:column; gap:12px;">
            <a href="${dashUrl}" class="btn btn-brand btn-block" style="font-size:16px;">
              الانتقال إلى لوحة التحكم
            </a>
            <button type="button" class="btn btn-line btn-block" id="pageLogoutBtn" style="color:#ef4444; border-color:#ef4444;">
              تسجيل الخروج والتبديل لحساب آخر
            </button>
          </div>
        </div>
      `;

      const pageLogoutBtn = authBox.querySelector('#pageLogoutBtn');
      if (pageLogoutBtn) {
        pageLogoutBtn.onclick = (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('user');
          localStorage.setItem('isLoggedIn', 'false');
          window.location.reload();
        };
      }
    }
  }
});
