// netlify/functions/send-newsletter-email.js
//const fetch = require("node-fetch"); // Or: import fetch from 'node-fetch'; if using ESM and Netlify supports it for functions
import fetch from "node-fetch";
// netlify/functions/send-newsletter-email.js

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: { "Content-Type": "application/json", "Allow": "POST" },
    };
  }

  const { userEmail } = JSON.parse(event.body);
  const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY; // CHANGED
  const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email"; // CHANGED
  const ADMIN_EMAIL_ADDRESS = "omotoyinbobade15@gmail.com";
  const FROM_EMAIL_ADDRESS = "info@test-eqvygm0rzywl0p7w.mlsender.net"; // ADDED

  if (!userEmail) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email is required" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  if (!MAILERSEND_API_KEY) { // CHANGED
    console.error("MailerSend API key is not configured."); // CHANGED
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server configuration error: Missing API key." }),
      headers: { "Content-Type": "application/json" },
    };
  }

  try {
    // 1. Send Welcome Email to User
    const welcomeEmailPayload = { // MailerSend structure
      from: { email: FROM_EMAIL_ADDRESS },
      to: [{ email: userEmail }],
      subject: "Welcome to the Community!",
      text: "Thanks for signing up! We are excited to have you.", // Added text part
      html: "<p>Thanks for signing up! We are excited to have you.</p>",
    };

    const welcomeResponse = await fetch(MAILERSEND_API_URL, {
      method: "POST",
      headers: { // MailerSend headers
        "Authorization": `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(welcomeEmailPayload),
    });

    if (!welcomeResponse.ok) {
      const errorData = await welcomeResponse.json().catch(() => ({})); // Catch if errorData is not json
      console.error("Failed to send welcome email via MailerSend:", errorData); // CHANGED
      // Return a specific error that the client can interpret
      return {
        statusCode: welcomeResponse.status, // Forward MailerSend's status code
        body: JSON.stringify({ message: "Failed to send welcome email.", details: errorData }),
        headers: { "Content-Type": "application/json" },
      };
    }
    console.log(`Welcome email sent to ${userEmail} successfully via MailerSend.`); // CHANGED

    // 2. Send Notification Email to Admin
    const notificationEmailPayload = { // MailerSend structure
      from: { email: FROM_EMAIL_ADDRESS }, // Or a different verified "from" if desired
      to: [{ email: ADMIN_EMAIL_ADDRESS }],
      subject: "New Newsletter Subscriber",
      text: `A new user has subscribed to the newsletter: ${userEmail}`, // Added text part
      html: `<p>A new user has subscribed to the newsletter: ${userEmail}</p>`,
    };

    const notificationResponse = await fetch(MAILERSEND_API_URL, {
      method: "POST",
      headers: { // MailerSend headers
        "Authorization": `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(notificationEmailPayload),
    });

    if (!notificationResponse.ok) {
      const errorData = await notificationResponse.json().catch(() => ({})); // Catch if errorData is not json
      // Log this error, but don't fail the overall request if welcome email succeeded
      console.error(`Failed to send admin notification email for ${userEmail} via MailerSend:`, errorData); // CHANGED
      // We still return success to the client as the primary action (user subscription) was successful.
      // You might want to add more robust error tracking for admin notifications.
    } else {
      console.log(`Admin notification for ${userEmail} sent successfully via MailerSend.`); // CHANGED
    }

    // If welcome email was successful, return success to client
    return {
      statusCode: 200, // Or 202 if you want to be specific for MailerSend's typical success
      body: JSON.stringify({ message: "Subscription successful! Welcome email sent." }),
      headers: { "Content-Type": "application/json" },
    };

  } catch (error) {
    console.error("Error in send-newsletter-email function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error processing your request." }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
