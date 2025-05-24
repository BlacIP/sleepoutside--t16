import { displayError } from './errorHandler.js';

// Resend API Key and URL constants are removed.

export function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');
  if (!newsletterForm) {
    // console.warn('Newsletter form (#newsletter-form) not found on this page.');
    return;
  }
  const emailInput = document.getElementById('email');
  if (!emailInput) {
    // console.warn('Email input (#email) not found on this page.');
    return;
  }
  const formContainer = newsletterForm.parentNode;
  if (!formContainer) {
    // console.warn('Parent container of the newsletter form not found.');
    return;
  }
  const successMessageElement = formContainer.querySelector('.success-message');
  if (!successMessageElement) {
    console.warn('Success message element (.success-message) not found within form container.');
  }

  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userEmail = emailInput.value.trim();

    if (successMessageElement) {
      successMessageElement.style.display = 'none';
    }
    // Clear previous errors displayed by errorHandler
    // (errorHandler.clearErrors() could be called here if it becomes necessary,
    // but displayError itself should handle clearing previous messages or timeouts)

    if (userEmail === '') {
      displayError('Please enter a valid email address.');
      return;
    }

    // Disable form controls during submission
    emailInput.disabled = true;
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch('/.netlify/functions/send-newsletter-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: userEmail }), // Send only the user's email
      });

      if (!response.ok) {
        const errorData = await response.json(); // Expecting JSON error from our function
        // Use the message from our function's response, or a fallback
        throw new Error(errorData.message || 'Subscription failed. Please try again.');
      }

      // const responseData = await response.json(); // Get data if needed, e.g. responseData.message

      // If fetch was successful, show success to user
      if (successMessageElement) {
        successMessageElement.textContent = 'Thank you for signing up!'; // Or use responseData.message
        successMessageElement.style.display = 'block';
        newsletterForm.reset();
      }
      console.log('Successfully subscribed via Netlify function.');

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // Display the error message thrown from the try block or a generic one for network issues
      displayError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      // Re-enable form controls
      emailInput.disabled = false;
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// Keep this for browser execution
// Check if document is defined (it won't be in a pure Node.js Jest environment without JSDOM setting it globally)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initNewsletterForm);
}
