import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TrueTix",
  description: "On-chain event ticketing on Stellar — docs, architecture, and pilot results",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/screenshots/event-desktop.png" }]],

  themeConfig: {
    nav: [
      { text: "Overview", link: "/" },
      { text: "Live App", link: "https://truetix.vercel.app" },
      { text: "GitHub", link: "https://github.com/ahmadgbadeboliss-stack/TrueTix" },
    ],

    sidebar: [
      {
        text: "Overview",
        items: [{ text: "Project Overview", link: "/" }],
      },
      {
        text: "User Guides",
        items: [
          { text: "Wallet & TUSDC Setup", link: "/guides/wallet-setup" },
          { text: "Attendee Flow", link: "/guides/attendee-flow" },
          { text: "Ticket Purchase Flow", link: "/guides/ticket-purchase" },
          { text: "Organizer Flow", link: "/guides/organizer-flow" },
          { text: "Check-in / Verification Flow", link: "/guides/check-in-flow" },
        ],
      },
      {
        text: "Architecture",
        items: [
          { text: "Frontend Architecture", link: "/architecture/frontend" },
          { text: "Soroban Contract Architecture", link: "/architecture/contract" },
        ],
      },
      {
        text: "Build & Ship",
        items: [
          { text: "Development Setup", link: "/development/setup" },
          { text: "Deployment", link: "/deployment" },
          { text: "Analytics & Monitoring", link: "/analytics-monitoring" },
        ],
      },
      {
        text: "Product Validation",
        items: [
          { text: "Pilot Results & Feedback", link: "/pilot-results" },
          { text: "Screenshots", link: "/screenshots" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ahmadgbadeboliss-stack/TrueTix" },
    ],

    search: { provider: "local" },

    footer: {
      message: "Built for the Stellar Level 4 (Green Belt) production MVP milestone.",
      copyright: "TrueTix — testnet demo, no real funds involved",
    },
  },
});
