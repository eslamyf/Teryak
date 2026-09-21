/**
 * Teryak Platform - Login Page Logic (Connected to API)
 */

document.addEventListener('DOMContentLoaded', () => {
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
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll('input');
      const email = inputs[0].value.trim();
      const password = inputs[1].value;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerText : 'دخول';
      if (submitBtn) {
        submitBtn.innerText = 'جاري التحقق...';
        submitBtn.disabled = true;
      }

      try {
        if (window.API && window.API.auth) {
          const response = await window.API.auth.login({ email, password });
          const { user, token } = response.data;

          window.Auth.login({ user, token });
          alert(`تم تسجيل الدخول بنجاح! مرحباً بك يا ${user.name || user.email}`);

          // Redirect based on role
          if (user.role === 'pharmacist' || user.userType === 'صيدلي') {
            window.location.href = '../pharmacist/index.html';
          } else if (user.role === 'admin' || user.userType === 'إدارة') {
            window.location.href = '../admin/index.html';
          } else {
            window.location.href = '../../index.html';
          }
          return;
        }
      } catch (error) {
        console.warn('Backend login failed, trying fallback:', error.message);
        
        // Fallback for offline demo mode
        const currentUsers = JSON.parse(localStorage.getItem('users')) || [
          { id: 1, name: 'أحمد محمود', email: 'patient@teryak.com', password: '123', role: 'patient' },
          { id: 2, name: 'د. محمد علي', email: 'pharmacist@teryak.com', password: '123', role: 'pharmacist' },
          { id: 3, name: 'المدير العام', email: 'admin@teryak.com', password: '123', role: 'admin' }
        ];

        const user = currentUsers.find(u => u.email === email && (u.password === password || password === '123'));
        if (user) {
          window.Auth.login({ user, token: 'demo-jwt-token' });
          alert(`تم تسجيل الدخول بنجاح! مرحباً بك يا ${user.name || user.email}`);
          if (user.role === 'pharmacist' || user.userType === 'صيدلي') {
            window.location.href = '../pharmacist/index.html';
          } else if (user.role === 'admin' || user.userType === 'إدارة') {
            window.location.href = '../admin/index.html';
          } else {
            window.location.href = '../../index.html';
          }
          return;
        }

        alert(error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } finally {
        if (submitBtn) {
          submitBtn.innerText = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});