//==============================================
let modalDiv=document.querySelector(".modalDiv")
let addCart=document.querySelectorAll(".addCart")
addCart.forEach(function(addToCart){
    addToCart.addEventListener("click",function(){
        let cardss=addToCart.closest(".card")
        let name=cardss.querySelector(".card-title").textContent;
        let parg=cardss.querySelector(".parg").textContent;
        let img=cardss.querySelector("img").src;
        let medicineData={
            name:name,
            price:parg,
            img: img
        };
        localStorage.setItem("medicineData",JSON.stringify(medicineData))
        modalDiv.classList.remove("hidemodalDiv")
    });
})

// ==============================================================================================================
let addCartt = document.querySelectorAll(".addCart");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let cartContainer = document.querySelector(".modal-body");
    //  addCartt.forEach(function (button){
    //     button.preventDefault()
    //     button.stopPropagation()
    //  })
addCartt.forEach(function (button) {
    let haveAcount=JSON.parse(localStorage.getItem("haveAcount"))
if(!haveAcount){
    button.preventDefault()
    button.stopPropagation()
}
    button.addEventListener("click", function () {

        let card = button.closest(".card");

        let img = card.querySelector(".card-img-top").src;

        let name = card.querySelector(".card-title").textContent;

        let price = card.querySelector(".parg").textContent;
        let existingProduct = cart.find(function (product) {

            return product.name === name;

        });


        if (existingProduct) {

            existingProduct.quantity++;

        } else {

            cart.push({

                img: img,
                name: name,
                price: price,
                quantity: 1

            });

        }
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
        updateCartCount();

    });

});
function displayCart() {

    cartContainer.innerHTML = "";

    cart.forEach(function (product, index) {

        let div = document.createElement("div");

        div.classList.add("d-flexMain", "modalDiv");

        div.innerHTML = `

            <div class="right d-flex d-flexP">

                <img src="${product.img}" alt="">

                <span>

                    <p class="NameOfMedicine">
                        ${product.name}
                    </p>

                    <small class="PriceOfMedicine">
                        ${product.price}
                    </small>

                </span>

            </div>


            <div class="modalIcon">

                <i 
                    class="Plus bi bi-plus-square-fill"
                    onclick="increase(${index})">
                </i>

                <small 
                    style="font-size: 20px; margin: 0 10px;">
                    ${product.quantity}
                </small>

                <i 
                    class="Minus bi bi-dash-square-fill"
                    onclick="decrease(${index})">
                </i>

            </div>

        `;

        cartContainer.appendChild(div);

    });

}
function increase(index) {

    cart[index].quantity++;

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();

    updateCartCount();

}
JSON.parse(localStorage.getItem("cart")) || [];
function decrease(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();

    updateCartCount();

}

function updateCartCount() {
 let currentUser=JSON.parse(localStorage.getItem("currentUser"))
        if(currentUser){
    let count = document.querySelector("#count");
    let counter =document.querySelector("#counter")
    if (!count) return;
    if (!counter) return;
    let total = 0;

    cart.forEach(function (product) {

        total += product.quantity;

    });

    count.textContent = total;
    counter.textContent = total;
    
}}
displayCart();
updateCartCount();
