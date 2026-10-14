/**
 * Teryak Platform - Login Page Logic (Connected to API)
 * Integrated with Form Validation & Side-Sliding Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('currentUser') || localStorage.getItem('user');
  let currentUser = null;
  try { currentUser = userRaw ? JSON.parse(userRaw) : null; } catch(e) {}
  const isLoggedIn = (window.Auth && window.Auth.isLoggedIn()) || Boolean(token) || localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn && currentUser) {
    const authBox = document.querySelector('.auth-box, form#loginForm');
    const phHeader = document.querySelector('.ph.center, .ph');
    if (phHeader) {
      phHeader.innerHTML = `
        <h1>أنت مسجّل دخولك بالفعل</h1>
        <p>مرحباً بك مجدداً يا <strong>${currentUser.name || 'مستخدم ترياق'}</strong> في حسابك الحالي.</p>
      `;
    }
    if (authBox) {
      const role = currentUser.role || currentUser.userType || 'مريض';
      const roleLabel = (role === 'pharmacist' || role === 'صيدلي') ? 'صيدلي' : (role === 'admin' || role === 'إدارة') ? 'مسؤول' : 'مريض';
      let dashboardUrl = 'patient-dashboard.html';
      if (role === 'pharmacist' || role === 'صيدلي') dashboardUrl = '../pharmacist/index.html';
      else if (role === 'admin' || role === 'إدارة') dashboardUrl = '../admin/index.html';

      authBox.innerHTML = `
        <div style="text-align:center; padding:16px 0;">
          <div style="width:72px; height:72px; border-radius:50%; background:var(--primary-light); color:var(--primary-color); display:grid; place-items:center; margin:0 auto 16px; font-size:32px;">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <h3 style="font-size:21px; font-weight:700; margin-bottom:6px; color:var(--text-main);">${currentUser.name || 'حسابك النشط'}</h3>
          <span style="display:inline-block; padding:4px 16px; border-radius:99px; background:var(--bg-muted); color:var(--primary-color); font-weight:700; font-size:13px; margin-bottom:24px;">${roleLabel}</span>
          
          <div style="display:flex; flex-direction:column; gap:12px;">
            <a href="${dashboardUrl}" class="btn btn-brand btn-block" style="font-size:16px;">
              <i class="fa-solid fa-gauge-high me-2"></i> الانتقال إلى لوحة التحكم
            </a>
            <button type="button" class="btn btn-line btn-block" id="pageLogoutBtn" style="color:#ef4444; border-color:#ef4444;">
              <i class="fa-solid fa-right-from-bracket me-2"></i> تسجيل الخروج والتبديل لحساب آخر
            </button>
          </div>
        </div>
      `;

      const pageLogoutBtn = authBox.querySelector('#pageLogoutBtn');
      if (pageLogoutBtn) {
        pageLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.Auth && typeof window.Auth.logout === 'function') {
            window.Auth.logout();
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user');
            localStorage.setItem('isLoggedIn', 'false');
          }
          window.dispatchEvent(new CustomEvent('teryak:auth-change'));
          window.location.reload();
        });
      }
      return;
    }
  }

  const tabs = document.querySelectorAll('.tab, .tabs button');
  let selectedUserType = 'مريض';

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => {
        t.classList.remove('active');
        t.classList.remove('on');
      });
      tab.classList.add('active');
      tab.classList.add('on');
      selectedUserType = tab.textContent.trim();
    });
  });

  // Floating labels value sync & change events
  const allFloatingInputs = document.querySelectorAll(".floating-input");
  allFloatingInputs.forEach(input => {
    const updateHasValue = () => {
      if (input.value && input.value.trim().length > 0) {
        input.classList.add("has-value");
      } else {
        input.classList.remove("has-value");
      }
    };
    input.addEventListener("input", updateHasValue);
    input.addEventListener("change", updateHasValue);
    input.addEventListener("blur", updateHasValue);
    updateHasValue();
  });

  // Toggle Password Visibility (Robust Delegation)
  document.addEventListener("click", (e) => {
    const eyeBtn = e.target.closest(".eye-btn, .eye");
    if (!eyeBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const box = eyeBtn.closest(".password-box, .input-box");
    if (!box) return;
    const input = box.querySelector("input");
    const icon = eyeBtn.querySelector("i") || (eyeBtn.tagName === "I" ? eyeBtn : null);
    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  });

  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    const emailInput = loginForm.querySelector('input[type="email"], input[name="email"], input:first-of-type');
    const passwordInput = loginForm.querySelector('input[type="password"]');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email) {
        if (window.TeryakValidator) window.TeryakValidator.setError(emailInput, 'يرجى إدخال البريد الإلكتروني');
        if (window.Toast) window.Toast.warning('يرجى إدخال بريدك الإلكتروني المسجل', 'حقل مطلوب');
        emailInput?.focus();
        return;
      }

      if (!password) {
        if (window.TeryakValidator) window.TeryakValidator.setError(passwordInput, 'يرجى إدخال كلمة المرور');
        if (window.Toast) window.Toast.warning('يرجى إدخال كلمة المرور للمتابعة', 'حقل مطلوب');
        passwordInput?.focus();
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'دخول';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري التحقق...';
        submitBtn.disabled = true;
      }

      try {
        if (window.API && window.API.auth) {
          const response = await window.API.auth.login({ email, password });
          const { user, token } = response.data;

          if (window.Auth) window.Auth.login({ user, token });
          
          if (window.Toast) {
            window.Toast.success(
              `مرحباً بك مجدداً يا ${user.name || user.email}!`,
              'تم تسجيل الدخول بنجاح',
              2500
            );
          }

          setTimeout(() => {
            // Check for redirect param
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTarget = urlParams.get('redirect');
            if (redirectTarget) {
              window.location.href = redirectTarget;
              return;
            }

            // Redirect based on role
            if (user.role === 'pharmacist' || user.userType === 'صيدلي') {
              window.location.href = '../pharmacist/index.html';
            } else if (user.role === 'admin' || user.userType === 'إدارة') {
              window.location.href = '../admin/index.html';
            } else {
              window.location.href = '../../index.html';
            }
          }, 800);
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

        const user = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || password === '123'));
        if (user) {
          if (window.Auth) window.Auth.login({ user, token: 'demo-jwt-token' });
          if (window.Toast) {
            window.Toast.success(`مرحباً بك يا ${user.name || user.email}`, 'تم تسجيل الدخول');
          }
          setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTarget = urlParams.get('redirect');
            if (redirectTarget) {
              window.location.href = redirectTarget;
              return;
            }

            if (user.role === 'pharmacist' || user.userType === 'صيدلي') {
              window.location.href = '../pharmacist/index.html';
            } else if (user.role === 'admin' || user.userType === 'إدارة') {
              window.location.href = '../admin/index.html';
            } else {
              window.location.href = '../../index.html';
            }
          }, 800);
          return;
        }

        if (window.Toast) {
          window.Toast.error(
            error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من صحة البيانات.',
            'خطأ في تسجيل الدخول'
          );
        }
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHtml;
          submitBtn.disabled = false;
        }
      }
    });
  }
});