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

## API Key Management and Security (Newsletter Functionality)

This section details how the Resend API key for the newsletter subscription functionality is managed.

### Current Architecture: Serverless Function

The Resend API calls for newsletter subscriptions are now handled by a Netlify Serverless Function located at `netlify/functions/send-newsletter-email.js`. The client-side JavaScript in `src/js/newsletter.js` makes a request to this function's endpoint (`/.netlify/functions/send-newsletter-email`) rather than directly to the Resend API.

### API Key Security

The `RESEND_API_KEY` is **no longer stored in the client-side code**. This is a significant security improvement.

-   **Production Environment (Netlify):** The `RESEND_API_KEY` must be configured as an environment variable within the Netlify site's settings (Build & deploy > Environment > Environment variables). The serverless function will access this key using `process.env.RESEND_API_KEY`.
-   **Local Development:** For local testing using the Netlify CLI (`netlify dev`), the `RESEND_API_KEY` should be stored in a `.env` file at the root of the project. This file should be added to `.gitignore` to prevent accidental commits of the key.

    Example `.env` file content:
    ```
    RESEND_API_KEY=your_actual_resend_api_key_here
    ```

### Benefits of this Approach

-   **Improved Security:** The API key is not exposed in the browser, protecting it from unauthorized use.
-   **Centralized Logic:** Email sending logic is centralized in the serverless function.
-   **Scalability:** Netlify Functions scale automatically with demand.

### Key for Development and Production

The Resend API key (e.g., `re_c58Vdr9p_BeEHFy5DtDc3Kng2Xc5ukhxq` or a new one) should be set up as an environment variable as described above. It's crucial to use a production-ready key for live deployments and ensure it's configured securely in Netlify's environment settings.

Managing API keys responsibly is crucial for the security and integrity of the application.
