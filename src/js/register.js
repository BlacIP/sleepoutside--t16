import { loadHeaderFooter } from "./utils.mjs"; // Import the utility function to load header and footer
import { displayError } from './errorHandler.js';

// Load header and footer
loadHeaderFooter();

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const feedbackElement = document.getElementById("feedback");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (feedbackElement) {
        feedbackElement.textContent = ''; // Clear previous success messages
    }

    const formData = new FormData(registerForm);
    const userData = {
      name: formData.get("name"),
      address: formData.get("address"),
      email: formData.get("email"),
    };

    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      userData.avatar = await convertFileToBase64(avatarFile);
    }

    try {
      const response = await fetch("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        feedbackElement.textContent = "Registration successful! You can now log in.";
        feedbackElement.style.color = "green";
        registerForm.reset();
      } else {
        const errorData = await response.json();
        // feedbackElement.textContent = `Error: ${errorData.message}`; // Replaced
        // feedbackElement.style.color = "red"; // Replaced
        displayError(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      // feedbackElement.textContent = `Error: ${error.message}`; // Replaced
      // feedbackElement.style.color = "red"; // Replaced
      displayError(`An unexpected error occurred: ${error.message}`);
    }
  });

  async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
});
