window.addEventListener("scroll", () => {

    if (window.scrollY >= 250) {
        document.querySelector("#arow").style.display = "block";
    }else{
        document.querySelector("#arow").style.display = "none";
    }
});
let arow = document.getElementById("arow");
arow.addEventListener("click", () => {
    window.scrollTo({
        top: 100,
        behavior: "smooth"
    });
});
//=======================================
let Counter=document.getElementById("Counter")
let Plus=document.querySelector(".Plus")
let Minus=document.querySelector(".Minus")
Minus.addEventListener("click",function(){
    if(Number(Counter.textContent)>0){
        Counter.textContent=Number(Counter.textContent)-1;
    }
})
Plus.addEventListener("click",function(){
    if(Number(Counter.textContent)<100){
         Counter.textContent=Number(Counter.textContent)+1;
    }
})

