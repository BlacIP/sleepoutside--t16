import { displayError } from './errorHandler.js';

export function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');
  // Ensure newsletterForm exists before trying to access its parentNode or querySelector
  if (!newsletterForm) {
    // console.warn('Newsletter form (#newsletter-form) not found on this page.');
    return;
  }
  const emailInput = document.getElementById('email');
  if (!emailInput) {
    // console.warn('Email input (#email) not found on this page.');
    return;
  }

  // Assuming error and success messages are siblings of the form, get them from form's parent
  const formContainer = newsletterForm.parentNode;
  if (!formContainer) {
    // console.warn('Parent container of the newsletter form not found.');
    return;
  }
  // const errorMessageElement = formContainer.querySelector('.error-message'); // Removed
  const successMessageElement = formContainer.querySelector('.success-message');

  // if (!errorMessageElement) { // Removed
    // console.warn('Error message element (.error-message) not found within form container.');
  // }
  if (!successMessageElement) {
    // console.warn('Success message element (.success-message) not found within form container.');
  }

  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailValue = emailInput.value.trim();

    // Hide messages initially
    // if (errorMessageElement) { // Removed
      // errorMessageElement.style.display = 'none';
    // }
    if (successMessageElement) {
      successMessageElement.style.display = 'none';
    }

    if (emailValue === '') {
      displayError('Please enter a valid email address.');
    } else {
      // Simulate backend call
      setTimeout(() => {
        if (successMessageElement) {
          successMessageElement.textContent = 'Thank you for signing up!';
          successMessageElement.style.display = 'block';
          newsletterForm.reset(); // Clear the form
        } else {
          // Fallback if the element doesn't exist
          console.error("Success message element with class 'success-message' not found and is required.");
        }
      }, 1000); // 1-second delay
    }
  });
}

// Keep this for browser execution
// Check if document is defined (it won't be in a pure Node.js Jest environment without JSDOM setting it globally)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initNewsletterForm);
}
