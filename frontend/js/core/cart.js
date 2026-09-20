/**
 * Teryak Platform - Shopping Cart Management Core
 */

const Cart = {
  getCart: function() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      console.error('Error loading cart', e);
      return [];
    }
  },

  saveCart: function(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('teryak:cart-change', { detail: { cart } }));
    this.updateBadges();
  },

  addToCart: function(product) {
    let cart = this.getCart();
    let existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: 1,
        pharmacy: product.pharmacy || 'صيدلية النهضة'
      });
    }

    this.saveCart(cart);
    return cart;
  },

  updateQuantity: function(name, delta) {
    let cart = this.getCart();
    let itemIndex = cart.findIndex(item => item.name === name);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + delta;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
    }

    this.saveCart(cart);
    return cart;
  },

  removeItem: function(name) {
    let cart = this.getCart().filter(item => item.name !== name);
    this.saveCart(cart);
    return cart;
  },

  clearCart: function() {
    localStorage.removeItem('cart');
    this.saveCart([]);
  },

  getCount: function() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getTotalPrice: function() {
    const cart = this.getCart();
    return cart.reduce((total, item) => {
      // Parse numeric price e.g. "24.50 ج.م" -> 24.5
      let num = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      return total + (num * (item.quantity || 1));
    }, 0);
  },

  updateBadges: function() {
    const count = this.getCount();
    const badges = document.querySelectorAll('#count, #counter, .cart-counter-badge');
    badges.forEach(badge => {
      badge.textContent = count;
    });
  },

  initGlobalListeners: function() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.addCart, .btn-add-cart');
      if (btn) {
        const card = btn.closest('.card, .medicine-card, .sec') || document;
        const titleEl = card.querySelector('.card-title, .title, .NameOfMedicine, h1, h2');
        const priceEl = card.querySelector('.parg, .PriceOfMedicine, .price');
        const imgEl = card.querySelector('.card-img-top, img');

        if (titleEl) {
          const product = {
            name: titleEl.textContent.trim(),
            price: priceEl ? priceEl.textContent.trim() : '25.00 ج.م',
            img: imgEl ? imgEl.src : ''
          };
          this.addToCart(product);
        }
      }
    });

    this.updateBadges();
  }
};

// Expose globally & initialize listeners on load
window.Cart = Cart;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Cart.initGlobalListeners());
} else {
  Cart.initGlobalListeners();
}
