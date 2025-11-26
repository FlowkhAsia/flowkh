<div align="center">
<img width="1200" alt="GHBanner" src="https://kisskh.cam/og-image.jpg" />
</div>

# kisskh - A Modern Streaming App Interface

kisskh is a sleek, feature-rich web application that emulates popular streaming services like Netflix. Built with React, TypeScript, and Tailwind CSS, it leverages the TMDB API to provide a dynamic and engaging user experience for browsing movies and TV shows.

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fbeM6xqy5OY7D4II3HFM7UArr14ebEX1

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Create a `.env` file in the root of the project and add your API keys. You can get a free TMDB API key from [their website](https://www.themoviedb.org/signup).
    ```
    # .env
    TMDB_API_KEY_V3=YOUR_TMDB_API_KEY_V3

    # Optional: SEO & Analytics
    VITE_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
    VITE_GOOGLE_SITE_VERIFICATION="YOUR_GOOGLE_VERIFICATION_CODE"
    VITE_BING_SITE_VERIFICATION="YOUR_BING_VERIFICATION_CODE"

    # Optional: Social Media Links for the FAQ page
    VITE_FACEBOOK_URL="https://facebook.com/"
    VITE_TWITTER_URL="https://twitter.com/"
    VITE_TELEGRAM_URL="https://t.me/kisskhcam"
    ```
3.  Run the app:
    `npm run dev`