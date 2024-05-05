
import { getLocalStorage } from "./utils.mjs";
// Function to update the cart count
function updateCartCount() {
    const cartItems = getLocalStorage("so-cart") || [];
    // Update the cart count to reflect the number of unique products, not the total quantity
    const uniqueProductCount = cartItems.length; // This now represents the count of unique items
    document.querySelector(".cart-count").textContent = uniqueProductCount;
}
// This function is exported so it can be called from elsewhere if necessary
export function initializeCartCount() {
    document.addEventListener("DOMContentLoaded", updateCartCount);
}
