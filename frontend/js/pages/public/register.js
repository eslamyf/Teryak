/**
 * Teryak Platform - Registration Logic (Connected to API)
 */

const pharmacistFields = document.querySelectorAll(".pharmacist-field");
const tabs = document.querySelectorAll(".tab");

let selectedUserType = "مريض";

// إظهار وإخفاء بيانات الصيدلي
function toggleFields(type) {
    const pharmacyName = document.getElementById("pharmacyName");
    const licenseNumber = document.getElementById("licenseNumber");

    pharmacistFields.forEach(field => {
        field.style.display = type === "صيدلي" ? "block" : "none";
    });
    if (type === "صيدلي") {
        if (pharmacyName) pharmacyName.required = true;
        if (licenseNumber) licenseNumber.required = true;
    } else {
        if (pharmacyName) {
            pharmacyName.required = false;
            pharmacyName.value = "";
        }
        if (licenseNumber) {
            licenseNumber.required = false;
            licenseNumber.value = "";
        }
    }
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        selectedUserType = tab.textContent.trim();
        localStorage.setItem("userType", selectedUserType);
        toggleFields(selectedUserType);
    });
});

toggleFields("مريض");

const eyeIcons = document.querySelectorAll(".eye");
eyeIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        const input = icon.parentElement.querySelector("input");
        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
});

const registerForm = document.querySelector("#registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pharmacyNameInput = document.getElementById("pharmacyName");
        const licenseNumberInput = document.getElementById("licenseNumber");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        const pharmacyName = pharmacyNameInput ? pharmacyNameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const licenseNumber = licenseNumberInput ? licenseNumberInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        const termsCheckbox = registerForm.querySelector('input[type="checkbox"]');
        const terms = termsCheckbox ? termsCheckbox.checked : true;

        if (!email || !phone || !password || !confirmPassword) {
            alert("من فضلك املأ جميع البيانات");
            return;
        }

        if (password !== confirmPassword) {
            alert("كلمتا المرور غير متطابقتين");
            return;
        }

        if (!terms) {
            alert("يجب الموافقة على الشروط والأحكام");
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : 'إنشاء حساب';
        if (submitBtn) {
            submitBtn.innerText = 'جاري إنشاء الحساب...';
            submitBtn.disabled = true;
        }

        const userData = {
            name: email.split('@')[0],
            email,
            phone,
            password,
            role: selectedUserType === 'صيدلي' ? 'pharmacist' : 'patient',
            pharmacyName: selectedUserType === 'صيدلي' ? pharmacyName : '',
            licenseNumber: selectedUserType === 'صيدلي' ? licenseNumber : '',
        };

        try {
            if (window.API && window.API.auth) {
                const response = await window.API.auth.register(userData);
                const { user, token } = response.data;
                window.Auth.login({ user, token });
                alert("تم إنشاء الحساب بنجاح ومرحباً بك في ترياق!");

                if (user.role === "pharmacist") {
                    window.location.href = '../pharmacist/index.html';
                } else {
                    window.location.href = '../../index.html';
                }
                return;
            }
        } catch (error) {
            console.warn('Backend register failed, trying fallback:', error.message);
            // Fallback for offline demo mode
            let users = JSON.parse(localStorage.getItem("users")) || [];
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                alert("هذا البريد الإلكتروني مسجل بالفعل");
                return;
            }

            const newUser = {
                id: Date.now(),
                userType: selectedUserType,
                email,
                phone,
                password,
                pharmacyName,
                licenseNumber
            };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            window.Auth.login({ user: newUser, token: 'demo-jwt-token' });

            alert("تم إنشاء الحساب بنجاح");
            if (selectedUserType === "صيدلي") {
                window.location.href = '../pharmacist/index.html';
            } else {
                window.location.href = '../../index.html';
            }
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}