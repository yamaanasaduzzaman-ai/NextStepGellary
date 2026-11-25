/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#111111",
          white: "#F8F7F4",
          beige: "#C6AE91",
          charcoal: "#252525",
          muted: "#858585",
          border: "#EAEAEA",
          cream: "#F4EFEA",
          gold: "#D4AF37",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      letterSpacing: {
        luxury: "0.2em",
        subtle: "0.05em",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideUp: "slideUp 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
