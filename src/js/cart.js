import { getLocalStorage } from "./utils.mjs";
import { initializeCartCount } from "./CartCount.mjs";

function renderCartContents() {
    const cartItems = getLocalStorage("so-cart") || [];
    const productList = document.querySelector(".product-list");

    if (cartItems.length > 0) {
        const htmlItems = cartItems.map((item) => cartItemTemplate(item));
        productList.innerHTML = htmlItems.join("");

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

function cartItemTemplate(item) {
  // Check if the product is discounted
  const isDiscounted = item.FinalPrice < item.SuggestedRetailPrice;
  const discountPercentage = isDiscounted ? 
      ((item.SuggestedRetailPrice - item.FinalPrice) / item.SuggestedRetailPrice * 100).toFixed(0) : 0;

  return `<li class="cart-card divider">
      <a href="#" class="cart-card__image">
          <img src="${item.Image}" alt="${item.Name}" />
      </a>
      <a href="#">
          <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">Qty: ${item.quantity}</p>
      <p class="cart-card__price">$${item.FinalPrice}
          ${isDiscounted ? `<span class="discount-tag">-${discountPercentage}%</span>` : ""}
      </p>
      ${isDiscounted ? `<p class="original-price">Was $${item.SuggestedRetailPrice}</p>` : ""}
  </li>`;
}


// Initialize cart count functionality
initializeCartCount();


document.addEventListener("DOMContentLoaded", renderCartContents);
