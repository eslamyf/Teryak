/**
 * Teryak Platform - Reusable <pharmacist-sidebar> Web Component
 */

class PharmacistSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadPharmacyInfo();
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path.split('/').pop() || 'index.html';
  }

  render() {
    const current = this.getCurrentPage();

    this.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="pharmacy-info">
          <div class="logo-box">💊</div>
          <div>
            <h2 id="sidebarPharmacyName">صيدلية النهضة</h2>
            <p id="sidebarPharmacyAddress">شارع الجامعة</p>
          </div>
        </div>

        <nav>
          <a class="${current === 'index.html' ? 'active' : ''}" href="index.html">
            📊 الإحصائيات
          </a>
          <a class="${current === 'inventory.html' ? 'active' : ''}" href="inventory.html">
            📦 المخزون
          </a>
          <a class="${current === 'orders.html' || current === 'order.html' ? 'active' : ''}" href="orders.html">
            📝 الطلبات
          </a>
          <a class="${current === 'exchange.html' || current === 'exchanges.html' ? 'active' : ''}" href="exchange.html">
            🔄 تبادل المخزون
          </a>
          <a class="${current === 'notifications.html' ? 'active' : ''}" href="notifications.html">
            🔔 الإشعارات
          </a>
        </nav>
      </aside>
    `;
  }

  loadPharmacyInfo() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.pharmacyName) {
        const nameEl = this.querySelector('#sidebarPharmacyName');
        if (nameEl) nameEl.textContent = user.pharmacyName;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

customElements.define('pharmacist-sidebar', PharmacistSidebar);
