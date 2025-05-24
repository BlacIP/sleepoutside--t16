import { initNewsletterForm } from '../js/newsletter.js';
import { displayError } from '../js/errorHandler.js'; // Will be the mock

jest.mock('../js/errorHandler.js'); // Mock errorHandler module

// No longer need jest.useFakeTimers()

describe('Newsletter Subscription with Resend API', () => {
  let newsletterForm;
  let emailInput;
  let successMessageElement;
  let submitButton; // For checking disabled state

  // Store the Resend API Key used in newsletter.js to check in headers
  // This must match the key in newsletter.js for tests to pass.
  const RESEND_API_KEY = 're_c58Vdr9p_BeEHFy5DtDc3Kng2Xc5ukhxq';
  const RESEND_API_URL = 'https://api.resend.com/emails';
  const ADMIN_EMAIL = 'omotoyinbobade15@gmail.com';

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
    // The event listener is async, so we await its completion by awaiting a promise that resolves after the current macrotask.
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(process.nextTick);

    expect(displayError).toHaveBeenCalledWith('Please enter a valid email address.');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(submitButton.disabled).toBe(false); // Should not be disabled if validation fails client-side quickly
    expect(emailInput.disabled).toBe(false);
  });

  test('should send emails and display success on valid submission', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'email_user_id' }) }) // Welcome email
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'email_admin_id' }) }); // Admin email

    const testUserEmail = 'test@example.com';
    emailInput.value = testUserEmail;
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    newsletterForm.dispatchEvent(submitEvent);

    // Check disabled state immediately after dispatch (before await)
    expect(submitButton.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);

    // Wait for promises to resolve
    await new Promise(process.nextTick); 

    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Check call 1 (User Welcome)
    expect(global.fetch.mock.calls[0][0]).toBe(RESEND_API_URL);
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${RESEND_API_KEY}`);
    const welcomePayload = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(welcomePayload.to[0]).toBe(testUserEmail);
    expect(welcomePayload.subject).toBe('Welcome to the Community!');

    // Check call 2 (Admin Notification)
    expect(global.fetch.mock.calls[1][0]).toBe(RESEND_API_URL);
    expect(global.fetch.mock.calls[1][1].method).toBe('POST');
    expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${RESEND_API_KEY}`);
    const adminPayload = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(adminPayload.to[0]).toBe(ADMIN_EMAIL);
    expect(adminPayload.html).toContain(testUserEmail);

    expect(successMessageElement.style.display).toBe('block');
    expect(successMessageElement.textContent).toBe('Thank you for signing up!');
    expect(emailInput.value).toBe(''); // Form reset
    expect(displayError).not.toHaveBeenCalled();
    expect(submitButton.disabled).toBe(false); 
    expect(emailInput.disabled).toBe(false);
  });

  test('should display error if user welcome email fails', async () => {
    global.fetch.mockResolvedValueOnce({ 
      ok: false, 
      json: async () => ({ message: 'Failed sending user email' }) 
    });

    const testUserEmail = 'testfail@example.com';
    emailInput.value = testUserEmail;
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(submitButton.disabled).toBe(true); // Check disabled state
    expect(emailInput.disabled).toBe(true);

    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(displayError).toHaveBeenCalledWith('Failed to send welcome email. Please try again.');
    expect(successMessageElement.style.display).toBe('none');
    expect(emailInput.value).toBe(testUserEmail); // Not reset
    expect(submitButton.disabled).toBe(false); 
    expect(emailInput.disabled).toBe(false);
  });
  
  test('should show success to user even if admin notification email fails', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'email_user_id' }) }) // Welcome email succeeds
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Failed sending admin email' }) }); // Admin email fails

    const testUserEmail = 'adminfail@example.com';
    emailInput.value = testUserEmail;
    newsletterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submitButton.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
    
    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Call 1 (User Welcome)
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).to[0]).toBe(testUserEmail);
    // Call 2 (Admin Notification) - just check it was attempted
    expect(global.fetch.mock.calls[1][1].method).toBe('POST');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body).to[0]).toBe(ADMIN_EMAIL);


    expect(successMessageElement.style.display).toBe('block');
    expect(successMessageElement.textContent).toBe('Thank you for signing up!');
    expect(emailInput.value).toBe(''); // Form reset
    expect(displayError).not.toHaveBeenCalled(); // User-facing error should not be displayed
    expect(submitButton.disabled).toBe(false);
    expect(emailInput.disabled).toBe(false);
  });
});
