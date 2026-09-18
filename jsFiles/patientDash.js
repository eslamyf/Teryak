const items = document.querySelectorAll(".list ul li");

const sections = [
    document.querySelector(".hidden1"),
    document.querySelector(".hidden2"),
    document.querySelector(".hidden3"),
    document.querySelector(".hidden4"),
    document.querySelector(".hidden5"),
    document.querySelector(".hidden6")
];

items.forEach(item => {
    item.addEventListener("click", () => {
        items.forEach(li => li.classList.remove("active"));
        item.classList.add("active");
        sections.forEach(section => section.style.display = "none");
        document.querySelector("." + item.dataset.target).style.display = "block";
    });
});

//========================================
let userName=document.getElementById("userName")
let currentUser=JSON.parse(localStorage.getItem("currentUser"))
userName.textContent=currentUser.name