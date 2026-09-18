
const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault(
);

        // هاتي الـ inputs بتوع صفحة Login
        const inputs = loginForm.querySelectorAll("input");

        const email = inputs[0].value.trim();

        const password = inputs[1].value;


        // جلب كل المستخدمين
        const users =
            JSON.parse(localStorage.getItem("users")) || [];


        // البحث عن الحساب
        const user = users.find(
            user =>
                user.email === email &&
                user.password === password
        );


        if (!user) {

            alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");

            return;
        }


        // حفظ المستخدم الحالي
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        alert("تم تسجيل الدخول بنجاح");
        let haveAcount=true
        localStorage.setItem("haveAcount",haveAcount)

        // توجيه حسب نوع المستخدم
        if (user.userType === "صيدلي") {

            window.location.href = "../htmlFiles/home.html";

        } else {

            window.location.href = "../htmlFiles/home.html";
        }

    });
}
// -------------------------------------------------
let loginWithG=document.getElementById("loginWithG")
loginWithG.addEventListener("click",function(){
    let mail = prompt("Enter your email");

        if (!mail || !mail.endsWith("@gmail.com")) {
            alert("من فضلك ادخل البريد الإلكتروني");
            return;
        }
        
    let users =JSON.parse(localStorage.getItem("users")) || [];
    let user=users.find(user=>user.email===mail)
    if(!user){
        alert("لا يوجد حساب بهذا البريد الالكتروني")
        return
    }
    localStorage.setItem("currentUser",JSON.stringify(user))
    localStorage.setItem("isLogged","true")
    localStorage.setItem("haveAcount","true")
    alert("تم تسجيل الدخول بنجاح")
    
})