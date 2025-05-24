// src/js/errorHandler.js
let errorTimeout = null;

function getErrorBanner() {
  let banner = document.getElementById('global-error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'global-error-banner';
    // Basic styling if created dynamically
    banner.style.position = 'fixed';
    banner.style.top = '10px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.padding = '10px';
    banner.style.zIndex = '1000';
    banner.style.display = 'none';
    banner.style.border = '1px solid black';
    banner.style.backgroundColor = 'white'; // Default, will be overridden by type
    
    const messageElement = document.createElement('p');
    messageElement.id = 'global-error-message';
    messageElement.style.margin = '0'; // Ensure p tag itself has no margin for cleaner look
    messageElement.style.display = 'inline'; // Keep message and button on same line
    banner.appendChild(messageElement);
    
    const closeButton = document.createElement('button');
    closeButton.id = 'global-error-close';
    closeButton.textContent = 'X';
    closeButton.style.marginLeft = '15px'; // Increased margin for better separation
    closeButton.style.padding = '2px 5px'; // Make button smaller
    closeButton.style.border = '1px solid #aaa';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = clearErrors; // Attach clearErrors to the button
    banner.appendChild(closeButton);
    
    document.body.appendChild(banner);
  }
  return banner;
}

export function displayError(message, type = 'error') {
  const banner = getErrorBanner();
  const messageElement = banner.querySelector('#global-error-message') || banner.firstChild; // Fallback if somehow missing

  if (messageElement) { // Ensure messageElement exists before setting textContent
    messageElement.textContent = message;
  }
  
  // Set class for pre-defined CSS styling primarily
  banner.className = 'error-banner ' + type; 
  
  // Apply specific styles based on type (especially if dynamically created or to override CSS)
  // Check if it's our basic dynamically created one by looking for a specific dynamic style
  // For robustness, could also check !document.styleSheets contains rule for .error-banner.<type>
  if (banner.style.border === '1px solid black') { 
      if (type === 'error') { banner.style.backgroundColor = '#f8d7da'; banner.style.color = '#721c24'; }
      else if (type === 'warning') { banner.style.backgroundColor = '#fff3cd'; banner.style.color = '#856404'; }
      else if (type === 'info') { banner.style.backgroundColor = '#d1ecf1'; banner.style.color = '#0c5460'; }
      else { banner.style.backgroundColor = 'lightgray'; banner.style.color = 'black';} // Default for other types
  }
  
  banner.style.display = 'block';

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }
  errorTimeout = setTimeout(() => {
    clearErrors();
  }, 5000);
}

export function clearErrors() {
  const banner = document.getElementById('global-error-banner');
  if (banner) {
    banner.style.display = 'none';
    const messageElement = banner.querySelector('#global-error-message') || banner.firstChild;
    if (messageElement && messageElement.textContent) { // Check if messageElement exists before setting textContent
         messageElement.textContent = '';
    }
  }
  if (errorTimeout) {
    clearTimeout(errorTimeout);
    errorTimeout = null;
  }
}
