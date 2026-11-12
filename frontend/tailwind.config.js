/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4eef8",
          100: "#e7dcef",
          200: "#d9c8e5",
          300: "#c4aad5",
          400: "#ae8fc4",
          500: "#9873b2",
          600: "#7c5597",
          700: "#684780",
          800: "#563b68",
          900: "#473052",
        },
        secondary: {
          50: "#f5f1eb",
          100: "#eee8e1",
          200: "#e4dcd4",
          300: "#d0c4d0",
          400: "#a897b0",
          500: "#786380",
          600: "#6f5d7a",
          700: "#584862",
          800: "#44374e",
          900: "#342d40",
        },
      },
      fontFamily: {
        sans: ["Event Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "inset 2px 3px 4px #fffdfb, inset -3px -4px 7px #e2dbd1, 5px 8px 16px #b6a99c20",
        "card-hover":
          "inset 2px 3px 4px #fffdfb, inset -3px -4px 7px #e2dbd1, 7px 14px 22px #b6a99c35",
      },
    },
  },
  plugins: [],
};
