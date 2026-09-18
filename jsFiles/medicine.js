let filterBtn = document.getElementById("filterBtn");
let filter= document.getElementById("filter");
let arrow = document.getElementById("arrow");

filterBtn.addEventListener("click", function () {
    filter.classList.toggle("show");
    filterBtn.classList.toggle("change")
     arrow.classList.toggle("bi-chevron-down");
    arrow.classList.toggle("bi-chevron-up");
});
const items = document.querySelectorAll(".right button");
items.forEach(item => {
    item.addEventListener("click", () => {

        // إزالة active من الكل
        items.forEach(button => button.classList.remove("active"));

        // إضافة active للعنصر المضغوط
        item.classList.add("active");
    });
});
const items2 = document.querySelectorAll(".left button");
items2.forEach(item => {
    item.addEventListener("click", () => {
        items2.forEach(button => button.classList.remove("active2"));

        item.classList.add("active2");
    });
});

const filterButtons = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".card");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        cards.forEach(card => {

            const status = card.dataset.status;

            if (filter === "all" || status === filter) {
                card.parentElement.style.display = "block";

            } else {
                card.parentElement.style.display = "none";
            }

        });

    });

});

// ========================================================

const sortSelect = document.getElementById("sortSelect");
const row = document.querySelector(".cards-row");

sortSelect.addEventListener("change", function () {

    const cards = Array.from(row.querySelectorAll(".col"));

    if (this.value === "priceLow") {

        cards.sort((a, b) => {
            const priceA = parseFloat(a.querySelector(".parg").textContent);
            const priceB = parseFloat(b.querySelector(".parg").textContent);

            return priceA - priceB;
        });

    } else if (this.value === "priceHigh") {

        cards.sort((a, b) => {
            const priceA = parseFloat(a.querySelector(".parg").textContent);
            const priceB = parseFloat(b.querySelector(".parg").textContent);

            return priceB - priceA;
        });

    } else if (this.value === "rating") {

        cards.sort((a, b) => {
            const ratingA = parseFloat(a.querySelector(".rate").textContent);
            const ratingB = parseFloat(b.querySelector(".rate").textContent);

            return ratingB - ratingA;
        });

    } else if (this.value === "availability") {

        cards.sort((a, b) => {
            const availableA = parseInt(a.querySelector(".sml").textContent);
            const availableB = parseInt(b.querySelector(".sml").textContent);

            return availableB - availableA;
        });
    }

    cards.forEach(card => {
        row.appendChild(card);
    });

});
//=====================================
const categoryButtons = document.querySelectorAll("[data-category]");
const cards2 = document.querySelectorAll(".cards-row .col");
categoryButtons.forEach(button => {
    button.addEventListener("click", function () {
        const category = this.dataset.category;
        cards2.forEach(col => {
            const info = col.querySelector(".card-body small").textContent;
            if (category === "all" || info.includes(category)) {
                col.style.display = "";
            } else {
                col.style.display = "none";
            }
        });
    });
});
//----------------------------------------
// search
const searchInput = document.getElementById("searchInput");
const cards3 = document.querySelectorAll(".cards-row .col");

searchInput.addEventListener("input", function () {

    const searchValue = this.value.trim().toLowerCase();

    cards3.forEach(card => {

        const title = card.querySelector(".card-title").textContent.toLowerCase();
        const info = card.querySelector(".card-body").textContent.toLowerCase();

        if (info.includes(searchValue)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
});
//-----------------------------------
let BTNN2 =document.getElementById("BTNN2")
let BTN=document.querySelector(".BTN")
BTNN2.addEventListener("click",function(){
    BTNN2.querySelector("span").style.color='#f59e0b'
    BTNN2.querySelector("i").style.color='#f59e0b'
    BTN.style.backgroundColor='#fff8e6'
    BTNN2.style.border='1px solid #f59e0b'
    BTNN2.querySelector("span").innerHTML='✓ تم تفعيل الإشعار'
    confirm("سيتم إشعارك فور توفر الدواء")
})

// ____________________________________________________
let links=document.querySelectorAll(".addCart")
links.forEach(lnk=>{
    lnk.addEventListener("click",function(el){
        let currentUser=JSON.parse(localStorage.getItem("currentUser"))
        if(!currentUser){
            el.preventDefault()
            alert("سجل دخول اولا لحجز الدواء")
            window.location='../htmlFiles/login.html'
        }
    })
})


