const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

const overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("show");
});