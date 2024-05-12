import { renderListWithTemplate } from "./utils.mjs";

// Define an array of product IDs that you want to display
const allowedProductIds = ["880RR", "985RF", "985PR", "344YJ"];  // Replace with actual product IDs you want to show

function productCardTemplate(product) {
  // Only render the card if the product's ID is in the allowedProductIds array
  if (!allowedProductIds.includes(product.Id)) {
    return "";  // Do not render anything for products not in the list
  }

  const isDiscounted = product.FinalPrice < product.SuggestedRetailPrice;
  const discountPercentage = isDiscounted ?
    ((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice * 100).toFixed(0) : 0;
    return `<li class="product-card">
    <a href="/product_pages/?product=${product.Id}">
      <img src="${product.Images.PrimaryMedium}" alt="Image of ${product.Name}" />
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.Name}</h2>
      <p class="product-card__price">
        ${isDiscounted ? `<span class="original-price">$${product.SuggestedRetailPrice}</span>$${product.FinalPrice}` : `$${product.FinalPrice}`}
        ${isDiscounted ? `<span class="discount-tag">(-${discountPercentage}%)</span>` : ""}
      </p>
    </a>
  </li>`;

}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    // We passed in this information to make our class as reusable as possible.
    // Being able to define these things when we use the class will make it very flexible
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }
  async init() {
    // our dataSource will return a Promise...so we can use await to resolve it.
    const list = await this.dataSource.getData(this.category);
    // render the list
    this.renderList(list);
    //set the title to the current category
    document.querySelector(".title").innerHTML = this.category;
  }
  // render after doing the first stretch
  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}