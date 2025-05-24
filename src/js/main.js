import { loadHeaderFooter, loadTemplate } from "./utils.mjs"; // Import the utility functions
import { displayError } from './errorHandler.js';

// Load header, footer, and modal
loadHeaderFooter();
loadModal();

async function loadModal() {
  const modalTemplate = await loadTemplate("/partials/modal.html");
  const mainElement = document.querySelector("main");
  mainElement.insertAdjacentHTML("beforeend", modalTemplate.innerHTML);
  setupModal();
}

function setupModal() {
  const modal = document.getElementById("registerModal");
  const closeBtn = document.querySelector(".modal .close");
  const isNewVisitor = !localStorage.getItem("visited");

  if (isNewVisitor) {
    modal.style.display = "block";

    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    localStorage.setItem("visited", "true");
  }
}

// Add this JavaScript to your main.js file
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const successMessage = document.querySelector(".success-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    // Retrieve existing emails from local storage
    let emails = JSON.parse(localStorage.getItem("newsletterEmails")) || [];

    // Add the new email to the array
    emails.push(email);

    // Save the updated array back to local storage
    localStorage.setItem("newsletterEmails", JSON.stringify(emails));

    // Simulate an API call to save the email
    setTimeout(() => {
      // Show success message
      successMessage.style.display = "block";

      // Clear the form
      form.reset();
    }, 1000);
  });
}); // This is the end of the old DOMContentLoaded listener for newsletter


// Global Error Handlers
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global error caught by window.onerror:", { message, source, lineno, colno, error });
  displayError("An unexpected error occurred. Please try again or contact support if the issue persists.");
  return true; // Prevents default browser error handling
};

window.onunhandledrejection = function(event) {
  console.error("Global promise rejection caught by window.onunhandledrejection:", event.reason);
  const errorMessage = (event.reason && event.reason.message) ? event.reason.message : "An unknown error occurred with a promise.";
  displayError(`An unexpected promise rejection occurred: ${errorMessage}`);
  // event.preventDefault(); // Uncomment if you want to prevent further default actions
};

