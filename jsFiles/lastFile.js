
let paymentMethod2 = document.getElementById("paymentMethod2");
let paymentMethod = localStorage.getItem("paymentMethod");

if (paymentMethod === "byHand") {
    paymentMethod2.textContent = "الدفع عند الاستلام";
} 
else if (paymentMethod === "Cash") {
    paymentMethod2.textContent = "بطاقة بنكية";
} 
else if (paymentMethod === "credit") {
    paymentMethod2.textContent = "محفظة إلكترونية";
}

//-----------------------------------------------
let medicineData=JSON.parse(localStorage.getItem('medicineData'))
document.querySelector(".IMGG").src=medicineData.img
document.querySelector(".Name").textContent=medicineData.name
document.querySelector(".blk").textContent=medicineData.price
let temp =parseFloat(medicineData.price)+15.00
document.querySelector(".grn").textContent=temp+ " ج.م "



