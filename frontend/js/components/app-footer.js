/**
 * Teryak Platform - Reusable <app-footer> Web Component
 */

class AppFooter extends HTMLElement {
  connectedCallback() {
    this.render();
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

  render() {
    const base = this.getBasePath();
    const logoImg = base + 'assets/images/logo.png';
    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const donationUrl = base + 'pages/public/donation.html';
    const aboutUrl = base + 'pages/public/about.html';

    this.innerHTML = `
      <footer>
        <div class="container">
          <div class="row g-4">
            <!-- Brand Column -->
            <div class="col-12 col-md-6 col-lg-3 left-col">
              <a href="${homeUrl}">
                <div class="d-flex align-items-center">
                  <img class="IMG" src="${logoImg}" alt="Teryak">
                  <h1>تـريـاق</h1>
                </div>
              </a>
              <p>منصة تـريـاق تساعدك في البحث عن الدواء بسهولة ومعرفة أقرب الصيدليات المتوفرة بها، وحجزه والتبرع به إلكترونياً.</p>
            </div>

            <!-- Quick Links Column -->
            <div class="col-12 col-md-6 col-lg-3 margin">
              <h3>روابط سريعة</h3>
              <ul class="links">
                <li><a href="${homeUrl}"><i class="bi bi-caret-left-fill"></i> الرئيسية</a></li>
                <li><a href="${medicinesUrl}"><i class="bi bi-caret-left-fill"></i> الأدوية</a></li>
                <li><a href="${pharmaciesUrl}"><i class="bi bi-caret-left-fill"></i> الصيدليات</a></li>
                <li><a href="${donationUrl}"><i class="bi bi-caret-left-fill"></i> التبرع</a></li>
                <li><a href="${aboutUrl}"><i class="bi bi-caret-left-fill"></i> من نحن</a></li>
              </ul>
            </div>

            <!-- Services Column -->
            <div class="col-12 col-md-6 col-lg-3 margin">
              <h3>خدماتنا</h3>
              <ul class="list">
                <li><a href="${medicinesUrl}"><i class="icon2 bi bi-search"></i> البحث عن الأدوية</a></li>
                <li><a href="${pharmaciesUrl}"><i class="icon2 bi bi-geo-alt"></i> أماكن توفر الأدوية</a></li>
                <li><a href="${donationUrl}"><i class="icon2 bi bi-heart"></i> إمكانية التبرع بالأدوية</a></li>
                <li><a href="${medicinesUrl}"><i class="icon2 bi bi-bag-plus-fill"></i> حجز وشراء أدوية أونلاين</a></li>
              </ul>
            </div>

            <!-- Contact Column -->
            <div class="col-12 col-md-6 col-lg-3 contact">
              <h3>تواصل معنا</h3>
              <p><i class="bi bi-telephone-plus-fill"></i> +20 1234567890</p>
              <p><i class="bi bi-envelope"></i> info@teryak.com</p>
              <div class="icon">
                <a href="https://www.facebook.com" target="_blank" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a href="https://www.instagram.com" target="_blank" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                <a href="https://wa.me/201110590993" target="_blank" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                <a href="https://www.linkedin.com" target="_blank" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
              </div>
            </div>
          </div>

          <div class="line"></div>
          
          <div class="end">
            <p class="parg">تـريـاق</p>
            <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة لمنصة ترياق</p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);
