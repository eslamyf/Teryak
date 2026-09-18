let BTN=document.getElementById("BTN")
BTN.onclick=function(){
    BTN.innerHTML= '<i class="bi bi-bell" style="margin-left: 5px;"></i> تم تفعيل الاشعارات '
    BTN.style.backgroundColor='#059669'
    BTN.style.color='white'
    confirm("سيتم إشعارك فور توفر الدواء")
}
let BTN2=document.getElementById("BTN2")
BTN2.onclick=function(){
    BTN2.innerHTML='<i class="bi bi-bell" style="margin-left: 5px;"></i> تم تفعيل الاشعارات '
    BTN2.style.backgroundColor='#059669'
    BTN2.style.color='white'
    confirm("سيتم إشعارك فور توفر الدواء")
}
let show=document.getElementById("show")
let done=document.getElementById("DONE")
show.onclick=function(){
    confirm("تم حجز الدواء بنجاح! سيتم إرسال رسالة تأكيد")
    done.style.display= 'block'
}
let show2=document.getElementById("show2")
let done2=document.getElementById("DONE2")
show2.onclick=function(){
    confirm("تم حجز الدواء بنجاح! سيتم إرسال رسالة تأكيد")
    done2.style.display= 'block'
}

let showHiddenDiv=document.getElementById("showHiddenDiv")
let hiddenDiv2=document.getElementById("hiddenDiv2")
showHiddenDiv.addEventListener('click',function(){
    if(showHiddenDiv.innerHTML=='إخفاء البدائل'){
        showHiddenDiv.innerHTML='عرض البدائل'
        hiddenDiv2.classList.add("hiddenDiv2")
    }else{
        showHiddenDiv.innerHTML='إخفاء البدائل'
         hiddenDiv2.classList.remove("hiddenDiv2")
    }

})