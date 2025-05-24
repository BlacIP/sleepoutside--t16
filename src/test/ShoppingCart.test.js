import ShoppingCart from '../js/ShoppingCart.mjs';
import { getLocalStorage, setLocalStorage } from '../js/utils.mjs';
import { refreshCartCount, updateCartTotal } from '../js/CartCount.mjs';

// Mock dependencies
jest.mock('../js/utils.mjs', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

jest.mock('../js/CartCount.mjs', () => ({
  refreshCartCount: jest.fn(),
  updateCartTotal: jest.fn(),
}));

describe('ShoppingCart', () => {
  let shoppingCart;
  let listElement;

  const mockCartItem1 = {
    Id: 'prod1',
    Name: 'Product 1',
    FinalPrice: 100,
    SuggestedRetailPrice: 120, // Discounted
    Images: { PrimaryMedium: 'prod1.jpg' },
    Colors: [{ ColorName: 'Red' }],
    quantity: 1,
  };
  const mockCartItem2 = {
    Id: 'prod2',
    Name: 'Product 2',
    FinalPrice: 50,
    SuggestedRetailPrice: 50, // Not discounted
    Images: { PrimaryMedium: 'prod2.jpg' },
    Colors: [{ ColorName: 'Blue' }],
    quantity: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<ul class="product-list"></ul>';
    listElement = document.querySelector('.product-list');
    shoppingCart = new ShoppingCart(listElement);
  });

  describe('Rendering', () => {
    it('should render "Your cart is empty." when no items are in localStorage', () => {
      getLocalStorage.mockReturnValue([]);
      shoppingCart.render();
      expect(listElement.innerHTML).toBe('<p>Your cart is empty.</p>');
    });

    it('should render items from localStorage', () => {
      getLocalStorage.mockReturnValue([mockCartItem1, mockCartItem2]);
      shoppingCart.render();

      expect(listElement.innerHTML).toContain(mockCartItem1.Name);
      expect(listElement.innerHTML).toContain(mockCartItem2.Name);
      expect(listElement.innerHTML).toContain(`$${mockCartItem1.FinalPrice}`);
      // Check for discount rendering for item 1
      const discountPercentage1 = ((mockCartItem1.SuggestedRetailPrice - mockCartItem1.FinalPrice) / mockCartItem1.SuggestedRetailPrice * 100).toFixed(0);
      expect(listElement.innerHTML).toContain(`-${discountPercentage1}%`);
      
      // Check for quantity controls and remove buttons
      expect(listElement.querySelector(`.remove-item[data-id="${mockCartItem1.Id}"]`)).not.toBeNull();
      expect(listElement.querySelector(`.increase-quantity[data-id="${mockCartItem1.Id}"]`)).not.toBeNull();
      expect(listElement.querySelector(`.decrease-quantity[data-id="${mockCartItem1.Id}"]`)).not.toBeNull();
    });
  });

  describe('Item Removal', () => {
    it('should remove an item from the cart and update UI and storage', () => {
      getLocalStorage.mockReturnValue([mockCartItem1, mockCartItem2]);
      // Initial render to set up the listElement content for spy
      shoppingCart.render(); 
      const renderSpy = jest.spyOn(shoppingCart, 'render');

      shoppingCart.removeItemFromCart(mockCartItem1.Id);

      expect(setLocalStorage).toHaveBeenCalledWith('so-cart', [mockCartItem2]);
      expect(refreshCartCount).toHaveBeenCalled();
      expect(updateCartTotal).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Quantity Change', () => {
    it('should increase item quantity and update UI and storage', () => {
      getLocalStorage.mockReturnValue([mockCartItem1]);
      shoppingCart.render();
      const renderSpy = jest.spyOn(shoppingCart, 'render');

      shoppingCart.changeItemQuantity(mockCartItem1.Id, 1);

      const expectedCart = [{ ...mockCartItem1, quantity: mockCartItem1.quantity + 1 }];
      expect(setLocalStorage).toHaveBeenCalledWith('so-cart', expectedCart);
      expect(refreshCartCount).toHaveBeenCalled();
      expect(updateCartTotal).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should decrease item quantity and update UI and storage', () => {
      const itemToDecrease = { ...mockCartItem2, quantity: 2 }; // Start with quantity 2
      getLocalStorage.mockReturnValue([itemToDecrease]);
      shoppingCart.render();
      const renderSpy = jest.spyOn(shoppingCart, 'render');

      shoppingCart.changeItemQuantity(itemToDecrease.Id, -1);

      const expectedCart = [{ ...itemToDecrease, quantity: 1 }];
      expect(setLocalStorage).toHaveBeenCalledWith('so-cart', expectedCart);
      expect(refreshCartCount).toHaveBeenCalled();
      expect(updateCartTotal).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should remove item if quantity decreases to 0', () => {
      getLocalStorage.mockReturnValue([mockCartItem1]); // quantity is 1
      shoppingCart.render();
      const renderSpy = jest.spyOn(shoppingCart, 'render');

      shoppingCart.changeItemQuantity(mockCartItem1.Id, -1); // Decrease by 1 to make it 0

      expect(setLocalStorage).toHaveBeenCalledWith('so-cart', []); // Item should be removed
      expect(refreshCartCount).toHaveBeenCalled();
      expect(updateCartTotal).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });
     it('should remove item if quantity decreases below 0', () => {
      getLocalStorage.mockReturnValue([mockCartItem1]); // quantity is 1
      shoppingCart.render();
      const renderSpy = jest.spyOn(shoppingCart, 'render');

      shoppingCart.changeItemQuantity(mockCartItem1.Id, -2); // Decrease by 2 to make it -1

      expect(setLocalStorage).toHaveBeenCalledWith('so-cart', []); // Item should be removed
      expect(refreshCartCount).toHaveBeenCalled();
      expect(updateCartTotal).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('cartItemTemplate', () => {
    it('should generate correct HTML for a discounted item', () => {
      const html = shoppingCart.cartItemTemplate(mockCartItem1);
      expect(html).toContain(mockCartItem1.Name);
      expect(html).toContain(`$${mockCartItem1.FinalPrice}`);
      const discountPercentage = ((mockCartItem1.SuggestedRetailPrice - mockCartItem1.FinalPrice) / mockCartItem1.SuggestedRetailPrice * 100).toFixed(0);
      expect(html).toContain(`-${discountPercentage}%`);
      expect(html).toContain(`$${mockCartItem1.SuggestedRetailPrice}`); // Original price
      expect(html).toContain(`data-id="${mockCartItem1.Id}"`);
      expect(html).toContain(`class="cart-card__quantity"> ${mockCartItem1.quantity}`);
    });

    it('should generate correct HTML for a non-discounted item', () => {
      const html = shoppingCart.cartItemTemplate(mockCartItem2);
      expect(html).toContain(mockCartItem2.Name);
      expect(html).toContain(`$${mockCartItem2.FinalPrice}`);
      expect(html).not.toContain(`discount-tag`); // No discount tag
      expect(html).not.toContain(`original-price`); // No original price displayed if not discounted
      expect(html).toContain(`data-id="${mockCartItem2.Id}"`);
      expect(html).toContain(`class="cart-card__quantity"> ${mockCartItem2.quantity}`);
    });
    
    it('should handle item with missing image gracefully', () => {
      const itemWithoutImage = { ...mockCartItem1, Images: null };
      const html = shoppingCart.cartItemTemplate(itemWithoutImage);
      expect(html).toContain('src="path/to/default/image.jpg"');
    });

    it('should handle item with missing colors gracefully', () => {
      const itemWithoutColors = { ...mockCartItem1, Colors: [] };
      const html = shoppingCart.cartItemTemplate(itemWithoutColors);
      expect(html).toContain("Color not available");
    });
  });
});
