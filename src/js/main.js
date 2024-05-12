// import { initializeCartCount } from "./CartCount.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter } from "./utils.mjs"; // Make sure to import loadHeaderFooter

// Load header and footer
loadHeaderFooter();

// // Initialize the cart count functionality
// initializeCartCount();


const dataSource = new ProductData("tents");
const element = document.querySelector(".product-list");
const listing = new ProductList("Tents", dataSource, element);

// Initialize the product listing
listing.init();
