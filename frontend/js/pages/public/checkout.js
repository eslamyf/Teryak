
// localStorage.clear()
let name=document.getElementById("name")
let phone=document.getElementById("phone")
let address=document.getElementById("address")
let addInfo=document.getElementById("addInfo")
let saveData=document.getElementById("saveData")
saveData.addEventListener("click",function(){
    localStorage.setItem("name",name.value)
    localStorage.setItem("phone",phone.value)
    localStorage.setItem("address",address.value)
    localStorage.setItem("addInfo",addInfo.value)
})
//-----------------------------------------------
let medicineData=JSON.parse(localStorage.getItem('medicineData'))
document.querySelector(".IMGG").src=medicineData.img
document.querySelector(".Name").textContent=medicineData.name
document.querySelector(".blk").textContent=medicineData.price
let temp =parseFloat(medicineData.price)+15.00
document.querySelector(".grn").textContent=temp+ " ج.م "












