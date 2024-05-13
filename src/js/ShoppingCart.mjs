import { getLocalStorage, setLocalStorage} from "./utils.mjs";
import { refreshCartCount, updateCartTotal } from "./CartCount.mjs";

class ShoppingCart {
  constructor(listElement) {
    this.listElement = listElement;
  }

  render() {
    const cartItems = getLocalStorage("so-cart") || [];
    if (cartItems.length > 0) {
      this.renderCartItems(cartItems);
      this.attachEventListeners();  // Attach event listeners to remove buttons
    } else {
      this.listElement.innerHTML = "<p>Your cart is empty.</p>";
    }
  }

  renderCartItems(cartItems) {
    const itemsHtml = cartItems.map(item => this.cartItemTemplate(item)).join("");
    this.listElement.innerHTML = itemsHtml;
  }

  attachEventListeners() {
    const removeButtons = this.listElement.querySelectorAll(".remove-item");
    removeButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const idToRemove = e.target.dataset.id;
        this.removeItemFromCart(idToRemove);
      });
    });
  }

  removeItemFromCart(id) {
    let cartItems = getLocalStorage("so-cart") || [];
    cartItems = cartItems.filter(item => item.Id !== id);
    setLocalStorage("so-cart", cartItems);
    refreshCartCount();  // Update cart count immediately
    updateCartTotal();  // Update total immediately after removal
    this.render(); // Re-render the cart contents after removal
  }

  cartItemTemplate(item) {
    const isDiscounted = item.FinalPrice < item.SuggestedRetailPrice;
    const discountPercentage = isDiscounted ? 
      ((item.SuggestedRetailPrice - item.FinalPrice) / item.SuggestedRetailPrice * 100).toFixed(0) : 0;
    const productDetailUrl = `/product_pages/?product=${item.Id}`;

    // Use the PrimaryMedium image if available, otherwise, use a default image path
    const imageSrc = item.Images && item.Images.PrimaryMedium ? item.Images.PrimaryMedium : "path/to/default/image.jpg";

    return `<li class="cart-card divider" data-id="${item.Id}">
              <a href="${productDetailUrl}" class="cart-card__image">
                <img src="${imageSrc}" alt="Image of ${item.Name}" />
              </a>
              <div>
                <a href="${productDetailUrl}">
                  <h2 class="card__name">${item.Name}</h2>
                </a>
                <p class="cart-card__color">${item.Colors && item.Colors.length > 0 ? item.Colors[0].ColorName : "Color not available"}</p>
                <p class="cart-card__quantity">Qty: ${item.quantity}</p>
                <p class="cart-card__price">$${item.FinalPrice}
                  ${isDiscounted ? `<span class="discount-tag">-${discountPercentage}%</span>` : ""}
                </p>
                ${isDiscounted ? `<p class="original-price">$${item.SuggestedRetailPrice}</p>` : ""}
              </div>
              <div> <span class="remove-item" data-id="${item.Id}">X</span> </div>
            </li>`;
}
}

export default ShoppingCart;
