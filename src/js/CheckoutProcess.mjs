/* eslint-disable no-console */
import { getLocalStorage, removeLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import { refreshCartCount } from "./CartCount.mjs";
import Alert from "./alerts.js";

function packageItems(items) {
  return items.map(item => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: item.quantity
  }));
}

function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
    this.calculateOrderTotal();
  }

  calculateItemSummary() {
    const subtotalElem = document.getElementById("subtotal");
    if (subtotalElem) {
      this.itemTotal = this.list.reduce((total, item) => total + item.FinalPrice * item.quantity, 0);
      subtotalElem.textContent = `$ ${this.itemTotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    const shippingElem = document.getElementById("shipping");
    const taxElem = document.getElementById("tax");
    const totalElem = document.getElementById("total");

    const shipping = 10 + (this.list.length - 1) * 2;
    const tax = this.itemTotal * 0.06;
    this.shipping = shipping;
    this.tax = tax;
    this.orderTotal = this.itemTotal + shipping + tax;

    if (shippingElem) {
      shippingElem.textContent = `$ ${this.shipping.toFixed(2)}`;
    }
    if (taxElem) {
      taxElem.textContent = `$ ${this.tax.toFixed(2)}`;
    }
    if (totalElem) {
      totalElem.textContent = `$ ${this.orderTotal.toFixed(2)}`;
    }
  }

  async checkout(form) {
    const formDataJSON = formDataToJSON(form);
    const order = {
      orderDate: new Date().toISOString(),
      fname: formDataJSON.fname,
      lname: formDataJSON.lname,
      street: formDataJSON.street,
      city: formDataJSON.city,
      state: formDataJSON.state,
      zip: formDataJSON.zip,
      cardNumber: formDataJSON.cardNumber,
      expiration: formDataJSON.expiration,
      code: formDataJSON.code,
      items: packageItems(this.list),
      orderTotal: this.orderTotal.toFixed(2),
      shipping: this.shipping.toFixed(2),
      tax: this.tax.toFixed(2)
    };
    console.log("Order object:", order); // Log order object
    const externalServices = new ExternalServices();
    try {
      const response = await externalServices.checkout(order);
      Alert.alertMessage("Order placed successfully", true);
      console.log(response); // For debugging purposes, remove in production

      // Clear the cart
      removeLocalStorage(this.key);
      this.list = [];
      this.calculateItemSummary();
      this.calculateOrderTotal();

      // Reset the form
      form.reset();

      // Update the cart count
      refreshCartCount();

      // Redirect to the success page
      window.location.href = "/checkout/success.html";
    } catch (error) {
      const errorMessages = error.message;
      for (const key in errorMessages) {
        if (Object.prototype.hasOwnProperty.call(errorMessages, key)) {
          Alert.alertMessage(errorMessages[key], true);
        }
      }
      console.error(error); // For debugging purposes, remove in production
    }
  }
}
