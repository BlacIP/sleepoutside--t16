// import { initializeCartCount } from "./CartCount.mjs";
import { loadHeaderFooter } from "./utils.mjs"; // Make sure to import loadHeaderFooter
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

// Load header and footer
loadHeaderFooter();



const dataSource = new ProductData("tents");
const element = document.querySelector(".product-list");
const listing = new ProductList("Tents", dataSource, element);

// Initialize the product listing
listing.init();
