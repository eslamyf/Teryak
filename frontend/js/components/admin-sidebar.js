/**
 * Teryak Platform - Reusable <admin-sidebar> Web Component
 */

class AdminSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path.split('/').pop() || 'index.html';
  }

  render() {
    const current = this.getCurrentPage();

    this.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-section-title">الإدارة العامة</div>
        <nav class="sidebar-nav">
          <a href="index.html" class="nav-item ${current === 'index.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="fa-solid fa-chart-pie"></i>
            </span>
            <span class="nav-label">لوحة التحكم الرئيسية</span>
          </a>

          <a href="medicines.html" class="nav-item ${current === 'medicines.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="fa-solid fa-pills"></i>
            </span>
            <span class="nav-label">إدارة الأدوية</span>
          </a>

          <a href="pharmacies.html" class="nav-item ${current === 'pharmacies.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="fa-solid fa-hospital"></i>
            </span>
            <span class="nav-label">إدارة الصيدليات</span>
          </a>

          <a href="users.html" class="nav-item ${current === 'users.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="fa-solid fa-users"></i>
            </span>
            <span class="nav-label">إدارة المستخدمين</span>
          </a>

          <a href="reports.html" class="nav-item ${current === 'reports.html' || current === 'Reports.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="fa-solid fa-chart-line"></i>
            </span>
            <span class="nav-label">التقارير والإحصائيات</span>
          </a>
        </nav>
      </aside>
    `;
  }
}

customElements.define('admin-sidebar', AdminSidebar);
