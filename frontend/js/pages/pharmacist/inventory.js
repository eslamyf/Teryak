// Example Inventory Storage
if (!localStorage.getItem("inventory")) {

    const inventory = [

        {
            id: 1,
            name: "Panadol Extra",
            quantity: 50,
            price: 35
        },

        {
            id: 2,
            name: "Brufen 400",
            quantity: 30,
            price: 42
        },

        {
            id: 3,
            name: "Augmentin 1g",
            quantity: 15,
            price: 120
        }

    ];

    localStorage.setItem(
        "inventory",
        JSON.stringify(
            inventory
        )
    );
}
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");

if(menuBtn){

    menuBtn.onclick = function(){

        sidebar.classList.add("active");
        overlay.classList.add("show");

    }

}

if(overlay){

    overlay.onclick = function(){

        sidebar.classList.remove("active");
        overlay.classList.remove("show");

    }

}