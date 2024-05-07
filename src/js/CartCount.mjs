
import { getLocalStorage } from "./utils.mjs";
// Function to update the cart count
function updateCartCount() {
    const cartItems = getLocalStorage("so-cart") || [];
    // Update the cart count to reflect the number of unique products, not the total quantity
    const uniqueProductCount = cartItems.length; // This now represents the count of unique items
    document.querySelector(".cart-count").textContent = uniqueProductCount;
}
export function refreshCartCount() {
    updateCartCount();
}

// This function is exported so it can be called from elsewhere if necessary
export function initializeCartCount() {
    document.addEventListener("DOMContentLoaded", updateCartCount);
}

export function updateCartTotal() {
    const cartItems = getLocalStorage("so-cart") || [];
    const total = cartItems.reduce((acc, item) => acc + (item.FinalPrice * item.quantity), 0);
    const cartTotalElement = document.querySelector(".cart-total");
    cartTotalElement.innerHTML = `Total: $${total.toFixed(2)}`;

    const cartFooter = document.querySelector(".cart-footer");
    cartFooter.classList.toggle("hide", cartItems.length === 0);
}