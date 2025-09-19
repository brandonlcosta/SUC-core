// File: frontend/tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: "#ff1aff",
          blue: "#00eaff",
          yellow: "#ffee00"
        }
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
