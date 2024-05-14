import { loadHeaderFooter, getParams } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

loadHeaderFooter();

const query = getParams("query");
const dataSource = new ProductData();
const element = document.querySelector(".product-list");
const titleElement = document.querySelector(".title");

if (query) {
  titleElement.innerHTML = `Search Results for "${query}"`;
  const searchListing = new ProductList(query, dataSource, element, true);
  searchListing.init();
} else {
  const category = getParams("category");
  if (category) {
    titleElement.innerHTML = category;
    const categoryListing = new ProductList(
      category,
      dataSource,
      element,
      false,
    );
    categoryListing.init();
  }
}
