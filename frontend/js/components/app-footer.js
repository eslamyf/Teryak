/**
 * Teryak Platform - Unified Simplified <app-footer> Web Component
 * Based on site.js and PAGES-MIGRATION.md specifications
 */

class AppFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  getBasePath() {
    if (document.body && document.body.getAttribute('data-page') === '404') {
      return '/';
    }
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/public/') || path.includes('/pages/pharmacist/') || path.includes('/pages/admin/')) {
      return '../../';
    } else if (path.includes('/pages/')) {
      return '../';
    } else {
      return './';
    }
  }

  render() {
    const base = this.getBasePath();
    const logoImg = base + 'assets/images/logo.png';
    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const pharmacistUrl = base + 'pages/pharmacist/index.html';
    const aboutUrl = base + 'pages/public/about.html';

    this.innerHTML = `
      <footer class="ft" role="contentinfo">
        <div class="wrap">
          <div class="ft-in">
            <div>
              <a href="${homeUrl}" class="logo" style="display:inline-flex;align-items:center;gap:8px;">
                <img src="${logoImg}" alt="شعار تِرياق" width="32" height="32" loading="lazy" decoding="async" style="height:32px;width:32px;object-fit:contain;">
                <span>تِرياق</span>
              </a>
              <p>بتوصلك لأقرب صيدلية فيها دواك، وتحجزه قبل ما تروح.</p>
            </div>
            <div class="ft-col">
              <h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">روابط سريعة</h3>
              <a href="${medicinesUrl}">الأدوية</a>
              <a href="${pharmaciesUrl}">الصيدليات</a>
              <a href="${pharmacistUrl}">للصيادلة</a>
              <a href="${aboutUrl}">من نحن</a>
            </div>
            <div class="ft-col">
              <h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">تواصل معانا</h3>
              <a href="tel:+201234567890" dir="ltr">+20 123 456 7890</a>
              <a href="mailto:info@teryak.com">info@teryak.com</a>
            </div>
          </div>
          <div class="ft-base">
            <span>© 2026 تِرياق. كل الحقوق محفوظة.</span>
            <span><a href="${aboutUrl}">الخصوصية</a> · <a href="${aboutUrl}">الشروط والأحكام</a></span>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);
