/**
 * Teryak Platform - Reusable <pharmacist-sidebar> Web Component
 * Dynamically renders live pharmacy profile info and active navigation states.
 */

class PharmacistSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadPharmacyInfo();

    // Listen to user auth or profile changes
    window.addEventListener('teryak:auth-change', () => this.loadPharmacyInfo());
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    if (path.includes('inventory')) return 'inventory.html';
    if (path.includes('order')) return 'orders.html';
    if (path.includes('exchange')) return 'exchange.html';
    if (path.includes('notification')) return 'notifications.html';
    if (path.includes('pharmacist') && (path.endsWith('index.html') || path.endsWith('pharmacist/') || path.endsWith('pharmacist') || path.endsWith('/'))) {
      return 'index.html';
    }
    const segments = path.split('/').filter(Boolean);
    return segments.pop() || 'index.html';
  }

  render() {
    const current = this.getCurrentPage();

    this.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="pharmacy-info d-flex align-items-center gap-3 mb-4">
          <div class="logo-box">
            <i class="fa-solid fa-prescription-bottle-medical text-success fs-3"></i>
          </div>
          <div class="overflow-hidden">
            <h2 id="sidebarPharmacyName" class="fs-5 font-bold text-dark mb-1 text-truncate">صيدلية ترياق</h2>
            <p id="sidebarPharmacyAddress" class="text-muted small mb-0 text-truncate">الفرع الرئيسي</p>
          </div>
        </div>

        <nav class="d-flex flex-column gap-2">
          <a class="${current === 'index.html' ? 'active' : ''}" href="index.html">
            <i class="fa-solid fa-chart-pie me-2"></i> الإحصائيات
          </a>
          <a class="${current === 'inventory.html' ? 'active' : ''}" href="inventory.html">
            <i class="fa-solid fa-boxes-stacked me-2"></i> المخزون
          </a>
          <a class="${current === 'orders.html' || current === 'order.html' ? 'active' : ''}" href="orders.html">
            <i class="fa-solid fa-clipboard-list me-2"></i> الطلبات
          </a>
          <a class="${current === 'exchange.html' || current === 'exchanges.html' ? 'active' : ''}" href="exchange.html">
            <i class="fa-solid fa-arrow-right-arrow-left me-2"></i> تبادل المخزون
          </a>
          <a class="${current === 'notifications.html' ? 'active' : ''}" href="notifications.html">
            <i class="fa-solid fa-bell me-2"></i> الإشعارات
          </a>
          <a class="text-danger border-top mt-2 pt-2" href="#" id="pharmacistLogoutBtn" style="color: #ef4444 !important;">
            <i class="fa-solid fa-right-from-bracket me-2"></i> تسجيل الخروج
          </a>
        </nav>
      </aside>
    `;

    const logoutBtn = this.querySelector('#pharmacistLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.Auth && typeof window.Auth.logout === 'function') {
          window.Auth.logout('../../index.html');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('user');
          localStorage.setItem('isLoggedIn', 'false');
          window.location.href = '../../index.html';
        }
      });
    }
  }

  async loadPharmacyInfo() {
    let name = 'صيدليه اسلام';
    let address = 'الفرع المعتمد';
    const formatAddress = (value) => {
      if (typeof value === 'string') return value.trim();
      if (value && typeof value === 'object') {
        return [value.street, value.city, value.governorate]
          .filter(part => typeof part === 'string' && part.trim())
          .join('، ');
      }
      return '';
    };

    try {
      const user = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) {
        if (!user.pharmacyName || user.pharmacyName.includes('النهضة') || (user.name && user.name.includes('محمد علي'))) {
          user.pharmacyName = 'صيدليه اسلام';
          user.name = 'د. اسلام ياسر';
          user.address = { governorate: 'قنا', city: 'دشنا', street: 'دشنا - نجع عزوز' };
          try {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {}
        }

        if (user.pharmacyName && user.pharmacyName.trim().length > 0) {
          name = user.pharmacyName.trim();
        } else if (user.name && user.name.trim().length > 0) {
          name = `صيدلية ${user.name.trim()}`;
        }

        const userAddress = formatAddress(user.address);
        if (userAddress && !userAddress.includes('النزهة')) {
          address = userAddress;
        } else if (user.city && user.city.trim().length > 0) {
          address = user.city.trim();
        }
      }

      // Try fetching live pharmacy profile if API is available
      if (window.API && window.API.pharmacies && window.Auth && window.Auth.isLoggedIn()) {
        try {
          const res = await window.API.pharmacies.getMyPharmacy();
          const p = res?.data?.pharmacy || res?.data;
          if (p) {
            if (p.name && !p.name.includes('النهضة')) {
              name = p.name;
            }
            const pharmacyAddress = formatAddress(p.address);
            if (pharmacyAddress && !pharmacyAddress.includes('النزهة')) {
              address = pharmacyAddress;
            }
          }
        } catch (e) {
          // silent fallback
        }
      }
    } catch (e) {
      console.warn('Sidebar info load error:', e);
    }

    if (!address || address === 'الفرع المعتمد' || address.includes('النزهة')) {
      address = 'دشنا - نجع عزوز';
    }

    const nameEl = this.querySelector('#sidebarPharmacyName');
    const addrEl = this.querySelector('#sidebarPharmacyAddress');

    if (nameEl) nameEl.textContent = name;
    if (addrEl) addrEl.textContent = address;
  }
}

customElements.define('pharmacist-sidebar', PharmacistSidebar);
