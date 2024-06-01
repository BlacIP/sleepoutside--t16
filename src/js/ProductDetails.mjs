import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { refreshCartCount } from "./CartCount.mjs";
import Alert from "./alerts.js"; // Import the Alert class

function productDetailsTemplate(product) {
  // Determine if there is a discount
  const isDiscounted = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPercentage = isDiscounted 
    ? ((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice * 100).toFixed(0)
    : 0;

  return `<section class="product-detail">
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.Name}</h2>
    <img class="divider" src="${product.Images.PrimaryLarge}" alt="${product.Name}" />
    <p class="product-card__price">
      ${isDiscounted 
        ? `$${product.FinalPrice} (<span class="discount-percentage">-${discountPercentage}%</span>)<span class="original-price">$${product.SuggestedRetailPrice}</span>` 
        : `$${product.FinalPrice}`}
    </p>
    <p class="product__color">Color: ${product.Colors[0].ColorName}</p>
    <p class="product__description">${product.DescriptionHtmlSimple}</p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
  </section>`;
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }
  
  async init() {
    // use our datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productId);
    // once we have the product details we can render out the HTML
    this.renderProductDetails("main");
    // once the HTML is rendered we can add a listener to Add to Cart button
    // Notice the .bind(this). Our callback will not work if we don't include that line. Review the readings from this week on 'this' to understand why.
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addToCart.bind(this));
  }

  addToCart() {
    // Retrieve existing cart items from local storage or initialize to an empty array if none exist
    const existingCart = getLocalStorage("so-cart") || [];
    // Check if the product already exists in the cart
    const existingProductIndex = existingCart.findIndex(p => p.Id === this.product.Id);
    if (existingProductIndex !== -1) {
      // If product exists, update quantity (if you want to implement quantity changes)
      existingCart[existingProductIndex].quantity = (existingCart[existingProductIndex].quantity || 1) + 1;
    } else {
      // If product does not exist, add it with quantity of 1
      this.product.quantity = 1;
      existingCart.push(this.product);
    }
    // Save the updated cart back to local storage
    setLocalStorage("so-cart", existingCart);
    // Initialize cart count functionality
    refreshCartCount();
    
    // Show success alert
    Alert.alertMessage("Item added to cart successfully", true);
  }
  
  renderProductDetails(selector) {
    const element = document.querySelector(selector);
    element.insertAdjacentHTML(
      "afterBegin",
      productDetailsTemplate(this.product)
    );
  }
}
