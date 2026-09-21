/**
 * Teryak Platform - Reusable <app-cart-modal> Web Component
 */

class AppCartModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.renderCartItems();

    // Listen to cart changes
    window.addEventListener('teryak:cart-change', () => this.renderCartItems());

    // Listen to modal open event to refresh
    const modalEl = this.querySelector('#exampleModalToggle');
    if (modalEl) {
      modalEl.addEventListener('show.bs.modal', () => this.renderCartItems());
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

  render() {
    const base = this.getBasePath();
    const checkoutUrl = base + 'pages/public/checkout.html';

    this.innerHTML = `
      <div class="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalToggleLabel"><i class="fa-solid fa-cart-shopping me-2"></i> قائمة الطلبات (سلة المشتريات)</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body" id="cartModalBody">
              <!-- Dynamically populated cart items -->
            </div>

            <div class="cart-modal-footer-actions">
              <div class="cart-total-price">
                المجموع: <span id="cartTotalPrice">0.00 ج.م</span>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" id="clearCartBtn">تفريغ السلة</button>
                <a href="${checkoutUrl}" id="proceedToCheckoutBtn" class="btn-checkout-cart">إتمام الطلب</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#clearCartBtn').addEventListener('click', () => {
      if (window.Cart) {
        window.Cart.clearCart();
      }
    });
  }

  renderCartItems() {
    const container = this.querySelector('#cartModalBody');
    const totalPriceEl = this.querySelector('#cartTotalPrice');
    const checkoutBtn = this.querySelector('#proceedToCheckoutBtn');
    if (!container) return;

    const cart = window.Cart ? window.Cart.getCart() : [];

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-cart-arrow-down text-muted" style="font-size: 40px; display: block; margin-bottom: 10px;"></i>
          <p>سلة المشتريات فارغة حالياً</p>
        </div>
      `;
      if (totalPriceEl) totalPriceEl.textContent = '0.00 ج.م';
      if (checkoutBtn) checkoutBtn.classList.add('disabled');
      return;
    }

    if (checkoutBtn) checkoutBtn.classList.remove('disabled');

    let html = '';
    const base = this.getBasePath();

    cart.forEach(item => {
      let imgSrc = item.img;
      if (!imgSrc || imgSrc.includes('undefined')) {
        imgSrc = base + 'assets/images/parst.jpg';
      }
      
      html += `
        <div class="modalDiv" data-name="${item.name}">
          <div class="right">
            <img src="${imgSrc}" alt="${item.name}">
            <div>
              <p class="NameOfMedicine">${item.name}</p>
              <small class="PriceOfMedicine">${item.price}</small>
            </div>
          </div>
          <div class="modalIcon">
            <i class="fa-solid fa-square-plus btn-plus" data-name="${item.name}"></i>
            <span id="Counter">${item.quantity || 1}</span>
            <i class="fa-solid fa-square-minus btn-minus" data-name="${item.name}"></i>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    const total = window.Cart ? window.Cart.getTotalPrice() : 0;
    if (totalPriceEl) {
      totalPriceEl.textContent = total.toFixed(2) + ' ج.م';
    }

    // Attach quantity event handlers
    container.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        if (window.Cart) window.Cart.updateQuantity(name, 1);
      });
    });

    container.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        if (window.Cart) window.Cart.updateQuantity(name, -1);
      });
    });
  }
}

customElements.define('app-cart-modal', AppCartModal);
