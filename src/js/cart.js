import { loadHeaderFooter } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";
import { updateCartTotal } from "./CartCount.mjs";

loadHeaderFooter();

document.addEventListener("DOMContentLoaded", function() {
  const productListElement = document.querySelector(".product-list");
  const shoppingCart = new ShoppingCart(productListElement);
  shoppingCart.render();
  updateCartTotal(); // Make sure it's up-to-date on load
});
