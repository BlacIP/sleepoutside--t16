import { displayError } from './errorHandler.js';

// WARNING: Storing API keys client-side is a security risk!
// This key will be visible in the browser. For production,
// move this logic to a backend service.
const RESEND_API_KEY = 're_c58Vdr9p_BeEHFy5DtDc3Kng2Xc5ukhxq';
const RESEND_API_URL = 'https://api.resend.com/emails';

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
      // 1. Send Welcome Email to User
      const welcomeEmailPayload = {
        from: 'Acme <onboarding@resend.dev>',
        to: [userEmail],
        subject: 'Welcome to the Community!',
        html: '<p>Thanks for signing up! We are excited to have you.</p>',
      };

      const welcomeResponse = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(welcomeEmailPayload),
      });

      if (!welcomeResponse.ok) {
        const errorData = await welcomeResponse.json();
        console.error('Failed to send welcome email:', errorData);
        throw new Error('Failed to send welcome email. Please try again.');
      }
      console.log('Welcome email sent successfully');

      // 2. Send Notification Email to Admin
      const adminNotificationEmail = 'omotoyinbobade15@gmail.com';
      const notificationEmailPayload = {
        from: 'Newsletter System <onboarding@resend.dev>',
        to: [adminNotificationEmail],
        subject: 'New Newsletter Subscriber',
        html: `<p>A new user has subscribed to the newsletter: ${userEmail}</p>`,
      };

      const notificationResponse = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationEmailPayload),
      });

      if (!notificationResponse.ok) {
        const errorData = await notificationResponse.json();
        // Log this error, but don't necessarily block user success message if welcome email succeeded
        console.error('Failed to send admin notification email:', errorData);
        // Optionally, you could try to notify the admin via other means or log for follow-up
      } else {
        console.log('Admin notification email sent successfully');
      }

      // If welcome email was successful, show success to user
      if (successMessageElement) {
        successMessageElement.textContent = 'Thank you for signing up!';
        successMessageElement.style.display = 'block';
        newsletterForm.reset();
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      displayError(error.message || 'Subscription failed. Please try again.');
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
