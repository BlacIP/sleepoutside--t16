import { initNewsletterForm } from '../js/newsletter.js';
import { displayError } from '../js/errorHandler.js'; // Will be the mock

jest.mock('../js/errorHandler.js'); // Mock errorHandler module

// No RESEND_API_KEY, RESEND_API_URL, or ADMIN_EMAIL constants needed here anymore

describe('Newsletter Subscription with Netlify Function', () => {
  let newsletterForm;
  let emailInput;
  let successMessageElement;
  let submitButton; // For checking disabled state

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
          {/* Removed <p class="error-message"> as errorHandler.js handles this now */}
        </section>
      </div>
    `;

    // Initialize the newsletter form logic on the new DOM
    initNewsletterForm();

    // Get elements for tests
    newsletterForm = document.getElementById('newsletter-form');
    emailInput = document.getElementById('email');
    const formContainer = newsletterForm.parentNode;
    successMessageElement = formContainer.querySelector('.success-message');
    submitButton = newsletterForm.querySelector('button[type="submit"]');
    
    // Reset mocks before each test
    displayError.mockClear(); 
    global.fetch = jest.fn(); // Reset global.fetch mock

    // Basic check to ensure elements are found
    if (!newsletterForm || !emailInput || !successMessageElement || !submitButton) {
        throw new Error("One or more essential DOM elements were not found in beforeEach. Check HTML structure and selectors.");
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should display error for empty email submission', async () => {
    emailInput.value = '';
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(process.nextTick);

    expect(displayError).toHaveBeenCalledWith('Please enter a valid email address.');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(submitButton.disabled).toBe(false);
    expect(emailInput.disabled).toBe(false);
  });

  test('should call Netlify function and display success on valid submission', async () => {
    global.fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ message: 'Subscription successful! Welcome email sent.' }) 
    });

    const testUserEmail = 'test@example.com';
    emailInput.value = testUserEmail;
    
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submitButton.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);

    await new Promise(process.nextTick); 

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('/.netlify/functions/send-newsletter-email');
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
    expect(global.fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
    // No Authorization header check here
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ userEmail: testUserEmail });

    expect(successMessageElement.style.display).toBe('block');
    expect(successMessageElement.textContent).toBe('Thank you for signing up!'); // Or use the message from mocked json response
    expect(emailInput.value).toBe(''); // Form reset
    expect(displayError).not.toHaveBeenCalled();
    expect(submitButton.disabled).toBe(false); 
    expect(emailInput.disabled).toBe(false);
  });

  test('should display error if Netlify function call fails', async () => {
    const functionErrorMessage = 'Netlify function error: Something went wrong.';
    global.fetch.mockResolvedValueOnce({ 
      ok: false, 
      json: async () => ({ message: functionErrorMessage }) 
    });

    const testUserEmail = 'testfail@example.com';
    emailInput.value = testUserEmail;
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(submitButton.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);

    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('/.netlify/functions/send-newsletter-email');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ userEmail: testUserEmail });
    
    expect(displayError).toHaveBeenCalledWith(functionErrorMessage);
    expect(successMessageElement.style.display).toBe('none');
    expect(emailInput.value).toBe(testUserEmail); // Not reset
    expect(submitButton.disabled).toBe(false); 
    expect(emailInput.disabled).toBe(false);
  });
  
  // The test 'should show success to user even if admin notification email fails' is removed
  // as that logic is now encapsulated in the Netlify function.
});
