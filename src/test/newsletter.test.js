import { initNewsletterForm } from '../js/newsletter.js';

// Use Jest's fake timers
jest.useFakeTimers();

describe('Newsletter Subscription with Jest', () => {
  let newsletterForm;
  let emailInput;
  let successMessageElement;
  let errorMessageElement;

  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <div id="test-container">
        <section class="newsletter">
          <h2>Sign Up for Our Newsletter</h2>
          <form id="newsletter-form">
            <div class="subscribe">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" required />
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <p class="success-message" style="display: none; color: green;"></p>
          <p class="error-message" style="display: none; color: red;"></p>
        </section>
      </div>
    `;

    // Initialize the newsletter form logic on the new DOM
    initNewsletterForm();

    // Get elements for tests
    newsletterForm = document.getElementById('newsletter-form');
    emailInput = document.getElementById('email');
    // Query within the test container to be more specific if needed,
    // but form's parentNode logic in newsletter.js means these should be fine.
    const formContainer = newsletterForm.parentNode;
    successMessageElement = formContainer.querySelector('.success-message');
    errorMessageElement = formContainer.querySelector('.error-message');

    // Basic check to ensure elements are found
    if (!newsletterForm || !emailInput || !successMessageElement || !errorMessageElement) {
        throw new Error("One or more essential DOM elements were not found in beforeEach. Check HTML structure and selectors.");
    }
  });

  afterEach(() => {
    // Clear all timers after each test
    jest.clearAllTimers();
    // Clean up the DOM
    document.body.innerHTML = '';
  });

  test('should display success message for valid email submission', () => {
    emailInput.value = 'test@example.com';

    // Dispatch submit event
    // Using a real event for better simulation
    const event = new Event('submit', { bubbles: true, cancelable: true });
    newsletterForm.dispatchEvent(event);

    // Fast-forward timers
    jest.runAllTimers();

    expect(successMessageElement.style.display).toBe('block');
    expect(successMessageElement.textContent).toBe('Thank you for signing up!');
    expect(errorMessageElement.style.display).toBe('none');
    expect(emailInput.value).toBe(''); // Form should be reset
  });

  test('should display error message for empty email submission', () => {
    emailInput.value = ''; // Empty email

    const event = new Event('submit', { bubbles: true, cancelable: true });
    newsletterForm.dispatchEvent(event);

    // No need to run timers for the error case as it's synchronous

    expect(errorMessageElement.style.display).toBe('block');
    expect(errorMessageElement.textContent).toBe('Please enter a valid email address.');
    expect(successMessageElement.style.display).toBe('none');
  });

  test('should hide previous error message on successful submission', () => {
    // First, trigger an error
    emailInput.value = '';
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(errorMessageElement.style.display).toBe('block');
    expect(successMessageElement.style.display).toBe('none');

    // Then, trigger a success
    emailInput.value = 'test@example.com';
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    jest.runAllTimers();

    expect(successMessageElement.style.display).toBe('block');
    expect(errorMessageElement.style.display).toBe('none');
  });

  test('should hide previous success message on new submission attempt (that fails)', () => {
    // First, trigger a success
    emailInput.value = 'success@example.com';
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    jest.runAllTimers();
    expect(successMessageElement.style.display).toBe('block');
    expect(errorMessageElement.style.display).toBe('none');
    
    // Then, trigger an error
    emailInput.value = ''; // Empty email for the error
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    // No timers needed for error path

    expect(errorMessageElement.style.display).toBe('block');
    expect(successMessageElement.style.display).toBe('none');
  });
});
