const pharmacistFields = document.querySelectorAll(".pharmacist-field");
const tabs = document.querySelectorAll(".tab");

let selectedUserType = "مريض";

// إظهار وإخفاء بيانات الصيدلي
function toggleFields(type) {

    pharmacistFields.forEach(field => {

        field.style.display =
            type === "صيدلي" ? "block" : "none";

    });
    if(type==="صيدلي"){
        pharmacyName.required=true
        licenseNumber.required=true
    }
    else{
        pharmacyName.required=false
        licenseNumber.required=false
        pharmacyName.value=""
        licenseNumber.value=""
    }
}

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => {
            t.classList.remove("active");
        });

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

    registerForm.addEventListener("submit", (e) => {

        e.preventDefault();
        const inputs = registerForm.querySelectorAll("input");

        const pharmacyName = document.getElementById("pharmacyName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const licenseNumber = document.getElementById("licenseNumber").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const terms = registerForm.querySelector(
            'input[type="checkbox"]'
        ).checked;

        if (email=="" ||  phone=="" ||  password==""  || confirmPassword=="" ) {

            alert("من فضلك املئي جميع البيانات");

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

        let users =
            JSON.parse(localStorage.getItem("users")) || [];

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {

            alert("هذا البريد الإلكتروني مسجل بالفعل");

            return;
        }
        const user = {

            id: Date.now(),

            userType: selectedUserType,

            email: email,

            phone: phone,

            password: password
        };
        if (selectedUserType === "صيدلي") {

            user.pharmacyName = pharmacyName;

            user.licenseNumber = licenseNumber;
        }
        users.push(user);

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        alert("تم إنشاء الحساب بنجاح");
        let haveAcount=true
        localStorage.setItem("haveAcount",haveAcount)
        window.location='../htmlFiles/home.html'
    });
}

// // ************************************************

let SignWithG = document.getElementById("SignWithG");
SignWithG.type = "button";

SignWithG.addEventListener("click", function () {

    let users =JSON.parse(localStorage.getItem("users")) || [];

    if (selectedUserType === "مريض") {

        let name = prompt("Enter your name");

        if (!name) {
            alert("من فضلك ادخل اسمك");
            return;
        }


        let mail = prompt("Enter your email");

        if (!mail || !mail.endsWith("@gmail.com")) {
            alert("من فضلك ادخل البريد الإلكتروني");
            return;
        }


        // التأكد إن الإيميل مش موجود
        const existingUser2 = users.find(
            user => user.email === mail
        );

        if (existingUser2) {

            alert("هذا البريد الإلكتروني مسجل بالفعل");

            return;
        }


        // إنشاء حساب المريض
        let user = {

            id: Date.now(),

            name: name,

            email: mail,

            phone: "",

            password: "",

            userType: "مريض",

            loginMethod: "Google"
        };


        // إضافة المستخدم
        users.push(user);


        // تخزين كل المستخدمين
        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );


        // تخزين المستخدم الحالي
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );


        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        let haveAcount = true;

        localStorage.setItem(
            "haveAcount",
            haveAcount
        );


        alert("تم التسجيل باستخدام Google بنجاح");

        window.location = "../htmlFiles/home.html";
    }


    // =====================================
    // لو المستخدم صيدلي
    // =====================================

    else if (selectedUserType === "صيدلي") {

        let name = prompt("Enter your name");

        if (!name) {
            alert("من فضلك ادخل اسمك");
            return;
        }


        let mail = prompt("Enter your email");

        if (!mail || !mail.endsWith("@gmail.com")) {
            alert("من فضلك ادخل البريد الإلكتروني");
            return;
        }


        let pharmacyName =
            prompt("Enter pharmacy name");

        if (!pharmacyName) {
            alert("من فضلك ادخل اسم الصيدلية");
            return;
        }


        let licenseNumber =
            prompt("Enter license number");

        if (!licenseNumber) {
            alert("من فضلك ادخل رقم الترخيص");
            return;
        }


        // التأكد إن الإيميل مش موجود
        const existingUser2 = users.find(
            user => user.email === mail
        );

        if (existingUser2) {

            alert("هذا البريد الإلكتروني مسجل بالفعل");

            return;
        }


        // إنشاء حساب الصيدلي
        let user = {

            id: Date.now(),

            name: name,

            email: mail,

            phone: "",

            password: "",

            userType: "صيدلي",

            pharmacyName: pharmacyName,

            licenseNumber: licenseNumber,

            loginMethod: "Google"
        };


        // إضافة المستخدم
        users.push(user);


        // تخزين المستخدمين
        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );


        // تخزين المستخدم الحالي
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );


        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        let haveAcount = true;

        localStorage.setItem(
            "haveAcount",
            haveAcount
        );


        alert("تم التسجيل باستخدام Google بنجاح");

        window.location = "../htmlFiles/home.html";
    }

});