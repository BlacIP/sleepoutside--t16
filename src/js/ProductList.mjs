import { renderListWithTemplate } from "./utils.mjs";

const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];

function productCardTemplate(product) {
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
  constructor(query, dataSource, listElement, isSearch = false) {
    this.query = query;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.isSearch = isSearch;
    this.sortOption = "name-asc"; // Default sort option
  }

  async init() {
    let allProducts = [];
    for (const category of categories) {
      const products = await this.dataSource.getData(category);
      allProducts = allProducts.concat(products);
    }

    let list = [];
    if (this.isSearch) {
      list = this.filterProducts(allProducts, this.query);
    } else {
      list = allProducts.filter(product => product.Category === this.query);
    }

    list = this.sortProducts(list, this.sortOption);
    this.renderList(list);
    document.querySelector(".title").innerHTML = this.query;

    // Attach event listener for sorting
    document.querySelector("#sort").addEventListener("change", (e) => {
      this.sortOption = e.target.value;
      list = this.sortProducts(list, this.sortOption);
      this.renderList(list);
    });
  }

  filterProducts(products, query) {
    const lowerQuery = query.toLowerCase();
    return products.filter(product => {
      const inBrand = product.Brand && product.Brand.Name.toLowerCase().includes(lowerQuery);
      const inName = product.Name && product.Name.toLowerCase().includes(lowerQuery);
      const inColor = product.Colors && product.Colors.some(color => color.ColorName.toLowerCase().includes(lowerQuery));
      const inPrice = product.FinalPrice && `${product.FinalPrice}`.includes(lowerQuery);
      return inBrand || inName || inColor || inPrice;
    });
  }

  sortProducts(products, sortOption) {
    switch (sortOption) {
      case "name-asc":
        return products.sort((a, b) => a.Name.localeCompare(b.Name));
      case "name-desc":
        return products.sort((a, b) => b.Name.localeCompare(a.Name));
      case "price-asc":
        return products.sort((a, b) => a.FinalPrice - b.FinalPrice);
      case "price-desc":
        return products.sort((a, b) => b.FinalPrice - a.FinalPrice);
      default:
        return products;
    }
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}
