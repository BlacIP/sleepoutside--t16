// Ensure the refreshCartCount function in CartCount.mjs calls animateCartIcon
  import { getLocalStorage } from "./utils.mjs";
  import { animateCartIcon } from "./utils.mjs";
  
  function updateCartCount() {
      const cartItems = getLocalStorage("so-cart") || [];
      const uniqueProductCount = cartItems.length;
      document.querySelector(".cart-count").textContent = uniqueProductCount;
      animateCartIcon(); // Trigger the animation
  }
  
  export function refreshCartCount() {
      updateCartCount();
  }
  
  export function initializeCartCount() {
      document.addEventListener("DOMContentLoaded", updateCartCount);
  }
  
  export function updateCartTotal() {
      const cartItems = getLocalStorage("so-cart") || [];
      const total = cartItems.reduce((acc, item) => acc + (item.FinalPrice * item.quantity), 0);
      
      const cartTotalElement = document.querySelector(".cart-subtotal .amount");
      cartTotalElement.innerHTML = `$ ${total.toFixed(2)}`;
  
      const checkoutButton = document.querySelector(".checkout-button");
      checkoutButton.innerHTML = `CHECKOUT ($ ${total.toFixed(2)})`;
  
      const cartFooter = document.querySelector(".cart-footer");
      cartFooter.classList.toggle("hide", cartItems.length === 0);
  }
  