/**
 * Teryak Platform - Login Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure default demo users exist in localStorage for instant testing
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.length === 0) {
    users = [
      { id: 1, name: 'أحمد محمود', email: 'patient@teryak.com', password: '123', userType: 'مريض' },
      { id: 2, name: 'د. محمد علي', email: 'pharmacist@teryak.com', password: '123', userType: 'صيدلي', pharmacyName: 'صيدلية النهضة' },
      { id: 3, name: 'المدير العام', email: 'admin@teryak.com', password: '123', userType: 'إدارة' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
  }

  const tabs = document.querySelectorAll('.tab');
  let selectedUserType = 'مريض';

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedUserType = tab.textContent.trim();
    });
  });

  // Toggle Password Visibility
  const eyeIcons = document.querySelectorAll('.eye, .password-box i.fa-eye, .password-box i.fa-eye-slash');
  eyeIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const input = icon.closest('.input-box').querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll('input');
      const email = inputs[0].value.trim();
      const password = inputs[1].value;

      const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
      const user = currentUsers.find(u => u.email === email && u.password === password);

      if (!user) {
        alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      if (window.Auth) {
        window.Auth.login(user);
      } else {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('haveAcount', 'true');
        localStorage.setItem('userType', user.userType);
      }

      alert('تم تسجيل الدخول بنجاح! مرحباً بك يا ' + (user.name || user.email));

      // Redirect based on role
      if (user.userType === 'صيدلي') {
        window.location.href = '../pharmacist/index.html';
      } else if (user.userType === 'إدارة' || user.userType === 'admin') {
        window.location.href = '../admin/index.html';
      } else {
        window.location.href = '../../index.html';
      }
    });
  }

  // Google Login simulation
  const loginWithG = document.getElementById('loginWithG');
  if (loginWithG) {
    loginWithG.addEventListener('click', () => {
      let mail = prompt('أدخل بريدك الإلكتروني للتسجيل السريع:');
      if (!mail) return;

      const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
      let user = currentUsers.find(u => u.email === mail);

      if (!user) {
        user = {
          id: Date.now(),
          name: mail.split('@')[0],
          email: mail,
          userType: selectedUserType,
          loginMethod: 'Google'
        };
        currentUsers.push(user);
        localStorage.setItem('users', JSON.stringify(currentUsers));
      }

      if (window.Auth) {
        window.Auth.login(user);
      }

      alert('تم تسجيل الدخول بنجاح');
      if (user.userType === 'صيدلي') {
        window.location.href = '../pharmacist/index.html';
      } else if (user.userType === 'إدارة') {
        window.location.href = '../admin/index.html';
      } else {
        window.location.href = '../../index.html';
      }
    });
  }
});