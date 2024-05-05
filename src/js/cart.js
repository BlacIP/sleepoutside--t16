import { getLocalStorage,setLocalStorage } from "./utils.mjs";
import { refreshCartCount, updateCartTotal } from "./CartCount.mjs";

function renderCartContents() {
    const cartItems = getLocalStorage("so-cart") || [];
    const productList = document.querySelector(".product-list");

    if (cartItems.length > 0) {
        const htmlItems = cartItems.map((item) => cartItemTemplate(item));
        productList.innerHTML = htmlItems.join("");

        // Attach event listeners to each "X"
        const removeButtons = productList.querySelectorAll(".remove-item");
        removeButtons.forEach(button => {
            button.addEventListener("click", function(e) {
                const idToRemove = e.target.dataset.id;
                removeItemFromCart(idToRemove);
            });
        });

        // Calculate total
        const total = cartItems.reduce((acc, item) => acc + (item.FinalPrice * item.quantity), 0);
        const cartTotalElement = document.querySelector(".cart-total");
        cartTotalElement.innerHTML = `Total: $${total.toFixed(2)}`;

        // Show the cart footer
        const cartFooter = document.querySelector(".cart-footer");
        cartFooter.classList.remove("hide");
    } else {
        productList.innerHTML = "<p>Your cart is empty.</p>";
    }
}

function removeItemFromCart(id) {
    let cartItems = getLocalStorage("so-cart") || [];
    cartItems = cartItems.filter(item => item.Id !== id);
    setLocalStorage("so-cart", cartItems);
    refreshCartCount();  // Update cart count immediately
    updateCartTotal();  // Update total immediately after removal
    renderCartContents(); // Re-render the cart contents after removal
}





function cartItemTemplate(item) {
    // Check if the product is discounted
    const isDiscounted = item.FinalPrice < item.SuggestedRetailPrice;
    const discountPercentage = isDiscounted ? 
        ((item.SuggestedRetailPrice - item.FinalPrice) / item.SuggestedRetailPrice * 100).toFixed(0) : 0;

    // Assuming the product detail pages are located at 'product_detail.html' and accept a 'productId' query parameter
    const productDetailUrl = `/product_pages/?product=${item.Id}`;

    return `<li class="cart-card divider" data-id="${item.Id}">
            <a href="${productDetailUrl}" class="cart-card__image">
                <img src="${item.Image}" alt="${item.Name}" />
            </a>
            <div>
                <a href="${productDetailUrl}">
                    <h2 class="card__name">${item.Name}</h2>
                </a>
                <p class="cart-card__color">${item.Colors[0].ColorName}</p>
                <p class="cart-card__quantity">Qty: ${item.quantity}</p>
                <p class="cart-card__price">$${item.FinalPrice}
                    ${isDiscounted ? `<span class="discount-tag">-${discountPercentage}%</span>` : ""}
                </p>
                ${isDiscounted ? `<p class="original-price">$${item.SuggestedRetailPrice}</p>` : ""}
            </div>
       <div> <span class="remove-item" data-id="${item.Id}">X</span> </div>
    </li>`;
}



// Initialize cart count functionality
refreshCartCount();


document.addEventListener("DOMContentLoaded", function() {
    renderCartContents();
    updateCartTotal(); // Make sure it's up-to-date on load
});
