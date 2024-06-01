import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";
import Alert from "./alerts.js"; // Import the Alert class for alert messages

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", document.querySelector(".order-summary"));
checkout.init();

document.getElementById("zip").addEventListener("blur", () => {
  checkout.calculateOrderTotal();
});

document.getElementById("checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  
  const myForm = document.forms[0];
  const chk_status = myForm.checkValidity();
  myForm.reportValidity();
  
  if (chk_status) {
    checkout.checkout(event.target);
  } else {
    Alert.alertMessage("Please fill out all required fields correctly.", true);
  }
});
