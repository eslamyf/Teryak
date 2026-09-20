/**
 * Teryak Platform - Authentication & Session Management Module
 */

const Auth = {
  getCurrentUser: function() {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (e) {
      console.error('Error parsing currentUser from localStorage', e);
      return null;
    }
  },

  isLoggedIn: function() {
    return localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('haveAcount') === 'true';
  },

  getUserType: function() {
    const user = this.getCurrentUser();
    return user ? user.userType : (localStorage.getItem('userType') || null);
  },

  login: function(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('haveAcount', 'true');
    if (userData.userType) {
      localStorage.setItem('userType', userData.userType);
    }
    window.dispatchEvent(new CustomEvent('teryak:auth-change', { detail: { user: userData, isLoggedIn: true } }));
  },

  logout: function(redirectUrl) {
    const currentUser = this.getCurrentUser();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Clean current session flags
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('haveAcount');
    localStorage.removeItem('account');
    localStorage.removeItem('userType');
    
    window.dispatchEvent(new CustomEvent('teryak:auth-change', { detail: { user: null, isLoggedIn: false } }));
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  requireAuth: function(allowedRoles = [], fallbackUrl = '') {
    if (!this.isLoggedIn()) {
      alert('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
      window.location.href = fallbackUrl || '/frontend/pages/public/login.html';
      return false;
    }
    
    if (allowedRoles.length > 0) {
      const userType = this.getUserType();
      if (!allowedRoles.includes(userType)) {
        alert('غير مصرح لك بالدخول إلى هذه الصفحة');
        window.location.href = fallbackUrl || '/frontend/index.html';
        return false;
      }
    }
    return true;
  }
};

// Global expose
window.Auth = Auth;
