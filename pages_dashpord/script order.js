// Orders Page
const orderCards = document.querySelectorAll(".order-card");

orderCards.forEach(card => {

    const readyBtn = card.querySelector(".ready-btn");
    const cancelBtn = card.querySelector(".cancel-btn");
    const confirmBtn = card.querySelector(".confirm-btn");
    const badge = card.querySelector(".badge");

    // زر جاهز

    if (readyBtn) {

        readyBtn.addEventListener("click", () => {

            badge.innerHTML = "جاهز";

            badge.className = "badge ready";

            readyBtn.remove();

            if (!card.querySelector(".confirm-btn")) {

                const btn = document.createElement("button");

                btn.innerHTML = "تأكيد الاستلام";

                btn.className = "confirm-btn";

                card.querySelector(".buttons").appendChild(btn);

                btn.addEventListener("click", () => {

                    badge.innerHTML = "مكتمل";

                    badge.className = "badge completed";

                    btn.remove();

                });

            }

        });

    }

    // زر إلغاء

    if (cancelBtn) {

        cancelBtn.addEventListener("click", () => {

            badge.innerHTML = "ملغي";

            badge.className = "badge cancelled";

            const buttons = card.querySelector(".buttons");

            buttons.innerHTML = "";

        });

    }

    // تأكيد الاستلام

    if (confirmBtn) {

        confirmBtn.addEventListener("click", () => {

            badge.innerHTML = "مكتمل";

            badge.className = "badge completed";

            confirmBtn.remove();

        });

    }

});

// Hover Animation

orderCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-4px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// ظهور الكروت تدريجيًا
window.addEventListener("load", () => {

    orderCards.forEach((card, index) => {

        card.style.opacity = "0";

        card.style.transform = "translateY(40px)";

        setTimeout(() => {

            card.style.transition = ".5s";

            card.style.opacity = "1";

            card.style.transform = "translateY(0px)";

        }, index * 150);

    });

});

const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});