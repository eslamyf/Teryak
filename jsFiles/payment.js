let credit=document.getElementById("credit")
let Visa=document.getElementById("Visa")
let Cash=document.getElementById("Cash")
let cash=document.getElementById("cash")
let byHand=document.getElementById("byHand")

let byHandIC=document.getElementById("byHandIC")
let cashIC=document.getElementById("cashIC")
let creditIC=document.getElementById("creditIC")
credit.addEventListener("click", function(){
    Visa.classList.add("hideF2")
    cash.classList.remove("hideF1")

    Cash.classList.remove("active")
    byHand.classList.remove("active")
    credit.classList.add("active")

    byHandIC.classList.add("hidenn")
    cashIC.classList.add("hidenn")
    creditIC.classList.remove("hidenn")
})
Cash.addEventListener("click", function(){
    Visa.classList.remove("hideF2")
    cash.classList.add("hideF1")

    credit.classList.remove("active")
    byHand.classList.remove("active")
    Cash.classList.add("active")

    byHandIC.classList.add("hidenn")
    creditIC.classList.add("hidenn")
    cashIC.classList.remove("hidenn")
   
})
byHand.addEventListener("click", function(){
    Visa.classList.add("hideF2")
    cash.classList.add("hideF1")
    credit.classList.remove("active")
    Cash.classList.remove("active")
    byHand.classList.add("active")
    creditIC.classList.add("hidenn")
    cash.classList.add("hidenn")
    byHandIC.classList.remove("hidenn")
})
//----------------------------------------
const nextBtn = document.getElementById("nextBtn");
nextBtn.addEventListener("click", function () {
    const active = document.querySelector(".DIV1.active");

    if (active.id === "byHand") {
        window.location.href = "lastFile.html";
    } 
    
    else if (active.id === "Cash") {
        const visaForm = document.getElementById("Visa");
        if (visaForm.checkValidity()) {
            window.location.href = "lastFile.html";
        } else {
            visaForm.reportValidity();
        }
    } 
    
    else if (active.id === "credit") {
        const cashForm = document.getElementById("cash");
        if (cashForm.checkValidity()) {
            window.location.href = "lastFile.html";
        } else {
            cashForm.reportValidity();
        }
    }
});
//-------------------------------------
const paymentMethods = document.querySelectorAll(".DIV1");

paymentMethods.forEach(method => {
    method.addEventListener("click", function () {
        paymentMethods.forEach(item => {
            item.classList.remove("active");
        });
        this.classList.add("active");
    });
});
const nextBtn2 = document.getElementById("nextBtn");
nextBtn2.addEventListener("click", function () {
    const activePayment = document.querySelector(".DIV1.active");
    console.log(activePayment.id);
    localStorage.setItem("paymentMethod", activePayment.id);
});


//===================================


function saveDATA(){
    let num=document.getElementById("num")
localStorage.setItem("number",num.value)
let criditNum=document.getElementById("criditNum")
localStorage.setItem("criditNum",criditNum.value)
let name=document.getElementById("name")
localStorage.setItem("name",name.value)
let rev=document.getElementById("rev")
localStorage.setItem("rev",rev.value)
let CVV=document.getElementById("CVV")
localStorage.setItem("CVV",CVV.value)
}
//-----------------------------------------------
let medicineData=JSON.parse(localStorage.getItem('medicineData'))
document.querySelector(".IMGG").src=medicineData.img
document.querySelector(".Name").textContent=medicineData.name
document.querySelector(".blk").textContent=medicineData.price
let temp =parseFloat(medicineData.price)+15.00
document.querySelector(".grn").textContent=temp+ " ج.م "


