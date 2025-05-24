document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email');
  // Assuming error and success messages are siblings of the form
  const formContainer = newsletterForm.parentNode; 
  const errorMessageElement = formContainer.querySelector('.error-message');
  const successMessageElement = formContainer.querySelector('.success-message');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailValue = emailInput.value.trim();

      // Hide messages initially
      if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
      }
      if (successMessageElement) {
        successMessageElement.style.display = 'none';
      }

      if (emailValue === '') {
        if (errorMessageElement) {
          errorMessageElement.textContent = 'Please enter a valid email address.';
          errorMessageElement.style.display = 'block';
        } else {
          // Fallback if the element doesn't exist, though the prompt assumes it does
          console.error("Error message element with class 'error-message' not found.");
        }
      } else {
        // Simulate backend call
        setTimeout(() => {
          if (successMessageElement) {
            successMessageElement.textContent = 'Thank you for signing up!';
            successMessageElement.style.display = 'block';
            newsletterForm.reset(); // Clear the form
          } else {
            // Fallback if the element doesn't exist
            console.error("Success message element with class 'success-message' not found.");
          }
        }, 1000); // 1-second delay
      }
    });
  }
});
