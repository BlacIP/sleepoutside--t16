import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { refreshCartCount, updateCartTotal } from "./CartCount.mjs";

class ShoppingCart {
  constructor(listElement) {
    this.listElement = listElement;
  }

  render() {
    const cartItems = getLocalStorage("so-cart") || [];
    if (cartItems.length > 0) {
      this.renderCartItems(cartItems);
      this.attachEventListeners();
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

    const increaseButtons = this.listElement.querySelectorAll(".increase-quantity");
    increaseButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const idToIncrease = e.target.dataset.id;
        this.changeItemQuantity(idToIncrease, 1);
      });
    });

    const decreaseButtons = this.listElement.querySelectorAll(".decrease-quantity");
    decreaseButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const idToDecrease = e.target.dataset.id;
        this.changeItemQuantity(idToDecrease, -1);
      });
    });
  }

  removeItemFromCart(id) {
    let cartItems = getLocalStorage("so-cart") || [];
    cartItems = cartItems.filter(item => item.Id !== id);
    setLocalStorage("so-cart", cartItems);
    refreshCartCount();
    updateCartTotal();
    this.render();
  }

  changeItemQuantity(id, change) {
    let cartItems = getLocalStorage("so-cart") || [];
    const itemIndex = cartItems.findIndex(item => item.Id === id);
    if (itemIndex > -1) {
      cartItems[itemIndex].quantity += change;
      if (cartItems[itemIndex].quantity <= 0) {
        cartItems = cartItems.filter(item => item.Id !== id);
      }
    }
    setLocalStorage("so-cart", cartItems);
    refreshCartCount();
    updateCartTotal();
    this.render();
  }

  cartItemTemplate(item) {
    const isDiscounted = item.FinalPrice < item.SuggestedRetailPrice;
    const discountPercentage = isDiscounted ?
      ((item.SuggestedRetailPrice - item.FinalPrice) / item.SuggestedRetailPrice * 100).toFixed(0) : 0;
    const productDetailUrl = `/product_pages/?product=${item.Id}`;

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
                <div class="cart-card__quantity-controls">
                <p class="cart-card__quantity">Qty: ${item.quantity}</p>
                <div class="quantity-count">
                  <button class="decrease-quantity" data-id="${item.Id}">-</button>
                  <button class="increase-quantity" data-id="${item.Id}">+</button>
                  </div>
                </div>
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
