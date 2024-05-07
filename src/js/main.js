import { initializeCartCount } from "./CartCount.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

// Initialize cart count functionality
initializeCartCount();

const dataSource = new ProductData("tents");
const element = document.querySelector(".product-list");
const listing = new ProductList("Tents", dataSource, element);

listing.init();

