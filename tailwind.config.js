/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#1A1A1A",
        accent: "#00BFA5",
        "text-primary": "#FFFFFF",
        "text-secondary": "#9E9E9E",
        border: "#2A2A2A",
      },
    },
  },
  plugins: [],
};
