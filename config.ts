import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "LiquidBooks",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Create beautiful, interactive eBooks with AI. Generate professional documentation, tutorials, and books with LiquidBooks and deploy instantly to GitHub Pages.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "liquidbooks.tech",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Per-book pricing model
    plans: [
      {
        priceId: "free",
        name: "Try It Free",
        description: "See how it works",
        price: 0,
        isFree: true,
        isPerBook: false,
        features: [
          { name: "1 book, 1 chapter" },
          { name: "Bring your own API key" },
          { name: "GitHub Pages deployment" },
          { name: "Full editor access" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_single_book",
        isFeatured: true,
        name: "Single Book",
        description: "One-time purchase",
        price: 19.99,
        isPerBook: true,
        features: [
          { name: "AI content generation" },
          { name: "Up to 15 chapters" },
          { name: "~100K tokens included" },
          { name: "1 year hosting included" },
          { name: "Download ZIP anytime" },
          { name: "GitHub Pages deployment" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_3_books"
            : "price_3_books",
        name: "3 Book Bundle",
        description: "Save 25%",
        price: 44.97,
        priceAnchor: 59.97,
        isPerBook: true,
        booksIncluded: 3,
        features: [
          { name: "3 books ($14.99 each)" },
          { name: "AI content generation" },
          { name: "Up to 15 chapters each" },
          { name: "1 year hosting included" },
          { name: "Download ZIP anytime" },
          { name: "Priority support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_10_books"
            : "price_10_books",
        name: "10 Book Bundle",
        description: "Save 50%",
        price: 99.90,
        priceAnchor: 199.90,
        isPerBook: true,
        booksIncluded: 10,
        features: [
          { name: "10 books ($9.99 each)" },
          { name: "AI content generation" },
          { name: "Up to 15 chapters each" },
          { name: "1 year hosting included" },
          { name: "Download ZIP anytime" },
          { name: "Priority support" },
          { name: "Custom themes" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `LiquidBooks <noreply@liquidbooks.tech>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `LiquidBooks Team <hello@liquidbooks.tech>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@liquidbooks.tech",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/sign-in",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
