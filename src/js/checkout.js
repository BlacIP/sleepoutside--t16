import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", document.querySelector(".order-summary"));
checkout.init();

document.getElementById("zip").addEventListener("blur", () => {
  checkout.calculateOrderTotal();
});

document.getElementById("checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  checkout.checkout(event.target);
});