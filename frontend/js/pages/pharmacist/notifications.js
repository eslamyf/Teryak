// جميع الإشعارات
const notifications = document.querySelectorAll(".notification");

// ظهور تدريجي
window.addEventListener("load", () => {

    notifications.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        setTimeout(() => {

            card.style.transition = ".4s";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        }, index * 120);

    });

});

// عند الضغط تعتبر الإشعار مقروءًا
notifications.forEach(card => {

    card.addEventListener("click", () => {

        card.classList.remove("unread");

        const dot = card.querySelector(".dot");

        if(dot){
            dot.style.display = "none";
        }

    });

});

// Hover
notifications.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-4px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});
// Sidebar
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

// إغلاق القائمة عند الضغط خارجها
document.addEventListener("click", (e) => {
    if (
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        sidebar.classList.remove("show");
    }
});