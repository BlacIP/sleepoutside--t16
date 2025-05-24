# sleepoutside

## Description

Use this as a starting point to complete the WDD 330 team activity: the SleepOutside web application. It scaffolds out a simple web app with Vite support to bundle up our assets.

## Project Website
Follow this link to see the sleep outside live website https://sleepoutside-t16.netlify.app/

## Prerequisites

- You must have Node installed. visit https://byui-cit.github.io/advcss/lesson01/l01-software.html and skip to the Node section for instructions

## Setup

- `npm install`
- `npm run start` starts up a local server and updates on any JS or CSS/SCSS changes.

## Other commands

- `npm run build` to build final files when you are ready to turn in.
- `npm run lint` to run ESLint against your code to find errors.
- `npm run format` to run Prettier to automatically format your code.

## API Key Management and Security

This section details the current handling of the Resend API key used for the newsletter subscription functionality and provides recommendations for a secure production setup.

### Current Implementation

The Resend API key is currently embedded directly in the client-side JavaScript file located at `src/js/newsletter.js`. This key enables the application to send emails via the Resend API when a user signs up for the newsletter.

### Security Risk

**Embedding API keys directly in client-side code is a significant security risk.** In a production environment, this practice should be strictly avoided. The API key becomes publicly visible to anyone who inspects the website's source code using browser developer tools.

Exposure of the API key can lead to:
- **Unauthorized Use:** Malicious actors could use the exposed key to send emails through your Resend account.
- **Quota Exhaustion:** Unauthorized use could quickly exhaust your API quotas.
- **Service Disruption:** Misuse could lead to your key being disabled by Resend.
- **Potential Costs:** If your Resend plan involves costs based on usage, unauthorized use could lead to unexpected charges.

### Recommendation for Production

For any production deployment, it is **strongly recommended** to move the Resend API integration to a secure backend service. This backend service would:
1.  Store the Resend API key securely (e.g., as an environment variable).
2.  Expose an API endpoint (e.g., `/api/subscribe-newsletter`).
3.  The client-side JavaScript would then make a request to this backend endpoint, passing the user's email.
4.  The backend service would then make the authenticated calls to the Resend API.

Examples of backend services include:
- Serverless functions (e.g., AWS Lambda, Google Cloud Functions, Netlify Functions, Vercel Functions).
- A traditional backend application (e.g., using Node.js with Express, Python with Flask/Django, etc.).

### Conceptual Backend Configuration

If using a Node.js backend, the API key would typically be accessed from an environment variable:

```javascript
// Example in a Node.js backend service
const resendApiKey = process.env.RESEND_API_KEY;
// ... then use this key when initializing the Resend SDK or making API calls
```

This ensures the key is not exposed in the frontend code and can be managed securely through the hosting environment's configuration.

### Current Key for Development

The API key currently in use (`re_c58Vdr9p_BeEHFy5DtDc3Kng2Xc5ukhxq`) is intended for development and testing purposes only. If this application were to go into production with real user data and email functionality, this key should be:
1.  Revoked or replaced with a new production-specific key from Resend.
2.  The new production key should be configured securely in the backend service as described above.

It is crucial to manage API keys responsibly to protect your application and its users.
