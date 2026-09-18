// localStorage.clear()
let SignUp=document.getElementById("SignUp")
let SignIn=document.getElementById("SignIn")
let Icon=document.getElementById("Icon")
let Logout=document.getElementById("Logout")
let haveAcount=localStorage.getItem("haveAcount")
if(haveAcount==='true'){
    SignIn.classList.add("hide")
    SignUp.classList.add("hide")
    Icon.classList.remove("hide")
    Logout.classList.remove("hide")
     Icon.addEventListener("click",function(){
         window.location='../htmlFiles/home.html'
    })
}

Logout.addEventListener("click",function(){
    SignIn.classList.remove("hide")
    SignUp.classList.remove("hide")
    Icon.classList.add("hide")
    Logout.classList.add("hide")
    localStorage.removeItem("haveAcount")
    localStorage.removeItem("account")
    let currentUser=JSON.parse(localStorage.getItem("currentUser"))
    let users=JSON.parse(localStorage.getItem("users")) || []
    if(currentUser){
        users=users.filter(
            user=>user.email!==currentUser.email
        )
    }
    localStorage.setItem("users",JSON.stringify(users))
    localStorage.removeItem("currentUser")
     localStorage.removeItem("isLoggedIn")
     localStorage.removeItem("cart")
     
    window.location='../htmlFiles/home.html'
})
Icon.addEventListener("click",function(){
    let userType=localStorage.getItem("userType")
    if(userType === "مريض"){
        window.location='../htmlFiles/patientDash.html'
    }else if(userType === "صيدلي"){
        window.location='../pages_dashpord/index.html'
    }else{
        window.location='../htmlFiles/login.html'
    }
    
})