import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  darkMode: "class",
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Red Hat Text"],
        display: ["Red Hat Display"],
      },
      screens: {
        "3xl": "1792px",
      },
      colors: {
        light: {
          "layer-0": "rgba(255, 255, 255, 1)",
          "layer-1": "rgba(246, 248, 250, 1)",
          "layer-2": "rgba(240, 240, 235, 1)",
          "section-div": "rgba(216, 222, 228, 1)",
          text: "rgba(0, 0, 0, 0.85)",
          "text-over-layer-2": "rgba(36, 36, 35, 1)",
          "distinct-text": "rgba(90, 90, 90, 0.9)",
          "distinct-text-over-layer-2": "rgba(105, 105, 105, 1)",
          "link-text": "rgba(0, 92, 184, 0.9)",
          "link-text-hover": "rgba(0, 59, 119, 0.9)",
          "menu-selection": "rgba(50, 50, 50, 1)",
          interactive: "rgba(75, 75, 67, 1)",
          highlight: {
            DEFAULT: "rgba(140, 140, 140, 0.20)",
            darker: "rgba(120, 120, 120, 0.30)",
          },
          "cta-orange": "rgba(242, 166, 84, 1)",
          "action-red": "rgba(186, 61, 59, 1)",
          "learn-blue": "rgba(33, 118, 174, 1)",
          "accepted-green": "rgba(62, 137, 20, 1)",
          "warn-yellow": "rgba(255, 191, 0, 1)",
        },
        dark: {
          "layer-0": "rgba(6, 8, 15, 1)",
          "layer-1": "rgba(19, 19, 22, 1)",
          "layer-2": "rgba(22, 27, 34, 1)",
          "section-div": "rgba(43, 50, 59, 1)",
          text: "rgba(255, 255, 255, 0.8)",
          "text-over-layer-2": "rgba(208, 209, 211, 1)",
          "distinct-text": "rgba(150, 150, 150, 0.85)",
          "distinct-text-over-layer-2": "rgba(131, 132, 133, 1)",
          "link-text": "rgba(86, 167, 252, 0.9)",
          "link-text-hover": "rgba(134, 192, 253, 0.9)",
          "menu-selection": "rgba(200, 200, 200, 1)",
          interactive: "rgba(133, 126, 123, 1)",
          highlight: {
            DEFAULT: "rgba(70, 70, 70, 0.25)",
            lighter: "rgba(120, 120, 120, 0.50)",
          },
          "cta-orange": "rgba(241, 156, 65, 1)",
          "action-red": "rgba(238, 90, 88, 1)",
          "learn-blue": "rgba(62, 146, 204, 1)",
          "accepted-green": "rgba(97, 139, 37, 1)",
          "warn-yellow": "rgba(255, 209, 102, 1)",
        },
      },
      transitionProperty: {
        width: "width",
        padding: "padding",
      },
    },
  },
};
