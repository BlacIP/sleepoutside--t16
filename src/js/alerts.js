export default class Alert {
    constructor(jsonUrl) {
      this.jsonUrl = jsonUrl;
    }
  
    async fetchAlerts() {
      try {
        const response = await fetch(this.jsonUrl);
        const alerts = await response.json();
        return alerts;
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        return [];
      }
    }
  
    async displayAlerts() {
      const alerts = await this.fetchAlerts();
      if (alerts.length > 0) {
        const alertList = document.createElement("section");
        alertList.className = "alert-list";
  
        alerts.forEach(alert => {
          const alertParagraph = document.createElement("p");
          alertParagraph.textContent = alert.message;
          alertParagraph.style.background = alert.background;
          alertParagraph.style.color = alert.color;
          alertList.appendChild(alertParagraph);
        });
  
        const mainElement = document.querySelector("main");
        if (mainElement) {
          mainElement.prepend(alertList);
        }
      }
    }
  }
const alertSystem = new Alert("./json/alerts.json");
alertSystem.displayAlerts();