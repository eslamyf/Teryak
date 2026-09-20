// Exchange System
const cards = document.querySelectorAll(".exchange-card");

cards.forEach(card => {

    const acceptBtn = card.querySelector(".accept");
    const rejectBtn = card.querySelector(".reject");
    const status = card.querySelector(".status");

    // قبول

    if (acceptBtn) {

        acceptBtn.addEventListener("click", () => {

            status.innerHTML = "مكتمل";

            status.className = "status completed";

            const buttons = card.querySelector(".buttons");

            if(buttons){
                buttons.remove();
            }

        });

    }

    // رفض

    if (rejectBtn) {

        rejectBtn.addEventListener("click", () => {

            card.style.transition = ".4s";

            card.style.opacity = "0";

            card.style.transform = "translateX(-80px)";

            setTimeout(() => {

                card.remove();

            },400);

        });

    }

});


// زر إضافة طلب

const addBtn = document.querySelector(".add-btn");

if(addBtn){

    addBtn.addEventListener("click",()=>{

        alert("سيتم فتح نافذة إضافة طلب أو عرض دواء");

    });

}

// Hover Animation

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 15px 35px rgba(0,0,0,.08)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="0 0 0 rgba(0,0,0,0)";

    });

});

