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
              <i class="bi bi-grid-fill"></i>
            </span>
            <span class="nav-label">لوحة التحكم الرئيسية</span>
          </a>

          <a href="medicines.html" class="nav-item ${current === 'medicines.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="bi bi-capsule-pill"></i>
            </span>
            <span class="nav-label">إدارة الأدوية</span>
          </a>

          <a href="pharmacies.html" class="nav-item ${current === 'pharmacies.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="bi bi-hospital"></i>
            </span>
            <span class="nav-label">إدارة الصيدليات</span>
          </a>

          <a href="users.html" class="nav-item ${current === 'users.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="bi bi-people-fill"></i>
            </span>
            <span class="nav-label">إدارة المستخدمين</span>
          </a>

          <a href="reports.html" class="nav-item ${current === 'reports.html' || current === 'Reports.html' ? 'active' : ''}">
            <span class="nav-icon">
              <i class="bi bi-bar-chart-line-fill"></i>
            </span>
            <span class="nav-label">التقارير والإحصائيات</span>
          </a>
        </nav>
      </aside>
    `;
  }
}

customElements.define('admin-sidebar', AdminSidebar);
