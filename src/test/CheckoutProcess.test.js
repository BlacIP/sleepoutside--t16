import CheckoutProcess from '../js/CheckoutProcess.mjs';
import { getLocalStorage, removeLocalStorage } from '../js/utils.mjs';
import ExternalServices from '../js/ExternalServices.mjs';
import { refreshCartCount } from '../js/CartCount.mjs';
import Alert from '../js/alerts.js';

// Mock dependencies
jest.mock('../js/utils.mjs', () => ({
  getLocalStorage: jest.fn(),
  removeLocalStorage: jest.fn(),
}));

jest.mock('../js/ExternalServices.mjs');

jest.mock('../js/CartCount.mjs', () => ({
  refreshCartCount: jest.fn(),
}));

jest.mock('../js/alerts.js', () => ({
  alertMessage: jest.fn(),
}));

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});


describe('CheckoutProcess', () => {
  let checkoutProcess;
  const mockCartKey = 'so-cart';
  const mockOutputSelector = '.order-summary'; // Example selector, not directly used in current tests

  const mockCartItems = [
    { Id: 'item1', Name: 'Item 1', FinalPrice: 10, quantity: 2 }, // 20
    { Id: 'item2', Name: 'Item 2', FinalPrice: 25, quantity: 1 }, // 25
  ]; // Total: 45

  beforeEach(() => {
    jest.clearAllMocks();

    // DOM setup for summary elements
    document.body.innerHTML = `
      <div id="subtotal"></div>
      <div id="shipping"></div>
      <div id="tax"></div>
      <div id="total"></div>
      <form id="checkout-form">
        <input name="fname" value="Test"/>
        <input name="lname" value="User"/>
        <input name="street" value="123 Street"/>
        <input name="city" value="City"/>
        <input name="state" value="ST"/>
        <input name="zip" value="12345"/>
        <input name="cardNumber" value="1234567890123456"/>
        <input name="expiration" value="12/25"/>
        <input name="code" value="123"/>
      </form>
    `;
    
    checkoutProcess = new CheckoutProcess(mockCartKey, mockOutputSelector);
  });

  describe('Initialization and Calculation', () => {
    it('should initialize with cart data and calculate totals', () => {
      getLocalStorage.mockReturnValue(mockCartItems);
      checkoutProcess.init();

      expect(getLocalStorage).toHaveBeenCalledWith(mockCartKey);
      expect(checkoutProcess.list).toEqual(mockCartItems);
      
      // ItemTotal = (10*2) + (25*1) = 45
      expect(checkoutProcess.itemTotal).toBe(45);
      expect(document.getElementById('subtotal').textContent).toBe('$ 45.00');

      // Shipping = 10 + (2-1)*2 = 12
      // Tax = 45 * 0.06 = 2.7
      // OrderTotal = 45 + 12 + 2.7 = 59.7
      expect(checkoutProcess.shipping).toBe(12);
      expect(checkoutProcess.tax).toBeCloseTo(2.7);
      expect(checkoutProcess.orderTotal).toBeCloseTo(59.7);

      expect(document.getElementById('shipping').textContent).toBe('$ 12.00');
      expect(document.getElementById('tax').textContent).toBe('$ 2.70');
      expect(document.getElementById('total').textContent).toBe('$ 59.70');
    });

    it('should handle an empty cart during initialization', () => {
      getLocalStorage.mockReturnValue([]);
      checkoutProcess.init();

      expect(checkoutProcess.itemTotal).toBe(0);
      expect(document.getElementById('subtotal').textContent).toBe('$ 0.00');
      // Shipping = 10 + (0-1)*2 = 8 (assuming length 0 means -1 in formula, or min 10 if list empty)
      // The formula is 10 + (this.list.length - 1) * 2. If list.length is 0, this is 10 + (-1)*2 = 8.
      // Let's check the implementation: if length is 0, shipping is 10 + (-1)*2 = 8
      expect(checkoutProcess.shipping).toBe(8); 
      expect(checkoutProcess.tax).toBe(0);
      expect(checkoutProcess.orderTotal).toBe(8); // 0 + 8 + 0

      expect(document.getElementById('shipping').textContent).toBe('$ 8.00');
      expect(document.getElementById('tax').textContent).toBe('$ 0.00');
      expect(document.getElementById('total').textContent).toBe('$ 8.00');
    });
  });

  describe('Checkout method - Successful', () => {
    let mockForm;

    beforeEach(() => {
      getLocalStorage.mockReturnValue(mockCartItems);
      checkoutProcess.init(); // Initialize totals

      ExternalServices.prototype.checkout.mockResolvedValue({
        orderId: '12345',
        message: 'Order processed successfully',
      });
      mockForm = document.getElementById('checkout-form');
      jest.spyOn(mockForm, 'reset'); // Spy on form.reset
    });

    it('should process checkout, clear storage, and redirect', async () => {
      await checkoutProcess.checkout(mockForm);
      
      // Check if ExternalServices.checkout was called correctly
      expect(ExternalServices.prototype.checkout).toHaveBeenCalledTimes(1);
      const orderPayload = ExternalServices.prototype.checkout.mock.calls[0][0];
      expect(orderPayload.fname).toBe('Test');
      expect(orderPayload.orderTotal).toBe(checkoutProcess.orderTotal.toFixed(2));
      expect(orderPayload.items.length).toBe(mockCartItems.length);

      // Check alerts and local storage
      expect(Alert.alertMessage).toHaveBeenCalledWith("Order placed successfully", true);
      expect(removeLocalStorage).toHaveBeenCalledWith(mockCartKey);
      expect(checkoutProcess.list).toEqual([]); // list should be empty
      
      // Check cart count and form reset
      expect(refreshCartCount).toHaveBeenCalled();
      expect(mockForm.reset).toHaveBeenCalled();

      // Check totals are recalculated (should be for empty cart)
      expect(document.getElementById('subtotal').textContent).toBe('$ 0.00');
      expect(document.getElementById('shipping').textContent).toBe('$ 8.00'); // Shipping for 0 items
      expect(document.getElementById('tax').textContent).toBe('$ 0.00');
      expect(document.getElementById('total').textContent).toBe('$ 8.00');

      // Check redirect
      expect(window.location.href).toBe('/checkout/success.html');
    });
  });
  
  describe('Checkout method - Failure', () => {
    let mockForm;
    const mockError = { message: { cardNumber: 'Invalid card number', general: 'A general error' } };

    beforeEach(() => {
      getLocalStorage.mockReturnValue(mockCartItems);
      checkoutProcess.init();

      ExternalServices.prototype.checkout.mockRejectedValue(mockError);
      mockForm = document.getElementById('checkout-form');
      jest.spyOn(mockForm, 'reset');
    });

    it('should display error messages and not clear cart or redirect on failure', async () => {
      await checkoutProcess.checkout(mockForm);

      expect(ExternalServices.prototype.checkout).toHaveBeenCalledTimes(1);
      
      // Check that all error messages from the error object were displayed
      expect(Alert.alertMessage).toHaveBeenCalledWith(mockError.message.cardNumber, true);
      expect(Alert.alertMessage).toHaveBeenCalledWith(mockError.message.general, true);
      expect(Alert.alertMessage).toHaveBeenCalledTimes(Object.keys(mockError.message).length);

      // Ensure cart is not cleared and no redirect
      expect(removeLocalStorage).not.toHaveBeenCalled();
      expect(refreshCartCount).not.toHaveBeenCalled();
      expect(mockForm.reset).not.toHaveBeenCalled();
      expect(window.location.href).not.toBe('/checkout/success.html'); // original value or previous test value
      
      // Ensure list and totals are not reset
      expect(checkoutProcess.list).toEqual(mockCartItems);
      expect(document.getElementById('subtotal').textContent).toBe('$ 45.00'); // Original total
    });
  });
});
