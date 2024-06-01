/* eslint-disable no-console */
export default class Alert {
  constructor(jsonUrl) {
    this.jsonUrl = jsonUrl;
  }

  async fetchAlerts() {
    try {
      const response = await fetch(this.jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const alerts = await response.json();
      return alerts;
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      return [];
    }
  }

  async displayAlerts() {
    const alerts = await this.fetchAlerts();
    const homeAlertSection = document.querySelector(".alert-home");
    
    if (!homeAlertSection) {
      console.error("No section with the class 'alert-home' found.");
      return;
    }

    if (alerts.length > 0) {
      const alertList = document.createElement("div");
      alertList.className = "alert-list";

      alerts.forEach((alert) => {
        const alertParagraph = document.createElement("p");
        alertParagraph.textContent = alert.message;
        alertParagraph.style.background = alert.background;
        alertParagraph.style.color = alert.color;
        alertList.appendChild(alertParagraph);
      });

      // Append the alert list to the existing section with class 'alert-home'
      homeAlertSection.appendChild(alertList);
    }
  }

  static alertMessage(message, scroll = true) {
    // Find the existing section with the class name 'alert-message'
    const alertSection = document.querySelector(".alert-message");
    
    if (!alertSection) {
      console.error("No section with the class 'alert-message' found.");
      return;
    }

    // Create the div element for the alert
    const alert = document.createElement("div");
    alert.classList.add("alert");
    alert.innerHTML = `${message} <span class="close">&times;</span>`;

    // Add the close event listener to the alert
    alert.addEventListener("click", function (e) {
      if (e.target.classList.contains("close")) {
        alert.remove();
      }
    });

    // Append the alert div to the alert section
    alertSection.appendChild(alert);

    // Scroll to the top if required
    if (scroll) window.scrollTo(0, 0);
  }
}

// Example usage
const alertSystem = new Alert("/json/alerts.json");
alertSystem.displayAlerts();
