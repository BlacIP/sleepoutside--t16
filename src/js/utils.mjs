import { refreshCartCount} from "./CartCount.mjs";  // Make sure this is correctly imported.
// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function removeLocalStorage(key) {
  localStorage.removeItem(key);
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParams(param){
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const product = urlParams.get(param)
return product;
}

export function renderListWithTemplate(templateFunction, container, listItems) {
  const itemsHtml = listItems.map(item => templateFunction(item)).join("");
  container.innerHTML = itemsHtml;
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  const html = await response.text();
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

// Function to render a template into a DOM element
export function renderWithTemplate(template, parent, data = {}, callback = null) {
  parent.innerHTML = template.innerHTML;
  if (callback) {
    callback(data);
  }
}

// Function to load and render header and footer
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);

  // Optional: Call any functions that need to run after the header/footer are rendered
  // e.g., initializeCartCount();
  // Ensure cart count initialization happens after header is loaded
  refreshCartCount();  // Call this function here to ensure the DOM element it targets has been loaded.

}