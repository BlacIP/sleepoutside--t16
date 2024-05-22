/* eslint-disable no-console */
import { getLocalStorage, removeLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import { refreshCartCount } from "./CartCount.mjs"; 

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
    this.list = getLocalStorage(this.key);
    this.calculateItemSummary();
    this.calculateOrderTotal();
  }

  calculateItemSummary() {
    this.itemTotal = this.list.reduce((total, item) => total + item.FinalPrice * item.quantity, 0);
    document.getElementById("subtotal").textContent = `$ ${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    const shipping = 10 + (this.list.length - 1) * 2;
    const tax = this.itemTotal * 0.06;
    this.shipping = shipping;
    this.tax = tax;
    this.orderTotal = this.itemTotal + shipping + tax;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    document.getElementById("shipping").textContent = `$ ${this.shipping.toFixed(2)}`;
    document.getElementById("tax").textContent = `$ ${this.tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$ ${this.orderTotal.toFixed(2)}`;
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
    console.log("Order object:", order); 
    const externalServices = new ExternalServices();
    try {
      const response = await externalServices.checkout(order);
      alert("Order placed successfully");
      console.log(response); 

      // Clear the cart
      removeLocalStorage(this.key);
      this.list = [];
      this.calculateItemSummary();
      this.calculateOrderTotal();

      // Reset the form
      form.reset();

      // Update the cart count
      refreshCartCount();

      // Reset shipping and tax display
      document.getElementById("shipping").textContent = `$ 0.00`;
      document.getElementById("tax").textContent = `$ 0.00`;
      document.getElementById("total").textContent = `$ 0.00`;
    } catch (error) {
      alert("There was an issue with your order");
      console.error(error); 
    }
  }
}
