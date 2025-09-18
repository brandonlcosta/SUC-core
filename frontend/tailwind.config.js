// File: tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        marquee: "marquee 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      colors: {
        neon: "#39FF14", // SUC neon green
      },
    },
  },
};
