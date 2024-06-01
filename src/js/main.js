import { loadHeaderFooter, loadTemplate } from "./utils.mjs"; // Import the utility functions

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

  // Clear the email from local storage on page reload
  window.addEventListener("load", () => {
    localStorage.removeItem("newsletterEmails");
  });
});

