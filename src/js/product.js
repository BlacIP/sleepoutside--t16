// import { getLocalStorage, setLocalStorage, getParams } from "./utils.mjs";
// import ProductData from "./ProductData.mjs";
// const dataSource = new ProductData("tents");

// function addProductToCart(product) {
//   // Retrieve the current cart from local storage or initialize a new one
//   let cart = getLocalStorage("so-cart");
//   if (!cart) {
//     cart = {};
//   }

//   // Check if the product already exists in the cart
//   if (cart[product.Id]) {
//     // Note the change here from product.id to product.Id
//     // If product exists, increase the quantity
//     cart[product.Id].quantity += 1;
//   } else {
//     // If product does not exist, add it with quantity 1
//     cart[product.Id] = { ...product, quantity: 1 };
//   }

//   // Save the updated cart back to local storage
//   setLocalStorage("so-cart", cart);
// }

// // add to cart button event handler
// async function addToCartHandler(e) {
//   const product = await dataSource.findProductById(e.target.dataset.id);
//   addProductToCart(product);
// }

// // Add listener to Add to Cart button
// document
//   .getElementById("addToCart")
//   .addEventListener("click", addToCartHandler);

// const productId = getParams("product");

// // eslint-disable-next-line no-console
// console.log(dataSource.findProductById(productId));

import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const dataSource = new ProductData("tents");
const productId = getParam("product");

const product = new ProductDetails(productId, dataSource);
product.init();
