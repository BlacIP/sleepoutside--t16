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
    <button class="quick-view-btn" data-id="${product.Id}">Quick View</button>
    
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

    if (list.length === 0) {
      this.showNoResultsMessage();
    } else {
      document.querySelector(".title").innerHTML = this.query;
    }

    // Attach event listener for sorting
    document.querySelector("#sort").addEventListener("change", (e) => {
      this.sortOption = e.target.value;
      list = this.sortProducts(list, this.sortOption);
      this.renderList(list);
    });

    // Attach event listeners for quick view buttons
    this.addQuickViewEventListeners(list);
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

  showNoResultsMessage() {
    const noResultsMessage = document.createElement("p");
    noResultsMessage.className = "no-results";
    noResultsMessage.textContent = "No products found for your search.";
    this.listElement.appendChild(noResultsMessage);
  }

  addQuickViewEventListeners(products) {
    const quickViewButtons = document.querySelectorAll(".quick-view-btn");
    quickViewButtons.forEach(button => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-id");
        const product = products.find(p => p.Id === productId);
        this.showQuickViewModal(product);
      });
    });
  }

  showQuickViewModal(product) {
    const modal = document.getElementById("product-modal");
    const modalContent = document.getElementById("modal-product-details");
    modalContent.innerHTML = `
      <h3>${product.Brand.Name}</h3>
      <h2>${product.Name}</h2>
      <img src="${product.Images.PrimaryMedium}" alt="Image of ${product.Name}" />
      <p>${product.Description}</p>
      <p class="product-card__price">
        ${product.FinalPrice < product.SuggestedRetailPrice ? 
          `<span class="original-price">$${product.SuggestedRetailPrice}</span>$${product.FinalPrice}` : 
          `$${product.FinalPrice}`}
      </p>
    `;
    modal.style.display = "block";

    // Close modal on click of 'x' or outside of modal
    document.querySelector(".close").onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }
}
