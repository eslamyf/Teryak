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

  getToken: function() {
    return localStorage.getItem('token') || '';
  },

  isLoggedIn: function() {
    return Boolean(this.getToken()) || localStorage.getItem('isLoggedIn') === 'true';
  },

  getUserType: function() {
    const user = this.getCurrentUser();
    return user ? (user.role || user.userType) : (localStorage.getItem('userType') || null);
  },

  login: function(authData) {
    const user = authData.user || authData;
    const token = authData.token || '';

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('haveAcount', 'true');

    if (token) {
      localStorage.setItem('token', token);
    }

    const role = user.role || user.userType || 'patient';
    localStorage.setItem('userType', role);

    window.dispatchEvent(new CustomEvent('teryak:auth-change', { detail: { user, isLoggedIn: true } }));
  },

  logout: function(redirectUrl) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('haveAcount');
    localStorage.removeItem('account');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    
    window.dispatchEvent(new CustomEvent('teryak:auth-change', { detail: { user: null, isLoggedIn: false } }));
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  requireAuth: function(allowedRoles = [], fallbackUrl = '') {
    if (!this.isLoggedIn()) {
      if (window.Toast) {
        window.Toast.warning('يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة', 'تسجيل الدخول مطلوب');
      }
      setTimeout(() => {
        window.location.href = fallbackUrl || '/frontend/pages/public/login.html';
      }, 1000);
      return false;
    }
    
    if (allowedRoles.length > 0) {
      const userType = this.getUserType();
      const normalizedUserType = (userType === 'صيدلي' ? 'pharmacist' : (userType === 'إدارة' ? 'admin' : userType));
      
      const isAllowed = allowedRoles.some(role => {
        return role === userType || role === normalizedUserType || 
               (role === 'pharmacist' && userType === 'صيدلي') ||
               (role === 'admin' && userType === 'إدارة');
      });

      if (!isAllowed) {
        if (window.Toast) {
          window.Toast.error('غير مصرح لحسابك بالدخول إلى هذه الصفحة الإدارية', 'صلاحية غير كافية');
        }
        setTimeout(() => {
          window.location.href = fallbackUrl || '/frontend/index.html';
        }, 1200);
        return false;
      }
    }
    return true;
  }
};

// Global expose
window.Auth = Auth;
